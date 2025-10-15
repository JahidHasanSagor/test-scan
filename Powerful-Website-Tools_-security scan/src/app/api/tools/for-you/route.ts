import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { tools, toolViews, savedTools, similarTools } from '@/db/schema';
import { eq, desc, and, inArray, or, sql, count, notInArray } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    
    // Get session from auth
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      }, { status: 401 });
    }

    const userId = session.user.id;

    // 1. Get tools the user has viewed (browsing history)
    const viewedToolsResult = await db
      .select({ toolId: toolViews.toolId })
      .from(toolViews)
      .leftJoin(tools, eq(tools.id, toolViews.toolId))
      .where(and(
        eq(tools.status, 'approved'),
        sql`${toolViews.toolId} IS NOT NULL`
      ))
      .groupBy(toolViews.toolId)
      .orderBy(desc(sql`MAX(${toolViews.viewedAt})`))
      .limit(10);

    const viewedToolIds = viewedToolsResult.map(r => r.toolId).filter((id): id is number => id !== null);

    // 2. Get tools the user has saved
    const savedToolsResult = await db
      .select({ toolId: savedTools.toolId })
      .from(savedTools)
      .where(eq(savedTools.userId, userId));

    const savedToolIds = savedToolsResult.map(r => r.toolId).filter((id): id is number => id !== null);

    // 3. Combine viewed and saved tool IDs
    const userInteractedToolIds = [...new Set([...viewedToolIds, ...savedToolIds])];

    // 4. Get categories from user's interacted tools
    let userPreferredCategories: string[] = [];
    if (userInteractedToolIds.length > 0) {
      const interactedTools = await db
        .select({ category: tools.category })
        .from(tools)
        .where(inArray(tools.id, userInteractedToolIds));

      userPreferredCategories = [...new Set(interactedTools.map(t => t.category))];
    }

    // 5. Get similar tools based on user's interactions
    let similarToolIds: number[] = [];
    if (userInteractedToolIds.length > 0) {
      const similarToolsResult = await db
        .select({ similarToolId: similarTools.similarToolId })
        .from(similarTools)
        .where(inArray(similarTools.toolId, userInteractedToolIds))
        .orderBy(desc(similarTools.relevanceScore))
        .limit(20);

      similarToolIds = similarToolsResult.map(r => r.similarToolId).filter((id): id is number => id !== null);
    }

    // 6. Build personalized recommendations
    let recommendedTools;
    
    if (userPreferredCategories.length > 0 || similarToolIds.length > 0) {
      // Get tools from preferred categories or similar tools, excluding already interacted tools
      const conditions = [eq(tools.status, 'approved')];
      
      if (userPreferredCategories.length > 0 || similarToolIds.length > 0) {
        const orConditions = [];
        if (userPreferredCategories.length > 0) {
          orConditions.push(inArray(tools.category, userPreferredCategories));
        }
        if (similarToolIds.length > 0) {
          orConditions.push(inArray(tools.id, similarToolIds));
        }
        conditions.push(or(...orConditions));
      }

      if (userInteractedToolIds.length > 0) {
        conditions.push(notInArray(tools.id, userInteractedToolIds));
      }

      recommendedTools = await db
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
        })
        .from(tools)
        .where(and(...conditions))
        .orderBy(desc(tools.popularity), desc(tools.createdAt))
        .limit(limit)
        .offset(offset);
    } else {
      // Fallback: Show popular tools for new users
      recommendedTools = await db
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
        })
        .from(tools)
        .where(eq(tools.status, 'approved'))
        .orderBy(desc(tools.popularity), desc(tools.createdAt))
        .limit(limit)
        .offset(offset);
    }

    // Get total count
    const totalResult = await db
      .select({ count: count() })
      .from(tools)
      .where(eq(tools.status, 'approved'));

    const total = totalResult[0]?.count || 0;

    // Map popularity to views for frontend display
    const toolsWithViews = recommendedTools.map(tool => {
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

    return NextResponse.json({
      tools: toolsWithViews,
      total,
      viewMode: 'for-you',
      personalized: userInteractedToolIds.length > 0
    });
  } catch (error) {
    console.error('For you tools error:', error);
    return NextResponse.json({
      error: 'Failed to fetch personalized recommendations'
    }, { status: 500 });
  }
}