import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { BarChart3, TrendingUp, Users, Briefcase } from "lucide-react";

async function getAnalyticsData() {
    // Get last 7 days metrics
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const last7Days = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        return d;
    }).reverse();

    const usersData = await Promise.all(last7Days.map(async (date) => {
        const start = new Date(date);
        start.setHours(0, 0, 0, 0);
        const count = await prisma.user.count({
            where: {
                createdAt: {
                    gte: start,
                    lte: date
                }
            }
        });
        return {
            label: start.toLocaleDateString('en-US', { weekday: 'short' }),
            count
        };
    }));

    const jobsData = await Promise.all(last7Days.map(async (date) => {
        const start = new Date(date);
        start.setHours(0, 0, 0, 0);
        const count = await prisma.jobPost.count({
            where: {
                createdAt: {
                    gte: start,
                    lte: date
                }
            }
        });
        return {
            label: start.toLocaleDateString('en-US', { weekday: 'short' }),
            count
        };
    }));

    const maxUsers = Math.max(...usersData.map(d => d.count), 1);
    const maxJobs = Math.max(...jobsData.map(d => d.count), 1);

    return {
        usersData,
        jobsData,
        maxUsers,
        maxJobs,
        totalUsers: await prisma.user.count(),
        totalJobs: await prisma.jobPost.count()
    };
}

export default async function AdminAnalyticsPage() {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "ADMIN") {
        redirect("/dashboard");
    }

    const { usersData, jobsData, maxUsers, maxJobs, totalUsers, totalJobs } = await getAnalyticsData();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-black text-gray-900 mb-1">Platform Analytics</h1>
                <p className="text-sm text-gray-500 font-medium">Detailed metrics and growth trends over the last 7 days.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* User Growth Chart */}
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1">New User Registrations</p>
                            <h3 className="text-3xl font-black text-gray-900">{usersData.reduce((acc, curr) => acc + curr.count, 0)} <span className="text-sm font-bold text-emerald-500 ml-2">in last 7d</span></h3>
                        </div>
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
                            <Users size={24} />
                        </div>
                    </div>

                    <div className="flex-1 flex items-end gap-2 sm:gap-4 h-48 mt-auto">
                        {usersData.map((day, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-3">
                                <div className="w-full relative bg-gray-50 rounded-t-xl overflow-hidden flex flex-col justify-end" style={{ height: '100%' }}>
                                    <div
                                        className="w-full bg-blue-500 rounded-t-xl transition-all duration-1000 origin-bottom"
                                        style={{ height: `${(day.count / maxUsers) * 100}%` }}
                                    ></div>
                                </div>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{day.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Job Post Growth Chart */}
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1">New Job Postings</p>
                            <h3 className="text-3xl font-black text-gray-900">{jobsData.reduce((acc, curr) => acc + curr.count, 0)} <span className="text-sm font-bold text-emerald-500 ml-2">in last 7d</span></h3>
                        </div>
                        <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shrink-0">
                            <Briefcase size={24} />
                        </div>
                    </div>

                    <div className="flex-1 flex items-end gap-2 sm:gap-4 h-48 mt-auto">
                        {jobsData.map((day, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-3">
                                <div className="w-full relative bg-gray-50 rounded-t-xl overflow-hidden flex flex-col justify-end" style={{ height: '100%' }}>
                                    <div
                                        className="w-full bg-amber-500 rounded-t-xl transition-all duration-1000 origin-bottom"
                                        style={{ height: `${(day.count / maxJobs) * 100}%` }}
                                    ></div>
                                </div>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{day.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            <div className="bg-blue-600 p-8 rounded-3xl text-white shadow-xl shadow-blue-200 mt-6 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div>
                    <h3 className="text-xl font-black mb-1">Platform At A Glance</h3>
                    <p className="text-blue-100 font-medium text-sm">Totals since the platform was launched.</p>
                </div>
                <div className="flex gap-8">
                    <div className="text-right">
                        <p className="text-blue-200 text-xs font-black uppercase tracking-widest mb-1">Users</p>
                        <p className="text-3xl font-black">{totalUsers}</p>
                    </div>
                    <div className="w-px bg-blue-500"></div>
                    <div className="text-right">
                        <p className="text-blue-200 text-xs font-black uppercase tracking-widest mb-1">Jobs</p>
                        <p className="text-3xl font-black">{totalJobs}</p>
                    </div>
                </div>
            </div>

        </div>
    );
}
