"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Shield, Check, X, User, Mail, FileText, MapPin, Loader2, ExternalLink, AlertCircle } from "lucide-react";

export default function AdminVerificationPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [verifications, setVerifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [adminNotes, setAdminNotes] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        if (status === "unauthenticated" || (session?.user as any)?.role !== "ADMIN") {
            router.push("/");
        } else {
            fetchVerifications();
        }
    }, [status, session, router]);

    const fetchVerifications = async () => {
        try {
            const res = await fetch("/api/admin/verification");
            const data = await res.json();
            setVerifications(data);
        } catch (error) {
            console.error("Fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (profileId: string, action: "APPROVED" | "REJECTED") => {
        setActionLoading(profileId);
        try {
            const res = await fetch("/api/admin/verification", {
                method: "PATCH",
                body: JSON.stringify({
                    profileId,
                    status: action,
                    adminNotes: adminNotes[profileId] || "",
                    type: verifications.find(v => v.id === profileId)?.type
                }),
                headers: { "Content-Type": "application/json" }
            });

            if (res.ok) {
                setVerifications(prev => prev.filter(v => v.id !== profileId));
            }
        } catch (error) {
            console.error("Action error:", error);
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-100">
                    <Shield size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-black text-gray-900">Verification Requests</h1>
                    <p className="text-sm text-gray-500 font-medium">Review and verify freelancer identities</p>
                </div>
            </div>

            {verifications.length === 0 ? (
                <div className="bg-white rounded-3xl p-20 text-center border border-gray-100 shadow-sm">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-dashed border-gray-200">
                        <Shield size={32} className="text-gray-300" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">No Pending Requests</h2>
                    <p className="text-gray-400 font-medium">Sit back and relax! You've cleared all verification tasks.</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {verifications.map((v) => (
                        <div key={v.id} className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-all">
                            <div className="grid lg:grid-cols-3 gap-10">
                                {/* User Info */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 border border-blue-100">
                                            <User size={24} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-black text-gray-900 text-lg">{v.user.name}</h3>
                                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${v.type === 'EMPLOYER' ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-indigo-50 text-indigo-700 border border-indigo-100'}`}>
                                                    {v.type}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-400 font-medium text-sm">
                                                <Mail size={14} />
                                                {v.user.email}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Location</p>
                                            <p className="text-gray-900 font-bold flex items-center gap-2">
                                                <MapPin size={16} className="text-blue-500" />
                                                {v.location || "Not specified"}
                                            </p>
                                        </div>
                                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Phone</p>
                                            <p className="text-gray-900 font-bold">{v.phone || "Not specified"}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Documents */}
                                <div className="space-y-4">
                                    <h4 className="font-black text-gray-900">Submitted Documents</h4>
                                    <div className="grid gap-3">
                                        <a
                                            href={v.idCardUrl}
                                            target="_blank"
                                            className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-center justify-between group hover:bg-blue-600 hover:text-white transition-all"
                                        >
                                            <div className="flex items-center gap-3">
                                                <FileText size={20} className="text-blue-600 group-hover:text-white" />
                                                <span className="font-bold text-sm">
                                                    {v.type === 'EMPLOYER' ? "Business ID / Permit" : "Valid Government ID"}
                                                </span>
                                            </div>
                                            <ExternalLink size={16} className="opacity-40 group-hover:opacity-100" />
                                        </a>
                                        <a
                                            href={v.addressProofUrl}
                                            target="_blank"
                                            className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-center justify-between group hover:bg-blue-600 hover:text-white transition-all"
                                        >
                                            <div className="flex items-center gap-3">
                                                <MapPin size={20} className="text-blue-600 group-hover:text-white" />
                                                <span className="font-bold text-sm">Proof of Address</span>
                                            </div>
                                            <ExternalLink size={16} className="opacity-40 group-hover:opacity-100" />
                                        </a>
                                    </div>

                                    <div className="mt-4 p-4 bg-orange-50 border border-orange-100 rounded-2xl flex items-start gap-3">
                                        <AlertCircle size={18} className="text-orange-600 mt-0.5" />
                                        <p className="text-xs text-orange-700 font-bold leading-relaxed">
                                            Ensure the name matches the profile and documents are clear and valid.
                                        </p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="space-y-4">
                                    <h4 className="font-black text-gray-900">Final Decision</h4>
                                    <textarea
                                        placeholder={`Add notes for the ${v.type.toLowerCase()} (e.g. reason for rejection)`}
                                        className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-500 transition-all outline-none min-h-[100px]"
                                        value={adminNotes[v.id] || ""}
                                        onChange={(e) => setAdminNotes({ ...adminNotes, [v.id]: e.target.value })}
                                    />
                                    <div className="flex gap-4 pt-2">
                                        <button
                                            onClick={() => handleAction(v.id, "REJECTED")}
                                            disabled={!!actionLoading}
                                            className="flex-1 py-3 bg-red-50 text-red-600 rounded-xl font-black hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2 border border-red-100 disabled:opacity-50"
                                        >
                                            {actionLoading === v.id ? <Loader2 className="animate-spin" size={20} /> : <X size={20} />}
                                            Reject
                                        </button>
                                        <button
                                            onClick={() => handleAction(v.id, "APPROVED")}
                                            disabled={!!actionLoading}
                                            className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-black hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            {actionLoading === v.id ? <Loader2 className="animate-spin" size={20} /> : <Check size={20} />}
                                            Approve
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
