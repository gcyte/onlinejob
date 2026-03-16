import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user as any).role !== "ADMIN") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
        }

        const premiumEmployers = await prisma.employerProfile.findMany({
            where: {
                isPremium: true
            },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                        createdAt: true
                    }
                }
            },
            orderBy: {
                id: 'desc'
            }
        });

        return NextResponse.json(premiumEmployers);
    } catch (error) {
        console.error("Error fetching premium employers:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user as any).role !== "ADMIN") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
        }

        const { employerId, isPremium } = await request.json();

        if (!employerId || typeof isPremium !== 'boolean') {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        const updatedEmployer = await prisma.employerProfile.update({
            where: { id: employerId },
            data: { isPremium }
        });

        // Log the admin action
        await prisma.adminLog.create({
            data: {
                adminId: (session.user as any).id,
                action: isPremium ? "GRANT_PREMIUM" : "REVOKE_PREMIUM",
                targetId: employerId,
                targetType: "EMPLOYER",
                details: `${isPremium ? "Granted" : "Revoked"} premium status for employer ${updatedEmployer.companyName || employerId}.`
            }
        });

        return NextResponse.json(updatedEmployer);
    } catch (error) {
        console.error("Error updating premium status:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
