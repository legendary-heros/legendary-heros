import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/supabase';
import { withAuth } from '@/lib/auth-middleware';
import type { IApiResponse, ITeamInvitationWithDetails } from '@/types';

// PATCH /api/teams/invitations/[id] - Accept or reject invitation
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (req) => {
    try {
      const user = req.user!;

    const body = await request.json();
    const { action } = body; // 'accept' or 'reject'

    if (!action || !['accept', 'reject'].includes(action)) {
      return NextResponse.json<IApiResponse>(
        {
          success: false,
          message: 'Invalid action. Use "accept" or "reject"',
          data: null,
        },
        { status: 400 }
      );
    }

      // Get invitation
      const { data: invitation, error: invError } = await db.getInvitation(params.id);

      if (invError || !invitation) {
        return NextResponse.json<IApiResponse>(
          {
            success: false,
            message: 'Invitation not found',
            data: null,
          },
          { status: 404 }
        );
      }

      const invitationData = invitation as any;

      // Check if user is the invitee
      if (invitationData.invitee_id !== user.id) {
        return NextResponse.json<IApiResponse>(
          {
            success: false,
            message: 'You are not authorized to respond to this invitation',
            data: null,
          },
          { status: 403 }
        );
      }

      // Check if invitation is pending
      if (invitationData.status !== 'pending') {
        return NextResponse.json<IApiResponse>(
          {
            success: false,
            message: 'Invitation has already been responded to',
            data: null,
          },
          { status: 400 }
        );
      }

    const status = action === 'accept' ? 'accepted' : 'rejected';

    // Update invitation status
    const { data: updatedInvitation, error } = await db.updateInvitationStatus(params.id, status);

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

      // If accepted, add user to team
      if (action === 'accept') {
        // Check if user is already in a team (race condition check)
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

        const { error: memberError } = await db.addTeamMember({
          team_id: invitationData.team_id,
          user_id: user.id,
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

      return NextResponse.json<IApiResponse<ITeamInvitationWithDetails>>({
        success: true,
        message: 'Invitation responded successfully',
        data: updatedInvitation as unknown as ITeamInvitationWithDetails,
      });
    } catch (error: any) {
      return NextResponse.json<IApiResponse>(
        {
          success: false,
          message: error.message || 'Failed to respond to invitation',
          data: null,
        },
        { status: 500 }
      );
    }
  });
}

