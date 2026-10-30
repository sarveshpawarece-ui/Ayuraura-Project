'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { api } from '@/lib/api';
import {
  Users,
  Award,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Briefcase,
  BookOpen,
  GraduationCap,
  MessageSquare,
  Send,
  Trash2,
  AlertCircle,
  FileText,
  Building2,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';

interface InternalNote {
  id: string;
  application_id: string;
  organization_id: string;
  author_name?: string;
  note: string;
  created_at?: string;
}

interface MatchBreakdown {
  match_score: number;
  match_classification: string;
  priority: string;
  skill_match_score: number;
  career_match_score: number;
  required_skill_coverage: number;
  experience_fit: number;
  matched_skill_count: number;
  partial_skill_count: number;
  missing_skill_count: number;
  critical_missing_skill_count: number;
  reason: string;
}

interface ApplicationDetail {
  id: string;
  opportunity_id: string;
  opportunity_title: string;
  student_profile_id: string;
  student_name: string;
  student_email: string;
  college_name?: string;
  degree?: string;
  year_of_study?: number;
  target_career_title?: string;
  status: string;
  applied_at?: string;
  application_deadline?: string;
  cover_letter_status: string;
  notes_user?: string;
  match_breakdown?: MatchBreakdown;
  student_skills: any[];
  status_history: any[];
  internal_notes: InternalNote[];
}

export default function CandidateReviewDetailPage() {
  const router = useRouter();
  const params = useParams();
  const appId = params.id as string;

  const [detail, setDetail] = useState<ApplicationDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [statusNote, setStatusNote] = useState<string>('');
  const [updatingStatus, setUpdatingStatus] = useState<boolean>(false);
  const [newNoteText, setNewNoteText] = useState<string>('');
  const [addingNote, setAddingNote] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (appId) fetchDetail();
  }, [appId]);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/industry/applications/${appId}`);
      setDetail(res.data);
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

  const handleUpdateStatus = async (newStatus: string) => {
    try {
      setUpdatingStatus(true);
      setError(null);
      const res = await api.patch(`/industry/applications/${appId}/status`, { status: newStatus, note: statusNote });
      setDetail(res.data);
      setStatusNote('');
      setSuccessMsg(`Candidate status updated to ${newStatus.replace('_', ' ')}`);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    try {
      setAddingNote(true);
      await api.post(`/industry/applications/${appId}/notes`, { note: newNoteText.trim() });
      setNewNoteText('');
      fetchDetail();
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to add note');
    } finally {
      setAddingNote(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await api.delete(`/industry/applications/${appId}/notes/${noteId}`);
      fetchDetail();
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to delete note');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F9F4] dark:bg-[#0D1511] text-[#17231C] dark:text-[#F1F6F2] font-sans flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#2F6B4F] dark:border-[#78B895] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="min-h-screen bg-[#F7F9F4] dark:bg-[#0D1511] text-[#17231C] dark:text-[#F1F6F2] font-sans p-8">
        <div className="max-w-2xl mx-auto bg-[#FFFFFF] dark:bg-[#17211B] rounded-2xl p-8 border border-red-300 dark:border-red-900 text-center shadow-xs">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h3 className="text-xl font-bold text-[#142019] dark:text-white mb-2">Error Loading Candidate Review</h3>
          <p className="text-[#526158] dark:text-[#C1CEC5] text-sm mb-4">{error}</p>
          <Link href="/industry/applications" className="text-[#2F6B4F] dark:text-[#78B895] font-medium hover:underline text-sm">
            &larr; Return to Applicant Pipeline
          </Link>
        </div>
      </div>
    );
  }

  const match = detail.match_breakdown;

  return (
    <div className="min-h-screen bg-[#F7F9F4] dark:bg-[#0D1511] text-[#17231C] dark:text-[#F1F6F2] font-sans p-6 md:p-10 transition-colors duration-200">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Navigation & Header */}
        <div>
          <Link
            href="/industry/applications"
            className="inline-flex items-center gap-2 text-sm text-[#526158] hover:text-[#2F6B4F] dark:text-[#C1CEC5] dark:hover:text-[#78B895] mb-4 transition font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Applicant Pipeline
          </Link>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#FFFFFF] dark:bg-[#17211B] p-6 rounded-2xl border border-[#D5DED8] dark:border-[#304036] shadow-xs">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#DCEBE1] dark:bg-[#294637] border border-[#2F6B4F]/30 flex items-center justify-center text-[#2F6B4F] dark:text-[#78B895] font-bold text-2xl">
                {detail.student_name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-[#142019] dark:text-white">{detail.student_name}</h1>
                <p className="text-[#526158] dark:text-[#C1CEC5] text-sm">{detail.student_email}</p>
                <p className="text-xs text-[#2F6B4F] dark:text-[#78B895] font-medium mt-0.5">Applied for: {detail.opportunity_title}</p>
              </div>
            </div>

            {/* Current Status Stage & Match Score Badge */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-xs text-[#68776D] dark:text-[#98A99E] block uppercase font-medium">Pipeline Stage</span>
                <span className="px-3 py-1 text-xs font-bold rounded-lg bg-[#EEF4EF] dark:bg-[#223128] border border-[#D5DED8] dark:border-[#304036] text-[#17231C] dark:text-[#F1F6F2] uppercase mt-1 inline-block">
                  {detail.status.replace('_', ' ')}
                </span>
              </div>

              {match && (
                <div className="px-5 py-3 rounded-2xl bg-[#DCEBE1] dark:bg-[#294637] border border-[#2F6B4F]/30 text-center">
                  <span className="text-2xl font-extrabold text-[#2F7D4A] dark:text-[#7BC894] block">{Math.round(match.match_score)}%</span>
                  <span className="text-[10px] uppercase font-bold text-[#2F6B4F] dark:text-[#78B895]">Phase 10 Match Score</span>
                </div>
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

        {/* Workflow Action Controls */}
        <div className="bg-[#FFFFFF] dark:bg-[#17211B] p-6 rounded-2xl border border-[#D5DED8] dark:border-[#304036] shadow-xs space-y-4">
          <h3 className="text-sm font-bold uppercase text-[#142019] dark:text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#2F6B4F] dark:text-[#78B895]" /> Advance Review Stage
          </h3>

          <div className="flex flex-wrap items-center gap-2">
            {['UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW', 'OFFERED', 'ACCEPTED', 'REJECTED'].map((st) => (
              <button
                key={st}
                disabled={updatingStatus || detail.status === st}
                onClick={() => handleUpdateStatus(st)}
                className={`px-4 py-2 text-xs font-semibold rounded-xl border transition ${
                  detail.status === st
                    ? 'bg-[#2F6B4F] text-white border-[#2F6B4F] dark:bg-[#78B895] dark:text-[#0D1511] dark:border-[#78B895] shadow-xs'
                    : 'bg-[#EEF4EF] hover:bg-[#D5DED8] dark:bg-[#223128] dark:hover:bg-[#304036] text-[#526158] dark:text-[#C1CEC5] border-[#D5DED8] dark:border-[#304036]'
                }`}
              >
                Set Stage: {st.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div className="pt-2">
            <input
              type="text"
              placeholder="Add optional status transition note (e.g. Interview scheduled for Friday at 11 AM)..."
              value={statusNote}
              onChange={(e) => setStatusNote(e.target.value)}
              className="w-full bg-[#EEF4EF] dark:bg-[#223128] border border-[#D5DED8] dark:border-[#304036] rounded-xl px-4 py-2 text-xs text-[#17231C] dark:text-[#F1F6F2] placeholder-[#68776D] dark:placeholder-[#98A99E] focus:outline-none focus:border-[#2F6B4F] dark:focus:border-[#78B895]"
            />
          </div>
        </div>

        {/* Main Grid: Match Breakdown & Candidate Profile */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Left Column: Phase 10 Match Score Breakdown */}
          <div className="space-y-6">
            <div className="bg-[#FFFFFF] dark:bg-[#17211B] rounded-2xl border border-[#D5DED8] dark:border-[#304036] p-6 shadow-xs space-y-5">
              <h3 className="text-lg font-bold text-[#142019] dark:text-white flex items-center gap-2 border-b border-[#D5DED8] dark:border-[#304036] pb-3">
                <Award className="w-5 h-5 text-[#2F6B4F] dark:text-[#78B895]" /> Phase 10 Match Breakdown
              </h3>

              {match ? (
                <div className="space-y-4 text-xs">
                  <div>
                    <div className="flex justify-between font-medium mb-1">
                      <span className="text-[#526158] dark:text-[#C1CEC5]">Skill Score Fit (50% weight)</span>
                      <span className="text-[#2F7D4A] dark:text-[#7BC894] font-bold">{Math.round(match.skill_match_score)}%</span>
                    </div>
                    <div className="w-full bg-[#EEF4EF] dark:bg-[#223128] rounded-full h-2">
                      <div className="bg-[#2F7D4A] dark:bg-[#7BC894] h-2 rounded-full" style={{ width: `${Math.min(match.skill_match_score, 100)}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-medium mb-1">
                      <span className="text-[#526158] dark:text-[#C1CEC5]">Career Goal Fit (20% weight)</span>
                      <span className="text-teal-600 dark:text-teal-400 font-bold">{Math.round(match.career_match_score)}%</span>
                    </div>
                    <div className="w-full bg-[#EEF4EF] dark:bg-[#223128] rounded-full h-2">
                      <div className="bg-teal-500 h-2 rounded-full" style={{ width: `${Math.min(match.career_match_score, 100)}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-medium mb-1">
                      <span className="text-[#526158] dark:text-[#C1CEC5]">Skill Coverage (20% weight)</span>
                      <span className="text-[#356F9D] dark:text-[#80B5DD] font-bold">{Math.round(match.required_skill_coverage)}%</span>
                    </div>
                    <div className="w-full bg-[#EEF4EF] dark:bg-[#223128] rounded-full h-2">
                      <div className="bg-[#356F9D] dark:bg-[#80B5DD] h-2 rounded-full" style={{ width: `${Math.min(match.required_skill_coverage, 100)}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-medium mb-1">
                      <span className="text-[#526158] dark:text-[#C1CEC5]">Experience Fit (10% weight)</span>
                      <span className="text-indigo-600 dark:text-indigo-400 font-bold">{Math.round(match.experience_fit)}%</span>
                    </div>
                    <div className="w-full bg-[#EEF4EF] dark:bg-[#223128] rounded-full h-2">
                      <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${Math.min(match.experience_fit, 100)}%` }}></div>
                    </div>
                  </div>

                  <div className="p-3 bg-[#EEF4EF] dark:bg-[#223128] rounded-xl border border-[#D5DED8] dark:border-[#304036] text-[#526158] dark:text-[#C1CEC5] leading-relaxed text-xs">
                    <strong className="text-[#142019] dark:text-white block mb-1">Match Reason:</strong>
                    {match.reason}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-[#68776D] dark:text-[#98A99E]">No match breakdown data available.</p>
              )}
            </div>

            {/* Candidate Submitted Notes */}
            {detail.notes_user && (
              <div className="bg-[#FFFFFF] dark:bg-[#17211B] rounded-2xl border border-[#D5DED8] dark:border-[#304036] p-6 shadow-xs space-y-3">
                <h3 className="text-sm font-bold text-[#142019] dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#2F6B4F] dark:text-[#78B895]" /> Candidate Application Note
                </h3>
                <p className="text-xs text-[#526158] dark:text-[#C1CEC5] bg-[#EEF4EF] dark:bg-[#223128] p-3 rounded-xl border border-[#D5DED8] dark:border-[#304036] leading-relaxed">
                  "{detail.notes_user}"
                </p>
              </div>
            )}
          </div>

          {/* Right Column: Candidate Profile Details & Internal Notes */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Candidate Academic Profile */}
            <div className="bg-[#FFFFFF] dark:bg-[#17211B] rounded-2xl border border-[#D5DED8] dark:border-[#304036] p-6 shadow-xs space-y-4">
              <h3 className="text-lg font-bold text-[#142019] dark:text-white flex items-center gap-2 border-b border-[#D5DED8] dark:border-[#304036] pb-3">
                <GraduationCap className="w-5 h-5 text-[#2F6B4F] dark:text-[#78B895]" /> Academic Profile & Target Career
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-[#68776D] dark:text-[#98A99E] block text-xs uppercase font-medium">Institution / College</span>
                  <span className="text-[#17231C] dark:text-[#F1F6F2] font-medium mt-1 block">{detail.college_name || 'Ayurvedic Medical College'}</span>
                </div>
                <div>
                  <span className="text-[#68776D] dark:text-[#98A99E] block text-xs uppercase font-medium">Degree & Year</span>
                  <span className="text-[#17231C] dark:text-[#F1F6F2] font-medium mt-1 block">
                    {detail.degree || 'BAMS'} {detail.year_of_study ? `(Year ${detail.year_of_study})` : ''}
                  </span>
                </div>
                <div>
                  <span className="text-[#68776D] dark:text-[#98A99E] block text-xs uppercase font-medium">Target Career Goal</span>
                  <span className="text-[#2F6B4F] dark:text-[#78B895] font-semibold mt-1 block">{detail.target_career_title || 'Ayurvedic Specialist'}</span>
                </div>
                <div>
                  <span className="text-[#68776D] dark:text-[#98A99E] block text-xs uppercase font-medium">Applied Date</span>
                  <span className="text-[#17231C] dark:text-[#F1F6F2] font-medium mt-1 block">
                    {detail.applied_at ? new Date(detail.applied_at).toLocaleDateString() : 'Recent'}
                  </span>
                </div>
              </div>
            </div>

            {/* Candidate Evaluated Skills */}
            <div className="bg-[#FFFFFF] dark:bg-[#17211B] rounded-2xl border border-[#D5DED8] dark:border-[#304036] p-6 shadow-xs space-y-4">
              <h3 className="text-lg font-bold text-[#142019] dark:text-white flex items-center gap-2 border-b border-[#D5DED8] dark:border-[#304036] pb-3">
                <Award className="w-5 h-5 text-[#2F6B4F] dark:text-[#78B895]" /> Candidate Skill Scores
              </h3>

              {detail.student_skills.length === 0 ? (
                <p className="text-xs text-[#68776D] dark:text-[#98A99E] italic">No evaluated skill scores recorded.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {detail.student_skills.map((s, idx) => (
                    <div key={idx} className="p-3 bg-[#EEF4EF] dark:bg-[#223128] rounded-xl border border-[#D5DED8] dark:border-[#304036] flex items-center justify-between text-xs">
                      <div>
                        <span className="font-semibold text-[#17231C] dark:text-[#F1F6F2] block">{s.skill_name}</span>
                        <span className="text-[#526158] dark:text-[#C1CEC5]">{s.category} &bull; {s.proficiency_level}</span>
                      </div>
                      <span className="text-[#2F7D4A] dark:text-[#7BC894] font-extrabold text-sm">{Math.round(s.score)}%</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Organization Private Internal Notes Component */}
            <div className="bg-[#FFFFFF] dark:bg-[#17211B] rounded-2xl border border-[#D5DED8] dark:border-[#304036] p-6 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-[#D5DED8] dark:border-[#304036] pb-3">
                <h3 className="text-lg font-bold text-[#142019] dark:text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-[#2F6B4F] dark:text-[#78B895]" /> Organization Private Internal Review Notes
                </h3>
                <span className="text-xs text-[#526158] dark:text-[#C1CEC5] bg-[#EEF4EF] dark:bg-[#223128] px-3 py-1 rounded-full border border-[#D5DED8] dark:border-[#304036]">
                  Private to Org
                </span>
              </div>

              {/* Add Note Form */}
              <form onSubmit={handleAddNote} className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="Add private review note for hiring team..."
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  className="flex-1 bg-[#EEF4EF] dark:bg-[#223128] border border-[#D5DED8] dark:border-[#304036] rounded-xl px-4 py-2.5 text-xs text-[#17231C] dark:text-[#F1F6F2] placeholder-[#68776D] dark:placeholder-[#98A99E] focus:outline-none focus:border-[#2F6B4F] dark:focus:border-[#78B895]"
                />
                <button
                  type="submit"
                  disabled={addingNote}
                  className="px-5 py-2.5 bg-[#2F6B4F] hover:bg-[#24563F] dark:bg-[#78B895] dark:hover:bg-[#91CAA8] text-white dark:text-[#0D1511] font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1"
                >
                  <Send className="w-4 h-4" /> Add Note
                </button>
              </form>

              {/* List Internal Notes */}
              {detail.internal_notes.length === 0 ? (
                <p className="text-xs text-[#68776D] dark:text-[#98A99E] italic py-2">No internal review notes added yet.</p>
              ) : (
                <div className="space-y-3">
                  {detail.internal_notes.map((n) => (
                    <div key={n.id} className="p-3.5 bg-[#EEF4EF] dark:bg-[#223128] rounded-xl border border-[#D5DED8] dark:border-[#304036] flex items-start justify-between gap-4 text-xs">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-[#2F6B4F] dark:text-[#78B895]">{n.author_name || 'Reviewer'}</span>
                          <span className="text-[10px] text-[#68776D] dark:text-[#98A99E]">
                            {n.created_at ? new Date(n.created_at).toLocaleString() : ''}
                          </span>
                        </div>
                        <p className="text-[#17231C] dark:text-[#F1F6F2] leading-relaxed">{n.note}</p>
                      </div>

                      <button
                        onClick={() => handleDeleteNote(n.id)}
                        className="p-1 text-[#68776D] hover:text-red-500 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
