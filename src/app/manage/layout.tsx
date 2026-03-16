"use client";

import { ReactNode } from "react";
import Sidebar from "@/components/dashboard/sidebar";
import DashboardHeader from "@/components/dashboard/header";

export default function ManageLayout({ children }: { children: ReactNode }) {
    return (
        <div className="flex min-h-screen bg-slate-50">
            {/* Sleek Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 relative">
                {/* Floating Header */}
                <div className="absolute top-0 w-full z-20 pointer-events-none">
                    <div className="pointer-events-auto">
                        <DashboardHeader />
                    </div>
                </div>

                <main className="flex-1 overflow-y-auto w-full max-w-[1400px] mx-auto pt-[104px]">
                    <div className="p-4 sm:p-6 lg:p-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
