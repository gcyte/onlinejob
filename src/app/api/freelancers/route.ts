import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Prisma } from "@prisma/client";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        // Publicly accessible for browsing talent

        const { searchParams } = new URL(req.url);
        const query = searchParams.get("query") || "";
        const skills = searchParams.get("skills") || "";
        const categories = searchParams.getAll("category");
        const minScoreStr = searchParams.get("minScore");
        const maxScoreStr = searchParams.get("maxScore");
        const verified = searchParams.get("verified");
        const minSalaryStr = searchParams.get("minSalary");
        const maxSalaryStr = searchParams.get("maxSalary");
        const sort = searchParams.get("sort") || "Most Relevant";
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const skip = (page - 1) * limit;

        let whereClause: Prisma.FreelancerProfileWhereInput = {};
        const tempFilters: Prisma.FreelancerProfileWhereInput[] = [];

        if (query) {
            tempFilters.push({
                OR: [
                    { title: { contains: query } },
                    { bio: { contains: query } },
                    { skills: { contains: query } },
                    { user: { name: { contains: query } } }
                ]
            });
        }

        if (skills) {
            tempFilters.push({ skills: { contains: skills } });
        }

        if (categories && categories.length > 0) {
            tempFilters.push({
                OR: categories.map(cat => ({
                    OR: [
                        { title: { contains: cat } },
                        { skills: { contains: cat } }
                    ]
                }))
            });
        }

        // trustScore mapped back from IQ (trustScore = (iq / 1.5))
        if (minScoreStr) {
            const minScore = parseFloat(minScoreStr) / 1.5;
            tempFilters.push({ trustScore: { gte: Math.round(minScore) } });
        }

        // Technically IQ max is 140+ but we can filter max if passed
        if (maxScoreStr) {
            const maxScore = parseFloat(maxScoreStr) / 1.5;
            tempFilters.push({ trustScore: { lte: Math.round(maxScore) } });
        }

        if (verified === 'true') {
            tempFilters.push({ isVerified: true });
        }

        if (minSalaryStr || maxSalaryStr) {
            const minSalary = minSalaryStr ? parseFloat(minSalaryStr) : 0;
            const maxSalary = maxSalaryStr ? parseFloat(maxSalaryStr) : 999999;
            tempFilters.push({
                expectedSalary: {
                    gte: minSalary,
                    lte: maxSalary
                }
            });
        }

        if (tempFilters.length > 0) {
            whereClause = { AND: tempFilters };
        }

        let orderByClause: Prisma.FreelancerProfileOrderByWithRelationInput = { trustScore: 'desc' };
        if (sort === 'Newest') {
            // we order by internal mapping if needed, let's use user creation date
            orderByClause = { user: { createdAt: 'desc' } };
        } else if (sort === 'Highest Rated') {
            orderByClause = { trustScore: 'desc' };
        } // "Most Relevant" default is trustScore for now

        const [freelancers, totalCount] = await Promise.all([
            prisma.freelancerProfile.findMany({
                where: whereClause,
                include: {
                    user: {
                        select: {
                            name: true,
                            email: true,
                            image: true,
                            createdAt: true
                        }
                    }
                },
                orderBy: orderByClause,
                skip,
                take: limit,
            }),
            prisma.freelancerProfile.count({ where: whereClause })
        ]);

        return NextResponse.json({
            freelancers,
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page
        });
    } catch (error) {
        console.error("FREELANCERS_GET_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
