import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth-middleware';
import { db } from '@/lib/supabase';
import type { IUserDB, IUserWithTeam, ITeamWithLeader, TeamMemberRole } from '@/types';

/**
 * GET /api/users
 * List all users with pagination and search
 * Requires: admin or superadmin role
 */
export async function GET(request: NextRequest) {
  return withAuth(request, async (req) => {
    try {
      const { searchParams } = new URL(req.url);
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '10');
      const search = searchParams.get('search') || '';
      const status = searchParams.get('status') || '';
      const role = searchParams.get('role') || '';

      const { data: users, error, count } = await db.getUsersWithPaginationAndTeams({
        page,
        limit,
        search,
        status,
        role,
      });

      if (error) {
        return NextResponse.json(
          { success: false, message: error.message, data: null },
          { status: 500 }
        );
      }

      // Process users with team information
      const usersWithTeams: IUserWithTeam[] = (users || []).map((user: any) => {
        const userWithTeam: IUserWithTeam = {
          id: user.id,
          email: user.email,
          username: user.username,
          slackname: user.slackname,
          dotaname: user.dotaname,
          status: user.status,
          role: user.role,
          score: user.score,
          vote_count: user.vote_count,
          bio: user.bio,
          avatar_url: user.avatar_url,
          created_at: user.created_at,
          updated_at: user.updated_at,
          team: null,
        };

        // Check if user has team information
        if (user.team_members && user.team_members.length > 0) {
          const teamMember = user.team_members[0];
          userWithTeam.team = {
            team: teamMember.team as ITeamWithLeader,
            role: teamMember.role as TeamMemberRole,
            joined_at: teamMember.joined_at,
          };
        }

        return userWithTeam;
      });

      return NextResponse.json({
        success: true,
        message: 'Users fetched successfully',
        data: {
          users: usersWithTeams,
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
        { success: false, message: 'Failed to fetch users', data: null },
        { status: 500 }
      );
    }
  });
}

