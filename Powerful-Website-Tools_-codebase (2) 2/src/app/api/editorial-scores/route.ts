import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { editorialScores, tools, user } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const toolId = searchParams.get('toolId');

    if (toolId) {
      const id = parseInt(toolId);
      if (isNaN(id)) {
        return NextResponse.json({ 
          error: "Valid tool ID is required",
          code: "INVALID_TOOL_ID" 
        }, { status: 400 });
      }

      // Get active editorial score with editor information
      const score = await db.select({
        id: editorialScores.id,
        toolId: editorialScores.toolId,
        category: editorialScores.category,
        metricScores: editorialScores.metricScores,
        editorId: editorialScores.editorId,
        notes: editorialScores.notes,
        isActive: editorialScores.isActive,
        createdAt: editorialScores.createdAt,
        updatedAt: editorialScores.updatedAt,
        editor: {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        }
      })
        .from(editorialScores)
        .leftJoin(user, eq(editorialScores.editorId, user.id))
        .where(and(
          eq(editorialScores.toolId, id),
          eq(editorialScores.isActive, true)
        ))
        .limit(1);

      if (score.length === 0) {
        return NextResponse.json(null, { status: 200 });
      }

      return NextResponse.json(score[0], { status: 200 });
    }

    const scores = await db.select()
      .from(editorialScores)
      .where(eq(editorialScores.isActive, true));

    return NextResponse.json(scores, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: "AUTHENTICATION_REQUIRED" 
      }, { status: 401 });
    }

    if (user.role !== 'admin') {
      return NextResponse.json({ 
        error: 'Admin access required',
        code: "FORBIDDEN" 
      }, { status: 403 });
    }

    const body = await request.json();
    const { toolId, metricScores, notes } = body;

    // Security check: reject if editorId provided in body
    if ('editorId' in body || 'editor_id' in body) {
      return NextResponse.json({ 
        error: "Editor ID cannot be provided in request body",
        code: "EDITOR_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    // Validate required fields
    if (!toolId) {
      return NextResponse.json({ 
        error: "Tool ID is required",
        code: "MISSING_TOOL_ID" 
      }, { status: 400 });
    }

    if (!metricScores) {
      return NextResponse.json({ 
        error: "Metric scores are required",
        code: "MISSING_METRIC_SCORES" 
      }, { status: 400 });
    }

    // Validate toolId is valid integer
    const parsedToolId = parseInt(String(toolId));
    if (isNaN(parsedToolId)) {
      return NextResponse.json({ 
        error: "Valid tool ID is required",
        code: "INVALID_TOOL_ID" 
      }, { status: 400 });
    }

    // Validate metricScores is an object
    if (typeof metricScores !== 'object' || Array.isArray(metricScores) || metricScores === null) {
      return NextResponse.json({ 
        error: "Metric scores must be an object",
        code: "INVALID_METRIC_SCORES_TYPE" 
      }, { status: 400 });
    }

    // Validate each metric score is integer 1-10
    for (const [key, value] of Object.entries(metricScores)) {
      if (typeof value !== 'number' || !Number.isInteger(value) || value < 1 || value > 10) {
        return NextResponse.json({ 
          error: `Metric score for '${key}' must be an integer between 1 and 10`,
          code: "INVALID_METRIC_SCORE_VALUE" 
        }, { status: 400 });
      }
    }

    // Validate notes if provided
    if (notes !== undefined && notes !== null) {
      if (typeof notes !== 'string') {
        return NextResponse.json({ 
          error: "Notes must be a string",
          code: "INVALID_NOTES_TYPE" 
        }, { status: 400 });
      }

      if (notes.length > 1000) {
        return NextResponse.json({ 
          error: "Notes cannot exceed 1000 characters",
          code: "NOTES_TOO_LONG" 
        }, { status: 400 });
      }
    }

    // Check if tool exists and get its category
    const tool = await db.select()
      .from(tools)
      .where(eq(tools.id, parsedToolId))
      .limit(1);

    if (tool.length === 0) {
      return NextResponse.json({ 
        error: "Tool not found",
        code: "TOOL_NOT_FOUND" 
      }, { status: 404 });
    }

    const toolCategory = tool[0].category;

    // Check if active editorial score already exists for this tool
    const existingScore = await db.select()
      .from(editorialScores)
      .where(and(
        eq(editorialScores.toolId, parsedToolId),
        eq(editorialScores.isActive, true)
      ))
      .limit(1);

    if (existingScore.length > 0) {
      return NextResponse.json({ 
        error: "An active editorial score already exists for this tool",
        code: "DUPLICATE_EDITORIAL_SCORE" 
      }, { status: 409 });
    }

    // Create editorial score
    const now = new Date().toISOString();
    const newScore = await db.insert(editorialScores)
      .values({
        toolId: parsedToolId,
        category: toolCategory,
        metricScores: JSON.stringify(metricScores),
        editorId: user.id,
        notes: notes || null,
        isActive: true,
        createdAt: now,
        updatedAt: now
      })
      .returning();

    return NextResponse.json(newScore[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Authentication check
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // Admin role check
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    // Extract and validate ID from query params
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const editorialScoreId = parseInt(id);

    // Check if editorial score exists
    const existingScore = await db
      .select()
      .from(editorialScores)
      .where(eq(editorialScores.id, editorialScoreId))
      .limit(1);

    if (existingScore.length === 0) {
      return NextResponse.json(
        { error: 'Editorial score not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { metricScores, notes, isActive } = body;

    // Validate that at least one field is provided for update
    if (metricScores === undefined && notes === undefined && isActive === undefined) {
      return NextResponse.json(
        { error: 'At least one field must be provided for update', code: 'NO_UPDATE_FIELDS' },
        { status: 400 }
      );
    }

    // Security check: Prevent updating protected fields
    const protectedFields = ['toolId', 'tool_id', 'category', 'editorId', 'editor_id', 'createdAt', 'created_at', 'id'];
    const bodyKeys = Object.keys(body);
    const hasProtectedField = bodyKeys.some(key => 
      protectedFields.includes(key) || protectedFields.includes(key.toLowerCase())
    );

    if (hasProtectedField) {
      return NextResponse.json(
        { error: 'Cannot update protected fields (toolId, category, editorId, createdAt)', code: 'PROTECTED_FIELD_UPDATE' },
        { status: 400 }
      );
    }

    // Validate metricScores if provided
    if (metricScores !== undefined) {
      if (typeof metricScores !== 'object' || metricScores === null || Array.isArray(metricScores)) {
        return NextResponse.json(
          { error: 'metricScores must be a valid object', code: 'INVALID_METRIC_SCORES' },
          { status: 400 }
        );
      }

      // Validate each score is between 1-10
      const scores = Object.values(metricScores);
      for (const score of scores) {
        if (typeof score !== 'number' || score < 1 || score > 10) {
          return NextResponse.json(
            { error: 'All metric scores must be numbers between 1 and 10', code: 'INVALID_SCORE_RANGE' },
            { status: 400 }
          );
        }
      }
    }

    // Validate notes if provided
    if (notes !== undefined) {
      if (typeof notes !== 'string') {
        return NextResponse.json(
          { error: 'notes must be a string', code: 'INVALID_NOTES_TYPE' },
          { status: 400 }
        );
      }

      if (notes.length > 1000) {
        return NextResponse.json(
          { error: 'notes cannot exceed 1000 characters', code: 'NOTES_TOO_LONG' },
          { status: 400 }
        );
      }
    }

    // Validate isActive if provided
    if (isActive !== undefined && typeof isActive !== 'boolean') {
      return NextResponse.json(
        { error: 'isActive must be a boolean', code: 'INVALID_IS_ACTIVE_TYPE' },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData: Record<string, any> = {
      updatedAt: new Date().toISOString(),
    };

    if (metricScores !== undefined) {
      updateData.metricScores = metricScores;
    }

    if (notes !== undefined) {
      updateData.notes = notes.trim();
    }

    if (isActive !== undefined) {
      updateData.isActive = isActive;
    }

    // Update the editorial score
    const updated = await db
      .update(editorialScores)
      .set(updateData)
      .where(eq(editorialScores.id, editorialScoreId))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { error: 'Failed to update editorial score', code: 'UPDATE_FAILED' },
        { status: 500 }
      );
    }

    return NextResponse.json(updated[0], { status: 200 });

  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error, code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}