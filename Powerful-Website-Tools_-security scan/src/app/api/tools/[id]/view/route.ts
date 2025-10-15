import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { tools, toolViews } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const { toolId } = await request.json();

    // Validate required field
    if (!toolId) {
      return NextResponse.json({ 
        error: "Tool ID is required",
        code: "MISSING_TOOL_ID" 
      }, { status: 400 });
    }

    // Validate toolId is a valid integer
    const parsedToolId = parseInt(toolId);
    if (isNaN(parsedToolId)) {
      return NextResponse.json({ 
        error: "Valid tool ID is required",
        code: "INVALID_TOOL_ID" 
      }, { status: 400 });
    }

    // Check if tool exists
    const existingTool = await db.select()
      .from(tools)
      .where(eq(tools.id, parsedToolId))
      .limit(1);

    if (existingTool.length === 0) {
      return NextResponse.json({ 
        error: 'Tool not found' 
      }, { status: 404 });
    }

    // Create new view record
    const newView = await db.insert(toolViews)
      .values({
        toolId: parsedToolId,
        viewedAt: new Date().toISOString()
      })
      .returning();

    // Increment popularity count in tools table
    const updatedTool = await db.update(tools)
      .set({
        popularity: existingTool[0].popularity + 1,
        updatedAt: new Date().toISOString()
      })
      .where(eq(tools.id, parsedToolId))
      .returning();

    return NextResponse.json({
      message: 'View tracked successfully',
      viewId: newView[0].id,
      newPopularity: updatedTool[0].popularity
    }, { status: 200 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}