import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { tools } from "@/db/schema";
import { sql, or, like, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";

    if (!query.trim()) {
      return NextResponse.json({ suggestions: [] });
    }

    // Get matching tools (limit to 5)
    const matchingTools = await db
      .select({
        id: tools.id,
        title: tools.title,
        description: tools.description,
        category: tools.category,
        isFeatured: tools.isFeatured,
        isPremium: tools.isPremium,
      })
      .from(tools)
      .where(
        or(
          like(tools.title, `%${query}%`),
          like(tools.description, `%${query}%`),
          like(tools.category, `%${query}%`)
        )
      )
      .orderBy(desc(tools.isFeatured), desc(tools.popularity))
      .limit(5);

    // Get unique categories that match
    const categoriesResult = await db
      .selectDistinct({ category: tools.category })
      .from(tools)
      .where(like(tools.category, `%${query}%`))
      .limit(3);

    const suggestions = {
      tools: matchingTools.map((tool) => ({
        id: tool.id,
        text: tool.title,
        type: "tool" as const,
        description: tool.description,
        category: tool.category,
        featured: tool.isFeatured,
        isPro: tool.isPremium,
      })),
      categories: categoriesResult.map((cat) => ({
        id: cat.category,
        text: cat.category,
        type: "category" as const,
      })),
    };

    return NextResponse.json(suggestions);
  } catch (error) {
    console.error("Error fetching search suggestions:", error);
    return NextResponse.json(
      { error: "Failed to fetch suggestions" },
      { status: 500 }
    );
  }
}