import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { tools } from '@/db/schema';
import { eq, desc, count } from 'drizzle-orm';
import { addCacheHeaders, CACHE_PRESETS } from '@/lib/cache';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get latest approved tools ordered by createdAt
    const latestTools = await db
      .select({
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
        isPremium: tools.isPremium,
        videoUrl: tools.videoUrl,
        extendedDescription: tools.extendedDescription,
        ctaText: tools.ctaText,
        createdAt: tools.createdAt,
        updatedAt: tools.updatedAt,
      })
      .from(tools)
      .where(eq(tools.status, 'approved'))
      .orderBy(desc(tools.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count
    const totalResult = await db
      .select({ count: count() })
      .from(tools)
      .where(eq(tools.status, 'approved'));

    const total = totalResult[0]?.count || 0;

    // Map popularity to views for frontend display
    const toolsWithViews = latestTools.map(tool => ({
      ...tool,
      views: tool.popularity
    }));

    const response = NextResponse.json({
      tools: toolsWithViews,
      total,
      viewMode: 'latest'
    });

    // Add cache headers (3 minutes with stale-while-revalidate)
    return addCacheHeaders(response, CACHE_PRESETS.dynamic);

  } catch (error) {
    console.error('Latest tools error:', error);
    return NextResponse.json({
      error: 'Failed to fetch latest tools'
    }, { status: 500 });
  }
}