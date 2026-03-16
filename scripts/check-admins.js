const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const admins = await prisma.user.findMany({
        where: { role: 'ADMIN' },
    });
    console.log('Admins found:', admins.map(u => ({ email: u.email, name: u.name })));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
