"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Sparkles,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Sun,
  Moon,
  Coffee,
  Check
} from "lucide-react";
import { api } from "@/lib/api";

interface StudySession {
  session_id: string;
  subject: string;
  topic: string;
  duration_minutes: number;
  session_type: string;
  suggested_time_slot: string;
  is_completed: boolean;
  priority: string;
}

interface StudyDay {
  day_number: number;
  date_str: string;
  total_hours: number;
  focus_theme: string;
  sessions: StudySession[];
}

interface StudyPlan {
  id: string;
  title: string;
  exam_name: string;
  exam_date: string;
  days_remaining: number;
  available_hours_daily: number;
  target_subjects: string[];
  weak_topics: string[];
  days: StudyDay[];
  progress_percentage: number;
  ayurvedic_lifestyle_tip: string;
  created_at: string;
}

export default function StudyPlanner() {
  const [activePlan, setActivePlan] = useState<StudyPlan | null>(null);
  const [examName, setExamName] = useState("BAMS Annual Professional Exam");
  const [examDate, setExamDate] = useState("2026-12-15");
  const [dailyHours, setDailyHours] = useState(4.0);
  const [studyTimePref, setStudyTimePref] = useState("MORNING");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([
    "Kayachikitsa",
    "Panchakarma",
    "Shalya Tantra"
  ]);
  const [weakTopicsInput, setWeakTopicsInput] = useState("Panchakarma Samsarjana Krama, Nadi Pariksha");
  const [isGenerating, setIsGenerating] = useState(false);
  const [completedSessions, setCompletedSessions] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchActivePlan();
  }, []);

  const fetchActivePlan = async () => {
    try {
      const res = await api.get("/ai-ecosystem/study-plan");
      if (res.data) {
        setActivePlan(res.data);
      }
    } catch (err) {
      console.error("Failed to load study plan:", err);
    }
  };

  const handleGeneratePlan = async () => {
    setIsGenerating(true);
    try {
      const weakList = weakTopicsInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await api.post("/ai-ecosystem/study-plan/generate", {
        exam_name: examName,
        exam_date: examDate,
        target_subjects: selectedSubjects,
        daily_available_hours: Number(dailyHours),
        preferred_study_time: studyTimePref,
        weak_topics: weakList
      });

      if (res.data) {
        setActivePlan(res.data);
      }
    } catch (err) {
      console.error("Failed to generate study plan:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleSessionCompletion = (sessionId: string) => {
    setCompletedSessions((prev) => ({
      ...prev,
      [sessionId]: !prev[sessionId]
    }));
  };

  return (
    <div className="space-y-6">
      {/* 1. PLAN CONFIGURATION CARD */}
      <div className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-gray-100 dark:border-gray-800">
          <div className="p-2 rounded-xl bg-teal-600 text-white shadow-md shadow-teal-600/20">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              AI Personal Study Planner & Exam Schedule
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Balanced, Non-Excessive Scheduling Powered by Spaced Repetition & Ayurvedic Dinacharya
            </p>
          </div>
        </div>

        {/* Form Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block font-bold text-gray-600 dark:text-gray-300 mb-1">
              Target Examination Name
            </label>
            <input
              type="text"
              value={examName}
              onChange={(e) => setExamName(e.target.value)}
              className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-600 dark:text-gray-300 mb-1">
              Upcoming Exam Date
            </label>
            <input
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-600 dark:text-gray-300 mb-1">
              Available Daily Study Hours
            </label>
            <select
              value={dailyHours}
              onChange={(e) => setDailyHours(Number(e.target.value))}
              className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white"
            >
              <option value={2.5}>2.5 Hours (Light Routine)</option>
              <option value={4.0}>4.0 Hours (Standard BAMS Sprint)</option>
              <option value={6.0}>6.0 Hours (Intensive University Prep)</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-gray-600 dark:text-gray-300 mb-1">
              Preferred Study Time Window
            </label>
            <select
              value={studyTimePref}
              onChange={(e) => setStudyTimePref(e.target.value)}
              className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white"
            >
              <option value="MORNING">Brahma Muhurta / Morning (Sattva)</option>
              <option value="EVENING">Evening / Post-OPD</option>
              <option value="SPLIT">Split Sessions (Dawn & Dusk)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1">
            Weak or Difficult Topics (Comma-separated)
          </label>
          <input
            type="text"
            value={weakTopicsInput}
            onChange={(e) => setWeakTopicsInput(e.target.value)}
            placeholder="e.g. Panchakarma Samsarjana Krama, Nadi Pariksha, Dravyaguna Rasa Panchaka"
            className="w-full p-2.5 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white"
          />
        </div>

        <button
          onClick={handleGeneratePlan}
          disabled={isGenerating}
          className="w-full py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-teal-600/20"
        >
          <Sparkles className="w-4 h-4" />
          <span>{isGenerating ? "Synthesizing Adaptive Schedule..." : "Generate AI Study Schedule"}</span>
        </button>
      </div>

      {/* 2. ACTIVE PLAN DISPLAY */}
      {activePlan && (
        <div className="space-y-5 animate-fadeIn">
          {/* Header Summary & Countdown */}
          <div className="p-5 bg-gradient-to-r from-teal-500/10 via-emerald-500/10 to-teal-500/10 border border-teal-200 dark:border-teal-800 rounded-2xl flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
                Active BAMS Study Plan
              </span>
              <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mt-0.5">
                {activePlan.title}
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                Target Date: <strong>{new Date(activePlan.exam_date).toLocaleDateString()}</strong> | 
                Available Hours/Day: <strong>{activePlan.available_hours_daily} hrs</strong>
              </p>
            </div>

            <div className="px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border border-teal-200 dark:border-teal-800 text-center shadow-sm">
              <span className="text-2xl font-black text-teal-600 dark:text-teal-400 block">
                {activePlan.days_remaining}
              </span>
              <span className="text-[10px] font-bold uppercase text-gray-400">Days Remaining</span>
            </div>
          </div>

          {/* Dinacharya Lifestyle Tip */}
          {activePlan.ayurvedic_lifestyle_tip && (
            <div className="p-4 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 rounded-xl text-xs flex items-start gap-3">
              <Sun className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-amber-900 dark:text-amber-200 block mb-0.5">
                  Ayurvedic Dinacharya & Study Recommendation:
                </span>
                <p className="text-amber-800 dark:text-amber-300 leading-relaxed">
                  {activePlan.ayurvedic_lifestyle_tip}
                </p>
              </div>
            </div>
          )}

          {/* Day-by-Day Interactive Schedule Cards */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-600" />
              <span>Sprint Roadmap & Daily Task Blocks:</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activePlan.days.map((day) => (
                <div
                  key={day.day_number}
                  className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
                    <div>
                      <span className="text-xs font-bold text-teal-700 dark:text-teal-400">
                        Day {day.day_number} ({day.date_str})
                      </span>
                      <h5 className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                        {day.focus_theme}
                      </h5>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-bold">
                      {day.total_hours} hrs
                    </span>
                  </div>

                  {/* Sessions Checklist */}
                  <div className="space-y-2">
                    {day.sessions.map((sess) => {
                      const isDone = completedSessions[sess.session_id];
                      return (
                        <div
                          key={sess.session_id}
                          onClick={() => toggleSessionCompletion(sess.session_id)}
                          className={`p-2.5 rounded-lg border text-xs cursor-pointer transition flex items-start gap-2.5 ${
                            isDone
                              ? "bg-emerald-50/60 border-emerald-300 text-emerald-900 dark:bg-emerald-950/30 dark:border-emerald-800 line-through opacity-70"
                              : "bg-gray-50 dark:bg-gray-800/60 border-gray-200 dark:border-gray-700 hover:border-teal-400 text-gray-800 dark:text-gray-200"
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 mt-0.5 ${
                              isDone
                                ? "bg-emerald-600 border-emerald-600 text-white"
                                : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                            }`}
                          >
                            {isDone && <Check className="w-3 h-3" />}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-bold text-[11px]">{sess.subject}</span>
                              <span className="text-[10px] text-gray-400">{sess.suggested_time_slot}</span>
                            </div>
                            <p className="text-[11px] text-gray-600 dark:text-gray-400 mt-0.5">
                              {sess.topic}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
