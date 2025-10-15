import { db } from '@/db';
import { mainCategories } from '@/db/schema';

async function main() {
    const sampleCategories = [
        {
            name: 'AI & Machine Learning',
            slug: 'ai-machine-learning',
            description: 'Artificial intelligence and machine learning tools for automation, content generation, and intelligent processing',
            icon: 'Brain',
            color: 'from-purple-500 to-pink-500',
            displayOrder: 0,
            isActive: true,
            toolCount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            name: 'Productivity & Workflow',
            slug: 'productivity-workflow',
            description: 'Task management, time tracking, and workflow optimization tools to boost efficiency',
            icon: 'Zap',
            color: 'from-blue-500 to-cyan-500',
            displayOrder: 1,
            isActive: true,
            toolCount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            name: 'Design & Creative',
            slug: 'design-creative',
            description: 'Graphic design, UI/UX, and creative production tools for visual content',
            icon: 'Palette',
            color: 'from-orange-500 to-red-500',
            displayOrder: 2,
            isActive: true,
            toolCount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }
    ];

    await db.insert(mainCategories).values(sampleCategories);
    
    console.log('✅ Main categories seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});