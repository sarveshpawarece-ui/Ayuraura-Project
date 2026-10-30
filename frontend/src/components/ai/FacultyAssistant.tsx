"use client";

import React, { useState } from "react";
import {
  GraduationCap,
  Sparkles,
  BookOpen,
  FileText,
  Clock,
  CheckCircle2,
  Copy,
  Printer,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import { api } from "@/lib/api";

interface FacultyToolResult {
  id: string;
  tool_type: string;
  subject: string;
  curriculum_level: string;
  topic: string;
  title: string;
  formatted_markdown: string;
}

export default function FacultyAssistant() {
  const [toolType, setToolType] = useState<"LESSON_OUTLINE" | "EXAM_QUESTION_PAPER" | "MATERIAL_SUMMARY">("LESSON_OUTLINE");
  const [subject, setSubject] = useState("Dravyaguna");
  const [curriculumLevel, setCurriculumLevel] = useState("BAMS 2nd Year");
  const [topic, setTopic] = useState("Phytochemistry and Standardization of Triphala");
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<FacultyToolResult | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim() || isGenerating) return;
    setIsGenerating(true);
    setErrorNotice(null);

    try {
      const res = await api.post("/ai-ecosystem/faculty-tool", {
        tool_type: toolType,
        subject,
        curriculum_level: curriculumLevel,
        topic,
        target_duration_minutes: Number(durationMinutes)
      });
      if (res.data) {
        setResult(res.data);
      }
    } catch (err: any) {
      if (err?.response?.status === 403) {
        setErrorNotice(
          "Faculty AI tools are strictly restricted to verified Faculty, Doctors, and Administrators. " +
          "Your current user role does not possess faculty privileges."
        );
      } else {
        setErrorNotice(err?.response?.data?.detail || "Failed to generate faculty resource.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.formatted_markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* 1. CONFIGURATION HEADER */}
      <div className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-gray-100 dark:border-gray-800">
          <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                AI Faculty & Teacher Academic Assistant
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                Faculty & Doctor Protected
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Generate University Lesson Plans, Examination Question Papers, and Literature Summaries with Private Student Data Isolation
            </p>
          </div>
        </div>

        {errorNotice && (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-800 dark:text-rose-300 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{errorNotice}</span>
          </div>
        )}

        {/* Tool Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block font-bold text-gray-600 dark:text-gray-300 mb-1">
              Academic Tool Type
            </label>
            <select
              value={toolType}
              onChange={(e) => setToolType(e.target.value as any)}
              className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white font-medium"
            >
              <option value="LESSON_OUTLINE">Structured Lesson Outline / Lecture Plan</option>
              <option value="EXAM_QUESTION_PAPER">University Examination Question Paper (LAQ/SAQ/MCQ)</option>
              <option value="MATERIAL_SUMMARY">Classical Literature & Commentary Synthesis</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-gray-600 dark:text-gray-300 mb-1">
              BAMS Subject
            </label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white font-medium"
            >
              <option value="Dravyaguna">Dravyaguna (Pharmacology)</option>
              <option value="Roganidana">Roganidana (Pathology)</option>
              <option value="Kayachikitsa">Kayachikitsa (Medicine)</option>
              <option value="Panchakarma">Panchakarma (Detoxification)</option>
              <option value="Rachana Sharira">Rachana Sharira (Anatomy)</option>
              <option value="Shalya Tantra">Shalya Tantra (Surgery)</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-gray-600 dark:text-gray-300 mb-1">
              Curriculum Level / Year
            </label>
            <select
              value={curriculumLevel}
              onChange={(e) => setCurriculumLevel(e.target.value)}
              className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white font-medium"
            >
              <option value="BAMS 1st Professional">BAMS 1st Professional</option>
              <option value="BAMS 2nd Professional">BAMS 2nd Professional</option>
              <option value="BAMS 3rd Professional">BAMS 3rd Professional</option>
              <option value="BAMS Final Year & Interns">BAMS Final Year & Interns</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-gray-600 dark:text-gray-300 mb-1">
              Target Duration (Mins)
            </label>
            <select
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white font-medium"
            >
              <option value={45}>45 Minutes (Single Period)</option>
              <option value={60}>60 Minutes (Standard Lecture)</option>
              <option value={90}>90 Minutes (Clinical Masterclass)</option>
            </select>
          </div>
        </div>

        {/* Topic Input */}
        <div>
          <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1">
            Lecture Topic or Exam Coverage
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full p-2.5 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white font-medium"
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating || !topic.trim()}
          className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-indigo-600/20"
        >
          <Sparkles className="w-4 h-4" />
          <span>{isGenerating ? "Synthesizing Academic Material..." : "Generate Faculty Resource"}</span>
        </button>
      </div>

      {/* 2. GENERATED OUTPUT DISPLAY */}
      {result && (
        <div className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm space-y-4 animate-fadeIn">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-100 dark:border-gray-800">
            <div>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                {result.title}
              </span>
              <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                {result.subject} — {result.curriculum_level}
              </h4>
            </div>

            <button
              onClick={copyToClipboard}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Markdown</span>
                </>
              )}
            </button>
          </div>

          <div className="p-5 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700 font-mono text-xs sm:text-sm whitespace-pre-line leading-relaxed text-gray-800 dark:text-gray-100">
            {result.formatted_markdown}
          </div>
        </div>
      )}
    </div>
  );
}
