import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { blogTags, blogPostTags } from '@/db/schema';
import { eq, asc, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Get all tags with usage count
    const tags = await db
      .select({
        id: blogTags.id,
        name: blogTags.name,
        slug: blogTags.slug,
        createdAt: blogTags.createdAt,
        usageCount: sql<number>`(
          SELECT COUNT(*) 
          FROM ${blogPostTags} 
          WHERE ${blogPostTags.tagId} = ${blogTags.id}
        )`.as('usage_count'),
      })
      .from(blogTags)
      .orderBy(asc(blogTags.name));

    return NextResponse.json(tags);
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, slug } = body;

    // Validate required fields
    if (!name || !slug) {
      return NextResponse.json(
        { 
          error: 'Name and slug are required',
          code: 'MISSING_REQUIRED_FIELDS'
        },
        { status: 400 }
      );
    }

    // Validate name length
    if (name.length > 50) {
      return NextResponse.json(
        { 
          error: 'Name must be 50 characters or less',
          code: 'NAME_TOO_LONG'
        },
        { status: 400 }
      );
    }

    // Validate slug format (URL-safe: lowercase, hyphens, alphanumeric)
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugRegex.test(slug)) {
      return NextResponse.json(
        { 
          error: 'Slug must be URL-safe (lowercase, hyphens, alphanumeric only)',
          code: 'INVALID_SLUG_FORMAT'
        },
        { status: 400 }
      );
    }

    // Check slug uniqueness
    const existingTag = await db
      .select()
      .from(blogTags)
      .where(eq(blogTags.slug, slug))
      .limit(1);

    if (existingTag.length > 0) {
      return NextResponse.json(
        { 
          error: 'A tag with this slug already exists',
          code: 'SLUG_NOT_UNIQUE'
        },
        { status: 400 }
      );
    }

    // Create new tag
    const newTag = await db
      .insert(blogTags)
      .values({
        name: name.trim(),
        slug: slug.trim(),
        createdAt: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json(newTag[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { 
          error: 'Valid ID is required',
          code: 'INVALID_ID'
        },
        { status: 400 }
      );
    }

    // Check if tag exists
    const existingTag = await db
      .select()
      .from(blogTags)
      .where(eq(blogTags.id, parseInt(id)))
      .limit(1);

    if (existingTag.length === 0) {
      return NextResponse.json(
        { error: 'Tag not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { name, slug } = body;

    // Validate fields if provided
    if (name && name.length > 50) {
      return NextResponse.json(
        { 
          error: 'Name must be 50 characters or less',
          code: 'NAME_TOO_LONG'
        },
        { status: 400 }
      );
    }

    if (slug) {
      // Validate slug format
      const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
      if (!slugRegex.test(slug)) {
        return NextResponse.json(
          { 
            error: 'Slug must be URL-safe (lowercase, hyphens, alphanumeric only)',
            code: 'INVALID_SLUG_FORMAT'
          },
          { status: 400 }
        );
      }

      // Check slug uniqueness if changed
      if (slug !== existingTag[0].slug) {
        const duplicateSlug = await db
          .select()
          .from(blogTags)
          .where(eq(blogTags.slug, slug))
          .limit(1);

        if (duplicateSlug.length > 0) {
          return NextResponse.json(
            { 
              error: 'A tag with this slug already exists',
              code: 'SLUG_NOT_UNIQUE'
            },
            { status: 400 }
          );
        }
      }
    }

    // Prepare update data
    const updateData: {
      name?: string;
      slug?: string;
    } = {};

    if (name) updateData.name = name.trim();
    if (slug) updateData.slug = slug.trim();

    // Update tag
    const updated = await db
      .update(blogTags)
      .set(updateData)
      .where(eq(blogTags.id, parseInt(id)))
      .returning();

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { 
          error: 'Valid ID is required',
          code: 'INVALID_ID'
        },
        { status: 400 }
      );
    }

    // Check if tag exists
    const existingTag = await db
      .select()
      .from(blogTags)
      .where(eq(blogTags.id, parseInt(id)))
      .limit(1);

    if (existingTag.length === 0) {
      return NextResponse.json(
        { error: 'Tag not found' },
        { status: 404 }
      );
    }

    // Delete associated blog_post_tags records first
    await db
      .delete(blogPostTags)
      .where(eq(blogPostTags.tagId, parseInt(id)));

    // Delete the tag
    const deleted = await db
      .delete(blogTags)
      .where(eq(blogTags.id, parseInt(id)))
      .returning();

    return NextResponse.json({
      message: 'Tag deleted successfully',
      tag: deleted[0],
    });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}