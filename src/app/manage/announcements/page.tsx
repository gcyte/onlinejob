"use client";

import { useState } from "react";
import { Mic, Megaphone, Send, AlertTriangle } from "lucide-react";
import { useToast } from "@/components/ui/toast";

export default function AdminAnnouncementsPage() {
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [targetAudience, setTargetAudience] = useState("ALL");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!confirm(`Are you sure you want to blast this announcement to ${targetAudience}? This action cannot be undone.`)) return;

        setIsSubmitting(true);
        try {
            const res = await fetch("/api/admin/announcements", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, message, targetAudience })
            });

            if (res.ok) {
                toast("success", "Announcement sent successfully", "Success");
                setTitle("");
                setMessage("");
                setTargetAudience("ALL");
            } else {
                toast("error", "Failed to send announcement", "Error");
            }
        } catch (error) {
            toast("error", "An error occurred", "Error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-10 max-w-4xl">
            <div>
                <h1 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">System Announcements</h1>
                <p className="text-gray-500 font-medium">Draft and broadcast notifications to users across the platform.</p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-[2rem] p-6 text-amber-800 flex items-start gap-4 shadow-sm">
                <AlertTriangle className="shrink-0 mt-1" />
                <div>
                    <h4 className="font-bold mb-1">Warning: Destructive Action</h4>
                    <p className="text-sm font-medium">Broadcasting an announcement will create an in-app notification for all users that match the criteria instantly. Double check your copy below before sending.</p>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8 md:p-10">
                <form onSubmit={handleSubmit} className="space-y-8">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label className="block text-sm font-black uppercase text-gray-400 tracking-widest mb-3">Target Audience</label>
                            <select
                                value={targetAudience}
                                onChange={(e) => setTargetAudience(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-gray-900 font-bold outline-none focus:border-blue-500 transition focus:ring-4 focus:ring-blue-500/10 cursor-pointer"
                            >
                                <option value="ALL">All Active Users</option>
                                <option value="FREELANCER">All Freelancers</option>
                                <option value="EMPLOYER">All Employers</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-black uppercase text-gray-400 tracking-widest mb-3">Announcement Title</label>
                            <input
                                type="text"
                                required
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="E.g. System Maintenance Update"
                                maxLength={100}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-gray-900 font-bold outline-none focus:border-blue-500 transition focus:ring-4 focus:ring-blue-500/10"
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-end mb-3">
                            <label className="block text-sm font-black uppercase text-gray-400 tracking-widest">Message Body</label>
                            <span className="text-xs font-bold text-gray-400">{message.length}/500</span>
                        </div>
                        <textarea
                            required
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Write the full message details here..."
                            maxLength={500}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 text-gray-900 font-medium outline-none focus:border-blue-500 transition focus:ring-4 focus:ring-blue-500/10 h-48 resize-none"
                        />
                    </div>

                    <div className="pt-6 border-t border-gray-100 flex justify-end">
                        <button
                            type="submit"
                            disabled={isSubmitting || !title || !message}
                            className="bg-blue-600 text-white px-10 py-4 rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-3 shadow-lg shadow-blue-600/20 text-lg group"
                        >
                            {isSubmitting ? "Broadcasting..." : "Broadcast Message"}
                            <Megaphone size={20} className="group-hover:-rotate-12 transition-transform" />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
