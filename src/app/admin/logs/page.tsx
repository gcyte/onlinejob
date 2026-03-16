"use client";

import { useState, useEffect, useCallback } from "react";
import {
    History, Search, ChevronLeft, ChevronRight,
    Loader2, User as UserIcon, Calendar, Activity,
    Shield, Ban, CheckCircle2, Megaphone, CheckSquare
} from "lucide-react";

type AdminLog = {
    id: string;
    adminId: string;
    action: string;
    targetId: string | null;
    targetType: string | null;
    details: string | null;
    createdAt: string;
    admin: {
        name: string | null;
        email: string | null;
        image: string | null;
    };
};

export default function AdminLogsPage() {
    const [logs, setLogs] = useState<AdminLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [actionFilter, setActionFilter] = useState("ALL");

    const fetchLogs = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                action: actionFilter
            });
            const res = await fetch(`/api/admin/logs?${params.toString()}`);
            const data = await res.json();
            setLogs(data.logs);
            setTotalPages(data.pages);
            setTotal(data.total);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [page, actionFilter]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const getActionIcon = (action: string) => {
        if (action.includes("BAN")) return <Ban size={14} className="text-red-500" />;
        if (action.includes("UNBAN")) return <CheckCircle2 size={14} className="text-emerald-500" />;
        if (action.includes("CREATE_ADMIN")) return <Shield size={14} className="text-purple-500" />;
        if (action.includes("ANNOUNCEMENT")) return <Megaphone size={14} className="text-blue-500" />;
        if (action.includes("APPROVE")) return <CheckSquare size={14} className="text-emerald-500" />;
        return <Activity size={14} className="text-gray-400" />;
    };

    const formatAction = (action: string) => {
        return action.replace(/_/g, " ").toLowerCase();
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 mb-1">Activity Logs</h1>
                    <p className="text-sm text-gray-500 font-medium">Audit trail of all administrative actions</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <select
                            value={actionFilter}
                            onChange={(e) => {
                                setActionFilter(e.target.value);
                                setPage(1);
                            }}
                            className="appearance-none pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition text-sm font-bold text-gray-700 cursor-pointer"
                        >
                            <option value="ALL">All Actions</option>
                            <option value="BAN_USER">Ban User</option>
                            <option value="UNBAN_USER">Unban User</option>
                            <option value="CREATE_ADMIN">Create Admin</option>
                            <option value="APPROVE_VERIFICATION">Approve Verification</option>
                            <option value="REJECT_VERIFICATION">Reject Verification</option>
                            <option value="SEND_ANNOUNCEMENT">Announcements</option>
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                            <ChevronRight size={14} className="rotate-90" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Logs Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-24">
                        <Loader2 className="animate-spin text-blue-600" size={32} />
                    </div>
                ) : logs.length === 0 ? (
                    <div className="text-center py-20">
                        <History size={48} className="text-gray-100 mx-auto mb-4" />
                        <p className="text-gray-400 font-medium">No activity logs found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Time</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Admin</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Action</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Target</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2 text-xs font-bold text-gray-900">
                                                <Calendar size={12} className="text-gray-400" />
                                                {new Date(log.createdAt).toLocaleString([], {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100 overflow-hidden">
                                                    {log.admin.image ? (
                                                        <img src={log.admin.image} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-[10px] font-black text-blue-600 uppercase">
                                                            {log.admin.name?.[0] || "?"}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="text-sm font-bold text-gray-900 truncate">{log.admin.name}</div>
                                                    <div className="text-[10px] text-gray-400 font-medium truncate">{log.admin.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-md bg-gray-50 flex items-center justify-center border border-gray-100">
                                                    {getActionIcon(log.action)}
                                                </div>
                                                <span className="text-xs font-black uppercase tracking-wider text-gray-700">
                                                    {formatAction(log.action)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 bg-gray-100 text-gray-500 rounded-md">
                                                {log.targetType || "—"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-xs text-gray-500 font-medium max-w-xs truncate lg:max-w-md">
                                                {log.details || "—"}
                                            </p>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {!loading && totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-50">
                        <p className="text-xs text-gray-400 font-medium">
                            Page {page} of {totalPages} · {total} events
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-40 transition-colors"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-40 transition-colors"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
