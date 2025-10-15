import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { tools } from '@/db/schema';
import { eq, desc, count } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Pagination parameters
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get pending tools with pagination
    const pendingTools = await db.select()
      .from(tools)
      .where(eq(tools.status, 'pending'))
      .orderBy(desc(tools.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count of pending tools
    const totalResult = await db.select({ count: count() })
      .from(tools)
      .where(eq(tools.status, 'pending'));

    const total = totalResult[0]?.count || 0;

    return NextResponse.json({
      tools: pendingTools,
      total: total
    }, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}