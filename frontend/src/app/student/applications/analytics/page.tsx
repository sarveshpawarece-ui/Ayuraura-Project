"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { api } from "@/lib/api";
import {
  ArrowLeft,
  BarChart3,
  PieChart,
  TrendingUp,
  Award,
  Sparkles,
  Briefcase,
  CheckCircle2,
  Percent,
  Layers,
  Target
} from "lucide-react";

export default function ApplicationAnalyticsPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const res = await api.get("/students/me/applications/analytics");
        setAnalytics(res.data);
      } catch (err) {
        console.error("Failed to load analytics:", err);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F9F4] dark:bg-[#0D1511] text-[#17231C] dark:text-[#F1F6F2] flex flex-col font-sans transition-colors duration-200">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="inline-block w-8 h-8 border-4 border-[#2F6B4F] dark:border-[#78B895] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  const pipeline = analytics?.pipeline_conversion || {};
  const statusDist = analytics?.status_breakdown || {};
  const typeDist = analytics?.type_breakdown || {};
  const avgMatch = analytics?.average_match_score || 0;

  return (
    <div className="min-h-screen bg-[#F7F9F4] dark:bg-[#0D1511] text-[#17231C] dark:text-[#F1F6F2] flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Header */}
        <div className="space-y-3">
          <Link href="/student/applications" className="inline-flex items-center gap-2 text-[#526158] dark:text-[#C1CEC5] hover:text-[#2F6B4F] dark:hover:text-[#78B895] text-xs font-semibold transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to My Applications
          </Link>

          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-[#DCEBE1] dark:bg-[#294637] text-[#2F6B4F] dark:text-[#78B895] border border-[#B9C8BE] dark:border-[#425449]">
              <BarChart3 className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-3xl font-bold text-[#17231C] dark:text-[#F1F6F2] tracking-tight">Application Analytics</h1>
              <p className="text-[#526158] dark:text-[#C1CEC5] text-xs">
                Pipeline conversion metrics, match score distribution, and application funnel insights.
              </p>
            </div>
          </div>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <div className="p-6 rounded-3xl bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] space-y-2 shadow-xs">
            <div className="flex items-center justify-between text-[#526158] dark:text-[#98A99E] text-xs">
              <span>Total Tracked</span>
              <Layers className="w-4 h-4 text-[#2F6B4F] dark:text-[#78B895]" />
            </div>
            <p className="text-3xl font-bold text-[#17231C] dark:text-[#F1F6F2]">{analytics?.total_tracked || 0}</p>
            <p className="text-[11px] text-[#68776D] dark:text-[#98A99E]">Saved + Applied opportunities</p>
          </div>

          <div className="p-6 rounded-3xl bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] space-y-2 shadow-xs">
            <div className="flex items-center justify-between text-[#526158] dark:text-[#98A99E] text-xs">
              <span>Interview Rate</span>
              <Percent className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <p className="text-3xl font-bold text-purple-700 dark:text-purple-400">{pipeline.interview_rate || 0}%</p>
            <p className="text-[11px] text-[#68776D] dark:text-[#98A99E]">Applied opportunities reaching interview</p>
          </div>

          <div className="p-6 rounded-3xl bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] space-y-2 shadow-xs">
            <div className="flex items-center justify-between text-[#526158] dark:text-[#98A99E] text-xs">
              <span>Offer Success Rate</span>
              <Award className="w-4 h-4 text-[#2F7D4A] dark:text-[#7BC894]" />
            </div>
            <p className="text-3xl font-bold text-[#2F7D4A] dark:text-[#7BC894]">{pipeline.offer_conversion_rate || 0}%</p>
            <p className="text-[11px] text-[#68776D] dark:text-[#98A99E]">Applied opportunities resulting in offer</p>
          </div>

          <div className="p-6 rounded-3xl bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] space-y-2 shadow-xs">
            <div className="flex items-center justify-between text-[#526158] dark:text-[#98A99E] text-xs">
              <span>Avg Match Score</span>
              <Target className="w-4 h-4 text-[#A96F16] dark:text-[#E5B85C]" />
            </div>
            <p className="text-3xl font-bold text-[#A96F16] dark:text-[#E5B85C]">{avgMatch}%</p>
            <p className="text-[11px] text-[#68776D] dark:text-[#98A99E]">Average match across applied roles</p>
          </div>
        </div>

        {/* Funnel & Conversion Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#FFFFFF] dark:bg-[#17211B] rounded-3xl p-6 sm:p-8 border border-[#D5DED8] dark:border-[#304036] space-y-6 shadow-xs">
            <h3 className="text-lg font-bold text-[#17231C] dark:text-[#F1F6F2] flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#2F6B4F] dark:text-[#78B895]" /> Application Pipeline Funnel
            </h3>

            <div className="space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-[#526158] dark:text-[#C1CEC5]">Submitted Applications</span>
                  <span className="text-[#2F6B4F] dark:text-[#78B895] font-mono">{pipeline.total_submitted || 0}</span>
                </div>
                <div className="w-full bg-[#EEF4EF] dark:bg-[#223128] h-3 rounded-full overflow-hidden border border-[#D5DED8] dark:border-[#304036]">
                  <div className="bg-[#2F6B4F] dark:bg-[#78B895] h-full rounded-full w-full"></div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-[#526158] dark:text-[#C1CEC5]">Active Pipeline (In Review / Interview)</span>
                  <span className="text-purple-600 dark:text-purple-400 font-mono">{pipeline.active_pipeline || 0}</span>
                </div>
                <div className="w-full bg-[#EEF4EF] dark:bg-[#223128] h-3 rounded-full overflow-hidden border border-[#D5DED8] dark:border-[#304036]">
                  <div
                    className="bg-purple-600 dark:bg-purple-500 h-full rounded-full"
                    style={{ width: `${pipeline.total_submitted ? Math.min(100, (pipeline.active_pipeline / pipeline.total_submitted) * 100) : 0}%` }}
                  ></div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-[#526158] dark:text-[#C1CEC5]">Offers & Acceptance</span>
                  <span className="text-[#2F7D4A] dark:text-[#7BC894] font-mono">{pipeline.total_offers || 0}</span>
                </div>
                <div className="w-full bg-[#EEF4EF] dark:bg-[#223128] h-3 rounded-full overflow-hidden border border-[#D5DED8] dark:border-[#304036]">
                  <div
                    className="bg-[#2F7D4A] dark:bg-[#7BC894] h-full rounded-full"
                    style={{ width: `${pipeline.total_submitted ? Math.min(100, (pipeline.total_offers / pipeline.total_submitted) * 100) : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#FFFFFF] dark:bg-[#17211B] rounded-3xl p-6 sm:p-8 border border-[#D5DED8] dark:border-[#304036] space-y-6 shadow-xs">
            <h3 className="text-lg font-bold text-[#17231C] dark:text-[#F1F6F2] flex items-center gap-2">
              <PieChart className="w-5 h-5 text-[#2F6B4F] dark:text-[#78B895]" /> Status Distribution
            </h3>

            <div className="space-y-3 divide-y divide-[#D5DED8] dark:divide-[#304036]">
              {Object.entries(statusDist).map(([st, count]: any) => (
                <div key={st} className="pt-2 flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#526158] dark:text-[#C1CEC5] uppercase">{st.replace("_", " ")}</span>
                  <span className="font-mono font-bold text-[#17231C] dark:text-[#F1F6F2] px-3 py-1 rounded-full bg-[#EEF4EF] dark:bg-[#223128] border border-[#D5DED8] dark:border-[#304036]">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
