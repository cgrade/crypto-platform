import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { z } from 'zod';

// Schema for deposit request validation
const depositRequestSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  cryptoType: z.enum(['BTC']),
  // Transaction hash is optional at request time
  txHash: z.string().optional(),
});

// Schema for admin deposit approval validation
const depositApprovalSchema = z.object({
  transactionId: z.string(),
  status: z.enum(['COMPLETED', 'FAILED']),
  // Admin can provide the transaction hash during approval
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
    
    // Validate input
    const parseResult = depositRequestSchema.safeParse(body);
    
    if (!parseResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid deposit data', 
          errors: parseResult.error.flatten().fieldErrors 
        },
        { status: 400 }
      );
    }
    
    const { amount, cryptoType, txHash } = parseResult.data;
    
    // Check if user has a BTC address assigned
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        btcAddress: true,
      }
    });
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }
    
    if (!user.btcAddress) {
      return NextResponse.json(
        { success: false, message: 'No bitcoin address assigned to this account. Please contact support.' },
        { status: 400 }
      );
    }
    
    // Create the deposit transaction
    const transaction = await prisma.transaction.create({
      data: {
        amount,
        type: 'DEPOSIT',
        status: 'PENDING',
        cryptoType,
        cryptoAddress: user.btcAddress,
        txHash,
        userId: session.user.id,
      }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Deposit request submitted successfully',
      transaction: {
        id: transaction.id,
        amount,
        status: transaction.status,
        cryptoType,
        createdAt: transaction.createdAt
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Deposit request error:', error);
    
    return NextResponse.json(
      { success: false, message: 'Failed to process deposit request' },
      { status: 500 }
    );
  }
}

// API route for admin approval of deposits
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
    const parseResult = depositApprovalSchema.safeParse(body);
    
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
    
    // Verify this is a deposit transaction and it's pending
    if (transaction.type !== 'DEPOSIT' || transaction.status !== 'PENDING') {
      return NextResponse.json(
        { success: false, message: 'Invalid transaction state for approval' },
        { status: 400 }
      );
    }
    
    // Use transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Update the transaction status
      const updatedTransaction = await tx.transaction.update({
        where: { id: transactionId },
        data: {
          status,
          txHash: txHash || transaction.txHash,
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
        
        if (!portfolio) {
          throw new Error('User portfolio not found');
        }
        
        // Update crypto asset amount
        if (portfolio.assets.length > 0) {
          const asset = portfolio.assets[0];
          await tx.cryptoAsset.update({
            where: { id: asset.id },
            data: {
              amount: asset.amount + transaction.amount,
              updatedAt: new Date()
            }
          });
        } else {
          // Create asset if it doesn't exist
          await tx.cryptoAsset.create({
            data: {
              symbol: transaction.cryptoType,
              name: transaction.cryptoType === 'BTC' ? 'Bitcoin' : transaction.cryptoType,
              amount: transaction.amount,
              portfolioId: portfolio.id
            }
          });
        }
        
        // Update total portfolio value
        // In a real app, you'd use current market price
        // For simplicity, using a static BTC price of $50,000
        const btcPrice = 50000;
        await tx.portfolio.update({
          where: { id: portfolio.id },
          data: {
            totalValue: {
              increment: transaction.amount * btcPrice
            },
            updatedAt: new Date()
          }
        });
      }
      
      return updatedTransaction;
    });
    
    return NextResponse.json({
      success: true,
      message: `Deposit ${status === 'COMPLETED' ? 'approved' : 'rejected'} successfully`,
      transaction: {
        id: result.id,
        amount: result.amount,
        status: result.status,
        cryptoType: result.cryptoType,
        updatedAt: result.updatedAt
      }
    });
  } catch (error) {
    console.error('Deposit approval error:', error);
    
    return NextResponse.json(
      { success: false, message: 'Failed to process deposit approval' },
      { status: 500 }
    );
  }
}
