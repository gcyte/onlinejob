"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import {
    LayoutDashboard, Users, Briefcase, Shield, ShieldAlert,
    BarChart3, Settings, LogOut, ChevronRight, Menu, X, Megaphone, History
} from "lucide-react";
import { useState } from "react";

const navItems = [
    {
        group: "Overview",
        items: [
            { label: "Dashboard", href: "/admin", icon: <LayoutDashboard size={18} /> },
            { label: "Analytics", href: "/admin/analytics", icon: <BarChart3 size={18} /> },
        ]
    },
    {
        group: "Management",
        items: [
            { label: "Users", href: "/admin/users", icon: <Users size={18} /> },
            { label: "Job Posts", href: "/admin/jobs", icon: <Briefcase size={18} /> },
            { label: "Verification", href: "/admin/verification", icon: <Shield size={18} /> },
            { label: "Moderation", href: "/admin/moderation", icon: <ShieldAlert size={18} /> },
            { label: "Announcements", href: "/admin/announcements", icon: <Megaphone size={18} /> },
        ]
    },
    {
        group: "System",
        items: [
            { label: "Activity Logs", href: "/admin/logs", icon: <History size={18} /> },
            { label: "Settings", href: "/admin/settings", icon: <Settings size={18} /> },
        ]
    }
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { data: session } = useSession();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const user = session?.user as any;

    const initials = user?.name
        ? user.name.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase()
        : "A";

    const isActive = (href: string) =>
        href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            {/* Logo / Brand */}
            <div className="flex items-center px-6 py-6 border-b border-gray-100">
                <div>
                    <p className="text-sm font-black text-gray-900">Admin Panel</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Online<span className="text-blue-600">Jobs</span></p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
                {navItems.map((group) => (
                    <div key={group.group}>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] px-3 mb-2">
                            {group.group}
                        </p>
                        <div className="space-y-1">
                            {group.items.map((item) => {
                                const active = isActive(item.href);
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setIsSidebarOpen(false)}
                                        className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold transition-all group ${active
                                            ? "bg-blue-600 text-white shadow-lg shadow-blue-100"
                                            : "text-gray-600 hover:bg-gray-50 hover:text-blue-600"
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className={active ? "text-white" : "text-gray-400 group-hover:text-blue-600 transition-colors"}>
                                                {item.icon}
                                            </span>
                                            <span className={active ? "text-white font-bold" : "group-hover:text-blue-600"}>
                                                {item.label}
                                            </span>
                                        </div>
                                        {active && <ChevronRight size={14} className="text-white/70" />}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            {/* User Profile at Bottom */}
            <div className="border-t border-gray-100 p-4">
                <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-black shadow shrink-0">
                        {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">{user?.name}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Administrator</p>
                    </div>
                </div>
                <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="mt-2 w-full flex items-center gap-2 px-3 py-2 text-sm font-semibold text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                >
                    <LogOut size={16} />
                    Sign Out
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0 bg-white border-r border-gray-100 fixed inset-y-0 left-0 z-30">
                <SidebarContent />
            </aside>

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <>
                    <div
                        className="fixed inset-0 bg-black/40 z-30 lg:hidden backdrop-blur-sm"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                    <aside className="fixed inset-y-0 left-0 w-72 bg-white border-r border-gray-100 z-40 lg:hidden flex flex-col shadow-2xl">
                        <SidebarContent />
                    </aside>
                </>
            )}

            {/* Main Content Area */}
            <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
                {/* Top Bar */}
                <header className="bg-white border-b border-gray-100 sticky top-0 z-20">
                    <div className="flex items-center justify-between px-6 h-16">
                        <div className="flex items-center gap-4">
                            {/* Mobile menu toggle */}
                            <button
                                className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
                                onClick={() => setIsSidebarOpen(true)}
                            >
                                <Menu size={20} />
                            </button>

                            {/* Breadcrumb */}
                            <div className="flex items-center gap-2 text-sm">
                                <span className="font-bold text-gray-400">Admin</span>
                                <ChevronRight size={14} className="text-gray-300" />
                                <span className="font-bold text-gray-900 capitalize">
                                    {pathname === "/admin" ? "Dashboard" : pathname.split("/admin/")[1]?.split("/")[0] || "Dashboard"}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Link
                                href="/"
                                className="text-xs font-bold text-gray-500 hover:text-blue-600 transition-colors hidden sm:block"
                            >
                                ← Back to Site
                            </Link>
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-black shadow">
                                {initials}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
