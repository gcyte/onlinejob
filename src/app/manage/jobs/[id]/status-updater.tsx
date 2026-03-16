"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

const STATUSES = ["PENDING", "REVIEWING", "HIRED", "REJECTED", "COMPLETED"];

export default function StatusUpdater({ applicationId, initialStatus }: { applicationId: string, initialStatus: string }) {
    const [status, setStatus] = useState(initialStatus);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleStatusChange = async (newStatus: string) => {
        if (newStatus === "COMPLETED") {
            // COMPLETED status is usually handled via EndContractModal in StatusDropdown
            // But if they select it here, we should probably redirect them to where they can provide feedback
            // For now, let's just let it update or show a note.
            // Actually, StatusUpdater is used in job management, maybe we should prevent setting to COMPLETED here without a review.
            // Let's just allow it for simplicity if they want to force complete.
        }
        
        setLoading(true);
        try {
            const res = await fetch(`/api/applications/${applicationId}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });

            if (res.ok) {
                setStatus(newStatus);
                router.refresh();
            }
        } catch (error) {
            console.error("Failed to update status", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center gap-3 bg-gray-50/50 p-2 rounded-[10px] border border-gray-100 group-hover:bg-white transition-colors duration-500">
            <div className="flex-1">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-2 mb-1">Update Status</p>
                <select
                    value={status}
                    disabled={loading || status === "COMPLETED"}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className={`w-full text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-[10px] border-2 outline-none transition-all cursor-pointer appearance-none ${status === "PENDING" ? "bg-white border-gray-100 text-gray-500 hover:border-gray-200" :
                        status === "REVIEWING" ? "bg-blue-50/50 border-blue-100 text-blue-600 hover:border-blue-200" :
                            status === "HIRED" ? "bg-emerald-50/50 border-emerald-100 text-emerald-700 hover:border-emerald-200" :
                                status === "REJECTED" ? "bg-rose-50/50 border-rose-100 text-rose-700 hover:border-rose-200" :
                                    "bg-gray-50/50 border-gray-100 text-gray-500 hover:border-gray-200"
                        }`}
                >
                    {STATUSES.map((s) => (
                        <option key={s} value={s} className="bg-white text-gray-900">{s}</option>
                    ))}
                </select>
            </div>
            {loading ? (
                <div className="pr-2">
                    <Loader2 size={16} className="animate-spin text-blue-600" />
                </div>
            ) : (
                <div className={`w-2 h-2 rounded-full mr-2 ${status === "PENDING" ? "bg-gray-300" :
                    status === "REVIEWING" ? "bg-blue-500 animate-pulse" :
                        status === "HIRED" ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" :
                            status === "REJECTED" ? "bg-rose-500" :
                                "bg-gray-400"
                    }`} />
            )}
        </div>
    );
}
