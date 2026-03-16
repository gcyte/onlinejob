import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const p = await params;
        const session = await getServerSession(authOptions);

        if (!session || (session.user as any).role !== "ADMIN") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
        }

        const body = await request.json();
        const { status, adminNotes } = body;

        if (!status) {
            return NextResponse.json({ message: "Status is required" }, { status: 400 });
        }

        const report = await prisma.report.update({
            where: { id: p.id },
            data: {
                status,
                adminNotes: adminNotes || null,
            }
        });

        // Also log the action
        await prisma.adminLog.create({
            data: {
                adminId: (session.user as any).id,
                action: `RESOLVE_REPORT`,
                targetId: p.id,
                targetType: "REPORT",
                details: `Updated report status to ${status}. Notes: ${adminNotes}`,
            }
        });

        return NextResponse.json(report);
    } catch (error) {
        console.error("Error updating report:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
