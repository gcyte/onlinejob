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

        const whereClause = status && status !== 'ALL' ? { status: status as any } : {};

        const tickets = await prisma.supportTicket.findMany({
            where: whereClause,
            include: {
                user: {
                    select: { name: true, email: true, image: true }
                }
            },
            orderBy: [
                { priority: 'desc' }, // URGENT first
                { updatedAt: 'desc' },
            ],
            take: 100
        });

        return NextResponse.json(tickets);
    } catch (error) {
        console.error("Error fetching admin tickets:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
