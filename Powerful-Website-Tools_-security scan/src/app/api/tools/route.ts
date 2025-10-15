import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { tools, globalSettings, userSubmissionTracking } from '@/db/schema';
import { eq, like, and, or, desc, asc, count } from 'drizzle-orm';

const ALLOWED_CATEGORIES = ['Design', 'Development', 'Marketing', 'Productivity', 'AI', 'Analytics'];
const ALLOWED_PRICING = ['free', 'paid', 'freemium'];
const ALLOWED_TYPES = ['Web App', 'Browser Extension', 'API', 'Mobile App'];

function truncateWords(text: string, maxWords: number = 150): string {
  if (!text) return '';
  const words = text.trim().split(/\s+/);
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(' ') + '...';
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function validateToolData(data: any, isUpdate = false) {
  const errors: string[] = [];

  if (!isUpdate || 'title' in data) {
    if (!data.title || typeof data.title !== 'string' || data.title.trim().length === 0) {
      errors.push('Title is required');
    } else if (data.title.length > 200) {
      errors.push('Title must be 200 characters or less');
    }
  }

  if (!isUpdate || 'description' in data) {
    if (!data.description || typeof data.description !== 'string' || data.description.trim().length === 0) {
      errors.push('Description is required');
    } else if (data.description.length > 1000) {
      errors.push('Description must be 1000 characters or less');
    }
  }

  if (!isUpdate || 'url' in data) {
    if (!data.url || typeof data.url !== 'string') {
      errors.push('URL is required');
    } else if (!isValidUrl(data.url)) {
      errors.push('URL must be a valid URL format');
    }
  }

  if (!isUpdate || 'category' in data) {
    if (!data.category || !ALLOWED_CATEGORIES.includes(data.category)) {
      errors.push(`Category must be one of: ${ALLOWED_CATEGORIES.join(', ')}`);
    }
  }

  if (!isUpdate || 'pricing' in data) {
    if (!data.pricing || !ALLOWED_PRICING.includes(data.pricing)) {
      errors.push(`Pricing must be one of: ${ALLOWED_PRICING.join(', ')}`);
    }
  }

  if (!isUpdate || 'type' in data) {
    if (!data.type || !ALLOWED_TYPES.includes(data.type)) {
      errors.push(`Type must be one of: ${ALLOWED_TYPES.join(', ')}`);
    }
  }

  if ('features' in data && data.features !== null && data.features !== undefined) {
    if (!Array.isArray(data.features) || !data.features.every(f => typeof f === 'string')) {
      errors.push('Features must be an array of strings');
    }
  }

  return errors;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const category = searchParams.get('category');
    const pricing = searchParams.get('pricing');
    const type = searchParams.get('type');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'default';
    const status = searchParams.get('status');

    let query = db.select({
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
      isPremium: tools.isPremium,
      videoUrl: tools.videoUrl,
      extendedDescription: tools.extendedDescription,
      ctaText: tools.ctaText,
      createdAt: tools.createdAt,
      updatedAt: tools.updatedAt,
    }).from(tools);
    let countQuery = db.select({ count: count() }).from(tools);

    const conditions = [];
    
    if (status === 'all') {
      // No status filter
    } else if (status === 'pending') {
      conditions.push(eq(tools.status, 'pending'));
    } else {
      conditions.push(eq(tools.status, 'approved'));
    }

    if (category && ALLOWED_CATEGORIES.includes(category)) {
      conditions.push(eq(tools.category, category));
    }

    if (pricing && ALLOWED_PRICING.includes(pricing)) {
      conditions.push(eq(tools.pricing, pricing));
    }

    if (type && ALLOWED_TYPES.includes(type)) {
      conditions.push(eq(tools.type, type));
    }

    if (search) {
      // Expanded search scope: title, description, extended description, category, type, pricing, CTA text
      const searchConditions = [
        like(tools.title, `%${search}%`),
        like(tools.description, `%${search}%`),
        like(tools.category, `%${search}%`),
        like(tools.type, `%${search}%`),
        like(tools.pricing, `%${search}%`),
      ];
      
      // Add optional fields if they exist
      if (tools.extendedDescription) {
        searchConditions.push(like(tools.extendedDescription, `%${search}%`));
      }
      if (tools.ctaText) {
        searchConditions.push(like(tools.ctaText, `%${search}%`));
      }
      
      conditions.push(or(...searchConditions));
    }

    const whereCondition = conditions.length > 1 ? and(...conditions) : conditions[0];
    query = query.where(whereCondition);
    countQuery = countQuery.where(whereCondition);

    switch (sort) {
      case 'popularity':
      case 'popular':
        query = query.orderBy(desc(tools.popularity));
        break;
      case 'newest':
        query = query.orderBy(desc(tools.createdAt));
        break;
      case 'rating':
        // Sort by aggregated rating score (we'll add this field or calculate it)
        // For now, use popularity as a proxy since rating system is integrated
        query = query.orderBy(desc(tools.popularity), desc(tools.isFeatured));
        break;
      case 'relevance':
        // For relevance, prioritize featured and popular tools
        query = query.orderBy(desc(tools.isFeatured), desc(tools.popularity));
        break;
      default:
        query = query.orderBy(desc(tools.id));
        break;
    }

    const toolsData = await query.limit(limit).offset(offset);
    const totalResult = await countQuery;
    const total = totalResult[0]?.count || 0;

    // Map popularity to views for frontend display and fix problematic image URLs
    const toolsWithViews = toolsData.map(tool => {
      let imageUrl = tool.image;
      
      // Replace the problematic Unsplash image URL with a working fallback
      if (imageUrl && imageUrl.includes('photo-1498050108023')) {
        imageUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMB/ax8vQAAAABJRU5ErkJggg==";
      }
      
      // Apply default fallback if no image
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
      hasMore: offset + toolsData.length < total
    });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + error
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      url,
      category,
      pricing,
      type,
      image,
      features,
      submittedByUserId,
      ctaText
    } = body;

    const validationErrors = validateToolData(body);
    if (validationErrors.length > 0) {
      return NextResponse.json({
        error: validationErrors.join(', '),
        code: 'VALIDATION_ERROR'
      }, { status: 400 });
    }

    // Check global submission counter
    const globalCounterResult = await db.select()
      .from(globalSettings)
      .where(eq(globalSettings.settingKey, 'global_submission_count'))
      .limit(1);
    
    let globalCount = 0;
    if (globalCounterResult.length > 0) {
      globalCount = parseInt(globalCounterResult[0].settingValue);
    }

    let isSubmissionFree = false;
    let requiresPayment = false;

    // Logic: First 100 submissions globally are free
    if (globalCount < 100) {
      isSubmissionFree = true;
    } else {
      // After 100 global submissions, check if this is user's first submission
      if (submittedByUserId) {
        const userTrackingResult = await db.select()
          .from(userSubmissionTracking)
          .where(eq(userSubmissionTracking.userId, submittedByUserId))
          .limit(1);
        
        if (userTrackingResult.length === 0 || !userTrackingResult[0].firstSubmissionFreeUsed) {
          // This is user's first submission - it's free
          isSubmissionFree = true;
        } else {
          // User has already used their first free submission - requires payment
          requiresPayment = true;
        }
      } else {
        // No user ID provided after 100 global submissions - requires payment
        requiresPayment = true;
      }
    }

    // Return payment required status if applicable
    if (requiresPayment) {
      return NextResponse.json({
        error: 'Payment required',
        code: 'PAYMENT_REQUIRED',
        message: 'The first 100 submissions are free globally. Your first submission is also free. Additional submissions require payment.',
        requiresPayment: true
      }, { status: 402 });
    }

    // Create the tool
    const insertData = {
      title: title.trim(),
      description: truncateWords(description.trim(), 150),
      url: url.trim(),
      category,
      pricing,
      type,
      image: image?.trim() || null,
      features: features || null,
      submittedByUserId: submittedByUserId || null,
      ctaText: ctaText?.trim() || null,
      status: 'pending',
      popularity: 0,
      isFeatured: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const newTool = await db.insert(tools)
      .values(insertData)
      .returning();

    // Update global counter
    if (globalCounterResult.length === 0) {
      await db.insert(globalSettings).values({
        settingKey: 'global_submission_count',
        settingValue: '1',
        updatedAt: new Date().toISOString()
      });
    } else {
      await db.update(globalSettings)
        .set({
          settingValue: (globalCount + 1).toString(),
          updatedAt: new Date().toISOString()
        })
        .where(eq(globalSettings.settingKey, 'global_submission_count'));
    }

    // Update user tracking if user is authenticated
    if (submittedByUserId) {
      const userTrackingResult = await db.select()
        .from(userSubmissionTracking)
        .where(eq(userSubmissionTracking.userId, submittedByUserId))
        .limit(1);
      
      if (userTrackingResult.length === 0) {
        // Create new tracking record
        await db.insert(userSubmissionTracking).values({
          userId: submittedByUserId,
          firstSubmissionFreeUsed: true,
          totalSubmissionsCount: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      } else {
        // Update existing record
        await db.update(userSubmissionTracking)
          .set({
            firstSubmissionFreeUsed: true,
            totalSubmissionsCount: userTrackingResult[0].totalSubmissionsCount + 1,
            updatedAt: new Date().toISOString()
          })
          .where(eq(userSubmissionTracking.userId, submittedByUserId));
      }
    }

    return NextResponse.json({
      ...newTool[0],
      isSubmissionFree,
      globalSubmissionCount: globalCount + 1
    }, { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + error
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({
        error: 'Valid ID is required',
        code: 'INVALID_ID'
      }, { status: 400 });
    }

    const body = await request.json();
    const validationErrors = validateToolData(body, true);
    if (validationErrors.length > 0) {
      return NextResponse.json({
        error: validationErrors.join(', '),
        code: 'VALIDATION_ERROR'
      }, { status: 400 });
    }

    const existingTool = await db.select()
      .from(tools)
      .where(eq(tools.id, parseInt(id)))
      .limit(1);

    if (existingTool.length === 0) {
      return NextResponse.json({
        error: 'Tool not found',
        code: 'TOOL_NOT_FOUND'
      }, { status: 404 });
    }

    const updateData: any = {
      updatedAt: new Date().toISOString()
    };

    if ('title' in body) updateData.title = body.title.trim();
    if ('description' in body) updateData.description = truncateWords(body.description.trim(), 150);
    if ('url' in body) updateData.url = body.url.trim();
    if ('image' in body) updateData.image = body.image?.trim() || null;
    if ('category' in body) updateData.category = body.category;
    if ('pricing' in body) updateData.pricing = body.pricing;
    if ('type' in body) updateData.type = body.type;
    if ('features' in body) updateData.features = body.features || null;
    if ('ctaText' in body) updateData.ctaText = body.ctaText?.trim() || null;

    const updatedTool = await db.update(tools)
      .set(updateData)
      .where(eq(tools.id, parseInt(id)))
      .returning();

    return NextResponse.json(updatedTool[0]);
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + error
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({
        error: 'Valid ID is required',
        code: 'INVALID_ID'
      }, { status: 400 });
    }

    const existingTool = await db.select()
      .from(tools)
      .where(eq(tools.id, parseInt(id)))
      .limit(1);

    if (existingTool.length === 0) {
      return NextResponse.json({
        error: 'Tool not found',
        code: 'TOOL_NOT_FOUND'
      }, { status: 404 });
    }

    const deletedTool = await db.delete(tools)
      .where(eq(tools.id, parseInt(id)))
      .returning();

    return NextResponse.json({
      message: 'Tool deleted successfully',
      tool: deletedTool[0]
    });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + error
    }, { status: 500 });
  }
}