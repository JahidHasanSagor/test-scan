import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { genreCriteria } from '@/db/schema';
import { eq, and, asc } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    let query = db.select().from(genreCriteria);

    // Filter by active criteria
    const conditions = [eq(genreCriteria.isActive, true)];

    // Add category filter if provided
    if (category) {
      conditions.push(eq(genreCriteria.category, category));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Order by category and displayOrder
    const results = await query
      .orderBy(asc(genreCriteria.category), asc(genreCriteria.displayOrder));

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + error,
        code: 'INTERNAL_SERVER_ERROR'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { 
          error: 'Authentication required',
          code: 'AUTHENTICATION_REQUIRED'
        },
        { status: 401 }
      );
    }

    // Admin authorization check
    if (user.role !== 'admin') {
      return NextResponse.json(
        { 
          error: 'Admin access required',
          code: 'FORBIDDEN'
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { 
      category, 
      metricKey, 
      metricLabel, 
      metricIcon, 
      metricColor, 
      displayOrder 
    } = body;

    // Validate required fields
    if (!category || typeof category !== 'string' || category.trim() === '') {
      return NextResponse.json(
        { 
          error: 'Category is required and must be a non-empty string',
          code: 'INVALID_CATEGORY'
        },
        { status: 400 }
      );
    }

    if (!metricKey || typeof metricKey !== 'string' || metricKey.trim() === '') {
      return NextResponse.json(
        { 
          error: 'Metric key is required and must be a non-empty string',
          code: 'INVALID_METRIC_KEY'
        },
        { status: 400 }
      );
    }

    if (!metricLabel || typeof metricLabel !== 'string' || metricLabel.trim() === '') {
      return NextResponse.json(
        { 
          error: 'Metric label is required and must be a non-empty string',
          code: 'INVALID_METRIC_LABEL'
        },
        { status: 400 }
      );
    }

    // Validate optional metricColor (hex color format)
    if (metricColor && typeof metricColor === 'string') {
      const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
      if (!hexColorRegex.test(metricColor)) {
        return NextResponse.json(
          { 
            error: 'Metric color must be a valid hex color (e.g., #FF5733)',
            code: 'INVALID_METRIC_COLOR'
          },
          { status: 400 }
        );
      }
    }

    // Validate displayOrder if provided
    if (displayOrder !== undefined && displayOrder !== null) {
      if (typeof displayOrder !== 'number' || !Number.isInteger(displayOrder)) {
        return NextResponse.json(
          { 
            error: 'Display order must be an integer',
            code: 'INVALID_DISPLAY_ORDER'
          },
          { status: 400 }
        );
      }
    }

    // Check for duplicate metricKey within the same category
    const existingCriteria = await db.select()
      .from(genreCriteria)
      .where(
        and(
          eq(genreCriteria.category, category.trim()),
          eq(genreCriteria.metricKey, metricKey.trim())
        )
      )
      .limit(1);

    if (existingCriteria.length > 0) {
      return NextResponse.json(
        { 
          error: 'A criterion with this metric key already exists in this category',
          code: 'DUPLICATE_METRIC_KEY'
        },
        { status: 400 }
      );
    }

    // Prepare insert data with auto-generated fields
    const now = new Date().toISOString();
    const insertData: any = {
      category: category.trim(),
      metricKey: metricKey.trim(),
      metricLabel: metricLabel.trim(),
      displayOrder: displayOrder !== undefined && displayOrder !== null ? displayOrder : 0,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    // Add optional fields if provided
    if (metricIcon && typeof metricIcon === 'string' && metricIcon.trim() !== '') {
      insertData.metricIcon = metricIcon.trim();
    }

    if (metricColor && typeof metricColor === 'string' && metricColor.trim() !== '') {
      insertData.metricColor = metricColor.trim();
    }

    // Insert new criterion
    const newCriterion = await db.insert(genreCriteria)
      .values(insertData)
      .returning();

    return NextResponse.json(newCriterion[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + error,
        code: 'INTERNAL_SERVER_ERROR'
      },
      { status: 500 }
    );
  }
}