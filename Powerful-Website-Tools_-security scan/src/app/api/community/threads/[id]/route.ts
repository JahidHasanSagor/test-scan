import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { communityThreads, communityComments, communityThreadVotes, communityCommentVotes, user } from '@/db/schema';
import { eq, and, isNull, desc } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

interface Comment {
  id: number;
  threadId: number;
  parentCommentId: number | null;
  userId: string;
  content: string;
  upvotes: number;
  downvotes: number;
  replyCount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  author: {
    name: string;
    image: string | null;
    role: string;
  };
  userVote: 'upvote' | 'downvote' | null;
  replies: Comment[];
}

async function loadCommentReplies(
  commentId: number,
  threadId: number,
  authenticatedUserId: string | null
): Promise<Comment[]> {
  const replies = await db
    .select({
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
    .where(
      and(
        eq(communityComments.parentCommentId, commentId),
        eq(communityComments.status, 'active')
      )
    )
    .orderBy(desc(communityComments.upvotes));

  const repliesWithVotes = await Promise.all(
    replies.map(async (reply) => {
      let userVote: 'upvote' | 'downvote' | null = null;
      
      if (authenticatedUserId) {
        const vote = await db
          .select()
          .from(communityCommentVotes)
          .where(
            and(
              eq(communityCommentVotes.commentId, reply.id),
              eq(communityCommentVotes.userId, authenticatedUserId)
            )
          )
          .limit(1);

        if (vote.length > 0) {
          userVote = vote[0].voteType as 'upvote' | 'downvote';
        }
      }

      const nestedReplies = await loadCommentReplies(reply.id, threadId, authenticatedUserId);

      return {
        id: reply.id,
        threadId: reply.threadId,
        parentCommentId: reply.parentCommentId,
        userId: reply.userId,
        content: reply.content,
        upvotes: reply.upvotes,
        downvotes: reply.downvotes,
        replyCount: reply.replyCount,
        status: reply.status,
        createdAt: reply.createdAt,
        updatedAt: reply.updatedAt,
        author: {
          name: reply.authorName || 'Unknown',
          image: reply.authorImage,
          role: reply.authorRole || 'user',
        },
        userVote,
        replies: nestedReplies,
      };
    })
  );

  return repliesWithVotes;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid thread ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const threadId = parseInt(id);
    let authenticatedUserId: string | null = null;

    try {
      const authenticatedUser = await getCurrentUser(request);
      if (authenticatedUser) {
        authenticatedUserId = authenticatedUser.id;
      }
    } catch {
      // User not authenticated, continue without auth
    }

    const thread = await db
      .select({
        id: communityThreads.id,
        userId: communityThreads.userId,
        title: communityThreads.title,
        content: communityThreads.content,
        category: communityThreads.category,
        upvotes: communityThreads.upvotes,
        downvotes: communityThreads.downvotes,
        commentCount: communityThreads.commentCount,
        isPinned: communityThreads.isPinned,
        status: communityThreads.status,
        createdAt: communityThreads.createdAt,
        updatedAt: communityThreads.updatedAt,
        authorName: user.name,
        authorImage: user.image,
        authorRole: user.role,
      })
      .from(communityThreads)
      .leftJoin(user, eq(communityThreads.userId, user.id))
      .where(eq(communityThreads.id, threadId))
      .limit(1);

    if (thread.length === 0 || thread[0].status !== 'active') {
      return NextResponse.json(
        { error: 'Thread not found', code: 'THREAD_NOT_FOUND' },
        { status: 404 }
      );
    }

    const threadData = thread[0];
    let userVote: 'upvote' | 'downvote' | null = null;

    if (authenticatedUserId) {
      const vote = await db
        .select()
        .from(communityThreadVotes)
        .where(
          and(
            eq(communityThreadVotes.threadId, threadId),
            eq(communityThreadVotes.userId, authenticatedUserId)
          )
        )
        .limit(1);

      if (vote.length > 0) {
        userVote = vote[0].voteType as 'upvote' | 'downvote';
      }
    }

    const topLevelComments = await db
      .select({
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
      .where(
        and(
          eq(communityComments.threadId, threadId),
          isNull(communityComments.parentCommentId),
          eq(communityComments.status, 'active')
        )
      )
      .orderBy(desc(communityComments.upvotes));

    const commentsWithVotesAndReplies = await Promise.all(
      topLevelComments.map(async (comment) => {
        let commentUserVote: 'upvote' | 'downvote' | null = null;
        
        if (authenticatedUserId) {
          const vote = await db
            .select()
            .from(communityCommentVotes)
            .where(
              and(
                eq(communityCommentVotes.commentId, comment.id),
                eq(communityCommentVotes.userId, authenticatedUserId)
              )
            )
            .limit(1);

          if (vote.length > 0) {
            commentUserVote = vote[0].voteType as 'upvote' | 'downvote';
          }
        }

        const replies = await loadCommentReplies(comment.id, threadId, authenticatedUserId);

        return {
          id: comment.id,
          threadId: comment.threadId,
          parentCommentId: comment.parentCommentId,
          userId: comment.userId,
          content: comment.content,
          upvotes: comment.upvotes,
          downvotes: comment.downvotes,
          replyCount: comment.replyCount,
          status: comment.status,
          createdAt: comment.createdAt,
          updatedAt: comment.updatedAt,
          author: {
            name: comment.authorName || 'Unknown',
            image: comment.authorImage,
            role: comment.authorRole || 'user',
          },
          userVote: commentUserVote,
          replies,
        };
      })
    );

    return NextResponse.json({
      id: threadData.id,
      userId: threadData.userId,
      title: threadData.title,
      content: threadData.content,
      category: threadData.category,
      upvotes: threadData.upvotes,
      downvotes: threadData.downvotes,
      commentCount: threadData.commentCount,
      isPinned: threadData.isPinned,
      status: threadData.status,
      createdAt: threadData.createdAt,
      updatedAt: threadData.updatedAt,
      author: {
        name: threadData.authorName || 'Unknown',
        image: threadData.authorImage,
        role: threadData.authorRole || 'user',
      },
      userVote,
      comments: commentsWithVotesAndReplies,
    });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authenticatedUser = await getCurrentUser(request);
    if (!authenticatedUser) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid thread ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const threadId = parseInt(id);

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

    const isOwner = thread[0].userId === authenticatedUser.id;
    const isAdmin = authenticatedUser.role === 'admin';

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'Not authorized to update this thread', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, content, category } = body;

    const updates: { title?: string; content?: string; category?: string; updatedAt: string } = {
      updatedAt: new Date().toISOString(),
    };

    if (title !== undefined) {
      if (!title.trim()) {
        return NextResponse.json(
          { error: 'Title cannot be empty', code: 'INVALID_TITLE' },
          { status: 400 }
        );
      }
      updates.title = title.trim();
    }

    if (content !== undefined) {
      if (!content.trim()) {
        return NextResponse.json(
          { error: 'Content cannot be empty', code: 'INVALID_CONTENT' },
          { status: 400 }
        );
      }
      updates.content = content.trim();
    }

    if (category !== undefined) {
      updates.category = category.trim();
    }

    const updated = await db
      .update(communityThreads)
      .set(updates)
      .where(eq(communityThreads.id, threadId))
      .returning();

    const authorInfo = await db
      .select({
        name: user.name,
        image: user.image,
        role: user.role,
      })
      .from(user)
      .where(eq(user.id, updated[0].userId))
      .limit(1);

    return NextResponse.json({
      ...updated[0],
      author: authorInfo.length > 0 ? authorInfo[0] : { name: 'Unknown', image: null, role: 'user' },
    });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authenticatedUser = await getCurrentUser(request);
    if (!authenticatedUser) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid thread ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const threadId = parseInt(id);

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

    const isOwner = thread[0].userId === authenticatedUser.id;
    const isAdmin = authenticatedUser.role === 'admin';

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'Not authorized to delete this thread', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    const deleted = await db
      .update(communityThreads)
      .set({
        status: 'deleted',
        updatedAt: new Date().toISOString(),
      })
      .where(eq(communityThreads.id, threadId))
      .returning();

    return NextResponse.json({
      message: 'Thread deleted successfully',
      threadId: deleted[0].id,
    });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}