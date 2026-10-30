"use client";

import React, { useState, useEffect } from "react";
import {
  Lightbulb,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  Award
} from "lucide-react";
import { api } from "@/lib/api";

interface WeakTopicItem {
  topic: string;
  subject: string;
  reason: string;
  mastery_level_pct: number;
  recommended_action: string;
  priority: string;
  suggested_quiz_topic: string;
  suggested_shloka_reference?: string;
}

interface LearningRecommendations {
  student_name: string;
  current_year: string;
  overall_learning_health: string;
  average_quiz_score_pct: number;
  weak_topics: WeakTopicItem[];
  next_recommended_steps: string[];
}

interface LearningAssistantProps {
  onLaunchQuiz?: (topic: string, subject: string) => void;
}

export default function LearningAssistant({ onLaunchQuiz }: LearningAssistantProps) {
  const [data, setData] = useState<LearningRecommendations | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const res = await api.get("/ai-ecosystem/recommendations");
      if (res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error("Failed to load recommendations:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-xs text-gray-500 animate-pulse">
        Analyzing quiz scores, topic assessments, and syllabus progress...
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* 1. TOP LEARNING HEALTH OVERVIEW */}
      <div className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500 text-white shadow-md shadow-amber-500/20">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              AI Personalized Learning & Weak Topic Remediation
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Student: <strong>{data.student_name}</strong> | Year: <strong>{data.current_year}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-[10px] font-bold text-gray-400 uppercase block">Average Quiz Score</span>
            <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
              {data.average_quiz_score_pct}%
            </span>
          </div>

          <div
            className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider border ${
              data.overall_learning_health === "STEADY"
                ? "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                : "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800"
            }`}
          >
            {data.overall_learning_health} Status
          </div>
        </div>
      </div>

      {/* 2. WEAK TOPICS & REASONING LIST */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          <span>Priority Topics Requiring Practice & Revision:</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.weak_topics.map((item, idx) => (
            <div
              key={idx}
              className="p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                    {item.subject}
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                      item.priority === "URGENT"
                        ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                    }`}
                  >
                    {item.priority}
                  </span>
                </div>

                <h5 className="text-sm font-bold text-gray-900 dark:text-white">
                  {item.topic}
                </h5>

                {/* Progress bar */}
                <div>
                  <div className="flex justify-between text-[11px] text-gray-500 mb-1">
                    <span>Estimated Mastery</span>
                    <span className="font-bold">{item.mastery_level_pct}%</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        item.mastery_level_pct >= 70 ? "bg-emerald-500" : "bg-amber-500"
                      }`}
                      style={{ width: `${item.mastery_level_pct}%` }}
                    />
                  </div>
                </div>

                {/* Transparent reasoning */}
                <div className="p-2.5 bg-gray-50 dark:bg-gray-800/60 rounded-xl text-xs space-y-1">
                  <span className="font-semibold text-gray-700 dark:text-gray-300 text-[11px] block">
                    Why this is recommended:
                  </span>
                  <p className="text-gray-600 dark:text-gray-400 text-[11px] leading-relaxed">
                    {item.reason}
                  </p>
                </div>

                {item.suggested_shloka_reference && (
                  <div className="text-[11px] text-amber-700 dark:text-amber-300 font-medium">
                    📜 Reference: {item.suggested_shloka_reference}
                  </div>
                )}
              </div>

              {/* Action */}
              <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                <button
                  onClick={() => onLaunchQuiz?.(item.suggested_quiz_topic, item.subject)}
                  className="w-full py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <span>Practice Diagnostic Quiz</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. NEXT RECOMMENDED LEARNING STEPS */}
      <div className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm space-y-3">
        <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Next Recommended Learning Steps:</span>
        </h4>
        <div className="space-y-2 text-xs">
          {data.next_recommended_steps.map((step, sIdx) => (
            <div
              key={sIdx}
              className="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl flex items-center gap-3 text-gray-700 dark:text-gray-300"
            >
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px] flex-shrink-0">
                {sIdx + 1}
              </span>
              <span>{step}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
