"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
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
    History
} from "lucide-react";
import Image from "next/image";

export default function ProfileEditPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
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

    // Experience State
    const [experiences, setExperiences] = useState<{ company: string, role: string, duration: string, description: string }[]>([]);

    // Education State
    const [education, setEducation] = useState<{ school: string, degree: string, year: string }[]>([]);

    // Social Links State
    const [socialLinks, setSocialLinks] = useState({
        linkedin: "",
        github: "",
        twitter: ""
    });

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
                            if (data.skills) {
                                try {
                                    setSkills(JSON.parse(data.skills));
                                } catch (e) {
                                    setSkills([]);
                                }
                            }
                            setSalary(data.expectedSalary?.toString() || "");
                            setAvailability(data.availability || "Full-Time");
                            setAvatarUrl(data.avatarUrl || "");
                            setResumeUrl(data.resumeUrl || "");
                            setPhone(data.phone || "");
                            setLocation(data.location || "");
                            setPortfolioUrl(data.portfolioUrl || "");

                            if (data.experience) {
                                try {
                                    setExperiences(JSON.parse(data.experience));
                                } catch (e) {
                                    setExperiences([]);
                                }
                            }

                            if (data.education) {
                                try {
                                    setEducation(JSON.parse(data.education));
                                } catch (e) {
                                    setEducation([]);
                                }
                            }

                            if (data.socialLinks) {
                                try {
                                    setSocialLinks(JSON.parse(data.socialLinks));
                                } catch (e) {
                                    setSocialLinks({ linkedin: "", github: "", twitter: "" });
                                }
                            }

                            // Store initial server data to prevent auto-save overwrite
                            serverDataRef.current = JSON.stringify({
                                title: data.title || "",
                                bio: data.bio || "",
                                skills: data.skills || "[]",
                                salary: data.expectedSalary?.toString() || "",
                                availability: data.availability || "Full-Time",
                                phone: data.phone || "",
                                location: data.location || "",
                                portfolioUrl: data.portfolioUrl || "",
                                experiences: data.experience || "[]",
                                education: data.education || "[]",
                                socialLinks: data.socialLinks || JSON.stringify({ linkedin: "", github: "", twitter: "" })
                            });
                        }
                    }
                } catch (err) {
                    console.error("Failed to fetch profile", err);
                } finally {
                    setFetching(false);
                    // Check for draft after fetching initial data
                    const draft = localStorage.getItem("freelancer_profile_draft");
                    if (draft) {
                        setHasDraft(true);
                    }
                }
            };
            fetchProfile();
        }
    }, [status, router]);

    // Auto-save draft to localStorage
    useEffect(() => {
        if (fetching) return;

        const currentData = JSON.stringify({
            title, bio, skills, salary, availability, phone, location, portfolioUrl,
            experiences, education, socialLinks
        });

        // ONLY save if data is different from what was loaded from server
        // This prevents overwriting a REAL draft with DB data on load
        if (currentData !== serverDataRef.current) {
            localStorage.setItem("freelancer_profile_draft", currentData);
        }
    }, [title, bio, skills, salary, availability, phone, location, portfolioUrl, experiences, education, socialLinks, fetching]);

    const handleRestoreDraft = () => {
        const draftJson = localStorage.getItem("freelancer_profile_draft");
        if (draftJson) {
            const draft = JSON.parse(draftJson);
            setTitle(draft.title || "");
            setBio(draft.bio || "");
            const parseSkills = (s: any) => {
                if (Array.isArray(s)) return s;
                if (typeof s === "string") {
                    try { return JSON.parse(s); } catch (e) { return []; }
                }
                return [];
            };

            setSkills(parseSkills(draft.skills));
            setSalary(draft.salary || "");
            setAvailability(draft.availability || "Full-Time");
            setPhone(draft.phone || "");
            setLocation(draft.location || "");
            setPortfolioUrl(draft.portfolioUrl || "");
            setExperiences(parseSkills(draft.experiences));
            setEducation(parseSkills(draft.education));
            setSocialLinks(draft.socialLinks ? (typeof draft.socialLinks === "string" ? JSON.parse(draft.socialLinks) : draft.socialLinks) : { linkedin: "", github: "", twitter: "" });
            setHasDraft(false);
        }
    };

    const handleDiscardDraft = () => {
        localStorage.removeItem("freelancer_profile_draft");
        setHasDraft(false);
    };

    const handleAddSkill = () => {
        if (newSkill && !skills.includes(newSkill)) {
            setSkills([...skills, newSkill]);
            setNewSkill("");
        }
    };

    const handleRemoveSkill = (skill: string) => {
        setSkills(skills.filter(s => s !== skill));
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/api/upload/avatar", {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            setAvatarUrl(data.url);
        } catch (err) {
            console.error("Upload failed", err);
        }
    };

    const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/api/upload/resume", {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            setResumeUrl(data.url);
        } catch (err) {
            console.error("Upload failed", err);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/profile/freelancer", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    bio,
                    skills: JSON.stringify(skills),
                    expectedSalary: salary,
                    availability,
                    phone,
                    location,
                    portfolioUrl,
                    experience: JSON.stringify(experiences),
                    education: JSON.stringify(education),
                    socialLinks: JSON.stringify(socialLinks)
                }),
            });

            if (res.ok) {
                localStorage.removeItem("freelancer_profile_draft");
                router.push("/dashboard");
                router.refresh();
            } else {
                const errorText = await res.text();
                alert(`Error saving profile: ${errorText}`);
            }
        } catch (err) {
            console.error("Save failed", err);
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <Navbar />

            <div className="pt-24 max-w-4xl mx-auto px-4 sm:px-6">
                <div className="bg-white rounded-3xl shadow-xl shadow-blue-100/30 overflow-hidden border border-gray-100">
                    {/* Header */}
                    <div className="p-8 border-b border-gray-100 bg-gradient-to-r from-blue-600 to-indigo-700">
                        <h1 className="text-2xl font-bold text-white mb-1">Complete Your Professional Profile</h1>
                        <p className="text-blue-100 text-sm">Fill in these details to start getting noticed by top employers.</p>
                    </div>

                    {/* Draft Restore Bar */}
                    {hasDraft && (
                        <div className="bg-orange-50 border-b border-orange-100 p-4 flex items-center justify-between animate-in slide-in-from-top duration-500">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                                    <History size={20} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-orange-900">Unsaved draft found</p>
                                    <p className="text-xs text-orange-600">You have progress from your last visit that wasn't saved yet.</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={handleDiscardDraft}
                                    className="px-4 py-2 text-xs font-bold text-orange-700 hover:bg-orange-100 rounded-lg transition-all"
                                >
                                    Discard
                                </button>
                                <button
                                    onClick={handleRestoreDraft}
                                    className="px-4 py-2 text-xs font-bold bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-all shadow-sm shadow-orange-200"
                                >
                                    Restore Draft
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="p-8 space-y-12">
                        {/* Avatar Section */}
                        <section className="flex flex-col md:flex-row gap-8 items-center">
                            <div className="relative group">
                                <div className="w-32 h-32 rounded-3xl bg-gray-100 border-4 border-white shadow-lg overflow-hidden flex items-center justify-center">
                                    {avatarUrl ? (
                                        <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={48} className="text-gray-300" />
                                    )}
                                </div>
                                <label className="absolute -bottom-2 -right-2 p-2 bg-blue-600 text-white rounded-xl shadow-lg cursor-pointer hover:bg-blue-700 transition-all">
                                    <Upload size={18} />
                                    <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*" />
                                </label>
                            </div>
                            <div className="flex-1 text-center md:text-left">
                                <h3 className="text-lg font-bold text-gray-900 mb-1">Profile Photo</h3>
                                <p className="text-gray-500 text-sm mb-4">A professional photo increases your hire rate by 3x.</p>
                            </div>
                        </section>

                        <hr className="border-gray-100" />

                        <section className="space-y-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><User size={20} /></div>
                                <h3 className="text-xl font-bold text-gray-900">Personal Information</h3>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Location</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            value={location}
                                            onChange={(e) => setLocation(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition-all font-medium"
                                            placeholder="City, Country"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition-all font-medium"
                                            placeholder="+1 (555) 000-0000"
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>

                        <hr className="border-gray-100" />

                        {/* Basic Info */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Briefcase size={20} /></div>
                                <h3 className="text-xl font-bold text-gray-900">Professional Summary</h3>
                            </div>

                            <div className="grid gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Professional Title</label>
                                    <input
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition-all font-medium"
                                        placeholder="e.g. Senior Virtual Assistant / React Developer"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Bio / Experience Summary</label>
                                    <textarea
                                        rows={4}
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition-all font-medium"
                                        placeholder="Tell us about your background and what you can do..."
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Skills */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><FileText size={20} /></div>
                                <h3 className="text-xl font-bold text-gray-900">Core Skills</h3>
                            </div>

                            <div className="space-y-4">
                                <div className="flex gap-2">
                                    <input
                                        value={newSkill}
                                        onChange={(e) => setNewSkill(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                                        className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition-all font-medium"
                                        placeholder="Add a skill (e.g. Photoshop, Customer Support)"
                                    />
                                    <button
                                        onClick={handleAddSkill}
                                        className="px-6 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all"
                                    >
                                        <Plus size={20} />
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {Array.isArray(skills) && skills.map(skill => (
                                        <span key={skill} className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-lg text-sm font-bold">
                                            {skill}
                                            <button onClick={() => handleRemoveSkill(skill)} className="hover:text-red-500"><X size={14} /></button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </section>

                        <hr className="border-gray-100" />

                        {/* Portfolio & Socials */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><Globe size={20} /></div>
                                <h3 className="text-xl font-bold text-gray-900">Portfolio & Socials</h3>
                            </div>

                            <div className="grid gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Portfolio Website</label>
                                    <div className="relative">
                                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            value={portfolioUrl}
                                            onChange={(e) => setPortfolioUrl(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition-all font-medium"
                                            placeholder="https://yourportfolio.com"
                                        />
                                    </div>
                                </div>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">LinkedIn Profile</label>
                                        <div className="relative">
                                            <Linkedin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                value={socialLinks.linkedin}
                                                onChange={(e) => setSocialLinks({ ...socialLinks, linkedin: e.target.value })}
                                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition-all font-medium"
                                                placeholder="linked.com/in/username"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">GitHub Profile</label>
                                        <div className="relative">
                                            <Github className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                value={socialLinks.github}
                                                onChange={(e) => setSocialLinks({ ...socialLinks, github: e.target.value })}
                                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition-all font-medium"
                                                placeholder="github.com/username"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <hr className="border-gray-100" />

                        {/* Work Experience */}
                        <section className="space-y-6">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><Briefcase size={20} /></div>
                                    <h3 className="text-xl font-bold text-gray-900">Work Experience</h3>
                                </div>
                                <button
                                    onClick={() => setExperiences([...experiences, { company: "", role: "", duration: "", description: "" }])}
                                    className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700"
                                >
                                    <Plus size={16} /> Add Experience
                                </button>
                            </div>

                            <div className="space-y-6">
                                {experiences.map((exp, idx) => (
                                    <div key={idx} className="p-6 bg-gray-50 rounded-2xl border border-gray-200 relative">
                                        <button
                                            onClick={() => setExperiences(experiences.filter((_, i) => i !== idx))}
                                            className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Company</label>
                                                <input
                                                    value={exp.company}
                                                    onChange={(e) => {
                                                        const newExps = [...experiences];
                                                        newExps[idx].company = e.target.value;
                                                        setExperiences(newExps);
                                                    }}
                                                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition-all font-medium"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Role</label>
                                                <input
                                                    value={exp.role}
                                                    onChange={(e) => {
                                                        const newExps = [...experiences];
                                                        newExps[idx].role = e.target.value;
                                                        setExperiences(newExps);
                                                    }}
                                                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition-all font-medium"
                                                />
                                            </div>
                                        </div>
                                        <div className="mb-4">
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Duration (e.g. 2021 - 2023)</label>
                                            <input
                                                value={exp.duration}
                                                onChange={(e) => {
                                                    const newExps = [...experiences];
                                                    newExps[idx].duration = e.target.value;
                                                    setExperiences(newExps);
                                                }}
                                                className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition-all font-medium"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
                                            <textarea
                                                rows={2}
                                                value={exp.description}
                                                onChange={(e) => {
                                                    const newExps = [...experiences];
                                                    newExps[idx].description = e.target.value;
                                                    setExperiences(newExps);
                                                }}
                                                className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition-all font-medium"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <hr className="border-gray-100" />

                        {/* Education */}
                        <section className="space-y-6">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><GraduationCap size={20} /></div>
                                    <h3 className="text-xl font-bold text-gray-900">Education</h3>
                                </div>
                                <button
                                    onClick={() => setEducation([...education, { school: "", degree: "", year: "" }])}
                                    className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700"
                                >
                                    <Plus size={16} /> Add Education
                                </button>
                            </div>

                            <div className="space-y-6">
                                {education.map((edu, idx) => (
                                    <div key={idx} className="p-6 bg-gray-50 rounded-2xl border border-gray-200 relative">
                                        <button
                                            onClick={() => setEducation(education.filter((_, i) => i !== idx))}
                                            className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">School / University</label>
                                                <input
                                                    value={edu.school}
                                                    onChange={(e) => {
                                                        const newEdu = [...education];
                                                        newEdu[idx].school = e.target.value;
                                                        setEducation(newEdu);
                                                    }}
                                                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition-all font-medium"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Degree</label>
                                                <input
                                                    value={edu.degree}
                                                    onChange={(e) => {
                                                        const newEdu = [...education];
                                                        newEdu[idx].degree = e.target.value;
                                                        setEducation(newEdu);
                                                    }}
                                                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition-all font-medium"
                                                />
                                            </div>
                                        </div>
                                        <div className="mt-4">
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Year</label>
                                            <input
                                                value={edu.year}
                                                onChange={(e) => {
                                                    const newEdu = [...education];
                                                    newEdu[idx].year = e.target.value;
                                                    setEducation(newEdu);
                                                }}
                                                className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition-all font-medium"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <hr className="border-gray-100" />

                        {/* Resume */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><FileText size={20} /></div>
                                <h3 className="text-xl font-bold text-gray-900">CV / Resume</h3>
                            </div>

                            <div className="p-8 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 text-center">
                                {resumeUrl ? (
                                    <div className="flex flex-col items-center">
                                        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
                                            <FileText size={32} />
                                        </div>
                                        <p className="font-bold text-gray-900 mb-2">Resume Uploaded Successfully!</p>
                                        <div className="flex gap-4">
                                            <a href={resumeUrl} target="_blank" className="text-sm font-bold text-blue-600 hover:underline">View Current Resume</a>
                                            <label className="text-sm font-bold text-gray-500 hover:text-gray-700 cursor-pointer">
                                                Change File
                                                <input type="file" className="hidden" onChange={handleResumeUpload} accept=".pdf,.doc,.docx" />
                                            </label>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center">
                                        <Upload className="text-gray-300 mb-4" size={48} />
                                        <p className="font-bold text-gray-900 mb-1">Upload your CV / Resume</p>
                                        <p className="text-sm text-gray-500 mb-6">PDF, DOC, DOCX up to 5MB</p>
                                        <label className="px-6 py-2 bg-white border border-gray-200 text-gray-900 rounded-xl font-bold hover:bg-gray-100 cursor-pointer transition-all shadow-sm">
                                            Choose File
                                            <input type="file" className="hidden" onChange={handleResumeUpload} accept=".pdf,.doc,.docx" />
                                        </label>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Compensation */}
                        <section className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-green-50 text-green-600 rounded-lg"><DollarSign size={20} /></div>
                                    <h3 className="text-xl font-bold text-gray-900">Expected Salary</h3>
                                </div>
                                <div>
                                    <input
                                        type="number"
                                        value={salary}
                                        onChange={(e) => setSalary(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition-all font-medium"
                                        placeholder="USD per month"
                                    />
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Clock size={20} /></div>
                                    <h3 className="text-xl font-bold text-gray-900">Availability</h3>
                                </div>
                                <select
                                    value={availability}
                                    onChange={(e) => setAvailability(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition-all font-medium"
                                >
                                    <option>Full-Time</option>
                                    <option>Part-Time</option>
                                    <option>Flexible / Freelance</option>
                                </select>
                            </div>
                        </section>

                        <div className="pt-8">
                            <button
                                onClick={handleSave}
                                disabled={loading}
                                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : <><CheckCircle2 /> Save and Continue</>}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
