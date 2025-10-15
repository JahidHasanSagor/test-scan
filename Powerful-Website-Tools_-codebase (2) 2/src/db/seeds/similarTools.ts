import { db } from '@/db';
import { similarTools } from '@/db/schema';

async function main() {
    const sampleSimilarTools = [
        // Design Tool Relationships
        { toolId: 1, similarToolId: 2, relevanceScore: 90 }, // Figma ↔ Sketch
        { toolId: 2, similarToolId: 1, relevanceScore: 90 },
        { toolId: 3, similarToolId: 1, relevanceScore: 85 }, // Adobe XD ↔ Figma
        { toolId: 1, similarToolId: 3, relevanceScore: 85 },
        { toolId: 2, similarToolId: 3, relevanceScore: 80 }, // Sketch ↔ Adobe XD
        { toolId: 3, similarToolId: 2, relevanceScore: 80 },
        { toolId: 4, similarToolId: 5, relevanceScore: 70 }, // Canva ↔ Adobe Photoshop
        { toolId: 5, similarToolId: 4, relevanceScore: 70 },
        { toolId: 6, similarToolId: 7, relevanceScore: 75 }, // Framer ↔ InVision
        { toolId: 7, similarToolId: 6, relevanceScore: 75 },
        { toolId: 8, similarToolId: 7, relevanceScore: 80 }, // Marvel ↔ InVision
        { toolId: 7, similarToolId: 8, relevanceScore: 80 },
        { toolId: 9, similarToolId: 6, relevanceScore: 85 }, // Principle ↔ Framer
        { toolId: 6, similarToolId: 9, relevanceScore: 85 },

        // Development Tool Relationships
        { toolId: 10, similarToolId: 11, relevanceScore: 85 }, // GitHub ↔ VS Code
        { toolId: 11, similarToolId: 10, relevanceScore: 85 },
        { toolId: 12, similarToolId: 13, relevanceScore: 90 }, // Firebase ↔ Supabase
        { toolId: 13, similarToolId: 12, relevanceScore: 90 },
        { toolId: 14, similarToolId: 15, relevanceScore: 95 }, // Vercel ↔ Netlify
        { toolId: 15, similarToolId: 14, relevanceScore: 95 },
        { toolId: 16, similarToolId: 17, relevanceScore: 70 }, // Docker ↔ Heroku
        { toolId: 17, similarToolId: 16, relevanceScore: 70 },
        { toolId: 18, similarToolId: 13, relevanceScore: 75 }, // MongoDB Atlas ↔ Supabase
        { toolId: 13, similarToolId: 18, relevanceScore: 75 },
        { toolId: 19, similarToolId: 11, relevanceScore: 60 }, // Postman ↔ VS Code
        { toolId: 11, similarToolId: 19, relevanceScore: 60 },

        // Productivity Tool Relationships
        { toolId: 20, similarToolId: 21, relevanceScore: 80 }, // Notion ↔ Trello
        { toolId: 21, similarToolId: 20, relevanceScore: 80 },
        { toolId: 22, similarToolId: 21, relevanceScore: 85 }, // Asana ↔ Trello
        { toolId: 21, similarToolId: 22, relevanceScore: 85 },
        { toolId: 23, similarToolId: 24, relevanceScore: 90 }, // Slack ↔ Microsoft Teams
        { toolId: 24, similarToolId: 23, relevanceScore: 90 },
        { toolId: 25, similarToolId: 22, relevanceScore: 75 }, // Todoist ↔ Asana
        { toolId: 22, similarToolId: 25, relevanceScore: 75 },
        { toolId: 26, similarToolId: 20, relevanceScore: 80 }, // Airtable ↔ Notion
        { toolId: 20, similarToolId: 26, relevanceScore: 80 },
        { toolId: 27, similarToolId: 24, relevanceScore: 85 }, // Google Workspace ↔ Microsoft Teams
        { toolId: 24, similarToolId: 27, relevanceScore: 85 },

        // Marketing Tool Relationships
        { toolId: 28, similarToolId: 29, relevanceScore: 85 }, // Mailchimp ↔ ConvertKit
        { toolId: 29, similarToolId: 28, relevanceScore: 85 },
        { toolId: 30, similarToolId: 31, relevanceScore: 75 }, // HubSpot ↔ Intercom
        { toolId: 31, similarToolId: 30, relevanceScore: 75 },
        { toolId: 32, similarToolId: 33, relevanceScore: 90 }, // Hootsuite ↔ Buffer
        { toolId: 33, similarToolId: 32, relevanceScore: 90 },
        { toolId: 34, similarToolId: 28, relevanceScore: 80 }, // Klaviyo ↔ Mailchimp
        { toolId: 28, similarToolId: 34, relevanceScore: 80 },

        // AI Tool Relationships
        { toolId: 35, similarToolId: 36, relevanceScore: 88 }, // ChatGPT ↔ Claude
        { toolId: 36, similarToolId: 35, relevanceScore: 88 },
        { toolId: 37, similarToolId: 38, relevanceScore: 92 }, // Midjourney ↔ DALL-E
        { toolId: 38, similarToolId: 37, relevanceScore: 92 },
        { toolId: 39, similarToolId: 40, relevanceScore: 85 }, // Jasper ↔ Copy.ai
        { toolId: 40, similarToolId: 39, relevanceScore: 85 },
        { toolId: 41, similarToolId: 39, relevanceScore: 70 }, // Grammarly ↔ Jasper
        { toolId: 39, similarToolId: 41, relevanceScore: 70 },

        // Analytics Tool Relationships
        { toolId: 42, similarToolId: 43, relevanceScore: 80 }, // Google Analytics ↔ Mixpanel
        { toolId: 43, similarToolId: 42, relevanceScore: 80 },
        { toolId: 43, similarToolId: 44, relevanceScore: 85 }, // Mixpanel ↔ Amplitude
        { toolId: 44, similarToolId: 43, relevanceScore: 85 },
        { toolId: 45, similarToolId: 43, relevanceScore: 75 }, // Hotjar ↔ Mixpanel
        { toolId: 43, similarToolId: 45, relevanceScore: 75 },
        { toolId: 46, similarToolId: 42, relevanceScore: 70 }, // Tableau ↔ Google Analytics
        { toolId: 42, similarToolId: 46, relevanceScore: 70 }
    ];

    await db.insert(similarTools).values(sampleSimilarTools);
    
    console.log('✅ Similar tools seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});