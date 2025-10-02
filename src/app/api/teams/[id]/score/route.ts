import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/supabase';
import { withAdmin } from '@/lib/auth-middleware';
import type { IApiResponse, ITeamWithLeader } from '@/types';

/**
 * Team Score Management API
 * 
 * This API allows administrators to update team scores with proper authorization.
 * Only users with 'admin' or 'superadmin' roles can access these endpoints.
 * 
 * Features:
 * - Update team score with validation
 * - Optional reason tracking for audit purposes
 * - Automatic logging of score changes
 */

// PATCH /api/teams/[id]/score - Update team score (Admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAdmin(request, async (req) => {
    try {
      const user = req.user!;
      const body = await request.json();
      const { score, reason } = body;

      // Validate score
      if (score === undefined || score === null) {
        return NextResponse.json<IApiResponse>(
          {
            success: false,
            message: 'Score is required',
            data: null,
          },
          { status: 400 }
        );
      }

      const scoreNumber = parseFloat(score);
      if (isNaN(scoreNumber) || scoreNumber < 0) {
        return NextResponse.json<IApiResponse>(
          {
            success: false,
            message: 'Score must be a valid positive number',
            data: null,
          },
          { status: 400 }
        );
      }

      // Check if team exists
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

      // Update team score
      const { data: updatedTeam, error } = await db.updateTeam(params.id, {
        score: scoreNumber.toString()
      });

      if (error || !updatedTeam) {
        return NextResponse.json<IApiResponse>(
          {
            success: false,
            message: error?.message || 'Failed to update team score',
            data: null,
          },
          { status: 500 }
        );
      }

      // Log the score change for audit purposes
      console.log(`Admin ${user.username} (${user.id}) updated team ${params.id} score from ${team.score} to ${scoreNumber}${reason ? ` - Reason: ${reason}` : ''}`);

      return NextResponse.json<IApiResponse<ITeamWithLeader>>({
        success: true,
        message: 'Team score updated successfully',
        data: updatedTeam as ITeamWithLeader,
      });
    } catch (error: any) {
      return NextResponse.json<IApiResponse>(
        {
          success: false,
          message: error.message || 'Failed to update team score',
          data: null,
        },
        { status: 500 }
      );
    }
  });
}

// GET /api/teams/[id]/score - Get team score history (Admin only)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAdmin(request, async (req) => {
    try {
      // Check if team exists
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

      // For now, return current score and team info
      // In a real implementation, you might want to track score history
      return NextResponse.json<IApiResponse<{
        currentScore: string;
        team: ITeamWithLeader;
        lastUpdated: string;
      }>>({
        success: true,
        message: 'Team score information retrieved',
        data: {
          currentScore: team.score,
          team: team as ITeamWithLeader,
          lastUpdated: team.updated_at,
        },
      });
    } catch (error: any) {
      return NextResponse.json<IApiResponse>(
        {
          success: false,
          message: error.message || 'Failed to get team score information',
          data: null,
        },
        { status: 500 }
      );
    }
  });
}
