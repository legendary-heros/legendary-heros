import { NextRequest, NextResponse } from 'next/server';
import { withAdmin } from '@/lib/auth-middleware';
import { db } from '@/lib/supabase';
import type { IUserDB } from '@/types';

/**
 * GET /api/users
 * List all users with pagination and search
 * Requires: admin or superadmin role
 */
export async function GET(request: NextRequest) {
  return withAdmin(request, async (req) => {
    try {
      const { searchParams } = new URL(req.url);
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '10');
      const search = searchParams.get('search') || '';
      const status = searchParams.get('status') || '';
      const role = searchParams.get('role') || '';

      const { data: users, error, count } = await db.getUsersWithPagination({
        page,
        limit,
        search,
        status,
        role,
      });

      if (error) {
        return NextResponse.json(
          { success: false, error: error.message, data: null },
          { status: 500 }
        );
      }

      // Remove passwords from response
      const sanitizedUsers = (users || []).map((user: IUserDB) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });

      return NextResponse.json({
        success: true,
        error: null,
        data: {
          users: sanitizedUsers,
          pagination: {
            page,
            limit,
            total: count || 0,
            totalPages: Math.ceil((count || 0) / limit),
          },
        },
      });
    } catch (error: any) {
      console.error('Error fetching users:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch users', data: null },
        { status: 500 }
      );
    }
  });
}

