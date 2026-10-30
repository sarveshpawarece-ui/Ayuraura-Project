"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  Flag,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Send,
  HelpCircle,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Compass,
  Layers,
  Award
} from "lucide-react";
import { api } from "@/lib/api";

interface Option {
  id: string;
  text: string;
}

interface Question {
  id: string;
  subject_name: string;
  topic_name: string;
  subtopic_name?: string;
  difficulty: string;
  question_type: string;
  question_text: string;
  options: Option[];
  tags: string[];
}

interface AttemptData {
  attempt_id: string;
  subject_name: string;
  topic_name: string;
  subtopic_name?: string;
  difficulty_mode: string;
  total_questions: number;
  questions: Question[];
  started_at: string;
}

export default function ActiveQuizRoomPage() {
  const params = useParams();
  const router = useRouter();
  const attemptId = params?.id as string;

  // Attempt & Questions
  const [attempt, setAttempt] = useState<AttemptData | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({}); // question_id -> selected_option_text
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<string, boolean>>({});

  // Loading & submission
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Timer
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    async function loadAttempt() {
      if (!attemptId) return;
      try {
        setLoading(true);
        setErrorMsg(null);
        const res = await api.get(`/quiz/attempts/${attemptId}`);
        const data: AttemptData = res.data;
        setAttempt(data);

        // Start timer
        timerRef.current = setInterval(() => {
          setSecondsElapsed((prev) => prev + 1);
        }, 1000);
      } catch (err: any) {
        console.error("Error loading attempt:", err);
        setErrorMsg(err.response?.data?.detail || "Could not load quiz attempt.");
      } finally {
        setLoading(false);
      }
    }

    loadAttempt();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [attemptId]);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSelectOption = (questionId: string, optionText: string) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: optionText,
    }));
  };

  const toggleFlag = (questionId: string) => {
    setFlaggedQuestions((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  const handleClearAnswer = (questionId: string) => {
    setUserAnswers((prev) => {
      const updated = { ...prev };
      delete updated[questionId];
      return updated;
    });
  };

  const handleSubmitQuiz = async () => {
    if (!attempt) return;
    setSubmitting(true);
    try {
      // Build answers array
      const answersPayload = attempt.questions.map((q) => ({
        question_id: q.id,
        selected_option: userAnswers[q.id] || null,
      }));

      const res = await api.post(`/quiz/attempts/${attemptId}/submit`, {
        answers: answersPayload,
        time_taken_seconds: secondsElapsed,
      });

      // Save latest result in sessionStorage for instant retrieval if desired
      if (typeof window !== "undefined") {
        sessionStorage.setItem(`quiz_result_${attemptId}`, JSON.stringify(res.data));
      }

      router.push(`/student/quiz/${attemptId}/result`);
    } catch (err: any) {
      console.error("Quiz submission error:", err);
      setErrorMsg(err.response?.data?.detail || "Failed to submit quiz. Please try again.");
      setSubmitting(false);
      setShowSubmitModal(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F9F4] dark:bg-[#0F1713] text-[#1B2A22] dark:text-[#E8F1EB] flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border-4 border-[#2F6B4F] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-bold text-[#64736A] dark:text-[#A9B9AE]">
              Loading your topic-bounded quiz...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (errorMsg && !attempt) {
    return (
      <div className="min-h-screen bg-[#F7F9F4] dark:bg-[#0F1713] text-[#1B2A22] dark:text-[#E8F1EB] flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 max-w-lg mx-auto p-6 flex items-center justify-center">
          <div className="p-6 rounded-3xl bg-white dark:bg-[#17221C] border border-[#DCE4DE] dark:border-[#2B3A31] text-center space-y-4 shadow-sm w-full">
            <ShieldAlert className="w-12 h-12 text-red-500 mx-auto" />
            <h2 className="text-lg font-bold">Unable to Load Quiz</h2>
            <p className="text-xs text-[#64736A] dark:text-[#A9B9AE]">{errorMsg}</p>
            <Link
              href="/student/quiz"
              className="inline-block px-5 py-2.5 rounded-xl bg-[#2F6B4F] text-white text-xs font-bold"
            >
              Return to Topic Quiz Hub
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!attempt || attempt.questions.length === 0) {
    return null;
  }

  const currentQ = attempt.questions[currentIndex];
  const totalQ = attempt.questions.length;
  const answeredCount = Object.keys(userAnswers).length;
  const progressPct = Math.round((answeredCount / totalQ) * 100);

  return (
    <div className="min-h-screen bg-[#F7F9F4] dark:bg-[#0F1713] text-[#1B2A22] dark:text-[#E8F1EB] flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* TOP BAR: BREADCRUMBS, TIMER & SUBMIT BUTTON */}
        <div className="rounded-3xl bg-white dark:bg-[#17221C] border border-[#DCE4DE] dark:border-[#2B3A31] p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-[#2F6B4F] dark:text-[#6FAF8A]">
              <span>{attempt.subject_name}</span>
              <span>›</span>
              <span className="text-[#1B2A22] dark:text-[#E8F1EB]">{attempt.topic_name}</span>
              {attempt.subtopic_name && (
                <>
                  <span>›</span>
                  <span className="text-[#64736A] dark:text-[#A9B9AE]">{attempt.subtopic_name}</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#DCE8DF] dark:bg-[#26372D] text-[#2F6B4F] dark:text-[#6FAF8A]">
                {attempt.difficulty_mode} Mode
              </span>
              <span className="text-xs text-[#64736A] dark:text-[#A9B9AE]">
                Question {currentIndex + 1} of {totalQ}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 justify-between sm:justify-end">
            {/* Live Timer */}
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-[#F7F9F4] dark:bg-[#0F1713] border border-[#DCE4DE] dark:border-[#2B3A31] font-mono text-sm font-bold text-[#1B2A22] dark:text-[#E8F1EB]">
              <Clock className="w-4 h-4 text-[#C58A32]" />
              <span>{formatTimer(secondsElapsed)}</span>
            </div>

            {/* Finish & Submit Trigger */}
            <button
              type="button"
              onClick={() => setShowSubmitModal(true)}
              className="px-5 py-2 rounded-2xl bg-[#2F6B4F] hover:bg-[#24563F] dark:bg-[#6FAF8A] dark:hover:bg-[#8BC4A2] text-white dark:text-[#0F1713] text-xs font-bold shadow-sm transition-all flex items-center gap-2"
            >
              <Send className="w-3.5 h-3.5" /> Submit Quiz
            </button>
          </div>
        </div>

        {/* PROGRESS BAR */}
        <div className="w-full bg-[#DCE4DE] dark:bg-[#2B3A31] h-2 rounded-full overflow-hidden">
          <div
            className="bg-[#2F6B4F] dark:bg-[#6FAF8A] h-full transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* MAIN QUESTION WORKSPACE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* QUESTION BOX (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="rounded-3xl bg-white dark:bg-[#17221C] border border-[#DCE4DE] dark:border-[#2B3A31] p-6 sm:p-8 shadow-sm space-y-6">
              {/* Question Header */}
              <div className="flex items-center justify-between border-b border-[#DCE4DE] dark:border-[#2B3A31] pb-4">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-xl bg-[#2F6B4F] text-white dark:bg-[#6FAF8A] dark:text-[#0F1713] text-xs font-extrabold">
                    Q{currentIndex + 1}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#64736A] dark:text-[#A9B9AE]">
                    {currentQ.question_type.replace(/_/g, " ")}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => toggleFlag(currentQ.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    flaggedQuestions[currentQ.id]
                      ? "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800"
                      : "bg-[#F7F9F4] dark:bg-[#0F1713] text-[#64736A] dark:text-[#A9B9AE] border border-[#DCE4DE] dark:border-[#2B3A31] hover:text-[#1B2A22]"
                  }`}
                >
                  <Flag className="w-3.5 h-3.5 fill-current" />
                  {flaggedQuestions[currentQ.id] ? "Flagged for Review" : "Flag Question"}
                </button>
              </div>

              {/* Question Text */}
              <div className="text-base sm:text-lg font-bold text-[#1B2A22] dark:text-[#E8F1EB] leading-relaxed">
                {currentQ.question_text}
              </div>

              {/* Options List */}
              <div className="space-y-3 pt-2">
                {currentQ.options.map((opt, optIdx) => {
                  const letter = String.fromCharCode(65 + optIdx);
                  const isSelected = userAnswers[currentQ.id] === opt.text;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleSelectOption(currentQ.id, opt.text)}
                      className={`w-full p-4 rounded-2xl border text-left transition-all flex items-start gap-3.5 ${
                        isSelected
                          ? "bg-[#DCE8DF]/40 dark:bg-[#26372D]/60 border-[#2F6B4F] dark:border-[#6FAF8A] shadow-sm ring-1 ring-[#2F6B4F] dark:ring-[#6FAF8A]"
                          : "bg-[#F7F9F4] dark:bg-[#0F1713] border-[#DCE4DE] dark:border-[#2B3A31] hover:border-[#2F6B4F]/50 text-[#1B2A22] dark:text-[#E8F1EB]"
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
                          isSelected
                            ? "bg-[#2F6B4F] text-white dark:bg-[#6FAF8A] dark:text-[#0F1713]"
                            : "bg-white dark:bg-[#17221C] border border-[#DCE4DE] dark:border-[#2B3A31] text-[#64736A] dark:text-[#A9B9AE]"
                        }`}
                      >
                        {letter}
                      </div>
                      <div className="text-sm font-semibold text-[#1B2A22] dark:text-[#E8F1EB] mt-0.5 leading-snug">
                        {opt.text}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-between border-t border-[#DCE4DE] dark:border-[#2B3A31] pt-5">
                <div>
                  {userAnswers[currentQ.id] && (
                    <button
                      type="button"
                      onClick={() => handleClearAnswer(currentQ.id)}
                      className="text-xs text-[#C65353] font-bold hover:underline"
                    >
                      Clear Selection
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={currentIndex === 0}
                    onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                    className="px-4 py-2 rounded-xl bg-[#F7F9F4] dark:bg-[#0F1713] border border-[#DCE4DE] dark:border-[#2B3A31] text-xs font-bold text-[#1B2A22] dark:text-[#E8F1EB] disabled:opacity-40 flex items-center gap-1.5"
                  >
                    <ChevronLeft className="w-4 h-4" /> Previous
                  </button>

                  {currentIndex < totalQ - 1 ? (
                    <button
                      type="button"
                      onClick={() => setCurrentIndex((prev) => Math.min(totalQ - 1, prev + 1))}
                      className="px-5 py-2 rounded-xl bg-[#2F6B4F] hover:bg-[#24563F] dark:bg-[#6FAF8A] text-white dark:text-[#0F1713] text-xs font-bold flex items-center gap-1.5 shadow-sm"
                    >
                      Next <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowSubmitModal(true)}
                      className="px-5 py-2 rounded-xl bg-[#2F6B4F] hover:bg-[#24563F] dark:bg-[#6FAF8A] text-white dark:text-[#0F1713] text-xs font-bold flex items-center gap-1.5 shadow-sm"
                    >
                      Review & Submit <Send className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* QUESTION PALETTE & SUMMARY (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="rounded-3xl bg-white dark:bg-[#17221C] border border-[#DCE4DE] dark:border-[#2B3A31] p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-[#DCE4DE] dark:border-[#2B3A31] pb-3">
                <h3 className="text-sm font-bold text-[#1B2A22] dark:text-[#E8F1EB]">
                  Question Palette
                </h3>
                <span className="text-xs font-semibold text-[#64736A] dark:text-[#A9B9AE]">
                  {answeredCount}/{totalQ} Answered
                </span>
              </div>

              {/* Grid of question buttons */}
              <div className="grid grid-cols-5 gap-2">
                {attempt.questions.map((q, idx) => {
                  const isAnswered = !!userAnswers[q.id];
                  const isFlagged = !!flaggedQuestions[q.id];
                  const isCurrent = idx === currentIndex;

                  let btnStyle = "bg-[#F7F9F4] dark:bg-[#0F1713] text-[#64736A] dark:text-[#A9B9AE] border-[#DCE4DE] dark:border-[#2B3A31]";
                  if (isAnswered) {
                    btnStyle = "bg-[#2F6B4F] text-white dark:bg-[#6FAF8A] dark:text-[#0F1713] border-[#2F6B4F]";
                  } else if (isFlagged) {
                    btnStyle = "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300";
                  }

                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => setCurrentIndex(idx)}
                      className={`h-10 rounded-xl font-bold text-xs border transition-all flex items-center justify-center relative ${btnStyle} ${
                        isCurrent ? "ring-2 ring-[#C58A32] scale-105 shadow-sm" : ""
                      }`}
                    >
                      {idx + 1}
                      {isFlagged && (
                        <div className="w-2 h-2 rounded-full bg-amber-500 absolute top-1 right-1" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[#DCE4DE] dark:border-[#2B3A31] text-[11px] text-[#64736A] dark:text-[#A9B9AE]">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-[#2F6B4F] dark:bg-[#6FAF8A]" />
                  <span>Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-[#F7F9F4] dark:bg-[#0F1713] border border-[#DCE4DE]" />
                  <span>Unanswered</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-amber-400" />
                  <span>Flagged</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded ring-2 ring-[#C58A32]" />
                  <span>Current</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SUBMISSION CONFIRMATION MODAL */}
        {showSubmitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white dark:bg-[#17221C] border border-[#DCE4DE] dark:border-[#2B3A31] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-[#2F6B4F]/10 dark:bg-[#6FAF8A]/20 text-[#2F6B4F] dark:text-[#6FAF8A] flex items-center justify-center mx-auto">
                  <Send className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-extrabold text-[#1B2A22] dark:text-[#E8F1EB]">
                  Submit Topic Quiz?
                </h3>
                <p className="text-xs text-[#64736A] dark:text-[#A9B9AE]">
                  Ready to finalize your answers and review detailed pedagogical explanations?
                </p>
              </div>

              {/* Status summary */}
              <div className="grid grid-cols-2 gap-3 bg-[#F7F9F4] dark:bg-[#0F1713] p-4 rounded-2xl border border-[#DCE4DE] dark:border-[#2B3A31] text-center">
                <div>
                  <div className="text-xl font-extrabold text-[#2F6B4F] dark:text-[#6FAF8A]">
                    {answeredCount}
                  </div>
                  <div className="text-[10px] font-bold uppercase text-[#64736A] dark:text-[#A9B9AE]">
                    Answered
                  </div>
                </div>
                <div>
                  <div className="text-xl font-extrabold text-[#C65353] dark:text-[#E57373]">
                    {totalQ - answeredCount}
                  </div>
                  <div className="text-[10px] font-bold uppercase text-[#64736A] dark:text-[#A9B9AE]">
                    Unanswered
                  </div>
                </div>
              </div>

              {totalQ - answeredCount > 0 && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" />
                  <span>You still have {totalQ - answeredCount} unanswered questions.</span>
                </div>
              )}

              {/* Modal Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="flex-1 py-3 rounded-xl bg-[#F7F9F4] dark:bg-[#0F1713] border border-[#DCE4DE] dark:border-[#2B3A31] text-xs font-bold text-[#1B2A22] dark:text-[#E8F1EB]"
                >
                  Return to Quiz
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleSubmitQuiz}
                  className="flex-1 py-3 rounded-xl bg-[#2F6B4F] hover:bg-[#24563F] dark:bg-[#6FAF8A] text-white dark:text-[#0F1713] text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2"
                >
                  {submitting ? "Evaluating..." : "Confirm & Submit"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
