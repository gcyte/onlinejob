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
        const userCount = await prisma.user.count();
        const roleCounts = await prisma.user.groupBy({
            by: ['role'],
            _count: {
                _all: true
            }
        });

        console.log('Total Users:', userCount);
        console.log('Role breakdown:');
        roleCounts.forEach(rc => {
            console.log(`- ${rc.role}: ${rc._count._all}`);
        });

        const latestFreelancer = await prisma.user.findFirst({
            where: { role: 'FREELANCER' },
            include: { freelancerProfile: true },
            orderBy: { createdAt: 'desc' }
        });

        if (latestFreelancer) {
            console.log('Latest Freelancer:', latestFreelancer.email);
            console.log('Profile exists:', !!latestFreelancer.freelancerProfile);
        }

        const jobCount = await prisma.jobPost.count();
        console.log('Total Jobs:', jobCount);

        const appCount = await prisma.application.count();
        console.log('Total Applications:', appCount);

    } catch (err) {
        console.error('Check failed:', err);
    } finally {
        await prisma.$disconnect();
    }
}

check();
