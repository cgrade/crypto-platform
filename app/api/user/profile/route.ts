import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(req: NextRequest) {
  try {
    // Get user from session
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      console.log('No user in session');
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }
    
    console.log('User ID from session:', session.user.id);
    
    // Get user details with BTC address and QR code
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        btcAddress: true,
        btcAddressQrCode: true, // Fix: btcQrCode → btcAddressQrCode
        createdAt: true,
        updatedAt: true
      }
    });
    
    if (!user) {
      console.log('User not found in database for ID:', session.user.id);
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }
    
    console.log('User found with BTC address:', user.btcAddress);
    console.log('User found with BTC QR code:', user.btcAddressQrCode);
    
    return NextResponse.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('User profile fetch error:', error);
    
    return NextResponse.json(
      { success: false, message: 'Failed to fetch user profile' },
      { status: 500 }
    );
  }
}
