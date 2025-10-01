import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/supabase';
import { withAuth } from '@/lib/auth-middleware';
import type { IApiResponse, ITeamInvitationWithDetails } from '@/types';

// GET /api/teams/invitations - Get user's invitations
export async function GET(request: NextRequest) {
  return withAuth(request, async (req) => {
    try {
      const user = req.user!;

      const { data: invitations, error } = await db.getUserInvitations(user.id);

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

      return NextResponse.json<IApiResponse<ITeamInvitationWithDetails[]>>({
        success: true,
        message: 'Invitations fetched successfully',
        data: invitations as ITeamInvitationWithDetails[],
      });
    } catch (error: any) {
      return NextResponse.json<IApiResponse>(
        {
          success: false,
          message: error.message || 'Failed to fetch invitations',
          data: null,
        },
        { status: 500 }
      );
    }
  });
}

// POST /api/teams/invitations - Create an invitation
export async function POST(request: NextRequest) {
  return withAuth(request, async (req) => {
    try {
      const user = req.user!;

    const body = await request.json();
    const { team_id, invitee_id } = body;

    if (!team_id || !invitee_id) {
      return NextResponse.json<IApiResponse>(
        {
          success: false,
          message: 'Team ID and invitee ID are required',
          data: null,
        },
        { status: 400 }
      );
    }

      // Check if team exists
      const { data: team, error: teamError } = await db.getTeam(team_id);

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
            message: 'Only team leader can send invitations',
            data: null,
          },
          { status: 403 }
        );
      }

      // Check if team is blocked
      if (teamData.status === 'blocked') {
        return NextResponse.json<IApiResponse>(
          {
            success: false,
            message: 'This team is blocked and cannot send invitations',
            data: null,
          },
          { status: 403 }
        );
      }

    // Check if invitee exists
    const { data: invitee } = await db.getUser(invitee_id);

    if (!invitee) {
      return NextResponse.json<IApiResponse>(
        {
          success: false,
          message: 'User not found',
          data: null,
        },
        { status: 404 }
      );
    }

    // Check if invitee is already in a team
    const { data: inviteeMemberships } = await db.getUserTeams(invitee_id);

    if (inviteeMemberships && inviteeMemberships.length > 0) {
      return NextResponse.json<IApiResponse>(
        {
          success: false,
          message: 'User is already a member of a team',
          data: null,
        },
        { status: 400 }
      );
    }

    // Check if invitation already exists
    const { data: existingInvitation } = await db.checkExistingInvitation(team_id, invitee_id);

    if (existingInvitation) {
      return NextResponse.json<IApiResponse>(
        {
          success: false,
          message: 'Invitation already sent to this user',
          data: null,
        },
        { status: 400 }
      );
    }

      // Create invitation
      const { data: invitation, error } = await db.createInvitation({
        team_id,
        inviter_id: user.id,
        invitee_id,
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

      return NextResponse.json<IApiResponse<ITeamInvitationWithDetails>>({
        success: true,
        message: 'Invitation created successfully',
        data: invitation as unknown as ITeamInvitationWithDetails,
      });
    } catch (error: any) {
      return NextResponse.json<IApiResponse>(
        {
          success: false,
          message: error.message || 'Failed to create invitation',
          data: null,
        },
        { status: 500 }
      );
    }
  });
}

