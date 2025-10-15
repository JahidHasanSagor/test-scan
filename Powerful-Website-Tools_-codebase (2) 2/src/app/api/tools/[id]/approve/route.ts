import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { tools } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate ID parameter
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Check if tool exists and get current status
    const existingTool = await db.select()
      .from(tools)
      .where(eq(tools.id, parseInt(id)))
      .limit(1);

    if (existingTool.length === 0) {
      return NextResponse.json({ 
        error: 'Tool not found',
        code: 'TOOL_NOT_FOUND' 
      }, { status: 404 });
    }

    // Check if tool is in pending status
    if (existingTool[0].status !== 'pending') {
      return NextResponse.json({ 
        error: 'Tool is not in pending status and cannot be approved',
        code: 'INVALID_STATUS' 
      }, { status: 400 });
    }

    // Update tool status to approved
    const updatedTool = await db.update(tools)
      .set({
        status: 'approved',
        updatedAt: new Date().toISOString()
      })
      .where(eq(tools.id, parseInt(id)))
      .returning();

    if (updatedTool.length === 0) {
      return NextResponse.json({ 
        error: 'Failed to update tool',
        code: 'UPDATE_FAILED' 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      tool: updatedTool[0] 
    }, { status: 200 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}