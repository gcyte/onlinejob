import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user as any).role !== "ADMIN") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status");

        const whereClause = status ? { status: status as any } : {};

        const reports = await prisma.report.findMany({
            where: whereClause,
            include: {
                reporter: {
                    select: { name: true, email: true, image: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 100 // Limit for safety
        });

        return NextResponse.json(reports);
    } catch (error) {
        console.error("Error fetching admin reports:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
