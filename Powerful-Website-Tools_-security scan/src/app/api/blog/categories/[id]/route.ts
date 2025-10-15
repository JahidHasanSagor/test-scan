import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { blogCategories, blogPosts } from '@/db/schema';
import { eq, and, or, count } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { 
          error: 'Valid category ID is required',
          code: 'INVALID_ID' 
        },
        { status: 400 }
      );
    }

    const categoryId = parseInt(id);

    // Get category
    const category = await db.select()
      .from(blogCategories)
      .where(eq(blogCategories.id, categoryId))
      .limit(1);

    if (category.length === 0) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Count published posts with this category
    const postCountResult = await db.select({ count: count() })
      .from(blogPosts)
      .where(
        and(
          eq(blogPosts.categoryId, categoryId),
          eq(blogPosts.status, 'published')
        )
      );

    const postCount = postCountResult[0]?.count || 0;

    return NextResponse.json({
      ...category[0],
      postCount
    });

  } catch (error) {
    console.error('GET category error:', error);
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
    const id = params.id;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { 
          error: 'Valid category ID is required',
          code: 'INVALID_ID' 
        },
        { status: 400 }
      );
    }

    const categoryId = parseInt(id);

    // Check if category exists
    const existingCategory = await db.select()
      .from(blogCategories)
      .where(eq(blogCategories.id, categoryId))
      .limit(1);

    if (existingCategory.length === 0) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { name, slug, description } = body;

    // Validate slug format if provided
    if (slug !== undefined) {
      if (!slug || typeof slug !== 'string') {
        return NextResponse.json(
          { 
            error: 'Slug is required and must be a string',
            code: 'INVALID_SLUG' 
          },
          { status: 400 }
        );
      }

      const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
      if (!slugRegex.test(slug)) {
        return NextResponse.json(
          { 
            error: 'Slug must be lowercase, alphanumeric with hyphens only',
            code: 'INVALID_SLUG_FORMAT' 
          },
          { status: 400 }
        );
      }

      // Check slug uniqueness if changed
      if (slug !== existingCategory[0].slug) {
        const duplicateSlug = await db.select()
          .from(blogCategories)
          .where(
            and(
              eq(blogCategories.slug, slug),
              eq(blogCategories.id, categoryId)
            )
          )
          .limit(1);

        const allWithSlug = await db.select()
          .from(blogCategories)
          .where(eq(blogCategories.slug, slug))
          .limit(1);

        if (allWithSlug.length > 0 && allWithSlug[0].id !== categoryId) {
          return NextResponse.json(
            { 
              error: 'Category with this slug already exists',
              code: 'DUPLICATE_SLUG' 
            },
            { status: 400 }
          );
        }
      }
    }

    // Build update object with only provided fields
    const updates: Record<string, any> = {};
    
    if (name !== undefined) {
      if (!name || typeof name !== 'string' || name.trim() === '') {
        return NextResponse.json(
          { 
            error: 'Name must be a non-empty string',
            code: 'INVALID_NAME' 
          },
          { status: 400 }
        );
      }
      updates.name = name.trim();
    }
    
    if (slug !== undefined) {
      updates.slug = slug.trim();
    }
    
    if (description !== undefined) {
      updates.description = description ? description.trim() : null;
    }

    // Update category
    const updatedCategory = await db.update(blogCategories)
      .set(updates)
      .where(eq(blogCategories.id, categoryId))
      .returning();

    return NextResponse.json(updatedCategory[0]);

  } catch (error) {
    console.error('PUT category error:', error);
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
    const id = params.id;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { 
          error: 'Valid category ID is required',
          code: 'INVALID_ID' 
        },
        { status: 400 }
      );
    }

    const categoryId = parseInt(id);

    // Check if category exists
    const existingCategory = await db.select()
      .from(blogCategories)
      .where(eq(blogCategories.id, categoryId))
      .limit(1);

    if (existingCategory.length === 0) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Check if any posts (published or draft) use this category
    const postsWithCategory = await db.select({ count: count() })
      .from(blogPosts)
      .where(eq(blogPosts.categoryId, categoryId));

    const postCount = postsWithCategory[0]?.count || 0;

    if (postCount > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete category with existing posts',
          code: 'CATEGORY_IN_USE',
          postCount 
        },
        { status: 400 }
      );
    }

    // Delete category
    const deletedCategory = await db.delete(blogCategories)
      .where(eq(blogCategories.id, categoryId))
      .returning();

    return NextResponse.json({
      message: 'Category deleted successfully',
      category: deletedCategory[0]
    });

  } catch (error) {
    console.error('DELETE category error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}