"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Navbar from "@/components/navbar";
import { Shield, ArrowLeft, Upload, CheckCircle2, AlertCircle, Loader2, FileText, MapPin } from "lucide-react";
import Link from "next/link";

export default function VerifyPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [idCard, setIdCard] = useState<File | null>(null);
    const [addressProof, setAddressProof] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    if (status === "loading") {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!idCard || !addressProof) {
            setError("Please upload both required documents.");
            return;
        }

        setUploading(true);
        setError("");

        try {
            const formData = new FormData();
            formData.append("idCard", idCard);
            formData.append("addressProof", addressProof);

            const res = await fetch("/api/upload/verification", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) throw new Error("Upload failed");

            setSuccess(true);
            setTimeout(() => {
                router.push("/dashboard");
            }, 3000);
        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="pt-32 pb-12 max-w-2xl mx-auto px-4 text-center">
                    <div className="bg-white rounded-3xl p-12 border border-gray-100 shadow-xl">
                        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-100">
                            <CheckCircle2 className="text-emerald-600" size={40} />
                        </div>
                        <h1 className="text-3xl font-black text-gray-900 mb-4">Documents Submitted!</h1>
                        <p className="text-gray-500 font-medium mb-8 leading-relaxed">
                            Thank you for verifying your identity. Our admin team will review your documents within 24-48 hours.
                            You'll be redirected to your dashboard shortly.
                        </p>
                        <Link href="/dashboard" className="text-blue-600 font-bold hover:underline">
                            Return to Dashboard now
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className="pt-10 pb-12 max-w-3xl mx-auto px-4">
                <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 font-bold mb-8 transition-colors">
                    <ArrowLeft size={18} /> Back to Dashboard
                </Link>

                <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
                    <div className="bg-blue-600 p-8 text-white">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-md">
                                <Shield size={32} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black">Verify Your Identity</h1>
                                <p className="text-blue-100 font-medium opacity-80">Secure your account and gain employer trust</p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-8">
                        {error && (
                            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 animate-shake">
                                <AlertCircle size={20} />
                                <p className="text-sm font-bold">{error}</p>
                            </div>
                        )}

                        <div className="grid md:grid-cols-2 gap-8">
                            {/* ID Card Upload */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 border border-blue-100">
                                        <FileText size={20} />
                                    </div>
                                    <h3 className="font-bold text-gray-900">
                                        {(session?.user as any)?.role === "EMPLOYER" ? "Business ID / Permit" : "Valid ID Card"}
                                    </h3>
                                </div>
                                <p className="text-sm text-gray-500 leading-relaxed font-medium">
                                    {(session?.user as any)?.role === "EMPLOYER"
                                        ? "Upload a clear photo of your SEC/DTI registration, Mayor's Permit, or Company ID."
                                        : "Upload a clear photo of your Passport, Driver's License, or National ID."}
                                </p>
                                <label className={`relative block group cursor-pointer border-2 border-dashed rounded-3xl p-8 transition-all ${idCard ? 'border-emerald-200 bg-emerald-50/30' : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/30'}`}>
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*,.pdf"
                                        onChange={(e) => setIdCard(e.target.files?.[0] || null)}
                                    />
                                    <div className="text-center">
                                        <Upload className={`mx-auto mb-4 transition-colors ${idCard ? 'text-emerald-500' : 'text-gray-400 group-hover:text-blue-500'}`} size={32} />
                                        <p className="text-sm font-bold text-gray-900 mb-1">
                                            {idCard ? idCard.name : ((session?.user as any)?.role === "EMPLOYER" ? "Click to upload Business ID" : "Click to upload ID")}
                                        </p>
                                        <p className="text-xs text-gray-400">PNG, JPG or PDF up to 10MB</p>
                                    </div>
                                </label>
                            </div>

                            {/* Address Proof Upload */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 border border-blue-100">
                                        <MapPin size={20} />
                                    </div>
                                    <h3 className="font-bold text-gray-900">Proof of Address</h3>
                                </div>
                                <p className="text-sm text-gray-500 leading-relaxed font-medium">
                                    Utility bill (water, electric) or Bank statement from the last 3 months.
                                </p>
                                <label className={`relative block group cursor-pointer border-2 border-dashed rounded-3xl p-8 transition-all ${addressProof ? 'border-emerald-200 bg-emerald-50/30' : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/30'}`}>
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*,.pdf"
                                        onChange={(e) => setAddressProof(e.target.files?.[0] || null)}
                                    />
                                    <div className="text-center">
                                        <Upload className={`mx-auto mb-4 transition-colors ${addressProof ? 'text-emerald-500' : 'text-gray-400 group-hover:text-blue-500'}`} size={32} />
                                        <p className="text-sm font-bold text-gray-900 mb-1">
                                            {addressProof ? addressProof.name : "Click to upload Bill"}
                                        </p>
                                        <p className="text-xs text-gray-400">PNG, JPG or PDF up to 10MB</p>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-gray-100">
                            <div className="flex items-start gap-3 mb-8 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                <AlertCircle className="text-blue-500 shrink-0 mt-0.5" size={18} />
                                <p className="text-xs text-gray-500 font-medium leading-relaxed">
                                    By submitting these documents, you authorize OnlineJob to verify your identity.
                                    Your data is encrypted and used only for verification purposes.
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={uploading}
                                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
                            >
                                {uploading ? (
                                    <>
                                        <Loader2 className="animate-spin" size={24} />
                                        Uploading Documents...
                                    </>
                                ) : (
                                    <>
                                        Submit for Verification
                                        <Shield size={24} className="group-hover:scale-110 transition-transform" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
