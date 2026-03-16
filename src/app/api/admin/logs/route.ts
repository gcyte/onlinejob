import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const action = searchParams.get("action") || "ALL";
    const limit = 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (action !== "ALL") {
        where.action = action;
    }

    try {
        const [logs, total] = await Promise.all([
            prisma.adminLog.findMany({
                where,
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
                include: {
                    admin: {
                        select: {
                            name: true,
                            email: true,
                            image: true
                        }
                    }
                }
            }),
            prisma.adminLog.count({ where })
        ]);

        return NextResponse.json({
            logs,
            total,
            page,
            limit,
            pages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error("FETCH_LOGS_ERROR", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
