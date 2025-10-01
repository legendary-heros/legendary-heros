import { NextRequest, NextResponse } from 'next/server';
import { withAdmin } from '@/lib/auth-middleware';
import { db } from '@/lib/supabase';
import type { IUserDB } from '@/types';

/**
 * DELETE /api/users/[id]
 * Delete a user
 * Requires: admin or superadmin role
 * Restrictions:
 * - Cannot delete yourself
 * - Admins cannot delete other admins or superadmins
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAdmin(request, async (req) => {
    try {
      const userId = params.id;

      // Prevent users from deleting themselves
      if (req.userId === userId) {
        return NextResponse.json(
          { success: false, message: 'Cannot delete your own account', data: null },
          { status: 403 }
        );
      }

      // Get the target user to check their role
      const { data: targetUser, error: targetError } = await db.getUser(userId);
      if (targetError || !targetUser) {
        return NextResponse.json(
          { success: false, message: 'User not found', data: null },
          { status: 404 }
        );
      }

      const targetUserData = targetUser as IUserDB;

      // Admins cannot delete other admins or superadmins
      if (req.user?.role === 'admin' && (targetUserData.role === 'admin' || targetUserData.role === 'superadmin')) {
        return NextResponse.json(
          { success: false, message: 'Admins cannot delete other admins', data: null },
          { status: 403 }
        );
      }

      const { error } = await db.deleteUser(userId);

      if (error) {
        return NextResponse.json(
          { success: false, message: error.message, data: null },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'User deleted successfully',
        data: { message: 'User deleted successfully' },
      });
    } catch (error: any) {
      console.error('Error deleting user:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to delete user', data: null },
        { status: 500 }
      );
    }
  });
}

