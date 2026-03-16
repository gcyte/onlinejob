"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/navbar";
import {
    Building2,
    Globe,
    FileText,
    MapPin,
    CheckCircle2,
    Share2,
    Briefcase,
    Calendar,
    ArrowRight,
    Star,
    Award,
    ChevronRight
} from "lucide-react";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export default function PublicEmployerProfile() {
    const params = useParams();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch(`/api/public/profiles/employer/${params.id}`);
                if (res.ok) {
                    const data = await res.json();
                    setProfile(data);
                }
            } catch (err) {
                console.error("Failed to fetch profile", err);
            } finally {
                setLoading(false);
            }
        };

        if (params.id) {
            fetchProfile();
        }
    }, [params.id]);

    const copyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-blue-50 border-t-blue-600 rounded-full animate-spin" />
                    <Building2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-600" size={20} />
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
                <Navbar />
                <div className="bg-white p-12 rounded-[3rem] shadow-xl text-center max-w-md w-full border border-gray-100">
                    <div className="w-20 h-20 bg-rose-50 rounded-[2rem] flex items-center justify-center text-rose-500 mx-auto mb-6">
                        <Building2 size={40} />
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 mb-2">Company Not Found</h1>
                    <p className="text-gray-500 font-medium mb-8">The company profile you are looking for does not exist or has been removed.</p>
                    <Link href="/jobs" className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-black transition-all">
                        Browse Other Jobs
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white pb-32 overflow-x-hidden">
            <Navbar />

            {/* Premium Header / Hero */}
            <div className="relative pt-32 pb-20 overflow-hidden">
                {/* Dynamic Background */}
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-blue-50/50 to-white -z-10" />
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-50/50 rounded-full blur-[120px] -mr-[400px] -mt-[400px] -z-10" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-50/30 rounded-full blur-[100px] -ml-[300px] -mb-[300px] -z-10" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-10 md:gap-16">
                        {/* Logo with Premium Frame */}
                        <div className="relative group">
                            <div className="absolute inset-0 bg-blue-600/10 rounded-[3rem] blur-2xl group-hover:bg-blue-600/20 transition-all duration-500" />
                            <div className="relative w-40 h-40 md:w-48 md:h-48 rounded-[3rem] bg-white border border-gray-100 shadow-2xl p-6 flex items-center justify-center group-hover:-translate-y-2 transition-transform duration-500 ease-out">
                                {profile.companyLogo ? (
                                    <img src={profile.companyLogo} alt={profile.companyName} className="max-w-full max-h-full object-contain filter drop-shadow-sm" />
                                ) : (
                                    <Building2 size={64} className="text-gray-200" />
                                )}
                            </div>
                        </div>

                        {/* Company Vital Info */}
                        <div className="flex-1 text-center md:text-left pt-2">
                            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
                                <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tight leading-tight">{profile.companyName}</h1>
                                <div className="flex items-center gap-2 self-center md:self-start">
                                    {profile.isPremium && (
                                        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-gray-900 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-transparent shadow-lg shadow-gray-200">
                                            <Award size={12} className="text-amber-400" /> Verified Partner
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-wrap justify-center md:justify-start gap-8 text-gray-400 font-bold mb-10">
                                {profile.companyWebsite && (
                                    <a href={profile.companyWebsite} target="_blank" className="flex items-center gap-2.5 hover:text-blue-600 transition-all group/link">
                                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center group-hover/link:bg-blue-50 group-hover/link:text-blue-600 transition-colors">
                                            <Globe size={16} />
                                        </div>
                                        <span className="text-sm tracking-tight">{profile.companyWebsite.replace(/^https?:\/\//, "")}</span>
                                    </a>
                                )}
                                <div className="flex items-center gap-2.5 group/link">
                                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                                        <Briefcase size={16} className="text-gray-400" />
                                    </div>
                                    <span className="text-sm tracking-tight text-gray-600">{profile.jobs.length} Active Positions</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-center md:justify-start gap-4">
                                <button
                                    onClick={copyLink}
                                    className="inline-flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 hover:scale-105 active:scale-95"
                                >
                                    {copied ? <><CheckCircle2 size={16} /> URL Copied</> : <><Share2 size={16} /> Share Experience</>}
                                </button>
                                <button className="p-4 bg-white border border-gray-100 text-gray-400 rounded-2xl hover:text-rose-500 hover:border-rose-100 transition-all shadow-sm">
                                    <Star size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Sections */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                <div className="grid lg:grid-cols-12 gap-16">
                    {/* Left Column: About & Jobs */}
                    <div className="lg:col-span-8 space-y-20">
                        {/* About Us */}
                        <section className="animate-in fade-in slide-in-from-bottom-5 duration-700 delay-100">
                            <div className="flex items-center gap-3 mb-10">
                                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                                    <FileText size={24} strokeWidth={2.5} />
                                </div>
                                <h2 className="text-2xl font-black text-gray-900 uppercase tracking-widest">Company Narrative</h2>
                            </div>
                            <div className="relative">
                                <div className="absolute -left-4 top-0 bottom-0 w-1.5 bg-blue-600/10 rounded-full" />
                                <div className="bg-white rounded-[3rem] p-10 lg:p-14 border border-gray-50 shadow-xl shadow-blue-50/10 leading-relaxed text-gray-600 text-lg whitespace-pre-line font-medium italic">
                                    <span className="text-5xl text-blue-600/20 font-serif absolute -top-4 -left-2">"</span>
                                    {profile.description || "Leading the future of innovation with a commitment to excellence and global impact."}
                                </div>
                            </div>
                        </section>

                        {/* Openings */}
                        <section className="animate-in fade-in slide-in-from-bottom-5 duration-700 delay-200">
                            <div className="flex items-center justify-between mb-10">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                                        <Briefcase size={24} strokeWidth={2.5} />
                                    </div>
                                    <h2 className="text-2xl font-black text-gray-900 uppercase tracking-widest">Opportunities</h2>
                                </div>
                                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{profile.jobs.length} Positions</span>
                            </div>

                            <div className="grid gap-6">
                                {profile.jobs.map((job: any) => (
                                    <Link
                                        key={job.id}
                                        href={`/jobs/${job.id}`}
                                        className="bg-white group p-8 rounded-[2.5rem] border border-gray-50 shadow-sm hover:shadow-2xl hover:border-blue-100 transition-all duration-500 relative overflow-hidden"
                                    >
                                        {/* Hover Effect Gradient */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/0 to-blue-50/0 group-hover:from-blue-50/50 group-hover:to-indigo-50/30 transition-all duration-500 -z-10" />

                                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-6">
                                            <div className="space-y-4">
                                                <h3 className="text-2xl font-black text-gray-900 group-hover:text-blue-600 transition-colors leading-tight">{job.title}</h3>
                                                <div className="flex flex-wrap gap-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                    <span className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg"><MapPin size={12} className="text-blue-500" /> {job.location || "Global Remote"}</span>
                                                    <span className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg"><Calendar size={12} className="text-indigo-500" /> {new Date(job.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-500">View Protocol</span>
                                                <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-blue-600 group-hover:text-white group-hover:rotate-45 transition-all duration-500 shadow-sm">
                                                    <ArrowRight size={24} />
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                                {profile.jobs.length === 0 && (
                                    <div className="bg-gray-50 rounded-[3rem] p-20 text-center border border-dashed border-gray-200">
                                        <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center text-gray-200 mx-auto mb-6 shadow-sm">
                                            <Briefcase size={40} />
                                        </div>
                                        <p className="text-gray-400 font-black uppercase tracking-widest text-sm">No Active Cycles</p>
                                        <p className="text-gray-400 text-xs mt-2">Subscribe to get notified of new opportunities.</p>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Sidebar Stats */}
                    <div className="lg:col-span-4 lg:pt-32">
                        <div className="sticky top-32 space-y-10">
                            {/* Snapshot Card */}
                            <div className="bg-gray-900 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-blue-200/20">
                                {/* Decorative Blur */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-[60px]" />

                                <div className="relative z-10 space-y-10">
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">Institutional Pulse</p>
                                        <h3 className="text-2xl font-black uppercase tracking-tight">Core Stats</h3>
                                    </div>

                                    <div className="space-y-8">
                                        <div className="flex items-center gap-6 group">
                                            <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-blue-400 border border-white/5 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                                                <Building2 size={24} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">HQ Presence</p>
                                                <p className="font-bold text-sm leading-tight text-gray-200">{profile.companyAddress || "Worldwide Operations"}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6 group">
                                            <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-emerald-400 border border-white/5 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500">
                                                <CheckCircle2 size={24} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Reliability Status</p>
                                                <p className="font-bold text-sm text-gray-200">Verified Strategic Partner</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-6">
                                        <Link href="/support" className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all group">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">Request Verification</span>
                                            <ChevronRight size={16} className="text-gray-500 group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            {/* Trust Hint */}
                            <div className="p-8 bg-blue-50/50 rounded-[2.5rem] border border-blue-100 flex gap-4 items-start">
                                <div className="p-2 bg-blue-600 text-white rounded-xl shadow-lg">
                                    <Award size={16} />
                                </div>
                                <p className="text-xs text-blue-600 font-medium leading-relaxed italic">
                                    "Verified companies attract 2.4x more high-quality senior candidates compared to non-verified entities."
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
