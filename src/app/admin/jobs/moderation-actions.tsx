"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ModerationActions({ jobId, status }: { jobId: string, status: string }) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleModerate = async (approve: boolean) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/jobs/${jobId}/moderate`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ approve }),
            });

            if (res.ok) {
                router.refresh();
            }
        } catch (err) {
            console.error("Moderation failed", err);
        } finally {
            setLoading(false);
        }
    };

    if (status !== "PENDING") {
        return (
            <div className="p-4 bg-green-50 rounded-2xl border border-green-100 text-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-green-700 flex items-center justify-center gap-2">
                    <CheckCircle2 size={16} /> Moderated
                </span>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 gap-3">
            <button
                onClick={() => handleModerate(true)}
                disabled={loading}
                className="py-4 bg-green-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-green-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-100"
            >
                {loading ? <Loader2 size={16} className="animate-spin" /> : "Approve"}
            </button>

            <button
                onClick={() => handleModerate(false)}
                disabled={loading}
                className="py-4 bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-100"
            >
                {loading ? <Loader2 size={16} className="animate-spin" /> : "Delete"}
            </button>
        </div>
    );
}
