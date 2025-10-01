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

    // Sign in user with Supabase
    const { data, error } = await auth.signIn(email, password);

    if (error) {
      return NextResponse.json(
        { 
          success: false,
          message: error.message
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { 
        success: true,
        message: 'Sign in successful',
        data: {
          user: data.user,
          session: data.session
        }
      },
      { status: 200 }
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
