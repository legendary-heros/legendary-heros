import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // With JWT-based authentication, signout is primarily handled on the client side
    // by removing the token from storage. This endpoint just acknowledges the request.
    
    return NextResponse.json(
      { 
        success: true,
        message: 'Sign out successful',
        data: null
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Signout error:', errorMessage);
    return NextResponse.json(
      { 
        success: false,
        message: errorMessage
      },
      { status: 500 }
    );
  }
}
