import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { uploadFile } from "@/lib/upload";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const role = (session.user as any).role;
        if (role !== "FREELANCER" && role !== "EMPLOYER") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const formData = await req.formData();
        const idCardFile = formData.get("idCard") as File;
        const addressProofFile = formData.get("addressProof") as File;

        if (!idCardFile && !addressProofFile) {
            return new NextResponse("No files uploaded", { status: 400 });
        }

        const userId = (session.user as any).id;
        const updateData: any = {
            verificationStatus: "PENDING"
        };

        if (idCardFile) {
            const idCardUrl = await uploadFile(idCardFile, "verifications");
            updateData.idCardUrl = idCardUrl;
        }

        if (addressProofFile) {
            const addressProofUrl = await uploadFile(addressProofFile, "verifications");
            updateData.addressProofUrl = addressProofUrl;
        }

        // Update the correct profile based on role
        let updatedProfile;
        if (role === "FREELANCER") {
            updatedProfile = await prisma.freelancerProfile.update({
                where: { userId },
                data: updateData,
            });
        } else {
            updatedProfile = await prisma.employerProfile.update({
                where: { userId },
                data: updateData,
            });
        }

        return NextResponse.json(updatedProfile);
    } catch (error: any) {
        console.error("VERIFICATION_UPLOAD_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
