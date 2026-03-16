"use client";

import { useState } from "react";
import { Loader2, CheckCircle2, Send, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ApplicationForm({ jobId }: { jobId: string }) {
    const [isApplying, setIsApplying] = useState(false);
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [coverLetter, setCoverLetter] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/applications", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    jobId,
                    coverLetter
                }),
            });

            if (res.ok) {
                setSubmitted(true);
                setTimeout(() => {
                    router.push("/dashboard");
                }, 2000);
            }
        } catch (err) {
            console.error("Application failed", err);
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="text-center py-8 animate-in zoom-in-95 duration-500">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-100">
                    <CheckCircle2 size={32} />
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-2">Application Sent!</h3>
                <p className="text-gray-500 font-bold">Good luck! Redirecting to dashboard...</p>
            </div>
        );
    }

    if (!isApplying) {
        return (
            <button
                onClick={() => setIsApplying(true)}
                className="w-full py-5 bg-[#0F3652] text-white text-center rounded-2xl font-black text-sm uppercase tracking-[0.2em] hover:bg-black transition-all shadow-xl shadow-blue-100/50 active:scale-95 flex items-center justify-center gap-3"
            >
                Apply Now
            </button>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 animate-in slide-in-from-top-4 duration-500">
            <div className="p-1 bg-gray-50 rounded-2xl border border-gray-100">
                <textarea
                    required
                    rows={4}
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    placeholder="Briefly explain why you're a great fit..."
                    className="w-full px-5 py-4 bg-white border-0 rounded-xl focus:ring-0 outline-none font-medium text-sm transition-all resize-none shadow-inner"
                />
            </div>

            <div className="flex flex-col gap-3">
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-5 bg-[#0F3652] text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-blue-100/50 hover:bg-black transition-all flex items-center justify-center gap-3 active:scale-95"
                >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : <><Send size={18} /> Submit Application</>}
                </button>
                <button
                    type="button"
                    onClick={() => setIsApplying(false)}
                    className="w-full py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-colors"
                >
                    Cancel
                </button>
            </div>

            <p className="text-[10px] text-gray-400 text-center font-black uppercase tracking-widest leading-relaxed">
                Your profile will be shared with the employer
            </p>
        </form>
    );
}

