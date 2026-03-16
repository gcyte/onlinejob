import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { MapPin, DollarSign, Clock, User, Mail, FileText, ArrowLeft, ShieldCheck, Briefcase, Zap, Users, ChevronRight } from "lucide-react";
import Link from "next/link";
import StatusUpdater from "./status-updater";

async function getJobWithApplications(id: string, employerUserId: string) {
    const job = await prisma.jobPost.findUnique({
        where: { id },
        include: {
            employer: true,
            applications: {
                include: {
                    freelancerProfile: {
                        include: {
                            user: true
                        }
                    }
                },
                orderBy: { createdAt: "desc" }
            }
        }
    });

    if (!job || job.employer.userId !== employerUserId) {
        return null;
    }

    return job;
}

export default async function JobManagePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "EMPLOYER") {
        redirect("/login");
    }

    const job = await getJobWithApplications(id, (session.user as any).id);

    if (!job) {
        notFound();
    }

    return (
        <div className="space-y-6 pb-10">
            {/* Navigation & Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <Link href="/manage/jobs" className="group inline-flex items-center gap-2 text-xs font-black text-gray-400 hover:text-blue-600 uppercase tracking-[0.2em] transition-all">
                    <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to listings
                </Link>
                <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${job.isPublished ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-amber-50 text-amber-700 border-amber-100"
                        }`}>
                        {job.isPublished ? "Public" : "Draft"}
                    </span>
                    <Link href={`/jobs/${job.id}`} target="_blank" className="p-2 bg-white border border-gray-100 rounded-lg text-gray-400 hover:text-blue-600 hover:border-blue-100 transition-all shadow-sm">
                        <Zap size={16} />
                    </Link>
                </div>
            </div>

            {/* Premium Job Header */}
            <div className="bg-white rounded-[10px] p-8 lg:p-10 border border-gray-100 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-blue-50/40 to-indigo-50/20 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />

                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-8 h-8 rounded-[10px] bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
                            <Briefcase size={20} strokeWidth={2.5} />
                        </div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Hiring Pipeline</span>
                    </div>

                    <h1 className="text-2xl lg:text-3xl font-black text-gray-900 mb-6 uppercase tracking-tight leading-tight group-hover:text-blue-600 transition-colors">
                        {job.title}
                    </h1>

                    <div className="flex flex-wrap gap-10">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Location</p>
                            <div className="flex items-center gap-2">
                                <MapPin size={18} className="text-blue-600" />
                                <p className="text-sm font-black text-gray-700 uppercase tracking-wider">{job.location}</p>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Salary Range</p>
                            <div className="flex items-center gap-2">
                                <DollarSign size={18} className="text-emerald-600" />
                                <p className="text-sm font-black text-gray-700 uppercase tracking-wider">{job.salaryRange || 'Unspecified'}</p>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Total Applicants</p>
                            <div className="flex items-center gap-2">
                                <Users size={18} className="text-indigo-600" />
                                <p className="text-sm font-black text-gray-700 uppercase tracking-wider">{job.applications.length} Candidates</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Applicants Section */}
            <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">Candidate Queue</h2>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sorted by newest</span>
                </div>

                <div className="grid gap-6">
                    {job.applications.map((app) => (
                        <div key={app.id} className="bg-white rounded-[10px] p-6 border border-gray-100 shadow-sm transition-all duration-500 hover:shadow-xl hover:shadow-blue-50/30 group">
                            <div className="flex flex-col lg:flex-row gap-6">
                                <div className="flex-1 space-y-8">
                                    <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-[10px] bg-gradient-to-br from-gray-50 to-blue-50/30 flex items-center justify-center border border-gray-100 text-blue-600 shadow-inner group-hover:scale-105 transition-transform">
                                                <User size={24} strokeWidth={2.5} />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-black text-gray-900 group-hover:text-blue-600 transition-colors">{app.freelancerProfile.user.name}</h3>
                                                <div className="flex flex-wrap items-center gap-5 mt-2">
                                                    <span className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                                        <Mail size={14} className="text-blue-600" /> {app.freelancerProfile.user.email}
                                                    </span>
                                                    <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-[10px] border border-emerald-100">
                                                        <ShieldCheck size={14} />
                                                        <span className="text-[10px] font-black uppercase tracking-widest">Trust: {app.freelancerProfile.trustScore}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="w-full sm:w-auto">
                                            <StatusUpdater applicationId={app.id} initialStatus={app.status} />
                                        </div>
                                    </div>

                                    <div className="bg-gray-50/50 rounded-[10px] p-5 border border-gray-100 relative group-hover:bg-white transition-colors duration-500">
                                        <div className="absolute top-4 right-4 text-blue-100 group-hover:text-blue-200 transition-colors">
                                            <FileText size={24} />
                                        </div>
                                        <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4 flex items-center gap-2">
                                            <div className="w-4 h-0.5 bg-blue-600" /> Professional Summary
                                        </h4>
                                        <p className="text-gray-600 font-medium leading-relaxed whitespace-pre-wrap text-sm italic">
                                            "{app.coverLetter}"
                                        </p>
                                    </div>

                                    <div className="flex justify-end pt-2 border-t border-gray-50">
                                        <Link
                                            href={`/freelancers/${app.freelancerProfile.id}`}
                                            className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-gray-900 transition-colors flex items-center gap-1"
                                        >
                                            View Full Portfolio <ChevronRight size={14} />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {job.applications.length === 0 && (
                        <div className="text-center py-24 bg-white rounded-[10px] border border-dashed border-gray-200">
                            <div className="w-16 h-16 bg-gray-50 rounded-[10px] flex items-center justify-center mx-auto mb-6 text-gray-200">
                                <Users size={32} />
                            </div>
                            <h2 className="text-xl font-black text-gray-900 mb-2 uppercase tracking-tight">No Candidates Yet</h2>
                            <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Your listing is live and visible to talent.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
