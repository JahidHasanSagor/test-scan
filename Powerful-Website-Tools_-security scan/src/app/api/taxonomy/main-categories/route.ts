import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { mainCategories, subCategories, toolTypes } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';
import { addCacheHeaders, CACHE_PRESETS } from '@/lib/cache';

export async function GET(request: NextRequest) {
  try {
    const mainCategoriesData = await db.select()
      .from(mainCategories)
      .where(eq(mainCategories.isActive, true))
      .orderBy(asc(mainCategories.displayOrder));

    const categoryIds = mainCategoriesData.map(cat => cat.id);

    let subCategoriesData: typeof subCategories.$inferSelect[] = [];
    if (categoryIds.length > 0) {
      subCategoriesData = await db.select()
        .from(subCategories)
        .where(eq(subCategories.isActive, true))
        .orderBy(asc(subCategories.displayOrder));
    }

    const subCategoryIds = subCategoriesData.map(sub => sub.id);

    let toolTypesData: typeof toolTypes.$inferSelect[] = [];
    if (subCategoryIds.length > 0) {
      toolTypesData = await db.select()
        .from(toolTypes)
        .where(eq(toolTypes.isActive, true))
        .orderBy(asc(toolTypes.displayOrder));
    }

    const toolTypesBySubCategory = toolTypesData.reduce((acc, toolType) => {
      if (!acc[toolType.subCategoryId]) {
        acc[toolType.subCategoryId] = [];
      }
      acc[toolType.subCategoryId].push({
        id: toolType.id,
        name: toolType.name,
        slug: toolType.slug,
        description: toolType.description,
        displayOrder: toolType.displayOrder,
        toolCount: toolType.toolCount,
      });
      return acc;
    }, {} as Record<number, Array<{
      id: number;
      name: string;
      slug: string;
      description: string | null;
      displayOrder: number | null;
      toolCount: number | null;
    }>>);

    const subCategoriesByMainCategory = subCategoriesData.reduce((acc, subCategory) => {
      if (!acc[subCategory.mainCategoryId]) {
        acc[subCategory.mainCategoryId] = [];
      }
      acc[subCategory.mainCategoryId].push({
        id: subCategory.id,
        name: subCategory.name,
        slug: subCategory.slug,
        description: subCategory.description,
        displayOrder: subCategory.displayOrder,
        toolCount: subCategory.toolCount,
        toolTypes: toolTypesBySubCategory[subCategory.id] || [],
      });
      return acc;
    }, {} as Record<number, Array<{
      id: number;
      name: string;
      slug: string;
      description: string | null;
      displayOrder: number | null;
      toolCount: number | null;
      toolTypes: Array<{
        id: number;
        name: string;
        slug: string;
        description: string | null;
        displayOrder: number | null;
        toolCount: number | null;
      }>;
    }>>);

    const categories = mainCategoriesData.map(mainCategory => ({
      id: mainCategory.id,
      name: mainCategory.name,
      slug: mainCategory.slug,
      description: mainCategory.description,
      icon: mainCategory.icon,
      color: mainCategory.color,
      displayOrder: mainCategory.displayOrder,
      toolCount: mainCategory.toolCount,
      subCategories: subCategoriesByMainCategory[mainCategory.id] || [],
    }));

    const response = NextResponse.json({ categories }, { status: 200 });

    // Add cache headers (1 hour with stale-while-revalidate)
    return addCacheHeaders(response, CACHE_PRESETS.categories);

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}