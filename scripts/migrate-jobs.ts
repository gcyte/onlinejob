import { prisma } from "../src/lib/prisma";

async function main() {
    console.log("Migrating JobPosts to new status field...");

    // Update active jobs
    const activeResult = await prisma.jobPost.updateMany({
        where: { isPublished: true, isModerated: false },
        data: { status: "APPROVED" }
    });
    console.log(`Updated ${activeResult.count} active jobs to APPROVED.`);

    // Update draft jobs
    const draftResult = await prisma.jobPost.updateMany({
        where: { isPublished: false, isModerated: false },
        data: { status: "DRAFT" }
    });
    console.log(`Updated ${draftResult.count} draft jobs to DRAFT.`);

    // Update closed/moderated jobs
    const closedResult = await prisma.jobPost.updateMany({
        where: { isModerated: true },
        data: { status: "CLOSED" }
    });
    console.log(`Updated ${closedResult.count} moderated/closed jobs to CLOSED.`);

    console.log("Migration complete.");
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
