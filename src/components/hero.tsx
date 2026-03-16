"use client";

import Link from "next/link";
import { Search, MapPin, TrendingUp, Users, Building2, ShieldCheck, ArrowRight, Star } from "lucide-react";

export default function Hero() {
    return (
        <section className="relative pt-28 pb-20 lg:pt-40 lg:pb-32 overflow-hidden bg-white">
            {/* Background blobs */}
            <div className="absolute top-0 right-0 w-[700px] h-[700px] -translate-y-1/3 translate-x-1/3 bg-blue-50 rounded-full blur-[100px] opacity-50 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] translate-y-1/3 -translate-x-1/3 bg-indigo-50 rounded-full blur-[80px] opacity-60 pointer-events-none" />

            {/* Subtle grid on top */}
            <div
                className="absolute inset-0 pointer-events-none opacity-[0.025]"
                style={{
                    backgroundImage: "linear-gradient(#2563eb 1px, transparent 1px), linear-gradient(90deg, #2563eb 1px, transparent 1px)",
                    backgroundSize: "64px 64px"
                }}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center max-w-4xl mx-auto">

                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-semibold mb-8">
                        <TrendingUp size={15} />
                        <span>#1 Global Remote Hiring Platform</span>
                        <span className="flex gap-0.5 ml-1">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} size={12} className="fill-amber-400 text-amber-400" />
                            ))}
                        </span>
                    </div>

                    {/* Headline */}
                    <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-gray-900 mb-6 tracking-tight leading-[1.05]">
                        Hire the Best{" "}
                        <span className="gradient-text">Premium</span>
                        <br />
                        Virtual Assistants
                    </h1>

                    <p className="text-lg sm:text-xl text-gray-500 mb-10 leading-relaxed max-w-2xl mx-auto font-medium">
                        Accelerate your growth with the world&apos;s most talented remote workforce. Simple, secure, and professional.
                    </p>

                    {/* Search */}
                    <div className="max-w-3xl mx-auto mb-6">
                        <div className="flex flex-col sm:flex-row gap-3 bg-white border border-gray-200 p-2 rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,.08)]">
                            <div className="flex-1 flex items-center gap-3 px-4 py-3">
                                <Search className="text-blue-500 flex-shrink-0" size={20} />
                                <input
                                    type="text"
                                    placeholder="Job title or skills..."
                                    className="w-full bg-transparent border-none outline-none text-gray-900 font-medium placeholder:text-gray-400 text-base"
                                />
                            </div>
                            <div className="hidden sm:block w-px bg-gray-100 my-2" />
                            <div className="flex-1 flex items-center gap-3 px-4 py-3">
                                <MapPin className="text-blue-500 flex-shrink-0" size={20} />
                                <input
                                    type="text"
                                    placeholder="Location or remote..."
                                    className="w-full bg-transparent border-none outline-none text-gray-900 font-medium placeholder:text-gray-400 text-base"
                                />
                            </div>
                            <Link
                                href="/jobs"
                                className="btn-primary rounded-xl px-8 py-3 text-sm whitespace-nowrap"
                            >
                                Search Jobs
                            </Link>
                        </div>
                    </div>

                    {/* Popular searches */}
                    <div className="flex flex-wrap justify-center gap-2 mb-12 text-sm">
                        <span className="text-gray-400 font-medium self-center">Popular:</span>
                        {["Virtual Assistant", "Customer Support", "Web Developer", "Graphic Designer", "SEO Specialist"].map(tag => (
                            <Link
                                key={tag}
                                href={`/jobs?q=${encodeURIComponent(tag)}`}
                                className="px-3 py-1.5 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 border border-gray-200 hover:border-blue-200 rounded-full text-gray-600 font-medium transition-all text-xs"
                            >
                                {tag}
                            </Link>
                        ))}
                    </div>

                    {/* Stats row */}
                    <div className="flex flex-wrap justify-center gap-8">
                        {[
                            { icon: <ShieldCheck className="text-emerald-500" size={20} />, label: "Verified IDs" },
                            { icon: <Users className="text-blue-500" size={20} />, label: "500,000+ Workers" },
                            { icon: <Building2 className="text-violet-500" size={20} />, label: "50,000+ Companies" },
                        ].map(({ icon, label }) => (
                            <div key={label} className="flex items-center gap-2.5 text-gray-500 font-medium text-sm">
                                {icon} {label}
                            </div>
                        ))}
                    </div>

                    {/* CTA links */}
                    <div className="mt-10 flex flex-wrap justify-center gap-4">
                        <Link
                            href="/register"
                            className="btn-primary gap-2.5"
                        >
                            Post a Job Free <ArrowRight size={16} />
                        </Link>
                        <Link
                            href="/freelancers"
                            className="btn-secondary"
                        >
                            Browse Talent
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
