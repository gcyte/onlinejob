import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
    ChevronLeft,
    Mail,
    Phone,
    MapPin,
    Globe,
    Linkedin,
    Twitter,
    Github,
    Briefcase,
    GraduationCap,
    Award,
    ShieldCheck,
    MessageSquare,
    Download
} from "lucide-react";
import Link from "next/link";
import StatusDropdown from "../status-dropdown";

async function getApplication(id: string) {
    return await prisma.application.findUnique({
        where: { id },
        include: {
            job: true,
            freelancerProfile: {
                include: {
                    user: true
                }
            }
        }
    });
}

export default async function ApplicantDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "EMPLOYER") {
        redirect("/login");
    }

    const application = await getApplication(id);

    if (!application) {
        redirect("/dashboard/applicants");
    }

    // Verify ownership
    const employer = await prisma.employerProfile.findUnique({
        where: { userId: (session.user as any).id }
    });

    if (application.job.employerId !== employer?.id) {
        redirect("/dashboard/applicants");
    }

    const freelancer = application.freelancerProfile;
    const user = freelancer.user;

    // Parse JSON fields
    const skills = freelancer.skills ? freelancer.skills.split(',').map(s => s.trim()) : [];
    const experience = freelancer.experience ? JSON.parse(freelancer.experience) : [];
    const education = freelancer.education ? JSON.parse(freelancer.education) : [];

    let socialLinks = { website: "", linkedin: "", twitter: "", github: "" };
    if (freelancer.socialLinks) {
        try {
            socialLinks = JSON.parse(freelancer.socialLinks);
        } catch (e) { }
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">

            <div className="pt-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <Link href="/dashboard/applicants" className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 font-bold mb-8 transition-colors group">
                    <div className="w-8 h-8 rounded-[10px] bg-white border border-gray-100 flex items-center justify-center group-hover:bg-blue-50 group-hover:border-blue-100 shadow-sm transition-all">
                        <ChevronLeft size={18} />
                    </div>
                    Back to Applicants
                </Link>

                <div className="flex flex-col lg:flex-row gap-10">
                    {/* Main Content */}
                    <div className="flex-1 space-y-10">
                        {/* Summary Card */}
                        <div className="bg-white rounded-[10px] p-8 md:p-10 border border-gray-100 shadow-sm">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                                <div className="flex items-center gap-6">
                                    <div className="w-24 h-24 bg-blue-50 rounded-[10px] border-2 border-white shadow-md flex items-center justify-center overflow-hidden">
                                        {(freelancer.avatarUrl || user.image) ? (
                                            <img src={freelancer.avatarUrl || user.image || ""} alt={user.name || ""} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-3xl font-black text-blue-600">{user.name?.[0]}</span>
                                        )}
                                    </div>
                                    <div>
                                        <h1 className="text-3xl font-black text-gray-900 mb-2">{user.name}</h1>
                                        <div className="flex flex-wrap items-center gap-4 text-gray-500 font-bold">
                                            <span className="flex items-center gap-1.5"><Briefcase size={16} /> {freelancer.title || "Freelancer"}</span>
                                            <span className="hidden md:inline text-gray-300">•</span>
                                            <span className="flex items-center gap-1.5"><MapPin size={16} /> {freelancer.location || "Remote"}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-row md:flex-col gap-3 shrink-0">
                                    <StatusDropdown 
                                        applicationId={application.id} 
                                        currentStatus={application.status} 
                                        freelancerName={user.name || "Freelancer"} 
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Cover Letter */}
                        <div className="bg-white rounded-[10px] p-10 border border-gray-100 shadow-sm">
                            <h2 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-3">
                                <MessageSquare className="text-blue-600" size={24} />
                                Cover Letter
                            </h2>
                            <div className="text-gray-600 leading-relaxed font-medium whitespace-pre-wrap bg-gray-25/50 p-8 rounded-[10px] border border-gray-50">
                                {application.coverLetter}
                            </div>
                        </div>

                        {/* Professional Info */}
                        <div className="bg-white rounded-[10px] p-10 border border-gray-100 shadow-sm space-y-12">
                            {/* Skills */}
                            <section>
                                <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-3">
                                    <Award className="text-indigo-600" size={20} />
                                    Technical Skills
                                </h3>
                                <div className="flex flex-wrap gap-3">
                                    {skills.map((skill, idx) => (
                                        <span key={idx} className="px-5 py-2.5 bg-indigo-50 text-indigo-700 text-[11px] font-black uppercase tracking-widest rounded-[10px] border border-indigo-100">
                                            {skill}
                                        </span>
                                    ))}
                                    {skills.length === 0 && <p className="text-gray-400 font-bold italic">No skills listed.</p>}
                                </div>
                            </section>

                            <hr className="border-gray-50" />

                            {/* Experience */}
                            <section>
                                <h3 className="text-lg font-black text-gray-900 mb-8 flex items-center gap-3">
                                    <Briefcase className="text-emerald-600" size={20} />
                                    Work Experience
                                </h3>
                                <div className="space-y-8">
                                    {experience.length > 0 ? experience.map((exp: any, idx: number) => (
                                        <div key={idx} className="relative pl-8 before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:bg-emerald-500 before:rounded-full before:z-10 after:absolute after:left-[2.5px] after:top-4 after:w-[1px] after:h-[calc(100%+1.5rem)] after:bg-gray-100 last:after:hidden">
                                            <h4 className="font-black text-gray-900 mb-1">{exp.role}</h4>
                                            <p className="text-emerald-600 text-sm font-black mb-1">{exp.company}</p>
                                            <p className="text-xs text-gray-400 font-bold mb-3">{exp.period}</p>
                                            <p className="text-sm text-gray-600 leading-relaxed font-bold">{exp.description}</p>
                                        </div>
                                    )) : (
                                        <p className="text-gray-400 font-bold italic">No experience listed.</p>
                                    )}
                                </div>
                            </section>

                            <hr className="border-gray-50" />

                            {/* Education */}
                            <section>
                                <h3 className="text-lg font-black text-gray-900 mb-8 flex items-center gap-3">
                                    <GraduationCap className="text-amber-600" size={20} />
                                    Education
                                </h3>
                                <div className="space-y-6">
                                    {education.length > 0 ? education.map((edu: any, idx: number) => (
                                        <div key={idx} className="p-6 rounded-[10px] bg-gray-25/50 border border-gray-50">
                                            <h4 className="font-black text-gray-900 mb-1">{edu.degree}</h4>
                                            <p className="text-amber-600 text-sm font-black mb-1">{edu.school}</p>
                                            <p className="text-xs text-gray-400 font-bold">{edu.year}</p>
                                        </div>
                                    )) : (
                                        <p className="text-gray-400 font-bold italic">No education listed.</p>
                                    )}
                                </div>
                            </section>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <aside className="lg:w-96 space-y-8">
                        {/* Contact Card */}
                        <div className="bg-white rounded-[10px] p-8 border border-gray-100 shadow-sm">
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-8">Contact Information</h3>
                            <div className="space-y-6">
                                <a href={`mailto:${user.email}`} className="flex items-center gap-4 group">
                                    <div className="w-12 h-12 rounded-[10px] bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all border border-gray-100">
                                        <Mail size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Email Address</p>
                                        <p className="text-sm font-black text-gray-900 group-hover:text-blue-600 transition-colors">{user.email}</p>
                                    </div>
                                </a>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-[10px] bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100">
                                        <Phone size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Phone Number</p>
                                        <p className="text-sm font-black text-gray-900">{freelancer.phone || "Not provided"}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-10 pt-10 border-t border-gray-50 flex gap-4">
                                {socialLinks.website && (
                                    <a href={socialLinks.website} target="_blank" className="w-10 h-10 rounded-[10px] bg-gray-50 text-gray-400 flex items-center justify-center hover:bg-blue-50 hover:text-blue-600 transition-all border border-gray-100">
                                        <Globe size={18} />
                                    </a>
                                )}
                                {socialLinks.linkedin && (
                                    <a href={socialLinks.linkedin} target="_blank" className="w-10 h-10 rounded-[10px] bg-gray-50 text-gray-400 flex items-center justify-center hover:bg-blue-600 hover:!text-white transition-all border border-gray-100">
                                        <Linkedin size={18} />
                                    </a>
                                )}
                                {socialLinks.twitter && (
                                    <a href={socialLinks.twitter} target="_blank" className="w-10 h-10 rounded-[10px] bg-gray-50 text-gray-400 flex items-center justify-center hover:bg-black hover:!text-white transition-all border border-gray-100">
                                        <Twitter size={18} />
                                    </a>
                                )}
                                {socialLinks.github && (
                                    <a href={socialLinks.github} target="_blank" className="w-10 h-10 rounded-[10px] bg-gray-50 text-gray-400 flex items-center justify-center hover:bg-gray-900 hover:!text-white transition-all border border-gray-100">
                                        <Github size={18} />
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Trust & Verification */}
                        <div className="bg-white rounded-[10px] p-8 border border-gray-100 shadow-sm">
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-8">Trust & Safety</h3>
                            <div className="bg-blue-50/50 p-6 rounded-[10px] border border-blue-100/50 mb-6">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-sm font-black text-blue-600">Trust Score</span>
                                    <span className="text-2xl font-black text-blue-600">{freelancer.trustScore}%</span>
                                </div>
                                <div className="w-full h-3 bg-white rounded-[10px] overflow-hidden border border-blue-100">
                                    <div className="h-full bg-blue-600 rounded-[10px]" style={{ width: `${freelancer.trustScore}%` }} />
                                </div>
                            </div>
                            {freelancer.isVerified ? (
                                <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-[10px] border border-emerald-100 text-emerald-700 font-black text-xs uppercase tracking-widest">
                                    <ShieldCheck size={20} /> Verification Passed
                                </div>
                            ) : (
                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-[10px] border border-gray-100 text-gray-400 font-black text-xs uppercase tracking-widest">
                                    <ShieldCheck size={20} /> Not Verified
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="space-y-4">
                            <Link 
                                href={`/messages?userId=${user.id}`}
                                className="w-full py-5 bg-blue-600 !text-white rounded-[10px] font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-blue-100/50 hover:bg-black transition-all flex items-center justify-center gap-3 active:scale-95"
                            >
                                <MessageSquare size={18} /> Message Candidate
                            </Link>
                            {application.resumeUrl || freelancer.resumeUrl ? (
                                <a 
                                    href={application.resumeUrl || freelancer.resumeUrl || "#"} 
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full py-5 bg-white text-blue-600 border-2 border-blue-600 rounded-[10px] font-black text-sm uppercase tracking-[0.2em] hover:bg-blue-50 transition-all flex items-center justify-center gap-3 active:scale-95"
                                >
                                    <Download size={18} /> Download CV
                                </a>
                            ) : (
                                <div className="w-full py-5 bg-gray-50 text-gray-400 border-2 border-dashed border-gray-200 rounded-[10px] font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-3 cursor-not-allowed">
                                    <Download size={18} className="opacity-50" /> No CV Uploaded
                                </div>
                            )}
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}
