"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Clock, AlertTriangle, ChevronRight, Search } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/toast";

interface Ticket {
    id: string;
    subject: string;
    category: string;
    priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
    createdAt: string;
    updatedAt: string;
    user: {
        name: string | null;
        email: string | null;
        image: string | null;
    };
}

export default function AdminTicketsPage() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState("ALL");
    const { toast } = useToast();

    const fetchTickets = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/admin/tickets?status=${filter}`);
            if (res.ok) {
                setTickets(await res.json());
            }
        } catch (error) {
            console.error(error);
            toast("error", "Failed to load tickets", "Error");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, [filter]);

    const StatusBadge = ({ status }: { status: string }) => {
        const styles = {
            OPEN: "bg-blue-50 text-blue-700 border-blue-200",
            IN_PROGRESS: "bg-amber-50 text-amber-700 border-amber-200",
            RESOLVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
            CLOSED: "bg-gray-100 text-gray-700 border-gray-200"
        }[status] || "bg-gray-100 text-gray-700 border-gray-200";

        return (
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${styles}`}>
                {status.replace('_', ' ')}
            </span>
        );
    };

    const PriorityBadge = ({ priority }: { priority: string }) => {
        const styles = {
            LOW: "text-gray-500 bg-gray-50 border-gray-200",
            MEDIUM: "text-blue-600 bg-blue-50 border-blue-200",
            HIGH: "text-amber-600 bg-amber-50 border-amber-200",
            URGENT: "text-red-600 bg-red-50 border-red-200 flex items-center gap-1",
        }[priority] || "text-gray-500 bg-gray-50 border-gray-200";

        return (
            <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border ${styles}`}>
                {priority === "URGENT" && <AlertTriangle size={10} />}
                {priority}
            </span>
        );
    };

    return (
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Support Tickets</h1>
                    <p className="text-gray-500 font-medium">Manage and respond to user inquiries.</p>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                    {["ALL", "OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${filter === f
                                    ? "bg-gray-900 text-white shadow-sm"
                                    : "bg-white text-gray-500 hover:text-gray-900 border border-gray-200"
                                }`}
                        >
                            {f.replace('_', ' ')}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
                {isLoading ? (
                    <div className="p-12 text-center text-gray-400 font-medium animate-pulse">Loading tickets...</div>
                ) : tickets.length === 0 ? (
                    <div className="p-16 text-center flex flex-col items-center">
                        <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-4 border border-blue-100">
                            <MessageSquare size={32} />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 mb-2">Inbox Zero</h3>
                        <p className="text-gray-500 font-medium">No {filter !== "ALL" ? filter.toLowerCase() : ""} tickets found.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50 flex flex-col">
                        {/* Table Header Wrapper for desktop */}
                        <div className="hidden md:grid grid-cols-12 gap-4 p-4 text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50">
                            <div className="col-span-1">Ticket</div>
                            <div className="col-span-5">Subject / User</div>
                            <div className="col-span-2">Status</div>
                            <div className="col-span-2">Priority</div>
                            <div className="col-span-2 text-right pr-4">Updated</div>
                        </div>

                        {tickets.map((ticket) => (
                            <Link
                                key={ticket.id}
                                href={`/manage/tickets/${ticket.id}`}
                                className="grid grid-cols-1 md:grid-cols-12 gap-4 p-5 hover:bg-gray-50/50 transition-colors items-center group relative cursor-pointer"
                            >
                                <div className="col-span-1 text-xs font-bold text-gray-400 uppercase font-mono">
                                    #{ticket.id.slice(-6)}
                                </div>
                                <div className="col-span-5 flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden shrink-0">
                                        {ticket.user.image ? (
                                            <img src={ticket.user.image} alt={ticket.user.name || "User"} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center font-bold text-gray-500 uppercase">
                                                {ticket.user.name?.charAt(0) || "U"}
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="text-sm font-black text-gray-900 group-hover:text-blue-600 truncate transition-colors">
                                            {ticket.subject}
                                        </h4>
                                        <p className="text-xs text-gray-500 font-medium truncate mt-0.5">
                                            {ticket.user.name} • {ticket.category}
                                        </p>
                                    </div>
                                </div>
                                <div className="col-span-2 hidden md:block">
                                    <StatusBadge status={ticket.status} />
                                </div>
                                <div className="col-span-2 hidden md:block">
                                    <PriorityBadge priority={ticket.priority} />
                                </div>
                                <div className="col-span-2 text-right hidden md:flex flex-col items-end gap-1">
                                    <span className="text-sm text-gray-600 font-medium flex items-center gap-1.5">
                                        <Clock size={12} className="text-gray-400" />
                                        {new Date(ticket.updatedAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity hidden md:block">
                                    <ChevronRight size={20} className="text-gray-400" />
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
