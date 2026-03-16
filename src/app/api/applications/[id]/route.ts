import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);

        if (!session || (session.user as any).role !== "FREELANCER") {
            return new NextResponse("Unauthorized", { status: 441 });
        }

        const userId = (session.user as any).id;
        const profile = await prisma.freelancerProfile.findUnique({
            where: { userId }
        });

        if (!profile) {
            return new NextResponse("Unauthorized", { status: 441 });
        }

        const application = await prisma.application.findUnique({
            where: { id }
        });

        if (!application || application.freelancerProfileId !== profile.id) {
            return new NextResponse("Not found", { status: 404 });
        }

        // Only allow withdrawing if still pending
        if (application.status !== "PENDING") {
            return new NextResponse("Cannot withdraw an application that is already being reviewed or finalized", { status: 400 });
        }

        await prisma.application.delete({
            where: { id }
        });

        return new NextResponse(null, { status: 204 });
    } catch (error: any) {
        console.error("DELETE_APPLICATION_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
