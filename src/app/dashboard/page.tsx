import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { User } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import FreelancerView from "@/components/dashboard/freelancer-view";
import EmployerView from "@/components/dashboard/employer-view";

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    const user = session.user as any;

    if (user.role === "ADMIN") {
        redirect("/admin");
    }

    // Fetch stats and profile info
    let stats = {
        totalApplications: 0,
        unreadMessages: 0,
        profileViews: 124,
        interviewInvites: 2,
        profileCompleteness: 85,
        profileId: "",
        verificationStatus: "NOT_SUBMITTED",
        isVerified: false,
        trustScore: 0,
        recentApplications: [] as any[],
        recentMessages: [] as any[],
        recentReviews: [] as any[],
        recommendedJobs: [] as any[],
        hasPortfolio: false,
        hasSkills: false,
        totalJobsPosted: 0,
        activeJobs: 0,
        recentJobs: [] as any[],
        hasLogo: false,
        hasWebsite: false,
        hasDescription: false,
        hasAddress: false
    };

    if (user.role === "FREELANCER") {
        const profile = await prisma.freelancerProfile.findUnique({
            where: { userId: user.id },
        });

        if (profile) {
            const apps = await prisma.application.findMany({
                where: { freelancerProfileId: profile.id },
                include: {
                    job: { include: { employer: true } }
                },
                orderBy: { createdAt: "desc" },
                take: 5
            });

            const total = await prisma.application.count({ where: { freelancerProfileId: profile.id } });

            // Fetch dynamic messages
            const messages = await prisma.message.findMany({
                where: {
                    conversation: {
                        OR: [{ initiatorId: user.id }, { receiverId: user.id }]
                    }
                },
                include: {
                    sender: { select: { name: true, role: true, image: true } },
                    conversation: {
                        include: {
                            initiator: { select: { name: true, role: true, image: true } },
                            receiver: { select: { name: true, role: true, image: true } }
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                take: 3
            });

            // Basic recommendations based on skills
            const userSkills = profile.skills ? JSON.parse(profile.skills) : [];
            const recommendations = await prisma.jobPost.findMany({
                where: {
                    status: "APPROVED",
                    OR: userSkills.length > 0 ? [
                        { title: { contains: userSkills[0] } },
                        { requirements: { contains: userSkills[0] } }
                    ] : undefined
                },
                include: { employer: true },
                take: 2,
                orderBy: { createdAt: 'desc' }
            });

            // Calculate completeness
            const p = profile as any;
            const fields = [p.title, p.bio, p.skills, p.phone, p.location, p.portfolioUrl, p.experience, p.education, p.resumeUrl];
            const filledFields = fields.filter(f => f && f !== "[]").length;
            const completeness = Math.round((filledFields / fields.length) * 100);

            // Fetch reviews
            const reviews = await prisma.review.findMany({
                where: { freelancerProfileId: profile.id },
                include: {
                    employer: {
                        select: { companyName: true, companyLogo: true }
                    }
                },
                orderBy: { createdAt: "desc" },
                take: 3
            });

            stats = {
                ...stats,
                totalApplications: total,
                profileCompleteness: completeness || 85,
                profileId: profile.id,
                verificationStatus: (profile as any).verificationStatus || "NOT_SUBMITTED",
                isVerified: profile.isVerified,
                trustScore: profile.trustScore || 0,
                recentApplications: apps,
                recentMessages: messages,
                recommendedJobs: recommendations,
                recentReviews: reviews,
                hasPortfolio: !!profile.portfolioUrl,
                hasSkills: profile.skills ? JSON.parse(profile.skills).length > 0 : false
            };
        }
    } else if (user.role === "EMPLOYER") {
        const profile = await prisma.employerProfile.findUnique({
            where: { userId: user.id },
            include: {
                jobs: {
                    include: {
                        _count: {
                            select: { applications: true }
                        },
                        applications: {
                            include: {
                                freelancerProfile: {
                                    select: {
                                        avatarUrl: true,
                                        user: { select: { name: true, image: true } }
                                    }
                                }
                            },
                            orderBy: { createdAt: 'desc' },
                            take: 5
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (profile) {
            const totalJobs = profile.jobs.length;
            const totalApplicants = profile.jobs.reduce((acc, job) => acc + job._count.applications, 0);

            // Flatten recent applications from all jobs
            const recentApps = profile.jobs
                .flatMap(job => job.applications.map(app => ({ ...app, jobTitle: job.title })))
                .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                .slice(0, 5);

            // Calculate completeness for employer
            const fields = [profile.companyName, profile.companyWebsite, profile.companyLogo, profile.description, profile.companyAddress];
            const filledFields = fields.filter(f => f).length;
            const completeness = Math.round((filledFields / fields.length) * 100);

            stats = {
                ...stats,
                totalApplications: totalApplicants,
                totalJobsPosted: totalJobs,
                activeJobs: profile.jobs.filter(j => j.status === "APPROVED").length,
                profileId: profile.id,
                isVerified: true,
                verificationStatus: "APPROVED",
                recentApplications: recentApps,
                recentJobs: profile.jobs.slice(0, 5),
                profileCompleteness: completeness || 85,
                hasLogo: !!profile.companyLogo,
                hasWebsite: !!profile.companyWebsite,
                hasDescription: !!profile.description,
                hasAddress: !!profile.companyAddress
            };
        }
    }

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Premium Welcome Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-white p-8 rounded-[10px] border border-gray-100 shadow-sm shadow-blue-50/50 mb-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">Session Active</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        Welcome back, {user.name.split(' ')[0]} 👋
                    </h1>
                    <p className="text-gray-500 font-medium text-sm mt-2 max-w-xl leading-relaxed">
                        {user.role === "EMPLOYER"
                            ? "Manage your company's presence, track active listings, and discover top-tier talent tailored to your needs."
                            : "Your career command center. Track applications, respond to messages, and explore new opportunities."}
                    </p>
                </div>
                <Link
                    href={user.role === "EMPLOYER" ? "/manage/profile" : "/profile/edit"}
                    className="group bg-blue-600 flex items-center gap-3 px-8 py-4 rounded-[10px] shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all hover:-translate-y-0.5 shrink-0"
                >
                    <User size={18} className="text-white group-hover:scale-110 transition-transform" />
                    <span className="font-black text-xs uppercase tracking-widest !text-white">Update Profile</span>
                </Link>
            </div>

            {user.role === "EMPLOYER" ? (
                <EmployerView user={user} stats={stats} />
            ) : (
                <FreelancerView user={user} stats={stats} />
            )}
        </div>
    );
}

