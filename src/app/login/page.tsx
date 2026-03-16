"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Briefcase, Mail, Lock, Loader2, ArrowRight, ShieldCheck, Users, Star } from "lucide-react";
import { useToast } from "@/components/ui/toast";

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        try {
            const res = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (res?.error) {
                toast("error", "Invalid email or password. Please try again.", "Login Failed");
            } else {
                toast("success", "Welcome back! Redirecting to your dashboard...", "Signed In");
                router.push(callbackUrl);
                router.refresh();
            }
        } catch {
            toast("error", "An unexpected error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Brand Panel */}
            <div className="hidden lg:flex lg:w-[480px] xl:w-[560px] flex-col justify-between p-12 relative overflow-hidden bg-gray-900 flex-shrink-0">
                {/* Background decoration */}
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl" />
                    <div
                        className="absolute inset-0 opacity-[0.04]"
                        style={{
                            backgroundImage: "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
                            backgroundSize: "48px 48px"
                        }}
                    />
                </div>

                {/* Logo */}
                <div className="relative z-10">
                    <Link href="/" className="flex items-center gap-2 group">
                        <span className="text-xl font-black text-white tracking-tight">
                            Online<span className="text-blue-400">Jobs</span>
                        </span>
                    </Link>
                </div>

                {/* Hero copy */}
                <div className="relative z-10 flex-1 flex flex-col justify-center py-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600/20 rounded-full border border-blue-500/30 text-blue-300 text-xs font-semibold mb-6 w-fit">
                        <Star size={12} className="fill-blue-300" />
                        #1 Platform for Online Work
                    </div>
                    <h2 className="text-4xl font-black text-white leading-tight mb-4">
                        Your next hire<br />is waiting for you.
                    </h2>
                    <p className="text-gray-400 text-base font-medium leading-relaxed mb-8 max-w-sm">
                        Access thousands of pre-vetted remote professionals ready to grow your business remotely.
                    </p>

                    <div className="space-y-4">
                        {[
                            { icon: <ShieldCheck size={18} className="text-emerald-400" />, text: "Verified identities & trust scores" },
                            { icon: <Users size={18} className="text-blue-400" />, text: "500,000+ professional workers" },
                            { icon: <Star size={18} className="text-amber-400 fill-amber-400" />, text: "Rated 4.9/5 by 12,000+ employers" },
                        ].map(({ icon, text }) => (
                            <div key={text} className="flex items-center gap-3 text-sm text-gray-300 font-medium">
                                {icon} {text}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer copy */}
                <div className="relative z-10 text-xs text-gray-600 font-medium">
                    © 2026 OnlineJobs. All rights reserved.
                </div>
            </div>

            {/* Right Form Panel */}
            <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 xl:px-24 bg-gray-50">
                {/* Mobile logo */}
                <div className="lg:hidden mb-10">
                    <Link href="/" className="flex items-center gap-2">
                        <span className="text-lg font-black text-gray-900">
                            Online<span className="text-blue-600">Jobs</span>
                        </span>
                    </Link>
                </div>

                <div className="max-w-md w-full mx-auto">
                    <div className="mb-10">
                        <h1 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Welcome back</h1>
                        <p className="text-gray-500 font-medium">
                            Don&apos;t have an account?{" "}
                            <Link href="/register" className="text-blue-600 font-semibold hover:underline">
                                Create one free
                            </Link>
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                Email address
                            </label>
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
                            <div className="flex justify-between items-center mb-1.5">
                                <label className="block text-sm font-semibold text-gray-700">
                                    Password
                                </label>
                                <Link href="#" className="text-xs text-blue-600 font-semibold hover:underline">
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative">
                                <Lock size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                <input
                                    name="password"
                                    type="password"
                                    required
                                    autoComplete="current-password"
                                    className="input-field !pl-11"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full py-3.5 mt-2 text-[15px]"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <>
                                    Sign In <ArrowRight size={17} />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-xs text-gray-400 font-medium">
                        By signing in, you agree to our{" "}
                        <Link href="#" className="underline hover:text-gray-600">Terms of Service</Link>{" "}
                        and{" "}
                        <Link href="#" className="underline hover:text-gray-600">Privacy Policy</Link>.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">Loading...</div>}>
            <LoginForm />
        </Suspense>
    );
}
