"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import DashboardLayout from "@/app/dashboard/layout";
import { 
    User, 
    Lock, 
    Bell, 
    Shield, 
    CreditCard, 
    Save, 
    AlertCircle,
    CheckCircle2,
    Eye,
    EyeOff,
    Mail,
    Smartphone,
    FileText,
    Loader2
} from "lucide-react";

type TabType = "general" | "security" | "notifications" | "privacy" | "billing";

export default function SettingsPage() {
    const { data: session, update: updateSession } = useSession();
    const user = session?.user as any;
    const [activeTab, setActiveTab] = useState<TabType>("general");
    const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
    const [saveMessage, setSaveMessage] = useState("");

    const tabs = [
        { id: "general", label: "General", icon: User, color: "text-blue-600", bg: "bg-blue-50" },
        { id: "security", label: "Security", icon: Lock, color: "text-emerald-600", bg: "bg-emerald-50" },
        { id: "notifications", label: "Notifications", icon: Bell, color: "text-amber-600", bg: "bg-amber-50" },
        { id: "privacy", label: "Privacy", icon: Shield, color: "text-indigo-600", bg: "bg-indigo-50" },
        ...(user?.role === "EMPLOYER" ? [{ id: "billing", label: "Billing", icon: CreditCard, color: "text-rose-600", bg: "bg-rose-50" }] : []),
    ];

    const handleApiUpdate = async (data: object) => {
        setSaveStatus("saving");
        setSaveMessage("");
        try {
            const res = await fetch("/api/settings", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (res.ok) {
                await updateSession(); // Refresh session with updated name
                setSaveStatus("success");
                setSaveMessage("Saved successfully!");
            } else {
                const text = await res.text();
                setSaveStatus("error");
                setSaveMessage(text || "Something went wrong.");
            }
        } catch {
            setSaveStatus("error");
            setSaveMessage("Network error. Please try again.");
        } finally {
            setTimeout(() => setSaveStatus("idle"), 3000);
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto">
                <div className="mb-10 flex justify-between items-end">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Account Settings</h1>
                        <p className="text-gray-500 mt-2 font-medium text-lg">Manage your personal preferences, security, and platform behavior.</p>
                    </div>
                    <div className="hidden md:block">
                        {saveStatus === "success" && (
                            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-[10px] border border-emerald-100">
                                <CheckCircle2 size={16} />
                                <span className="text-xs font-black uppercase tracking-widest">{saveMessage}</span>
                            </div>
                        )}
                        {saveStatus === "error" && (
                            <div className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-[10px] border border-red-100">
                                <AlertCircle size={16} />
                                <span className="text-xs font-black uppercase tracking-widest">{saveMessage}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid lg:grid-cols-12 gap-10">
                    {/* Navigation Sidebar */}
                    <div className="lg:col-span-3 space-y-2">
                        {tabs.map((tab) => {
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as TabType)}
                                    className={`w-full flex items-center justify-between px-5 py-4 rounded-[10px] transition-all duration-300 group ${
                                        isActive
                                            ? "bg-white shadow-xl shadow-blue-100/50 border border-blue-100"
                                            : "hover:bg-white/60 hover:shadow-md border border-transparent"
                                    }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-[10px] transition-colors ${isActive ? tab.bg : "bg-gray-100 group-hover:bg-white"}`}>
                                            <tab.icon size={18} className={isActive ? tab.color : "text-gray-400"} />
                                        </div>
                                        <span className={`text-sm font-bold ${isActive ? "text-gray-900" : "text-gray-500 group-hover:text-gray-700"}`}>
                                            {tab.label}
                                        </span>
                                    </div>
                                    {isActive && <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />}
                                </button>
                            );
                        })}
                    </div>

                    {/* Main Content Card */}
                    <div className="lg:col-span-9 bg-white rounded-[10px] border border-gray-100 shadow-2xl shadow-blue-50/50 overflow-hidden flex flex-col min-h-[600px]">
                        <div className="flex-1 p-8 md:p-12">
                            {activeTab === "general" && <GeneralSettings user={user} onSave={handleApiUpdate} isSaving={saveStatus === "saving"} />}
                            {activeTab === "security" && <SecuritySettings onSave={handleApiUpdate} isSaving={saveStatus === "saving"} />}
                            {activeTab === "notifications" && <NotificationSettings />}
                            {activeTab === "privacy" && <PrivacySettings />}
                            {activeTab === "billing" && <BillingSettings />}
                        </div>

                        {/* Mobile status */}
                        {(saveStatus === "success" || saveStatus === "error") && (
                            <div className={`md:hidden px-8 py-3 flex items-center gap-2 text-xs font-bold ${saveStatus === "success" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}>
                                {saveStatus === "success" ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                                {saveMessage}
                            </div>
                        )}

                        {/* Footer */}
                        <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-50 flex items-center justify-between">
                            <p className="text-xs text-gray-400 font-medium italic hidden md:block">Changes are reflected across the platform after saving.</p>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

function GeneralSettings({ user, onSave, isSaving }: { user: any; onSave: (data: object) => void; isSaving: boolean }) {
    const [name, setName] = useState(user?.name || "");

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 rounded-[10px] bg-blue-50 text-blue-600 flex items-center justify-center">
                    <User size={24} />
                </div>
                <div>
                    <h3 className="text-xl font-black text-gray-900">General Profile</h3>
                    <p className="text-sm text-gray-400 font-medium">Update your basic account identifiers.</p>
                </div>
            </header>

            <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Account Display Name</label>
                    <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-[10px] font-bold text-gray-900 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all outline-none"
                    />
                </div>
                <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Login Identity (Email)</label>
                    <div className="relative group">
                        <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="email" 
                            defaultValue={user?.email}
                            className="w-full pl-14 pr-5 py-4 bg-gray-100/50 border border-gray-100 rounded-[10px] font-bold text-gray-400 cursor-not-allowed outline-none"
                            disabled
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-end">
                <button
                    onClick={() => onSave({ name })}
                    disabled={isSaving || !name.trim()}
                    className="px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-[10px] font-black text-xs uppercase tracking-[0.2em] flex items-center gap-2 transition-all disabled:opacity-50 shadow-xl shadow-blue-200"
                >
                    {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    Save Name
                </button>
            </div>

            <div className="p-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-[10px] border border-blue-100/50 flex flex-col md:flex-row gap-6 items-start md:items-center">
                <div className="p-4 bg-white rounded-[10px] text-blue-600 shadow-sm">
                    <Smartphone size={24} />
                </div>
                <div className="flex-1">
                    <h4 className="text-base font-black text-blue-900 mb-1">Professional Identity Management</h4>
                    <p className="text-sm text-blue-700/80 leading-relaxed max-w-xl">Deep profile details like your biography, portfolio, and skills are managed on your professional profile edit page.</p>
                </div>
                <a href={user?.role === "EMPLOYER" ? "/manage/profile" : "/profile/edit"} className="px-6 py-3 bg-white text-blue-600 rounded-[10px] text-[10px] font-black uppercase tracking-widest shadow-sm hover:shadow-md transition-all whitespace-nowrap">
                    Go to Profile Edit
                </a>
            </div>
        </div>
    );
}

function SecuritySettings({ onSave, isSaving }: { onSave: (data: object) => void; isSaving: boolean }) {
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [mismatch, setMismatch] = useState(false);

    const handleSubmit = () => {
        if (newPassword !== confirmPassword) {
            setMismatch(true);
            return;
        }
        setMismatch(false);
        onSave({ currentPassword, newPassword });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 rounded-[10px] bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Lock size={24} />
                </div>
                <div>
                    <h3 className="text-xl font-black text-gray-900">Security Guard</h3>
                    <p className="text-sm text-gray-400 font-medium">Manage your password and account integrity.</p>
                </div>
            </header>

            <div className="grid gap-6 max-w-lg">
                <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Current Password</label>
                    <div className="relative">
                        <input 
                            type={showCurrent ? "text" : "password"}
                            value={currentPassword}
                            onChange={e => setCurrentPassword(e.target.value)}
                            placeholder="••••••••••••"
                            className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-[10px] font-bold text-gray-900 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all outline-none pr-12"
                        />
                        <button onClick={() => setShowCurrent(!showCurrent)} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-900 transition-colors">
                            {showCurrent ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">New Password</label>
                        <div className="relative">
                            <input 
                                type={showNew ? "text" : "password"}
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                className={`w-full px-5 py-4 bg-gray-50 border rounded-[10px] font-bold text-gray-900 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none pr-12 ${mismatch ? "border-red-300 focus:border-red-400" : "border-gray-100 focus:border-blue-500"}`}
                            />
                            <button onClick={() => setShowNew(!showNew)} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-900 transition-colors">
                                {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Confirm New Password</label>
                        <div className="relative">
                            <input 
                                type={showConfirm ? "text" : "password"}
                                value={confirmPassword}
                                onChange={e => { setConfirmPassword(e.target.value); setMismatch(false); }}
                                className={`w-full px-5 py-4 bg-gray-50 border rounded-[10px] font-bold text-gray-900 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none pr-12 ${mismatch ? "border-red-300 focus:border-red-400" : "border-gray-100 focus:border-blue-500"}`}
                            />
                            <button onClick={() => setShowConfirm(!showConfirm)} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-900 transition-colors">
                                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>
                </div>
                {mismatch && (
                    <p className="text-xs text-red-500 font-bold flex items-center gap-1.5"><AlertCircle size={12} /> Passwords do not match.</p>
                )}
            </div>

            <div className="flex justify-end">
                <button
                    onClick={handleSubmit}
                    disabled={isSaving || !currentPassword || !newPassword || !confirmPassword}
                    className="px-10 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[10px] font-black text-xs uppercase tracking-[0.2em] flex items-center gap-2 transition-all disabled:opacity-50 shadow-xl shadow-emerald-200"
                >
                    {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
                    Update Password
                </button>
            </div>

            <div className="pt-10 border-t border-gray-50">
                <div className="bg-rose-50 rounded-[10px] border border-rose-100 p-8 flex flex-col md:flex-row gap-8 items-start md:items-center">
                    <div className="flex-1">
                        <h4 className="text-rose-600 font-black text-xs uppercase tracking-widest mb-2">Advanced Protection</h4>
                        <p className="text-xl font-bold text-rose-900 mb-2">Account Deactivation</p>
                        <p className="text-sm text-rose-700/70 max-w-lg leading-relaxed font-medium">Suspending your account will hide your profile from all search results. You can restore access within 30 days by logging back in.</p>
                    </div>
                    <button className="px-8 py-4 bg-white border border-rose-200 text-rose-600 hover:bg-rose-600 hover:text-white rounded-[10px] text-[10px] font-black uppercase tracking-widest shadow-sm transition-all whitespace-nowrap">
                        Deactivate Account
                    </button>
                </div>
            </div>
        </div>
    );
}

function NotificationSettings() {
    const [emailAlerts, setEmailAlerts] = useState(true);
    const [jobMatches, setJobMatches] = useState(true);
    const [marketing, setMarketing] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 rounded-[10px] bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Bell size={24} />
                </div>
                <div>
                    <h3 className="text-xl font-black text-gray-900">Platform Alerts</h3>
                    <p className="text-sm text-gray-400 font-medium">Control how and when you hear from us.</p>
                </div>
            </header>

            <div className="grid gap-4">
                <ToggleItem 
                    title="Account Communication" 
                    desc="Stay informed about new messages, hire requests, and security alerts." 
                    active={emailAlerts}
                    onToggle={() => setEmailAlerts(!emailAlerts)}
                />
                <ToggleItem 
                    title="Intelligent Recommendation" 
                    desc="Receive curated lists of job matches or top talent based on your activity." 
                    active={jobMatches}
                    onToggle={() => setJobMatches(!jobMatches)}
                />
                <ToggleItem 
                    title="Ecosystem Updates" 
                    desc="Our newsletter with career growth tips and platform engineering updates." 
                    active={marketing}
                    onToggle={() => setMarketing(!marketing)}
                />
            </div>
            <div className="flex justify-end">
                <button onClick={handleSave} className="px-10 py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-[10px] font-black text-xs uppercase tracking-[0.2em] flex items-center gap-2 transition-all shadow-xl shadow-amber-100">
                    {saved ? <><CheckCircle2 size={16} /> Saved!</> : <><Save size={16} /> Save Preferences</>}
                </button>
            </div>
        </div>
    );
}

function PrivacySettings() {
    const [publicProfile, setPublicProfile] = useState(true);
    const [showEarnings, setShowEarnings] = useState(true);
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 rounded-[10px] bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Shield size={24} />
                </div>
                <div>
                    <h3 className="text-xl font-black text-gray-900">Privacy Control</h3>
                    <p className="text-sm text-gray-400 font-medium">Manage your visibility and data footprints.</p>
                </div>
            </header>

            <div className="grid gap-4">
                <ToggleItem 
                    title="Public Discovery Mode" 
                    desc="Determine if your professional profile is indexable by external search engines." 
                    active={publicProfile}
                    onToggle={() => setPublicProfile(!publicProfile)}
                />
                <ToggleItem 
                    title="Reputation Visibility" 
                    desc="Control if your aggregate trust score is visible on your public profile." 
                    active={showEarnings}
                    onToggle={() => setShowEarnings(!showEarnings)}
                />
            </div>
            <div className="flex justify-end">
                <button onClick={handleSave} className="px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[10px] font-black text-xs uppercase tracking-[0.2em] flex items-center gap-2 transition-all shadow-xl shadow-indigo-200">
                    {saved ? <><CheckCircle2 size={16} /> Saved!</> : <><Save size={16} /> Save Preferences</>}
                </button>
            </div>
        </div>
    );
}

function BillingSettings() {
    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 rounded-[10px] bg-rose-50 text-rose-600 flex items-center justify-center">
                    <CreditCard size={24} />
                </div>
                <div>
                    <h3 className="text-xl font-black text-gray-900">Hiring Subscription</h3>
                    <p className="text-sm text-gray-400 font-medium">Manage your recruitment budget and invoices.</p>
                </div>
            </header>

            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[10px] p-10 relative overflow-hidden text-white border border-slate-700">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20" />
                
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                    <div>
                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-3 block">Tier: Verified Recruiter</span>
                        <h4 className="text-3xl font-black mb-4 tracking-tight leading-none">Standard Platform Access</h4>
                        <div className="flex items-center gap-4 mt-6">
                            <div className="px-4 py-2 bg-white/10 rounded-[10px] border border-white/10 backdrop-blur-md">
                                <p className="text-[10px] font-black uppercase text-gray-400 mb-0.5">Postings</p>
                                <p className="text-lg font-black italic">5 Active</p>
                            </div>
                            <div className="px-4 py-2 bg-blue-500/20 rounded-[10px] border border-blue-500/20 backdrop-blur-md">
                                <p className="text-[10px] font-black uppercase text-blue-300 mb-0.5">Reach</p>
                                <p className="text-lg font-black">Unlimited</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex flex-col gap-3 w-full md:w-auto">
                        <button className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-[10px] text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-900/40 transition-all">
                            Upgrade To Enterprise
                        </button>
                        <button className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-[10px] text-[10px] font-black uppercase tracking-widest transition-all">
                            Manage Payment Methods
                        </button>
                    </div>
                </div>
            </div>
            
            <div className="p-6 border border-gray-100 rounded-[10px] bg-gray-50/50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-white rounded-[10px] shadow-sm text-gray-400">
                        <FileText size={20} />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-900">Historical Billing</p>
                        <p className="text-xs text-gray-400 font-medium">Access your monthly statements and tax receipts.</p>
                    </div>
                </div>
                <button className="text-xs font-black text-blue-600 uppercase tracking-widest hover:underline decoration-2 underline-offset-4 mr-2">
                    View Archive
                </button>
            </div>
        </div>
    );
}

function ToggleItem({ title, desc, active, onToggle }: { title: string, desc: string, active: boolean, onToggle: () => void }) {
    return (
        <div className="flex items-center justify-between p-6 rounded-[10px] hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100 group">
            <div className="pr-10">
                <p className="text-base font-bold text-gray-900 mb-1">{title}</p>
                <p className="text-sm text-gray-400 font-medium leading-relaxed max-w-lg">{desc}</p>
            </div>
            <button 
                onClick={onToggle}
                className={`w-14 h-7 rounded-[10px] relative transition-all duration-500 flex-shrink-0 ${
                    active ? "bg-blue-600 shadow-lg shadow-blue-200" : "bg-gray-200"
                }`}
            >
                <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-[8px] border-white transition-all duration-500 ${active ? "translate-x-7" : ""}`} />
            </button>
        </div>
    );
}
