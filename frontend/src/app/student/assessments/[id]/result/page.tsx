"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Sparkles, Target, Award, CheckCircle2, AlertTriangle, ArrowRight, History, Layers, ShieldCheck } from "lucide-react";
import { api } from "@/lib/api";

export default function AssessmentResultPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const attemptId = resolvedParams.id;

  const [resultData, setResultData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadResult() {
      try {
        setLoading(true);
        const res = await api.get(`/assessments/${attemptId}/result`);
        setResultData(res.data);
      } catch (err: any) {
        console.error(err);
        setErrorMsg(err.response?.data?.detail || "Unable to load assessment result.");
      } finally {
        setLoading(false);
      }
    }
    loadResult();
  }, [attemptId]);

  const getProficiencyBadgeStyle = (level: string) => {
    switch (level) {
      case "EXPERT":
        return "bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800";
      case "ADVANCED":
        return "bg-[#DCEBE1] text-[#2F6B4F] border-[#B9C8BE] dark:bg-[#294637] dark:text-[#78B895] dark:border-[#425449]";
      case "INTERMEDIATE":
        return "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800";
      case "BASIC":
        return "bg-teal-50 text-teal-800 border-teal-200 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800";
      default:
        return "bg-[#EEF4EF] text-[#526158] border-[#D5DED8] dark:bg-[#223128] dark:text-[#C1CEC5] dark:border-[#304036]";
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9F4] dark:bg-[#0D1511] text-[#17231C] dark:text-[#F1F6F2] flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto p-6 space-y-8">
        {/* Loading / Error State */}
        {loading ? (
          <div className="p-12 text-center text-xs text-[#526158] dark:text-[#C1CEC5] bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] rounded-3xl shadow-xs">
            Loading assessment results breakdown...
          </div>
        ) : errorMsg ? (
          <div className="p-6 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-xs flex items-center justify-between">
            <span>{errorMsg}</span>
            <Link href="/student/assessments/history" className="underline font-bold">
              View Assessment History
            </Link>
          </div>
        ) : (
          <>
            {/* Header & Retake Banner */}
            <div className="bg-[#FFFFFF] dark:bg-[#17211B] p-6 rounded-3xl border border-[#D5DED8] dark:border-[#304036] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DCEBE1] dark:bg-[#294637] text-[#2F6B4F] dark:text-[#78B895] text-xs font-semibold uppercase tracking-wider mb-2 border border-[#B9C8BE] dark:border-[#425449]">
                  <Award className="w-3.5 h-3.5" /> Assessment Completed
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-[#17231C] dark:text-[#F1F6F2]">Skill Assessment Results</h1>
                <p className="text-xs text-[#526158] dark:text-[#C1CEC5] mt-1">
                  Target Career: <strong className="text-[#A96F16] dark:text-[#E5B85C]">{resultData.career_role?.name}</strong>
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href="/student/assessments/history"
                  className="px-4 py-2.5 rounded-2xl bg-[#EEF4EF] dark:bg-[#223128] border border-[#D5DED8] dark:border-[#304036] hover:bg-[#D5DED8] dark:hover:bg-[#304036] text-xs font-bold text-[#17231C] dark:text-[#F1F6F2] flex items-center gap-2 transition-colors"
                >
                  <History className="w-4 h-4 text-[#2F6B4F] dark:text-[#78B895]" /> History
                </Link>
                <Link
                  href="/student/assessments"
                  className="px-5 py-2.5 rounded-2xl bg-[#2F6B4F] hover:bg-[#24563F] dark:bg-[#78B895] dark:hover:bg-[#91CAA8] text-white dark:text-[#0D1511] font-bold text-xs flex items-center gap-2 shadow-xs transition-all"
                >
                  Retake Assessment
                </Link>
              </div>
            </div>

            {/* Top Score Banner */}
            <div className="bg-[#FFFFFF] dark:bg-[#17211B] p-6 rounded-3xl border border-[#D5DED8] dark:border-[#304036] shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center md:text-left">
                <span className="text-[10px] uppercase tracking-widest text-[#2F7D4A] dark:text-[#7BC894] font-bold">OVERALL NORMALIZED SKILL SCORE</span>
                <div className="text-4xl md:text-5xl font-black text-[#17231C] dark:text-[#F1F6F2]">
                  {resultData.overall_score} <span className="text-2xl text-[#68776D] dark:text-[#98A99E] font-normal">/ 100%</span>
                </div>
                <p className="text-xs text-[#526158] dark:text-[#C1CEC5] max-w-lg">
                  Aggregated weighted proficiency across technical, domain, and soft skill competencies.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#EEF4EF] dark:bg-[#223128] border border-[#D5DED8] dark:border-[#304036] space-y-2 w-full md:w-auto text-xs text-[#17231C] dark:text-[#F1F6F2]">
                <div className="flex justify-between gap-4">
                  <span className="text-[#526158] dark:text-[#98A99E]">Completed On:</span>
                  <span className="font-semibold">{new Date(resultData.submitted_at).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-[#526158] dark:text-[#98A99E]">Target Role:</span>
                  <span className="font-semibold text-[#A96F16] dark:text-[#E5B85C]">{resultData.career_role?.name}</span>
                </div>
              </div>
            </div>

            {/* Category Performance Grid */}
            <div className="space-y-3">
              <h2 className="text-base font-bold text-[#17231C] dark:text-[#F1F6F2] flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#2F6B4F] dark:text-[#78B895]" /> Category Performance
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {resultData.categories.map((cat: any) => (
                  <div key={cat.category} className="bg-[#FFFFFF] dark:bg-[#17211B] p-5 rounded-3xl border border-[#D5DED8] dark:border-[#304036] space-y-3 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#17231C] dark:text-[#F1F6F2] uppercase tracking-wider">{cat.category}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold border ${getProficiencyBadgeStyle(cat.proficiency)}`}>
                        {cat.proficiency}
                      </span>
                    </div>

                    <div className="text-2xl font-black text-[#2F7D4A] dark:text-[#7BC894]">{cat.score}%</div>

                    <div className="w-full h-2 bg-[#EEF4EF] dark:bg-[#223128] rounded-full overflow-hidden border border-[#D5DED8] dark:border-[#304036]">
                      <div
                        className="h-full bg-[#2F7D4A] dark:bg-[#7BC894]"
                        style={{ width: `${cat.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Strengths and Needs Improvement Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Strengths List */}
              <div className="bg-[#FFFFFF] dark:bg-[#17211B] p-6 rounded-3xl border border-emerald-500/30 space-y-4 shadow-xs">
                <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2 text-[#2F7D4A] dark:text-[#7BC894]">
                  <CheckCircle2 className="w-4 h-4" /> Strong Competencies (≥75%)
                </h3>

                {resultData.strengths.length > 0 ? (
                  <ul className="space-y-2">
                    {resultData.strengths.map((str: string, i: number) => (
                      <li key={i} className="p-3 rounded-2xl bg-[#DCEBE1]/50 dark:bg-[#294637]/40 border border-[#B9C8BE] dark:border-[#425449] text-xs text-[#2F7D4A] dark:text-[#7BC894] flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-xs text-[#526158] dark:text-[#C1CEC5] p-4 text-center">
                    No skills reached the strength threshold (75%) in this attempt.
                  </div>
                )}
              </div>

              {/* Areas to Improve */}
              <div className="bg-[#FFFFFF] dark:bg-[#17211B] p-6 rounded-3xl border border-amber-500/30 space-y-4 shadow-xs">
                <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2 text-[#A96F16] dark:text-[#E5B85C]">
                  <AlertTriangle className="w-4 h-4" /> Areas to Improve (&lt;60%)
                </h3>

                {resultData.weaknesses.length > 0 ? (
                  <ul className="space-y-2">
                    {resultData.weaknesses.map((weak: string, i: number) => (
                      <li key={i} className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-[#A96F16] dark:text-[#E5B85C] flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>{weak}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-xs text-[#526158] dark:text-[#C1CEC5] p-4 text-center">
                    Great job! No skill areas fell below 60%.
                  </div>
                )}
              </div>
            </div>

            {/* Skill Breakdown Table */}
            <div className="bg-[#FFFFFF] dark:bg-[#17211B] p-6 rounded-3xl border border-[#D5DED8] dark:border-[#304036] space-y-4 shadow-xs">
              <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2 text-[#2F6B4F] dark:text-[#78B895]">
                <ShieldCheck className="w-4 h-4" /> Detailed Skill Breakdown
              </h3>

              <div className="space-y-3">
                {resultData.skills.map((sk: any) => (
                  <div key={sk.skill_id} className="p-4 rounded-2xl bg-[#EEF4EF]/60 dark:bg-[#223128]/50 border border-[#D5DED8] dark:border-[#304036] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="font-bold text-[#17231C] dark:text-[#F1F6F2]">{sk.skill_name}</div>
                      <div className="text-[11px] text-[#526158] dark:text-[#98A99E]">
                        Earned: {sk.earned_weight} / {sk.available_weight} weighted points
                      </div>
                    </div>

                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                      <span className="font-mono font-bold text-[#2F7D4A] dark:text-[#7BC894] text-sm">{sk.score}%</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold border ${getProficiencyBadgeStyle(sk.proficiency)}`}>
                        {sk.proficiency}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Next Step Guidance Banner */}
            <div className="bg-[#FFFFFF] dark:bg-[#17211B] p-6 rounded-3xl border border-teal-500/30 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1 text-xs text-[#526158] dark:text-[#C1CEC5]">
                <span className="text-[10px] uppercase tracking-wider text-teal-700 dark:text-teal-400 font-bold">NEXT STEP</span>
                <p>
                  Your assessment results will be used in the next stage to identify skill gaps for your target career.
                </p>
              </div>

              <Link
                href="/student/dashboard"
                className="px-5 py-2.5 rounded-2xl bg-[#2F6B4F] hover:bg-[#24563F] dark:bg-[#78B895] dark:hover:bg-[#91CAA8] text-white dark:text-[#0D1511] font-bold text-xs flex items-center gap-2 shadow-xs transition-all shrink-0"
              >
                Return to Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
