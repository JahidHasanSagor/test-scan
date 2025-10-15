import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { communityComments, communityCommentVotes } from '@/db/schema';
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
        { error: 'Authentication required', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    // Get and validate commentId from params
    const { id } = await params;
    const commentId = parseInt(id);
    if (!commentId || isNaN(commentId)) {
      return NextResponse.json(
        { error: 'Valid comment ID is required', code: 'INVALID_COMMENT_ID' },
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
          error: 'voteType must be either "upvote" or "downvote"',
          code: 'INVALID_VOTE_TYPE' 
        },
        { status: 400 }
      );
    }

    // Check if comment exists and is active
    const comment = await db
      .select()
      .from(communityComments)
      .where(eq(communityComments.id, parseInt(commentId)))
      .limit(1);

    if (comment.length === 0) {
      return NextResponse.json(
        { error: 'Comment not found', code: 'COMMENT_NOT_FOUND' },
        { status: 404 }
      );
    }

    if (comment[0].status !== 'active') {
      return NextResponse.json(
        { error: 'Comment not found', code: 'COMMENT_NOT_ACTIVE' },
        { status: 404 }
      );
    }

    // Check for existing vote
    const existingVote = await db
      .select()
      .from(communityCommentVotes)
      .where(
        and(
          eq(communityCommentVotes.commentId, parseInt(commentId)),
          eq(communityCommentVotes.userId, user.id)
        )
      )
      .limit(1);

    let action: 'vote_added' | 'vote_removed' | 'vote_changed';
    let updatedComment;

    if (existingVote.length === 0) {
      // Case 1: NO existing vote - Add new vote
      await db.insert(communityCommentVotes).values({
        commentId: parseInt(commentId),
        userId: user.id,
        voteType,
        createdAt: new Date().toISOString(),
      });

      // Increment appropriate vote count
      if (voteType === 'upvote') {
        updatedComment = await db
          .update(communityComments)
          .set({
            upvotes: comment[0].upvotes + 1,
            updatedAt: new Date().toISOString(),
          })
          .where(eq(communityComments.id, parseInt(commentId)))
          .returning();
      } else {
        updatedComment = await db
          .update(communityComments)
          .set({
            downvotes: comment[0].downvotes + 1,
            updatedAt: new Date().toISOString(),
          })
          .where(eq(communityComments.id, parseInt(commentId)))
          .returning();
      }

      action = 'vote_added';
    } else if (existingVote[0].voteType === voteType) {
      // Case 2: Existing vote SAME as new vote - Remove vote (toggle off)
      await db
        .delete(communityCommentVotes)
        .where(
          and(
            eq(communityCommentVotes.commentId, parseInt(commentId)),
            eq(communityCommentVotes.userId, user.id)
          )
        );

      // Decrement appropriate vote count
      if (voteType === 'upvote') {
        updatedComment = await db
          .update(communityComments)
          .set({
            upvotes: Math.max(0, comment[0].upvotes - 1),
            updatedAt: new Date().toISOString(),
          })
          .where(eq(communityComments.id, parseInt(commentId)))
          .returning();
      } else {
        updatedComment = await db
          .update(communityComments)
          .set({
            downvotes: Math.max(0, comment[0].downvotes - 1),
            updatedAt: new Date().toISOString(),
          })
          .where(eq(communityComments.id, parseInt(commentId)))
          .returning();
      }

      action = 'vote_removed';
    } else {
      // Case 3: Existing vote DIFFERENT from new vote - Change vote
      await db
        .update(communityCommentVotes)
        .set({
          voteType,
          createdAt: new Date().toISOString(),
        })
        .where(
          and(
            eq(communityCommentVotes.commentId, parseInt(commentId)),
            eq(communityCommentVotes.userId, user.id)
          )
        );

      // Update vote counts: decrement old, increment new
      if (voteType === 'upvote') {
        // New vote is upvote, old was downvote
        updatedComment = await db
          .update(communityComments)
          .set({
            upvotes: comment[0].upvotes + 1,
            downvotes: Math.max(0, comment[0].downvotes - 1),
            updatedAt: new Date().toISOString(),
          })
          .where(eq(communityComments.id, parseInt(commentId)))
          .returning();
      } else {
        // New vote is downvote, old was upvote
        updatedComment = await db
          .update(communityComments)
          .set({
            upvotes: Math.max(0, comment[0].upvotes - 1),
            downvotes: comment[0].downvotes + 1,
            updatedAt: new Date().toISOString(),
          })
          .where(eq(communityComments.id, parseInt(commentId)))
          .returning();
      }

      action = 'vote_changed';
    }

    // Get current user vote status for response
    const currentVote = await db
      .select()
      .from(communityCommentVotes)
      .where(
        and(
          eq(communityCommentVotes.commentId, parseInt(commentId)),
          eq(communityCommentVotes.userId, user.id)
        )
      )
      .limit(1);

    const userVote = currentVote.length > 0 ? currentVote[0].voteType : null;

    return NextResponse.json({
      comment: updatedComment[0],
      userVote,
      action,
    });
  } catch (error) {
    console.error('POST comment vote error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}