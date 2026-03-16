"use client";

import { useState } from "react";
import { ChevronDown, Loader2, CheckCircle2, Clock, XCircle, UserCheck, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import EndContractModal from "@/components/dashboard/end-contract-modal";

const statusConfig: any = {
    PENDING: { label: "Pending", color: "bg-blue-50 text-blue-600 border-blue-100", icon: <Clock size={14} /> },
    REVIEWING: { label: "Reviewing", color: "bg-amber-50 text-amber-600 border-amber-100", icon: <Clock size={14} /> },
    SHORTLISTED: { label: "Shortlisted", color: "bg-indigo-50 text-indigo-600 border-indigo-100", icon: <UserCheck size={14} /> },
    HIRED: { label: "Hired", color: "bg-emerald-50 text-emerald-600 border-emerald-100", icon: <CheckCircle2 size={14} /> },
    REJECTED: { label: "Rejected", color: "bg-rose-50 text-rose-600 border-rose-100", icon: <XCircle size={14} /> },
    COMPLETED: { label: "Completed", color: "bg-gray-50 text-gray-600 border-gray-100", icon: <CheckCircle2 size={14} /> },
};

export default function StatusDropdown({ applicationId, currentStatus, freelancerName }: { applicationId: string, currentStatus: string, freelancerName: string }) {
    const [status, setStatus] = useState(currentStatus);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [isEndContractModalOpen, setIsEndContractModalOpen] = useState(false);
    const router = useRouter();

    const handleStatusChange = async (newStatus: string) => {
        if (newStatus === "COMPLETED") {
            setIsEndContractModalOpen(true);
            setIsOpen(false);
            return;
        }

        if (newStatus === status) return;

        setLoading(true);
        setIsOpen(false);
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
        } catch (err) {
            console.error("Failed to update status", err);
        } finally {
            setLoading(false);
        }
    };

    const handleEndContractSubmit = async (score: number, comment: string) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/applications/${applicationId}/end-contract`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ score, comment }),
            });

            if (res.ok) {
                setStatus("COMPLETED");
                router.refresh();
            }
        } catch (err) {
            console.error("Failed to end contract", err);
        } finally {
            setLoading(false);
        }
    };

    const config = statusConfig[status] || statusConfig.PENDING;

    return (
        <div className="relative inline-block text-left">
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={loading || status === "COMPLETED"}
                className={`flex items-center gap-3 px-5 py-2.5 rounded-[10px] border-2 font-black text-xs uppercase tracking-widest transition-all hover:shadow-lg active:scale-95 ${config.color} ${loading || status === "COMPLETED" ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                {loading ? <Loader2 size={14} className="animate-spin" /> : config.icon}
                {config.label}
                {status !== "COMPLETED" && (
                    <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                )}
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-20"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 mt-3 w-56 rounded-[10px] bg-white shadow-2xl shadow-blue-600/10 border border-gray-100 py-3 z-30 animate-in fade-in zoom-in-95 duration-200">
                        <p className="px-6 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 mb-2">Change Status</p>
                        {Object.keys(statusConfig).map((key) => {
                            if (key === "COMPLETED" && status !== "HIRED") return null;
                            return (
                                <button
                                    key={key}
                                    onClick={() => handleStatusChange(key)}
                                    className={`w-full px-6 py-3 text-left text-sm font-bold flex items-center gap-3 hover:bg-gray-50 transition-colors ${status === key ? 'text-blue-600 bg-blue-50/30' : 'text-gray-600'}`}
                                >
                                    <div className={statusConfig[key].color.split(' ')[1]}>
                                        {statusConfig[key].icon}
                                    </div>
                                    {statusConfig[key].label}
                                </button>
                            );
                        })}
                    </div>
                </>
            )}

            <EndContractModal
                isOpen={isEndContractModalOpen}
                onClose={() => setIsEndContractModalOpen(false)}
                onSubmit={handleEndContractSubmit}
                freelancerName={freelancerName}
            />
        </div>
    );
}
