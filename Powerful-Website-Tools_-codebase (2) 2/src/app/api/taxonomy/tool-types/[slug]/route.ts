import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { toolTypes, subCategories, mainCategories, tools, toolTaxonomy } from '@/db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        { error: 'Slug parameter is required', code: 'MISSING_SLUG' },
        { status: 400 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const sort = searchParams.get('sort') || 'popular';

    // Fetch tool type with parent relationships
    const toolTypeResult = await db
      .select({
        toolType: {
          id: toolTypes.id,
          name: toolTypes.name,
          slug: toolTypes.slug,
          description: toolTypes.description,
          displayOrder: toolTypes.displayOrder,
          toolCount: toolTypes.toolCount,
        },
        subCategory: {
          id: subCategories.id,
          name: subCategories.name,
          slug: subCategories.slug,
        },
        mainCategory: {
          id: mainCategories.id,
          name: mainCategories.name,
          slug: mainCategories.slug,
          icon: mainCategories.icon,
          color: mainCategories.color,
        },
      })
      .from(toolTypes)
      .innerJoin(subCategories, eq(toolTypes.subCategoryId, subCategories.id))
      .innerJoin(mainCategories, eq(subCategories.mainCategoryId, mainCategories.id))
      .where(and(eq(toolTypes.slug, slug), eq(toolTypes.isActive, true)))
      .limit(1);

    if (toolTypeResult.length === 0) {
      return NextResponse.json(
        { error: 'Tool type not found or not active', code: 'TOOL_TYPE_NOT_FOUND' },
        { status: 404 }
      );
    }

    const { toolType, subCategory, mainCategory } = toolTypeResult[0];

    // Build tools query with sorting
    let toolsQuery = db
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
        views: tools.popularity,
        isFeatured: tools.isFeatured,
        isToolOfTheWeek: tools.isToolOfTheWeek,
        isPremium: tools.isPremium,
        videoUrl: tools.videoUrl,
        extendedDescription: tools.extendedDescription,
        ctaText: tools.ctaText,
        contentQuality: tools.contentQuality,
        speedEfficiency: tools.speedEfficiency,
        creativeFeatures: tools.creativeFeatures,
        integrationOptions: tools.integrationOptions,
        learningCurve: tools.learningCurve,
        valueForMoney: tools.valueForMoney,
        createdAt: tools.createdAt,
        updatedAt: tools.updatedAt,
      })
      .from(tools)
      .innerJoin(toolTaxonomy, eq(tools.id, toolTaxonomy.toolId))
      .where(
        and(
          eq(toolTaxonomy.toolTypeId, toolType.id),
          eq(tools.status, 'approved')
        )
      );

    // Apply sorting
    if (sort === 'latest') {
      toolsQuery = toolsQuery.orderBy(desc(tools.createdAt));
    } else if (sort === 'trending') {
      // Trending: tools with recent high views (popularity)
      toolsQuery = toolsQuery.orderBy(desc(tools.popularity), desc(tools.createdAt));
    } else {
      // Default: popular (by popularity score)
      toolsQuery = toolsQuery.orderBy(desc(tools.popularity));
    }

    // Get total count for pagination
    const totalCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(tools)
      .innerJoin(toolTaxonomy, eq(tools.id, toolTaxonomy.toolId))
      .where(
        and(
          eq(toolTaxonomy.toolTypeId, toolType.id),
          eq(tools.status, 'approved')
        )
      );

    const total = totalCountResult[0]?.count || 0;

    // Execute paginated query
    const toolsResult = await toolsQuery.limit(limit).offset(offset);

    return NextResponse.json({
      toolType,
      subCategory,
      mainCategory,
      tools: toolsResult,
      total,
    });

  } catch (error) {
    console.error('GET tool type error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}