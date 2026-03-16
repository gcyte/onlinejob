import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import * as dotenv from 'dotenv';
dotenv.config();

const url = process.env.DATABASE_URL || "";
const connectionString = url.replace(/^mysql:\/\//, "mariadb://");
const adapter = new PrismaMariaDb(connectionString);

const prisma = new PrismaClient({ adapter });

async function verify() {
    try {
        console.log('--- Final Verification ---');

        // 1. Check if we can find a freelancer and an employer
        const freelancer = await prisma.user.findFirst({ where: { role: 'FREELANCER' } });
        const employer = await prisma.user.findFirst({ where: { role: 'EMPLOYER' } });

        if (freelancer && employer) {
            console.log(`Found freelancer: ${freelancer.email} and employer: ${employer.email}`);

            // 2. Create a conversation and a message
            let conversation = await prisma.conversation.findUnique({
                where: {
                    initiatorId_receiverId: {
                        initiatorId: employer.id,
                        receiverId: freelancer.id
                    }
                }
            });

            if (!conversation) {
                conversation = await prisma.conversation.create({
                    data: {
                        initiatorId: employer.id,
                        receiverId: freelancer.id
                    }
                });
                console.log('Created new conversation');
            }

            const msg = await prisma.message.create({
                data: {
                    conversationId: conversation.id,
                    senderId: employer.id,
                    content: 'Hello from verification script! We are interested in your profile.'
                }
            });
            console.log('Created test message:', msg.content);

            // 3. Verify the message is retrievable
            const latestMsg = await prisma.message.findFirst({
                where: { conversationId: conversation.id },
                orderBy: { createdAt: 'desc' }
            });
            console.log('Retrieved latest message:', latestMsg?.content);
        }

        // 4. Check Job Filtering logic via Prisma
        const jobs = await prisma.jobPost.findMany({
            where: {
                isPublished: true,
                title: { contains: 'React' }
            }
        });
        console.log(`Found ${jobs.length} jobs matching "React"`);

    } catch (err) {
        console.error('Verification failed:', err.message);
    } finally {
        await prisma.$disconnect();
    }
}

verify();
