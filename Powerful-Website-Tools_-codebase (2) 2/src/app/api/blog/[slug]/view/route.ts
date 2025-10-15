import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { blogPosts } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    if (!slug || typeof slug !== 'string') {
      return NextResponse.json(
        { 
          error: 'Valid slug is required',
          code: 'INVALID_SLUG'
        },
        { status: 400 }
      );
    }

    // Find the post by slug
    const post = await db.select()
      .from(blogPosts)
      .where(eq(blogPosts.slug, slug))
      .limit(1);

    if (post.length === 0) {
      return NextResponse.json(
        { 
          error: 'Blog post not found',
          code: 'POST_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    // Only increment for published posts
    if (post[0].status !== 'published') {
      return NextResponse.json(
        { 
          error: 'Cannot increment view count for unpublished posts',
          code: 'POST_NOT_PUBLISHED'
        },
        { status: 400 }
      );
    }

    // Increment view count
    const newViewCount = (post[0].viewCount || 0) + 1;

    const updated = await db.update(blogPosts)
      .set({
        viewCount: newViewCount,
        updatedAt: new Date().toISOString()
      })
      .where(eq(blogPosts.slug, slug))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { 
          error: 'Failed to increment view count',
          code: 'UPDATE_FAILED'
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'View count incremented',
      viewCount: updated[0].viewCount,
      slug: updated[0].slug
    }, { status: 200 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + error
      },
      { status: 500 }
    );
  }
}