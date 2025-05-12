import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import prisma from '@/lib/prisma';
import { z } from 'zod';

// Create a schema for user registration validation
const userSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$/,
      'Password must include uppercase, lowercase, number and special character'
    ),
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body = await req.json();
    
    // Validate the input data
    const validationResult = userSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Validation failed', 
          errors: validationResult.error.flatten().fieldErrors 
        },
        { status: 400 }
      );
    }
    
    const { email, password, name } = validationResult.data;
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'User with this email already exists' },
        { status: 409 }
      );
    }
    
    // Hash password
    const hashedPassword = await hash(password, 10);
    
    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: 'USER',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });
    
    // Create initial portfolio for the user
    await prisma.portfolio.create({
      data: {
        userId: user.id,
        totalValue: 0,
        assets: {
          create: {
            symbol: 'BTC',
            name: 'Bitcoin',
            amount: 0,
          },
        },
      },
    });
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'User registered successfully',
        user,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'An error occurred during registration' 
      },
      { status: 500 }
    );
  }
}
