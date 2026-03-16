"use client";

import { X, Plus, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function FilterSidebar() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const salary = parseInt(searchParams.get("salary") || "0");
    const activeSkills = searchParams.get("skills")?.split(",").filter(Boolean) || [];

    const updateFilters = (key: string, value: string | null) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value === null) {
            params.delete(key);
        } else {
            params.set(key, value);
        }
        router.push(`/jobs?${params.toString()}`);
    };

    const toggleSkill = (skill: string) => {
        const newSkills = activeSkills.includes(skill)
            ? activeSkills.filter(s => s !== skill)
            : [...activeSkills, skill];
        updateFilters("skills", newSkills.length > 0 ? newSkills.join(",") : null);
    };

    return (
        <aside className="w-full lg:w-80 shrink-0 space-y-10">
            <div className="flex items-center justify-between pb-6 border-b border-gray-100">
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Filters</h3>
                <button
                    onClick={() => router.push("/jobs")}
                    className="text-xs font-black text-blue-600 hover:text-blue-700 transition-all uppercase tracking-widest"
                >
                    Clear All
                </button>
            </div>

            {/* Job Type */}
            <div className="space-y-6">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Job Type</h4>
                <div className="grid grid-cols-1 gap-3">
                    {["Full-time", "Part-time", "Freelance", "Contract"].map((type) => {
                        const val = type.toUpperCase().replace('-', '_');
                        const isActive = searchParams.get('type') === val;
                        return (
                            <button
                                key={type}
                                onClick={() => updateFilters("type", isActive ? null : val)}
                                className={`flex items-center gap-4 p-4 rounded-[10px] border-2 transition-all duration-300 text-left group ${isActive
                                    ? "bg-blue-50 border-blue-600 shadow-lg shadow-blue-100/50"
                                    : "bg-white border-gray-50 hover:border-gray-200"
                                    }`}
                            >
                                <div className={`w-6 h-6 rounded-lg flex items-center justify-center border-2 transition-all ${isActive ? "bg-blue-600 border-blue-600 text-white" : "border-gray-200 bg-gray-50 group-hover:border-blue-200"
                                    }`}>
                                    {isActive && <Plus size={14} className="rotate-45" />}
                                </div>
                                <span className={`text-sm font-bold ${isActive ? "text-blue-600" : "text-gray-600"}`}>{type}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Skills */}
            <div className="space-y-6">
                <h4 className="text-[10px] font-black text-slate-400/80 uppercase tracking-[0.2em] mb-4">Required Skills</h4>
                <div className="flex flex-wrap gap-2.5">
                    {["React", "Node.js", "Python", "UI Design", "Marketing", "SEO", "AWS", "Typescript"].map(skill => {
                        const isActive = activeSkills.includes(skill);
                        return (
                            <button
                                key={skill}
                                onClick={() => toggleSkill(skill)}
                                className={`px-4 py-2.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all border ${isActive
                                    ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-200"
                                    : "bg-white border-slate-100 text-slate-500 hover:border-slate-300 shadow-sm"
                                    }`}
                            >
                                {skill}
                            </button>
                        );
                    })}
                </div>
                <div className="pt-4">
                    <button className="w-full flex items-center justify-center gap-2 p-3.5 rounded-full border-2 border-dashed border-slate-200 text-slate-400 hover:border-blue-300 hover:text-blue-500 transition-all group">
                        <Plus size={16} className="group-hover:rotate-90 transition-transform duration-300" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Browse All Skills</span>
                    </button>
                </div>
            </div>
        </aside>
    );
}
