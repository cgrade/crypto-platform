import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// GET: Fetch all notifications for the authenticated user
export async function GET(req: NextRequest) {
  try {
    // Get the user's session
    const session = await getServerSession(authOptions);
    
    // Ensure user is authenticated
    if (!session?.user) {
      return NextResponse.json({ 
        success: false, 
        message: 'Authentication required' 
      }, { status: 401 });
    }

    const userId = session.user.id;
    console.log('Fetching notifications for user:', userId);

    // Fetch notifications for this user
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ 
      success: true, 
      notifications: notifications || [] 
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to fetch notifications' 
    }, { status: 500 });
  } finally {
    // Ensure database connection is properly handled
    await prisma.$disconnect();
  }
}
