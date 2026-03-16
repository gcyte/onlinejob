"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Briefcase, User, Mail, Lock, Loader2, ArrowRight, ShieldCheck, Users, Star } from "lucide-react";
import { useToast } from "@/components/ui/toast";

export default function RegisterPage() {
    const router = useRouter();
    const [role, setRole] = useState<"FREELANCER" | "EMPLOYER">("FREELANCER");
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const name = formData.get("name") as string;
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        try {
            const res = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password, role }),
            });

            if (res.ok) {
                toast("success", "Account created! Signing you in...", "Welcome aboard 🎉");
                const signInRes = await signIn("credentials", {
                    email,
                    password,
                    redirect: false,
                });

                if (signInRes?.ok) {
                    router.push("/dashboard");
                } else {
                    router.push("/login");
                }
            } else {
                const data = await res.text();
                toast("error", data || "Something went wrong. Please try again.", "Registration Failed");
            }
        } catch {
            toast("error", "Failed to register. Please check your connection and try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Brand Panel */}
            <div className="hidden lg:flex lg:w-[480px] xl:w-[560px] flex-col justify-between p-12 relative overflow-hidden bg-gray-900 flex-shrink-0">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
                    <div
                        className="absolute inset-0 opacity-[0.04]"
                        style={{
                            backgroundImage: "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
                            backgroundSize: "48px 48px"
                        }}
                    />
                </div>

                <div className="relative z-10">
                    <Link href="/" className="flex items-center">
                        <span className="text-xl font-black text-white tracking-tight">
                            Online<span className="text-blue-400">Jobs</span>
                        </span>
                    </Link>
                </div>

                <div className="relative z-10 flex-1 flex flex-col justify-center py-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600/20 rounded-full border border-blue-500/30 text-blue-300 text-xs font-semibold mb-6 w-fit">
                        <Star size={12} className="fill-blue-300" />
                        Join 500,000+ professionals
                    </div>
                    <h2 className="text-4xl font-black text-white leading-tight mb-4">
                        Start your remote<br />career today.
                    </h2>
                    <p className="text-gray-400 text-base font-medium leading-relaxed mb-8 max-w-sm">
                        Create a free account in minutes. No credit card required. Access top employers worldwide.
                    </p>
                    <div className="space-y-4">
                        {[
                            { icon: <ShieldCheck size={18} className="text-emerald-400" />, text: "Free to join — no hidden fees" },
                            { icon: <Users size={18} className="text-blue-400" />, text: "Apply to unlimited job listings" },
                            { icon: <Star size={18} className="text-amber-400 fill-amber-400" />, text: "Build a verified professional profile" },
                        ].map(({ icon, text }) => (
                            <div key={text} className="flex items-center gap-3 text-sm text-gray-300 font-medium">
                                {icon} {text}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="relative z-10 text-xs text-gray-600 font-medium">
                    © 2026 OnlineJobs. All rights reserved.
                </div>
            </div>

            {/* Right Form Panel */}
            <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 xl:px-24 bg-gray-50 overflow-y-auto">
                {/* Mobile logo */}
                <div className="lg:hidden mb-10">
                    <Link href="/" className="flex items-center">
                        <span className="text-lg font-black text-gray-900">
                            Online<span className="text-blue-600">Jobs</span>
                        </span>
                    </Link>
                </div>

                <div className="max-w-md w-full mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Create your account</h1>
                        <p className="text-gray-500 font-medium">
                            Already have one?{" "}
                            <Link href="/login" className="text-blue-600 font-semibold hover:underline">
                                Sign in
                            </Link>
                        </p>
                    </div>

                    {/* Role Toggle */}
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-3">I am joining as a...</label>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                {
                                    value: "FREELANCER" as const,
                                    label: "Freelancer",
                                    sub: "I want to find work",
                                    icon: <User size={22} />,
                                },
                                {
                                    value: "EMPLOYER" as const,
                                    label: "Employer",
                                    sub: "I want to hire talent",
                                    icon: <Briefcase size={22} />,
                                },
                            ].map((opt) => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => setRole(opt.value)}
                                    className={`relative flex flex-col items-center gap-2 p-5 rounded-2xl border-2 transition-all text-left ${role === opt.value
                                            ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm shadow-blue-100"
                                            : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                                        }`}
                                >
                                    <span className={role === opt.value ? "text-blue-600" : "text-gray-400"}>
                                        {opt.icon}
                                    </span>
                                    <div>
                                        <p className="text-sm font-bold">{opt.label}</p>
                                        <p className="text-xs font-medium opacity-70">{opt.sub}</p>
                                    </div>
                                    {role === opt.value && (
                                        <div className="absolute top-2.5 right-2.5 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                                            <div className="w-2 h-2 bg-white rounded-full" />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                            <div className="relative">
                                <User size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                <input
                                    name="name"
                                    type="text"
                                    required
                                    autoComplete="name"
                                    className="input-field !pl-11"
                                    placeholder="Jane Smith"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email address</label>
                            <div className="relative">
                                <Mail size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    autoComplete="email"
                                    className="input-field !pl-11"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                            <div className="relative">
                                <Lock size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                <input
                                    name="password"
                                    type="password"
                                    required
                                    autoComplete="new-password"
                                    minLength={6}
                                    className="input-field !pl-11"
                                    placeholder="Min. 6 characters"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full py-3.5 mt-2 text-[15px]"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <>
                                    Create Account <ArrowRight size={17} />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-xs text-gray-400 font-medium">
                        By creating an account, you agree to our{" "}
                        <Link href="#" className="underline hover:text-gray-600">Terms</Link>{" "}
                        and{" "}
                        <Link href="#" className="underline hover:text-gray-600">Privacy Policy</Link>.
                    </p>
                </div>
            </div>
        </div>
    );
}
