import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth-middleware';
import { db } from '@/lib/supabase';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async (req) => {
    try {
      const { id: userId } = await params;
      const voterId = req.user?.id;

      if (!voterId) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Unauthorized'
          },
          { status: 401 }
        );
      }

      // Prevent self-voting
      if (userId === voterId) {
        return NextResponse.json(
          { 
            success: false,
            message: 'You cannot vote for yourself'
          },
          { status: 400 }
        );
      }

      // Check if user has already voted
      const { data: existingVote } = await db.checkVote(voterId, userId);
      
      if (existingVote) {
        return NextResponse.json(
          { 
            success: false,
            message: 'You have already voted for this user'
          },
          { status: 400 }
        );
      }

      // Get the user being voted for
      const { data: user, error: getUserError } = await db.getUser(userId);

      if (getUserError || !user) {
        return NextResponse.json(
          { 
            success: false,
            message: 'User not found'
          },
          { status: 404 }
        );
      }

      // Create the vote record
      const { error: voteError } = await db.createVote(voterId, userId);

      if (voteError) {
        return NextResponse.json(
          { 
            success: false,
            message: 'Failed to record vote'
          },
          { status: 500 }
        );
      }

      // Calculate new values
      const currentVoteCount = parseInt(user.vote_count) || 0;
      const currentScore = parseInt(user.score) || 0;
      const newVoteCount = currentVoteCount + 1;
      const newScore = currentScore + 5; // Each vote adds 5 points to the score

      // Update user's vote count and score
      const { data: updatedUser, error: updateError } = await db.updateUser(userId, {
        vote_count: newVoteCount.toString(),
        score: newScore.toString()
      });

      if (updateError || !updatedUser) {
        return NextResponse.json(
          { 
            success: false,
            message: 'Failed to update vote'
          },
          { status: 500 }
        );
      }

      // Remove password from response
      const { password: _, ...userWithoutPassword } = updatedUser as any;

      return NextResponse.json(
        { 
          success: true,
          message: 'Vote recorded successfully',
          data: userWithoutPassword
        },
        { status: 200 }
      );
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      console.error('Vote error:', errorMessage);
      return NextResponse.json(
        { 
          success: false,
          message: 'Internal server error'
        },
        { status: 500 }
      );
    }
  });
}

// Check if user has voted for another user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async (req) => {
    try {
      const { id: userId } = await params;
      const voterId = req.user?.id;

      if (!voterId) {
        return NextResponse.json(
          { 
            success: false,
            message: 'Unauthorized'
          },
          { status: 401 }
        );
      }

      const { data: existingVote } = await db.checkVote(voterId, userId);

      return NextResponse.json(
        { 
          success: true,
          data: {
            hasVoted: !!existingVote
          }
        },
        { status: 200 }
      );
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      console.error('Check vote error:', errorMessage);
      return NextResponse.json(
        { 
          success: false,
          message: 'Internal server error'
        },
        { status: 500 }
      );
    }
  });
}

