"use client";

import {
    Briefcase,
    MapPin,
    Globe,
    DollarSign,
    Building,
    CheckCircle2,
    ShieldCheck,
    Stethoscope,
    Home,
    Plane,
    Share2,
    Mail,
    Link as LinkIcon
} from "lucide-react";

interface JobPreviewProps {
    data: {
        title: string;
        description: string;
        requirements: string;
        salaryRange: string;
        jobType: string;
        location: string;
    };
    employer: {
        companyName: string;
        companyLogo: string;
        description: string;
        companyWebsite: string;
    };
}

export default function JobPreview({ data, employer }: JobPreviewProps) {
    const skills = data.requirements?.split(',').map(s => s.trim()) || [];

    return (
        <div className="bg-[#F8FAFC] rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-2xl">
            <div className="p-8 md:p-12">
                {/* Header Card */}
                <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-center p-3">
                            {employer.companyLogo ? (
                                <img src={employer.companyLogo} className="w-full h-full object-contain" />
                            ) : (
                                <Building className="text-gray-300" size={32} />
                            )}
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">{data.title || "Job Title Preview"}</h1>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-gray-500 font-bold text-sm">
                                <span className="text-blue-600">{employer.companyName}</span>
                                <span className="hidden md:inline text-gray-300">•</span>
                                <span className="flex items-center gap-1.5"><MapPin size={14} /> {data.location || "Remote"}</span>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-4">
                                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-600 text-[10px] font-black uppercase tracking-wider rounded-lg border border-gray-100">
                                    <Globe size={12} className="text-blue-500" /> Remote
                                </span>
                                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-600 text-[10px] font-black uppercase tracking-wider rounded-lg border border-gray-100">
                                    <Briefcase size={12} className="text-indigo-500" /> {data.jobType.replace('_', ' ').toLowerCase()}
                                </span>
                                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-wider rounded-lg border border-emerald-100">
                                    <DollarSign size={12} /> {data.salaryRange || "Competitive"}/mo
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="text-gray-400 font-bold text-[10px] uppercase tracking-widest bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                        Posted Just now
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-8 space-y-8">
                        <div className="bg-white rounded-[2rem] p-10 border border-gray-100 shadow-sm space-y-12">
                            <section>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-1 h-6 bg-blue-600 rounded-full" />
                                    <h2 className="text-xl font-black text-gray-900 tracking-tight">Job Description</h2>
                                </div>
                                <div className="text-gray-600 leading-relaxed font-medium text-base space-y-4 whitespace-pre-wrap">
                                    {data.description || "Your job description will appear here..."}
                                </div>
                            </section>

                            <section>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-1 h-6 bg-indigo-600 rounded-full" />
                                    <h2 className="text-xl font-black text-gray-900 tracking-tight">Technical Requirements</h2>
                                </div>
                                <div className="flex flex-wrap gap-2 mb-8">
                                    {skills.filter(s => s).map((skill, idx) => (
                                        <span key={idx} className="px-4 py-2 bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-widest rounded-lg border border-blue-100">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                                <ul className="space-y-4">
                                    {(data.requirements || "").split('\n').filter(r => r.trim()).map((req, idx) => (
                                        <li key={idx} className="flex items-start gap-3 text-gray-600 font-medium text-sm">
                                            <div className="w-5 h-5 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center shrink-0 mt-0.5">
                                                <CheckCircle2 size={12} className="text-blue-600" />
                                            </div>
                                            {req.replace(/^[-*]\s*/, '')}
                                        </li>
                                    ))}
                                </ul>
                            </section>

                            <section>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-1 h-6 bg-emerald-600 rounded-full" />
                                    <h2 className="text-xl font-black text-gray-900 tracking-tight">Benefits</h2>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {[
                                        { icon: <Stethoscope size={20} />, title: "Health Insurance", color: "bg-emerald-50 text-emerald-600 border-emerald-100" },
                                        { icon: <Globe size={20} />, title: "Work from Anywhere", color: "bg-blue-50 text-blue-600 border-blue-100" },
                                        { icon: <Home size={20} />, title: "Home Office Stipend", color: "bg-purple-50 text-purple-600 border-purple-100" },
                                        { icon: <Plane size={20} />, title: "Unlimited PTO", color: "bg-orange-50 text-orange-600 border-orange-100" }
                                    ].map((benefit, idx) => (
                                        <div key={idx} className={`flex items-center gap-4 p-4 rounded-2xl border bg-white ${benefit.color.split(' ').slice(1).join(' ')}`}>
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${benefit.color.split(' ')[0]}`}>
                                                {benefit.icon}
                                            </div>
                                            <span className="text-gray-900 font-black text-xs tracking-tight">{benefit.title}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm space-y-4">
                            <div className="w-full py-4 bg-[#0F3652] text-white text-center rounded-xl font-black text-xs uppercase tracking-[0.2em] opacity-50 cursor-not-allowed">
                                Apply Now (Preview)
                            </div>
                            <div className="w-full py-4 bg-gray-50 text-gray-400 text-center rounded-xl font-black text-xs uppercase tracking-[0.2em] border border-gray-100">
                                Save Job
                            </div>
                        </div>

                        <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm">
                            <h3 className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">About the Employer</h3>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100">
                                    {employer.companyLogo ? (
                                        <img src={employer.companyLogo} className="w-full h-full object-contain p-2" />
                                    ) : (
                                        <Building className="text-gray-300" size={20} />
                                    )}
                                </div>
                                <div>
                                    <h4 className="font-black text-gray-900 text-sm flex items-center gap-1.5 line-clamp-1">
                                        {employer.companyName}
                                        <ShieldCheck size={14} className="text-blue-500" />
                                    </h4>
                                    <p className="text-[8px] font-black text-gray-400 tracking-widest uppercase">Verified Employer</p>
                                </div>
                            </div>
                            <p className="text-gray-500 text-xs font-medium leading-relaxed mb-6 line-clamp-3">
                                {employer.description || "Leading the way in innovation and quality."}
                            </p>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-gray-400 font-bold uppercase tracking-widest">Industry</span>
                                    <span className="text-gray-900 font-black">Technology</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-gray-400 font-bold uppercase tracking-widest">Website</span>
                                    <span className="text-blue-600 font-black">{employer.companyWebsite?.replace(/^https?:\/\//, '') || "N/A"}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="bg-blue-600 p-4 text-center text-white font-black text-[10px] uppercase tracking-[0.3em]">
                Preview Mode • This is how your job will appear
            </div>
        </div>
    );
}
