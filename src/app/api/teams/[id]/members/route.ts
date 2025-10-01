import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/supabase';
import { withAuth } from '@/lib/auth-middleware';
import type { IApiResponse, ITeamMemberWithUser } from '@/types';

// GET /api/teams/[id]/members - Get all team members
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: members, error } = await db.getTeamMembers(params.id);

    if (error) {
      return NextResponse.json<IApiResponse>(
        {
          success: false,
          message: error.message,
          data: params,
        },
        { status: 500 }
      );
    }

    return NextResponse.json<IApiResponse<ITeamMemberWithUser[]>>({
      success: true,
      message: 'Team members fetched successfully',
      data: members as ITeamMemberWithUser[],
    });
  } catch (error: any) {
    return NextResponse.json<IApiResponse>(
      {
        success: false,
        message: error.message || 'Failed to fetch team members',
        data: null,
      },
      { status: 500 }
    );
  }
}

// DELETE /api/teams/[id]/members - Remove a team member
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (req) => {
    try {
      const user = req.user!;

    const { searchParams } = request.nextUrl;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json<IApiResponse>(
        {
          success: false,
          message: 'User ID is required',
          data: null,
        },
        { status: 400 }
      );
    }

      const { data: team, error: teamError } = await db.getTeam(params.id);

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

      // Check if user is leaving themselves or if leader is removing someone
      const isSelf = userId === user.id;
      const isLeader = teamData.leader_id === user.id;

      if (!isSelf && !isLeader) {
        return NextResponse.json<IApiResponse>(
          {
            success: false,
            message: 'Only team leader can remove members',
            data: null,
          },
          { status: 403 }
        );
      }

      // Prevent leader from leaving their own team
      if (isSelf && isLeader) {
        return NextResponse.json<IApiResponse>(
          {
            success: false,
            message: 'Team leader cannot leave the team. Delete the team instead.',
            data: null,
          },
          { status: 400 }
        );
      }

      const { error } = await db.removeTeamMember(params.id, userId);

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

      return NextResponse.json<IApiResponse>({
        success: true,
        message: 'Member removed successfully',
        data: { message: 'Member removed successfully' },
      });
    } catch (error: any) {
      return NextResponse.json<IApiResponse>(
        {
          success: false,
          message: error.message || 'Failed to remove member',
          data: null,
        },
        { status: 500 }
      );
    }
  });
}

// PATCH /api/teams/[id]/members - Update team member role
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (req) => {
    try {
      const user = req.user!;
      const { memberId, role } = await req.json();

      if (!memberId || !role) {
        return NextResponse.json<IApiResponse>(
          {
            success: false,
            message: 'Member ID and role are required',
            data: null,
          },
          { status: 400 }
        );
      }

      // Check if team exists and user is leader
      const { data: team, error: teamError } = await db.getTeam(params.id);
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
      if (teamData.leader_id !== user.id) {
        return NextResponse.json<IApiResponse>(
          {
            success: false,
            message: 'Only team leaders can update member roles',
            data: null,
          },
          { status: 403 }
        );
      }

      // Update member role
      const { error } = await db.updateTeamMemberRole(memberId, role);
      if (error) {
        return NextResponse.json<IApiResponse>(
          {
            success: false,
            message: error.message || 'Failed to update member role',
            data: null,
          },
          { status: 500 }
        );
      }

      return NextResponse.json<IApiResponse>({
        success: true,
        message: 'Member role updated successfully',
        data: { message: 'Member role updated successfully' },
      });
    } catch (error: any) {
      return NextResponse.json<IApiResponse>(
        {
          success: false,
          message: error.message || 'Failed to update member role',
          data: null,
        },
        { status: 500 }
      );
    }
  });
}

