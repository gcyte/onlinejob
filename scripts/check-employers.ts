import { prisma } from "../src/lib/prisma";

async function checkEmployers() {
    try {
        const employers = await prisma.user.findMany({
            where: { role: 'EMPLOYER' },
            include: { employerProfile: true }
        });
        console.log(JSON.stringify(employers, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}
checkEmployers();
