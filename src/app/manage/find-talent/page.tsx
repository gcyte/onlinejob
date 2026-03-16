import FindTalentClient from "@/components/manage/find-talent/FindTalentClient";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Find Talent | Dashboard",
    description: "Browse and recruit top-tier professionals from our curated pool."
};

export default function FindTalentPage() {
    return <FindTalentClient />;
}
