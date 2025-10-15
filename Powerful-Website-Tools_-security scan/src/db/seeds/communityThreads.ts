import { db } from '@/db';
import { communityThreads } from '@/db/schema';

async function main() {
    const now = new Date();
    const getRandomDate = (daysAgo: number) => {
        const date = new Date(now);
        date.setDate(date.getDate() - daysAgo);
        return date.toISOString();
    };

    const sampleThreads = [
        {
            userId: 'user_admin_01h4kxt2e8z9y3b1n7m6q5w8r4',
            title: 'What are your favorite AI tools for content creation in 2024?',
            content: `Hey everyone! 👋

I've been exploring different AI tools for content creation and I'm curious about what the community is using these days.

## My Current Stack
- **ChatGPT Plus** - For brainstorming and drafting
- **Midjourney** - Image generation
- **Descript** - Video editing with AI transcription

## What I'm Looking For
I'm particularly interested in tools that can help with:
- Long-form blog content
- Social media scheduling with AI suggestions
- Video script generation
- SEO optimization

**Budget**: I'm willing to spend up to $100/month for the right combination of tools.

Would love to hear what's working for you and why! Bonus points if you can share some real-world examples of how these tools have improved your workflow.

Thanks in advance! 🙏`,
            category: 'Tool Recommendations',
            upvotes: 142,
            downvotes: 3,
            commentCount: 18,
            isPinned: true,
            status: 'active',
            createdAt: getRandomDate(6),
            updatedAt: getRandomDate(6),
        },
        {
            userId: 'user_admin_01h4kxt2e8z9y3b1n7m6q5w8r4',
            title: 'Show & Tell: I built an AI-powered code review assistant',
            content: `I'm excited to share a project I've been working on for the past 3 months! 🚀

## What It Does
It's an AI-powered code review assistant that integrates directly into your GitHub workflow. It analyzes pull requests and provides:
- Security vulnerability detection
- Performance optimization suggestions
- Code quality improvements
- Best practice recommendations

## Tech Stack
- OpenAI GPT-4 API for code analysis
- GitHub Actions for CI/CD integration
- Python backend with FastAPI
- React frontend for the dashboard

## Results So Far
After testing with my team for 6 weeks:
- **43% reduction** in code review time
- **67% fewer** security issues making it to production
- **Highly accurate** suggestions (87% acceptance rate)

I'm planning to open-source it next month. Would love to get feedback from the community on features you'd like to see!

**Demo video**: [Coming soon]

What do you think? Would this be useful for your team?`,
            category: 'Show & Tell',
            upvotes: 189,
            downvotes: 5,
            commentCount: 25,
            isPinned: true,
            status: 'active',
            createdAt: getRandomDate(5),
            updatedAt: getRandomDate(5),
        },
        {
            userId: 'user_admin_01h4kxt2e8z9y3b1n7m6q5w8r4',
            title: 'Help: Cursor AI vs GitHub Copilot - Which one should I choose?',
            content: `I'm trying to decide between Cursor AI and GitHub Copilot for my development workflow. I've tried both for a few days but still can't make up my mind.

## My Use Case
- Full-stack development (React, Node.js, Python)
- Working on multiple projects simultaneously
- Need good autocomplete and code generation
- Budget: $20/month max

## What I've Noticed
**Cursor AI:**
- ✅ Better at understanding project context
- ✅ Chat interface is really helpful
- ❌ Sometimes slower than Copilot
- ❌ Less integration options

**GitHub Copilot:**
- ✅ Fast and responsive
- ✅ Great IDE integration
- ❌ Context understanding seems limited
- ❌ Chat feature feels basic

Has anyone here used both extensively? Which one would you recommend and why? Any tips for getting the most out of either tool?`,
            category: 'Help & Support',
            upvotes: 67,
            downvotes: 2,
            commentCount: 14,
            isPinned: false,
            status: 'active',
            createdAt: getRandomDate(4),
            updatedAt: getRandomDate(4),
        },
        {
            userId: 'user_admin_01h4kxt2e8z9y3b1n7m6q5w8r4',
            title: 'Controversial: AI tools are making developers lazy and dependent',
            content: `I know this is going to be unpopular, but hear me out...

I've been noticing a trend where junior developers (and even some seniors) are becoming overly dependent on AI coding assistants. They're no longer taking the time to:

- Understand the underlying algorithms
- Read documentation thoroughly
- Debug issues systematically
- Learn from their mistakes

## My Concerns
1. **Skills atrophy**: Developers aren't building fundamental problem-solving skills
2. **Security risks**: Blindly accepting AI suggestions without understanding them
3. **Technical debt**: Generated code that "works" but isn't maintainable
4. **Loss of craftsmanship**: Programming is becoming more about prompting than coding

## Example
Last week, a team member couldn't debug a simple array manipulation issue without AI assistance. When the AI tool was down, they were completely stuck. This shouldn't be the norm.

**Don't get me wrong** - I use AI tools too. But we need to be mindful about how we're using them and ensure we're still building core skills.

What's your take? Am I being too harsh or is this a legitimate concern?`,
            category: 'General Discussion',
            upvotes: 52,
            downvotes: 38,
            commentCount: 47,
            isPinned: false,
            status: 'active',
            createdAt: getRandomDate(3),
            updatedAt: getRandomDate(3),
        },
        {
            userId: 'user_admin_01h4kxt2e8z9y3b1n7m6q5w8r4',
            title: 'Feature Request: Native dark mode for all AI tools',
            content: `Is it just me or do most AI tools have terrible dark mode implementations?

I spend 8+ hours a day working with various AI tools and the inconsistent or missing dark mode support is driving me crazy. Some observations:

## Current State
- **ChatGPT**: Dark mode exists but high contrast
- **Claude**: Good dark mode 👍
- **Midjourney**: No dark mode at all 😭
- **Most AI writing tools**: Either no dark mode or poorly implemented

## What I Want
- System-wide dark mode sync
- Consistent color schemes across all tools
- Option to customize themes
- Automatic switching based on time of day

## Health Impact
Working late nights with bright screens is causing eye strain and headaches. I know I'm not alone in this.

Tool developers: Please prioritize proper dark mode implementation! It's not just an aesthetic choice - it's about user health and accessibility.

Who else is frustrated by this? Let's make some noise about it! 💪`,
            category: 'Feature Requests',
            upvotes: 98,
            downvotes: 4,
            commentCount: 12,
            isPinned: false,
            status: 'active',
            createdAt: getRandomDate(2),
            updatedAt: getRandomDate(2),
        },
        {
            userId: 'user_admin_01h4kxt2e8z9y3b1n7m6q5w8r4',
            title: 'Best AI tools for solo entrepreneurs and indie hackers?',
            content: `Hey indie hackers! 🚀

As a solo founder building my SaaS product, I'm looking to optimize my workflow with AI tools. Here's what I need help with:

## My Challenges
- Marketing copy and landing pages
- Customer support automation
- Content creation for blog and social media
- Basic graphic design
- Email campaigns

## Current Budget
Working with a tight budget (~$50/month) so I need tools that provide real ROI.

## Tools I'm Already Using
- ChatGPT for content drafting
- Canva (not really AI but has some AI features)

**Looking for recommendations** on:
1. Tools that have helped you grow your business
2. Free/affordable alternatives to expensive enterprise tools
3. AI tools specifically built for solo founders
4. Your honest opinion on whether AI tools have actually helped your bottom line

Would especially love to hear from other solo founders who've successfully leveraged AI to punch above their weight! 💪`,
            category: 'Tool Recommendations',
            upvotes: 73,
            downvotes: 1,
            commentCount: 16,
            isPinned: false,
            status: 'active',
            createdAt: getRandomDate(2),
            updatedAt: getRandomDate(2),
        },
        {
            userId: 'user_admin_01h4kxt2e8z9y3b1n7m6q5w8r4',
            title: 'Anyone else worried about AI tool pricing getting out of control?',
            content: `Let's talk about the elephant in the room: AI tool pricing is getting absolutely ridiculous.

## The Math
I sat down and calculated my monthly AI tool subscriptions:
- ChatGPT Plus: $20
- Midjourney: $30
- GitHub Copilot: $10
- Grammarly Premium: $12
- Various other tools: $40+

**Total: $112/month or $1,344/year**

And this is just for basic productivity tools! 💸

## The Concerns
1. **Subscription fatigue**: Every tool wants a monthly commitment
2. **Feature creep**: Basic features locked behind premium tiers
3. **No student/indie discounts**: Pricing favors enterprises
4. **Competitive pressure**: Feel forced to subscribe to stay competitive

## What's the Solution?
- More freemium options with reasonable limits?
- Better bundling deals?
- Pay-as-you-go models?
- Open-source alternatives?

Is anyone else feeling this subscription fatigue? How are you managing your AI tool budget?`,
            category: 'General Discussion',
            upvotes: 156,
            downvotes: 8,
            commentCount: 34,
            isPinned: false,
            status: 'active',
            createdAt: getRandomDate(1),
            updatedAt: getRandomDate(1),
        },
        {
            userId: 'user_admin_01h4kxt2e8z9y3b1n7m6q5w8r4',
            title: 'Tutorial: How I use AI tools to speed up my development workflow by 3x',
            content: `After 6 months of experimentation, I've found a workflow that has genuinely 3x'd my development speed. Here's the full breakdown:

## The Workflow

### 1. Planning Phase (30 min → 10 min)
- Use ChatGPT to break down features into tasks
- Generate user stories and acceptance criteria
- Create initial technical architecture

### 2. Coding Phase (4 hours → 1.5 hours)
- GitHub Copilot for boilerplate and common patterns
- Cursor AI for complex logic and refactoring
- ChatGPT for debugging tricky issues

### 3. Testing Phase (2 hours → 45 min)
- AI-generated test cases
- Automated test data generation
- Quick bug fixes with AI assistance

### 4. Documentation (1 hour → 15 min)
- Auto-generate API documentation
- Create README files from code comments
- Generate inline documentation

## Real Results
Before AI tools: **8 hours** for a typical feature
After AI tools: **2.5-3 hours** for the same feature

## Important Notes
⚠️ **Quality control is essential** - Always review AI-generated code
⚠️ **This isn't magic** - Still requires solid programming fundamentals
⚠️ **Your mileage may vary** - Depends on your experience level and project type

Want me to do a detailed write-up on any specific part of this workflow?`,
            category: 'Show & Tell',
            upvotes: 124,
            downvotes: 6,
            commentCount: 21,
            isPinned: false,
            status: 'active',
            createdAt: getRandomDate(1),
            updatedAt: getRandomDate(1),
        },
        {
            userId: 'user_admin_01h4kxt2e8z9y3b1n7m6q5w8r4',
            title: 'Help needed: AI tool keeps generating incorrect SQL queries',
            content: `I'm having a frustrating issue with AI coding assistants (tried both Copilot and ChatGPT) generating incorrect SQL queries.

## The Problem
When I ask for database queries, the AI frequently generates SQL that:
- Uses deprecated syntax
- Doesn't account for my specific database schema
- Includes security vulnerabilities (SQL injection risks)
- Produces incorrect results

## Example
I asked for a query to get users who signed up in the last 30 days, and it generated:
\`\`\`sql
SELECT * FROM users WHERE created_at > NOW() - 30
\`\`\`

This doesn't work in my database (PostgreSQL) and should use INTERVAL instead.

## What I've Tried
- Providing more context in prompts
- Sharing schema information
- Being more specific about database type
- Using different AI tools

## My Question
How do you all handle this? Do you:
1. Always verify and rewrite AI-generated SQL?
2. Use specific prompting techniques?
3. Have a different workflow for database queries?

Any advice would be greatly appreciated! This is becoming a time sink rather than a time saver.`,
            category: 'Help & Support',
            upvotes: 45,
            downvotes: 2,
            commentCount: 11,
            isPinned: false,
            status: 'active',
            createdAt: getRandomDate(1),
            updatedAt: getRandomDate(1),
        },
        {
            userId: 'user_admin_01h4kxt2e8z9y3b1n7m6q5w8r4',
            title: 'What AI features would you like to see in developer tools in 2024?',
            content: `Let's dream big! 🌟

I'm curious what AI-powered features the community would actually find useful in their development tools. Not the gimmicky stuff, but genuinely useful features.

## My Wishlist
1. **Smart error prediction**: AI that predicts errors before runtime
2. **Automated refactoring suggestions**: Not just code formatting, but architectural improvements
3. **Intelligent dependency management**: AI that suggests and updates dependencies safely
4. **Context-aware documentation**: Docs that adapt based on what you're currently building
5. **Natural language git commits**: Automatically generate meaningful commit messages from code changes

## What Would Make Your Life Easier?
I'm particularly interested in hearing about:
- Pain points in your current workflow
- Repetitive tasks you wish were automated
- Features you've seen in one tool that you wish existed in others

## The Catch
Let's keep this realistic - what could actually be built with current AI technology, not sci-fi stuff.

Drop your ideas below! 👇 Maybe some tool developers are listening and will actually build these features!`,
            category: 'Feature Requests',
            upvotes: 91,
            downvotes: 3,
            commentCount: 19,
            isPinned: false,
            status: 'active',
            createdAt: getRandomDate(0),
            updatedAt: getRandomDate(0),
        },
    ];

    await db.insert(communityThreads).values(sampleThreads);
    
    console.log('✅ Community threads seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});