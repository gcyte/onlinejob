import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Navbar from "@/components/navbar";
import { prisma } from "@/lib/prisma";
import { Users, Briefcase, Calendar, CheckCircle2, XCircle, Clock, Search, Filter, ArrowRight } from "lucide-react";
import Link from "next/link";
import StatusDropdown from "./status-dropdown";

export default async function ApplicantsPage() {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "EMPLOYER") {
        redirect("/login");
    }

    const userId = (session.user as any).id;

    // Fetch all applications for jobs owned by this employer
    const applications = await prisma.application.findMany({
        where: {
            job: {
                employer: {
                    userId: userId
                }
            }
        },
        include: {
            job: true,
            freelancerProfile: {
                include: {
                    user: {
                        select: {
                            name: true,
                            email: true,
                            image: true
                        }
                    }
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    return (
        <div className="pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-4">
                        <Users className="text-blue-600" size={32} />
                        Applicants Management
                    </h1>
                    <p className="text-gray-500 font-bold text-lg mt-2">
                        Review and manage all applications received for your job posts.
                    </p>
                </div>

                <div className="flex gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            placeholder="Search applicants..."
                            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-[10px] focus:ring-2 focus:ring-blue-600 outline-none font-medium shadow-sm"
                        />
                    </div>
                    <button className="p-3.5 bg-white border border-gray-100 rounded-[10px] text-gray-600 hover:bg-gray-50 transition-all shadow-sm">
                        <Filter size={20} />
                    </button>
                </div>
            </div>

            <div className="grid gap-6">
                {applications.map((app) => (
                    <div key={app.id} className="bg-white rounded-[10px] p-6 sm:p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-blue-50/50 transition-all duration-300 group relative flex flex-col xl:flex-row gap-8 xl:items-center">
                        {/* Contained Blur Effect */}
                        <div className="absolute inset-0 rounded-[10px] overflow-hidden pointer-events-none">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50/50 to-transparent rounded-full blur-3xl group-hover:bg-blue-100/30 transition-colors" />
                        </div>

                        {/* 1. Applicant Info */}
                        <div className="flex items-center gap-6 xl:w-[350px]">
                            <div className="w-16 h-16 rounded-[10px] bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 flex items-center justify-center font-black text-2xl border-2 border-white shadow-md shadow-blue-100 overflow-hidden group-hover:-translate-y-1 transition-transform">
                                {(app.freelancerProfile.avatarUrl || app.freelancerProfile.user.image) ? (
                                    <img 
                                        src={app.freelancerProfile.avatarUrl || app.freelancerProfile.user.image || ""} 
                                        alt={app.freelancerProfile.user.name || ""} 
                                        className="w-full h-full object-cover" 
                                    />
                                ) : (
                                    app.freelancerProfile.user.name?.[0]
                                )}
                            </div>
                            <div>
                                <p className="text-xl font-black text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">{app.freelancerProfile.user.name}</p>
                                <p className="text-xs text-gray-400 font-bold">{app.freelancerProfile.user.email}</p>
                            </div>
                        </div>

                        {/* 2. Job & Details */}
                        <div className="flex-1 grid sm:grid-cols-2 gap-6 bg-gray-50/50 rounded-[10px] p-5 border border-gray-50">
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><Briefcase size={12} className="text-blue-500" /> Applying For</p>
                                <p className="text-sm font-black text-gray-900">{app.job.title}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><Calendar size={12} className="text-indigo-500" /> Date Received</p>
                                <p className="text-sm font-bold text-gray-700">{new Date(app.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                            </div>
                        </div>

                        {/* 3. Trust Score */}
                        <div className="xl:w-[150px]">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Trust Score</p>
                            <div className="flex items-center gap-3">
                                <div className="w-full h-2.5 bg-gray-100 rounded-[10px] overflow-hidden shadow-inner flex">
                                    <div
                                        className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-[10px]"
                                        style={{ width: `${app.freelancerProfile.trustScore || 0}%` }}
                                    />
                                </div>
                                <span className="text-sm font-black text-gray-900">{app.freelancerProfile.trustScore || 0}%</span>
                            </div>
                        </div>

                        {/* 4. Actions */}
                        <div className="flex flex-col sm:flex-row xl:flex-col items-center gap-3 xl:w-[200px] border-t xl:border-t-0 xl:border-l border-gray-100 pt-6 xl:pt-0 xl:pl-8">
                            <StatusDropdown 
                                applicationId={app.id} 
                                currentStatus={app.status} 
                                freelancerName={app.freelancerProfile.user.name || "Freelancer"} 
                            />
                            <Link
                                href={`/dashboard/applicants/${app.id}`}
                                className="w-full px-6 py-2.5 bg-blue-600 !text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-[10px] hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95 text-center flex items-center justify-center min-h-[40px]"
                            >
                                Open Dossier
                            </Link>
                        </div>
                    </div>
                ))}

                {applications.length === 0 && (
                    <div className="text-center py-24 bg-white rounded-[10px] border border-dashed border-gray-200 shadow-sm mt-8">
                        <div className="w-24 h-24 bg-gray-50 rounded-[10px] flex items-center justify-center mx-auto mb-8 border border-gray-100 shadow-inner group">
                            <Users size={40} className="text-gray-300 group-hover:text-blue-500 transition-colors" />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 mb-3 uppercase tracking-tight">No Applications Received</h2>
                        <p className="text-gray-500 font-medium max-w-sm mx-auto mb-8">
                            When high-quality freelancers apply to your listings, they will populate your talent queue here.
                        </p>
                        <Link href="/manage/jobs" className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-[10px] font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 hover:-translate-y-1">
                            Review Live Listings <ArrowRight size={16} />
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
