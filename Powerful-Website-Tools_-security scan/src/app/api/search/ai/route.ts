import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { tools } from '@/db/schema';
import { like, or, and, eq, desc } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    // Use OpenAI to enhance the search query
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a search query enhancement assistant for a tools directory. Your job is to:
1. Fix typos and spelling mistakes
2. Understand user intent
3. Extract key search terms
4. Identify relevant categories: Design, Development, Marketing, Productivity, AI, Analytics
5. Identify tool types: Web App, Browser Extension, API, Mobile App
6. Return a structured JSON response

Return JSON in this exact format:
{
  "correctedQuery": "corrected search query",
  "intent": "brief description of what user is looking for",
  "searchTerms": ["term1", "term2"],
  "suggestedCategory": "category name or null",
  "suggestedType": "tool type or null"
}`
          },
          {
            role: 'user',
            content: query
          }
        ],
        temperature: 0.3,
        max_tokens: 300,
      }),
    });

    if (!openaiResponse.ok) {
      throw new Error('OpenAI API request failed');
    }

    const openaiData = await openaiResponse.json();
    const aiAnalysis = JSON.parse(openaiData.choices[0].message.content);

    // Build search conditions based on AI analysis
    const conditions = [];
    
    // Always filter for approved tools
    conditions.push(eq(tools.status, 'approved'));

    // Search across multiple fields with corrected query and search terms
    const searchTerms = [aiAnalysis.correctedQuery, ...aiAnalysis.searchTerms];
    const searchConditions = [];

    for (const term of searchTerms) {
      if (term) {
        searchConditions.push(
          like(tools.title, `%${term}%`),
          like(tools.description, `%${term}%`),
          like(tools.category, `%${term}%`),
          like(tools.type, `%${term}%`)
        );
      }
    }

    if (searchConditions.length > 0) {
      conditions.push(or(...searchConditions));
    }

    // Add category filter if AI suggested one
    if (aiAnalysis.suggestedCategory) {
      conditions.push(eq(tools.category, aiAnalysis.suggestedCategory));
    }

    // Add type filter if AI suggested one
    if (aiAnalysis.suggestedType) {
      conditions.push(eq(tools.type, aiAnalysis.suggestedType));
    }

    // Execute search query
    const whereCondition = conditions.length > 1 ? and(...conditions) : conditions[0];
    const results = await db.select()
      .from(tools)
      .where(whereCondition)
      .orderBy(desc(tools.isFeatured), desc(tools.popularity))
      .limit(50);

    return NextResponse.json({
      results,
      aiAnalysis: {
        correctedQuery: aiAnalysis.correctedQuery,
        intent: aiAnalysis.intent,
        suggestedCategory: aiAnalysis.suggestedCategory,
        suggestedType: aiAnalysis.suggestedType,
      },
      totalResults: results.length,
    });

  } catch (error) {
    console.error('AI Search error:', error);
    return NextResponse.json(
      { error: 'Search failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}