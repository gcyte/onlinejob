import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user as any).role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const [pendingFreelancers, pendingEmployers] = await Promise.all([
            prisma.freelancerProfile.findMany({
                where: { verificationStatus: "PENDING" },
                include: { user: { select: { name: true, email: true } } },
                orderBy: { id: "desc" }
            }),
            prisma.employerProfile.findMany({
                where: { verificationStatus: "PENDING" },
                include: { user: { select: { name: true, email: true } } },
                orderBy: { id: "desc" }
            })
        ]);

        const allPending = [
            ...pendingFreelancers.map(p => ({ ...p, type: 'FREELANCER' })),
            ...pendingEmployers.map(p => ({ ...p, type: 'EMPLOYER' }))
        ].sort((a, b) => b.id.localeCompare(a.id));

        return NextResponse.json(allPending);
    } catch (error) {
        console.error("ADMIN_GET_VERIFICATIONS_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user as any).role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { profileId, status, adminNotes, type } = await req.json();

        if (!profileId || !status) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        let profile;
        if (type === 'EMPLOYER') {
            profile = await prisma.employerProfile.findUnique({
                where: { id: profileId },
                select: { id: true, userId: true },
            });
        } else {
            profile = await prisma.freelancerProfile.findUnique({
                where: { id: profileId },
                select: { id: true, userId: true },
            });
        }

        if (!profile) {
            return new NextResponse("Profile not found", { status: 404 });
        }

        const isApproved = status === "APPROVED";
        const targetModel = type === 'EMPLOYER' ? prisma.employerProfile : prisma.freelancerProfile;

        const [updatedProfile] = await prisma.$transaction([
            (targetModel as any).update({
                where: { id: profileId },
                data: {
                    verificationStatus: status,
                    isVerified: isApproved,
                    adminNotes: adminNotes || null
                }
            }),
            prisma.notification.create({
                data: {
                    userId: profile.userId,
                    type: "SYSTEM_ANNOUNCEMENT",
                    title: `Identity Verification ${isApproved ? "Approved" : "Rejected"}`,
                    message: isApproved
                        ? "Your identity verification request has been approved. You now have the verified badge!"
                        : `Your identity verification was rejected. Reason: ${adminNotes || "None provided."}`,
                    link: "/profile/edit"
                }
            }),
            prisma.adminLog.create({
                data: {
                    adminId: (session.user as any).id,
                    action: isApproved ? "APPROVE_VERIFICATION" : "REJECT_VERIFICATION",
                    targetId: profileId,
                    targetType: "VERIFICATION",
                    details: `${isApproved ? "Approved" : "Rejected"} verification request for profile ${profileId}. Notes: ${adminNotes || "None"}`
                }
            })
        ]);

        return NextResponse.json(updatedProfile);
    } catch (error) {
        console.error("ADMIN_PATCH_VERIFICATION_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
