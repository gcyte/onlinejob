"use client";

import { Search, Bell, Mail, User, CheckCircle2, Clock, Loader2, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Notification {
    id: string;
    title: string;
    message: string;
    isRead: boolean;
    link?: string;
    createdAt: string;
}

export default function DashboardHeader() {
    const { data: session } = useSession();
    const router = useRouter();
    const [unreadCounts, setUnreadCounts] = useState({ notifications: 0, messages: 0 });
    const [userAvatar, setUserAvatar] = useState<string | null>(null);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const fetchUnreadCounts = async () => {
        try {
            const res = await fetch("/api/unread-counts");
            if (res.ok) {
                const data = await res.json();
                setUnreadCounts({ notifications: data.notifications, messages: data.messages });
                if (data.avatar) setUserAvatar(data.avatar);
            }
        } catch (error) {
            console.error("Failed to fetch unread counts:", error);
        }
    };

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/notifications");
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
                // Sync unread count
                setUnreadCounts(prev => ({ ...prev, notifications: data.filter((n: any) => !n.isRead).length }));
            }
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUnreadCounts();
        const interval = setInterval(fetchUnreadCounts, 30000); // Every 30 seconds
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (notificationsOpen) {
            fetchNotifications();
        }
    }, [notificationsOpen]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setNotificationsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const markAllAsRead = async () => {
        try {
            const res = await fetch("/api/notifications", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ all: true }),
            });
            if (res.ok) {
                setNotifications(notifications.map(n => ({ ...n, isRead: true })));
            }
        } catch (error) {
            console.error("Failed to mark all as read:", error);
        }
    };

    const markAsRead = async (id: string) => {
        try {
            const res = await fetch("/api/notifications", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            });
            if (res.ok) {
                setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
            }
        } catch (error) {
            console.error("Failed to mark as read:", error);
        }
    };

    const totalUnreadNotifications = (notificationsOpen && !loading && notifications.length > 0) 
        ? notifications.filter(n => !n.isRead).length 
        : unreadCounts.notifications;

    return (
        <header className="px-4 pt-4 md:px-8 md:pt-6">
            <div className="h-16 bg-white/70 backdrop-blur-xl border border-white shadow-sm shadow-slate-200/50 rounded-[10px] flex items-center justify-between px-6 transition-all duration-300 hover:shadow-md hover:bg-white/90">

                {/* Search Bar - Refined */}
                <div className="max-w-md w-full relative group hidden md:block">
                    <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent scale-x-0 group-focus-within:scale-x-100 transition-transform duration-500 ease-out" />
                    <Search
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors"
                        size={16}
                    />
                    <input
                        type="text"
                        placeholder="Search workspace..."
                        className="w-full bg-transparent border-none py-2 pl-10 pr-4 text-sm font-semibold text-gray-900 placeholder:text-gray-400 focus:ring-0 transition-all outline-none"
                    />
                </div>

                {/* Search Icon for Mobile */}
                <div className="md:hidden flex items-center">
                    <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                        <Search size={20} />
                    </button>
                </div>

                {/* Actions & User */}
                <div className="flex items-center gap-3">
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setNotificationsOpen(!notificationsOpen)}
                            className={`p-2 rounded-[10px] transition-all relative flex items-center justify-center ${notificationsOpen ? 'bg-blue-50 text-blue-600 shadow-inner' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-900'}`}
                        >
                            <Bell size={18} />
                            {unreadCounts.notifications > 0 && (
                                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[8px] font-black flex items-center justify-center rounded-full border-2 border-white translate-x-1/4 -translate-y-1/4">
                                    {unreadCounts.notifications > 9 ? '9+' : unreadCounts.notifications}
                                </span>
                            )}
                        </button>

                        <AnimatePresence>
                            {notificationsOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute right-0 mt-3 w-80 bg-white rounded-[10px] shadow-2xl border border-gray-100 overflow-hidden"
                                >
                                    <div className="p-4 border-b border-gray-50 flex items-center justify-between">
                                        <div>
                                            <h3 className="text-sm font-black text-gray-900 leading-none">Notifications</h3>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">You have {totalUnreadNotifications} unread</p>
                                        </div>
                                        {totalUnreadNotifications > 0 && (
                                            <button
                                                onClick={markAllAsRead}
                                                className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-700"
                                            >
                                                Mark all read
                                            </button>
                                        )}
                                    </div>

                                    <div className="max-h-[400px] overflow-y-auto overflow-x-hidden scrollbar-hide py-2">
                                        {loading ? (
                                            <div className="flex flex-col items-center justify-center p-8 gap-3">
                                                <Loader2 size={24} className="animate-spin text-blue-100" />
                                                <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Fetching updates...</p>
                                            </div>
                                        ) : notifications.length > 0 ? (
                                            notifications.map((n) => (
                                                <div
                                                    key={n.id}
                                                    onClick={() => {
                                                        markAsRead(n.id);
                                                        if (n.link) router.push(n.link);
                                                    }}
                                                    className={`px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors relative group rounded-[10px] mx-2 ${!n.isRead ? 'bg-blue-50/30' : ''}`}
                                                >
                                                    {!n.isRead && (
                                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600" />
                                                    )}
                                                    <div className="flex justify-between gap-3">
                                                        <div>
                                                            <h4 className={`text-xs font-bold mb-0.5 ${!n.isRead ? 'text-gray-900' : 'text-gray-500'}`}>{n.title}</h4>
                                                            <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">{n.message}</p>
                                                            <div className="flex items-center gap-1.5 mt-2 text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                                                                <Clock size={10} /> {new Date(n.createdAt).toLocaleDateString()}
                                                            </div>
                                                        </div>
                                                        {!n.isRead && (
                                                            <div className="w-2 h-2 bg-blue-600 rounded-full mt-1 shrink-0" />
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="flex flex-col items-center justify-center p-12 text-center">
                                                <div className="w-12 h-12 bg-gray-50 rounded-[10px] flex items-center justify-center mb-4">
                                                    <CheckCircle2 size={24} className="text-gray-200" />
                                                </div>
                                                <h4 className="text-sm font-bold text-gray-900 mb-1">All caught up!</h4>
                                                <p className="text-[10px] text-gray-400 font-medium">New notifications will appear here</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-3 bg-gray-50 border-t border-gray-100">
                                        <button className="w-full py-2.5 bg-white border border-gray-200 text-gray-700 rounded-[10px] font-bold text-[10px] uppercase tracking-widest hover:bg-gray-100 transition-colors shadow-sm">
                                            View All Activity
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <Link
                        href="/messages"
                        className="p-2 text-gray-400 rounded-[10px] hover:bg-gray-100 hover:text-gray-900 transition-all flex items-center justify-center relative shadow-sm hover:shadow-md active:scale-95"
                    >
                        <Mail size={18} />
                        {unreadCounts.messages > 0 && (
                            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[8px] font-black flex items-center justify-center rounded-full border-2 border-white translate-x-1/4 -translate-y-1/4 animate-pulse">
                                {unreadCounts.messages > 9 ? '9+' : unreadCounts.messages}
                            </span>
                        )}
                    </Link>

                    <div className="w-px h-6 bg-gray-200 mx-1" />

                    <div className="flex items-center gap-3 cursor-pointer group p-1 pr-3 rounded-[10px] hover:bg-gray-50 transition-colors">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-sm shadow-blue-200 group-hover:scale-105 transition-transform duration-300 overflow-hidden border border-white">
                            {session?.user && (session.user as any).image ? (
                                <img src={(session.user as any).image} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-[10px] font-black uppercase">
                                    {session?.user?.name
                                        ? (session.user as any).name.split(" ").map((n: string) => n[0]).slice(0, 2).join("")
                                        : "U"}
                                </span>
                            )}
                        </div>
                        <div className="text-left hidden sm:block">
                            <p className="text-xs font-black text-gray-900 leading-none tracking-tight">
                                {(session?.user as any)?.name?.split(' ')[0] || "User"}
                            </p>
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                                {(session?.user as any)?.role || "MEMBER"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
