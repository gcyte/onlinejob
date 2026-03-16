"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import {
    Search, Menu, X, Briefcase, LogOut,
    LayoutDashboard, MessageSquare, ChevronDown, User,
    Bell, Check, ExternalLink, Clock
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
    const { data: session } = useSession();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const notificationRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 16);
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        if (session) {
            fetchNotifications();
            const interval = setInterval(fetchNotifications, 30000); // Pool every 30s
            return () => clearInterval(interval);
        }
    }, [session]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setIsNotificationsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await fetch("/api/notifications");
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
                setUnreadCount(data.filter((n: any) => !n.isRead).length);
            }
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        }
    };

    const markAsRead = async (id?: string) => {
        try {
            const res = await fetch("/api/notifications", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(id ? { id } : { all: true }),
            });
            if (res.ok) {
                if (id) {
                    setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
                    setUnreadCount(prev => Math.max(0, prev - 1));
                } else {
                    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
                    setUnreadCount(0);
                }
            }
        } catch (error) {
            console.error("Failed to mark notification as read", error);
        }
    };

    const user = session?.user as any;
    const initials = user?.name
        ? user.name.split(" ").map((n: string) => n[0]).slice(0, 2).join("")
        : "U";

    return (
        <>
            <nav
                className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isScrolled
                    ? "bg-white shadow-[0_2px_20px_rgba(0,0,0,.08)] border-b border-gray-100"
                    : "bg-white/90 backdrop-blur-md border-b border-gray-100/50"
                    }`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-[68px] items-center">

                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
                            <span className="text-[22px] font-black text-gray-900 tracking-tight">
                                Online<span className="text-blue-600">Jobs</span>
                            </span>
                        </Link>

                        {/* Desktop Nav Links */}
                        <div className="hidden md:flex items-center gap-2">
                            {[
                                { href: "/jobs", label: "Find Jobs" },
                                { href: "/freelancers", label: "Find Workers" },
                            ].map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="px-5 py-2 text-[15px] font-bold text-gray-800 hover:text-blue-600 hover:bg-blue-50/50 rounded-xl transition-all duration-150"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>

                        {/* Auth / User Actions */}
                        <div className="hidden md:flex items-center gap-4">
                            {session ? (
                                <div className="flex items-center gap-3">
                                    {/* Messages */}
                                    <Link
                                        href="/messages"
                                        className="relative p-2.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                        title="Messages"
                                    >
                                        <MessageSquare size={20} />
                                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                                    </Link>

                                    {/* Notifications */}
                                    <div className="relative" ref={notificationRef}>
                                        <button
                                            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                                            className={`relative p-2.5 rounded-xl transition-all ${isNotificationsOpen ? "text-blue-600 bg-blue-50" : "text-gray-500 hover:text-blue-600 hover:bg-blue-50"}`}
                                            title="Notifications"
                                        >
                                            <Bell size={20} />
                                            {unreadCount > 0 && (
                                                <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-black rounded-full border-2 border-white flex items-center justify-center">
                                                    {unreadCount > 9 ? "9+" : unreadCount}
                                                </span>
                                            )}
                                        </button>

                                        <AnimatePresence>
                                            {isNotificationsOpen && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-100 rounded-2xl shadow-xl shadow-gray-200/60 z-50 overflow-hidden"
                                                >
                                                    <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                                                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">Notifications</h3>
                                                        {unreadCount > 0 && (
                                                            <button
                                                                onClick={() => markAsRead()}
                                                                className="text-[10px] font-black text-blue-600 hover:text-blue-700 uppercase tracking-tighter"
                                                            >
                                                                Mark all read
                                                            </button>
                                                        )}
                                                    </div>

                                                    <div className="max-h-[400px] overflow-y-auto">
                                                        {notifications.length > 0 ? (
                                                            notifications.map((n) => (
                                                                <div
                                                                    key={n.id}
                                                                    className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors relative group ${!n.isRead ? "bg-blue-50/30" : ""}`}
                                                                >
                                                                    <div className="flex gap-3">
                                                                        <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center ${n.type === 'NEW_APPLICATION' ? 'bg-emerald-50 text-emerald-600' : n.type === 'NEW_MESSAGE' ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-600'}`}>
                                                                            {n.type === 'NEW_APPLICATION' ? <Briefcase size={14} /> : n.type === 'NEW_MESSAGE' ? <MessageSquare size={14} /> : <Bell size={14} />}
                                                                        </div>
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className="text-xs font-bold text-gray-900 mb-0.5">{n.title}</p>
                                                                            <p className="text-[11px] text-gray-500 leading-relaxed line-clamp-2">{n.message}</p>
                                                                            <div className="flex items-center gap-2 mt-2">
                                                                                <Clock size={10} className="text-gray-400" />
                                                                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                                                                                    {new Date(n.createdAt).toLocaleDateString()}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                        {!n.isRead && (
                                                                            <button
                                                                                onClick={(e) => { e.stopPropagation(); markAsRead(n.id); }}
                                                                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-blue-100 text-blue-600 rounded-md transition-all shrink-0 self-start"
                                                                                title="Mark as read"
                                                                            >
                                                                                <Check size={14} />
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                    {n.link && (
                                                                        <Link
                                                                            href={n.link}
                                                                            onClick={() => { setIsNotificationsOpen(false); markAsRead(n.id); }}
                                                                            className="absolute inset-0 z-0"
                                                                        />
                                                                    )}
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div className="py-12 px-5 text-center">
                                                                <Bell size={32} className="mx-auto text-gray-100 mb-3" />
                                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No notifications yet</p>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {notifications.length > 0 && (
                                                        <Link
                                                            href={user?.role === "ADMIN" ? "/admin" : "/dashboard"}
                                                            className="block py-3 text-center text-[10px] font-bold text-gray-500 hover:text-blue-600 hover:bg-gray-50 transition-colors uppercase tracking-widest border-t border-gray-50"
                                                            onClick={() => setIsNotificationsOpen(false)}
                                                        >
                                                            View all in dashboard
                                                        </Link>
                                                    )}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {/* Dashboard */}
                                    <Link
                                        href={user?.role === "ADMIN" ? "/admin" : "/dashboard"}
                                        className="flex items-center gap-2 px-4 py-2 text-[15px] font-bold text-gray-800 hover:bg-gray-100 rounded-xl transition-all"
                                    >
                                        <LayoutDashboard size={16} />
                                        Dashboard
                                    </Link>

                                    {/* User avatar dropdown */}
                                    <div className="relative">
                                        <button
                                            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                            className="flex items-center gap-2 pl-2 pr-3 py-2 rounded-xl hover:bg-gray-100 transition-all"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-[10px] font-black overflow-hidden">
                                                {user?.image ? (
                                                    <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    initials
                                                )}
                                            </div>
                                            <ChevronDown
                                                size={14}
                                                className={`text-gray-400 transition-transform ${isUserMenuOpen ? "rotate-180" : ""}`}
                                            />
                                        </button>

                                        {isUserMenuOpen && (
                                            <>
                                                <div
                                                    className="fixed inset-0 z-10"
                                                    onClick={() => setIsUserMenuOpen(false)}
                                                />
                                                <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-100 rounded-2xl shadow-xl shadow-gray-200/60 z-20 overflow-hidden">
                                                    <div className="px-4 py-3 border-b border-gray-50">
                                                        <p className="text-sm font-bold text-gray-900 truncate">{user?.name}</p>
                                                        <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                                                    </div>
                                                    <div className="p-1.5">
                                                        <Link
                                                            href={user?.role === "EMPLOYER" ? "/manage/profile" : "/dashboard/profile"}
                                                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                                            onClick={() => setIsUserMenuOpen(false)}
                                                        >
                                                            <User size={16} className="text-gray-400" />
                                                            Edit Profile
                                                        </Link>
                                                    </div>
                                                    <div className="p-1.5 border-t border-gray-50">
                                                        <button
                                                            onClick={() => { signOut(); setIsUserMenuOpen(false); }}
                                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                                                        >
                                                            <LogOut size={16} />
                                                            Sign Out
                                                        </button>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <Link
                                        href="/login"
                                        className="px-5 py-2 text-[15px] font-bold text-gray-800 hover:text-blue-600 hover:bg-blue-50/50 rounded-xl transition-all"
                                    >
                                        Sign In
                                    </Link>
                                    <Link
                                        href="/register"
                                        className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                                    >
                                        Get Started Free
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Mobile Hamburger */}
                        <button
                            className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            aria-label="Toggle menu"
                        >
                            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden bg-white border-t border-gray-100">
                        <div className="max-w-7xl mx-auto px-4 py-4 space-y-1">
                            <Link
                                href="/jobs"
                                className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 rounded-xl"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <Search size={16} className="text-gray-400" /> Find Jobs
                            </Link>
                            <Link
                                href="/freelancers"
                                className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 rounded-xl"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <User size={16} className="text-gray-400" /> Find Workers
                            </Link>

                            <div className="pt-3 border-t border-gray-100 mt-3 space-y-2">
                                {session ? (
                                    <>
                                        <Link
                                            href={user?.role === "ADMIN" ? "/admin" : "/dashboard"}
                                            className="flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-700 font-semibold rounded-xl text-sm"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            <LayoutDashboard size={16} /> Dashboard
                                        </Link>
                                        <Link
                                            href="/messages"
                                            className="flex items-center gap-3 px-4 py-3 bg-gray-50 text-gray-700 font-semibold rounded-xl text-sm"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            <MessageSquare size={16} /> Messages
                                        </Link>
                                        <button
                                            onClick={() => signOut()}
                                            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 font-semibold rounded-xl text-sm hover:bg-red-50"
                                        >
                                            <LogOut size={16} /> Sign Out
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <Link
                                            href="/login"
                                            className="block px-4 py-3 text-center text-sm font-semibold text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            Sign In
                                        </Link>
                                        <Link
                                            href="/register"
                                            className="block px-4 py-3 text-center text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            Get Started Free
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </nav>
            <div className="h-[68px] w-full" />
        </>
    );
}
