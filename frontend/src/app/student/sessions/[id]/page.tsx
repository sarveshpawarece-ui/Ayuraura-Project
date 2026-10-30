"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import {
  Calendar,
  Clock,
  Video,
  Star,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Play,
  Radio,
  Users,
  Award,
  BookOpen,
  ArrowLeft,
  X,
  Send,
  MessageSquare,
  Sparkles
} from "lucide-react";
import { api } from "@/lib/api";

interface SessionDetail {
  id: string;
  expert_user_id: string;
  expert_profile_id?: string;
  expert_name: string;
  expert_role: string;
  institution?: string;
  title: string;
  description: string;
  session_type: string;
  category: string;
  topics: string[];
  level: string;
  scheduled_date: string;
  start_time: string;
  end_time?: string;
  duration_minutes: number;
  session_thumbnail?: string;
  learning_objectives: string[];
  prerequisites: string[];
  tags: string[];
  status: "SCHEDULED" | "LIVE" | "COMPLETED" | "CANCELLED";
  recording_available: boolean;
  recording_url?: string;
  recording_duration: number;
  recording_views_count: number;
  average_rating: number;
  total_ratings: number;
  participants_count: number;
  current_live_attendees?: number;
  live_stream_url?: string;
  is_registered?: boolean;
  has_attended_live?: boolean;
  has_watched_recording?: boolean;
  has_rated?: boolean;
  is_eligible_to_rate?: boolean;
}

interface RatingItem {
  id: string;
  student_name: string;
  overall_rating: number;
  rating_knowledge: number;
  rating_teaching_quality: number;
  rating_clarity: number;
  rating_practical_value: number;
  rating_engagement: number;
  rating_usefulness: number;
  review_text?: string;
  created_at: string;
}

export default function SessionDetailsAndRecordingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const sessionId = resolvedParams.id;

  const [session, setSession] = useState<SessionDetail | null>(null);
  const [ratingsList, setRatingsList] = useState<RatingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Rating Modal States
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [overallRating, setOverallRating] = useState(5.0);
  const [ratingKnowledge, setRatingKnowledge] = useState(5);
  const [ratingTeaching, setRatingTeaching] = useState(5);
  const [ratingClarity, setRatingClarity] = useState(5);
  const [ratingPractical, setRatingPractical] = useState(5);
  const [ratingEngagement, setRatingEngagement] = useState(5);
  const [ratingUsefulness, setRatingUsefulness] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [submittingRating, setSubmittingRating] = useState(false);

  // Video Streaming State
  const [isPlayingRecording, setIsPlayingRecording] = useState(false);

  const loadSession = async () => {
    try {
      setLoading(true);
      setError(null);
      const [sessRes, ratingsRes] = await Promise.all([
        api.get(`/guidance/sessions/${sessionId}`),
        api.get(`/guidance/sessions/${sessionId}/ratings`)
      ]);
      setSession(sessRes.data);
      setRatingsList(ratingsRes.data);
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 401) {
        window.location.href = `/login?redirect=/student/sessions/${sessionId}`;
        return;
      }
      setError(err.response?.data?.detail || "Unable to fetch session details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSession();
  }, [sessionId]);

  const handleStartWatchRecording = async () => {
    try {
      await api.post(`/guidance/sessions/${sessionId}/watch-recording`);
      setIsPlayingRecording(true);
    } catch (err) {
      console.error(err);
      setIsPlayingRecording(true);
    }
  };

  const handleRegister = async () => {
    try {
      await api.post(`/guidance/sessions/${sessionId}/register`);
      setSuccessMsg("You are registered for this session!");
      setTimeout(() => setSuccessMsg(null), 4000);
      loadSession();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || "Failed to register.");
    }
  };

  const handleSubmitRating = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmittingRating(true);
      const payload = {
        overall_rating: Number(overallRating),
        rating_knowledge: Number(ratingKnowledge),
        rating_teaching_quality: Number(ratingTeaching),
        rating_clarity: Number(ratingClarity),
        rating_practical_value: Number(ratingPractical),
        rating_engagement: Number(ratingEngagement),
        rating_usefulness: Number(ratingUsefulness),
        review_text: reviewText.trim() || undefined
      };

      await api.post(`/guidance/sessions/${sessionId}/rate`, payload);
      setSuccessMsg("Thank you for submitting your clinical session review!");
      setShowRatingModal(false);
      setTimeout(() => setSuccessMsg(null), 4000);
      loadSession();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || "Failed to submit rating.");
    } finally {
      setSubmittingRating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F9F4] dark:bg-[#0F1713] text-[#1B2A22] dark:text-[#E8F1EB]">
        <Navbar />
        <div className="max-w-5xl mx-auto p-8 animate-pulse space-y-6">
          <div className="h-8 w-64 bg-[#DCE8DF]/40 rounded-xl" />
          <div className="h-64 bg-[#DCE8DF]/40 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-[#F7F9F4] dark:bg-[#0F1713] text-[#1B2A22] dark:text-[#E8F1EB] flex flex-col">
        <Navbar />
        <div className="flex-1 max-w-md mx-auto p-8 text-center space-y-4 my-auto">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold font-serif-heading">Session Not Found</h2>
          <Link href="/student/sessions" className="inline-block px-4 py-2 rounded-xl bg-[#2F6B4F] text-white text-xs font-bold">
            Back to Sessions Hub
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F9F4] dark:bg-[#0F1713] text-[#1B2A22] dark:text-[#E8F1EB] flex flex-col selection:bg-[#2F6B4F] selection:text-white transition-colors duration-300">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#64736A] dark:text-[#A9B9AE]">
          <Link href="/student/sessions" className="hover:underline flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Expert Sessions Hub</span>
          </Link>
          <span>/</span>
          <span className="font-semibold text-[#1B2A22] dark:text-white truncate">{session.title}</span>
        </div>

        {/* Alerts */}
        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2 shadow-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-900 text-rose-900 dark:text-rose-200 text-xs font-semibold flex items-center gap-2 shadow-sm">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* ========================================================= */}
        {/* VIDEO PLAYER / HERO BANNER */}
        {/* ========================================================= */}
        {session.status === "COMPLETED" && session.recording_available ? (
          <div className="rounded-3xl overflow-hidden bg-black shadow-2xl border border-white/10">
            {isPlayingRecording ? (
              <div className="aspect-video w-full bg-black">
                <video
                  controls
                  autoPlay
                  src={session.recording_url || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"}
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className="relative aspect-video w-full bg-gradient-to-tr from-[#0E2F1F] via-[#1A4B32] to-[#122A1E] flex flex-col items-center justify-center text-center p-6 sm:p-10">
                <div className="space-y-4 max-w-xl z-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold text-amber-300 border border-white/20">
                    <Video className="w-3.5 h-3.5" />
                    <span>Recorded Clinical Masterclass ({session.duration_minutes} Mins)</span>
                  </div>

                  <h2 className="text-xl sm:text-3xl font-bold font-serif-heading text-white">
                    {session.title}
                  </h2>

                  <p className="text-xs sm:text-sm text-[#DCE8DF] line-clamp-2">
                    {session.description}
                  </p>

                  <button
                    onClick={handleStartWatchRecording}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#C58A32] hover:bg-[#D49B4B] text-slate-950 font-bold text-sm shadow-xl hover:scale-105 transition-all cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Watch Full Recording</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : session.status === "LIVE" ? (
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-rose-950/80 via-[#1A2E22] to-[#0F1E15] border-2 border-rose-500 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xl">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-xs font-bold uppercase tracking-wider animate-pulse flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5" />
                  <span>BROADCASTING LIVE</span>
                </span>
                <span className="text-xs text-rose-300 font-mono">
                  {session.current_live_attendees || 54} Attendees in Room
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold font-serif-heading">
                {session.title}
              </h2>
              <p className="text-xs sm:text-sm text-gray-300">
                Live interactive transmission with real-time doubts and case assessment.
              </p>
            </div>

            <Link
              href={`/student/sessions/${session.id}/live`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-lg shadow-rose-900/50 transition-all cursor-pointer shrink-0"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Join Live Classroom</span>
            </Link>
          </div>
        ) : (
          <div className="p-6 sm:p-8 rounded-3xl bg-[#FFFFFF] dark:bg-[#17221C] border border-[#DCE4DE] dark:border-[#2B3A31] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold">
                📅 UPCOMING SCHEDULED LECTURE
              </span>
              <h2 className="text-xl sm:text-2xl font-bold font-serif-heading text-[#1B2A22] dark:text-white">
                {session.title}
              </h2>
              <p className="text-xs text-[#64736A] dark:text-[#A9B9AE]">
                Scheduled for {session.scheduled_date} at {session.start_time} ({session.duration_minutes} mins)
              </p>
            </div>

            <div className="flex items-center gap-2">
              {session.is_registered ? (
                <span className="px-4 py-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>You Are Registered</span>
                </span>
              ) : (
                <button
                  onClick={handleRegister}
                  className="px-5 py-2.5 rounded-xl bg-[#2F6B4F] dark:bg-[#6FAF8A] hover:bg-[#24563F] text-white dark:text-[#0F1713] text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  Register / RSVP Free
                </button>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* SESSION METRICS, INSTRUCTOR & OBJECTIVES GRID */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Main Content (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Description Card */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#17221C] border border-[#DCE4DE] dark:border-[#2B3A31] shadow-xs space-y-4">
              <h3 className="text-base font-bold font-serif-heading text-[#1B2A22] dark:text-white">
                About this Clinical Session
              </h3>
              <p className="text-xs sm:text-sm text-[#64736A] dark:text-[#A9B9AE] leading-relaxed">
                {session.description}
              </p>

              {/* Topics Tags */}
              {session.topics && session.topics.length > 0 && (
                <div className="pt-2">
                  <span className="text-xs font-bold text-[#1B2A22] dark:text-white block mb-2">
                    Key Topics Covered:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {session.topics.map((t) => (
                      <span
                        key={t}
                        className="px-2.5 py-1 rounded-lg bg-[#F7F9F4] dark:bg-white/5 border border-[#DCE4DE] dark:border-white/10 text-xs font-medium text-[#527260] dark:text-[#A9B9AE]"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Learning Objectives & Prerequisites */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {session.learning_objectives && session.learning_objectives.length > 0 && (
                <div className="p-5 rounded-3xl bg-white dark:bg-[#17221C] border border-[#DCE4DE] dark:border-[#2B3A31] space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#2F6B4F] dark:text-[#6FAF8A] flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Learning Objectives</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-[#64736A] dark:text-[#A9B9AE]">
                    {session.learning_objectives.map((obj, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {session.prerequisites && session.prerequisites.length > 0 && (
                <div className="p-5 rounded-3xl bg-white dark:bg-[#17221C] border border-[#DCE4DE] dark:border-[#2B3A31] space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#C58A32] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Prerequisites</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-[#64736A] dark:text-[#A9B9AE]">
                    {session.prerequisites.map((pre, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C58A32] mt-1.5 shrink-0" />
                        <span>{pre}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Student Reviews & Ratings Section */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#17221C] border border-[#DCE4DE] dark:border-[#2B3A31] shadow-xs space-y-5">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h3 className="text-base font-bold font-serif-heading text-[#1B2A22] dark:text-white">
                    Student Ratings & Verified Reviews
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-[#64736A] dark:text-[#A9B9AE]">
                    <div className="flex items-center gap-1 text-[#C58A32] font-bold">
                      <Star className="w-4 h-4 fill-current" />
                      <span>{session.average_rating}</span>
                    </div>
                    <span>•</span>
                    <span>{session.total_ratings} verified student evaluations</span>
                  </div>
                </div>

                <button
                  onClick={() => setShowRatingModal(true)}
                  className="px-4 py-2 rounded-xl bg-[#C58A32] hover:bg-[#D49B4B] text-slate-950 text-xs font-bold shadow-xs transition-all cursor-pointer"
                >
                  Rate This Session
                </button>
              </div>

              {ratingsList.length === 0 ? (
                <div className="text-center py-8 text-xs text-[#64736A] dark:text-[#A9B9AE] bg-[#F7F9F4] dark:bg-white/5 rounded-2xl p-4">
                  No student reviews submitted yet. Be the first to share feedback!
                </div>
              ) : (
                <div className="divide-y divide-[#DCE4DE] dark:divide-[#2B3A31] space-y-3">
                  {ratingsList.map((r) => (
                    <div key={r.id} className="pt-3 first:pt-0 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-[#1B2A22] dark:text-white">{r.student_name}</span>
                        <div className="flex items-center gap-1 text-[#C58A32] font-bold">
                          <Star className="w-3 h-3 fill-current" />
                          <span>{r.overall_rating.toFixed(1)}</span>
                        </div>
                      </div>

                      {r.review_text && (
                        <p className="text-xs text-[#64736A] dark:text-[#A9B9AE] leading-relaxed">
                          "{r.review_text}"
                        </p>
                      )}

                      <div className="flex flex-wrap gap-2 text-[10.5px] text-[#527260] dark:text-emerald-300/80 pt-0.5 font-mono">
                        <span>Knowledge: {r.rating_knowledge}/5</span>
                        <span>•</span>
                        <span>Clarity: {r.rating_clarity}/5</span>
                        <span>•</span>
                        <span>Practical: {r.rating_practical_value}/5</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Right Sidebar (4 cols): Instructor Card & Session Meta */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Instructor Profile Card */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#17221C] border border-[#DCE4DE] dark:border-[#2B3A31] shadow-xs space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#DCE8DF] dark:bg-[#26372D] text-[#2F6B4F] dark:text-[#6FAF8A] flex items-center justify-center font-bold text-base shrink-0">
                  {session.expert_name?.charAt(0)}
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-sm font-bold text-[#1B2A22] dark:text-white">
                    {session.expert_name}
                  </h4>
                  <p className="text-xs text-[#C58A32] font-semibold">
                    {session.category} Faculty
                  </p>
                  <p className="text-[11px] text-[#64736A] dark:text-[#A9B9AE]">
                    {session.institution}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-[#DCE4DE] dark:border-[#2B3A31] flex gap-2">
                <Link
                  href={`/student/experts/${session.expert_user_id || session.expert_profile_id}`}
                  className="flex-1 py-2 text-center rounded-xl bg-[#F7F9F4] dark:bg-white/5 border border-[#DCE4DE] dark:border-white/10 text-xs font-semibold text-[#1B2A22] dark:text-white hover:bg-[#DCE8DF]/40"
                >
                  View Full Profile
                </Link>
              </div>
            </div>

            {/* Session Info Table */}
            <div className="p-5 rounded-3xl bg-white dark:bg-[#17221C] border border-[#DCE4DE] dark:border-[#2B3A31] space-y-3 text-xs">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#1B2A22] dark:text-white">
                Session Metadata
              </h4>

              <div className="space-y-2 divide-y divide-[#DCE4DE]/60 dark:divide-[#2B3A31]">
                <div className="flex justify-between py-1">
                  <span className="text-[#64736A] dark:text-[#A9B9AE]">Type</span>
                  <span className="font-semibold text-[#1B2A22] dark:text-white">{session.session_type}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#64736A] dark:text-[#A9B9AE]">Level</span>
                  <span className="font-semibold text-[#1B2A22] dark:text-white">{session.level}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#64736A] dark:text-[#A9B9AE]">Duration</span>
                  <span className="font-semibold text-[#1B2A22] dark:text-white">{session.duration_minutes} Minutes</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#64736A] dark:text-[#A9B9AE]">Language</span>
                  <span className="font-semibold text-[#1B2A22] dark:text-white">English / Hindi</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#64736A] dark:text-[#A9B9AE]">Recording</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {session.recording_available ? "Available On-Demand" : "Live Only"}
                  </span>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* ========================================================= */}
        {/* MULTI-DIMENSIONAL RATING MODAL */}
        {/* ========================================================= */}
        {showRatingModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="w-full max-w-lg bg-white dark:bg-[#17221C] rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#DCE4DE] dark:border-[#2B3A31] space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
              
              <div className="flex items-center justify-between pb-3 border-b border-[#DCE4DE] dark:border-[#2B3A31]">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#C58A32]" />
                  <h3 className="text-base font-bold font-serif-heading text-[#1B2A22] dark:text-white">
                    Rate Clinical Session & Faculty
                  </h3>
                </div>
                <button
                  onClick={() => setShowRatingModal(false)}
                  className="text-gray-400 hover:text-gray-700 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitRating} className="space-y-4 text-xs">
                
                {/* Overall Rating 1-5 */}
                <div className="p-4 rounded-2xl bg-[#FAF0E1] dark:bg-[#332512]/60 border border-[#C58A32]/30 space-y-2 text-center">
                  <span className="font-bold text-sm text-[#1B2A22] dark:text-white block">
                    Overall Experience Rating
                  </span>
                  <div className="flex items-center justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setOverallRating(star)}
                        className="p-1 text-2xl cursor-pointer transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-7 h-7 ${
                            star <= overallRating
                              ? "fill-[#C58A32] text-[#C58A32]"
                              : "text-gray-300 dark:text-gray-600"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <span className="text-xs font-bold text-[#C58A32]">
                    {overallRating.toFixed(1)} / 5.0 Stars
                  </span>
                </div>

                {/* Categorical Sliders */}
                <div className="space-y-3 divide-y divide-[#DCE4DE]/60 dark:divide-[#2B3A31]">
                  {[
                    { label: "Clinical & Subject Knowledge", val: ratingKnowledge, setVal: setRatingKnowledge },
                    { label: "Teaching Quality & Explanations", val: ratingTeaching, setVal: setRatingTeaching },
                    { label: "Clarity of Concepts & Protocols", val: ratingClarity, setVal: setRatingClarity },
                    { label: "Practical Clinical Value", val: ratingPractical, setVal: setRatingPractical },
                    { label: "Interactivity & Engagement", val: ratingEngagement, setVal: setRatingEngagement },
                    { label: "Overall Usefulness for Career", val: ratingUsefulness, setVal: setRatingUsefulness }
                  ].map((cat, idx) => (
                    <div key={idx} className="pt-2.5 first:pt-0 flex items-center justify-between gap-4">
                      <span className="font-medium text-[#1B2A22] dark:text-[#E8F1EB]">
                        {cat.label}
                      </span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => cat.setVal(s)}
                            className="p-0.5 cursor-pointer"
                          >
                            <Star
                              className={`w-4 h-4 ${
                                s <= cat.val
                                  ? "fill-[#C58A32] text-[#C58A32]"
                                  : "text-gray-300 dark:text-gray-600"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Written Review */}
                <div className="space-y-1 pt-2">
                  <label className="block text-xs font-bold text-[#1B2A22] dark:text-white">
                    Written Feedback & Clinical Takeaways (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Share what you learned, cases analyzed, or advice for peers..."
                    className="w-full px-3.5 py-2 rounded-xl border border-[#DCE4DE] dark:border-white/15 bg-white dark:bg-[#0F1713] text-xs text-[#1B2A22] dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#2F6B4F]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#DCE4DE] dark:border-[#2B3A31]">
                  <button
                    type="button"
                    onClick={() => setShowRatingModal(false)}
                    className="px-4 py-2 rounded-xl border border-gray-300 text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingRating}
                    className="px-5 py-2 rounded-xl bg-[#2F6B4F] dark:bg-[#6FAF8A] hover:bg-[#24563F] text-white dark:text-[#0F1713] text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {submittingRating ? "Submitting..." : "Submit Rating"}
                  </button>
                </div>
              </form>

            </div>
          </div>
        )}

      </main>
    </div>
  );
}
