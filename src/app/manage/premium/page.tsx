"use client";

import { useState, useEffect } from "react";
import { Award, Search, Building2, CheckCircle2, ChevronRight, Ban } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import Link from "next/link";

interface PremiumEmployer {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    isPremium: boolean;
    _count: {
        jobs: number;
    }
}

export default function AdminPremiumPage() {
    const [employers, setEmployers] = useState<PremiumEmployer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [actioningId, setActioningId] = useState<string | null>(null);
    const { toast } = useToast();

    const fetchPremiumEmployers = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/admin/premium`);
            if (res.ok) {
                setEmployers(await res.json());
            }
        } catch (error) {
            console.error(error);
            toast("error", "Failed to load premium employers", "Error");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPremiumEmployers();
    }, []);

    const handleRevoke = async (id: string, name: string | null) => {
        if (!confirm(`Are you sure you want to revoke Premium status from ${name}?`)) return;

        setActioningId(id);
        try {
            const res = await fetch(`/api/admin/premium`, {
                method: "POST", // We used POST for both grant/revoke in the API
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: id, action: "REVOKE" })
            });

            if (res.ok) {
                toast("success", "Premium status revoked", "Success");
                fetchPremiumEmployers();
            } else {
                toast("error", "Failed to revoke premium status", "Error");
            }
        } catch (error) {
            toast("error", "An error occurred", "Error");
        } finally {
            setActioningId(null);
        }
    };

    return (
        <div className="space-y-10">
            <div>
                <h1 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Premium Subscriptions</h1>
                <p className="text-gray-500 font-medium">Manage employers with active premium memberships.</p>
            </div>

            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
                {isLoading ? (
                    <div className="p-12 text-center text-gray-400 font-medium animate-pulse">Loading employers...</div>
                ) : employers.length === 0 ? (
                    <div className="p-16 text-center flex flex-col items-center">
                        <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mb-4 border border-amber-100">
                            <Award size={32} />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 mb-2">No Premium Employers</h3>
                        <p className="text-gray-500 font-medium">There are currently no employers with active premium status.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {/* Table Header Wrapper for desktop */}
                        <div className="hidden md:grid grid-cols-12 gap-4 p-4 text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50 pl-8">
                            <div className="col-span-1 border-r border-gray-200">#</div>
                            <div className="col-span-5 border-r border-gray-200">Employer Name</div>
                            <div className="col-span-2 border-r border-gray-200 text-center">Status</div>
                            <div className="col-span-2 border-r border-gray-200 text-center">Posted Jobs</div>
                            <div className="col-span-2 text-right pr-4">Actions</div>
                        </div>

                        {employers.map((emp, idx) => (
                            <div key={emp.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-5 md:pl-8 hover:bg-gray-50/50 transition-colors items-center group">
                                <div className="col-span-1 text-xs font-bold text-gray-400 hidden md:block">
                                    {(idx + 1).toString().padStart(2, '0')}
                                </div>
                                <div className="col-span-5 flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200">
                                        {emp.image ? (
                                            <img src={emp.image} alt={emp.name || "Company"} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                <Building2 size={20} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0 pr-4">
                                        <h4 className="font-black text-gray-900 truncate">
                                            {emp.name || "Unnamed Company"}
                                        </h4>
                                        <p className="text-sm font-medium text-gray-500 truncate mt-0.5">
                                            {emp.email}
                                        </p>
                                    </div>
                                </div>
                                <div className="col-span-2 md:text-center flex md:block items-center justify-between mb-2 md:mb-0">
                                    <span className="md:hidden text-xs font-bold text-gray-400 uppercase tracking-widest">Status: </span>
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-200 bg-amber-50 text-amber-700">
                                        <Award size={12} /> Active
                                    </span>
                                </div>
                                <div className="col-span-2 md:text-center flex md:block items-center justify-between mb-4 md:mb-0">
                                    <span className="md:hidden text-xs font-bold text-gray-400 uppercase tracking-widest">Active Jobs: </span>
                                    <span className="font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-xl">
                                        {emp._count.jobs}
                                    </span>
                                </div>
                                <div className="col-span-2 text-right space-x-2">
                                    <button
                                        onClick={() => handleRevoke(emp.id, emp.name)}
                                        disabled={actioningId === emp.id}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-red-50 text-red-600 hover:text-red-700 font-bold text-sm rounded-xl border border-red-200 transition-colors disabled:opacity-50"
                                        title="Revoke Premium Status"
                                    >
                                        <Ban size={16} /> Revoke
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
