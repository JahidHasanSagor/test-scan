import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { tools, toolInteractionsNew, categories } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

const ALLOWED_INTERACTION_TYPES = ['view', 'click_use_tool', 'save', 'unsave'] as const;
type InteractionType = typeof ALLOWED_INTERACTION_TYPES[number];

function isValidInteractionType(type: string): type is InteractionType {
  return ALLOWED_INTERACTION_TYPES.includes(type as InteractionType);
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const toolId = params.id;

    // Validate toolId
    if (!toolId || isNaN(parseInt(toolId))) {
      return NextResponse.json(
        { 
          error: 'Valid tool ID is required',
          code: 'INVALID_TOOL_ID' 
        },
        { status: 400 }
      );
    }

    const toolIdInt = parseInt(toolId);

    // Verify tool exists
    const existingTool = await db
      .select()
      .from(tools)
      .where(eq(tools.id, toolIdInt))
      .limit(1);

    if (existingTool.length === 0) {
      return NextResponse.json(
        { 
          error: 'Tool not found',
          code: 'TOOL_NOT_FOUND' 
        },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { sessionId, interactionType, categoryId } = body;

    // Validate required fields
    if (!sessionId || typeof sessionId !== 'string') {
      return NextResponse.json(
        { 
          error: 'Session ID is required',
          code: 'MISSING_SESSION_ID' 
        },
        { status: 400 }
      );
    }

    if (!interactionType) {
      return NextResponse.json(
        { 
          error: 'Interaction type is required',
          code: 'MISSING_INTERACTION_TYPE' 
        },
        { status: 400 }
      );
    }

    // Validate interactionType
    if (!isValidInteractionType(interactionType)) {
      return NextResponse.json(
        { 
          error: `Invalid interaction type. Must be one of: ${ALLOWED_INTERACTION_TYPES.join(', ')}`,
          code: 'INVALID_INTERACTION_TYPE' 
        },
        { status: 400 }
      );
    }

    // Validate categoryId if provided
    if (categoryId !== undefined && categoryId !== null) {
      const parsedCategoryId = parseInt(String(categoryId));
      if (isNaN(parsedCategoryId)) {
        return NextResponse.json(
          { 
            error: 'Valid category ID is required',
            code: 'INVALID_CATEGORY_ID' 
          },
          { status: 400 }
        );
      }

      const categoryExists = await db
        .select()
        .from(categories)
        .where(eq(categories.id, parsedCategoryId))
        .limit(1);

      if (categoryExists.length === 0) {
        return NextResponse.json(
          { 
            error: 'Category not found',
            code: 'CATEGORY_NOT_FOUND' 
          },
          { status: 400 }
        );
      }
    }

    // Get userId from session if authenticated (optional)
    let userId: string | null = null;
    try {
      const user = await getCurrentUser(request);
      userId = user?.id || null;
    } catch (error) {
      // User not authenticated - this is fine, continue with null userId
      userId = null;
    }

    // Prepare interaction data
    const interactionData: {
      toolId: number;
      userId: string | null;
      sessionId: string;
      interactionType: string;
      categoryId?: number | null;
      createdAt: string;
    } = {
      toolId: toolIdInt,
      userId,
      sessionId: sessionId.trim(),
      interactionType,
      createdAt: new Date().toISOString(),
    };

    // Add categoryId if provided
    if (categoryId !== undefined && categoryId !== null) {
      interactionData.categoryId = parseInt(String(categoryId));
    }

    // Insert interaction
    const newInteraction = await db
      .insert(toolInteractionsNew)
      .values(interactionData)
      .returning();

    // Return success response
    return NextResponse.json(
      {
        success: true,
        interaction: newInteraction[0],
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('POST tool interaction error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + error 
      },
      { status: 500 }
    );
  }
}