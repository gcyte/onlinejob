"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
    Briefcase,
    FileText,
    DollarSign,
    MapPin,
    CheckCircle2,
    Loader2,
    AlertCircle,
    History,
    ChevronRight,
    ArrowLeft,
    Clock,
    Zap,
    Plus,
    X,
    Eye,
    Check,
    Globe,
    ExternalLink,
    ChevronDown,
    Building2,
    Target,
    Settings,
    MousePointer2,
    Sparkles,
    Lightbulb,
    Mail,
    LayoutDashboard
} from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import 'react-quill-new/dist/quill.snow.css';

// Dynamically import React Quill with no SSR
const ReactQuill = dynamic(() => import('react-quill-new'), {
    ssr: false,
    loading: () => <div className="h-[200px] w-full bg-slate-50 animate-pulse rounded-lg" />
}) as any;

type JobType = "FULL_TIME" | "PART_TIME" | "FREELANCE" | "CONTRACT";

interface JobFormData {
    title: string;
    category: string;
    jobType: JobType;
    description: string;
    requirements: string;
    skills: string[];
    salaryMin: string;
    salaryMax: string;
    salaryCurrency: string;
    salaryFrequency: string;
    experienceLevel: string;
    englishProficiency: string;
    workStyle: string;
    location: string;
}

const initialData: JobFormData = {
    title: "",
    category: "",
    jobType: "FULL_TIME",
    description: "",
    requirements: "",
    skills: [],
    salaryMin: "",
    salaryMax: "",
    salaryCurrency: "USD ($)",
    salaryFrequency: "Monthly",
    experienceLevel: "",
    englishProficiency: "",
    workStyle: "Remote (Global)",
    location: "Remote"
};

export default function NewJobManagePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<JobFormData>(initialData);
    const [skillInput, setSkillInput] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (session && (session.user as any).role !== "EMPLOYER") {
            router.push("/dashboard");
        }
    }, [session, status, router]);

    const updateFormData = (updates: Partial<JobFormData>) => {
        setFormData(prev => ({ ...prev, ...updates }));
    };

    const addSkill = () => {
        if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
            updateFormData({ skills: [...formData.skills, skillInput.trim()] });
            setSkillInput("");
        }
    };

    const removeSkill = (skill: string) => {
        updateFormData({ skills: formData.skills.filter(s => s !== skill) });
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const res = await fetch("/api/jobs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    skills: JSON.stringify(formData.skills),
                    salaryMin: formData.salaryMin ? parseFloat(formData.salaryMin) : null,
                    salaryMax: formData.salaryMax ? parseFloat(formData.salaryMax) : null,
                }),
            });

            if (res.ok) {
                setStep(4);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        } catch (err) {
            console.error("Job post failed", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const nextStep = () => {
        if (step < 3) {
            setStep(step + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const prevStep = () => {
        if (step > 1) {
            setStep(step - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    if (status === "loading") return null;

    return (
        <div className="max-w-[800px] mx-auto py-8 px-4">
            {/* Multi-step logic rendering */}
            {step === 1 && (
                <div className="space-y-6">
                    <div className="bg-white rounded-[1.25rem] border border-[#E2E8F0] shadow-sm overflow-hidden">
                        <div className="p-8 lg:p-10">
                            <div className="flex items-center gap-3 mb-8 border-l-4 border-[#0F172A] pl-4">
                                <h1 className="text-[22px] font-bold text-[#0F172A] tracking-tight">Basic Job Information</h1>
                            </div>

                            <div className="space-y-8">
                                {/* Job Title */}
                                <div>
                                    <label className="block text-[13px] font-bold text-[#334155] mb-2.5">Job Title</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => updateFormData({ title: e.target.value })}
                                        className="w-full px-5 py-3.5 bg-white border border-[#E2E8F0] rounded-[0.75rem] focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none text-[14px] text-[#0F172A] font-medium transition-all placeholder:text-[#94A3B8]"
                                        placeholder="e.g. Senior Full Stack Developer"
                                    />
                                    <p className="mt-2 text-[11px] text-[#94A3B8] font-medium">A clear title helps attract the right candidates.</p>
                                </div>

                                {/* Job Category */}
                                <div>
                                    <label className="block text-[13px] font-bold text-[#334155] mb-2.5">Job Category</label>
                                    <div className="relative">
                                        <select
                                            value={formData.category}
                                            onChange={(e) => updateFormData({ category: e.target.value })}
                                            className="w-full appearance-none px-5 py-3.5 bg-white border border-[#E2E8F0] rounded-[0.75rem] focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none text-[14px] text-[#0F172A] font-medium transition-all cursor-pointer"
                                        >
                                            <option value="">Select a category</option>
                                            <option value="Web Development">Web Development</option>
                                            <option value="Mobile Development">Mobile Development</option>
                                            <option value="UI/UX Design">UI/UX Design</option>
                                            <option value="Virtual Assistant">Virtual Assistant</option>
                                            <option value="Customer Support">Customer Support</option>
                                            <option value="Digital Marketing">Digital Marketing</option>
                                        </select>
                                        <ChevronDown size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none" />
                                    </div>
                                </div>

                                {/* Job Type Cards */}
                                <div>
                                    <label className="block text-[13px] font-bold text-[#334155] mb-2.5">Job Type</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        {[
                                            { id: 'FULL_TIME', label: 'Full-time', icon: <Clock size={16} /> },
                                            { id: 'PART_TIME', label: 'Part-time', icon: <Zap size={16} /> },
                                            { id: 'FREELANCE', label: 'Freelance', icon: <Settings size={16} /> }
                                        ].map((type) => (
                                            <button
                                                key={type.id}
                                                type="button"
                                                onClick={() => updateFormData({ jobType: type.id as JobType })}
                                                className={`flex items-center gap-3 px-5 py-4 rounded-[0.75rem] border transition-all ${formData.jobType === type.id
                                                    ? 'border-blue-500 bg-blue-50/30 text-blue-600 shadow-[0_0_0_1px_#3B82F6]'
                                                    : 'border-[#E2E8F0] bg-white text-[#64748B] hover:border-[#CBD5E1]'}`}
                                            >
                                                <div className={`${formData.jobType === type.id ? 'text-blue-600' : 'text-[#94A3B8]'}`}>
                                                    {type.icon}
                                                </div>
                                                <span className="text-[14px] font-bold">{type.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Job Description */}
                                <div>
                                    <label className="block text-[13px] font-bold text-[#334155] mb-2.5">Job Description</label>
                                    <div className="border border-[#E2E8F0] rounded-[0.75rem] overflow-hidden quill-editor-wrapper">
                                        <ReactQuill
                                            theme="snow"
                                            value={formData.description}
                                            onChange={(content: string) => updateFormData({ description: content })}
                                            placeholder="Describe the role, responsibilities, and day-to-day tasks..."
                                            modules={{
                                                toolbar: [
                                                    ['bold', 'italic', 'underline', 'strike'],
                                                    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                                                    ['clean']
                                                ],
                                            }}
                                        />
                                    </div>
                                    <p className="mt-2 text-[11px] text-[#94A3B8] font-medium">Mention specific skills, daily tasks, and what makes your company great to work for.</p>
                                </div>

                            </div>
                        </div>

                        {/* Sticky Bottom Bar Mockup-style */}
                        <div className="p-6 bg-slate-50/50 border-t border-[#E2E8F0] flex items-center justify-between">
                            <button className="text-[14px] font-bold text-[#64748B] hover:text-[#0F172A] transition-colors">
                                Save as Draft
                            </button>
                            <button
                                onClick={nextStep}
                                className="px-8 py-3 bg-[#0B3D59] text-white rounded-[0.5rem] text-[14px] font-bold flex items-center gap-2 hover:bg-[#072a3d] transition-all shadow-sm"
                            >
                                Next Step <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Pro Tip Box */}
                    <div className="bg-[#EEF4F8] rounded-[1rem] border border-[#D9E6EF] p-5 flex gap-4">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#0B3D59] shadow-sm shrink-0 border border-[#D9E6EF]">
                            <Lightbulb size={20} />
                        </div>
                        <div>
                            <h4 className="text-[13px] font-bold text-[#0B3D59] mb-1">Pro Tip</h4>
                            <p className="text-[11.5px] text-[#5C728A] leading-relaxed font-medium">Postings with detailed descriptions and clear job titles receive 3x more qualified applications. Be as specific as possible about the daily routine.</p>
                        </div>
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="space-y-6">
                    <div className="bg-white rounded-[1.25rem] border border-[#E2E8F0] shadow-sm overflow-hidden">
                        <form className="p-8 lg:p-10 space-y-12">
                            {/* Required Skills */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <div className="text-[#0B3D59]"><Target size={20} strokeWidth={2.5} /></div>
                                    <h2 className="text-[16px] font-bold text-[#0F172A]">Required Skills</h2>
                                </div>
                                <p className="text-[12px] text-[#64748B] font-medium">Add up to 10 skills. Candidates matching these will be highlighted.</p>

                                <div className="p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[0.75rem] flex flex-wrap gap-2.5 items-center">
                                    {formData.skills.map((skill) => (
                                        <div key={skill} className="flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-600 px-3 py-1.5 rounded-lg text-[13px] font-bold">
                                            {skill}
                                            <button type="button" onClick={() => removeSkill(skill)} className="hover:text-blue-800"><X size={14} /></button>
                                        </div>
                                    ))}
                                    <input
                                        type="text"
                                        value={skillInput}
                                        onChange={(e) => setSkillInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                                        className="flex-1 min-w-[200px] bg-transparent outline-none text-[13px] font-medium py-1 placeholder:text-[#94A3B8]"
                                        placeholder="Type a skill..."
                                    />
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-wider">Suggested:</span>
                                    <div className="flex gap-2 flex-wrap">
                                        {['AWS', 'Docker', 'GraphQL', 'Figma'].map(s => (
                                            <button
                                                key={s}
                                                type="button"
                                                onClick={() => updateFormData({ skills: [...formData.skills, s] })}
                                                className="text-[11px] font-bold text-[#64748B] bg-white border border-[#E2E8F0] px-3 py-1 rounded-full hover:border-blue-300 hover:text-blue-500 transition-colors"
                                            >
                                                + {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="h-[1px] bg-[#F1F5F9]" />

                            {/* Salary Details */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <div className="text-[#0B3D59]"><DollarSign size={20} strokeWidth={2.5} /></div>
                                    <h2 className="text-[16px] font-bold text-[#0F172A]">Salary Details</h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-[12px] font-bold text-[#64748B] mb-2">Currency & Frequency</label>
                                            <select
                                                value={formData.salaryCurrency}
                                                onChange={(e) => updateFormData({ salaryCurrency: e.target.value })}
                                                className="w-full bg-white border border-[#E2E8F0] rounded-[0.75rem] px-4 py-3 text-[13px] font-bold text-[#0F172A] outline-none"
                                            >
                                                <option>USD ($)</option>
                                                <option>PHP (₱)</option>
                                            </select>
                                        </div>
                                        <div className="pt-6">
                                            <select
                                                value={formData.salaryFrequency}
                                                onChange={(e) => updateFormData({ salaryFrequency: e.target.value })}
                                                className="w-full bg-white border border-[#E2E8F0] rounded-[0.75rem] px-4 py-3 text-[13px] font-bold text-[#0F172A] outline-none"
                                            >
                                                <option>Monthly</option>
                                                <option>Hourly</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[12px] font-bold text-[#64748B] mb-2">Salary Range</label>
                                        <div className="flex items-center gap-3">
                                            <div className="relative flex-1">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8] text-[13px]">$</span>
                                                <input
                                                    type="number"
                                                    value={formData.salaryMin}
                                                    onChange={(e) => updateFormData({ salaryMin: e.target.value })}
                                                    className="w-full border border-[#E2E8F0] rounded-[0.75rem] pl-8 pr-4 py-3 text-[13px] font-bold text-[#0F172A] outline-none"
                                                    placeholder="Min"
                                                />
                                            </div>
                                            <span className="text-[#E2E8F0]">—</span>
                                            <div className="relative flex-1">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8] text-[13px]">$</span>
                                                <input
                                                    type="number"
                                                    value={formData.salaryMax}
                                                    onChange={(e) => updateFormData({ salaryMax: e.target.value })}
                                                    className="w-full border border-[#E2E8F0] rounded-[0.75rem] pl-8 pr-4 py-3 text-[13px] font-bold text-[#0F172A] outline-none"
                                                    placeholder="Max"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <p className="italic text-[11px] text-[#94A3B8] font-medium">Note: Transparent salary ranges receive up to 40% more applications.</p>
                            </div>

                            <div className="h-[1px] bg-[#F1F5F9]" />

                            {/* Candidate Profile */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <div className="text-[#0B3D59]"><CheckCircle2 size={20} strokeWidth={2.5} /></div>
                                    <h2 className="text-[16px] font-bold text-[#0F172A]">Candidate Profile</h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[12px] font-bold text-[#64748B] mb-2">Experience Required</label>
                                        <select
                                            value={formData.experienceLevel}
                                            onChange={(e) => updateFormData({ experienceLevel: e.target.value })}
                                            className="w-full bg-white border border-[#E2E8F0] rounded-[0.75rem] px-4 py-3 text-[13px] font-bold text-[#0F172A] outline-none"
                                        >
                                            <option value="">Select experience level</option>
                                            <option>Entry Level</option>
                                            <option>Mid-Level</option>
                                            <option>Senior</option>
                                            <option>Expert</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[12px] font-bold text-[#64748B] mb-2">English Proficiency</label>
                                        <select
                                            value={formData.englishProficiency}
                                            onChange={(e) => updateFormData({ englishProficiency: e.target.value })}
                                            className="w-full bg-white border border-[#E2E8F0] rounded-[0.75rem] px-4 py-3 text-[13px] font-bold text-[#0F172A] outline-none"
                                        >
                                            <option value="">Select proficiency level</option>
                                            <option>Fluent</option>
                                            <option>Native</option>
                                            <option>Conversational</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </form>

                        {/* Footer Buttons */}
                        <div className="p-8 bg-slate-50 border-t border-[#E2E8F0] flex items-center justify-between">
                            <button
                                onClick={prevStep}
                                className="px-6 py-2.5 bg-white border border-[#E2E8F0] text-[#64748B] rounded-[0.5rem] text-[13px] font-bold hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2"
                            >
                                <ArrowLeft size={16} /> Back to Step 1
                            </button>
                            <div className="flex items-center gap-3">
                                <button className="px-6 py-3 bg-white border border-[#0B3D59] text-[#0B3D59] rounded-[0.5rem] text-[14px] font-black hover:bg-slate-50 tracking-tight transition-all">
                                    Save as Draft
                                </button>
                                <button
                                    onClick={nextStep}
                                    className="px-8 py-3 bg-[#0B3D59] text-white rounded-[0.5rem] text-[14px] font-bold flex items-center gap-2 hover:bg-[#072a3d] transition-all shadow-sm"
                                >
                                    Preview & Post <Zap size={16} fill="white" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {step === 3 && (
                <div className="space-y-6">
                    {/* General Information Card */}
                    <div className="bg-white rounded-[1rem] border border-[#E2E8F0] shadow-sm overflow-hidden">
                        <div className="p-8">
                            <div className="flex justify-between items-start mb-8">
                                <div className="flex items-center gap-3 border-l-4 border-blue-600 pl-4">
                                    <div className="w-6 h-6 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                                        <Lightbulb size={14} fill="currentColor" />
                                    </div>
                                    <h2 className="text-[18px] font-bold text-[#0F172A]">General Information</h2>
                                </div>
                                <button onClick={() => setStep(1)} className="text-[13px] font-bold text-[#3B82F6] hover:underline flex items-center gap-1.5 active:scale-95 transition-all">
                                    <Settings size={14} /> Edit
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-y-8 gap-x-12">
                                <div>
                                    <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest block mb-1.5">Job Title</span>
                                    <p className="text-[15px] font-bold text-[#0F172A]">{formData.title || 'Untitled Role'}</p>
                                </div>
                                <div>
                                    <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest block mb-1.5">Category</span>
                                    <p className="text-[15px] font-bold text-[#0F172A]">{formData.category || 'Not specified'}</p>
                                </div>
                                <div>
                                    <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest block mb-1.5">Job Type</span>
                                    <p className="text-[15px] font-bold text-[#0F172A] capitalize">{formData.jobType.replace('_', ' ').toLowerCase()}</p>
                                </div>
                                <div>
                                    <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest block mb-1.5">Work Style</span>
                                    <p className="text-[15px] font-bold text-[#0F172A]">{formData.workStyle}</p>
                                </div>
                                <div className="col-span-2">
                                    <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest block mb-1.5">Job Description Summary</span>
                                    <div className="text-[13px] text-[#475569] leading-relaxed font-medium">
                                        {formData.description ? (
                                            <>
                                                {formData.description.substring(0, 200)}... <button className="text-blue-600 font-bold hover:underline">Read more</button>
                                            </>
                                        ) : 'No description provided.'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Required Skills Card */}
                        <div className="bg-white rounded-[1rem] border border-[#E2E8F0] shadow-sm p-8 relative">
                            <div className="flex items-center gap-3 mb-6">
                                <Target size={18} className="text-[#0B3D59]" />
                                <h3 className="text-[15px] font-bold text-[#0F172A]">Required Skills</h3>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {formData.skills.map(skill => (
                                    <span key={skill} className="px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-[12px] font-bold text-slate-600 shadow-sm">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                            <button onClick={() => setStep(2)} className="absolute top-8 right-8 text-[#3B82F6] hover:scale-110 transition-transform">
                                <Settings size={16} />
                            </button>
                        </div>

                        {/* Candidate Profile Card */}
                        <div className="bg-white rounded-[1rem] border border-[#E2E8F0] shadow-sm p-8 relative">
                            <div className="flex items-center gap-3 mb-6">
                                <Building2 size={18} className="text-[#0B3D59]" />
                                <h3 className="text-[15px] font-bold text-[#0F172A]">Candidate Profile</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-[13px]">
                                    <span className="text-[#64748B] font-medium">English Proficiency</span>
                                    <span className="text-[#0F172A] font-bold">{formData.englishProficiency || 'Any'}</span>
                                </div>
                                <div className="flex justify-between items-center text-[13px]">
                                    <span className="text-[#64748B] font-medium">Min. Experience</span>
                                    <span className="text-[#0F172A] font-bold">{formData.experienceLevel || 'Not specified'}</span>
                                </div>
                                <div className="flex justify-between items-center text-[13px]">
                                    <span className="text-[#64748B] font-medium">Education</span>
                                    <span className="text-[#0F172A] font-bold">Bachelor's Degree</span>
                                </div>
                            </div>
                            <button onClick={() => setStep(2)} className="absolute top-8 right-8 text-[#3B82F6] hover:scale-110 transition-transform">
                                <Settings size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Compensation Package Banner */}
                    <div className="bg-[#F0F7FF] rounded-[1rem] border border-[#D0E6FC] p-4 flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-[#0B3D59] rounded-xl flex items-center justify-center text-white shadow-lg">
                                <DollarSign size={24} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h4 className="text-[14px] font-black text-[#0B3D59]">Compensation Package</h4>
                                <p className="text-[11px] text-[#5581A6] font-bold tracking-tight">Based on qualifications and experience</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="block text-[10px] font-black text-[#5581A6] uppercase tracking-[0.2em] mb-1">Monthly Salary</span>
                            <div className="text-[22px] font-black text-[#0B3D59] tracking-tighter">
                                ${formData.salaryMin || '0'} - ${formData.salaryMax || '0'} <span className="text-[14px] font-bold opacity-60">/ mo</span>
                            </div>
                        </div>
                    </div>

                    {/* Final Action Bar */}
                    <div className="flex items-center justify-between pt-4">
                        <button
                            onClick={prevStep}
                            className="px-6 py-2.5 bg-white border border-[#E2E8F0] text-[#64748B] rounded-[0.5rem] text-[13px] font-bold hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2"
                        >
                            <ArrowLeft size={16} /> Back
                        </button>
                        <div className="flex items-center gap-3">
                            <button className="px-6 py-3 bg-white border border-[#E2E8F0] text-[#0F172A] rounded-[0.5rem] text-[14px] font-bold hover:bg-slate-50 transition-all shadow-sm">
                                Save as Draft
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="px-10 py-3 bg-[#0B3D59] text-white rounded-[0.5rem] text-[14px] font-black flex items-center gap-2 hover:bg-[#072a3d] transition-all shadow-lg active:scale-95 disabled:opacity-50"
                            >
                                {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <>Post Job Now <MousePointer2 size={16} fill="white" /></>}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {step === 4 && (
                <div className="bg-white rounded-[1.25rem] border border-[#E2E8F0] shadow-xl overflow-hidden animate-in fade-in zoom-in duration-500 max-w-[650px] mx-auto mt-12">
                    <div className="p-12 flex flex-col items-center text-center">
                        <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-8 relative">
                            <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-20" />
                            <Check size={40} strokeWidth={3} className="relative z-10" />
                        </div>

                        <span className="text-[11px] font-black text-blue-600 uppercase tracking-[0.4em] mb-3 block">Success!</span>
                        <h1 className="text-[32px] font-bold text-[#0F172A] tracking-tight mb-4">Job Posted Successfully!</h1>
                        <p className="text-[15px] text-[#64748B] font-medium max-w-[420px] leading-relaxed mb-10">
                            Your job listing for <span className="text-[#0F172A] font-bold">{formData.title}</span> is now live and visible to thousands of qualified candidates.
                        </p>

                        {/* Summary Card Mock */}
                        <div className="w-full bg-white border border-[#E2E8F0] rounded-[1rem] p-5 flex gap-5 items-center mb-10 text-left shadow-sm">
                            <div className="w-24 h-16 bg-slate-50/50 rounded-lg overflow-hidden border border-slate-100 relative shadow-inner">
                                <div className="absolute inset-0 opacity-10 bg-[linear-gradient(45deg,transparent_25%,rgba(0,0,0,0.1)_50%,transparent_75%)] bg-[length:4px_4px]" />
                                <div className="w-full h-full flex flex-col p-1.5 gap-1.5 opacity-40 grayscale">
                                    <div className="h-2 w-10 bg-slate-300 rounded" />
                                    <div className="h-1 w-12 bg-slate-200 rounded" />
                                    <div className="mt-auto flex justify-between">
                                        <div className="h-1 w-4 bg-slate-200 rounded" />
                                        <div className="h-1 w-4 bg-slate-200 rounded" />
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="bg-[#F0FDF4] text-[#16A34A] text-[9px] font-black px-1.5 py-0.5 rounded tracking-widest uppercase">Live</span>
                                    <span className="text-[#94A3B8] text-[10px] font-medium">• Posted just now</span>
                                </div>
                                <h3 className="text-[15px] font-bold text-[#0F172A] mb-1.5">{formData.title}</h3>
                                <div className="flex items-center gap-3 text-[11px] text-[#64748B] font-medium">
                                    <span className="flex items-center gap-1.5"><MapPin size={12} className="text-[#94A3B8]" /> San Francisco, CA</span>
                                    <span className="flex items-center gap-1.5"><Briefcase size={12} className="text-[#94A3B8]" /> Full-time</span>
                                </div>
                            </div>
                        </div>

                        {/* What happens next section */}
                        <div className="w-full text-left space-y-4 mb-10">
                            <h4 className="text-[13px] font-black text-[#0F172A] uppercase tracking-wider">What happens next?</h4>

                            <div className="flex gap-4 p-4 bg-slate-50/50 rounded-xl border border-slate-100">
                                <div className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center text-[#0B3D59] border border-slate-100">
                                    <Mail size={18} />
                                </div>
                                <div>
                                    <p className="text-[13px] font-bold text-[#0F172A]">Application Alerts</p>
                                    <p className="text-[11.5px] text-[#64748B] font-medium leading-relaxed">You'll receive an email notification as soon as new candidates apply.</p>
                                </div>
                            </div>

                            <div className="flex gap-4 p-4 bg-slate-50/50 rounded-xl border border-slate-100">
                                <div className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center text-[#0B3D59] border border-slate-100">
                                    <Zap size={18} />
                                </div>
                                <div>
                                    <p className="text-[13px] font-bold text-[#0F172A]">Performance Tracking</p>
                                    <p className="text-[11.5px] text-[#64748B] font-medium leading-relaxed">Check your dashboard to see views, clicks, and application rates in real-time.</p>
                                </div>
                            </div>
                        </div>

                        {/* Footer buttons for success */}
                        <div className="grid grid-cols-2 gap-4 w-full">
                            <button
                                onClick={() => router.push(`/manage/jobs`)}
                                className="w-full py-4 bg-[#0B3D59] text-white rounded-[0.75rem] text-[14px] font-black flex items-center justify-center gap-2.5 hover:bg-[#072a3d] transition-all shadow-md active:scale-95"
                            >
                                <Eye size={18} /> View Job Posting
                            </button>
                            <button
                                onClick={() => router.push('/dashboard')}
                                className="w-full py-4 bg-white border border-[#E2E8F0] text-[#0F172A] rounded-[0.75rem] text-[14px] font-bold flex items-center justify-center gap-2.5 hover:bg-slate-50 transition-all shadow-sm active:scale-95"
                            >
                                <LayoutDashboard size={18} className="text-[#94A3B8]" /> Go to Dashboard
                            </button>
                        </div>

                        <button
                            onClick={() => {
                                setStep(1);
                                setFormData(initialData);
                            }}
                            className="mt-8 text-[13px] font-bold text-[#0B3D59] hover:underline flex items-center gap-2 group"
                        >
                            <Plus size={16} className="group-hover:rotate-90 transition-transform" /> Post Another Job
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}


