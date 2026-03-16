import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

// GET /api/conversations - Fetch all conversations for the current user
export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return new NextResponse("Unauthorized", { status: 401 });

        const currentUserId = (session.user as any).id;

        const conversations = await prisma.conversation.findMany({
            where: {
                OR: [
                    { initiatorId: currentUserId },
                    { receiverId: currentUserId }
                ]
            },
            include: {
                initiator: {
                    select: { 
                        id: true, 
                        name: true, 
                        image: true, 
                        role: true,
                        employerProfile: { select: { companyLogo: true } },
                        freelancerProfile: { select: { avatarUrl: true } }
                    }
                },
                receiver: {
                    select: { 
                        id: true, 
                        name: true, 
                        image: true, 
                        role: true,
                        employerProfile: { select: { companyLogo: true } },
                        freelancerProfile: { select: { avatarUrl: true } }
                    }
                },
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            },
            orderBy: { updatedAt: 'desc' }
        });

        // Format for the UI
        const formattedThreads = conversations.map(conv => {
            const rawOtherUser = conv.initiatorId === currentUserId ? conv.receiver : conv.initiator;
            const otherUser = {
                id: (rawOtherUser as any).id,
                name: (rawOtherUser as any).name,
                role: (rawOtherUser as any).role,
                image: (rawOtherUser as any).image || 
                       (rawOtherUser as any).employerProfile?.companyLogo || 
                       (rawOtherUser as any).freelancerProfile?.avatarUrl
            };

            return {
                otherUser,
                lastMessage: conv.messages[0]?.content || "No messages yet",
                timestamp: conv.messages[0]?.createdAt || conv.updatedAt,
                id: conv.id
            };
        });

        return NextResponse.json(formattedThreads);
    } catch (error: any) {
        console.error("FETCH_CONVERSATIONS_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
