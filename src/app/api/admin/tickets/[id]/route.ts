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
        const { status, priority } = body;

        const updated = await prisma.supportTicket.update({
            where: { id: p.id },
            data: { status, priority }
        });

        // Log the change
        await prisma.adminLog.create({
            data: {
                adminId: (session.user as any).id,
                action: `UPDATE_TICKET`,
                targetId: p.id,
                targetType: "TICKET",
                details: `Updated ticket status/priority. new status: ${status}, new priority: ${priority}`,
            }
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error("Error updating ticket:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
