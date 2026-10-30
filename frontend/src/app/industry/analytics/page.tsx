'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import {
  TrendingUp,
  ArrowLeft,
  Users,
  Briefcase,
  Award,
  CheckCircle2,
  BarChart3,
  PieChart,
  Filter,
  AlertCircle
} from 'lucide-react';

interface IndustryAnalytics {
  period: string;
  total_opportunities: number;
  published_opportunities: number;
  total_applications: number;
  pipeline_funnel: {
    applied: number;
    shortlisted: number;
    interview: number;
    offered: number;
    accepted: number;
  };
  interview_conversion_rate: number;
  offer_conversion_rate: number;
  match_score_distribution: {
    [key: string]: number;
  };
  top_skill_demands: { skill_name: string; count: number }[];
}

export default function IndustryAnalyticsPage() {
  const router = useRouter();
  const [analytics, setAnalytics] = useState<IndustryAnalytics | null>(null);
  const [period, setPeriod] = useState<string>('30d');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/industry/analytics?period=${period}`);
      setAnalytics(res.data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        router.push('/login');
        return;
      }
      setError(err.response?.data?.detail || err.message || 'Error loading analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F9F4] dark:bg-[#0D1511] text-[#17231C] dark:text-[#F1F6F2] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#2F6B4F] dark:border-[#78B895] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="min-h-screen bg-[#F7F9F4] dark:bg-[#0D1511] text-[#17231C] dark:text-[#F1F6F2] p-8">
        <div className="max-w-2xl mx-auto bg-[#FFFFFF] dark:bg-[#17211B] rounded-2xl p-8 border border-[#B64040]/30 text-center shadow-xs">
          <AlertCircle className="w-12 h-12 text-[#B64040] dark:text-[#F18484] mx-auto mb-3" />
          <h3 className="text-xl font-bold text-[#142019] dark:text-[#FFFFFF] mb-2">Error Loading Analytics</h3>
          <p className="text-[#526158] dark:text-[#C1CEC5] text-sm mb-4">{error}</p>
          <Link href="/industry/dashboard" className="text-[#2F6B4F] dark:text-[#78B895] font-semibold hover:underline text-sm">
            &larr; Return to Industry Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const funnel = analytics.pipeline_funnel;
  const matchDist = analytics.match_score_distribution;

  return (
    <div className="min-h-screen bg-[#F7F9F4] dark:bg-[#0D1511] text-[#17231C] dark:text-[#F1F6F2] font-sans transition-colors duration-200 p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div>
          <Link
            href="/industry/dashboard"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#526158] dark:text-[#98A99E] hover:text-[#2F6B4F] dark:hover:text-[#78B895] mb-4 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#FFFFFF] dark:bg-[#17211B] p-6 rounded-2xl border border-[#D5DED8] dark:border-[#304036] shadow-xs">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#142019] dark:text-[#FFFFFF] flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-[#2F6B4F] dark:text-[#78B895]" /> Industry Hiring Analytics
              </h1>
              <p className="text-[#526158] dark:text-[#98A99E] text-sm mt-1">
                Monitor recruitment funnel conversion rates, match quality distribution, and skill demand metrics.
              </p>
            </div>

            {/* Time Period Filter */}
            <div className="flex items-center gap-2 bg-[#EEF4EF] dark:bg-[#223128] p-1.5 rounded-xl border border-[#D5DED8] dark:border-[#304036]">
              {['7d', '30d', '90d', 'all_time'].map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
                    period === p ? 'bg-[#2F6B4F] dark:bg-[#78B895] text-white dark:text-[#0D1511] shadow-xs' : 'text-[#526158] dark:text-[#98A99E] hover:text-[#17231C] dark:hover:text-[#F1F6F2]'
                  }`}
                >
                  {p === 'all_time' ? 'All Time' : p.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Top Metric Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-[#FFFFFF] dark:bg-[#17211B] p-6 rounded-2xl border border-[#D5DED8] dark:border-[#304036] shadow-xs space-y-1">
            <span className="text-[#68776D] dark:text-[#98A99E] text-xs font-semibold uppercase">Total Candidates</span>
            <p className="text-3xl font-black text-[#142019] dark:text-[#FFFFFF]">{analytics.total_applications}</p>
            <p className="text-xs text-[#526158] dark:text-[#98A99E]">Total applications received</p>
          </div>

          <div className="bg-[#FFFFFF] dark:bg-[#17211B] p-6 rounded-2xl border border-[#D5DED8] dark:border-[#304036] shadow-xs space-y-1">
            <span className="text-[#68776D] dark:text-[#98A99E] text-xs font-semibold uppercase">Interview Conversion</span>
            <p className="text-3xl font-black text-[#356F9D] dark:text-[#80B5DD]">{analytics.interview_conversion_rate}%</p>
            <p className="text-xs text-[#526158] dark:text-[#98A99E]">Applied &rarr; Interview Stage</p>
          </div>

          <div className="bg-[#FFFFFF] dark:bg-[#17211B] p-6 rounded-2xl border border-[#D5DED8] dark:border-[#304036] shadow-xs space-y-1">
            <span className="text-[#68776D] dark:text-[#98A99E] text-xs font-semibold uppercase">Offer Conversion</span>
            <p className="text-3xl font-black text-[#2F7D4A] dark:text-[#7BC894]">{analytics.offer_conversion_rate}%</p>
            <p className="text-xs text-[#526158] dark:text-[#98A99E]">Applied &rarr; Offer Extended</p>
          </div>

          <div className="bg-[#FFFFFF] dark:bg-[#17211B] p-6 rounded-2xl border border-[#D5DED8] dark:border-[#304036] shadow-xs space-y-1">
            <span className="text-[#68776D] dark:text-[#98A99E] text-xs font-semibold uppercase">Published Roles</span>
            <p className="text-3xl font-black text-[#2F6B4F] dark:text-[#78B895]">{analytics.published_opportunities}</p>
            <p className="text-xs text-[#526158] dark:text-[#98A99E]">Out of {analytics.total_opportunities} total postings</p>
          </div>
        </div>

        {/* Pipeline Funnel & Match Score Distribution */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Pipeline Conversion Funnel */}
          <div className="bg-[#FFFFFF] dark:bg-[#17211B] rounded-2xl border border-[#D5DED8] dark:border-[#304036] p-6 space-y-6 shadow-xs">
            <h3 className="text-lg font-bold text-[#142019] dark:text-[#FFFFFF] flex items-center gap-2 border-b border-[#D5DED8] dark:border-[#304036] pb-3">
              <BarChart3 className="w-5 h-5 text-[#2F6B4F] dark:text-[#78B895]" /> Pipeline Conversion Funnel
            </h3>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-[#526158] dark:text-[#C1CEC5]">1. Total Applications</span>
                  <span className="text-[#142019] dark:text-[#FFFFFF] font-bold">{funnel.applied}</span>
                </div>
                <div className="w-full bg-[#EEF4EF] dark:bg-[#223128] rounded-full h-3">
                  <div className="bg-[#356F9D] dark:bg-[#80B5DD] h-3 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-[#526158] dark:text-[#C1CEC5]">2. Shortlisted Candidates</span>
                  <span className="text-[#2F6B4F] dark:text-[#78B895] font-bold">{funnel.shortlisted}</span>
                </div>
                <div className="w-full bg-[#EEF4EF] dark:bg-[#223128] rounded-full h-3">
                  <div
                    className="bg-[#2F6B4F] dark:bg-[#78B895] h-3 rounded-full"
                    style={{ width: `${funnel.applied > 0 ? (funnel.shortlisted / funnel.applied) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-[#526158] dark:text-[#C1CEC5]">3. Interview Stage</span>
                  <span className="text-[#356F9D] dark:text-[#80B5DD] font-bold">{funnel.interview}</span>
                </div>
                <div className="w-full bg-[#EEF4EF] dark:bg-[#223128] rounded-full h-3">
                  <div
                    className="bg-[#356F9D] dark:bg-[#80B5DD] h-3 rounded-full"
                    style={{ width: `${funnel.applied > 0 ? (funnel.interview / funnel.applied) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-[#526158] dark:text-[#C1CEC5]">4. Offered Candidates</span>
                  <span className="text-[#2F7D4A] dark:text-[#7BC894] font-bold">{funnel.offered}</span>
                </div>
                <div className="w-full bg-[#EEF4EF] dark:bg-[#223128] rounded-full h-3">
                  <div
                    className="bg-[#2F7D4A] dark:bg-[#7BC894] h-3 rounded-full"
                    style={{ width: `${funnel.applied > 0 ? (funnel.offered / funnel.applied) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-[#526158] dark:text-[#C1CEC5]">5. Accepted Candidates</span>
                  <span className="text-[#2F6B4F] dark:text-[#78B895] font-bold">{funnel.accepted}</span>
                </div>
                <div className="w-full bg-[#EEF4EF] dark:bg-[#223128] rounded-full h-3">
                  <div
                    className="bg-[#2F6B4F] dark:bg-[#78B895] h-3 rounded-full"
                    style={{ width: `${funnel.applied > 0 ? (funnel.accepted / funnel.applied) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Match Score Distribution */}
          <div className="bg-[#FFFFFF] dark:bg-[#17211B] rounded-2xl border border-[#D5DED8] dark:border-[#304036] p-6 space-y-6 shadow-xs">
            <h3 className="text-lg font-bold text-[#142019] dark:text-[#FFFFFF] flex items-center gap-2 border-b border-[#D5DED8] dark:border-[#304036] pb-3">
              <PieChart className="w-5 h-5 text-[#356F9D] dark:text-[#80B5DD]" /> Candidate Match Score Distribution
            </h3>

            <div className="space-y-4">
              {Object.entries(matchDist).map(([bucket, count]) => {
                const total = analytics.total_applications || 1;
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={bucket} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-[#526158] dark:text-[#C1CEC5]">Match Range: {bucket}</span>
                      <span className="text-[#142019] dark:text-[#FFFFFF] font-bold">{count} candidates ({pct}%)</span>
                    </div>
                    <div className="w-full bg-[#EEF4EF] dark:bg-[#223128] rounded-full h-3">
                      <div
                        className={`h-3 rounded-full ${
                          bucket.includes('90')
                            ? 'bg-[#2F7D4A] dark:bg-[#7BC894]'
                            : bucket.includes('75')
                            ? 'bg-[#2F6B4F] dark:bg-[#78B895]'
                            : bucket.includes('60')
                            ? 'bg-[#A96F16] dark:bg-[#E5B85C]'
                            : 'bg-[#B64040] dark:bg-[#F18484]'
                        }`}
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Top Demanded Skills Chart */}
        <div className="bg-[#FFFFFF] dark:bg-[#17211B] rounded-2xl border border-[#D5DED8] dark:border-[#304036] p-6 space-y-4 shadow-xs">
          <h3 className="text-lg font-bold text-[#142019] dark:text-[#FFFFFF] flex items-center gap-2 border-b border-[#D5DED8] dark:border-[#304036] pb-3">
            <Award className="w-5 h-5 text-[#2F6B4F] dark:text-[#78B895]" /> Top Skill Demands in Posted Opportunities
          </h3>

          {analytics.top_skill_demands.length === 0 ? (
            <p className="text-xs text-[#68776D] dark:text-[#98A99E] italic">No skill requirements logged across opportunities.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
              {analytics.top_skill_demands.map((sk, idx) => (
                <div key={idx} className="p-4 bg-[#EEF4EF] dark:bg-[#223128] rounded-xl border border-[#D5DED8] dark:border-[#304036] text-center space-y-1">
                  <span className="font-bold text-[#142019] dark:text-[#FFFFFF] text-sm block line-clamp-1">{sk.skill_name}</span>
                  <span className="text-xs text-[#2F6B4F] dark:text-[#78B895] font-extrabold">{sk.count} Postings Require</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
