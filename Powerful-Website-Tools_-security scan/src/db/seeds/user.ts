import { db } from '@/db';
import { user } from '@/db/schema';

async function main() {
    const sampleUser = [
        {
            id: 'user_admin_01h4kxt2e8z9y3b1n7m6q5w8r4',
            email: 'admin@example.com',
            name: 'Admin User',
            role: 'admin',
            emailVerified: true,
            image: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        }
    ];

    await db.insert(user).values(sampleUser);
    
    console.log('✅ Admin user seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});