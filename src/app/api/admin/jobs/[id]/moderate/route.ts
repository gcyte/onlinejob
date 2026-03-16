import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { sendJobApprovalNotification, sendJobRejectionNotification } from "@/lib/mail";

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);

        if (!session || (session.user as any).role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 441 });
        }

        const { approve } = await req.json();

        const job = await prisma.jobPost.findUnique({
            where: { id },
            select: { id: true, title: true, employer: { select: { userId: true, user: { select: { email: true } } } } }
        });

        if (!job) {
            return new NextResponse("Job not found", { status: 404 });
        }

        if (approve) {
            // Approve the job and notify
            const [updated] = await prisma.$transaction([
                prisma.jobPost.update({
                    where: { id },
                    data: { status: "APPROVED", isModerated: true, isPublished: true },
                }),
                prisma.notification.create({
                    data: {
                        userId: job.employer.userId,
                        type: "SYSTEM_ANNOUNCEMENT",
                        title: "Job Approved",
                        message: `Your job posting "${job.title}" has been approved and is now live.`,
                        link: `/jobs/${id}`
                    }
                }),
                prisma.adminLog.create({
                    data: {
                        adminId: (session.user as any).id,
                        action: "MODERATE_JOB_APPROVE",
                        targetId: id,
                        targetType: "JOB",
                        details: `Approved job post "${job.title}"`
                    }
                })
            ]);

            // Send email notification
            if (job.employer.user?.email) {
                await sendJobApprovalNotification(job.employer.user.email, job.title, job.id).catch(err => console.error("Failed to send approval email", err));
            }

            return NextResponse.json(updated);
        } else {
            // Reject/Delete the job
            await prisma.$transaction([
                prisma.jobPost.delete({ where: { id } }),
                prisma.notification.create({
                    data: {
                        userId: job.employer.userId,
                        type: "SYSTEM_ANNOUNCEMENT",
                        title: "Job Rejected",
                        message: `Your job posting "${job.title}" was rejected as it violated our guidelines.`,
                    }
                }),
                prisma.adminLog.create({
                    data: {
                        adminId: (session.user as any).id,
                        action: "MODERATE_JOB_REJECT",
                        targetId: id,
                        targetType: "JOB",
                        details: `Rejected and deleted job post "${job.title}"`
                    }
                })
            ]);

            // Send email notification
            if (job.employer.user?.email) {
                await sendJobRejectionNotification(job.employer.user.email, job.title).catch(err => console.error("Failed to send rejection email", err));
            }

            return new NextResponse(null, { status: 204 });
        }
    } catch (error: any) {
        console.error("ADMIN_MODERATION_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
