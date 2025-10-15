import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { savedTools, tools } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ 
        error: "User ID is required",
        code: "MISSING_USER_ID" 
      }, { status: 400 });
    }

    const userSavedTools = await db
      .select({
        id: savedTools.id,
        toolId: savedTools.toolId,
        userId: savedTools.userId,
        savedAt: savedTools.createdAt,
        tool: {
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
      .from(savedTools)
      .innerJoin(tools, eq(savedTools.toolId, tools.id))
      .where(and(
        eq(savedTools.userId, userId),
        eq(tools.status, 'approved')
      ))
      .orderBy(desc(savedTools.createdAt));

    const result = userSavedTools.map(item => ({
      ...item.tool,
      savedAt: item.savedAt
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, toolId } = await request.json();

    if (!userId) {
      return NextResponse.json({ 
        error: "User ID is required",
        code: "MISSING_USER_ID" 
      }, { status: 400 });
    }

    if (!toolId) {
      return NextResponse.json({ 
        error: "Tool ID is required",
        code: "MISSING_TOOL_ID" 
      }, { status: 400 });
    }

    if (isNaN(parseInt(toolId))) {
      return NextResponse.json({ 
        error: "Valid tool ID is required",
        code: "INVALID_TOOL_ID" 
      }, { status: 400 });
    }

    // Check if tool exists and is approved
    const tool = await db.select()
      .from(tools)
      .where(and(
        eq(tools.id, parseInt(toolId)),
        eq(tools.status, 'approved')
      ))
      .limit(1);

    if (tool.length === 0) {
      return NextResponse.json({ 
        error: "Tool not found or not approved",
        code: "TOOL_NOT_FOUND" 
      }, { status: 404 });
    }

    // Check if already saved
    const existingSave = await db.select()
      .from(savedTools)
      .where(and(
        eq(savedTools.userId, userId),
        eq(savedTools.toolId, parseInt(toolId))
      ))
      .limit(1);

    if (existingSave.length > 0) {
      return NextResponse.json({ 
        error: "Tool is already saved",
        code: "ALREADY_SAVED" 
      }, { status: 409 });
    }

    // Save the tool
    const newSavedTool = await db.insert(savedTools)
      .values({
        userId,
        toolId: parseInt(toolId),
        createdAt: new Date().toISOString()
      })
      .returning();

    return NextResponse.json({ 
      message: "Tool saved successfully",
      savedTool: newSavedTool[0]
    }, { status: 201 });

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
    const userId = searchParams.get('userId');
    const toolId = searchParams.get('toolId');

    if (!userId) {
      return NextResponse.json({ 
        error: "User ID is required",
        code: "MISSING_USER_ID" 
      }, { status: 400 });
    }

    if (!toolId || isNaN(parseInt(toolId))) {
      return NextResponse.json({ 
        error: "Valid tool ID is required",
        code: "INVALID_TOOL_ID" 
      }, { status: 400 });
    }

    // Check if saved tool exists
    const existingSave = await db.select()
      .from(savedTools)
      .where(and(
        eq(savedTools.userId, userId),
        eq(savedTools.toolId, parseInt(toolId))
      ))
      .limit(1);

    if (existingSave.length === 0) {
      return NextResponse.json({ 
        error: "Saved tool not found",
        code: "SAVED_TOOL_NOT_FOUND" 
      }, { status: 404 });
    }

    // Delete the saved tool
    const deleted = await db.delete(savedTools)
      .where(and(
        eq(savedTools.userId, userId),
        eq(savedTools.toolId, parseInt(toolId))
      ))
      .returning();

    return NextResponse.json({ 
      message: "Tool removed from saved list successfully",
      deletedSavedTool: deleted[0]
    });

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}