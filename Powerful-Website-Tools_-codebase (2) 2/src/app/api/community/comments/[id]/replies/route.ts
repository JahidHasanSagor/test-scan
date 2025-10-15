import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { communityComments, communityThreads, user } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const commentId = parseInt(id);

    if (!commentId || isNaN(commentId)) {
      return NextResponse.json(
        { error: 'Valid comment ID is required', code: 'INVALID_COMMENT_ID' },
        { status: 400 }
      );
    }

    const body = await request.json();

    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json(
        {
          error: 'User ID cannot be provided in request body',
          code: 'USER_ID_NOT_ALLOWED',
        },
        { status: 400 }
      );
    }

    const { content } = body;

    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Content is required and must be a string', code: 'CONTENT_REQUIRED' },
        { status: 400 }
      );
    }

    const trimmedContent = content.trim();

    if (trimmedContent.length < 1) {
      return NextResponse.json(
        { error: 'Content must be at least 1 character', code: 'CONTENT_TOO_SHORT' },
        { status: 400 }
      );
    }

    if (trimmedContent.length > 2000) {
      return NextResponse.json(
        { error: 'Content must not exceed 2000 characters', code: 'CONTENT_TOO_LONG' },
        { status: 400 }
      );
    }

    const parentComment = await db
      .select()
      .from(communityComments)
      .where(eq(communityComments.id, parseInt(commentId)))
      .limit(1);

    if (parentComment.length === 0) {
      return NextResponse.json(
        { error: 'Parent comment not found', code: 'PARENT_COMMENT_NOT_FOUND' },
        { status: 404 }
      );
    }

    if (parentComment[0].status !== 'active') {
      return NextResponse.json(
        { error: 'Parent comment is not active', code: 'PARENT_COMMENT_NOT_ACTIVE' },
        { status: 404 }
      );
    }

    const threadId = parentComment[0].threadId;

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

    const now = new Date().toISOString();

    const newReply = await db
      .insert(communityComments)
      .values({
        threadId: threadId,
        parentCommentId: parseInt(commentId),
        userId: currentUser.id,
        content: trimmedContent,
        upvotes: 0,
        downvotes: 0,
        replyCount: 0,
        status: 'active',
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    await db
      .update(communityComments)
      .set({
        replyCount: parentComment[0].replyCount + 1,
        updatedAt: now,
      })
      .where(eq(communityComments.id, parseInt(commentId)));

    await db
      .update(communityThreads)
      .set({
        commentCount: thread[0].commentCount + 1,
        updatedAt: now,
      })
      .where(eq(communityThreads.id, threadId));

    const authorInfo = await db
      .select({
        id: user.id,
        name: user.name,
        image: user.image,
        role: user.role,
      })
      .from(user)
      .where(eq(user.id, currentUser.id))
      .limit(1);

    const replyWithAuthor = {
      ...newReply[0],
      author: authorInfo[0],
    };

    return NextResponse.json(replyWithAuthor, { status: 201 });
  } catch (error) {
    console.error('POST reply error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}