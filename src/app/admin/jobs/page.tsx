import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ShieldAlert, CheckCircle2, ExternalLink, Building2, Clock, Globe } from "lucide-react";
import Link from "next/link";
import ModerationActions from "./moderation-actions";

async function getJobs(filter: string) {
    const where = filter === 'pending' ? { status: 'PENDING' } : {};
    return await prisma.jobPost.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: { employer: true }
    });
}

export default async function AdminJobsPage(props: { searchParams: Promise<{ filter?: string }> }) {
    const searchParams = await props.searchParams;
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "ADMIN") {
        redirect("/dashboard");
    }

    const filter = searchParams.filter === 'all' ? 'all' : 'pending';
    const jobs = await getJobs(filter);

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 mb-1">Job Moderation</h1>
                    <p className="text-sm text-gray-500 font-medium uppercase tracking-widest text-xs">Review pending job postings for quality and compliance.</p>
                </div>

                {/* Filters & Actions */}
                <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
                    <div className="flex items-center gap-2 p-1.5 bg-gray-100 rounded-xl">
                        <Link
                            href="/admin/jobs?filter=pending"
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${filter === 'pending' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Pending Review
                        </Link>
                        <Link
                            href="/admin/jobs?filter=all"
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${filter === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            All Jobs
                        </Link>
                    </div>

                    <a
                        href="/api/admin/export?type=jobs"
                        className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold text-xs hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm"
                    >
                        Export CSV
                    </a>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                {jobs.length === 0 ? (
                    <div className="text-center py-20">
                        <CheckCircle2 size={48} className="text-emerald-100 mx-auto mb-4" />
                        <h2 className="text-lg font-bold text-gray-900 mb-1">Queue is empty</h2>
                        <p className="text-gray-400 font-medium text-sm">All job posts have been reviewed.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Job Details</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Employer</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Location</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Posted</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {jobs.map((job) => (
                                    <tr key={job.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="max-w-xs xl:max-w-md">
                                                <div className="font-black text-gray-900 text-sm mb-0.5 group-hover:text-blue-600 transition-colors uppercase tracking-tight truncate">
                                                    {job.title}
                                                </div>
                                                <div className="text-[10px] text-gray-400 font-medium line-clamp-1 truncate italic">
                                                    {job.description.substring(0, 100)}...
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100">
                                                    <Building2 size={14} className="text-blue-600" />
                                                </div>
                                                <span className="text-xs font-bold text-gray-700 truncate max-w-[150px]">
                                                    {job.employer.companyName}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                                <Globe size={12} className="text-gray-300" /> {job.location || "Remote"}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            {job.status === "PENDING" ? (
                                                <span className="bg-orange-50 text-orange-600 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border border-orange-100">Pending</span>
                                            ) : (
                                                <span className="bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border border-emerald-100">{job.status}</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest tabular-nums">
                                                {job.createdAt.toLocaleDateString()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={`/jobs/${job.id}`}
                                                    target="_blank"
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                    title="Full Preview"
                                                >
                                                    <ExternalLink size={16} />
                                                </Link>
                                                <div className="w-48 transform scale-90 origin-right">
                                                    <ModerationActions jobId={job.id} status={job.status} />
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
