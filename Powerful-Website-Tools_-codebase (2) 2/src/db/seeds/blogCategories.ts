import { db } from '@/db';
import { blogCategories } from '@/db/schema';

async function main() {
    const sampleCategories = [
        {
            name: 'Tool Reviews',
            slug: 'tool-reviews',
            description: 'In-depth reviews and comparisons of the latest AI tools, productivity apps, and SaaS products',
            createdAt: new Date('2024-11-05').toISOString(),
        },
        {
            name: 'AI News',
            slug: 'ai-news',
            description: 'Latest updates, breakthroughs, and trends in artificial intelligence and machine learning',
            createdAt: new Date('2024-11-12').toISOString(),
        },
        {
            name: 'Tutorials',
            slug: 'tutorials',
            description: 'Step-by-step guides and how-tos for maximizing productivity with modern tools',
            createdAt: new Date('2024-11-18').toISOString(),
        },
        {
            name: 'Trends',
            slug: 'trends',
            description: 'Analysis of emerging trends in technology, design, and digital workspaces',
            createdAt: new Date('2024-11-25').toISOString(),
        },
        {
            name: 'Playbooks',
            slug: 'playbooks',
            description: 'Comprehensive guides and frameworks for implementing tools and workflows',
            createdAt: new Date('2024-12-02').toISOString(),
        }
    ];

    await db.insert(blogCategories).values(sampleCategories);
    
    console.log('✅ Blog categories seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});