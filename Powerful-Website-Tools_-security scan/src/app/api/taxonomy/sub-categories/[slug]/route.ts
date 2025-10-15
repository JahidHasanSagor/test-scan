import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { subCategories, mainCategories, toolTypes, tools, toolTaxonomy } from '@/db/schema';
import { eq, and, desc, asc, sql } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const { searchParams } = new URL(request.url);

    // Validate slug
    if (!slug) {
      return NextResponse.json({ 
        error: "Slug is required",
        code: "MISSING_SLUG" 
      }, { status: 400 });
    }

    // Get pagination parameters
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const sort = searchParams.get('sort') || 'popular';

    // Fetch subcategory with parent main category
    const subCategoryData = await db
      .select({
        subCategory: {
          id: subCategories.id,
          name: subCategories.name,
          slug: subCategories.slug,
          description: subCategories.description,
          displayOrder: subCategories.displayOrder,
          toolCount: subCategories.toolCount,
        },
        mainCategory: {
          id: mainCategories.id,
          name: mainCategories.name,
          slug: mainCategories.slug,
          icon: mainCategories.icon,
          color: mainCategories.color,
        },
      })
      .from(subCategories)
      .leftJoin(mainCategories, eq(subCategories.mainCategoryId, mainCategories.id))
      .where(
        and(
          eq(subCategories.slug, slug),
          eq(subCategories.isActive, true)
        )
      )
      .limit(1);

    if (subCategoryData.length === 0) {
      return NextResponse.json({ 
        error: 'Subcategory not found or not active',
        code: 'SUBCATEGORY_NOT_FOUND' 
      }, { status: 404 });
    }

    const { subCategory, mainCategory } = subCategoryData[0];

    // Fetch tool types for this subcategory with tool counts
    const toolTypesData = await db
      .select({
        id: toolTypes.id,
        name: toolTypes.name,
        slug: toolTypes.slug,
        description: toolTypes.description,
        displayOrder: toolTypes.displayOrder,
        toolCount: toolTypes.toolCount,
      })
      .from(toolTypes)
      .where(
        and(
          eq(toolTypes.subCategoryId, subCategory.id),
          eq(toolTypes.isActive, true)
        )
      )
      .orderBy(asc(toolTypes.displayOrder));

    // Get total count of tools for this subcategory
    const totalCount = await db
      .select({ count: sql<number>`count(distinct ${tools.id})` })
      .from(tools)
      .innerJoin(toolTaxonomy, eq(tools.id, toolTaxonomy.toolId))
      .where(
        and(
          eq(toolTaxonomy.subCategoryId, subCategory.id),
          eq(tools.status, 'approved')
        )
      );

    const total = totalCount[0]?.count || 0;

    // Determine sort order
    let orderByClause;
    switch (sort) {
      case 'latest':
        orderByClause = desc(tools.createdAt);
        break;
      case 'trending':
        // Trending: sort by recent popularity (views in recent period)
        orderByClause = desc(tools.popularity);
        break;
      case 'popular':
      default:
        orderByClause = desc(tools.popularity);
        break;
    }

    // Fetch tools for this subcategory with pagination and sorting
    const toolsData = await db
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
          eq(toolTaxonomy.subCategoryId, subCategory.id),
          eq(tools.status, 'approved')
        )
      )
      .orderBy(orderByClause)
      .limit(limit)
      .offset(offset);

    // Remove duplicate tools (in case a tool has multiple taxonomy entries for same subcategory)
    const uniqueTools = Array.from(
      new Map(toolsData.map(tool => [tool.id, tool])).values()
    );

    return NextResponse.json({
      subCategory,
      mainCategory,
      toolTypes: toolTypesData,
      tools: uniqueTools,
      total,
    }, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error,
      code: 'INTERNAL_ERROR' 
    }, { status: 500 });
  }
}