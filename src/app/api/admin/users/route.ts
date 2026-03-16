import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

// GET all users
export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") || "ALL";
    const status = searchParams.get("status") || "ALL";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    const conditions: any[] = [];

    if (search) {
        conditions.push({
            OR: [
                { name: { contains: search } },
                { email: { contains: search } },
            ],
        });
    }

    if (role !== "ALL") {
        conditions.push({ role });
    }

    if (status === "BANNED") {
        conditions.push({ isBanned: true });
    } else if (status === "ACTIVE") {
        conditions.push({ isBanned: false });
    }

    if (conditions.length > 0) {
        where.AND = conditions;
    }

    const [users, total] = await Promise.all([
        prisma.user.findMany({
            where,
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
            include: {
                freelancerProfile: { select: { isVerified: true, verificationStatus: true, avatarUrl: true } },
                employerProfile: { select: { companyName: true, companyLogo: true } },
            },
        }),
        prisma.user.count({ where }),
    ]);

    return NextResponse.json({ users, total, page, limit, pages: Math.ceil(total / limit) });
}

// PATCH - ban or unban a user
export async function PATCH(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId, isBanned } = await req.json();

    if (!userId) {
        return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    // Prevent banning yourself
    if (userId === (session.user as any).id) {
        return NextResponse.json({ error: "Cannot ban yourself" }, { status: 400 });
    }

    const [user] = await prisma.$transaction([
        prisma.user.update({
            where: { id: userId },
            data: { isBanned: Boolean(isBanned) },
            select: { id: true, name: true, email: true, isBanned: true },
        }),
        prisma.adminLog.create({
            data: {
                adminId: (session.user as any).id,
                action: isBanned ? "BAN_USER" : "UNBAN_USER",
                targetId: userId,
                targetType: "USER",
                details: `User ${isBanned ? "banned" : "unbanned"} via admin dashboard`,
            }
        })
    ]);

    return NextResponse.json(user);
}

// POST - Create a new admin
export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { name, email, password } = await req.json();

        if (!name || !email || !password) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        const exists = await prisma.user.findUnique({
            where: { email },
        });

        if (exists) {
            return NextResponse.json({ error: "User already exists" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [user] = await prisma.$transaction([
            prisma.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                    role: "ADMIN",
                },
                select: { id: true, name: true, email: true, role: true },
            }),
            prisma.adminLog.create({
                data: {
                    adminId: (session.user as any).id,
                    action: "CREATE_ADMIN",
                    targetType: "USER",
                    targetId: "NEW_ADMIN", // targetId is required in schema, using a placeholder or we can get user.id
                    details: `Created new admin account: ${email}`,
                }
            })
        ]);

        // Fix: Update targetId with the real user id if possible, or just use a descriptive string
        // Actually, prisma transaction returns the values. Let's adjust to use user.id
        const logId = (user as any).id;
        await prisma.adminLog.updateMany({
            where: {
                adminId: (session.user as any).id,
                action: "CREATE_ADMIN",
                targetId: "NEW_ADMIN",
                createdAt: { gte: new Date(Date.now() - 5000) }
            },
            data: { targetId: logId }
        });

        return NextResponse.json(user);
    } catch (error) {
        console.error("CREATE_ADMIN_ERROR", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
