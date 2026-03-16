import Navbar from "@/components/navbar";
import Hero from "@/components/hero";
import LatestJobs from "@/components/latest-jobs";
import { Benefits, Footer } from "@/components/footer-benefits";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <LatestJobs />
      <Benefits />
      <Footer />
    </main>
  );
}
