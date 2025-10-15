import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { tools, reviews } from '@/db/schema';
import { eq, count, avg, gte } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Get current date for monthly calculations
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    // Total tools count (all statuses)
    const totalToolsResult = await db.select({ count: count() }).from(tools);
    const totalTools = totalToolsResult[0]?.count || 0;

    // Approved tools count
    const approvedToolsResult = await db
      .select({ count: count() })
      .from(tools)
      .where(eq(tools.status, 'approved'));
    const approvedTools = approvedToolsResult[0]?.count || 0;

    // Pending tools count
    const pendingToolsResult = await db
      .select({ count: count() })
      .from(tools)
      .where(eq(tools.status, 'pending'));
    const pendingTools = pendingToolsResult[0]?.count || 0;

    // Total reviews count
    const totalReviewsResult = await db.select({ count: count() }).from(reviews);
    const totalReviews = totalReviewsResult[0]?.count || 0;

    // Average rating across all tools
    const avgRatingResult = await db.select({ avgRating: avg(reviews.rating) }).from(reviews);
    const averageRating = parseFloat(avgRatingResult[0]?.avgRating || '0');

    // Popular categories (count of tools per category)
    const categoriesResult = await db
      .select({ 
        category: tools.category, 
        count: count() 
      })
      .from(tools)
      .groupBy(tools.category)
      .orderBy(count());
    
    const popularCategories = categoriesResult.map(cat => ({
      category: cat.category,
      count: cat.count
    }));

    // Tools added this month
    const toolsThisMonthResult = await db
      .select({ count: count() })
      .from(tools)
      .where(gte(tools.createdAt, startOfMonth));
    const toolsThisMonth = toolsThisMonthResult[0]?.count || 0;

    // Reviews added this month
    const reviewsThisMonthResult = await db
      .select({ count: count() })
      .from(reviews)
      .where(gte(reviews.createdAt, startOfMonth));
    const reviewsThisMonth = reviewsThisMonthResult[0]?.count || 0;

    const stats = {
      totalTools,
      approvedTools,
      pendingTools,
      totalReviews,
      averageRating: Math.round(averageRating * 100) / 100, // Round to 2 decimal places
      popularCategories,
      toolsThisMonth,
      reviewsThisMonth,
      generatedAt: new Date().toISOString()
    };

    return NextResponse.json(stats, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error,
      code: 'INTERNAL_ERROR'
    }, { status: 500 });
  }
}