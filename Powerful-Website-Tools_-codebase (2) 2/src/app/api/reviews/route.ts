import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { reviews, tools } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const toolId = searchParams.get('toolId');

    if (!toolId || isNaN(parseInt(toolId))) {
      return NextResponse.json({
        error: "Valid toolId is required",
        code: "INVALID_TOOL_ID"
      }, { status: 400 });
    }

    const toolIdInt = parseInt(toolId);

    const results = await db.select()
      .from(reviews)
      .where(eq(reviews.toolId, toolIdInt))
      .orderBy(desc(reviews.createdAt));

    return NextResponse.json(results);
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + error
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json();
    const { toolId, userId, rating, content } = requestBody;

    // Validate required fields
    if (!toolId || isNaN(parseInt(toolId))) {
      return NextResponse.json({
        error: "Valid toolId is required",
        code: "INVALID_TOOL_ID"
      }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({
        error: "userId is required",
        code: "MISSING_USER_ID"
      }, { status: 400 });
    }

    if (!rating || !Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({
        error: "Rating must be an integer between 1 and 5",
        code: "INVALID_RATING"
      }, { status: 400 });
    }

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json({
        error: "Content is required and cannot be empty",
        code: "MISSING_CONTENT"
      }, { status: 400 });
    }

    if (content.length > 1000) {
      return NextResponse.json({
        error: "Content cannot exceed 1000 characters",
        code: "CONTENT_TOO_LONG"
      }, { status: 400 });
    }

    const toolIdInt = parseInt(toolId);

    // Check if tool exists
    const toolExists = await db.select()
      .from(tools)
      .where(eq(tools.id, toolIdInt))
      .limit(1);

    if (toolExists.length === 0) {
      return NextResponse.json({
        error: "Tool not found",
        code: "TOOL_NOT_FOUND"
      }, { status: 400 });
    }

    // Check for duplicate review (one review per user per tool)
    const existingReview = await db.select()
      .from(reviews)
      .where(and(
        eq(reviews.toolId, toolIdInt),
        eq(reviews.userId, userId)
      ))
      .limit(1);

    if (existingReview.length > 0) {
      return NextResponse.json({
        error: "You have already reviewed this tool",
        code: "DUPLICATE_REVIEW"
      }, { status: 409 });
    }

    // Create new review
    const newReview = await db.insert(reviews)
      .values({
        toolId: toolIdInt,
        userId: userId.trim(),
        rating,
        content: content.trim(),
        createdAt: new Date().toISOString()
      })
      .returning();

    return NextResponse.json(newReview[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + error
    }, { status: 500 });
  }
}