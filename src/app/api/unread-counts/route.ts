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
        const [unreadNotifications, unreadMessages, userProfile] = await Promise.all([
            prisma.notification.count({
                where: { userId, isRead: false }
            }),
            prisma.message.count({
                where: {
                    conversation: {
                        OR: [
                            { initiatorId: userId },
                            { receiverId: userId }
                        ]
                    },
                    senderId: { not: userId },
                    isRead: false
                }
            }),
            prisma.user.findUnique({
                where: { id: userId },
                select: {
                    role: true,
                    image: true,
                    freelancerProfile: { select: { avatarUrl: true } },
                    employerProfile: { select: { companyLogo: true } }
                }
            })
        ]);

        let avatar = userProfile?.image;
        if (!avatar) {
            if (userProfile?.role === "FREELANCER") {
                avatar = userProfile.freelancerProfile?.avatarUrl;
            } else if (userProfile?.role === "EMPLOYER") {
                avatar = userProfile.employerProfile?.companyLogo;
            }
        }

        return NextResponse.json({
            notifications: unreadNotifications,
            messages: unreadMessages,
            avatar: avatar || null
        });
    } catch (error) {
        console.error("Failed to fetch unread counts:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
