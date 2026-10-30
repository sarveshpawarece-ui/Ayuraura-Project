"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Sparkles, Target, History, ArrowRight, Award, CheckCircle2, Clock } from "lucide-react";
import { api } from "@/lib/api";

export default function AssessmentHistoryPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      try {
        setLoading(true);
        const res = await api.get("/assessments/history");
        setHistory(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, []);

  return (
    <div className="min-h-screen bg-[#F7F9F4] dark:bg-[#0D1511] text-[#17231C] dark:text-[#F1F6F2] flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="bg-[#FFFFFF] dark:bg-[#17211B] p-6 rounded-3xl border border-[#D5DED8] dark:border-[#304036] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DCEBE1] dark:bg-[#294637] text-[#2F6B4F] dark:text-[#78B895] text-xs font-semibold uppercase tracking-wider mb-2 border border-[#B9C8BE] dark:border-[#425449]">
              <History className="w-3.5 h-3.5" /> Assessment Logs
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#17231C] dark:text-[#F1F6F2]">Assessment History</h1>
            <p className="text-xs text-[#526158] dark:text-[#C1CEC5] mt-1">
              Review all historical diagnostic skill assessment attempts.
            </p>
          </div>

          <Link
            href="/student/assessments"
            className="px-5 py-2.5 rounded-2xl bg-[#2F6B4F] hover:bg-[#24563F] dark:bg-[#78B895] dark:hover:bg-[#91CAA8] text-white dark:text-[#0D1511] font-bold text-xs flex items-center gap-2 shadow-xs transition-all shrink-0"
          >
            New Assessment <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* History List */}
        {loading ? (
          <div className="p-12 text-center text-xs text-[#526158] dark:text-[#C1CEC5] bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] rounded-3xl shadow-xs">
            Loading assessment history...
          </div>
        ) : history.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#526158] dark:text-[#C1CEC5] bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] rounded-3xl space-y-3 shadow-xs">
            <div>No previous assessment attempts found.</div>
            <Link
              href="/student/assessments"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#2F6B4F] hover:bg-[#24563F] dark:bg-[#78B895] dark:hover:bg-[#91CAA8] text-white dark:text-[#0D1511] font-bold text-xs"
            >
              Start First Assessment →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((att: any) => (
              <div
                key={att.attempt_id}
                className="bg-[#FFFFFF] dark:bg-[#17211B] p-5 rounded-3xl border border-[#D5DED8] dark:border-[#304036] hover:border-[#2F6B4F] dark:hover:border-[#78B895] shadow-xs transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#17231C] dark:text-[#F1F6F2] text-sm">{att.career_role?.name}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold ${
                      att.status === "SUBMITTED"
                        ? "bg-[#DCEBE1] text-[#2F6B4F] border border-[#B9C8BE] dark:bg-[#294637] dark:text-[#78B895] dark:border-[#425449]"
                        : "bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800"
                    }`}>
                      {att.status}
                    </span>
                  </div>

                  <div className="text-[#526158] dark:text-[#98A99E] text-[11px] flex items-center gap-3">
                    <span>Started: {new Date(att.started_at).toLocaleDateString()}</span>
                    {att.submitted_at && <span>Submitted: {new Date(att.submitted_at).toLocaleDateString()}</span>}
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                  {att.overall_score !== null && att.overall_score !== undefined ? (
                    <div className="text-right">
                      <div className="text-lg font-black text-[#2F7D4A] dark:text-[#7BC894]">{att.overall_score}%</div>
                      <div className="text-[10px] text-[#526158] dark:text-[#98A99E]">Score</div>
                    </div>
                  ) : (
                    <span className="text-xs text-[#A96F16] dark:text-[#E5B85C] italic font-semibold">In Progress</span>
                  )}

                  {att.status === "SUBMITTED" ? (
                    <Link
                      href={`/student/assessments/${att.attempt_id}/result`}
                      className="px-4 py-2 rounded-2xl bg-[#EEF4EF] dark:bg-[#223128] border border-[#D5DED8] dark:border-[#304036] hover:bg-[#D5DED8] dark:hover:bg-[#304036] text-[#17231C] dark:text-[#F1F6F2] font-bold transition-colors"
                    >
                      View Result →
                    </Link>
                  ) : (
                    <Link
                      href={`/student/assessments/${att.attempt_id}`}
                      className="px-4 py-2 rounded-2xl bg-[#2F6B4F] hover:bg-[#24563F] dark:bg-[#78B895] dark:hover:bg-[#91CAA8] text-white dark:text-[#0D1511] font-bold transition-all shadow-xs"
                    >
                      Resume →
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
