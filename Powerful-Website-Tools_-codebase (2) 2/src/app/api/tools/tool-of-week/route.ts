import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { tools } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const toolOfTheWeek = await db.select()
      .from(tools)
      .where(and(
        eq(tools.isToolOfTheWeek, true),
        eq(tools.status, 'approved')
      ))
      .limit(1);

    if (toolOfTheWeek.length === 0) {
      return NextResponse.json({ 
        error: 'No Tool of the Week is currently set',
        code: 'NO_TOOL_OF_WEEK' 
      }, { status: 404 });
    }

    return NextResponse.json(toolOfTheWeek[0], { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}