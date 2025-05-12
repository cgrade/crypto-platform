import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

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
    
    // Get transaction statistics
    const [pendingDeposits, pendingWithdrawals, totalCompletedDeposits, totalCompletedWithdrawals] = await Promise.all([
      // Count pending deposits
      prisma.transaction.count({
        where: {
          userId: session.user.id,
          type: 'DEPOSIT',
          status: 'PENDING'
        }
      }),
      
      // Count pending withdrawals
      prisma.transaction.count({
        where: {
          userId: session.user.id,
          type: 'WITHDRAWAL',
          status: 'PENDING'
        }
      }),
      
      // Sum completed deposits
      prisma.transaction.aggregate({
        where: {
          userId: session.user.id,
          type: 'DEPOSIT',
          status: 'COMPLETED'
        },
        _sum: {
          amount: true
        }
      }),
      
      // Sum completed withdrawals
      prisma.transaction.aggregate({
        where: {
          userId: session.user.id,
          type: 'WITHDRAWAL',
          status: 'COMPLETED'
        },
        _sum: {
          amount: true
        }
      })
    ]);
    
    // Get most recent transactions
    const recentTransactions = await prisma.transaction.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    });
    
    // Get user portfolio
    const portfolio = await prisma.portfolio.findFirst({
      where: {
        userId: session.user.id
      },
      include: {
        assets: true
      }
    });
    
    return NextResponse.json({
      success: true,
      dashboard: {
        pendingDeposits,
        pendingWithdrawals,
        totalDeposited: totalCompletedDeposits._sum.amount || 0,
        totalWithdrawn: totalCompletedWithdrawals._sum.amount || 0,
        recentTransactions,
        portfolio
      }
    });
  } catch (error) {
    console.error('User dashboard fetch error:', error);
    
    return NextResponse.json(
      { success: false, message: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
