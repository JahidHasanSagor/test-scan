import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { tools, toolViews } from '@/db/schema';
import { eq, desc, and, gte, sql, count } from 'drizzle-orm';
import { addCacheHeaders, CACHE_PRESETS } from '@/lib/cache';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const period = searchParams.get('period') || 'today'; // today, week, month

    // Calculate date threshold based on period
    const now = new Date();
    let dateThreshold: Date;
    
    switch (period) {
      case 'today':
        dateThreshold = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'week':
        dateThreshold = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        dateThreshold = new Date(now.setMonth(now.getMonth() - 1));
        break;
      default:
        dateThreshold = new Date(now.setHours(0, 0, 0, 0));
    }

    const dateThresholdISO = dateThreshold.toISOString();

    // Get trending tools based on view counts in the specified period
    const trendingTools = await db
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
        isPremium: tools.isPremium,
        videoUrl: tools.videoUrl,
        extendedDescription: tools.extendedDescription,
        ctaText: tools.ctaText,
        createdAt: tools.createdAt,
        updatedAt: tools.updatedAt,
        viewCount: sql<number>`COUNT(${toolViews.id})`.as('view_count')
      })
      .from(tools)
      .leftJoin(toolViews, and(
        eq(toolViews.toolId, tools.id),
        gte(toolViews.viewedAt, dateThresholdISO)
      ))
      .where(eq(tools.status, 'approved'))
      .groupBy(tools.id)
      .orderBy(desc(sql`view_count`), desc(tools.popularity))
      .limit(limit)
      .offset(offset);

    // Get total count of approved tools
    const totalResult = await db
      .select({ count: count() })
      .from(tools)
      .where(eq(tools.status, 'approved'));

    const total = totalResult[0]?.count || 0;

    // Map popularity to views for frontend display
    const toolsWithViews = trendingTools.map(tool => {
      // Fix problematic image URLs
      let imageUrl = tool.image;
      if (imageUrl && imageUrl.includes('photo-1498050108023')) {
        imageUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMB/ax8vQAAAABJRU5ErkJggg==";
      }
      if (!imageUrl) {
        imageUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMB/ax8vQAAAABJRU5ErkJggg==";
      }
      
      return {
        ...tool,
        image: imageUrl,
        views: tool.popularity
      };
    });

    const response = NextResponse.json({
      tools: toolsWithViews,
      total,
      viewMode: 'trending',
      period
    });

    // Add cache headers (3 minutes with stale-while-revalidate)
    return addCacheHeaders(response, CACHE_PRESETS.dynamic);

  } catch (error) {
    console.error('Trending tools error:', error);
    return NextResponse.json({
      error: 'Failed to fetch trending tools'
    }, { status: 500 });
  }
}