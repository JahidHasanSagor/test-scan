import { db } from '@/db';
import { reviews } from '@/db/schema';

async function main() {
    const sampleReviews = [
        // 5-star reviews (5 total)
        {
            toolId: 1,
            userId: 'designer_pro',
            rating: 5,
            content: 'Amazing tool! The collaborative features are game-changing for our design team. Easy to use and super reliable.',
            createdAt: new Date('2024-10-15').toISOString(),
        },
        {
            toolId: 3,
            userId: 'creative_director',
            rating: 5,
            content: 'Absolutely love this platform! The AI features save us hours every week. Best investment we made this year.',
            createdAt: new Date('2024-11-02').toISOString(),
        },
        {
            toolId: 7,
            userId: 'startup_founder',
            rating: 5,
            content: 'Perfect for our growing team. Excellent customer support and the feature set is exactly what we needed.',
            createdAt: new Date('2024-09-28').toISOString(),
        },
        {
            toolId: 12,
            userId: 'freelancer_mike',
            rating: 5,
            content: 'This tool transformed my workflow completely. Intuitive interface and powerful automation features.',
            createdAt: new Date('2024-10-20').toISOString(),
        },
        {
            toolId: 15,
            userId: 'agency_lead',
            rating: 5,
            content: 'Outstanding platform! Our productivity increased by 40% since switching. Highly recommended for agencies.',
            createdAt: new Date('2024-11-08').toISOString(),
        },

        // 4-star reviews (8 total)
        {
            toolId: 2,
            userId: 'dev_sarah',
            rating: 4,
            content: 'Really solid platform with great features. Could use better mobile support but overall very happy with it.',
            createdAt: new Date('2024-10-05').toISOString(),
        },
        {
            toolId: 5,
            userId: 'pm_jenny',
            rating: 4,
            content: 'Good tool for project management. The reporting features are excellent, just wish the UI was more modern.',
            createdAt: new Date('2024-09-15').toISOString(),
        },
        {
            toolId: 8,
            userId: 'small_biz_owner',
            rating: 4,
            content: 'Works well for our small business needs. Pricing is fair and support team is responsive.',
            createdAt: new Date('2024-10-30').toISOString(),
        },
        {
            toolId: 10,
            userId: 'user123',
            rating: 4,
            content: 'Great functionality overall. The learning curve is a bit steep but worth it once you get familiar.',
            createdAt: new Date('2024-11-12').toISOString(),
        },
        {
            toolId: 14,
            userId: 'marketing_pro',
            rating: 4,
            content: 'Solid marketing automation tool. Integration options are good, could use more templates though.',
            createdAt: new Date('2024-09-22').toISOString(),
        },
        {
            toolId: 6,
            userId: 'tech_lead',
            rating: 4,
            content: 'Reliable and feature-rich. The API documentation could be better but the core functionality is strong.',
            createdAt: new Date('2024-10-18').toISOString(),
        },
        {
            toolId: 11,
            userId: 'content_creator',
            rating: 4,
            content: 'Love the creative tools available. Export options are limited but the quality is consistently good.',
            createdAt: new Date('2024-11-05').toISOString(),
        },
        {
            toolId: 17,
            userId: 'product_manager',
            rating: 4,
            content: 'Excellent for product roadmapping. User permissions could be more granular but team loves it.',
            createdAt: new Date('2024-09-30').toISOString(),
        },

        // 3-star reviews (7 total)
        {
            toolId: 4,
            userId: 'student_alex',
            rating: 3,
            content: 'Decent tool for basic needs. Interface could be more intuitive but gets the job done for simple projects.',
            createdAt: new Date('2024-10-12').toISOString(),
        },
        {
            toolId: 9,
            userId: 'freelance_writer',
            rating: 3,
            content: 'Average experience. Has the features I need but nothing special. Price point is reasonable.',
            createdAt: new Date('2024-09-18').toISOString(),
        },
        {
            toolId: 13,
            userId: 'junior_dev',
            rating: 3,
            content: 'Okay for beginners but lacks advanced features. Good starting point but will need to upgrade soon.',
            createdAt: new Date('2024-11-01').toISOString(),
        },
        {
            toolId: 16,
            userId: 'consultant_lisa',
            rating: 3,
            content: 'Mixed feelings about this one. Some features are great, others feel outdated. Needs modernization.',
            createdAt: new Date('2024-10-25').toISOString(),
        },
        {
            toolId: 18,
            userId: 'startup_cto',
            rating: 3,
            content: 'Works but not impressed. Customer support is slow and the interface feels clunky compared to competitors.',
            createdAt: new Date('2024-09-12').toISOString(),
        },
        {
            toolId: 20,
            userId: 'design_intern',
            rating: 3,
            content: 'Basic functionality is there but missing key features we need. Hoping for updates soon.',
            createdAt: new Date('2024-10-08').toISOString(),
        },
        {
            toolId: 19,
            userId: 'operations_manager',
            rating: 3,
            content: 'Does what it says but user experience could be much better. Functional but not enjoyable to use.',
            createdAt: new Date('2024-11-15').toISOString(),
        },

        // 2-star reviews (3 total)
        {
            toolId: 21,
            userId: 'frustrated_user',
            rating: 2,
            content: 'Has potential but too many bugs and crashes. Customer support is slow to respond to issues.',
            createdAt: new Date('2024-10-03').toISOString(),
        },
        {
            toolId: 22,
            userId: 'small_agency',
            rating: 2,
            content: 'Disappointed with performance. Features are limited and pricing is too high for what you get.',
            createdAt: new Date('2024-09-25').toISOString(),
        },
        {
            toolId: 23,
            userId: 'project_lead',
            rating: 2,
            content: 'Below expectations. Interface is confusing and lacks important integrations we need for our workflow.',
            createdAt: new Date('2024-11-10').toISOString(),
        },

        // 1-star reviews (2 total)
        {
            toolId: 24,
            userId: 'angry_customer',
            rating: 1,
            content: 'Terrible experience. Constantly crashes and lost hours of work. Would not recommend to anyone.',
            createdAt: new Date('2024-10-01').toISOString(),
        },
        {
            toolId: 25,
            userId: 'disappointed_dev',
            rating: 1,
            content: 'Worst tool I have used. Poor documentation, buggy interface, and zero customer support response.',
            createdAt: new Date('2024-09-08').toISOString(),
        }
    ];

    await db.insert(reviews).values(sampleReviews);
    
    console.log('✅ Reviews seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});