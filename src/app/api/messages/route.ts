import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

// POST /api/messages - Send a message
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { receiverId, content, fileUrl, fileName, fileType } = await req.json();
        const senderId = (session.user as any).id;

        if (!receiverId || !content) {
            return new NextResponse("Missing receiverId or content", { status: 400 });
        }

        // Rule: Freelancers cannot initiate messaging, they can only reply.
        const userRole = (session.user as any).role;

        let conversation = await prisma.conversation.findFirst({
            where: {
                OR: [
                    { initiatorId: senderId, receiverId: receiverId },
                    { initiatorId: receiverId, receiverId: senderId }
                ]
            }
        });

        if (userRole === "FREELANCER" && !conversation) {
            return new NextResponse("Freelancers cannot initiate conversations", { status: 403 });
        }

        // Create conversation if it doesn't exist (only if Employer or if it's a valid reply)
        if (!conversation) {
            conversation = await prisma.conversation.create({
                data: {
                    initiatorId: senderId,
                    receiverId: receiverId
                }
            });
        }

        const message = await prisma.message.create({
            data: {
                senderId,
                conversationId: conversation.id,
                content,
                fileUrl,
                fileName,
                fileType,
            },
            include: {
                sender: {
                    select: { 
                        name: true, 
                        image: true, 
                        role: true,
                        employerProfile: { select: { companyLogo: true } },
                        freelancerProfile: { select: { avatarUrl: true } }
                    }
                }
            }
        });

        // Format for response
        const formattedMessage = {
            ...message,
            sender: {
                name: message.sender.name,
                role: message.sender.role,
                image: message.sender.image || 
                       (message.sender as any).employerProfile?.companyLogo || 
                       (message.sender as any).freelancerProfile?.avatarUrl
            }
        };

        // Update conversation's updatedAt timestamp
        await prisma.conversation.update({
            where: { id: conversation.id },
            data: { updatedAt: new Date() }
        });

        // Create an in-app notification for the receiver
        await prisma.notification.create({
            data: {
                userId: receiverId,
                type: "NEW_MESSAGE",
                title: "New Message",
                message: `You have a new message from ${message.sender.name}`,
                link: `/messages` // We can refine this to include the specific conversation ID if needed
            }
        }).catch(err => console.error("Message notification failed", err));

        return NextResponse.json(formattedMessage);
    } catch (error: any) {
        console.error("MESSAGING_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

// GET /api/messages - Fetch conversation history with a specific user
export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return new NextResponse("Unauthorized", { status: 401 });

        const { searchParams } = new URL(req.url);
        const otherUserId = searchParams.get("userId");
        const currentUserId = (session.user as any).id;

        if (!otherUserId) return new NextResponse("User ID required", { status: 400 });

        const conversation = await prisma.conversation.findFirst({
            where: {
                OR: [
                    { initiatorId: currentUserId, receiverId: otherUserId },
                    { initiatorId: otherUserId, receiverId: currentUserId }
                ]
            }
        });

        if (!conversation) {
            return NextResponse.json([]);
        }

        const messages = await prisma.message.findMany({
            where: {
                conversationId: conversation.id
            },
            include: {
                sender: {
                    select: { 
                        name: true, 
                        image: true, 
                        role: true,
                        employerProfile: { select: { companyLogo: true } },
                        freelancerProfile: { select: { avatarUrl: true } }
                    }
                }
            },
            orderBy: { createdAt: 'asc' }
        });

        // Format messages to ensure sender image is populated from profiles if needed
        const formattedMessages = messages.map(msg => {
            const sender = msg.sender as any;
            return {
                ...msg,
                sender: {
                    name: sender.name,
                    role: sender.role,
                    image: sender.image || sender.employerProfile?.companyLogo || sender.freelancerProfile?.avatarUrl
                }
            };
        });

        return NextResponse.json(formattedMessages);
    } catch (error: any) {
        console.error("FETCH_MESSAGES_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

// PATCH /api/messages - Mark messages as read
export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return new NextResponse("Unauthorized", { status: 401 });

        const { otherUserId } = await req.json();
        const currentUserId = (session.user as any).id;

        if (!otherUserId) return new NextResponse("Other User ID required", { status: 400 });

        const conversation = await prisma.conversation.findFirst({
            where: {
                OR: [
                    { initiatorId: currentUserId, receiverId: otherUserId },
                    { initiatorId: otherUserId, receiverId: currentUserId }
                ]
            }
        });

        if (!conversation) return new NextResponse("Conversation not found", { status: 404 });

        // Update messages
        await prisma.message.updateMany({
            where: {
                conversationId: conversation.id,
                senderId: otherUserId,
                isRead: false
            },
            data: { isRead: true }
        });

        // Also mark NEW_MESSAGE notifications as read for this user
        await prisma.notification.updateMany({
            where: {
                userId: currentUserId,
                type: "NEW_MESSAGE",
                isRead: false
            },
            data: { isRead: true }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("MARK_READ_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
