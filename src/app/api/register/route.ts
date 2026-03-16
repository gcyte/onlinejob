import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { name, email, password, role } = await req.json();

        if (!name || !email || !password || !role) {
            return new NextResponse("Missing fields", { status: 400 });
        }

        const exists = await prisma.user.findUnique({
            where: { email },
        });

        if (exists) {
            return new NextResponse("User already exists", { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role,
                // Automatically create associated profile
                ...(role === "FREELANCER"
                    ? { freelancerProfile: { create: {} } }
                    : { employerProfile: { create: {} } }
                )
            },
        });

        return NextResponse.json(user);
    } catch (error: any) {
        console.error("REGISTRATION_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
