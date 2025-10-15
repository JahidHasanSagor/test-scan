import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { tools } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate ID parameter
    const id = params.id;
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { 
          error: 'Valid ID is required',
          code: 'INVALID_ID'
        },
        { status: 400 }
      );
    }

    // Check authentication
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { 
          error: 'Authentication required',
          code: 'AUTHENTICATION_REQUIRED'
        },
        { status: 401 }
      );
    }

    // Check if the tool exists
    const existingTool = await db.select()
      .from(tools)
      .where(eq(tools.id, parseInt(id)))
      .limit(1);

    if (existingTool.length === 0) {
      return NextResponse.json(
        { 
          error: 'Tool not found',
          code: 'TOOL_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    // Verify the tool is approved
    if (existingTool[0].status !== 'approved') {
      return NextResponse.json(
        { 
          error: 'Only approved tools can be set as Tool of the Week',
          code: 'TOOL_NOT_APPROVED'
        },
        { status: 400 }
      );
    }

    // First, set isToolOfTheWeek = false for ALL tools
    await db.update(tools)
      .set({
        isToolOfTheWeek: false,
        updatedAt: new Date().toISOString()
      });

    // Then set isToolOfTheWeek = true for the specified tool
    const updatedTool = await db.update(tools)
      .set({
        isToolOfTheWeek: true,
        updatedAt: new Date().toISOString()
      })
      .where(eq(tools.id, parseInt(id)))
      .returning();

    if (updatedTool.length === 0) {
      return NextResponse.json(
        { 
          error: 'Failed to update tool',
          code: 'UPDATE_FAILED'
        },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedTool[0], { status: 200 });

  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + error
      },
      { status: 500 }
    );
  }
}