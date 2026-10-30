"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import {
  Calendar,
  Clock,
  Video,
  User,
  Star,
  Sparkles,
  Search,
  Filter,
  Users,
  Award,
  BookOpen,
  Bell,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Play,
  Flame,
  Radio,
  Share2,
  ShieldCheck,
  Tag,
  GraduationCap
} from "lucide-react";
import { api } from "@/lib/api";

interface SessionItem {
  id: string;
  expert_user_id: string;
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
  duration_minutes: number;
  session_thumbnail?: string;
  status: "SCHEDULED" | "LIVE" | "COMPLETED" | "CANCELLED";
  live_stream_url?: string;
  current_live_attendees: number;
  recording_available: boolean;
  recording_url?: string;
  recording_duration: number;
  recording_views_count: number;
  average_rating: number;
  total_ratings: number;
  participants_count: number;
  is_registered?: boolean;
  has_attended_live?: boolean;
  has_watched_recording?: boolean;
  has_rated?: boolean;
  is_eligible_to_rate?: boolean;
  recommendation_reasons?: string[];
}

interface ExpertItem {
  id: string;
  user_id: string;
  full_name: string;
  role: string;
  professional_title: string;
  institution_or_clinic?: string;
  qualifications: string;
  specialization: string;
  areas_of_expertise: string[];
  languages: string[];
  years_of_experience: number;
  bio?: string;
  profile_photo_url?: string;
  is_verified: boolean;
  verification_badge_title: string;
  average_rating: number;
  total_ratings: number;
  completed_sessions_count: number;
  followers_count: number;
  bayesian_score: number;
  is_following?: boolean;
}

interface DiscoveryData {
  live_now: SessionItem[];
  recommended_sessions: SessionItem[];
  upcoming_sessions: SessionItem[];
  recently_recorded: SessionItem[];
  top_experts: ExpertItem[];
  followed_experts_sessions: SessionItem[];
  career_aligned_sessions: SessionItem[];
  popular_topics: string[];
}

const CATEGORIES = [
  "ALL",
  "Panchakarma",
  "Dravyaguna",
  "Kayachikitsa",
  "Clinical Practice",
  "Shalya Tantra",
  "Rasashastra",
  "Diagnostics",
  "Research"
];

export default function StudentSessionsDiscoveryPage() {
  const [discoveryData, setDiscoveryData] = useState<DiscoveryData | null>(null);
  const [allSessions, setAllSessions] = useState<SessionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"DISCOVERY" | "LIVE" | "UPCOMING" | "RECORDED" | "EXPERTS">("DISCOVERY");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedLevel, setSelectedLevel] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [followLoading, setFollowLoading] = useState<Record<string, boolean>>({});
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadDiscovery = async () => {
    try {
      setLoading(true);
      setError(null);
      const [discRes, allRes] = await Promise.all([
        api.get("/guidance/sessions/discovery"),
        api.get("/guidance/sessions")
      ]);
      setDiscoveryData(discRes.data);
      setAllSessions(allRes.data);
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 401) {
        window.location.href = "/login";
        return;
      }
      setError(err.response?.data?.detail || "Unable to load expert guidance feeds.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDiscovery();
  }, []);

  const handleToggleFollow = async (expertId: string, expertName: string) => {
    try {
      setFollowLoading((prev) => ({ ...prev, [expertId]: true }));
      const res = await api.post(`/guidance/experts/${expertId}/follow`);
      const { is_following, message } = res.data;

      setToastMsg(message);
      setTimeout(() => setToastMsg(null), 4000);

      // Update local state
      if (discoveryData) {
        setDiscoveryData({
          ...discoveryData,
          top_experts: discoveryData.top_experts.map((exp) =>
            exp.id === expertId || exp.user_id === expertId
              ? { ...exp, is_following, followers_count: is_following ? exp.followers_count + 1 : Math.max(0, exp.followers_count - 1) }
              : exp
          )
        });
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || "Failed to update follow status.");
    } finally {
      setFollowLoading((prev) => ({ ...prev, [expertId]: false }));
    }
  };

  const handleRegisterSession = async (sessionId: string, sessionTitle: string) => {
    try {
      await api.post(`/guidance/sessions/${sessionId}/register`);
      setToastMsg(`Successfully registered for "${sessionTitle}".`);
      setTimeout(() => setToastMsg(null), 4000);
      loadDiscovery();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || "Failed to register for session.");
    }
  };

  // Filtered Sessions for Browse Tabs
  const filteredSessions = allSessions.filter((sess) => {
    const matchesCat = selectedCategory === "ALL" || sess.category.toLowerCase().includes(selectedCategory.toLowerCase());
    const matchesLevel = selectedLevel === "ALL" || sess.level === selectedLevel;
    const matchesSearch =
      !searchQuery.trim() ||
      sess.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sess.expert_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sess.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sess.topics.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    if (activeTab === "LIVE") return sess.status === "LIVE" && matchesCat && matchesLevel && matchesSearch;
    if (activeTab === "UPCOMING") return sess.status === "SCHEDULED" && matchesCat && matchesLevel && matchesSearch;
    if (activeTab === "RECORDED") return sess.status === "COMPLETED" && sess.recording_available && matchesCat && matchesLevel && matchesSearch;
    return matchesCat && matchesLevel && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#F7F9F4] dark:bg-[#0F1713] text-[#1B2A22] dark:text-[#E8F1EB] flex flex-col selection:bg-[#2F6B4F] selection:text-white transition-colors duration-300">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* ========================================================= */}
        {/* HERO SECTION WITH SEARCH & SMART RECOMMENDATION CALLOUT */}
        {/* ========================================================= */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#2F6B4F] via-[#24563F] to-[#173827] text-white p-6 sm:p-8 md:p-10 shadow-xl border border-[#2F6B4F]/40">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-[#C58A32]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-amber-200">
              <Sparkles className="w-3.5 h-3.5 text-[#E4B45D]" />
              <span>Aayuraura Expert Guidance & Live Knowledge Engine</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-bold font-serif-heading tracking-tight leading-tight">
              Learn from India's Foremost <span className="text-[#E4B45D]">Ayurvedic Clinicians & Faculty</span>
            </h1>

            <p className="text-xs sm:text-sm text-[#DCE8DF] leading-relaxed max-w-2xl">
              Attend interactive live clinical demonstrations, stream high-yield recorded lectures, ask questions in real-time, and discover guidance personalized to your career roadmap.
            </p>

            {/* Quick Search Bar */}
            <div className="pt-2 flex flex-col sm:flex-row gap-2 max-w-xl">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-gray-300 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by topic, Panchakarma, herbs, doctor name..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 text-xs sm:text-sm text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#E4B45D]"
                />
              </div>
              <button
                onClick={() => setActiveTab("DISCOVERY")}
                className="px-5 py-2.5 rounded-xl bg-[#C58A32] hover:bg-[#D49B4B] text-slate-950 font-bold text-xs shadow-md transition-all shrink-0 cursor-pointer"
              >
                Search Sessions
              </button>
            </div>
          </div>
        </div>

        {/* Notifications & Toast Alert */}
        {toastMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs font-semibold flex items-center justify-between gap-3 shadow-md animate-in fade-in duration-150">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{toastMsg}</span>
            </div>
            <button onClick={() => setToastMsg(null)} className="text-xs underline opacity-80 cursor-pointer">Dismiss</button>
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-900 text-rose-900 dark:text-rose-200 text-xs font-semibold flex items-center gap-2 shadow-md">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* ========================================================= */}
        {/* NAVIGATION TABS & FILTER BAR */}
        {/* ========================================================= */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#DCE4DE] dark:border-[#2B3A31] pb-2 overflow-x-auto gap-3">
            <div className="flex items-center gap-2 shrink-0">
              {[
                { id: "DISCOVERY", label: "🎯 Discovery Hub" },
                { id: "LIVE", label: "🔥 Live Now" },
                { id: "UPCOMING", label: "📅 Upcoming Lectures" },
                { id: "RECORDED", label: "🎥 Recorded Library" },
                { id: "EXPERTS", label: "🌟 Top Experts" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer select-none ${
                    activeTab === tab.id
                      ? "bg-[#2F6B4F] dark:bg-[#6FAF8A] text-white dark:text-[#0F1713] shadow-md"
                      : "text-[#64736A] dark:text-[#A9B9AE] hover:bg-[#DCE8DF]/40 dark:hover:bg-[#26372D]/40 hover:text-[#2F6B4F] dark:hover:text-[#6FAF8A]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-[#DCE4DE] dark:border-[#2B3A31] bg-white dark:bg-[#17221C] text-xs font-medium text-[#1B2A22] dark:text-[#E8F1EB] focus:outline-none focus:ring-1 focus:ring-[#2F6B4F]"
              >
                <option value="ALL">All Levels</option>
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
            </div>
          </div>

          {/* Category Chips Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-[#C58A32] text-slate-950 font-bold shadow-xs"
                    : "bg-white dark:bg-[#17221C] border border-[#DCE4DE] dark:border-[#2B3A31] text-[#64736A] dark:text-[#A9B9AE] hover:border-[#2F6B4F] hover:text-[#2F6B4F]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* ========================================================= */}
        {/* TAB 1: DISCOVERY HUB (Multi-Section AI Feed) */}
        {/* ========================================================= */}
        {activeTab === "DISCOVERY" && (
          <div className="space-y-10">

            {/* 1. LIVE NOW BANNER & SESSIONS */}
            {discoveryData?.live_now && discoveryData.live_now.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-600" />
                    </span>
                    <h2 className="text-lg sm:text-xl font-bold font-serif-heading text-[#1B2A22] dark:text-white flex items-center gap-2">
                      <span>Live Sessions Broadcasting Now</span>
                    </h2>
                  </div>
                  <button onClick={() => setActiveTab("LIVE")} className="text-xs font-semibold text-[#2F6B4F] dark:text-[#6FAF8A] hover:underline cursor-pointer">
                    View all live &rarr;
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {discoveryData.live_now.map((sess) => (
                    <div
                      key={sess.id}
                      className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#FAF5E8] to-[#FFFFFF] dark:from-[#1D271E] dark:to-[#17221C] border-2 border-rose-500/40 dark:border-rose-500/30 shadow-lg flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-[10.5px] font-bold uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
                            <Radio className="w-3 h-3" />
                            <span>LIVE STREAM</span>
                          </span>
                          <span className="text-xs font-mono font-semibold text-rose-700 dark:text-rose-400 flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" />
                            <span>{sess.current_live_attendees} attending</span>
                          </span>
                        </div>

                        <h3 className="text-base sm:text-lg font-bold font-serif-heading text-[#1B2A22] dark:text-white leading-snug">
                          {sess.title}
                        </h3>

                        <p className="text-xs text-[#64736A] dark:text-[#A9B9AE] line-clamp-2">
                          {sess.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-[#527260] dark:text-emerald-300">
                          <span className="font-semibold text-[#2F6B4F] dark:text-[#6FAF8A]">
                            👨‍⚕️ {sess.expert_name}
                          </span>
                          <span>•</span>
                          <span>{sess.category}</span>
                          <span>•</span>
                          <span>{sess.duration_minutes} mins</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#DCE4DE] dark:border-[#2B3A31]">
                        <div className="flex items-center gap-1 text-xs text-[#C58A32] font-semibold">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span>{sess.average_rating} ({sess.total_ratings} reviews)</span>
                        </div>

                        <Link
                          href={`/student/sessions/${sess.id}/live`}
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all group cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Join Live Classroom</span>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 2. RECOMMENDED FOR YOU (Personalized Feed) */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#C58A32]" />
                    <h2 className="text-lg sm:text-xl font-bold font-serif-heading text-[#1B2A22] dark:text-white">
                      Recommended For You
                    </h2>
                  </div>
                  <p className="text-xs text-[#64736A] dark:text-[#A9B9AE]">
                    Curated dynamically from your target career, learning path, and followed faculties.
                  </p>
                </div>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-pulse">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-56 bg-[#DCE8DF]/40 dark:bg-[#26372D]/40 rounded-3xl" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {discoveryData?.recommended_sessions.slice(0, 6).map((sess) => (
                    <div
                      key={sess.id}
                      className="p-5 rounded-3xl bg-white dark:bg-[#17221C] border border-[#DCE4DE] dark:border-[#2B3A31] shadow-xs hover:shadow-md hover:border-[#2F6B4F] transition-all flex flex-col justify-between space-y-4 group"
                    >
                      <div className="space-y-2.5">
                        {/* Recommendation Reason Badges */}
                        {sess.recommendation_reasons && sess.recommendation_reasons.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {sess.recommendation_reasons.slice(0, 2).map((reason, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded-md bg-[#FAF0E1] dark:bg-[#332512] text-[#C58A32] dark:text-[#E4B45D] text-[10px] font-bold border border-[#C58A32]/20 line-clamp-1"
                              >
                                {reason}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-between gap-2 pt-1">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            sess.status === "LIVE"
                              ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                              : sess.status === "COMPLETED"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                              : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          }`}>
                            {sess.status === "COMPLETED" ? "Recorded" : sess.status}
                          </span>
                          <span className="text-[11px] text-[#64736A] dark:text-[#A9B9AE] font-mono">
                            {sess.level}
                          </span>
                        </div>

                        <h3 className="text-sm sm:text-base font-bold font-serif-heading text-[#1B2A22] dark:text-white group-hover:text-[#2F6B4F] dark:group-hover:text-[#6FAF8A] transition-colors line-clamp-2">
                          {sess.title}
                        </h3>

                        <p className="text-xs text-[#64736A] dark:text-[#A9B9AE] line-clamp-2">
                          {sess.description}
                        </p>

                        <div className="text-xs text-[#527260] dark:text-emerald-300 font-medium space-y-0.5">
                          <p>👨‍⚕️ <strong className="text-[#1B2A22] dark:text-white">{sess.expert_name}</strong></p>
                          <p className="text-[11px] text-[#64736A] dark:text-[#A9B9AE]">{sess.institution}</p>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-[#DCE4DE] dark:border-[#2B3A31] flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1 text-xs text-[#C58A32] font-semibold">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span>{sess.average_rating} ({sess.total_ratings})</span>
                        </div>

                        {sess.status === "LIVE" ? (
                          <Link
                            href={`/student/sessions/${sess.id}/live`}
                            className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs"
                          >
                            Join Live
                          </Link>
                        ) : sess.status === "COMPLETED" ? (
                          <Link
                            href={`/student/sessions/${sess.id}`}
                            className="px-3.5 py-1.5 rounded-xl bg-[#2F6B4F] dark:bg-[#6FAF8A] hover:bg-[#24563F] text-white dark:text-[#0F1713] text-xs font-bold transition-all"
                          >
                            Watch Recording
                          </Link>
                        ) : (
                          <Link
                            href={`/student/sessions/${sess.id}`}
                            className="px-3.5 py-1.5 rounded-xl border border-[#2F6B4F] text-[#2F6B4F] dark:text-[#6FAF8A] hover:bg-[#DCE8DF]/40 text-xs font-bold transition-all"
                          >
                            Details & RSVP
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* 3. TOP RATED AYURVEDIC EXPERTS */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#C58A32]" />
                  <h2 className="text-lg sm:text-xl font-bold font-serif-heading text-[#1B2A22] dark:text-white">
                    Top Rated Ayurvedic Faculty & Mentors
                  </h2>
                </div>
                <button onClick={() => setActiveTab("EXPERTS")} className="text-xs font-semibold text-[#2F6B4F] dark:text-[#6FAF8A] hover:underline cursor-pointer">
                  Browse all experts &rarr;
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {discoveryData?.top_experts.map((exp) => (
                  <div
                    key={exp.id}
                    className="p-5 rounded-3xl bg-white dark:bg-[#17221C] border border-[#DCE4DE] dark:border-[#2B3A31] shadow-xs hover:border-[#2F6B4F] transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-[#DCE8DF] dark:bg-[#26372D] text-[#2F6B4F] dark:text-[#6FAF8A] flex items-center justify-center font-bold text-base shrink-0 border border-[#2F6B4F]/20">
                          {exp.full_name.charAt(0)}
                        </div>
                        <div className="space-y-0.5 min-w-0">
                          <h4 className="text-sm font-bold text-[#1B2A22] dark:text-white truncate">
                            {exp.full_name}
                          </h4>
                          <p className="text-[11px] text-[#C58A32] font-semibold truncate">
                            {exp.specialization} • {exp.years_of_experience} yrs exp
                          </p>
                          <div className="flex items-center gap-1 text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            <span className="truncate">{exp.verification_badge_title}</span>
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-[#64736A] dark:text-[#A9B9AE] line-clamp-2">
                        {exp.bio || `${exp.professional_title} at ${exp.institution_or_clinic}`}
                      </p>

                      <div className="flex flex-wrap gap-1">
                        {exp.areas_of_expertise.slice(0, 3).map((area) => (
                          <span
                            key={area}
                            className="px-2 py-0.5 rounded-md bg-[#F7F9F4] dark:bg-white/5 border border-[#DCE4DE] dark:border-white/10 text-[10px] font-medium text-[#527260] dark:text-[#A9B9AE]"
                          >
                            {area}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#DCE4DE] dark:border-[#2B3A31] flex items-center justify-between gap-2">
                      <div className="text-xs space-y-0.5">
                        <div className="flex items-center gap-1 text-[#C58A32] font-bold">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span>{exp.average_rating}</span>
                          <span className="text-[10px] text-[#64736A] dark:text-[#A9B9AE] font-normal">({exp.total_ratings})</span>
                        </div>
                        <span className="text-[10.5px] text-[#64736A] dark:text-[#A9B9AE]">
                          {exp.followers_count} followers
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleFollow(exp.id, exp.full_name)}
                          disabled={followLoading[exp.id]}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            exp.is_following
                              ? "bg-[#DCE8DF] dark:bg-[#26372D] text-[#2F6B4F] dark:text-[#6FAF8A] border border-[#2F6B4F]/30"
                              : "bg-[#2F6B4F] dark:bg-[#6FAF8A] hover:bg-[#24563F] text-white dark:text-[#0F1713]"
                          }`}
                        >
                          {followLoading[exp.id] ? "..." : exp.is_following ? "Following" : "+ Follow"}
                        </button>

                        <Link
                          href={`/student/experts/${exp.id}`}
                          className="px-2.5 py-1.5 rounded-xl border border-[#DCE4DE] dark:border-[#2B3A31] hover:bg-[#F7F9F4] text-xs font-semibold"
                        >
                          Profile
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 4. RECENTLY RECORDED CLINICAL LECTURES */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Video className="w-4 h-4 text-[#2F6B4F] dark:text-[#6FAF8A]" />
                  <h2 className="text-lg sm:text-xl font-bold font-serif-heading text-[#1B2A22] dark:text-white">
                    Recently Recorded Masterclasses
                  </h2>
                </div>
                <button onClick={() => setActiveTab("RECORDED")} className="text-xs font-semibold text-[#2F6B4F] dark:text-[#6FAF8A] hover:underline cursor-pointer">
                  View library &rarr;
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                {discoveryData?.recently_recorded.map((sess) => (
                  <Link
                    key={sess.id}
                    href={`/student/sessions/${sess.id}`}
                    className="group rounded-3xl bg-white dark:bg-[#17221C] border border-[#DCE4DE] dark:border-[#2B3A31] overflow-hidden shadow-xs hover:shadow-lg hover:border-[#2F6B4F] transition-all flex flex-col"
                  >
                    <div className="relative h-36 sm:h-40 bg-gradient-to-tr from-[#1B3626] to-[#2D5A40] flex items-center justify-center p-4">
                      <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </div>
                      <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/70 text-white text-[10px] font-mono font-bold">
                        {sess.duration_minutes}m
                      </span>
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-[#C58A32] text-slate-950 text-[10px] font-bold">
                        {sess.category}
                      </span>
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div className="space-y-1.5">
                        <h4 className="text-sm font-bold font-serif-heading text-[#1B2A22] dark:text-white group-hover:text-[#2F6B4F] dark:group-hover:text-[#6FAF8A] transition-colors line-clamp-2">
                          {sess.title}
                        </h4>
                        <p className="text-xs text-[#64736A] dark:text-[#A9B9AE]">
                          {sess.expert_name}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-2 border-t border-[#DCE4DE] dark:border-[#2B3A31] text-[#64736A] dark:text-[#A9B9AE]">
                        <div className="flex items-center gap-1 text-[#C58A32] font-semibold">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span>{sess.average_rating} ({sess.total_ratings})</span>
                        </div>
                        <span>{sess.recording_views_count} views</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2, 3, 4: BROWSE SESSIONS (LIVE / UPCOMING / RECORDED) */}
        {/* ========================================================= */}
        {activeTab !== "DISCOVERY" && activeTab !== "EXPERTS" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-bold font-serif-heading text-[#1B2A22] dark:text-white">
                {activeTab === "LIVE" && "🔥 Live Broadcasts"}
                {activeTab === "UPCOMING" && "📅 Upcoming Scheduled Lectures"}
                {activeTab === "RECORDED" && "🎥 Recorded Masterclasses & Lectures"}
              </h2>
              <span className="text-xs text-[#64736A] dark:text-[#A9B9AE] font-mono">
                {filteredSessions.length} Sessions Found
              </span>
            </div>

            {filteredSessions.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-[#17221C] rounded-3xl border border-dashed border-[#DCE4DE] dark:border-[#2B3A31] space-y-3">
                <Calendar className="w-12 h-12 mx-auto text-[#64736A]" />
                <h3 className="text-base font-bold font-serif-heading text-[#1B2A22] dark:text-white">
                  No Sessions Found
                </h3>
                <p className="text-xs text-[#64736A] dark:text-[#A9B9AE] max-w-sm mx-auto">
                  Try clearing your search query or selecting a different subject filter.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredSessions.map((sess) => (
                  <div
                    key={sess.id}
                    className="p-5 rounded-3xl bg-white dark:bg-[#17221C] border border-[#DCE4DE] dark:border-[#2B3A31] shadow-xs hover:shadow-md hover:border-[#2F6B4F] transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10.5px] font-bold ${
                          sess.status === "LIVE"
                            ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                            : sess.status === "COMPLETED"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                            : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                        }`}>
                          {sess.status}
                        </span>
                        <span className="text-[11px] text-[#64736A] dark:text-[#A9B9AE] font-mono">
                          {sess.scheduled_date} • {sess.start_time}
                        </span>
                      </div>

                      <h3 className="text-base font-bold font-serif-heading text-[#1B2A22] dark:text-white line-clamp-2">
                        {sess.title}
                      </h3>

                      <p className="text-xs text-[#64736A] dark:text-[#A9B9AE] line-clamp-2">
                        {sess.description}
                      </p>

                      <div className="text-xs text-[#527260] dark:text-emerald-300 font-medium">
                        <p>👨‍⚕️ <strong className="text-[#1B2A22] dark:text-white">{sess.expert_name}</strong></p>
                        <p className="text-[11px] text-[#64736A] dark:text-[#A9B9AE]">{sess.institution}</p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#DCE4DE] dark:border-[#2B3A31] flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1 text-xs text-[#C58A32] font-semibold">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>{sess.average_rating} ({sess.total_ratings})</span>
                      </div>

                      {sess.status === "LIVE" ? (
                        <Link
                          href={`/student/sessions/${sess.id}/live`}
                          className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs"
                        >
                          Join Live
                        </Link>
                      ) : sess.status === "COMPLETED" ? (
                        <Link
                          href={`/student/sessions/${sess.id}`}
                          className="px-3.5 py-1.5 rounded-xl bg-[#2F6B4F] dark:bg-[#6FAF8A] hover:bg-[#24563F] text-white dark:text-[#0F1713] text-xs font-bold transition-all"
                        >
                          Watch Recording
                        </Link>
                      ) : (
                        <Link
                          href={`/student/sessions/${sess.id}`}
                          className="px-3.5 py-1.5 rounded-xl border border-[#2F6B4F] text-[#2F6B4F] dark:text-[#6FAF8A] hover:bg-[#DCE8DF]/40 text-xs font-bold transition-all"
                        >
                          Register / View
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: ALL EXPERTS DIRECTORY */}
        {/* ========================================================= */}
        {activeTab === "EXPERTS" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-bold font-serif-heading text-[#1B2A22] dark:text-white">
                🌟 Ayurvedic Faculty & Clinical Mentors
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {discoveryData?.top_experts.map((exp) => (
                <div
                  key={exp.id}
                  className="p-5 rounded-3xl bg-white dark:bg-[#17221C] border border-[#DCE4DE] dark:border-[#2B3A31] shadow-xs hover:border-[#2F6B4F] transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#DCE8DF] dark:bg-[#26372D] text-[#2F6B4F] dark:text-[#6FAF8A] flex items-center justify-center font-bold text-base shrink-0">
                        {exp.full_name.charAt(0)}
                      </div>
                      <div className="space-y-0.5 min-w-0">
                        <h4 className="text-sm font-bold text-[#1B2A22] dark:text-white truncate">
                          {exp.full_name}
                        </h4>
                        <p className="text-[11px] text-[#C58A32] font-semibold truncate">
                          {exp.specialization} • {exp.years_of_experience} yrs exp
                        </p>
                        <div className="flex items-center gap-1 text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          <span className="truncate">{exp.verification_badge_title}</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-[#64736A] dark:text-[#A9B9AE] line-clamp-2">
                      {exp.bio || `${exp.professional_title} at ${exp.institution_or_clinic}`}
                    </p>

                    <div className="flex flex-wrap gap-1">
                      {exp.areas_of_expertise.map((area) => (
                        <span
                          key={area}
                          className="px-2 py-0.5 rounded-md bg-[#F7F9F4] dark:bg-white/5 border border-[#DCE4DE] dark:border-white/10 text-[10px] font-medium text-[#527260] dark:text-[#A9B9AE]"
                        >
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#DCE4DE] dark:border-[#2B3A31] flex items-center justify-between gap-2">
                    <div className="text-xs space-y-0.5">
                      <div className="flex items-center gap-1 text-[#C58A32] font-bold">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>{exp.average_rating}</span>
                        <span className="text-[10px] text-[#64736A] dark:text-[#A9B9AE] font-normal">({exp.total_ratings})</span>
                      </div>
                      <span className="text-[10.5px] text-[#64736A] dark:text-[#A9B9AE]">
                        {exp.completed_sessions_count} lectures • {exp.followers_count} followers
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleFollow(exp.id, exp.full_name)}
                        disabled={followLoading[exp.id]}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          exp.is_following
                            ? "bg-[#DCE8DF] dark:bg-[#26372D] text-[#2F6B4F] dark:text-[#6FAF8A] border border-[#2F6B4F]/30"
                            : "bg-[#2F6B4F] dark:bg-[#6FAF8A] hover:bg-[#24563F] text-white dark:text-[#0F1713]"
                        }`}
                      >
                        {followLoading[exp.id] ? "..." : exp.is_following ? "Following" : "+ Follow"}
                      </button>

                      <Link
                        href={`/student/experts/${exp.id}`}
                        className="px-2.5 py-1.5 rounded-xl border border-[#DCE4DE] dark:border-[#2B3A31] hover:bg-[#F7F9F4] text-xs font-semibold"
                      >
                        Profile
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
