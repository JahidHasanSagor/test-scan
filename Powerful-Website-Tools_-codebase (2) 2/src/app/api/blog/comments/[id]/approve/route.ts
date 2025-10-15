import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { blogComments } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    const { id } = await params;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const commentId = parseInt(id);

    const existingComment = await db
      .select()
      .from(blogComments)
      .where(eq(blogComments.id, commentId))
      .limit(1);

    if (existingComment.length === 0) {
      return NextResponse.json(
        { error: 'Comment not found', code: 'COMMENT_NOT_FOUND' },
        { status: 404 }
      );
    }

    const comment = existingComment[0];

    if (comment.status !== 'pending') {
      return NextResponse.json(
        {
          error: `Comment is already ${comment.status}`,
          code: 'INVALID_STATUS',
        },
        { status: 400 }
      );
    }

    const updatedComment = await db
      .update(blogComments)
      .set({
        status: 'approved',
        updatedAt: new Date().toISOString(),
      })
      .where(eq(blogComments.id, commentId))
      .returning();

    if (updatedComment.length === 0) {
      return NextResponse.json(
        { error: 'Failed to approve comment', code: 'UPDATE_FAILED' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'Comment approved successfully',
        comment: updatedComment[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('PATCH error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}