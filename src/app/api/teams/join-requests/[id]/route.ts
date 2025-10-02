import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/supabase';
import { withAuth } from '@/lib/auth-middleware';
import type { IApiResponse, ITeamJoinRequestWithDetails } from '@/types';

// PATCH /api/teams/join-requests/[id] - Approve or reject join request
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async (req) => {
    try {
      const user = req.user!;
      const { id } = await params;

    const body = await request.json();
    const { action } = body; // 'approve' or 'reject'

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json<IApiResponse>(
        {
          success: false,
          message: 'Invalid action. Use "approve" or "reject"',
          data: null,
        },
        { status: 400 }
      );
    }

      // Get join request
      const { data: joinRequest, error: reqError } = await db.getJoinRequest(id);

      if (reqError || !joinRequest) {
        return NextResponse.json<IApiResponse>(
          {
            success: false,
            message: 'Join request not found',
            data: null,
          },
          { status: 404 }
        );
      }

      const joinRequestData = joinRequest as any;

      // Get team
      const { data: team, error: teamError } = await db.getTeam(joinRequestData.team_id);

      if (teamError || !team) {
        return NextResponse.json<IApiResponse>(
          {
            success: false,
            message: 'Team not found',
            data: null,
          },
          { status: 404 }
        );
      }

      const teamData = team as any;

      // Check if user is the team leader
      if (teamData.leader_id !== user.id) {
        return NextResponse.json<IApiResponse>(
          {
            success: false,
            message: 'Only team leader can respond to join requests',
            data: null,
          },
          { status: 403 }
        );
      }

      // Check if join request is pending
      if (joinRequestData.status !== 'pending') {
        return NextResponse.json<IApiResponse>(
          {
            success: false,
            message: 'Join request has already been responded to',
            data: null,
          },
          { status: 400 }
        );
      }

    const status = action === 'approve' ? 'approved' : 'rejected';

    // Update join request status
    const { data: updatedRequest, error } = await db.updateJoinRequestStatus(id, status);

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

      // If approved, add user to team
      if (action === 'approve') {
        // Check if user is already in a team (race condition check)
        const { data: userTeams } = await db.getUserTeams(joinRequestData.user_id);

        if (userTeams && userTeams.length > 0) {
          return NextResponse.json<IApiResponse>(
            {
              success: false,
              message: 'User is already a member of a team',
              data: null,
            },
            { status: 400 }
          );
        }

        const { error: memberError } = await db.addTeamMember({
          team_id: joinRequestData.team_id,
          user_id: joinRequestData.user_id,
          role: 'Orb Hero',
        });

        if (memberError) {
          return NextResponse.json<IApiResponse>(
            {
              success: false,
              message: memberError.message,
              data: null,
            },
            { status: 500 }
          );
        }
      }

      return NextResponse.json<IApiResponse<ITeamJoinRequestWithDetails>>({
        success: true,
        message: 'Join request responded successfully',
        data: updatedRequest as unknown as ITeamJoinRequestWithDetails,
      });
    } catch (error: any) {
      return NextResponse.json<IApiResponse>(
        {
          success: false,
          message: error.message || 'Failed to respond to join request',
          data: null,
        },
        { status: 500 }
      );
    }
  });
}

