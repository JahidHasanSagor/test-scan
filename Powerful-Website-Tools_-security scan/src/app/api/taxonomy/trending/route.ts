import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { toolInteractions, tools, mainCategories, subCategories, toolTypes } from '@/db/schema';
import { eq, and, gte, inArray, desc, sql } from 'drizzle-orm';

type TaxonomyLevel = 'main' | 'sub' | 'type';
type TimePeriod = 'today' | 'week' | 'month';

const VALID_LEVELS: TaxonomyLevel[] = ['main', 'sub', 'type'];
const VALID_PERIODS: TimePeriod[] = ['today', 'week', 'month'];
const TRENDING_INTERACTION_TYPES = ['view', 'click_use_tool', 'save'];

function calculateDateThreshold(period: TimePeriod): string {
  const now = new Date();
  
  switch (period) {
    case 'today': {
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return todayStart.toISOString();
    }
    case 'week': {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return weekAgo.toISOString();
    }
    case 'month': {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return monthAgo.toISOString();
    }
    default:
      const defaultWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return defaultWeekAgo.toISOString();
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const level = searchParams.get('level') as TaxonomyLevel | null;
    const slug = searchParams.get('slug');
    const period = (searchParams.get('period') || 'week') as TimePeriod;
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50);

    // Validate required parameters
    if (!level) {
      return NextResponse.json({ 
        error: "Level parameter is required",
        code: "MISSING_LEVEL" 
      }, { status: 400 });
    }

    if (!slug) {
      return NextResponse.json({ 
        error: "Slug parameter is required",
        code: "MISSING_SLUG" 
      }, { status: 400 });
    }

    // Validate level value
    if (!VALID_LEVELS.includes(level)) {
      return NextResponse.json({ 
        error: "Invalid level. Must be one of: main, sub, type",
        code: "INVALID_LEVEL" 
      }, { status: 400 });
    }

    // Validate period value
    if (!VALID_PERIODS.includes(period)) {
      return NextResponse.json({ 
        error: "Invalid period. Must be one of: today, week, month",
        code: "INVALID_PERIOD" 
      }, { status: 400 });
    }

    // Fetch taxonomy entity based on level
    let taxonomyEntity;
    let taxonomyIdField: 'mainCategoryId' | 'subCategoryId' | 'toolTypeId';

    if (level === 'main') {
      const categories = await db.select()
        .from(mainCategories)
        .where(and(
          eq(mainCategories.slug, slug),
          eq(mainCategories.isActive, true)
        ))
        .limit(1);

      if (categories.length === 0) {
        return NextResponse.json({ 
          error: "Main category not found or not active",
          code: "CATEGORY_NOT_FOUND" 
        }, { status: 404 });
      }

      taxonomyEntity = categories[0];
      taxonomyIdField = 'mainCategoryId';
    } else if (level === 'sub') {
      const subcategories = await db.select()
        .from(subCategories)
        .where(and(
          eq(subCategories.slug, slug),
          eq(subCategories.isActive, true)
        ))
        .limit(1);

      if (subcategories.length === 0) {
        return NextResponse.json({ 
          error: "Sub category not found or not active",
          code: "SUBCATEGORY_NOT_FOUND" 
        }, { status: 404 });
      }

      taxonomyEntity = subcategories[0];
      taxonomyIdField = 'subCategoryId';
    } else {
      const types = await db.select()
        .from(toolTypes)
        .where(and(
          eq(toolTypes.slug, slug),
          eq(toolTypes.isActive, true)
        ))
        .limit(1);

      if (types.length === 0) {
        return NextResponse.json({ 
          error: "Tool type not found or not active",
          code: "TOOLTYPE_NOT_FOUND" 
        }, { status: 404 });
      }

      taxonomyEntity = types[0];
      taxonomyIdField = 'toolTypeId';
    }

    // Calculate date threshold
    const dateThreshold = calculateDateThreshold(period);

    // Query interactions and aggregate by toolId
    const interactionStats = await db
      .select({
        toolId: toolInteractions.toolId,
        interactionCount: sql<number>`cast(count(*) as integer)`,
      })
      .from(toolInteractions)
      .where(and(
        gte(toolInteractions.createdAt, dateThreshold),
        eq(toolInteractions[taxonomyIdField], taxonomyEntity.id),
        inArray(toolInteractions.interactionType, TRENDING_INTERACTION_TYPES)
      ))
      .groupBy(toolInteractions.toolId)
      .orderBy(desc(sql`cast(count(*) as integer)`));

    // If no interactions found, return empty result
    if (interactionStats.length === 0) {
      return NextResponse.json({
        level,
        slug,
        period,
        trendingTools: [],
        total: 0
      }, { status: 200 });
    }

    // Get tool IDs from interaction stats
    const toolIds = interactionStats.map(stat => stat.toolId);

    // Fetch tool details for trending tools
    const trendingToolsData = await db.select()
      .from(tools)
      .where(and(
        inArray(tools.id, toolIds),
        eq(tools.status, 'approved')
      ));

    // Create a map for quick lookup of interaction counts
    const interactionMap = new Map(
      interactionStats.map(stat => [stat.toolId, stat.interactionCount])
    );

    // Combine tool data with trending scores
    const trendingTools = trendingToolsData
      .map(tool => ({
        ...tool,
        views: tool.popularity || 0,
        trendingScore: interactionMap.get(tool.id) || 0
      }))
      .sort((a, b) => {
        // Sort by trendingScore DESC, then by popularity DESC
        if (b.trendingScore !== a.trendingScore) {
          return b.trendingScore - a.trendingScore;
        }
        return (b.views || 0) - (a.views || 0);
      })
      .slice(0, limit);

    return NextResponse.json({
      level,
      slug,
      period,
      trendingTools,
      total: trendingTools.length
    }, { status: 200 });

  } catch (error) {
    console.error('GET trending tools error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}