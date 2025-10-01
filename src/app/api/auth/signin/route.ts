import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/supabase';
import { comparePassword } from '@/lib/password';
import { generateToken } from '@/lib/jwt';

export async function POST(request: NextRequest) {
  try {
    const { identifier, password } = await request.json();

    // Validate input
    if (!identifier || !password) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Email/username and password are required'
        },
        { status: 400 }
      );
    }

    // Check if identifier is an email (contains @) or username
    const isEmail = identifier.includes('@');
    
    // Get user by email or username
    const { data: user, error } = isEmail 
      ? await db.getUserByEmail(identifier)
      : await db.getUserByUsername(identifier);

    if (error || !user) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Invalid credentials'
        },
        { status: 401 }
      );
    }

    // Check if user status is allowed
    if ((user as any).status !== 'allow') {
      const statusMessages: Record<string, string> = {
        'waiting': 'Your account is pending approval',
        'block': 'Your account has been blocked'
      };
      
      return NextResponse.json(
        { 
          success: false,
          message: statusMessages[(user as any).status] || 'Your account is not active'
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
          message: 'Invalid credentials'
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
