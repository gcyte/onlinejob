import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Navbar from "@/components/navbar";
import { prisma } from "@/lib/prisma";
import { Heart, Briefcase, MapPin, Search } from "lucide-react";
import Link from "next/link";
import JobCard from "@/components/jobs/job-card";

export default async function SavedJobsPage() {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "FREELANCER") {
        redirect("/login");
    }

    const userId = (session.user as any).id;

    // Fetch saved jobs for this freelancer
    const savedJobs = await prisma.savedJob.findMany({
        where: {
            freelancerProfile: {
                userId: userId
            }
        },
        include: {
            job: {
                include: {
                    employer: true
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <Navbar />

            <div className="pt-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-4">
                            <Heart className="text-rose-500" size={36} fill="currentColor" />
                            Saved Jobs
                        </h1>
                        <p className="text-gray-500 font-bold text-lg mt-2">
                            Manage the job opportunities you've saved for later.
                        </p>
                    </div>

                    <Link
                        href="/jobs"
                        className="px-8 py-4 bg-gray-900 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-black transition-all shadow-xl shadow-gray-200 active:scale-95"
                    >
                        Browse More Jobs
                    </Link>
                </div>

                <div className="grid grid-cols-1 gap-8">
                    {savedJobs.map((saved: any) => (
                        <JobCard key={saved.id} job={saved.job} />
                    ))}

                    {savedJobs.length === 0 && (
                        <div className="text-center py-32 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm">
                            <div className="w-24 h-24 bg-gray-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 border border-dashed border-gray-200">
                                <Search size={40} className="text-gray-300" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 mb-2">You haven't saved any jobs yet</h3>
                            <p className="text-gray-500 font-bold max-w-md mx-auto">
                                Start exploring jobs and tap the heart icon to save them here for quick access later.
                            </p>
                            <Link
                                href="/jobs"
                                className="inline-block mt-10 px-10 py-4 bg-blue-600 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-100/50 active:scale-95"
                            >
                                Explorer Jobs
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
