import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { similarTools, tools } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json();
    const { toolId, similarToolId, relevanceScore } = requestBody;

    // Validate required fields
    if (!toolId) {
      return NextResponse.json({ 
        error: "toolId is required",
        code: "MISSING_TOOL_ID" 
      }, { status: 400 });
    }

    if (!similarToolId) {
      return NextResponse.json({ 
        error: "similarToolId is required",
        code: "MISSING_SIMILAR_TOOL_ID" 
      }, { status: 400 });
    }

    // Validate IDs are valid integers
    const parsedToolId = parseInt(toolId);
    const parsedSimilarToolId = parseInt(similarToolId);

    if (isNaN(parsedToolId)) {
      return NextResponse.json({ 
        error: "toolId must be a valid integer",
        code: "INVALID_TOOL_ID" 
      }, { status: 400 });
    }

    if (isNaN(parsedSimilarToolId)) {
      return NextResponse.json({ 
        error: "similarToolId must be a valid integer",
        code: "INVALID_SIMILAR_TOOL_ID" 
      }, { status: 400 });
    }

    // Prevent self-reference
    if (parsedToolId === parsedSimilarToolId) {
      return NextResponse.json({ 
        error: "Tool cannot be similar to itself",
        code: "SELF_REFERENCE_NOT_ALLOWED" 
      }, { status: 400 });
    }

    // Validate relevanceScore if provided
    let validatedRelevanceScore = 50; // default value
    if (relevanceScore !== undefined) {
      const parsedScore = parseInt(relevanceScore);
      if (isNaN(parsedScore) || parsedScore < 0 || parsedScore > 100) {
        return NextResponse.json({ 
          error: "relevanceScore must be between 0 and 100",
          code: "INVALID_RELEVANCE_SCORE" 
        }, { status: 400 });
      }
      validatedRelevanceScore = parsedScore;
    }

    // Validate both tools exist and are approved
    const tool = await db.select()
      .from(tools)
      .where(eq(tools.id, parsedToolId))
      .limit(1);

    if (tool.length === 0) {
      return NextResponse.json({ 
        error: "Tool not found",
        code: "TOOL_NOT_FOUND" 
      }, { status: 404 });
    }

    if (tool[0].status !== 'approved') {
      return NextResponse.json({ 
        error: "Tool must be approved to create similar relationships",
        code: "TOOL_NOT_APPROVED" 
      }, { status: 400 });
    }

    const similarTool = await db.select()
      .from(tools)
      .where(eq(tools.id, parsedSimilarToolId))
      .limit(1);

    if (similarTool.length === 0) {
      return NextResponse.json({ 
        error: "Similar tool not found",
        code: "SIMILAR_TOOL_NOT_FOUND" 
      }, { status: 404 });
    }

    if (similarTool[0].status !== 'approved') {
      return NextResponse.json({ 
        error: "Similar tool must be approved to create relationships",
        code: "SIMILAR_TOOL_NOT_APPROVED" 
      }, { status: 400 });
    }

    // Check if relationship already exists
    const existingRelationship = await db.select()
      .from(similarTools)
      .where(and(
        eq(similarTools.toolId, parsedToolId),
        eq(similarTools.similarToolId, parsedSimilarToolId)
      ))
      .limit(1);

    if (existingRelationship.length > 0) {
      return NextResponse.json({ 
        error: "Similar tool relationship already exists",
        code: "RELATIONSHIP_EXISTS" 
      }, { status: 400 });
    }

    // Create the similar tool relationship
    const newRelationship = await db.insert(similarTools)
      .values({
        toolId: parsedToolId,
        similarToolId: parsedSimilarToolId,
        relevanceScore: validatedRelevanceScore
      })
      .returning();

    return NextResponse.json(newRelationship[0], { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const toolId = searchParams.get('toolId');
    const similarToolId = searchParams.get('similarToolId');

    // Validate required parameters
    if (!toolId) {
      return NextResponse.json({ 
        error: "toolId query parameter is required",
        code: "MISSING_TOOL_ID" 
      }, { status: 400 });
    }

    if (!similarToolId) {
      return NextResponse.json({ 
        error: "similarToolId query parameter is required",
        code: "MISSING_SIMILAR_TOOL_ID" 
      }, { status: 400 });
    }

    // Validate IDs are valid integers
    const parsedToolId = parseInt(toolId);
    const parsedSimilarToolId = parseInt(similarToolId);

    if (isNaN(parsedToolId)) {
      return NextResponse.json({ 
        error: "toolId must be a valid integer",
        code: "INVALID_TOOL_ID" 
      }, { status: 400 });
    }

    if (isNaN(parsedSimilarToolId)) {
      return NextResponse.json({ 
        error: "similarToolId must be a valid integer",
        code: "INVALID_SIMILAR_TOOL_ID" 
      }, { status: 400 });
    }

    // Find and delete the relationship
    const deleted = await db.delete(similarTools)
      .where(and(
        eq(similarTools.toolId, parsedToolId),
        eq(similarTools.similarToolId, parsedSimilarToolId)
      ))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ 
        error: "Similar tool relationship not found",
        code: "RELATIONSHIP_NOT_FOUND" 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      message: "Similar tool relationship deleted successfully",
      deletedRelationship: deleted[0]
    }, { status: 200 });

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}