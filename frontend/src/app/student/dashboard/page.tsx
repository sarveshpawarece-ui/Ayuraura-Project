"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Target,
  ArrowRight,
  Briefcase,
  Award,
  Layers,
  CheckCircle2,
  ShieldCheck,
  History,
  BookOpen,
  TrendingUp,
  FileText,
  User,
  Compass,
  Video,
  Radio,
  PlayCircle,
  Star,
  Users,
  ChevronRight,
  CheckSquare,
  Zap,
  AlertTriangle,
  Sprout,
  Activity,
  Flame,
  Stethoscope,
  Brain,
  ExternalLink,
  HelpCircle,
  Clock,
  HeartHandshake,
  Bell,
  Check,
  X,
  RotateCw,
  Calendar,
  Bookmark,
  Bot,
  Filter,
  CheckCircle,
  Settings
} from "lucide-react";
import { api } from "@/lib/api";
import {
  DashboardLayout,
  DashboardHeader,
  DashboardStatsCard,
  DashboardSection,
  DashboardCard,
  DashboardQuickActions,
  DashboardLoadingSkeleton,
  DashboardErrorState,
} from "@/components/dashboard";
import { DEMO_STUDENT, isDemoEmail } from "@/lib/demoData";

interface SmartRecommendation {
  id: string;
  type: string;
  title: string;
  subject: string;
  topic_id?: string;
  reason: string;
  priority: string;
  est_minutes: number;
  action_url: string;
  is_completed?: boolean;
  is_dismissed?: boolean;
}

interface SubjectProgress {
  id: string;
  code: string;
  name: string;
  sanskritName: string;
  professionalYear: string;
  iconName: string;
  totalTopics: number;
  completedTopics: number;
  completionPct: number;
  totalHours: number;
}

interface StudyPlanItem {
  id: string;
  time: string;
  subject: string;
  topic: string;
  type: string;
  completed: boolean;
  link: string;
}

interface UpcomingExam {
  id: string;
  title: string;
  date: string;
  days_remaining: number;
  type: string;
  venue: string;
}

interface PendingRevision {
  topic_id: string;
  title: string;
  subject_id: string;
  subject_name: string;
  is_bookmarked: boolean;
  exam_high_yield: boolean;
}

interface GoalSettings {
  target_minutes_daily: number;
  target_topics_daily: number;
  target_quizzes_weekly: number;
  reminders_enabled: boolean;
  reminder_time: string;
  completed_minutes_today: number;
  completed_topics_today: number;
  current_streak_days: number;
  streak_encouragement: string;
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  achieved: boolean;
  icon: string;
}

export default function StudentDashboard() {
  // Existing state
  const [targetCareer, setTargetCareer] = useState<any>(null);
  const [assessmentStatus, setAssessmentStatus] = useState<any>(null);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [myApplications, setMyApplications] = useState<any[]>([]);
  const [discoveryFeed, setDiscoveryFeed] = useState<any>(null);
  const [topicAnalytics, setTopicAnalytics] = useState<any>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applyingId, setApplyingId] = useState<string | null>(null);

  // New Academic Personalization & Learning Experience State
  const [studentName, setStudentName] = useState<string>("Ayurveda Scholar");
  const [academicYear, setAcademicYear] = useState<string>("4th Prof");
  const [overallCompletionPct, setOverallCompletionPct] = useState<number>(18.5);
  const [topicsCompletedCount, setTopicsCompletedCount] = useState<number>(3);
  const [totalTopicsCount, setTotalTopicsCount] = useState<number>(18);
  const [bookmarkedCount, setBookmarkedCount] = useState<number>(2);
  const [subjectsProgress, setSubjectsProgress] = useState<SubjectProgress[]>([]);
  const [todayStudyPlan, setTodayStudyPlan] = useState<StudyPlanItem[]>([]);
  const [upcomingExams, setUpcomingExams] = useState<UpcomingExam[]>([]);
  const [pendingRevisions, setPendingRevisions] = useState<PendingRevision[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);
  const [savedNotesRecent, setSavedNotesRecent] = useState<any[]>([]);
  const [savedNotesCount, setSavedNotesCount] = useState<number>(0);
  const [quizPerf, setQuizPerf] = useState<any>({
    average_score_pct: 78.5,
    total_quizzes_taken: 4,
    strong_subjects: ["Panchakarma", "Samhita Siddhanta"],
    weak_subjects: ["Roganidana Shat-Kriya Kala", "Dravyaguna Phyto-markers"],
  });
  const [goals, setGoals] = useState<GoalSettings>({
    target_minutes_daily: 45,
    target_topics_daily: 3,
    target_quizzes_weekly: 4,
    reminders_enabled: true,
    reminder_time: "19:00",
    completed_minutes_today: 35,
    completed_topics_today: 2,
    current_streak_days: 4,
    streak_encouragement: "Great focus! You're making steady daily progress.",
  });
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [recommendations, setRecommendations] = useState<SmartRecommendation[]>([]);

  // Interactive Goal Settings Modal / Inline Card State
  const [showGoalSettings, setShowGoalSettings] = useState(false);
  const [editMinutes, setEditMinutes] = useState(45);
  const [editTopics, setEditTopics] = useState(3);
  const [editReminders, setEditReminders] = useState(true);
  const [editReminderTime, setEditReminderTime] = useState("19:00");
  const [savingGoals, setSavingGoals] = useState(false);

  // Quick AI Assistant query
  const [aiQuickQuery, setAiQuickQuery] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      let userEmail = "";
      if (typeof window !== "undefined") {
        const u = localStorage.getItem("ayursetu_user");
        if (u) {
          try {
            userEmail = JSON.parse(u)?.email || "";
          } catch (e) {}
        }
      }
      const isDemo =
        isDemoEmail(userEmail) ||
        (typeof window !== "undefined" && window.location.search.includes("demo=true"));
      setIsDemoMode(isDemo);

      // Concurrently fetch existing data + personalized academic dashboard
      const [
        targetRes,
        historyRes,
        oppRes,
        appRes,
        feedRes,
        quizRes,
        bamsDashRes,
      ] = await Promise.allSettled([
        api.get("/students/me/target-career"),
        api.get("/assessments/history"),
        api.get("/opportunities/"),
        api.get("/applications/my-applications"),
        api.get("/guidance/sessions/discovery"),
        api.get("/quiz/student/performance"),
        api.get("/bams-learning/dashboard"),
      ]);

      // 1. Process BAMS Academic Dashboard
      if (bamsDashRes.status === "fulfilled" && bamsDashRes.value.data) {
        const d = bamsDashRes.value.data;
        if (d.student_name) setStudentName(d.student_name);
        if (d.academic_year) setAcademicYear(d.academic_year);
        if (typeof d.overall_completion_pct === "number")
          setOverallCompletionPct(d.overall_completion_pct);
        if (typeof d.topics_completed_count === "number")
          setTopicsCompletedCount(d.topics_completed_count);
        if (typeof d.total_topics_count === "number")
          setTotalTopicsCount(d.total_topics_count);
        if (typeof d.bookmarked_count === "number")
          setBookmarkedCount(d.bookmarked_count);
        if (Array.isArray(d.subjects_progress))
          setSubjectsProgress(d.subjects_progress);
        if (Array.isArray(d.today_study_plan))
          setTodayStudyPlan(d.today_study_plan);
        if (Array.isArray(d.upcoming_exams))
          setUpcomingExams(d.upcoming_exams);
        if (Array.isArray(d.pending_revisions))
          setPendingRevisions(d.pending_revisions);
        if (Array.isArray(d.recently_viewed_topics))
          setRecentlyViewed(d.recently_viewed_topics);
        if (Array.isArray(d.saved_notes_recent))
          setSavedNotesRecent(d.saved_notes_recent);
        if (typeof d.saved_notes_count === "number")
          setSavedNotesCount(d.saved_notes_count);
        if (d.quiz_performance) setQuizPerf(d.quiz_performance);
        if (d.goals) {
          setGoals(d.goals);
          setEditMinutes(d.goals.target_minutes_daily || 45);
          setEditTopics(d.goals.target_topics_daily || 3);
          setEditReminders(d.goals.reminders_enabled ?? true);
          setEditReminderTime(d.goals.reminder_time || "19:00");
        }
        if (Array.isArray(d.milestones)) setMilestones(d.milestones);
        if (Array.isArray(d.recommendations))
          setRecommendations(d.recommendations);
      } else {
        // Fallback realistic defaults
        setSubjectsProgress([
          {
            id: "sub-panchakarma",
            code: "BAMS-402",
            name: "Panchakarma",
            sanskritName: "पञ्चकर्म (Detoxification & Bio-cleansing)",
            professionalYear: "4th Prof",
            iconName: "Activity",
            totalTopics: 28,
            completedTopics: 4,
            completionPct: 14.3,
            totalHours: 240,
          },
          {
            id: "sub-kayachikitsa",
            code: "BAMS-401",
            name: "Kaya Chikitsa",
            sanskritName: "कायचिकित्सा (Internal Medicine)",
            professionalYear: "4th Prof",
            iconName: "Stethoscope",
            totalTopics: 32,
            completedTopics: 6,
            completionPct: 18.8,
            totalHours: 260,
          },
          {
            id: "sub-shalya",
            code: "BAMS-403",
            name: "Shalya Tantra",
            sanskritName: "शल्यतन्त्रम् (General Surgery & Ksharasutra)",
            professionalYear: "4th Prof",
            iconName: "Target",
            totalTopics: 28,
            completedTopics: 3,
            completionPct: 10.7,
            totalHours: 220,
          },
          {
            id: "sub-dravyaguna",
            code: "BAMS-201",
            name: "Dravyaguna Vijnana",
            sanskritName: "द्रव्यगुण विज्ञानम् (Materia Medica & Pharmacology)",
            professionalYear: "2nd Prof",
            iconName: "Sprout",
            totalTopics: 35,
            completedTopics: 9,
            completionPct: 25.7,
            totalHours: 250,
          },
          {
            id: "sub-rachana",
            code: "BAMS-101",
            name: "Rachana Sharir",
            sanskritName: "रचना शारीरम् (Human Anatomy & 107 Marma)",
            professionalYear: "1st Prof",
            iconName: "Brain",
            totalTopics: 28,
            completedTopics: 7,
            completionPct: 25.0,
            totalHours: 240,
          },
        ]);
        setTodayStudyPlan([
          {
            id: "tp-1",
            time: "07:00 - 08:00",
            subject: "Samhita & Shloka Recitation",
            topic: "Charaka Sutrasthana Chapter 11 (Treshaniya Adhyaya)",
            type: "RECITATION",
            completed: true,
            link: "/student/ecosystem?tab=syllabus",
          },
          {
            id: "tp-2",
            time: "10:00 - 12:30",
            subject: "Panchakarma Clinical Ward",
            topic: "Snehana & Swedana Vidhi (Purvakarma Protocol)",
            type: "CLINICAL",
            completed: false,
            link: "/student/ecosystem?tab=syllabus",
          },
          {
            id: "tp-3",
            time: "15:00 - 16:30",
            subject: "Dravyaguna Vijnana",
            topic: "Rasa Panchaka of Deepana & Pachana Herbs",
            type: "THEORY",
            completed: false,
            link: "/student/ecosystem?tab=syllabus",
          },
          {
            id: "tp-4",
            time: "19:30 - 20:15",
            subject: "Interactive Active Recall",
            topic: "Adaptive MCQ Diagnostic & 107 Marma Flashcards",
            type: "SELF_ASSESSMENT",
            completed: false,
            link: "/bams/flashcards",
          },
        ]);
        setUpcomingExams([
          {
            id: "exam-1",
            title: "NCISM 4th Professional University Theory Exam",
            date: "2026-12-10",
            days_remaining: 42,
            type: "UNIVERSITY_THEORY",
            venue: "Ayurveda Medical College Hall",
          },
          {
            id: "exam-2",
            title: "Panchakarma Practical Bedside & Oral Viva",
            date: "2026-11-26",
            days_remaining: 28,
            type: "CLINICAL_VIVA",
            venue: "Hospital Inpatient Ward",
          },
          {
            id: "exam-3",
            title: "Dravyaguna Herbarium & Spotting Assessment",
            date: "2026-11-12",
            days_remaining: 14,
            type: "PRACTICAL_SPOTTING",
            venue: "Department Pharmacognosy Lab",
          },
        ]);
        setRecommendations([
          {
            id: "rec-panch-purva",
            type: "LESSON",
            title: "Master Snehana & Swedana Vidhi",
            subject: "Panchakarma",
            topic_id: "top-panch-1",
            reason:
              "Core foundational NCISM Purvakarma competency required before clinical ward postings.",
            priority: "HIGH",
            est_minutes: 20,
            action_url: "/student/ecosystem?tab=syllabus",
          },
          {
            id: "rec-quiz-marma",
            type: "PRACTICE_QUIZ",
            title: "Practice 107 Marma Points Diagnostic Quiz",
            subject: "Rachana Sharir",
            topic_id: "top-rach-1",
            reason:
              "High-yield oral viva and competitive exam topic with high clinical significance.",
            priority: "HIGH",
            est_minutes: 10,
            action_url: "/student/quiz",
          },
          {
            id: "rec-flash-dravya",
            type: "FLASHCARD",
            title: "Active Recall: Rasa Panchaka Pharmacology Deck",
            subject: "Dravyaguna Vijnana",
            topic_id: "top-dravya-1",
            reason:
              "Spaced repetition recommended for botanical drug actions and classical Nighantu memorization.",
            priority: "MEDIUM",
            est_minutes: 15,
            action_url: "/bams/flashcards",
          },
          {
            id: "rec-revis-basti",
            type: "REVISION",
            title: "Review Niruha Basti Compounding Protocol",
            subject: "Panchakarma",
            topic_id: "top-panch-3",
            reason:
              "You bookmarked this complex formulation matrix. A 10-minute revision solidifies memory.",
            priority: "MEDIUM",
            est_minutes: 12,
            action_url: "/student/ecosystem?tab=syllabus",
          },
        ]);
      }

      // 2. Existing Target Career
      if (targetRes.status === "fulfilled" && targetRes.value.data?.target_career) {
        setTargetCareer(targetRes.value.data.target_career);
      } else if (isDemo) {
        setTargetCareer({
          name: DEMO_STUDENT.career.goal,
          short_description: DEMO_STUDENT.career.shortDescription,
          category: "AYURVEDA_PHARMACEUTICAL",
        });
      }

      // 3. Existing Assessments
      if (historyRes.status === "fulfilled") {
        const history = historyRes.value.data || [];
        if (history.length > 0) {
          setAssessmentStatus(history[0]);
        } else if (isDemo) {
          setAssessmentStatus({
            status: "SUBMITTED",
            score: DEMO_STUDENT.assessments[0].score,
            total_questions: 100,
            submitted_at: DEMO_STUDENT.assessments[0].dateCompleted,
          });
        }
      }

      // 4. Opportunities & Applications
      if (oppRes.status === "fulfilled" && oppRes.value.data?.length > 0) {
        setOpportunities(oppRes.value.data);
      } else if (isDemo) {
        setOpportunities(DEMO_STUDENT.opportunities);
      }

      if (appRes.status === "fulfilled" && appRes.value.data?.length > 0) {
        setMyApplications(appRes.value.data);
      } else if (isDemo) {
        setMyApplications(
          DEMO_STUDENT.applications.map((a) => ({
            id: a.id,
            status: a.status,
            applied_at: a.appliedDate,
            opportunity: {
              id: a.id,
              title: a.roleTitle,
              organization_name: a.organization,
              type: a.type,
            },
          }))
        );
      }

      // 5. Feed & Analytics
      if (feedRes.status === "fulfilled" && feedRes.value.data) {
        setDiscoveryFeed(feedRes.value.data);
      } else if (isDemo) {
        setDiscoveryFeed({
          upcoming_sessions: DEMO_STUDENT.expertSessions.filter(
            (s) => s.status === "UPCOMING"
          ),
          featured_experts: DEMO_STUDENT.followedExperts,
        });
      }

      if (
        quizRes.status === "fulfilled" &&
        quizRes.value.data &&
        quizRes.value.data.total_quizzes_taken > 0
      ) {
        setTopicAnalytics(quizRes.value.data);
      }
    } catch (e: any) {
      console.error("Dashboard data load error:", e);
      setError("Failed to load student dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Recommendation Dismiss & Complete Actions
  const handleDismissRec = async (recId: string) => {
    // Optimistic remove
    setRecommendations((prev) => prev.filter((r) => r.id !== recId));
    try {
      await api.post(`/bams-learning/recommendations/${recId}/dismiss`);
    } catch (err) {
      console.error("Dismiss failed:", err);
    }
  };

  const handleCompleteRec = async (recId: string) => {
    setRecommendations((prev) =>
      prev.map((r) => (r.id === recId ? { ...r, is_completed: true } : r))
    );
    try {
      await api.post(`/bams-learning/recommendations/${recId}/complete`);
    } catch (err) {
      console.error("Complete failed:", err);
    }
  };

  const handleResetRecs = async () => {
    try {
      await api.post("/bams-learning/recommendations/reset");
      const res = await api.get("/bams-learning/recommendations");
      if (res.data) setRecommendations(res.data);
    } catch (err) {
      console.error("Reset failed:", err);
    }
  };

  // Toggle study plan item
  const handleToggleStudyPlan = (itemId: string) => {
    setTodayStudyPlan((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      )
    );
  };

  // Save Goal Settings
  const handleSaveGoals = async () => {
    setSavingGoals(true);
    try {
      const res = await api.post("/bams-learning/goals", {
        target_minutes_daily: editMinutes,
        target_topics_daily: editTopics,
        target_quizzes_weekly: goals.target_quizzes_weekly,
        reminders_enabled: editReminders,
        reminder_time: editReminderTime,
      });
      if (res.data) {
        setGoals(res.data);
      }
      setShowGoalSettings(false);
    } catch (err) {
      console.error("Failed to save goals:", err);
    } finally {
      setSavingGoals(false);
    }
  };

  const handleApply = async (oppId: string) => {
    try {
      setApplyingId(oppId);
      await api.post("/applications/apply", { opportunity_id: oppId });
      alert("Application submitted successfully!");
      const appRes = await api.get("/applications/my-applications");
      setMyApplications(appRes.data || []);
    } catch (err: any) {
      alert(err.response?.data?.detail || "Application failed.");
    } finally {
      setApplyingId(null);
    }
  };

  if (loading) {
    return <DashboardLoadingSkeleton />;
  }

  if (error) {
    return <DashboardErrorState error={error} onRetry={loadData} />;
  }

  const sampleOpportunities = [
    {
      id: "demo-1",
      title: "Herbal Formulation & QC Research Intern",
      company_name: "Dabur Research Foundation",
      location: "Ghaziabad / Hybrid",
      stipend_or_salary: "₹18,000 / month",
      opportunity_type: "INTERNSHIP",
      description:
        "Hands-on standardization of botanicals, marker extraction, and Ayush regulatory documentation.",
    },
    {
      id: "demo-2",
      title: "Clinical Trial Data Coordinator (Ayush)",
      company_name: "Patanjali Research Institute",
      location: "Haridwar",
      stipend_or_salary: "₹25,000 / month",
      opportunity_type: "JOB",
      description:
        "Good Clinical Practice compliant clinical study coordination for herbal medicine trials.",
    },
  ];

  const displayOpportunities =
    opportunities.length > 0 ? opportunities : sampleOpportunities;

  // Sessions to showcase
  const liveSessions = discoveryFeed?.live_now || [];
  const recommendedSessions = discoveryFeed?.recommended_sessions?.slice(0, 2) || [];
  const topExperts = discoveryFeed?.top_experts?.slice(0, 3) || [];

  return (
    <DashboardLayout>
      {/* ========================================================= */}
      {/* 1. PERSONALIZED STUDENT HEADER & ACADEMIC YEAR */}
      {/* ========================================================= */}
      <DashboardHeader
        badgeText={`NCISM Curriculum • ${academicYear}`}
        badgeIcon={<Sparkles className="w-3.5 h-3.5" />}
        badgeVariant="emerald"
        title={`Namaste, ${studentName}`}
        subtitle={
          <span>
            Current Academic Year: <strong className="text-emerald-300 font-bold">{academicYear}</strong> •{" "}
            Target Career: <strong className="text-amber-300">{targetCareer ? targetCareer.name : "Ayurvedic Specialist"}</strong>
          </span>
        }
        actions={[
          {
            label: "Learning Analytics",
            href: "/student/analytics",
            icon: TrendingUp,
            variant: "primary",
          },
          {
            label: "Active Recall Flashcards",
            href: "/bams/flashcards",
            icon: Brain,
            variant: "primary",
          },
          {
            label: "BAMS Curriculum Portal",
            href: "/student/ecosystem",
            icon: BookOpen,
            variant: "amber",
          },
          {
            label: "AI Study Assistant",
            href: "/ai",
            icon: Bot,
            variant: "primary",
          },
        ]}
      />

      {/* QUICK AI CONTEXTUAL ASSISTANT BAR */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-900/90 via-teal-900 to-slate-900 border border-emerald-500/40 text-white shadow-md flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/30 text-emerald-300 border border-emerald-400/30">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold flex items-center gap-1.5">
              <span>AyurAI Contextual Learning Tutor</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Online
              </span>
            </h3>
            <p className="text-xs text-emerald-100/80">
              Ask about today&apos;s Shlokas, clarify clinical procedures, or convert topics into exam answers.
            </p>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (aiQuickQuery.trim()) {
              window.location.href = `/ai?tab=chatbot&q=${encodeURIComponent(aiQuickQuery.trim())}`;
            }
          }}
          className="flex items-center gap-2 w-full md:w-auto"
        >
          <input
            type="text"
            value={aiQuickQuery}
            onChange={(e) => setAiQuickQuery(e.target.value)}
            placeholder="e.g. Explain 107 Marma or Snehana Vidhi..."
            className="flex-1 md:w-72 px-3.5 py-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder-emerald-200/60 text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-400"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors shrink-0 flex items-center gap-1"
          >
            <span>Ask AI</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      {/* ========================================================= */}
      {/* 2. CORE ACADEMIC STATS & PROGRESS METRICS */}
      {/* ========================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <DashboardStatsCard
          title="Syllabus Progress"
          value={`${overallCompletionPct}%`}
          subtitle={`${topicsCompletedCount} of ${totalTopicsCount} topics`}
          icon={Layers}
          colorVariant="emerald"
          href="/student/ecosystem?tab=syllabus"
        />

        <DashboardStatsCard
          title="Study Streak"
          value={`${goals.current_streak_days} Days`}
          subtitle={goals.streak_encouragement}
          icon={Flame}
          colorVariant="amber"
          href="/student/ecosystem"
        />

        <DashboardStatsCard
          title="Average Quiz Score"
          value={`${quizPerf.average_score_pct}%`}
          subtitle={`${quizPerf.total_quizzes_taken} tests completed`}
          icon={Award}
          colorVariant="teal"
          href="/student/quiz"
        />

        <DashboardStatsCard
          title="Bookmarked High-Yield"
          value={`${bookmarkedCount} Topics`}
          subtitle="Saved for oral vivas"
          icon={Bookmark}
          colorVariant="purple"
          href="/student/ecosystem?tab=syllabus"
        />

        <DashboardStatsCard
          title="Saved Notes"
          value={`${savedNotesCount} Notes`}
          subtitle="AI simplified summaries"
          icon={FileText}
          colorVariant="blue"
          href="/ai?tab=notes"
        />
      </div>

      {/* LEARNING INSIGHTS & WEAK AREA SPOTLIGHT */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-[#13231B] dark:to-[#172B21] border border-emerald-200 dark:border-emerald-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#2F6B4F] text-white shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <h3 className="text-sm font-bold text-[#142019] dark:text-[#FFFFFF] flex items-center gap-2">
              <span>Comprehensive Learning Analytics & Weak Area Insights</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                New
              </span>
            </h3>
            <p className="text-xs text-[#526158] dark:text-[#A7B9AF]">
              Track syllabus topic accuracy, active study milestones, and flagged revision areas with transparent pedagogical recommendations.
            </p>
          </div>
        </div>
        <Link
          href="/student/analytics"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2F6B4F] hover:bg-[#255740] dark:bg-[#78B895] dark:hover:bg-[#68A785] text-white dark:text-[#0D1511] font-semibold text-xs transition-colors shrink-0 shadow-xs"
        >
          <span>View Detailed Analytics</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* ========================================================= */}
      {/* 3. SMART LEARNING RECOMMENDATIONS (PHASE 2) */}
      {/* ========================================================= */}
      <DashboardSection
        title="Smart Learning Recommendations"
        subtitle="Context-aware suggestions based on your syllabus progress, quiz analytics, and saved notes"
        icon={Sparkles}
        action={{
          label: "Reset & Refresh",
          onClick: handleResetRecs,
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.length === 0 ? (
            <div className="col-span-2 p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-center space-y-2">
              <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto" />
              <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                All Recommended Actions Completed!
              </h4>
              <p className="text-xs text-gray-500">
                You have reviewed or completed all smart learning items. Click &ldquo;Reset &amp; Refresh&rdquo; to load fresh suggestions.
              </p>
            </div>
          ) : (
            recommendations.map((rec) => (
              <div
                key={rec.id}
                className={`p-5 rounded-2xl border transition-all space-y-3 flex flex-col justify-between ${
                  rec.is_completed
                    ? "bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/40 opacity-75"
                    : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-emerald-500/40 shadow-xs"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          rec.priority === "HIGH"
                            ? "bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300"
                            : rec.priority === "MEDIUM"
                            ? "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300"
                            : "bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300"
                        }`}
                      >
                        {rec.priority} Priority
                      </span>
                      <span className="text-[11px] font-semibold text-gray-500">
                        {rec.subject}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDismissRec(rec.id)}
                        title="Dismiss recommendation"
                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    {rec.is_completed && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    )}
                    <span>{rec.title}</span>
                  </h4>

                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 text-xs text-gray-600 dark:text-gray-300">
                    <span className="font-bold text-gray-800 dark:text-gray-200 block mb-0.5">
                      💡 Why this is recommended:
                    </span>
                    <span>{rec.reason}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800 text-xs">
                  <span className="text-gray-400 font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {rec.est_minutes} mins
                  </span>

                  <div className="flex items-center gap-2">
                    {!rec.is_completed && (
                      <button
                        onClick={() => handleCompleteRec(rec.id)}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        Mark Done
                      </button>
                    )}
                    <Link
                      href={rec.action_url}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center gap-1 shadow-xs"
                    >
                      <span>
                        {rec.type === "LESSON"
                          ? "Study Lesson"
                          : rec.type === "PRACTICE_QUIZ"
                          ? "Take Quiz"
                          : rec.type === "FLASHCARD"
                          ? "Open Deck"
                          : "Review"}
                      </span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </DashboardSection>

      {/* ========================================================= */}
      {/* 4. TODAY'S STUDY PLAN & LEARNING MOTIVATION (PHASE 3 & 4) */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* TODAY'S STUDY PLAN CHECKLIST (7 COLS) */}
        <div className="lg:col-span-7 h-full">
          <DashboardCard
            title="Today's Structured NCISM Study Plan"
            subtitle="Follow a balanced daily rhythm of Shloka recitation, ward observation, and theory"
            icon={Calendar}
            className="h-full"
            headerAction={
              <Link
                href="/student/timetable"
                className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-semibold flex items-center gap-1"
              >
                <span>Full Timetable</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            }
          >
            <div className="space-y-3">
              {todayStudyPlan.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleToggleStudyPlan(item.id)}
                  role="button"
                  tabIndex={0}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                    item.completed
                      ? "bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/40"
                      : "bg-[#F7F9F4] dark:bg-[#0F1713] border-[#DCE4DE] dark:border-[#2B3A31] hover:border-emerald-500/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors shrink-0 ${
                        item.completed
                          ? "bg-emerald-600 border-emerald-600 text-white"
                          : "border-gray-300 dark:border-gray-600 hover:border-emerald-500"
                      }`}
                    >
                      {item.completed && <Check className="w-3.5 h-3.5" />}
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] font-bold text-gray-500">
                          {item.time}
                        </span>
                        <span className="text-[10px] px-2 py-0.2 rounded-md bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-semibold border border-gray-200 dark:border-gray-700">
                          {item.subject}
                        </span>
                      </div>
                      <h4
                        className={`text-xs sm:text-sm font-bold mt-0.5 ${
                          item.completed
                            ? "line-through text-gray-400 dark:text-gray-500"
                            : "text-gray-900 dark:text-white"
                        }`}
                      >
                        {item.topic}
                      </h4>
                    </div>
                  </div>

                  <Link
                    href={item.link}
                    onClick={(e) => e.stopPropagation()}
                    className="p-1.5 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 shrink-0"
                    title="Study topic"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ))}
            </div>
          </DashboardCard>
        </div>

        {/* LEARNING MOTIVATION & GOALS WIDGET (5 COLS) */}
        <div className="lg:col-span-5 h-full">
          <DashboardCard
            title="Daily Study Goals & Motivation"
            subtitle="Personalized daily study pace with gentle, non-judgmental reminders"
            icon={Target}
            className="h-full"
            headerAction={
              <button
                onClick={() => setShowGoalSettings(!showGoalSettings)}
                className="text-xs text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 flex items-center gap-1 font-semibold cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>{showGoalSettings ? "Close" : "Customize"}</span>
              </button>
            }
          >
            {showGoalSettings ? (
              <div className="space-y-4 animate-fadeIn">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block">
                    Daily Study Target (Minutes): {editMinutes} mins
                  </label>
                  <input
                    type="range"
                    min="15"
                    max="180"
                    step="15"
                    value={editMinutes}
                    onChange={(e) => setEditMinutes(Number(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block">
                    Daily Topics to Review: {editTopics} topics
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={editTopics}
                    onChange={(e) => setEditTopics(Number(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                </div>

                <div className="pt-2 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-gray-800 dark:text-gray-200 block">
                      Gentle Revision Reminders
                    </span>
                    <span className="text-[10px] text-gray-400">
                      No penalties or pressure; customize time anytime
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={editReminders}
                    onChange={(e) => setEditReminders(e.target.checked)}
                    className="w-4 h-4 accent-emerald-600 cursor-pointer"
                  />
                </div>

                {editReminders && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400 font-semibold">
                      Preferred Reminder Time:
                    </span>
                    <input
                      type="time"
                      value={editReminderTime}
                      onChange={(e) => setEditReminderTime(e.target.value)}
                      className="px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-xs"
                    />
                  </div>
                )}

                <button
                  onClick={handleSaveGoals}
                  disabled={savingGoals}
                  className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-xs"
                >
                  {savingGoals ? "Saving Preferences..." : "Save Goal Preferences"}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* PROGRESS BARS */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-gray-700 dark:text-gray-300">
                      Daily Study Time
                    </span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {goals.completed_minutes_today} / {goals.target_minutes_daily} mins
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(
                          100,
                          (goals.completed_minutes_today /
                            Math.max(1, goals.target_minutes_daily)) *
                            100
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-gray-700 dark:text-gray-300">
                      Topics Reviewed Today
                    </span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {goals.completed_topics_today} / {goals.target_topics_daily} topics
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    <div
                      className="h-full bg-teal-500 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(
                          100,
                          (goals.completed_topics_today /
                            Math.max(1, goals.target_topics_daily)) *
                            100
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                {/* STREAK & ENCOURAGEMENT */}
                <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-amber-500 text-white shrink-0">
                    <Flame className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200">
                      {goals.current_streak_days}-Day Consistency Streak
                    </h4>
                    <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80 leading-snug">
                      {goals.streak_encouragement}
                    </p>
                  </div>
                </div>

                {/* MILESTONES MINI BADGES */}
                <div className="pt-2 border-t border-gray-100 dark:border-gray-800 space-y-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    Academic Achievement Milestones
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {(milestones.length > 0
                      ? milestones
                      : [
                          {
                            id: "m1",
                            title: "Syllabus Explorer",
                            description: "Explored all curriculum modules",
                            achieved: true,
                          },
                          {
                            id: "m2",
                            title: "Clinical Observer",
                            description: "Logged first practical posting",
                            achieved: true,
                          },
                          {
                            id: "m3",
                            title: "Active Recall",
                            description: "Reviewed 5+ flashcards",
                            achieved: true,
                          },
                          {
                            id: "m4",
                            title: "Quiz Master",
                            description: "80%+ on adaptive quiz",
                            achieved: true,
                          },
                        ]
                    ).map((m) => (
                      <div
                        key={m.id}
                        className={`p-2 rounded-xl border flex items-center gap-2 ${
                          m.achieved
                            ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/50 text-emerald-900 dark:text-emerald-200"
                            : "bg-gray-50 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700 text-gray-400"
                        }`}
                      >
                        <Award
                          className={`w-3.5 h-3.5 shrink-0 ${
                            m.achieved ? "text-emerald-500" : "text-gray-400"
                          }`}
                        />
                        <span className="font-semibold text-[11px] truncate">
                          {m.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </DashboardCard>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 5. SUBJECTS & SYLLABUS PROGRESS GRID */}
      {/* ========================================================= */}
      <DashboardSection
        title="Subjects & Syllabus Progress"
        subtitle="Track competency mastery across all NCISM curriculum subjects"
        icon={BookOpen}
        action={{
          label: "Curriculum Navigator",
          href: "/student/ecosystem?tab=syllabus",
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {subjectsProgress.map((sub) => (
            <div
              key={sub.id}
              className="p-5 rounded-3xl bg-white dark:bg-[#17221C] border border-[#DCE4DE] dark:border-[#2B3A31] shadow-xs hover:border-emerald-500/40 transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-[#2F6B4F] dark:text-[#6FAF8A]">
                    {sub.iconName === "Sprout" ? (
                      <Sprout className="w-5 h-5" />
                    ) : sub.iconName === "Activity" ? (
                      <Activity className="w-5 h-5" />
                    ) : sub.iconName === "Flame" ? (
                      <Flame className="w-5 h-5" />
                    ) : sub.iconName === "Brain" ? (
                      <Brain className="w-5 h-5" />
                    ) : sub.iconName === "Target" ? (
                      <Target className="w-5 h-5" />
                    ) : (
                      <BookOpen className="w-5 h-5" />
                    )}
                  </div>

                  <span className="text-[11px] font-bold text-gray-500 px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800">
                    {sub.professionalYear}
                  </span>
                </div>

                <div>
                  <h4 className="text-base font-bold text-gray-900 dark:text-white">
                    {sub.name}
                  </h4>
                  <p className="text-xs font-serif text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
                    {sub.sanskritName}
                  </p>
                </div>

                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Mastery</span>
                    <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">
                      {sub.completionPct}% ({sub.completedTopics}/{sub.totalTopics})
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${sub.completionPct}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                <Link
                  href="/student/ecosystem?tab=syllabus"
                  className="flex-1 py-2 text-center rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-xs font-semibold text-gray-800 dark:text-gray-200 transition-colors"
                >
                  Syllabus
                </Link>
                <Link
                  href="/student/quiz"
                  className="flex-1 py-2 text-center rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold text-white transition-colors"
                >
                  Topic Quiz
                </Link>
              </div>
            </div>
          ))}
        </div>
      </DashboardSection>

      {/* ========================================================= */}
      {/* 6. UPCOMING UNIVERSITY EXAMS & PENDING REVISIONS */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {/* UPCOMING EXAMS */}
        <DashboardCard
          title="Upcoming University & Clinical Exams"
          subtitle="NCISM theoretical and practical milestone countdowns"
          icon={Clock}
          className="h-full"
        >
          <div className="space-y-3">
            {upcomingExams.map((exam) => (
              <div
                key={exam.id}
                className="p-4 rounded-2xl bg-[#F7F9F4] dark:bg-[#0F1713] border border-[#DCE4DE] dark:border-[#2B3A31] flex items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    {exam.type.replace("_", " ")}
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
                    {exam.title}
                  </h4>
                  <p className="text-[11px] text-gray-500 font-medium">
                    📅 {exam.date} • {exam.venue}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xl font-black text-rose-600 dark:text-rose-400 block font-mono">
                    {exam.days_remaining}
                  </span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">
                    Days Left
                  </span>
                </div>
              </div>
            ))}
          </div>
        </DashboardCard>

        {/* PENDING REVISIONS (BOOKMARKED TOPICS) */}
        <DashboardCard
          title="Pending High-Yield Revision Tasks"
          subtitle="Topics bookmarked or flagged as crucial for clinical vivas"
          icon={Bookmark}
          className="h-full"
          headerAction={
            <Link
              href="/student/ecosystem?tab=syllabus"
              className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-semibold flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          }
        >
          <div className="space-y-2.5">
            {pendingRevisions.length === 0 ? (
              <div className="p-6 text-center text-xs text-gray-400">
                No bookmarked revision tasks. Bookmark key topics in the syllabus to revise them here.
              </div>
            ) : (
              pendingRevisions.map((rev) => (
                <div
                  key={rev.topic_id}
                  className="p-3 rounded-xl bg-[#F7F9F4] dark:bg-[#0F1713] border border-[#DCE4DE] dark:border-[#2B3A31] flex items-center justify-between gap-3"
                >
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase">
                      {rev.subject_name}
                    </span>
                    <h5 className="text-xs font-bold text-gray-900 dark:text-white line-clamp-1">
                      {rev.title}
                    </h5>
                  </div>

                  <Link
                    href="/student/ecosystem?tab=syllabus"
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shrink-0"
                  >
                    Revise
                  </Link>
                </div>
              ))
            )}
          </div>
        </DashboardCard>
      </div>

      {/* ========================================================= */}
      {/* 7. SAVED NOTES & QUICK AI TRANSFORMATION */}
      {/* ========================================================= */}
      <DashboardSection
        title="Saved Notes & AI Notes Assistant"
        subtitle="Review, simplify, or convert your clinical notes into active-recall flashcards"
        icon={FileText}
        action={{
          label: "Open Notes Assistant",
          href: "/ai?tab=notes",
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {savedNotesRecent.length === 0 ? (
            <div className="col-span-3 p-8 text-center bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 space-y-3">
              <FileText className="w-10 h-10 text-gray-400 mx-auto" />
              <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                No Saved Notes Yet
              </h4>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Create lecture notes and let the AI Notes Assistant simplify them into bullet points, comparison tables, and flashcards.
              </p>
              <Link
                href="/ai?tab=notes"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors"
              >
                <span>Create First Note</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            savedNotesRecent.map((note) => (
              <div
                key={note.id}
                className="p-5 rounded-3xl bg-white dark:bg-[#17221C] border border-[#DCE4DE] dark:border-[#2B3A31] shadow-xs space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                    {note.subject || "General BAMS"}
                  </span>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">
                    {note.title}
                  </h4>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {(note.tags || ["Lecture"]).slice(0, 3).map((t: string, i: number) => (
                      <span
                        key={i}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-medium"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs">
                  <span className="text-gray-400 text-[10px]">
                    {new Date(note.updated_at).toLocaleDateString()}
                  </span>
                  <Link
                    href="/ai?tab=notes"
                    className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                  >
                    <span>Simplify with AI</span>
                    <Sparkles className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </DashboardSection>

      {/* ========================================================= */}
      {/* 8. PRESERVED CONNECTED BAMS ECOSYSTEM & CAREER SECTIONS */}
      {/* ========================================================= */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#0a2315] via-[#0e311e] to-[#081b10] border border-emerald-500/30 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Connected BAMS Learning Ecosystem Active
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-white font-serif-heading">
              Syllabus → Diagnostic Assessment → Skill Gap → Remediation → Exam Readiness
            </h3>
            <p className="text-xs text-emerald-100/80 leading-relaxed">
              Official NCISM curriculum integrated with automated weak topic remediation, classical Sanskrit voice readers, educational clinical case studies, and conflict-free smart timetable scheduling.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <Link
              href="/bams/flashcards"
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all"
            >
              <Brain className="w-4 h-4" /> Active Recall Flashcards
            </Link>
            <Link
              href="/student/ecosystem"
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all"
            >
              Open Ecosystem Hub <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* 4-Stage Micro-Tracker */}
        <div className="pt-2 border-t border-emerald-900/40 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="p-2.5 rounded-xl bg-black/40 border border-emerald-500/20 text-slate-300 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
            <span className="text-[11px] truncate">1. NCISM Syllabus Synced</span>
          </div>
          <div className="p-2.5 rounded-xl bg-black/40 border border-amber-500/30 text-amber-300 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
            <span className="text-[11px] truncate">2. Weak Area Remediation</span>
          </div>
          <div className="p-2.5 rounded-xl bg-black/40 border border-emerald-500/20 text-slate-300 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
            <span className="text-[11px] truncate">3. Clinical Case Studies</span>
          </div>
          <div className="p-2.5 rounded-xl bg-black/40 border border-teal-500/30 text-teal-300 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-400 shrink-0" />
            <span className="text-[11px] truncate">4. Exam Readiness: 82.5%</span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 9. EXPERT GUIDANCE & MASTERCLASSES (PRESERVED) */}
      {/* ========================================================= */}
      <DashboardSection
        title="Expert Guidance & Masterclasses"
        subtitle="Interactive live clinical demonstrations & personalized high-yield lectures"
        icon={Video}
        action={{
          label: "Browse All Sessions",
          href: "/student/sessions",
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {liveSessions.length > 0 ? (
            <div className="p-6 rounded-3xl bg-gradient-to-br from-rose-950/80 to-rose-900/60 border border-rose-600/40 text-white shadow-lg space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-600 text-white text-[11px] font-black uppercase tracking-wider animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-white" />
                  <span>Broadcasting Live Now</span>
                </div>
                <h4 className="text-base font-bold font-serif-heading line-clamp-2">
                  {liveSessions[0].title}
                </h4>
                <p className="text-xs text-rose-200">
                  By {liveSessions[0].expert_name} ({liveSessions[0].institution})
                </p>
                <div className="flex items-center gap-2 text-xs text-rose-200/80 pt-1">
                  <Users className="w-3.5 h-3.5" />
                  <span>{liveSessions[0].current_live_attendees || 42} Students in room</span>
                </div>
              </div>

              <Link
                href={`/student/sessions/${liveSessions[0].id}/live`}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-rose-900 font-bold text-xs shadow-md hover:bg-rose-50 transition-all"
              >
                <Radio className="w-4 h-4 text-rose-600" />
                <span>Join Live Classroom</span>
              </Link>
            </div>
          ) : null}

          {recommendedSessions.map((sess: any) => (
            <DashboardCard
              key={sess.id}
              hoverEffect
              footer={
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{sess.average_rating.toFixed(1)}</span>
                  </div>
                  {sess.status === "SCHEDULED" ? (
                    <Link
                      href="/student/sessions"
                      className="px-3.5 py-1.5 rounded-xl bg-[#2F6B4F] text-white text-xs font-bold hover:bg-[#24563F]"
                    >
                      View & Register
                    </Link>
                  ) : (
                    <Link
                      href={`/student/sessions/${sess.id}`}
                      className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-[#DCE8DF] dark:bg-[#26372D] text-[#2F6B4F] dark:text-[#6FAF8A] text-xs font-bold hover:bg-[#2F6B4F] hover:text-white transition-colors"
                    >
                      <PlayCircle className="w-3.5 h-3.5" />
                      <span>Watch Recording</span>
                    </Link>
                  )}
                </div>
              }
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#2F6B4F] dark:text-[#6FAF8A] uppercase tracking-wider">
                    {sess.category}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300">
                    {sess.level}
                  </span>
                </div>
                <h4 className="text-sm font-bold font-serif-heading text-[#1B2A22] dark:text-[#E8F1EB] line-clamp-2">
                  {sess.title}
                </h4>
                <p className="text-xs text-[#64736A] dark:text-[#A9B9AE] font-medium">
                  {sess.expert_name} • {sess.institution}
                </p>
              </div>
            </DashboardCard>
          ))}
        </div>
      </DashboardSection>

      {/* ========================================================= */}
      {/* 10. TARGET CAREER & INDUSTRY OPPORTUNITIES (PRESERVED) */}
      {/* ========================================================= */}
      <DashboardSection
        title="Featured Opportunities & Clinical Postings"
        subtitle="Explore internships, research roles, and hospital postings aligned with your profile"
        icon={Briefcase}
        action={{
          label: "View All Opportunities",
          href: "/student/opportunities",
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {displayOpportunities.slice(0, 2).map((opp) => (
            <DashboardCard
              key={opp.id}
              hoverEffect
              footer={
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-mono font-bold text-[#2F6B4F] dark:text-[#6FAF8A]">
                    {opp.stipend_or_salary || "Stipend Available"}
                  </span>
                  <button
                    onClick={() => handleApply(opp.id)}
                    disabled={applyingId === opp.id}
                    className="px-4 py-2 rounded-xl bg-[#2F6B4F] hover:bg-[#24563F] dark:bg-[#6FAF8A] dark:hover:bg-[#8BC4A2] text-white dark:text-[#0F1713] text-xs font-semibold shadow-xs disabled:opacity-50 transition-all cursor-pointer"
                  >
                    {applyingId === opp.id ? "Submitting..." : "Apply Now"}
                  </button>
                </div>
              }
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#DCE8DF] dark:bg-[#26372D] text-[#2F6B4F] dark:text-[#6FAF8A] border border-[#DCE4DE] dark:border-[#2B3A31]">
                    {opp.opportunity_type}
                  </span>
                  <span className="text-xs text-[#64736A] dark:text-[#A9B9AE] font-medium">
                    {opp.location}
                  </span>
                </div>
                <h4 className="text-base font-bold font-serif-heading text-[#1B2A22] dark:text-[#E8F1EB]">
                  {opp.title}
                </h4>
                <p className="text-xs text-[#64736A] dark:text-[#A9B9AE] font-semibold">
                  {opp.company_name}
                </p>
                <p className="text-xs text-[#64736A] dark:text-[#A9B9AE] line-clamp-2 leading-relaxed">
                  {opp.description}
                </p>
              </div>
            </DashboardCard>
          ))}
        </div>
      </DashboardSection>
    </DashboardLayout>
  );
}
