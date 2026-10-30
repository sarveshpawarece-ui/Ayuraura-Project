"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Sparkles, Target, Award, CheckCircle2, AlertTriangle, ArrowRight, Layers, ShieldCheck, History, TrendingUp, HelpCircle } from "lucide-react";
import { api } from "@/lib/api";

export default function StudentSkillsPage() {
  const [profileData, setProfileData] = useState<any>(null);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadSkillProfile() {
      try {
        setLoading(true);
        const [profileRes, historyRes] = await Promise.allSettled([
          api.get("/students/me/skills"),
          api.get("/students/me/skills/history")
        ]);

        if (profileRes.status === "fulfilled") {
          setProfileData(profileRes.value.data);
        }
        if (historyRes.status === "fulfilled") {
          setHistoryData(historyRes.value.data || []);
        }
      } catch (err: any) {
        console.error("Error loading skill profile:", err);
        setErrorMsg("Unable to load skill profile. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    loadSkillProfile();
  }, []);

  const getProficiencyBadgeStyle = (level: string) => {
    switch (level) {
      case "EXPERT":
        return "bg-purple-100 dark:bg-purple-950/50 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-800";
      case "ADVANCED":
        return "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800";
      case "INTERMEDIATE":
        return "bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800";
      case "BASIC":
        return "bg-teal-100 dark:bg-teal-950/50 text-teal-800 dark:text-teal-300 border-teal-300 dark:border-teal-800";
      case "BEGINNER":
        return "bg-[#EEF4EF] dark:bg-[#223128] text-[#526158] dark:text-[#C1CEC5] border-[#D5DED8] dark:border-[#304036]";
      default:
        return "bg-[#EEF4EF] dark:bg-[#223128] text-[#526158] dark:text-[#C1CEC5] border-[#D5DED8] dark:border-[#304036]";
    }
  };

  const hasAssessedSkills = profileData && profileData.skills && profileData.skills.length > 0;

  return (
    <div className="min-h-screen bg-[#F7F9F4] dark:bg-[#0D1511] text-[#17231C] dark:text-[#F1F6F2] flex flex-col transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="rounded-2xl border border-[#D5DED8] dark:border-[#304036] bg-[#FFFFFF] dark:bg-[#17211B] p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DCEBE1] dark:bg-[#294637] text-[#2F6B4F] dark:text-[#78B895] text-xs font-semibold uppercase tracking-wider mb-2 border border-[#D5DED8] dark:border-[#304036]">
              <Sparkles className="w-3.5 h-3.5" /> Career Skill Intelligence
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#142019] dark:text-[#FFFFFF]">Student Skill Profile</h1>
            <p className="text-xs text-[#526158] dark:text-[#C1CEC5] mt-1">
              Consolidated, assessment-derived skill competencies and proficiency levels.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/student/ecosystem?tab=pipeline"
              className="px-4 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-[#A96F16] dark:text-[#E5B85C] border border-[#A96F16]/30 dark:border-[#E5B85C]/30 font-bold text-xs flex items-center gap-1.5 transition-all shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#A96F16] dark:text-[#E5B85C]" /> BAMS Remediation
            </Link>
            <Link
              href="/student/assessments"
              className="px-5 py-2.5 rounded-xl bg-[#2F6B4F] hover:bg-[#24563F] text-white dark:bg-[#78B895] dark:hover:bg-[#91CAA8] dark:text-[#0D1511] font-bold text-xs flex items-center gap-2 shadow-md transition-all shrink-0"
            >
              {hasAssessedSkills ? "Retake Skill Assessment" : "Start Skill Assessment"} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="p-12 text-center text-xs text-[#68776D] dark:text-[#98A99E] rounded-2xl border border-[#D5DED8] dark:border-[#304036] bg-[#FFFFFF] dark:bg-[#17211B] shadow-sm">
            Loading your skill profile...
          </div>
        ) : errorMsg ? (
          <div className="p-6 rounded-xl bg-red-50 dark:bg-red-950/40 border border-[#B64040]/30 text-[#B64040] dark:text-[#F18484] text-xs flex items-center justify-between">
            <span>{errorMsg}</span>
          </div>
        ) : !hasAssessedSkills ? (
          /* Unassessed / No Assessment State */
          <div className="rounded-2xl border border-[#A96F16]/30 dark:border-[#E5B85C]/30 bg-gradient-to-br from-amber-500/5 via-[#FFFFFF] to-[#EEF4EF] dark:from-amber-950/20 dark:via-[#17211B] dark:to-emerald-950/20 text-center space-y-5 p-10 shadow-sm">
            <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-[#A96F16]/30 dark:border-[#E5B85C]/30 flex items-center justify-center mx-auto text-[#A96F16] dark:text-[#E5B85C]">
              <Award className="w-7 h-7" />
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <h2 className="text-xl font-bold text-[#142019] dark:text-[#FFFFFF]">Skill Profile Not Available Yet</h2>
              <p className="text-xs text-[#526158] dark:text-[#C1CEC5] leading-relaxed">
                Complete the 25-question diagnostic skill assessment to benchmark your technical, domain, and soft skill competencies.
              </p>
            </div>

            <div className="pt-2">
              <Link
                href="/student/assessments"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#2F6B4F] hover:bg-[#24563F] text-white dark:bg-[#78B895] dark:hover:bg-[#91CAA8] dark:text-[#0D1511] font-bold text-xs shadow-md transition-all"
              >
                Start Diagnostic Skill Assessment <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Top Score Banner */}
            <div className="rounded-2xl border border-[#D5DED8] dark:border-[#304036] bg-gradient-to-r from-[#DCEBE1]/40 via-[#FFFFFF] to-[#EEF4EF] dark:from-[#294637]/30 dark:via-[#17211B] dark:to-[#1D2A22] p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center md:text-left">
                <span className="text-[10px] uppercase tracking-widest text-[#2F6B4F] dark:text-[#78B895] font-bold">OVERALL SKILL SCORE</span>
                <div className="text-4xl md:text-5xl font-black text-[#142019] dark:text-[#FFFFFF]">
                  {profileData.overall_score !== null ? profileData.overall_score : "N/A"} <span className="text-2xl text-[#68776D] dark:text-[#98A99E] font-normal">/ 100</span>
                </div>
                <p className="text-xs text-[#526158] dark:text-[#C1CEC5] max-w-lg">
                  Aggregated weighted proficiency derived from your latest diagnostic assessment attempt.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#FFFFFF] dark:bg-[#1D2A22] border border-[#D5DED8] dark:border-[#304036] space-y-2 w-full md:w-auto text-xs text-[#17231C] dark:text-[#F1F6F2]">
                <div className="flex justify-between gap-4">
                  <span className="text-[#68776D] dark:text-[#98A99E]">Target Career:</span>
                  <span className="font-semibold text-[#A96F16] dark:text-[#E5B85C]">
                    {profileData.target_career ? profileData.target_career.name : "Not Selected"}
                  </span>
                </div>
                {profileData.last_assessed_at && (
                  <div className="flex justify-between gap-4">
                    <span className="text-[#68776D] dark:text-[#98A99E]">Last Assessed:</span>
                    <span className="font-semibold text-[#142019] dark:text-[#FFFFFF]">
                      {new Date(profileData.last_assessed_at).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Category Performance Grid */}
            {profileData.categories && profileData.categories.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-base font-bold text-[#142019] dark:text-[#FFFFFF] flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#2F6B4F] dark:text-[#78B895]" /> Category Performance
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {profileData.categories.map((cat: any) => (
                    <div key={cat.category} className="rounded-2xl border border-[#D5DED8] dark:border-[#304036] bg-[#FFFFFF] dark:bg-[#17211B] p-5 shadow-sm space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#142019] dark:text-[#FFFFFF] uppercase tracking-wider">{cat.category}</span>
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-semibold border ${getProficiencyBadgeStyle(cat.proficiency)}`}>
                          {cat.proficiency}
                        </span>
                      </div>

                      <div className="text-2xl font-black text-[#2F6B4F] dark:text-[#78B895]">{cat.score}%</div>

                      <div className="w-full h-1.5 bg-[#EEF4EF] dark:bg-[#223128] rounded-full overflow-hidden border border-[#D5DED8] dark:border-[#304036]">
                        <div
                          className="h-full bg-[#2F6B4F] dark:bg-[#78B895] transition-all duration-500"
                          style={{ width: `${cat.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Strengths & Areas to Improve Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Strengths List */}
              <div className="rounded-2xl border border-[#2F7D4A]/30 dark:border-[#7BC894]/30 bg-[#FFFFFF] dark:bg-[#17211B] p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2 text-[#2F7D4A] dark:text-[#7BC894]">
                  <CheckCircle2 className="w-4 h-4" /> Your Strengths (≥75%)
                </h3>

                {profileData.strengths && profileData.strengths.length > 0 ? (
                  <ul className="space-y-2">
                    {profileData.strengths.map((str: string, i: number) => (
                      <li key={i} className="p-3 rounded-xl bg-[#EEF4EF] dark:bg-[#1D2A22] border border-[#D5DED8] dark:border-[#304036] text-xs text-[#2F7D4A] dark:text-[#7BC894] flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#2F7D4A] dark:text-[#7BC894] shrink-0" />
                        <span className="font-semibold">{str}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-xs text-[#68776D] dark:text-[#98A99E] p-4 text-center">
                    No skills reached the strength threshold (75%) yet.
                  </div>
                )}
              </div>

              {/* Areas to Improve */}
              <div className="rounded-2xl border border-[#A96F16]/30 dark:border-[#E5B85C]/30 bg-[#FFFFFF] dark:bg-[#17211B] p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2 text-[#A96F16] dark:text-[#E5B85C]">
                  <AlertTriangle className="w-4 h-4" /> Areas to Improve (&lt;60%)
                </h3>

                {profileData.areas_to_improve && profileData.areas_to_improve.length > 0 ? (
                  <ul className="space-y-2">
                    {profileData.areas_to_improve.map((weak: string, i: number) => (
                      <li key={i} className="p-3 rounded-xl bg-[#EEF4EF] dark:bg-[#1D2A22] border border-[#D5DED8] dark:border-[#304036] text-xs text-[#A96F16] dark:text-[#E5B85C] flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-[#A96F16] dark:text-[#E5B85C] shrink-0" />
                        <span className="font-semibold">{weak}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-xs text-[#68776D] dark:text-[#98A99E] p-4 text-center">
                    Great job! No assessed skills fell below 60%.
                  </div>
                )}
              </div>
            </div>

            {/* Detailed Skill Proficiency List */}
            <div className="rounded-2xl border border-[#D5DED8] dark:border-[#304036] bg-[#FFFFFF] dark:bg-[#17211B] p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2 text-[#2F6B4F] dark:text-[#78B895]">
                <ShieldCheck className="w-4 h-4" /> Assessed Skill Proficiency
              </h3>

              <div className="space-y-3">
                {profileData.skills.map((sk: any) => (
                  <div key={sk.skill_id} className="p-4 rounded-xl bg-[#F7F9F4] dark:bg-[#1D2A22] border border-[#D5DED8] dark:border-[#304036] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="font-bold text-[#142019] dark:text-[#FFFFFF] text-sm">{sk.skill_name}</div>
                      <div className="text-[11px] text-[#68776D] dark:text-[#98A99E]">Source: <span className="text-[#17231C] dark:text-[#F1F6F2] font-mono">{sk.source}</span></div>
                    </div>

                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                      <span className="font-mono font-bold text-[#2F6B4F] dark:text-[#78B895] text-sm">{sk.score}%</span>
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-semibold border ${getProficiencyBadgeStyle(sk.proficiency)}`}>
                        {sk.proficiency}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Skill Development History / Trend */}
            {historyData.length > 0 && (
              <div className="rounded-2xl border border-[#D5DED8] dark:border-[#304036] bg-[#FFFFFF] dark:bg-[#17211B] p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2 text-purple-700 dark:text-purple-400">
                  <TrendingUp className="w-4 h-4" /> Skill Development Trend History
                </h3>

                <div className="space-y-3">
                  {historyData.map((item: any) => (
                    <div key={item.skill_id} className="p-4 rounded-xl bg-[#F7F9F4] dark:bg-[#1D2A22] border border-[#D5DED8] dark:border-[#304036] space-y-2">
                      <div className="font-bold text-[#142019] dark:text-[#FFFFFF] text-xs">{item.skill_name}</div>
                      <div className="flex flex-wrap gap-2">
                        {item.attempts.map((att: any, idx: number) => (
                          <div key={att.attempt_id} className="px-3 py-1.5 rounded-lg bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] text-[11px] flex items-center gap-2">
                            <span className="text-[#68776D] dark:text-[#98A99E]">Attempt {idx + 1}:</span>
                            <span className="font-mono font-bold text-[#2F6B4F] dark:text-[#78B895]">{att.score}%</span>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded border ${getProficiencyBadgeStyle(att.proficiency)}`}>
                              {att.proficiency}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Next Stage Guidance Banner */}
            <div className="rounded-2xl border border-[#D5DED8] dark:border-[#304036] bg-gradient-to-r from-[#DCEBE1]/40 via-[#FFFFFF] to-[#EEF4EF] dark:from-[#294637]/30 dark:via-[#17211B] dark:to-[#1D2A22] p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1 text-xs text-[#526158] dark:text-[#C1CEC5]">
                <span className="text-[10px] uppercase tracking-wider text-[#2F6B4F] dark:text-[#78B895] font-bold">NEXT STAGE</span>
                <p>
                  Your current skill profile can now be compared with the skills required for your target career in future phases.
                </p>
              </div>

              <Link
                href="/student/dashboard"
                className="px-5 py-2.5 rounded-xl bg-[#2F6B4F] hover:bg-[#24563F] text-white dark:bg-[#78B895] dark:hover:bg-[#91CAA8] dark:text-[#0D1511] font-bold text-xs flex items-center gap-2 shadow-md transition-all shrink-0"
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
