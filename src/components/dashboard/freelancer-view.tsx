import {
    CheckCircle, FileText, ArrowRight, ExternalLink,
    Briefcase, Clock, TrendingUp, MessageSquare, Search, Star
} from "lucide-react";
import Link from "next/link";
import PublicProfileCard from "./public-profile-card";

interface FreelancerViewProps {
    user: any;
    stats: any;
}

export default function FreelancerView({ user, stats }: FreelancerViewProps) {
    return (
        <div className="space-y-8">
            {/* Live Status Indicator */}
            <div className="hidden">
                {/* Replaced by main Welcome Header in dashboard/page.tsx */}
            </div>

            {/* Stats Grid - Matching Admin/Employer Style */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                {[
                    {
                        label: "Applications", value: stats.totalApplications, sub: "Total submitted",
                        icon: <FileText size={20} />, iconBg: "bg-blue-50 text-blue-600",
                        href: "/dashboard/applications"
                    },
                    {
                        label: "Profile Views", value: stats.profileViews, sub: "Last 30 days",
                        icon: <Search size={20} />, iconBg: "bg-indigo-50 text-indigo-600",
                        href: "/profile"
                    },
                    {
                        label: "Trust Score", value: `${stats.trustScore || 0}%`, sub: "Reliability rating",
                        icon: <Star size={20} />, iconBg: "bg-amber-50 text-amber-600",
                        badge: stats.trustScore > 90 ? { label: "Elite", color: "bg-emerald-50 text-emerald-700 border-emerald-200" } : null,
                        href: "/profile"
                    },
                    {
                        label: "Direct Inquiries", value: stats.unreadMessages || 0, sub: "Employer messages",
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
                                <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-[10px] border shadow-sm ${stat.badge.color}`}>
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

            {/* Main 2-Col Layout */}
            <div className="grid lg:grid-cols-5 gap-6">

                {/* Main Content — 3 cols */}
                <div className="lg:col-span-3 space-y-6">

                    {/* Active Applications */}
                    <div className="bg-white rounded-[10px] border border-gray-100 shadow-sm p-8">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                            <div>
                                <h3 className="text-lg font-black text-gray-900 tracking-tight">Active Applications</h3>
                                <p className="text-sm text-gray-400 font-medium mt-0.5">Tracking your recent submissions</p>
                            </div>
                            <Link href="/dashboard/applications" className="flex items-center gap-2 px-5 py-2.5 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 rounded-[10px] transition-colors text-xs font-black text-gray-600 uppercase tracking-widest group">
                                Full History <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                            </Link>
                        </div>

                        <div className="space-y-2">
                            {stats.recentApplications.length === 0 ? (
                                <div className="text-center py-12 bg-gray-25/50 rounded-[10px] border border-dashed border-gray-100">
                                    <FileText size={24} className="mx-auto text-gray-300 mb-3" />
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">No applications found</p>
                                </div>
                            ) : stats.recentApplications.map((app: any) => (
                                <div key={app.id} className="flex items-center justify-between p-3.5 rounded-[10px] hover:bg-gray-50 transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-[10px] bg-blue-50 flex items-center justify-center text-blue-600 font-black text-xs overflow-hidden border border-gray-100 shadow-sm">
                                            {app.job.employer.companyLogo ? (
                                                <img src={app.job.employer.companyLogo} alt={app.job.employer.companyName} className="w-full h-full object-contain" />
                                            ) : (
                                                app.job.employer.companyName[0]
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 text-sm group-hover:text-blue-600 transition-colors">{app.job.title}</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                                {app.job.employer.companyName}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={`px-2 py-0.5 text-[9px] font-black uppercase rounded-[10px] border ${app.status === 'HIRED' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                            app.status === 'REJECTED' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                                                'bg-blue-50 text-blue-700 border-blue-100'
                                            }`}>
                                            {app.status || 'PENDING'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recommendations Grid */}
                    <div className="bg-white rounded-[10px] border border-gray-100 shadow-sm p-8">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                            <div>
                                <h3 className="text-lg font-black text-gray-900 tracking-tight">Matches for You</h3>
                                <p className="text-sm text-gray-400 font-medium mt-0.5">Based on your skills and preferences</p>
                            </div>
                            <Link href="/jobs" className="flex items-center gap-2 px-5 py-2.5 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 rounded-[10px] transition-colors text-xs font-black text-gray-600 uppercase tracking-widest group">
                                Explore <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {stats.recommendedJobs.map((job: any) => (
                                <Link href={`/jobs/${job.id}`} key={job.id} className="p-5 rounded-[10px] border border-gray-100 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-50/50 transition-all group block relative">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-10 h-10 rounded-[10px] bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors font-black overflow-hidden border border-gray-100 shadow-sm">
                                            {job.employer?.companyLogo ? (
                                                <img src={job.employer.companyLogo} alt={job.employer.companyName} className="w-full h-full object-contain" />
                                            ) : (
                                                job.employer?.companyName?.[0] || 'J'
                                            )}
                                        </div>
                                        <ExternalLink size={14} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-all" />
                                    </div>
                                    <h4 className="text-sm font-black text-gray-900 group-hover:text-blue-600 truncate mb-1">{job.title}</h4>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-4">{job.employer?.companyName || 'Job Platform'} • {job.location || 'Remote'}</p>
                                    <div className="flex items-center justify-between">
                                        <span className="px-2 py-0.5 bg-gray-50 text-gray-400 rounded-[10px] text-[8px] font-black uppercase tracking-widest">{job.jobType}</span>
                                        <span className="text-[10px] font-black text-blue-600">{job.salaryRange || 'Competitive'}</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Recent Client Feedback */}
                    <div className="bg-white rounded-[10px] border border-gray-100 shadow-sm p-8">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-lg font-black text-gray-900 tracking-tight">Recent Client Feedback</h3>
                                <p className="text-sm text-gray-400 font-medium mt-0.5">What employers are saying about you</p>
                            </div>
                            <div className="w-12 h-12 rounded-[10px] bg-amber-50 text-amber-600 flex items-center justify-center shadow-sm">
                                <Star size={20} />
                            </div>
                        </div>

                        <div className="space-y-4">
                            {stats.recentReviews?.length === 0 ? (
                                <div className="text-center py-12 bg-gray-25/50 rounded-[10px] border border-dashed border-gray-100">
                                    <MessageSquare size={24} className="mx-auto text-gray-300 mb-3" />
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">No reviews yet</p>
                                </div>
                            ) : stats.recentReviews?.map((review: any) => (
                                <div key={review.id} className="p-6 rounded-[10px] bg-gray-50/50 border border-gray-100 hover:border-amber-200 transition-all group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-[10px] bg-white border border-gray-200 flex items-center justify-center overflow-hidden shadow-sm">
                                                {review.employer.companyLogo ? (
                                                    <img src={review.employer.companyLogo} alt={review.employer.companyName} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="font-black text-amber-600">{review.employer.companyName[0]}</span>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-gray-900">{review.employer.companyName}</p>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                                    {new Date(review.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-0.5">
                                            {[...Array(5)].map((_, i) => (
                                                <Star 
                                                    key={i} 
                                                    size={12} 
                                                    className={i < review.score ? "fill-amber-400 text-amber-400" : "text-gray-200"} 
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-600 font-medium leading-relaxed">
                                        "{review.comment}"
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar — 2 cols */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Profile Power Card */}
                    <div className="bg-white rounded-[10px] border border-gray-100 shadow-sm p-8">
                        <h3 className="text-lg font-black text-gray-900 tracking-tight mb-1">Profile Strength</h3>
                        <p className="text-sm text-gray-400 font-medium mb-8 mt-0.5">Complete your profile to stand out</p>

                        <div className="space-y-4 mb-6">
                            <div className="p-4 bg-gray-50 border border-gray-100 rounded-[10px]">
                                <div className="flex justify-between items-center mb-2">
                                    <p className="text-xs font-bold text-gray-700">Rank Progress</p>
                                    <span className="text-sm font-black text-blue-600">{stats.profileCompleteness}%</span>
                                </div>
                                <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-600 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.4)] transition-all duration-1000" style={{ width: `${stats.profileCompleteness}%` }} />
                                </div>
                            </div>

                            <p className="text-sm text-gray-500 font-medium leading-relaxed italic border-l-2 border-emerald-500 pl-4">
                                "Profiles with a verified ID and portfolio are 5x more likely to be shortlisted by top employers."
                            </p>
                        </div>

                        <div className="space-y-1">
                            {[
                                { label: "Verified ID", completed: stats.isVerified },
                                { label: "Add Portfolio", completed: !!stats.hasPortfolio },
                                { label: "Skill Tags", completed: !!stats.hasSkills },
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
                            href="/dashboard/profile"
                            className="flex items-center justify-center gap-2 w-full py-4 mt-6 bg-blue-600 hover:bg-blue-700 rounded-[10px] shadow-xl shadow-blue-100 transition-all hover:-translate-y-0.5 group"
                        >
                            <span className="!text-white font-black text-xs uppercase tracking-[0.2em]">Edit My Profile</span>
                            <ArrowRight size={16} className="!text-white group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    {/* Messages Fast Access */}
                    <div className="bg-white rounded-[10px] border border-gray-100 shadow-sm p-8 overflow-hidden relative">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-lg font-black text-gray-900 tracking-tight">Recent Messages</h3>
                            <Link href="/messages" className="px-3 py-1.5 bg-gray-50 hover:bg-blue-50 text-gray-600 hover:text-blue-600 rounded-[10px] text-[10px] font-black uppercase tracking-widest transition-colors">Open Inbox</Link>
                        </div>
                        <div className="space-y-4">
                            {stats.recentMessages.map((msg: any, i: number) => {
                                const otherUser = msg.senderId === user.id
                                    ? (msg.conversation.initiatorId === user.id ? msg.conversation.receiver : msg.conversation.initiator)
                                    : msg.sender;
                                return (
                                    <div key={i} className="flex gap-3 group cursor-pointer">
                                        <div className="w-8 h-8 rounded-[10px] bg-blue-50 text-blue-600 flex items-center justify-center font-black text-[10px] border border-blue-100 flex-shrink-0 overflow-hidden">
                                            {otherUser.image ? (
                                                <img src={otherUser.image} alt={otherUser.name} className="w-full h-full object-cover" />
                                            ) : (
                                                otherUser.name[0]
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex justify-between items-start mb-0.5">
                                                <p className="text-xs font-black text-gray-900 truncate">{otherUser.name}</p>
                                                <span className="text-[9px] text-gray-400 tabular-nums">12m ago</span>
                                            </div>
                                            <p className="text-[10px] text-gray-500 truncate leading-relaxed">{msg.content}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Public Profile Share */}
                    <PublicProfileCard profileId={stats.profileId} role="FREELANCER" />

                </div>
            </div>
        </div>
    );
}
