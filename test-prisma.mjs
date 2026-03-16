import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import * as dotenv from 'dotenv';
dotenv.config();

const url = process.env.DATABASE_URL || "";
const connectionString = url.replace(/^mysql:\/\//, "mariadb://");
const adapter = new PrismaMariaDb(connectionString);

const prisma = new PrismaClient({
    adapter,
});

async function main() {
    try {
        console.log("Checking Prisma models...");
        const models = Object.keys(prisma);
        console.log("Available models/properties in prisma instance:", models.filter(m => !m.startsWith('_')));

        if (prisma.savedJob) {
            console.log("SUCCESS: prisma.savedJob exists.");
            const count = await prisma.savedJob.count();
            console.log("SavedJob count:", count);
        } else {
            console.log("FAILED: prisma.savedJob DOES NOT exist.");
        }
    } catch (err) {
        console.error("ERROR:", err);
    } finally {
        await prisma.$disconnect();
    }
}

main();
