import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { targetId, targetType, reason, details } = body;

        if (!targetId || !targetType || !reason) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        const report = await prisma.report.create({
            data: {
                reporterId: (session.user as any).id,
                targetId,
                targetType,
                reason,
                details,
            },
        });

        return NextResponse.json(report, { status: 201 });
    } catch (error) {
        console.error("Error creating report:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
