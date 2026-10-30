'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { api } from '@/lib/api';
import {
  Briefcase,
  ArrowLeft,
  Calendar,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Play,
  Pause,
  XCircle,
  Edit3,
  Award,
  Users
} from 'lucide-react';

interface OpportunityDetail {
  id: string;
  title: string;
  description: string;
  responsibilities?: string;
  requirements?: string;
  opportunity_type: string;
  work_mode: string;
  employment_type: string;
  experience_level: string;
  location_text?: string;
  application_deadline?: string;
  salary_min?: number;
  salary_max?: number;
  salary_currency: string;
  status: string;
  created_at?: string;
  applicant_count: number;
  required_skills: any[];
}

export default function OpportunityDetailPage() {
  const router = useRouter();
  const params = useParams();
  const oppId = params.id as string;

  const [opp, setOpp] = useState<OpportunityDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (oppId) fetchOpportunity();
  }, [oppId]);

  const fetchOpportunity = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/industry/opportunities/${oppId}`);
      setOpp(res.data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        router.push('/login');
        return;
      }
      setError(err.response?.data?.detail || err.message || 'Error loading details');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusAction = async (action: 'publish' | 'pause' | 'resume' | 'close') => {
    try {
      setError(null);
      const res = await api.post(`/industry/opportunities/${oppId}/${action}`);
      setOpp(res.data);
      setSuccessMsg(`Status updated to ${action.toUpperCase()}`);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || `Failed to ${action}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F9F4] dark:bg-[#0D1511] text-[#17231C] dark:text-[#F1F6F2] font-sans flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#2F6B4F] dark:border-[#78B895] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !opp) {
    return (
      <div className="min-h-screen bg-[#F7F9F4] dark:bg-[#0D1511] text-[#17231C] dark:text-[#F1F6F2] font-sans p-8">
        <div className="max-w-2xl mx-auto bg-[#FFFFFF] dark:bg-[#17211B] rounded-2xl p-8 border border-red-300 dark:border-red-900 text-center shadow-xs">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h3 className="text-xl font-bold text-[#142019] dark:text-white mb-2">Error Loading Opportunity</h3>
          <p className="text-[#526158] dark:text-[#C1CEC5] text-sm mb-4">{error}</p>
          <Link href="/industry/opportunities" className="text-[#2F6B4F] dark:text-[#78B895] font-medium hover:underline text-sm">
            &larr; Return to Opportunities List
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F9F4] dark:bg-[#0D1511] text-[#17231C] dark:text-[#F1F6F2] font-sans p-6 md:p-10 transition-colors duration-200">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div>
          <Link
            href="/industry/opportunities"
            className="inline-flex items-center gap-2 text-sm text-[#526158] hover:text-[#2F6B4F] dark:text-[#C1CEC5] dark:hover:text-[#78B895] mb-4 transition font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Opportunities List
          </Link>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#FFFFFF] dark:bg-[#17211B] p-6 rounded-2xl border border-[#D5DED8] dark:border-[#304036] shadow-xs">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-bold text-[#142019] dark:text-white">{opp.title}</h1>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${
                  opp.status === 'PUBLISHED' || opp.status === 'ACTIVE'
                    ? 'bg-[#DCEBE1] dark:bg-[#294637] text-[#2F7D4A] dark:text-[#7BC894] border-[#2F7D4A]/30'
                    : opp.status === 'DRAFT'
                    ? 'bg-amber-100 dark:bg-amber-950/50 text-[#A96F16] dark:text-[#E5B85C] border-amber-300 dark:border-amber-700/50'
                    : opp.status === 'PAUSED'
                    ? 'bg-blue-50 dark:bg-blue-950/50 text-[#356F9D] dark:text-[#80B5DD] border-blue-200 dark:border-blue-800'
                    : 'bg-[#EEF4EF] dark:bg-[#223128] text-[#68776D] dark:text-[#98A99E] border-[#D5DED8] dark:border-[#304036]'
                }`}>
                  {opp.status}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-[#526158] dark:text-[#C1CEC5] mt-2">
                <span>Type: <strong className="text-[#17231C] dark:text-[#F1F6F2]">{opp.opportunity_type}</strong></span>
                <span>&bull;</span>
                <span>Mode: <strong className="text-[#17231C] dark:text-[#F1F6F2]">{opp.work_mode}</strong></span>
                <span>&bull;</span>
                <span>Employment: <strong className="text-[#17231C] dark:text-[#F1F6F2]">{opp.employment_type}</strong></span>
              </div>
            </div>

            {/* Lifecycle CTA Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {(opp.status === 'DRAFT' || opp.status === 'PAUSED') && (
                <button
                  onClick={() => handleStatusAction(opp.status === 'PAUSED' ? 'resume' : 'publish')}
                  className="px-5 py-2.5 bg-[#2F6B4F] hover:bg-[#24563F] dark:bg-[#78B895] dark:hover:bg-[#91CAA8] text-white dark:text-[#0D1511] font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 transition"
                >
                  <Play className="w-4 h-4" /> {opp.status === 'PAUSED' ? 'Resume' : 'Publish'}
                </button>
              )}

              {(opp.status === 'PUBLISHED' || opp.status === 'ACTIVE') && (
                <button
                  onClick={() => handleStatusAction('pause')}
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 transition"
                >
                  <Pause className="w-4 h-4" /> Pause
                </button>
              )}

              {opp.status !== 'CLOSED' && (
                <button
                  onClick={() => handleStatusAction('close')}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 transition"
                >
                  <XCircle className="w-4 h-4" /> Close
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Notifications */}
        {successMsg && (
          <div className="p-4 bg-[#DCEBE1] dark:bg-[#294637] border border-[#2F7D4A]/30 rounded-xl text-[#2F7D4A] dark:text-[#7BC894] flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-900 rounded-xl text-red-700 dark:text-red-300 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Detail Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-[#FFFFFF] dark:bg-[#17211B] rounded-2xl border border-[#D5DED8] dark:border-[#304036] p-6 shadow-xs space-y-4">
              <h3 className="text-lg font-bold text-[#142019] dark:text-white border-b border-[#D5DED8] dark:border-[#304036] pb-3">Job Description</h3>
              <p className="text-[#526158] dark:text-[#C1CEC5] text-sm leading-relaxed whitespace-pre-line">{opp.description}</p>
            </div>

            {opp.responsibilities && (
              <div className="bg-[#FFFFFF] dark:bg-[#17211B] rounded-2xl border border-[#D5DED8] dark:border-[#304036] p-6 shadow-xs space-y-4">
                <h3 className="text-lg font-bold text-[#142019] dark:text-white border-b border-[#D5DED8] dark:border-[#304036] pb-3">Key Responsibilities</h3>
                <p className="text-[#526158] dark:text-[#C1CEC5] text-sm leading-relaxed whitespace-pre-line">{opp.responsibilities}</p>
              </div>
            )}

            {/* Benchmark Required Skills */}
            <div className="bg-[#FFFFFF] dark:bg-[#17211B] rounded-2xl border border-[#D5DED8] dark:border-[#304036] p-6 shadow-xs space-y-4">
              <h3 className="text-lg font-bold text-[#142019] dark:text-white border-b border-[#D5DED8] dark:border-[#304036] pb-3 flex items-center gap-2">
                <Award className="w-5 h-5 text-[#2F6B4F] dark:text-[#78B895]" /> Required Benchmark Skills
              </h3>

              {opp.required_skills.length === 0 ? (
                <p className="text-[#68776D] dark:text-[#98A99E] text-sm">No specific skill requirements benchmarked.</p>
              ) : (
                <div className="space-y-3">
                  {opp.required_skills.map((req) => (
                    <div
                      key={req.id}
                      className="p-3.5 bg-[#EEF4EF] dark:bg-[#223128] rounded-xl border border-[#D5DED8] dark:border-[#304036] flex items-center justify-between"
                    >
                      <div>
                        <span className="font-semibold text-[#17231C] dark:text-[#F1F6F2] text-sm">{req.skill_name || 'Skill'}</span>
                        <span className="text-xs text-[#68776D] dark:text-[#98A99E] block">{req.skill_category || 'Technical'}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-[#2F7D4A] dark:text-[#7BC894] block">Min {req.required_score} Score</span>
                        <span className="text-[11px] text-[#2F6B4F] dark:text-[#78B895] uppercase font-medium">{req.importance} Priority</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Metrics */}
          <div className="space-y-6">
            <div className="bg-[#FFFFFF] dark:bg-[#17211B] rounded-2xl border border-[#D5DED8] dark:border-[#304036] p-6 shadow-xs space-y-4">
              <h3 className="text-lg font-bold text-[#142019] dark:text-white">Posting Summary</h3>

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between border-b border-[#D5DED8] dark:border-[#304036] pb-2">
                  <span className="text-[#526158] dark:text-[#C1CEC5]">Total Applicants</span>
                  <span className="text-[#17231C] dark:text-[#F1F6F2] font-bold text-base">{opp.applicant_count || 0}</span>
                </div>

                {opp.location_text && (
                  <div className="flex items-center justify-between border-b border-[#D5DED8] dark:border-[#304036] pb-2">
                    <span className="text-[#526158] dark:text-[#C1CEC5]">Location</span>
                    <span className="text-[#17231C] dark:text-[#F1F6F2] font-medium">{opp.location_text}</span>
                  </div>
                )}

                {opp.application_deadline && (
                  <div className="flex items-center justify-between border-b border-[#D5DED8] dark:border-[#304036] pb-2">
                    <span className="text-[#526158] dark:text-[#C1CEC5]">Deadline</span>
                    <span className="text-[#A96F16] dark:text-[#E5B85C] font-medium">{new Date(opp.application_deadline).toLocaleDateString()}</span>
                  </div>
                )}

                {opp.salary_min && (
                  <div className="flex items-center justify-between border-b border-[#D5DED8] dark:border-[#304036] pb-2">
                    <span className="text-[#526158] dark:text-[#C1CEC5]">Salary Range</span>
                    <span className="text-[#2F7D4A] dark:text-[#7BC894] font-medium">
                      ₹{opp.salary_min.toLocaleString()} - ₹{opp.salary_max ? opp.salary_max.toLocaleString() : 'N/A'}
                    </span>
                  </div>
                )}
              </div>

              <Link
                href={`/industry/applications?opportunity_id=${opp.id}`}
                className="w-full mt-4 py-2.5 bg-[#DCEBE1] dark:bg-[#294637] hover:bg-[#2F6B4F] hover:text-white dark:hover:bg-[#78B895] dark:hover:text-[#0D1511] text-[#2F6B4F] dark:text-[#78B895] font-semibold text-xs rounded-xl border border-[#2F6B4F]/30 flex items-center justify-center gap-2 transition"
              >
                <Users className="w-4 h-4" /> View Applicants for this Role
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
