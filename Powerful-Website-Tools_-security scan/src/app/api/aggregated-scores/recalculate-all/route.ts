import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { tools, structuredReviews, aggregatedScores, user } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'AUTHENTICATION_REQUIRED' 
      }, { status: 401 });
    }

    // Admin authorization check
    if (currentUser.role !== 'admin') {
      return NextResponse.json({ 
        error: 'Admin access required',
        code: 'FORBIDDEN' 
      }, { status: 403 });
    }

    // Fetch all tools from database
    const allTools = await db.select().from(tools);

    if (allTools.length === 0) {
      return NextResponse.json({
        message: 'No tools found to recalculate',
        totalTools: 0,
        successful: 0,
        failed: 0,
        failures: []
      }, { status: 200 });
    }

    let successful = 0;
    let failed = 0;
    const failures: Array<{ toolId: number; error: string }> = [];

    // Process each tool
    for (const tool of allTools) {
      try {
        // Fetch approved structured reviews for this tool
        const reviews = await db.select({
          id: structuredReviews.id,
          toolId: structuredReviews.toolId,
          userId: structuredReviews.userId,
          category: structuredReviews.category,
          metricScores: structuredReviews.metricScores,
          overallRating: structuredReviews.overallRating,
          reviewerType: structuredReviews.reviewerType,
          isVerified: structuredReviews.isVerified,
        })
          .from(structuredReviews)
          .where(
            and(
              eq(structuredReviews.toolId, tool.id),
              eq(structuredReviews.status, 'approved')
            )
          );

        if (reviews.length === 0) {
          // No approved reviews, skip or create empty aggregation
          await db.insert(aggregatedScores)
            .values({
              toolId: tool.id,
              category: tool.category,
              metricScores: JSON.stringify({}),
              overallAverage: 0,
              totalReviews: 0,
              verifiedReviews: 0,
              editorialReviews: 0,
              confidenceScore: 0,
              lastCalculatedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            })
            .onConflictDoUpdate({
              target: aggregatedScores.toolId,
              set: {
                totalReviews: 0,
                verifiedReviews: 0,
                editorialReviews: 0,
                overallAverage: 0,
                metricScores: JSON.stringify({}),
                confidenceScore: 0,
                lastCalculatedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              }
            });
          
          successful++;
          continue;
        }

        // Calculate weighted metrics
        let totalReviews = 0;
        let verifiedReviews = 0;
        let editorialReviews = 0;
        const metricTotals: Record<string, { sum: number; count: number }> = {};
        let overallSum = 0;
        let overallCount = 0;

        for (const review of reviews) {
          // Determine weight: verified users get 1.5x weight, editorial gets 2x
          let weight = 1;
          if (review.reviewerType === 'editorial') {
            weight = 2;
            editorialReviews++;
          } else if (review.isVerified) {
            weight = 1.5;
            verifiedReviews++;
          }

          totalReviews++;

          // Process metric scores
          if (review.metricScores) {
            const scores = typeof review.metricScores === 'string' 
              ? JSON.parse(review.metricScores) 
              : review.metricScores;

            for (const [metricKey, score] of Object.entries(scores)) {
              if (typeof score === 'number') {
                if (!metricTotals[metricKey]) {
                  metricTotals[metricKey] = { sum: 0, count: 0 };
                }
                metricTotals[metricKey].sum += score * weight;
                metricTotals[metricKey].count += weight;
              }
            }
          }

          // Process overall rating
          if (review.overallRating) {
            overallSum += review.overallRating * weight;
            overallCount += weight;
          }
        }

        // Calculate averages
        const aggregatedMetrics: Record<string, number> = {};
        for (const [metricKey, totals] of Object.entries(metricTotals)) {
          aggregatedMetrics[metricKey] = totals.count > 0 
            ? Math.round((totals.sum / totals.count) * 10) / 10 
            : 0;
        }

        const overallAverage = overallCount > 0 
          ? Math.round((overallSum / overallCount) * 10) / 10 
          : 0;

        // Calculate confidence score
        // Formula: Base score from review count, bonus for verified/editorial reviews
        let confidenceScore = 0;
        if (totalReviews > 0) {
          const reviewCountScore = Math.min(totalReviews * 10, 50); // Max 50 points for review count
          const verifiedBonus = verifiedReviews * 5; // 5 points per verified review
          const editorialBonus = editorialReviews * 10; // 10 points per editorial review
          confidenceScore = Math.min(reviewCountScore + verifiedBonus + editorialBonus, 100);
        }

        // Upsert aggregated scores
        await db.insert(aggregatedScores)
          .values({
            toolId: tool.id,
            category: tool.category,
            metricScores: JSON.stringify(aggregatedMetrics),
            overallAverage: overallAverage,
            totalReviews: totalReviews,
            verifiedReviews: verifiedReviews,
            editorialReviews: editorialReviews,
            confidenceScore: Math.round(confidenceScore * 10) / 10,
            lastCalculatedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })
          .onConflictDoUpdate({
            target: aggregatedScores.toolId,
            set: {
              category: tool.category,
              metricScores: JSON.stringify(aggregatedMetrics),
              overallAverage: overallAverage,
              totalReviews: totalReviews,
              verifiedReviews: verifiedReviews,
              editorialReviews: editorialReviews,
              confidenceScore: Math.round(confidenceScore * 10) / 10,
              lastCalculatedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
          });

        successful++;
      } catch (error) {
        console.error(`Error recalculating scores for tool ${tool.id}:`, error);
        failed++;
        failures.push({
          toolId: tool.id,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return NextResponse.json({
      message: 'Recalculation completed',
      totalTools: allTools.length,
      successful,
      failed,
      failures
    }, { status: 200 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
      code: 'INTERNAL_SERVER_ERROR'
    }, { status: 500 });
  }
}