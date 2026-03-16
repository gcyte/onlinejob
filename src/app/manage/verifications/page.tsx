"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, FileText, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import Link from "next/link";

interface VerificationRequest {
    id: string;
    userId: string;
    idCardUrl: string | null;
    addressProofUrl: string | null;
    verificationStatus: string;
    user: {
        name: string | null;
        email: string | null;
    };
}

export default function VerificationQueuePage() {
    const [requests, setRequests] = useState<VerificationRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [actioningId, setActioningId] = useState<string | null>(null);
    const [notes, setNotes] = useState("");
    const { toast } = useToast();

    const fetchQueue = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/admin/verification");
            if (res.ok) {
                setRequests(await res.json());
            }
        } catch (error) {
            console.error("Error fetching verification queue", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchQueue();
    }, []);

    const handleAction = async (id: string, status: "APPROVED" | "REJECTED") => {
        if (status === "REJECTED" && !notes.trim()) {
            toast("warning", "Please provide a reason for rejection.", "Reason Required");
            return;
        }

        setActioningId(id);
        try {
            const res = await fetch("/api/admin/verification", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ profileId: id, status, adminNotes: notes || undefined })
            });

            if (res.ok) {
                toast("success", `Verification ${status.toLowerCase()}`, "Success");
                setNotes("");
                fetchQueue();
            } else {
                toast("error", "Failed to update verification status", "Error");
            }
        } catch (error) {
            toast("error", "An error occurred", "Error");
        } finally {
            setActioningId(null);
        }
    };

    return (
        <div className="space-y-10">
            <div>
                <h1 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Verification Queue</h1>
                <p className="text-gray-500 font-medium">Review and approve freelancer identity documents.</p>
            </div>

            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
                {isLoading ? (
                    <div className="p-12 text-center text-gray-400 font-medium animate-pulse">Loading queue...</div>
                ) : requests.length === 0 ? (
                    <div className="p-16 text-center flex flex-col items-center">
                        <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-4 border border-blue-100">
                            <CheckCircle2 size={32} />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 mb-2">Queue Empty</h3>
                        <p className="text-gray-500 font-medium">There are no pending verification requests.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {requests.map((req) => (
                            <div key={req.id} className="p-8 hover:bg-gray-50/50 transition-colors">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl uppercase shadow-md">
                                            {req.user.name?.charAt(0) || "U"}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-gray-900">{req.user.name}</h3>
                                            <p className="text-gray-500 font-medium text-sm">{req.user.email}</p>
                                        </div>
                                    </div>
                                    <Link
                                        href={`/freelancers/${req.id}`}
                                        target="_blank"
                                        className="text-blue-600 font-bold hover:underline text-sm"
                                    >
                                        View Full Profile ↗
                                    </Link>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                    {/* ID Card */}
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-gray-900 font-black">
                                            <ImageIcon size={18} className="text-blue-500" /> Government ID
                                        </div>
                                        <div className="aspect-[1.58] bg-gray-100 rounded-2xl border border-gray-200 overflow-hidden relative group">
                                            {req.idCardUrl ? (
                                                <a href={req.idCardUrl} target="_blank" rel="noreferrer" className="block w-full h-full">
                                                    <img src={req.idCardUrl} alt="ID Card" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold backdrop-blur-sm">
                                                        Click to expand
                                                    </div>
                                                </a>
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400 font-medium">No document provided</div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Address Proof */}
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-gray-900 font-black">
                                            <FileText size={18} className="text-indigo-500" /> Proof of Address
                                        </div>
                                        <div className="aspect-[1.58] bg-gray-100 rounded-2xl border border-gray-200 overflow-hidden relative group">
                                            {req.addressProofUrl ? (
                                                <a href={req.addressProofUrl} target="_blank" rel="noreferrer" className="block w-full h-full">
                                                    {req.addressProofUrl.endsWith('.pdf') ? (
                                                        <div className="w-full h-full flex flex-col items-center justify-center text-indigo-600 bg-indigo-50">
                                                            <FileText size={48} className="mb-2" />
                                                            <span className="font-bold">View PDF</span>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <img src={req.addressProofUrl} alt="Address Proof" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold backdrop-blur-sm">
                                                                Click to expand
                                                            </div>
                                                        </>
                                                    )}
                                                </a>
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400 font-medium">No document provided</div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Decision Section */}
                                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                                    <label className="block text-sm font-bold text-gray-900 mb-2">Decision Notes (Sent to user)</label>
                                    <div className="flex flex-col md:flex-row gap-4">
                                        <input
                                            type="text"
                                            placeholder="Optional for approval, required for rejection..."
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-3 font-medium outline-none focus:border-blue-500 transition"
                                        />
                                        <div className="flex gap-2 shrink-0">
                                            <button
                                                onClick={() => handleAction(req.id, "REJECTED")}
                                                disabled={actioningId === req.id}
                                                className="bg-white text-red-600 hover:bg-red-50 font-bold px-6 py-3 rounded-xl transition border border-red-200 flex items-center gap-2 disabled:opacity-50"
                                            >
                                                <XCircle size={18} /> Reject
                                            </button>
                                            <button
                                                onClick={() => handleAction(req.id, "APPROVED")}
                                                disabled={actioningId === req.id}
                                                className="bg-emerald-600 text-white hover:bg-emerald-700 font-bold px-6 py-3 rounded-xl transition shadow-lg shadow-emerald-600/20 flex items-center gap-2 disabled:opacity-50"
                                            >
                                                <CheckCircle2 size={18} /> Approve
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
