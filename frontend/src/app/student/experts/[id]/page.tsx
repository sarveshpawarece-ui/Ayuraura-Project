"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import {
  Sparkles,
  Award,
  BookOpen,
  Calendar,
  Clock,
  Video,
  Star,
  Users,
  ShieldCheck,
  ChevronRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  PlayCircle,
  MessageSquare,
  Building2,
  ExternalLink,
  UserCheck,
  UserPlus
} from "lucide-react";
import { api } from "@/lib/api";

interface ExpertProfile {
  id: string;
  user_id: string;
  full_name: string;
  role: string;
  professional_title: string;
  institution_or_clinic: string;
  qualifications: string;
  specialization: string;
  areas_of_expertise: string[];
  subjects: string[];
  skills: string[];
  languages: string[];
  years_of_experience: number;
  bio?: string;
  profile_photo_url?: string;
  is_verified: boolean;
  verification_badge_title?: string;
  average_rating: number;
  total_ratings: number;
  completed_sessions_count: number;
  total_sessions_count: number;
  followers_count: number;
  bayesian_score: number;
  is_following: boolean;
}

interface SessionItem {
  id: string;
  title: string;
  description: string;
  session_type: string;
  category: string;
  topics: string[];
  level: string;
  scheduled_date: string;
  start_time: string;
  duration_minutes: number;
  status: "SCHEDULED" | "LIVE" | "COMPLETED" | "CANCELLED";
  session_thumbnail?: string;
  recording_available: boolean;
  recording_duration?: number;
  recording_views_count: number;
  average_rating: number;
  total_ratings: number;
  participants_count: number;
  is_registered: boolean;
  has_attended_live: boolean;
  has_watched_recording: boolean;
}

export default function StudentExpertDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const expertId = resolvedParams.id;

  const [expert, setExpert] = useState<ExpertProfile | null>(null);
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [following, setFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [activeTab, setActiveTab] = useState<"ALL" | "UPCOMING" | "RECORDED">("ALL");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchExpertData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch Expert Profile
        const expRes = await api.get(`/guidance/experts/${expertId}`);
        setExpert(expRes.data);
        setFollowing(expRes.data.is_following);
        setFollowersCount(expRes.data.followers_count);

        // Fetch All Sessions and filter for this expert
        const sessRes = await api.get("/guidance/sessions");
        const expertSessions = sessRes.data.filter(
          (s: any) =>
            s.expert_profile_id === expRes.data.id ||
            s.expert_user_id === expRes.data.user_id
        );
        setSessions(expertSessions);
      } catch (err: any) {
        console.error(err);
        setError(err.response?.data?.detail || "Failed to load expert profile.");
      } finally {
        setLoading(false);
      }
    };

    if (expertId) {
      fetchExpertData();
    }
  }, [expertId]);

  const handleToggleFollow = async () => {
    if (!expert) return;
    try {
      const res = await api.post(`/guidance/experts/${expert.id}/follow`);
      setFollowing(res.data.is_following);
      setFollowersCount(res.data.followers_count);
      setToastMsg(res.data.message);
      setTimeout(() => setToastMsg(null), 3500);
    } catch (err: any) {
      console.error(err);
      alert("Failed to follow: " + (err.response?.data?.detail || "Please log in."));
    }
  };

  const handleRegisterSession = async (sessionId: string, title: string) => {
    try {
      await api.post(`/guidance/sessions/${sessionId}/register`);
      setToastMsg(`Registered for "${title}"`);
      setTimeout(() => setToastMsg(null), 3500);
      setSessions((prev) =>
        prev.map((s) =>
          s.id === sessionId
            ? { ...s, is_registered: true, participants_count: s.participants_count + 1 }
            : s
        )
      );
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to register.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F9F4] dark:bg-[#0F1713]">
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 py-12 animate-pulse space-y-6">
          <div className="h-56 bg-[#2F6B4F]/10 rounded-3xl" />
          <div className="h-72 bg-[#2F6B4F]/5 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (error || !expert) {
    return (
      <div className="min-h-screen bg-[#F7F9F4] dark:bg-[#0F1713]">
        <Navbar />
        <div className="max-w-md mx-auto py-24 px-4 text-center space-y-4">
          <AlertCircle className="w-12 h-12 mx-auto text-[#C65353]" />
          <h2 className="text-xl font-bold font-serif-heading text-[#1B2A22] dark:text-[#E8F1EB]">
            {error || "Expert Profile Not Found"}
          </h2>
          <Link
            href="/student/sessions"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2F6B4F] text-white text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Sessions Discovery</span>
          </Link>
        </div>
      </div>
    );
  }

  const liveSessions = sessions.filter((s) => s.status === "LIVE");
  const upcomingSessions = sessions.filter((s) => s.status === "SCHEDULED");
  const recordedSessions = sessions.filter(
    (s) => s.status === "COMPLETED" && s.recording_available
  );

  const displayedSessions =
    activeTab === "UPCOMING"
      ? upcomingSessions
      : activeTab === "RECORDED"
      ? recordedSessions
      : sessions;

  return (
    <div className="min-h-screen bg-[#F7F9F4] dark:bg-[#0F1713] text-[#1B2A22] dark:text-[#E8F1EB] flex flex-col transition-colors duration-300">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-[#64736A] dark:text-[#A9B9AE]">
          <Link href="/student/sessions" className="hover:underline flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Sessions</span>
          </Link>
          <span>/</span>
          <span className="font-semibold text-[#1B2A22] dark:text-white">Expert Profile</span>
        </div>

        {toastMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700/50 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 shadow-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* ========================================================= */}
        {/* EXPERT PROFILE HERO CARD */}
        {/* ========================================================= */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#2F6B4F] via-[#24563F] to-[#173827] text-white p-6 sm:p-8 md:p-10 shadow-xl border border-[#2F6B4F]/40">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-[#C58A32]/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center gap-5">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-[#1b4331] to-[#3a8360] text-amber-300 font-serif-heading font-bold text-3xl sm:text-4xl flex items-center justify-center shadow-lg shrink-0 border border-emerald-400/30">
                {expert.full_name?.charAt(0) || "V"}
              </div>

              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-bold font-serif-heading text-white">
                    {expert.full_name}
                  </h1>
                  {expert.is_verified && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-[#E4B45D] border border-[#E4B45D]/40 text-xs font-semibold backdrop-blur-md">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{expert.verification_badge_title || "Verified Clinician"}</span>
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-[#DCE8DF] font-medium flex items-center gap-2">
                  <span>{expert.professional_title}</span>
                  <span>•</span>
                  <span>{expert.qualifications}</span>
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-emerald-100/90 pt-1">
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-[#E4B45D]" />
                    <span>{expert.institution_or_clinic}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-[#E4B45D]" />
                    <span>{expert.years_of_experience} Yrs Clinical Experience</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action CTAs */}
            <div className="flex flex-row md:flex-col items-center md:items-end gap-3 w-full md:w-auto shrink-0">
              <button
                onClick={handleToggleFollow}
                className={`w-full md:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer ${
                  following
                    ? "bg-white/20 hover:bg-white/30 text-white border border-white/30"
                    : "bg-[#C58A32] hover:bg-[#D49B4B] text-slate-950"
                }`}
              >
                {following ? (
                  <>
                    <UserCheck className="w-4 h-4 text-emerald-200" />
                    <span>Following</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Follow Expert</span>
                  </>
                )}
              </button>

              <Link
                href={`/doctor/${expert.user_id}`}
                className="w-full md:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/20 text-xs font-semibold transition-all"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Mentorship & OPD</span>
              </Link>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/15 text-center sm:text-left">
            <div className="space-y-0.5">
              <div className="text-[11px] uppercase tracking-wider text-[#DCE8DF]/80 font-semibold">
                Expert Rating
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-1 text-base font-bold text-white">
                <Star className="w-4 h-4 fill-amber-300 text-amber-300" />
                <span>{expert.average_rating.toFixed(1)}</span>
                <span className="text-xs font-normal text-emerald-200/70">
                  ({expert.total_ratings} reviews)
                </span>
              </div>
            </div>

            <div className="space-y-0.5">
              <div className="text-[11px] uppercase tracking-wider text-[#DCE8DF]/80 font-semibold">
                Bayesian Score
              </div>
              <div className="text-base font-bold text-amber-300">
                {expert.bayesian_score.toFixed(2)} / 5.0
              </div>
            </div>

            <div className="space-y-0.5">
              <div className="text-[11px] uppercase tracking-wider text-[#DCE8DF]/80 font-semibold">
                Student Followers
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-1 text-base font-bold text-white">
                <Users className="w-4 h-4 text-[#E4B45D]" />
                <span>{followersCount} Students</span>
              </div>
            </div>

            <div className="space-y-0.5">
              <div className="text-[11px] uppercase tracking-wider text-[#DCE8DF]/80 font-semibold">
                Masterclasses Hosted
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-1 text-base font-bold text-white">
                <Video className="w-4 h-4 text-[#E4B45D]" />
                <span>{expert.completed_sessions_count} Completed</span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* BIO & SPECIALIZATIONS */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Bio Card */}
            {expert.bio && (
              <div className="p-6 rounded-3xl bg-white dark:bg-[#17221C] border border-[#DCE4DE] dark:border-[#2B3A31] shadow-xs space-y-3">
                <h2 className="text-sm font-bold font-serif-heading text-[#1B2A22] dark:text-white uppercase tracking-wider">
                  About Dr. {expert.full_name}
                </h2>
                <p className="text-xs sm:text-sm text-[#64736A] dark:text-[#A9B9AE] leading-relaxed whitespace-pre-line">
                  {expert.bio}
                </p>
              </div>
            )}

            {/* Areas of Expertise */}
            {expert.areas_of_expertise?.length > 0 && (
              <div className="p-6 rounded-3xl bg-white dark:bg-[#17221C] border border-[#DCE4DE] dark:border-[#2B3A31] shadow-xs space-y-3">
                <h2 className="text-sm font-bold font-serif-heading text-[#1B2A22] dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#2F6B4F] dark:text-[#6FAF8A]" />
                  <span>Clinical & Research Specializations</span>
                </h2>
                <div className="flex flex-wrap gap-2">
                  {expert.areas_of_expertise.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-full bg-[#DCE8DF] dark:bg-[#26372D] text-[#2F6B4F] dark:text-[#6FAF8A] border border-[#2F6B4F]/20 text-xs font-semibold"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Teaching Subjects */}
            {expert.subjects?.length > 0 && (
              <div className="p-6 rounded-3xl bg-white dark:bg-[#17221C] border border-[#DCE4DE] dark:border-[#2B3A31] shadow-xs space-y-3">
                <h2 className="text-sm font-bold font-serif-heading text-[#1B2A22] dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#2F6B4F] dark:text-[#6FAF8A]" />
                  <span>Curriculum Subjects Taught</span>
                </h2>
                <div className="flex flex-wrap gap-2">
                  {expert.subjects.map((sub) => (
                    <span
                      key={sub}
                      className="px-3 py-1 rounded-full bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 text-xs font-medium"
                    >
                      {sub}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar: Quick Details */}
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-[#17221C] border border-[#DCE4DE] dark:border-[#2B3A31] shadow-xs space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#64736A] dark:text-[#A9B9AE]">
                Academic & Clinical Info
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <div className="text-[#64736A] dark:text-[#A9B9AE]">Primary Specialty</div>
                  <div className="font-semibold text-[#1B2A22] dark:text-white mt-0.5">
                    {expert.specialization}
                  </div>
                </div>

                <div>
                  <div className="text-[#64736A] dark:text-[#A9B9AE]">Institutional Affiliation</div>
                  <div className="font-semibold text-[#1B2A22] dark:text-white mt-0.5">
                    {expert.institution_or_clinic}
                  </div>
                </div>

                {expert.languages?.length > 0 && (
                  <div>
                    <div className="text-[#64736A] dark:text-[#A9B9AE]">Instruction Languages</div>
                    <div className="font-semibold text-[#1B2A22] dark:text-white mt-0.5">
                      {expert.languages.join(", ")}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Mentorship Banner */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-[#2F6B4F]/10 to-[#C58A32]/10 border border-[#2F6B4F]/20 dark:border-white/10 space-y-3">
              <div className="text-xs font-bold text-[#2F6B4F] dark:text-[#6FAF8A] uppercase tracking-wider">
                Need 1-on-1 Guidance?
              </div>
              <p className="text-xs text-[#64736A] dark:text-[#A9B9AE] leading-relaxed">
                Schedule an individual clinical case consultation or pulse diagnosis review with Dr. {expert.full_name}.
              </p>
              <Link
                href={`/doctor/${expert.user_id}`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2F6B4F] dark:text-[#6FAF8A] hover:underline"
              >
                <span>Request Mentorship OPD</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* SESSIONS & MASTERCLASSES HOSTED BY THIS EXPERT */}
        {/* ========================================================= */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold font-serif-heading text-[#1B2A22] dark:text-white">
                Masterclasses & Live Lectures ({sessions.length})
              </h2>
              <p className="text-xs text-[#64736A] dark:text-[#A9B9AE]">
                Interactive live broadcasts and high-yield recorded lectures by Dr. {expert.full_name}
              </p>
            </div>

            {/* Tab Controls */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white dark:bg-[#17221C] border border-[#DCE4DE] dark:border-[#2B3A31] text-xs">
              <button
                onClick={() => setActiveTab("ALL")}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  activeTab === "ALL"
                    ? "bg-[#2F6B4F] text-white shadow-xs"
                    : "text-[#64736A] dark:text-[#A9B9AE] hover:text-[#1B2A22]"
                }`}
              >
                All ({sessions.length})
              </button>
              <button
                onClick={() => setActiveTab("UPCOMING")}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  activeTab === "UPCOMING"
                    ? "bg-[#2F6B4F] text-white shadow-xs"
                    : "text-[#64736A] dark:text-[#A9B9AE] hover:text-[#1B2A22]"
                }`}
              >
                Upcoming ({upcomingSessions.length})
              </button>
              <button
                onClick={() => setActiveTab("RECORDED")}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  activeTab === "RECORDED"
                    ? "bg-[#2F6B4F] text-white shadow-xs"
                    : "text-[#64736A] dark:text-[#A9B9AE] hover:text-[#1B2A22]"
                }`}
              >
                Recordings ({recordedSessions.length})
              </button>
            </div>
          </div>

          {displayedSessions.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-[#17221C] rounded-3xl border border-dashed border-[#DCE4DE] dark:border-[#2B3A31] space-y-3">
              <Video className="w-12 h-12 mx-auto text-[#64736A]/50" />
              <h3 className="text-sm font-bold text-[#1B2A22] dark:text-white">
                No Sessions in this Category
              </h3>
              <p className="text-xs text-[#64736A] dark:text-[#A9B9AE]">
                Follow this expert to get notified whenever a new live lecture or masterclass is scheduled.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedSessions.map((sess) => {
                const isLive = sess.status === "LIVE";
                const isScheduled = sess.status === "SCHEDULED";
                const isCompleted = sess.status === "COMPLETED";

                return (
                  <div
                    key={sess.id}
                    className="flex flex-col justify-between rounded-3xl bg-white dark:bg-[#17221C] border border-[#DCE4DE] dark:border-[#2B3A31] p-5 shadow-xs hover:border-[#2F6B4F] hover:shadow-md transition-all group"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-[#2F6B4F] dark:text-[#6FAF8A] uppercase tracking-wider">
                          {sess.category}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isLive
                              ? "bg-rose-100 text-rose-700 animate-pulse flex items-center gap-1"
                              : isScheduled
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300"
                              : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300"
                          }`}
                        >
                          {isLive && <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />}
                          {sess.status}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold font-serif-heading text-[#1B2A22] dark:text-white group-hover:text-[#2F6B4F] transition-colors line-clamp-2">
                        {sess.title}
                      </h3>

                      <p className="text-xs text-[#64736A] dark:text-[#A9B9AE] line-clamp-2 leading-relaxed">
                        {sess.description}
                      </p>

                      <div className="pt-2 border-t border-slate-100 dark:border-white/5 space-y-1.5 text-xs text-[#64736A] dark:text-[#A9B9AE]">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#2F6B4F]" />
                          <span>{sess.scheduled_date}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#2F6B4F]" />
                          <span>{sess.start_time} ({sess.duration_minutes} mins)</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1 text-xs font-semibold text-[#1B2A22] dark:text-white">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{sess.average_rating.toFixed(1)}</span>
                      </div>

                      {isLive ? (
                        <Link
                          href={`/student/sessions/${sess.id}/live`}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>Join Live Room</span>
                        </Link>
                      ) : isScheduled ? (
                        sess.is_registered ? (
                          <span className="text-xs font-bold text-[#2F6B4F] dark:text-[#6FAF8A] flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Registered</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => handleRegisterSession(sess.id, sess.title)}
                            className="px-3 py-1.5 rounded-xl bg-[#2F6B4F] hover:bg-[#24563F] text-white font-bold text-xs cursor-pointer"
                          >
                            Register Free
                          </button>
                        )
                      ) : (
                        <Link
                          href={`/student/sessions/${sess.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#DCE8DF] dark:bg-[#26372D] text-[#2F6B4F] dark:text-[#6FAF8A] font-bold text-xs hover:bg-[#2F6B4F] hover:text-white transition-colors"
                        >
                          <PlayCircle className="w-3.5 h-3.5" />
                          <span>Watch Playback</span>
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
