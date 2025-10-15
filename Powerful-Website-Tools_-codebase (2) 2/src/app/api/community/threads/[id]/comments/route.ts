import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { communityThreads, communityComments, user } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authentication check
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    // Get threadId from params
    const { id: threadIdParam } = await params;
    const threadId = parseInt(threadIdParam);

    // Validate thread ID
    if (!threadId || isNaN(threadId)) {
      return NextResponse.json(
        { error: 'Valid thread ID is required', code: 'INVALID_THREAD_ID' },
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

    // Parse and validate request body
    const body = await request.json();

    // Security check: reject if userId provided in body
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

    // Validate content field
    if (!content) {
      return NextResponse.json(
        { error: 'Content is required', code: 'CONTENT_REQUIRED' },
        { status: 400 }
      );
    }

    if (typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Content must be a string', code: 'INVALID_CONTENT_TYPE' },
        { status: 400 }
      );
    }

    const trimmedContent = content.trim();

    if (trimmedContent.length < 1) {
      return NextResponse.json(
        {
          error: 'Content must be at least 1 character long',
          code: 'CONTENT_TOO_SHORT',
        },
        { status: 400 }
      );
    }

    if (trimmedContent.length > 2000) {
      return NextResponse.json(
        {
          error: 'Content must not exceed 2000 characters',
          code: 'CONTENT_TOO_LONG',
        },
        { status: 400 }
      );
    }

    // Create comment
    const now = new Date().toISOString();
    const newComment = await db
      .insert(communityComments)
      .values({
        threadId,
        userId: currentUser.id,
        content: trimmedContent,
        parentCommentId: null,
        upvotes: 0,
        downvotes: 0,
        replyCount: 0,
        status: 'active',
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    // Increment thread comment count
    await db
      .update(communityThreads)
      .set({
        commentCount: thread[0].commentCount + 1,
        updatedAt: now,
      })
      .where(eq(communityThreads.id, threadId));

    // Get author info
    const author = await db
      .select({
        id: user.id,
        name: user.name,
        image: user.image,
        role: user.role,
      })
      .from(user)
      .where(eq(user.id, currentUser.id))
      .limit(1);

    // Return created comment with author info
    const commentWithAuthor = {
      ...newComment[0],
      author: author[0],
    };

    return NextResponse.json(commentWithAuthor, { status: 201 });
  } catch (error) {
    console.error('POST comment error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}