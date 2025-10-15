import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { toolComparisons } from '@/db/schema';
import { eq, desc, and, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = db.select().from(toolComparisons);
    let countQuery = db.select({ count: sql<number>`count(*)` }).from(toolComparisons);

    if (userId) {
      query = query.where(eq(toolComparisons.userId, userId));
      countQuery = countQuery.where(eq(toolComparisons.userId, userId));
    }

    const [comparisons, totalCount] = await Promise.all([
      query.orderBy(desc(toolComparisons.createdAt)).limit(limit).offset(offset),
      countQuery
    ]);

    return NextResponse.json({
      comparisons,
      total: totalCount[0]?.count || 0
    });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { toolIds, userId } = body;

    // Validate toolIds is an array
    if (!Array.isArray(toolIds)) {
      return NextResponse.json(
        { error: 'toolIds must be an array', code: 'INVALID_TOOL_IDS_FORMAT' },
        { status: 400 }
      );
    }

    // Validate minimum 2 tools
    if (toolIds.length < 2) {
      return NextResponse.json(
        { error: 'At least 2 tools required for comparison', code: 'INSUFFICIENT_TOOLS' },
        { status: 400 }
      );
    }

    // Validate maximum 5 tools
    if (toolIds.length > 5) {
      return NextResponse.json(
        { error: 'Maximum 5 tools can be compared at once', code: 'EXCESSIVE_TOOLS' },
        { status: 400 }
      );
    }

    // Validate all tool IDs are integers
    const allIntegers = toolIds.every((id: any) => 
      Number.isInteger(id) || (typeof id === 'string' && !isNaN(parseInt(id)) && parseInt(id).toString() === id)
    );

    if (!allIntegers) {
      return NextResponse.json(
        { error: 'All tool IDs must be integers', code: 'INVALID_TOOL_ID_TYPE' },
        { status: 400 }
      );
    }

    // Normalize tool IDs to integers
    const normalizedToolIds = toolIds.map((id: any) => 
      typeof id === 'string' ? parseInt(id) : id
    );

    const newComparison = await db.insert(toolComparisons)
      .values({
        userId: userId || null,
        toolIds: JSON.stringify(normalizedToolIds),
        createdAt: new Date().toISOString()
      })
      .returning();

    return NextResponse.json(newComparison[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const comparisonId = parseInt(id);

    // Check if comparison exists
    const existingComparison = await db.select()
      .from(toolComparisons)
      .where(eq(toolComparisons.id, comparisonId))
      .limit(1);

    if (existingComparison.length === 0) {
      return NextResponse.json(
        { error: 'Comparison not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const deleted = await db.delete(toolComparisons)
      .where(eq(toolComparisons.id, comparisonId))
      .returning();

    return NextResponse.json({
      message: 'Comparison deleted successfully',
      comparison: deleted[0]
    });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}