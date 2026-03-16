import { prisma } from './src/lib/prisma.js';

async function verify() {
    console.log('--- Final Verification ---');
    try {
        const count = await prisma.user.count();
        console.log('SUCCESS: Connected via Prisma Client! User count:', count);
    } catch (err) {
        console.error('FAILED: Final verification failed', err);
    } finally {
        await prisma.$disconnect();
    }
}

verify();
