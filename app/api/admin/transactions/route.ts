import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Endpoint to get all transactions for admin dashboard
export async function GET(req: NextRequest) {
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
    
    // Parse query parameters
    const url = new URL(req.url);
    const type = url.searchParams.get('type') as 'DEPOSIT' | 'WITHDRAWAL' | null;
    const status = url.searchParams.get('status') as 'PENDING' | 'COMPLETED' | 'FAILED' | null;
    const userId = url.searchParams.get('userId');
    
    // Build query filter
    const filter: any = {};
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (userId) filter.userId = userId;
    
    // Get transactions with user details
    const transactions = await prisma.transaction.findMany({
      where: filter,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            btcAddress: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return NextResponse.json({
      success: true,
      transactions: transactions.map(tx => ({
        id: tx.id,
        amount: tx.amount,
        type: tx.type,
        status: tx.status,
        cryptoType: tx.cryptoType,
        cryptoAddress: tx.cryptoAddress,
        txHash: tx.txHash,
        createdAt: tx.createdAt,
        updatedAt: tx.updatedAt,
        user: {
          id: tx.user.id,
          name: tx.user.name,
          email: tx.user.email,
          btcAddress: tx.user.btcAddress
        }
      }))
    });
  } catch (error) {
    console.error('Admin transactions fetch error:', error);
    
    return NextResponse.json(
      { success: false, message: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}
