import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { uploadFile } from "@/lib/upload";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user as any).role !== "FREELANCER") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return new NextResponse("No file uploaded", { status: 400 });
        }

        const resumeUrl = await uploadFile(file, "resumes");

        // Update the freelancer profile
        await prisma.freelancerProfile.update({
            where: { userId: (session.user as any).id },
            data: { resumeUrl },
        });

        return NextResponse.json({ url: resumeUrl });
    } catch (error: any) {
        console.error("RESUME_UPLOAD_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
