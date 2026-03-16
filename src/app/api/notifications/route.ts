import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const userId = (session.user as any).id;

    try {
        const notifications = await prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            take: 20
        });

        return NextResponse.json(notifications);
    } catch (error) {
        console.error("Failed to fetch notifications:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function PATCH(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const { id, all } = await req.json();
        const userId = (session.user as any).id;

        if (all) {
            await prisma.notification.updateMany({
                where: { userId },
                data: { isRead: true }
            });
            return NextResponse.json({ success: true });
        }

        if (id) {
            const notification = await prisma.notification.update({
                where: { id, userId },
                data: { isRead: true }
            });
            return NextResponse.json(notification);
        }

        return new NextResponse("Missing ID", { status: 400 });
    } catch (error) {
        console.error("Failed to update notification:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
