import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { blogPosts, user, blogCategories, blogPostTags, blogTags } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limitParam = searchParams.get('limit');
    
    // Validate and parse limit parameter
    let limit = 3; // default
    if (limitParam) {
      const parsedLimit = parseInt(limitParam);
      if (isNaN(parsedLimit) || parsedLimit < 1) {
        return NextResponse.json({ 
          error: "Limit must be a positive number",
          code: "INVALID_LIMIT" 
        }, { status: 400 });
      }
      limit = Math.min(parsedLimit, 10); // max 10
    }

    // Fetch featured published posts with author and category
    const featuredPosts = await db.select({
      id: blogPosts.id,
      slug: blogPosts.slug,
      title: blogPosts.title,
      excerpt: blogPosts.excerpt,
      featuredImage: blogPosts.featuredImage,
      readTime: blogPosts.readTime,
      viewCount: blogPosts.viewCount,
      publishedAt: blogPosts.publishedAt,
      authorName: user.name,
      authorImage: user.image,
      categoryName: blogCategories.name,
      categorySlug: blogCategories.slug,
    })
    .from(blogPosts)
    .leftJoin(user, eq(blogPosts.authorId, user.id))
    .leftJoin(blogCategories, eq(blogPosts.categoryId, blogCategories.id))
    .where(
      and(
        eq(blogPosts.featured, true),
        eq(blogPosts.status, 'published')
      )
    )
    .orderBy(desc(blogPosts.publishedAt))
    .limit(limit);

    // If no featured posts found, return empty array
    if (featuredPosts.length === 0) {
      return NextResponse.json([]);
    }

    // Fetch tags for all featured posts
    const postIds = featuredPosts.map(post => post.id);
    const postTagsData = await db.select({
      postId: blogPostTags.postId,
      tagName: blogTags.name,
      tagSlug: blogTags.slug,
    })
    .from(blogPostTags)
    .innerJoin(blogTags, eq(blogPostTags.tagId, blogTags.id))
    .where(eq(blogPostTags.postId, postIds[0]));

    // Fetch tags for remaining posts if any
    const allPostTags = await Promise.all(
      postIds.map(async (postId) => {
        const tags = await db.select({
          postId: blogPostTags.postId,
          tagName: blogTags.name,
          tagSlug: blogTags.slug,
        })
        .from(blogPostTags)
        .innerJoin(blogTags, eq(blogPostTags.tagId, blogTags.id))
        .where(eq(blogPostTags.postId, postId));
        
        return tags;
      })
    );

    // Flatten and group tags by postId
    const tagsByPostId = allPostTags.flat().reduce((acc, tag) => {
      if (!acc[tag.postId]) {
        acc[tag.postId] = [];
      }
      acc[tag.postId].push({
        name: tag.tagName,
        slug: tag.tagSlug,
      });
      return acc;
    }, {} as Record<number, Array<{ name: string; slug: string }>>);

    // Format response with nested relations
    const formattedPosts = featuredPosts.map(post => ({
      id: post.id,
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      featuredImage: post.featuredImage,
      readTime: post.readTime,
      viewCount: post.viewCount,
      publishedAt: post.publishedAt,
      author: {
        name: post.authorName,
        image: post.authorImage,
      },
      category: {
        name: post.categoryName,
        slug: post.categorySlug,
      },
      tags: tagsByPostId[post.id] || [],
    }));

    return NextResponse.json(formattedPosts);

  } catch (error) {
    console.error('GET featured posts error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}