import { db } from '@/db';
import { mainCategories, subCategories, toolTypes } from '@/db/schema';

async function main() {
    console.log('🗑️  Clearing existing taxonomy data...');
    
    // Delete in correct order due to foreign key constraints
    await db.delete(toolTypes);
    await db.delete(subCategories);
    await db.delete(mainCategories);
    
    console.log('✅ Existing data cleared');
    console.log('📝 Inserting main categories...');
    
    const timestamp = new Date().toISOString();
    
    // Helper function to generate slugs
    const generateSlug = (text: string): string => {
        return text
            .toLowerCase()
            .replace(/&/g, 'and')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    };
    
    // Insert Main Categories
    const mainCategoryData = [
        {
            name: 'AI & Machine Learning',
            slug: 'ai-machine-learning',
            icon: 'Brain',
            color: '#8b5cf6',
            description: 'Artificial Intelligence and Machine Learning tools for automation, analysis, and intelligent solutions',
            display_order: 1,
            is_active: true,
            tool_count: 0,
            created_at: timestamp,
            updated_at: timestamp,
        },
        {
            name: 'Productivity & Workflow',
            slug: 'productivity-workflow',
            icon: 'Workflow',
            color: '#10b981',
            description: 'Tools to boost productivity, manage tasks, and streamline workflows',
            display_order: 2,
            is_active: true,
            tool_count: 0,
            created_at: timestamp,
            updated_at: timestamp,
        },
        {
            name: 'Design & Creative',
            slug: 'design-creative',
            icon: 'Palette',
            color: '#f59e0b',
            description: 'Creative design tools for graphics, UI/UX, video, and 3D',
            display_order: 3,
            is_active: true,
            tool_count: 0,
            created_at: timestamp,
            updated_at: timestamp,
        },
    ];
    
    const insertedMainCategories = await db.insert(mainCategories).values(mainCategoryData).returning();
    console.log(`✅ Inserted ${insertedMainCategories.length} main categories`);
    
    // Get main category IDs by slug
    const aiCategoryId = insertedMainCategories.find(c => c.slug === 'ai-machine-learning')!.id;
    const productivityCategoryId = insertedMainCategories.find(c => c.slug === 'productivity-workflow')!.id;
    const designCategoryId = insertedMainCategories.find(c => c.slug === 'design-creative')!.id;
    
    console.log('📝 Inserting subcategories...');
    
    // Insert SubCategories
    const subCategoryData = [
        // AI & Machine Learning subcategories
        {
            main_category_id: aiCategoryId,
            name: 'Text & Language AI',
            slug: 'ai-machine-learning-text-language-ai',
            description: 'AI-powered text and language processing tools',
            display_order: 1,
            is_active: true,
            tool_count: 0,
            created_at: timestamp,
            updated_at: timestamp,
        },
        {
            main_category_id: aiCategoryId,
            name: 'Visual & Image AI',
            slug: 'ai-machine-learning-visual-image-ai',
            description: 'AI tools for image generation, editing, and analysis',
            display_order: 2,
            is_active: true,
            tool_count: 0,
            created_at: timestamp,
            updated_at: timestamp,
        },
        {
            main_category_id: aiCategoryId,
            name: 'Audio & Voice AI',
            slug: 'ai-machine-learning-audio-voice-ai',
            description: 'AI-powered audio and voice processing solutions',
            display_order: 3,
            is_active: true,
            tool_count: 0,
            created_at: timestamp,
            updated_at: timestamp,
        },
        {
            main_category_id: aiCategoryId,
            name: 'Video & Animation AI',
            slug: 'ai-machine-learning-video-animation-ai',
            description: 'AI tools for video generation, editing, and animation',
            display_order: 4,
            is_active: true,
            tool_count: 0,
            created_at: timestamp,
            updated_at: timestamp,
        },
        {
            main_category_id: aiCategoryId,
            name: 'Code & Development AI',
            slug: 'ai-machine-learning-code-development-ai',
            description: 'AI-powered coding assistants and development tools',
            display_order: 5,
            is_active: true,
            tool_count: 0,
            created_at: timestamp,
            updated_at: timestamp,
        },
        {
            main_category_id: aiCategoryId,
            name: 'Conversational AI',
            slug: 'ai-machine-learning-conversational-ai',
            description: 'Chatbots, virtual assistants, and conversational interfaces',
            display_order: 6,
            is_active: true,
            tool_count: 0,
            created_at: timestamp,
            updated_at: timestamp,
        },
        // Productivity & Workflow subcategories
        {
            main_category_id: productivityCategoryId,
            name: 'Task & Project Management',
            slug: 'productivity-workflow-task-project-management',
            description: 'Project planning, task tracking, and team collaboration tools',
            display_order: 1,
            is_active: true,
            tool_count: 0,
            created_at: timestamp,
            updated_at: timestamp,
        },
        {
            main_category_id: productivityCategoryId,
            name: 'Time Management & Focus',
            slug: 'productivity-workflow-time-management-focus',
            description: 'Time tracking, focus tools, and productivity enhancement',
            display_order: 2,
            is_active: true,
            tool_count: 0,
            created_at: timestamp,
            updated_at: timestamp,
        },
        {
            main_category_id: productivityCategoryId,
            name: 'Knowledge Management',
            slug: 'productivity-workflow-knowledge-management',
            description: 'Note-taking, documentation, and information organization',
            display_order: 3,
            is_active: true,
            tool_count: 0,
            created_at: timestamp,
            updated_at: timestamp,
        },
        {
            main_category_id: productivityCategoryId,
            name: 'Communication & Collaboration',
            slug: 'productivity-workflow-communication-collaboration',
            description: 'Team communication, video conferencing, and document collaboration',
            display_order: 4,
            is_active: true,
            tool_count: 0,
            created_at: timestamp,
            updated_at: timestamp,
        },
        {
            main_category_id: productivityCategoryId,
            name: 'Automation & Integration',
            slug: 'productivity-workflow-automation-integration',
            description: 'Workflow automation and app integration tools',
            display_order: 5,
            is_active: true,
            tool_count: 0,
            created_at: timestamp,
            updated_at: timestamp,
        },
        // Design & Creative subcategories
        {
            main_category_id: designCategoryId,
            name: 'Graphic Design & Visual Arts',
            slug: 'design-creative-graphic-design-visual-arts',
            description: 'Logo design, illustration, and graphic creation tools',
            display_order: 1,
            is_active: true,
            tool_count: 0,
            created_at: timestamp,
            updated_at: timestamp,
        },
        {
            main_category_id: designCategoryId,
            name: 'UI/UX & Interface Design',
            slug: 'design-creative-ui-ux-interface-design',
            description: 'User interface and experience design tools',
            display_order: 2,
            is_active: true,
            tool_count: 0,
            created_at: timestamp,
            updated_at: timestamp,
        },
        {
            main_category_id: designCategoryId,
            name: 'Photography & Image Editing',
            slug: 'design-creative-photography-image-editing',
            description: 'Photo editing, enhancement, and manipulation tools',
            display_order: 3,
            is_active: true,
            tool_count: 0,
            created_at: timestamp,
            updated_at: timestamp,
        },
        {
            main_category_id: designCategoryId,
            name: 'Video Production & Editing',
            slug: 'design-creative-video-production-editing',
            description: 'Video editing, motion graphics, and production tools',
            display_order: 4,
            is_active: true,
            tool_count: 0,
            created_at: timestamp,
            updated_at: timestamp,
        },
        {
            main_category_id: designCategoryId,
            name: '3D Design & Modeling',
            slug: 'design-creative-3d-design-modeling',
            description: '3D modeling, rendering, and animation tools',
            display_order: 5,
            is_active: true,
            tool_count: 0,
            created_at: timestamp,
            updated_at: timestamp,
        },
    ];
    
    const insertedSubCategories = await db.insert(subCategories).values(subCategoryData).returning();
    console.log(`✅ Inserted ${insertedSubCategories.length} subcategories`);
    
    // Get subcategory IDs by slug
    const getSubCategoryId = (slug: string) => insertedSubCategories.find(sc => sc.slug === slug)!.id;
    
    console.log('📝 Inserting tool types...');
    
    // Insert Tool Types
    const toolTypeData = [
        // Text & Language AI tool types
        ...['AI Writing Assistants', 'Blog Writing', 'Article Writing', 'Creative Writing', 'Technical Writing', 'Grammar Checkers', 'Proofreading', 'Text Summarization', 'Translation & Localization', 'Language Learning', 'Text Analysis', 'Sentiment Analysis'].map((name, index) => ({
            sub_category_id: getSubCategoryId('ai-machine-learning-text-language-ai'),
            name,
            slug: `ai-machine-learning-text-language-ai-${generateSlug(name)}`,
            display_order: index + 1,
            is_active: true,
            tool_count: 0,
            created_at: timestamp,
            updated_at: timestamp,
        })),
        // Visual & Image AI tool types
        ...['AI Art Generators', 'Text-to-Image', 'Image Enhancement', 'Photo Editing', 'Background Removal', 'Object Detection', 'Face Recognition', 'Image Upscaling', 'Style Transfer', 'Colorization', 'Image Restoration', 'Character Design'].map((name, index) => ({
            sub_category_id: getSubCategoryId('ai-machine-learning-visual-image-ai'),
            name,
            slug: `ai-machine-learning-visual-image-ai-${generateSlug(name)}`,
            display_order: index + 1,
            is_active: true,
            tool_count: 0,
            created_at: timestamp,
            updated_at: timestamp,
        })),
        // Audio & Voice AI tool types
        ...['Text-to-Speech', 'Voice Synthesis', 'Speech-to-Text', 'Voice Transcription', 'AI Music Generation', 'Audio Enhancement', 'Podcast Editing', 'Voice Cloning', 'Audio Restoration', 'Sound Effects', 'Voice Commands', 'Audio Mastering'].map((name, index) => ({
            sub_category_id: getSubCategoryId('ai-machine-learning-audio-voice-ai'),
            name,
            slug: `ai-machine-learning-audio-voice-ai-${generateSlug(name)}`,
            display_order: index + 1,
            is_active: true,
            tool_count: 0,
            created_at: timestamp,
            updated_at: timestamp,
        })),
        // Video & Animation AI tool types
        ...['AI Video Generation', 'Text-to-Video', 'Video Editing', 'Animation', 'Talking Head Videos', 'Avatar Videos', 'Video Enhancement', 'Scene Detection', 'Motion Graphics', 'Visual Effects', 'Live Streaming', 'Video Stabilization'].map((name, index) => ({
            sub_category_id: getSubCategoryId('ai-machine-learning-video-animation-ai'),
            name,
            slug: `ai-machine-learning-video-animation-ai-${generateSlug(name)}`,
            display_order: index + 1,
            is_active: true,
            tool_count: 0,
            created_at: timestamp,
            updated_at: timestamp,
        })),
        // Code & Development AI tool types
        ...['Code Completion', 'Code Generation', 'Code Review', 'Bug Detection', 'Test Generation', 'Code Documentation', 'Refactoring', 'API Generation', 'DevOps Automation', 'Security Scanning', 'Performance Analysis', 'Debugging'].map((name, index) => ({
            sub_category_id: getSubCategoryId('ai-machine-learning-code-development-ai'),
            name,
            slug: `ai-machine-learning-code-development-ai-${generateSlug(name)}`,
            display_order: index + 1,
            is_active: true,
            tool_count: 0,
            created_at: timestamp,
            updated_at: timestamp,
        })),
        // Conversational AI tool types
        ...['Customer Service Bots', 'Sales Chatbots', 'Support Chatbots', 'Virtual Assistants', 'AI Companions', 'Dialog Systems', 'Email Assistants', 'Meeting Assistants', 'Intent Recognition', 'Sentiment Detection', 'Conversation Analytics', 'Voice UI'].map((name, index) => ({
            sub_category_id: getSubCategoryId('ai-machine-learning-conversational-ai'),
            name,
            slug: `ai-machine-learning-conversational-ai-${generateSlug(name)}`,
            display_order: index + 1,
            is_active: true,
            tool_count: 0,
            created_at: timestamp,
            updated_at: timestamp,
        })),
        // Task & Project Management tool types
        ...['Project Planning', 'Task Lists', 'To-Do Apps', 'Team Chat', 'Kanban Boards', 'Scrum Boards', 'Gantt Charts', 'Milestone Tracking', 'Resource Planning', 'Team Collaboration', 'File Sharing', 'Meeting Scheduling', 'Agile Tools', 'Sprint Planning', 'Backlog Management', 'Progress Tracking'].map((name, index) => ({
            sub_category_id: getSubCategoryId('productivity-workflow-task-project-management'),
            name,
            slug: `productivity-workflow-task-project-management-${generateSlug(name)}`,
            display_order: index + 1,
            is_active: true,
            tool_count: 0,
            created_at: timestamp,
            updated_at: timestamp,
        })),
        // Time Management & Focus tool types
        ...['Time Trackers', 'Pomodoro Timers', 'Focus Apps', 'Calendar Apps', 'Meeting Schedulers', 'Habit Trackers', 'Goal Setting', 'Distraction Blockers', 'Website Blockers', 'Break Reminders', 'Time Analytics', 'Scheduling Automation', 'Appointment Booking', 'Productivity Analytics', 'Deep Work Tools', 'Meditation Apps'].map((name, index) => ({
            sub_category_id: getSubCategoryId('productivity-workflow-time-management-focus'),
            name,
            slug: `productivity-workflow-time-management-focus-${generateSlug(name)}`,
            display_order: index + 1,
            is_active: true,
            tool_count: 0,
            created_at: timestamp,
            updated_at: timestamp,
        })),
        // Knowledge Management tool types
        ...['Digital Notebooks', 'Note Apps', 'Knowledge Bases', 'Wiki Systems', 'Research Tools', 'Citation Management', 'Personal Knowledge Management', 'Second Brain', 'Zettelkasten', 'Mind Mapping', 'Information Architecture', 'Content Organization', 'Note Search', 'Note Collaboration', 'Document Management', 'Learning Journals'].map((name, index) => ({
            sub_category_id: getSubCategoryId('productivity-workflow-knowledge-management'),
            name,
            slug: `productivity-workflow-knowledge-management-${generateSlug(name)}`,
            display_order: index + 1,
            is_active: true,
            tool_count: 0,
            created_at: timestamp,
            updated_at: timestamp,
        })),
        // Communication & Collaboration tool types
        ...['Team Messaging', 'Video Calls', 'Conference Calls', 'Screen Sharing', 'Real-time Editing', 'Document Collaboration', 'Whiteboarding', 'Recording Meetings', 'Meeting Transcription', 'Workflow Design', 'Approval Workflows', 'Email Management', 'Group Chat', 'Remote Desktop', 'Virtual Meetings', 'Webinars'].map((name, index) => ({
            sub_category_id: getSubCategoryId('productivity-workflow-communication-collaboration'),
            name,
            slug: `productivity-workflow-communication-collaboration-${generateSlug(name)}`,
            display_order: index + 1,
            is_active: true,
            tool_count: 0,
            created_at: timestamp,
            updated_at: timestamp,
        })),
        // Automation & Integration tool types
        ...['No-Code Automation', 'Workflow Builders', 'API Integration', 'Webhook Management', 'Data Synchronization', 'RPA', 'Process Automation', 'Document Processing', 'Form Processing', 'Email Automation', 'Task Automation', 'Integration Platforms', 'Data Transformation', 'Scheduled Workflows', 'Event-driven Automation', 'Batch Processing'].map((name, index) => ({
            sub_category_id: getSubCategoryId('productivity-workflow-automation-integration'),
            name,
            slug: `productivity-workflow-automation-integration-${generateSlug(name)}`,
            display_order: index + 1,
            is_active: true,
            tool_count: 0,
            created_at: timestamp,
            updated_at: timestamp,
        })),
        // Graphic Design & Visual Arts tool types
        ...['Logo Creation', 'Logo Design', 'Brand Identity', 'Flyer Design', 'Poster Design', 'Brochure Design', 'Web Banners', 'Social Media Graphics', 'Digital Illustration', 'Vector Art', 'Character Design', 'Icon Design', 'Infographics', 'Data Visualization', 'Print Design', 'Packaging Design'].map((name, index) => ({
            sub_category_id: getSubCategoryId('design-creative-graphic-design-visual-arts'),
            name,
            slug: `design-creative-graphic-design-visual-arts-${generateSlug(name)}`,
            display_order: index + 1,
            is_active: true,
            tool_count: 0,
            created_at: timestamp,
            updated_at: timestamp,
        })),
        // UI/UX & Interface Design tool types
        ...['Website UI', 'Mobile App UI', 'Dashboard Design', 'Prototyping', 'Wireframing', 'User Research', 'User Journey Mapping', 'Interaction Design', 'Design Systems', 'Component Libraries', 'Style Guides', 'Usability Testing', 'A/B Testing', 'Navigation Design', 'Form Design', 'Accessibility Design'].map((name, index) => ({
            sub_category_id: getSubCategoryId('design-creative-ui-ux-interface-design'),
            name,
            slug: `design-creative-ui-ux-interface-design-${generateSlug(name)}`,
            display_order: index + 1,
            is_active: true,
            tool_count: 0,
            created_at: timestamp,
            updated_at: timestamp,
        })),
        // Photography & Image Editing tool types
        ...['Photo Editing', 'Color Correction', 'Retouching', 'Background Removal', 'Object Removal', 'Photo Enhancement', 'RAW Processing', 'Batch Processing', 'Photo Organization', 'Face Enhancement', 'Sky Replacement', 'Compositing', 'Portrait Photography', 'Product Photography', 'Filters & Effects', 'Photo Restoration'].map((name, index) => ({
            sub_category_id: getSubCategoryId('design-creative-photography-image-editing'),
            name,
            slug: `design-creative-photography-image-editing-${generateSlug(name)}`,
            display_order: index + 1,
            is_active: true,
            tool_count: 0,
            created_at: timestamp,
            updated_at: timestamp,
        })),
        // Video Production & Editing tool types
        ...['Video Editing', 'Motion Graphics', '2D Animation', 'Color Grading', 'Audio Editing', 'Title Creation', 'Transitions', 'Screen Recording', 'Live Streaming', 'Multi-camera Recording', 'Video Production', 'Sound Effects', 'YouTube Videos', 'Social Media Videos', 'Explainer Videos', 'Training Videos'].map((name, index) => ({
            sub_category_id: getSubCategoryId('design-creative-video-production-editing'),
            name,
            slug: `design-creative-video-production-editing-${generateSlug(name)}`,
            display_order: index + 1,
            is_active: true,
            tool_count: 0,
            created_at: timestamp,
            updated_at: timestamp,
        })),
        // 3D Design & Modeling tool types
        ...['3D Modeling', 'Digital Sculpting', 'Character Modeling', 'Texturing', 'UV Mapping', 'Material Creation', '3D Rendering', 'Path Tracing', 'Character Rigging', '3D Animation', 'Motion Capture', 'Lighting', 'Product Modeling', 'Architectural Modeling', 'Game Assets', 'VFX'].map((name, index) => ({
            sub_category_id: getSubCategoryId('design-creative-3d-design-modeling'),
            name,
            slug: `design-creative-3d-design-modeling-${generateSlug(name)}`,
            display_order: index + 1,
            is_active: true,
            tool_count: 0,
            created_at: timestamp,
            updated_at: timestamp,
        })),
    ];
    
    await db.insert(toolTypes).values(toolTypeData);
    console.log(`✅ Inserted ${toolTypeData.length} tool types`);
    
    console.log('✅ Taxonomy seeder completed successfully');
    console.log(`📊 Final counts:`);
    console.log(`   - Main Categories: ${insertedMainCategories.length}`);
    console.log(`   - SubCategories: ${insertedSubCategories.length}`);
    console.log(`   - Tool Types: ${toolTypeData.length}`);
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});