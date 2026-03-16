import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ type: string, id: string }> }
) {
    try {
        const { type, id } = await params;

        if (type === "freelancer") {
            const profile = await prisma.freelancerProfile.findFirst({
                where: {
                    OR: [
                        { id },
                        { userId: id }
                    ]
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            image: true
                        }
                    },
                    reviews: {
                        include: {
                            employer: {
                                select: { companyName: true, companyLogo: true }
                            }
                        },
                        orderBy: { createdAt: "desc" }
                    }
                }
            });

            if (!profile) return new NextResponse("Profile not found", { status: 404 });

            return NextResponse.json(profile);
        } else if (type === "employer") {
            const profile = await prisma.employerProfile.findFirst({
                where: {
                    OR: [
                        { id },
                        { userId: id }
                    ]
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    },
                    jobs: {
                        where: { isPublished: true },
                        orderBy: { createdAt: "desc" },
                        take: 5
                    }
                }
            });

            if (!profile) return new NextResponse("Profile not found", { status: 404 });

            return NextResponse.json(profile);
        }

        return new NextResponse("Invalid type", { status: 400 });
    } catch (error) {
        console.error("PUBLIC_PROFILE_GET_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
