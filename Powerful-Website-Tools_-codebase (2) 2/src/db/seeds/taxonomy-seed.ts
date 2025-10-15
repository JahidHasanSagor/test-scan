import { db } from '../index';
import { mainCategories, subCategories, toolTypes } from '../schema';

const taxonomyData = {
  "AI & Machine Learning": {
    icon: "Brain",
    color: "#8b5cf6",
    description: "Artificial Intelligence and Machine Learning tools for automation, analysis, and intelligent solutions",
    subcategories: {
      "Text & Language AI": {
        description: "AI-powered text and language processing tools",
        toolTypes: [
          "AI Writing Assistants", "Blog Writing", "Article Writing", "Creative Writing",
          "Technical Writing", "Grammar Checkers", "Proofreading", "Text Summarization",
          "Translation & Localization", "Language Learning", "Text Analysis", "Sentiment Analysis"
        ]
      },
      "Visual & Image AI": {
        description: "AI tools for image generation, editing, and analysis",
        toolTypes: [
          "AI Art Generators", "Text-to-Image", "Image Enhancement", "Photo Editing",
          "Background Removal", "Object Detection", "Face Recognition", "Image Upscaling",
          "Style Transfer", "Colorization", "Image Restoration", "Character Design"
        ]
      },
      "Audio & Voice AI": {
        description: "AI-powered audio and voice processing solutions",
        toolTypes: [
          "Text-to-Speech", "Voice Synthesis", "Speech-to-Text", "Voice Transcription",
          "AI Music Generation", "Audio Enhancement", "Podcast Editing", "Voice Cloning",
          "Audio Restoration", "Sound Effects", "Voice Commands", "Audio Mastering"
        ]
      },
      "Video & Animation AI": {
        description: "AI tools for video generation, editing, and animation",
        toolTypes: [
          "AI Video Generation", "Text-to-Video", "Video Editing", "Animation",
          "Talking Head Videos", "Avatar Videos", "Video Enhancement", "Scene Detection",
          "Motion Graphics", "Visual Effects", "Live Streaming", "Video Stabilization"
        ]
      },
      "Code & Development AI": {
        description: "AI-powered coding assistants and development tools",
        toolTypes: [
          "Code Completion", "Code Generation", "Code Review", "Bug Detection",
          "Test Generation", "Code Documentation", "Refactoring", "API Generation",
          "DevOps Automation", "Security Scanning", "Performance Analysis", "Debugging"
        ]
      },
      "Conversational AI": {
        description: "Chatbots, virtual assistants, and conversational interfaces",
        toolTypes: [
          "Customer Service Bots", "Sales Chatbots", "Support Chatbots", "Virtual Assistants",
          "AI Companions", "Dialog Systems", "Email Assistants", "Meeting Assistants",
          "Intent Recognition", "Sentiment Detection", "Conversation Analytics", "Voice UI"
        ]
      }
    }
  },
  "Productivity & Workflow": {
    icon: "Workflow",
    color: "#10b981",
    description: "Tools to boost productivity, manage tasks, and streamline workflows",
    subcategories: {
      "Task & Project Management": {
        description: "Project planning, task tracking, and team collaboration tools",
        toolTypes: [
          "Project Planning", "Task Lists", "To-Do Apps", "Team Chat",
          "Kanban Boards", "Scrum Boards", "Gantt Charts", "Milestone Tracking",
          "Resource Planning", "Team Collaboration", "File Sharing", "Meeting Scheduling",
          "Agile Tools", "Sprint Planning", "Backlog Management", "Progress Tracking"
        ]
      },
      "Time Management & Focus": {
        description: "Time tracking, focus tools, and productivity enhancement",
        toolTypes: [
          "Time Trackers", "Pomodoro Timers", "Focus Apps", "Calendar Apps",
          "Meeting Schedulers", "Habit Trackers", "Goal Setting", "Distraction Blockers",
          "Website Blockers", "Break Reminders", "Time Analytics", "Scheduling Automation",
          "Appointment Booking", "Productivity Analytics", "Deep Work Tools", "Meditation Apps"
        ]
      },
      "Knowledge Management": {
        description: "Note-taking, documentation, and information organization",
        toolTypes: [
          "Digital Notebooks", "Note Apps", "Knowledge Bases", "Wiki Systems",
          "Research Tools", "Citation Management", "Personal Knowledge Management", "Second Brain",
          "Zettelkasten", "Mind Mapping", "Information Architecture", "Content Organization",
          "Note Search", "Note Collaboration", "Document Management", "Learning Journals"
        ]
      },
      "Communication & Collaboration": {
        description: "Team communication, video conferencing, and document collaboration",
        toolTypes: [
          "Team Messaging", "Video Calls", "Conference Calls", "Screen Sharing",
          "Real-time Editing", "Document Collaboration", "Whiteboarding", "Recording Meetings",
          "Meeting Transcription", "Workflow Design", "Approval Workflows", "Email Management",
          "Group Chat", "Remote Desktop", "Virtual Meetings", "Webinars"
        ]
      },
      "Automation & Integration": {
        description: "Workflow automation and app integration tools",
        toolTypes: [
          "No-Code Automation", "Workflow Builders", "API Integration", "Webhook Management",
          "Data Synchronization", "RPA", "Process Automation", "Document Processing",
          "Form Processing", "Email Automation", "Task Automation", "Integration Platforms",
          "Data Transformation", "Scheduled Workflows", "Event-driven Automation", "Batch Processing"
        ]
      }
    }
  },
  "Design & Creative": {
    icon: "Palette",
    color: "#f59e0b",
    description: "Creative design tools for graphics, UI/UX, video, and 3D",
    subcategories: {
      "Graphic Design & Visual Arts": {
        description: "Logo design, illustration, and graphic creation tools",
        toolTypes: [
          "Logo Creation", "Logo Design", "Brand Identity", "Flyer Design",
          "Poster Design", "Brochure Design", "Web Banners", "Social Media Graphics",
          "Digital Illustration", "Vector Art", "Character Design", "Icon Design",
          "Infographics", "Data Visualization", "Print Design", "Packaging Design"
        ]
      },
      "UI/UX & Interface Design": {
        description: "User interface and experience design tools",
        toolTypes: [
          "Website UI", "Mobile App UI", "Dashboard Design", "Prototyping",
          "Wireframing", "User Research", "User Journey Mapping", "Interaction Design",
          "Design Systems", "Component Libraries", "Style Guides", "Usability Testing",
          "A/B Testing", "Navigation Design", "Form Design", "Accessibility Design"
        ]
      },
      "Photography & Image Editing": {
        description: "Photo editing, enhancement, and manipulation tools",
        toolTypes: [
          "Photo Editing", "Color Correction", "Retouching", "Background Removal",
          "Object Removal", "Photo Enhancement", "RAW Processing", "Batch Processing",
          "Photo Organization", "Face Enhancement", "Sky Replacement", "Compositing",
          "Portrait Photography", "Product Photography", "Filters & Effects", "Photo Restoration"
        ]
      },
      "Video Production & Editing": {
        description: "Video editing, motion graphics, and production tools",
        toolTypes: [
          "Video Editing", "Motion Graphics", "2D Animation", "Color Grading",
          "Audio Editing", "Title Creation", "Transitions", "Screen Recording",
          "Live Streaming", "Multi-camera Recording", "Video Production", "Sound Effects",
          "YouTube Videos", "Social Media Videos", "Explainer Videos", "Training Videos"
        ]
      },
      "3D Design & Modeling": {
        description: "3D modeling, rendering, and animation tools",
        toolTypes: [
          "3D Modeling", "Digital Sculpting", "Character Modeling", "Texturing",
          "UV Mapping", "Material Creation", "3D Rendering", "Path Tracing",
          "Character Rigging", "3D Animation", "Motion Capture", "Lighting",
          "Product Modeling", "Architectural Modeling", "Game Assets", "VFX"
        ]
      }
    }
  }
};

export async function seedTaxonomy() {
  console.log('🌱 Starting taxonomy seed...');

  try {
    let displayOrder = 0;

    for (const [mainCatName, mainCatData] of Object.entries(taxonomyData)) {
      displayOrder++;
      
      // Create main category
      const mainCatSlug = mainCatName.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and');
      
      const [mainCat] = await db.insert(mainCategories).values({
        name: mainCatName,
        slug: mainCatSlug,
        description: mainCatData.description,
        icon: mainCatData.icon,
        color: mainCatData.color,
        displayOrder: displayOrder,
        isActive: true,
        toolCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }).returning();

      console.log(`  ✓ Created main category: ${mainCatName}`);

      let subDisplayOrder = 0;

      // Create subcategories
      for (const [subCatName, subCatData] of Object.entries(mainCatData.subcategories)) {
        subDisplayOrder++;
        
        const subCatSlug = `${mainCatSlug}-${subCatName.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and')}`;
        
        const [subCat] = await db.insert(subCategories).values({
          mainCategoryId: mainCat.id,
          name: subCatName,
          slug: subCatSlug,
          description: subCatData.description,
          displayOrder: subDisplayOrder,
          isActive: true,
          toolCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }).returning();

        console.log(`    ✓ Created subcategory: ${subCatName}`);

        // Create tool types
        let typeDisplayOrder = 0;
        for (const toolTypeName of subCatData.toolTypes) {
          typeDisplayOrder++;
          
          const toolTypeSlug = `${subCatSlug}-${toolTypeName.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and')}`;
          
          await db.insert(toolTypes).values({
            subCategoryId: subCat.id,
            name: toolTypeName,
            slug: toolTypeSlug,
            description: null,
            displayOrder: typeDisplayOrder,
            isActive: true,
            toolCount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }

        console.log(`      ✓ Created ${subCatData.toolTypes.length} tool types`);
      }
    }

    console.log('✅ Taxonomy seed completed successfully!');
    console.log(`   Main Categories: ${Object.keys(taxonomyData).length}`);
    console.log(`   Subcategories: ${Object.values(taxonomyData).reduce((acc, cat) => acc + Object.keys(cat.subcategories).length, 0)}`);
    console.log(`   Tool Types: ${Object.values(taxonomyData).reduce((acc, cat) => 
      acc + Object.values(cat.subcategories).reduce((subAcc, subCat) => subAcc + subCat.toolTypes.length, 0), 0)}`);

  } catch (error) {
    console.error('❌ Error seeding taxonomy:', error);
    throw error;
  }
}

// Run if executed directly
if (require.main === module) {
  seedTaxonomy()
    .then(() => {
      console.log('Seed completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seed failed:', error);
      process.exit(1);
    });
}