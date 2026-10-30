import React from "react";
import Link from "next/link";
import { WifiOff, BookOpen, FileText, ArrowRight, RefreshCw, Smartphone } from "lucide-react";
import ReloadButton from "@/components/common/ReloadButton";

export const metadata = {
  title: "Offline - Aayuraura",
  description: "You are currently browsing offline. Access saved BAMS notes and classical treatises.",
};

export default function OfflineFallbackPage() {
  return (
    <div className="min-h-screen bg-[#F7F9F4] dark:bg-[#0D1511] text-[#17231C] dark:text-[#F1F6F2] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-xl w-full bg-white dark:bg-[#15201A] border border-[#D5DED8] dark:border-[#2C3B32] rounded-3xl p-6 sm:p-10 shadow-xl text-center space-y-6">
        {/* Offline Icon Emblem */}
        <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-500/10 dark:bg-amber-400/10 border border-amber-500/30 dark:border-amber-400/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
          <WifiOff className="w-10 h-10 animate-pulse" />
        </div>

        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            Offline Learning Mode Active
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#142019] dark:text-[#FFFFFF]">
            No Internet Connection Detected
          </h1>
          <p className="text-sm text-[#526158] dark:text-[#A7B9AF] leading-relaxed max-w-md mx-auto">
            You appear to be offline or on an unstable network. Live AI clinical consultations and real-time community feeds are paused, but your saved study resources remain fully accessible.
          </p>
        </div>

        {/* Quick Offline Resources Card */}
        <div className="bg-[#F3F7F4] dark:bg-[#1A2821] rounded-2xl p-4 sm:p-5 text-left border border-[#DCEBE1] dark:border-[#2A3E32] space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#2F6B4F] dark:text-[#78B895]">
            Instant Offline Access Available
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2 text-[#3D4C42] dark:text-[#C1CEC5]">
              <FileText className="w-4 h-4 text-[#2F6B4F] dark:text-[#78B895] shrink-0" />
              <span>Offline Notes & Drafts</span>
            </div>
            <div className="flex items-center gap-2 text-[#3D4C42] dark:text-[#C1CEC5]">
              <BookOpen className="w-4 h-4 text-[#2F6B4F] dark:text-[#78B895] shrink-0" />
              <span>NCISM Classical Shlokas</span>
            </div>
            <div className="flex items-center gap-2 text-[#3D4C42] dark:text-[#C1CEC5]">
              <RefreshCw className="w-4 h-4 text-[#2F6B4F] dark:text-[#78B895] shrink-0" />
              <span>Active Recall Flashcards</span>
            </div>
            <div className="flex items-center gap-2 text-[#3D4C42] dark:text-[#C1CEC5]">
              <Smartphone className="w-4 h-4 text-[#2F6B4F] dark:text-[#78B895] shrink-0" />
              <span>Auto-saved Note Buffers</span>
            </div>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/student/offline"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#2F6B4F] hover:bg-[#255740] dark:bg-[#78B895] dark:hover:bg-[#68A785] text-white dark:text-[#0D1511] font-semibold text-sm shadow-md transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2F6B4F]"
          >
            <span>Open Offline Study Hub</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <ReloadButton />
        </div>

        <p className="text-[11px] text-[#68776D] dark:text-[#98A99E]">
          Aayuraura Progressive Web App • Designed for NCISM BAMS Curriculum Continuity
        </p>
      </div>
    </div>
  );
}
