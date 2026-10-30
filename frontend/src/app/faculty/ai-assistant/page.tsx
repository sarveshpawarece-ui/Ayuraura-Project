"use client";

import Link from "next/link";
import { Sparkles, ChevronLeft, BookOpen, Award, FileText, CheckCircle2 } from "lucide-react";
import { DashboardLayout, DashboardHeader } from "@/components/dashboard";
import FacultyAssistant from "@/components/ai/FacultyAssistant";

export default function FacultyAiAssistantPage() {
  return (
    <DashboardLayout>
      <div className="mb-4">
        <Link
          href="/faculty/dashboard"
          className="text-xs text-slate-400 hover:text-emerald-400 font-medium inline-flex items-center gap-1 transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" /> Back to Faculty Dashboard
        </Link>
      </div>

      <DashboardHeader
        badgeText="AI Pedagogy Engine"
        badgeIcon={<Sparkles className="w-3.5 h-3.5" />}
        badgeVariant="emerald"
        title="AI Faculty Assistant Studio"
        subtitle="Generate university examination papers, structured 45-minute lesson outlines, active revision activities, and bedside clinical scenarios grounded in classical Ayurvedic literature."
      />

      {/* Advisory Banner */}
      <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 text-amber-200/90 text-xs flex items-start gap-3 mb-6">
        <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-amber-300">NCISM Pedagogical Standards Notice:</strong> All AI-generated questions and outlines are formulated to assist professors. Classical Shlokas and references should always be cross-checked with authorized Brihat-trayi editions prior to official university exam printing.
        </div>
      </div>

      {/* Core AI Assistant Interface */}
      <div className="rounded-3xl bg-slate-900/40 border border-slate-800/80 p-6 shadow-xl">
        <FacultyAssistant />
      </div>
    </DashboardLayout>
  );
}
