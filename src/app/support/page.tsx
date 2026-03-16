"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/navbar";
import { Footer } from "@/components/footer-benefits";
import {
    Clock,
    CheckCircle2,
    MessageSquare,
    ChevronRight,
    AlertCircle,
    Plus,
    X
} from "lucide-react";
import { useToast } from "@/components/ui/toast";
import Link from "next/link";

interface Ticket {
    id: string;
    subject: string;
    category: string;
    priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
    createdAt: string;
    updatedAt: string;
}

export default function SupportDashboard() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const { toast } = useToast();

    // Form state
    const [subject, setSubject] = useState("");
    const [category, setCategory] = useState("Technical");
    const [priority, setPriority] = useState("MEDIUM");
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchTickets = async () => {
        try {
            const res = await fetch("/api/tickets");
            if (res.ok) {
                const data = await res.json();
                setTickets(data);
            }
        } catch (error) {
            console.error("Error fetching tickets:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const res = await fetch("/api/tickets", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ subject, category, priority, message })
            });

            if (res.ok) {
                const newTicket = await res.json();
                setTickets([newTicket, ...tickets]);
                toast("success", "Ticket created successfully", "Success");
                setIsCreating(false);
                setSubject("");
                setMessage("");
            } else {
                toast("error", "Failed to create ticket", "Error");
            }
        } catch (error) {
            toast("error", "An error occurred", "Error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const StatusBadge = ({ status }: { status: string }) => {
        const styles = {
            OPEN: "bg-blue-50 text-blue-700 border-blue-200",
            IN_PROGRESS: "bg-amber-50 text-amber-700 border-amber-200",
            RESOLVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
            CLOSED: "bg-gray-100 text-gray-700 border-gray-200"
        }[status] || "bg-gray-100 text-gray-700 border-gray-200";

        return (
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${styles}`}>
                {status.replace('_', ' ')}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
            <Navbar />
            <div className="flex-1 pt-32 pb-20 max-w-5xl mx-auto w-full px-4 sm:px-6">

                <div className="flex justify-between items-end mb-10">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 mb-2 mt-4 tracking-tight">Support Center</h1>
                        <p className="text-gray-500 font-medium">Manage your requests and get help.</p>
                    </div>
                    <button
                        onClick={() => setIsCreating(true)}
                        className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition flex items-center gap-2"
                    >
                        <Plus size={20} /> New Ticket
                    </button>
                </div>

                {isCreating && (
                    <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm mb-10 animate-in fade-in slide-in-from-top-4">
                        <div className="flex justify-between items-center mb-6 border-b border-gray-50 pb-6">
                            <h2 className="text-2xl font-black text-gray-900">Create New Request</h2>
                            <button onClick={() => setIsCreating(false)} className="text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-900 mb-2">Subject</label>
                                    <input
                                        type="text"
                                        required
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition"
                                        placeholder="Brief description of the issue"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-900 mb-2">Category</label>
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition"
                                    >
                                        <option>Technical Issue</option>
                                        <option>Billing / Premium</option>
                                        <option>Account Management</option>
                                        <option>Report User / Job</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-2">Message</label>
                                <textarea
                                    required
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition h-32 resize-none"
                                    placeholder="Please provide as much detail as possible..."
                                />
                            </div>

                            <div className="flex justify-end pt-4 border-t border-gray-50">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-50"
                                >
                                    {isSubmitting ? "Submitting..." : "Submit Request"}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                    {isLoading ? (
                        <div className="p-12 text-center text-gray-400 font-medium">Loading tickets...</div>
                    ) : tickets.length === 0 ? (
                        <div className="p-16 text-center flex flex-col items-center">
                            <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-4">
                                <MessageSquare size={32} />
                            </div>
                            <h3 className="text-xl font-black text-gray-900 mb-2">No active tickets</h3>
                            <p className="text-gray-500 font-medium">Need help? Create a new support request.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {tickets.map((ticket) => (
                                <Link
                                    href={`/support/${ticket.id}`}
                                    key={ticket.id}
                                    className="block p-6 hover:bg-gray-50 transition-colors group"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                            <span className="text-gray-400 font-medium text-sm">#{ticket.id.slice(-8).toUpperCase()}</span>
                                            <StatusBadge status={ticket.status} />
                                        </div>
                                        <div className="flex items-center gap-1 text-gray-400 text-sm font-medium">
                                            <Clock size={14} />
                                            {new Date(ticket.updatedAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                                {ticket.subject}
                                            </h4>
                                            <p className="text-gray-500 text-sm font-medium mt-1">
                                                {ticket.category}
                                            </p>
                                        </div>
                                        <ChevronRight size={20} className="text-gray-300 group-hover:text-blue-600 transition-colors" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

            </div>
            <Footer />
        </div>
    );
}
