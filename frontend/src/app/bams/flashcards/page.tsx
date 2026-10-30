"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import {
  Sparkles,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  RotateCw,
  CheckCircle2,
  Clock,
  Layers,
  Brain,
  Award,
  Filter,
  Check,
  HelpCircle,
  ChevronRight,
  ExternalLink,
  Bot
} from "lucide-react";
import { api } from "@/lib/api";

interface Flashcard {
  id: string;
  subjectId: string;
  subjectName: string;
  topicId: string;
  topicTitle: string;
  sanskritTerm: string;
  sanskritDevanagari: string;
  conceptExplanation: string;
  clinicalCorrelation: string;
  modernCorrelate: string;
  difficulty: string;
  masteryStatus: string;
  userRating?: string;
}

export default function BamsFlashcardsPage() {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [reviewing, setReviewing] = useState(false);

  useEffect(() => {
    fetchFlashcards();
  }, [selectedSubject]);

  const fetchFlashcards = async () => {
    setLoading(true);
    try {
      const url =
        selectedSubject === "ALL"
          ? "/bams-learning/flashcards"
          : `/bams-learning/flashcards?subject_id=${selectedSubject}`;
      const res = await api.get(url);
      if (res.data && Array.isArray(res.data)) {
        setCards(res.data);
        setCurrentIndex(0);
        setIsFlipped(false);
      }
    } catch (err) {
      console.error("Failed to fetch flashcards:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredCards = cards.filter((card) => {
    if (selectedStatus === "ALL") return true;
    return card.masteryStatus === selectedStatus;
  });

  const currentCard = filteredCards[currentIndex] || null;

  const handleRate = async (rating: "EASY" | "MEDIUM" | "HARD") => {
    if (!currentCard || reviewing) return;
    setReviewing(true);
    try {
      await api.post(`/bams-learning/flashcards/${currentCard.id}/review`, {
        rating,
      });

      // Update local card state
      const newStatus = rating === "EASY" ? "MASTERED" : "LEARNING";
      setCards((prev) =>
        prev.map((c) =>
          c.id === currentCard.id
            ? { ...c, userRating: rating, masteryStatus: newStatus }
            : c
        )
      );

      // Advance to next card if available
      setIsFlipped(false);
      setTimeout(() => {
        if (currentIndex < filteredCards.length - 1) {
          setCurrentIndex((prev) => prev + 1);
        }
        setReviewing(false);
      }, 200);
    } catch (err) {
      console.error("Review failed:", err);
      setReviewing(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < filteredCards.length - 1) {
      setIsFlipped(false);
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setCurrentIndex((prev) => prev - 1);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "Enter") {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.code === "ArrowRight") {
        handleNext();
      } else if (e.code === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "1") {
        handleRate("HARD");
      } else if (e.key === "2") {
        handleRate("MEDIUM");
      } else if (e.key === "3") {
        handleRate("EASY");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, filteredCards.length, isFlipped, currentCard]);

  // Statistics
  const masteredCount = cards.filter((c) => c.masteryStatus === "MASTERED").length;
  const learningCount = cards.filter((c) => c.masteryStatus === "LEARNING").length;
  const newCount = cards.filter((c) => c.masteryStatus === "NEW").length;

  return (
    <div className="min-h-screen bg-[#F8FAF6] dark:bg-[#0B120E] text-[#19241E] dark:text-[#E8F1EC] flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* HEADER BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-800">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Interactive Active Recall</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              BAMS Classical Active Recall Decks
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
              NCISM-aligned Shlokas, concepts, clinical correlations, and modern anatomical correlates with spaced repetition.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/student/dashboard"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-emerald-500 transition-colors shadow-sm"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Student Dashboard</span>
            </Link>
            <Link
              href="/student/quiz"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-sm"
            >
              <Award className="w-3.5 h-3.5" />
              <span>Diagnostic Quiz</span>
            </Link>
          </div>
        </div>

        {/* PROGRESS & MASTERY METRICS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                Total Cards
              </span>
              <span className="text-xl font-black text-gray-900 dark:text-white">
                {cards.length}
              </span>
            </div>
            <Layers className="w-5 h-5 text-gray-400" />
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-emerald-200 dark:border-emerald-900/50 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                Mastered
              </span>
              <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                {masteredCount}
              </span>
            </div>
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-amber-200 dark:border-amber-900/50 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
                In Review
              </span>
              <span className="text-xl font-black text-amber-600 dark:text-amber-400">
                {learningCount}
              </span>
            </div>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-blue-200 dark:border-blue-900/50 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
                Unseen
              </span>
              <span className="text-xl font-black text-blue-600 dark:text-blue-400">
                {newCount}
              </span>
            </div>
            <Brain className="w-5 h-5 text-blue-500" />
          </div>
        </div>

        {/* FILTERS */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-gray-500 flex items-center gap-1 mr-1">
              <Filter className="w-3.5 h-3.5" /> Subject:
            </span>
            {[
              { id: "ALL", label: "All Subjects" },
              { id: "sub-panchakarma", label: "Panchakarma" },
              { id: "sub-rachana", label: "Rachana Sharir" },
              { id: "sub-kriya", label: "Kriya Sharir" },
              { id: "sub-dravyaguna", label: "Dravyaguna" },
              { id: "sub-shalya", label: "Shalya Tantra" },
            ].map((sub) => (
              <button
                key={sub.id}
                onClick={() => setSelectedSubject(sub.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedSubject === sub.id
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                {sub.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-500">Status:</span>
            {[
              { id: "ALL", label: "All" },
              { id: "NEW", label: "New" },
              { id: "LEARNING", label: "Review" },
              { id: "MASTERED", label: "Mastered" },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => {
                  setSelectedStatus(st.id);
                  setCurrentIndex(0);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  selectedStatus === st.id
                    ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold"
                    : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* FLASHCARD INTERACTIVE VIEWER */}
        {loading ? (
          <div className="p-16 text-center text-xs text-gray-500 animate-pulse bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800">
            Loading active recall flashcard decks...
          </div>
        ) : filteredCards.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              No flashcards matching selected filter!
            </h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              You may have mastered all cards in this category. Switch the filter to All to review again.
            </p>
            <button
              onClick={() => {
                setSelectedSubject("ALL");
                setSelectedStatus("ALL");
              }}
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
            >
              Reset Filters
            </button>
          </div>
        ) : currentCard ? (
          <div className="space-y-4">
            {/* CARD CONTAINER WITH FLIP TRANSITION */}
            <div
              onClick={() => setIsFlipped((prev) => !prev)}
              role="button"
              tabIndex={0}
              aria-label="Click to flip card"
              className="relative min-h-[380px] sm:min-h-[420px] w-full rounded-3xl p-6 sm:p-10 cursor-pointer shadow-lg transition-all duration-300 transform hover:-translate-y-1 bg-white dark:bg-gray-900 border-2 border-emerald-500/30 hover:border-emerald-500 flex flex-col justify-between"
            >
              {/* CARD TOP INFO */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
                    {currentCard.subjectName}
                  </span>
                  <span className="text-xs font-medium text-gray-400">
                    {currentCard.topicTitle}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      currentCard.masteryStatus === "MASTERED"
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300"
                        : currentCard.masteryStatus === "LEARNING"
                        ? "bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300"
                        : "bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300"
                    }`}
                  >
                    {currentCard.masteryStatus}
                  </span>
                  <div className="text-xs text-gray-400 flex items-center gap-1 font-mono">
                    <RotateCw className="w-3 h-3" />
                    <span>Flip</span>
                  </div>
                </div>
              </div>

              {/* CARD BODY: FRONT vs BACK */}
              {!isFlipped ? (
                /* FRONT: CONCEPT & SHLOKA */
                <div className="my-auto py-6 space-y-4 text-center">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">
                    Classical Ayurvedic Concept
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
                    {currentCard.sanskritTerm}
                  </h2>
                  <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 max-w-xl mx-auto">
                    <p className="font-serif text-lg text-amber-900 dark:text-amber-200 leading-relaxed">
                      &ldquo;{currentCard.sanskritDevanagari}&rdquo;
                    </p>
                  </div>
                  <p className="text-xs text-gray-400">
                    Click anywhere or press <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded font-mono text-[10px]">Space</kbd> to reveal clinical explanation
                  </p>
                </div>
              ) : (
                /* BACK: EXPLANATION, CLINICAL CORRELATION & MODERN CORRELATE */
                <div className="my-auto py-4 space-y-4 animate-fadeIn">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                      NCISM Comprehensive Explanation
                    </span>
                    <p className="text-sm sm:text-base text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
                      {currentCard.conceptExplanation}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40">
                      <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider block mb-1">
                        🩺 Clinical Correlation & Application
                      </span>
                      <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                        {currentCard.clinicalCorrelation}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/40">
                      <span className="text-[10px] font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider block mb-1">
                        🔬 Modern Biomedical Correlate
                      </span>
                      <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                        {currentCard.modernCorrelate}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* CARD FOOTER */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-400">
                <span className="font-mono font-medium">
                  Card {currentIndex + 1} of {filteredCards.length}
                </span>

                <Link
                  href={`/ai?tab=chatbot&q=Explain%20${encodeURIComponent(currentCard.sanskritTerm)}%20in%20depth%20with%20clinical%20examples`}
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>Ask AI Tutor about this</span>
                </Link>
              </div>
            </div>

            {/* ACTION & RATING CONTROLS */}
            <div className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
                <button
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className="px-3 py-2 rounded-xl text-xs font-bold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Prev
                </button>

                <button
                  onClick={() => setIsFlipped((prev) => !prev)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5"
                >
                  <RotateCw className="w-3.5 h-3.5" /> {isFlipped ? "Show Term" : "Reveal Answer"}
                </button>

                <button
                  onClick={handleNext}
                  disabled={currentIndex === filteredCards.length - 1}
                  className="px-3 py-2 rounded-xl text-xs font-bold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  Next <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* RATING BUTTONS */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mr-1 hidden sm:inline">
                  Self-Assess:
                </span>
                <button
                  onClick={() => handleRate("HARD")}
                  className="px-3 py-2 rounded-xl text-xs font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors flex items-center gap-1"
                >
                  <span>1. Hard</span>
                </button>
                <button
                  onClick={() => handleRate("MEDIUM")}
                  className="px-3 py-2 rounded-xl text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900 hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-colors flex items-center gap-1"
                >
                  <span>2. Review</span>
                </button>
                <button
                  onClick={() => handleRate("EASY")}
                  className="px-3 py-2 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors flex items-center gap-1"
                >
                  <span>3. Easy (Mastered)</span>
                </button>
              </div>
            </div>

            {/* KEYBOARD SHORTCUTS LEGEND */}
            <div className="text-center text-[11px] text-gray-400">
              Shortcuts: <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-800 rounded font-mono">Space</kbd> Flip &bull; <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-800 rounded font-mono">&larr; / &rarr;</kbd> Navigate &bull; <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-800 rounded font-mono">1/2/3</kbd> Rate
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
