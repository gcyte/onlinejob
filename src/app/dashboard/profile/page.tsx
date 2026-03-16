"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import {
    User,
    Briefcase,
    FileText,
    DollarSign,
    Clock,
    Upload,
    CheckCircle2,
    Loader2,
    Plus,
    X,
    Phone,
    MapPin,
    Globe,
    Linkedin,
    Github,
    Trash2,
    GraduationCap,
    History,
    ArrowLeft,
    Save
} from "lucide-react";
import Link from "next/link";

export default function DashboardProfileEditPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [hasDraft, setHasDraft] = useState(false);
    const initialLoadDone = useRef(false);
    const serverDataRef = useRef<string>("");

    // Form State
    const [title, setTitle] = useState("");
    const [bio, setBio] = useState("");
    const [skills, setSkills] = useState<string[]>([]);
    const [newSkill, setNewSkill] = useState("");
    const [salary, setSalary] = useState("");
    const [availability, setAvailability] = useState("Full-Time");
    const [avatarUrl, setAvatarUrl] = useState("");
    const [resumeUrl, setResumeUrl] = useState("");
    const [phone, setPhone] = useState("");
    const [location, setLocation] = useState("");
    const [portfolioUrl, setPortfolioUrl] = useState("");
    const [experiences, setExperiences] = useState<{ company: string, role: string, duration: string, description: string }[]>([]);
    const [education, setEducation] = useState<{ school: string, degree: string, year: string }[]>([]);
    const [socialLinks, setSocialLinks] = useState({ linkedin: "", github: "", twitter: "" });

    useEffect(() => {
        if (status === "authenticated" && !initialLoadDone.current) {
            initialLoadDone.current = true;
            const fetchProfile = async () => {
                try {
                    const res = await fetch("/api/profile/freelancer");
                    if (res.ok) {
                        const data = await res.json();
                        if (data.id) {
                            setTitle(data.title || "");
                            setBio(data.bio || "");
                            try { setSkills(JSON.parse(data.skills || "[]")); } catch { setSkills([]); }
                            setSalary(data.expectedSalary?.toString() || "");
                            setAvailability(data.availability || "Full-Time");
                            setAvatarUrl(data.avatarUrl || "");
                            setResumeUrl(data.resumeUrl || "");
                            setPhone(data.phone || "");
                            setLocation(data.location || "");
                            setPortfolioUrl(data.portfolioUrl || "");
                            try { setExperiences(JSON.parse(data.experience || "[]")); } catch { setExperiences([]); }
                            try { setEducation(JSON.parse(data.education || "[]")); } catch { setEducation([]); }
                            try { setSocialLinks(JSON.parse(data.socialLinks || "{}")); } catch { setSocialLinks({ linkedin: "", github: "", twitter: "" }); }
                            serverDataRef.current = JSON.stringify({ title: data.title || "", bio: data.bio || "", skills: data.skills || "[]", salary: data.expectedSalary?.toString() || "", availability: data.availability || "Full-Time", phone: data.phone || "", location: data.location || "", portfolioUrl: data.portfolioUrl || "", experiences: data.experience || "[]", education: data.education || "[]", socialLinks: data.socialLinks || "{}" });
                        }
                    }
                } catch (err) { console.error(err); }
                finally {
                    setFetching(false);
                    if (localStorage.getItem("freelancer_profile_draft")) setHasDraft(true);
                }
            };
            fetchProfile();
        }
    }, [status]);

    useEffect(() => {
        if (fetching) return;
        const current = JSON.stringify({ title, bio, skills, salary, availability, phone, location, portfolioUrl, experiences, education, socialLinks });
        if (current !== serverDataRef.current) localStorage.setItem("freelancer_profile_draft", current);
    }, [title, bio, skills, salary, availability, phone, location, portfolioUrl, experiences, education, socialLinks, fetching]);

    const restoreDraft = () => {
        const draftJson = localStorage.getItem("freelancer_profile_draft");
        if (!draftJson) return;
        const d = JSON.parse(draftJson);
        const parse = (s: any) => { if (Array.isArray(s)) return s; try { return JSON.parse(s); } catch { return []; } };
        setTitle(d.title || ""); setBio(d.bio || ""); setSkills(parse(d.skills)); setSalary(d.salary || "");
        setAvailability(d.availability || "Full-Time"); setPhone(d.phone || ""); setLocation(d.location || "");
        setPortfolioUrl(d.portfolioUrl || ""); setExperiences(parse(d.experiences)); setEducation(parse(d.education));
        setSocialLinks(d.socialLinks ? (typeof d.socialLinks === "string" ? JSON.parse(d.socialLinks) : d.socialLinks) : { linkedin: "", github: "", twitter: "" });
        setHasDraft(false);
    };

    const handleAddSkill = () => { if (newSkill && !skills.includes(newSkill)) { setSkills([...skills, newSkill]); setNewSkill(""); } };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]; if (!file) return;
        const formData = new FormData(); formData.append("file", file);
        try { const res = await fetch("/api/upload/avatar", { method: "POST", body: formData }); const data = await res.json(); setAvatarUrl(data.url); } catch (err) { console.error(err); }
    };

    const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]; if (!file) return;
        const formData = new FormData(); formData.append("file", file);
        try { const res = await fetch("/api/upload/resume", { method: "POST", body: formData }); const data = await res.json(); setResumeUrl(data.url); } catch (err) { console.error(err); }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/profile/freelancer", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, bio, skills: JSON.stringify(skills), expectedSalary: salary, availability, phone, location, portfolioUrl, experience: JSON.stringify(experiences), education: JSON.stringify(education), socialLinks: JSON.stringify(socialLinks) }),
            });
            if (res.ok) {
                localStorage.removeItem("freelancer_profile_draft");
                setSaveSuccess(true);
                setTimeout(() => setSaveSuccess(false), 3000);
                router.refresh();
            } else {
                alert(`Error: ${await res.text()}`);
            }
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    if (fetching) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="animate-spin text-blue-600" size={40} />
        </div>
    );

    return (
        <>
            <div className="max-w-4xl mx-auto">
                {/* Page Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="w-10 h-10 rounded-[10px] bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm">
                            <ArrowLeft size={18} />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Edit Profile</h1>
                            <p className="text-gray-500 text-sm font-medium mt-1">Update your professional profile to attract top employers.</p>
                        </div>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-[10px] font-black text-xs uppercase tracking-[0.2em] flex items-center gap-2 transition-all disabled:opacity-50 shadow-xl shadow-blue-200"
                    >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : saveSuccess ? <CheckCircle2 size={16} /> : <Save size={16} />}
                        {loading ? "Saving..." : saveSuccess ? "Saved!" : "Save Profile"}
                    </button>
                </div>

                {/* Draft Banner */}
                {hasDraft && (
                    <div className="mb-6 bg-orange-50 border border-orange-100 rounded-[10px] p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-100 text-orange-600 rounded-[10px]"><History size={18} /></div>
                            <div>
                                <p className="text-sm font-bold text-orange-900">Unsaved draft found</p>
                                <p className="text-xs text-orange-600">You have progress from your last visit.</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => { localStorage.removeItem("freelancer_profile_draft"); setHasDraft(false); }} className="px-4 py-2 text-xs font-bold text-orange-700 hover:bg-orange-100 rounded-[10px] transition-all">Discard</button>
                            <button onClick={restoreDraft} className="px-4 py-2 text-xs font-bold bg-orange-600 text-white rounded-[10px] hover:bg-orange-700 transition-all">Restore Draft</button>
                        </div>
                    </div>
                )}

                <div className="space-y-6">
                    {/* Avatar + Basic Info Card */}
                    <div className="bg-white rounded-[10px] border border-gray-100 shadow-sm p-8">
                        <h2 className="text-base font-black text-gray-900 uppercase tracking-widest text-xs mb-6 flex items-center gap-2"><User size={14} className="text-blue-600" /> Profile Photo & Identity</h2>
                        <div className="flex flex-col md:flex-row gap-8 items-start">
                            <div className="relative group flex-shrink-0">
                                <div className="w-28 h-28 rounded-[10px] bg-gray-100 border-2 border-gray-200 overflow-hidden flex items-center justify-center shadow-sm">
                                    {avatarUrl ? <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" /> : <User size={40} className="text-gray-300" />}
                                </div>
                                <label className="absolute -bottom-2 -right-2 p-2 bg-blue-600 text-white rounded-[10px] shadow-lg cursor-pointer hover:bg-blue-700 transition-all">
                                    <Upload size={16} />
                                    <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*" />
                                </label>
                            </div>
                            <div className="flex-1 grid md:grid-cols-2 gap-5 w-full">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Professional Title</label>
                                    <input value={title} onChange={e => setTitle(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-[10px] font-bold text-gray-900 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all outline-none text-sm" placeholder="e.g. Senior React Developer" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Location</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <input value={location} onChange={e => setLocation(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-[10px] font-bold text-gray-900 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all outline-none text-sm" placeholder="City, Country" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Phone Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <input value={phone} onChange={e => setPhone(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-[10px] font-bold text-gray-900 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all outline-none text-sm" placeholder="+63 900 000 0000" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Availability</label>
                                    <div className="relative">
                                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <select value={availability} onChange={e => setAvailability(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-[10px] font-bold text-gray-900 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all outline-none text-sm appearance-none">
                                            <option>Full-Time</option><option>Part-Time</option><option>Flexible / Freelance</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bio */}
                    <div className="bg-white rounded-[10px] border border-gray-100 shadow-sm p-8">
                        <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Briefcase size={14} className="text-indigo-600" /> Professional Summary</h2>
                        <textarea rows={5} value={bio} onChange={e => setBio(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-[10px] font-medium text-gray-900 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all outline-none text-sm resize-none" placeholder="Tell employers what you do, your background and what you're excellent at..." />
                    </div>

                    {/* Skills */}
                    <div className="bg-white rounded-[10px] border border-gray-100 shadow-sm p-8">
                        <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2"><FileText size={14} className="text-blue-600" /> Core Skills</h2>
                        <div className="flex gap-2 mb-4">
                            <input value={newSkill} onChange={e => setNewSkill(e.target.value)} onKeyDown={e => e.key === "Enter" && handleAddSkill()} className="flex-1 px-4 py-3 bg-gray-50 border border-gray-100 rounded-[10px] font-bold text-gray-900 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all outline-none text-sm" placeholder="Add a skill (e.g. React, Figma)" />
                            <button onClick={handleAddSkill} className="px-5 py-3 bg-gray-900 text-white rounded-[10px] font-bold hover:bg-black transition-all"><Plus size={18} /></button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {Array.isArray(skills) && skills.map(skill => (
                                <span key={skill} className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-[10px] text-xs font-bold">
                                    {skill}<button onClick={() => setSkills(skills.filter(s => s !== skill))} className="hover:text-red-500"><X size={12} /></button>
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Salary + Portfolio */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-[10px] border border-gray-100 shadow-sm p-8">
                            <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2"><DollarSign size={14} className="text-green-600" /> Expected Salary (USD/month)</h2>
                            <input type="number" value={salary} onChange={e => setSalary(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-[10px] font-bold text-gray-900 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all outline-none text-sm" placeholder="e.g. 1500" />
                        </div>
                        <div className="bg-white rounded-[10px] border border-gray-100 shadow-sm p-8">
                            <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Globe size={14} className="text-emerald-600" /> Portfolio & Social Links</h2>
                            <div className="space-y-3">
                                <div className="relative"><Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} /><input value={portfolioUrl} onChange={e => setPortfolioUrl(e.target.value)} className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-[10px] font-bold text-gray-900 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all outline-none text-sm" placeholder="Portfolio URL" /></div>
                                <div className="relative"><Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} /><input value={socialLinks.linkedin} onChange={e => setSocialLinks({ ...socialLinks, linkedin: e.target.value })} className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-[10px] font-bold text-gray-900 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all outline-none text-sm" placeholder="LinkedIn URL" /></div>
                                <div className="relative"><Github className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} /><input value={socialLinks.github} onChange={e => setSocialLinks({ ...socialLinks, github: e.target.value })} className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-[10px] font-bold text-gray-900 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all outline-none text-sm" placeholder="GitHub URL" /></div>
                            </div>
                        </div>
                    </div>

                    {/* Work Experience */}
                    <div className="bg-white rounded-[10px] border border-gray-100 shadow-sm p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><Briefcase size={14} className="text-orange-600" /> Work Experience</h2>
                            <button onClick={() => setExperiences([...experiences, { company: "", role: "", duration: "", description: "" }])} className="flex items-center gap-2 text-xs font-black text-blue-600 hover:text-blue-700 px-3 py-2 bg-blue-50 rounded-[10px] transition-all"><Plus size={14} /> Add</button>
                        </div>
                        <div className="space-y-4">
                            {experiences.map((exp, idx) => (
                                <div key={idx} className="p-6 bg-gray-50 rounded-[10px] border border-gray-100 relative">
                                    <button onClick={() => setExperiences(experiences.filter((_, i) => i !== idx))} className="absolute top-4 right-4 text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
                                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                                        <div><label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Company</label><input value={exp.company} onChange={e => { const n = [...experiences]; n[idx].company = e.target.value; setExperiences(n); }} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-[10px] font-bold text-gray-900 outline-none text-sm" /></div>
                                        <div><label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Role</label><input value={exp.role} onChange={e => { const n = [...experiences]; n[idx].role = e.target.value; setExperiences(n); }} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-[10px] font-bold text-gray-900 outline-none text-sm" /></div>
                                    </div>
                                    <div className="mb-4"><label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Duration</label><input value={exp.duration} onChange={e => { const n = [...experiences]; n[idx].duration = e.target.value; setExperiences(n); }} placeholder="e.g. 2021 - 2023" className="w-full px-3 py-2 bg-white border border-gray-200 rounded-[10px] font-bold text-gray-900 outline-none text-sm" /></div>
                                    <div><label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Description</label><textarea rows={2} value={exp.description} onChange={e => { const n = [...experiences]; n[idx].description = e.target.value; setExperiences(n); }} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-[10px] font-medium text-gray-900 outline-none text-sm resize-none" /></div>
                                </div>
                            ))}
                            {experiences.length === 0 && <div className="text-center py-8 text-xs text-gray-400 font-bold uppercase tracking-widest">No experience added yet.</div>}
                        </div>
                    </div>

                    {/* Education */}
                    <div className="bg-white rounded-[10px] border border-gray-100 shadow-sm p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><GraduationCap size={14} className="text-purple-600" /> Education</h2>
                            <button onClick={() => setEducation([...education, { school: "", degree: "", year: "" }])} className="flex items-center gap-2 text-xs font-black text-blue-600 hover:text-blue-700 px-3 py-2 bg-blue-50 rounded-[10px] transition-all"><Plus size={14} /> Add</button>
                        </div>
                        <div className="space-y-4">
                            {education.map((edu, idx) => (
                                <div key={idx} className="p-6 bg-gray-50 rounded-[10px] border border-gray-100 relative">
                                    <button onClick={() => setEducation(education.filter((_, i) => i !== idx))} className="absolute top-4 right-4 text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
                                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                                        <div><label className="block text-[9px] font-black text-gray-400 uppercase mb-1">School</label><input value={edu.school} onChange={e => { const n = [...education]; n[idx].school = e.target.value; setEducation(n); }} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-[10px] font-bold text-gray-900 outline-none text-sm" /></div>
                                        <div><label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Degree</label><input value={edu.degree} onChange={e => { const n = [...education]; n[idx].degree = e.target.value; setEducation(n); }} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-[10px] font-bold text-gray-900 outline-none text-sm" /></div>
                                    </div>
                                    <div><label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Year</label><input value={edu.year} onChange={e => { const n = [...education]; n[idx].year = e.target.value; setEducation(n); }} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-[10px] font-bold text-gray-900 outline-none text-sm" /></div>
                                </div>
                            ))}
                            {education.length === 0 && <div className="text-center py-8 text-xs text-gray-400 font-bold uppercase tracking-widest">No education added yet.</div>}
                        </div>
                    </div>

                    {/* Resume */}
                    <div className="bg-white rounded-[10px] border border-gray-100 shadow-sm p-8">
                        <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2"><FileText size={14} className="text-blue-600" /> CV / Resume</h2>
                        <div className="p-8 bg-gray-50 rounded-[10px] border-2 border-dashed border-gray-200 text-center">
                            {resumeUrl ? (
                                <div className="flex flex-col items-center">
                                    <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-[10px] flex items-center justify-center mb-3"><FileText size={28} /></div>
                                    <p className="font-bold text-gray-900 mb-3 text-sm">Resume uploaded!</p>
                                    <div className="flex gap-4">
                                        <a href={resumeUrl} target="_blank" className="text-xs font-bold text-blue-600 hover:underline">View Resume</a>
                                        <label className="text-xs font-bold text-gray-400 hover:text-gray-700 cursor-pointer">Change File<input type="file" className="hidden" onChange={handleResumeUpload} accept=".pdf,.doc,.docx" /></label>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center">
                                    <Upload className="text-gray-300 mb-3" size={40} />
                                    <p className="font-bold text-gray-900 mb-1 text-sm">Upload your CV / Resume</p>
                                    <p className="text-xs text-gray-400 mb-5">PDF, DOC, DOCX up to 5MB</p>
                                    <label className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-[10px] font-bold text-xs uppercase tracking-widest hover:bg-gray-50 cursor-pointer transition-all shadow-sm">Choose File<input type="file" className="hidden" onChange={handleResumeUpload} accept=".pdf,.doc,.docx" /></label>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Save button bottom */}
                    <div className="pb-6">
                        <button onClick={handleSave} disabled={loading} className="w-full py-4 bg-blue-600 text-white rounded-[10px] font-black text-sm uppercase tracking-[0.2em] hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 flex items-center justify-center gap-3 disabled:opacity-50">
                            {loading ? <><Loader2 className="animate-spin" size={20} /> Saving...</> : saveSuccess ? <><CheckCircle2 size={20} /> Saved Successfully!</> : <><Save size={20} /> Save Profile</>}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
