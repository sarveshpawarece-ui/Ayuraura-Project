'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import {
  Users,
  Search,
  Filter,
  Eye,
  ArrowLeft,
  Award,
  CheckCircle2,
  Clock,
  Briefcase,
  SlidersHorizontal,
  Kanban,
  Table as TableIcon
} from 'lucide-react';

interface ApplicantSummary {
  id: string;
  opportunity_id: string;
  opportunity_title: string;
  student_profile_id: string;
  student_name: string;
  student_email: string;
  college_name?: string;
  status: string;
  applied_at?: string;
  match_score: number;
  match_classification: string;
}

export default function IndustryApplicationsPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<ApplicantSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const [activeStatusFilter, setActiveStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('applied_at');

  useEffect(() => {
    fetchApplications();
  }, [activeStatusFilter, sortBy]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      let url = `/industry/applications?sort_by=${sortBy}`;
      if (activeStatusFilter !== 'ALL') {
        url += `&status=${activeStatusFilter}`;
      }

      const res = await api.get(url);
      setApplications(res.data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        router.push('/login');
        return;
      }
      setError(err.response?.data?.detail || err.message || 'Error loading applications');
    } finally {
      setLoading(false);
    }
  };

  const filteredApps = applications.filter((app) =>
    app.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.opportunity_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.student_email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getMatchBadgeStyle = (score: number) => {
    if (score >= 85) return 'bg-[#DCEBE1] dark:bg-[#294637] text-[#2F7D4A] dark:text-[#7BC894] border-[#2F7D4A]/30';
    if (score >= 70) return 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border-teal-300 dark:border-teal-700/40';
    if (score >= 50) return 'bg-amber-50 dark:bg-amber-950/40 text-[#A96F16] dark:text-[#E5B85C] border-amber-300 dark:border-amber-700/40';
    return 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-800/40';
  };

  const kanbanColumns = [
    { id: 'SAVED', title: 'Saved / Planned', color: 'border-[#D5DED8] dark:border-[#304036] text-[#526158] dark:text-[#C1CEC5]' },
    { id: 'APPLIED', title: 'New Applied', color: 'border-blue-300 dark:border-blue-700/50 text-[#356F9D] dark:text-[#80B5DD]' },
    { id: 'UNDER_REVIEW', title: 'Under Review', color: 'border-amber-300 dark:border-amber-700/50 text-[#A96F16] dark:text-[#E5B85C]' },
    { id: 'SHORTLISTED', title: 'Shortlisted', color: 'border-indigo-300 dark:border-indigo-700/50 text-indigo-600 dark:text-indigo-400' },
    { id: 'INTERVIEW', title: 'Interviewing', color: 'border-cyan-300 dark:border-cyan-700/50 text-cyan-600 dark:text-cyan-400' },
    { id: 'OFFERED', title: 'Offered', color: 'border-[#2F7D4A]/30 text-[#2F7D4A] dark:text-[#7BC894]' },
    { id: 'ACCEPTED', title: 'Accepted', color: 'border-teal-300 dark:border-teal-700/50 text-teal-600 dark:text-teal-300' },
    { id: 'REJECTED', title: 'Rejected', color: 'border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400' }
  ];

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
                <Users className="w-8 h-8 text-[#2F6B4F] dark:text-[#78B895]" /> Applicant Pipeline
              </h1>
              <p className="text-[#526158] dark:text-[#C1CEC5] text-sm mt-1">
                Review candidate applications, inspect match breakdowns, advance workflow stages, and log private internal notes.
              </p>
            </div>

            <div className="flex items-center gap-2 bg-[#EEF4EF] dark:bg-[#223128] p-1 rounded-xl border border-[#D5DED8] dark:border-[#304036]">
              <button
                onClick={() => setViewMode('table')}
                className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 transition ${
                  viewMode === 'table' ? 'bg-[#2F6B4F] dark:bg-[#78B895] text-white dark:text-[#0D1511] shadow-xs' : 'text-[#526158] dark:text-[#C1CEC5] hover:text-[#17231C] dark:hover:text-white'
                }`}
              >
                <TableIcon className="w-4 h-4" /> Table View
              </button>

              <button
                onClick={() => setViewMode('kanban')}
                className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 transition ${
                  viewMode === 'kanban' ? 'bg-[#2F6B4F] dark:bg-[#78B895] text-white dark:text-[#0D1511] shadow-xs' : 'text-[#526158] dark:text-[#C1CEC5] hover:text-[#17231C] dark:hover:text-white'
                }`}
              >
                <Kanban className="w-4 h-4" /> Kanban Pipeline
              </button>
            </div>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[#FFFFFF] dark:bg-[#17211B] p-4 rounded-2xl border border-[#D5DED8] dark:border-[#304036] shadow-xs">
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
            {['ALL', 'APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW', 'OFFERED', 'ACCEPTED', 'REJECTED'].map((st) => (
              <button
                key={st}
                onClick={() => setActiveStatusFilter(st)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition ${
                  activeStatusFilter === st
                    ? 'bg-[#2F6B4F] dark:bg-[#78B895] text-white dark:text-[#0D1511] shadow-xs'
                    : 'bg-[#EEF4EF] dark:bg-[#223128] text-[#526158] dark:text-[#C1CEC5] hover:bg-[#D5DED8] dark:hover:bg-[#304036]'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-[#EEF4EF] dark:bg-[#223128] border border-[#D5DED8] dark:border-[#304036] rounded-xl px-3 py-2 text-xs text-[#17231C] dark:text-[#F1F6F2] focus:outline-none focus:border-[#2F6B4F] dark:focus:border-[#78B895]"
            >
              <option value="applied_at">Sort: Applied Date</option>
              <option value="match_score">Sort: Highest Match Score</option>
            </select>

            <div className="relative w-full md:w-64">
              <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-[#68776D] dark:text-[#98A99E]" />
              <input
                type="text"
                placeholder="Search candidate or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#EEF4EF] dark:bg-[#223128] border border-[#D5DED8] dark:border-[#304036] rounded-xl pl-9 pr-4 py-2 text-xs text-[#17231C] dark:text-[#F1F6F2] placeholder-[#68776D] dark:placeholder-[#98A99E] focus:outline-none focus:border-[#2F6B4F] dark:focus:border-[#78B895]"
              />
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-4 border-[#2F6B4F] dark:border-[#78B895] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[#68776D] dark:text-[#98A99E]">Loading candidate pipeline...</p>
          </div>
        ) : filteredApps.length === 0 ? (
          <div className="bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] rounded-2xl p-12 text-center text-[#68776D] dark:text-[#98A99E]">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-40 text-[#68776D] dark:text-[#98A99E]" />
            <p className="text-lg font-semibold text-[#17231C] dark:text-[#F1F6F2]">No applicants found</p>
            <p className="text-sm text-[#68776D] dark:text-[#98A99E] mt-1">There are no candidates matching your active filter criteria.</p>
          </div>
        ) : viewMode === 'table' ? (
          /* Table View */
          <div className="bg-[#FFFFFF] dark:bg-[#17211B] rounded-2xl border border-[#D5DED8] dark:border-[#304036] overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-[#17231C] dark:text-[#F1F6F2]">
                <thead className="bg-[#EEF4EF]/70 dark:bg-[#223128]/70 text-xs font-semibold uppercase text-[#526158] dark:text-[#C1CEC5] border-b border-[#D5DED8] dark:border-[#304036]">
                  <tr>
                    <th className="px-6 py-4">Candidate Name</th>
                    <th className="px-6 py-4">Applied Opportunity</th>
                    <th className="px-6 py-4">College / Institute</th>
                    <th className="px-6 py-4 text-center">Match Score</th>
                    <th className="px-6 py-4">Status Stage</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D5DED8]/60 dark:divide-[#304036]/60">
                  {filteredApps.map((app) => (
                    <tr key={app.id} className="hover:bg-[#EEF4EF]/40 dark:hover:bg-[#223128]/40 transition">
                      <td className="px-6 py-4 font-semibold text-[#17231C] dark:text-[#F1F6F2]">
                        {app.student_name}
                        <span className="block text-xs text-[#68776D] dark:text-[#98A99E] font-normal">{app.student_email}</span>
                      </td>

                      <td className="px-6 py-4 font-medium text-[#17231C] dark:text-[#F1F6F2]">
                        {app.opportunity_title}
                      </td>

                      <td className="px-6 py-4 text-xs text-[#526158] dark:text-[#C1CEC5]">
                        {app.college_name || 'Ayurvedic Institute Student'}
                      </td>

                      <td className="px-6 py-4 text-center">
                        <span className={`px-3 py-1 text-xs font-bold rounded-full border ${getMatchBadgeStyle(app.match_score)}`}>
                          {Math.round(app.match_score)}% Match
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#EEF4EF] dark:bg-[#223128] border border-[#D5DED8] dark:border-[#304036] text-[#17231C] dark:text-[#F1F6F2] uppercase">
                          {app.status}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/industry/applications/${app.id}`}
                          className="px-4 py-2 bg-[#DCEBE1] dark:bg-[#294637] hover:bg-[#2F6B4F] hover:text-white dark:hover:bg-[#78B895] dark:hover:text-[#0D1511] text-[#2F6B4F] dark:text-[#78B895] text-xs font-semibold rounded-xl border border-[#2F6B4F]/30 inline-flex items-center gap-1.5 transition"
                        >
                          <Eye className="w-4 h-4" /> Review
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Kanban View */
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 overflow-x-auto pb-4">
            {kanbanColumns.map((col) => {
              const colApps = filteredApps.filter((a) => a.status === col.id);
              return (
                <div key={col.id} className="bg-[#FFFFFF] dark:bg-[#17211B] rounded-2xl border border-[#D5DED8] dark:border-[#304036] p-4 shadow-xs space-y-4 min-w-[260px]">
                  <div className="flex items-center justify-between border-b border-[#D5DED8] dark:border-[#304036] pb-3">
                    <h4 className={`font-bold text-sm flex items-center gap-2 ${col.color}`}>
                      {col.title}
                    </h4>
                    <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-[#EEF4EF] dark:bg-[#223128] text-[#526158] dark:text-[#C1CEC5]">
                      {colApps.length}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {colApps.length === 0 ? (
                      <p className="text-xs text-[#68776D] dark:text-[#98A99E] italic py-4 text-center">Empty stage</p>
                    ) : (
                      colApps.map((app) => (
                        <div
                          key={app.id}
                          className="p-4 bg-[#EEF4EF] dark:bg-[#223128] rounded-xl border border-[#D5DED8] dark:border-[#304036] space-y-3 hover:border-[#2F6B4F]/40 dark:hover:border-[#78B895]/40 transition shadow-xs"
                        >
                          <div>
                            <h5 className="font-bold text-[#17231C] dark:text-[#F1F6F2] text-sm">{app.student_name}</h5>
                            <p className="text-xs text-[#526158] dark:text-[#C1CEC5] line-clamp-1">{app.opportunity_title}</p>
                          </div>

                          <div className="flex items-center justify-between text-xs pt-1 border-t border-[#D5DED8] dark:border-[#304036]">
                            <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${getMatchBadgeStyle(app.match_score)}`}>
                              {Math.round(app.match_score)}% Match
                            </span>

                            <Link
                              href={`/industry/applications/${app.id}`}
                              className="text-xs text-[#2F6B4F] dark:text-[#78B895] font-semibold hover:underline flex items-center gap-1"
                            >
                              Review &rarr;
                            </Link>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
