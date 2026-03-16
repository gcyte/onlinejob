"use client";

import { Heart, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

export default function SaveJobButton({ jobId }: { jobId: string }) {
    const { data: session } = useSession();
    const [isSaved, setIsSaved] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (session?.user && (session.user as any).role === "FREELANCER") {
            fetch(`/api/jobs/${jobId}/save`)
                .then(res => res.json())
                .then(data => setIsSaved(data.saved))
                .catch(err => console.error("Error fetching save status", err));
        }
    }, [jobId, session]);

    const handleToggleSave = async (e: React.MouseEvent) => {
        e.preventDefault();

        if (!session?.user || (session.user as any).role !== "FREELANCER") {
            // Potentially show a toast
            return;
        }

        setIsSaving(true);
        const prevSaved = isSaved;
        setIsSaved(!prevSaved);

        try {
            const res = await fetch(`/api/jobs/${jobId}/save`, { method: "POST" });
            const data = await res.json();
            setIsSaved(data.saved);
        } catch (err) {
            setIsSaved(prevSaved);
            console.error("Error toggling save", err);
        } finally {
            setIsSaving(false);
        }
    };

    if (!session?.user || (session.user as any).role !== "FREELANCER") return null;

    return (
        <button
            onClick={handleToggleSave}
            disabled={isSaving}
            className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 border-2 active:scale-95 ${isSaved
                ? "bg-rose-50 border-rose-100 text-rose-500 shadow-lg shadow-rose-100/20"
                : "bg-white border-blue-600 text-blue-600 hover:bg-blue-50"
                }`}
        >
            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Heart size={18} fill={isSaved ? "currentColor" : "none"} />}
            {isSaved ? "Saved" : "Save Job"}
        </button>
    );
}
