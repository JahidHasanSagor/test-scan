import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { reviews } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Validate ID parameter
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const reviewId = parseInt(id);

    // Check if review exists
    const existingReview = await db.select()
      .from(reviews)
      .where(eq(reviews.id, reviewId))
      .limit(1);

    if (existingReview.length === 0) {
      return NextResponse.json({ 
        error: 'Review not found',
        code: 'REVIEW_NOT_FOUND' 
      }, { status: 404 });
    }

    // Delete the review
    const deleted = await db.delete(reviews)
      .where(eq(reviews.id, reviewId))
      .returning();

    return NextResponse.json({
      message: 'Review deleted successfully',
      deletedReview: deleted[0]
    }, { status: 200 });

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}