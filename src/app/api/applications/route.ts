import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { sendJobApplicationNotification } from "@/lib/mail";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user as any).role !== "FREELANCER") {
            return new NextResponse("Unauthorized", { status: 441 });
        }

        const { jobId, coverLetter, resumeUrl, attachments } = await req.json();

        const freelanceUser = await prisma.user.findUnique({
            where: { id: (session.user as any).id },
            include: { freelancerProfile: true }
        });

        if (!freelanceUser || !freelanceUser.freelancerProfile) {
            return new NextResponse("Freelancer profile not found", { status: 404 });
        }

        // Check if user already applied
        const existing = await prisma.application.findFirst({
            where: {
                jobId,
                freelancerProfileId: freelanceUser.freelancerProfile.id
            }
        });

        if (existing) {
            return new NextResponse("You have already applied for this job", { status: 400 });
        }

        const application = await prisma.application.create({
            data: {
                jobId,
                freelancerProfileId: freelanceUser.freelancerProfile.id,
                coverLetter,
                resumeUrl,
                attachments,
                status: "PENDING"
            },
            include: {
                job: { include: { employer: { include: { user: true } } } }
            }
        });

        // 1. Notify the employer via email (non-blocking)
        if (application.job.employer.user.email) {
            sendJobApplicationNotification(
                application.job.employer.user.email,
                application.job.title,
                freelanceUser.name || "A freelancer"
            ).catch(err => console.error("Email notification failed", err));
        }

        // 2. Create an in-app notification for the employer
        await prisma.notification.create({
            data: {
                userId: application.job.employer.userId,
                type: "NEW_APPLICATION",
                title: "New Job Application",
                message: `${freelanceUser.name || "A freelancer"} applied for "${application.job.title}"`,
                link: `/manage/jobs/${jobId}/applications`
            }
        }).catch(err => console.error("In-app notification failed", err));

        return NextResponse.json(application);
    } catch (error: any) {
        console.error("APPLICATION_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
