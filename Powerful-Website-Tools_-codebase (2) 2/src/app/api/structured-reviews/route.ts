import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { structuredReviews, tools, user } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const toolId = searchParams.get('toolId');
    const status = searchParams.get('status');
    const reviewerType = searchParams.get('reviewerType');

    // Validate required toolId parameter
    if (!toolId) {
      return NextResponse.json(
        { 
          error: 'toolId query parameter is required',
          code: 'MISSING_TOOL_ID'
        },
        { status: 400 }
      );
    }

    if (isNaN(parseInt(toolId))) {
      return NextResponse.json(
        { 
          error: 'toolId must be a valid integer',
          code: 'INVALID_TOOL_ID'
        },
        { status: 400 }
      );
    }

    // Build query with filters
    let conditions = [eq(structuredReviews.toolId, parseInt(toolId))];

    if (status) {
      conditions.push(eq(structuredReviews.status, status));
    }

    if (reviewerType) {
      conditions.push(eq(structuredReviews.reviewerType, reviewerType));
    }

    // Fetch reviews with user information
    const reviews = await db
      .select({
        id: structuredReviews.id,
        toolId: structuredReviews.toolId,
        userId: structuredReviews.userId,
        category: structuredReviews.category,
        metricScores: structuredReviews.metricScores,
        metricComments: structuredReviews.metricComments,
        overallRating: structuredReviews.overallRating,
        reviewText: structuredReviews.reviewText,
        reviewerType: structuredReviews.reviewerType,
        isVerified: structuredReviews.isVerified,
        status: structuredReviews.status,
        createdAt: structuredReviews.createdAt,
        updatedAt: structuredReviews.updatedAt,
        userName: user.name,
        userImage: user.image,
      })
      .from(structuredReviews)
      .leftJoin(user, eq(structuredReviews.userId, user.id))
      .where(and(...conditions))
      .orderBy(desc(structuredReviews.createdAt));

    return NextResponse.json(reviews, { status: 200 });
  } catch (error) {
    console.error('GET structured reviews error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + error,
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const authenticatedUser = await getCurrentUser(request);
    if (!authenticatedUser) {
      return NextResponse.json(
        { 
          error: 'Authentication required',
          code: 'UNAUTHORIZED'
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Security check: reject if userId provided in body
    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json(
        { 
          error: 'User ID cannot be provided in request body',
          code: 'USER_ID_NOT_ALLOWED'
        },
        { status: 400 }
      );
    }

    const {
      toolId,
      metricScores,
      metricComments,
      overallRating,
      reviewText
    } = body;

    // Validate required fields
    if (!toolId) {
      return NextResponse.json(
        { 
          error: 'toolId is required',
          code: 'MISSING_TOOL_ID'
        },
        { status: 400 }
      );
    }

    if (typeof toolId !== 'number' || isNaN(toolId)) {
      return NextResponse.json(
        { 
          error: 'toolId must be a valid integer',
          code: 'INVALID_TOOL_ID'
        },
        { status: 400 }
      );
    }

    if (!metricScores) {
      return NextResponse.json(
        { 
          error: 'metricScores is required',
          code: 'MISSING_METRIC_SCORES'
        },
        { status: 400 }
      );
    }

    if (typeof metricScores !== 'object' || Array.isArray(metricScores)) {
      return NextResponse.json(
        { 
          error: 'metricScores must be an object',
          code: 'INVALID_METRIC_SCORES_TYPE'
        },
        { status: 400 }
      );
    }

    const metricKeys = Object.keys(metricScores);
    if (metricKeys.length === 0) {
      return NextResponse.json(
        { 
          error: 'metricScores must contain at least one metric',
          code: 'EMPTY_METRIC_SCORES'
        },
        { status: 400 }
      );
    }

    // Validate each metric score
    for (const [key, value] of Object.entries(metricScores)) {
      if (typeof value !== 'number' || !Number.isInteger(value) || value < 1 || value > 10) {
        return NextResponse.json(
          { 
            error: `Metric score for ${key} must be an integer between 1 and 10`,
            code: 'INVALID_METRIC_SCORE_VALUE'
          },
          { status: 400 }
        );
      }
    }

    if (!overallRating) {
      return NextResponse.json(
        { 
          error: 'overallRating is required',
          code: 'MISSING_OVERALL_RATING'
        },
        { status: 400 }
      );
    }

    if (typeof overallRating !== 'number' || !Number.isInteger(overallRating) || overallRating < 1 || overallRating > 10) {
      return NextResponse.json(
        { 
          error: 'overallRating must be an integer between 1 and 10',
          code: 'INVALID_OVERALL_RATING'
        },
        { status: 400 }
      );
    }

    // Validate optional reviewText
    if (reviewText !== undefined && reviewText !== null) {
      if (typeof reviewText !== 'string') {
        return NextResponse.json(
          { 
            error: 'reviewText must be a string',
            code: 'INVALID_REVIEW_TEXT_TYPE'
          },
          { status: 400 }
        );
      }

      if (reviewText.length > 2000) {
        return NextResponse.json(
          { 
            error: 'reviewText must not exceed 2000 characters',
            code: 'REVIEW_TEXT_TOO_LONG'
          },
          { status: 400 }
        );
      }
    }

    // Validate optional metricComments
    if (metricComments !== undefined && metricComments !== null) {
      if (typeof metricComments !== 'object' || Array.isArray(metricComments)) {
        return NextResponse.json(
          { 
            error: 'metricComments must be an object',
            code: 'INVALID_METRIC_COMMENTS_TYPE'
          },
          { status: 400 }
        );
      }

      for (const [key, value] of Object.entries(metricComments)) {
        if (typeof value !== 'string') {
          return NextResponse.json(
            { 
              error: `Metric comment for ${key} must be a string`,
              code: 'INVALID_METRIC_COMMENT_VALUE'
            },
            { status: 400 }
          );
        }
      }
    }

    // Check if tool exists and get its category
    const tool = await db
      .select()
      .from(tools)
      .where(eq(tools.id, toolId))
      .limit(1);

    if (tool.length === 0) {
      return NextResponse.json(
        { 
          error: 'Tool not found',
          code: 'TOOL_NOT_FOUND'
        },
        { status: 400 }
      );
    }

    const toolCategory = tool[0].category;

    // Check if user has already reviewed this tool
    const existingReview = await db
      .select()
      .from(structuredReviews)
      .where(
        and(
          eq(structuredReviews.toolId, toolId),
          eq(structuredReviews.userId, authenticatedUser.id)
        )
      )
      .limit(1);

    if (existingReview.length > 0) {
      return NextResponse.json(
        { 
          error: 'You have already reviewed this tool',
          code: 'DUPLICATE_REVIEW'
        },
        { status: 409 }
      );
    }

    // Determine reviewer type and verification status
    const reviewerType = authenticatedUser.emailVerified ? 'verified' : 'user';
    const isVerified = authenticatedUser.emailVerified || false;

    // Prepare insert data
    const now = new Date().toISOString();
    const insertData = {
      toolId,
      userId: authenticatedUser.id,
      category: toolCategory,
      metricScores: JSON.stringify(metricScores),
      metricComments: metricComments ? JSON.stringify(metricComments) : null,
      overallRating,
      reviewText: reviewText ? reviewText.trim() : null,
      reviewerType,
      isVerified,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    };

    // Insert the review
    const newReview = await db
      .insert(structuredReviews)
      .values(insertData)
      .returning();

    return NextResponse.json(newReview[0], { status: 201 });
  } catch (error) {
    console.error('POST structured review error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + error,
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}