import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { tools } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const toolId = parseInt(id);

    // Check if tool exists
    const existingTool = await db.select()
      .from(tools)
      .where(eq(tools.id, toolId))
      .limit(1);

    if (existingTool.length === 0) {
      return NextResponse.json({ 
        error: 'Tool not found',
        code: 'TOOL_NOT_FOUND'
      }, { status: 404 });
    }

    const tool = existingTool[0];

    // Check if tool is approved
    if (tool.status !== 'approved') {
      return NextResponse.json({ 
        error: 'Tool must be approved to change featured status',
        code: 'TOOL_NOT_APPROVED'
      }, { status: 400 });
    }

    // Toggle featured status
    const newFeaturedStatus = !tool.isFeatured;

    // Update the tool
    const updatedTool = await db.update(tools)
      .set({
        isFeatured: newFeaturedStatus,
        updatedAt: new Date().toISOString()
      })
      .where(eq(tools.id, toolId))
      .returning();

    if (updatedTool.length === 0) {
      return NextResponse.json({ 
        error: 'Failed to update tool',
        code: 'UPDATE_FAILED'
      }, { status: 500 });
    }

    return NextResponse.json({
      ...updatedTool[0],
      featuredStatus: newFeaturedStatus
    }, { status: 200 });

  } catch (error) {
    console.error('PATCH error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}