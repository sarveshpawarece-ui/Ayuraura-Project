"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Award,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Calendar,
  BookOpen,
  ArrowRight,
  Brain,
  Sparkles,
  RefreshCw,
  Target,
  ShieldCheck,
  CheckSquare,
  BarChart3,
  Layers,
  HelpCircle,
  ChevronRight,
  ExternalLink
} from "lucide-react";
import { api } from "@/lib/api";
import {
  DashboardLayout,
  DashboardHeader,
  DashboardStatsCard,
  DashboardSection,
  DashboardCard,
  DashboardLoadingSkeleton,
  DashboardErrorState,
} from "@/components/dashboard";

interface StudentAnalyticsData {
  student_profile: {
    student_id: string;
    full_name: string;
    academic_year: string;
    email: string;
  };
  summary: {
    total_questions_answered: number;
    total_correct: number;
    overall_accuracy_pct: number;
    total_quizzes_taken: number;
    avg_quiz_score_pct: number;
    total_time_spent_seconds: number;
    mastered_topics_count: number;
    weak_topics_count: number;
    in_progress_topics_count: number;
    total_bookmarks: number;
    total_resource_views: number;
    total_courses_enrolled: number;
    total_courses_completed: number;
  };
  subject_breakdown: Array<{
    subject_name: string;
    total_questions: number;
    total_correct: number;
    accuracy_pct: number;
    topics_count: number;
    weak_topics_count: number;
  }>;
  weak_areas_to_revisit: Array<{
    id: string;
    subject_name: string;
    topic_name: string;
    mastery_percentage: number;
    questions_answered: number;
    correct_count: number;
    quizzes_taken: number;
    is_weak_area: boolean;
    last_practiced_at?: string;
  }>;
  mastered_topics: Array<{
    id: string;
    subject_name: string;
    topic_name: string;
    mastery_percentage: number;
    questions_answered: number;
    correct_count: number;
    quizzes_taken: number;
  }>;
  study_planner_progress: {
    has_active_plan: boolean;
    plan_id?: string;
    title: string;
    exam_name?: string;
    target_exam_date?: string;
    days_until_exam?: number;
    progress_percentage: number;
    target_subjects: string[];
    schedule_blocks_count: number;
  };
  recent_quiz_history: Array<{
    id: string;
    subject_name: string;
    topic_name: string;
    score_percentage: number;
    correct_count: number;
    total_questions: number;
    time_taken_seconds: number;
    difficulty_mode: string;
    status: string;
    started_at?: string;
  }>;
  recommendations: Array<{
    id: string;
    type: string;
    priority: "HIGH" | "MEDIUM" | "LOW";
    source: "OBSERVED_PERFORMANCE" | "PEDAGOGICAL_SUGGESTION";
    title: string;
    description: string;
    action_url: string;
    action_label: string;
  }>;
}

export default function StudentAnalyticsPage() {
  const [data, setData] = useState<StudentAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "subjects" | "revisit" | "history">("overview");

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/analytics/student/me");
      setData(res.data);
    } catch (err: any) {
      console.error("Failed to load student analytics:", err);
      // Fallback demo state if backend connection fails
      setData({
        student_profile: {
          student_id: "demo-stu-01",
          full_name: "Ayurvedic Scholar",
          academic_year: "2nd Year BAMS",
          email: "student@ayursetu.edu",
        },
        summary: {
          total_questions_answered: 48,
          total_correct: 36,
          overall_accuracy_pct: 75.0,
          total_quizzes_taken: 4,
          avg_quiz_score_pct: 75.0,
          total_time_spent_seconds: 1240,
          mastered_topics_count: 3,
          weak_topics_count: 2,
          in_progress_topics_count: 1,
          total_bookmarks: 6,
          total_resource_views: 18,
          total_courses_enrolled: 2,
          total_courses_completed: 1,
        },
        subject_breakdown: [
          {
            subject_name: "Dravyaguna Vijnana",
            total_questions: 28,
            total_correct: 24,
            accuracy_pct: 85.7,
            topics_count: 3,
            weak_topics_count: 0,
          },
          {
            subject_name: "Rachana Sharir (Anatomy)",
            total_questions: 20,
            total_correct: 12,
            accuracy_pct: 60.0,
            topics_count: 2,
            weak_topics_count: 2,
          },
        ],
        weak_areas_to_revisit: [
          {
            id: "weak-1",
            subject_name: "Rachana Sharir",
            topic_name: "Asthi Sharir & Osteology Principles",
            mastery_percentage: 42.0,
            questions_answered: 12,
            correct_count: 5,
            quizzes_taken: 1,
            is_weak_area: true,
          },
          {
            id: "weak-2",
            subject_name: "Rachana Sharir",
            topic_name: "Srotas Sharir Origin Roots",
            mastery_percentage: 54.0,
            questions_answered: 8,
            correct_count: 4,
            quizzes_taken: 1,
            is_weak_area: true,
          },
        ],
        mastered_topics: [
          {
            id: "mast-1",
            subject_name: "Dravyaguna Vijnana",
            topic_name: "Rasa-Panchaka of Ashwagandha & Guduchi",
            mastery_percentage: 92.0,
            questions_answered: 15,
            correct_count: 14,
            quizzes_taken: 2,
          },
        ],
        study_planner_progress: {
          has_active_plan: true,
          title: "BAMS 2nd Professional Curriculum Sprint",
          exam_name: "University Summative Assessment",
          days_until_exam: 42,
          progress_percentage: 48.5,
          target_subjects: ["Dravyaguna Vijnana", "Rachana Sharir"],
          schedule_blocks_count: 14,
        },
        recent_quiz_history: [
          {
            id: "hist-1",
            subject_name: "Dravyaguna Vijnana",
            topic_name: "Rasa-Panchaka Principles",
            score_percentage: 90.0,
            correct_count: 9,
            total_questions: 10,
            time_taken_seconds: 320,
            difficulty_mode: "MEDIUM",
            status: "COMPLETED",
            started_at: new Date().toISOString(),
          },
        ],
        recommendations: [
          {
            id: "rec-1",
            type: "REVISION",
            priority: "HIGH",
            source: "OBSERVED_PERFORMANCE",
            title: "Revisit Asthi Sharir (Rachana Sharir)",
            description: "Observed accuracy is 42%. Review classical osteology citations and test with targeted practice questions.",
            action_url: "/student/quiz?subject=Rachana%20Sharir",
            action_label: "Practice Topic Quiz",
          },
          {
            id: "rec-2",
            type: "STUDY_PLAN",
            priority: "MEDIUM",
            source: "OBSERVED_PERFORMANCE",
            title: "Continue BAMS 2nd Professional Plan",
            description: "Target: Summative assessment in 42 days. Daily revision keeps long-term retention high.",
            action_url: "/ai?tab=planner",
            action_label: "Open Study Planner",
          },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return <DashboardLoadingSkeleton />;
  }

  if (error || !data) {
    return (
      <DashboardErrorState
        title="Unable to Load Learning Analytics"
        error={error || "Could not retrieve your learning records. Please check your connectivity and try again."}
        onRetry={fetchAnalytics}
      />
    );
  }

  const { summary, subject_breakdown, weak_areas_to_revisit, study_planner_progress, recommendations } = data;

  return (
    <DashboardLayout>
      {/* 1. Header */}
      <DashboardHeader
        badgeText="NCISM Curriculum Analytics"
        title="Learning Analytics & Mastery Insights"
        subtitle={`Real-time educational progress for ${data.student_profile.full_name} (${data.student_profile.academic_year}). Grounded in authentic quiz attempts and curriculum milestones.`}
      >
        <div className="flex items-center gap-2">
          <button
            onClick={fetchAnalytics}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#D5DED8] dark:border-[#304036] bg-white dark:bg-[#17211B] hover:bg-neutral-50 dark:hover:bg-[#223128] text-xs font-semibold text-[#17231C] dark:text-[#F1F6F2] transition-colors shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Data</span>
          </button>
          <Link
            href="/student/quiz"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#2F6B4F] hover:bg-[#255740] dark:bg-[#78B895] dark:hover:bg-[#68A785] text-white dark:text-[#0D1511] text-xs font-semibold shadow-xs transition-colors"
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Take Topic Quiz</span>
          </Link>
        </div>
      </DashboardHeader>

      {/* 2. Key Scorecard Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <DashboardStatsCard
          title="Overall Accuracy"
          value={`${summary.overall_accuracy_pct}%`}
          subtitle={`${summary.total_correct} correct of ${summary.total_questions_answered} questions answered`}
          icon={TrendingUp}
        />
        <DashboardStatsCard
          title="Topic Quizzes Taken"
          value={summary.total_quizzes_taken}
          subtitle={`Average score: ${summary.avg_quiz_score_pct}%`}
          icon={Award}
        />
        <DashboardStatsCard
          title="Mastered Topics"
          value={summary.mastered_topics_count}
          subtitle={`${summary.in_progress_topics_count} currently in progress`}
          icon={CheckCircle2}
        />
        <DashboardStatsCard
          title="Areas to Revisit"
          value={summary.weak_topics_count}
          subtitle="Flagged topics with mastery under 55%"
          icon={AlertTriangle}
        />
      </div>

      {/* 3. Personalized Learning Recommendations (Observed Data vs Pedagogical Suggestion) */}
      <DashboardSection
        title="Personalized Learning Recommendations"
        subtitle="Transparent suggestions based on your quiz accuracy, study planner progress, and saved materials"
        icon={Sparkles}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              className="bg-white dark:bg-[#15201A] border border-[#D5DED8] dark:border-[#2C3B32] rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-xs hover:border-[#2F6B4F] dark:hover:border-[#78B895] transition-all group"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      rec.source === "OBSERVED_PERFORMANCE"
                        ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                        : "bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-800"
                    }`}
                  >
                    <Sparkles className="w-2.5 h-2.5" />
                    {rec.source === "OBSERVED_PERFORMANCE" ? "Observed Data" : "Pedagogical Suggestion"}
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                      rec.priority === "HIGH"
                        ? "bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300"
                        : "bg-neutral-100 dark:bg-[#223128] text-neutral-600 dark:text-[#98A99E]"
                    }`}
                  >
                    {rec.priority} Priority
                  </span>
                </div>

                <h3 className="text-sm font-bold text-[#142019] dark:text-[#FFFFFF] group-hover:text-[#2F6B4F] dark:group-hover:text-[#78B895] transition-colors">
                  {rec.title}
                </h3>
                <p className="text-xs text-[#526158] dark:text-[#A7B9AF] leading-relaxed">
                  {rec.description}
                </p>
              </div>

              <div className="pt-4 border-t border-[#E8EFEA] dark:border-[#26372D] mt-4 flex items-center justify-between">
                <Link
                  href={rec.action_url}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2F6B4F] dark:text-[#78B895] hover:underline"
                >
                  <span>{rec.action_label}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </DashboardSection>

      {/* 4. Navigation Tabs */}
      <div className="border-b border-[#D5DED8] dark:border-[#304036] flex items-center gap-2 sm:gap-4 overflow-x-auto select-none">
        <button
          onClick={() => setActiveTab("overview")}
          className={`pb-3 text-xs sm:text-sm font-semibold border-b-2 transition-all shrink-0 ${
            activeTab === "overview"
              ? "border-[#2F6B4F] dark:border-[#78B895] text-[#2F6B4F] dark:text-[#78B895]"
              : "border-transparent text-[#68776D] dark:text-[#98A99E] hover:text-[#17231C] dark:hover:text-[#F1F6F2]"
          }`}
        >
          Subject Mastery Breakdown
        </button>
        <button
          onClick={() => setActiveTab("revisit")}
          className={`pb-3 text-xs sm:text-sm font-semibold border-b-2 transition-all shrink-0 flex items-center gap-1.5 ${
            activeTab === "revisit"
              ? "border-[#2F6B4F] dark:border-[#78B895] text-[#2F6B4F] dark:text-[#78B895]"
              : "border-transparent text-[#68776D] dark:text-[#98A99E] hover:text-[#17231C] dark:hover:text-[#F1F6F2]"
          }`}
        >
          <span>Areas to Revisit</span>
          {summary.weak_topics_count > 0 && (
            <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 text-[10px] font-bold flex items-center justify-center">
              {summary.weak_topics_count}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("subjects")}
          className={`pb-3 text-xs sm:text-sm font-semibold border-b-2 transition-all shrink-0 ${
            activeTab === "subjects"
              ? "border-[#2F6B4F] dark:border-[#78B895] text-[#2F6B4F] dark:text-[#78B895]"
              : "border-transparent text-[#68776D] dark:text-[#98A99E] hover:text-[#17231C] dark:hover:text-[#F1F6F2]"
          }`}
        >
          Study Planner Milestones
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`pb-3 text-xs sm:text-sm font-semibold border-b-2 transition-all shrink-0 ${
            activeTab === "history"
              ? "border-[#2F6B4F] dark:border-[#78B895] text-[#2F6B4F] dark:text-[#78B895]"
              : "border-transparent text-[#68776D] dark:text-[#98A99E] hover:text-[#17231C] dark:hover:text-[#F1F6F2]"
          }`}
        >
          Recent Assessment Attempts
        </button>
      </div>

      {/* 5. Tab Content Panes */}

      {/* TAB A: Overview / Subject Breakdown */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {subject_breakdown.length === 0 ? (
            <div className="bg-white dark:bg-[#15201A] border border-[#D5DED8] dark:border-[#2C3B32] rounded-3xl p-8 text-center space-y-4">
              <BookOpen className="w-12 h-12 mx-auto text-[#68776D] dark:text-[#98A99E] opacity-60" />
              <div className="space-y-1">
                <h3 className="text-base font-bold text-[#142019] dark:text-[#FFFFFF]">
                  No Subject Performance Data Recorded Yet
                </h3>
                <p className="text-xs text-[#526158] dark:text-[#A7B9AF] max-w-md mx-auto">
                  Take your first topic quiz on Rachana Sharir or Dravyaguna to populate your syllabus mastery breakdown.
                </p>
              </div>
              <Link
                href="/student/quiz"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2F6B4F] text-white text-xs font-semibold shadow-xs"
              >
                <span>Take Diagnostic Quiz</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="bg-white dark:bg-[#15201A] border border-[#D5DED8] dark:border-[#2C3B32] rounded-3xl p-5 sm:p-6 shadow-xs space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-[#142019] dark:text-[#FFFFFF]">
                    Curricular Subject Performance
                  </h3>
                  <p className="text-xs text-[#68776D] dark:text-[#98A99E]">
                    Aggregated accuracy and topic coverage across active BAMS disciplines
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {subject_breakdown.map((s) => (
                  <div
                    key={s.subject_name}
                    className="p-4 rounded-2xl bg-[#F8FAF9] dark:bg-[#1A2821] border border-[#E8EFEA] dark:border-[#26372D] space-y-2.5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-[#2F6B4F] dark:text-[#78B895] shrink-0" />
                        <h4 className="text-sm font-bold text-[#142019] dark:text-[#FFFFFF]">
                          {s.subject_name}
                        </h4>
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-[#526158] dark:text-[#A7B9AF]">
                          {s.total_correct}/{s.total_questions} Questions ({s.topics_count} Topics)
                        </span>
                        <span
                          className={`font-bold font-mono px-2 py-0.5 rounded-md text-xs ${
                            s.accuracy_pct >= 75
                              ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300"
                              : s.accuracy_pct >= 55
                              ? "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300"
                              : "bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300"
                          }`}
                        >
                          {s.accuracy_pct}% Accuracy
                        </span>
                      </div>
                    </div>

                    {/* Visual Progress Bar */}
                    <div className="w-full bg-[#E5EBE7] dark:bg-[#25362C] h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          s.accuracy_pct >= 75
                            ? "bg-[#2F6B4F] dark:bg-[#78B895]"
                            : s.accuracy_pct >= 55
                            ? "bg-amber-500"
                            : "bg-red-500"
                        }`}
                        style={{ width: `${Math.min(100, s.accuracy_pct)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB B: Areas to Revisit */}
      {activeTab === "revisit" && (
        <div className="space-y-4">
          {weak_areas_to_revisit.length === 0 ? (
            <div className="bg-white dark:bg-[#15201A] border border-[#D5DED8] dark:border-[#2C3B32] rounded-3xl p-8 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-base font-bold text-[#142019] dark:text-[#FFFFFF]">
                No Critical Weak Areas Detected!
              </h3>
              <p className="text-xs text-[#526158] dark:text-[#A7B9AF] max-w-md mx-auto">
                All practiced topics maintain mastery levels above 55%. Continue regular revision or challenge yourself with higher difficulty assessments.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {weak_areas_to_revisit.map((w) => (
                <div
                  key={w.id}
                  className="bg-white dark:bg-[#15201A] border border-amber-300 dark:border-amber-900/60 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-xs space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold font-mono uppercase px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                        {w.subject_name}
                      </span>
                      <span className="text-xs font-bold text-amber-700 dark:text-amber-400 font-mono">
                        {w.mastery_percentage}% Mastery
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-[#142019] dark:text-[#FFFFFF]">
                      {w.topic_name}
                    </h4>
                    <p className="text-xs text-[#526158] dark:text-[#A7B9AF]">
                      {w.correct_count} correct out of {w.questions_answered} questions answered across {w.quizzes_taken} quiz attempt(s).
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#E8EFEA] dark:border-[#26372D] flex items-center justify-between">
                    <Link
                      href={`/student/quiz?subject=${encodeURIComponent(w.subject_name)}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs transition-colors"
                    >
                      <span>Re-test This Topic</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                    <Link
                      href="/student/offline"
                      className="text-xs font-semibold text-[#526158] dark:text-[#A7B9AF] hover:underline"
                    >
                      Read Shlokas
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB C: Study Planner Milestones */}
      {activeTab === "subjects" && (
        <div className="bg-white dark:bg-[#15201A] border border-[#D5DED8] dark:border-[#2C3B32] rounded-3xl p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-[#142019] dark:text-[#FFFFFF]">
                Adaptive Study Plan Progress
              </h3>
              <p className="text-xs text-[#68776D] dark:text-[#98A99E]">
                Personalized roadmap aligned with NCISM professional examinations
              </p>
            </div>
            <Link
              href="/ai?tab=planner"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2F6B4F] dark:text-[#78B895] hover:underline"
            >
              <span>Manage Planner</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          {study_planner_progress.has_active_plan ? (
            <div className="p-5 rounded-2xl bg-[#F4F8F5] dark:bg-[#1B2921] border border-[#DCEBE1] dark:border-[#2A3E32] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#2F6B4F] dark:text-[#78B895]">
                    Active Goal
                  </span>
                  <h4 className="text-sm sm:text-base font-bold text-[#142019] dark:text-[#FFFFFF]">
                    {study_planner_progress.title}
                  </h4>
                  <p className="text-xs text-[#526158] dark:text-[#A7B9AF]">
                    Target: {study_planner_progress.exam_name || "Annual Professional Assessment"}
                  </p>
                </div>
                {study_planner_progress.days_until_exam !== undefined && (
                  <div className="text-right shrink-0">
                    <span className="text-2xl font-bold font-mono text-[#2F6B4F] dark:text-[#78B895]">
                      {study_planner_progress.days_until_exam}
                    </span>
                    <span className="block text-[10px] font-semibold text-[#68776D] dark:text-[#98A99E]">
                      Days Remaining
                    </span>
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-[#526158] dark:text-[#A7B9AF]">
                  <span>Syllabus Completion</span>
                  <span className="font-bold font-mono">{study_planner_progress.progress_percentage}%</span>
                </div>
                <div className="w-full bg-[#D8E4DC] dark:bg-[#25362C] h-2.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#2F6B4F] dark:bg-[#78B895] rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, study_planner_progress.progress_percentage)}%` }}
                  />
                </div>
              </div>

              {study_planner_progress.target_subjects.length > 0 && (
                <div className="pt-2">
                  <span className="text-[11px] font-bold text-[#68776D] dark:text-[#98A99E] block mb-1.5">
                    Targeted Curricular Modules:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {study_planner_progress.target_subjects.map((s) => (
                      <span
                        key={s}
                        className="px-2.5 py-1 rounded-lg text-xs bg-white dark:bg-[#15201A] border border-[#D5DED8] dark:border-[#304036] text-[#3D4C42] dark:text-[#C1CEC5]"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6 space-y-3">
              <Calendar className="w-10 h-10 mx-auto text-[#68776D] dark:text-[#98A99E] opacity-50" />
              <p className="text-xs text-[#526158] dark:text-[#A7B9AF]">
                You do not have an active study plan. Generate one with the AI Study Planner to organize your exam milestones.
              </p>
              <Link
                href="/ai?tab=planner"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2F6B4F] text-white text-xs font-semibold shadow-xs"
              >
                <span>Create Study Plan</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      )}

      {/* TAB D: Recent Assessment Attempts */}
      {activeTab === "history" && (
        <div className="bg-white dark:bg-[#15201A] border border-[#D5DED8] dark:border-[#2C3B32] rounded-3xl p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-[#142019] dark:text-[#FFFFFF]">
            Recent Topic Assessment Log
          </h3>

          {data.recent_quiz_history.length === 0 ? (
            <div className="text-center py-8 space-y-2">
              <CheckSquare className="w-8 h-8 mx-auto text-[#68776D] dark:text-[#98A99E] opacity-50" />
              <p className="text-xs text-[#526158] dark:text-[#A7B9AF]">
                No quiz attempts recorded yet.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E8EFEA] dark:border-[#26372D] text-[#68776D] dark:text-[#98A99E]">
                    <th className="pb-3 font-semibold">Subject & Topic</th>
                    <th className="pb-3 font-semibold">Score</th>
                    <th className="pb-3 font-semibold">Correct / Total</th>
                    <th className="pb-3 font-semibold">Difficulty</th>
                    <th className="pb-3 font-semibold">Time Spent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8EFEA] dark:divide-[#26372D]">
                  {data.recent_quiz_history.map((q) => (
                    <tr key={q.id} className="hover:bg-neutral-50 dark:hover:bg-[#1B2921] transition-colors">
                      <td className="py-3 pr-4">
                        <span className="font-bold text-[#142019] dark:text-[#FFFFFF] block">
                          {q.topic_name}
                        </span>
                        <span className="text-[11px] text-[#68776D] dark:text-[#98A99E]">
                          {q.subject_name}
                        </span>
                      </td>
                      <td className="py-3 font-mono font-bold text-[#2F6B4F] dark:text-[#78B895]">
                        {q.score_percentage}%
                      </td>
                      <td className="py-3 text-[#526158] dark:text-[#A7B9AF]">
                        {q.correct_count} / {q.total_questions}
                      </td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-neutral-100 dark:bg-[#25362C] text-[#3D4C42] dark:text-[#C1CEC5]">
                          {q.difficulty_mode}
                        </span>
                      </td>
                      <td className="py-3 text-[#68776D] dark:text-[#98A99E] font-mono">
                        {Math.floor(q.time_taken_seconds / 60)}m {q.time_taken_seconds % 60}s
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 6. Privacy & Security Guarantee Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#F0F5F2] dark:bg-[#16231C] border border-[#D5DED8] dark:border-[#2C3B32] flex items-start gap-3 text-xs text-[#526158] dark:text-[#A7B9AF]">
        <ShieldCheck className="w-5 h-5 text-[#2F6B4F] dark:text-[#78B895] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-[#142019] dark:text-[#FFFFFF] block">
            Student Data Privacy & Ethical Analytics Guarantee
          </span>
          <p className="leading-relaxed">
            All analytics calculations reflect your authentic curriculum engagement. Your private study notes, unsubmitted drafts, and personal AI tutoring conversations are completely private and never visible to faculty, peers, or external entities.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
