"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import {
    ShieldCheck,
    UserCheck,
    Smartphone,
    Mail,
    MapPin,
    FileText,
    AlertCircle,
    CheckCircle2,
    ChevronRight,
    ShieldAlert,
    Loader2,
    Upload
} from "lucide-react";

export default function VerificationPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Mock Trust Score - In a real app, this would come from the database
    const trustScore = 45;

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    const steps = [
        {
            id: "email",
            title: "Email Verification",
            description: "Confirm your registered email address.",
            score: 10,
            status: "completed",
            icon: <Mail className="text-green-600" />
        },
        {
            id: "id-proof",
            title: "Government ID",
            description: "Upload a clear photo of your passport, driver's license, or national ID.",
            score: 40,
            status: "pending",
            icon: <FileText className="text-blue-600" />
        },
        {
            id: "phone",
            title: "Phone Verification",
            description: "Secure your account with a verified mobile number.",
            score: 15,
            status: "pending",
            icon: <Smartphone className="text-indigo-600" />
        },
        {
            id: "address",
            title: "Address Verification",
            description: "Provide proof of your current residential address.",
            score: 20,
            status: "locked",
            icon: <MapPin className="text-gray-400" />
        },
        {
            id: "biometric",
            title: "Liveness Check",
            description: "A quick selfie scan to verify you are a real person.",
            score: 15,
            status: "locked",
            icon: <UserCheck className="text-gray-400" />
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <Navbar />

            <div className="pt-32 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row gap-12">

                    {/* Left Column: Trust Score Overview */}
                    <aside className="lg:w-96 space-y-8">
                        <div className="bg-white rounded-3xl p-10 border border-gray-100 shadow-xl shadow-blue-100/20 text-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-2 bg-gray-100">
                                <div
                                    className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-1000"
                                    style={{ width: `${trustScore}%` }}
                                />
                            </div>

                            <div className="mb-6 relative inline-block">
                                <div className="w-32 h-32 rounded-full border-8 border-gray-50 flex items-center justify-center mx-auto">
                                    <span className="text-4xl font-black text-gray-900">{trustScore}</span>
                                </div>
                                <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2 rounded-xl border-4 border-white">
                                    <ShieldCheck size={24} />
                                </div>
                            </div>

                            <h2 className="text-xl font-black text-gray-900 mb-2">Your Trust Score</h2>
                            <p className="text-gray-500 text-sm font-medium mb-8">Higher scores unlock more job applications and better visibility.</p>

                            <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl">
                                <p className="text-xs font-black text-blue-700 uppercase tracking-widest leading-loose">
                                    {trustScore < 50 ? "Weak Profile" : trustScore < 80 ? "Trusted Worker" : "Top Tier Identity"}
                                </p>
                            </div>
                        </div>

                        <div className="bg-gray-900 rounded-3xl p-8 text-white">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <ShieldAlert className="text-orange-400" /> Why verify?
                            </h3>
                            <ul className="space-y-4 text-sm text-gray-400 font-medium">
                                <li className="flex gap-3">
                                    <CheckCircle2 size={18} className="text-green-500 shrink-0" />
                                    Employers prefer workers with high trust scores.
                                </li>
                                <li className="flex gap-3">
                                    <CheckCircle2 size={18} className="text-green-500 shrink-0" />
                                    Apply to premium job listings.
                                </li>
                                <li className="flex gap-3">
                                    <CheckCircle2 size={18} className="text-green-500 shrink-0" />
                                    Your profile stands out in search results.
                                </li>
                            </ul>
                        </div>
                    </aside>

                    {/* Right Column: Verification Steps */}
                    <main className="flex-1 space-y-8">
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 mb-2">Verification Center</h1>
                            <p className="text-gray-500 font-medium">Complete the steps below to boost your credibility.</p>
                        </div>

                        <div className="grid gap-4">
                            {steps.map((step) => (
                                <div
                                    key={step.id}
                                    className={`bg-white rounded-3xl p-8 border border-gray-100 flex flex-col md:flex-row items-center gap-8 transition-all ${step.status === 'locked' ? 'opacity-50 grayscale' : 'hover:shadow-xl hover:shadow-blue-50/50'}`}
                                >
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 border ${step.status === 'completed' ? 'bg-green-50 border-green-100' : 'bg-gray-50 border-gray-100'}`}>
                                        {step.status === 'completed' ? <CheckCircle2 className="text-green-600" size={32} /> : step.icon}
                                    </div>

                                    <div className="flex-1 text-center md:text-left">
                                        <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                                            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">{step.title}</h3>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                                                +{step.score} Points
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 font-medium leading-relaxed max-w-lg">
                                            {step.description}
                                        </p>
                                    </div>

                                    <div className="shrink-0 w-full md:w-auto">
                                        {step.status === 'completed' ? (
                                            <span className="text-sm font-black text-green-600 uppercase tracking-widest flex items-center gap-2 justify-center">
                                                Verified <CheckCircle2 size={16} />
                                            </span>
                                        ) : step.status === 'pending' ? (
                                            <button className="w-full md:w-auto px-8 py-4 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-3">
                                                Start Now <ChevronRight size={16} />
                                            </button>
                                        ) : (
                                            <span className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 justify-center">
                                                Locked
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Simulated Upload Area for Government ID */}
                        <div className="bg-white rounded-3xl p-10 border-2 border-dashed border-blue-200 bg-blue-50/20 text-center">
                            <div className="max-w-md mx-auto">
                                <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                    <Upload size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-4">Secure Document Upload</h3>
                                <p className="text-sm text-gray-500 font-medium mb-8 leading-relaxed">
                                    Upload a high-quality photo of your government-issued ID. We encrypt all documents and only use them for identity verification.
                                </p>

                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <button className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-100">
                                        Select File
                                    </button>
                                    <button className="px-8 py-4 bg-white text-gray-700 border border-gray-100 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-50 transition-all">
                                        How it works
                                    </button>
                                </div>

                                <div className="mt-8 flex items-center justify-center gap-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                    <span className="flex items-center gap-1.5"><ShieldCheck size={14} /> Encrypted</span>
                                    <span className="flex items-center gap-1.5"><AlertCircle size={14} /> Confidential</span>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
