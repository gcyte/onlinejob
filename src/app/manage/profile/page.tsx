"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2, Plus, Save, Cloud, Building2, Globe, Users, Lightbulb, Scale, Users2, ShieldCheck, HeartPulse } from "lucide-react";

interface CultureValue {
    id: string;
    title: string;
    description: string;
    icon: string;
}

export default function EmployerProfileManagePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const hasFetched = useRef(false);

    const [companyName, setCompanyName] = useState("");
    const [companyWebsite, setCompanyWebsite] = useState("");
    const [industry, setIndustry] = useState("");
    const [companySize, setCompanySize] = useState("");
    const [description, setDescription] = useState("");
    const [companyAddress, setCompanyAddress] = useState("");

    // We'll keep these in state but currently the UI focuses on the visual design rather than actual file upload complexity for now
    const [companyLogo, setCompanyLogo] = useState("");
    const [coverPhotoUrl, setCoverPhotoUrl] = useState("");

    // Default initial mock values for culture, or empty
    const [cultureValues, setCultureValues] = useState<CultureValue[]>([]);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (session && (session.user as any).role !== "EMPLOYER") {
            router.push("/dashboard");
        }

        const fetchProfile = async () => {
            try {
                const res = await fetch("/api/profile/employer", {
                    cache: 'no-store',
                    headers: { 'Cache-Control': 'no-cache' }
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data) {
                        setCompanyName(data.companyName || "");
                        setDescription(data.description || "");
                        setCompanyWebsite(data.companyWebsite || "");
                        setIndustry(data.industry || "");
                        setCompanySize(data.companySize || "");
                        setCompanyLogo(data.companyLogo || "");
                        setCoverPhotoUrl(data.coverPhotoUrl || "");
                        setCompanyAddress(data.companyAddress || "");

                        try {
                            if (data.cultureValues) {
                                setCultureValues(JSON.parse(data.cultureValues));
                            } else {
                                // Default sample values from mockup if none exist
                                setCultureValues([
                                    {
                                        id: '1',
                                        icon: 'Lightbulb',
                                        title: 'Innovation First',
                                        description: 'We encourage radical thinking and calculated risks.'
                                    },
                                    {
                                        id: '2',
                                        icon: 'Users',
                                        title: 'Inclusive Growth',
                                        description: 'A diverse workspace where everyone has a voice.'
                                    },
                                    {
                                        id: '3',
                                        icon: 'Scale',
                                        title: 'Work-Life Balance',
                                        description: 'Remote-first culture with flexible working hours.'
                                    }
                                ]);
                            }
                        } catch (e) {
                            console.error("Failed to parse culture values", e);
                        }
                    }
                }
            } catch (err) {
                console.error("Failed to fetch profile", err);
            } finally {
                setFetching(false);
            }
        };

        if (status === "authenticated" && !hasFetched.current) {
            hasFetched.current = true;
            fetchProfile();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status, router]); // Intentionally omitting session so window-focus doesn't wipe unsaved data

    const handleSave = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/profile/employer", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    companyName,
                    description,
                    companyWebsite,
                    industry,
                    companySize,
                    companyLogo,
                    coverPhotoUrl,
                    companyAddress,
                    cultureValues
                }),
            });

            if (res.ok) {
                setSaved(true);
                router.refresh();
                setTimeout(() => setSaved(false), 2000);
                return;
            }

            const errorText = await res.text();
            console.error("Save API returned error:", res.status, errorText);
            alert(`Failed to save profile: ${errorText}`);
        } catch (err: any) {
            console.error("Save failed caught exception:", err);
            alert(`Error: ${err.message || String(err)}`);
        } finally {
            setLoading(false);
        }
    };

    const addValue = () => {
        const newValue: CultureValue = {
            id: Date.now().toString(),
            icon: 'Lightbulb',
            title: 'New Value',
            description: 'Description of value'
        };
        setCultureValues([...cultureValues, newValue]);
    };

    const removeValue = (id: string) => {
        setCultureValues(cultureValues.filter(v => v.id !== id));
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingLogo(true);
        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch("/api/upload/avatar", {
                method: "POST",
                body: formData,
            });

            if (res.ok) {
                const data = await res.json();
                setCompanyLogo(data.url);
            } else {
                const err = await res.text();
                alert(`Failed to upload logo: ${err}`);
            }
        } catch (error) {
            console.error(error);
            alert("An error occurred while uploading. Please try again.");
        } finally {
            setUploadingLogo(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    // Helper map for icons
    const renderIcon = (iconName: string, className: string = "") => {
        const props = { size: 18, strokeWidth: 2, className };
        switch (iconName) {
            case 'Lightbulb': return <Lightbulb {...props} />;
            case 'Users': return <Users {...props} />;
            case 'Users2': return <Users2 {...props} />;
            case 'Scale': return <Scale {...props} />;
            case 'ShieldCheck': return <ShieldCheck {...props} />;
            case 'HeartPulse': return <HeartPulse {...props} />;
            default: return <Building2 {...props} />;
        }
    };

    if (fetching) {
        return (
            <div className="flex items-center justify-center py-20 min-h-screen">
                <Loader2 className="animate-spin text-blue-600" size={32} />
            </div>
        );
    }

    return (
        <div className="w-full relative min-h-screen bg-[#F8FAFC]">
            {/* Main Content */}
            <div className="max-w-[1000px] mx-auto p-4 sm:p-6 lg:p-8 pt-8 pb-32">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-[28px] font-black text-[#0B1E3F] tracking-tight mb-2">Employer Profile Settings</h1>
                    <p className="text-[#64748B] text-[14px]">Update your company's public information and branding to attract top talent.</p>
                </div>

                <div className="space-y-6">
                    {/* Card 1: Company Branding */}
                    <div className="bg-white rounded-[1rem] border border-[#E2E8F0] overflow-hidden shadow-sm">
                        <div className="p-6">
                            <h2 className="text-[17px] font-bold text-[#0B1E3F] mb-6">Company Branding</h2>

                            <div className="flex items-center gap-5">
                                {/* Logo Upload Widget */}
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-[88px] h-[88px] bg-white rounded-xl shadow-sm p-1.5 flex items-center justify-center border border-slate-200 relative hover:cursor-pointer group shrink-0 overflow-hidden"
                                >
                                    <input
                                        type="file"
                                        className="hidden"
                                        ref={fileInputRef}
                                        accept="image/png, image/jpeg, image/gif"
                                        onChange={handleLogoUpload}
                                    />
                                    {uploadingLogo ? (
                                        <div className="w-full h-full bg-slate-50 flex items-center justify-center rounded-lg">
                                            <Loader2 className="animate-spin text-blue-500" size={24} />
                                        </div>
                                    ) : companyLogo ? (
                                        <div className="w-full h-full rounded-lg overflow-hidden border border-slate-100 flex items-center justify-center relative">
                                            <img src={companyLogo} alt="Logo" className="w-full h-full object-contain" />
                                            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Cloud strokeWidth={2} size={20} className="mb-0.5" />
                                                <span className="text-[8px] uppercase tracking-widest font-bold">Change</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="w-full h-full bg-[#136652] rounded-lg flex flex-col items-center justify-center text-white gap-1 transition-colors group-hover:bg-[#0f5443]">
                                            <Cloud strokeWidth={1.5} size={24} className="opacity-80" />
                                            <span className="text-[7px] uppercase tracking-widest opacity-80 font-semibold">Upload</span>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-[#334155] text-[13px] font-bold mb-1">Company Logo</h3>
                                    <p className="text-[#94A3B8] text-[11px] font-medium">JPG, GIF or PNG. Max size of 5MB.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Company Information */}
                    <div className="bg-white rounded-[1rem] border border-[#E2E8F0] shadow-sm p-6">
                        <h2 className="text-[17px] font-bold text-[#0B1E3F] mb-6">Company Information</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                            <div className="flex flex-col gap-2">
                                <label className="text-[#334155] text-[13px] font-semibold">Company Name</label>
                                <input
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.target.value)}
                                    className="w-full bg-white border border-[#E2E8F0] rounded-[8px] px-3.5 py-2.5 text-[#0F172A] text-[14px] outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all font-medium placeholder:text-slate-400"
                                    placeholder="CloudScale Solutions"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[#334155] text-[13px] font-semibold">Website</label>
                                <input
                                    value={companyWebsite}
                                    onChange={(e) => setCompanyWebsite(e.target.value)}
                                    className="w-full bg-white border border-[#E2E8F0] rounded-[8px] px-3.5 py-2.5 text-[#0F172A] text-[14px] outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all font-medium placeholder:text-slate-400"
                                    placeholder="https://cloudscale.io"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[#334155] text-[13px] font-semibold">Industry</label>
                                <div className="relative">
                                    <select
                                        value={industry}
                                        onChange={(e) => setIndustry(e.target.value)}
                                        className="w-full appearance-none bg-white border border-[#E2E8F0] rounded-[8px] pl-3.5 pr-10 py-2.5 text-[#0F172A] text-[14px] outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all font-medium cursor-pointer"
                                    >
                                        <option value="">Select Industry</option>
                                        <option value="Technology & SaaS">Technology & SaaS</option>
                                        <option value="E-Commerce">E-Commerce</option>
                                        <option value="Healthcare">Healthcare</option>
                                        <option value="Finance">Finance</option>
                                        <option value="Education">Education</option>
                                    </select>
                                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[#334155] text-[13px] font-semibold">Company Size</label>
                                <div className="relative">
                                    <select
                                        value={companySize}
                                        onChange={(e) => setCompanySize(e.target.value)}
                                        className="w-full appearance-none bg-white border border-[#E2E8F0] rounded-[8px] pl-3.5 pr-10 py-2.5 text-[#0F172A] text-[14px] outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all font-medium cursor-pointer"
                                    >
                                        <option value="">Select Size</option>
                                        <option value="1-10 Employees">1-10 Employees</option>
                                        <option value="11-50 Employees">11-50 Employees</option>
                                        <option value="51-200 Employees">51-200 Employees</option>
                                        <option value="201-500 Employees">201-500 Employees</option>
                                        <option value="500+ Employees">500+ Employees</option>
                                    </select>
                                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2 md:col-span-2">
                                <label className="text-[#334155] text-[13px] font-semibold">Company Address</label>
                                <input
                                    value={companyAddress}
                                    onChange={(e) => setCompanyAddress(e.target.value)}
                                    className="w-full bg-white border border-[#E2E8F0] rounded-[8px] px-3.5 py-2.5 text-[#0F172A] text-[14px] outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all font-medium placeholder:text-slate-400"
                                    placeholder="123 Business Ave, Suite 100, San Francisco, CA 94107"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Card 3: Company Description */}
                    <div className="bg-white rounded-[1rem] border border-[#E2E8F0] shadow-sm p-6">
                        <h2 className="text-[17px] font-bold text-[#0B1E3F] mb-6">Company Description</h2>

                        <div className="flex flex-col gap-2">
                            <label className="text-[#334155] text-[13px] font-semibold">About the Company</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={4}
                                className="w-full bg-white border border-[#E2E8F0] rounded-[8px] px-3.5 py-3 text-[#334155] text-[14px] outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all font-medium resize-y"
                                placeholder="CloudScale Solutions is a leading provider of enterprise-grade cloud infrastructure..."
                            />
                            <p className="text-[#94A3B8] text-[11px] font-medium mt-1">Briefly describe what your company does and what makes you unique. Minimum 100 characters.</p>
                        </div>
                    </div>

                    {/* Card 4: Culture & Values */}
                    <div className="bg-white rounded-[1rem] border border-[#E2E8F0] shadow-sm p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-[17px] font-bold text-[#0B1E3F]">Company Culture & Values</h2>
                            <button
                                onClick={addValue}
                                className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 text-[13px] font-bold transition-colors"
                            >
                                <Plus size={14} strokeWidth={2.5} /> Add Value
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {cultureValues.map((cv) => (
                                <div key={cv.id} className="bg-[#F8FAFC] rounded-[10px] p-4 flex items-start gap-4 border border-transparent hover:border-slate-200 transition-colors group">
                                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                                        {renderIcon(cv.icon, "text-[#0B4060]")}
                                    </div>
                                    <div className="flex-1 min-w-0 pt-0.5">
                                        <input
                                            value={cv.title}
                                            onChange={(e) => {
                                                const updated = cultureValues.map(v => v.id === cv.id ? { ...v, title: e.target.value } : v);
                                                setCultureValues(updated);
                                            }}
                                            className="text-[#0B1E3F] font-bold text-[14px] mb-0.5 w-full bg-transparent border-none outline-none focus:bg-white focus:ring-1 focus:ring-slate-300 rounded px-1 -ml-1 transition-colors"
                                        />
                                        <input
                                            value={cv.description}
                                            onChange={(e) => {
                                                const updated = cultureValues.map(v => v.id === cv.id ? { ...v, description: e.target.value } : v);
                                                setCultureValues(updated);
                                            }}
                                            className="text-[#64748B] text-[12px] w-full bg-transparent border-none outline-none focus:bg-white focus:ring-1 focus:ring-slate-300 rounded px-1 -ml-1 transition-colors block"
                                        />
                                    </div>
                                    <button
                                        onClick={() => removeValue(cv.id)}
                                        className="text-[#94A3B8] hover:text-red-500 opacity-60 hover:opacity-100 transition-all p-1"
                                    >
                                        <Trash2 size={16} strokeWidth={2} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom Action Bar - inline under the form */}
                <div className="mt-6 border-t border-[#E2E8F0] pt-6 flex items-center justify-end gap-6">
                    <button
                        onClick={() => router.refresh()}
                        className="text-[#475569] hover:text-[#0F172A] text-[13px] font-bold transition-colors"
                    >
                        Discard Changes
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading || saved}
                        className={`px-5 py-2.5 rounded-[6px] text-[13px] font-bold flex items-center gap-2 shadow-sm transition-colors disabled:opacity-50 ${saved
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                            : "bg-[#0B4060] hover:bg-blue-900 text-white"
                            }`}
                    >
                        {loading ? <Loader2 className="animate-spin" size={16} /> : saved ? <ShieldCheck size={16} strokeWidth={2.5} /> : <Save size={16} strokeWidth={2.5} />}
                        {saved ? "Saved!" : "Save Changes"}
                    </button>
                </div>
            </div>
        </div>
    );
}
