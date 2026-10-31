"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { User, Sparkles, Search, ShieldCheck, ArrowRight, Eye, Briefcase, GraduationCap } from "lucide-react";

export default function PortfolioHubPage() {
  const router = useRouter();
  const [lookupSlug, setLookupSlug] = useState("");

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = lookupSlug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-");
    if (clean) {
      router.push(`/portfolio/${clean}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9F4] dark:bg-[#0D1511] text-[#17231C] dark:text-[#F1F6F2] flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto p-6 space-y-8 my-6">
        {/* Hero Section */}
        <div className="rounded-3xl border border-[#D5DED8] dark:border-[#304036] bg-[#FFFFFF] dark:bg-[#17211B] p-8 md:p-12 shadow-sm text-center max-w-3xl mx-auto space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-[#2F6B4F]/10 dark:bg-[#78B895]/10 text-[#2F6B4F] dark:text-[#78B895] flex items-center justify-center font-bold text-2xl border border-[#2F6B4F]/20">
            <User className="w-8 h-8" />
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider border border-emerald-500/20">
            <ShieldCheck className="w-3.5 h-3.5" /> Verified Scholar Portfolios
          </span>

          <h1 className="text-3xl md:text-4xl font-extrabold text-[#142019] dark:text-[#FFFFFF]">
            Aayuraura Public Portfolio Portal
          </h1>

          <p className="text-sm text-[#526158] dark:text-[#C1CEC5] max-w-xl mx-auto leading-relaxed">
            Showcase verified clinical competencies, Panchakarma logbooks, research publications, and accredited Ayush certifications to hospitals, research institutes, and employers.
          </p>

          {/* Quick Actions */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/student/portfolio"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#2F6B4F] hover:bg-[#24563F] dark:bg-[#78B895] dark:hover:bg-[#91CAA8] text-white dark:text-[#0D1511] font-bold text-xs flex items-center justify-center gap-2 transition shadow-md"
            >
              <Sparkles className="w-4 h-4" /> Edit My Portfolio
            </Link>

            <Link
              href="/student/portfolio/preview"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#EEF4EF] hover:bg-[#D5DED8] dark:bg-[#223128] dark:hover:bg-[#304036] text-[#17231C] dark:text-[#F1F6F2] font-semibold text-xs border border-[#D5DED8] dark:border-[#304036] flex items-center justify-center gap-2 transition"
            >
              <Eye className="w-4 h-4" /> Live Preview
            </Link>
          </div>
        </div>

        {/* Public Portfolio Lookup */}
        <div className="rounded-3xl border border-[#D5DED8] dark:border-[#304036] bg-[#FFFFFF] dark:bg-[#17211B] p-8 shadow-sm max-w-xl mx-auto space-y-4">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-[#2F6B4F] dark:text-[#78B895]" />
            <h2 className="text-base font-bold text-[#142019] dark:text-[#FFFFFF]">
              Lookup Public Portfolio by Handle
            </h2>
          </div>
          <p className="text-xs text-[#526158] dark:text-[#C1CEC5]">
            Enter a student or scholar handle (e.g., <code className="px-1.5 py-0.5 rounded bg-[#EEF4EF] dark:bg-[#223128] text-[#2F6B4F] dark:text-[#78B895]">priya-sharma</code>) to view their verified credentials.
          </p>

          <form onSubmit={handleLookup} className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. priya-sharma"
              value={lookupSlug}
              onChange={(e) => setLookupSlug(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-[#D5DED8] dark:border-[#304036] bg-transparent text-xs text-[#17231C] dark:text-[#F1F6F2] focus:border-[#2F6B4F]"
            />
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#2F6B4F] hover:bg-[#24563F] dark:bg-[#78B895] dark:hover:bg-[#91CAA8] text-white dark:text-[#0D1511] font-bold text-xs flex items-center gap-1.5 transition"
            >
              Search <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
