import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { tools, reviews, savedTools, toolViews, aggregatedScores } from '@/db/schema';
import { eq, and, desc, count, avg, sql } from 'drizzle-orm';
import { addCacheHeaders, CACHE_PRESETS } from '@/lib/cache';

/**
 * Featured Algorithm Logic:
 * 
 * Tools are featured based on a composite score that considers:
 * 1. Tool of the Week (automatic featured)
 * 2. Premium status (2x multiplier)
 * 3. Quality Score (average of 6 metrics: 0-30 points)
 * 4. User Engagement (views, saves, reviews: 0-40 points)
 * 5. Recency Boost (new tools within 30 days: 0-15 points)
 * 6. User Ratings (average rating: 0-15 points)
 * 
 * Total possible score: 100 points
 * Featured threshold: Tools with score >= 50 or top 20 tools
 */

interface FeaturedScore {
  toolId: number;
  score: number;
  breakdown: {
    qualityScore: number;
    engagementScore: number;
    recencyBoost: number;
    ratingScore: number;
    isPremium: boolean;
    isToolOfWeek: boolean;
  };
}

async function calculateFeaturedScores(): Promise<FeaturedScore[]> {
  // Get all approved tools with their metrics
  const allTools = await db
    .select({
      id: tools.id,
      popularity: tools.popularity,
      isPremium: tools.isPremium,
      isToolOfTheWeek: tools.isToolOfTheWeek,
      contentQuality: tools.contentQuality,
      speedEfficiency: tools.speedEfficiency,
      creativeFeatures: tools.creativeFeatures,
      integrationOptions: tools.integrationOptions,
      learningCurve: tools.learningCurve,
      valueForMoney: tools.valueForMoney,
      createdAt: tools.createdAt,
    })
    .from(tools)
    .where(eq(tools.status, 'approved'));

  // Get engagement metrics for all tools
  const [saveCounts, reviewStats] = await Promise.all([
    db
      .select({
        toolId: savedTools.toolId,
        count: count(),
      })
      .from(savedTools)
      .groupBy(savedTools.toolId),
    db
      .select({
        toolId: reviews.toolId,
        avgRating: avg(reviews.rating),
        count: count(),
      })
      .from(reviews)
      .groupBy(reviews.toolId),
  ]);

  const saveCountMap = new Map(saveCounts.map(s => [s.toolId, s.count]));
  const reviewStatsMap = new Map(reviewStats.map(r => [r.toolId, { avg: Number(r.avgRating) || 0, count: r.count }]));

  // Calculate scores for each tool
  const scores: FeaturedScore[] = allTools.map(tool => {
    // 1. Quality Score (0-30 points) - Average of 6 metrics normalized to 0-30
    const qualityMetrics = [
      tool.contentQuality,
      tool.speedEfficiency,
      tool.creativeFeatures,
      tool.integrationOptions,
      tool.learningCurve,
      tool.valueForMoney,
    ];
    const avgQuality = qualityMetrics.reduce((sum, val) => sum + (val || 5), 0) / qualityMetrics.length;
    const qualityScore = (avgQuality / 10) * 30; // Normalize 0-10 to 0-30

    // 2. Engagement Score (0-40 points)
    const views = tool.popularity || 0;
    const saves = saveCountMap.get(tool.id) || 0;
    const reviewCount = reviewStatsMap.get(tool.id)?.count || 0;
    
    // Logarithmic scaling for engagement metrics
    const viewScore = Math.min(Math.log10(views + 1) * 8, 20); // Max 20 points
    const saveScore = Math.min(Math.log10(saves + 1) * 6, 12); // Max 12 points
    const reviewScore = Math.min(Math.log10(reviewCount + 1) * 4, 8); // Max 8 points
    const engagementScore = viewScore + saveScore + reviewScore;

    // 3. Recency Boost (0-15 points) - New tools within 30 days
    const createdDate = new Date(tool.createdAt);
    const now = new Date();
    const daysSinceCreation = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
    const recencyBoost = Math.max(0, 15 - (daysSinceCreation / 30) * 15);

    // 4. Rating Score (0-15 points) - Average user rating
    const avgRating = reviewStatsMap.get(tool.id)?.avg || 0;
    const ratingScore = (avgRating / 5) * 15;

    // Base score
    let totalScore = qualityScore + engagementScore + recencyBoost + ratingScore;

    // Premium multiplier (2x)
    if (tool.isPremium) {
      totalScore *= 2;
    }

    // Tool of the Week gets maximum score
    if (tool.isToolOfTheWeek) {
      totalScore = 1000; // Ensure it's always at the top
    }

    return {
      toolId: tool.id,
      score: Math.round(totalScore),
      breakdown: {
        qualityScore: Math.round(qualityScore),
        engagementScore: Math.round(engagementScore),
        recencyBoost: Math.round(recencyBoost),
        ratingScore: Math.round(ratingScore),
        isPremium: tool.isPremium || false,
        isToolOfWeek: tool.isToolOfTheWeek || false,
      },
    };
  });

  return scores.sort((a, b) => b.score - a.score);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse and validate limit parameter
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? Math.min(parseInt(limitParam), 100) : 100;
    const includeScoreBreakdown = searchParams.get('debug') === 'true';
    
    if (limitParam && isNaN(parseInt(limitParam))) {
      return NextResponse.json({
        error: "Invalid limit parameter",
        code: "INVALID_LIMIT"
      }, { status: 400 });
    }

    // Calculate featured scores for all tools
    const featuredScores = await calculateFeaturedScores();

    // Get top N tools by score (featured threshold: score >= 50 OR top 20)
    const featuredToolIds = featuredScores
      .filter(s => s.score >= 50 || featuredScores.indexOf(s) < 20)
      .slice(0, limit)
      .map(s => s.toolId);

    // Update isFeatured flag in database for top tools
    if (featuredToolIds.length > 0) {
      // Reset all featured flags
      await db
        .update(tools)
        .set({ isFeatured: false })
        .where(eq(tools.status, 'approved'));

      // Set featured flag for top tools
      await db
        .update(tools)
        .set({ isFeatured: true })
        .where(sql`${tools.id} IN ${sql.raw(`(${featuredToolIds.join(',')})`)}`);
    }

    // Query featured tools with full details
    const featuredTools = await db
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
        isPremium: tools.isPremium,
        isToolOfTheWeek: tools.isToolOfTheWeek,
        videoUrl: tools.videoUrl,
        extendedDescription: tools.extendedDescription,
        ctaText: tools.ctaText,
        createdAt: tools.createdAt,
        updatedAt: tools.updatedAt,
      })
      .from(tools)
      .where(sql`${tools.id} IN ${sql.raw(`(${featuredToolIds.join(',')})`)}`);

    // Map tools with their scores and views
    const toolsWithScores = featuredTools.map(tool => {
      const scoreData = featuredScores.find(s => s.toolId === tool.id);
      
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
        views: tool.popularity,
        featuredScore: scoreData?.score,
        ...(includeScoreBreakdown && scoreData ? { scoreBreakdown: scoreData.breakdown } : {}),
      };
    });

    // Sort by featured score
    toolsWithScores.sort((a, b) => (b.featuredScore || 0) - (a.featuredScore || 0));

    const response = NextResponse.json({
      tools: toolsWithScores,
      meta: {
        total: toolsWithScores.length,
        algorithm: "Quality (30%) + Engagement (40%) + Recency (15%) + Ratings (15%)",
        threshold: "Score >= 50 or Top 20 tools",
      },
    }, { status: 200 });

    // Add cache headers (5 minutes with stale-while-revalidate)
    return addCacheHeaders(response, CACHE_PRESETS.featured);

  } catch (error) {
    console.error('GET featured tools error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + error
    }, { status: 500 });
  }
}