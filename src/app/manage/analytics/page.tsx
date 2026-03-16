"use client";

import { useEffect, useState } from "react";
import {
    Users,
    Briefcase,
    FileText,
    Award,
    TrendingUp,
    Activity
} from "lucide-react";

interface AnalyticsData {
    totalUsers: number;
    totalJobs: number;
    totalApplications: number;
    totalPremiumEmployers: number;
    applicationsByDate: { date: string; count: number }[];
}

export default function AdminAnalyticsPage() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch("/api/admin/analytics");
                if (res.ok) {
                    setData(await res.json());
                }
            } catch (error) {
                console.error("Failed to load analytics");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    if (isLoading) {
        return <div className="text-gray-500 animate-pulse font-medium">Loading platform metrics...</div>;
    }

    if (!data) return null;

    const stats = [
        { label: "Total Users", value: data.totalUsers, icon: <Users size={24} />, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
        { label: "Active Jobs", value: data.totalJobs, badge: "Live", icon: <Briefcase size={24} />, color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-100" },
        { label: "Total Applications", value: data.totalApplications, icon: <FileText size={24} />, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
        { label: "Premium Employers", value: data.totalPremiumEmployers, badge: "Revenue", icon: <Award size={24} />, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
    ];

    return (
        <div className="space-y-10">
            <div>
                <h1 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Platform Analytics</h1>
                <p className="text-gray-500 font-medium">Overview of all major marketplace metrics.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, idx) => (
                    <div key={idx} className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm relative overflow-hidden group">
                        <div className={`w-14 h-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center border ${stat.border} mb-6 group-hover:scale-110 transition-transform`}>
                            {stat.icon}
                        </div>
                        <p className="text-gray-500 font-bold mb-1">{stat.label}</p>
                        <h3 className="text-4xl font-black text-gray-900">{stat.value.toLocaleString()}</h3>

                        {stat.badge && (
                            <span className="absolute top-8 right-8 text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                                {stat.badge}
                            </span>
                        )}

                        <div className={`absolute -bottom-6 -right-6 w-32 h-32 rounded-full ${stat.bg} opacity-20 group-hover:scale-150 transition-transform duration-500 pointer-events-none`} />
                    </div>
                ))}
            </div>

            {/* Basic Chart Area */}
            <div className="bg-white rounded-[2rem] p-8 md:p-10 border border-gray-100 shadow-sm relative overflow-hidden">
                <div className="flex items-center gap-4 mb-10">
                    <div className="w-1.5 h-8 bg-blue-600 rounded-full" />
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Application Velocity</h2>
                        <p className="text-gray-400 font-bold text-sm">Applications submitted over the last 7 days</p>
                    </div>
                </div>

                <div className="h-64 flex items-end gap-2 md:gap-4 relative pt-10">
                    {/* Y-axis rough labels */}
                    <div className="absolute left-0 top-0 bottom-8 border-r border-gray-100 pr-4 flex flex-col justify-between text-xs font-bold text-gray-300 items-end hidden sm:flex">
                        <span>Max</span>
                        <span>Mid</span>
                        <span>0</span>
                    </div>

                    <div className="flex-1 flex items-end justify-between h-full pl-0 sm:pl-12">
                        {data.applicationsByDate.map((day, idx) => {
                            const maxCount = Math.max(...data.applicationsByDate.map(d => d.count), 1);
                            const heightPercentage = (day.count / maxCount) * 100;

                            return (
                                <div key={idx} className="flex flex-col items-center flex-1 group">
                                    <div className="w-full relative flex items-end justify-center h-full pb-2">
                                        <div
                                            className="w-full max-w-[40px] bg-blue-100 group-hover:bg-blue-600 transition-all rounded-t-xl relative border-b border-blue-600/20"
                                            style={{ height: `${Math.max(heightPercentage, 2)}%` }} // Minimum height of 2% for visibility
                                        >
                                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-xl pointer-events-none whitespace-nowrap">
                                                {day.count} applications
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold text-gray-400 mt-2 rotate-45 md:rotate-0 origin-left mt-4 text-center">{day.date}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
