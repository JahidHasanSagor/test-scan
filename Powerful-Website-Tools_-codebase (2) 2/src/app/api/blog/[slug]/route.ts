import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { blogPosts, blogCategories, blogTags, blogPostTags, user, blogComments } from '@/db/schema';
import { eq, and, desc, ne, sql } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    if (!slug) {
      return NextResponse.json(
        { error: 'Slug is required', code: 'MISSING_SLUG' },
        { status: 400 }
      );
    }

    // Get the main post with status check
    const post = await db
      .select({
        id: blogPosts.id,
        slug: blogPosts.slug,
        title: blogPosts.title,
        excerpt: blogPosts.excerpt,
        content: blogPosts.content,
        featuredImage: blogPosts.featuredImage,
        authorId: blogPosts.authorId,
        categoryId: blogPosts.categoryId,
        status: blogPosts.status,
        featured: blogPosts.featured,
        viewCount: blogPosts.viewCount,
        readTime: blogPosts.readTime,
        publishedAt: blogPosts.publishedAt,
        createdAt: blogPosts.createdAt,
        updatedAt: blogPosts.updatedAt,
        author: {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        },
        category: {
          id: blogCategories.id,
          name: blogCategories.name,
          slug: blogCategories.slug,
        },
      })
      .from(blogPosts)
      .leftJoin(user, eq(blogPosts.authorId, user.id))
      .leftJoin(blogCategories, eq(blogPosts.categoryId, blogCategories.id))
      .where(and(eq(blogPosts.slug, slug), eq(blogPosts.status, 'published')))
      .limit(1);

    if (post.length === 0) {
      return NextResponse.json(
        { error: 'Post not found or not published', code: 'POST_NOT_FOUND' },
        { status: 404 }
      );
    }

    const postData = post[0];

    // Get tags for this post
    const postTags = await db
      .select({
        id: blogTags.id,
        name: blogTags.name,
        slug: blogTags.slug,
      })
      .from(blogPostTags)
      .innerJoin(blogTags, eq(blogPostTags.tagId, blogTags.id))
      .where(eq(blogPostTags.postId, postData.id));

    // Get related posts from same category
    const relatedPosts = postData.categoryId
      ? await db
          .select({
            id: blogPosts.id,
            slug: blogPosts.slug,
            title: blogPosts.title,
            excerpt: blogPosts.excerpt,
            featuredImage: blogPosts.featuredImage,
            readTime: blogPosts.readTime,
            publishedAt: blogPosts.publishedAt,
            author: {
              id: user.id,
              name: user.name,
              image: user.image,
            },
          })
          .from(blogPosts)
          .leftJoin(user, eq(blogPosts.authorId, user.id))
          .where(
            and(
              eq(blogPosts.categoryId, postData.categoryId),
              ne(blogPosts.id, postData.id),
              eq(blogPosts.status, 'published')
            )
          )
          .orderBy(desc(blogPosts.publishedAt))
          .limit(5)
      : [];

    return NextResponse.json({
      post: {
        ...postData,
        tags: postTags,
      },
      relatedPosts,
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
  { params }: { params: { slug: string } }
) {
  try {
    const authUser = await getCurrentUser(request);
    if (!authUser) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const { slug } = params;

    if (!slug) {
      return NextResponse.json(
        { error: 'Slug is required', code: 'MISSING_SLUG' },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Security check: reject if userId or authorId provided in body
    if ('userId' in body || 'user_id' in body || 'authorId' in body) {
      return NextResponse.json(
        {
          error: 'User ID cannot be provided in request body',
          code: 'USER_ID_NOT_ALLOWED',
        },
        { status: 400 }
      );
    }

    const { title, excerpt, content, featuredImage, categoryId, status, featured, readTime, slug: newSlug } = body;

    // Check if post exists and belongs to user
    const existingPost = await db
      .select()
      .from(blogPosts)
      .where(and(eq(blogPosts.slug, slug), eq(blogPosts.authorId, authUser.id)))
      .limit(1);

    if (existingPost.length === 0) {
      return NextResponse.json(
        { error: 'Post not found', code: 'POST_NOT_FOUND' },
        { status: 404 }
      );
    }

    const currentPost = existingPost[0];

    // If slug is being changed, validate uniqueness
    if (newSlug && newSlug !== slug) {
      const slugExists = await db
        .select()
        .from(blogPosts)
        .where(eq(blogPosts.slug, newSlug))
        .limit(1);

      if (slugExists.length > 0) {
        return NextResponse.json(
          { error: 'Slug already exists', code: 'SLUG_EXISTS' },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date().toISOString(),
    };

    if (title !== undefined) updateData.title = title.trim();
    if (excerpt !== undefined) updateData.excerpt = excerpt.trim();
    if (content !== undefined) updateData.content = content;
    if (featuredImage !== undefined) updateData.featuredImage = featuredImage;
    if (categoryId !== undefined) updateData.categoryId = categoryId;
    if (status !== undefined) updateData.status = status;
    if (featured !== undefined) updateData.featured = featured;
    if (readTime !== undefined) updateData.readTime = readTime;
    if (newSlug !== undefined) updateData.slug = newSlug;

    // If status changes to "published" and publishedAt is null, set publishedAt
    if (status === 'published' && !currentPost.publishedAt) {
      updateData.publishedAt = new Date().toISOString();
    }

    // Update the post
    const updated = await db
      .update(blogPosts)
      .set(updateData)
      .where(and(eq(blogPosts.slug, slug), eq(blogPosts.authorId, authUser.id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { error: 'Failed to update post', code: 'UPDATE_FAILED' },
        { status: 500 }
      );
    }

    // Get updated post with relations
    const updatedPost = await db
      .select({
        id: blogPosts.id,
        slug: blogPosts.slug,
        title: blogPosts.title,
        excerpt: blogPosts.excerpt,
        content: blogPosts.content,
        featuredImage: blogPosts.featuredImage,
        authorId: blogPosts.authorId,
        categoryId: blogPosts.categoryId,
        status: blogPosts.status,
        featured: blogPosts.featured,
        viewCount: blogPosts.viewCount,
        readTime: blogPosts.readTime,
        publishedAt: blogPosts.publishedAt,
        createdAt: blogPosts.createdAt,
        updatedAt: blogPosts.updatedAt,
        author: {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        },
        category: {
          id: blogCategories.id,
          name: blogCategories.name,
          slug: blogCategories.slug,
        },
      })
      .from(blogPosts)
      .leftJoin(user, eq(blogPosts.authorId, user.id))
      .leftJoin(blogCategories, eq(blogPosts.categoryId, blogCategories.id))
      .where(eq(blogPosts.id, updated[0].id))
      .limit(1);

    // Get tags
    const postTags = await db
      .select({
        id: blogTags.id,
        name: blogTags.name,
        slug: blogTags.slug,
      })
      .from(blogPostTags)
      .innerJoin(blogTags, eq(blogPostTags.tagId, blogTags.id))
      .where(eq(blogPostTags.postId, updated[0].id));

    return NextResponse.json({
      ...updatedPost[0],
      tags: postTags,
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
  { params }: { params: { slug: string } }
) {
  try {
    const authUser = await getCurrentUser(request);
    if (!authUser) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const { slug } = params;

    if (!slug) {
      return NextResponse.json(
        { error: 'Slug is required', code: 'MISSING_SLUG' },
        { status: 400 }
      );
    }

    // Check if post exists and belongs to user
    const existingPost = await db
      .select()
      .from(blogPosts)
      .where(and(eq(blogPosts.slug, slug), eq(blogPosts.authorId, authUser.id)))
      .limit(1);

    if (existingPost.length === 0) {
      return NextResponse.json(
        { error: 'Post not found', code: 'POST_NOT_FOUND' },
        { status: 404 }
      );
    }

    const postId = existingPost[0].id;

    // Delete associated blog_post_tags first
    await db.delete(blogPostTags).where(eq(blogPostTags.postId, postId));

    // Delete associated blog_comments
    await db.delete(blogComments).where(eq(blogComments.postId, postId));

    // Delete the post itself
    const deleted = await db
      .delete(blogPosts)
      .where(and(eq(blogPosts.id, postId), eq(blogPosts.authorId, authUser.id)))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json(
        { error: 'Failed to delete post', code: 'DELETE_FAILED' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Post deleted successfully',
      deletedPost: deleted[0],
    });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}