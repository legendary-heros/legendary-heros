import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { error } = await auth.signOut();

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
        message: 'Sign out successful'
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
