import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { mainCategories, subCategories, toolTypes, tools, toolTaxonomy, toolInteractions } from '@/db/schema';
import { eq, and, desc, sql, gte, inArray } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const searchParams = request.nextUrl.searchParams;
    const sortBy = searchParams.get('sortBy') || 'popular';
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const period = searchParams.get('period') || 'week';

    // Try to find the category at any level
    let categoryData: any = null;
    let categoryLevel: 'main' | 'sub' | 'type' | null = null;
    let categoryIdField: 'mainCategoryId' | 'subCategoryId' | 'toolTypeId' | null = null;

    // Check main categories
    const mainCat = await db.select()
      .from(mainCategories)
      .where(and(
        eq(mainCategories.slug, slug),
        eq(mainCategories.isActive, true)
      ))
      .limit(1);

    if (mainCat.length > 0) {
      categoryData = mainCat[0];
      categoryLevel = 'main';
      categoryIdField = 'mainCategoryId';
    } else {
      // Check sub categories
      const subCat = await db.select()
        .from(subCategories)
        .where(and(
          eq(subCategories.slug, slug),
          eq(subCategories.isActive, true)
        ))
        .limit(1);

      if (subCat.length > 0) {
        categoryData = subCat[0];
        categoryLevel = 'sub';
        categoryIdField = 'subCategoryId';
      } else {
        // Check tool types
        const toolType = await db.select()
          .from(toolTypes)
          .where(and(
            eq(toolTypes.slug, slug),
            eq(toolTypes.isActive, true)
          ))
          .limit(1);

        if (toolType.length > 0) {
          categoryData = toolType[0];
          categoryLevel = 'type';
          categoryIdField = 'toolTypeId';
        }
      }
    }

    if (!categoryData || !categoryLevel || !categoryIdField) {
      return NextResponse.json(
        { error: 'Category not found', code: 'CATEGORY_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Get tools for this category
    const taxonomyRecords = await db.select()
      .from(toolTaxonomy)
      .where(eq(toolTaxonomy[categoryIdField], categoryData.id));

    const toolIds = taxonomyRecords.map(t => t.toolId);

    if (toolIds.length === 0) {
      return NextResponse.json({
        category: {
          id: categoryData.id,
          name: categoryData.name,
          slug: categoryData.slug,
          description: categoryData.description,
          level: categoryLevel,
        },
        tools: [],
        trendingTools: [],
        total: 0,
      }, { status: 200 });
    }

    // Fetch tools
    let toolsQuery = db.select()
      .from(tools)
      .where(and(
        inArray(tools.id, toolIds),
        eq(tools.status, 'approved')
      ));

    // Apply sorting
    if (sortBy === 'trending') {
      // Calculate trending score based on recent interactions
      const dateThreshold = calculateDateThreshold(period);
      
      const interactionStats = await db
        .select({
          toolId: toolInteractions.toolId,
          interactionCount: sql<number>`cast(count(*) as integer)`,
        })
        .from(toolInteractions)
        .where(and(
          inArray(toolInteractions.toolId, toolIds),
          gte(toolInteractions.createdAt, dateThreshold),
          inArray(toolInteractions.interactionType, ['view', 'click_use_tool', 'save'])
        ))
        .groupBy(toolInteractions.toolId)
        .orderBy(desc(sql`cast(count(*) as integer)`));

      const trendingToolIds = interactionStats.slice(0, 3).map(s => s.toolId);
      
      const allTools = await toolsQuery;
      const trendingTools = allTools.filter(t => trendingToolIds.includes(t.id));
      const regularTools = allTools.filter(t => !trendingToolIds.includes(t.id));

      return NextResponse.json({
        category: {
          id: categoryData.id,
          name: categoryData.name,
          slug: categoryData.slug,
          description: categoryData.description,
          level: categoryLevel,
          toolCount: categoryData.toolCount,
        },
        tools: [...trendingTools, ...regularTools].slice(0, limit),
        trendingTools: trendingTools.slice(0, 3).map((tool, idx) => ({
          rank: idx + 1,
          ...tool,
        })),
        total: allTools.length,
      }, { status: 200 });

    } else if (sortBy === 'latest') {
      const allTools = await toolsQuery.orderBy(desc(tools.createdAt)).limit(limit);
      return NextResponse.json({
        category: {
          id: categoryData.id,
          name: categoryData.name,
          slug: categoryData.slug,
          description: categoryData.description,
          level: categoryLevel,
          toolCount: categoryData.toolCount,
        },
        tools: allTools,
        trendingTools: [],
        total: allTools.length,
      }, { status: 200 });
    } else {
      // Default: popular (by popularity score)
      const allTools = await toolsQuery.orderBy(desc(tools.popularity)).limit(limit);
      return NextResponse.json({
        category: {
          id: categoryData.id,
          name: categoryData.name,
          slug: categoryData.slug,
          description: categoryData.description,
          level: categoryLevel,
          toolCount: categoryData.toolCount,
        },
        tools: allTools,
        trendingTools: [],
        total: allTools.length,
      }, { status: 200 });
    }

  } catch (error) {
    console.error('GET category error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}

function calculateDateThreshold(period: string): string {
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