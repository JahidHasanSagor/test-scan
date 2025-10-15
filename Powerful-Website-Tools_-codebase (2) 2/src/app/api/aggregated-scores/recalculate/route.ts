import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { structuredReviews, aggregatedScores, tools } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'AUTHENTICATION_REQUIRED' },
        { status: 401 }
      );
    }

    // Admin authorization check
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required', code: 'UNAUTHORIZED' },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const { toolId } = body;

    // Validate toolId
    if (!toolId) {
      return NextResponse.json(
        { error: 'toolId is required', code: 'MISSING_TOOL_ID' },
        { status: 400 }
      );
    }

    if (isNaN(parseInt(String(toolId)))) {
      return NextResponse.json(
        { error: 'Valid toolId is required', code: 'INVALID_TOOL_ID' },
        { status: 400 }
      );
    }

    const parsedToolId = parseInt(String(toolId));

    // Check if tool exists
    const toolExists = await db
      .select()
      .from(tools)
      .where(eq(tools.id, parsedToolId))
      .limit(1);

    if (toolExists.length === 0) {
      return NextResponse.json(
        { error: 'Tool not found', code: 'TOOL_NOT_FOUND' },
        { status: 404 }
      );
    }

    const tool = toolExists[0];

    // Fetch all approved structured reviews for this tool
    const approvedReviews = await db
      .select()
      .from(structuredReviews)
      .where(eq(structuredReviews.toolId, parsedToolId));

    const filteredReviews = approvedReviews.filter(
      review => review.status === 'approved'
    );

    // Handle case with no approved reviews
    if (filteredReviews.length === 0) {
      // Check if aggregated score exists and delete it
      const existingScore = await db
        .select()
        .from(aggregatedScores)
        .where(eq(aggregatedScores.toolId, parsedToolId))
        .limit(1);

      if (existingScore.length > 0) {
        await db
          .delete(aggregatedScores)
          .where(eq(aggregatedScores.toolId, parsedToolId));
      }

      return NextResponse.json({
        message: 'No approved reviews found. Aggregated scores cleared.',
        toolId: parsedToolId,
        aggregatedScores: null,
        reviewsProcessed: 0,
      });
    }

    // Initialize metric aggregation structure
    const metricAggregation: Record<
      string,
      { scores: number[]; weights: number[] }
    > = {};

    let totalReviews = 0;
    let verifiedReviews = 0;
    let editorialReviews = 0;

    // Process each review
    for (const review of filteredReviews) {
      totalReviews++;

      if (review.isVerified) {
        verifiedReviews++;
      }

      if (review.reviewerType === 'editorial' || review.reviewerType === 'editor') {
        editorialReviews++;
      }

      // Determine weight based on verification status
      const weight = review.isVerified ? 1.5 : 1.0;

      // Parse metricScores
      const metricScores =
        typeof review.metricScores === 'string'
          ? JSON.parse(review.metricScores)
          : review.metricScores;

      if (metricScores && typeof metricScores === 'object') {
        for (const [metricKey, score] of Object.entries(metricScores)) {
          if (typeof score === 'number') {
            if (!metricAggregation[metricKey]) {
              metricAggregation[metricKey] = { scores: [], weights: [] };
            }
            metricAggregation[metricKey].scores.push(score);
            metricAggregation[metricKey].weights.push(weight);
          }
        }
      }
    }

    // Calculate aggregated metrics
    const calculatedMetrics: Record<
      string,
      {
        avg: number;
        count: number;
        stdDev: number;
        min: number;
        max: number;
      }
    > = {};

    let sumOfAverages = 0;
    let metricCount = 0;
    let sumOfStdDevs = 0;

    for (const [metricKey, data] of Object.entries(metricAggregation)) {
      const { scores, weights } = data;

      // Calculate weighted average
      const weightedSum = scores.reduce(
        (sum, score, idx) => sum + score * weights[idx],
        0
      );
      const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
      const avg = weightedSum / totalWeight;

      // Calculate standard deviation (using unweighted for simplicity)
      const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      const variance =
        scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) /
        scores.length;
      const stdDev = Math.sqrt(variance);

      // Min and max
      const min = Math.min(...scores);
      const max = Math.max(...scores);

      calculatedMetrics[metricKey] = {
        avg: Math.round(avg * 100) / 100,
        count: scores.length,
        stdDev: Math.round(stdDev * 100) / 100,
        min,
        max,
      };

      sumOfAverages += avg;
      metricCount++;
      sumOfStdDevs += stdDev;
    }

    // Calculate overall average
    const overallAverage =
      metricCount > 0
        ? Math.round((sumOfAverages / metricCount) * 100) / 100
        : 0;

    // Calculate average standard deviation
    const avgStdDev = metricCount > 0 ? sumOfStdDevs / metricCount : 0;

    // Calculate confidence score
    // Formula: min(100, (totalReviews / 10) * 100 - (avgStdDev * 10))
    const confidenceScore = Math.min(
      100,
      Math.max(0, (totalReviews / 10) * 100 - avgStdDev * 10)
    );

    // Prepare aggregated scores data
    const aggregatedData = {
      toolId: parsedToolId,
      category: tool.category,
      metricScores: JSON.stringify(calculatedMetrics),
      overallAverage,
      totalReviews,
      verifiedReviews,
      editorialReviews,
      confidenceScore: Math.round(confidenceScore * 100) / 100,
      lastCalculatedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Check if aggregated score already exists
    const existingScore = await db
      .select()
      .from(aggregatedScores)
      .where(eq(aggregatedScores.toolId, parsedToolId))
      .limit(1);

    let result;

    if (existingScore.length > 0) {
      // Update existing record
      result = await db
        .update(aggregatedScores)
        .set(aggregatedData)
        .where(eq(aggregatedScores.toolId, parsedToolId))
        .returning();
    } else {
      // Insert new record
      result = await db.insert(aggregatedScores).values(aggregatedData).returning();
    }

    return NextResponse.json(
      {
        message: 'Aggregated scores recalculated successfully',
        toolId: parsedToolId,
        aggregatedScores: result[0],
        reviewsProcessed: totalReviews,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error instanceof Error ? error.message : String(error)),
        code: 'INTERNAL_SERVER_ERROR',
      },
      { status: 500 }
    );
  }
}