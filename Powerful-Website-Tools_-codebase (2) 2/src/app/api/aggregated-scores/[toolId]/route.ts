import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { aggregatedScores, editorialScores, tools } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { toolId: string } }
) {
  try {
    const { toolId } = params;

    // Validate toolId parameter
    if (!toolId || isNaN(parseInt(toolId))) {
      return NextResponse.json(
        { 
          error: 'Valid tool ID is required',
          code: 'INVALID_TOOL_ID' 
        },
        { status: 400 }
      );
    }

    const toolIdInt = parseInt(toolId);

    // Check if tool exists
    const tool = await db.select()
      .from(tools)
      .where(eq(tools.id, toolIdInt))
      .limit(1);

    if (tool.length === 0) {
      return NextResponse.json(
        { 
          error: 'Tool not found',
          code: 'TOOL_NOT_FOUND' 
        },
        { status: 404 }
      );
    }

    const toolData = tool[0];

    // Step 1: Try to fetch aggregated scores
    const aggregated = await db.select()
      .from(aggregatedScores)
      .where(eq(aggregatedScores.toolId, toolIdInt))
      .limit(1);

    const aggregatedData = aggregated.length > 0 ? aggregated[0] : null;

    // Step 2: Check if aggregated scores are reliable (confidenceScore >= 30)
    if (aggregatedData && aggregatedData.confidenceScore !== null && aggregatedData.confidenceScore >= 30) {
      // Return aggregated scores as recommended
      return NextResponse.json({
        aggregated: aggregatedData,
        editorial: null,
        recommended: 'aggregated'
      }, { status: 200 });
    }

    // Step 3: Fetch editorial scores as fallback
    const editorial = await db.select()
      .from(editorialScores)
      .where(
        and(
          eq(editorialScores.toolId, toolIdInt),
          eq(editorialScores.isActive, true)
        )
      )
      .limit(1);

    const editorialData = editorial.length > 0 ? editorial[0] : null;

    if (editorialData) {
      // Return editorial scores as recommended
      const fallbackReason = aggregatedData 
        ? 'Low confidence score' 
        : 'No aggregated scores';

      return NextResponse.json({
        aggregated: aggregatedData,
        editorial: editorialData,
        recommended: 'editorial',
        fallbackReason
      }, { status: 200 });
    }

    // Step 4: Fall back to tool's default spider chart values
    const toolDefaults = {
      contentQuality: toolData.contentQuality || 5,
      speedEfficiency: toolData.speedEfficiency || 5,
      creativeFeatures: toolData.creativeFeatures || 5,
      integrationOptions: toolData.integrationOptions || 5,
      learningCurve: toolData.learningCurve || 5,
      valueForMoney: toolData.valueForMoney || 5
    };

    return NextResponse.json({
      aggregated: aggregatedData,
      editorial: null,
      recommended: 'default',
      fallbackReason: 'No aggregated or editorial scores',
      toolDefaults
    }, { status: 200 });

  } catch (error) {
    console.error('GET aggregated scores error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + error,
        code: 'INTERNAL_ERROR' 
      },
      { status: 500 }
    );
  }
}