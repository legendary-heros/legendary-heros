import { NextRequest, NextResponse } from 'next/server';
import { withAdmin } from '@/lib/auth-middleware';
import { db } from '@/lib/supabase';
import type { IUserDB, IUserWithTeam, ITeamWithLeader, TeamMemberRole } from '@/types';

/**
 * GET /api/users/[id]
 * Get a user by ID with team information
 * Returns: User data with team information if user has joined a team
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID is required', data: null },
        { status: 400 }
      );
    }

    const { data: user, error } = await db.getUserWithTeam(userId);

    if (error || !user) {
      return NextResponse.json(
        { success: false, message: 'User not found', data: null },
        { status: 404 }
      );
    }

    // Type assertion for the user data
    const userData = user as any;

    // Remove sensitive information (password is already not in the response)
    const publicUserData: IUserWithTeam = {
      id: userData.id,
      email: userData.email,
      username: userData.username,
      slackname: userData.slackname,
      dotaname: userData.dotaname,
      status: userData.status,
      role: userData.role,
      score: userData.score,
      vote_count: userData.vote_count,
      bio: userData.bio,
      avatar_url: userData.avatar_url,
      created_at: userData.created_at,
      updated_at: userData.updated_at,
      team: null,
    };

    // Check if user has team information
    if (userData.team_members && userData.team_members.length > 0) {
      const teamMember = userData.team_members[0];
      publicUserData.team = {
        team: teamMember.team as ITeamWithLeader,
        role: teamMember.role as TeamMemberRole,
        joined_at: teamMember.joined_at,
      };
    }

    return NextResponse.json({
      success: true,
      message: 'User fetched successfully',
      data: publicUserData,
    });
  } catch (error: any) {
    console.error('Error fetching user by ID:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch user', data: null },
      { status: 500 }
    );
  }
}

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

