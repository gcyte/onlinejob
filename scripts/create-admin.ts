import { prisma } from "../src/lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
    const email = "admin@onlinejob.com";
    const password = "Admin@123";
    const name = "Admin";

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
        console.log(`Admin account already exists: ${email}`);
        return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const admin = await prisma.user.create({
        data: {
            email,
            name,
            password: hashedPassword,
            role: "ADMIN",
        }
    });

    console.log("✅ Admin account created successfully!");
    console.log(`   Email:    ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   User ID:  ${admin.id}`);
}

main()
    .catch(e => {
        console.error("Error:", e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
