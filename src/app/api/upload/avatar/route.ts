import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { uploadFile } from "@/lib/upload";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return new NextResponse("Unauthorized", { status: 441 });
        }

        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return new NextResponse("No file uploaded", { status: 400 });
        }

        const imageUrl = await uploadFile(file, "avatars");

        // Update the profile based on the role
        const userEmail = (session.user as any).email as string;
        const userRole = (session.user as any).role;

        if (userRole === "FREELANCER") {
            await prisma.user.update({
                where: { id: (session.user as any).id },
                data: { 
                    image: imageUrl,
                    freelancerProfile: {
                        update: { avatarUrl: imageUrl }
                    }
                },
            });
        } else {
            await prisma.user.update({
                where: { id: (session.user as any).id },
                data: { 
                    image: imageUrl,
                    employerProfile: {
                        update: { companyLogo: imageUrl }
                    }
                },
            });
        }

        return NextResponse.json({ url: imageUrl });
    } catch (error: any) {
        console.error("UPLOAD_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
