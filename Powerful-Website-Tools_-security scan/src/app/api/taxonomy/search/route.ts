import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { tools, toolTaxonomy, mainCategories, subCategories, toolTypes, toolInteractions } from '@/db/schema';
import { eq, like, and, or, desc, asc, sql, count, gte } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Parse query parameters
    const q = searchParams.get('q');
    const mainCategorySlug = searchParams.get('mainCategory');
    const subCategorySlug = searchParams.get('subCategory');
    const toolTypeSlug = searchParams.get('toolType');
    const sortBy = searchParams.get('sortBy') || 'popular';
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Validate sortBy parameter
    if (!['popular', 'latest', 'trending'].includes(sortBy)) {
      return NextResponse.json({ 
        error: "Invalid sortBy parameter. Must be one of: 'popular', 'latest', 'trending'",
        code: "INVALID_SORT_PARAMETER" 
      }, { status: 400 });
    }

    // Resolve taxonomy slugs to IDs
    let mainCategoryId: number | null = null;
    let subCategoryId: number | null = null;
    let toolTypeId: number | null = null;

    if (mainCategorySlug) {
      const mainCat = await db.select()
        .from(mainCategories)
        .where(and(
          eq(mainCategories.slug, mainCategorySlug),
          eq(mainCategories.isActive, true)
        ))
        .limit(1);
      
      if (mainCat.length === 0) {
        return NextResponse.json({ 
          error: `Main category with slug '${mainCategorySlug}' not found`,
          code: "MAIN_CATEGORY_NOT_FOUND" 
        }, { status: 400 });
      }
      mainCategoryId = mainCat[0].id;
    }

    if (subCategorySlug) {
      const subCat = await db.select()
        .from(subCategories)
        .where(and(
          eq(subCategories.slug, subCategorySlug),
          eq(subCategories.isActive, true)
        ))
        .limit(1);
      
      if (subCat.length === 0) {
        return NextResponse.json({ 
          error: `Subcategory with slug '${subCategorySlug}' not found`,
          code: "SUBCATEGORY_NOT_FOUND" 
        }, { status: 400 });
      }
      subCategoryId = subCat[0].id;
    }

    if (toolTypeSlug) {
      const toolType = await db.select()
        .from(toolTypes)
        .where(and(
          eq(toolTypes.slug, toolTypeSlug),
          eq(toolTypes.isActive, true)
        ))
        .limit(1);
      
      if (toolType.length === 0) {
        return NextResponse.json({ 
          error: `Tool type with slug '${toolTypeSlug}' not found`,
          code: "TOOL_TYPE_NOT_FOUND" 
        }, { status: 400 });
      }
      toolTypeId = toolType[0].id;
    }

    // Build WHERE conditions
    const conditions = [eq(tools.status, 'approved')];

    // Add search conditions
    if (q) {
      const searchCondition = or(
        like(tools.title, `%${q}%`),
        like(tools.description, `%${q}%`),
        like(tools.extendedDescription, `%${q}%`)
      );
      conditions.push(searchCondition);
    }

    // Determine if we need to join with toolTaxonomy
    const needsTaxonomyJoin = mainCategoryId !== null || subCategoryId !== null || toolTypeId !== null;

    let results;
    let totalCount;

    if (needsTaxonomyJoin) {
      // Build taxonomy filter conditions
      const taxonomyConditions = [];
      if (mainCategoryId !== null) {
        taxonomyConditions.push(eq(toolTaxonomy.mainCategoryId, mainCategoryId));
      }
      if (subCategoryId !== null) {
        taxonomyConditions.push(eq(toolTaxonomy.subCategoryId, subCategoryId));
      }
      if (toolTypeId !== null) {
        taxonomyConditions.push(eq(toolTaxonomy.toolTypeId, toolTypeId));
      }

      // Get tool IDs that match taxonomy filters
      const taxonomyQuery = db.select({ toolId: toolTaxonomy.toolId })
        .from(toolTaxonomy)
        .where(and(...taxonomyConditions));

      const matchingToolIds = await taxonomyQuery;
      const toolIds = matchingToolIds.map(t => t.toolId);

      if (toolIds.length === 0) {
        return NextResponse.json({
          tools: [],
          total: 0,
          filters: {
            q: q || undefined,
            mainCategory: mainCategorySlug || undefined,
            subCategory: subCategorySlug || undefined,
            toolType: toolTypeSlug || undefined,
            sortBy
          }
        });
      }

      // Add tool ID filter to conditions
      conditions.push(sql`${tools.id} IN ${toolIds}`);
    }

    // Handle different sort orders
    let sortedQuery;
    
    if (sortBy === 'trending') {
      // Calculate trending: interactions in last 7 days
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      
      // Get interaction counts for trending tools
      const trendingCounts = await db.select({
        toolId: toolInteractions.toolId,
        interactionCount: count(toolInteractions.id).as('interaction_count')
      })
        .from(toolInteractions)
        .where(gte(toolInteractions.createdAt, sevenDaysAgo))
        .groupBy(toolInteractions.toolId);

      const trendingMap = new Map(trendingCounts.map(t => [t.toolId, t.interactionCount]));

      // Get all matching tools first
      const baseQuery = db.select()
        .from(tools)
        .where(and(...conditions));

      const allTools = await baseQuery;

      // Sort by interaction count
      const sortedTools = allTools
        .map(tool => ({
          ...tool,
          trendingScore: trendingMap.get(tool.id) || 0
        }))
        .sort((a, b) => b.trendingScore - a.trendingScore);

      // Apply pagination
      results = sortedTools.slice(offset, offset + limit);
      totalCount = sortedTools.length;

      // Remove trendingScore from final results
      results = results.map(({ trendingScore, ...tool }) => tool);
    } else {
      // Standard sorting with database
      let query = db.select()
        .from(tools)
        .where(and(...conditions));

      if (sortBy === 'popular') {
        query = query.orderBy(desc(tools.popularity));
      } else if (sortBy === 'latest') {
        query = query.orderBy(desc(tools.createdAt));
      }

      // Apply pagination
      results = await query.limit(limit).offset(offset);

      // Get total count
      const countQuery = db.select({ count: count() })
        .from(tools)
        .where(and(...conditions));
      
      const countResult = await countQuery;
      totalCount = countResult[0].count;
    }

    // Enrich results with taxonomy information
    const enrichedTools = await Promise.all(
      results.map(async (tool) => {
        // Get taxonomy for this tool
        const taxonomyData = await db.select({
          mainCategoryId: toolTaxonomy.mainCategoryId,
          subCategoryId: toolTaxonomy.subCategoryId,
          toolTypeId: toolTaxonomy.toolTypeId
        })
          .from(toolTaxonomy)
          .where(eq(toolTaxonomy.toolId, tool.id))
          .limit(1);

        let taxonomy = null;

        if (taxonomyData.length > 0) {
          const tax = taxonomyData[0];
          
          // Fetch taxonomy details
          const [mainCatData, subCatData, toolTypeData] = await Promise.all([
            tax.mainCategoryId 
              ? db.select({ name: mainCategories.name, slug: mainCategories.slug })
                  .from(mainCategories)
                  .where(eq(mainCategories.id, tax.mainCategoryId))
                  .limit(1)
              : Promise.resolve([]),
            tax.subCategoryId 
              ? db.select({ name: subCategories.name, slug: subCategories.slug })
                  .from(subCategories)
                  .where(eq(subCategories.id, tax.subCategoryId))
                  .limit(1)
              : Promise.resolve([]),
            tax.toolTypeId 
              ? db.select({ name: toolTypes.name, slug: toolTypes.slug })
                  .from(toolTypes)
                  .where(eq(toolTypes.id, tax.toolTypeId))
                  .limit(1)
              : Promise.resolve([])
          ]);

          taxonomy = {
            mainCategory: mainCatData.length > 0 ? mainCatData[0] : null,
            subCategory: subCatData.length > 0 ? subCatData[0] : null,
            toolType: toolTypeData.length > 0 ? toolTypeData[0] : null
          };
        }

        return {
          ...tool,
          views: tool.popularity,
          taxonomy
        };
      })
    );

    return NextResponse.json({
      tools: enrichedTools,
      total: totalCount,
      filters: {
        q: q || undefined,
        mainCategory: mainCategorySlug || undefined,
        subCategory: subCategorySlug || undefined,
        toolType: toolTypeSlug || undefined,
        sortBy
      }
    });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}