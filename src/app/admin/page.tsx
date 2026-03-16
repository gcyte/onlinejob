import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
    Users, Briefcase, ShieldAlert, BarChart3, Clock, ArrowRight, Shield, CheckCircle
} from "lucide-react";
import Link from "next/link";

async function getDashboardData() {
    const results = await Promise.all([
        prisma.user.count(),
        prisma.jobPost.count(),
        prisma.application.count(),
        prisma.jobPost.count({ where: { status: "PENDING" } }),
        prisma.freelancerProfile.count({ where: { verificationStatus: "PENDING" } }),
        prisma.employerProfile.count({ where: { verificationStatus: "PENDING" } } as any),
        prisma.freelancerProfile.count({ where: { isVerified: true } }),
        prisma.employerProfile.count({ where: { isVerified: true } } as any),
        prisma.user.count({ where: { role: "EMPLOYER" } }),
        prisma.user.count({ where: { isBanned: true } }),
        prisma.user.findMany({
            orderBy: { createdAt: "desc" },
            take: 5,
            select: { id: true, name: true, email: true, role: true, createdAt: true }
        }),
        prisma.jobPost.findMany({
            orderBy: { createdAt: "desc" },
            take: 5,
            include: { employer: true }
        }),
    ]);

    const [
        userCount, jobCount, applicationCount, pendingJobs,
        pendingFreelancers, pendingEmployersCount, verifiedWorkers, verifiedEmployers,
        activeEmployers, bannedUsers, recentUsers, recentJobs
    ] = results;

    const pendingVerifications = pendingFreelancers + pendingEmployersCount;

    return {
        userCount, jobCount, applicationCount, pendingJobs, pendingVerifications,
        verifiedWorkers, verifiedEmployers, activeEmployers, bannedUsers,
        recentUsers, recentJobs,
    };
}

export default async function AdminDashboard() {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "ADMIN") {
        redirect("/dashboard");
    }

    const data = await getDashboardData();

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Live System Status</span>
                </div>
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">Platform Overview</h1>
                <p className="text-sm text-gray-500 font-medium mt-1">
                    {new Date().toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                {[
                    {
                        label: "Total Users", value: data.userCount, sub: "Registered accounts",
                        icon: <Users size={20} />, iconBg: "bg-blue-50 text-blue-600",
                        badge: null, href: "/admin/users"
                    },
                    {
                        label: "Active Jobs", value: data.jobCount, sub: "Live job postings",
                        icon: <Briefcase size={20} />, iconBg: "bg-indigo-50 text-indigo-600",
                        badge: null, href: "/admin/jobs"
                    },
                    {
                        label: "Pending ID Checks", value: data.pendingVerifications, sub: "Awaiting review",
                        icon: <Shield size={20} />, iconBg: "bg-amber-50 text-amber-600",
                        badge: data.pendingVerifications > 0
                            ? { label: "Action", color: "bg-amber-50 text-amber-700 border-amber-200" }
                            : { label: "Clear", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
                        href: "/admin/verification"
                    },
                    {
                        label: "Pending Moderation", value: data.pendingJobs, sub: "Unreviewed posts",
                        icon: <Clock size={20} />, iconBg: "bg-rose-50 text-rose-600",
                        badge: data.pendingJobs > 0
                            ? { label: "Priority", color: "bg-rose-50 text-rose-700 border-rose-200" }
                            : { label: "Clear", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
                        href: "/admin/jobs"
                    },
                ].map((stat, idx) => (
                    <Link
                        key={idx}
                        href={stat.href}
                        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 group hover:shadow-lg hover:shadow-blue-50/60 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer block"
                    >
                        <div className="flex justify-between items-start mb-5">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.iconBg}`}>
                                {stat.icon}
                            </div>
                            {stat.badge && (
                                <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${stat.badge.color}`}>
                                    {stat.badge.label}
                                </span>
                            )}
                        </div>
                        <p className="text-3xl font-black text-gray-900 mb-0.5 tabular-nums">{stat.value}</p>
                        <p className="text-xs font-black text-gray-800 uppercase tracking-wider mb-0.5">{stat.label}</p>
                        <p className="text-xs text-gray-400 font-medium">{stat.sub}</p>
                    </Link>
                ))}
            </div>

            {/* Main 2-Col Layout */}
            <div className="grid lg:grid-cols-5 gap-6">

                {/* Activity Feed — 3 cols */}
                <div className="lg:col-span-3 space-y-6">

                    {/* Recent Users */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-base font-black text-gray-900">Recent Registrations</h3>
                                <p className="text-xs text-gray-400 font-medium">Newest platform members</p>
                            </div>
                            <Link href="/admin/users" className="flex items-center gap-1 text-xs font-black text-blue-600 hover:text-blue-700 uppercase tracking-widest">
                                All users <ArrowRight size={11} />
                            </Link>
                        </div>

                        <div className="space-y-2">
                            {data.recentUsers.length === 0 ? (
                                <div className="text-center py-8 text-gray-400 text-sm">No users yet.</div>
                            ) : data.recentUsers.map((user) => (
                                <div key={user.id} className="flex items-center justify-between p-3.5 rounded-xl hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-xs shadow">
                                            {user.name?.[0]?.toUpperCase() || "U"}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 text-sm">{user.name}</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                                {user.role} · {user.email}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-gray-400 font-bold">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Jobs */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-base font-black text-gray-900">Latest Job Posts</h3>
                                <p className="text-xs text-gray-400 font-medium">Most recently published listings</p>
                            </div>
                            <Link href="/admin/jobs" className="flex items-center gap-1 text-xs font-black text-blue-600 hover:text-blue-700 uppercase tracking-widest">
                                Moderate <ArrowRight size={11} />
                            </Link>
                        </div>

                        <div className="space-y-2">
                            {data.recentJobs.length === 0 ? (
                                <div className="text-center py-8 text-gray-400 text-sm">No job posts yet.</div>
                            ) : data.recentJobs.map((job) => (
                                <div key={job.id} className="flex items-center justify-between p-3.5 rounded-xl hover:bg-gray-50 transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                            <Briefcase size={16} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 text-sm truncate max-w-[180px]">{job.title}</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                                {job.employer?.companyName || "Unknown"} · {new Date(job.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {!job.isModerated ? (
                                            <span className="px-2 py-0.5 bg-amber-50 border border-amber-100 text-amber-700 text-[9px] font-black uppercase rounded-full">
                                                Pending
                                            </span>
                                        ) : (
                                            <CheckCircle size={15} className="text-emerald-500" />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar — 2 cols */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Priority Queue */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <h3 className="text-base font-black text-gray-900 mb-1">Priority Queue</h3>
                        <p className="text-xs text-gray-400 font-medium mb-6">Items needing your attention</p>

                        <div className="space-y-3 mb-6">
                            <Link href="/admin/verification" className="block w-full p-4 bg-gray-50 border border-gray-100 rounded-xl hover:border-blue-200 hover:bg-blue-50 transition-all group">
                                <div className="flex justify-between items-center mb-2">
                                    <div className="flex items-center gap-2">
                                        <Shield size={14} className="text-blue-600" />
                                        <p className="text-xs font-bold text-gray-700 group-hover:text-blue-700">Identity Checks</p>
                                    </div>
                                    <span className="text-sm font-black text-blue-600">{data.pendingVerifications}</span>
                                </div>
                                <div className="w-full bg-gray-200 h-1 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(100, data.pendingVerifications * 20)}%` }} />
                                </div>
                            </Link>

                            <Link href="/admin/jobs" className="block w-full p-4 bg-gray-50 border border-gray-100 rounded-xl hover:border-amber-200 hover:bg-amber-50 transition-all group">
                                <div className="flex justify-between items-center mb-2">
                                    <div className="flex items-center gap-2">
                                        <ShieldAlert size={14} className="text-amber-600" />
                                        <p className="text-xs font-bold text-gray-700 group-hover:text-amber-700">Content Moderation</p>
                                    </div>
                                    <span className="text-sm font-black text-amber-600">{data.pendingJobs}</span>
                                </div>
                                <div className="w-full bg-gray-200 h-1 rounded-full overflow-hidden">
                                    <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.min(100, data.pendingJobs * 20)}%` }} />
                                </div>
                            </Link>
                        </div>

                        <Link
                            href="/admin/verification"
                            className="block w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-[0.15em] rounded-xl shadow-md shadow-blue-100 transition-all text-center"
                        >
                            Open Review Queue
                        </Link>
                    </div>

                    {/* Platform Summary */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <h3 className="text-base font-black text-gray-900 mb-5">Platform Summary</h3>
                        <div className="space-y-4">
                            {[
                                { label: "Total Applications", value: data.applicationCount, icon: <BarChart3 size={14} className="text-blue-500" /> },
                                { label: "Verified Workers", value: data.verifiedWorkers, icon: <Shield size={14} className="text-emerald-500" /> },
                                { label: "Verified Employers", value: data.verifiedEmployers, icon: <Shield size={14} className="text-blue-500" /> },
                                { label: "Total Employers", value: data.activeEmployers, icon: <Users size={14} className="text-indigo-500" /> },
                                { label: "Banned Accounts", value: data.bannedUsers, icon: <ShieldAlert size={14} className="text-red-400" /> },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-600">
                                        {item.icon} {item.label}
                                    </div>
                                    <span className="text-sm font-black text-gray-900 tabular-nums">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
