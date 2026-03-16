import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user as any).role !== "FREELANCER") {
            return new NextResponse("Unauthorized", { status: 441 });
        }

        const userId = (session.user as any).id;
        const profile = await prisma.freelancerProfile.findUnique({
            where: { userId }
        });

        if (!profile) {
            return NextResponse.json([]);
        }

        const applications = await prisma.application.findMany({
            where: { freelancerProfileId: profile.id },
            include: {
                job: {
                    include: {
                        employer: true
                    }
                }
            },
            orderBy: { createdAt: "desc" }
        });

        return NextResponse.json(applications);
    } catch (error: any) {
        console.error("GET_MY_APPLICATIONS_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
