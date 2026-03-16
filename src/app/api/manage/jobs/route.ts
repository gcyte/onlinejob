import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "EMPLOYER") {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const jobs = await prisma.jobPost.findMany({
        where: {
            employer: {
                userId: (session.user as any).id
            }
        },
        select: {
            id: true,
            title: true,
            jobType: true,
            location: true,
            status: true,
            createdAt: true,
            _count: {
                select: { applications: true }
            }
        },
        orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(jobs);
}
