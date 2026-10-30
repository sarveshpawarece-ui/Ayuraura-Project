"use client";

import React, { useState } from "react";
import {
  FileCheck,
  Sparkles,
  Send,
  Award,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  BookOpen,
  ShieldAlert,
  ArrowRight
} from "lucide-react";
import { api } from "@/lib/api";

interface AnswerFeedbackResult {
  evaluation_id: string;
  overall_score: number;
  target_marks: number;
  score_percentage: number;
  structure_score: number;
  clarity_score: number;
  terminology_score: number;
  covered_concepts: string[];
  missing_concepts: string[];
  constructive_feedback: string;
  grammar_and_presentation_tips: string[];
  model_answer: string;
  safety_disclaimer: string;
}

export default function AnswerFeedback() {
  const [subject, setSubject] = useState("Kayachikitsa");
  const [questionText, setQuestionText] = useState(
    "Describe the Samprapti (Pathogenesis), Clinical Features, and Chikitsa Sutra of Tamaka Shwasa (Bronchial Asthma)."
  );
  const [studentAnswer, setStudentAnswer] = useState(
    "Tamaka Shwasa is an acute respiratory condition classified under Pranavaha Sroto Dushti. " +
    "The primary causative factors (Nidana) include exposure to dust (Dhooli), smoke (Dhooma), cold wind (Sheeta Vata), and excessive intake of heavy/cold foods (Guru Sheeta Ahara). " +
    "Samprapti: The aggravated Vata gets obstructed by morbid Kapha in the chest (Uras) and starts moving in reverse direction (Pratiloma Gati), blocking the respiratory channels. " +
    "Clinical Signs: Severe paroxysmal breathlessness, wheezing, orthopnea (patient finds comfort in sitting position - Aasino Labhate Saukhyam), and cloudy vision during severe fits. " +
    "Chikitsa: Purvakarma with gentle Snehana (Tila Taila with Saindhava Lavana) and Swedana. In strong patients (Balavan), mild Vamana with Madanaphala or Virechana is indicated. Shamana therapy includes Kanakasava, Shringyadi Churna, and Swasakasachintamani Rasa."
  );
  const [targetMarks, setTargetMarks] = useState(10);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<AnswerFeedbackResult | null>(null);

  const handleSubmitAnswer = async () => {
    if (!studentAnswer.trim() || isEvaluating) return;
    setIsEvaluating(true);
    try {
      const res = await api.post("/ai-ecosystem/answer-feedback", {
        subject,
        question_text: questionText,
        student_answer: studentAnswer,
        target_marks: Number(targetMarks)
      });
      if (res.data) {
        setEvaluation(res.data);
      }
    } catch (err) {
      console.error("Failed to evaluate answer:", err);
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. TOP HEADER & QUESTION INPUT */}
      <div className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-gray-100 dark:border-gray-800">
          <div className="p-2 rounded-xl bg-purple-600 text-white shadow-md shadow-purple-600/20">
            <FileCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              AI Practice Answer Feedback & University Scoring Engine
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Submit practice descriptive answers (5, 10, or 15 marks) for objective evaluation against NCISM university rubrics
            </p>
          </div>
        </div>

        {/* Form controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block font-bold text-gray-600 dark:text-gray-300 mb-1">
              BAMS Subject
            </label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-1 focus:ring-purple-500"
            >
              <option value="Kayachikitsa">Kayachikitsa (Internal Medicine)</option>
              <option value="Panchakarma">Panchakarma (Detoxification)</option>
              <option value="Roganidana">Roganidana (Pathology)</option>
              <option value="Dravyaguna">Dravyaguna (Pharmacology)</option>
              <option value="Shalya Tantra">Shalya Tantra (Surgery)</option>
              <option value="Maulik Siddhanta">Maulik Siddhanta (Foundations)</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-gray-600 dark:text-gray-300 mb-1">
              Target Question Marks
            </label>
            <select
              value={targetMarks}
              onChange={(e) => setTargetMarks(Number(e.target.value))}
              className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-1 focus:ring-purple-500"
            >
              <option value={5}>5 Marks (Short Answer Question - SAQ)</option>
              <option value={10}>10 Marks (Long Answer Question - LAQ)</option>
              <option value={15}>15 Marks (Major Essay Question)</option>
            </select>
          </div>

          <div className="sm:col-span-1 flex items-end">
            <button
              onClick={handleSubmitAnswer}
              disabled={isEvaluating || !studentAnswer.trim()}
              className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-purple-600/20"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isEvaluating ? "Evaluating with AI Rubric..." : "Submit for Evaluation"}</span>
            </button>
          </div>
        </div>

        {/* Question Text */}
        <div>
          <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1">
            Examination Question
          </label>
          <input
            type="text"
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            className="w-full p-2.5 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white font-medium"
          />
        </div>

        {/* Student Answer Textarea */}
        <div>
          <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1">
            Your Written Practice Answer
          </label>
          <textarea
            rows={7}
            value={studentAnswer}
            onChange={(e) => setStudentAnswer(e.target.value)}
            placeholder="Write your practice answer here including classical citations, classifications, and treatment..."
            className="w-full p-3.5 text-xs sm:text-sm font-mono bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white leading-relaxed focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* 2. EVALUATION & SCORING RESULTS */}
      {evaluation && (
        <div className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm space-y-6 animate-fadeIn">
          {/* Top Score Matrix */}
          <div className="p-5 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 border border-purple-200 dark:border-purple-800 rounded-2xl flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400">
                Evaluation Score Breakdown
              </span>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-1">
                {evaluation.overall_score} / {evaluation.target_marks} Marks ({evaluation.score_percentage}%)
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 max-w-xl">
                {evaluation.constructive_feedback}
              </p>
            </div>

            {/* Rubric Category Mini-Scores */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 bg-white dark:bg-gray-800 rounded-xl border border-purple-200 dark:border-purple-800 shadow-sm">
                <span className="text-base font-bold text-purple-600 block">{evaluation.structure_score}/3</span>
                <span className="text-[10px] text-gray-500">Structure</span>
              </div>
              <div className="p-2.5 bg-white dark:bg-gray-800 rounded-xl border border-purple-200 dark:border-purple-800 shadow-sm">
                <span className="text-base font-bold text-purple-600 block">{evaluation.clarity_score}/3</span>
                <span className="text-[10px] text-gray-500">Clarity</span>
              </div>
              <div className="p-2.5 bg-white dark:bg-gray-800 rounded-xl border border-purple-200 dark:border-purple-800 shadow-sm">
                <span className="text-base font-bold text-purple-600 block">{evaluation.terminology_score}/4</span>
                <span className="text-[10px] text-gray-500">Terminology</span>
              </div>
            </div>
          </div>

          {/* Concepts Covered vs Missing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Covered */}
            <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 rounded-xl space-y-2">
              <h5 className="font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Key Concepts & Strengths Covered:</span>
              </h5>
              <ul className="list-disc list-inside space-y-1 text-emerald-800 dark:text-emerald-300">
                {evaluation.covered_concepts.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>

            {/* Missing */}
            <div className="p-4 bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 rounded-xl space-y-2">
              <h5 className="font-bold text-rose-900 dark:text-rose-200 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>Missing Elements / Examiner Suggestions:</span>
              </h5>
              <ul className="list-disc list-inside space-y-1 text-rose-800 dark:text-rose-300">
                {evaluation.missing_concepts.map((m, i) => (
                  <li key={i}>{m}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Model Answer Breakdown */}
          <div className="p-5 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl space-y-3 text-xs sm:text-sm">
            <h5 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-600" />
              <span>BAMS University Benchmark Model Answer (Full Marks Standard):</span>
            </h5>
            <div className="whitespace-pre-line text-gray-700 dark:text-gray-200 leading-relaxed font-mono bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
              {evaluation.model_answer}
            </div>
          </div>

          {/* Safety note */}
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400 text-center">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
            <span>{evaluation.safety_disclaimer}</span>
          </div>
        </div>
      )}
    </div>
  );
}
