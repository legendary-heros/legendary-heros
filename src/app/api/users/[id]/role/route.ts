import { NextRequest, NextResponse } from 'next/server';
import { withSuperAdmin } from '@/lib/auth-middleware';
import { db } from '@/lib/supabase';
import type { UserRole, IUserDB } from '@/types';

/**
 * PATCH /api/users/[id]/role
 * Update user role (assign admin role)
 * Requires: superadmin role only
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withSuperAdmin(request, async (req) => {
    try {
      const userId = params.id;
      const body = await req.json();
      const { role } = body;

      // Validate role
      const validRoles: UserRole[] = ['superadmin', 'admin', 'leader', 'member'];
      if (!role || !validRoles.includes(role)) {
        return NextResponse.json(
          { success: false, error: 'Invalid role value', data: null },
          { status: 400 }
        );
      }

      // Prevent users from changing their own role
      if (req.userId === userId) {
        return NextResponse.json(
          { success: false, error: 'Cannot change your own role', data: null },
          { status: 403 }
        );
      }

      const { data: updatedUser, error } = await db.updateUser(userId, { role });

      if (error) {
        return NextResponse.json(
          { success: false, error: error.message, data: null },
          { status: 500 }
        );
      }

      // Remove password from response
      if (updatedUser) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...sanitizedUser } = updatedUser as IUserDB;
        return NextResponse.json({
          success: true,
          error: null,
          data: { user: sanitizedUser },
        });
      }

      return NextResponse.json(
        { success: false, error: 'User not found', data: null },
        { status: 404 }
      );
    } catch (error: any) {
      console.error('Error updating user role:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update user role', data: null },
        { status: 500 }
      );
    }
  });
}

