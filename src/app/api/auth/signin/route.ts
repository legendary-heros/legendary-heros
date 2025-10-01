import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/supabase';
import { comparePassword } from '@/lib/password';
import { generateToken } from '@/lib/jwt';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Email and password are required'
        },
        { status: 400 }
      );
    }

    // Get user by email
    const { data: user, error } = await db.getUserByEmail(email);

    if (error || !user) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Invalid email or password'
        },
        { status: 401 }
      );
    }

    // Check if user status is blocked
    if ((user as any).status === 'block') {
      return NextResponse.json(
        { 
          success: false,
          message: 'Your account has been blocked'
        },
        { status: 403 }
      );
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, (user as any).password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Invalid email or password'
        },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = generateToken(user as any);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user as any;

    return NextResponse.json(
      { 
        success: true,
        message: 'Sign in successful',
        data: {
          user: userWithoutPassword,
          token
        }
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Signin error:', errorMessage);
    return NextResponse.json(
      { 
        success: false,
        message: errorMessage
      },
      { status: 500 }
    );
  }
}
