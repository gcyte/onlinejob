import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import Navbar from "@/components/navbar";
import {
    Briefcase,
    MapPin,
    Clock,
    DollarSign,
    ChevronLeft,
    Heart,
    Share2,
    Mail,
    Link as LinkIcon,
    Globe,
    Users,
    Building,
    CheckCircle2,
    ShieldCheck,
    Stethoscope,
    Plane,
    Home,
    Coffee
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Footer } from "@/components/footer-benefits";

import SaveJobButton from "@/components/jobs/save-job-button";
import ReportButton from "@/components/report-button";

async function getJob(id: string) {
    return await prisma.jobPost.findUnique({
        where: { id },
        include: { employer: true }
    });
}

async function getSimilarJobs(currentId: string, title: string) {
    return await prisma.jobPost.findMany({
        where: {
            id: { not: currentId },
            isPublished: true,
            OR: [
                { title: { contains: title.split(' ')[0] } },
                { description: { contains: title.split(' ')[0] } }
            ]
        },
        include: { employer: true },
        take: 2
    });
}

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    const job = await getJob(id);

    if (!job) {
        redirect("/jobs");
    }

    const similarJobs = await getSimilarJobs(id, job.title);
    const isFreelancer = session?.user && (session.user as any).role === "FREELANCER";

    // Calculate time ago
    const createdDate = new Date(job.createdAt);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60));
    const timeAgo = diffInHours < 1 ? "Just now" : diffInHours < 24 ? `${diffInHours}h ago` : `${Math.floor(diffInHours / 24)}d ago`;

    // Parse structured skills from JSON string in database
    let skillTags: string[] = [];
    try {
        if (job.skills) {
            skillTags = JSON.parse(job.skills);
        }
    } catch (e) {
        console.error("Failed to parse job skills:", e);
    }

    // Fallback to splitting requirements if no structured skills exist
    if (skillTags.length === 0 && job.requirements) {
        skillTags = job.requirements.split(',').slice(0, 10).map((s: string) => s.trim());
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <Navbar />

            <main className="pt-32 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <Link href="/jobs" className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 font-bold mb-8 transition-colors group">
                    <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center group-hover:bg-blue-50 group-hover:border-blue-100 shadow-sm transition-all">
                        <ChevronLeft size={18} />
                    </div>
                    Back to All Jobs
                </Link>

                {/* Header Card */}
                <div className="bg-white rounded-[10px] p-8 md:p-12 border border-gray-100 shadow-sm mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                    <div className="flex items-center gap-6">
                        <div className="w-24 h-24 bg-gray-50 rounded-[2rem] border border-gray-100 flex items-center justify-center p-4">
                            {job.employer.companyLogo ? (
                                <img
                                    src={job.employer.companyLogo as string}
                                    alt={job.employer.companyName || "Company"}
                                    className="w-full h-full object-contain"
                                />
                            ) : (
                                <Building className="text-gray-300" size={40} />
                            )}
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">{job.title}</h1>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-gray-500 font-bold">
                                <span className="text-blue-600">{job.employer.companyName}</span>
                                <span className="hidden md:inline text-gray-300">•</span>
                                <span className="flex items-center gap-1.5"><MapPin size={16} /> {job.location || "Remote"}</span>
                            </div>
                            <div className="flex flex-wrap gap-3 mt-6">
                                <span className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 text-[11px] font-black uppercase tracking-wider rounded-xl border border-gray-100">
                                    <Globe size={14} className="text-blue-500" /> Remote
                                </span>
                                <span className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 text-[11px] font-black uppercase tracking-wider rounded-xl border border-gray-100">
                                    <Briefcase size={14} className="text-indigo-500" /> {job.jobType.replace('_', ' ').toLowerCase()}
                                </span>
                                <span className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 text-[11px] font-black uppercase tracking-wider rounded-xl border border-emerald-100">
                                    <DollarSign size={14} /> {job.salaryRange || "Competitive"}/mo
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="text-gray-400 font-bold text-sm bg-gray-50 px-6 py-3 rounded-2xl border border-gray-100">
                        Posted {timeAgo}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Main Content Column */}
                    <div className="lg:col-span-8 space-y-10">
                        <div className="bg-white rounded-[10px] p-10 md:p-14 border border-gray-100 shadow-sm space-y-16">

                            {/* Job Description */}
                            <section>
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-1.5 h-8 bg-blue-600 rounded-full" />
                                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">Job Description</h2>
                                </div>
                                <div
                                    className="text-gray-600 leading-[1.8] font-medium text-lg rich-text-content"
                                    dangerouslySetInnerHTML={{ __html: job.description }}
                                />
                            </section>

                            {/* Technical Requirements */}
                            <section>
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-1.5 h-8 bg-indigo-600 rounded-full" />
                                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">Technical Requirements</h2>
                                </div>
                                <div className="flex flex-wrap gap-3 mb-10">
                                    {skillTags.map((skill, idx) => (
                                        <span key={idx} className="px-5 py-2.5 bg-blue-50 text-blue-700 text-[11px] font-black uppercase tracking-widest rounded-xl border border-blue-100">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                                <ul className="space-y-5">
                                    {job.requirements && (
                                        job.requirements.split('\n').filter((r: string) => r.trim()).map((req: string, idx: number) => (
                                            <li key={idx} className="flex items-start gap-4 text-gray-600 font-medium">
                                                <div className="w-6 h-6 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center shrink-0 mt-0.5">
                                                    <CheckCircle2 size={14} className="text-blue-600" />
                                                </div>
                                                {req.replace(/^[-*]\s*/, '')}
                                            </li>
                                        ))
                                    )}
                                </ul>
                            </section>

                            {/* Location Map */}
                            <section>
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-1.5 h-8 bg-rose-500 rounded-full" />
                                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">Location Map</h2>
                                </div>
                                <div className="w-full h-[450px] bg-gray-50 rounded-[10px] overflow-hidden border border-gray-100 relative group">
                                    {/* Real Google Map Embed (Free) */}
                                    {(() => {
                                        const mapAddress = (!job.location || job.location.toLowerCase().includes('remote')) && job.employer.companyAddress
                                            ? job.employer.companyAddress
                                            : (job.location || "Remote");

                                        // If it's pure 'Remote' with no address, we show a general worldwide view or a message
                                        const query = mapAddress === "Remote" ? "World" : mapAddress;

                                        return (
                                            <iframe
                                                width="100%"
                                                height="100%"
                                                className="grayscale-[0.2] contrast-[1.1]"
                                                style={{ border: 0 }}
                                                loading="lazy"
                                                allowFullScreen
                                                referrerPolicy="no-referrer-when-downgrade"
                                                src={`https://www.google.com/maps?q=${encodeURIComponent(query)}&t=m&z=17&output=embed`}
                                            ></iframe>
                                        );
                                    })()}

                                    <div className="absolute top-6 left-1/2 -translate-x-1/2 pointer-events-none w-full px-8">
                                        <div className="max-w-md mx-auto bg-white/95 backdrop-blur-md px-6 py-4 rounded-2xl shadow-2xl border border-white/50 text-center transition-transform group-hover:scale-105">
                                            <div className="flex items-center justify-center gap-3 mb-1">
                                                <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                                                <p className="text-gray-900 font-black tracking-tight text-sm uppercase">
                                                    {(!job.location || job.location.toLowerCase().includes('remote')) && job.employer.companyAddress
                                                        ? "Company Headquarters"
                                                        : "Job Location"}
                                                </p>
                                            </div>
                                            <p className="text-gray-600 font-bold text-xs">
                                                {(!job.location || job.location.toLowerCase().includes('remote')) && job.employer.companyAddress
                                                    ? job.employer.companyAddress
                                                    : (job.location || "Remote")}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                        </div>
                    </div>

                    {/* Sidebar */}
                    <aside className="lg:col-span-4 space-y-8">
                        {/* Primary Interaction Card */}
                        <div className="bg-white rounded-[10px] p-8 border border-gray-100 shadow-sm space-y-4">
                            {isFreelancer ? (
                                <Link
                                    href={`/jobs/${job.id}/apply`}
                                    className="block w-full py-5 bg-blue-600 text-white text-center rounded-2xl font-black text-sm uppercase tracking-[0.2em] hover:bg-blue-700 transition-all shadow-xl shadow-blue-100/50 active:scale-95 flex items-center justify-center gap-3"
                                >
                                    Apply Now
                                </Link>
                            ) : !session ? (
                                <Link href={`/login?callbackUrl=/jobs/${job.id}/apply`} className="block w-full py-5 bg-blue-600 text-white text-center rounded-2xl font-black text-sm uppercase tracking-[0.2em] hover:bg-blue-700 transition-all shadow-xl shadow-blue-100/50 active:scale-95 flex items-center justify-center gap-3">
                                    Apply Now
                                </Link>
                            ) : (
                                <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 text-center">
                                    <p className="text-gray-500 font-bold text-sm">You are logged in as an Employer.</p>
                                    <Link href="/jobs/new" className="mt-4 inline-block text-blue-600 font-black text-sm hover:underline">Post a similar job</Link>
                                </div>
                            )}
                            <SaveJobButton jobId={job.id} />
                        </div>

                        {/* Employer Info */}
                        <div className="bg-white rounded-[10px] p-8 border border-gray-100 shadow-sm">
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-8">About the Employer</h3>
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100">
                                    {job.employer.companyLogo ? (
                                        <img src={job.employer.companyLogo as string} className="w-full h-full object-contain p-2" />
                                    ) : (
                                        <Building className="text-gray-300" size={24} />
                                    )}
                                </div>
                                <div>
                                    <h4 className="font-black text-gray-900 flex items-center gap-2">
                                        {job.employer.companyName}
                                        {(job.employer as any).isVerified && <ShieldCheck size={16} className="text-blue-500" />}
                                    </h4>
                                    {(job.employer as any).isVerified && (
                                        <p className="text-[10px] font-black text-gray-400 tracking-widest uppercase">Verified Employer</p>
                                    )}
                                </div>
                            </div>
                            <p className="text-gray-500 text-sm font-medium leading-relaxed mb-10">
                                {job.employer.description || "Leading the way in innovation and quality."}
                            </p>
                            <div className="space-y-6">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-400 font-bold">Industry</span>
                                    <span className="text-gray-900 font-black">Technology</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-400 font-bold">Company size</span>
                                    <span className="text-gray-900 font-black">50-200 employees</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-400 font-bold">Website</span>
                                    <Link href={job.employer.companyWebsite || "#"} className="text-blue-600 font-black hover:underline">
                                        {job.employer.companyWebsite?.replace(/^https?:\/\//, '') || "N/A"}
                                    </Link>
                                </div>
                            </div>
                        </div>

                    </aside>
                </div >
            </main >
            <Footer />
        </div >
    );
}
