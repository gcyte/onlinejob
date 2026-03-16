"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Plus, Pencil, Trash2, RefreshCw, ChevronLeft, ChevronRight, Filter, X } from "lucide-react";
import Link from "next/link";

interface Job {
    id: string;
    title: string;
    jobType: string;
    location: string;
    status: string | null;
    createdAt: string;
    _count: { applications: number };
}

const STATUS_TABS = ["All Statuses", "Active", "Pending", "Rejected", "Draft"];

const StatusBadge = ({ status }: { status: string | null }) => {
    const s = (status ?? "PENDING").toUpperCase();
    switch (s) {
        case "APPROVED":
        case "ACTIVE":
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    Active
                </span>
            );
        case "PENDING":
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                    Pending
                </span>
            );
        case "REJECTED":
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-red-50 text-red-700 border border-red-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                    Rejected
                </span>
            );
        case "DRAFT":
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-600 border border-amber-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                    Draft
                </span>
            );
        default:
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
                    Closed
                </span>
            );
    }
};

export default function ManageJobsPage() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [activeTab, setActiveTab] = useState("All Statuses");
    const [page, setPage] = useState(1);
    const perPage = 10;

    const fetchJobs = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/manage/jobs");
            if (res.ok) {
                const data = await res.json();
                setJobs(data);
            }
        } catch (e) {
            console.error("Failed to fetch jobs", e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchJobs(); }, [fetchJobs]);

    const getStatus = (job: Job) => {
        const s = (job.status ?? "PENDING").toUpperCase();
        if (s === "APPROVED" || s === "ACTIVE") return "Active";
        if (s === "PENDING") return "Pending";
        if (s === "REJECTED") return "Rejected";
        if (s === "DRAFT") return "Draft";
        return "Closed";
    };

    const filtered = jobs.filter(job => {
        const matchSearch = job.title.toLowerCase().includes(search.toLowerCase()) ||
            job.location?.toLowerCase().includes(search.toLowerCase());
        const matchTab = activeTab === "All Statuses" || getStatus(job) === activeTab;
        return matchSearch && matchTab;
    });

    const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
    const paginated = filtered.slice((page - 1) * perPage, page * perPage);

    // Reset page when filter/search changes
    const handleSearch = (v: string) => { setSearch(v); setPage(1); };
    const handleTab = (t: string) => { setActiveTab(t); setPage(1); };

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">

            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-[26px] font-black text-[#0B1E3F] tracking-tight">My Job Postings</h1>
                    <p className="text-[#64748B] text-[14px] mt-0.5">Manage your active listings and candidate pipelines.</p>
                </div>
                <Link
                    href="/manage/jobs/new"
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-[8px] text-[13px] font-bold transition-colors shadow-sm whitespace-nowrap"
                >
                    <Plus size={16} strokeWidth={2.5} />
                    Post a New Job
                </Link>
            </div>

            {/* Filters Bar */}
            <div className="bg-white rounded-[12px] border border-[#E2E8F0] shadow-sm overflow-hidden">
                {/* Search + Status Tabs */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-4 border-b border-[#F1F5F9]">
                    {/* Search */}
                    <div className="relative flex-1 max-w-xs">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                        <input
                            type="text"
                            placeholder="Search job titles, keywords..."
                            value={search}
                            onChange={e => handleSearch(e.target.value)}
                            className="w-full pl-9 pr-8 py-2 border border-[#E2E8F0] rounded-[8px] text-[13px] text-[#334155] outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder:text-[#94A3B8] font-medium"
                        />
                        {search && (
                            <button onClick={() => handleSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#475569]">
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    {/* Status filters */}
                    <div className="flex items-center gap-2">
                        {STATUS_TABS.map(tab => (
                            <button
                                key={tab}
                                onClick={() => handleTab(tab)}
                                className={`px-3 py-1.5 rounded-[6px] text-[12px] font-semibold transition-colors whitespace-nowrap ${tab === activeTab
                                    ? tab === "All Statuses"
                                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                                        : tab === "Active"
                                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                            : tab === "Pending"
                                                ? "bg-blue-50 text-blue-700 border border-blue-200"
                                                : tab === "Rejected"
                                                    ? "bg-red-50 text-red-700 border border-red-200"
                                                    : tab === "Draft"
                                                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                                                        : "bg-gray-100 text-gray-700 border border-gray-200"
                                    : "text-[#475569] hover:bg-[#F8FAFC] border border-transparent"
                                    }`}
                            >
                                {tab === "All Statuses" && <Filter size={12} className="inline mr-1 opacity-60" />}
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-[#F1F5F9] bg-[#F8FAFC]">
                                <th className="text-left px-5 py-3 text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Job Title</th>
                                <th className="text-left px-4 py-3 text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Status</th>
                                <th className="text-left px-4 py-3 text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Date Posted</th>
                                <th className="text-left px-4 py-3 text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Applications</th>
                                <th className="text-right px-5 py-3 text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-16 text-[#94A3B8] text-[14px] font-medium">
                                        Loading job postings...
                                    </td>
                                </tr>
                            ) : paginated.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-16">
                                        <p className="text-[#64748B] text-[14px] font-medium mb-3">No job postings found.</p>
                                        <Link href="/manage/jobs/new" className="text-blue-600 text-[13px] font-bold hover:underline">
                                            + Create your first job listing
                                        </Link>
                                    </td>
                                </tr>
                            ) : paginated.map((job, i) => {
                                const status = getStatus(job);
                                const isNew = job._count.applications > 0;
                                const newCount = status === "Active" ? Math.floor(job._count.applications * 0.2) : 0; // Simulated new count
                                return (
                                    <tr
                                        key={job.id}
                                        className={`border-b border-[#F1F5F9] hover:bg-[#F8FAFC] transition-colors ${i % 2 === 0 ? "" : "bg-[#FAFBFD]"}`}
                                    >
                                        {/* Job Title */}
                                        <td className="px-5 py-4">
                                            <Link href={`/manage/jobs/${job.id}`} className="group">
                                                <p className="text-[14px] font-bold text-[#0B1E3F] group-hover:text-blue-600 transition-colors leading-tight">
                                                    {job.title}
                                                </p>
                                                <p className="text-[11px] text-[#94A3B8] font-medium mt-0.5">
                                                    {job.jobType.replace("_", " ")} {job.location ? `• ${job.location}` : ""}
                                                </p>
                                            </Link>
                                        </td>

                                        {/* Status */}
                                        <td className="px-4 py-4">
                                            <StatusBadge status={job.status} />
                                        </td>

                                        {/* Date Posted */}
                                        <td className="px-4 py-4">
                                            <span className={`text-[13px] font-medium ${status === "Active" ? "text-amber-500" : "text-[#64748B]"}`}>
                                                {formatDate(job.createdAt)}
                                            </span>
                                        </td>

                                        {/* Applications */}
                                        <td className="px-4 py-4">
                                            {status === "Draft" ? (
                                                <span className="text-[#94A3B8] text-[13px] font-medium">--</span>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[14px] font-bold text-[#0B1E3F]">{job._count.applications}</span>
                                                    {newCount > 0 && (
                                                        <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full">+{newCount} new</span>
                                                    )}
                                                </div>
                                            )}
                                        </td>

                                        {/* Actions */}
                                        <td className="px-5 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                {status === "Active" && (
                                                    <Link href={`/manage/jobs/${job.id}`} className="text-[13px] font-bold text-blue-600 hover:text-blue-800 transition-colors whitespace-nowrap">
                                                        View Applications
                                                    </Link>
                                                )}
                                                {status === "Pending" && (
                                                    <span className="text-[12px] font-semibold text-blue-500">Under Review</span>
                                                )}
                                                {status === "Draft" && (
                                                    <Link href={`/manage/jobs/${job.id}`} className="text-[13px] font-bold text-blue-600 hover:text-blue-800 transition-colors">
                                                        Publish
                                                    </Link>
                                                )}
                                                {(status === "Closed" || status === "Rejected") && (
                                                    <Link href={`/manage/jobs/${job.id}`} className="text-[13px] font-bold text-[#475569] hover:text-[#0B1E3F] transition-colors whitespace-nowrap">
                                                        View History
                                                    </Link>
                                                )}
                                                <Link href={`/manage/jobs/${job.id}/edit`} className="p-1.5 text-[#94A3B8] hover:text-[#475569] transition-colors rounded-[4px] hover:bg-[#F1F5F9]">
                                                    <Pencil size={14} strokeWidth={2} />
                                                </Link>
                                                {status === "Closed" ? (
                                                    <button className="p-1.5 text-[#94A3B8] hover:text-blue-500 transition-colors rounded-[4px] hover:bg-[#F1F5F9]">
                                                        <RefreshCw size={14} strokeWidth={2} />
                                                    </button>
                                                ) : (
                                                    <button className="p-1.5 text-[#94A3B8] hover:text-red-500 transition-colors rounded-[4px] hover:bg-red-50">
                                                        <Trash2 size={14} strokeWidth={2} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
                {filtered.length > 0 && (
                    <div className="flex items-center justify-between px-5 py-3.5 border-t border-[#F1F5F9]">
                        <p className="text-[12px] text-[#64748B] font-medium">
                            Showing {(page - 1) * perPage + 1} to {Math.min(page * perPage, filtered.length)} of {filtered.length} job postings
                        </p>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="w-7 h-7 flex items-center justify-center rounded-[6px] border border-[#E2E8F0] text-[#475569] hover:bg-[#F8FAFC] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft size={14} />
                            </button>
                            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
                                <button
                                    key={p}
                                    onClick={() => setPage(p)}
                                    className={`w-7 h-7 flex items-center justify-center rounded-[6px] text-[12px] font-bold transition-colors ${page === p
                                        ? "bg-blue-600 text-white shadow-sm"
                                        : "border border-[#E2E8F0] text-[#475569] hover:bg-[#F8FAFC]"
                                        }`}
                                >
                                    {p}
                                </button>
                            ))}
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="w-7 h-7 flex items-center justify-center rounded-[6px] border border-[#E2E8F0] text-[#475569] hover:bg-[#F8FAFC] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
