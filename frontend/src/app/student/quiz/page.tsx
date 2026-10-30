"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import {
  Sparkles,
  BookOpen,
  Target,
  ArrowRight,
  Flame,
  Award,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Brain,
  Layers,
  Clock,
  Play,
  Filter,
  RefreshCw,
  HelpCircle,
  Stethoscope,
  Sprout,
  Activity,
  Compass,
  Zap,
  GraduationCap,
  ShieldCheck,
  ChevronRight,
  Users
} from "lucide-react";
import { api } from "@/lib/api";

interface Subtopic {
  id: string;
  name: string;
  description?: string;
  display_order: number;
}

interface Topic {
  id: string;
  name: string;
  description?: string;
  questions_count: number;
  subtopics: Subtopic[];
}

interface Subject {
  id: string;
  name: string;
  code: string;
  icon?: string;
  description?: string;
  topics: Topic[];
}

interface TopicPerformance {
  id: string;
  subject_name: string;
  topic_name: string;
  subtopic_name?: string;
  total_questions_attempted: number;
  correct_answers: number;
  mastery_percentage: number;
  is_weak_area: boolean;
  needs_review: boolean;
  last_practiced_at?: string;
}

interface PersonalizedRecommendation {
  subject_name: string;
  topic_name: string;
  subtopic_name?: string;
  mastery_percentage: number;
  reason: string;
  suggested_difficulty: string;
  subject_id?: string;
  topic_id?: string;
  subtopic_id?: string;
}

export default function TopicQuizHubPage() {
  const router = useRouter();

  // Data states
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [performanceList, setPerformanceList] = useState<TopicPerformance[]>([]);
  const [weakTopics, setWeakTopics] = useState<TopicPerformance[]>([]);
  const [strongTopics, setStrongTopics] = useState<TopicPerformance[]>([]);
  const [recommendations, setRecommendations] = useState<PersonalizedRecommendation[]>([]);
  const [analyticsOverview, setAnalyticsOverview] = useState<any>(null);

  // Loading states
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Builder selections
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [selectedTopicId, setSelectedTopicId] = useState<string>("");
  const [selectedSubtopicId, setSelectedSubtopicId] = useState<string>("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("MIXED");
  const [selectedQuestionCount, setSelectedQuestionCount] = useState<number>(10);
  const [selectedQuestionType, setSelectedQuestionType] = useState<string>("ALL");

  useEffect(() => {
    async function loadData() {
      try {
        setLoadingSubjects(true);
        const [subjRes, perfRes, recRes] = await Promise.allSettled([
          api.get("/quiz/subjects"),
          api.get("/quiz/student/performance"),
          api.get("/quiz/student/recommendations"),
        ]);

        if (subjRes.status === "fulfilled" && subjRes.value.data) {
          setSubjects(subjRes.value.data);
          if (subjRes.value.data.length > 0) {
            const firstSubj = subjRes.value.data[0];
            setSelectedSubjectId(firstSubj.id);
            if (firstSubj.topics && firstSubj.topics.length > 0) {
              setSelectedTopicId(firstSubj.topics[0].id);
            }
          }
        }

        if (perfRes.status === "fulfilled" && perfRes.value.data) {
          const data = perfRes.value.data;
          setAnalyticsOverview(data);
          setPerformanceList(data.topics_performance || []);
          setWeakTopics(data.weak_topics || []);
          setStrongTopics(data.strong_topics || []);
        }

        if (recRes.status === "fulfilled" && recRes.value.data) {
          setRecommendations(recRes.value.data || []);
        }
      } catch (err: any) {
        console.error("Error loading quiz data:", err);
        setErrorMsg("Failed to initialize Topic Quiz system.");
      } finally {
        setLoadingSubjects(false);
        setLoadingAnalytics(false);
      }
    }
    loadData();
  }, []);

  // Handle subject change
  const handleSubjectChange = (subjId: string) => {
    setSelectedSubjectId(subjId);
    const subj = subjects.find((s) => s.id === subjId);
    if (subj && subj.topics && subj.topics.length > 0) {
      setSelectedTopicId(subj.topics[0].id);
      setSelectedSubtopicId("");
    } else {
      setSelectedTopicId("");
      setSelectedSubtopicId("");
    }
  };

  // Current active subject and topic objects
  const currentSubject = subjects.find((s) => s.id === selectedSubjectId);
  const currentTopic = currentSubject?.topics?.find((t) => t.id === selectedTopicId);
  const availableSubtopics = currentTopic?.subtopics || [];

  // Generate and start quiz
  const handleStartQuiz = async (overrideParams?: {
    subject_id?: string;
    topic_id?: string;
    subtopic_id?: string;
    difficulty?: string;
    question_count?: number;
  }) => {
    const subId = overrideParams?.subject_id || selectedSubjectId;
    const topId = overrideParams?.topic_id || selectedTopicId;
    const subtopId = overrideParams?.subtopic_id || (selectedSubtopicId || undefined);
    const diff = overrideParams?.difficulty || selectedDifficulty;
    const qCount = overrideParams?.question_count || selectedQuestionCount;

    if (!subId || !topId) {
      setErrorMsg("Please select both a Subject and a Topic before starting.");
      return;
    }

    setGenerating(true);
    setErrorMsg(null);

    try {
      const payload: any = {
        subject_id: subId,
        topic_id: topId,
        subtopic_id: subtopId || undefined,
        difficulty: diff,
        question_count: qCount,
        question_type: selectedQuestionType !== "ALL" ? selectedQuestionType : undefined,
      };

      const res = await api.post("/quiz/generate", payload);
      const attempt = res.data;
      if (attempt && attempt.attempt_id) {
        router.push(`/student/quiz/${attempt.attempt_id}`);
      } else {
        throw new Error("Invalid response from quiz generator");
      }
    } catch (err: any) {
      console.error("Quiz generation error:", err);
      const detail = err.response?.data?.detail || "Failed to generate topic quiz. Please check topic selection.";
      setErrorMsg(detail);
      setGenerating(false);
    }
  };

  // Helper for Subject icon
  const getSubjectIcon = (code: string) => {
    switch (code) {
      case "DRAVYA":
        return <Sprout className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
      case "PANCHA":
        return <Activity className="w-5 h-5 text-teal-600 dark:text-teal-400" />;
      case "RASA":
        return <Flame className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
      case "KAYA":
        return <Stethoscope className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
      case "SHALYA":
        return <ShieldCheck className="w-5 h-5 text-rose-600 dark:text-rose-400" />;
      default:
        return <Brain className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9F4] dark:bg-[#0F1713] text-[#1B2A22] dark:text-[#E8F1EB] flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Top Hero Banner */}
        <div className="rounded-3xl bg-white dark:bg-[#17221C] border border-[#DCE4DE] dark:border-[#2B3A31] p-6 sm:p-8 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 rounded-full bg-[#2F6B4F]/10 dark:bg-[#6FAF8A]/10 blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DCE8DF] dark:bg-[#26372D] text-[#2F6B4F] dark:text-[#6FAF8A] text-xs font-bold uppercase tracking-wider border border-[#2F6B4F]/20 dark:border-[#6FAF8A]/20">
                <Sparkles className="w-3.5 h-3.5" /> Topic-Bounded Adaptive MCQ Engine
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1B2A22] dark:text-[#E8F1EB]">
                Personalized Ayurvedic Topic Quizzes
              </h1>
              <p className="text-sm text-[#64736A] dark:text-[#A9B9AE] leading-relaxed">
                Practice verified classical questions strictly bounded to your chosen Subject and Topic.
                Detect weak areas automatically, master Ayurvedic principles, and receive personalized expert recommendations.
              </p>
            </div>

            {/* Quick Stats Summary */}
            <div className="grid grid-cols-3 gap-3 bg-[#F7F9F4] dark:bg-[#0F1713] p-4 rounded-2xl border border-[#DCE4DE] dark:border-[#2B3A31] shrink-0">
              <div className="text-center px-2">
                <div className="text-xl font-extrabold text-[#2F6B4F] dark:text-[#6FAF8A]">
                  {analyticsOverview?.overall_accuracy_percentage != null
                    ? `${analyticsOverview.overall_accuracy_percentage}%`
                    : "0%"}
                </div>
                <div className="text-[10px] uppercase font-bold text-[#64736A] dark:text-[#A9B9AE] mt-0.5">
                  Overall Accuracy
                </div>
              </div>
              <div className="text-center px-2 border-x border-[#DCE4DE] dark:border-[#2B3A31]">
                <div className="text-xl font-extrabold text-[#1B2A22] dark:text-[#E8F1EB]">
                  {analyticsOverview?.total_questions_answered || 0}
                </div>
                <div className="text-[10px] uppercase font-bold text-[#64736A] dark:text-[#A9B9AE] mt-0.5">
                  Solved MCQs
                </div>
              </div>
              <div className="text-center px-2">
                <div className="text-xl font-extrabold text-[#C65353] dark:text-[#E57373]">
                  {weakTopics.length}
                </div>
                <div className="text-[10px] uppercase font-bold text-[#64736A] dark:text-[#A9B9AE] mt-0.5">
                  Weak Topics
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-sm flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 text-red-500" />
            <div className="flex-1">{errorMsg}</div>
          </div>
        )}

        {/* Weak Topics Diagnostic Alert Banner (if any) */}
        {weakTopics.length > 0 && (
          <div className="rounded-3xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-2xl bg-[#C58A32]/15 text-[#C58A32] shrink-0 mt-0.5">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1B2A22] dark:text-[#E8F1EB]">
                    Weak Topic Alert: {weakTopics.length} Topics Require Reinforcement (&lt;65% Mastery)
                  </h3>
                  <p className="text-xs text-[#64736A] dark:text-[#A9B9AE] mt-1">
                    Reinforce your clinical understanding before exams by taking targeted short drills.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {weakTopics.slice(0, 3).map((wt) => (
                  <button
                    key={wt.id}
                    onClick={() => {
                      const matchedSubj = subjects.find(
                        (s) => s.name.toLowerCase() === wt.subject_name.toLowerCase()
                      );
                      const matchedTopic = matchedSubj?.topics.find(
                        (t) => t.name.toLowerCase() === wt.topic_name.toLowerCase()
                      );
                      if (matchedSubj && matchedTopic) {
                        setSelectedSubjectId(matchedSubj.id);
                        setSelectedTopicId(matchedTopic.id);
                        handleStartQuiz({
                          subject_id: matchedSubj.id,
                          topic_id: matchedTopic.id,
                          difficulty: "ADAPTIVE",
                          question_count: 5,
                        });
                      }
                    }}
                    className="px-3.5 py-1.5 rounded-full bg-white dark:bg-[#17221C] border border-amber-300 dark:border-amber-700/60 text-xs font-bold text-[#C58A32] hover:bg-amber-500 hover:text-white transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <Zap className="w-3.5 h-3.5" /> Practice {wt.topic_name} ({wt.mastery_percentage}%)
                  </button>
                ))}
                <Link
                  href="/student/ecosystem?tab=pipeline"
                  className="px-3.5 py-1.5 rounded-full bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Full BAMS Remediation (Voice + Cases + Mentors)
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* 2-COLUMN MAIN WORKSPACE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT: INTERACTIVE TOPIC QUIZ BUILDER (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="rounded-3xl bg-white dark:bg-[#17221C] border border-[#DCE4DE] dark:border-[#2B3A31] p-6 sm:p-8 shadow-sm space-y-6">
              <div className="border-b border-[#DCE4DE] dark:border-[#2B3A31] pb-4">
                <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#2F6B4F] dark:text-[#6FAF8A]">
                  <Compass className="w-4 h-4" /> Step-by-Step Customization
                </div>
                <h2 className="text-xl font-bold text-[#1B2A22] dark:text-[#E8F1EB] mt-1">
                  Configure Your Topic Quiz
                </h2>
              </div>

              {/* STEP 1: SELECT SUBJECT */}
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#64736A] dark:text-[#A9B9AE]">
                  Step 1: Select Ayurvedic Subject
                </label>
                {loadingSubjects ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 animate-pulse">
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <div key={n} className="h-20 rounded-2xl bg-[#F7F9F4] dark:bg-[#0F1713]" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {subjects.map((s) => {
                      const isSelected = s.id === selectedSubjectId;
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => handleSubjectChange(s.id)}
                          className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3.5 relative ${
                            isSelected
                              ? "bg-[#DCE8DF]/40 dark:bg-[#26372D]/50 border-[#2F6B4F] dark:border-[#6FAF8A] shadow-sm ring-1 ring-[#2F6B4F] dark:ring-[#6FAF8A]"
                              : "bg-[#F7F9F4] dark:bg-[#0F1713] border-[#DCE4DE] dark:border-[#2B3A31] hover:border-[#2F6B4F]/50 dark:hover:border-[#6FAF8A]/50"
                          }`}
                        >
                          <div className={`p-2 rounded-xl shrink-0 ${
                            isSelected
                              ? "bg-[#2F6B4F] text-white dark:bg-[#6FAF8A] dark:text-[#0F1713]"
                              : "bg-white dark:bg-[#17221C] border border-[#DCE4DE] dark:border-[#2B3A31]"
                          }`}>
                            {getSubjectIcon(s.code)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold text-[#1B2A22] dark:text-[#E8F1EB] truncate">
                              {s.name}
                            </div>
                            <div className="text-[11px] text-[#64736A] dark:text-[#A9B9AE] mt-0.5 line-clamp-1">
                              {s.topics?.length || 0} Topics Available
                            </div>
                          </div>
                          {isSelected && (
                            <CheckCircle2 className="w-4 h-4 text-[#2F6B4F] dark:text-[#6FAF8A] shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* STEP 2: SELECT TOPIC */}
              <div className="space-y-3 pt-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#64736A] dark:text-[#A9B9AE]">
                  Step 2: Select Specific Topic (Strictly Bounded)
                </label>
                {currentSubject?.topics && currentSubject.topics.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {currentSubject.topics.map((t) => {
                      const isSelected = t.id === selectedTopicId;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => {
                            setSelectedTopicId(t.id);
                            setSelectedSubtopicId("");
                          }}
                          className={`p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between gap-2 ${
                            isSelected
                              ? "bg-[#2F6B4F] text-white dark:bg-[#6FAF8A] dark:text-[#0F1713] border-[#2F6B4F] dark:border-[#6FAF8A] shadow-sm font-bold"
                              : "bg-[#F7F9F4] dark:bg-[#0F1713] border-[#DCE4DE] dark:border-[#2B3A31] text-[#1B2A22] dark:text-[#E8F1EB] hover:border-[#2F6B4F]/40"
                          }`}
                        >
                          <div className="truncate text-xs sm:text-sm">
                            {t.name}
                          </div>
                          {isSelected ? (
                            <CheckCircle2 className="w-4 h-4 shrink-0" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5 text-[#64736A] dark:text-[#A9B9AE] shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-[#F7F9F4] dark:bg-[#0F1713] border border-[#DCE4DE] dark:border-[#2B3A31] text-xs text-[#64736A] dark:text-[#A9B9AE]">
                    No topics available for selected subject.
                  </div>
                )}
              </div>

              {/* STEP 3: SUBTOPIC (OPTIONAL / ALL) */}
              {availableSubtopics.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#64736A] dark:text-[#A9B9AE]">
                      Step 3: Subtopic Focus (Optional)
                    </label>
                    {selectedSubtopicId && (
                      <button
                        onClick={() => setSelectedSubtopicId("")}
                        className="text-xs text-[#2F6B4F] dark:text-[#6FAF8A] font-bold hover:underline"
                      >
                        Clear Focus (All Subtopics)
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedSubtopicId("")}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                        !selectedSubtopicId
                          ? "bg-[#2F6B4F] text-white dark:bg-[#6FAF8A] dark:text-[#0F1713] border-[#2F6B4F]"
                          : "bg-[#F7F9F4] dark:bg-[#0F1713] border-[#DCE4DE] dark:border-[#2B3A31] text-[#1B2A22] dark:text-[#E8F1EB]"
                      }`}
                    >
                      Entire Topic (All)
                    </button>
                    {availableSubtopics.map((st) => {
                      const isSelected = st.id === selectedSubtopicId;
                      return (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => setSelectedSubtopicId(st.id)}
                          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                            isSelected
                              ? "bg-[#2F6B4F] text-white dark:bg-[#6FAF8A] dark:text-[#0F1713] border-[#2F6B4F]"
                              : "bg-[#F7F9F4] dark:bg-[#0F1713] border-[#DCE4DE] dark:border-[#2B3A31] text-[#1B2A22] dark:text-[#E8F1EB] hover:border-[#2F6B4F]/40"
                          }`}
                        >
                          {st.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 4: DIFFICULTY & QUESTION COUNT */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* Difficulty Selector */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#64736A] dark:text-[#A9B9AE]">
                    Difficulty Mode
                  </label>
                  <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#F7F9F4] dark:bg-[#0F1713] border border-[#DCE4DE] dark:border-[#2B3A31] text-sm font-semibold text-[#1B2A22] dark:text-[#E8F1EB] focus:outline-none focus:ring-2 focus:ring-[#2F6B4F]"
                  >
                    <option value="MIXED">Mixed (Balanced Assessment)</option>
                    <option value="EASY">Easy (Conceptual Fundamentals)</option>
                    <option value="MEDIUM">Medium (Standard Clinical)</option>
                    <option value="HARD">Hard (Advanced Competitive/AIAPGET)</option>
                    <option value="ADAPTIVE">Adaptive (Dynamic Weakness Focus)</option>
                  </select>
                </div>

                {/* Question Count Selector */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#64736A] dark:text-[#A9B9AE]">
                    Question Count
                  </label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {[5, 10, 20, 30, 50].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setSelectedQuestionCount(num)}
                        className={`py-2 rounded-xl text-xs font-extrabold border transition-all ${
                          selectedQuestionCount === num
                            ? "bg-[#2F6B4F] text-white dark:bg-[#6FAF8A] dark:text-[#0F1713] border-[#2F6B4F]"
                            : "bg-[#F7F9F4] dark:bg-[#0F1713] border-[#DCE4DE] dark:border-[#2B3A31] text-[#1B2A22] dark:text-[#E8F1EB] hover:border-[#2F6B4F]/40"
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* ACTION: LAUNCH TOPIC QUIZ BUTTON */}
              <div className="pt-4 border-t border-[#DCE4DE] dark:border-[#2B3A31]">
                <button
                  type="button"
                  disabled={generating || !selectedSubjectId || !selectedTopicId}
                  onClick={() => handleStartQuiz()}
                  className="w-full py-4 rounded-2xl bg-[#2F6B4F] hover:bg-[#24563F] dark:bg-[#6FAF8A] dark:hover:bg-[#8BC4A2] text-white dark:text-[#0F1713] font-bold text-sm flex items-center justify-center gap-2.5 shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Generating Topic-Bounded Quiz...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      Start Quiz: {currentSubject?.name} → {currentTopic?.name || "Topic"} ({selectedQuestionCount} Qs)
                    </>
                  )}
                </button>
                <p className="text-[11px] text-center text-[#64736A] dark:text-[#A9B9AE] mt-2">
                  Guaranteed: Only questions belonging to this topic will be generated.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT: TOPIC MASTERY & PERSONALIZED RECOMMENDATIONS (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* PERSONALIZED PRACTICE RECOMMENDATIONS */}
            <div className="rounded-3xl bg-white dark:bg-[#17221C] border border-[#DCE4DE] dark:border-[#2B3A31] p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-[#DCE4DE] dark:border-[#2B3A31] pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-[#2F6B4F]/10 dark:bg-[#6FAF8A]/20 text-[#2F6B4F] dark:text-[#6FAF8A]">
                    <Brain className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-[#1B2A22] dark:text-[#E8F1EB]">
                    Recommended Topic Quizzes
                  </h3>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#64736A] dark:text-[#A9B9AE]">
                  Personalized
                </span>
              </div>

              {recommendations.length > 0 ? (
                <div className="space-y-3">
                  {recommendations.map((rec, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-[#F7F9F4] dark:bg-[#0F1713] border border-[#DCE4DE] dark:border-[#2B3A31] hover:border-[#2F6B4F]/40 transition-all flex items-start justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="inline-block text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-[#DCE8DF] dark:bg-[#26372D] text-[#2F6B4F] dark:text-[#6FAF8A]">
                          {rec.subject_name}
                        </div>
                        <h4 className="text-sm font-bold text-[#1B2A22] dark:text-[#E8F1EB]">
                          {rec.topic_name}
                          {rec.subtopic_name && ` • ${rec.subtopic_name}`}
                        </h4>
                        <p className="text-xs text-[#64736A] dark:text-[#A9B9AE]">
                          {rec.reason}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const subj = subjects.find(
                            (s) => s.name.toLowerCase() === rec.subject_name.toLowerCase()
                          );
                          const top = subj?.topics.find(
                            (t) => t.name.toLowerCase() === rec.topic_name.toLowerCase()
                          );
                          if (subj && top) {
                            setSelectedSubjectId(subj.id);
                            setSelectedTopicId(top.id);
                            handleStartQuiz({
                              subject_id: subj.id,
                              topic_id: top.id,
                              difficulty: rec.suggested_difficulty || "MIXED",
                              question_count: 10,
                            });
                          }
                        }}
                        className="p-2.5 rounded-xl bg-[#2F6B4F] hover:bg-[#24563F] text-white shrink-0 shadow-sm transition-transform active:scale-95"
                        title="Practice this topic"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-[#3D8B5A] mx-auto opacity-70" />
                  <p className="text-xs font-semibold text-[#64736A] dark:text-[#A9B9AE]">
                    Start taking topic quizzes to generate AI-tailored personalized suggestions!
                  </p>
                </div>
              )}
            </div>

            {/* TOPIC MASTERY BREAKDOWN */}
            <div className="rounded-3xl bg-white dark:bg-[#17221C] border border-[#DCE4DE] dark:border-[#2B3A31] p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-[#DCE4DE] dark:border-[#2B3A31] pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-[#2F6B4F]/10 dark:bg-[#6FAF8A]/20 text-[#2F6B4F] dark:text-[#6FAF8A]">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-[#1B2A22] dark:text-[#E8F1EB]">
                    Your Topic Mastery Scorecard
                  </h3>
                </div>
              </div>

              {performanceList.length > 0 ? (
                <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                  {performanceList.map((p) => {
                    const isWeak = p.is_weak_area;
                    const isStrong = p.mastery_percentage >= 75;
                    return (
                      <div
                        key={p.id}
                        className="p-3.5 rounded-2xl bg-[#F7F9F4] dark:bg-[#0F1713] border border-[#DCE4DE] dark:border-[#2B3A31] space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-[10px] uppercase font-bold text-[#64736A] dark:text-[#A9B9AE]">
                              {p.subject_name}
                            </div>
                            <div className="text-xs font-bold text-[#1B2A22] dark:text-[#E8F1EB]">
                              {p.topic_name}
                            </div>
                          </div>
                          <span
                            className={`text-xs font-extrabold px-2 py-0.5 rounded-full ${
                              isWeak
                                ? "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300"
                                : isStrong
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                                : "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
                            }`}
                          >
                            {p.mastery_percentage}% Mastery
                          </span>
                        </div>

                        {/* Progress bar */}
                        <div className="w-full h-2 rounded-full bg-[#DCE4DE] dark:bg-[#2B3A31] overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              isWeak
                                ? "bg-[#C65353]"
                                : isStrong
                                ? "bg-[#3D8B5A]"
                                : "bg-[#C58A32]"
                            }`}
                            style={{ width: `${Math.min(100, Math.max(5, p.mastery_percentage))}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-[#64736A] dark:text-[#A9B9AE]">
                          <span>{p.correct_answers}/{p.total_questions_attempted} Correct</span>
                          {isWeak && <span className="text-[#C65353] font-bold">Needs Review</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6 space-y-2">
                  <Award className="w-8 h-8 text-[#64736A] dark:text-[#A9B9AE] mx-auto opacity-50" />
                  <p className="text-xs text-[#64736A] dark:text-[#A9B9AE]">
                    No topic attempts recorded yet. Take your first quiz above to track topic performance!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
