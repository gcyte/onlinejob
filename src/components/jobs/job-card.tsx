"use client";

import { Briefcase, MapPin, Clock, ShieldCheck, ChevronRight, Heart, Loader2 } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

export default function JobCard({ job }: { job: any }) {
    const { data: session } = useSession();
    const [isSaved, setIsSaved] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Use real data from the job object
    const salary = job.salaryRange || "Competitive";
    const company = job.employer?.companyName || "Private Employer";
    const title = job.title;
    const location = job.location || "Remote";
    const type = job.jobType?.replace('_', ' ').toLowerCase() || "Full-time";

    // Calculate time ago
    const createdDate = new Date(job.createdAt);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60));
    const timeAgo = diffInHours < 1 ? "Just now" : diffInHours < 24 ? `${diffInHours}h ago` : `${Math.floor(diffInHours / 24)}d ago`;

    // Process skills properly
    let parsedSkills: string[] = [];
    if (job.skills) {
        try {
            parsedSkills = typeof job.skills === 'string' ? JSON.parse(job.skills) : job.skills;
        } catch (e) {
            console.error("Failed to parse skills", e);
        }
    }
    if (!Array.isArray(parsedSkills)) {
        parsedSkills = [];
    }

    // Fallback to category if no skills
    if (parsedSkills.length === 0 && job.category) {
        parsedSkills = [job.category];
    }
    const displaySkills = parsedSkills.slice(0, 4);

    const stripHtml = (html: string) => {
        if (!html) return "";
        return html.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ').trim();
    };
    const shortDesc = stripHtml(job.description || "").slice(0, 160) + (stripHtml(job.description || "").length > 160 ? "..." : "");

    const [isApplied, setIsApplied] = useState(false);

    useEffect(() => {
        if (session?.user && (session.user as any).role === "FREELANCER") {
            fetch(`/api/jobs/${job.id}/status`)
                .then(res => res.json())
                .then(data => {
                    setIsSaved(data.isSaved);
                    setIsApplied(data.isApplied);
                })
                .catch(err => console.error("Error fetching job status", err));
        }
    }, [job.id, session]);

    const handleToggleSave = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!session?.user || (session.user as any).role !== "FREELANCER") {
            // Potentially redirect to login or show a toast
            return;
        }

        setIsSaving(true);
        // Optimistic update
        const prevSaved = isSaved;
        setIsSaved(!prevSaved);

        try {
            const res = await fetch(`/api/jobs/${job.id}/save`, { method: "POST" });
            const data = await res.json();
            setIsSaved(data.saved);
        } catch (err) {
            setIsSaved(prevSaved);
            console.error("Error toggling save", err);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="group bg-white p-6 rounded-[10px] border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-300 relative flex flex-col sm:flex-row gap-6 items-start w-full">
            {/* Logo Section */}
            <div className="w-16 h-16 bg-slate-50 rounded-[10px] flex items-center justify-center border border-slate-200 shrink-0 p-2">
                {job.employer?.companyLogo ? (
                    <img src={job.employer.companyLogo} alt={company} className="w-full h-full object-contain" />
                ) : (
                    <Briefcase className="text-slate-300" size={28} />
                )}
            </div>

            {/* Main Content Info */}
            <div className="flex-1 min-w-0 w-full">
                {/* Top Header - Title + Salary */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-2">
                    <div>
                        <h3 className="text-[16px] font-bold text-[#0F172A] group-hover:text-blue-600 transition-colors leading-tight mb-1">
                            {title}
                        </h3>
                        <div className="flex items-center gap-1.5">
                            <span className="text-[13px] font-bold text-[#026AA2]">
                                {company}
                            </span>
                            {job.employer?.isVerified && (
                                <ShieldCheck size={14} className="text-[#026AA2]" fill="currentColor" stroke="white" />
                            )}
                        </div>
                    </div>

                    {/* Salary - Right aligned */}
                    <div className="text-left sm:text-right shrink-0">
                        <p className="text-[15px] font-bold text-[#0F172A]">
                            {job.salaryRange ? job.salaryRange : job.salaryMin && job.salaryMax ? `${job.salaryCurrency === 'PHP' ? '₱' : '$'}${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}` : "Competitive"}
                        </p>
                        <p className="text-[11px] font-medium text-slate-400 mt-0.5">
                            {job.salaryFrequency ? `${job.salaryFrequency} Salary` : "Monthly Salary"}
                        </p>
                    </div>
                </div>

                {/* Meta Highlights */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-3">
                    <span className="flex items-center gap-1.5 text-[12px] font-medium text-slate-500">
                        <MapPin size={14} className="text-slate-400" /> {location}
                    </span>
                    <span className="flex items-center gap-1.5 text-[12px] font-medium text-slate-500 capitalize">
                        <Briefcase size={14} className="text-slate-400" /> {type}
                    </span>
                    <span className="flex items-center gap-1.5 text-[12px] font-medium text-slate-500">
                        <Clock size={14} className="text-slate-400" /> {timeAgo}
                    </span>
                </div>

                {/* Short Description */}
                <p className="text-[13px] text-slate-500 mb-4 line-clamp-2 leading-relaxed pr-4">
                    {shortDesc}
                </p>

                {/* Interaction Skills */}
                {displaySkills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-5">
                        {displaySkills.map((skill: string) => (
                            <span key={skill} className="px-3 py-1 bg-slate-50/80 text-slate-600 text-[11px] font-semibold rounded-[10px] border border-slate-200 transition-all duration-300">
                                {skill}
                            </span>
                        ))}
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-3">
                    {isApplied ? (
                        <div className="px-6 py-2 bg-emerald-50 text-emerald-700 border border-emerald-100 font-bold text-[13px] rounded-[10px] flex items-center justify-center gap-2">
                            Applied
                        </div>
                    ) : (
                        <Link href={`/jobs/${job.id}`} className="px-6 py-2 bg-blue-600 !text-white font-semibold text-[13px] rounded-[10px] hover:bg-blue-700 transition-colors flex items-center justify-center shadow-sm shadow-blue-200">
                            Apply Now
                        </Link>
                    )}
                    <Link href={`/jobs/${job.id}`} className="px-6 py-2 bg-white border border-slate-200 text-[#0F172A] font-semibold text-[13px] rounded-[10px] hover:bg-slate-50 transition-colors">
                        View Details
                    </Link>
                    {session?.user && (session.user as any).role === "FREELANCER" && (
                        <button
                            onClick={handleToggleSave}
                            disabled={isSaving}
                            className={`p-2 rounded-full border ml-auto transition-all ${isSaved
                                ? "bg-rose-50 border-rose-100 text-rose-500"
                                : "bg-white border-slate-200 text-slate-400 hover:border-rose-200 hover:text-rose-400"
                                }`}
                        >
                            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Heart size={16} fill={isSaved ? "currentColor" : "none"} />}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
