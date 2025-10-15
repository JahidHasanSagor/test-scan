import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { communityComments, communityCommentVotes, communityThreads, user } from '@/db/schema';
import { eq, and, desc, isNull } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const commentId = parseInt(id);
    
    if (!commentId || isNaN(commentId)) {
      return NextResponse.json({ 
        error: "Valid comment ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Get current user for vote status (optional)
    let currentUser = null;
    try {
      currentUser = await getCurrentUser(request);
    } catch (error) {
      // User not authenticated, continue without user context
    }

    // Get the comment with author info
    const commentResult = await db.select({
      id: communityComments.id,
      threadId: communityComments.threadId,
      parentCommentId: communityComments.parentCommentId,
      userId: communityComments.userId,
      content: communityComments.content,
      upvotes: communityComments.upvotes,
      downvotes: communityComments.downvotes,
      replyCount: communityComments.replyCount,
      status: communityComments.status,
      createdAt: communityComments.createdAt,
      updatedAt: communityComments.updatedAt,
      authorName: user.name,
      authorImage: user.image,
      authorRole: user.role,
    })
      .from(communityComments)
      .leftJoin(user, eq(communityComments.userId, user.id))
      .where(and(
        eq(communityComments.id, commentId),
        eq(communityComments.status, 'active')
      ))
      .limit(1);

    if (commentResult.length === 0) {
      return NextResponse.json({ 
        error: 'Comment not found',
        code: 'COMMENT_NOT_FOUND' 
      }, { status: 404 });
    }

    const comment = commentResult[0];

    // Get user's vote on this comment if authenticated
    let userVote = null;
    if (currentUser) {
      const voteResult = await db.select()
        .from(communityCommentVotes)
        .where(and(
          eq(communityCommentVotes.commentId, commentId),
          eq(communityCommentVotes.userId, currentUser.id)
        ))
        .limit(1);

      if (voteResult.length > 0) {
        userVote = voteResult[0].voteType;
      }
    }

    // Get all replies to this comment
    const repliesResult = await db.select({
      id: communityComments.id,
      threadId: communityComments.threadId,
      parentCommentId: communityComments.parentCommentId,
      userId: communityComments.userId,
      content: communityComments.content,
      upvotes: communityComments.upvotes,
      downvotes: communityComments.downvotes,
      replyCount: communityComments.replyCount,
      status: communityComments.status,
      createdAt: communityComments.createdAt,
      updatedAt: communityComments.updatedAt,
      authorName: user.name,
      authorImage: user.image,
      authorRole: user.role,
    })
      .from(communityComments)
      .leftJoin(user, eq(communityComments.userId, user.id))
      .where(and(
        eq(communityComments.parentCommentId, commentId),
        eq(communityComments.status, 'active')
      ))
      .orderBy(desc(communityComments.upvotes));

    // Get user votes for all replies if authenticated
    const repliesWithVotes = await Promise.all(
      repliesResult.map(async (reply) => {
        let replyUserVote = null;
        if (currentUser) {
          const voteResult = await db.select()
            .from(communityCommentVotes)
            .where(and(
              eq(communityCommentVotes.commentId, reply.id),
              eq(communityCommentVotes.userId, currentUser.id)
            ))
            .limit(1);

          if (voteResult.length > 0) {
            replyUserVote = voteResult[0].voteType;
          }
        }

        return {
          ...reply,
          userVote: replyUserVote,
        };
      })
    );

    // Sort replies by net score (upvotes - downvotes)
    repliesWithVotes.sort((a, b) => {
      const scoreA = (a.upvotes || 0) - (a.downvotes || 0);
      const scoreB = (b.upvotes || 0) - (b.downvotes || 0);
      return scoreB - scoreA;
    });

    return NextResponse.json({
      ...comment,
      userVote,
      replies: repliesWithVotes,
    }, { status: 200 });

  } catch (error) {
    console.error('GET comment error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getCurrentUser(request);
    if (!authUser) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'AUTHENTICATION_REQUIRED' 
      }, { status: 401 });
    }

    const { id } = await params;
    const commentId = parseInt(id);
    
    if (!commentId || isNaN(commentId)) {
      return NextResponse.json({ 
        error: "Valid comment ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const body = await request.json();

    // Security check: reject if userId provided in body
    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json({ 
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    const { content } = body;

    // Validate content
    if (!content || typeof content !== 'string') {
      return NextResponse.json({ 
        error: "Content is required",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    const trimmedContent = content.trim();

    if (trimmedContent.length === 0) {
      return NextResponse.json({ 
        error: "Content cannot be empty",
        code: "INVALID_CONTENT" 
      }, { status: 400 });
    }

    if (trimmedContent.length > 2000) {
      return NextResponse.json({ 
        error: "Content cannot exceed 2000 characters",
        code: "CONTENT_TOO_LONG" 
      }, { status: 400 });
    }

    // Get the comment
    const commentResult = await db.select()
      .from(communityComments)
      .where(eq(communityComments.id, commentId))
      .limit(1);

    if (commentResult.length === 0) {
      return NextResponse.json({ 
        error: 'Comment not found',
        code: 'COMMENT_NOT_FOUND' 
      }, { status: 404 });
    }

    const comment = commentResult[0];

    // Check authorization: user must be author OR admin
    if (comment.userId !== authUser.id && authUser.role !== 'admin') {
      return NextResponse.json({ 
        error: 'You are not authorized to update this comment',
        code: 'UNAUTHORIZED' 
      }, { status: 403 });
    }

    // Update the comment
    const updated = await db.update(communityComments)
      .set({
        content: trimmedContent,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(communityComments.id, commentId))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ 
        error: 'Failed to update comment',
        code: 'UPDATE_FAILED' 
      }, { status: 500 });
    }

    // Get updated comment with author info
    const updatedCommentResult = await db.select({
      id: communityComments.id,
      threadId: communityComments.threadId,
      parentCommentId: communityComments.parentCommentId,
      userId: communityComments.userId,
      content: communityComments.content,
      upvotes: communityComments.upvotes,
      downvotes: communityComments.downvotes,
      replyCount: communityComments.replyCount,
      status: communityComments.status,
      createdAt: communityComments.createdAt,
      updatedAt: communityComments.updatedAt,
      authorName: user.name,
      authorImage: user.image,
      authorRole: user.role,
    })
      .from(communityComments)
      .leftJoin(user, eq(communityComments.userId, user.id))
      .where(eq(communityComments.id, commentId))
      .limit(1);

    return NextResponse.json(updatedCommentResult[0], { status: 200 });

  } catch (error) {
    console.error('PUT comment error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getCurrentUser(request);
    if (!authUser) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'AUTHENTICATION_REQUIRED' 
      }, { status: 401 });
    }

    const { id } = await params;
    const commentId = parseInt(id);
    
    if (!commentId || isNaN(commentId)) {
      return NextResponse.json({ 
        error: "Valid comment ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Get the comment
    const commentResult = await db.select()
      .from(communityComments)
      .where(eq(communityComments.id, commentId))
      .limit(1);

    if (commentResult.length === 0) {
      return NextResponse.json({ 
        error: 'Comment not found',
        code: 'COMMENT_NOT_FOUND' 
      }, { status: 404 });
    }

    const comment = commentResult[0];

    // Check authorization: user must be author OR admin
    if (comment.userId !== authUser.id && authUser.role !== 'admin') {
      return NextResponse.json({ 
        error: 'You are not authorized to delete this comment',
        code: 'UNAUTHORIZED' 
      }, { status: 403 });
    }

    // Soft delete the comment
    const deleted = await db.update(communityComments)
      .set({
        status: 'deleted',
        updatedAt: new Date().toISOString(),
      })
      .where(eq(communityComments.id, commentId))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ 
        error: 'Failed to delete comment',
        code: 'DELETE_FAILED' 
      }, { status: 500 });
    }

    // If comment is a reply (has parentCommentId), decrement parent's replyCount
    if (comment.parentCommentId) {
      await db.update(communityComments)
        .set({
          replyCount: comment.replyCount > 0 ? comment.replyCount - 1 : 0,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(communityComments.id, comment.parentCommentId));
    }

    // If comment is top-level (parentCommentId is null), decrement thread's commentCount
    if (!comment.parentCommentId) {
      const threadResult = await db.select()
        .from(communityThreads)
        .where(eq(communityThreads.id, comment.threadId))
        .limit(1);

      if (threadResult.length > 0) {
        const thread = threadResult[0];
        await db.update(communityThreads)
          .set({
            commentCount: thread.commentCount > 0 ? thread.commentCount - 1 : 0,
            updatedAt: new Date().toISOString(),
          })
          .where(eq(communityThreads.id, comment.threadId));
      }
    }

    return NextResponse.json({
      message: 'Comment deleted successfully',
      commentId: commentId,
    }, { status: 200 });

  } catch (error) {
    console.error('DELETE comment error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}