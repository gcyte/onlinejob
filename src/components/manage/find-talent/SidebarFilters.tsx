"use client";

import { Check, ChevronDown, Filter } from "lucide-react";
import React, { useRef, useEffect, useState } from "react";
import Link from "next/link";

export interface FilterState {
    query: string;
    categories: string[];
    english: string;
    isVerified: boolean | null;
    minSalary: string;
    maxSalary: string;
    sort: string;
}

interface SidebarFiltersProps {
    filters: FilterState;
    setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
    onClear: () => void;
}

export default function SidebarFilters({ filters, setFilters, onClear }: SidebarFiltersProps) {
    const categoriesList = ["Virtual Assistant", "Web Developer", "Graphic Designer", "Content Writer"];

    const toggleCategory = (cat: string) => {
        setFilters(prev => ({
            ...prev,
            categories: prev.categories.includes(cat)
                ? prev.categories.filter(c => c !== cat)
                : [...prev.categories, cat]
        }));
    };

    return (
        <div className="w-full lg:w-64 shrink-0 space-y-6">
            <div className="bg-white rounded-[10px] border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-[15px] font-bold text-blue-600 flex items-center gap-2">
                        <Filter size={16} className="fill-blue-600 text-blue-600" /> Filters
                    </h2>
                    <button
                        onClick={onClear}
                        className="text-[11px] text-gray-500 hover:text-blue-600 font-semibold tracking-wide"
                    >
                        Clear all
                    </button>
                </div>

                {/* CATEGORY */}
                <div className="mb-7">
                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3.5">Category</h3>
                    <div className="space-y-3">
                        {categoriesList.map((cat) => {
                            const isSelected = filters.categories.includes(cat);
                            return (
                                <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={isSelected}
                                        onChange={() => toggleCategory(cat)}
                                    />
                                    <div className={`w-[14px] h-[14px] rounded-[3px] border flex items-center justify-center transition-colors ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300 group-hover:border-blue-600'}`}>
                                        {isSelected && <Check size={10} className="text-white" strokeWidth={4} />}
                                    </div>
                                    <span className={`text-[13px] ${isSelected ? 'text-gray-900 font-bold' : 'text-gray-600 font-medium'}`}>{cat}</span>
                                </label>
                            );
                        })}
                    </div>
                </div>

                {/* ENGLISH PROFICIENCY */}
                <div className="mb-7">
                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">English Proficiency</h3>
                    <div className="relative">
                        <select
                            value={filters.english}
                            onChange={(e) => setFilters(prev => ({ ...prev, english: e.target.value }))}
                            className="w-full appearance-none bg-white border border-gray-200 text-[13px] text-gray-800 font-semibold rounded-[10px] px-3 py-2 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 cursor-pointer"
                        >
                            <option value="Any">Any</option>
                            <option value="Fluent">Fluent</option>
                            <option value="Native">Native</option>
                            <option value="Conversational">Conversational</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                    </div>
                </div>

                {/* ID PROOF LEVEL */}
                <div className="mb-7">
                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">ID Proof Level</h3>
                    <div className="flex bg-slate-50 border border-gray-200 rounded-[10px] p-0.5">
                        <button
                            onClick={() => setFilters(prev => ({ ...prev, isVerified: true }))}
                            className={`flex-1 text-[12px] font-bold rounded-[10px] py-1.5 transition-colors ${filters.isVerified === true ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                            Verified
                        </button>
                        <button
                            onClick={() => setFilters(prev => ({ ...prev, isVerified: null }))}
                            className={`flex-1 text-[12px] font-bold rounded-[10px] py-1.5 transition-colors ${filters.isVerified === null ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                            Any
                        </button>
                    </div>
                </div>

                {/* MONTHLY SALARY */}
                <div className="mb-2">
                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Monthly Salary ($)</h3>
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            placeholder="Min"
                            value={filters.minSalary}
                            onChange={(e) => setFilters(prev => ({ ...prev, minSalary: e.target.value }))}
                            className="w-full bg-white border border-gray-200 text-[13px] text-gray-700 rounded-[10px] px-3 py-2 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                        />
                        <span className="text-gray-400 text-sm">-</span>
                        <input
                            type="number"
                            placeholder="Max"
                            value={filters.maxSalary}
                            onChange={(e) => setFilters(prev => ({ ...prev, maxSalary: e.target.value }))}
                            className="w-full bg-white border border-gray-200 text-[13px] text-gray-700 rounded-[10px] px-3 py-2 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                        />
                    </div>
                </div>
            </div>

            {/* Promo Box */}
            <div className="bg-[#F4F7F9] border border-[#E5EAEF] rounded-[10px] p-5 shadow-sm">
                <h3 className="text-[13px] font-bold text-blue-600 mb-1.5">Post a Job</h3>
                <p className="text-[11px] text-[#5C728A] mb-4 leading-relaxed font-medium">Can't find the right talent? Let the talent find you.</p>
                <Link href="/manage/jobs/new" className="block w-full text-center bg-blue-600 !text-white text-[13px] font-bold rounded-[10px] py-2 hover:bg-blue-700 transition-colors shadow-sm">
                    Post for Free
                </Link>
            </div>
        </div>
    );
}
