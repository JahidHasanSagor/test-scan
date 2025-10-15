import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { communityThreadVotes, communityCommentVotes } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'AUTHENTICATION_REQUIRED' 
      }, { status: 401 });
    }

    // Query all thread votes for the current user
    const threadVotes = await db.select()
      .from(communityThreadVotes)
      .where(eq(communityThreadVotes.userId, user.id))
      .orderBy(desc(communityThreadVotes.createdAt));

    // Query all comment votes for the current user
    const commentVotes = await db.select()
      .from(communityCommentVotes)
      .where(eq(communityCommentVotes.userId, user.id))
      .orderBy(desc(communityCommentVotes.createdAt));

    // Calculate summary counts
    const totalThreadVotes = threadVotes.length;
    const totalCommentVotes = commentVotes.length;
    const totalVotes = totalThreadVotes + totalCommentVotes;

    // Return combined response
    return NextResponse.json({
      threadVotes,
      commentVotes,
      summary: {
        totalThreadVotes,
        totalCommentVotes,
        totalVotes
      }
    }, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}