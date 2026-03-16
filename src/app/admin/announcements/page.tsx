"use client";

import { useState } from "react";
import { Megaphone, Send, Loader2, CheckCircle2 } from "lucide-react";

export default function AdminAnnouncementsPage() {
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [successCount, setSuccessCount] = useState<number | null>(null);

    const handleBroadcast = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setSuccessCount(null);

        try {
            const res = await fetch("/api/admin/announcements", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, message }),
            });

            if (res.ok) {
                const data = await res.json();
                setSuccessCount(data.count);
                setTitle("");
                setMessage("");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl space-y-6">
            <div>
                <h1 className="text-2xl font-black text-gray-900 mb-1">Platform Announcements</h1>
                <p className="text-sm text-gray-500 font-medium">Broadcast messages to all active users.</p>
            </div>

            <form onSubmit={handleBroadcast} className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm space-y-6">

                {successCount !== null && (
                    <div className="bg-emerald-50 text-emerald-800 p-4 rounded-2xl border border-emerald-100 flex items-center gap-3">
                        <CheckCircle2 className="text-emerald-500 shrink-0" size={20} />
                        <div>
                            <p className="font-bold text-sm">Announcement Broadcasted!</p>
                            <p className="text-xs font-medium text-emerald-700/80">Message sent to {successCount} active users.</p>
                        </div>
                    </div>
                )}

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Headline</label>
                        <input
                            type="text"
                            required
                            maxLength={80}
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g., Scheduled Maintenance Notification"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all font-medium text-gray-900"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Detailed Message</label>
                        <textarea
                            required
                            rows={5}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Type the full announcement message here..."
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all font-medium text-gray-900 resize-none"
                        />
                    </div>
                </div>

                <div className="border-t border-gray-100 pt-6 flex items-center justify-between">
                    <p className="text-xs text-gray-400 font-medium flex items-center gap-2">
                        <Megaphone size={14} /> This will appear in every user's notification bell.
                    </p>
                    <button
                        type="submit"
                        disabled={loading || !title || !message}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-sm transition-all shadow-md shadow-blue-100 disabled:opacity-50 disabled:shadow-none flex items-center gap-2"
                    >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                        Broadcast Now
                    </button>
                </div>
            </form>
        </div>
    );
}
