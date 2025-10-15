import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { structuredReviews } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    // Validate ID parameter
    const id = params.id;
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const reviewId = parseInt(id);

    // Check if review exists
    const existingReview = await db
      .select()
      .from(structuredReviews)
      .where(eq(structuredReviews.id, reviewId))
      .limit(1);

    if (existingReview.length === 0) {
      return NextResponse.json(
        { error: 'Review not found', code: 'REVIEW_NOT_FOUND' },
        { status: 404 }
      );
    }

    const review = existingReview[0];

    // Authorization check: must be author or admin
    const isAuthor = review.userId === user.id;
    const isAdmin = user.role === 'admin';

    if (!isAuthor && !isAdmin) {
      return NextResponse.json(
        {
          error: 'You are not authorized to update this review',
          code: 'FORBIDDEN',
        },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Security check: reject forbidden fields
    const forbiddenFields = [
      'userId',
      'user_id',
      'toolId',
      'tool_id',
      'category',
      'reviewerType',
      'reviewer_type',
      'isVerified',
      'is_verified',
      'status',
    ];

    for (const field of forbiddenFields) {
      if (field in body) {
        return NextResponse.json(
          {
            error: `Field '${field}' cannot be updated through this endpoint`,
            code: 'FORBIDDEN_FIELD',
          },
          { status: 400 }
        );
      }
    }

    // Extract and validate allowed fields
    const { metricScores, metricComments, overallRating, reviewText } = body;

    // Validate metricScores if provided
    if (metricScores !== undefined) {
      if (typeof metricScores !== 'object' || metricScores === null) {
        return NextResponse.json(
          {
            error: 'metricScores must be a valid object',
            code: 'INVALID_METRIC_SCORES',
          },
          { status: 400 }
        );
      }

      // Validate all scores are between 1 and 10
      for (const [key, value] of Object.entries(metricScores)) {
        if (
          typeof value !== 'number' ||
          value < 1 ||
          value > 10 ||
          !Number.isInteger(value)
        ) {
          return NextResponse.json(
            {
              error: `Metric score '${key}' must be an integer between 1 and 10`,
              code: 'INVALID_METRIC_SCORE_VALUE',
            },
            { status: 400 }
          );
        }
      }
    }

    // Validate metricComments if provided
    if (metricComments !== undefined) {
      if (typeof metricComments !== 'object' || metricComments === null) {
        return NextResponse.json(
          {
            error: 'metricComments must be a valid object',
            code: 'INVALID_METRIC_COMMENTS',
          },
          { status: 400 }
        );
      }
    }

    // Validate overallRating if provided
    if (overallRating !== undefined) {
      if (
        typeof overallRating !== 'number' ||
        overallRating < 1 ||
        overallRating > 10 ||
        !Number.isInteger(overallRating)
      ) {
        return NextResponse.json(
          {
            error: 'overallRating must be an integer between 1 and 10',
            code: 'INVALID_OVERALL_RATING',
          },
          { status: 400 }
        );
      }
    }

    // Validate reviewText if provided
    if (reviewText !== undefined) {
      if (typeof reviewText !== 'string') {
        return NextResponse.json(
          {
            error: 'reviewText must be a string',
            code: 'INVALID_REVIEW_TEXT',
          },
          { status: 400 }
        );
      }

      if (reviewText.trim().length > 2000) {
        return NextResponse.json(
          {
            error: 'reviewText must not exceed 2000 characters',
            code: 'REVIEW_TEXT_TOO_LONG',
          },
          { status: 400 }
        );
      }
    }

    // Build update object with only provided fields
    const updates: any = {
      updatedAt: new Date().toISOString(),
    };

    if (metricScores !== undefined) {
      updates.metricScores = metricScores;
    }

    if (metricComments !== undefined) {
      updates.metricComments = metricComments;
    }

    if (overallRating !== undefined) {
      updates.overallRating = overallRating;
    }

    if (reviewText !== undefined) {
      updates.reviewText = reviewText.trim();
    }

    // Update the review
    const updated = await db
      .update(structuredReviews)
      .set(updates)
      .where(eq(structuredReviews.id, reviewId))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { error: 'Failed to update review', code: 'UPDATE_FAILED' },
        { status: 500 }
      );
    }

    return NextResponse.json(updated[0], { status: 200 });
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
  { params }: { params: { id: string } }
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

    // Validate ID parameter
    const id = params.id;
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const reviewId = parseInt(id);

    // Check if review exists
    const existingReview = await db
      .select()
      .from(structuredReviews)
      .where(eq(structuredReviews.id, reviewId))
      .limit(1);

    if (existingReview.length === 0) {
      return NextResponse.json(
        { error: 'Review not found', code: 'REVIEW_NOT_FOUND' },
        { status: 404 }
      );
    }

    const review = existingReview[0];

    // Authorization check: must be author or admin
    const isAuthor = review.userId === user.id;
    const isAdmin = user.role === 'admin';

    if (!isAuthor && !isAdmin) {
      return NextResponse.json(
        {
          error: 'You are not authorized to delete this review',
          code: 'FORBIDDEN',
        },
        { status: 403 }
      );
    }

    // Delete the review
    const deleted = await db
      .delete(structuredReviews)
      .where(eq(structuredReviews.id, reviewId))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json(
        { error: 'Failed to delete review', code: 'DELETE_FAILED' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'Review deleted successfully',
        deletedReview: deleted[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}