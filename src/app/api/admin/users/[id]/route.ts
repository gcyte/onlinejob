import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const p = await params;
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const targetUserId = p.id;

        const user = await prisma.user.findUnique({
            where: { id: targetUserId },
            include: {
                freelancerProfile: true,
                employerProfile: true,
                _count: {
                    select: {
                        messages: true,
                        initiatedConversations: true,
                    }
                }
            }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        let stats: any = {};
        if (user.role === "EMPLOYER") {
            stats.jobsPosted = await prisma.jobPost.count({ where: { employerId: user.employerProfile?.id } });
        } else if (user.role === "FREELANCER") {
            stats.applications = await prisma.application.count({ where: { freelancerProfileId: user.freelancerProfile?.id } });
        }

        return NextResponse.json({ ...user, stats });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
