import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import * as dotenv from 'dotenv';
dotenv.config();

const url = process.env.DATABASE_URL || "";
const connectionString = url.replace(/^mysql:\/\//, "mariadb://");
const adapter = new PrismaMariaDb(connectionString);

const prisma = new PrismaClient({ adapter });

async function check() {
    try {
        console.log('--- Message Table Check ---');
        // Try to fetch one message to see the structure
        const msg = await prisma.message.findFirst();
        console.log('Message sample:', msg);

        const conv = await prisma.conversation.findFirst({
            include: { messages: true }
        });
        console.log('Conversation sample:', conv);

    } catch (err) {
        console.error('Check failed:', err.message);
    } finally {
        await prisma.$disconnect();
    }
}

check();
