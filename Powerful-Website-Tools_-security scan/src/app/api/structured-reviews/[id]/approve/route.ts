import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { structuredReviews } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function PATCH(
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

    // Admin role check
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    // Validate ID parameter
    const id = params.id;
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid review ID is required', code: 'INVALID_ID' },
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

    // Check if review is in pending status
    if (review.status !== 'pending') {
      return NextResponse.json(
        {
          error: `Review is already ${review.status}. Only pending reviews can be approved.`,
          code: 'INVALID_REVIEW_STATUS',
        },
        { status: 400 }
      );
    }

    // Update review status to approved
    const updatedReview = await db
      .update(structuredReviews)
      .set({
        status: 'approved',
        updatedAt: new Date().toISOString(),
      })
      .where(eq(structuredReviews.id, reviewId))
      .returning();

    if (updatedReview.length === 0) {
      return NextResponse.json(
        { error: 'Failed to approve review', code: 'UPDATE_FAILED' },
        { status: 500 }
      );
    }

    // Trigger aggregated score recalculation for the tool
    const toolId = review.toolId;
    if (toolId) {
      try {
        // Call the recalculation API endpoint
        const recalculateResponse = await fetch(
          `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/aggregated-scores/recalculate?toolId=${toolId}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (!recalculateResponse.ok) {
          console.error(
            'Failed to recalculate aggregated scores for tool:',
            toolId
          );
        }
      } catch (recalcError) {
        console.error(
          'Error calling aggregated scores recalculation:',
          recalcError
        );
        // Continue execution - score recalculation failure shouldn't fail the approval
      }
    }

    return NextResponse.json(
      {
        message: 'Review approved successfully',
        review: updatedReview[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('PATCH error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error, code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}