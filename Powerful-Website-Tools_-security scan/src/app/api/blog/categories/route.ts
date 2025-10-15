import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { blogCategories, blogPosts } from '@/db/schema';
import { eq, and, asc, count } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const categories = await db
      .select({
        id: blogCategories.id,
        name: blogCategories.name,
        slug: blogCategories.slug,
        description: blogCategories.description,
        createdAt: blogCategories.createdAt,
        postCount: count(blogPosts.id),
      })
      .from(blogCategories)
      .leftJoin(
        blogPosts,
        and(
          eq(blogPosts.categoryId, blogCategories.id),
          eq(blogPosts.status, 'published')
        )
      )
      .groupBy(blogCategories.id)
      .orderBy(asc(blogCategories.name));

    return NextResponse.json(categories);
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
    const { name, slug, description } = body;

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Name is required', code: 'MISSING_NAME' },
        { status: 400 }
      );
    }

    if (name.length > 100) {
      return NextResponse.json(
        { error: 'Name must not exceed 100 characters', code: 'NAME_TOO_LONG' },
        { status: 400 }
      );
    }

    if (!slug || slug.trim() === '') {
      return NextResponse.json(
        { error: 'Slug is required', code: 'MISSING_SLUG' },
        { status: 400 }
      );
    }

    const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugPattern.test(slug)) {
      return NextResponse.json(
        {
          error: 'Slug must be URL-safe (lowercase, hyphens, alphanumeric only)',
          code: 'INVALID_SLUG_FORMAT',
        },
        { status: 400 }
      );
    }

    if (description && description.length > 500) {
      return NextResponse.json(
        {
          error: 'Description must not exceed 500 characters',
          code: 'DESCRIPTION_TOO_LONG',
        },
        { status: 400 }
      );
    }

    const existingCategory = await db
      .select()
      .from(blogCategories)
      .where(eq(blogCategories.slug, slug))
      .limit(1);

    if (existingCategory.length > 0) {
      return NextResponse.json(
        { error: 'Slug already exists', code: 'SLUG_CONFLICT' },
        { status: 400 }
      );
    }

    const newCategory = await db
      .insert(blogCategories)
      .values({
        name: name.trim(),
        slug: slug.trim(),
        description: description ? description.trim() : null,
        createdAt: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json(newCategory[0], { status: 201 });
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

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const existingCategory = await db
      .select()
      .from(blogCategories)
      .where(eq(blogCategories.id, parseInt(id)))
      .limit(1);

    if (existingCategory.length === 0) {
      return NextResponse.json(
        { error: 'Category not found', code: 'CATEGORY_NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { name, slug, description } = body;

    if (name !== undefined) {
      if (!name || name.trim() === '') {
        return NextResponse.json(
          { error: 'Name cannot be empty', code: 'INVALID_NAME' },
          { status: 400 }
        );
      }

      if (name.length > 100) {
        return NextResponse.json(
          {
            error: 'Name must not exceed 100 characters',
            code: 'NAME_TOO_LONG',
          },
          { status: 400 }
        );
      }
    }

    if (slug !== undefined) {
      if (!slug || slug.trim() === '') {
        return NextResponse.json(
          { error: 'Slug cannot be empty', code: 'INVALID_SLUG' },
          { status: 400 }
        );
      }

      const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
      if (!slugPattern.test(slug)) {
        return NextResponse.json(
          {
            error: 'Slug must be URL-safe (lowercase, hyphens, alphanumeric only)',
            code: 'INVALID_SLUG_FORMAT',
          },
          { status: 400 }
        );
      }

      if (slug !== existingCategory[0].slug) {
        const slugConflict = await db
          .select()
          .from(blogCategories)
          .where(eq(blogCategories.slug, slug))
          .limit(1);

        if (slugConflict.length > 0) {
          return NextResponse.json(
            { error: 'Slug already exists', code: 'SLUG_CONFLICT' },
            { status: 400 }
          );
        }
      }
    }

    if (description !== undefined && description !== null && description.length > 500) {
      return NextResponse.json(
        {
          error: 'Description must not exceed 500 characters',
          code: 'DESCRIPTION_TOO_LONG',
        },
        { status: 400 }
      );
    }

    const updates: any = {};
    if (name !== undefined) updates.name = name.trim();
    if (slug !== undefined) updates.slug = slug.trim();
    if (description !== undefined) {
      updates.description = description ? description.trim() : null;
    }

    const updatedCategory = await db
      .update(blogCategories)
      .set(updates)
      .where(eq(blogCategories.id, parseInt(id)))
      .returning();

    return NextResponse.json(updatedCategory[0]);
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

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const existingCategory = await db
      .select()
      .from(blogCategories)
      .where(eq(blogCategories.id, parseInt(id)))
      .limit(1);

    if (existingCategory.length === 0) {
      return NextResponse.json(
        { error: 'Category not found', code: 'CATEGORY_NOT_FOUND' },
        { status: 404 }
      );
    }

    const postsWithCategory = await db
      .select()
      .from(blogPosts)
      .where(
        and(
          eq(blogPosts.categoryId, parseInt(id)),
          eq(blogPosts.status, 'published')
        )
      )
      .limit(1);

    if (postsWithCategory.length > 0) {
      return NextResponse.json(
        {
          error: 'Cannot delete category with existing posts',
          code: 'CATEGORY_IN_USE',
        },
        { status: 400 }
      );
    }

    const deletedCategory = await db
      .delete(blogCategories)
      .where(eq(blogCategories.id, parseInt(id)))
      .returning();

    return NextResponse.json({
      message: 'Category deleted successfully',
      category: deletedCategory[0],
    });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}