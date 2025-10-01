import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromHeader } from '@/lib/jwt';
import { db } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json(
        { 
          success: false,
          message: 'No token provided',
          data: { user: null }
        },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Invalid or expired token',
          data: { user: null }
        },
        { status: 401 }
      );
    }

    // Get user from database
    const { data: user, error } = await db.getUser(payload.userId);

    if (error || !user) {
      return NextResponse.json(
        { 
          success: false,
          message: 'User not found',
          data: { user: null }
        },
        { status: 404 }
      );
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user as any;

    return NextResponse.json(
      { 
        success: true,
        message: 'Session retrieved successfully',
        data: {
          user: userWithoutPassword
        }
        
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Session error:', errorMessage);
    return NextResponse.json(
      { 
        success: false,
        message: errorMessage,
        data: { user: null }
      },
      { status: 500 }
    );
  }
}
