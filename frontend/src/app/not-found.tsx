"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Compass, Home, LayoutDashboard, BookOpen, ArrowLeft, HelpCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F7F9F4] dark:bg-[#0D1511] text-[#17231C] dark:text-[#F1F6F2] flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto p-6 flex flex-col items-center justify-center text-center my-12">
        <div className="rounded-3xl border border-[#D5DED8] dark:border-[#304036] bg-[#FFFFFF] dark:bg-[#17211B] p-10 md:p-14 shadow-sm max-w-2xl w-full space-y-6">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 text-[#A96F16] dark:text-[#E5B85C] flex items-center justify-center border border-[#A96F16]/30 dark:border-[#E5B85C]/30 shadow-inner">
            <Compass className="w-8 h-8 animate-spin-slow" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#2F6B4F] dark:text-[#78B895]">
              Error 404 • Page Not Found
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#142019] dark:text-[#FFFFFF]">
              Pathway Not Discovered
            </h1>
            <p className="text-sm text-[#526158] dark:text-[#C1CEC5] max-w-md mx-auto leading-relaxed">
              The page or resource you are looking for might have been updated, relocated, or does not exist in this domain.
            </p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/student/dashboard"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#2F6B4F] hover:bg-[#24563F] dark:bg-[#78B895] dark:hover:bg-[#91CAA8] text-white dark:text-[#0D1511] font-bold text-xs flex items-center justify-center gap-2 transition shadow-md"
            >
              <LayoutDashboard className="w-4 h-4" /> Go to Dashboard
            </Link>

            <Link
              href="/learning-hub"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#EEF4EF] hover:bg-[#D5DED8] dark:bg-[#223128] dark:hover:bg-[#304036] text-[#17231C] dark:text-[#F1F6F2] font-semibold text-xs border border-[#D5DED8] dark:border-[#304036] flex items-center justify-center gap-2 transition"
            >
              <BookOpen className="w-4 h-4" /> Learning Hub
            </Link>

            <Link
              href="/"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-transparent hover:bg-[#EEF4EF] dark:hover:bg-[#223128] text-[#526158] dark:text-[#C1CEC5] font-semibold text-xs border border-[#D5DED8] dark:border-[#304036] flex items-center justify-center gap-2 transition"
            >
              <Home className="w-4 h-4" /> Home
            </Link>
          </div>

          <div className="border-t border-[#D5DED8] dark:border-[#304036] pt-6 text-xs text-[#68776D] dark:text-[#98A99E] flex items-center justify-center gap-2">
            <HelpCircle className="w-4 h-4" />
            <span>Need assistance? <Link href="/feedback" className="underline font-semibold hover:text-[#2F6B4F] dark:hover:text-[#78B895]">Send Feedback or Report an Issue</Link></span>
          </div>
        </div>
      </main>
    </div>
  );
}
