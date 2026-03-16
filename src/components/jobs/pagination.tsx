"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
}

export default function Pagination({ currentPage, totalPages }: PaginationProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Generate page numbers to display
    const getVisiblePages = () => {
        const pages: (number | string)[] = [];
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (currentPage <= 4) {
                pages.push(1, 2, 3, 4, 5, '...', totalPages);
            } else if (currentPage >= totalPages - 3) {
                pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
            } else {
                pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
            }
        }
        return pages;
    };

    const handlePageChange = (page: number) => {
        if (page < 1 || page > totalPages) return;
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', page.toString());
        router.push(`/jobs?${params.toString()}`);
    };

    return (
        <div className="flex items-center justify-center gap-2 mt-16 pb-12">
            {/* Prev */}
            <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="w-10 h-10 rounded-xl border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-50 hover:text-blue-600 transition-all active:scale-95 bg-white shadow-sm group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-400"
            >
                <ChevronLeft size={18} />
            </button>

            {getVisiblePages().map((page, i) => (
                <button
                    key={i}
                    onClick={() => typeof page === 'number' ? handlePageChange(page) : undefined}
                    className={`min-w-[40px] h-10 rounded-xl flex items-center justify-center font-bold text-xs transition-all active:scale-95 ${page === currentPage
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                        : typeof page === "string"
                            ? "text-gray-300 cursor-default hover:bg-transparent hover:text-gray-300"
                            : "bg-white border border-gray-100 text-gray-500 hover:bg-gray-50 hover:text-blue-600"
                        }`}
                >
                    {page}
                </button>
            ))}

            {/* Next */}
            <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="w-10 h-10 rounded-xl border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-50 hover:text-blue-600 transition-all active:scale-95 bg-white shadow-sm group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-400"
            >
                <ChevronRight size={18} />
            </button>
        </div>
    );
}
