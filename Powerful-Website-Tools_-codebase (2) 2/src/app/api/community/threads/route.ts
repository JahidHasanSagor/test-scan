import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { communityThreads, communityThreadVotes, user } from '@/db/schema';
import { eq, desc, asc, sql, and, or } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Pagination parameters
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50);
    const offset = parseInt(searchParams.get('offset') || '0');
    
    // Filtering parameters
    const category = searchParams.get('category');
    const status = searchParams.get('status') || 'active';
    
    // Sorting parameter
    const sort = searchParams.get('sort') || 'hot';
    
    // Get current user for vote status (optional)
    let currentUser = null;
    try {
      currentUser = await getCurrentUser(request);
    } catch (error) {
      // User not authenticated, continue without user context
    }

    // Build the base query with user join
    let whereConditions = eq(communityThreads.status, status);
    
    if (category) {
      whereConditions = and(whereConditions, eq(communityThreads.category, category)) as any;
    }

    // Get threads with author info
    const threadsQuery = db
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
        author: {
          id: user.id,
          name: user.name,
          image: user.image,
          role: user.role,
        },
      })
      .from(communityThreads)
      .leftJoin(user, eq(communityThreads.userId, user.id))
      .where(whereConditions);

    // Apply sorting
    let orderByClause;
    switch (sort) {
      case 'new':
        orderByClause = [
          desc(communityThreads.isPinned),
          desc(communityThreads.createdAt),
        ];
        break;
      case 'top':
        orderByClause = [
          desc(communityThreads.isPinned),
          desc(sql`${communityThreads.upvotes} - ${communityThreads.downvotes}`),
        ];
        break;
      case 'hot':
      default:
        orderByClause = [
          desc(communityThreads.isPinned),
          desc(sql`${communityThreads.upvotes} - ${communityThreads.downvotes}`),
          desc(communityThreads.createdAt),
        ];
        break;
    }

    const threads = await threadsQuery
      .orderBy(...orderByClause)
      .limit(limit + 1)
      .offset(offset);

    // Check if there are more results
    const hasMore = threads.length > limit;
    const resultThreads = hasMore ? threads.slice(0, limit) : threads;

    // If user is authenticated, fetch their votes for these threads
    let userVotes: Record<number, string> = {};
    if (currentUser) {
      const threadIds = resultThreads.map(t => t.id);
      if (threadIds.length > 0) {
        const votes = await db
          .select({
            threadId: communityThreadVotes.threadId,
            voteType: communityThreadVotes.voteType,
          })
          .from(communityThreadVotes)
          .where(
            and(
              eq(communityThreadVotes.userId, currentUser.id),
              sql`${communityThreadVotes.threadId} IN ${threadIds}`
            )
          );

        votes.forEach(vote => {
          userVotes[vote.threadId] = vote.voteType;
        });
      }
    }

    // Format the response with calculated score and userVote
    const formattedThreads = resultThreads.map(thread => ({
      ...thread,
      score: thread.upvotes - thread.downvotes,
      userVote: currentUser ? (userVotes[thread.id] || null) : null,
    }));

    return NextResponse.json({
      threads: formattedThreads,
      total: resultThreads.length,
      hasMore,
    }, { status: 200 });

  } catch (error) {
    console.error('GET threads error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authentication required
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'AUTHENTICATION_REQUIRED' },
        { status: 401 }
      );
    }

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

    const { title, content, category } = body;

    // Validate required fields
    if (!title || typeof title !== 'string') {
      return NextResponse.json(
        { error: 'Title is required', code: 'MISSING_TITLE' },
        { status: 400 }
      );
    }

    if (title.trim().length === 0) {
      return NextResponse.json(
        { error: 'Title cannot be empty', code: 'EMPTY_TITLE' },
        { status: 400 }
      );
    }

    if (title.length > 300) {
      return NextResponse.json(
        {
          error: 'Title cannot exceed 300 characters',
          code: 'TITLE_TOO_LONG',
        },
        { status: 400 }
      );
    }

    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Content is required', code: 'MISSING_CONTENT' },
        { status: 400 }
      );
    }

    if (content.trim().length < 10) {
      return NextResponse.json(
        {
          error: 'Content must be at least 10 characters',
          code: 'CONTENT_TOO_SHORT',
        },
        { status: 400 }
      );
    }

    if (content.length > 10000) {
      return NextResponse.json(
        {
          error: 'Content cannot exceed 10000 characters',
          code: 'CONTENT_TOO_LONG',
        },
        { status: 400 }
      );
    }

    // Validate optional category
    if (category && typeof category !== 'string') {
      return NextResponse.json(
        { error: 'Category must be a string', code: 'INVALID_CATEGORY' },
        { status: 400 }
      );
    }

    if (category && category.length > 50) {
      return NextResponse.json(
        {
          error: 'Category cannot exceed 50 characters',
          code: 'CATEGORY_TOO_LONG',
        },
        { status: 400 }
      );
    }

    // Create the thread
    const now = new Date().toISOString();
    const newThread = await db
      .insert(communityThreads)
      .values({
        userId: currentUser.id,
        title: title.trim(),
        content: content.trim(),
        category: category ? category.trim() : null,
        upvotes: 0,
        downvotes: 0,
        commentCount: 0,
        isPinned: false,
        status: 'active',
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    if (newThread.length === 0) {
      return NextResponse.json(
        { error: 'Failed to create thread', code: 'CREATE_FAILED' },
        { status: 500 }
      );
    }

    // Get the created thread with author info
    const threadWithAuthor = await db
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
        author: {
          id: user.id,
          name: user.name,
          image: user.image,
          role: user.role,
        },
      })
      .from(communityThreads)
      .leftJoin(user, eq(communityThreads.userId, user.id))
      .where(eq(communityThreads.id, newThread[0].id))
      .limit(1);

    if (threadWithAuthor.length === 0) {
      return NextResponse.json(
        { error: 'Thread created but failed to retrieve', code: 'RETRIEVE_FAILED' },
        { status: 500 }
      );
    }

    const result = {
      ...threadWithAuthor[0],
      score: 0,
      userVote: null,
    };

    return NextResponse.json(result, { status: 201 });

  } catch (error) {
    console.error('POST thread error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}