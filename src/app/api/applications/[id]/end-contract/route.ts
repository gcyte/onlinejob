import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { ApplicationStatus } from "@prisma/client";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: applicationId } = await params;
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { score, comment } = await req.json();
        const currentUserId = (session.user as any).id;

        // 1. Fetch application and job details
        const application = await prisma.application.findUnique({
            where: { id: applicationId },
            include: {
                job: true,
                freelancerProfile: true
            }
        });

        if (!application) {
            return new NextResponse("Application not found", { status: 404 });
        }

        // 2. Security check: Only the employer who posted the job can end contract
        const employerProfile = await prisma.employerProfile.findUnique({
            where: { userId: currentUserId }
        });

        if (!employerProfile || application.job.employerId !== employerProfile.id) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        // 3. Status check: Only HIRED applications can be ended
        if (application.status !== "HIRED") {
            return new NextResponse("Can only end contracts for HIRED applications", { status: 400 });
        }

        // 4. Perform everything in a transaction
        const result = await prisma.$transaction(async (tx: any) => {
            // Update application status
            const updatedApplication = await tx.application.update({
                where: { id: applicationId },
                data: { status: "COMPLETED" as any }
            });

            // Create the review
            const review = await tx.review.create({
                data: {
                    applicationId,
                    employerId: employerProfile.id,
                    freelancerProfileId: application.freelancerProfileId,
                    score,
                    comment
                }
            });

            // Calculate new trust score for freelancer
            const freelancerReviews = await tx.review.findMany({
                where: { freelancerProfileId: application.freelancerProfileId }
            });

            const totalScore = freelancerReviews.reduce((sum: number, r: any) => sum + r.score, 0);
            const avgScore = totalScore / freelancerReviews.length;
            const newTrustScore = Math.round(avgScore * 20);

            // Update freelancer profile with new trust score
            await tx.freelancerProfile.update({
                where: { id: application.freelancerProfileId },
                data: { trustScore: newTrustScore }
            });

            // Create a notification for the freelancer
            await tx.notification.create({
                data: {
                    userId: application.freelancerProfile.userId,
                    type: "APPLICATION_STATUS_CHANGE",
                    title: "Contract Completed",
                    message: `Your contract for "${application.job.title}" has been completed and you received a trust score of ${score}/5.`,
                    link: `/dashboard/applications`
                }
            });

            return { updatedApplication, review, newTrustScore };
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error("END_CONTRACT_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
