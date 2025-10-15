import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { genreCriteria } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authentication check
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'AUTHENTICATION_REQUIRED' },
        { status: 401 }
      );
    }

    // Authorization check - admin only
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    // Get and validate ID
    const { id } = await params;
    const criterionId = parseInt(id);
    
    if (!id || isNaN(criterionId)) {
      return NextResponse.json(
        { error: 'Valid criterion ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if criterion exists
    const existingCriterion = await db.select()
      .from(genreCriteria)
      .where(eq(genreCriteria.id, criterionId))
      .limit(1);

    if (existingCriterion.length === 0) {
      return NextResponse.json(
        { error: 'Criterion not found', code: 'CRITERION_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();
    const {
      category,
      metricKey,
      metricLabel,
      metricIcon,
      metricColor,
      displayOrder,
      isActive
    } = body;

    // Validate provided fields
    if (category !== undefined) {
      if (typeof category !== 'string' || category.trim() === '') {
        return NextResponse.json(
          { error: 'Category must be a non-empty string', code: 'INVALID_CATEGORY' },
          { status: 400 }
        );
      }
    }

    if (metricKey !== undefined) {
      if (typeof metricKey !== 'string' || metricKey.trim() === '') {
        return NextResponse.json(
          { error: 'Metric key must be a non-empty string', code: 'INVALID_METRIC_KEY' },
          { status: 400 }
        );
      }
    }

    if (metricLabel !== undefined) {
      if (typeof metricLabel !== 'string' || metricLabel.trim() === '') {
        return NextResponse.json(
          { error: 'Metric label must be a non-empty string', code: 'INVALID_METRIC_LABEL' },
          { status: 400 }
        );
      }
    }

    if (metricIcon !== undefined && metricIcon !== null) {
      if (typeof metricIcon !== 'string') {
        return NextResponse.json(
          { error: 'Metric icon must be a string', code: 'INVALID_METRIC_ICON' },
          { status: 400 }
        );
      }
    }

    if (metricColor !== undefined && metricColor !== null) {
      if (typeof metricColor !== 'string') {
        return NextResponse.json(
          { error: 'Metric color must be a string', code: 'INVALID_METRIC_COLOR' },
          { status: 400 }
        );
      }
    }

    if (displayOrder !== undefined) {
      if (typeof displayOrder !== 'number' || !Number.isInteger(displayOrder)) {
        return NextResponse.json(
          { error: 'Display order must be an integer', code: 'INVALID_DISPLAY_ORDER' },
          { status: 400 }
        );
      }
    }

    if (isActive !== undefined) {
      if (typeof isActive !== 'boolean') {
        return NextResponse.json(
          { error: 'isActive must be a boolean', code: 'INVALID_IS_ACTIVE' },
          { status: 400 }
        );
      }
    }

    // Prepare update data with only provided fields
    const updateData: any = {
      updatedAt: new Date().toISOString()
    };

    if (category !== undefined) updateData.category = category.trim();
    if (metricKey !== undefined) updateData.metricKey = metricKey.trim();
    if (metricLabel !== undefined) updateData.metricLabel = metricLabel.trim();
    if (metricIcon !== undefined) updateData.metricIcon = metricIcon;
    if (metricColor !== undefined) updateData.metricColor = metricColor;
    if (displayOrder !== undefined) updateData.displayOrder = displayOrder;
    if (isActive !== undefined) updateData.isActive = isActive;

    // Update criterion
    const updatedCriterion = await db.update(genreCriteria)
      .set(updateData)
      .where(eq(genreCriteria.id, criterionId))
      .returning();

    if (updatedCriterion.length === 0) {
      return NextResponse.json(
        { error: 'Failed to update criterion', code: 'UPDATE_FAILED' },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedCriterion[0], { status: 200 });

  } catch (error) {
    console.error('PUT /api/genre-criteria/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error, code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authentication check
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'AUTHENTICATION_REQUIRED' },
        { status: 401 }
      );
    }

    // Authorization check - admin only
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    // Get and validate ID
    const { id } = await params;
    const criterionId = parseInt(id);
    
    if (!id || isNaN(criterionId)) {
      return NextResponse.json(
        { error: 'Valid criterion ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if criterion exists
    const existingCriterion = await db.select()
      .from(genreCriteria)
      .where(eq(genreCriteria.id, criterionId))
      .limit(1);

    if (existingCriterion.length === 0) {
      return NextResponse.json(
        { error: 'Criterion not found', code: 'CRITERION_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Hard delete the criterion
    const deletedCriterion = await db.delete(genreCriteria)
      .where(eq(genreCriteria.id, criterionId))
      .returning();

    if (deletedCriterion.length === 0) {
      return NextResponse.json(
        { error: 'Failed to delete criterion', code: 'DELETE_FAILED' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'Criterion deleted successfully',
        deletedCriterion: deletedCriterion[0]
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('DELETE /api/genre-criteria/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error, code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}