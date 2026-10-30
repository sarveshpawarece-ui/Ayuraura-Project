"use client";

import React, { useState, useEffect } from "react";
import {
  Award,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  BookOpen,
  ArrowRight,
  Clock,
  Sparkles,
  BarChart3,
  FileCheck,
  ChevronRight,
  Sliders
} from "lucide-react";
import { api } from "@/lib/api";

interface QuizQuestion {
  id: number;
  question: string;
  question_format: string;
  options: string[];
  correct_index?: number;
  correct_answer_text?: string;
  explanation: string;
  why_incorrect?: Record<string, string>;
  marks: number;
  classical_citation?: string;
}

interface GeneratedQuiz {
  id: string;
  title: string;
  subject: string;
  topic: string;
  difficulty: string;
  question_format: string;
  question_count: number;
  questions: QuizQuestion[];
  is_official_exam: boolean;
}

interface QuizEvaluation {
  question_id: number;
  question: string;
  selected_index?: number;
  correct_index: number;
  is_correct: boolean;
  explanation: string;
  why_incorrect?: Record<string, string>;
  citation?: string;
}

interface QuizResult {
  attempt_id: string;
  quiz_id: string;
  score: number;
  max_score: number;
  score_percentage: number;
  passed: boolean;
  detailed_evaluations: QuizEvaluation[];
  feedback_notes: string;
  weak_topics_flagged: string[];
  recommended_revision: string;
}

export default function QuizGenerator() {
  const [subject, setSubject] = useState("Dravyaguna");
  const [topic, setTopic] = useState("Triphala & Rasayana Herbs");
  const [difficulty, setDifficulty] = useState("MEDIUM");
  const [questionCount, setQuestionCount] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);

  // Active Quiz State
  const [activeQuiz, setActiveQuiz] = useState<GeneratedQuiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [timeSpent, setTimeSpent] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);

  // Attempt History
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await api.get("/ai-ecosystem/quiz/history");
      if (res.data && Array.isArray(res.data)) {
        setHistory(res.data);
      }
    } catch (err) {
      console.error("Failed to load quiz history:", err);
    }
  };

  const handleGenerateQuiz = async () => {
    setIsGenerating(true);
    setQuizResult(null);
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);
    setTimeSpent(0);

    try {
      const res = await api.post("/ai-ecosystem/quiz/generate", {
        subject,
        topic,
        difficulty,
        question_format: "MCQ",
        question_count: questionCount
      });
      if (res.data) {
        setActiveQuiz(res.data);
      }
    } catch (err) {
      console.error("Failed to generate quiz:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectOption = (questionId: number, optionIdx: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIdx
    }));
  };

  const handleSubmitQuiz = async () => {
    if (!activeQuiz) return;
    setIsSubmitting(true);
    try {
      const payloadAnswers = activeQuiz.questions.map((q) => ({
        question_id: q.id,
        selected_index: selectedAnswers[q.id] !== undefined ? selectedAnswers[q.id] : -1
      }));

      const res = await api.post("/ai-ecosystem/quiz/submit", {
        quiz_id: activeQuiz.id,
        answers: payloadAnswers,
        time_taken_seconds: timeSpent
      });

      if (res.data) {
        setQuizResult(res.data);
        fetchHistory();
      }
    } catch (err) {
      console.error("Failed to submit quiz:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. TOP CREATION CONFIG BAR */}
      <div className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                AI Quiz & Exam Generator
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                NCISM Curriculum-Aligned Practice Tests with Option-by-Option Rationales
              </p>
            </div>
          </div>
        </div>

        {/* Configuration Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block font-bold text-gray-600 dark:text-gray-300 mb-1">
              Select BAMS Subject
            </label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-1 focus:ring-emerald-500"
            >
              <option value="Dravyaguna">Dravyaguna (Pharmacology)</option>
              <option value="Maulik Siddhanta">Maulik Siddhanta (Foundations)</option>
              <option value="Roganidana">Roganidana (Pathology)</option>
              <option value="Panchakarma">Panchakarma (Detoxification)</option>
              <option value="Rachana Sharira">Rachana Sharira (Anatomy)</option>
              <option value="Kayachikitsa">Kayachikitsa (Medicine)</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-gray-600 dark:text-gray-300 mb-1">
              Topic or Chapter
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Triphala, Shat-Kriya Kala..."
              className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-600 dark:text-gray-300 mb-1">
              Difficulty Tier
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-1 focus:ring-emerald-500"
            >
              <option value="EASY">Easy (Foundational)</option>
              <option value="MEDIUM">Medium (BAMS Professional standard)</option>
              <option value="HARD">Hard (Clinical & Postgraduate)</option>
              <option value="ADAPTIVE">Adaptive (Progressive Difficulty)</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-gray-600 dark:text-gray-300 mb-1">
              Question Count
            </label>
            <select
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-1 focus:ring-emerald-500"
            >
              <option value={3}>3 Questions (Quick Sprint)</option>
              <option value={5}>5 Questions (Standard)</option>
              <option value={10}>10 Questions (Mock Exam)</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleGenerateQuiz}
          disabled={isGenerating || !topic.trim()}
          className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-600/20"
        >
          <Sparkles className="w-4 h-4" />
          <span>{isGenerating ? "Synthesizing AI Exam Questions..." : "Generate Practice Quiz"}</span>
        </button>
      </div>

      {/* 2. ACTIVE QUIZ TAKER OR RESULT VIEW */}
      {activeQuiz && !quizResult && (
        <div className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm space-y-6 animate-fadeIn">
          {/* Quiz Header Tracker */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-gray-200 dark:border-gray-800">
            <div>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                Question {currentQuestionIndex + 1} of {activeQuiz.questions.length}
              </span>
              <h4 className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">
                {activeQuiz.title}
              </h4>
            </div>

            <div className="flex items-center gap-1.5">
              {activeQuiz.questions.map((_, idx) => {
                const isAnswered = selectedAnswers[activeQuiz.questions[idx].id] !== undefined;
                const isCurrent = idx === currentQuestionIndex;
                return (
                  <button
                    key={idx}
                    onClick={() => setCurrentQuestionIndex(idx)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition flex items-center justify-center ${
                      isCurrent
                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                        : isAnswered
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                        : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Current Question Body */}
          {(() => {
            const currentQ = activeQuiz.questions[currentQuestionIndex];
            const currentSelected = selectedAnswers[currentQ.id];

            return (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-800/60 rounded-xl text-sm font-semibold text-gray-900 dark:text-white leading-relaxed">
                  {currentQ.question}
                </div>

                <div className="space-y-2.5">
                  {currentQ.options.map((opt, oIdx) => {
                    const isChosen = currentSelected === oIdx;
                    return (
                      <div
                        key={oIdx}
                        onClick={() => handleSelectOption(currentQ.id, oIdx)}
                        className={`p-3.5 rounded-xl border text-xs sm:text-sm font-medium cursor-pointer transition flex items-center gap-3 ${
                          isChosen
                            ? "bg-emerald-50 border-emerald-500 text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-600 dark:text-emerald-200 shadow-sm"
                            : "bg-white border-gray-200 hover:border-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:hover:border-gray-600 text-gray-800 dark:text-gray-200"
                        }`}
                      >
                        <span
                          className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center flex-shrink-0 ${
                            isChosen
                              ? "bg-emerald-600 text-white"
                              : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                          }`}
                        >
                          {String.fromCharCode(65 + oIdx)}
                        </span>
                        <span>{opt}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Navigation & Submit */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                  <button
                    disabled={currentQuestionIndex === 0}
                    onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-40 transition"
                  >
                    Previous
                  </button>

                  {currentQuestionIndex < activeQuiz.questions.length - 1 ? (
                    <button
                      onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition flex items-center gap-1.5"
                    >
                      <span>Next</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmitQuiz}
                      disabled={isSubmitting}
                      className="px-6 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-lg shadow-emerald-600/30 flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{isSubmitting ? "Evaluating..." : "Submit Examination"}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* 3. DETAILED RESULTS & RATIONALE EXPLAINER */}
      {quizResult && (
        <div className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm space-y-6 animate-fadeIn">
          {/* Result Score Banner */}
          <div className="p-5 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/10 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Examination Evaluation Report
              </span>
              <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1">
                Score: {quizResult.score} / {quizResult.max_score} ({quizResult.score_percentage}%)
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 max-w-xl">
                {quizResult.feedback_notes}
              </p>
            </div>

            <button
              onClick={handleGenerateQuiz}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition shadow"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retry Practice Test</span>
            </button>
          </div>

          {/* Option-by-Option Rationale Analysis */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              <span>Comprehensive Rationale & Classical Citations:</span>
            </h4>

            {quizResult.detailed_evaluations.map((evalItem, eIdx) => (
              <div
                key={eIdx}
                className={`p-4 rounded-xl border text-xs space-y-2.5 ${
                  evalItem.is_correct
                    ? "bg-emerald-50/50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900"
                    : "bg-rose-50/50 border-rose-200 dark:bg-rose-950/20 dark:border-rose-900"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-bold text-gray-900 dark:text-white">
                    Q{eIdx + 1}: {evalItem.question}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase flex-shrink-0 ${
                      evalItem.is_correct
                        ? "bg-emerald-200 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200"
                        : "bg-rose-200 text-rose-800 dark:bg-rose-900 dark:text-rose-200"
                    }`}
                  >
                    {evalItem.is_correct ? "Correct (+1)" : "Incorrect (0)"}
                  </span>
                </div>

                {/* Explanation */}
                <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 space-y-1.5">
                  <div className="font-semibold text-gray-900 dark:text-white">
                    💡 Correct Answer Explanation:
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {evalItem.explanation}
                  </p>

                  {/* Why distractors are wrong */}
                  {evalItem.why_incorrect && Object.keys(evalItem.why_incorrect).length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700 space-y-1">
                      <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase">
                        Why other options are incorrect:
                      </span>
                      {Object.entries(evalItem.why_incorrect).map(([optName, reason], rIdx) => (
                        <div key={rIdx} className="text-[11px] text-gray-600 dark:text-gray-400">
                          • <strong className="text-gray-800 dark:text-gray-200">{optName}:</strong> {reason}
                        </div>
                      ))}
                    </div>
                  )}

                  {evalItem.citation && (
                    <div className="text-[11px] font-medium text-amber-700 dark:text-amber-400 mt-1">
                      📜 Treatise Reference: {evalItem.citation}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. ATTEMPT HISTORY LIST */}
      {history.length > 0 && (
        <div className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm space-y-3">
          <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-600" />
            <span>Recent Practice Attempt History</span>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {history.map((hist, hIdx) => (
              <div
                key={hIdx}
                className="p-3 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-xs space-y-1"
              >
                <div className="flex items-center justify-between font-bold text-gray-900 dark:text-white">
                  <span className="truncate">{hist.quiz_title}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] ${
                      hist.score_percentage >= 60
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                        : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                    }`}
                  >
                    {hist.score_percentage}%
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  Subject: {hist.subject} | Score: {hist.score}/{hist.max_score}
                </p>
                <p className="text-[10px] text-gray-400">
                  {new Date(hist.completed_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
