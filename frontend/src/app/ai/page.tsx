"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import {
  Bot,
  FileText,
  Award,
  Calendar,
  Lightbulb,
  FileCheck,
  Search,
  GraduationCap,
  Sparkles,
  ShieldAlert,
  Layers
} from "lucide-react";

import MasterChatbot from "@/components/ai/MasterChatbot";
import NotesAssistant from "@/components/ai/NotesAssistant";
import QuizGenerator from "@/components/ai/QuizGenerator";
import StudyPlanner from "@/components/ai/StudyPlanner";
import LearningAssistant from "@/components/ai/LearningAssistant";
import AnswerFeedback from "@/components/ai/AnswerFeedback";
import EducationalSearch from "@/components/ai/EducationalSearch";
import FacultyAssistant from "@/components/ai/FacultyAssistant";

type AITabType =
  | "chatbot"
  | "notes"
  | "quiz"
  | "planner"
  | "learning"
  | "feedback"
  | "search"
  | "faculty";

function AIStudioContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") as AITabType | null;

  const [activeTab, setActiveTab] = useState<AITabType>("chatbot");
  const [userRole, setUserRole] = useState<string>("STUDENT");

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("ayursetu_role") || localStorage.getItem("role") || "STUDENT";
      setUserRole(stored.toUpperCase());
    }
  }, []);

  const tabs = [
    { id: "chatbot", label: "Master AI Assistant", icon: Bot, badge: "Unified" },
    { id: "notes", label: "AI Notes Assistant", icon: FileText, badge: "12+ Tools" },
    { id: "quiz", label: "AI Quiz & Exams", icon: Award, badge: "NCISM" },
    { id: "planner", label: "AI Study Planner", icon: Calendar, badge: "Adaptive" },
    { id: "learning", label: "Personalized Learning", icon: Lightbulb, badge: "Gaps" },
    { id: "feedback", label: "Answer Feedback", icon: FileCheck, badge: "Rubric" },
    { id: "search", label: "Treatise & Note Search", icon: Search, badge: "Semantic" },
    {
      id: "faculty",
      label: "Faculty Assistant",
      icon: GraduationCap,
      badge: "Staff",
      restrictedToFaculty: true
    }
  ];

  const handleLaunchQuizFromLearning = (topicName: string, subjectName: string) => {
    setActiveTab("quiz");
  };

  const handleAskAIFromSearch = (queryText: string) => {
    setActiveTab("chatbot");
  };

  return (
    <div className="min-h-screen bg-[#F8FAF6] dark:bg-[#0B120E] text-gray-900 dark:text-gray-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* HERO TITLE & ECOSYSTEM BANNER */}
        <div className="relative overflow-hidden p-6 sm:p-8 bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-950 rounded-3xl text-white shadow-xl shadow-emerald-950/20">
          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Aayuraura Master AI Learning Ecosystem</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
              Intelligent BAMS Academic & Clinical Intelligence Studio
            </h1>

            <p className="text-sm text-emerald-100/90 leading-relaxed max-w-2xl">
              One unified AI ecosystem designed for Ayurvedic scholars, doctors, and faculty.
              Master classical Brihat-trayi treatises, generate NCISM-compliant exam answers,
              improve notes with dual-pane AI transformations, and track topic remediation.
            </p>
          </div>

          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-teal-400/20 via-transparent to-transparent pointer-events-none" />
        </div>

        {/* ECOSYSTEM TAB NAVIGATION BAR */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-gray-200 dark:border-gray-800 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const isRestricted = tab.restrictedToFaculty && !["DOCTOR", "FACULTY", "ADMIN"].includes(userRole);

            if (isRestricted) return null;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as AITabType)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all duration-200 flex-shrink-0 ${
                  isActive
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 scale-[1.02]"
                    : "bg-white dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200/80 dark:border-gray-700"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-emerald-600 dark:text-emerald-400"}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300"
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ACTIVE ECOSYSTEM TOOL WORKSPACE */}
        <div className="min-h-[700px]">
          {activeTab === "chatbot" && <MasterChatbot />}
          {activeTab === "notes" && <NotesAssistant />}
          {activeTab === "quiz" && <QuizGenerator />}
          {activeTab === "planner" && <StudyPlanner />}
          {activeTab === "learning" && (
            <LearningAssistant onLaunchQuiz={handleLaunchQuizFromLearning} />
          )}
          {activeTab === "feedback" && <AnswerFeedback />}
          {activeTab === "search" && <EducationalSearch onAskAI={handleAskAIFromSearch} />}
          {activeTab === "faculty" && <FacultyAssistant />}
        </div>
      </main>
    </div>
  );
}

export default function AIStudioPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F8FAF6] dark:bg-[#0B120E] text-emerald-600">
          <div className="animate-pulse text-sm font-bold">
            Loading Aayuraura AI Studio...
          </div>
        </div>
      }
    >
      <AIStudioContent />
    </Suspense>
  );
}
