const { PrismaClient } = require('@prisma/client');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');
const bcrypt = require('bcryptjs');

const url = "mysql://root@localhost:3306/onlinejob_db";
const connectionString = url.replace(/^mysql:\/\//, "mariadb://");
const adapter = new PrismaMariaDb(connectionString);
const prisma = new PrismaClient({ adapter });

async function main() {
    const hashedPassword = await bcrypt.hash('password123', 10);

    const employer = await prisma.user.upsert({
        where: { email: 'employer@test.com' },
        update: {},
        create: {
            email: 'employer@test.com',
            name: 'Test Employer',
            password: hashedPassword,
            role: 'EMPLOYER',
            employerProfile: {
                create: {
                    companyName: 'Test Company',
                }
            }
        }
    });

    console.log('Employer created:', employer.email);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
