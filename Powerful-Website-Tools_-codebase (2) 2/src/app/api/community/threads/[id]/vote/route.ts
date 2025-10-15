import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { communityThreads, communityThreadVotes } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authentication check
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Validate thread ID
    const { id } = await params;
    const threadId = parseInt(id);
    if (!threadId || isNaN(threadId)) {
      return NextResponse.json(
        { error: 'Valid thread ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const { voteType } = body;

    // Validate voteType
    if (!voteType || (voteType !== 'upvote' && voteType !== 'downvote')) {
      return NextResponse.json(
        { 
          error: 'Valid voteType is required (upvote or downvote)', 
          code: 'INVALID_VOTE_TYPE' 
        },
        { status: 400 }
      );
    }

    // Check if thread exists and is active
    const thread = await db
      .select()
      .from(communityThreads)
      .where(eq(communityThreads.id, threadId))
      .limit(1);

    if (thread.length === 0) {
      return NextResponse.json(
        { error: 'Thread not found', code: 'THREAD_NOT_FOUND' },
        { status: 404 }
      );
    }

    if (thread[0].status !== 'active') {
      return NextResponse.json(
        { error: 'Thread is not active', code: 'THREAD_NOT_ACTIVE' },
        { status: 404 }
      );
    }

    // Check for existing vote
    const existingVote = await db
      .select()
      .from(communityThreadVotes)
      .where(
        and(
          eq(communityThreadVotes.threadId, threadId),
          eq(communityThreadVotes.userId, user.id)
        )
      )
      .limit(1);

    let action: string;
    let updatedThread;
    let userVote: string | null;

    if (existingVote.length === 0) {
      // NO EXISTING VOTE - Add new vote
      await db.insert(communityThreadVotes).values({
        threadId,
        userId: user.id,
        voteType,
        createdAt: new Date().toISOString(),
      });

      // Increment appropriate vote count
      if (voteType === 'upvote') {
        updatedThread = await db
          .update(communityThreads)
          .set({
            upvotes: thread[0].upvotes + 1,
            updatedAt: new Date().toISOString(),
          })
          .where(eq(communityThreads.id, threadId))
          .returning();
      } else {
        updatedThread = await db
          .update(communityThreads)
          .set({
            downvotes: thread[0].downvotes + 1,
            updatedAt: new Date().toISOString(),
          })
          .where(eq(communityThreads.id, threadId))
          .returning();
      }

      action = 'vote_added';
      userVote = voteType;
    } else if (existingVote[0].voteType === voteType) {
      // SAME VOTE - Remove vote
      await db
        .delete(communityThreadVotes)
        .where(
          and(
            eq(communityThreadVotes.threadId, threadId),
            eq(communityThreadVotes.userId, user.id)
          )
        );

      // Decrement appropriate vote count
      if (voteType === 'upvote') {
        updatedThread = await db
          .update(communityThreads)
          .set({
            upvotes: Math.max(0, thread[0].upvotes - 1),
            updatedAt: new Date().toISOString(),
          })
          .where(eq(communityThreads.id, threadId))
          .returning();
      } else {
        updatedThread = await db
          .update(communityThreads)
          .set({
            downvotes: Math.max(0, thread[0].downvotes - 1),
            updatedAt: new Date().toISOString(),
          })
          .where(eq(communityThreads.id, threadId))
          .returning();
      }

      action = 'vote_removed';
      userVote = null;
    } else {
      // DIFFERENT VOTE - Change vote
      await db
        .update(communityThreadVotes)
        .set({
          voteType,
        })
        .where(
          and(
            eq(communityThreadVotes.threadId, threadId),
            eq(communityThreadVotes.userId, user.id)
          )
        );

      // Update vote counts: decrement old, increment new
      const oldVoteType = existingVote[0].voteType;
      if (oldVoteType === 'upvote' && voteType === 'downvote') {
        updatedThread = await db
          .update(communityThreads)
          .set({
            upvotes: Math.max(0, thread[0].upvotes - 1),
            downvotes: thread[0].downvotes + 1,
            updatedAt: new Date().toISOString(),
          })
          .where(eq(communityThreads.id, threadId))
          .returning();
      } else {
        updatedThread = await db
          .update(communityThreads)
          .set({
            downvotes: Math.max(0, thread[0].downvotes - 1),
            upvotes: thread[0].upvotes + 1,
            updatedAt: new Date().toISOString(),
          })
          .where(eq(communityThreads.id, threadId))
          .returning();
      }

      action = 'vote_changed';
      userVote = voteType;
    }

    return NextResponse.json({
      action,
      thread: updatedThread[0],
      userVote,
    });
  } catch (error) {
    console.error('POST vote error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}