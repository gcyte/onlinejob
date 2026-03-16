"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { ChevronLeft, Send, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";

interface TicketMessage {
    id: string;
    message: string;
    isAdminReply: boolean;
    createdAt: string;
    sender: {
        name: string;
        image: string;
        role: string;
    }
}

interface TicketDetail {
    id: string;
    subject: string;
    category: string;
    status: string;
    priority: string;
    createdAt: string;
    userId: string;
    user: {
        name: string | null;
        email: string | null;
    }
    messages: TicketMessage[];
}

export default function AdminTicketDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [ticket, setTicket] = useState<TicketDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [reply, setReply] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    // Editable status state
    const [status, setStatus] = useState("OPEN");
    const [priority, setPriority] = useState("MEDIUM");

    const fetchTicket = async () => {
        try {
            // We reuse the user endpoint which checks if user is Admin, it will allow reading.
            const res = await fetch(`/api/tickets/${params.id}/messages`);
            if (res.ok) {
                const data = await res.json();
                setTicket(data);
                setStatus(data.status);
                setPriority(data.priority);
            } else {
                toast("error", "Ticket not found or access denied", "Error");
                router.push('/manage/tickets');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTicket();
    }, [params.id]);

    const handleUpdateStatusAndPriority = async () => {
        try {
            // New route specifically for admin ticket updates we made
            const res = await fetch(`/api/admin/tickets/${params.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status, priority })
            });

            if (res.ok) {
                toast("success", "Ticket updated", "Success");
                fetchTicket();
            } else {
                toast("error", "Failed to update ticket", "Error");
            }
        } catch (error) {
            toast("error", "Error updating ticket", "Error");
        }
    };

    const handleReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reply.trim()) return;
        setIsSubmitting(true);

        try {
            const res = await fetch(`/api/tickets/${params.id}/messages`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: reply })
            });

            if (res.ok) {
                setReply("");
                fetchTicket();
                toast("success", "Reply sent successfully", "Success");
            } else {
                toast("error", "Failed to send reply", "Error");
            }
        } catch (error) {
            toast("error", "An error occurred", "Error");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return <div className="text-center text-gray-500 animate-pulse pt-10">Loading ticket details...</div>;
    }

    if (!ticket) return null;

    return (
        <div className="space-y-6 pb-20">
            <Link href="/manage/tickets" className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-900 font-bold mb-4 transition-colors group">
                <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center group-hover:bg-gray-50 transition-all">
                    <ChevronLeft size={18} />
                </div>
                Back to Inbox
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content (Chat) */}
                <div className="lg:col-span-2 bg-white rounded-[2rem] p-8 md:p-10 border border-gray-100 shadow-sm flex flex-col min-h-[600px]">
                    <div className="border-b border-gray-50 pb-8 mb-8">
                        <h1 className="text-3xl font-black text-gray-900 mb-2">{ticket.subject}</h1>
                        <div className="flex items-center gap-3 text-sm text-gray-400 font-medium tracking-wide">
                            <span className="font-mono">#{ticket.id.slice(-8).toUpperCase()}</span>
                            <span>•</span>
                            <span>{ticket.category}</span>
                            <span>•</span>
                            <span>Created {new Date(ticket.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>

                    <div className="flex-1 space-y-8 mb-10 overflow-y-auto pr-4">
                        {ticket.messages.map((msg) => (
                            <div key={msg.id} className={`flex gap-4 ${msg.isAdminReply ? "flex-row-reverse" : ""}`}>
                                <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden flex-shrink-0">
                                    {msg.sender.image ? (
                                        <img src={msg.sender.image} alt={msg.sender.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className={`w-full h-full flex items-center justify-center font-bold font-serif ${msg.isAdminReply ? "bg-amber-100 text-amber-600" : "bg-blue-100 text-blue-600"}`}>
                                            {msg.sender.name?.charAt(0) || "U"}
                                        </div>
                                    )}
                                </div>
                                <div className={`max-w-[85%] rounded-[1.5rem] p-5 ${msg.isAdminReply
                                        ? "bg-gray-100 text-gray-900 rounded-tr-sm"
                                        : "bg-blue-50 border border-blue-100/50 text-blue-600 rounded-tl-sm"
                                    }`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-xs font-bold text-gray-900">
                                            {msg.isAdminReply ? "You (Admin)" : msg.sender.name}
                                        </span>
                                        {msg.isAdminReply && <CheckCircle2 size={12} className="text-amber-500" />}
                                        <span className="text-xs text-gray-400 font-medium">
                                            {new Date(msg.createdAt).toLocaleString()}
                                        </span>
                                    </div>
                                    <p className="whitespace-pre-wrap leading-relaxed text-sm font-medium">
                                        {msg.message}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <form onSubmit={handleReply} className="border-t border-gray-100 pt-6 mt-auto">
                        <div className="relative">
                            <textarea
                                value={reply}
                                onChange={(e) => setReply(e.target.value)}
                                placeholder="Write a reply to the user..."
                                className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-4 font-medium focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none transition h-32 resize-none pr-16"
                                required
                            />
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="absolute bottom-4 right-4 bg-gray-900 text-white px-5 h-10 rounded-xl flex items-center justify-center hover:bg-black font-bold text-sm transition disabled:opacity-50 gap-2"
                            >
                                Send <Send size={14} />
                            </button>
                        </div>
                    </form>
                </div>

                {/* Sidebar (Controls) */}
                <div className="space-y-6">
                    {/* Ticket Details & Controls */}
                    <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm space-y-6">
                        <h3 className="font-black text-gray-900 text-lg border-b border-gray-50 pb-4 mb-6">Manage Ticket</h3>

                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Status</label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-black text-gray-900 outline-none focus:border-amber-500"
                            >
                                <option value="OPEN">Open</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="RESOLVED">Resolved</option>
                                <option value="CLOSED">Closed</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Priority</label>
                            <select
                                value={priority}
                                onChange={(e) => setPriority(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-black text-gray-900 outline-none focus:border-amber-500"
                            >
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                                <option value="URGENT">Urgent 🔴</option>
                            </select>
                        </div>

                        <button
                            onClick={handleUpdateStatusAndPriority}
                            disabled={status === ticket.status && priority === ticket.priority}
                            className="w-full bg-amber-100 text-amber-700 font-bold py-3 rounded-xl hover:bg-amber-200 transition disabled:opacity-50 disabled:bg-gray-50 disabled:text-gray-400 border border-amber-200 disabled:border-gray-200"
                        >
                            Save Changes
                        </button>
                    </div>

                    {/* User Info Card */}
                    {ticket.user && (
                        <div className="bg-gray-50 rounded-[2rem] p-8 border border-gray-100">
                            <h3 className="font-black text-gray-900 text-lg border-b border-gray-200 pb-4 mb-6">User Info</h3>
                            <div className="space-y-4 font-medium text-sm text-gray-600">
                                <div><span className="block text-xs font-bold text-gray-400 mb-1">Name</span> {ticket.user.name || "N/A"}</div>
                                <div><span className="block text-xs font-bold text-gray-400 mb-1">Email</span> {ticket.user.email || "N/A"}</div>
                                <div><span className="block text-xs font-bold text-gray-400 mb-1">User ID</span> <span className="font-mono text-xs">{ticket.userId}</span></div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
