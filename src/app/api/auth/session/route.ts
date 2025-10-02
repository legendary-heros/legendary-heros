import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromHeader } from '@/lib/jwt';
import { db } from '@/lib/supabase';
import type { IUserWithTeam, ITeamWithLeader, TeamMemberRole } from '@/types';

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

    // Get user from database with team information
    const { data: user, error } = await db.getUserWithTeam(payload.userId);

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

    // Type assertion for the user data
    const userData = user as any;

    // Remove sensitive information and format with team data
    const userWithTeam: IUserWithTeam = {
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
      userWithTeam.team = {
        team: teamMember.team as ITeamWithLeader,
        role: teamMember.role as TeamMemberRole,
        joined_at: teamMember.joined_at,
      };
    }

    return NextResponse.json(
      { 
        success: true,
        message: 'Session retrieved successfully',
        data: {
          user: userWithTeam
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
