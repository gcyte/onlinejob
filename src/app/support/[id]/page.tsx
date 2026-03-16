"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/navbar";
import { Footer } from "@/components/footer-benefits";
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
    createdAt: string;
    messages: TicketMessage[];
}

export default function TicketDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { data: session } = useSession();
    const [ticket, setTicket] = useState<TicketDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [reply, setReply] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const fetchTicket = async () => {
        try {
            const res = await fetch(`/api/tickets/${params.id}/messages`);
            if (res.ok) {
                const data = await res.json();
                setTicket(data);
            } else {
                router.push('/support');
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
                fetchTicket(); // Refresh to get the new message
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
        return <div className="min-h-screen bg-[#F8FAFC] pt-32 text-center text-gray-500">Loading...</div>;
    }

    if (!ticket) return null;

    const isClosed = ticket.status === "CLOSED";

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
            <Navbar />
            <div className="flex-1 pt-32 pb-20 max-w-4xl mx-auto w-full px-4 sm:px-6">

                <Link href="/support" className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-900 font-bold mb-8 transition-colors group">
                    <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center group-hover:bg-gray-50 transition-all">
                        <ChevronLeft size={18} />
                    </div>
                    Back to Tickets
                </Link>

                <div className="bg-white rounded-[2rem] p-8 md:p-10 border border-gray-100 shadow-sm mb-8">
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-gray-50 pb-8 mb-8">
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 mb-2">{ticket.subject}</h1>
                            <div className="flex items-center gap-3 text-sm text-gray-400 font-medium">
                                <span>Ticket #{ticket.id.slice(-8).toUpperCase()}</span>
                                <span>-</span>
                                <span>{ticket.category}</span>
                            </div>
                        </div>
                        <div className="bg-gray-50 px-4 py-2 rounded-xl text-sm font-bold border border-gray-100 uppercase tracking-wider">
                            {ticket.status.replace('_', ' ')}
                        </div>
                    </div>

                    <div className="space-y-8 mb-10">
                        {ticket.messages.map((msg) => (
                            <div key={msg.id} className={`flex gap-4 ${msg.isAdminReply ? "" : "flex-row-reverse"}`}>
                                <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden flex-shrink-0">
                                    {msg.sender?.image ? (
                                        <img src={msg.sender.image} alt={msg.sender.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold font-serif">
                                            {msg.sender?.name?.charAt(0) || "U"}
                                        </div>
                                    )}
                                </div>
                                <div className={`max-w-[80%] rounded-2xl p-5 ${msg.isAdminReply
                                        ? "bg-gray-50 border border-gray-100 text-gray-900 rounded-tl-sm"
                                        : "bg-blue-600 text-white rounded-tr-sm"
                                    }`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`text-xs font-bold ${msg.isAdminReply ? "text-gray-900" : "text-blue-100"}`}>
                                            {msg.isAdminReply ? "Support Representative" : "You"}
                                        </span>
                                        {msg.isAdminReply && <CheckCircle2 size={12} className="text-blue-500" />}
                                        <span className={`text-xs ${msg.isAdminReply ? "text-gray-400" : "text-blue-200"}`}>
                                            {new Date(msg.createdAt).toLocaleString()}
                                        </span>
                                    </div>
                                    <p className="whitespace-pre-wrap leading-relaxed text-sm format-medium">
                                        {msg.message}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {!isClosed ? (
                        <form onSubmit={handleReply} className="border-t border-gray-50 pt-8 mt-auto">
                            <label className="block text-sm font-bold text-gray-900 mb-2">Reply to this ticket</label>
                            <div className="relative">
                                <textarea
                                    value={reply}
                                    onChange={(e) => setReply(e.target.value)}
                                    placeholder="Type your message here..."
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition h-32 resize-none pr-16"
                                    required
                                />
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="absolute bottom-4 right-4 bg-blue-600 text-white w-10 h-10 rounded-xl flex items-center justify-center hover:bg-blue-700 transition disabled:opacity-50"
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="bg-gray-50 rounded-2xl p-6 text-center border border-gray-100 mt-8">
                            <h3 className="font-bold text-gray-900 mb-1">This ticket has been closed</h3>
                            <p className="text-sm font-medium text-gray-500">If you need further assistance, please open a new ticket.</p>
                        </div>
                    )}
                </div>

            </div>
            <Footer />
        </div>
    );
}
