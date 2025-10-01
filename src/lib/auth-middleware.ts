import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromHeader } from './jwt';
import { db } from './supabase';

export interface AuthRequest extends NextRequest {
  userId?: string;
  user?: any;
}

/**
 * Middleware to verify JWT token and attach user to request
 */
export async function withAuth(
  request: NextRequest,
  handler: (req: AuthRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'No token provided', data: null },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token', data: null },
        { status: 401 }
      );
    }

    // Attach user info to request
    const authReq = request as AuthRequest;
    authReq.userId = payload.userId;

    // Optionally fetch full user data
    const { data: user, error } = await db.getUser(payload.userId);
    if (error || !user) {
      return NextResponse.json(
        { success: false, error: 'User not found', data: null },
        { status: 401 }
      );
    }

    authReq.user = user;

    return handler(authReq);
  } catch (error) {
    console.error('Auth middleware error:', error);
    return NextResponse.json(
      { success: false, error: 'Authentication failed', data: null },
      { status: 401 }
    );
  }
}


