import { NextRequest, NextResponse } from 'next/server';
import { withAdmin } from '@/lib/auth-middleware';
import { db } from '@/lib/supabase';
import type { IUserDB } from '@/types';

/**
 * PATCH /api/users/[id]/score
 * Update user score
 * Requires: admin or superadmin role
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAdmin(request, async (req) => {
    try {
      const { id: userId } = await params;
      const body = await req.json();
      const { score } = body;

      // Validate score
      if (score === undefined || score === null) {
        return NextResponse.json(
          { success: false, message: 'Score is required', data: null },
          { status: 400 }
        );
      }

      const scoreValue = String(score);

      // Get the target user to check their role (for consistent permissions)
      const { data: targetUser, error: targetError } = await db.getUser(userId);
      if (targetError || !targetUser) {
        return NextResponse.json(
          { success: false, message: 'User not found', data: null },
          { status: 404 }
        );
      }

      // Admins cannot change score of other admins or superadmins
      if (req.user?.role === 'admin' && (targetUser.role === 'admin' || targetUser.role === 'superadmin')) {
        return NextResponse.json(
          { success: false, message: 'Admins cannot change the score of other admins', data: null },
          { status: 403 }
        );
      }

      const { data: updatedUser, error } = await db.updateUser(userId, { score: scoreValue });

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
          message: 'User score updated successfully',
          data: { user: sanitizedUser },
        });
      }

      return NextResponse.json(
        { success: false, message: 'User not found', data: null },
        { status: 404 }
      );
    } catch (error: any) {
      console.error('Error updating user score:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to update user score', data: null },
        { status: 500 }
      );
    }
  });
}

