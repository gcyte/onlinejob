"use client";

import { useState } from "react";
import { Copy, Share2, CheckCircle2, ExternalLink } from "lucide-react";

export default function PublicProfileCard({ profileId, role }: { profileId: string, role: string }) {
    const [copied, setCopied] = useState(false);
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const profileUrl = `${baseUrl}/${role === "FREELANCER" ? "freelancers" : "companies"}/${profileId}`;

    const copyLink = () => {
        navigator.clipboard.writeText(profileUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!profileId) return null;

    return (
        <div className="bg-gradient-to-br from-gray-900 to-blue-600 rounded-[10px] p-8 text-white shadow-xl shadow-blue-100/50 relative overflow-hidden">
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-xl font-bold mb-1">Your Public Profile is Live! 🚀</h3>
                        <p className="text-blue-200 text-sm font-medium">Share this link with employers or on social media.</p>
                    </div>
                    <div className="p-3 bg-white/10 rounded-[10px]">
                        <Share2 size={24} />
                    </div>
                </div>

                <div className="flex gap-2 mb-6">
                    <input
                        readOnly
                        value={profileUrl}
                        className="flex-1 bg-white/10 border border-white/20 rounded-[10px] px-4 py-3 text-sm font-medium outline-none"
                    />
                    <button
                        onClick={copyLink}
                        className="px-6 py-3 bg-blue-600 text-white rounded-[10px] font-bold hover:bg-blue-700 transition-all flex items-center gap-2 whitespace-nowrap shadow-lg shadow-blue-900/20 group/copy"
                    >
                        <span className="!text-white flex items-center gap-2">
                            {copied ? <><CheckCircle2 size={18} /> Copied</> : <><Copy size={18} /> Copy Link</>}
                        </span>
                    </button>
                </div>

                <a
                    href={profileUrl}
                    target="_blank"
                    className="inline-flex items-center gap-2 text-sm font-bold text-blue-300 hover:text-white transition-colors"
                >
                    View my public profile <ExternalLink size={14} />
                </a>
            </div>

            {/* Decorative elements */}
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl"></div>
            <div className="absolute -left-10 -top-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl"></div>
        </div>
    );
}
