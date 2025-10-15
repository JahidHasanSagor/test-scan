import { db } from '@/db';
import { subCategories } from '@/db/schema';

async function main() {
    const currentTimestamp = new Date().toISOString();
    
    const sampleSubCategories = [
        {
            mainCategoryId: 1,
            name: 'Text & Language AI',
            slug: 'text-language-ai',
            description: 'AI tools for writing, grammar checking, and language processing',
            displayOrder: 0,
            isActive: true,
            toolCount: 0,
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        },
        {
            mainCategoryId: 1,
            name: 'Visual & Image AI',
            slug: 'visual-image-ai',
            description: 'AI-powered image generation, editing, and analysis tools',
            displayOrder: 1,
            isActive: true,
            toolCount: 0,
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        },
        {
            mainCategoryId: 1,
            name: 'Audio & Voice AI',
            slug: 'audio-voice-ai',
            description: 'Text-to-speech, voice cloning, and audio generation tools',
            displayOrder: 2,
            isActive: true,
            toolCount: 0,
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        },
        {
            mainCategoryId: 2,
            name: 'Task Management',
            slug: 'task-management',
            description: 'Project planning, to-do lists, and team collaboration tools',
            displayOrder: 0,
            isActive: true,
            toolCount: 0,
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        },
        {
            mainCategoryId: 2,
            name: 'Time Management',
            slug: 'time-management',
            description: 'Time tracking, timers, and calendar management tools',
            displayOrder: 1,
            isActive: true,
            toolCount: 0,
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        },
        {
            mainCategoryId: 2,
            name: 'Knowledge Management',
            slug: 'knowledge-management',
            description: 'Note-taking, knowledge bases, and research organization tools',
            displayOrder: 2,
            isActive: true,
            toolCount: 0,
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        },
        {
            mainCategoryId: 3,
            name: 'Graphic Design',
            slug: 'graphic-design',
            description: 'Logo design, print, and digital graphics creation tools',
            displayOrder: 0,
            isActive: true,
            toolCount: 0,
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        },
        {
            mainCategoryId: 3,
            name: 'UI/UX Design',
            slug: 'ui-ux-design',
            description: 'Wireframing, prototyping, and design system tools',
            displayOrder: 1,
            isActive: true,
            toolCount: 0,
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        },
        {
            mainCategoryId: 3,
            name: 'Video Production',
            slug: 'video-production',
            description: 'Video editing, motion graphics, and animation tools',
            displayOrder: 2,
            isActive: true,
            toolCount: 0,
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        }
    ];

    await db.insert(subCategories).values(sampleSubCategories);
    
    console.log('✅ SubCategories seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});