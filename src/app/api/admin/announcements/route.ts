import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const { title, message } = await req.json();

    if (!title || !message) {
        return new NextResponse("Missing title or message", { status: 400 });
    }

    try {
        // Fetch all active (non-banned) users to broadcast the notification
        const users = await prisma.user.findMany({
            where: { isBanned: false },
            select: { id: true }
        });

        // Create the notifications in bulk
        await prisma.notification.createMany({
            data: users.map(u => ({
                userId: u.id,
                type: "SYSTEM_ANNOUNCEMENT",
                title,
                message,
            }))
        });

        // Log the admin action
        await prisma.adminLog.create({
            data: {
                adminId: (session.user as any).id,
                action: "BROADCAST_ANNOUNCEMENT",
                details: `Broadasted: "${title}" to ${users.length} users.`
            }
        });

        return NextResponse.json({ success: true, count: users.length });
    } catch (e: any) {
        console.error("ANNOUNCEMENT_ERROR", e);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
