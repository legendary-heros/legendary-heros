import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/supabase';
import { withAuth, withAdmin } from '@/lib/auth-middleware';
import type { IApiResponse, ITeamWithLeader } from '@/types';

// GET /api/teams/[id] - Get a specific team
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: team, error } = await db.getTeamBySlug(params.id);

    if (error || !team) {
      return NextResponse.json<IApiResponse>(
        {
          success: false,
          message: 'Team not found',
          data: params,
        },
        { status: 404 }
      );
    }

    return NextResponse.json<IApiResponse<ITeamWithLeader>>({
      success: true,
      message: 'Team fetched successfully',
      data: team as ITeamWithLeader,
    });
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
}

// PATCH /api/teams/[id] - Update a team
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (req) => {
    try {
      const user = req.user!;

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

      // Check if user is the team leader or admin/superadmin
      const isLeader = teamData.leader_id === user.id;
      const isAdmin = ['admin', 'superadmin'].includes(user.role);

      if (!isLeader && !isAdmin) {
        return NextResponse.json<IApiResponse>(
          {
            success: false,
            message: 'Only team leader or admin can update the team',
            data: null,
          },
          { status: 403 }
        );
      }

      // Check if team is blocked (only admins can update blocked teams)
      if (teamData.status === 'blocked' && !isAdmin) {
        return NextResponse.json<IApiResponse>(
          {
            success: false,
            message: 'This team is blocked and cannot be updated',
            data: null,
          },
          { status: 403 }
        );
      }

    const body = await request.json();
    const updateData: any = {};

    // Only allow specific fields to be updated by leaders
    if (isLeader && !isAdmin) {
      if (body.name !== undefined) updateData.name = body.name.trim();
      if (body.bio !== undefined) updateData.bio = body.bio.trim() || null;
      if (body.mark_url !== undefined) updateData.mark_url = body.mark_url || null;
      if (body.ad_url !== undefined) updateData.ad_url = body.ad_url || null;
      
      // Update slug if name changed
      if (body.name !== undefined) {
        updateData.slug = body.name
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-');
      }
    }

    // Admins can update status
    if (isAdmin) {
      if (body.status !== undefined) updateData.status = body.status;
      if (body.name !== undefined) updateData.name = body.name.trim();
      if (body.bio !== undefined) updateData.bio = body.bio.trim() || null;
      if (body.mark_url !== undefined) updateData.mark_url = body.mark_url || null;
      if (body.ad_url !== undefined) updateData.ad_url = body.ad_url || null;
      
      if (body.name !== undefined) {
        updateData.slug = body.name
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-');
      }
    }

      const { data: updatedTeam, error } = await db.updateTeam(params.id, updateData);

      if (error || !updatedTeam) {
        return NextResponse.json<IApiResponse>(
          {
            success: false,
            message: error?.message || 'Failed to update team',
            data: null,
          },
          { status: 500 }
        );
      }

      return NextResponse.json<IApiResponse<ITeamWithLeader>>({
        success: true,
        message: 'Team updated successfully',
        data: updatedTeam as ITeamWithLeader,
      });
    } catch (error: any) {
      return NextResponse.json<IApiResponse>(
        {
          success: false,
          message: error.message || 'Failed to update team',
          data: null,
        },
        { status: 500 }
      );
    }
  });
}

// DELETE /api/teams/[id] - Delete a team
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (req) => {
    try {
      const user = req.user!;

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

      // Only team leader or admin can delete
      const isLeader = teamData.leader_id === user.id;
      const isAdmin = ['admin', 'superadmin'].includes(user.role);

      if (!isLeader && !isAdmin) {
        return NextResponse.json<IApiResponse>(
          {
            success: false,
            message: 'Only team leader or admin can delete the team',
            data: null,
          },
          { status: 403 }
        );
      }

      const { error } = await db.deleteTeam(params.id);

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
        message: 'Team deleted successfully',
        data: { message: 'Team deleted successfully' },
      });
    } catch (error: any) {
      return NextResponse.json<IApiResponse>(
        {
          success: false,
          message: error.message || 'Failed to delete team',
          data: null,
        },
        { status: 500 }
      );
    }
  });
}

