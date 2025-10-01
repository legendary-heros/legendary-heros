import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/supabase';

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

    if (password.length < 6) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Password must be at least 6 characters'
        },
        { status: 400 }
      );
    }

    // Sign up user with Supabase
    const { data, error } = await auth.signUp(email, password);

    if (error) {
      return NextResponse.json(
        { 
          success: false,
          message: error.message
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        success: true,
        message: 'Sign up successful',
        data: {
          user: data.user,
          session: data.session
        }
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json(
      { 
        success: false,
        message: errorMessage
      },
      { status: 500 }
    );
  }
}
