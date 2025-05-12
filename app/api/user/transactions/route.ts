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
    
    // Parse query parameters
    const url = new URL(req.url);
    const type = url.searchParams.get('type') as 'DEPOSIT' | 'WITHDRAWAL' | null;
    const status = url.searchParams.get('status') as 'PENDING' | 'COMPLETED' | 'FAILED' | null;
    
    // Build query filter
    const filter: any = {
      userId: session.user.id
    };
    
    if (type) filter.type = type;
    if (status) filter.status = status;
    
    // Get user transactions
    const transactions = await prisma.transaction.findMany({
      where: filter,
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return NextResponse.json({
      success: true,
      transactions
    });
  } catch (error) {
    console.error('User transactions fetch error:', error);
    
    return NextResponse.json(
      { success: false, message: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}
