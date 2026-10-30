"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import {
  Video,
  Radio,
  Users,
  MessageSquare,
  Send,
  ThumbsUp,
  Star,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Award,
  ArrowLeft,
  Share2,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  Settings,
  Sparkles,
  Heart,
  HelpCircle,
  StopCircle
} from "lucide-react";
import { api } from "@/lib/api";

interface QuestionItem {
  id: string;
  user_name: string;
  user_role: string;
  question_text: string;
  answer_text?: string;
  is_answered: boolean;
  upvotes_count: number;
  created_at: string;
}

export default function LiveSessionRoomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const sessionId = resolvedParams.id;

  const [session, setSession] = useState<any>(null);
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Q&A state
  const [newQuestion, setNewQuestion] = useState("");
  const [submittingQ, setSubmittingQ] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  // Stream simulation controls
  const [isMicOn, setIsMicOn] = useState(false);
  const [isCamOn, setIsCamOn] = useState(false);
  const [attendeeCount, setAttendeeCount] = useState(54);
  const [reactionsCount, setReactionsCount] = useState(128);

  const loadLiveRoom = async () => {
    try {
      setLoading(true);
      setError(null);
      // Join live room (records live attendance & marks eligibility to rate)
      const [sessRes, qRes] = await Promise.all([
        api.post(`/guidance/sessions/${sessionId}/join-live`),
        api.get(`/guidance/sessions/${sessionId}/questions`)
      ]);
      setSession(sessRes.data);
      setQuestions(qRes.data);
      setAttendeeCount(sessRes.data.current_live_attendees || 54);
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 401) {
        window.location.href = `/login?redirect=/student/sessions/${sessionId}/live`;
        return;
      }
      setError(err.response?.data?.detail || "Unable to join live classroom.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLiveRoom();
  }, [sessionId]);

  const handlePostQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;

    try {
      setSubmittingQ(true);
      const res = await api.post(`/guidance/sessions/${sessionId}/questions`, {
        question_text: newQuestion.trim()
      });
      setQuestions((prev) => [res.data, ...prev]);
      setNewQuestion("");
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || "Failed to post question.");
    } finally {
      setSubmittingQ(false);
    }
  };

  const handleToggleFollow = async () => {
    if (!session?.expert_user_id) return;
    try {
      setFollowLoading(true);
      const res = await api.post(`/guidance/experts/${session.expert_user_id}/follow`);
      setIsFollowing(res.data.is_following);
    } catch (err) {
      console.error(err);
    } finally {
      setFollowLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A120D] text-[#E8F1EB] flex flex-col selection:bg-[#2F6B4F] selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-[1440px] w-full mx-auto px-3 sm:px-6 py-4 sm:py-6 flex flex-col gap-4">
        
        {/* Top Live Bar */}
        <div className="flex items-center justify-between gap-4 pb-2 border-b border-white/10">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/student/sessions"
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer shrink-0"
              title="Return to Sessions Hub"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>

            <div className="flex items-center gap-2 min-w-0">
              <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 animate-pulse shrink-0">
                <Radio className="w-3.5 h-3.5" />
                <span>LIVE</span>
              </span>
              <h1 className="text-sm sm:text-base font-bold text-white truncate">
                {session?.title || "Clinical Live Stream"}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs text-rose-300 font-mono">
              <Users className="w-3.5 h-3.5" />
              <span>{attendeeCount} Attendees</span>
            </div>

            <button
              onClick={() => setReactionsCount((prev) => prev + 1)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold hover:bg-amber-500/30 transition-all cursor-pointer"
            >
              <Heart className="w-3.5 h-3.5 fill-current text-rose-400" />
              <span>{reactionsCount}</span>
            </button>
          </div>
        </div>

        {/* Main Grid: Video Stream (8 cols) + Real-time Q&A Sidebar (4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 flex-1">
          
          {/* LEFT 8 COLS: Video Player & Presenter Info */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            
            {/* Stream Canvas */}
            <div className="relative aspect-video w-full rounded-3xl bg-gradient-to-tr from-[#0E2F1F] via-[#153D2A] to-[#0D1E16] overflow-hidden border border-emerald-900/40 shadow-2xl flex flex-col justify-between p-4 sm:p-6">
              
              {/* Presenter Live Banner Overlay */}
              <div className="flex items-start justify-between gap-2 z-10">
                <div className="flex items-center gap-2.5 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-white/15">
                  <div className="w-8 h-8 rounded-full bg-[#2F6B4F] text-white flex items-center justify-center font-bold text-xs">
                    {session?.expert_name?.charAt(0) || "D"}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white flex items-center gap-1">
                      <span>{session?.expert_name || "Doctor Presenter"}</span>
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    </p>
                    <p className="text-[10px] text-emerald-300 font-medium">
                      {session?.category} • {session?.level}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/15 text-[11px] text-emerald-400 font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>HD 1080p Stream</span>
                </div>
              </div>

              {/* Center Clinical Presentation Graphic */}
              <div className="flex flex-col items-center justify-center text-center space-y-3 my-auto z-10">
                <div className="w-20 h-20 rounded-full bg-emerald-900/60 border-2 border-emerald-500/40 flex items-center justify-center shadow-lg shadow-emerald-900/50">
                  <Video className="w-8 h-8 text-emerald-300 animate-pulse" />
                </div>
                <div className="max-w-md">
                  <h3 className="text-base sm:text-lg font-bold font-serif-heading text-white">
                    {session?.title}
                  </h3>
                  <p className="text-xs text-[#A9B9AE] mt-1">
                    Live interactive transmission from {session?.institution || "Aayuraura Clinical Academy"}
                  </p>
                </div>
              </div>

              {/* Bottom Stream Controls Toolbar */}
              <div className="flex items-center justify-between gap-2 pt-2 z-10 bg-black/60 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/15">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsMicOn(!isMicOn)}
                    className={`p-2 rounded-xl text-xs transition-colors cursor-pointer ${
                      isMicOn ? "bg-emerald-600 text-white" : "bg-white/10 text-gray-400 hover:text-white"
                    }`}
                    title="Microphone (Listen / Talk in Q&A)"
                  >
                    {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => setIsCamOn(!isCamOn)}
                    className={`p-2 rounded-xl text-xs transition-colors cursor-pointer ${
                      isCamOn ? "bg-emerald-600 text-white" : "bg-white/10 text-gray-400 hover:text-white"
                    }`}
                    title="Camera"
                  >
                    {isCamOn ? <Camera className="w-4 h-4" /> : <CameraOff className="w-4 h-4" />}
                  </button>
                </div>

                <div className="text-[11px] text-gray-400 font-mono hidden sm:block">
                  Latency: 42ms • Bitrate: 4500 kbps
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/student/sessions/${sessionId}`}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-colors"
                  >
                    Session Overview
                  </Link>
                </div>
              </div>
            </div>

            {/* Presenter Detail Card */}
            <div className="p-5 rounded-3xl bg-[#17221C] border border-[#2B3A31] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-bold text-white">
                    {session?.expert_name}
                  </h4>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-300 text-[10.5px] font-bold border border-emerald-800">
                    Lead Faculty
                  </span>
                </div>
                <p className="text-xs text-[#A9B9AE]">
                  {session?.institution} • Specialization: {session?.category}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggleFollow}
                  disabled={followLoading}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isFollowing
                      ? "bg-[#26372D] text-[#6FAF8A] border border-[#2F6B4F]"
                      : "bg-[#2F6B4F] hover:bg-[#24563F] text-white"
                  }`}
                >
                  {followLoading ? "..." : isFollowing ? "Following" : "+ Follow Faculty"}
                </button>

                <Link
                  href={`/student/experts/${session?.expert_user_id || session?.expert_profile_id}`}
                  className="px-3.5 py-2 rounded-xl border border-white/20 hover:bg-white/10 text-xs font-semibold text-white"
                >
                  Full Profile
                </Link>
              </div>
            </div>
          </div>

          {/* RIGHT 4 COLS: Live Q&A and Chat Panel */}
          <div className="lg:col-span-4 rounded-3xl bg-[#17221C] border border-[#2B3A31] flex flex-col h-[520px] sm:h-[600px] overflow-hidden">
            
            {/* Q&A Header */}
            <div className="p-4 border-b border-[#2B3A31] flex items-center justify-between bg-[#121A16]">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#6FAF8A]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                  Live Q&A & Clinical Doubts
                </h3>
              </div>
              <span className="text-[11px] font-mono text-[#6FAF8A] font-semibold">
                {questions.length} Questions
              </span>
            </div>

            {/* Questions Feed */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y divide-[#2B3A31]/60">
              {questions.length === 0 ? (
                <div className="text-center py-16 text-xs text-[#A9B9AE] space-y-2">
                  <HelpCircle className="w-8 h-8 mx-auto text-emerald-600/60" />
                  <p className="font-semibold text-white">No questions asked yet.</p>
                  <p className="text-[11px]">Be the first student to ask a question to the doctor.</p>
                </div>
              ) : (
                questions.map((q) => (
                  <div key={q.id} className="pt-3 first:pt-0 space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-emerald-300">
                        {q.user_name} ({q.user_role})
                      </span>
                      {q.is_answered && (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 font-bold border border-emerald-800 text-[9.5px]">
                          ✓ ANSWERED
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-white leading-relaxed">
                      {q.question_text}
                    </p>

                    {q.answer_text && (
                      <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-800/60 space-y-1 text-xs">
                        <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block">
                          Doctor's Answer:
                        </span>
                        <p className="text-emerald-100">
                          {q.answer_text}
                        </p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Ask Question Box */}
            <form onSubmit={handlePostQuestion} className="p-3 border-t border-[#2B3A31] bg-[#121A16] flex gap-2">
              <input
                type="text"
                required
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="Ask clinical doubt to faculty..."
                className="flex-1 px-3.5 py-2 rounded-xl bg-white/10 border border-white/15 text-xs text-white placeholder-white/50 focus:outline-none focus:ring-1 focus:ring-[#6FAF8A]"
              />
              <button
                type="submit"
                disabled={submittingQ || !newQuestion.trim()}
                className="px-3.5 py-2 rounded-xl bg-[#2F6B4F] hover:bg-[#24563F] text-white text-xs font-bold disabled:opacity-50 transition-all flex items-center justify-center cursor-pointer shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

        </div>

      </main>
    </div>
  );
}
