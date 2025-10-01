import { NextRequest, NextResponse } from 'next/server';
import { withAdmin } from '@/lib/auth-middleware';
import { db } from '@/lib/supabase';
import type { UserStatus, IUserDB } from '@/types';

/**
 * PATCH /api/users/[id]/status
 * Update user status (allow, waiting, block)
 * Requires: admin or superadmin role
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAdmin(request, async (req) => {
    try {
      const userId = params.id;
      const body = await req.json();
      const { status } = body;

      // Validate status
      const validStatuses: UserStatus[] = ['allow', 'waiting', 'block'];
      if (!status || !validStatuses.includes(status)) {
        return NextResponse.json(
          { success: false, message: 'Invalid status value', data: null },
          { status: 400 }
        );
      }

      // Prevent users from changing their own status
      if (req.userId === userId) {
        return NextResponse.json(
          { success: false, message: 'Cannot change your own status', data: null },
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

      // Admins cannot change status of other admins or superadmins
      if (req.user?.role === 'admin' && (targetUser.role === 'admin' || targetUser.role === 'superadmin')) {
        return NextResponse.json(
          { success: false, message: 'Admins cannot change the status of other admins', data: null },
          { status: 403 }
        );
      }

      const { data: updatedUser, error } = await db.updateUser(userId, { status });

      if (error) {
        return NextResponse.json(
          { success: false, message: error.message, data: null },
          { status: 500 }
        );
      }

      // Remove password from response
      if (updatedUser) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...sanitizedUser } = updatedUser as IUserDB;
        return NextResponse.json({
          success: true,
          message: 'User status updated successfully',
          data: { user: sanitizedUser },
        });
      }

      return NextResponse.json(
        { success: false, message: 'User not found', data: null },
        { status: 404 }
      );
    } catch (error: any) {
      console.error('Error updating user status:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to update user status', data: null },
        { status: 500 }
      );
    }
  });
}

