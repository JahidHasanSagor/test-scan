import { db } from '@/db';
import { savedTools } from '@/db/schema';

async function main() {
    const sampleSavedTools = [
        // designer_sarah - saves design tools
        {
            userId: 'user_designer_sarah_001',
            toolId: 1, // Figma
            createdAt: new Date('2024-11-15T09:30:00Z').toISOString(),
        },
        {
            userId: 'user_designer_sarah_001',
            toolId: 5, // Sketch
            createdAt: new Date('2024-11-20T14:15:00Z').toISOString(),
        },
        {
            userId: 'user_designer_sarah_001',
            toolId: 12, // Adobe XD
            createdAt: new Date('2024-12-01T11:45:00Z').toISOString(),
        },
        {
            userId: 'user_designer_sarah_001',
            toolId: 8, // Canva
            createdAt: new Date('2024-12-05T16:20:00Z').toISOString(),
        },

        // dev_alex - saves development tools
        {
            userId: 'user_dev_alex_002',
            toolId: 3, // VS Code
            createdAt: new Date('2024-11-10T08:00:00Z').toISOString(),
        },
        {
            userId: 'user_dev_alex_002',
            toolId: 15, // GitHub
            createdAt: new Date('2024-11-12T10:30:00Z').toISOString(),
        },
        {
            userId: 'user_dev_alex_002',
            toolId: 22, // Docker
            createdAt: new Date('2024-11-25T13:15:00Z').toISOString(),
        },
        {
            userId: 'user_dev_alex_002',
            toolId: 18, // Vercel
            createdAt: new Date('2024-12-03T09:45:00Z').toISOString(),
        },
        {
            userId: 'user_dev_alex_002',
            toolId: 25, // PostgreSQL
            createdAt: new Date('2024-12-08T15:30:00Z').toISOString(),
        },

        // startup_founder - saves tools across categories
        {
            userId: 'user_startup_founder_003',
            toolId: 2, // Notion
            createdAt: new Date('2024-11-08T07:30:00Z').toISOString(),
        },
        {
            userId: 'user_startup_founder_003',
            toolId: 6, // Slack
            createdAt: new Date('2024-11-08T07:45:00Z').toISOString(),
        },
        {
            userId: 'user_startup_founder_003',
            toolId: 20, // Stripe
            createdAt: new Date('2024-11-18T12:00:00Z').toISOString(),
        },
        {
            userId: 'user_startup_founder_003',
            toolId: 14, // Google Analytics
            createdAt: new Date('2024-11-28T14:30:00Z').toISOString(),
        },
        {
            userId: 'user_startup_founder_003',
            toolId: 10, // Mailchimp
            createdAt: new Date('2024-12-02T10:15:00Z').toISOString(),
        },
        {
            userId: 'user_startup_founder_003',
            toolId: 17, // HubSpot
            createdAt: new Date('2024-12-06T16:45:00Z').toISOString(),
        },

        // freelancer_mike - saves productivity and design tools
        {
            userId: 'user_freelancer_mike_004',
            toolId: 7, // Trello
            createdAt: new Date('2024-11-14T09:00:00Z').toISOString(),
        },
        {
            userId: 'user_freelancer_mike_004',
            toolId: 1, // Figma
            createdAt: new Date('2024-11-16T11:30:00Z').toISOString(),
        },
        {
            userId: 'user_freelancer_mike_004',
            toolId: 19, // Calendly
            createdAt: new Date('2024-11-22T14:00:00Z').toISOString(),
        },
        {
            userId: 'user_freelancer_mike_004',
            toolId: 2, // Notion
            createdAt: new Date('2024-12-01T08:30:00Z').toISOString(),
        },

        // marketing_jen - saves marketing tools
        {
            userId: 'user_marketing_jen_005',
            toolId: 10, // Mailchimp
            createdAt: new Date('2024-11-11T10:00:00Z').toISOString(),
        },
        {
            userId: 'user_marketing_jen_005',
            toolId: 17, // HubSpot
            createdAt: new Date('2024-11-13T15:30:00Z').toISOString(),
        },
        {
            userId: 'user_marketing_jen_005',
            toolId: 11, // Buffer
            createdAt: new Date('2024-11-20T12:15:00Z').toISOString(),
        },
        {
            userId: 'user_marketing_jen_005',
            toolId: 8, // Canva
            createdAt: new Date('2024-11-27T16:00:00Z').toISOString(),
        },
        {
            userId: 'user_marketing_jen_005',
            toolId: 14, // Google Analytics
            createdAt: new Date('2024-12-04T09:30:00Z').toISOString(),
        },

        // student_emma - saves free tools
        {
            userId: 'user_student_emma_006',
            toolId: 1, // Figma
            createdAt: new Date('2024-11-09T19:00:00Z').toISOString(),
        },
        {
            userId: 'user_student_emma_006',
            toolId: 3, // VS Code
            createdAt: new Date('2024-11-12T20:30:00Z').toISOString(),
        },
        {
            userId: 'user_student_emma_006',
            toolId: 7, // Trello
            createdAt: new Date('2024-11-19T18:15:00Z').toISOString(),
        },
        {
            userId: 'user_student_emma_006',
            toolId: 2, // Notion
            createdAt: new Date('2024-11-26T21:00:00Z').toISOString(),
        },

        // agency_director - saves premium tools across categories
        {
            userId: 'user_agency_director_007',
            toolId: 5, // Sketch
            createdAt: new Date('2024-11-07T08:45:00Z').toISOString(),
        },
        {
            userId: 'user_agency_director_007',
            toolId: 17, // HubSpot
            createdAt: new Date('2024-11-10T10:00:00Z').toISOString(),
        },
        {
            userId: 'user_agency_director_007',
            toolId: 16, // Asana
            createdAt: new Date('2024-11-15T11:30:00Z').toISOString(),
        },
        {
            userId: 'user_agency_director_007',
            toolId: 6, // Slack
            createdAt: new Date('2024-11-21T13:00:00Z').toISOString(),
        },
        {
            userId: 'user_agency_director_007',
            toolId: 21, // Mixpanel
            createdAt: new Date('2024-11-29T15:45:00Z').toISOString(),
        },

        // small_biz_owner - saves business-focused tools
        {
            userId: 'user_small_biz_owner_008',
            toolId: 24, // QuickBooks
            createdAt: new Date('2024-11-13T09:15:00Z').toISOString(),
        },
        {
            userId: 'user_small_biz_owner_008',
            toolId: 10, // Mailchimp
            createdAt: new Date('2024-11-17T14:30:00Z').toISOString(),
        },
        {
            userId: 'user_small_biz_owner_008',
            toolId: 19, // Calendly
            createdAt: new Date('2024-11-24T11:00:00Z').toISOString(),
        },
        {
            userId: 'user_small_biz_owner_008',
            toolId: 20, // Stripe
            createdAt: new Date('2024-12-02T16:15:00Z').toISOString(),
        },

        // content_creator - saves creative tools
        {
            userId: 'user_content_creator_009',
            toolId: 8, // Canva
            createdAt: new Date('2024-11-16T12:00:00Z').toISOString(),
        },
        {
            userId: 'user_content_creator_009',
            toolId: 13, // Grammarly
            createdAt: new Date('2024-11-18T15:30:00Z').toISOString(),
        },
        {
            userId: 'user_content_creator_009',
            toolId: 11, // Buffer
            createdAt: new Date('2024-11-25T10:45:00Z').toISOString(),
        },
        {
            userId: 'user_content_creator_009',
            toolId: 2, // Notion
            createdAt: new Date('2024-12-01T14:20:00Z').toISOString(),
        },

        // product_manager - saves analytics and productivity tools
        {
            userId: 'user_product_manager_010',
            toolId: 21, // Mixpanel
            createdAt: new Date('2024-11-12T08:30:00Z').toISOString(),
        },
        {
            userId: 'user_product_manager_010',
            toolId: 16, // Asana
            createdAt: new Date('2024-11-14T11:15:00Z').toISOString(),
        },
        {
            userId: 'user_product_manager_010',
            toolId: 6, // Slack
            createdAt: new Date('2024-11-19T09:45:00Z').toISOString(),
        },
        {
            userId: 'user_product_manager_010',
            toolId: 14, // Google Analytics
            createdAt: new Date('2024-11-28T13:30:00Z').toISOString(),
        }
    ];

    await db.insert(savedTools).values(sampleSavedTools);
    
    console.log('✅ Saved tools seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});