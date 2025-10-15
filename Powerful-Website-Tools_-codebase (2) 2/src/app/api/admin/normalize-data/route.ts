import { NextResponse } from 'next/server';
import { db } from '@/db';
import { tools } from '@/db/schema';
import { sql } from 'drizzle-orm';

/**
 * Normalize tool data to match API expected values
 * Categories: 'AI', 'Design', 'Development', 'Marketing', 'Productivity', 'Analytics'
 * Types: 'Web App', 'Browser Extension', 'API', 'Mobile App'
 * Pricing: 'free', 'freemium', 'paid'
 */
export async function POST() {
  try {
    const updates: string[] = [];

    // Normalize categories (case-insensitive mapping)
    const categoryMap: Record<string, string> = {
      'ai': 'AI',
      'design': 'Design',
      'development': 'Development',
      'marketing': 'Marketing',
      'productivity': 'Productivity',
      'analytics': 'Analytics',
    };

    // Normalize types (kebab-case to proper case)
    const typeMap: Record<string, string> = {
      'web-app': 'Web App',
      'web app': 'Web App',
      'browser-extension': 'Browser Extension',
      'browser extension': 'Browser Extension',
      'api': 'API',
      'mobile-app': 'Mobile App',
      'mobile app': 'Mobile App',
    };

    // Normalize pricing (ensure lowercase)
    const pricingMap: Record<string, string> = {
      'Free': 'free',
      'FREE': 'free',
      'Paid': 'paid',
      'PAID': 'paid',
      'Freemium': 'freemium',
      'FREEMIUM': 'freemium',
    };

    // Get all tools
    const allTools = await db.select().from(tools);

    // Update each tool if needed
    for (const tool of allTools) {
      let needsUpdate = false;
      const updateData: any = { updatedAt: new Date().toISOString() };

      // Check category
      const normalizedCategory = categoryMap[tool.category.toLowerCase()];
      if (normalizedCategory && tool.category !== normalizedCategory) {
        updateData.category = normalizedCategory;
        needsUpdate = true;
        updates.push(`Tool #${tool.id}: category "${tool.category}" → "${normalizedCategory}"`);
      }

      // Check type
      const normalizedType = typeMap[tool.type.toLowerCase()];
      if (normalizedType && tool.type !== normalizedType) {
        updateData.type = normalizedType;
        needsUpdate = true;
        updates.push(`Tool #${tool.id}: type "${tool.type}" → "${normalizedType}"`);
      }

      // Check pricing
      const normalizedPricing = pricingMap[tool.pricing] || tool.pricing.toLowerCase();
      if (tool.pricing !== normalizedPricing) {
        updateData.pricing = normalizedPricing;
        needsUpdate = true;
        updates.push(`Tool #${tool.id}: pricing "${tool.pricing}" → "${normalizedPricing}"`);
      }

      // Apply updates if needed
      if (needsUpdate) {
        await db.update(tools)
          .set(updateData)
          .where(sql`${tools.id} = ${tool.id}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Normalized ${updates.length} field(s) across ${allTools.length} tools`,
      updates,
      summary: {
        totalTools: allTools.length,
        updatedFields: updates.length,
      }
    });
  } catch (error) {
    console.error('Normalization error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to normalize data',
      details: String(error)
    }, { status: 500 });
  }
}