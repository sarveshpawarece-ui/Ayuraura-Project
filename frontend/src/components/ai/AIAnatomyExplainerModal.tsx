"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  X,
  BookOpen,
  Layers,
  Activity,
  AlertTriangle,
  HelpCircle,
  Volume2,
  CheckCircle2,
  RotateCcw,
  Sliders,
  ShieldCheck
} from "lucide-react";
import { api } from "@/lib/api";
import { VoiceReaderControls } from "./VoiceAssistantControls";

interface AIAnatomyExplainerProps {
  structureName: string;
  sanskritName?: string;
  region?: string;
  isOpen: boolean;
  onClose: () => void;
}

interface AnatomyExplanation {
  structure_name: string;
  sanskrit_name: string;
  mode: string;
  classical_correlation: string;
  modern_anatomy_summary: string;
  clinical_marma_vulnerability?: string;
  clinical_surgical_significance?: string;
  step_by_step_physiological_flow: string[];
  high_yield_exam_points: string[];
  practice_questions: { question: string; answer: string }[];
  disclaimer: string;
}

export default function AIAnatomyExplainerModal({
  structureName,
  sanskritName,
  region,
  isOpen,
  onClose
}: AIAnatomyExplainerProps) {
  const [mode, setMode] = useState<"BEGINNER" | "ADVANCED">("ADVANCED");
  const [data, setData] = useState<AnatomyExplanation | null>(null);
  const [loading, setLoading] = useState(false);
  const [revealedQuestions, setRevealedQuestions] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (isOpen && structureName) {
      fetchExplanation();
    }
  }, [isOpen, structureName, mode]);

  const fetchExplanation = async () => {
    setLoading(true);
    try {
      const res = await api.post("/ai-ecosystem/anatomy-explainer", {
        structure_name: structureName,
        sanskrit_name: sanskritName,
        region: region || "Full Body",
        mode,
        include_questions: true
      });
      if (res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error("Failed to load anatomy explanation:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleAnswer = (idx: number) => {
    setRevealedQuestions((prev) => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gradient-to-r from-emerald-600/10 via-teal-500/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  {structureName}
                </h3>
                {sanskritName && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-serif font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    {sanskritName}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                AI Rachana Sharira & Clinical Anatomy Correlation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mode switch */}
            <div className="inline-flex rounded-xl p-1 bg-gray-100 dark:bg-gray-800 text-xs">
              <button
                type="button"
                onClick={() => setMode("BEGINNER")}
                className={`px-2.5 py-1 rounded-lg font-bold transition ${
                  mode === "BEGINNER"
                    ? "bg-white dark:bg-gray-700 text-emerald-700 dark:text-emerald-300 shadow-sm"
                    : "text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
                }`}
              >
                Beginner
              </button>
              <button
                type="button"
                onClick={() => setMode("ADVANCED")}
                className={`px-2.5 py-1 rounded-lg font-bold transition ${
                  mode === "ADVANCED"
                    ? "bg-white dark:bg-gray-700 text-emerald-700 dark:text-emerald-300 shadow-sm"
                    : "text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
                }`}
              >
                Advanced
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-5 text-xs sm:text-sm">
          {loading ? (
            <div className="p-12 text-center text-xs text-gray-400 space-y-2 animate-pulse">
              <Sparkles className="w-8 h-8 text-emerald-500 mx-auto animate-spin" />
              <p>Correlating classical Rachana Sharira treatises with 3D anatomical structures...</p>
            </div>
          ) : data ? (
            <>
              {/* Voice Reader for the explanation */}
              <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
                <VoiceReaderControls
                  textToRead={`${data.classical_correlation} ${data.modern_anatomy_summary} ${data.clinical_surgical_significance || data.clinical_marma_vulnerability || ""}`}
                />
                <span className="text-[11px] text-gray-400">NCISM Sharira Curriculum</span>
              </div>

              {/* Classical Sharira Correlation */}
              <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 rounded-2xl space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-emerald-900 dark:text-emerald-200 text-xs uppercase tracking-wider">
                  <BookOpen className="w-4 h-4 text-emerald-600" />
                  <span>Classical Ayurvedic Rachana Sharira:</span>
                </div>
                <div className="text-emerald-950 dark:text-emerald-100 leading-relaxed whitespace-pre-line text-xs">
                  {data.classical_correlation}
                </div>
              </div>

              {/* Modern Anatomy Correlation */}
              <div className="p-4 bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-2xl space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-blue-900 dark:text-blue-200 text-xs uppercase tracking-wider">
                  <Layers className="w-4 h-4 text-blue-600" />
                  <span>Modern Gross & Functional Anatomy:</span>
                </div>
                <p className="text-blue-950 dark:text-blue-100 leading-relaxed text-xs">
                  {data.modern_anatomy_summary}
                </p>
              </div>

              {/* Clinical Surgical & Trauma Significance */}
              <div className="p-4 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-2xl space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-200 text-xs uppercase tracking-wider">
                  <Activity className="w-4 h-4 text-amber-600" />
                  <span>Clinical Surgical & Trauma Significance (Shalya Tantra):</span>
                </div>
                <p className="text-amber-950 dark:text-amber-100 leading-relaxed text-xs">
                  {data.clinical_surgical_significance || data.clinical_marma_vulnerability}
                </p>
              </div>

              {/* Step-by-Step Physiological Flow */}
              <div className="space-y-2">
                <h5 className="font-bold text-gray-900 dark:text-white text-xs uppercase tracking-wider">
                  Physiological Flow & Micro-Circulation:
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {data.step_by_step_physiological_flow.map((step, sIdx) => (
                    <div
                      key={sIdx}
                      className="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-gray-800"
                    >
                      {step}
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Self-Assessment Questions */}
              {data.practice_questions && data.practice_questions.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                  <h5 className="font-bold text-gray-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-emerald-600" />
                    <span>Quick Viva & Exam Self-Assessment:</span>
                  </h5>
                  <div className="space-y-2">
                    {data.practice_questions.map((q, qIdx) => {
                      const isRevealed = revealedQuestions[qIdx];
                      return (
                        <div
                          key={qIdx}
                          className="p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-xs space-y-1.5"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-gray-900 dark:text-white">
                              {q.question}
                            </span>
                            <button
                              onClick={() => toggleAnswer(qIdx)}
                              className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex-shrink-0"
                            >
                              {isRevealed ? "Hide Answer" : "Reveal Answer"}
                            </button>
                          </div>
                          {isRevealed && (
                            <p className="text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 p-2.5 rounded-lg border border-gray-100 dark:border-gray-800">
                              {q.answer}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/40 flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Academic BAMS Sharira Study Aid</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            Close Explainer
          </button>
        </div>
      </div>
    </div>
  );
}
