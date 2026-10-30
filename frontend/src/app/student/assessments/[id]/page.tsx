"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Sparkles, Target, ChevronLeft, ChevronRight, CheckCircle2, AlertCircle, Send, Check } from "lucide-react";
import { api } from "@/lib/api";

export default function AssessmentTakingPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const attemptId = resolvedParams.id;
  const router = useRouter();

  const [attemptData, setAttemptData] = useState<any>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({}); // question_id -> option_id
  const [loading, setLoading] = useState(true);
  const [savingAnswer, setSavingAnswer] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadAttempt() {
      try {
        setLoading(true);
        const res = await api.get(`/assessments/${attemptId}`);
        setAttemptData(res.data);

        // If already submitted, redirect to result page
        if (res.data.status === "SUBMITTED") {
          router.push(`/student/assessments/${attemptId}/result`);
        }
      } catch (err: any) {
        console.error(err);
        setErrorMsg("Unable to load assessment attempt. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    loadAttempt();
  }, [attemptId]);

  const questions = attemptData?.questions || [];
  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;

  const handleSelectOption = async (questionId: string, optionId: string) => {
    const newAnswers = { ...answers, [questionId]: optionId };
    setAnswers(newAnswers);

    // Autosave answer to backend
    try {
      setSavingAnswer(true);
      await api.post(`/assessments/${attemptId}/answers`, {
        question_id: questionId,
        selected_option_id: optionId
      });
    } catch (e) {
      console.error("Autosave answer error:", e);
    } finally {
      setSavingAnswer(false);
    }
  };

  const handleSubmitAssessment = async () => {
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await api.post(`/assessments/${attemptId}/submit`);
      router.push(`/student/assessments/${attemptId}/result`);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || "Assessment submission failed. Please try again.");
      setSubmitting(false);
      setShowConfirmModal(false);
    }
  };

  const answeredCount = Object.keys(answers).length;
  const unansweredCount = totalQuestions - answeredCount;
  const progressPercent = totalQuestions > 0 ? Math.round(((currentIndex + 1) / totalQuestions) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#F7F9F4] dark:bg-[#0D1511] text-[#17231C] dark:text-[#F1F6F2] flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto p-6 space-y-6">
        {/* Loading State */}
        {loading ? (
          <div className="p-12 text-center text-xs text-[#526158] dark:text-[#C1CEC5] bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] rounded-3xl shadow-xs">
            Loading assessment questions...
          </div>
        ) : errorMsg ? (
          <div className="p-6 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-xs flex items-center justify-between">
            <span>{errorMsg}</span>
          </div>
        ) : (
          <>
            {/* Top Bar / Attempt Context */}
            <div className="bg-[#FFFFFF] dark:bg-[#17211B] p-5 rounded-3xl border border-[#D5DED8] dark:border-[#304036] shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#D5DED8] dark:border-[#304036] pb-3">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-[#A96F16] dark:text-[#E5B85C] font-bold flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5" /> {attemptData?.career_role?.name || "Target Career"}
                  </span>
                  <h1 className="text-lg font-bold text-[#17231C] dark:text-[#F1F6F2] mt-0.5">Skill Assessment Attempt</h1>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-[#526158] dark:text-[#C1CEC5]">
                    Question <strong className="text-[#2F6B4F] dark:text-[#78B895]">{currentIndex + 1}</strong> of {totalQuestions}
                  </span>
                  <button
                    onClick={() => setShowConfirmModal(true)}
                    className="px-4 py-2 rounded-2xl bg-[#2F6B4F] hover:bg-[#24563F] dark:bg-[#78B895] dark:hover:bg-[#91CAA8] text-white dark:text-[#0D1511] font-bold text-xs flex items-center gap-2 shadow-xs transition-all"
                  >
                    <Send className="w-3.5 h-3.5" /> Submit Assessment
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-[#526158] dark:text-[#98A99E]">
                  <span>Progress ({progressPercent}%)</span>
                  <span>{answeredCount} Answered • {unansweredCount} Remaining</span>
                </div>
                <div className="w-full h-2 bg-[#EEF4EF] dark:bg-[#223128] rounded-full overflow-hidden border border-[#D5DED8] dark:border-[#304036]">
                  <div
                    className="h-full bg-gradient-to-r from-[#2F6B4F] to-[#78B895] transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Question Card */}
            {currentQuestion && (
              <div className="bg-[#FFFFFF] dark:bg-[#17211B] p-6 rounded-3xl border border-[#D5DED8] dark:border-[#304036] shadow-xs space-y-6 relative">
                {/* Question Meta Badges */}
                <div className="flex items-center justify-between border-b border-[#D5DED8] dark:border-[#304036] pb-4">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-[#DCEBE1] dark:bg-[#294637] text-[#2F6B4F] dark:text-[#78B895] font-mono text-[10px] border border-[#B9C8BE] dark:border-[#425449] font-semibold">
                      {currentQuestion.category}
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-[#A96F16] dark:text-[#E5B85C] font-mono text-[10px] border border-amber-200 dark:border-amber-800 font-semibold">
                      {currentQuestion.difficulty}
                    </span>
                  </div>

                  {savingAnswer && (
                    <span className="text-[10px] text-[#68776D] dark:text-[#98A99E] italic">Saving answer...</span>
                  )}
                </div>

                {/* Question Text */}
                <h2 className="text-base md:text-lg font-bold text-[#17231C] dark:text-[#F1F6F2] leading-relaxed">
                  {currentIndex + 1}. {currentQuestion.question_text}
                </h2>

                {/* Options List */}
                <div className="space-y-3 pt-2">
                  {currentQuestion.options.map((opt: any) => {
                    const isSelected = answers[currentQuestion.id] === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleSelectOption(currentQuestion.id, opt.id)}
                        className={`w-full text-left p-4 rounded-2xl border text-xs transition-all flex items-center justify-between ${
                          isSelected
                            ? "bg-[#DCEBE1]/60 dark:bg-[#294637]/50 border-2 border-[#2F6B4F] dark:border-[#78B895] text-[#17231C] dark:text-[#F1F6F2] font-semibold shadow-xs"
                            : "bg-[#EEF4EF]/50 dark:bg-[#223128]/50 border-[#D5DED8] dark:border-[#304036] text-[#17231C] dark:text-[#F1F6F2] hover:border-[#2F6B4F] dark:hover:border-[#78B895]"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-bold ${
                            isSelected ? "border-[#2F6B4F] bg-[#2F6B4F] text-white dark:border-[#78B895] dark:bg-[#78B895] dark:text-[#0D1511]" : "border-[#B9C8BE] dark:border-[#425449] text-[#526158] dark:text-[#98A99E]"
                          }`}>
                            {isSelected ? <Check className="w-3 h-3 stroke-[3]" /> : opt.option_order}
                          </div>
                          <span>{opt.option_text}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Navigation Controls */}
                <div className="pt-6 border-t border-[#D5DED8] dark:border-[#304036] flex items-center justify-between">
                  <button
                    disabled={currentIndex === 0}
                    onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                    className="px-4 py-2 rounded-2xl bg-[#EEF4EF] dark:bg-[#223128] border border-[#D5DED8] dark:border-[#304036] hover:bg-[#D5DED8] dark:hover:bg-[#304036] disabled:opacity-40 text-xs font-bold text-[#17231C] dark:text-[#F1F6F2] flex items-center gap-1 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" /> Previous
                  </button>

                  <div className="flex items-center gap-2">
                    {currentIndex < totalQuestions - 1 ? (
                      <button
                        onClick={() => setCurrentIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
                        className="px-5 py-2.5 rounded-2xl bg-[#2F6B4F] hover:bg-[#24563F] dark:bg-[#78B895] dark:hover:bg-[#91CAA8] text-white dark:text-[#0D1511] font-bold text-xs flex items-center gap-1 shadow-xs transition-all"
                      >
                        Next <ChevronRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => setShowConfirmModal(true)}
                        className="px-6 py-2.5 rounded-2xl bg-[#A96F16] hover:bg-[#8e5c12] text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-all"
                      >
                        Submit Assessment <Send className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Question Quick-Jump Palette */}
            <div className="bg-[#FFFFFF] dark:bg-[#17211B] p-5 rounded-3xl border border-[#D5DED8] dark:border-[#304036] shadow-xs space-y-3">
              <span className="text-[10px] uppercase tracking-wider text-[#526158] dark:text-[#98A99E] font-bold">Question Palette</span>
              <div className="flex flex-wrap gap-2">
                {questions.map((q: any, idx: number) => {
                  const isAnswered = Boolean(answers[q.id]);
                  const isCurrent = idx === currentIndex;
                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentIndex(idx)}
                      className={`w-8 h-8 rounded-xl text-xs font-bold transition-all flex items-center justify-center ${
                        isCurrent
                          ? "ring-2 ring-[#2F6B4F] dark:ring-[#78B895] bg-[#2F6B4F] dark:bg-[#78B895] text-white dark:text-[#0D1511]"
                          : isAnswered
                          ? "bg-[#DCEBE1] dark:bg-[#294637] text-[#2F6B4F] dark:text-[#78B895] border border-[#B9C8BE] dark:border-[#425449]"
                          : "bg-[#EEF4EF] dark:bg-[#223128] text-[#526158] dark:text-[#C1CEC5] border border-[#D5DED8] dark:border-[#304036] hover:border-[#B9C8BE] dark:hover:border-[#425449]"
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* Confirmation Modal before Final Submission */}
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-[#FFFFFF] dark:bg-[#17211B] max-w-md w-full p-6 rounded-3xl border border-[#D5DED8] dark:border-[#304036] shadow-2xl space-y-5 text-center">
              <div className="w-12 h-12 rounded-full bg-[#DCEBE1] dark:bg-[#294637] border border-[#B9C8BE] dark:border-[#425449] flex items-center justify-center mx-auto text-[#2F6B4F] dark:text-[#78B895]">
                <Send className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-base font-bold text-[#17231C] dark:text-[#F1F6F2]">Submit Assessment?</h3>
                <div className="text-xs text-[#526158] dark:text-[#C1CEC5] mt-2 space-y-1">
                  <p>You have answered <strong className="text-[#2F6B4F] dark:text-[#78B895]">{answeredCount}</strong> of <strong>{totalQuestions}</strong> questions.</p>
                  {unansweredCount > 0 && (
                    <p className="text-[#A96F16] dark:text-[#E5B85C] font-semibold">{unansweredCount} questions remain unanswered (scored as 0).</p>
                  )}
                </div>
              </div>

              <div className="flex justify-center gap-3 pt-2">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setShowConfirmModal(false)}
                  className="px-5 py-2.5 rounded-2xl text-xs font-semibold text-[#526158] dark:text-[#C1CEC5] hover:text-[#17231C] dark:hover:text-[#F1F6F2] bg-[#EEF4EF] dark:bg-[#223128] border border-[#D5DED8] dark:border-[#304036]"
                >
                  Review Answers
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleSubmitAssessment}
                  className="px-6 py-2.5 rounded-2xl bg-[#2F6B4F] hover:bg-[#24563F] dark:bg-[#78B895] dark:hover:bg-[#91CAA8] text-white dark:text-[#0D1511] font-bold text-xs shadow-xs"
                >
                  {submitting ? "Submitting..." : "Confirm & Submit"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
