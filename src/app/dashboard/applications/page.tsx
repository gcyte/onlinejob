"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import {
    Briefcase,
    Calendar,
    Clock,
    CheckCircle2,
    XCircle,
    ArrowRight,
    MapPin,
    Building2,
    Loader2,
    Search,
    Trash2
} from "lucide-react";
import Link from "next/link";

export default function MyApplicationsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [withdrawing, setWithdrawing] = useState<string | null>(null);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }

        const fetchApplications = async () => {
            try {
                const res = await fetch("/api/applications/my");
                if (res.ok) {
                    const data = await res.json();
                    setApplications(data);
                }
            } catch (err) {
                console.error("Failed to fetch applications", err);
            } finally {
                setLoading(false);
            }
        };

        if (status === "authenticated") {
            fetchApplications();
        }
    }, [status, router]);

    const handleWithdraw = async (id: string) => {
        if (!confirm("Are you sure you want to withdraw this application? This action cannot be undone.")) return;

        setWithdrawing(id);
        try {
            const res = await fetch(`/api/applications/${id}`, {
                method: "DELETE",
            });
            if (res.ok) {
                setApplications(prev => prev.filter(a => a.id !== id));
            } else {
                const text = await res.text();
                alert(text || "Failed to withdraw application");
            }
        } catch (err) {
            console.error("Withdrawal error", err);
        } finally {
            setWithdrawing(null);
        }
    };

    const filteredApplications = applications.filter(app =>
        app.job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.job.employer.companyName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusStyle = (status: string) => {
        switch (status) {
            case "HIRED": return "bg-emerald-50 text-emerald-600 border-emerald-100";
            case "REJECTED": return "bg-rose-50 text-rose-600 border-rose-100";
            case "PENDING": return "bg-orange-50 text-orange-600 border-orange-100";
            default: return "bg-gray-100 text-gray-500 border-gray-200";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "HIRED": return <CheckCircle2 size={14} />;
            case "REJECTED": return <XCircle size={14} />;
            case "PENDING": return <Clock size={14} />;
            default: return null;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
        );
    }

    return (
        <div className="pb-20">
            {/* Standard Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">My Applications</h1>
                    <p className="text-gray-500 font-medium mt-2">Track your job applications and their current status.</p>
                </div>

                <div className="relative w-full md:w-72">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <Search size={18} />
                    </div>
                    <input
                        type="text"
                        placeholder="Search applications..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-[10px] shadow-sm focus:ring-2 focus:ring-blue-600 outline-none font-medium text-sm transition-all"
                    />
                </div>
            </div>

            {/* Dashboard Stats (Subset) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                {[
                    { label: "Total Apps", value: applications.length, icon: <Briefcase size={20} />, iconBg: "bg-blue-50 text-blue-600" },
                    { label: "Pending", value: applications.filter(a => a.status === "PENDING").length, icon: <Clock size={20} />, iconBg: "bg-orange-50 text-orange-600" },
                    { label: "Hired", value: applications.filter(a => a.status === "HIRED").length, icon: <CheckCircle2 size={20} />, iconBg: "bg-emerald-50 text-emerald-600" },
                    { label: "Rejected", value: applications.filter(a => a.status === "REJECTED").length, icon: <XCircle size={20} />, iconBg: "bg-rose-50 text-rose-600" },
                ].map((s, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-[10px] border border-gray-100 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-gray-50 to-transparent rounded-full blur-xl opacity-50 group-hover:opacity-100 transition-opacity" />
                        <div className="flex items-center gap-4 relative z-10">
                            <div className={`w-10 h-10 rounded-[10px] flex items-center justify-center shadow-sm ${s.iconBg}`}>
                                {s.icon}
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{s.label}</p>
                                <p className="text-xl font-black text-gray-900 leading-none mt-0.5">{s.value}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="space-y-6">
                {filteredApplications.map((app) => (
                    <div key={app.id} className="bg-white rounded-[10px] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-blue-50/40 transition-all duration-500 overflow-hidden group">
                        {/* Header Row */}
                        <div className="p-6 flex flex-col md:flex-row justify-between gap-6 md:items-center relative">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50/20 to-transparent rounded-full blur-3xl group-hover:bg-blue-100/30 transition-colors pointer-events-none" />
                            
                            {/* Left: Logo & Info */}
                            <div className="flex items-center gap-5 relative z-10">
                                <div className="w-14 h-14 bg-slate-50 rounded-[10px] flex items-center justify-center border border-slate-100 shadow-sm shrink-0 overflow-hidden group-hover:border-blue-100 transition-all">
                                    {app.job.employer?.companyLogo ? (
                                        <img src={app.job.employer.companyLogo} alt={app.job.employer.companyName} className="w-full h-full object-contain p-2" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-600 font-black text-lg">
                                            {app.job.employer.companyName[0]}
                                        </div>
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <Link href={`/jobs/${app.job.id}`} className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors block mb-1 tracking-tight truncate">
                                        {app.job.title}
                                    </Link>
                                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                        <span className="flex items-center gap-1.5 text-blue-600/70"><Building2 size={12} /> {app.job.employer.companyName}</span>
                                        <span className="flex items-center gap-1.5"><MapPin size={12} /> {app.job.location || "Remote"}</span>
                                        <span className="flex items-center gap-1.5 opacity-60 font-medium"><Calendar size={12} /> {new Date(app.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Right: Status & Actions */}
                            <div className="flex items-center justify-between md:justify-end gap-3 relative z-10 pt-4 md:pt-0 border-t md:border-t-0 border-slate-50">
                                <span className={`inline-flex items-center gap-2 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-[10px] border shadow-sm ${getStatusStyle(app.status)}`}>
                                    {getStatusIcon(app.status)}
                                    {app.status}
                                </span>
                                
                                <div className="h-4 w-px bg-slate-100 mx-1 hidden md:block" />

                                <div className="flex gap-2">
                                    <Link
                                        href={`/jobs/${app.job.id}`}
                                        className="h-10 px-4 inline-flex items-center gap-2 text-[10px] font-black text-slate-600 bg-slate-50 rounded-[10px] hover:bg-blue-600 hover:text-white uppercase tracking-wider transition-all border border-slate-100 shadow-sm"
                                    >
                                        Details <ArrowRight size={14} />
                                    </Link>

                                    {app.status === "PENDING" && (
                                        <button
                                            onClick={() => handleWithdraw(app.id)}
                                            disabled={withdrawing === app.id}
                                            className="h-10 w-10 flex items-center justify-center text-slate-300 bg-slate-50 hover:text-rose-600 hover:bg-rose-50 rounded-[10px] shadow-sm transition-all border border-slate-100"
                                            title="Withdraw Application"
                                        >
                                            {withdrawing === app.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Bottom: Cover Letter Snippet */}
                        {app.coverLetter && (
                            <div className="px-6 pb-6 pt-0 relative z-10 w-full">
                                <div className="bg-slate-50/50 p-4 rounded-[10px] border border-slate-100/50 group-hover:bg-blue-50/10 transition-colors">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400" /> Cover Letter
                                    </p>
                                    <p className="text-slate-600 text-sm font-medium line-clamp-2 leading-relaxed italic">
                                        "{app.coverLetter}"
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                {filteredApplications.length === 0 && (
                    <div className="bg-white rounded-[10px] p-24 border border-dashed border-gray-200 text-center shadow-sm">
                        <div className="w-20 h-20 bg-gray-50 rounded-[10px] flex items-center justify-center mx-auto mb-8 text-gray-300 border border-gray-100 shadow-inner group">
                            <Search size={32} className="group-hover:text-blue-500 transition-colors" />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">No Active Applications</h3>
                        <p className="text-gray-500 max-w-md mx-auto mb-10 font-medium">
                            {searchTerm ? "We couldn't find any applications matching your search criteria." : "Your career dashboard is empty. Discover top opportunities and start applying today."}
                        </p>
                        <Link href="/jobs" className="px-10 py-4 bg-gray-900 text-white rounded-[10px] font-black text-xs uppercase tracking-widest hover:bg-blue-600 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-gray-200 inline-block">
                            Browse Open Positions
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
