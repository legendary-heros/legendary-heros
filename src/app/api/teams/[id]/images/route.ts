import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/supabase';
import { withAuth } from '@/lib/auth-middleware';
import { db } from '@/lib/supabase';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    return withAuth(req, async (req) => {
        try {
            const { id: teamId } = await params;
            const userId = req.user?.id;
            const formData = await req.formData();
            const file = formData.get('image') as File;
            const imageType = formData.get('type') as string; // 'mark' or 'ad'

            if (!file) {
                return NextResponse.json(
                    { success: false, message: 'No file provided' },
                    { status: 400 }
                );
            }

            if (!imageType || !['mark', 'ad'].includes(imageType)) {
                return NextResponse.json(
                    { success: false, message: 'Invalid image type. Must be "mark" or "ad"' },
                    { status: 400 }
                );
            }

            // Check if user is the team leader
            const { data: team, error: teamError } = await db.getTeam(teamId);
            if (teamError || !team) {
                return NextResponse.json(
                    { success: false, message: 'Team not found' },
                    { status: 404 }
                );
            }

            if ((team as any).leader_id !== userId) {
                return NextResponse.json(
                    { success: false, message: 'Only team leader can upload images' },
                    { status: 403 }
                );
            }

            // Validate file type
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                return NextResponse.json(
                    { success: false, message: 'Invalid file type. Only images are allowed.' },
                    { status: 400 }
                );
            }

            // Validate file size (1MB max for team images)
            const maxSize = 1 * 1024 * 1024; // 1MB
            if (file.size > maxSize) {
                return NextResponse.json(
                    { success: false, message: 'File size exceeds 1MB limit' },
                    { status: 400 }
                );
            }

            // Generate unique filename
            const fileExt = file.name.split('.').pop();
            const fileName = `team-${teamId}-${imageType}-${Date.now()}.${fileExt}`;
            const filePath = fileName; // Store directly in bucket root

            // Upload to Supabase storage using team-images bucket
            const { data: uploadData, error: uploadError } = await storage.uploadFile(
                'team-images',
                filePath,
                file
            );

            if (uploadError) {
                return NextResponse.json(
                    { success: false, message: uploadError.message || 'Failed to upload image' },
                    { status: 400 }
                );
            }

            // Get public URL
            const { data: publicUrlData } = storage.getPublicUrl('team-images', filePath);

            // Update team with new image URL
            const updateData = imageType === 'mark' 
                ? { mark_url: publicUrlData.publicUrl }
                : { ad_url: publicUrlData.publicUrl };

            const { data: updatedTeam, error: updateError } = await db.updateTeam(teamId, updateData);

            if (updateError) {
                return NextResponse.json(
                    { success: false, message: 'Failed to update team with image URL' },
                    { status: 500 }
                );
            }

            return NextResponse.json({
                success: true,
                data: { 
                    [`${imageType}_url`]: publicUrlData.publicUrl,
                    path: filePath,
                    team: updatedTeam
                },
                message: `${imageType === 'mark' ? 'Team mark' : 'Team ad'} uploaded successfully`,
            });
        } catch (error: any) {
            return NextResponse.json(
                { success: false, message: error.message || 'Failed to upload image' },
                { status: 500 }
            );
        }
    });
}
