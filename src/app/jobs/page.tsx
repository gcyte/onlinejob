import { prisma } from "@/lib/prisma";
import Navbar from "@/components/navbar";
import { Briefcase, ChevronDown } from "lucide-react";
import { Footer } from "@/components/footer-benefits";
import SearchHeader from "@/components/jobs/search-header";
import FilterSidebar from "@/components/jobs/filter-sidebar";
import JobCard from "@/components/jobs/job-card";
import Pagination from "@/components/jobs/pagination";
import { JobType } from "@prisma/client";

async function getJobs(searchParams: { [key: string]: string | string[] | undefined }) {
    const q = typeof searchParams.q === 'string' ? searchParams.q : undefined;
    const location = typeof searchParams.location === 'string' ? searchParams.location : undefined;
    const type = typeof searchParams.type === 'string' ? (searchParams.type.toUpperCase().replace('-', '_') as JobType) : undefined;
    const minSalary = typeof searchParams.salary === 'string' ? parseInt(searchParams.salary) : 0;
    const skills = typeof searchParams.skills === 'string' ? searchParams.skills.split(',') : [];
    const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page) : 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const where = {
        status: "APPROVED",
        AND: [
            q ? {
                OR: [
                    { title: { contains: q, mode: 'insensitive' as const } },
                    { description: { contains: q, mode: 'insensitive' as const } },
                    { requirements: { contains: q } },
                ]
            } : {},
            location ? {
                location: { contains: location, mode: 'insensitive' as const }
            } : {},
            type ? {
                jobType: type
            } : {},
            minSalary > 0 ? {
                salaryRange: { contains: minSalary.toString() }
            } : {},
            skills.length > 0 ? {
                OR: skills.map(skill => ({
                    requirements: { contains: skill }
                }))
            } : {}
        ]
    };

    const [jobs, totalJobs] = await prisma.$transaction([
        prisma.jobPost.findMany({
            where,
            include: { employer: true },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
        }),
        prisma.jobPost.count({ where })
    ]);

    return {
        jobs,
        totalJobs,
        totalPages: Math.ceil(totalJobs / limit),
        currentPage: page
    };
}

export default async function JobsPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const resolvedParams = await searchParams;
    const { jobs, totalJobs, totalPages, currentPage } = await getJobs(resolvedParams);
    const query = typeof resolvedParams.q === 'string' ? resolvedParams.q : "Developers";

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            {/* Premium Search Header */}
            <SearchHeader />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full">
                <div className="flex flex-col lg:flex-row gap-12">

                    {/* Left Sidebar Filters */}
                    <FilterSidebar />

                    {/* Main Job Results */}
                    <main className="flex-1 space-y-8">
                        {/* Results Header */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                                    Showing <span className="text-blue-600">{totalJobs}</span> results for &quot;{query}&quot;
                                </h2>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sort by:</span>
                                <div className="flex items-center gap-2 text-xs font-bold text-gray-900 cursor-pointer hover:text-blue-600 transition-all group bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm active:scale-95">
                                    Newest First <ChevronDown size={14} className="group-hover:translate-y-0.5 transition-transform" />
                                </div>
                            </div>
                        </div>

                        {/* Job List */}
                        <div className="space-y-6 mt-8">
                            {jobs.map((job) => (
                                <JobCard key={job.id} job={job} />
                            ))}

                            {jobs.length === 0 && (
                                <div className="text-center py-24 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm">
                                    <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-dashed border-gray-200">
                                        <Briefcase size={32} className="text-gray-200" />
                                    </div>
                                    <h3 className="text-xl font-black text-gray-900 mb-2">No jobs found</h3>
                                    <p className="text-gray-500 font-medium">Check back later or try adjusting your search filters.</p>
                                </div>
                            )}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                            />
                        )}
                    </main>
                </div>
            </div>

            <Footer />
        </div>
    );
}
