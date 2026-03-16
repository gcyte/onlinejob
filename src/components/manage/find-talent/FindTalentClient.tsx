"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import SidebarFilters, { FilterState } from "./SidebarFilters";
import CandidateCard, { CandidateProps } from "./CandidateCard";

const initialFilters: FilterState = {
    query: "",
    categories: [],
    english: "Any",
    isVerified: null,
    minSalary: "",
    maxSalary: "",
    sort: "Most Relevant"
};


export default function FindTalentClient() {
    const [freelancers, setFreelancers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState<FilterState>(initialFilters);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    const fetchFreelancers = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.query) params.append("query", filters.query);
            filters.categories.forEach(c => params.append("category", c));
            if (filters.isVerified !== null) params.append("verified", filters.isVerified.toString());
            if (filters.minSalary) params.append("minSalary", filters.minSalary);
            if (filters.maxSalary) params.append("maxSalary", filters.maxSalary);
            params.append("sort", filters.sort);
            params.append("page", currentPage.toString());
            params.append("limit", "10");

            const res = await fetch(`/api/freelancers?${params.toString()}`);
            if (res.ok) {
                const data = await res.json();
                setFreelancers(data.freelancers);
                setTotalPages(data.totalPages);
                setTotalCount(data.totalCount);
            }
        } catch (error) {
            console.error("Failed to fetch freelancers", error);
        } finally {
            setLoading(false);
        }
    }, [filters, currentPage]);

    useEffect(() => {
        fetchFreelancers();
    }, [fetchFreelancers]);

    const handleClear = () => {
        setFilters(initialFilters);
        setCurrentPage(1);
    };

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [filters]);

    const displayCandidates: CandidateProps[] = freelancers.map((f) => ({
        id: f.id,
        initials: f.user.name ? f.user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : "AA",
        avatarUrl: f.avatarUrl || f.user?.image || undefined,
        name: f.user.name || "Freelancer",
        title: f.title || "Professional",
        bio: f.bio || "Dedicated professional ready to contribute to your team with high-quality results.",
        location: f.location || "Global Remote",
        salary: f.expectedSalary ? `$${f.expectedSalary}/mo` : "$500 - $1,500/mo",
        rating: 5.0,
        isVerified: f.isVerified
    }));

    return (
        <div className="max-w-[1280px] mx-auto p-4 md:p-6 lg:p-8 bg-[#F9FAFB] min-h-screen font-sans">
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">

                {/* Sidebar Filters Component */}
                <SidebarFilters filters={filters} setFilters={setFilters} onClear={handleClear} />

                {/* Main Content Areas */}
                <div className="flex-1">
                    {/* Top Bar */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-5">
                        <div className="mt-1">
                            <h1 className="text-[18px] font-bold text-gray-900 tracking-tight">
                                {loading ? "..." : totalCount.toLocaleString()} Candidates Found
                            </h1>
                            <p className="text-[13px] text-gray-500 font-medium">Showing top matches for your criteria</p>
                        </div>
                        <div className="flex items-center gap-2 mt-4 md:mt-0">
                            <span className="text-[13px] text-gray-500 font-medium tracking-wide">Sort by:</span>
                            <div className="relative">
                                <select
                                    value={filters.sort}
                                    onChange={(e) => setFilters(prev => ({ ...prev, sort: e.target.value }))}
                                    className="appearance-none bg-transparent font-bold text-blue-600 text-[13px] pr-4 outline-none cursor-pointer tracking-wide"
                                >
                                    <option value="Most Relevant">Most Relevant</option>
                                    <option value="Highest Rated">Highest Rated</option>
                                    <option value="Newest">Newest</option>
                                </select>
                                <ChevronDown size={14} className="absolute right-0 top-1/2 -translate-y-1/2 text-blue-600 pointer-events-none stroke-[2.5]" />
                            </div>
                        </div>
                    </div>

                    {/* Candidate Cards */}
                    <div className="space-y-4">
                        {loading ? (
                            <div className="animate-pulse space-y-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-44 bg-white rounded-[10px] border border-gray-200" />
                                ))}
                            </div>
                        ) : freelancers.length > 0 ? (
                            displayCandidates.map((candidate, index) => (
                                <CandidateCard key={candidate.id || index} candidate={candidate} />
                            ))
                        ) : (
                            <div className="bg-white rounded-[10px] border border-gray-200 border-dashed p-12 text-center">
                                <p className="text-gray-500 font-medium">No candidates found matching your criteria.</p>
                                <button
                                    onClick={handleClear}
                                    className="mt-4 text-blue-600 font-bold hover:underline"
                                >
                                    Clear all filters
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-10 mb-12">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 disabled:opacity-50"
                            >
                                <ChevronLeft size={16} strokeWidth={2.5} />
                            </button>

                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                                // show logic for pagination (first, last, and around current)
                                if (
                                    page === 1 ||
                                    page === totalPages ||
                                    (page >= currentPage - 1 && page <= currentPage + 1)
                                ) {
                                    return (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`w-8 h-8 flex items-center justify-center rounded-[10px] font-bold text-[13px] transition-colors ${currentPage === page
                                                ? 'bg-blue-600 !text-white shadow-sm'
                                                : 'text-blue-600 hover:bg-gray-100'
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    );
                                } else if (
                                    page === currentPage - 2 ||
                                    page === currentPage + 2
                                ) {
                                    return <span key={page} className="text-gray-400 text-sm tracking-widest px-1">...</span>;
                                }
                                return null;
                            })}

                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors disabled:opacity-50"
                            >
                                <ChevronRight size={16} strokeWidth={2.5} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
