import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/supabase';
import { hashPassword } from '@/lib/password';
import { generateToken } from '@/lib/jwt';

export async function POST(request: NextRequest) {
  try {
    const { email, password, username } = await request.json();

    // Validate input
    if (!email || !password || !username) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Email, password, and username are required'
        },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Password must be at least 6 characters'
        },
        { status: 400 }
      );
    }

    // Check if email already exists
    const { data: existingEmailUser } = await db.getUserByEmail(email);
    if (existingEmailUser) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Email already exists'
        },
        { status: 400 }
      );
    }

    // Check if username already exists
    const { data: existingUsernameUser } = await db.getUserByUsername(username);
    if (existingUsernameUser) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Username already exists'
        },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const { data: user, error } = await db.createUser({
      email,
      password: hashedPassword,
      username,
      status: 'waiting', // Default status
      role: 'member', // Default role
    });

    if (error || !user) {
      return NextResponse.json(
        { 
          success: false,
          message: error?.message || 'Failed to create user'
        },
        { status: 500 }
      );
    }

    // Generate JWT token
    const token = generateToken(user);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user as any;

    return NextResponse.json(
      { 
        success: true,
        message: 'Sign up successful',
        data: {
          user: userWithoutPassword,
          token
        }
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Signup error:', errorMessage);
    return NextResponse.json(
      { 
        success: false,
        message: errorMessage
      },
      { status: 500 }
    );
  }
}
