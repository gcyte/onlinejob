import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user || (session.user as any).role !== "FREELANCER") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const userId = (session.user as any).id;
        const profile = await prisma.freelancerProfile.findUnique({
            where: { userId },
            include: {
                applications: true
            }
        });

        if (!profile) return NextResponse.json({
            totalApplications: 0,
            pendingApplications: 0,
            profileCompleteness: 0,
            recentApplications: []
        });

        // Calculate completeness
        const p = profile as any;
        const fields = [p.title, p.bio, p.skills, p.phone, p.location, p.portfolioUrl, p.experience, p.education, p.resumeUrl];
        const filledFields = fields.filter(f => f && f !== "[]").length;
        const completeness = Math.round((filledFields / fields.length) * 100);

        // Get recent applications
        const recentApplications = await prisma.application.findMany({
            where: { freelancerProfileId: profile.id },
            include: {
                job: {
                    include: {
                        employer: true
                    }
                }
            },
            orderBy: { createdAt: "desc" },
            take: 5
        });

        return NextResponse.json({
            totalApplications: profile.applications.length,
            pendingApplications: profile.applications.filter(a => a.status === "PENDING").length,
            hiredApplications: profile.applications.filter(a => a.status === "HIRED").length,
            profileCompleteness: completeness,
            profileId: profile.id,
            recentApplications
        });
    } catch (error) {
        console.error("STATS_GET_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
