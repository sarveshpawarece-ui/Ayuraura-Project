"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import {
  Calendar,
  Clock,
  Video,
  MapPin,
  User,
  Plus,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ExternalLink,
  Filter,
  X,
  Send,
  MessageSquare,
  Sparkles,
  PlayCircle,
  Upload,
  Radio,
  Star,
  Users,
  Award,
  ChevronRight,
  TrendingUp,
  BarChart2,
  Tag,
  ShieldCheck,
  Eye
} from "lucide-react";
import { api } from "@/lib/api";

// 1-on-1 Mentorship Session Item
interface MentorshipSessionItem {
  id: string;
  doctor_user_id: string;
  student_user_id: string;
  doctor_name: string;
  student_name: string;
  title: string;
  purpose: string;
  session_type: string;
  meeting_mode: string;
  meeting_link?: string;
  location?: string;
  scheduled_date: string;
  start_time: string;
  duration_minutes: number;
  notes?: string;
  status: string;
  cancellation_reason?: string;
  created_at: string;
}

// Masterclass / Live Lecture Item
interface ExpertLectureItem {
  id: string;
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
  max_students?: number;
  language: string;
  session_thumbnail?: string;
  learning_objectives: string[];
  status: "SCHEDULED" | "LIVE" | "COMPLETED" | "CANCELLED";
  live_stream_url?: string;
  current_live_attendees: number;
  recording_available: boolean;
  recording_url?: string;
  recording_duration?: number;
  recording_views_count: number;
  average_rating: number;
  total_ratings: number;
  participants_count: number;
}

interface DoctorExpertProfile {
  id: string;
  user_id: string;
  full_name: string;
  professional_title: string;
  institution_or_clinic: string;
  specialization: string;
  average_rating: number;
  total_ratings: number;
  completed_sessions_count: number;
  followers_count: number;
  bayesian_score: number;
}

const CATEGORIES = [
  "Kayachikitsa (Internal Medicine)",
  "Panchakarma (Detoxification)",
  "Dravyaguna (Herbal Pharmacology)",
  "Shalya Tantra (Surgical Techniques)",
  "Shalakya Tantra (ENT & Ophthalmology)",
  "Prasuti & Stri Roga (Obstetrics & Gynecology)",
  "Kaumarbhritya (Pediatrics)",
  "Agada Tantra (Toxicology)",
  "Rasashastra & Bhasma Standardization",
  "Nadi Pariksha & Pulse Diagnosis",
  "Ayurvedic Clinical Research & Formulations"
];

const LEVELS = [
  { value: "BEGINNER", label: "Beginner (BAMS 1st/2nd Year)" },
  { value: "INTERMEDIATE", label: "Intermediate (BAMS 3rd/Final Year)" },
  { value: "ADVANCED", label: "Advanced (Interns & PG Scholars)" },
  { value: "CLINICAL_RESEARCH", label: "Clinical Specialists & Practitioners" }
];

function DoctorSessionsContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  const [activeMainTab, setActiveMainTab] = useState<"MASTERCLASSES" | "MENTORSHIP" | "ANALYTICS">("MASTERCLASSES");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Data States
  const [doctorProfile, setDoctorProfile] = useState<DoctorExpertProfile | null>(null);
  const [expertLectures, setExpertLectures] = useState<ExpertLectureItem[]>([]);
  const [mentorshipSessions, setMentorshipSessions] = useState<MentorshipSessionItem[]>([]);
  const [mentorshipStatusFilter, setMentorshipStatusFilter] = useState("ALL");
  const [lectureFilter, setLectureFilter] = useState<"ALL" | "LIVE" | "UPCOMING" | "RECORDED">("ALL");

  // Modals
  const [showCreateLiveModal, setShowCreateLiveModal] = useState(false);
  const [showUploadRecordedModal, setShowUploadRecordedModal] = useState(false);
  const [showScheduleMentorshipModal, setShowScheduleMentorshipModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [cancellationReason, setCancellationReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Live Lecture Form State
  const [lectureTitle, setLectureTitle] = useState("");
  const [lectureDesc, setLectureDesc] = useState("");
  const [lectureCategory, setLectureCategory] = useState(CATEGORIES[0]);
  const [lectureLevel, setLectureLevel] = useState("ADVANCED");
  const [lectureDate, setLectureDate] = useState("");
  const [lectureStartTime, setLectureStartTime] = useState("18:00");
  const [lectureDuration, setLectureDuration] = useState(60);
  const [lectureMaxStudents, setLectureMaxStudents] = useState(250);
  const [lectureStreamUrl, setLectureStreamUrl] = useState("https://www.youtube.com/embed/live_stream?channel=AYURSETU");
  const [lectureObjectives, setLectureObjectives] = useState("");
  const [lectureTopics, setLectureTopics] = useState("");

  // Recorded Lecture Form State
  const [recTitle, setRecTitle] = useState("");
  const [recDesc, setRecDesc] = useState("");
  const [recCategory, setRecCategory] = useState(CATEGORIES[0]);
  const [recLevel, setRecLevel] = useState("ADVANCED");
  const [recVideoUrl, setRecVideoUrl] = useState("https://www.w3schools.com/html/mov_bbb.mp4");
  const [recDurationMins, setRecDurationMins] = useState(45);
  const [recTopics, setRecTopics] = useState("");
  const [recObjectives, setRecObjectives] = useState("");

  // 1-on-1 Mentorship Form State
  const [studentUserId, setStudentUserId] = useState("");
  const [mentorTitle, setMentorTitle] = useState("Ayurvedic Clinical Mentorship Session");
  const [mentorPurpose, setMentorPurpose] = useState("Mentorship");
  const [mentorMeetingMode, setMentorMeetingMode] = useState("Online");
  const [mentorMeetingLink, setMentorMeetingLink] = useState("https://meet.google.com/ayu-setu-demo");
  const [mentorLocation, setMentorLocation] = useState("");
  const [mentorDate, setMentorDate] = useState("");
  const [mentorTime, setMentorTime] = useState("10:00 AM");
  const [mentorDuration, setMentorDuration] = useState(45);
  const [mentorNotes, setMentorNotes] = useState("");

  useEffect(() => {
    if (tabParam) {
      const lower = tabParam.toLowerCase();
      if (lower === "mentorship") {
        setActiveMainTab("MENTORSHIP");
      } else if (lower === "analytics") {
        setActiveMainTab("ANALYTICS");
      } else if (lower === "live") {
        setActiveMainTab("MASTERCLASSES");
        setLectureFilter("LIVE");
      } else if (lower === "recorded") {
        setActiveMainTab("MASTERCLASSES");
        setLectureFilter("RECORDED");
      } else if (lower === "upcoming") {
        setActiveMainTab("MASTERCLASSES");
        setLectureFilter("UPCOMING");
      } else if (lower === "create") {
        setActiveMainTab("MASTERCLASSES");
        setShowCreateLiveModal(true);
      } else if (lower === "upload") {
        setActiveMainTab("MASTERCLASSES");
        setShowUploadRecordedModal(true);
      }
    }
  }, [tabParam]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Fetch Doctor's Expert Profile
      try {
        const feedRes = await api.get("/guidance/sessions/discovery");
        if (feedRes.data.top_experts?.length > 0) {
          // If profile found
          setDoctorProfile(feedRes.data.top_experts[0]);
        }
      } catch (e) {
        // Fallback
      }

      // 2. Fetch All Masterclasses & Lectures
      try {
        const sessRes = await api.get("/guidance/sessions");
        setExpertLectures(sessRes.data);
      } catch (e) {
        console.error("Failed to load lectures:", e);
      }

      // 3. Fetch 1-on-1 Mentorship Sessions
      try {
        const mentorRes = await api.get(`/doctors/sessions?status=${mentorshipStatusFilter}`);
        setMentorshipSessions(mentorRes.data);
      } catch (e) {
        console.error("Failed to load mentorship sessions:", e);
      }
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 401) {
        window.location.href = "/login";
        return;
      }
      setError(err.response?.data?.detail || "Unable to fetch sessions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [mentorshipStatusFilter]);

  // Handler: Create Live Session
  const handleCreateLiveLecture = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lectureTitle.trim() || !lectureDate) {
      setError("Please fill all required lecture fields.");
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const payload = {
        title: lectureTitle.trim(),
        description: lectureDesc.trim() || "Live Clinical Demonstration & Case Analysis by Ayurvedic Faculty.",
        session_type: "LIVE_LECTURE",
        category: lectureCategory,
        topics: lectureTopics ? lectureTopics.split(",").map((t) => t.trim()) : [lectureCategory],
        level: lectureLevel,
        scheduled_date: lectureDate,
        start_time: lectureStartTime,
        duration_minutes: Number(lectureDuration),
        max_students: Number(lectureMaxStudents),
        language: "English / Hindi",
        live_stream_url: lectureStreamUrl.trim(),
        learning_objectives: lectureObjectives
          ? lectureObjectives.split("\n").map((o) => o.trim()).filter(Boolean)
          : ["Master clinical protocols", "Examine authentic case studies", "Interactive Q&A"]
      };

      await api.post("/guidance/sessions", payload);
      setSuccessMsg(`Live session "${lectureTitle}" scheduled successfully!`);
      setShowCreateLiveModal(false);
      setLectureTitle("");
      setLectureDesc("");
      loadAllData();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || "Failed to create live session.");
    } finally {
      setSubmitting(false);
    }
  };

  // Handler: Upload Recorded Session
  const handleUploadRecordedLecture = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recTitle.trim() || !recVideoUrl.trim()) {
      setError("Please provide title and video URL.");
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const payload = {
        title: recTitle.trim(),
        description: recDesc.trim() || "Comprehensive clinical masterclass recording with practical case discussions.",
        category: recCategory,
        topics: recTopics ? recTopics.split(",").map((t) => t.trim()) : [recCategory],
        level: recLevel,
        recording_url: recVideoUrl.trim(),
        recording_duration_seconds: Number(recDurationMins) * 60,
        language: "English / Hindi",
        learning_objectives: recObjectives
          ? recObjectives.split("\n").map((o) => o.trim()).filter(Boolean)
          : ["Diagnostic algorithms", "Formulation dosages & timings", "Contraindications"]
      };

      await api.post("/guidance/sessions/upload-recorded", payload);
      setSuccessMsg(`Recorded masterclass "${recTitle}" published to student discovery feed!`);
      setShowUploadRecordedModal(false);
      setRecTitle("");
      setRecDesc("");
      loadAllData();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || "Failed to publish recorded lecture.");
    } finally {
      setSubmitting(false);
    }
  };

  // Handler: Live Status Transition (Go Live / End Session)
  const handleUpdateLectureStatus = async (sessionId: string, newStatus: string) => {
    try {
      setError(null);
      setSuccessMsg(null);

      await api.put(`/guidance/sessions/${sessionId}/status`, {
        status: newStatus,
        recording_available: newStatus === "COMPLETED"
      });

      setSuccessMsg(`Session broadcast updated to: ${newStatus}`);
      loadAllData();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || "Failed to update broadcast status.");
    }
  };

  // Handler: 1-on-1 Mentorship Submit
  const handleScheduleMentorshipSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentUserId.trim()) {
      setError("Please provide a Student ID or Student User ID.");
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const payload = {
        student_user_id: studentUserId.trim(),
        title: mentorTitle,
        purpose: mentorPurpose,
        session_type: "Clinical Mentorship",
        meeting_mode: mentorMeetingMode,
        meeting_link: mentorMeetingMode === "Online" ? mentorMeetingLink : undefined,
        location: mentorMeetingMode === "Offline" ? mentorLocation : undefined,
        scheduled_date: mentorDate || new Date().toISOString().split("T")[0],
        start_time: mentorTime,
        duration_minutes: Number(mentorDuration),
        notes: mentorNotes
      };

      await api.post("/doctors/sessions", payload);
      setSuccessMsg("Mentorship session scheduled successfully!");
      setShowScheduleMentorshipModal(false);
      loadAllData();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || "Failed to schedule mentorship session.");
    } finally {
      setSubmitting(false);
    }
  };

  // Handler: Update 1-on-1 Status
  const handleMentorshipStatusChange = async (sessionId: string, newStatus: string, reason?: string) => {
    try {
      setError(null);
      setSuccessMsg(null);
      await api.put(`/doctors/sessions/${sessionId}/status`, {
        status: newStatus,
        cancellation_reason: reason
      });
      setSuccessMsg(`Session status updated to ${newStatus}.`);
      if (showCancelModal) setShowCancelModal(false);
      loadAllData();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || "Failed to update session status.");
    }
  };

  const filteredLectures = expertLectures.filter((s) => {
    if (lectureFilter === "LIVE") return s.status === "LIVE";
    if (lectureFilter === "UPCOMING") return s.status === "SCHEDULED";
    if (lectureFilter === "RECORDED") return s.status === "COMPLETED" && s.recording_available;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#F7F9F4] dark:bg-[#0F1713] text-[#1B2A22] dark:text-[#E8F1EB] flex flex-col transition-colors duration-300">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* ========================================================= */}
        {/* HEADER & ACTION BUTTONS */}
        {/* ========================================================= */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-[#64736A] dark:text-[#A9B9AE]">
              <Link href="/doctor/dashboard" className="hover:underline">Doctor Dashboard</Link>
              <span>/</span>
              <span className="font-bold text-[#1B2A22] dark:text-white">Expert Sessions & Studio</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif-heading text-[#1B2A22] dark:text-white">
              Live Lectures, Masterclasses & Mentorship Studio
            </h1>
          </div>

          {/* Creation CTAs */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => {
                setLectureDate(new Date().toISOString().split("T")[0]);
                setShowCreateLiveModal(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2F6B4F] hover:bg-[#24563F] text-white text-xs font-bold shadow-md transition-all cursor-pointer"
            >
              <Radio className="w-4 h-4 text-emerald-300" />
              <span>Schedule Live Lecture</span>
            </button>

            <button
              onClick={() => setShowUploadRecordedModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#C58A32] hover:bg-[#D49B4B] text-slate-950 text-xs font-bold shadow-md transition-all cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Recording</span>
            </button>

            <button
              onClick={() => {
                setMentorDate(new Date().toISOString().split("T")[0]);
                setShowScheduleMentorshipModal(true);
              }}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#17221C] border border-[#DCE4DE] dark:border-[#2B3A31] text-[#1B2A22] dark:text-white text-xs font-semibold hover:border-[#2F6B4F] transition-all cursor-pointer"
            >
              <User className="w-4 h-4 text-[#2F6B4F]" />
              <span>1-on-1 Mentorship</span>
            </button>
          </div>
        </div>

        {/* Alerts & Notifications */}
        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700/50 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-700/50 text-rose-800 dark:text-rose-300 text-xs font-semibold flex items-center gap-2 shadow-xs">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* ========================================================= */}
        {/* TOP LEVEL NAVIGATION TABS */}
        {/* ========================================================= */}
        <div className="flex items-center gap-2 border-b border-[#DCE4DE] dark:border-[#2B3A31] pb-2 text-xs sm:text-sm font-semibold">
          <button
            onClick={() => setActiveMainTab("MASTERCLASSES")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer ${
              activeMainTab === "MASTERCLASSES"
                ? "bg-[#2F6B4F] text-white shadow-xs"
                : "text-[#64736A] dark:text-[#A9B9AE] hover:bg-white dark:hover:bg-[#17221C]"
            }`}
          >
            <Video className="w-4 h-4" />
            <span>Live Lectures & Masterclasses ({expertLectures.length})</span>
          </button>

          <button
            onClick={() => setActiveMainTab("MENTORSHIP")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer ${
              activeMainTab === "MENTORSHIP"
                ? "bg-[#2F6B4F] text-white shadow-xs"
                : "text-[#64736A] dark:text-[#A9B9AE] hover:bg-white dark:hover:bg-[#17221C]"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>1-on-1 Mentorship Requests ({mentorshipSessions.length})</span>
          </button>

          <button
            onClick={() => setActiveMainTab("ANALYTICS")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer ${
              activeMainTab === "ANALYTICS"
                ? "bg-[#2F6B4F] text-white shadow-xs"
                : "text-[#64736A] dark:text-[#A9B9AE] hover:bg-white dark:hover:bg-[#17221C]"
            }`}
          >
            <Star className="w-4 h-4" />
            <span>Ratings & Student Reviews</span>
          </button>
        </div>

        {/* ========================================================= */}
        {/* TAB 1: MASTERCLASSES & LIVE STUDIO */}
        {/* ========================================================= */}
        {activeMainTab === "MASTERCLASSES" && (
          <div className="space-y-6">
            {/* Filter Pills */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                {(["ALL", "LIVE", "UPCOMING", "RECORDED"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setLectureFilter(f)}
                    className={`px-3.5 py-1.5 rounded-full font-bold transition-all cursor-pointer ${
                      lectureFilter === f
                        ? "bg-[#2F6B4F] text-white shadow-xs"
                        : "bg-white dark:bg-[#17221C] border border-[#DCE4DE] dark:border-[#2B3A31] text-[#64736A] dark:text-[#A9B9AE] hover:bg-slate-50"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              <div className="text-xs text-[#64736A] dark:text-[#A9B9AE] hidden sm:block font-medium">
                Showing {filteredLectures.length} sessions
              </div>
            </div>

            {loading ? (
              <div className="space-y-4 animate-pulse">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-36 bg-[#2F6B4F]/5 rounded-3xl" />
                ))}
              </div>
            ) : filteredLectures.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-[#17221C] rounded-3xl border border-dashed border-[#DCE4DE] dark:border-[#2B3A31] space-y-3">
                <Video className="w-12 h-12 mx-auto text-[#64736A]/50" />
                <h3 className="text-base font-bold font-serif-heading text-[#1B2A22] dark:text-white">
                  No Lectures in this View
                </h3>
                <p className="text-xs text-[#64736A] dark:text-[#A9B9AE] max-w-md mx-auto">
                  Click <strong>"Schedule Live Lecture"</strong> to broadcast to thousands of Ayurvedic students or <strong>"Upload Recording"</strong> to build your permanent clinical video library.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredLectures.map((sess) => {
                  const isLive = sess.status === "LIVE";
                  const isScheduled = sess.status === "SCHEDULED";
                  const isCompleted = sess.status === "COMPLETED";

                  return (
                    <div
                      key={sess.id}
                      className="p-6 rounded-3xl bg-white dark:bg-[#17221C] border border-[#DCE4DE] dark:border-[#2B3A31] shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 hover:border-[#2F6B4F] transition-all"
                    >
                      <div className="space-y-2.5 max-w-2xl">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              isLive
                                ? "bg-rose-100 text-rose-700 animate-pulse flex items-center gap-1.5"
                                : isScheduled
                                ? "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300"
                                : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300"
                            }`}
                          >
                            {isLive && <span className="w-2 h-2 rounded-full bg-rose-600" />}
                            {sess.status}
                          </span>

                          <span className="text-xs font-bold text-[#2F6B4F] dark:text-[#6FAF8A]">
                            {sess.category} • {sess.level}
                          </span>
                        </div>

                        <h3 className="text-base sm:text-lg font-bold font-serif-heading text-[#1B2A22] dark:text-white">
                          {sess.title}
                        </h3>

                        <p className="text-xs text-[#64736A] dark:text-[#A9B9AE] leading-relaxed line-clamp-2">
                          {sess.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-[#64736A] dark:text-[#A9B9AE] pt-1">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-[#2F6B4F]" />
                            <span>{sess.scheduled_date}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-[#2F6B4F]" />
                            <span>{sess.start_time} ({sess.duration_minutes} mins)</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-[#2F6B4F]" />
                            <span>{sess.participants_count} Enrolled {isLive && `(${sess.current_live_attendees} Live Now)`}</span>
                          </div>
                          {sess.total_ratings > 0 && (
                            <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold">
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              <span>{sess.average_rating.toFixed(1)} ({sess.total_ratings} reviews)</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Doctor Broadcast Action Controls */}
                      <div className="flex flex-col sm:flex-row lg:flex-col items-stretch lg:items-end gap-2 shrink-0 w-full lg:w-auto">
                        {isLive && (
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/student/sessions/${sess.id}/live`}
                              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all"
                            >
                              <Video className="w-3.5 h-3.5" />
                              <span>Open Live Broadcast Room</span>
                            </Link>
                            <button
                              onClick={() => handleUpdateLectureStatus(sess.id, "COMPLETED")}
                              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs cursor-pointer"
                            >
                              End Stream
                            </button>
                          </div>
                        )}

                        {isScheduled && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleUpdateLectureStatus(sess.id, "LIVE")}
                              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                            >
                              <Radio className="w-3.5 h-3.5" />
                              <span>Start Broadcast (Go Live)</span>
                            </button>
                            <button
                              onClick={() => handleUpdateLectureStatus(sess.id, "CANCELLED")}
                              className="px-3 py-2 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-semibold cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        )}

                        {isCompleted && (
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/student/sessions/${sess.id}`}
                              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#DCE8DF] dark:bg-[#26372D] text-[#2F6B4F] dark:text-[#6FAF8A] font-bold text-xs hover:bg-[#2F6B4F] hover:text-white transition-colors"
                            >
                              <PlayCircle className="w-3.5 h-3.5" />
                              <span>View Lecture & Q&A</span>
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: 1-ON-1 MENTORSHIP SESSIONS */}
        {/* ========================================================= */}
        {activeMainTab === "MENTORSHIP" && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              {["ALL", "SCHEDULED", "CONFIRMED", "COMPLETED", "CANCELLED"].map((f) => (
                <button
                  key={f}
                  onClick={() => setMentorshipStatusFilter(f)}
                  className={`px-3.5 py-1.5 rounded-full font-semibold transition-all cursor-pointer ${
                    mentorshipStatusFilter === f
                      ? "bg-[#2F6B4F] text-white shadow-xs"
                      : "bg-white dark:bg-[#17221C] border border-[#DCE4DE] dark:border-[#2B3A31] text-[#64736A] dark:text-[#A9B9AE] hover:bg-[#DCE8DF]"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {mentorshipSessions.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-[#17221C] rounded-3xl border border-dashed border-[#DCE4DE] dark:border-[#2B3A31] space-y-3">
                <Calendar className="w-12 h-12 mx-auto text-[#64736A]/50" />
                <h3 className="text-base font-bold font-serif-heading text-[#1B2A22] dark:text-white">
                  No 1-on-1 Mentorship Sessions Found
                </h3>
                <p className="text-xs text-[#64736A] dark:text-[#A9B9AE] max-w-sm mx-auto">
                  Schedule direct 1-on-1 clinical case consultations or pulse diagnosis reviews with student candidates.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {mentorshipSessions.map((sess) => {
                  const isScheduled = sess.status === "SCHEDULED" || sess.status === "REQUESTED";
                  const isConfirmed = sess.status === "CONFIRMED";
                  const isCompleted = sess.status === "COMPLETED";
                  const isCancelled = sess.status === "CANCELLED";

                  return (
                    <div
                      key={sess.id}
                      className="p-6 rounded-3xl bg-white dark:bg-[#17221C] border border-[#DCE4DE] dark:border-[#2B3A31] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-[#2F6B4F] transition-all"
                    >
                      <div className="space-y-2 max-w-2xl">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              isConfirmed
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300"
                                : isCompleted
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300"
                                : isCancelled
                                ? "bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300"
                                : "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300"
                            }`}
                          >
                            {sess.status}
                          </span>
                          <span className="text-xs font-bold text-[#2F6B4F] dark:text-[#6FAF8A]">
                            {sess.session_type} • {sess.purpose}
                          </span>
                        </div>

                        <h3 className="text-base sm:text-lg font-bold font-serif-heading text-[#1B2A22] dark:text-white">
                          {sess.title}
                        </h3>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-[#64736A] dark:text-[#A9B9AE]">
                          <div className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-[#2F6B4F]" />
                            <span>Student: <strong className="text-[#1B2A22] dark:text-white">{sess.student_name}</strong></span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-[#2F6B4F]" />
                            <span>{sess.scheduled_date}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-[#2F6B4F]" />
                            <span>{sess.start_time} ({sess.duration_minutes} mins)</span>
                          </div>
                        </div>

                        {sess.notes && (
                          <p className="text-xs text-[#64736A] dark:text-[#A9B9AE] bg-slate-50 dark:bg-white/5 p-2.5 rounded-xl">
                            Notes: {sess.notes}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row md:flex-col items-stretch md:items-end gap-2 shrink-0 w-full md:w-auto">
                        {sess.meeting_mode === "Online" && sess.meeting_link && (
                          <a
                            href={sess.meeting_link}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#2F6B4F] text-white font-bold text-xs hover:bg-[#24563F] transition-all shadow-xs"
                          >
                            <Video className="w-3.5 h-3.5" />
                            <span>Join Meeting</span>
                          </a>
                        )}

                        <div className="flex items-center gap-2">
                          {isScheduled && (
                            <button
                              onClick={() => handleMentorshipStatusChange(sess.id, "CONFIRMED")}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer"
                            >
                              Confirm
                            </button>
                          )}
                          {isConfirmed && (
                            <button
                              onClick={() => handleMentorshipStatusChange(sess.id, "COMPLETED")}
                              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all cursor-pointer"
                            >
                              Mark Completed
                            </button>
                          )}
                          {!isCompleted && !isCancelled && (
                            <button
                              onClick={() => {
                                setSelectedSessionId(sess.id);
                                setShowCancelModal(true);
                              }}
                              className="px-3 py-1.5 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-semibold transition-all cursor-pointer"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: RATINGS & PERFORMANCE ANALYTICS */}
        {/* ========================================================= */}
        {activeMainTab === "ANALYTICS" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 rounded-3xl bg-white dark:bg-[#17221C] border border-[#DCE4DE] dark:border-[#2B3A31] shadow-xs space-y-2">
                <div className="text-xs uppercase tracking-wider text-[#64736A] dark:text-[#A9B9AE] font-semibold">
                  Overall Rating
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
                  <span className="text-2xl font-bold font-serif-heading text-[#1B2A22] dark:text-white">
                    {doctorProfile?.average_rating?.toFixed(1) || "4.9"}
                  </span>
                  <span className="text-xs text-[#64736A]">/ 5.0</span>
                </div>
                <p className="text-[11px] text-[#64736A]">
                  Across {doctorProfile?.total_ratings || 48} verified student reviews
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-white dark:bg-[#17221C] border border-[#DCE4DE] dark:border-[#2B3A31] shadow-xs space-y-2">
                <div className="text-xs uppercase tracking-wider text-[#64736A] dark:text-[#A9B9AE] font-semibold">
                  Bayesian Quality Score
                </div>
                <div className="text-2xl font-bold font-serif-heading text-[#2F6B4F] dark:text-[#6FAF8A]">
                  {doctorProfile?.bayesian_score?.toFixed(2) || "4.82"}
                </div>
                <p className="text-[11px] text-[#64736A]">
                  Confidence-weighted ranking across platform
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-white dark:bg-[#17221C] border border-[#DCE4DE] dark:border-[#2B3A31] shadow-xs space-y-2">
                <div className="text-xs uppercase tracking-wider text-[#64736A] dark:text-[#A9B9AE] font-semibold">
                  Student Followers
                </div>
                <div className="text-2xl font-bold font-serif-heading text-[#1B2A22] dark:text-white">
                  {doctorProfile?.followers_count || 128}
                </div>
                <p className="text-[11px] text-[#64736A]">
                  Direct alerts when you host new live sessions
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-white dark:bg-[#17221C] border border-[#DCE4DE] dark:border-[#2B3A31] shadow-xs space-y-2">
                <div className="text-xs uppercase tracking-wider text-[#64736A] dark:text-[#A9B9AE] font-semibold">
                  Masterclasses Hosted
                </div>
                <div className="text-2xl font-bold font-serif-heading text-[#1B2A22] dark:text-white">
                  {expertLectures.length}
                </div>
                <p className="text-[11px] text-[#64736A]">
                  {expertLectures.reduce((acc, s) => acc + (s.recording_views_count || 0), 0)} total views
                </p>
              </div>
            </div>

            {/* Categorical Breakdown */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#17221C] border border-[#DCE4DE] dark:border-[#2B3A31] shadow-xs space-y-4">
              <h3 className="text-base font-bold font-serif-heading text-[#1B2A22] dark:text-white">
                Multi-Category Teaching Metrics Breakdown
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { title: "Clinical Knowledge Depth", score: 4.9, pct: 98 },
                  { title: "Teaching & Explanation Quality", score: 4.8, pct: 96 },
                  { title: "Conceptual Clarity", score: 4.9, pct: 98 },
                  { title: "Practical Application Value", score: 4.9, pct: 98 },
                  { title: "Student Engagement & Q&A", score: 4.7, pct: 94 },
                  { title: "Relevance to Exam / Practice", score: 4.8, pct: 96 }
                ].map((m) => (
                  <div key={m.title} className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#1B2A22] dark:text-white">{m.title}</span>
                      <span className="font-bold text-[#2F6B4F] dark:text-[#6FAF8A]">{m.score} / 5.0</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#2F6B4F] to-[#6FAF8A] rounded-full"
                        style={{ width: `${m.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODAL 1: SCHEDULE LIVE LECTURE */}
        {/* ========================================================= */}
        {showCreateLiveModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <div className="w-full max-w-2xl bg-white dark:bg-[#17221C] rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#DCE4DE] dark:border-[#2B3A31] space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
                <h3 className="text-lg font-bold font-serif-heading text-[#1B2A22] dark:text-white flex items-center gap-2">
                  <Radio className="w-5 h-5 text-[#2F6B4F]" />
                  <span>Schedule Live Masterclass Lecture</span>
                </h3>
                <button
                  onClick={() => setShowCreateLiveModal(false)}
                  className="text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateLiveLecture} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#64736A] dark:text-[#A9B9AE] mb-1">
                    Lecture Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={lectureTitle}
                    onChange={(e) => setLectureTitle(e.target.value)}
                    placeholder="e.g. Clinical Mastery: Panchakarma Protocols for Chronic Autoimmune Disorders"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE4DE] dark:border-[#2B3A31] bg-white dark:bg-[#0F1713] text-xs sm:text-sm text-[#1B2A22] dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#64736A] dark:text-[#A9B9AE] mb-1">
                      Ayurvedic Category / Discipline *
                    </label>
                    <select
                      value={lectureCategory}
                      onChange={(e) => setLectureCategory(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-[#DCE4DE] dark:border-[#2B3A31] bg-white dark:bg-[#0F1713] text-xs text-[#1B2A22] dark:text-white"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#64736A] dark:text-[#A9B9AE] mb-1">
                      Audience Level *
                    </label>
                    <select
                      value={lectureLevel}
                      onChange={(e) => setLectureLevel(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-[#DCE4DE] dark:border-[#2B3A31] bg-white dark:bg-[#0F1713] text-xs text-[#1B2A22] dark:text-white"
                    >
                      {LEVELS.map((lvl) => (
                        <option key={lvl.value} value={lvl.value}>{lvl.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#64736A] dark:text-[#A9B9AE] mb-1">
                      Scheduled Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={lectureDate}
                      onChange={(e) => setLectureDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#DCE4DE] dark:border-[#2B3A31] bg-white dark:bg-[#0F1713] text-xs text-[#1B2A22] dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#64736A] dark:text-[#A9B9AE] mb-1">
                      Start Time (24h / IST) *
                    </label>
                    <input
                      type="text"
                      required
                      value={lectureStartTime}
                      onChange={(e) => setLectureStartTime(e.target.value)}
                      placeholder="18:00"
                      className="w-full px-3 py-2 rounded-xl border border-[#DCE4DE] dark:border-[#2B3A31] bg-white dark:bg-[#0F1713] text-xs text-[#1B2A22] dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#64736A] dark:text-[#A9B9AE] mb-1">
                      Duration (Minutes) *
                    </label>
                    <input
                      type="number"
                      required
                      min={15}
                      max={240}
                      value={lectureDuration}
                      onChange={(e) => setLectureDuration(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-[#DCE4DE] dark:border-[#2B3A31] bg-white dark:bg-[#0F1713] text-xs text-[#1B2A22] dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#64736A] dark:text-[#A9B9AE] mb-1">
                    Live Stream / WebRTC Video URL
                  </label>
                  <input
                    type="url"
                    value={lectureStreamUrl}
                    onChange={(e) => setLectureStreamUrl(e.target.value)}
                    placeholder="https://youtube.com/live/... or https://meet.google.com/..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE4DE] dark:border-[#2B3A31] bg-white dark:bg-[#0F1713] text-xs text-[#1B2A22] dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#64736A] dark:text-[#A9B9AE] mb-1">
                    Session Description
                  </label>
                  <textarea
                    rows={3}
                    value={lectureDesc}
                    onChange={(e) => setLectureDesc(e.target.value)}
                    placeholder="Overview of clinical cases, patient presentation videos, and diagnosis steps..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE4DE] dark:border-[#2B3A31] bg-white dark:bg-[#0F1713] text-xs text-[#1B2A22] dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#64736A] dark:text-[#A9B9AE] mb-1">
                    Learning Objectives (1 per line)
                  </label>
                  <textarea
                    rows={3}
                    value={lectureObjectives}
                    onChange={(e) => setLectureObjectives(e.target.value)}
                    placeholder="Understand Snehana & Swedana dosage titration&#10;Analyze authentic case studies&#10;Evaluate patient recovery markers"
                    className="w-full px-3.5 py-2 rounded-xl border border-[#DCE4DE] dark:border-[#2B3A31] bg-white dark:bg-[#0F1713] text-xs text-[#1B2A22] dark:text-white"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowCreateLiveModal(false)}
                    className="px-4 py-2 rounded-xl border border-[#D5DED8] dark:border-[#304036] bg-[#EEF4EF] dark:bg-[#223128] hover:bg-[#D5DED8] dark:hover:bg-[#304036] text-[#526158] dark:text-[#C1CEC5] text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2.5 rounded-xl bg-[#2F6B4F] text-white text-xs font-bold hover:bg-[#24563F] disabled:opacity-60"
                  >
                    {submitting ? "Publishing..." : "Schedule Live Lecture"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODAL 2: UPLOAD RECORDED MASTERCLASS */}
        {/* ========================================================= */}
        {showUploadRecordedModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <div className="w-full max-w-2xl bg-white dark:bg-[#17221C] rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#DCE4DE] dark:border-[#2B3A31] space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
                <h3 className="text-lg font-bold font-serif-heading text-[#1B2A22] dark:text-white flex items-center gap-2">
                  <Upload className="w-5 h-5 text-[#C58A32]" />
                  <span>Upload & Publish Recorded Masterclass</span>
                </h3>
                <button
                  onClick={() => setShowUploadRecordedModal(false)}
                  className="text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUploadRecordedLecture} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#64736A] dark:text-[#A9B9AE] mb-1">
                    Masterclass Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={recTitle}
                    onChange={(e) => setRecTitle(e.target.value)}
                    placeholder="e.g. Masterclass: Nadi Pariksha & Pulse Diagnosis in Critical Care"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE4DE] dark:border-[#2B3A31] bg-white dark:bg-[#0F1713] text-xs sm:text-sm text-[#1B2A22] dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#64736A] dark:text-[#A9B9AE] mb-1">
                      Discipline / Category *
                    </label>
                    <select
                      value={recCategory}
                      onChange={(e) => setRecCategory(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-[#DCE4DE] dark:border-[#2B3A31] bg-white dark:bg-[#0F1713] text-xs text-[#1B2A22] dark:text-white"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#64736A] dark:text-[#A9B9AE] mb-1">
                      Audience Level *
                    </label>
                    <select
                      value={recLevel}
                      onChange={(e) => setRecLevel(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-[#DCE4DE] dark:border-[#2B3A31] bg-white dark:bg-[#0F1713] text-xs text-[#1B2A22] dark:text-white"
                    >
                      {LEVELS.map((lvl) => (
                        <option key={lvl.value} value={lvl.value}>{lvl.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#64736A] dark:text-[#A9B9AE] mb-1">
                      Video Stream / MP4 URL *
                    </label>
                    <input
                      type="url"
                      required
                      value={recVideoUrl}
                      onChange={(e) => setRecVideoUrl(e.target.value)}
                      placeholder="https://... or YouTube video link"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE4DE] dark:border-[#2B3A31] bg-white dark:bg-[#0F1713] text-xs text-[#1B2A22] dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#64736A] dark:text-[#A9B9AE] mb-1">
                      Video Duration (Minutes) *
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={360}
                      value={recDurationMins}
                      onChange={(e) => setRecDurationMins(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE4DE] dark:border-[#2B3A31] bg-white dark:bg-[#0F1713] text-xs text-[#1B2A22] dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#64736A] dark:text-[#A9B9AE] mb-1">
                    Description & Overview
                  </label>
                  <textarea
                    rows={3}
                    value={recDesc}
                    onChange={(e) => setRecDesc(e.target.value)}
                    placeholder="Provide detailed breakdown of cases and herbal pharmacology covered in this recording..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE4DE] dark:border-[#2B3A31] bg-white dark:bg-[#0F1713] text-xs text-[#1B2A22] dark:text-white"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowUploadRecordedModal(false)}
                    className="px-4 py-2 rounded-xl border border-[#D5DED8] dark:border-[#304036] bg-[#EEF4EF] dark:bg-[#223128] hover:bg-[#D5DED8] dark:hover:bg-[#304036] text-[#526158] dark:text-[#C1CEC5] text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2.5 rounded-xl bg-[#C58A32] hover:bg-[#D49B4B] text-slate-950 text-xs font-bold disabled:opacity-60"
                  >
                    {submitting ? "Publishing..." : "Publish Masterclass"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODAL 3: 1-ON-1 MENTORSHIP SESSION */}
        {/* ========================================================= */}
        {showScheduleMentorshipModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <div className="w-full max-w-xl bg-white dark:bg-[#17221C] rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#DCE4DE] dark:border-[#2B3A31] space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
                <h3 className="text-base font-bold font-serif-heading text-[#1B2A22] dark:text-white flex items-center gap-2">
                  <User className="w-5 h-5 text-[#2F6B4F]" />
                  <span>Schedule 1-on-1 Mentorship</span>
                </h3>
                <button
                  onClick={() => setShowScheduleMentorshipModal(false)}
                  className="text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleScheduleMentorshipSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[#64736A] dark:text-[#A9B9AE] mb-1">
                    Student User ID / Email *
                  </label>
                  <input
                    type="text"
                    required
                    value={studentUserId}
                    onChange={(e) => setStudentUserId(e.target.value)}
                    placeholder="Enter Student UUID or ID from application / chat"
                    className="w-full px-3.5 py-2 rounded-xl border border-[#DCE4DE] dark:border-[#2B3A31] bg-white dark:bg-[#0F1713] text-xs text-[#1B2A22] dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#64736A] dark:text-[#A9B9AE] mb-1">
                    Session Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={mentorTitle}
                    onChange={(e) => setMentorTitle(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#DCE4DE] dark:border-[#2B3A31] bg-white dark:bg-[#0F1713] text-xs text-[#1B2A22] dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#64736A] dark:text-[#A9B9AE] mb-1">
                      Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={mentorDate}
                      onChange={(e) => setMentorDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#DCE4DE] dark:border-[#2B3A31] bg-white dark:bg-[#0F1713] text-xs text-[#1B2A22] dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#64736A] dark:text-[#A9B9AE] mb-1">
                      Time *
                    </label>
                    <input
                      type="text"
                      required
                      value={mentorTime}
                      onChange={(e) => setMentorTime(e.target.value)}
                      placeholder="10:00 AM"
                      className="w-full px-3 py-2 rounded-xl border border-[#DCE4DE] dark:border-[#2B3A31] bg-white dark:bg-[#0F1713] text-xs text-[#1B2A22] dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#64736A] dark:text-[#A9B9AE] mb-1">
                    Google Meet / Zoom URL
                  </label>
                  <input
                    type="url"
                    value={mentorMeetingLink}
                    onChange={(e) => setMentorMeetingLink(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#DCE4DE] dark:border-[#2B3A31] bg-white dark:bg-[#0F1713] text-xs text-[#1B2A22] dark:text-white"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowScheduleMentorshipModal(false)}
                    className="px-4 py-2 rounded-xl border border-[#D5DED8] dark:border-[#304036] bg-[#EEF4EF] dark:bg-[#223128] hover:bg-[#D5DED8] dark:hover:bg-[#304036] text-[#526158] dark:text-[#C1CEC5] text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2.5 rounded-xl bg-[#2F6B4F] text-white text-xs font-bold hover:bg-[#24563F] disabled:opacity-60"
                  >
                    {submitting ? "Scheduling..." : "Schedule Mentorship"}
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

export default function DoctorSessionsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-500 font-medium">Loading Sessions...</div>}>
      <DoctorSessionsContent />
    </Suspense>
  );
}
