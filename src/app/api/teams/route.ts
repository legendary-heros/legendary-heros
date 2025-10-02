import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/supabase';
import { withAuth } from '@/lib/auth-middleware';
import type { IApiResponse, ITeamWithLeader } from '@/types';

// GET /api/teams - Get all teams with pagination
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

    const { data: teams, error, count } = await db.getTeamsWithPagination({
      page,
      limit,
      search,
      status,
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

    const totalPages = Math.ceil((count || 0) / limit);

    return NextResponse.json<IApiResponse<{
      teams: ITeamWithLeader[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>>({
      success: true,
      message: 'Teams fetched successfully',
      data: {
        teams: teams as ITeamWithLeader[],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages,
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json<IApiResponse>(
      {
        success: false,
        message: error.message || 'Failed to fetch teams',
        data: null,
      },
      { status: 500 }
    );
  }
}

// POST /api/teams - Create a new team
export async function POST(request: NextRequest) {
  return withAuth(request, async (req) => {
    try {
      const user = req.user!;

      // Check if user already has a team
      const { data: existingTeam } = await db.getTeamByLeaderId(user.id);
      
      if (existingTeam) {
        return NextResponse.json<IApiResponse>(
          {
            success: false,
            message: 'You already have a team',
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

      // Check if request is FormData (with file uploads) or JSON
      const contentType = request.headers.get('content-type') || '';
      let name: string;
      let bio: string | undefined;
      let markFile: File | null = null;
      let adFile: File | null = null;

      if (contentType.includes('multipart/form-data')) {
        // Handle FormData with file uploads
        const formData = await request.formData();
        name = formData.get('name') as string;
        bio = formData.get('bio') as string || undefined;
        markFile = formData.get('markFile') as File | null;
        adFile = formData.get('adFile') as File | null;

        // Validate files if provided
        if (markFile && markFile.size > 0) {
          const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
          if (!allowedTypes.includes(markFile.type)) {
            return NextResponse.json<IApiResponse>(
              {
                success: false,
                message: 'Invalid mark image type. Only images are allowed.',
                data: null,
              },
              { status: 400 }
            );
          }
          if (markFile.size > 1 * 1024 * 1024) { // 1MB max
            return NextResponse.json<IApiResponse>(
              {
                success: false,
                message: 'Mark image size exceeds 1MB limit',
                data: null,
              },
              { status: 400 }
            );
          }
        }

        if (adFile && adFile.size > 0) {
          const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
          if (!allowedTypes.includes(adFile.type)) {
            return NextResponse.json<IApiResponse>(
              {
                success: false,
                message: 'Invalid ad image type. Only images are allowed.',
                data: null,
              },
              { status: 400 }
            );
          }
          if (adFile.size > 1 * 1024 * 1024) { // 1MB max
            return NextResponse.json<IApiResponse>(
              {
                success: false,
                message: 'Ad image size exceeds 1MB limit',
                data: null,
              },
              { status: 400 }
            );
          }
        }
      } else {
        // Handle JSON data
        const body = await request.json();
        name = body.name;
        bio = body.bio;
      }

      if (!name || !name.trim()) {
        return NextResponse.json<IApiResponse>(
          {
            success: false,
            message: 'Team name is required',
            data: null,
          },
          { status: 400 }
        );
      }

      // Create slug from team name
      const slug = name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');

      // Create team first
      const { data: team, error } = await db.createTeam({
        name: name.trim(),
        slug,
        bio: bio?.trim() || undefined,
        mark_url: undefined, // Will be updated after image upload
        ad_url: undefined,   // Will be updated after image upload
        leader_id: user.id,
        status: 'waiting', // Needs admin approval
      });

      if (error || !team) {
        return NextResponse.json<IApiResponse>(
          {
            success: false,
            message: error?.message || 'Failed to create team',
            data: null,
          },
          { status: 500 }
        );
      }

      // Note: Leader is already tracked via leader_id field in teams table
      // No need to add them to team_members table to avoid double counting
      const createdTeam = team as ITeamWithLeader;

      // Upload images if provided
      let markUrl: string | null = null;
      let adUrl: string | null = null;

      if (markFile && markFile.size > 0) {
        try {
          const { storage } = await import('@/lib/supabase');
          const fileExt = markFile.name.split('.').pop();
          const fileName = `team-${createdTeam.id}-mark-${Date.now()}.${fileExt}`;
          const filePath = fileName;

          const { data: uploadData, error: uploadError } = await storage.uploadFile(
            'team-images',
            filePath,
            markFile
          );

          if (!uploadError) {
            const { data: publicUrlData } = storage.getPublicUrl('team-images', filePath);
            markUrl = publicUrlData.publicUrl;
          }
        } catch (uploadError) {
          console.error('Failed to upload mark image:', uploadError);
        }
      }

      if (adFile && adFile.size > 0) {
        try {
          const { storage } = await import('@/lib/supabase');
          const fileExt = adFile.name.split('.').pop();
          const fileName = `team-${createdTeam.id}-ad-${Date.now()}.${fileExt}`;
          const filePath = fileName;

          const { data: uploadData, error: uploadError } = await storage.uploadFile(
            'team-images',
            filePath,
            adFile
          );

          if (!uploadError) {
            const { data: publicUrlData } = storage.getPublicUrl('team-images', filePath);
            adUrl = publicUrlData.publicUrl;
          }
        } catch (uploadError) {
          console.error('Failed to upload ad image:', uploadError);
        }
      }

      // Update team with image URLs if any were uploaded
      if (markUrl || adUrl) {
        const updateData: { mark_url?: string; ad_url?: string } = {};
        if (markUrl) updateData.mark_url = markUrl;
        if (adUrl) updateData.ad_url = adUrl;

        const { data: updatedTeam } = await db.updateTeam(createdTeam.id, updateData);
        if (updatedTeam) {
          return NextResponse.json<IApiResponse<ITeamWithLeader>>({
            success: true,
            message: 'Team created successfully',
            data: updatedTeam as ITeamWithLeader,
          });
        }
      }

      return NextResponse.json<IApiResponse<ITeamWithLeader>>({
        success: true,
        message: 'Team created successfully',
        data: createdTeam,
      });
    } catch (error: any) {
      return NextResponse.json<IApiResponse>(
        {
          success: false,
          message: error.message || 'Failed to create team',
          data: null,
        },
        { status: 500 }
      );
    }
  });
}

