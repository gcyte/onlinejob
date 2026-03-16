import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Navbar from "@/components/navbar";
import { Footer } from "@/components/footer-benefits";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import ApplicationFormPremium from "./application-form-premium";

export default async function ApplyPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "FREELANCER") {
        redirect(`/login?callbackUrl=/jobs/${id}/apply`);
    }

    const job = await prisma.jobPost.findUnique({
        where: { id },
        include: { employer: true }
    });

    if (!job) {
        redirect("/jobs");
    }

    const freelancer = await prisma.freelancerProfile.findUnique({
        where: { userId: (session.user as any).id },
        include: { user: true }
    });

    if (!freelancer) {
        // This shouldn't happen if they are a freelancer, but handle it
        redirect("/dashboard/profile");
    }

    // Parse social links to find LinkedIn
    let linkedinUrl = "";
    if (freelancer.socialLinks) {
        try {
            const socials = JSON.parse(freelancer.socialLinks);
            linkedinUrl = socials.linkedin || "";
        } catch (e) { }
    }

    const profileData = {
        fullName: freelancer.user.name || "",
        email: freelancer.user.email || "",
        phoneNumber: freelancer.phone || "",
        linkedinUrl: linkedinUrl
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <Navbar />

            <main className="pt-32 pb-20 max-w-4xl mx-auto px-4 sm:px-6">
                <Link href={`/jobs/${id}`} className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 font-bold mb-8 transition-colors group">
                    <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center group-hover:bg-blue-50 group-hover:border-blue-100 shadow-sm transition-all">
                        <ChevronLeft size={18} />
                    </div>
                    Back to Job Post
                </Link>

                <div className="text-center mb-12">
                    <span className="px-4 py-1.5 bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-blue-100 mb-6 inline-block">
                        {job.jobType.replace('_', ' ')} ROLE
                    </span>
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">{job.title}</h1>
                    <p className="text-gray-500 font-bold text-lg max-w-2xl mx-auto leading-relaxed">
                        Complete the form below to submit your application for the {job.employer.companyName} team.
                    </p>
                </div>

                <ApplicationFormPremium jobId={id} initialData={profileData} />
            </main>

            <Footer />
        </div>
    );
}
