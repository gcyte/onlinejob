import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";

export type UploadCategory = "resumes" | "avatars" | "logos" | "verifications" | "messages";

export async function uploadFile(
    file: File,
    category: UploadCategory
): Promise<string> {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const extension = file.name.split(".").pop();
    const fileName = `${uuidv4()}.${extension}`;

    // Storage path relative to the project root
    const relativePath = join("uploads", category, fileName);
    const absolutePath = join(process.cwd(), "public", relativePath);

    // Ensure directory exists (redundant but safe)
    await mkdir(join(process.cwd(), "public", "uploads", category), { recursive: true });

    await writeFile(absolutePath, buffer);

    // Return the public URL path
    return `/${relativePath.replace(/\\/g, "/")}`;
}
