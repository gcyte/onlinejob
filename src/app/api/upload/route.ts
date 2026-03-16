import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { uploadFile, UploadCategory } from "@/lib/upload";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get("file") as File;
        const category = (formData.get("category") as UploadCategory) || "resumes";

        if (!file) {
            return new NextResponse("No file uploaded", { status: 400 });
        }

        const url = await uploadFile(file, category);

        return NextResponse.json({ url });
    } catch (error: any) {
        console.error("UPLOAD_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
