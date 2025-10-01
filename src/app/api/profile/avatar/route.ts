import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/supabase';
import { withAuth } from '@/lib/auth-middleware';

export async function POST(req: NextRequest) {
    return withAuth(req, async (req) => {
        try {

            const userId = req.user?.id;
            const formData = await req.formData();
            const file = formData.get('avatar') as File;

            if (!file) {
                return NextResponse.json(
                    { success: false, message: 'No file provided' },
                    { status: 400 }
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

            // Validate file size (5MB max)
            const maxSize = 5 * 1024 * 1024; // 5MB
            if (file.size > maxSize) {
                return NextResponse.json(
                    { success: false, message: 'File size exceeds 5MB limit' },
                    { status: 400 }
                );
            }

            // Generate unique filename
            const fileExt = file.name.split('.').pop();
            const fileName = `${userId}-${Date.now()}.${fileExt}`;
            const filePath = `avatars/${fileName}`;

            // Upload to Supabase storage
            const { data: uploadData, error: uploadError } = await storage.uploadFile(
                'user-assets',
                filePath,
                file
            );

            if (uploadError) {
            return NextResponse.json(
                { success: false, message: uploadError.message || 'Failed to upload avatar' },
                { status: 400 }
            );
            }

            // Get public URL
            const { data: publicUrlData } = storage.getPublicUrl('user-assets', filePath);

            return NextResponse.json({
                success: true,
                data: { 
                    avatar_url: publicUrlData.publicUrl,
                    path: filePath
                },
                message: 'Avatar uploaded successfully',
            });
        } catch (error: any) {
            return NextResponse.json(
                { success: false, message: error.message || 'Failed to upload avatar' },
                { status: 500 }
            );
        }
    });
}