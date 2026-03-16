import { Briefcase, MapPin, DollarSign, ChevronRight, Clock } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

async function getLatestJobs() {
    return await prisma.jobPost.findMany({
        where: { status: "APPROVED" },
        include: { employer: true },
        orderBy: { createdAt: "desc" },
        take: 4
    });
}

function formatSalary(job: any) {
    if (job.salaryMin && job.salaryMax) {
        const currency = job.salaryCurrency || "PHP";
        const freq = job.salaryFrequency || "Monthly";
        return `${currency} ${Number(job.salaryMin).toLocaleString()} – ${Number(job.salaryMax).toLocaleString()} / ${freq}`;
    }
    if (job.salaryRange) return job.salaryRange;
    return "Salary Negotiable";
}

function getSkillTags(job: any): string[] {
    // Try parsed skills JSON first
    if (job.skills) {
        try {
            const parsed = JSON.parse(job.skills);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed.slice(0, 4);
        } catch {}
    }
    // Fall back to splitting requirements by newline, comma, or period
    if (job.requirements) {
        return job.requirements
            .split(/[\n,.]/)
            .map((s: string) => s.trim())
            .filter((s: string) => s.length > 2 && s.length < 40)
            .slice(0, 4);
    }
    return [];
}

function JobCard({ job }: { job: any }) {
    const salary = formatSalary(job);
    const tags = getSkillTags(job);
    const location = job.workStyle || job.location || "Remote";
    const jobTypeLabel = job.jobType?.replace(/_/g, " ") ?? "Full Time";

    return (
        <div className="group bg-white p-8 rounded-[32px] border border-gray-100/80 hover:border-blue-100 hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] transition-all duration-500 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/30 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-blue-100/50 transition-colors" />

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                    <div className="flex gap-5">
                        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100 group-hover:bg-white group-hover:shadow-lg group-hover:shadow-blue-100/50 transition-all duration-500 overflow-hidden flex-shrink-0">
                            {job.employer.companyLogo ? (
                                <img src={job.employer.companyLogo} alt={job.employer.companyName} className="w-full h-full object-contain p-2" />
                            ) : (
                                <Briefcase className="text-gray-400 group-hover:text-blue-600" size={28} />
                            )}
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-gray-900 group-hover:text-blue-600 transition-colors mb-1 uppercase tracking-tight leading-tight">{job.title}</h3>
                            <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">{job.employer.companyName || "Company"}</p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap gap-5 mb-6 text-xs font-black text-gray-400 uppercase tracking-widest">
                    <span className="flex items-center gap-2">
                        <DollarSign size={16} className="text-green-500" />
                        <span className="truncate max-w-[180px]">{salary}</span>
                    </span>
                    <span className="flex items-center gap-2">
                        <MapPin size={16} className="text-blue-500" /> {location}
                    </span>
                </div>

                {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-8">
                        {tags.map((tag) => (
                            <span key={tag} className="px-3 py-1 bg-gray-50 text-gray-500 text-[10px] font-black uppercase tracking-widest rounded-lg border border-gray-100 group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:border-blue-100 transition-colors truncate max-w-[140px]">
                                {tag}
                            </span>
                        ))}
                    </div>
                )}

                <div className="flex items-center justify-between gap-4 pt-4 border-t border-gray-50">
                    <div className="flex items-center gap-2">
                        <span className="px-4 py-1.5 bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-gray-100 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all">
                            {jobTypeLabel}
                        </span>
                        {job.experienceLevel && (
                            <span className="px-4 py-1.5 bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-gray-100">
                                {job.experienceLevel}
                            </span>
                        )}
                    </div>
                    <Link
                        href={`/jobs/${job.id}`}
                        className="flex items-center gap-2 text-gray-900 font-black text-sm uppercase tracking-widest hover:text-blue-600 transition-all group/link"
                    >
                        View Job <ChevronRight size={18} className="group-hover/link:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default async function LatestJobs() {
    const jobs = await getLatestJobs();

    return (
        <section className="py-24 bg-gray-50/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
                    <div className="max-w-2xl">
                        <div className="inline-block px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-blue-100">
                            Remote Opportunities
                        </div>
                        <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-6 uppercase tracking-tight leading-none">
                            Latest Featured <br /> <span className="text-blue-600">Opportunities</span>
                        </h2>
                        <p className="text-lg text-gray-500 font-medium leading-relaxed">
                            Discover high-quality remote roles from specialized teams looking for elite Filipino talent.
                        </p>
                    </div>
                    <Link
                        href="/jobs"
                        className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 flex items-center gap-3 group uppercase tracking-widest text-xs"
                    >
                        Browse All Jobs <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                <div className="grid md:grid-cols-2 gap-8 mb-16">
                    {jobs.map(job => (
                        <JobCard key={job.id} job={job} />
                    ))}
                    {jobs.length === 0 && (
                        <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-dashed border-gray-200">
                            <Clock size={32} className="mx-auto text-gray-300 mb-4" />
                            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-2">No approved jobs yet.</p>
                            <p className="text-gray-300 text-xs font-medium">Check back soon or <Link href="/register" className="text-blue-500 hover:underline">post a job</Link>.</p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
