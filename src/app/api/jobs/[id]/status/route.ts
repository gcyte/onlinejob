import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: jobId } = await params;
        const session = await getServerSession(authOptions);

        if (!session || (session.user as any).role !== "FREELANCER") {
            return NextResponse.json({ isSaved: false, isApplied: false });
        }

        const userId = (session.user as any).id;

        // Get the freelancer profile
        const profile = await prisma.freelancerProfile.findUnique({
            where: { userId }
        });

        if (!profile) {
            return NextResponse.json({ isSaved: false, isApplied: false });
        }

        const [saved, application] = await Promise.all([
            prisma.savedJob.findUnique({
                where: {
                    jobId_freelancerProfileId: {
                        jobId,
                        freelancerProfileId: profile.id
                    }
                }
            }),
            prisma.application.findFirst({
                where: {
                    jobId,
                    freelancerProfileId: profile.id
                }
            })
        ]);

        return NextResponse.json({
            isSaved: !!saved,
            isApplied: !!application
        });
    } catch (error) {
        console.error("JOB_STATUS_FETCH_ERROR", error);
        return NextResponse.json({ isSaved: false, isApplied: false });
    }
}
