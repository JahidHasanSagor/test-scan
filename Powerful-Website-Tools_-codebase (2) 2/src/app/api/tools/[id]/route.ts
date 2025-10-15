import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { tools, reviews, similarTools, savedTools, toolViews } from '@/db/schema';
import { eq, and, desc, avg, count } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const toolId = parseInt(id);

    // Get tool details with spider chart metrics
    const toolResult = await db.select({
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
      .where(eq(tools.id, toolId))
      .limit(1);

    if (toolResult.length === 0) {
      return NextResponse.json({ error: 'Tool not found' }, { status: 404 });
    }

    const tool = toolResult[0];

    // Check if tool is approved (only approved tools can be viewed publicly)
    if (tool.status !== 'approved') {
      return NextResponse.json({ error: 'Tool not found' }, { status: 404 });
    }

    // Get reviews for this tool
    const toolReviews = await db.select()
      .from(reviews)
      .where(eq(reviews.toolId, toolId))
      .orderBy(desc(reviews.createdAt));

    // Get review statistics
    const reviewStats = await db.select({
      averageRating: avg(reviews.rating),
      reviewCount: count(reviews.id)
    })
    .from(reviews)
    .where(eq(reviews.toolId, toolId));

    const averageRating = reviewStats[0]?.averageRating || 0;
    const reviewCount = reviewStats[0]?.reviewCount || 0;

    // Get similar tools
    const similarToolsData = await db.select({
      tool: tools,
      relevanceScore: similarTools.relevanceScore
    })
    .from(similarTools)
    .innerJoin(tools, eq(similarTools.similarToolId, tools.id))
    .where(and(
      eq(similarTools.toolId, toolId),
      eq(tools.status, 'approved')
    ))
    .orderBy(desc(similarTools.relevanceScore));

    const similarToolsList = similarToolsData.map(item => ({
      ...item.tool,
      views: item.tool.popularity
    }));

    // Increment view count
    await db.insert(toolViews).values({
      toolId: toolId,
      viewedAt: new Date().toISOString()
    });

    // Build spider chart metrics object
    const spiderMetrics = {
      contentQuality: tool.contentQuality,
      speedEfficiency: tool.speedEfficiency,
      creativeFeatures: tool.creativeFeatures,
      integrationOptions: tool.integrationOptions,
      learningCurve: tool.learningCurve,
      valueForMoney: tool.valueForMoney,
    };

    return NextResponse.json({
      tool: {
        ...tool,
        views: tool.popularity,
        spiderMetrics,
      },
      reviews: toolReviews,
      similarTools: similarToolsList,
      averageRating: Number(averageRating),
      reviewCount: Number(reviewCount)
    });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const toolId = parseInt(id);
    const requestBody = await request.json();

    // Validate required fields
    const { title, description, url, category, pricing, type } = requestBody;

    if (!title || !description || !url || !category || !pricing || !type) {
      return NextResponse.json({ 
        error: "Missing required fields: title, description, url, category, pricing, type",
        code: "MISSING_REQUIRED_FIELDS" 
      }, { status: 400 });
    }

    // Check if tool exists
    const existingTool = await db.select()
      .from(tools)
      .where(eq(tools.id, toolId))
      .limit(1);

    if (existingTool.length === 0) {
      return NextResponse.json({ error: 'Tool not found' }, { status: 404 });
    }

    // Prepare update data
    const updateData: any = {
      title: title.trim(),
      description: description.trim(),
      url: url.trim(),
      category: category.trim(),
      pricing: pricing.trim(),
      type: type.trim(),
      updatedAt: new Date().toISOString()
    };

    // Optional fields
    if (requestBody.image !== undefined) {
      updateData.image = requestBody.image?.trim() || null;
    }
    if (requestBody.features !== undefined) {
      updateData.features = requestBody.features;
    }
    if (requestBody.popularity !== undefined) {
      updateData.popularity = parseInt(requestBody.popularity) || 0;
    }
    if (requestBody.isFeatured !== undefined) {
      updateData.isFeatured = Boolean(requestBody.isFeatured);
    }
    if (requestBody.status !== undefined) {
      updateData.status = requestBody.status;
    }

    // Update tool
    const updatedTool = await db.update(tools)
      .set(updateData)
      .where(eq(tools.id, toolId))
      .returning();

    if (updatedTool.length === 0) {
      return NextResponse.json({ error: 'Failed to update tool' }, { status: 500 });
    }

    return NextResponse.json(updatedTool[0]);

  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const toolId = parseInt(id);

    // Check if tool exists
    const existingTool = await db.select()
      .from(tools)
      .where(eq(tools.id, toolId))
      .limit(1);

    if (existingTool.length === 0) {
      return NextResponse.json({ error: 'Tool not found' }, { status: 404 });
    }

    // Delete associated records first (foreign key constraints)
    await db.delete(reviews).where(eq(reviews.toolId, toolId));
    await db.delete(similarTools).where(eq(similarTools.toolId, toolId));
    await db.delete(similarTools).where(eq(similarTools.similarToolId, toolId));
    await db.delete(savedTools).where(eq(savedTools.toolId, toolId));
    await db.delete(toolViews).where(eq(toolViews.toolId, toolId));

    // Delete the tool
    const deletedTool = await db.delete(tools)
      .where(eq(tools.id, toolId))
      .returning();

    if (deletedTool.length === 0) {
      return NextResponse.json({ error: 'Failed to delete tool' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Tool deleted successfully',
      deletedTool: deletedTool[0]
    });

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}