import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { similarTools, tools } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { toolId: string } }
) {
  try {
    const toolId = params.toolId;

    // Validate toolId parameter
    if (!toolId || isNaN(parseInt(toolId))) {
      return NextResponse.json({ 
        error: "Valid tool ID is required",
        code: "INVALID_TOOL_ID" 
      }, { status: 400 });
    }

    const toolIdNum = parseInt(toolId);

    // Check if the base tool exists and is approved
    const baseTool = await db.select()
      .from(tools)
      .where(and(eq(tools.id, toolIdNum), eq(tools.status, 'approved')))
      .limit(1);

    if (baseTool.length === 0) {
      return NextResponse.json({ 
        error: 'Tool not found or not approved' 
      }, { status: 404 });
    }

    // Get similar tools with complete tool information
    const similarToolsData = await db.select({
      id: similarTools.id,
      toolId: similarTools.toolId,
      similarToolId: similarTools.similarToolId,
      relevanceScore: similarTools.relevanceScore,
      similarTool: {
        id: tools.id,
        title: tools.title,
        description: tools.description,
        url: tools.url,
        image: tools.image,
        category: tools.category,
        pricing: tools.pricing,
        type: tools.type,
        features: tools.features,
        popularity: tools.popularity,
        isFeatured: tools.isFeatured,
        status: tools.status,
        submittedByUserId: tools.submittedByUserId,
        createdAt: tools.createdAt,
        updatedAt: tools.updatedAt
      }
    })
    .from(similarTools)
    .innerJoin(tools, eq(similarTools.similarToolId, tools.id))
    .where(and(
      eq(similarTools.toolId, toolIdNum),
      eq(tools.status, 'approved')
    ))
    .orderBy(desc(similarTools.relevanceScore));

    // Transform the data to include relevance scores with similar tools
    const formattedSimilarTools = similarToolsData.map(item => ({
      ...item.similarTool,
      relevanceScore: item.relevanceScore
    }));

    return NextResponse.json(formattedSimilarTools);

  } catch (error) {
    console.error('GET similar tools error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}