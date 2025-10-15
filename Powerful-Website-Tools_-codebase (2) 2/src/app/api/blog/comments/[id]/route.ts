import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { blogComments, blogPosts, user } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const comment = await db
      .select({
        id: blogComments.id,
        postId: blogComments.postId,
        userId: blogComments.userId,
        authorName: blogComments.authorName,
        authorEmail: blogComments.authorEmail,
        content: blogComments.content,
        status: blogComments.status,
        createdAt: blogComments.createdAt,
        updatedAt: blogComments.updatedAt,
        post: {
          id: blogPosts.id,
          title: blogPosts.title,
          slug: blogPosts.slug,
        },
        author: {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        },
      })
      .from(blogComments)
      .leftJoin(blogPosts, eq(blogComments.postId, blogPosts.id))
      .leftJoin(user, eq(blogComments.userId, user.id))
      .where(eq(blogComments.id, parseInt(id)))
      .limit(1);

    if (comment.length === 0) {
      return NextResponse.json(
        { error: 'Comment not found', code: 'COMMENT_NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json(comment[0], { status: 200 });
  } catch (error) {
    console.error('GET comment error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'AUTHENTICATION_REQUIRED' },
        { status: 401 }
      );
    }

    const id = params.id;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
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

    const { content, status } = body;

    // Validate content if provided
    if (content !== undefined) {
      if (typeof content !== 'string') {
        return NextResponse.json(
          { error: 'Content must be a string', code: 'INVALID_CONTENT_TYPE' },
          { status: 400 }
        );
      }

      const trimmedContent = content.trim();
      if (trimmedContent.length < 10) {
        return NextResponse.json(
          {
            error: 'Content must be at least 10 characters',
            code: 'CONTENT_TOO_SHORT',
          },
          { status: 400 }
        );
      }

      if (trimmedContent.length > 1000) {
        return NextResponse.json(
          {
            error: 'Content must not exceed 1000 characters',
            code: 'CONTENT_TOO_LONG',
          },
          { status: 400 }
        );
      }
    }

    // Validate status if provided
    if (status !== undefined) {
      const validStatuses = ['pending', 'approved', 'spam'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          {
            error: 'Status must be one of: pending, approved, spam',
            code: 'INVALID_STATUS',
          },
          { status: 400 }
        );
      }
    }

    // Check if comment exists
    const existingComment = await db
      .select()
      .from(blogComments)
      .where(eq(blogComments.id, parseInt(id)))
      .limit(1);

    if (existingComment.length === 0) {
      return NextResponse.json(
        { error: 'Comment not found', code: 'COMMENT_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Build update object
    const updates: {
      content?: string;
      status?: string;
      updatedAt: string;
    } = {
      updatedAt: new Date().toISOString(),
    };

    if (content !== undefined) {
      updates.content = content.trim();
    }

    if (status !== undefined) {
      updates.status = status;
    }

    const updated = await db
      .update(blogComments)
      .set(updates)
      .where(eq(blogComments.id, parseInt(id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { error: 'Failed to update comment', code: 'UPDATE_FAILED' },
        { status: 500 }
      );
    }

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('PUT comment error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'AUTHENTICATION_REQUIRED' },
        { status: 401 }
      );
    }

    const id = params.id;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if comment exists
    const existingComment = await db
      .select()
      .from(blogComments)
      .where(eq(blogComments.id, parseInt(id)))
      .limit(1);

    if (existingComment.length === 0) {
      return NextResponse.json(
        { error: 'Comment not found', code: 'COMMENT_NOT_FOUND' },
        { status: 404 }
      );
    }

    const deleted = await db
      .delete(blogComments)
      .where(eq(blogComments.id, parseInt(id)))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json(
        { error: 'Failed to delete comment', code: 'DELETE_FAILED' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'Comment deleted successfully',
        deletedComment: deleted[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE comment error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}