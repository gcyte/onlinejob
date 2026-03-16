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

        const [totalUsers, totalJobs, totalApplications, totalPremiumEmployers] = await Promise.all([
            prisma.user.count(),
            prisma.jobPost.count(),
            prisma.application.count(),
            prisma.employerProfile.count({
                where: {
                    isPremium: true
                }
            })
        ]);

        // For applications by date, we can get all from last 7 days and group them
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const recentApplications = await prisma.application.findMany({
            where: {
                createdAt: {
                    gte: sevenDaysAgo
                }
            },
            select: {
                createdAt: true
            }
        });

        const applicationsByDate = Array.from({ length: 7 }).map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            return {
                date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                count: 0
            };
        });

        recentApplications.forEach(app => {
            const dateStr = app.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            const index = applicationsByDate.findIndex(d => d.date === dateStr);
            if (index !== -1) {
                applicationsByDate[index].count++;
            }
        });

        return NextResponse.json({
            totalUsers,
            totalJobs,
            totalApplications,
            totalPremiumEmployers,
            applicationsByDate,
        });
    } catch (error) {
        console.error("Error fetching admin analytics:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
