"use client";

import {
    CheckCircle, FileText, ArrowRight, Building2, Briefcase,
    Users, MessageSquare, BarChart3, Clock, TrendingUp
} from "lucide-react";
import Link from "next/link";

interface EmployerViewProps {
    user: any;
    stats: any;
}

export default function EmployerView({ user, stats }: EmployerViewProps) {
    return (
        <div className="space-y-8">
            {/* Live Recruitment Status */}
            <div className="hidden">
                {/* Replaced by main Welcome Header in dashboard/page.tsx */}
            </div>

            {/* Stats Grid - Matching Admin Style */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                {[
                    {
                        label: "Active Jobs", value: stats.recentJobs?.length || 0, sub: "Live postings",
                        icon: <Briefcase size={20} />, iconBg: "bg-blue-50 text-blue-600",
                        href: "/manage/jobs"
                    },
                    {
                        label: "Total Applicants", value: stats.recentApplications?.length || 0, sub: "Across all posts",
                        icon: <Users size={20} />, iconBg: "bg-indigo-50 text-indigo-600",
                        href: "/dashboard/applicants"
                    },
                    {
                        label: "Profile Strength", value: `${stats.profileCompleteness}%`, sub: "Company branding",
                        icon: <TrendingUp size={20} />, iconBg: "bg-emerald-50 text-emerald-600",
                        badge: stats.profileCompleteness < 100 ? { label: "Action", color: "bg-amber-50 text-amber-700 border-amber-200" } : null,
                        href: "/manage/profile"
                    },
                    {
                        label: "Unread Messages", value: stats.recentMessages?.filter((m: any) => !m.isRead).length || 0, sub: "Direct responses",
                        icon: <MessageSquare size={20} />, iconBg: "bg-rose-50 text-rose-600",
                        href: "/messages"
                    },
                ].map((stat, idx) => (
                    <Link
                        key={idx}
                        href={stat.href}
                        className="bg-white/80 backdrop-blur-sm rounded-[10px] border border-gray-100/60 shadow-sm shadow-blue-50/30 p-8 group hover:shadow-xl hover:shadow-blue-50/80 hover:-translate-y-1 transition-all duration-500 cursor-pointer block relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-gray-50 to-transparent rounded-full blur-2xl group-hover:bg-blue-50 transition-colors pointer-events-none" />
                        <div className="flex justify-between items-start mb-6 relative z-10">
                            <div className={`w-12 h-12 rounded-[10px] flex items-center justify-center shadow-sm ${stat.iconBg}`}>
                                {stat.icon}
                            </div>
                            {stat.badge && (
                                <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border shadow-sm ${stat.badge.color}`}>
                                    {stat.badge.label}
                                </span>
                            )}
                        </div>
                        <p className="text-4xl font-black text-gray-900 mb-2 tabular-nums tracking-tight relative z-10">{stat.value}</p>
                        <p className="text-xs font-black text-gray-800 uppercase tracking-widest mb-1 relative z-10">{stat.label}</p>
                        <p className="text-xs text-gray-400 font-medium relative z-10">{stat.sub}</p>
                    </Link>
                ))}
            </div>

            {/* Main 2-Col Layout - Matching Admin style */}
            <div className="grid lg:grid-cols-5 gap-6">

                {/* Main Content Areas — 3 cols */}
                <div className="lg:col-span-3 space-y-6">

                    {/* Recent Applicants */}
                    <div className="bg-white rounded-[10px] border border-gray-100 shadow-sm p-8">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                            <div>
                                <h3 className="text-lg font-black text-gray-900 tracking-tight">Recent Applicants</h3>
                                <p className="text-sm text-gray-400 font-medium mt-0.5">Newest candidates exploring your roles</p>
                            </div>
                            <Link href="/dashboard/applicants" className="flex items-center gap-2 px-5 py-2.5 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 rounded-[10px] transition-colors text-xs font-black text-gray-600 uppercase tracking-widest group">
                                View Queue <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                            </Link>
                        </div>

                        <div className="space-y-2">
                            {stats.recentApplications.length === 0 ? (
                                <div className="text-center py-12 bg-gray-25/50 rounded-[10px] border border-dashed border-gray-100">
                                    <Users size={24} className="mx-auto text-gray-300 mb-3" />
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">No applicants yet</p>
                                </div>
                            ) : stats.recentApplications.map((app: any) => (
                                <div key={app.id} className="flex items-center justify-between p-3.5 rounded-[10px] hover:bg-gray-50 transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-[10px] bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-sm overflow-hidden flex-shrink-0">
                                            {app.freelancerProfile?.user?.image || app.freelancerProfile?.avatarUrl ? (
                                                <img
                                                    src={app.freelancerProfile?.avatarUrl || app.freelancerProfile?.user?.image}
                                                    alt={app.freelancerProfile?.user?.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <span>{app.freelancerProfile?.user?.name?.[0] ?? "?"}</span>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 text-sm group-hover:text-blue-600 transition-colors">{app.freelancerProfile.user.name}</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                                Applying for: {app.jobTitle}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <p className="text-[10px] text-gray-400 font-bold hidden sm:block">
                                            {new Date(app.createdAt).toLocaleDateString()}
                                        </p>
                                        <span className={`px-2 py-0.5 text-[9px] font-black uppercase rounded-full border ${app.status === 'HIRED' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                            app.status === 'REJECTED' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                                                'bg-blue-50 text-blue-700 border-blue-100'
                                            }`}>
                                            {app.status || 'NEW'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Job Posts Grid - Admin style cards */}
                    <div className="bg-white rounded-[10px] border border-gray-100 shadow-sm p-8">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                            <div>
                                <h3 className="text-lg font-black text-gray-900 tracking-tight">Your Active Listings</h3>
                                <p className="text-sm text-gray-400 font-medium mt-0.5">Currently live on the platform</p>
                            </div>
                            <Link href="/manage/jobs/new" className="flex items-center gap-2 px-5 py-2.5 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 rounded-[10px] transition-colors text-xs font-black text-gray-600 uppercase tracking-widest group">
                                New Post <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {stats.recentJobs?.slice(0, 4).map((job: any) => (
                                <Link href={`/jobs/${job.id}`} key={job.id} className="p-4 rounded-[10px] border border-gray-100 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-50/50 transition-all group relative overflow-hidden">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="w-8 h-8 rounded-[10px] bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                            <Briefcase size={16} />
                                        </div>
                                        <span className={`text-[9px] font-black uppercase tracking-widest ${job.isPublished ? "text-emerald-500" : "text-gray-400"}`}>
                                            {job.isPublished ? "Live" : "Draft"}
                                        </span>
                                    </div>
                                    <p className="text-sm font-black text-gray-900 truncate mb-1 group-hover:text-blue-600 transition-colors">{job.title}</p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{job._count.applications} Applications</p>
                                </Link>
                            ))}
                            {(!stats.recentJobs || stats.recentJobs.length === 0) && (
                                <div className="sm:col-span-2 py-8 text-center bg-gray-50/50 rounded-[10px] border border-dashed border-gray-100">
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">No jobs posted yet</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar Cards — 2 cols */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Platform Context / Profile Strength */}
                    <div className="bg-white rounded-[10px] border border-gray-100 shadow-sm p-8">
                        <h3 className="text-lg font-black text-gray-900 tracking-tight mb-1">Company Profile</h3>
                        <p className="text-sm text-gray-400 font-medium mb-8 mt-0.5">Build trust with top talent</p>

                        <div className="space-y-4 mb-6">
                            <div className="p-4 bg-gray-50 border border-gray-100 rounded-[10px]">
                                <div className="flex justify-between items-center mb-2">
                                    <p className="text-xs font-bold text-gray-700">Profile Completeness</p>
                                    <span className="text-sm font-black text-blue-600">{stats.profileCompleteness}%</span>
                                </div>
                                <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-600 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.4)] transition-all duration-1000" style={{ width: `${stats.profileCompleteness}%` }} />
                                </div>
                            </div>

                            <p className="text-sm text-gray-500 font-medium leading-relaxed italic border-l-2 border-blue-500 pl-4">
                                "Companies with complete profiles receive 3.5x more high-quality applications on average."
                            </p>
                        </div>

                        <div className="space-y-1">
                            {[
                                { label: "Company Logo", completed: !!stats.hasLogo },
                                { label: "Website URL", completed: !!stats.hasWebsite },
                                { label: "Company Mission", completed: !!stats.hasDescription },
                                { label: "Business Address", completed: !!stats.hasAddress },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                                    <div className="flex items-center gap-2 text-xs font-bold text-gray-600">
                                        {item.completed ? <CheckCircle size={14} className="text-emerald-500" /> : <Clock size={14} className="text-gray-300" />}
                                        {item.label}
                                    </div>
                                    <span className={`text-[9px] font-black uppercase tracking-wider ${item.completed ? "text-emerald-500" : "text-gray-400"}`}>
                                        {item.completed ? "Done" : "Pending"}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <Link
                            href="/manage/profile"
                            className="flex items-center justify-center gap-2 w-full py-4 mt-6 bg-blue-600 hover:bg-blue-700 rounded-[10px] shadow-xl shadow-blue-100 transition-all hover:-translate-y-0.5 group"
                        >
                            <span className="!text-white font-black text-xs uppercase tracking-[0.2em]">Refine Profile</span>
                            <ArrowRight size={16} className="!text-white group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    {/* Recruitment Tip - Priority style */}
                    <div className="bg-gradient-to-br from-gray-900 to-indigo-900 rounded-[10px] p-8 text-white shadow-xl shadow-gray-200 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
                        <h4 className="text-[10px] font-black text-blue-300 uppercase tracking-[0.2em] mb-4">Recruitment Insight</h4>
                        <p className="text-sm font-bold leading-relaxed mb-8 text-gray-200">
                            Verified companies attract top talent and increase their trust scores by up to <span className="text-white">60%</span>.
                        </p>
                        <Link href="/dashboard/verify" className="inline-flex w-full items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 py-3.5 rounded-[10px] transition-all shadow-lg group/btn">
                            <span className="!text-white font-black text-xs uppercase tracking-widest">Get Verified</span>
                            <CheckCircle size={14} className="!text-white group-hover/btn:scale-110 transition-transform" />
                        </Link>
                    </div>

                </div>
            </div>
        </div>
    );
}
