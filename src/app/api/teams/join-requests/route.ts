import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/supabase';
import { withAuth } from '@/lib/auth-middleware';
import type { IApiResponse, ITeamJoinRequestWithDetails } from '@/types';

// GET /api/teams/join-requests - Get user's join requests or team's join requests
export async function GET(request: NextRequest) {
  return withAuth(request, async (req) => {
    try {
      const user = req.user!;

    const { searchParams } = request.nextUrl;
    const teamId = searchParams.get('teamId');

    let joinRequests;
    let error;

        if (teamId) {
          // Get team's join requests (team leader only)
          const { data: team } = await db.getTeam(teamId);

          if (!team) {
            return NextResponse.json<IApiResponse>(
              {
                success: false,
                message: 'Team not found',
                data: null,
              },
              { status: 404 }
            );
          }

          if (team.leader_id !== user.id) {
            return NextResponse.json<IApiResponse>(
              {
                success: false,
                message: 'Only team leader can view join requests',
                data: null,
              },
              { status: 403 }
            );
          }

      const result = await db.getTeamJoinRequests(teamId);
      joinRequests = result.data;
      error = result.error;
        } else {
          // Get user's join requests
          const result = await db.getUserJoinRequests(user.id);
          joinRequests = result.data;
          error = result.error;
        }

    if (error) {
      return NextResponse.json<IApiResponse>(
        {
          success: false,
          message: error.message,
          data: null,
        },
        { status: 500 }
      );
    }

      return NextResponse.json<IApiResponse<ITeamJoinRequestWithDetails[]>>({
        success: true,
        message: 'Join requests fetched successfully',
        data: joinRequests as ITeamJoinRequestWithDetails[],
      });
    } catch (error: any) {
      return NextResponse.json<IApiResponse>(
        {
          success: false,
          message: error.message || 'Failed to fetch join requests',
          data: null,
        },
        { status: 500 }
      );
    }
  });
}

// POST /api/teams/join-requests - Create a join request
export async function POST(request: NextRequest) {
  return withAuth(request, async (req) => {
    try {
      const user = req.user!;

    const body = await request.json();
    const { team_id, message } = body;

    if (!team_id) {
      return NextResponse.json<IApiResponse>(
        {
          success: false,
          message: 'Team ID is required',
          data: null,
        },
        { status: 400 }
      );
    }

    // Check if team exists
    const { data: team } = await db.getTeam(team_id);

    if (!team) {
      return NextResponse.json<IApiResponse>(
        {
          success: false,
          message: 'Team not found',
          data: null,
        },
        { status: 404 }
      );
    }

    // Check if team is approved
    if (team.status !== 'approved') {
      return NextResponse.json<IApiResponse>(
        {
          success: false,
          message: 'This team is not accepting members yet',
          data: null,
        },
        { status: 400 }
      );
    }

      // Check if user is already in a team
      const { data: userTeams } = await db.getUserTeams(user.id);

      if (userTeams && userTeams.length > 0) {
        return NextResponse.json<IApiResponse>(
          {
            success: false,
            message: 'You are already a member of a team',
            data: null,
          },
          { status: 400 }
        );
      }

      // Check if join request already exists
      const { data: existingRequest } = await db.checkExistingJoinRequest(team_id, user.id);

      if (existingRequest) {
        return NextResponse.json<IApiResponse>(
          {
            success: false,
            message: 'You have already requested to join this team',
            data: null,
          },
          { status: 400 }
        );
      }

      // Create join request
      const { data: joinRequest, error } = await db.createJoinRequest({
        team_id,
        user_id: user.id,
        message: message || null,
      });

      if (error) {
        return NextResponse.json<IApiResponse>(
          {
            success: false,
            message: error.message,
            data: null,
          },
          { status: 500 }
        );
      }

      return NextResponse.json<IApiResponse<ITeamJoinRequestWithDetails>>({
        success: true,
        message: 'Join request created successfully',
        data: joinRequest as unknown as ITeamJoinRequestWithDetails,
      });
    } catch (error: any) {
      return NextResponse.json<IApiResponse>(
        {
          success: false,
          message: error.message || 'Failed to create join request',
          data: null,
        },
        { status: 500 }
      );
    }
  });
}

