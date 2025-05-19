import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { z } from 'zod';

// Schema for withdrawal request validation
const withdrawRequestSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  cryptoType: z.enum(['BTC']),
  cryptoAddress: z.string().min(26, 'Valid Bitcoin address required').max(62)
    .regex(/^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/, 'Invalid Bitcoin address format'),
});

// Schema for admin withdrawal approval validation
const withdrawApprovalSchema = z.object({
  transactionId: z.string(),
  status: z.enum(['COMPLETED', 'FAILED']),
  txHash: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    // Get user from session
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Parse request body
    const body = await req.json();
    console.log('Received withdrawal request body:', body);
    
    // Validate input
    const parseResult = withdrawRequestSchema.safeParse(body);
    if (!parseResult.success) {
      console.error('Withdrawal validation errors:', parseResult.error.flatten().fieldErrors);

      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid withdrawal data', 
          errors: parseResult.error.flatten().fieldErrors 
        },
        { status: 400 }
      );
    }
    
    const { amount, cryptoType, cryptoAddress } = parseResult.data;
    
    // Get user portfolio to check balance
    const portfolio = await prisma.portfolio.findFirst({
      where: { userId: session.user.id },
      include: {
        assets: {
          where: { symbol: cryptoType }
        }
      }
    });
    
    if (!portfolio) {
      return NextResponse.json(
        { success: false, message: 'Portfolio not found' },
        { status: 404 }
      );
    }
    
    // Check if user has the asset and enough balance
    if (portfolio.assets.length === 0) {
      return NextResponse.json(
        { success: false, message: `No ${cryptoType} found in portfolio` },
        { status: 400 }
      );
    }
    
    const asset = portfolio.assets[0];
    if (asset.amount < amount) {
      return NextResponse.json(
        { 
          success: false, 
          message: `Insufficient ${cryptoType} balance. Available: ${asset.amount}`
        },
        { status: 400 }
      );
    }
    
    // Create the withdrawal transaction
    const transaction = await prisma.transaction.create({
      data: {
        amount,
        type: 'WITHDRAWAL',
        status: 'PENDING',
        cryptoType,
        cryptoAddress,
        userId: session.user.id,
      }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Withdrawal request submitted successfully',
      transaction: {
        id: transaction.id,
        amount,
        status: transaction.status,
        cryptoType,
        cryptoAddress,
        createdAt: transaction.createdAt
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Withdrawal request error:', error);
    
    return NextResponse.json(
      { success: false, message: 'Failed to process withdrawal request' },
      { status: 500 }
    );
  }
}

// API route for admin approval of withdrawals
export async function PUT(req: NextRequest) {
  try {
    // Get user from session
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Check if user is admin
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: 'Admin privileges required' },
        { status: 403 }
      );
    }
    
    // Parse request body
    const body = await req.json();
    
    // Validate input
    const parseResult = withdrawApprovalSchema.safeParse(body);
    
    if (!parseResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid approval data', 
          errors: parseResult.error.flatten().fieldErrors 
        },
        { status: 400 }
      );
    }
    
    const { transactionId, status, txHash } = parseResult.data;
    
    // Get the transaction
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { user: true }
    });
    
    if (!transaction) {
      return NextResponse.json(
        { success: false, message: 'Transaction not found' },
        { status: 404 }
      );
    }
    
    // Verify this is a withdrawal transaction and it's pending
    if (transaction.type !== 'WITHDRAWAL' || transaction.status !== 'PENDING') {
      return NextResponse.json(
        { success: false, message: 'Invalid transaction state for approval' },
        { status: 400 }
      );
    }
    
    // Use a transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Update the transaction status
      const updatedTransaction = await tx.transaction.update({
        where: { id: transactionId },
        data: {
          status,
          txHash,
          updatedAt: new Date()
        }
      });
      
      // If completed, update user portfolio balance
      if (status === 'COMPLETED') {
        // Find user's portfolio
        const portfolio = await tx.portfolio.findFirst({
          where: { userId: transaction.userId },
          include: {
            assets: {
              where: { symbol: transaction.cryptoType }
            }
          }
        });
        
        if (!portfolio || portfolio.assets.length === 0) {
          throw new Error('User portfolio or asset not found');
        }
        
        const asset = portfolio.assets[0];
        
        // Do a final balance check
        if (asset.amount < transaction.amount) {
          throw new Error('Insufficient balance for withdrawal');
        }
        
        // Update crypto asset amount
        await tx.cryptoAsset.update({
          where: { id: asset.id },
          data: {
            amount: asset.amount - transaction.amount,
            updatedAt: new Date()
          }
        });
        
        // Update total portfolio value
        // In a real app, you'd use current market price
        // For simplicity, using a static BTC price of $50,000
        const btcPrice = 50000;
        await tx.portfolio.update({
          where: { id: portfolio.id },
          data: {
            totalValue: {
              decrement: transaction.amount * btcPrice
            },
            updatedAt: new Date()
          }
        });
      }
      
      return updatedTransaction;
    });
    
    return NextResponse.json({
      success: true,
      message: `Withdrawal ${status === 'COMPLETED' ? 'approved' : 'rejected'} successfully`,
      transaction: {
        id: result.id,
        amount: result.amount,
        status: result.status,
        cryptoType: result.cryptoType,
        cryptoAddress: result.cryptoAddress,
        txHash: result.txHash,
        updatedAt: result.updatedAt
      }
    });
  } catch (error) {
    console.error('Withdrawal approval error:', error);
    
    // Handle specific errors
    if (error instanceof Error && error.message === 'Insufficient balance for withdrawal') {
      return NextResponse.json(
        { success: false, message: 'Insufficient balance for withdrawal' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, message: 'Failed to process withdrawal approval' },
      { status: 500 }
    );
  }
}
