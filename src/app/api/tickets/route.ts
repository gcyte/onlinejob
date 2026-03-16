import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !(session.user as any).id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { subject, category, priority, message } = await request.json();

    if (!subject || !category || !message) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const ticket = await prisma.supportTicket.create({
      data: {
        userId: (session.user as any).id,
        subject,
        category,
        priority: priority || "MEDIUM",
        messages: {
          create: {
            senderId: (session.user as any).id,
            message,
            isAdminReply: false
          }
        }
      },
      include: {
        messages: true
      }
    });

    return NextResponse.json(ticket, { status: 201 });
  } catch (error) {
    console.error("Error creating ticket:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const tickets = await prisma.supportTicket.findMany({
      where: {
        userId: (session.user as any).id
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    return NextResponse.json(tickets);
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
