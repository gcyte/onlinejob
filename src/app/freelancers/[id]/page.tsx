"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Navbar from "@/components/navbar";
import {
    User,
    MapPin,
    Linkedin,
    Github,
    Globe,
    Briefcase,
    GraduationCap,
    FileText,
    Clock,
    CheckCircle2,
    Copy,
    Share2,
    MessageSquare,
    Star
} from "lucide-react";
import { Loader2 } from "lucide-react";

export default function PublicFreelancerProfile() {
    const params = useParams();
    const router = useRouter();
    const { data: session } = useSession();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch(`/api/public/profiles/freelancer/${params.id}`);
                if (res.ok) {
                    const data = await res.json();
                    setProfile(data);
                }
            } catch (err) {
                console.error("Failed to fetch profile", err);
            } finally {
                setLoading(false);
            }
        };

        if (params.id) {
            fetchProfile();
        }
    }, [params.id]);

    const copyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
                <Navbar />
                <h1 className="text-2xl font-bold text-gray-900">Profile Not Found</h1>
                <p className="text-gray-500 mt-2">The profile you are looking for does not exist or has been removed.</p>
            </div>
        );
    }

    const experiences = profile.experience ? JSON.parse(profile.experience) : [];
    const education = profile.education ? JSON.parse(profile.education) : [];
    const socialLinks = profile.socialLinks ? JSON.parse(profile.socialLinks) : {};
    const skills = profile.skills ? JSON.parse(profile.skills) : [];

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <Navbar />

            <div className="pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid md:grid-cols-3 gap-8">
                    {/* Left Column - Sidebar Info */}
                    <div className="md:col-span-1 space-y-6">
                        <div className="bg-white rounded-[10px] p-8 border border-gray-100 shadow-xl shadow-blue-100/30 text-center">
                            <div className="w-32 h-32 rounded-[10px] bg-blue-50 mx-auto mb-6 border-4 border-white shadow-lg overflow-hidden flex items-center justify-center">
                                {profile.avatarUrl ? (
                                    <img src={profile.avatarUrl} alt={profile.user.name} className="w-full h-full object-cover" />
                                ) : (
                                    <User size={64} className="text-blue-200" />
                                )}
                            </div>
                            <h1 className="text-2xl font-black text-gray-900 mb-1">{profile.user.name}</h1>
                            <p className="text-blue-600 font-bold mb-4">{profile.title}</p>

                            <div className="flex flex-col gap-3 text-sm font-medium text-gray-500 mb-6">
                                {profile.location && (
                                    <div className="flex items-center justify-center gap-2">
                                        <MapPin size={16} /> {profile.location}
                                    </div>
                                )}
                                <div className="flex items-center justify-center gap-2">
                                    <Clock size={16} /> {profile.availability}
                                </div>
                                {profile.isVerified && (
                                    <div className="flex items-center justify-center gap-2 text-green-600 font-bold">
                                        <CheckCircle2 size={16} /> Verified Professional
                                    </div>
                                )}
                                <div className="flex items-center justify-center gap-2 mt-2 px-4 py-2 bg-amber-50 rounded-[10px] border border-amber-100">
                                    <Star size={16} className="fill-amber-400 text-amber-400" />
                                    <span className="text-amber-800 font-black">
                                        {profile.trustScore || 0}% Trust Score
                                    </span>
                                </div>
                            </div>

                            <div className="flex justify-center gap-3 mb-8">
                                {socialLinks.linkedin && (
                                    <a href={socialLinks.linkedin} target="_blank" className="p-3 bg-gray-50 rounded-[10px] text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
                                        <Linkedin size={20} />
                                    </a>
                                )}
                                {socialLinks.github && (
                                    <a href={socialLinks.github} target="_blank" className="p-3 bg-gray-50 rounded-[10px] text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all">
                                        <Github size={20} />
                                    </a>
                                )}
                                {profile.portfolioUrl && (
                                    <a href={profile.portfolioUrl} target="_blank" className="p-3 bg-gray-50 rounded-[10px] text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all">
                                        <Globe size={20} />
                                    </a>
                                )}
                            </div>

                            <button
                                onClick={copyLink}
                                className="w-full py-4 bg-gray-50 text-gray-900 rounded-[10px] font-bold flex items-center justify-center gap-2 hover:bg-gray-100 transition-all border border-gray-100"
                            >
                                {copied ? <><CheckCircle2 size={18} /> Copied!</> : <><Share2 size={18} /> Share Profile</>}
                            </button>

                            {(session?.user as any)?.role === "EMPLOYER" && (
                                <button
                                    onClick={() => router.push(`/messages?userId=${profile.user.id}`)}
                                    className="w-full py-4 bg-blue-600 text-white rounded-[10px] font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 mt-3"
                                >
                                    <MessageSquare size={18} /> Message Professional
                                </button>
                            )}
                        </div>

                        {profile.resumeUrl && (
                            <div className="bg-white rounded-[10px] p-6 border border-gray-100 shadow-sm">
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Documents</h3>
                                <a
                                    href={profile.resumeUrl}
                                    target="_blank"
                                    className="flex items-center gap-4 p-4 bg-blue-50 rounded-[10px] border border-blue-100 group hover:bg-blue-600 transition-all"
                                >
                                    <div className="w-10 h-10 bg-white rounded-[10px] flex items-center justify-center text-blue-600 shadow-sm group-hover:bg-blue-500 group-hover:text-white">
                                        <FileText size={20} />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-bold text-blue-600 group-hover:text-white">View Resume</p>
                                        <p className="text-xs text-blue-400 group-hover:text-blue-100 uppercase font-black">PDF / DOCX</p>
                                    </div>
                                </a>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Main Content */}
                    <div className="md:col-span-2 space-y-8">
                        {/* Bio */}
                        <div className="bg-white rounded-[10px] p-10 border border-gray-100 shadow-sm">
                            <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-[10px]"><User size={24} /></div>
                                Professional Bio
                            </h2>
                            <p className="text-gray-600 text-lg leading-relaxed whitespace-pre-line">
                                {profile.bio}
                            </p>
                        </div>

                        {/* Skills */}
                        <div className="bg-white rounded-[10px] p-10 border border-gray-100 shadow-sm">
                            <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-[10px]"><FileText size={24} /></div>
                                Skills & Expertise
                            </h2>
                            <div className="flex flex-wrap gap-2">
                                {skills.map((skill: string) => (
                                    <span key={skill} className="px-5 py-2 bg-gray-50 text-gray-700 rounded-[10px] font-bold border border-gray-100">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Experience */}
                        <div className="bg-white rounded-[10px] p-10 border border-gray-100 shadow-sm">
                            <h2 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-3">
                                <div className="p-2 bg-orange-50 text-orange-600 rounded-[10px]"><Briefcase size={24} /></div>
                                Work Experience
                            </h2>
                            <div className="space-y-10 relative before:absolute before:left-6 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
                                {experiences.map((exp: any, idx: number) => (
                                    <div key={idx} className="relative pl-14">
                                        <div className="absolute left-4 top-1 w-4 h-4 rounded-full bg-blue-600 border-4 border-white shadow-sm ring-4 ring-blue-50"></div>
                                        <div className="mb-1">
                                            <span className="text-xs font-black text-blue-600 uppercase tracking-widest">{exp.duration}</span>
                                            <h3 className="text-xl font-bold text-gray-900">{exp.role}</h3>
                                            <p className="text-gray-400 font-bold">{exp.company}</p>
                                        </div>
                                        <p className="text-gray-600 mt-2">{exp.description}</p>
                                    </div>
                                ))}
                                {experiences.length === 0 && <p className="text-gray-400 pl-14 font-medium italic">No experience listed yet.</p>}
                            </div>
                        </div>

                        {/* Education */}
                        <div className="bg-white rounded-[10px] p-10 border border-gray-100 shadow-sm">
                            <h2 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-3">
                                <div className="p-2 bg-purple-50 text-purple-600 rounded-[10px]"><GraduationCap size={24} /></div>
                                Education
                            </h2>
                            <div className="space-y-10 relative before:absolute before:left-6 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
                                {education.map((edu: any, idx: number) => (
                                    <div key={idx} className="relative pl-14">
                                        <div className="absolute left-4 top-1 w-4 h-4 rounded-full bg-purple-600 border-4 border-white shadow-sm ring-4 ring-purple-50"></div>
                                        <div className="mb-1">
                                            <span className="text-xs font-black text-purple-600 uppercase tracking-widest">{edu.year}</span>
                                            <h3 className="text-xl font-bold text-gray-900">{edu.degree}</h3>
                                            <p className="text-gray-400 font-bold">{edu.school}</p>
                                        </div>
                                    </div>
                                ))}
                                {education.length === 0 && <p className="text-gray-400 pl-14 font-medium italic">No education listed yet.</p>}
                            </div>
                        </div>

                        {/* Client Feedback */}
                        <div className="bg-white rounded-[10px] p-10 border border-gray-100 shadow-sm">
                            <h2 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-3">
                                <div className="p-2 bg-amber-50 text-amber-600 rounded-[10px]"><Star size={24} /></div>
                                Client Feedback
                            </h2>
                            <div className="space-y-6">
                                {profile.reviews?.map((review: any) => (
                                    <div key={review.id} className="p-6 rounded-[10px] bg-gray-50 border border-gray-100 group">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-[10px] bg-white border border-gray-100 flex items-center justify-center overflow-hidden shadow-sm">
                                                    {review.employer.companyLogo ? (
                                                        <img src={review.employer.companyLogo} alt={review.employer.companyName} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="font-black text-blue-600">{review.employer.companyName[0]}</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-900">{review.employer.companyName}</h4>
                                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{new Date(review.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-0.5">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        size={14}
                                                        className={i < review.score ? "fill-amber-400 text-amber-400" : "text-gray-200"}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        <p className="text-gray-600 italic leading-relaxed">
                                            "{review.comment}"
                                        </p>
                                    </div>
                                ))}
                                {(!profile.reviews || profile.reviews.length === 0) && (
                                    <div className="text-center py-10 bg-gray-25 rounded-[10px] border border-dashed border-gray-200">
                                        <p className="text-gray-400 font-medium italic">No client reviews yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
