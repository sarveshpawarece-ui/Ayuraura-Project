"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { BarChart3, TrendingUp, AlertTriangle, Users, Award, Briefcase, BookOpen, Layers } from "lucide-react";
import { api } from "@/lib/api";

export default function InstitutionAnalyticsPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("30d");

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const res = await api.get("/institution/analytics", { params: { period } });
        setAnalytics(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, [period]);

  const data = analytics || {
    total_students: 45,
    assessed_students_pct: 71.1,
    average_skill_score: 74.5,
    pipeline_funnel: { applied: 28, shortlisted: 14, interview: 8, offered: 4, accepted: 3 },
    common_skill_gaps: [
      { skill_name: "Dravya Guna Standardization", affected_students: 14, severity: "HIGH" },
      { skill_name: "Ayurvedic Clinical Trials Protocol", affected_students: 11, severity: "HIGH" },
      { skill_name: "GMP Compliance & Quality Control", affected_students: 9, severity: "MEDIUM" }
    ],
    career_distribution: [
      { career_title: "Ayurvedic Clinical Researcher", student_count: 18, percentage: 40.0 },
      { career_title: "Formulation Scientist", student_count: 14, percentage: 31.1 },
      { career_title: "Ayush Medical Officer", student_count: 13, percentage: 28.9 }
    ],
    demand_vs_supply: [
      { skill_name: "Dravya Guna Standardization", industry_demand_count: 8, student_proficient_pct: 52.0 },
      { skill_name: "Clinical Trials Protocol", industry_demand_count: 6, student_proficient_pct: 45.0 },
      { skill_name: "GMP Compliance", industry_demand_count: 5, student_proficient_pct: 68.0 }
    ]
  };

  return (
    <div className="min-h-screen bg-[#F7F9F4] dark:bg-[#0D1511] text-[#17231C] dark:text-[#F1F6F2] font-sans flex flex-col transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] p-6 rounded-2xl shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DCEBE1] dark:bg-[#294637] text-[#2F6B4F] dark:text-[#78B895] border border-[#2F6B4F]/20 text-xs font-semibold uppercase tracking-wider mb-2">
              <BarChart3 className="w-3.5 h-3.5" /> Institutional Analytics & Skill Intelligence
            </div>
            <h1 className="text-2xl font-extrabold text-[#142019] dark:text-white">Institutional Analytics</h1>
            <p className="text-xs text-[#526158] dark:text-[#C1CEC5] mt-1">
              Analyze batch skill development, placement funnel conversion, career interests, and industry demand vs supply.
            </p>
          </div>

          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="bg-[#EEF4EF] dark:bg-[#223128] border border-[#D5DED8] dark:border-[#304036] rounded-xl px-3 py-2 text-xs text-[#17231C] dark:text-[#F1F6F2] focus:outline-none focus:border-[#2F6B4F] dark:focus:border-[#78B895]"
          >
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last Quarter</option>
            <option value="1y">Academic Year</option>
          </select>
        </div>

        {/* Pipeline Conversion Funnel */}
        <div className="bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] p-6 rounded-2xl shadow-xs space-y-6">
          <h2 className="text-lg font-bold text-[#142019] dark:text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#2F6B4F] dark:text-[#78B895]" /> Placement Conversion Funnel
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-center">
            <div className="p-4 rounded-xl bg-[#EEF4EF] dark:bg-[#223128] border border-[#D5DED8] dark:border-[#304036]">
              <div className="text-[10px] text-[#68776D] dark:text-[#98A99E] font-semibold uppercase">Applied</div>
              <div className="text-xl font-extrabold text-[#17231C] dark:text-[#F1F6F2] font-mono mt-1">{data.pipeline_funnel?.applied || 0}</div>
            </div>
            <div className="p-4 rounded-xl bg-[#EEF4EF] dark:bg-[#223128] border border-[#D5DED8] dark:border-[#304036]">
              <div className="text-[10px] text-[#68776D] dark:text-[#98A99E] font-semibold uppercase">Shortlisted</div>
              <div className="text-xl font-extrabold text-[#356F9D] dark:text-[#80B5DD] font-mono mt-1">{data.pipeline_funnel?.shortlisted || 0}</div>
            </div>
            <div className="p-4 rounded-xl bg-[#EEF4EF] dark:bg-[#223128] border border-[#D5DED8] dark:border-[#304036]">
              <div className="text-[10px] text-[#68776D] dark:text-[#98A99E] font-semibold uppercase">Interview</div>
              <div className="text-xl font-extrabold text-[#A96F16] dark:text-[#E5B85C] font-mono mt-1">{data.pipeline_funnel?.interview || 0}</div>
            </div>
            <div className="p-4 rounded-xl bg-[#EEF4EF] dark:bg-[#223128] border border-[#D5DED8] dark:border-[#304036]">
              <div className="text-[10px] text-[#68776D] dark:text-[#98A99E] font-semibold uppercase">Offered</div>
              <div className="text-xl font-extrabold text-[#2F7D4A] dark:text-[#7BC894] font-mono mt-1">{data.pipeline_funnel?.offered || 0}</div>
            </div>
            <div className="p-4 rounded-xl bg-[#EEF4EF] dark:bg-[#223128] border border-[#D5DED8] dark:border-[#304036] col-span-2 sm:col-span-1">
              <div className="text-[10px] text-[#68776D] dark:text-[#98A99E] font-semibold uppercase">Accepted</div>
              <div className="text-xl font-extrabold text-[#2F6B4F] dark:text-[#78B895] font-mono mt-1">{data.pipeline_funnel?.accepted || 0}</div>
            </div>
          </div>
        </div>

        {/* Common Skill Gaps & Industry Demand vs Supply */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Common Missing Skills */}
          <div className="bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] p-6 rounded-2xl shadow-xs space-y-6">
            <h2 className="text-lg font-bold text-[#142019] dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-[#A96F16] dark:text-[#E5B85C]" /> Common Institution Skill Gaps
            </h2>

            <div className="space-y-4">
              {data.common_skill_gaps?.map((gap: any, idx: number) => (
                <div key={idx} className="p-4 rounded-xl bg-[#EEF4EF] dark:bg-[#223128] border border-[#D5DED8] dark:border-[#304036] flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-[#17231C] dark:text-[#F1F6F2]">{gap.skill_name}</div>
                    <div className="text-[10px] text-[#68776D] dark:text-[#98A99E] mt-0.5">Affected Students: {gap.affected_students}</div>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase border ${
                    gap.severity === "HIGH" ? "bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 border-red-300 dark:border-red-800" : "bg-amber-50 dark:bg-amber-950/50 text-[#A96F16] dark:text-[#E5B85C] border-amber-300 dark:border-amber-700/50"
                  }`}>
                    {gap.severity}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Industry Demand vs Supply */}
          <div className="bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] p-6 rounded-2xl shadow-xs space-y-6">
            <h2 className="text-lg font-bold text-[#142019] dark:text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#2F6B4F] dark:text-[#78B895]" /> Skill Demand vs Student Supply
            </h2>

            <div className="space-y-4">
              {data.demand_vs_supply?.map((item: any, idx: number) => (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-[#17231C] dark:text-[#F1F6F2]">{item.skill_name}</span>
                    <span className="text-[#2F6B4F] dark:text-[#78B895] font-mono">{item.student_proficient_pct}% Proficient</span>
                  </div>
                  <div className="w-full bg-[#EEF4EF] dark:bg-[#223128] h-2.5 rounded-full overflow-hidden border border-[#D5DED8] dark:border-[#304036]">
                    <div
                      className="bg-[#2F6B4F] dark:bg-[#78B895] h-full rounded-full"
                      style={{ width: `${item.student_proficient_pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
