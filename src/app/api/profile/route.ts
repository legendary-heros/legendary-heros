import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth-middleware';
import { db } from '@/lib/supabase';
import { hashPassword } from '@/lib/password';

export async function PUT(req: NextRequest) {
    return withAuth(req, async (req) => {
        try {
            const userId: string = req.user?.id as string;
            const body = await req.json();

            // Extract updatable fields
            const { username, email, slackname, dotaname, bio, password, avatar_url } = body;

            // Build update object
            const updateData: any = {};
            
            if (username) updateData.username = username;
            if (email) updateData.email = email;
            if (slackname !== undefined) updateData.slackname = slackname;
            if (dotaname !== undefined) updateData.dotaname = dotaname;
            if (bio !== undefined) updateData.bio = bio;
            if (avatar_url !== undefined) updateData.avatar_url = avatar_url;
            
            // Hash new password if provided
            if (password) {
                const hashedPassword = await hashPassword(password);
                updateData.password = hashedPassword;
            }

            // Update user in database
            const { data: updatedUser, error } = await db.updateUser(userId, updateData);

            if (error) {
                return NextResponse.json(
                    { success: false, message: error.message || 'Failed to update profile' },
                    { status: 400 }
                );
            }

            // Remove password from response
            if (updatedUser) {
                const { password: _, ...userWithoutPassword } = updatedUser;
                
                return NextResponse.json({
                    success: true,
                    data: { user: userWithoutPassword },
                    error: null,
                });
            }

            return NextResponse.json(
                { success: false, message: 'User not found' },
                { status: 404 }
            );
        } catch (error: any) {
            return NextResponse.json(
                { success: false, message: error.message || 'Internal server error' },
                { status: 500 }
            );
        }
    });
}
