import { db } from '@/db';
import { blogTags } from '@/db/schema';

async function main() {
    const sampleTags = [
        {
            name: 'AI',
            slug: 'ai',
            createdAt: new Date('2024-11-01').toISOString(),
        },
        {
            name: 'Design',
            slug: 'design',
            createdAt: new Date('2024-11-02').toISOString(),
        },
        {
            name: 'Productivity',
            slug: 'productivity',
            createdAt: new Date('2024-11-03').toISOString(),
        },
        {
            name: 'SaaS',
            slug: 'saas',
            createdAt: new Date('2024-11-04').toISOString(),
        },
        {
            name: 'ChatGPT',
            slug: 'chatgpt',
            createdAt: new Date('2024-11-05').toISOString(),
        },
        {
            name: 'Automation',
            slug: 'automation',
            createdAt: new Date('2024-11-06').toISOString(),
        },
        {
            name: 'Workflow',
            slug: 'workflow',
            createdAt: new Date('2024-11-07').toISOString(),
        },
        {
            name: 'Remote Work',
            slug: 'remote-work',
            createdAt: new Date('2024-11-08').toISOString(),
        },
        {
            name: 'Collaboration',
            slug: 'collaboration',
            createdAt: new Date('2024-11-09').toISOString(),
        },
        {
            name: 'Development',
            slug: 'development',
            createdAt: new Date('2024-11-10').toISOString(),
        },
        {
            name: 'Marketing',
            slug: 'marketing',
            createdAt: new Date('2024-11-11').toISOString(),
        },
        {
            name: 'Analytics',
            slug: 'analytics',
            createdAt: new Date('2024-11-12').toISOString(),
        },
        {
            name: 'No-Code',
            slug: 'no-code',
            createdAt: new Date('2024-11-13').toISOString(),
        },
        {
            name: 'API',
            slug: 'api',
            createdAt: new Date('2024-11-14').toISOString(),
        },
        {
            name: 'UX Design',
            slug: 'ux-design',
            createdAt: new Date('2024-11-15').toISOString(),
        },
        {
            name: 'Web Development',
            slug: 'web-development',
            createdAt: new Date('2024-11-16').toISOString(),
        },
        {
            name: 'Project Management',
            slug: 'project-management',
            createdAt: new Date('2024-11-17').toISOString(),
        },
        {
            name: 'Content Creation',
            slug: 'content-creation',
            createdAt: new Date('2024-11-18').toISOString(),
        },
        {
            name: 'Machine Learning',
            slug: 'machine-learning',
            createdAt: new Date('2024-11-19').toISOString(),
        },
        {
            name: 'Integration',
            slug: 'integration',
            createdAt: new Date('2024-11-20').toISOString(),
        }
    ];

    await db.insert(blogTags).values(sampleTags);
    
    console.log('✅ Blog tags seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});