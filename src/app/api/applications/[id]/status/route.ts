import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);

        if (!session || (session.user as any).role !== "EMPLOYER") {
            return new NextResponse("Unauthorized", { status: 441 });
        }

        const { status } = await req.json();

        // Verify the employer owns the job this application belongs to
        const application = await prisma.application.findUnique({
            where: { id },
            include: {
                job: {
                    include: { employer: true }
                }
            }
        });

        if (!application || application.job.employer.userId !== (session.user as any).id) {
            return new NextResponse("Unauthorized", { status: 441 });
        }

        const updated = await prisma.application.update({
            where: { id },
            data: { status },
        });

        return NextResponse.json(updated);
    } catch (error: any) {
        console.error("STATUS_UPDATE_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
