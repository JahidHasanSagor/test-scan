import { db } from '@/db';
import { blogPostTags } from '@/db/schema';

async function main() {
    const samplePostTags = [
        // Post 1 (ChatGPT Guide): AI, ChatGPT, Tutorial, Automation
        {
            postId: 1,
            tagId: 1,
            createdAt: new Date('2024-01-15').toISOString(),
        },
        {
            postId: 1,
            tagId: 2,
            createdAt: new Date('2024-01-15').toISOString(),
        },
        {
            postId: 1,
            tagId: 11,
            createdAt: new Date('2024-01-15').toISOString(),
        },
        {
            postId: 1,
            tagId: 5,
            createdAt: new Date('2024-01-15').toISOString(),
        },

        // Post 2 (Top 10 AI Tools): AI, Productivity, Workflow, SaaS, Automation
        {
            postId: 2,
            tagId: 1,
            createdAt: new Date('2024-01-18').toISOString(),
        },
        {
            postId: 2,
            tagId: 3,
            createdAt: new Date('2024-01-18').toISOString(),
        },
        {
            postId: 2,
            tagId: 4,
            createdAt: new Date('2024-01-18').toISOString(),
        },
        {
            postId: 2,
            tagId: 12,
            createdAt: new Date('2024-01-18').toISOString(),
        },
        {
            postId: 2,
            tagId: 5,
            createdAt: new Date('2024-01-18').toISOString(),
        },

        // Post 3 (No-Code AI): AI, No-Code, Tutorial, Automation, ChatGPT
        {
            postId: 3,
            tagId: 1,
            createdAt: new Date('2024-01-22').toISOString(),
        },
        {
            postId: 3,
            tagId: 13,
            createdAt: new Date('2024-01-22').toISOString(),
        },
        {
            postId: 3,
            tagId: 11,
            createdAt: new Date('2024-01-22').toISOString(),
        },
        {
            postId: 3,
            tagId: 5,
            createdAt: new Date('2024-01-22').toISOString(),
        },
        {
            postId: 3,
            tagId: 2,
            createdAt: new Date('2024-01-22').toISOString(),
        },

        // Post 4 (Design Tools Trend): AI, Design, UX Design, Trends
        {
            postId: 4,
            tagId: 1,
            createdAt: new Date('2024-01-25').toISOString(),
        },
        {
            postId: 4,
            tagId: 6,
            createdAt: new Date('2024-01-25').toISOString(),
        },
        {
            postId: 4,
            tagId: 14,
            createdAt: new Date('2024-01-25').toISOString(),
        },
        {
            postId: 4,
            tagId: 15,
            createdAt: new Date('2024-01-25').toISOString(),
        },

        // Post 5 (Midjourney vs DALL-E): AI, Design, Content Creation, ChatGPT
        {
            postId: 5,
            tagId: 1,
            createdAt: new Date('2024-01-28').toISOString(),
        },
        {
            postId: 5,
            tagId: 6,
            createdAt: new Date('2024-01-28').toISOString(),
        },
        {
            postId: 5,
            tagId: 16,
            createdAt: new Date('2024-01-28').toISOString(),
        },
        {
            postId: 5,
            tagId: 2,
            createdAt: new Date('2024-01-28').toISOString(),
        },

        // Post 6 (Remote Work Stack): Remote Work, Productivity, Collaboration, Workflow, SaaS
        {
            postId: 6,
            tagId: 7,
            createdAt: new Date('2024-02-02').toISOString(),
        },
        {
            postId: 6,
            tagId: 3,
            createdAt: new Date('2024-02-02').toISOString(),
        },
        {
            postId: 6,
            tagId: 17,
            createdAt: new Date('2024-02-02').toISOString(),
        },
        {
            postId: 6,
            tagId: 4,
            createdAt: new Date('2024-02-02').toISOString(),
        },
        {
            postId: 6,
            tagId: 12,
            createdAt: new Date('2024-02-02').toISOString(),
        },

        // Post 7 (GPT-5 News): AI, ChatGPT, Machine Learning
        {
            postId: 7,
            tagId: 1,
            createdAt: new Date('2024-02-05').toISOString(),
        },
        {
            postId: 7,
            tagId: 2,
            createdAt: new Date('2024-02-05').toISOString(),
        },
        {
            postId: 7,
            tagId: 8,
            createdAt: new Date('2024-02-05').toISOString(),
        },

        // Post 8 (Productivity Playbook): Productivity, Workflow, Project Management, Collaboration
        {
            postId: 8,
            tagId: 3,
            createdAt: new Date('2024-02-08').toISOString(),
        },
        {
            postId: 8,
            tagId: 4,
            createdAt: new Date('2024-02-08').toISOString(),
        },
        {
            postId: 8,
            tagId: 18,
            createdAt: new Date('2024-02-08').toISOString(),
        },
        {
            postId: 8,
            tagId: 17,
            createdAt: new Date('2024-02-08').toISOString(),
        },

        // Post 9 (AI Coding Future): AI, Development, Web Development, Machine Learning, Automation
        {
            postId: 9,
            tagId: 1,
            createdAt: new Date('2024-02-12').toISOString(),
        },
        {
            postId: 9,
            tagId: 9,
            createdAt: new Date('2024-02-12').toISOString(),
        },
        {
            postId: 9,
            tagId: 19,
            createdAt: new Date('2024-02-12').toISOString(),
        },
        {
            postId: 9,
            tagId: 8,
            createdAt: new Date('2024-02-12').toISOString(),
        },
        {
            postId: 9,
            tagId: 5,
            createdAt: new Date('2024-02-12').toISOString(),
        },

        // Post 10 (SaaS Integration): SaaS, Integration, API, Workflow, Automation
        {
            postId: 10,
            tagId: 12,
            createdAt: new Date('2024-02-15').toISOString(),
        },
        {
            postId: 10,
            tagId: 20,
            createdAt: new Date('2024-02-15').toISOString(),
        },
        {
            postId: 10,
            tagId: 10,
            createdAt: new Date('2024-02-15').toISOString(),
        },
        {
            postId: 10,
            tagId: 4,
            createdAt: new Date('2024-02-15').toISOString(),
        },
        {
            postId: 10,
            tagId: 5,
            createdAt: new Date('2024-02-15').toISOString(),
        },
    ];

    await db.insert(blogPostTags).values(samplePostTags);
    
    console.log('✅ Blog post tags seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});