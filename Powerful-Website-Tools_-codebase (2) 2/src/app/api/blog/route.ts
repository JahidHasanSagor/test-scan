import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { blogPosts, blogCategories, blogPostTags, blogTags, blogComments, user } from '@/db/schema';
import { eq, like, and, or, desc, asc, sql, inArray } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

// Helper function to generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Helper function to validate slug format
function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const slug = searchParams.get('slug');

    // Single post by ID or slug
    if (id || slug) {
      const whereCondition = id 
        ? eq(blogPosts.id, parseInt(id))
        : eq(blogPosts.slug, slug as string);

      const posts = await db.select({
        id: blogPosts.id,
        slug: blogPosts.slug,
        title: blogPosts.title,
        excerpt: blogPosts.excerpt,
        content: blogPosts.content,
        featuredImage: blogPosts.featuredImage,
        status: blogPosts.status,
        featured: blogPosts.featured,
        viewCount: blogPosts.viewCount,
        readTime: blogPosts.readTime,
        publishedAt: blogPosts.publishedAt,
        createdAt: blogPosts.createdAt,
        updatedAt: blogPosts.updatedAt,
        category: {
          id: blogCategories.id,
          name: blogCategories.name,
          slug: blogCategories.slug,
        },
        author: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      })
        .from(blogPosts)
        .leftJoin(blogCategories, eq(blogPosts.categoryId, blogCategories.id))
        .leftJoin(user, eq(blogPosts.authorId, user.id))
        .where(whereCondition)
        .limit(1);

      if (posts.length === 0) {
        return NextResponse.json({ 
          error: 'Post not found',
          code: 'POST_NOT_FOUND' 
        }, { status: 404 });
      }

      // Fetch tags for the post
      const postTags = await db.select({
        id: blogTags.id,
        name: blogTags.name,
        slug: blogTags.slug,
      })
        .from(blogPostTags)
        .innerJoin(blogTags, eq(blogPostTags.tagId, blogTags.id))
        .where(eq(blogPostTags.postId, posts[0].id));

      return NextResponse.json({
        ...posts[0],
        tags: postTags,
      });
    }

    // List posts with filters
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');
    const categoryFilter = searchParams.get('category');
    const tagFilter = searchParams.get('tag');
    const statusFilter = searchParams.get('status') || 'published';
    const sort = searchParams.get('sort') || 'default';

    let conditions = [];

    // Status filter (default to published only)
    if (statusFilter) {
      conditions.push(eq(blogPosts.status, statusFilter));
    }

    // Category filter
    if (categoryFilter) {
      conditions.push(eq(blogPosts.categoryId, parseInt(categoryFilter)));
    }

    // Search filter
    if (search) {
      conditions.push(
        or(
          like(blogPosts.title, `%${search}%`),
          like(blogPosts.excerpt, `%${search}%`),
          like(blogPosts.content, `%${search}%`)
        )
      );
    }

    // Tag filter - get post IDs that have the specified tag
    let postIdsWithTag: number[] | null = null;
    if (tagFilter) {
      const taggedPosts = await db.select({ postId: blogPostTags.postId })
        .from(blogPostTags)
        .where(eq(blogPostTags.tagId, parseInt(tagFilter)));
      
      postIdsWithTag = taggedPosts.map(p => p.postId);
      
      if (postIdsWithTag.length === 0) {
        return NextResponse.json({
          posts: [],
          total: 0,
        });
      }
      
      conditions.push(inArray(blogPosts.id, postIdsWithTag));
    }

    // Build where clause
    const whereCondition = conditions.length > 0 ? and(...conditions) : undefined;

    // Determine sort order
    let orderBy;
    switch (sort) {
      case 'newest':
        orderBy = desc(blogPosts.publishedAt);
        break;
      case 'popular':
        orderBy = desc(blogPosts.viewCount);
        break;
      default:
        orderBy = desc(blogPosts.id);
    }

    // Get posts with joins
    const posts = await db.select({
      id: blogPosts.id,
      slug: blogPosts.slug,
      title: blogPosts.title,
      excerpt: blogPosts.excerpt,
      content: blogPosts.content,
      featuredImage: blogPosts.featuredImage,
      status: blogPosts.status,
      featured: blogPosts.featured,
      viewCount: blogPosts.viewCount,
      readTime: blogPosts.readTime,
      publishedAt: blogPosts.publishedAt,
      createdAt: blogPosts.createdAt,
      updatedAt: blogPosts.updatedAt,
      category: {
        id: blogCategories.id,
        name: blogCategories.name,
        slug: blogCategories.slug,
      },
      author: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    })
      .from(blogPosts)
      .leftJoin(blogCategories, eq(blogPosts.categoryId, blogCategories.id))
      .leftJoin(user, eq(blogPosts.authorId, user.id))
      .where(whereCondition)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);

    // Get total count
    const countResult = await db.select({ count: sql<number>`count(*)` })
      .from(blogPosts)
      .where(whereCondition);
    
    const total = countResult[0].count;

    // Fetch tags for all posts
    const postIds = posts.map(p => p.id);
    let allPostTags: { postId: number; id: number; name: string; slug: string }[] = [];
    
    if (postIds.length > 0) {
      allPostTags = await db.select({
        postId: blogPostTags.postId,
        id: blogTags.id,
        name: blogTags.name,
        slug: blogTags.slug,
      })
        .from(blogPostTags)
        .innerJoin(blogTags, eq(blogPostTags.tagId, blogTags.id))
        .where(inArray(blogPostTags.postId, postIds));
    }

    // Attach tags to posts
    const postsWithTags = posts.map(post => ({
      ...post,
      tags: allPostTags.filter(tag => tag.postId === post.id).map(({ postId, ...tag }) => tag),
    }));

    return NextResponse.json({
      posts: postsWithTags,
      total,
    });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      title, 
      excerpt, 
      content, 
      categoryId, 
      readTime,
      slug: providedSlug,
      featuredImage,
      status = 'draft',
      featured = false,
      authorId
    } = body;

    // Validate required fields
    if (!title || title.trim().length === 0) {
      return NextResponse.json({ 
        error: "Title is required",
        code: "MISSING_TITLE" 
      }, { status: 400 });
    }

    if (title.length > 200) {
      return NextResponse.json({ 
        error: "Title must not exceed 200 characters",
        code: "TITLE_TOO_LONG" 
      }, { status: 400 });
    }

    if (!excerpt || excerpt.trim().length === 0) {
      return NextResponse.json({ 
        error: "Excerpt is required",
        code: "MISSING_EXCERPT" 
      }, { status: 400 });
    }

    if (excerpt.length > 300) {
      return NextResponse.json({ 
        error: "Excerpt must not exceed 300 characters",
        code: "EXCERPT_TOO_LONG" 
      }, { status: 400 });
    }

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ 
        error: "Content is required",
        code: "MISSING_CONTENT" 
      }, { status: 400 });
    }

    if (content.length < 100) {
      return NextResponse.json({ 
        error: "Content must be at least 100 characters",
        code: "CONTENT_TOO_SHORT" 
      }, { status: 400 });
    }

    if (!categoryId) {
      return NextResponse.json({ 
        error: "Category ID is required",
        code: "MISSING_CATEGORY" 
      }, { status: 400 });
    }

    if (!readTime || readTime.trim().length === 0) {
      return NextResponse.json({ 
        error: "Read time is required",
        code: "MISSING_READ_TIME" 
      }, { status: 400 });
    }

    if (!authorId || authorId.trim().length === 0) {
      return NextResponse.json({ 
        error: "Author ID is required",
        code: "MISSING_AUTHOR" 
      }, { status: 400 });
    }

    // Validate status
    if (status !== 'draft' && status !== 'published') {
      return NextResponse.json({ 
        error: "Status must be either 'draft' or 'published'",
        code: "INVALID_STATUS" 
      }, { status: 400 });
    }

    // Generate or validate slug
    let slug = providedSlug ? providedSlug.toLowerCase().trim() : generateSlug(title);

    if (!isValidSlug(slug)) {
      return NextResponse.json({ 
        error: "Slug must be URL-safe (lowercase, hyphens, alphanumeric only)",
        code: "INVALID_SLUG" 
      }, { status: 400 });
    }

    // Check slug uniqueness
    const existingPost = await db.select()
      .from(blogPosts)
      .where(eq(blogPosts.slug, slug))
      .limit(1);

    if (existingPost.length > 0) {
      return NextResponse.json({ 
        error: "A post with this slug already exists",
        code: "SLUG_CONFLICT" 
      }, { status: 400 });
    }

    // Validate category exists
    const category = await db.select()
      .from(blogCategories)
      .where(eq(blogCategories.id, parseInt(categoryId)))
      .limit(1);

    if (category.length === 0) {
      return NextResponse.json({ 
        error: "Category not found",
        code: "CATEGORY_NOT_FOUND" 
      }, { status: 400 });
    }

    // Validate author exists
    const author = await db.select()
      .from(user)
      .where(eq(user.id, authorId))
      .limit(1);

    if (author.length === 0) {
      return NextResponse.json({ 
        error: "Author not found",
        code: "AUTHOR_NOT_FOUND" 
      }, { status: 400 });
    }

    const now = new Date().toISOString();
    const publishedAt = status === 'published' ? now : null;

    const newPost = await db.insert(blogPosts)
      .values({
        slug,
        title: title.trim(),
        excerpt: excerpt.trim(),
        content: content.trim(),
        featuredImage: featuredImage || null,
        authorId,
        categoryId: parseInt(categoryId),
        status,
        featured: Boolean(featured),
        viewCount: 0,
        readTime: readTime.trim(),
        publishedAt,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return NextResponse.json(newPost[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      return NextResponse.json({ 
        error: "Slug parameter is required",
        code: "MISSING_SLUG" 
      }, { status: 400 });
    }

    // Check if post exists
    const existingPost = await db.select()
      .from(blogPosts)
      .where(eq(blogPosts.slug, slug))
      .limit(1);

    if (existingPost.length === 0) {
      return NextResponse.json({ 
        error: 'Post not found',
        code: 'POST_NOT_FOUND' 
      }, { status: 404 });
    }

    const body = await request.json();
    const { 
      title, 
      excerpt, 
      content, 
      featuredImage,
      categoryId, 
      status,
      featured,
      readTime,
      slug: newSlug
    } = body;

    const updates: any = {
      updatedAt: new Date().toISOString(),
    };

    // Validate and update fields if provided
    if (title !== undefined) {
      if (title.trim().length === 0) {
        return NextResponse.json({ 
          error: "Title cannot be empty",
          code: "INVALID_TITLE" 
        }, { status: 400 });
      }
      if (title.length > 200) {
        return NextResponse.json({ 
          error: "Title must not exceed 200 characters",
          code: "TITLE_TOO_LONG" 
        }, { status: 400 });
      }
      updates.title = title.trim();
    }

    if (excerpt !== undefined) {
      if (excerpt.trim().length === 0) {
        return NextResponse.json({ 
          error: "Excerpt cannot be empty",
          code: "INVALID_EXCERPT" 
        }, { status: 400 });
      }
      if (excerpt.length > 300) {
        return NextResponse.json({ 
          error: "Excerpt must not exceed 300 characters",
          code: "EXCERPT_TOO_LONG" 
        }, { status: 400 });
      }
      updates.excerpt = excerpt.trim();
    }

    if (content !== undefined) {
      if (content.trim().length === 0) {
        return NextResponse.json({ 
          error: "Content cannot be empty",
          code: "INVALID_CONTENT" 
        }, { status: 400 });
      }
      if (content.length < 100) {
        return NextResponse.json({ 
          error: "Content must be at least 100 characters",
          code: "CONTENT_TOO_SHORT" 
        }, { status: 400 });
      }
      updates.content = content.trim();
    }

    if (featuredImage !== undefined) {
      updates.featuredImage = featuredImage;
    }

    if (categoryId !== undefined) {
      // Validate category exists
      const category = await db.select()
        .from(blogCategories)
        .where(eq(blogCategories.id, parseInt(categoryId)))
        .limit(1);

      if (category.length === 0) {
        return NextResponse.json({ 
          error: "Category not found",
          code: "CATEGORY_NOT_FOUND" 
        }, { status: 400 });
      }
      updates.categoryId = parseInt(categoryId);
    }

    if (status !== undefined) {
      if (status !== 'draft' && status !== 'published') {
        return NextResponse.json({ 
          error: "Status must be either 'draft' or 'published'",
          code: "INVALID_STATUS" 
        }, { status: 400 });
      }
      updates.status = status;

      // Set publishedAt if status changes to published and it's not already set
      if (status === 'published' && !existingPost[0].publishedAt) {
        updates.publishedAt = new Date().toISOString();
      }
    }

    if (featured !== undefined) {
      updates.featured = Boolean(featured);
    }

    if (readTime !== undefined) {
      if (readTime.trim().length === 0) {
        return NextResponse.json({ 
          error: "Read time cannot be empty",
          code: "INVALID_READ_TIME" 
        }, { status: 400 });
      }
      updates.readTime = readTime.trim();
    }

    if (newSlug !== undefined && newSlug !== slug) {
      const sanitizedSlug = newSlug.toLowerCase().trim();
      
      if (!isValidSlug(sanitizedSlug)) {
        return NextResponse.json({ 
          error: "Slug must be URL-safe (lowercase, hyphens, alphanumeric only)",
          code: "INVALID_SLUG" 
        }, { status: 400 });
      }

      // Check new slug uniqueness
      const slugConflict = await db.select()
        .from(blogPosts)
        .where(eq(blogPosts.slug, sanitizedSlug))
        .limit(1);

      if (slugConflict.length > 0) {
        return NextResponse.json({ 
          error: "A post with this slug already exists",
          code: "SLUG_CONFLICT" 
        }, { status: 400 });
      }

      updates.slug = sanitizedSlug;
    }

    const updatedPost = await db.update(blogPosts)
      .set(updates)
      .where(eq(blogPosts.slug, slug))
      .returning();

    return NextResponse.json(updatedPost[0]);
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      return NextResponse.json({ 
        error: "Slug parameter is required",
        code: "MISSING_SLUG" 
      }, { status: 400 });
    }

    // Check if post exists
    const existingPost = await db.select()
      .from(blogPosts)
      .where(eq(blogPosts.slug, slug))
      .limit(1);

    if (existingPost.length === 0) {
      return NextResponse.json({ 
        error: 'Post not found',
        code: 'POST_NOT_FOUND' 
      }, { status: 404 });
    }

    const postId = existingPost[0].id;

    // Delete associated blog_post_tags records
    await db.delete(blogPostTags)
      .where(eq(blogPostTags.postId, postId));

    // Delete associated blog_comments records
    await db.delete(blogComments)
      .where(eq(blogComments.postId, postId));

    // Delete the post
    const deleted = await db.delete(blogPosts)
      .where(eq(blogPosts.slug, slug))
      .returning();

    return NextResponse.json({
      message: 'Post deleted successfully',
      post: deleted[0],
    });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}