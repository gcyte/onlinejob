import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: jobId } = await params;
        const session = await getServerSession(authOptions);

        if (!session || (session.user as any).role !== "FREELANCER") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const userId = (session.user as any).id;

        // Get the freelancer profile
        const profile = await prisma.freelancerProfile.findUnique({
            where: { userId }
        });

        if (!profile) {
            return new NextResponse("Freelancer profile not found", { status: 404 });
        }

        // Check if already saved
        const existing = await prisma.savedJob.findUnique({
            where: {
                jobId_freelancerProfileId: {
                    jobId,
                    freelancerProfileId: profile.id
                }
            }
        });

        if (existing) {
            // Unsave
            await prisma.savedJob.delete({
                where: { id: existing.id }
            });
            return NextResponse.json({ saved: false });
        } else {
            // Save
            await prisma.savedJob.create({
                data: {
                    jobId,
                    freelancerProfileId: profile.id
                }
            });
            return NextResponse.json({ saved: true });
        }
    } catch (error: any) {
        console.error("SAVE_JOB_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: jobId } = await params;
        const session = await getServerSession(authOptions);

        if (!session || (session.user as any).role !== "FREELANCER") {
            return NextResponse.json({ saved: false });
        }

        const profile = await prisma.freelancerProfile.findUnique({
            where: { userId: (session.user as any).id }
        });

        if (!profile) return NextResponse.json({ saved: false });

        const existing = await prisma.savedJob.findUnique({
            where: {
                jobId_freelancerProfileId: {
                    jobId,
                    freelancerProfileId: profile.id
                }
            }
        });

        return NextResponse.json({ saved: !!existing });
    } catch (error) {
        return NextResponse.json({ saved: false });
    }
}
