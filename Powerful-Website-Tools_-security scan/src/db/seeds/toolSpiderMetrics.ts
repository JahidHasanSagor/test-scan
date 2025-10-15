import { db } from '@/db';
import { tools } from '@/db/schema';
import { eq } from 'drizzle-orm';

async function main() {
    // First, fetch all existing tools
    const existingTools = await db.select().from(tools);
    
    if (existingTools.length === 0) {
        console.log('⚠️ No tools found in database to update');
        return;
    }

    console.log(`📊 Updating spider chart metrics for ${existingTools.length} tools...`);

    // Update each tool with realistic spider chart metrics
    for (const tool of existingTools) {
        let metrics = {
            contentQuality: 5,
            speedEfficiency: 5,
            creativeFeatures: 5,
            integrationOptions: 5,
            learningCurve: 5,
            valueForMoney: 5,
        };

        // Base scores on pricing
        if (tool.pricing === 'paid') {
            metrics = {
                contentQuality: Math.floor(Math.random() * 3) + 8, // 8-10
                speedEfficiency: Math.floor(Math.random() * 3) + 7, // 7-9
                creativeFeatures: Math.floor(Math.random() * 3) + 8, // 8-10
                integrationOptions: Math.floor(Math.random() * 3) + 8, // 8-10
                learningCurve: Math.floor(Math.random() * 3) + 5, // 5-7
                valueForMoney: Math.floor(Math.random() * 3) + 7, // 7-9
            };
        } else if (tool.pricing === 'freemium') {
            metrics = {
                contentQuality: Math.floor(Math.random() * 3) + 6, // 6-8
                speedEfficiency: Math.floor(Math.random() * 3) + 6, // 6-8
                creativeFeatures: Math.floor(Math.random() * 3) + 6, // 6-8
                integrationOptions: Math.floor(Math.random() * 4) + 6, // 6-9
                learningCurve: Math.floor(Math.random() * 4) + 4, // 4-7
                valueForMoney: Math.floor(Math.random() * 3) + 8, // 8-10
            };
        } else if (tool.pricing === 'free') {
            metrics = {
                contentQuality: Math.floor(Math.random() * 4) + 5, // 5-8
                speedEfficiency: Math.floor(Math.random() * 5) + 5, // 5-9
                creativeFeatures: Math.floor(Math.random() * 4) + 4, // 4-7
                integrationOptions: Math.floor(Math.random() * 4) + 4, // 4-7
                learningCurve: Math.floor(Math.random() * 4) + 3, // 3-6
                valueForMoney: Math.floor(Math.random() * 2) + 9, // 9-10
            };
        }

        // Apply category-specific adjustments
        const category = tool.category.toLowerCase();
        
        if (category.includes('design') || category.includes('graphic')) {
            metrics.creativeFeatures = Math.min(10, metrics.creativeFeatures + 1);
            metrics.contentQuality = Math.min(10, metrics.contentQuality + 1);
        }
        
        if (category.includes('development') || category.includes('code') || category.includes('developer')) {
            metrics.integrationOptions = Math.min(10, metrics.integrationOptions + 1);
            metrics.speedEfficiency = Math.min(10, metrics.speedEfficiency + 1);
        }
        
        if (category.includes('productivity') || category.includes('automation')) {
            metrics.speedEfficiency = Math.min(10, metrics.speedEfficiency + 1);
            metrics.valueForMoney = Math.min(10, metrics.valueForMoney + 1);
        }
        
        if (category.includes('ai') || category.includes('artificial intelligence') || category.includes('machine learning')) {
            metrics.creativeFeatures = Math.min(10, metrics.creativeFeatures + 1);
            metrics.contentQuality = Math.min(10, metrics.contentQuality + 1);
        }
        
        if (category.includes('marketing') || category.includes('seo') || category.includes('social media')) {
            metrics.integrationOptions = Math.min(10, metrics.integrationOptions + 1);
            metrics.contentQuality = Math.min(10, metrics.contentQuality + 1);
        }
        
        if (category.includes('analytics') || category.includes('data')) {
            metrics.contentQuality = Math.min(10, metrics.contentQuality + 1);
            metrics.integrationOptions = Math.min(10, metrics.integrationOptions + 1);
        }

        // Update the tool with new metrics
        await db
            .update(tools)
            .set({
                contentQuality: metrics.contentQuality,
                speedEfficiency: metrics.speedEfficiency,
                creativeFeatures: metrics.creativeFeatures,
                integrationOptions: metrics.integrationOptions,
                learningCurve: metrics.learningCurve,
                valueForMoney: metrics.valueForMoney,
                updatedAt: new Date().toISOString(),
            })
            .where(eq(tools.id, tool.id));

        console.log(`✓ Updated ${tool.title} (${tool.pricing}, ${tool.category})`);
    }

    console.log('✅ Spider chart metrics seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});