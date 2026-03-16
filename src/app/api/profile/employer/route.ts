import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user || (session.user as any).role !== "EMPLOYER") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const profile = await prisma.employerProfile.findUnique({
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

        if (!session?.user || (session.user as any).role !== "EMPLOYER") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { companyName, companyWebsite, companyAddress, description, companyLogo, industry, companySize, coverPhotoUrl, cultureValues } = await req.json();
        const userId = (session.user as any).id;

        const updatedProfile = await prisma.employerProfile.upsert({
            where: { userId },
            create: {
                userId,
                companyName,
                companyWebsite,
                companyAddress,
                description,
                companyLogo,
                industry,
                companySize,
                coverPhotoUrl,
                cultureValues: cultureValues ? (typeof cultureValues === 'string' ? cultureValues : JSON.stringify(cultureValues)) : null
            },
            update: {
                companyName,
                companyWebsite,
                companyAddress,
                description,
                companyLogo,
                industry,
                companySize,
                coverPhotoUrl,
                cultureValues: cultureValues ? (typeof cultureValues === 'string' ? cultureValues : JSON.stringify(cultureValues)) : null
            },
        });

        return NextResponse.json(updatedProfile);
    } catch (error: any) {
        console.error("PROFILE_UPDATE_ERROR", error);
        return new NextResponse(error.message || "Internal Error", { status: 500 });
    }
}
