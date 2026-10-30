'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import {
  Briefcase,
  PlusCircle,
  Search,
  Filter,
  Eye,
  Edit3,
  Play,
  Pause,
  XCircle,
  AlertCircle,
  ArrowLeft,
  Calendar,
  MapPin,
  CheckCircle2,
  Clock
} from 'lucide-react';

interface Opportunity {
  id: string;
  title: string;
  opportunity_type: string;
  work_mode: string;
  employment_type: string;
  status: string;
  application_deadline?: string;
  location_text?: string;
  created_at?: string;
  applicant_count: number;
  required_skills: any[];
}

export default function IndustryOpportunitiesPage() {
  const router = useRouter();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    fetchOpportunities();
  }, [activeTab]);

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      const url = activeTab !== 'ALL' ? `/industry/opportunities?status=${activeTab}` : '/industry/opportunities';
      const res = await api.get(url);
      setOpportunities(res.data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        router.push('/login');
        return;
      }
      setError(err.response?.data?.detail || err.message || 'Error loading opportunities');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusAction = async (oppId: string, action: 'publish' | 'pause' | 'resume' | 'close') => {
    try {
      setError(null);
      await api.post(`/industry/opportunities/${oppId}/${action}`);
      setSuccessMsg(`Opportunity status updated successfully to ${action.toUpperCase()}`);
      setTimeout(() => setSuccessMsg(null), 4000);
      fetchOpportunities();
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || `Failed to execute ${action}`);
    }
  };

  const filteredOpps = opportunities.filter((opp) =>
    opp.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F7F9F4] dark:bg-[#0D1511] text-[#17231C] dark:text-[#F1F6F2] font-sans p-6 md:p-10 transition-colors duration-200">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Navigation & Header */}
        <div>
          <Link
            href="/industry/dashboard"
            className="inline-flex items-center gap-2 text-sm text-[#526158] hover:text-[#2F6B4F] dark:text-[#C1CEC5] dark:hover:text-[#78B895] mb-4 transition font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#FFFFFF] dark:bg-[#17211B] p-6 rounded-2xl border border-[#D5DED8] dark:border-[#304036] shadow-xs">
            <div>
              <h1 className="text-3xl font-bold text-[#142019] dark:text-white flex items-center gap-3">
                <Briefcase className="w-8 h-8 text-[#2F6B4F] dark:text-[#78B895]" /> Opportunities Manager
              </h1>
              <p className="text-[#526158] dark:text-[#C1CEC5] text-sm mt-1">
                Create, configure skill requirements, and control the lifecycle of your hiring postings.
              </p>
            </div>

            <Link
              href="/industry/opportunities/new"
              className="px-5 py-2.5 bg-[#2F6B4F] hover:bg-[#24563F] dark:bg-[#78B895] dark:hover:bg-[#91CAA8] text-white dark:text-[#0D1511] font-bold rounded-xl shadow-xs flex items-center gap-2 transition"
            >
              <PlusCircle className="w-5 h-5" /> Post New Opportunity
            </Link>
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

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[#FFFFFF] dark:bg-[#17211B] p-4 rounded-2xl border border-[#D5DED8] dark:border-[#304036] shadow-xs">
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
            {['ALL', 'PUBLISHED', 'DRAFT', 'PAUSED', 'CLOSED'].map((status) => (
              <button
                key={status}
                onClick={() => setActiveTab(status)}
                className={`px-4 py-2 text-xs font-semibold rounded-xl transition ${
                  activeTab === status
                    ? 'bg-[#2F6B4F] dark:bg-[#78B895] text-white dark:text-[#0D1511] shadow-xs'
                    : 'bg-[#EEF4EF] dark:bg-[#223128] text-[#526158] dark:text-[#C1CEC5] hover:bg-[#D5DED8] dark:hover:bg-[#304036]'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#68776D] dark:text-[#98A99E]" />
            <input
              type="text"
              placeholder="Search opportunity title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#EEF4EF] dark:bg-[#223128] border border-[#D5DED8] dark:border-[#304036] rounded-xl pl-10 pr-4 py-2 text-sm text-[#17231C] dark:text-[#F1F6F2] placeholder-[#68776D] dark:placeholder-[#98A99E] focus:outline-none focus:border-[#2F6B4F] dark:focus:border-[#78B895]"
            />
          </div>
        </div>

        {/* Opportunity List Grid */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-4 border-[#2F6B4F] dark:border-[#78B895] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[#68776D] dark:text-[#98A99E]">Loading opportunities...</p>
          </div>
        ) : filteredOpps.length === 0 ? (
          <div className="bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] rounded-2xl p-12 text-center text-[#68776D] dark:text-[#98A99E]">
            <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-40 text-[#68776D] dark:text-[#98A99E]" />
            <p className="text-lg font-semibold text-[#17231C] dark:text-[#F1F6F2]">No opportunities found</p>
            <p className="text-sm text-[#68776D] dark:text-[#98A99E] mt-1">There are no postings matching your selected filters.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOpps.map((opp) => (
              <div
                key={opp.id}
                className="bg-[#FFFFFF] dark:bg-[#17211B] rounded-2xl border border-[#D5DED8] dark:border-[#304036] p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-[#2F6B4F]/40 dark:hover:border-[#78B895]/40 transition"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold text-[#142019] dark:text-white">{opp.title}</h3>
                    <span className={`px-3 py-0.5 text-xs font-semibold rounded-full border ${
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

                  <div className="flex flex-wrap items-center gap-4 text-xs text-[#526158] dark:text-[#C1CEC5]">
                    <span className="bg-[#EEF4EF] dark:bg-[#223128] px-2.5 py-1 rounded-md text-[#17231C] dark:text-[#F1F6F2]">{opp.opportunity_type}</span>
                    <span>&bull;</span>
                    <span>{opp.work_mode}</span>
                    <span>&bull;</span>
                    <span>{opp.employment_type}</span>
                    {opp.location_text && (
                      <>
                        <span>&bull;</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-red-500" /> {opp.location_text}</span>
                      </>
                    )}
                    {opp.application_deadline && (
                      <>
                        <span>&bull;</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-[#A96F16] dark:text-[#E5B85C]" /> Deadline: {new Date(opp.application_deadline).toLocaleDateString()}</span>
                      </>
                    )}
                  </div>

                  <div className="text-xs text-[#2F6B4F] dark:text-[#78B895] font-semibold pt-1">
                    {opp.applicant_count || 0} Submitted Applications &bull; {opp.required_skills?.length || 0} Required Skills
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/industry/opportunities/${opp.id}`}
                    className="px-4 py-2 bg-[#EEF4EF] dark:bg-[#223128] hover:bg-[#D5DED8] dark:hover:bg-[#304036] text-[#17231C] dark:text-[#F1F6F2] text-xs font-semibold rounded-xl border border-[#D5DED8] dark:border-[#304036] flex items-center gap-1.5 transition"
                  >
                    <Eye className="w-4 h-4 text-[#2F6B4F] dark:text-[#78B895]" /> View & Edit
                  </Link>

                  {(opp.status === 'DRAFT' || opp.status === 'PAUSED') && (
                    <button
                      onClick={() => handleStatusAction(opp.id, opp.status === 'PAUSED' ? 'resume' : 'publish')}
                      className="px-4 py-2 bg-[#DCEBE1] dark:bg-[#294637] hover:bg-[#2F6B4F] hover:text-white dark:hover:bg-[#78B895] dark:hover:text-[#0D1511] text-[#2F7D4A] dark:text-[#7BC894] text-xs font-semibold rounded-xl border border-[#2F7D4A]/30 flex items-center gap-1.5 transition"
                    >
                      <Play className="w-4 h-4" /> {opp.status === 'PAUSED' ? 'Resume' : 'Publish'}
                    </button>
                  )}

                  {(opp.status === 'PUBLISHED' || opp.status === 'ACTIVE') && (
                    <button
                      onClick={() => handleStatusAction(opp.id, 'pause')}
                      className="px-4 py-2 bg-amber-100 dark:bg-amber-950/50 hover:bg-amber-200 dark:hover:bg-amber-900/50 text-[#A96F16] dark:text-[#E5B85C] text-xs font-semibold rounded-xl border border-amber-300 dark:border-amber-700/50 flex items-center gap-1.5 transition"
                    >
                      <Pause className="w-4 h-4" /> Pause
                    </button>
                  )}

                  {opp.status !== 'CLOSED' && (
                    <button
                      onClick={() => handleStatusAction(opp.id, 'close')}
                      className="px-4 py-2 bg-red-50 dark:bg-red-950/50 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 text-xs font-semibold rounded-xl border border-red-300 dark:border-red-800 flex items-center gap-1.5 transition"
                    >
                      <XCircle className="w-4 h-4" /> Close
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
