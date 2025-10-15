import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { mainCategories, subCategories, toolTypes, tools, toolTaxonomy } from '@/db/schema';
import { eq, and, desc, asc } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;

    if (!slug) {
      return NextResponse.json(
        { error: 'Category slug is required', code: 'MISSING_SLUG' },
        { status: 400 }
      );
    }

    // Fetch main category by slug
    const mainCategoryResult = await db
      .select()
      .from(mainCategories)
      .where(eq(mainCategories.slug, slug))
      .limit(1);

    if (mainCategoryResult.length === 0) {
      return NextResponse.json(
        { error: 'Category not found', code: 'CATEGORY_NOT_FOUND' },
        { status: 404 }
      );
    }

    const mainCategory = mainCategoryResult[0];

    if (!mainCategory.isActive) {
      return NextResponse.json(
        { error: 'Category not found', code: 'CATEGORY_NOT_ACTIVE' },
        { status: 404 }
      );
    }

    // Fetch all subcategories for this main category
    const subCategoriesResult = await db
      .select()
      .from(subCategories)
      .where(
        and(
          eq(subCategories.mainCategoryId, mainCategory.id),
          eq(subCategories.isActive, true)
        )
      )
      .orderBy(asc(subCategories.displayOrder));

    // For each subcategory, fetch tool types
    const subCategoriesWithTypes = await Promise.all(
      subCategoriesResult.map(async (subCategory) => {
        const toolTypesResult = await db
          .select()
          .from(toolTypes)
          .where(
            and(
              eq(toolTypes.subCategoryId, subCategory.id),
              eq(toolTypes.isActive, true)
            )
          )
          .orderBy(asc(toolTypes.displayOrder));

        return {
          id: subCategory.id,
          name: subCategory.name,
          slug: subCategory.slug,
          description: subCategory.description,
          displayOrder: subCategory.displayOrder,
          toolCount: subCategory.toolCount,
          toolTypes: toolTypesResult.map(toolType => ({
            id: toolType.id,
            name: toolType.name,
            slug: toolType.slug,
            description: toolType.description,
            displayOrder: toolType.displayOrder,
            toolCount: toolType.toolCount,
          })),
        };
      })
    );

    // Fetch tools associated with this main category through toolTaxonomy
    const toolsResult = await db
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
        isToolOfTheWeek: tools.isToolOfTheWeek,
        status: tools.status,
        submittedByUserId: tools.submittedByUserId,
        contentQuality: tools.contentQuality,
        speedEfficiency: tools.speedEfficiency,
        creativeFeatures: tools.creativeFeatures,
        integrationOptions: tools.integrationOptions,
        learningCurve: tools.learningCurve,
        valueForMoney: tools.valueForMoney,
        isPremium: tools.isPremium,
        videoUrl: tools.videoUrl,
        extendedDescription: tools.extendedDescription,
        ctaText: tools.ctaText,
        createdAt: tools.createdAt,
        updatedAt: tools.updatedAt,
      })
      .from(tools)
      .innerJoin(toolTaxonomy, eq(toolTaxonomy.toolId, tools.id))
      .where(
        and(
          eq(toolTaxonomy.mainCategoryId, mainCategory.id),
          eq(tools.status, 'approved')
        )
      )
      .orderBy(desc(tools.popularity));

    const toolsWithViews = toolsResult.map(tool => ({
      ...tool,
      views: tool.popularity,
    }));

    return NextResponse.json(
      {
        category: {
          id: mainCategory.id,
          name: mainCategory.name,
          slug: mainCategory.slug,
          description: mainCategory.description,
          icon: mainCategory.icon,
          color: mainCategory.color,
          displayOrder: mainCategory.displayOrder,
          toolCount: mainCategory.toolCount,
        },
        subCategories: subCategoriesWithTypes,
        tools: toolsWithViews,
        total: toolsWithViews.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('GET main category error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}