"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
    LayoutDashboard,
    Search,
    FileText,
    MessageSquare,
    User,
    Users,
    Settings,
    LogOut,
    Briefcase,
    ShieldCheck
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";

export default function Sidebar() {
    const { data: session } = useSession();
    const pathname = usePathname();
    const user = session?.user as any;

    const MENU_ITEMS = [
        { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
        ...(user?.role === "EMPLOYER" ? [
            { icon: Briefcase, label: "My Listings", href: "/manage/jobs" },
            { icon: Search, label: "Find Talent", href: "/manage/find-talent" },
            { icon: Users, label: "Applicants", href: "/dashboard/applicants" },
        ] : [
            { icon: Search, label: "Find Jobs", href: "/jobs" },
            { icon: FileText, label: "Applications", href: "/dashboard/applications" },
        ]),
        { icon: MessageSquare, label: "Messages", href: "/messages" },
    ];

    const ACCOUNT_ITEMS = [
        { icon: User, label: "My Profile", href: user?.role === "EMPLOYER" ? "/manage/profile" : "/dashboard/profile" },
        { icon: Settings, label: "Settings", href: "/settings" },
    ];

    return (
        <aside className="hidden lg:flex flex-col w-[260px] bg-slate-50 h-screen sticky top-0 flex-shrink-0 relative z-30">
            {/* Subtle right shadow instead of border */}
            <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-gray-200 to-transparent opacity-50" />

            <div className="p-8 pb-4">
                <Link href="/" className="flex items-center gap-2 group">
                    <span className="text-lg font-black text-gray-900 tracking-tight">
                        Online<span className="text-blue-600">Jobs</span>
                    </span>
                </Link>
            </div>

            <div className="flex-1 px-4 py-4 space-y-8 overflow-y-auto">
                {/* Main Menu */}
                <div>
                    <h3 className="px-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">
                        Main Menu
                    </h3>
                    <nav className="space-y-1">
                        {MENU_ITEMS.map((item) => {
                            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                            return (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    className={`relative flex items-center gap-3 px-4 py-3 transition-all font-bold text-sm group ${isActive
                                        ? "text-blue-700 bg-blue-50/50"
                                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-100/50"
                                        }`}
                                >
                                    {/* Active Indicator Bar */}
                                    {isActive && (
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-blue-600 rounded-r-full shadow-[0_0_12px_rgba(37,99,235,0.4)]" />
                                    )}
                                    <item.icon
                                        size={18}
                                        strokeWidth={isActive ? 2.5 : 2}
                                        className={isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"}
                                    />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Account */}
                <div>
                    <h3 className="px-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">
                        Account
                    </h3>
                    <nav className="space-y-1">
                        {ACCOUNT_ITEMS.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    className={`relative flex items-center gap-3 px-4 py-3 transition-all font-bold text-sm group ${isActive
                                        ? "text-blue-700 bg-blue-50/50"
                                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-100/50"
                                        }`}
                                >
                                    {isActive && (
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-blue-600 rounded-r-full shadow-[0_0_12px_rgba(37,99,235,0.4)]" />
                                    )}
                                    <item.icon
                                        size={18}
                                        strokeWidth={isActive ? 2.5 : 2}
                                        className={isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"}
                                    />
                                    {item.label}
                                </Link>
                            );
                        })}
                        <button
                            onClick={() => signOut({ callbackUrl: "/" })}
                            className="w-full relative flex items-center gap-3 px-4 py-3 transition-all font-bold text-sm text-gray-500 hover:text-red-600 hover:bg-red-50/50 group"
                        >
                            <LogOut size={18} className="text-gray-400 group-hover:text-red-500" />
                            Logout
                        </button>
                    </nav>
                </div>
            </div>

        </aside>
    );
}
