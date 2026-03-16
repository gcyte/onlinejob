"use client";

import { useState } from "react";
import { Flag, X, AlertTriangle } from "lucide-react";
import { useToast } from "@/components/ui/toast";

type ReportTargetType = "JOB" | "PROFILE" | "MESSAGE";

interface ReportButtonProps {
    targetId: string;
    targetType: ReportTargetType;
    className?: string;
}

export default function ReportButton({ targetId, targetType, className = "" }: ReportButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [reason, setReason] = useState("");
    const [details, setDetails] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!reason) {
            toast("error", "Please select a reason for reporting.", "Reason required");
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch("/api/reports", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ targetId, targetType, reason, details })
            });

            if (res.ok) {
                toast("success", "Thank you for helping keep our community safe.", "Report Submitted");
                setIsOpen(false);
                setReason("");
                setDetails("");
            } else {
                toast("error", "Failed to submit report. Ensure you are logged in.", "Error");
            }
        } catch (error) {
            toast("error", "An unexpected error occurred.", "Error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className={`flex items-center gap-2 text-gray-400 hover:text-red-500 font-bold transition-colors text-sm ${className}`}
                title="Report this content"
            >
                <Flag size={16} />
                <span>Report</span>
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl relative animate-in fade-in zoom-in duration-200">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mb-6">
                            <AlertTriangle size={24} />
                        </div>

                        <h3 className="text-2xl font-black text-gray-900 mb-2">Report Content</h3>
                        <p className="text-gray-500 font-medium mb-6 text-sm">
                            Please provide details about why this content is inappropriate. Our moderators will review it shortly.
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-2">Reason</label>
                                <select
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    className="w-full bg-gray-50 text-gray-900 border border-gray-100 rounded-xl px-4 py-3 font-medium outline-none focus:border-red-500/50 focus:ring-4 focus:ring-red-500/10 transition-all"
                                    required
                                >
                                    <option value="" disabled>Select a reason...</option>
                                    <option value="SPAM">Spam or Misleading</option>
                                    <option value="INAPPROPRIATE">Inappropriate Content</option>
                                    <option value="SCAM">Suspicious or Scam</option>
                                    <option value="HARASSMENT">Harassment</option>
                                    <option value="OTHER">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-2">Additional Details (Optional)</label>
                                <textarea
                                    value={details}
                                    onChange={(e) => setDetails(e.target.value)}
                                    className="w-full bg-gray-50 text-gray-900 border border-gray-100 rounded-xl px-4 py-3 font-medium outline-none focus:border-red-500/50 focus:ring-4 focus:ring-red-500/10 transition-all resize-none h-24"
                                    placeholder="Please provide any additional context..."
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-red-600 text-white rounded-xl py-4 font-black uppercase tracking-wider text-sm hover:bg-red-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? "Submitting..." : "Submit Report"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
