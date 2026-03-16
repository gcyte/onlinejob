"use client";

import { Search, MapPin } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function SearchHeader() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [q, setQ] = useState(searchParams.get("q") || "");
    const [location, setLocation] = useState(searchParams.get("location") || "");

    const popularTags = ["React Developer", "Virtual Assistant", "SEO Expert"];

    const handleSearch = () => {
        const params = new URLSearchParams(searchParams.toString());
        if (q) params.set("q", q);
        else params.delete("q");

        if (location) params.set("location", location);
        else params.delete("location");

        router.push(`/jobs?${params.toString()}`);
    };

    return (
        <section className="bg-white border-b border-gray-100 py-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row gap-4 items-stretch bg-white p-3 rounded-3xl shadow-xl shadow-blue-100/20 border border-gray-100">
                    {/* Job Title Search */}
                    <div className="flex-1 relative group">
                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-blue-500 group-focus-within:text-blue-600 transition-colors z-10">
                            <Search size={20} />
                        </div>
                        <input
                            type="text"
                            placeholder="Job title, keywords, or company..."
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            className="w-full pl-12 pr-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-100 outline-none font-semibold text-gray-900 transition-all placeholder:text-gray-400 placeholder:font-medium"
                        />
                    </div>

                    {/* Location Search */}
                    <div className="flex-1 relative group">
                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors z-10">
                            <MapPin size={20} />
                        </div>
                        <input
                            type="text"
                            placeholder="City or Remote"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            className="w-full pl-12 pr-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-100 outline-none font-semibold text-gray-900 transition-all placeholder:text-gray-400 placeholder:font-medium"
                        />
                    </div>

                    {/* Search Button */}
                    <button
                        onClick={handleSearch}
                        className="px-10 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 active:scale-95 transition-all whitespace-nowrap"
                    >
                        Search Jobs
                    </button>
                </div>
            </div>
        </section>
    );
}
