import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromHeader } from './jwt';
import { db } from './supabase';
import type { IUserDB, UserRole } from '@/types';

export interface AuthRequest extends NextRequest {
  userId?: string;
  user?: IUserDB;
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
        { success: false, message: 'No token provided', data: null },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token', data: null },
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
        { success: false, message: 'User not found', data: null },
        { status: 401 }
      );
    }

    authReq.user = user;

    return handler(authReq);
  } catch (error) {
    console.error('Auth middleware error:', error);
    return NextResponse.json(
      { success: false, message: 'Authentication failed', data: null },
      { status: 401 }
    );
  }
}

/**
 * Middleware to check if user has required role
 */
export async function withRole(
  request: NextRequest,
  allowedRoles: UserRole[],
  handler: (req: AuthRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  return withAuth(request, async (req) => {
    const user = req.user;
    
    if (!user || !allowedRoles.includes(user.role)) {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions', data: null },
        { status: 403 }
      );
    }

    return handler(req);
  });
}

/**
 * Middleware for admin-only routes (superadmin and admin)
 */
export async function withAdmin(
  request: NextRequest,
  handler: (req: AuthRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  return withRole(request, ['superadmin', 'admin'], handler);
}

/**
 * Middleware for superadmin-only routes
 */
export async function withSuperAdmin(
  request: NextRequest,
  handler: (req: AuthRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  return withRole(request, ['superadmin'], handler);
}

/**
 * Helper function to check if user is admin or superadmin
 */
export function isAdmin(role: UserRole): boolean {
  return role === 'admin' || role === 'superadmin';
}

/**
 * Helper function to check if user is superadmin
 */
export function isSuperAdmin(role: UserRole): boolean {
  return role === 'superadmin';
}