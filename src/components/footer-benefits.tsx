"use client";

import {
    CheckCircle2, Zap, Shield, Search, MessageSquare, HeartHandshake,
    Twitter, Linkedin, Facebook
} from "lucide-react";
import Link from "next/link";

const BENEFITS = [
    {
        icon: <Search size={22} />,
        color: "text-blue-600",
        bg: "bg-blue-50",
        hoverBg: "group-hover:bg-blue-600",
        title: "Smart Search",
        description: "Browse thousands of profiles with granular skill filters to find exactly who you need.",
    },
    {
        icon: <MessageSquare size={22} />,
        color: "text-indigo-600",
        bg: "bg-indigo-50",
        hoverBg: "group-hover:bg-indigo-600",
        title: "Direct Contact",
        description: "Communicate directly with applicants through our integrated messaging system.",
    },
    {
        icon: <Shield size={22} />,
        color: "text-emerald-600",
        bg: "bg-emerald-50",
        hoverBg: "group-hover:bg-emerald-600",
        title: "Verified Talent",
        description: "Hire with confidence. We verify IDs and track Trust Scores for all workers.",
    },
    {
        icon: <Zap size={22} />,
        color: "text-amber-600",
        bg: "bg-amber-50",
        hoverBg: "group-hover:bg-amber-600",
        title: "Quick Scaling",
        description: "Scale your team up or down in days, not months. The talent pool is endless.",
    },
];

export function Benefits() {
    return (
        <section className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <div className="inline-block px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs font-bold uppercase tracking-widest mb-5 border border-blue-100">
                        The Advantage
                    </div>
                    <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-5 tracking-tight">
                        Why Choose{" "}
                        <span className="gradient-text">OnlineJobs</span>?
                    </h2>
                    <p className="text-lg text-gray-500 font-medium leading-relaxed">
                        The most reliable ecosystem for outsourcing and remote work.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {BENEFITS.map((item, idx) => (
                        <div
                            key={idx}
                            className="group p-8 rounded-3xl border border-gray-100 bg-white hover:border-blue-100 hover:shadow-[0_20px_60px_-12px_rgba(0,0,0,.08)] transition-all duration-400 hover:-translate-y-1.5"
                        >
                            <div
                                className={`w-14 h-14 rounded-2xl ${item.bg} ${item.hoverBg} flex items-center justify-center mb-6 transition-all duration-400 shadow-sm group-hover:shadow-lg group-hover:shadow-blue-200/50`}
                            >
                                <span className={`${item.color} group-hover:text-white transition-colors duration-400`}>
                                    {item.icon}
                                </span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-3">{item.title}</h3>
                            <p className="text-sm text-gray-500 font-medium leading-relaxed">{item.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

const NAV = {
    Employers: [
        { label: "Post a Job", href: "/jobs/new" },
        { label: "Search Resumes", href: "/freelancers" },
        { label: "Pricing Plans", href: "#" },
    ],
    Workers: [
        { label: "Find Remote Jobs", href: "/jobs" },
        { label: "Create Profile", href: "/register" },
        { label: "Job Alerts", href: "#" },
    ],
    Support: [
        { label: "Help Center", href: "#" },
        { label: "Contact Us", href: "#" },
        { label: "Privacy Policy", href: "#" },
    ],
};

const SOCIALS = [
    { icon: <Twitter size={16} />, href: "#", label: "Twitter" },
    { icon: <Linkedin size={16} />, href: "#", label: "LinkedIn" },
    { icon: <Facebook size={16} />, href: "#", label: "Facebook" },
];

export function Footer() {
    return (
        <footer className="bg-gray-950 text-gray-500">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-14">
                    {/* Brand */}
                    <div className="col-span-2 md:col-span-1">
                        <Link href="/" className="inline-flex items-center mb-6 group">
                            <span className="text-xl font-black text-white tracking-tight">
                                Online<span className="text-blue-500">Jobs</span>
                            </span>
                        </Link>
                        <p className="text-sm leading-relaxed font-medium text-gray-500 max-w-xs">
                            The world&apos;s leading community for remote talent. Connecting premium employers with verified experts.
                        </p>
                        <div className="flex items-center gap-2 mt-6">
                            {SOCIALS.map(({ icon, href, label }) => (
                                <Link
                                    key={label}
                                    href={href}
                                    aria-label={label}
                                    className="w-9 h-9 rounded-xl bg-gray-800 hover:bg-blue-600 flex items-center justify-center text-gray-400 hover:text-white transition-all"
                                >
                                    {icon}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Links */}
                    {Object.entries(NAV).map(([section, links]) => (
                        <div key={section}>
                            <h4 className="text-white font-bold text-sm mb-5">{section}</h4>
                            <ul className="space-y-3">
                                {links.map(({ label, href }) => (
                                    <li key={label}>
                                        <Link
                                            href={href}
                                            className="text-sm text-gray-500 hover:text-gray-200 font-medium transition-colors"
                                        >
                                            {label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="pt-8 border-t border-gray-800/60 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-gray-600 font-medium">
                        © 2026 OnlineJobs. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6">
                        {["Terms", "Privacy", "Cookies"].map((item) => (
                            <Link key={item} href="#" className="text-xs text-gray-600 hover:text-gray-300 font-medium transition-colors">
                                {item}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}
