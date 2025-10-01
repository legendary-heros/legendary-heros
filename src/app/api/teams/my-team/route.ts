import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/supabase';
import { withAuth } from '@/lib/auth-middleware';
import type { IApiResponse, ITeamWithLeader } from '@/types';

// GET /api/teams/my-team - Get current user's team
export async function GET(request: NextRequest) {
  return withAuth(request, async (req) => {
    try {
      const user = req.user!;

      // Check if user is a team leader
      const { data: leaderTeam } = await db.getTeamByLeaderId(user.id);

      if (leaderTeam) {
        return NextResponse.json<IApiResponse<ITeamWithLeader>>({
          success: true,
          message: 'Team fetched successfully',
          data: leaderTeam as ITeamWithLeader,
        });
      }

      // Check if user is a team member
      const { data: userTeams } = await db.getUserTeams(user.id);

      if (userTeams && userTeams.length > 0) {
        // @ts-ignore
        const team = userTeams[0].team;
        return NextResponse.json<IApiResponse<ITeamWithLeader>>({
          success: true,
          message: 'Team fetched successfully',
          data: team as ITeamWithLeader,
        });
      }

      return NextResponse.json<IApiResponse>(
        {
          success: true,
          message: 'Team fetched successfully',
          data: null,
        },
        { status: 200 }
      );
    } catch (error: any) {
      return NextResponse.json<IApiResponse>(
        {
          success: false,
          message: error.message || 'Failed to fetch team',
          data: null,
        },
        { status: 500 }
      );
    }
  });
}

