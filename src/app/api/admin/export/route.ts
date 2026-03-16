import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // "users" or "jobs"

    try {
        if (type === "users") {
            const users = await prisma.user.findMany({
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    isBanned: true,
                    createdAt: true
                }
            });

            const csvHeader = "ID,Name,Email,Role,IsBanned,JoinedAt\n";
            const csvRows = users.map(u =>
                `"${u.id}","${u.name || ""}","${u.email || ""}","${u.role}","${u.isBanned}","${u.createdAt.toISOString()}"`
            ).join("\n");

            return new NextResponse(csvHeader + csvRows, {
                headers: {
                    "Content-Type": "text/csv",
                    "Content-Disposition": 'attachment; filename="users_export.csv"'
                }
            });
        }

        if (type === "jobs") {
            const jobs = await prisma.jobPost.findMany({
                orderBy: { createdAt: "desc" },
                include: { employer: { include: { user: { select: { name: true, email: true } } } } }
            });

            const csvHeader = "JobID,Title,Company,EmployerEmail,Location,Type,IsModerated,CreatedAt\n";
            const csvRows = jobs.map(j =>
                `"${j.id}","${j.title.replace(/"/g, '""')}","${j.employer?.companyName || ""}","${j.employer?.user?.email || ""}","${j.location || ""}","${j.jobType}","${j.isModerated}","${j.createdAt.toISOString()}"`
            ).join("\n");

            return new NextResponse(csvHeader + csvRows, {
                headers: {
                    "Content-Type": "text/csv",
                    "Content-Disposition": 'attachment; filename="jobs_export.csv"'
                }
            });
        }

        return new NextResponse("Invalid export type", { status: 400 });
    } catch (e: any) {
        return new NextResponse(e.message, { status: 500 });
    }
}
