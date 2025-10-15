import { db } from '@/db';
import { editorialScores } from '@/db/schema';

async function main() {
    const sampleEditorialScores = [
        {
            toolId: 1,
            category: 'AI Writing',
            metricScores: JSON.stringify({
                contentQuality: 9,
                speedEfficiency: 8,
                languageSupport: 9,
                valueForMoney: 8
            }),
            editorId: 'user_admin_01h4kxt2e8z9y3b1n7m6q5w8r4',
            notes: 'Exceptional content generation quality with natural language output. Processing speed is impressive for complex tasks. Extensive language support makes it versatile for global teams. Pricing is competitive for the feature set offered.',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            toolId: 2,
            category: 'Design',
            metricScores: JSON.stringify({
                easeOfUse: 9,
                features: 9,
                templates: 8,
                collaboration: 9
            }),
            editorId: 'user_admin_01h4kxt2e8z9y3b1n7m6q5w8r4',
            notes: 'Outstanding design collaboration features with real-time editing. Industry-leading template library with professional quality. Intuitive interface makes it accessible for beginners. Collaboration tools are best-in-class.',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            toolId: 3,
            category: 'Productivity',
            metricScores: JSON.stringify({
                easeOfUse: 8,
                integrations: 9,
                automation: 7,
                valueForMoney: 8
            }),
            editorId: 'user_admin_01h4kxt2e8z9y3b1n7m6q5w8r4',
            notes: 'Solid productivity tool with extensive integration options across major platforms. Automation features work well but could be more intuitive to set up. Good value proposition for teams. Interface is clean and efficient.',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            toolId: 4,
            category: 'Development',
            metricScores: JSON.stringify({
                codeQuality: 9,
                performance: 9,
                debugging: 8,
                documentation: 7
            }),
            editorId: 'user_admin_01h4kxt2e8z9y3b1n7m6q5w8r4',
            notes: 'Excellent code generation with high quality output that follows best practices. Performance is outstanding even with large codebases. Debugging tools are robust. Documentation could be more comprehensive for advanced features.',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            toolId: 5,
            category: 'Marketing',
            metricScores: JSON.stringify({
                easeOfUse: 8,
                features: 8,
                analytics: 9,
                integrations: 8
            }),
            editorId: 'user_admin_01h4kxt2e8z9y3b1n7m6q5w8r4',
            notes: 'Comprehensive marketing suite with exceptional analytics capabilities. Feature set covers most marketing needs effectively. Integration ecosystem is well-developed. User interface is modern and straightforward to navigate.',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            toolId: 6,
            category: 'AI Writing',
            metricScores: JSON.stringify({
                contentQuality: 8,
                speedEfficiency: 9,
                languageSupport: 7,
                valueForMoney: 9
            }),
            editorId: 'user_admin_01h4kxt2e8z9y3b1n7m6q5w8r4',
            notes: 'Excellent content generation quality with impressive speed for bulk content creation. Great value for professional writers and content teams. Language support is adequate for major languages. Speed optimization is remarkable.',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            toolId: 7,
            category: 'Design',
            metricScores: JSON.stringify({
                easeOfUse: 7,
                features: 10,
                templates: 9,
                collaboration: 7
            }),
            editorId: 'user_admin_01h4kxt2e8z9y3b1n7m6q5w8r4',
            notes: 'Feature-rich design platform with industry-leading capabilities for professional designers. Template collection is extensive and high-quality. Learning curve exists for advanced features. Collaboration tools are functional but not exceptional.',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            toolId: 8,
            category: 'Productivity',
            metricScores: JSON.stringify({
                easeOfUse: 9,
                integrations: 7,
                automation: 8,
                valueForMoney: 7
            }),
            editorId: 'user_admin_01h4kxt2e8z9y3b1n7m6q5w8r4',
            notes: 'User-friendly productivity tool with intuitive workflow management. Automation capabilities are solid for common use cases. Integration options cover major platforms. Pricing is moderate for the features provided.',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            toolId: 9,
            category: 'Development',
            metricScores: JSON.stringify({
                codeQuality: 8,
                performance: 8,
                debugging: 9,
                documentation: 9
            }),
            editorId: 'user_admin_01h4kxt2e8z9y3b1n7m6q5w8r4',
            notes: 'Strong development tool with exceptional debugging capabilities and comprehensive documentation. Code quality is consistently good. Performance is reliable across different project sizes. Documentation is thorough and well-organized.',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            toolId: 10,
            category: 'Marketing',
            metricScores: JSON.stringify({
                easeOfUse: 9,
                features: 7,
                analytics: 8,
                integrations: 9
            }),
            editorId: 'user_admin_01h4kxt2e8z9y3b1n7m6q5w8r4',
            notes: 'Easy-to-use marketing platform with excellent integration capabilities. Analytics are solid for tracking campaign performance. Feature set covers core marketing functions. Interface is designed for accessibility and quick adoption.',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            toolId: 11,
            category: 'AI Writing',
            metricScores: JSON.stringify({
                contentQuality: 7,
                speedEfficiency: 8,
                languageSupport: 8,
                valueForMoney: 7
            }),
            editorId: 'user_admin_01h4kxt2e8z9y3b1n7m6q5w8r4',
            notes: 'Reliable AI writing tool with good content quality for standard use cases. Processing speed is efficient for routine tasks. Language support covers popular languages well. Value proposition is fair for individual users and small teams.',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            toolId: 12,
            category: 'Design',
            metricScores: JSON.stringify({
                easeOfUse: 8,
                features: 8,
                templates: 10,
                collaboration: 8
            }),
            editorId: 'user_admin_01h4kxt2e8z9y3b1n7m6q5w8r4',
            notes: 'Design platform with an outstanding template library that covers diverse use cases. Feature set is comprehensive for most design needs. Collaboration features facilitate effective teamwork. User interface balances power with accessibility.',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }
    ];

    await db.insert(editorialScores).values(sampleEditorialScores);
    
    console.log('✅ Editorial scores seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});