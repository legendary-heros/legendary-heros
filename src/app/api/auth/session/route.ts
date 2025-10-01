import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { data, error } = await auth.getSession();

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
        message: 'Session retrieved successfully',
        data: {
          session: data.session,
          user: data.session?.user || null
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
