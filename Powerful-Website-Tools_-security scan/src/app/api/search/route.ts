import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { tools, toolTaxonomy, mainCategories, subCategories, toolTypes, toolInteractions } from '@/db/schema';
import { eq, and, or, like, inArray, desc, sql, gte } from 'drizzle-orm';
import { addCacheHeaders, CACHE_PRESETS } from '@/lib/cache';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const mainCategorySlugs = searchParams.get('mainCategories')?.split(',').filter(Boolean) || [];
    const subCategorySlugs = searchParams.get('subCategories')?.split(',').filter(Boolean) || [];
    const toolTypeSlugs = searchParams.get('toolTypes')?.split(',').filter(Boolean) || [];
    const sortBy = searchParams.get('sortBy') || 'popular';
    const period = searchParams.get('period') || 'week';
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Start building the query
    let toolIds: number[] = [];
    let filteredByTaxonomy = false;

    // Filter by taxonomy if any category filters are provided
    if (mainCategorySlugs.length > 0 || subCategorySlugs.length > 0 || toolTypeSlugs.length > 0) {
      filteredByTaxonomy = true;
      let taxonomyConditions = [];

      // Get main category IDs
      if (mainCategorySlugs.length > 0) {
        const mainCats = await db.select()
          .from(mainCategories)
          .where(and(
            inArray(mainCategories.slug, mainCategorySlugs),
            eq(mainCategories.isActive, true)
          ));
        
        const mainCatIds = mainCats.map(c => c.id);
        if (mainCatIds.length > 0) {
          taxonomyConditions.push(inArray(toolTaxonomy.mainCategoryId, mainCatIds));
        }
      }

      // Get sub category IDs
      if (subCategorySlugs.length > 0) {
        const subCats = await db.select()
          .from(subCategories)
          .where(and(
            inArray(subCategories.slug, subCategorySlugs),
            eq(subCategories.isActive, true)
          ));
        
        const subCatIds = subCats.map(c => c.id);
        if (subCatIds.length > 0) {
          taxonomyConditions.push(inArray(toolTaxonomy.subCategoryId, subCatIds));
        }
      }

      // Get tool type IDs
      if (toolTypeSlugs.length > 0) {
        const types = await db.select()
          .from(toolTypes)
          .where(and(
            inArray(toolTypes.slug, toolTypeSlugs),
            eq(toolTypes.isActive, true)
          ));
        
        const typeIds = types.map(t => t.id);
        if (typeIds.length > 0) {
          taxonomyConditions.push(inArray(toolTaxonomy.toolTypeId, typeIds));
        }
      }

      if (taxonomyConditions.length > 0) {
        const taxonomyRecords = await db.select()
          .from(toolTaxonomy)
          .where(or(...taxonomyConditions));
        
        toolIds = [...new Set(taxonomyRecords.map(t => t.toolId))];
      }
    }

    // Build tool query conditions
    let toolConditions = [eq(tools.status, 'approved')];

    // Add text search condition
    if (query.trim()) {
      toolConditions.push(
        or(
          like(tools.title, `%${query}%`),
          like(tools.description, `%${query}%`)
        )!
      );
    }

    // Add taxonomy filter condition
    if (filteredByTaxonomy) {
      if (toolIds.length === 0) {
        // No tools match the taxonomy filter
        return NextResponse.json({
          tools: [],
          total: 0,
          query,
          filters: {
            mainCategories: mainCategorySlugs,
            subCategories: subCategorySlugs,
            toolTypes: toolTypeSlugs,
          }
        }, { status: 200 });
      }
      toolConditions.push(inArray(tools.id, toolIds));
    }

    // Fetch tools based on sorting
    let toolsData;

    if (sortBy === 'trending') {
      // Get trending tools based on recent interactions
      const dateThreshold = calculateDateThreshold(period);
      
      let interactionConditions = [
        gte(toolInteractions.createdAt, dateThreshold),
        inArray(toolInteractions.interactionType, ['view', 'click_use_tool', 'save'])
      ];

      if (filteredByTaxonomy && toolIds.length > 0) {
        interactionConditions.push(inArray(toolInteractions.toolId, toolIds));
      }

      const interactionStats = await db
        .select({
          toolId: toolInteractions.toolId,
          interactionCount: sql<number>`cast(count(*) as integer)`,
        })
        .from(toolInteractions)
        .where(and(...interactionConditions))
        .groupBy(toolInteractions.toolId)
        .orderBy(desc(sql`cast(count(*) as integer)`))
        .limit(limit)
        .offset(offset);

      const trendingToolIds = interactionStats.map(s => s.toolId);
      
      if (trendingToolIds.length === 0) {
        toolsData = [];
      } else {
        const trendingConditions = [...toolConditions, inArray(tools.id, trendingToolIds)];
        toolsData = await db.select()
          .from(tools)
          .where(and(...trendingConditions));

        // Sort by trending score
        const interactionMap = new Map(interactionStats.map(s => [s.toolId, s.interactionCount]));
        toolsData.sort((a, b) => (interactionMap.get(b.id) || 0) - (interactionMap.get(a.id) || 0));
      }

    } else if (sortBy === 'latest') {
      toolsData = await db.select()
        .from(tools)
        .where(and(...toolConditions))
        .orderBy(desc(tools.createdAt))
        .limit(limit)
        .offset(offset);

    } else {
      // Default: popular (by popularity score)
      toolsData = await db.select()
        .from(tools)
        .where(and(...toolConditions))
        .orderBy(desc(tools.popularity))
        .limit(limit)
        .offset(offset);
    }

    // Get total count
    const countResult = await db.select({ count: sql<number>`cast(count(*) as integer)` })
      .from(tools)
      .where(and(...toolConditions));
    
    const total = countResult[0]?.count || 0;

    const response = NextResponse.json({
      tools: toolsData,
      total,
      query,
      filters: {
        mainCategories: mainCategorySlugs,
        subCategories: subCategorySlugs,
        toolTypes: toolTypeSlugs,
      },
      sortBy,
      limit,
      offset
    }, { status: 200 });

    // Add cache headers (2 minutes with stale-while-revalidate)
    return addCacheHeaders(response, CACHE_PRESETS.search);

  } catch (error) {
    console.error('Search API error:', error);
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