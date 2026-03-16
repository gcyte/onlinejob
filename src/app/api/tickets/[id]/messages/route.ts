import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const p = await params;
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const ticket = await prisma.supportTicket.findUnique({
            where: { id: p.id },
            include: {
                messages: {
                    include: {
                        sender: {
                            select: { name: true, image: true, role: true }
                        }
                    },
                    orderBy: { createdAt: 'asc' }
                }
            }
        });

        if (!ticket) {
            return NextResponse.json({ message: "Ticket not found" }, { status: 404 });
        }

        // Check if user is the owner or an admin
        if (ticket.userId !== (session.user as any).id && (session.user as any).role !== "ADMIN") {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        return NextResponse.json(ticket);
    } catch (error) {
        console.error("Error getting ticket messages:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const p = await params;
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { message } = await request.json();

        if (!message) {
            return NextResponse.json({ message: "Message is required" }, { status: 400 });
        }

        const ticket = await prisma.supportTicket.findUnique({
            where: { id: p.id },
        });

        if (!ticket) {
            return NextResponse.json({ message: "Ticket not found" }, { status: 404 });
        }

        const isAdmin = (session.user as any).role === "ADMIN";

        if (ticket.userId !== (session.user as any).id && !isAdmin) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        const newMessage = await prisma.ticketMessage.create({
            data: {
                ticketId: p.id,
                senderId: (session.user as any).id,
                message
            }
        });

        // Update ticket updatedAt and status if user replied
        await prisma.supportTicket.update({
            where: { id: p.id },
            data: {
                updatedAt: new Date(),
                ...(isAdmin ? { status: 'IN_PROGRESS' } : { status: ticket.status === "CLOSED" ? "OPEN" : ticket.status })
            }
        });

        return NextResponse.json(newMessage, { status: 201 });
    } catch (error) {
        console.error("Error creating ticket message:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
