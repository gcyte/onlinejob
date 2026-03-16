"use client";

import { useState, useEffect } from "react";
import { Flag, Search, CheckCircle2, XCircle, AlertTriangle, ExternalLink, ChevronDown } from "lucide-react";
import { useToast } from "@/components/ui/toast";

interface Report {
    id: string;
    targetId: string;
    targetType: string;
    reason: string;
    details: string | null;
    status: "PENDING" | "RESOLVED" | "DISMISSED";
    adminNotes: string | null;
    createdAt: string;
    reporter: {
        name: string | null;
        email: string | null;
        image: string | null;
    };
}

export default function AdminReportsPage() {
    const [reports, setReports] = useState<Report[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState("PENDING");
    const [actioningId, setActioningId] = useState<string | null>(null);
    const [notes, setNotes] = useState("");
    const { toast } = useToast();

    const fetchReports = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/admin/reports?status=${filter}`);
            if (res.ok) {
                setReports(await res.json());
            }
        } catch (error) {
            console.error("Error fetching reports", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, [filter]);

    const handleAction = async (id: string, status: "RESOLVED" | "DISMISSED") => {
        setActioningId(id);
        try {
            const res = await fetch(`/api/admin/reports/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status, adminNotes: notes || undefined })
            });

            if (res.ok) {
                toast("success", `Report marked as ${status.toLowerCase()}`, "Success");
                fetchReports();
            } else {
                toast("error", "Failed to update report", "Error");
            }
        } catch (error) {
            toast("error", "An error occurred", "Error");
        } finally {
            setActioningId(null);
            setNotes("");
        }
    };

    const StatusBadge = ({ status }: { status: string }) => {
        const styles = {
            PENDING: "bg-amber-50 text-amber-700 border-amber-200",
            RESOLVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
            DISMISSED: "bg-gray-100 text-gray-700 border-gray-200"
        }[status] || "bg-gray-100 text-gray-700 border-gray-200";

        return (
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${styles}`}>
                {status}
            </span>
        );
    };

    return (
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Content Moderation</h1>
                    <p className="text-gray-500 font-medium">Review and resolve user-submitted reports.</p>
                </div>

                <div className="flex gap-2 bg-gray-100 p-1 rounded-2xl w-fit">
                    {["PENDING", "RESOLVED", "DISMISSED"].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${filter === f
                                    ? "bg-white text-gray-900 shadow-sm"
                                    : "text-gray-500 hover:text-gray-900"
                                }`}
                        >
                            {f.charAt(0) + f.slice(1).toLowerCase()}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
                {isLoading ? (
                    <div className="p-12 text-center text-gray-400 font-medium animate-pulse">Loading reports...</div>
                ) : reports.length === 0 ? (
                    <div className="p-16 text-center flex flex-col items-center">
                        <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-2xl flex items-center justify-center mb-4 border border-gray-100">
                            <CheckCircle2 size={32} />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 mb-2">Inbox Zero</h3>
                        <p className="text-gray-500 font-medium">No {filter.toLowerCase()} reports to show right now.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {reports.map((report) => (
                            <div key={report.id} className="p-6 md:p-8 hover:bg-gray-50/50 transition-colors">
                                <div className="flex flex-col md:flex-row gap-6">
                                    {/* Left Content */}
                                    <div className="flex-1 space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center border border-red-100 shrink-0">
                                                <Flag size={18} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3">
                                                    <h3 className="font-black text-gray-900 text-lg">{report.reason}</h3>
                                                    <StatusBadge status={report.status} />
                                                </div>
                                                <p className="text-sm font-medium text-gray-500">
                                                    Reported {new Date(report.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                                            <div className="flex flex-wrap gap-4 mb-3 text-sm font-bold">
                                                <span className="text-gray-900">Target Type: <span className="text-blue-600">{report.targetType}</span></span>
                                                <span className="text-gray-300">|</span>
                                                <span className="text-gray-900">Target ID: <span className="text-gray-500 font-mono">{report.targetId}</span></span>
                                            </div>
                                            {report.details && (
                                                <div className="pt-3 border-t border-gray-200/50">
                                                    <p className="text-sm text-gray-600 italic">"{report.details}"</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Reporter Info */}
                                        <div className="flex items-center gap-3 text-sm">
                                            <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden">
                                                {report.reporter.image && <img src={report.reporter.image} />}
                                            </div>
                                            <span className="font-bold text-gray-900">{report.reporter.name || "Unknown User"}</span>
                                            <span className="text-gray-400 font-medium">{report.reporter.email}</span>
                                        </div>

                                        {report.adminNotes && (
                                            <div className="bg-amber-50 text-amber-800 text-sm p-4 rounded-xl border border-amber-100">
                                                <strong>Admin Notes:</strong> {report.adminNotes}
                                            </div>
                                        )}
                                    </div>

                                    {/* Right Actions */}
                                    {report.status === "PENDING" && (
                                        <div className="md:w-64 space-y-3 pt-2">
                                            <textarea
                                                placeholder="Add internal resolution notes..."
                                                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 transition resize-none h-24 mb-2"
                                                value={notes}
                                                onChange={(e) => setNotes(e.target.value)}
                                            />
                                            <button
                                                onClick={() => handleAction(report.id, "RESOLVED")}
                                                disabled={actioningId === report.id}
                                                className="w-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 font-bold py-3 rounded-xl transition border border-emerald-200 flex items-center justify-center gap-2"
                                            >
                                                <CheckCircle2 size={18} /> Resolve Issue
                                            </button>
                                            <button
                                                onClick={() => handleAction(report.id, "DISMISSED")}
                                                disabled={actioningId === report.id}
                                                className="w-full bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900 font-bold py-3 rounded-xl transition border border-gray-200 flex items-center justify-center gap-2"
                                            >
                                                <XCircle size={18} /> Dismiss Report
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
