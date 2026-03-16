import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user || (session.user as any).role !== "FREELANCER") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const profile = await prisma.freelancerProfile.findUnique({
            where: { userId: (session.user as any).id }
        });

        return NextResponse.json(profile || {});
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user || (session.user as any).role !== "FREELANCER") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { title, bio, skills, expectedSalary, availability, phone, location, portfolioUrl, experience, education, socialLinks } = await req.json();
        const userId = (session.user as any).id;

        const parsedSalary = parseFloat(expectedSalary);
        const updateData: any = {
            title,
            bio,
            skills,
            availability,
            phone,
            location,
            portfolioUrl,
            experience,
            education,
            socialLinks
        };

        if (!isNaN(parsedSalary)) {
            updateData.expectedSalary = parsedSalary;
        }

        const updatedProfile = await prisma.freelancerProfile.upsert({
            where: { userId },
            create: {
                userId,
                title,
                bio,
                skills,
                expectedSalary: !isNaN(parsedSalary) ? parsedSalary : null,
                availability,
                phone,
                location,
                portfolioUrl,
                experience,
                education,
                socialLinks
            },
            update: {
                ...updateData
            },
        });

        return NextResponse.json(updatedProfile);
    } catch (error: any) {
        console.error("PROFILE_UPDATE_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
