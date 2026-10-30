"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Sparkles, Target, ArrowRight, ShieldCheck, Clock, Layers, Award, AlertCircle, History } from "lucide-react";
import { api } from "@/lib/api";

export default function AssessmentLandingPage() {
  const router = useRouter();
  const [targetCareer, setTargetCareer] = useState<any>(null);
  const [activeAttempt, setActiveAttempt] = useState<any>(null);
  const [latestResult, setLatestResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // 1. Fetch Target Career
        const targetRes = await api.get("/students/me/target-career");
        setTargetCareer(targetRes.data.target_career);

        // 2. Fetch Active Assessment
        const activeRes = await api.get("/assessments/current");
        setActiveAttempt(activeRes.data);

        // 3. Fetch History for latest result
        const historyRes = await api.get("/assessments/history");
        const history = historyRes.data || [];
        const submitted = history.filter((h: any) => h.status === "SUBMITTED");
        if (submitted.length > 0) {
          setLatestResult(submitted[0]);
        }
      } catch (err: any) {
        console.error("Error loading assessment overview:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleStartAssessment = async () => {
    if (!targetCareer) {
      setErrorMsg("Please select a target career before starting the skill assessment.");
      return;
    }

    setStarting(true);
    setErrorMsg(null);
    try {
      if (activeAttempt) {
        router.push(`/student/assessments/${activeAttempt.attempt_id}`);
        return;
      }

      const res = await api.post("/assessments/start");
      router.push(`/student/assessments/${res.data.attempt_id}`);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || "Unable to start assessment. Please try again.");
      setStarting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9F4] dark:bg-[#0D1511] text-[#17231C] dark:text-[#F1F6F2] flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="bg-[#FFFFFF] dark:bg-[#17211B] p-6 rounded-3xl border border-[#D5DED8] dark:border-[#304036] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DCEBE1] dark:bg-[#294637] text-[#2F6B4F] dark:text-[#78B895] text-xs font-semibold uppercase tracking-wider mb-2 border border-[#B9C8BE] dark:border-[#425449]">
              <Sparkles className="w-3.5 h-3.5" /> Diagnostic Skill Intelligence
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#17231C] dark:text-[#F1F6F2]">Student Skill Assessment</h1>
            <p className="text-xs text-[#526158] dark:text-[#C1CEC5] mt-1">
              Benchmark your core competencies against your selected target career pathway.
            </p>
          </div>

          <Link
            href="/student/assessments/history"
            className="px-4 py-2.5 rounded-2xl bg-[#EEF4EF] dark:bg-[#223128] border border-[#D5DED8] dark:border-[#304036] hover:bg-[#D5DED8] dark:hover:bg-[#304036] text-xs font-bold text-[#17231C] dark:text-[#F1F6F2] flex items-center gap-2 transition-colors shrink-0"
          >
            <History className="w-4 h-4 text-[#2F6B4F] dark:text-[#78B895]" /> Assessment History
          </Link>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 dark:text-rose-400" />
              <span>{errorMsg}</span>
            </div>
            {!targetCareer && (
              <Link href="/student/career" className="underline font-bold hover:text-rose-950 dark:hover:text-rose-200">
                Choose Target Career
              </Link>
            )}
          </div>
        )}

        {/* Target Career Context & Status Banner */}
        <div className="bg-[#FFFFFF] dark:bg-[#17211B] p-6 rounded-3xl border border-amber-500/30 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-[10px] uppercase tracking-widest text-[#A96F16] dark:text-[#E5B85C] font-bold flex items-center gap-1.5">
              <Target className="w-4 h-4" /> TARGET CAREER CONTEXT
            </span>
            {targetCareer ? (
              <div>
                <h2 className="text-xl font-bold text-[#17231C] dark:text-[#F1F6F2]">{targetCareer.name}</h2>
                <div className="text-xs text-[#2F6B4F] dark:text-[#78B895] font-semibold">{targetCareer.domain || "Ayush Research & Dev"}</div>
              </div>
            ) : (
              <div className="text-xs text-rose-600 dark:text-rose-400 font-medium py-1">
                No Target Career Selected. You must choose a career path first before taking the assessment.
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {!targetCareer ? (
              <Link
                href="/student/career"
                className="w-full md:w-auto px-6 py-3 rounded-2xl bg-[#A96F16] hover:bg-[#8e5c12] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all"
              >
                Select Target Career <ArrowRight className="w-4 h-4" />
              </Link>
            ) : activeAttempt ? (
              <button
                onClick={handleStartAssessment}
                className="w-full md:w-auto px-6 py-3 rounded-2xl bg-[#2F6B4F] hover:bg-[#24563F] dark:bg-[#78B895] dark:hover:bg-[#91CAA8] text-white dark:text-[#0D1511] font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all"
              >
                Resume Assessment In Progress <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                disabled={starting}
                onClick={handleStartAssessment}
                className="w-full md:w-auto px-6 py-3 rounded-2xl bg-[#2F6B4F] hover:bg-[#24563F] dark:bg-[#78B895] dark:hover:bg-[#91CAA8] text-white dark:text-[#0D1511] font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all"
              >
                {starting ? "Starting Assessment..." : "Start Skill Assessment →"}
              </button>
            )}
          </div>
        </div>

        {/* Overview & Instructions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#FFFFFF] dark:bg-[#17211B] p-6 rounded-3xl border border-[#D5DED8] dark:border-[#304036] space-y-3 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-[#DCEBE1] dark:bg-[#294637] border border-[#B9C8BE] dark:border-[#425449] flex items-center justify-center text-[#2F6B4F] dark:text-[#78B895]">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-[#17231C] dark:text-[#F1F6F2]">25 Balanced Questions</h3>
            <p className="text-xs text-[#526158] dark:text-[#C1CEC5] leading-relaxed">
              Evaluating Technical (10), Domain-specific Ayurveda (10), and Soft Skill (5) competencies.
            </p>
          </div>

          <div className="bg-[#FFFFFF] dark:bg-[#17211B] p-6 rounded-3xl border border-[#D5DED8] dark:border-[#304036] space-y-3 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-[#A96F16] dark:text-[#E5B85C]">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-[#17231C] dark:text-[#F1F6F2]">15–20 Mins Estimated</h3>
            <p className="text-xs text-[#526158] dark:text-[#C1CEC5] leading-relaxed">
              Self-paced assessment. Progress and selected answers automatically save as you navigate questions.
            </p>
          </div>

          <div className="bg-[#FFFFFF] dark:bg-[#17211B] p-6 rounded-3xl border border-[#D5DED8] dark:border-[#304036] space-y-3 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 flex items-center justify-center text-teal-700 dark:text-teal-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-[#17231C] dark:text-[#F1F6F2]">Deterministic Scoring</h3>
            <p className="text-xs text-[#526158] dark:text-[#C1CEC5] leading-relaxed">
              Weighted scoring normalized from 0–100%. Generates skill proficiency levels, strengths, and improvement areas.
            </p>
          </div>
        </div>

        {/* Latest Completed Result Card if present */}
        {latestResult && (
          <div className="bg-[#FFFFFF] dark:bg-[#17211B] p-6 rounded-3xl border border-[#D5DED8] dark:border-[#304036] space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#D5DED8] dark:border-[#304036] pb-3">
              <span className="text-xs uppercase tracking-wider text-[#2F7D4A] dark:text-[#7BC894] font-bold flex items-center gap-2">
                <Award className="w-4 h-4" /> LATEST ASSESSMENT RESULT
              </span>
              <span className="text-xs text-[#526158] dark:text-[#98A99E]">
                Submitted: {new Date(latestResult.submitted_at).toLocaleDateString()}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="text-2xl font-black text-[#2F7D4A] dark:text-[#7BC894]">{latestResult.overall_score}%</div>
                <div className="text-xs text-[#526158] dark:text-[#C1CEC5] font-medium mt-0.5">{latestResult.career_role?.name}</div>
              </div>

              <Link
                href={`/student/assessments/${latestResult.attempt_id}/result`}
                className="px-5 py-2.5 rounded-2xl bg-[#EEF4EF] dark:bg-[#223128] hover:bg-[#D5DED8] dark:hover:bg-[#304036] text-[#17231C] dark:text-[#F1F6F2] text-xs font-bold transition-colors"
              >
                View Complete Results Breakdown →
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
