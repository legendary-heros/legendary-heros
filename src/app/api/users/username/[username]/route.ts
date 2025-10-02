import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/supabase';
import type { IUser, IUserDB, IUserWithTeam, ITeamWithLeader, TeamMemberRole } from '@/types';

/**
 * GET /api/users/username/[username]
 * Get a user by username (public endpoint)
 * Returns: User data without sensitive information
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const username = params.username;

    if (!username) {
      return NextResponse.json(
        { success: false, message: 'Username is required', data: null },
        { status: 400 }
      );
    }

    const { data: user, error } = await db.getUserByUsernameWithTeam(username);

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
    console.error('Error fetching user by username:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch user', data: null },
      { status: 500 }
    );
  }
}

