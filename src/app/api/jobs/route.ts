import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user as any).role !== "EMPLOYER") {
            return new NextResponse("Unauthorized", { status: 441 });
        }

        const {
            title,
            description,
            requirements,
            salaryRange,
            jobType,
            location,
            category,
            skills,
            salaryMin,
            salaryMax,
            salaryCurrency,
            salaryFrequency,
            experienceLevel,
            englishProficiency,
            workStyle
        } = await req.json();

        const user = await prisma.user.findUnique({
            where: { id: (session.user as any).id },
            include: { employerProfile: true }
        });

        if (!user || !user.employerProfile) {
            return new NextResponse("Employer profile not found", { status: 404 });
        }

        const job = await prisma.jobPost.create({
            data: {
                employerId: user.employerProfile.id,
                title,
                description,
                requirements,
                category,
                skills,
                salaryMin: (salaryMin && !isNaN(Number(salaryMin))) ? Number(salaryMin) : null,
                salaryMax: (salaryMax && !isNaN(Number(salaryMax))) ? Number(salaryMax) : null,
                salaryCurrency,
                salaryFrequency,
                experienceLevel,
                englishProficiency,
                workStyle,
                salaryRange,
                jobType,
                location,
                status: "PENDING",
                isPublished: true, // @deprecated
                isModerated: false // @deprecated
            },
        });

        return NextResponse.json(job);
    } catch (error: any) {
        console.error("JOB_POST_ERROR", error);
        return new NextResponse(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}
