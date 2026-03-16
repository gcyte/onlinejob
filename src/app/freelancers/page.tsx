import FindTalentClient from "@/components/manage/find-talent/FindTalentClient";
import Navbar from "@/components/navbar";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Browse Talent | OnlineJobs",
    description: "Browse and recruit top-tier professionals from our curated pool."
};

export default function PublicFreelancersPage() {
    return (
        <div className="min-h-screen bg-[#F9FAFB]">
            <Navbar />
            <div className="pt-8">
                <FindTalentClient />
            </div>
        </div>
    );
}
