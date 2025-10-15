import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { savedTools } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const toolId = searchParams.get('toolId');

    // Validate required parameters
    if (!userId) {
      return NextResponse.json({ 
        error: 'User ID is required',
        code: 'MISSING_USER_ID'
      }, { status: 400 });
    }

    if (!toolId) {
      return NextResponse.json({ 
        error: 'Tool ID is required',
        code: 'MISSING_TOOL_ID'
      }, { status: 400 });
    }

    // Validate toolId is a valid integer
    const toolIdNum = parseInt(toolId);
    if (isNaN(toolIdNum)) {
      return NextResponse.json({ 
        error: 'Valid tool ID is required',
        code: 'INVALID_TOOL_ID'
      }, { status: 400 });
    }

    // Check if saved tool record exists
    const existingSave = await db.select()
      .from(savedTools)
      .where(and(
        eq(savedTools.userId, userId),
        eq(savedTools.toolId, toolIdNum)
      ))
      .limit(1);

    if (existingSave.length === 0) {
      return NextResponse.json({ 
        error: 'Saved tool record not found',
        code: 'SAVE_RECORD_NOT_FOUND'
      }, { status: 404 });
    }

    // Delete the saved tool record
    const deleted = await db.delete(savedTools)
      .where(and(
        eq(savedTools.userId, userId),
        eq(savedTools.toolId, toolIdNum)
      ))
      .returning();

    return NextResponse.json({
      message: 'Tool successfully removed from saved list',
      deletedRecord: deleted[0]
    }, { status: 200 });

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}