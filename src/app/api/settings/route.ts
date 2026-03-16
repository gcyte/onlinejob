import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

// PATCH /api/settings - Update account settings
export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return new NextResponse("Unauthorized", { status: 401 });

        const userId = (session.user as any).id;
        const body = await req.json();
        const { name, currentPassword, newPassword } = body;

        // --- Update Display Name ---
        if (name !== undefined) {
            const trimmedName = name.trim();
            if (!trimmedName) {
                return new NextResponse("Name cannot be empty.", { status: 400 });
            }
            await prisma.user.update({
                where: { id: userId },
                data: { name: trimmedName },
            });
        }

        // --- Update Password ---
        if (currentPassword && newPassword) {
            if (newPassword.length < 6) {
                return new NextResponse("Password must be at least 6 characters.", { status: 400 });
            }

            const user = await prisma.user.findUnique({ where: { id: userId } });
            if (!user?.password) {
                return new NextResponse("Cannot change password for social login accounts.", { status: 400 });
            }

            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return new NextResponse("Current password is incorrect.", { status: 400 });
            }

            const hashed = await bcrypt.hash(newPassword, 12);
            await prisma.user.update({
                where: { id: userId },
                data: { password: hashed },
            });
        }

        return NextResponse.json({ message: "Settings updated successfully." });
    } catch (error: any) {
        console.error("SETTINGS_UPDATE_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
