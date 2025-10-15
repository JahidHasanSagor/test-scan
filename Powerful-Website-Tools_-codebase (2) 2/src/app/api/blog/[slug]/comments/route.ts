import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { blogComments, blogPosts, user } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;

    // Find the blog post by slug
    const post = await db.select()
      .from(blogPosts)
      .where(eq(blogPosts.slug, slug))
      .limit(1);

    if (post.length === 0) {
      return NextResponse.json({ 
        error: 'Blog post not found',
        code: 'POST_NOT_FOUND' 
      }, { status: 404 });
    }

    const postId = post[0].id;

    // Get approved comments for this post
    const comments = await db.select({
      id: blogComments.id,
      content: blogComments.content,
      createdAt: blogComments.createdAt,
      userId: blogComments.userId,
      authorName: blogComments.authorName,
      authorEmail: blogComments.authorEmail,
      userName: user.name,
      userEmail: user.email,
      userImage: user.image,
    })
      .from(blogComments)
      .leftJoin(user, eq(blogComments.userId, user.id))
      .where(and(
        eq(blogComments.postId, postId),
        eq(blogComments.status, 'approved')
      ))
      .orderBy(desc(blogComments.createdAt));

    // Format the response
    const formattedComments = comments.map(comment => {
      if (comment.userId) {
        // Authenticated user comment
        return {
          id: comment.id,
          content: comment.content,
          createdAt: comment.createdAt,
          author: {
            name: comment.userName,
            email: comment.userEmail,
            image: comment.userImage,
          }
        };
      } else {
        // Guest comment
        return {
          id: comment.id,
          content: comment.content,
          createdAt: comment.createdAt,
          authorName: comment.authorName,
          authorEmail: comment.authorEmail,
        };
      }
    });

    return NextResponse.json(formattedComments);
  } catch (error) {
    console.error('GET comments error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;
    const body = await request.json();
    const { content, authorName, authorEmail } = body;

    // Security check: reject if userId provided in body
    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json({ 
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    // Get authenticated user if exists
    const currentUser = await getCurrentUser(request);

    // Validate content
    if (!content) {
      return NextResponse.json({ 
        error: "Content is required",
        code: "MISSING_CONTENT" 
      }, { status: 400 });
    }

    if (content.length < 10) {
      return NextResponse.json({ 
        error: "Content must be at least 10 characters",
        code: "CONTENT_TOO_SHORT" 
      }, { status: 400 });
    }

    if (content.length > 1000) {
      return NextResponse.json({ 
        error: "Content must not exceed 1000 characters",
        code: "CONTENT_TOO_LONG" 
      }, { status: 400 });
    }

    // Validate either authenticated user OR guest info
    if (!currentUser) {
      // Guest comment - require authorName and authorEmail
      if (!authorName || !authorEmail) {
        return NextResponse.json({ 
          error: "For guest comments, both authorName and authorEmail are required",
          code: "MISSING_GUEST_INFO" 
        }, { status: 400 });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(authorEmail)) {
        return NextResponse.json({ 
          error: "Invalid email format",
          code: "INVALID_EMAIL" 
        }, { status: 400 });
      }
    }

    // Find the blog post by slug
    const post = await db.select()
      .from(blogPosts)
      .where(eq(blogPosts.slug, slug))
      .limit(1);

    if (post.length === 0) {
      return NextResponse.json({ 
        error: 'Blog post not found',
        code: 'POST_NOT_FOUND' 
      }, { status: 404 });
    }

    // Validate post is published
    if (post[0].status !== 'published') {
      return NextResponse.json({ 
        error: 'Cannot comment on unpublished post',
        code: 'POST_NOT_PUBLISHED' 
      }, { status: 400 });
    }

    const postId = post[0].id;
    const now = new Date().toISOString();

    // Prepare comment data
    const commentData = currentUser ? {
      postId,
      userId: currentUser.id,
      authorName: null,
      authorEmail: null,
      content: content.trim(),
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    } : {
      postId,
      userId: null,
      authorName: authorName.trim(),
      authorEmail: authorEmail.trim().toLowerCase(),
      content: content.trim(),
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    };

    // Insert the comment
    const newComment = await db.insert(blogComments)
      .values(commentData)
      .returning();

    return NextResponse.json(newComment[0], { status: 201 });
  } catch (error) {
    console.error('POST comment error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}