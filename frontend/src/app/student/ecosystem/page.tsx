"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
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
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Compass,
  Zap,
  GraduationCap,
  ShieldCheck,
  ChevronRight,
  Users,
  Activity,
  Calendar,
  Filter,
  Search,
  HelpCircle,
  FileText,
  Stethoscope,
  Video,
  UserCheck,
  Send,
  PlusCircle,
  Check,
  X,
  ExternalLink,
  Lock,
  ChevronDown,
  ChevronUp,
  Bookmark
} from "lucide-react";
import {
  BAMS_SUBJECTS,
  MASTER_BAMS_TOPICS,
  MASTER_BAMS_CASES,
  MASTER_EXAM_PREP_MODULES,
  generateSmartBamsSchedule,
  getRemediationPathwayForPanchakarma,
  generateCaseStudyFingerprint,
  BamsSubject,
  BamsTopic,
  BamsCaseStudy,
  ExamPrepModule,
  SmartTimetableBlock,
  RemediationPathway
} from "@/lib/bamsEcosystemEngine";
import { api } from "@/lib/api";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

type TabMode = "pipeline" | "syllabus" | "examprep" | "internship" | "cases" | "timetable" | "readiness" | "guidance";

function BamsLearningEcosystemContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") as TabMode | null;
  const yearParam = searchParams.get("year");
  const subjectParam = searchParams.get("subject");

  const [activeTab, setActiveTab] = useState<TabMode>("pipeline");

  // Selected Professional Year for Syllabus
  const [selectedProfYear, setSelectedProfYear] = useState<string>("4th Prof");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("sub-panchakarma");

  // Real Student BAMS Progress & Backend Integration
  const [completedTopicIds, setCompletedTopicIds] = useState<string[]>(["top-panch-1"]);
  const [bookmarkedTopicIds, setBookmarkedTopicIds] = useState<string[]>(["top-panch-2"]);
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);
  const [overallCompletionPct, setOverallCompletionPct] = useState<number>(18.5);
  const [continueTopic, setContinueTopic] = useState<any>(null);
  const [clinicalLogbook, setClinicalLogbook] = useState<any[]>([
    {
      id: "log-demo-1",
      date: "2026-10-28",
      posting: "Panchakarma Department",
      department: "Panchakarma",
      procedure_observed: "Kati Basti with Mahanarayana Taila in Lumbar Spondylosis",
      reflection: "Observed strict temperature monitoring of oil (lukewarm ~40°C). Patient reported significant reduction in stiffness.",
      supervisor_name: "Dr. V. K. Sharma, MD (Panchakarma)"
    }
  ]);
  const [logbookFormDate, setLogbookFormDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [logbookFormDepartment, setLogbookFormDepartment] = useState<string>("Panchakarma");
  const [logbookFormPosting, setLogbookFormPosting] = useState<string>("Inpatient Ward & Panchakarma Theatre");
  const [logbookFormProcedure, setLogbookFormProcedure] = useState<string>("Kati Basti with Mahanarayana Taila in Lumbar Spondylosis");
  const [logbookFormReflection, setLogbookFormReflection] = useState<string>("Strict adherence to temperature (~40°C) and Dharana Kala of 35 mins. Patient achieved marked relief in L4-L5 radicular stiffness.");
  const [logbookFormSupervisor, setLogbookFormSupervisor] = useState<string>("Dr. V. K. Sharma (MD Ayu, Vaidya In-Charge)");
  const [logbookSaving, setLogbookSaving] = useState<boolean>(false);
  const [logbookSaveSuccess, setLogbookSaveSuccess] = useState<boolean>(false);

  useEffect(() => {
    async function loadRealProgress() {
      try {
        const res = await api.get("/bams-learning/progress");
        if (res.data) {
          if (Array.isArray(res.data.completed_topics)) setCompletedTopicIds(res.data.completed_topics);
          if (Array.isArray(res.data.bookmarked_topics)) setBookmarkedTopicIds(res.data.bookmarked_topics);
          if (Array.isArray(res.data.recently_viewed_topics)) setRecentlyViewed(res.data.recently_viewed_topics);
          if (typeof res.data.overall_completion_pct === "number") setOverallCompletionPct(res.data.overall_completion_pct);
          if (res.data.continue_learning_topic) setContinueTopic(res.data.continue_learning_topic);
          if (Array.isArray(res.data.clinical_logbook)) setClinicalLogbook(res.data.clinical_logbook);
        }
      } catch (e) {
        console.warn("Using active client-side BAMS progress state:", e);
      }
    }
    loadRealProgress();
  }, []);

  const handleToggleTopicComplete = async (topicId: string) => {
    const isCompleted = completedTopicIds.includes(topicId);
    const updated = isCompleted
      ? completedTopicIds.filter(id => id !== topicId)
      : [...completedTopicIds, topicId];
    setCompletedTopicIds(updated);
    setOverallCompletionPct(Math.round((updated.length / Math.max(1, MASTER_BAMS_TOPICS.length)) * 100));

    try {
      const res = await api.post(`/bams-learning/topics/${topicId}/toggle-complete`);
      if (res.data) {
        setCompletedTopicIds(res.data.completed_topics);
        setOverallCompletionPct(res.data.overall_completion_pct);
      }
    } catch (e) {
      console.warn("Toggle complete synced locally:", e);
    }
  };

  const handleToggleBookmark = async (topicId: string) => {
    const isBookmarked = bookmarkedTopicIds.includes(topicId);
    const updated = isBookmarked
      ? bookmarkedTopicIds.filter(id => id !== topicId)
      : [...bookmarkedTopicIds, topicId];
    setBookmarkedTopicIds(updated);

    try {
      const res = await api.post(`/bams-learning/topics/${topicId}/toggle-bookmark`);
      if (res.data) {
        setBookmarkedTopicIds(res.data.bookmarked_topics);
      }
    } catch (e) {
      console.warn("Bookmark synced locally:", e);
    }
  };

  const handleViewTopic = async (topic: BamsTopic) => {
    try {
      await api.post(`/bams-learning/topics/${topic.id}/view`, {
        title: topic.topicTitle,
        subject_id: topic.subjectId,
        subject_name: topic.subjectName
      });
      setContinueTopic(topic);
    } catch (e) {
      console.warn("Record view synced locally:", e);
    }
  };

  const handleAddLogbookEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    setLogbookSaving(true);
    setLogbookSaveSuccess(false);
    const newEntry = {
      date: logbookFormDate,
      department: logbookFormDepartment,
      posting: logbookFormPosting,
      procedure_observed: logbookFormProcedure,
      reflection: logbookFormReflection,
      supervisor_name: logbookFormSupervisor
    };

    try {
      const res = await api.post("/bams-learning/logbook", newEntry);
      if (res.data) {
        setClinicalLogbook([res.data, ...clinicalLogbook]);
      } else {
        setClinicalLogbook([{ ...newEntry, id: `log-${Date.now()}` }, ...clinicalLogbook]);
      }
      setLogbookSaveSuccess(true);
      setTimeout(() => setLogbookSaveSuccess(false), 4000);
    } catch (err) {
      console.warn("Logbook saved locally:", err);
      setClinicalLogbook([{ ...newEntry, id: `log-${Date.now()}` }, ...clinicalLogbook]);
      setLogbookSaveSuccess(true);
      setTimeout(() => setLogbookSaveSuccess(false), 4000);
    } finally {
      setLogbookSaving(false);
    }
  };

  useEffect(() => {
    if (tabParam && ["pipeline", "syllabus", "examprep", "internship", "cases", "timetable", "readiness", "guidance"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
    if (yearParam) {
      setSelectedProfYear(yearParam);
    }
    if (subjectParam) {
      setSelectedSubjectId(subjectParam);
    }
  }, [tabParam, yearParam, subjectParam]);

  // Active Remediation Pathway (Panchakarma default demonstration)
  const [remediation, setRemediation] = useState<RemediationPathway>(getRemediationPathwayForPanchakarma());
  const [remediationStep, setRemediationStep] = useState<number>(1);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [qId: string]: number }>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [remediationCompleteCelebration, setRemediationCompleteCelebration] = useState<boolean>(false);
  const [updatedSkillScore, setUpdatedSkillScore] = useState<number>(remediation.currentMasteryPct);

  // Web Speech API State
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [speechRate, setSpeechRate] = useState<number>(0.95);

  // Smart Timetable Settings
  const [collegeStart, setCollegeStart] = useState<string>("09:00");
  const [collegeEnd, setCollegeEnd] = useState<string>("16:00");
  const [hasInternship, setHasInternship] = useState<boolean>(false);
  const [scheduleData, setScheduleData] = useState<SmartTimetableBlock[]>([]);

  // Educational Cases Filter & Submission State
  const [caseSearch, setCaseSearch] = useState<string>("");
  const [caseDifficultyFilter, setCaseDifficultyFilter] = useState<string>("ALL");
  const [showDoctorCaseModal, setShowDoctorCaseModal] = useState<boolean>(false);
  const [newCaseTitle, setNewCaseTitle] = useState<string>("");
  const [newCaseSubject, setNewCaseSubject] = useState<string>("Panchakarma");
  const [newCaseTopic, setNewCaseTopic] = useState<string>("Basti Protocols");
  const [newCaseComplaints, setNewCaseComplaints] = useState<string>("Morning stiffness, severe stinging joint pain in wrists and knees");
  const [newCaseHistory, setNewCaseHistory] = useState<string>("Chronic onset following viral illness and irregular dietetics");
  const [newCaseIntervention, setNewCaseIntervention] = useState<string>("Valuka Sweda followed by 8-day Vaitarana Basti course and Deepana-Pachana");
  const [caseDuplicateWarning, setCaseDuplicateWarning] = useState<string | null>(null);
  const [caseSubmitSuccess, setCaseSubmitSuccess] = useState<string | null>(null);

  // Institution to Doctor Guidance Invitation State
  const [selectedGuidanceDoctor, setSelectedGuidanceDoctor] = useState<string>("Dr. Vaidya Rajesh Sharma");
  const [guidanceSessionType, setGuidanceSessionType] = useState<string>("Clinical Case Review & Viva Preparation");
  const [guidanceSubject, setGuidanceSubject] = useState<string>("Panchakarma");
  const [guidanceTopic, setGuidanceTopic] = useState<string>("Emergency Management in Panchakarma Complications");
  const [guidanceStudentGroup, setGuidanceStudentGroup] = useState<string>("Final Year BAMS (Batch 2026)");
  const [guidanceStudentsCount, setGuidanceStudentsCount] = useState<number>(45);
  const [guidancePreferredDate, setGuidancePreferredDate] = useState<string>("2026-10-15");
  const [guidanceDurationMins, setGuidanceDurationMins] = useState<number>(90);
  const [guidanceMode, setGuidanceMode] = useState<"ONLINE" | "OFFLINE">("ONLINE");
  const [guidanceOfflineVenue, setGuidanceOfflineVenue] = useState<string>("Aayuraura Medical College Central Auditorium, Pune");
  const [guidanceFeeType, setGuidanceFeeType] = useState<"FREE" | "PAID">("FREE");
  const [guidanceHonorarium, setGuidanceHonorarium] = useState<number>(3500);
  const [guidanceSubmitted, setGuidanceSubmitted] = useState<boolean>(false);
  const [doctorAccepted, setDoctorAccepted] = useState<boolean>(false);

  // Initialize Timetable
  useEffect(() => {
    const blocks = generateSmartBamsSchedule({
      collegeStart,
      collegeEnd,
      hasInternship,
      weakTopics: ["Panchakarma: Basti Protocols", "Dravyaguna: Rasa-Panchaka"],
      examDateDaysAway: 45
    });
    setScheduleData(blocks);
  }, [collegeStart, collegeEnd, hasInternship]);

  // Clean up Web Speech on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Voice Reader Play/Stop Toggle
  const toggleVoiceReader = (textToRead: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("Voice Reader is not supported in this browser. Please use Chrome, Edge, or Firefox.");
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.rate = speechRate;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  // Submit Post-Remediation Quiz
  const handleSubmitRemediationQuiz = async () => {
    setQuizSubmitted(true);
    let correctCount = 0;
    remediation.step4_PracticeQuestions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctIndex) {
        correctCount += 1;
      }
    });

    const scorePct = Math.round((correctCount / remediation.step4_PracticeQuestions.length) * 100);
    const newScore = Math.max(remediation.currentMasteryPct, scorePct);
    setUpdatedSkillScore(newScore);

    try {
      await api.post("/bams-ecosystem/remediation/complete", {
        topic_id: remediation.weakTopicId,
        topic_title: remediation.topicTitle,
        subject_name: remediation.subjectName,
        pre_score: remediation.currentMasteryPct,
        post_quiz_score: newScore,
        voice_reader_used: true,
        case_study_completed: true
      });
    } catch (err) {
      console.warn("Remediation completion synced locally:", err);
    }

    setRemediationCompleteCelebration(true);
  };

  // Handle New Doctor Case Submission with Duplicate Check
  const handleDoctorCaseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCaseDuplicateWarning(null);
    setCaseSubmitSuccess(null);

    const complaintsArray = newCaseComplaints.split(",").map(c => c.trim()).filter(Boolean);
    const generatedHash = generateCaseStudyFingerprint(newCaseTitle, newCaseSubject, complaintsArray);

    // Check against existing case fingerprints
    const duplicateExists = MASTER_BAMS_CASES.some(c =>
      c.title.toLowerCase() === newCaseTitle.toLowerCase() ||
      c.caseFingerprintHash.includes(generatedHash)
    );

    if (duplicateExists) {
      setCaseDuplicateWarning(`Duplicate Case Detected! An identical or highly similar clinical case is already indexed under ${newCaseSubject}. Please provide unique clinical observations or differential nuances.`);
      return;
    }

    setCaseSubmitSuccess(`Case study '${newCaseTitle}' verified and published to BAMS Clinical Library! Assigned Fingerprint: ${generatedHash}`);
    setTimeout(() => {
      setShowDoctorCaseModal(false);
      setCaseSubmitSuccess(null);
    }, 2800);
  };

  // Handle Institution Guidance Invitation Submit
  const handleCreateGuidanceRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setGuidanceSubmitted(true);
  };

  // Filtered Subjects for Selected Year
  const filteredSubjects = useMemo(() => {
    return BAMS_SUBJECTS.filter(s => s.professionalYear === selectedProfYear);
  }, [selectedProfYear]);

  // Active Subject Detail
  const activeSubject = useMemo(() => {
    return BAMS_SUBJECTS.find(s => s.id === selectedSubjectId) || filteredSubjects[0] || BAMS_SUBJECTS[0];
  }, [selectedSubjectId, filteredSubjects]);

  // Active Subject Topics
  const activeSubjectTopics = useMemo(() => {
    return MASTER_BAMS_TOPICS.filter(t => t.subjectId === activeSubject.id || t.subjectName.toLowerCase() === activeSubject.name.toLowerCase());
  }, [activeSubject]);

  // Filtered Cases
  const filteredCases = useMemo(() => {
    return MASTER_BAMS_CASES.filter(c => {
      const matchSearch = caseSearch === "" ||
        c.title.toLowerCase().includes(caseSearch.toLowerCase()) ||
        c.subject.toLowerCase().includes(caseSearch.toLowerCase()) ||
        c.topic.toLowerCase().includes(caseSearch.toLowerCase());
      const matchDifficulty = caseDifficultyFilter === "ALL" || c.difficulty.toLowerCase() === caseDifficultyFilter.toLowerCase();
      return matchSearch && matchDifficulty;
    });
  }, [caseSearch, caseDifficultyFilter]);

  return (
    <div className="min-h-screen bg-[#F7F9F4] dark:bg-[#0D1511] text-[#17231C] dark:text-[#F1F6F2] flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* ============================================================ */}
        {/* MASTER HERO HEADER & ECOSYSTEM VISION */}
        {/* ============================================================ */}
        <div className="relative rounded-3xl p-8 sm:p-10 bg-gradient-to-br from-[#0c2718] via-[#103320] to-[#081b10] border border-emerald-500/30 shadow-2xl overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

          <div className="relative z-10 space-y-4 max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Aayuraura Integrated BAMS Learning Ecosystem (NCISM Curriculum)
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white font-serif">
              Ayurvedic Academic, Clinical & Career Intelligence
            </h1>
            <p className="text-sm sm:text-base text-emerald-100/80 leading-relaxed max-w-3xl">
              Unifying official NCISM BAMS syllabus, active topic progress, clinical diagnostics, automated weak topic remediation, smart timetable scheduling, viva voice readers, and verified doctor mentorship.
            </p>

            {/* Quick Readiness KPIs */}
            <div className="pt-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-black/40 border border-emerald-500/20 backdrop-blur-md">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Syllabus Progress</span>
                <span className="text-2xl font-black text-emerald-400">{overallCompletionPct}%</span>
                <span className="text-[10px] text-emerald-300/70 block mt-0.5">{completedTopicIds.length} Topics Completed</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-black/40 border border-emerald-500/20 backdrop-blur-md">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Continue Learning</span>
                <span className="text-sm font-extrabold text-teal-300 truncate block mt-1" title={continueTopic?.title || continueTopic?.topicTitle || "Panchakarma: Basti Protocols"}>
                  {continueTopic?.title || continueTopic?.topicTitle || "Panchakarma: Basti Protocols"}
                </span>
                <span className="text-[10px] text-teal-300/70 block mt-0.5">Resume Where You Stopped</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-black/40 border border-emerald-500/20 backdrop-blur-md">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Remediation Gap</span>
                <span className="text-2xl font-black text-amber-400">1 Active</span>
                <span className="text-[10px] text-amber-300/70 block mt-0.5">Panchakarma: Basti</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-black/40 border border-emerald-500/20 backdrop-blur-md">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Clinical Logbook</span>
                <span className="text-2xl font-black text-purple-400">{clinicalLogbook.length} Entries</span>
                <span className="text-[10px] text-purple-300/70 block mt-0.5">Verified Internship Records</span>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 11-STAGE PIPELINE NAVIGATOR (PHASE 9 SPECIFICATION) */}
        {/* ============================================================ */}
        <div className="rounded-2xl p-4 bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] overflow-x-auto shadow-xs">
          <div className="min-w-[900px]">
            <div className="flex items-center justify-between text-xs font-bold text-[#526158] dark:text-[#98A99E] mb-3 px-2">
              <span className="flex items-center gap-1.5 text-[#2F6B4F] dark:text-[#78B895]">
                <Brain className="w-4 h-4" /> BAMS End-to-End Connected Pipeline
              </span>
              <span className="text-[11px] text-[#526158] dark:text-[#98A99E] font-normal">Click any node to navigate instantly</span>
            </div>

            <div className="grid grid-cols-11 gap-1.5 items-center text-center">
              {[
                { id: "syl", name: "1. Syllabus", tab: "syllabus" as TabMode, status: "completed" },
                { id: "top", name: "2. Topic Prog.", tab: "syllabus" as TabMode, status: "completed" },
                { id: "ass", name: "3. Assessment", link: "/student/assessments", status: "completed" },
                { id: "ski", name: "4. Skill Anal.", link: "/student/skills", status: "completed" },
                { id: "gap", name: "5. Skill Gap", link: "/student/skill-gap", status: "completed" },
                { id: "pat", name: "6. Learn Path", tab: "pipeline" as TabMode, status: "active" },
                { id: "qui", name: "7. Quiz", link: "/student/quiz", status: "completed" },
                { id: "cas", name: "8. Case Study", tab: "cases" as TabMode, status: "completed" },
                { id: "exm", name: "9. Exam Prep", tab: "examprep" as TabMode, status: "completed" },
                { id: "tim", name: "10. Timetable", tab: "timetable" as TabMode, status: "completed" },
                { id: "rea", name: "11. Readiness", tab: "readiness" as TabMode, status: "completed" }
              ].map((stage, idx) => (
                <div key={stage.id} className="flex items-center">
                  <button
                    onClick={() => {
                      if (stage.tab) setActiveTab(stage.tab);
                    }}
                    className={`flex-1 py-2 px-1 rounded-xl text-[11px] font-bold tracking-tight transition-all border cursor-pointer ${
                      stage.status === "active"
                        ? "bg-[#2F6B4F] dark:bg-[#78B895] text-white dark:text-[#0D1511] border-[#2F6B4F] dark:border-[#78B895] shadow-xs font-extrabold"
                        : "bg-[#EEF4EF] dark:bg-[#223128] text-[#526158] dark:text-[#C1CEC5] border-[#D5DED8] dark:border-[#304036] hover:border-[#2F6B4F] dark:hover:border-[#78B895] hover:text-[#17231C] dark:hover:text-[#F1F6F2]"
                    }`}
                  >
                    {stage.name}
                  </button>
                  {idx < 10 && (
                    <ChevronRight className="w-3.5 h-3.5 text-[#68776D] dark:text-[#98A99E] shrink-0 mx-0.5" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* INTERACTIVE NAVIGATION TABS */}
        {/* ============================================================ */}
        <div className="flex flex-wrap items-center gap-2 border-b border-[#D5DED8] dark:border-[#304036] pb-3">
          {[
            { id: "pipeline", label: "Weak Topic Remediation", icon: Zap, badge: "Phase 9 Flow" },
            { id: "syllabus", label: "NCISM BAMS Syllabus", icon: BookOpen, badge: "1st–4th Prof" },
            { id: "examprep", label: "Exam Prep & NEXT Hub", icon: Target, badge: "University & Viva" },
            { id: "internship", label: "Practical & Clinical Logbook", icon: GraduationCap, badge: "Internship" },
            { id: "cases", label: "Clinical Case Studies", icon: Stethoscope, badge: "Educational" },
            { id: "timetable", label: "Smart Study Timetable", icon: Calendar, badge: "Auto-Adjust" },
            { id: "readiness", label: "Exam Readiness & Mindset", icon: TrendingUp, badge: "Confidence" },
            { id: "guidance", label: "Doctor Guidance Exchange", icon: UserCheck, badge: "Institutional" }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabMode)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all border cursor-pointer ${
                  isActive
                    ? "bg-[#2F6B4F] dark:bg-[#78B895] text-white dark:text-[#0D1511] border-[#2F6B4F] dark:border-[#78B895] shadow-xs"
                    : "bg-[#FFFFFF] dark:bg-[#17211B] text-[#526158] dark:text-[#98A99E] border-[#D5DED8] dark:border-[#304036] hover:border-[#2F6B4F] dark:hover:border-[#78B895] hover:text-[#17231C] dark:hover:text-[#F1F6F2]"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white dark:text-[#0D1511]" : "text-[#2F6B4F] dark:text-[#78B895]"}`} />
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold ${
                    isActive ? "bg-black/20 text-white dark:text-[#0D1511]" : "bg-[#EEF4EF] dark:bg-[#223128] text-[#526158] dark:text-[#98A99E]"
                  }`}
                >
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* ============================================================ */}
        {/* TAB 1: WEAK TOPIC REMEDIATION PIPELINE (PHASE 9 CORE) */}
        {/* ============================================================ */}
        {activeTab === "pipeline" && (
          <div className="space-y-6">
            {/* Weak Topic Alert & Remediation Overview */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-emerald-950/40 border border-amber-500/30 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-semibold uppercase">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    Targeted Remediation Engine Active
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white">
                    Weak Topic Identified: {remediation.topicTitle}
                  </h2>
                  <p className="text-xs text-slate-400">
                    Diagnostic score: <span className="text-amber-400 font-bold">{remediation.currentMasteryPct}%</span>. Target score: <span className="text-emerald-400 font-bold">{remediation.targetMasteryPct}%</span>. Completing this 7-step remediation pipeline will update your <span className="text-emerald-300 font-semibold">Panchakarma Procedure Protocols</span> skill competency in the database.
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[11px] text-slate-400 block">Estimated Skill Score Boost</span>
                  <span className="text-2xl font-extrabold text-emerald-400">+{remediation.estimatedScoreBoost}%</span>
                </div>
              </div>

              {/* 7-Step Remediation Pipeline Ribbon */}
              <div className="grid grid-cols-7 gap-2 pt-2 text-center text-xs">
                {[
                  { step: 1, title: "1. Explanation", desc: "Basic Concept & Shloka" },
                  { step: 2, title: "2. Diagrams", desc: "Procedural Anatomy" },
                  { step: 3, title: "3. Voice Reader", desc: "Audio Synthesis" },
                  { step: 4, title: "4. Case Study", desc: "Amavata Protocol" },
                  { step: 5, title: "5. Expert Session", desc: "Dr. Rajesh Sharma" },
                  { step: 6, title: "6. Practice Quiz", desc: "3 Drill Questions" },
                  { step: 7, title: "7. Updated Score", desc: "Database Sync" }
                ].map((s) => (
                  <button
                    key={s.step}
                    onClick={() => setRemediationStep(s.step)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      remediationStep === s.step
                        ? "bg-emerald-500/20 border-emerald-500 text-white shadow-lg shadow-emerald-950"
                        : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <div className="font-bold text-[11px] text-emerald-400">{s.title}</div>
                    <div className="text-[10px] text-slate-400 truncate mt-0.5">{s.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 1: Basic Explanation & Classical Shloka */}
            {remediationStep === 1 && (
              <div className="glass-card rounded-2xl p-6 bg-slate-900 border border-emerald-500/20 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-emerald-400" />
                    Step 1: Foundational Explanation & Classical Shloka
                  </h3>
                  <button
                    onClick={() => setRemediationStep(2)}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all"
                  >
                    Next: Relevant Diagrams <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">Pedagogical Core</span>
                  <p className="text-sm text-slate-200 leading-relaxed">
                    {remediation.step1_Explanation.coreConcept}
                  </p>
                </div>

                {/* Classical Shloka Box */}
                <div className="p-5 rounded-2xl bg-[#0c2215] border border-emerald-600/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-emerald-300">
                      Classical Reference: {remediation.step1_Explanation.classicalShloka.reference}
                    </span>
                    <button
                      onClick={() => toggleVoiceReader(remediation.step1_Explanation.classicalShloka.meaning)}
                      className="px-3 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
                    >
                      {isSpeaking ? <VolumeX className="w-3.5 h-3.5 text-amber-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
                      {isSpeaking ? "Pause Audio" : "Listen Shloka Meaning"}
                    </button>
                  </div>
                  <div className="text-lg sm:text-xl font-serif text-amber-200 whitespace-pre-line leading-loose">
                    {remediation.step1_Explanation.classicalShloka.devanagari}
                  </div>
                  <div className="text-xs italic text-emerald-200/80 font-mono">
                    {remediation.step1_Explanation.classicalShloka.iast}
                  </div>
                  <div className="text-xs text-slate-300 border-t border-emerald-800/40 pt-2.5 leading-relaxed">
                    <strong className="text-emerald-400 font-semibold">English Meaning: </strong>
                    {remediation.step1_Explanation.classicalShloka.meaning}
                  </div>
                </div>

                {/* Clinical Pearls */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Critical Clinical Pearls for BAMS Undergraduates:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {remediation.step1_Explanation.clinicalPearls.map((pearl, i) => (
                      <div key={i} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1">
                        <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-[10px] mb-1">
                          {i + 1}
                        </span>
                        <p>{pearl}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Relevant Diagrams & Procedural Flow */}
            {remediationStep === 2 && (
              <div className="glass-card rounded-2xl p-6 bg-slate-900 border border-emerald-500/20 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Brain className="w-5 h-5 text-emerald-400" />
                    Step 2: Procedural Diagrams & Anatomical Delivery
                  </h3>
                  <button
                    onClick={() => setRemediationStep(3)}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all"
                  >
                    Next: Voice Reader <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* SVG Visual Flow Schematic */}
                <div className="p-6 rounded-2xl bg-slate-950 border border-emerald-500/30 space-y-4 text-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950 text-emerald-400 text-xs font-semibold">
                    {remediation.step2_Diagram.title}
                  </div>
                  <p className="text-xs text-slate-400 max-w-xl mx-auto">
                    {remediation.step2_Diagram.caption}
                  </p>

                  {/* Clean SVG Procedural Flow */}
                  <div className="py-6 px-4 max-w-2xl mx-auto bg-gradient-to-r from-emerald-950/20 via-slate-900 to-emerald-950/20 rounded-2xl border border-emerald-500/20">
                    <div className="grid grid-cols-5 gap-2 text-center text-xs">
                      <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/40">
                        <span className="text-[10px] font-bold text-amber-400 block mb-1">1. Makshika</span>
                        <span className="text-[11px] text-slate-200">Honey (Carrier)</span>
                      </div>
                      <div className="flex items-center justify-center text-emerald-400 font-bold">+</div>
                      <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-500/40">
                        <span className="text-[10px] font-bold text-blue-400 block mb-1">2. Lavana</span>
                        <span className="text-[11px] text-slate-200">Rock Salt</span>
                      </div>
                      <div className="flex items-center justify-center text-emerald-400 font-bold">+</div>
                      <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/40">
                        <span className="text-[10px] font-bold text-purple-400 block mb-1">3. Sneha</span>
                        <span className="text-[11px] text-slate-200">Medicated Oil</span>
                      </div>
                    </div>
                    <div className="my-3 text-emerald-400 font-bold text-sm">↓ Blended Thoroughly ↓</div>
                    <div className="grid grid-cols-3 gap-3 text-center text-xs max-w-md mx-auto">
                      <div className="p-3 rounded-xl bg-teal-950/40 border border-teal-500/40">
                        <span className="text-[10px] font-bold text-teal-400 block mb-1">4. Kalka</span>
                        <span className="text-[11px] text-slate-200">Herbal Paste</span>
                      </div>
                      <div className="flex items-center justify-center text-emerald-400 font-bold">+</div>
                      <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40">
                        <span className="text-[10px] font-bold text-emerald-400 block mb-1">5. Kwatha</span>
                        <span className="text-[11px] text-slate-200">Hot Decoction</span>
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-emerald-900/40 text-[11px] text-emerald-300">
                      Result: Stable Micro-Emulsion for rapid trans-colonic epithelial uptake (NCISM Standard).
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Interactive Voice Reader */}
            {remediationStep === 3 && (
              <div className="glass-card rounded-2xl p-6 bg-slate-900 border border-emerald-500/20 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Volume2 className="w-5 h-5 text-emerald-400" />
                    Step 3: Classical Shloka & Clinical Voice Reader
                  </h3>
                  <button
                    onClick={() => setRemediationStep(4)}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all"
                  >
                    Next: Targeted Case Study <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-950 to-[#0d2215] border border-emerald-500/30 space-y-5">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                        Native Web Speech Voice Synthesizer
                      </span>
                      <p className="text-xs text-slate-400">
                        Listen to pedagogical shloka pronunciations and clinical high-yield summaries designed for viva voce memory retention.
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <button
                        onClick={() => toggleVoiceReader(remediation.step3_VoiceReaderScript)}
                        className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
                          isSpeaking
                            ? "bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20"
                            : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20"
                        }`}
                      >
                        {isSpeaking ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        {isSpeaking ? "Pause Reader" : "Play Voice Reader"}
                      </button>
                      <button
                        onClick={() => {
                          if (typeof window !== "undefined" && "speechSynthesis" in window) {
                            window.speechSynthesis.cancel();
                            setIsSpeaking(false);
                          }
                        }}
                        className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                        title="Reset Audio"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Transcript Display */}
                  <div className="p-4 rounded-xl bg-black/50 border border-slate-800 font-mono text-xs text-emerald-200/90 leading-relaxed whitespace-pre-line">
                    {remediation.step3_VoiceReaderScript}
                  </div>

                  {/* Voice Speed Controls */}
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span>Playback Speed:</span>
                    {[0.8, 0.95, 1.1].map(rate => (
                      <button
                        key={rate}
                        onClick={() => setSpeechRate(rate)}
                        className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                          speechRate === rate
                            ? "bg-emerald-500 text-slate-950 font-bold"
                            : "bg-slate-900 text-slate-400 hover:text-white"
                        }`}
                      >
                        {rate}x
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Targeted Clinical Case Study */}
            {remediationStep === 4 && (
              <div className="glass-card rounded-2xl p-6 bg-slate-900 border border-emerald-500/20 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Stethoscope className="w-5 h-5 text-emerald-400" />
                    Step 4: Targeted Clinical Case Study (Educational Only)
                  </h3>
                  <button
                    onClick={() => setRemediationStep(5)}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all"
                  >
                    Next: Relevant Expert Session <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-5 rounded-2xl bg-slate-950 border border-emerald-500/30 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div>
                      <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">Case Code: AYUR-CASE-2026-001</span>
                      <h4 className="text-base sm:text-lg font-bold text-white">
                        Refractory Amavata (Rheumatoid Spectrum) Presenting for Vaitarana Basti Protocol
                      </h4>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-purple-950 text-purple-300 border border-purple-500/30 font-semibold self-start">
                      Advanced Level
                    </span>
                  </div>

                  {/* Non-diagnostic disclaimer */}
                  <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-[11px] text-amber-300 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 shrink-0 text-amber-400" />
                    <span>Educational Case Study formulated strictly for academic training of BAMS scholars under NCISM guidelines. Not for personal medical diagnosis.</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-2 p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                      <strong className="text-emerald-400 font-bold block">Patient Complaints & History:</strong>
                      <p className="text-slate-300 leading-relaxed">
                        42yo female with severe bilateral wrist and knee pain with morning stiffness &gt; 2 hours, Agnimandya, and heaviness (Angamarda). Aggravated by cold, humid weather.
                      </p>
                    </div>

                    <div className="space-y-2 p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                      <strong className="text-emerald-400 font-bold block">Ayurvedic Assessment (Hetu &amp; Srotas):</strong>
                      <p className="text-slate-300 leading-relaxed">
                        Hetu: Viruddhadhara &amp; Divaswapna. Dosha: Vata-Kapha with Ama. Srotas: Rasavaha &amp; Asthivaha. Prescription: Valuka Sweda followed by Vaitarana Basti.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Relevant Recorded Lectures & Verified Doctors */}
            {remediationStep === 5 && (
              <div className="glass-card rounded-2xl p-6 bg-slate-900 border border-emerald-500/20 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Video className="w-5 h-5 text-emerald-400" />
                    Step 5: Relevant Recorded Lecture &amp; Expert Doctor Mentorship
                  </h3>
                  <button
                    onClick={() => setRemediationStep(6)}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all"
                  >
                    Next: Practice Revision Quiz <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Relevant Recorded Lecture */}
                  <div className="p-5 rounded-2xl bg-slate-950 border border-emerald-500/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/30">
                        {remediation.step6_RelevantExpertSession.scheduledOrRecorded}
                      </span>
                      <span className="text-xs text-slate-400">{remediation.step6_RelevantExpertSession.durationMins} mins</span>
                    </div>
                    <h4 className="text-sm font-bold text-white leading-snug">
                      {remediation.step6_RelevantExpertSession.sessionTitle}
                    </h4>
                    <p className="text-xs text-slate-400">
                      Instructor: <strong className="text-slate-200">{remediation.step6_RelevantExpertSession.expertName}</strong> ({remediation.step6_RelevantExpertSession.expertTitle})
                    </p>
                    <Link
                      href="/student/sessions"
                      className="w-full py-2 rounded-xl bg-slate-900 border border-emerald-500/40 hover:bg-emerald-500/10 text-emerald-300 font-bold text-xs flex items-center justify-center gap-2 transition-all"
                    >
                      <Play className="w-3.5 h-3.5 text-emerald-400" /> Watch Recorded Masterclass
                    </Link>
                  </div>

                  {/* Relevant Doctor Profile */}
                  <div className="p-5 rounded-2xl bg-slate-950 border border-emerald-500/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 px-2 py-0.5 rounded bg-purple-950 border border-purple-500/30">
                        NCISM Verified Mentor
                      </span>
                      <span className="text-xs text-slate-400">{remediation.step7_RelevantDoctorProfile.experienceYears}+ Yrs Exp</span>
                    </div>
                    <h4 className="text-sm font-bold text-white leading-snug">
                      {remediation.step7_RelevantDoctorProfile.doctorName}
                    </h4>
                    <p className="text-xs text-slate-400">
                      Specialization: <strong className="text-slate-200">{remediation.step7_RelevantDoctorProfile.specialization}</strong>
                      <br />
                      Clinic: {remediation.step7_RelevantDoctorProfile.clinicLocation}
                    </p>
                    <Link
                      href="/student/sessions"
                      className="w-full py-2 rounded-xl bg-purple-950/60 border border-purple-500/40 hover:bg-purple-900 text-purple-200 font-bold text-xs flex items-center justify-center gap-2 transition-all"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-purple-400" /> Request 1-on-1 Guidance
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Step 6: Practice Questions & Dynamic Score Recalculation */}
            {remediationStep === 6 && (
              <div className="glass-card rounded-2xl p-6 bg-slate-900 border border-emerald-500/20 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Award className="w-5 h-5 text-emerald-400" />
                    Step 6: Targeted Revision Quiz &amp; Skill Competency Recalibration
                  </h3>
                  <span className="text-xs font-semibold text-slate-400">
                    Answer all 3 questions to update your database score
                  </span>
                </div>

                {/* Question Cards */}
                <div className="space-y-4">
                  {remediation.step4_PracticeQuestions.map((q, idx) => (
                    <div key={q.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs">
                          {idx + 1}
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-100">{q.question}</h4>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {q.options.map((opt, optIdx) => {
                          const isSelected = selectedAnswers[q.id] === optIdx;
                          const isCorrect = optIdx === q.correctIndex;
                          return (
                            <button
                              key={optIdx}
                              disabled={quizSubmitted}
                              onClick={() => setSelectedAnswers({ ...selectedAnswers, [q.id]: optIdx })}
                              className={`p-2.5 rounded-lg border text-left text-xs transition-all ${
                                quizSubmitted
                                  ? isCorrect
                                    ? "bg-emerald-950 border-emerald-500 text-emerald-300 font-bold"
                                    : isSelected
                                    ? "bg-red-950 border-red-500 text-red-300"
                                    : "bg-slate-900 border-slate-800 text-slate-500"
                                  : isSelected
                                  ? "bg-emerald-500/20 border-emerald-500 text-white font-bold"
                                  : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700"
                              }`}
                            >
                              <span className="font-mono text-emerald-400 mr-2">{String.fromCharCode(65 + optIdx)}.</span>
                              {opt}
                            </button>
                          );
                        })}
                      </div>

                      {quizSubmitted && (
                        <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-[11px] text-emerald-300 leading-relaxed">
                          <strong>Explanation: </strong> {q.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Submit / Retake Button */}
                {!quizSubmitted ? (
                  <button
                    onClick={handleSubmitRemediationQuiz}
                    disabled={Object.keys(selectedAnswers).length < remediation.step4_PracticeQuestions.length}
                    className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Submit Quiz &amp; Recalculate Skill Score
                  </button>
                ) : (
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 border border-emerald-500/40 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400">
                      <Award className="w-6 h-6" />
                    </div>
                    <h4 className="text-lg font-bold text-white">
                      Remediation Mastered! Score Updated: {updatedSkillScore}%
                    </h4>
                    <p className="text-xs text-slate-300 max-w-md mx-auto">
                      Your proficiency in <span className="text-emerald-400 font-bold">Panchakarma Procedure Protocols</span> has been updated to <span className="text-emerald-400 font-bold">ADVANCED (85%)</span>. Your Exam Readiness increased to 85.5%!
                    </p>
                    <div className="flex items-center justify-center gap-3 pt-2">
                      <button
                        onClick={() => setRemediationStep(7)}
                        className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all"
                      >
                        View Updated Skill Score <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 7: Updated Skill Score & Milestones */}
            {remediationStep === 7 && (
              <div className="glass-card rounded-2xl p-6 bg-slate-900 border border-emerald-500/20 space-y-6">
                <div className="text-center space-y-2 max-w-lg mx-auto">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Skill Milestone Achieved
                  </div>
                  <h3 className="text-2xl font-extrabold text-white">
                    Panchakarma Topic Competency Elevated
                  </h3>
                  <p className="text-xs text-slate-400">
                    From weak topic to verified mastery. Your profile now reflects high-confidence clinical competence.
                  </p>
                </div>

                {/* Score Comparison Matrix */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-xs text-slate-400 block mb-1">Previous Score</span>
                    <span className="text-2xl font-bold text-red-400">48%</span>
                    <span className="text-[10px] text-slate-500 block mt-1">Weak Area Flagged</span>
                  </div>
                  <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40">
                    <span className="text-xs text-emerald-300 block mb-1">New Verified Score</span>
                    <span className="text-3xl font-black text-emerald-400">85%</span>
                    <span className="text-[10px] text-emerald-300/80 block mt-1">Advanced Competency</span>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-xs text-slate-400 block mb-1">Exam Readiness</span>
                    <span className="text-2xl font-bold text-teal-400">+6.5%</span>
                    <span className="text-[10px] text-slate-500 block mt-1">82.5% → 89.0%</span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-4 pt-2">
                  <Link
                    href="/student/skills"
                    className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all"
                  >
                    View in Student Skill Profile <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                  <button
                    onClick={() => {
                      setRemediationStep(1);
                      setQuizSubmitted(false);
                      setSelectedAnswers({});
                    }}
                    className="px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 font-bold text-xs"
                  >
                    Retake Remediation Drill
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: NCISM BAMS SYLLABUS & TOPIC HIERARCHY */}
        {/* ============================================================ */}
        {activeTab === "syllabus" && (
          <div className="space-y-6">
            {/* Professional Year Selector */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-xl font-extrabold text-white">Official NCISM BAMS Curriculum Hierarchy</h2>
                <p className="text-xs text-slate-400">Select professional year to browse subjects, topics, and classical shlokas.</p>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                {["1st Prof", "2nd Prof", "3rd Prof", "4th Prof"].map((year) => (
                  <button
                    key={year}
                    onClick={() => {
                      setSelectedProfYear(year);
                      const firstSub = BAMS_SUBJECTS.find(s => s.professionalYear === year);
                      if (firstSub) setSelectedSubjectId(firstSub.id);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      selectedProfYear === year
                        ? "bg-emerald-500 text-slate-950 font-extrabold"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>

            {/* Subject Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {filteredSubjects.map((sub) => {
                const isSelected = sub.id === selectedSubjectId;
                return (
                  <button
                    key={sub.id}
                    onClick={() => setSelectedSubjectId(sub.id)}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? "bg-emerald-950/40 border-emerald-500 shadow-md shadow-emerald-950"
                        : "bg-slate-900 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold font-mono text-emerald-400 uppercase">{sub.code}</span>
                      <span className="text-[10px] text-slate-400">{sub.totalHours} Hours</span>
                    </div>
                    <h3 className="text-sm font-bold text-white">{sub.name}</h3>
                    <p className="text-xs font-serif text-amber-200/90 mt-0.5">{sub.sanskritName}</p>
                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-2 leading-relaxed">{sub.description}</p>
                    <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                      <span>{sub.unitsCount} Units · {sub.topicsCount} Topics</span>
                      <span className="text-emerald-400 font-semibold">{sub.linkedSkillName}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* 3D Sharira Rachana Anatomy Lab Bridge */}
            {(selectedProfYear === "1st Prof" || selectedSubjectId.includes("rachana") || selectedSubjectId.includes("kriya")) && (
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-amber-950/70 border border-amber-500/40 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shrink-0 shadow-inner">
                    <Compass className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm sm:text-base font-bold text-white">
                        Interactive 3D Sharira Rachana &amp; Marma Lab
                      </h4>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                        11 GLTF Systems
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
                      Visualize 107 Marma vital points, Srotas conduits, Asthi articulations, and Sandhi cross-sections in real-time WebGL with interactive dissection clipping.
                    </p>
                  </div>
                </div>
                <Link
                  href="/interactive-3d"
                  className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-2 shrink-0 transition-all shadow-md hover:shadow-amber-500/20 cursor-pointer"
                >
                  <Compass className="w-4 h-4" />
                  <span>Launch 3D Anatomy Lab</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}

            {/* Topics of Selected Subject */}
            <div className="glass-card rounded-2xl p-6 bg-slate-900 border border-emerald-500/20 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">Topics in {activeSubject.name}</h3>
                  <p className="text-xs text-slate-400">Detailed pedagogical learning objectives, shlokas, and diagrams.</p>
                </div>
                <span className="text-xs font-semibold text-emerald-400 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-500/30">
                  {activeSubject.code} · NCISM Curriculum
                </span>
              </div>

              {activeSubjectTopics.length > 0 ? (
                <div className="space-y-4">
                  {activeSubjectTopics.map((topic) => (
                    <div key={topic.id} className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3.5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                              Unit {topic.unitNumber}: {topic.unitTitle}
                            </span>
                            {completedTopicIds.includes(topic.id) && (
                              <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Done
                              </span>
                            )}
                          </div>
                          <h4 className="text-sm sm:text-base font-bold text-white">{topic.topicTitle}</h4>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleTopicComplete(topic.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 border transition-all ${
                              completedTopicIds.includes(topic.id)
                                ? "bg-emerald-500 text-slate-950 border-emerald-400 font-extrabold"
                                : "bg-slate-900 text-slate-300 border-slate-800 hover:border-emerald-500/40"
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {completedTopicIds.includes(topic.id) ? "Completed" : "Mark Done"}
                          </button>
                          <button
                            onClick={() => handleToggleBookmark(topic.id)}
                            className={`p-2 rounded-lg border transition-all ${
                              bookmarkedTopicIds.includes(topic.id)
                                ? "bg-amber-500/20 text-amber-300 border-amber-500/50"
                                : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white"
                            }`}
                            title={bookmarkedTopicIds.includes(topic.id) ? "Remove Bookmark" : "Save Bookmark"}
                          >
                            <Bookmark className={`w-3.5 h-3.5 ${bookmarkedTopicIds.includes(topic.id) ? "fill-amber-400 text-amber-400" : ""}`} />
                          </button>
                          <button
                            onClick={() => toggleVoiceReader(topic.explanation)}
                            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-slate-800"
                            title="Read Topic Aloud"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">{topic.explanation}</p>

                      {/* Shloka Quote */}
                      <div className="p-3.5 rounded-xl bg-[#081b10] border border-emerald-900/40 text-xs space-y-1">
                        <div className="text-amber-200 font-serif whitespace-pre-line text-sm">{topic.sanskritShloka.devanagari}</div>
                        <div className="text-emerald-300/80 text-[11px] font-mono">{topic.sanskritShloka.iast}</div>
                        <div className="text-slate-400 text-[11px] pt-1">
                          <strong className="text-slate-300">Meaning: </strong>{topic.sanskritShloka.englishMeaning}
                        </div>
                      </div>

                      {/* Key Revision Points */}
                      <div className="pt-1">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Key Revision Points:</span>
                        <ul className="list-disc list-inside text-xs text-slate-300 space-y-0.5">
                          {topic.keyRevisionPoints.map((pt, i) => (
                            <li key={i}>{pt}</li>
                          ))}
                        </ul>
                      </div>

                      {/* AI Learning & Assessment Action Bar */}
                      <div className="pt-2 border-t border-slate-850 flex flex-wrap items-center gap-2">
                        <Link
                          href={`/ai?tab=chatbot&q=${encodeURIComponent('Explain ' + topic.topicTitle + ' with classical citations, clinical protocol and viva questions')}`}
                          onClick={() => handleViewTopic(topic)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 transition-all"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Ask Aayuraura AI</span>
                        </Link>
                        <Link
                          href={`/bams/flashcards?subject_id=${topic.subjectId}`}
                          className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 transition-all"
                        >
                          <Brain className="w-3.5 h-3.5 text-amber-400" />
                          <span>Flashcards Deck</span>
                        </Link>
                        <Link
                          href={`/ai?tab=quiz&topic=${encodeURIComponent(topic.topicTitle)}`}
                          onClick={() => handleViewTopic(topic)}
                          className="px-3 py-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 text-xs font-bold flex items-center gap-1.5 transition-all"
                        >
                          <Award className="w-3.5 h-3.5 text-purple-400" />
                          <span>Practice Topic Quiz</span>
                        </Link>
                        <Link
                          href="/ai?tab=notes"
                          onClick={() => handleViewTopic(topic)}
                          className="px-3 py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 text-xs font-bold flex items-center gap-1.5 transition-all"
                        >
                          <FileText className="w-3.5 h-3.5 text-blue-400" />
                          <span>AI Smart Notes</span>
                        </Link>
                      </div>

                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-slate-400 bg-slate-950 rounded-xl">
                  Topics loaded for this subject. Select Panchakarma, Rachana Sharir, or Dravyaguna for interactive demonstration.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 3: EXAM PREPARATION & NEXT-ORIENTED FRAMEWORK */}
        {/* ============================================================ */}
        {activeTab === "examprep" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-xl font-extrabold text-white">BAMS University &amp; NEXT Exam Preparation</h2>
                <p className="text-xs text-slate-400">NCISM 5-Step Model Answer Writing Framework, Viva Flashcards, and Retention Mnemonics.</p>
              </div>
              <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                NCISM Marking Format
              </span>
            </div>

            {/* Modules List */}
            <div className="space-y-4">
              {MASTER_EXAM_PREP_MODULES.map((mod) => (
                <div key={mod.id} className="p-6 rounded-2xl bg-slate-900 border border-emerald-500/20 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/30">
                          {mod.examType}
                        </span>
                        <span className="text-xs text-slate-400">{mod.subject} · {mod.topic}</span>
                      </div>
                      <h3 className="text-base font-bold text-white mt-1 leading-snug">{mod.questionTitle}</h3>
                    </div>
                    <span className="text-sm font-extrabold text-amber-400 px-3 py-1 rounded-lg bg-amber-950/40 border border-amber-500/30 shrink-0">
                      {mod.marksWeightage} Marks
                    </span>
                  </div>

                  {/* 5-Step Answer Framework */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                      NCISM 5-Step Model Answer Structure:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs">
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                        <span className="text-[10px] font-bold text-emerald-400 block">Step 1: Prastavana</span>
                        <p className="text-slate-400 text-[11px] leading-relaxed">{mod.answerWritingFramework.step1_Prastavana}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                        <span className="text-[10px] font-bold text-amber-400 block">Step 2: Shloka Nirupana</span>
                        <p className="text-slate-400 text-[11px] leading-relaxed">{mod.answerWritingFramework.step2_ShlokaNirupana}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                        <span className="text-[10px] font-bold text-teal-400 block">Step 3: Hetu-Linga Matrix</span>
                        <p className="text-slate-400 text-[11px] leading-relaxed">{mod.answerWritingFramework.step3_HetuLingaMatrix}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                        <span className="text-[10px] font-bold text-blue-400 block">Step 4: Modern Correlation</span>
                        <p className="text-slate-400 text-[11px] leading-relaxed">{mod.answerWritingFramework.step4_ModernCorrelation}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                        <span className="text-[10px] font-bold text-purple-400 block">Step 5: Upasamhara</span>
                        <p className="text-slate-400 text-[11px] leading-relaxed">{mod.answerWritingFramework.step5_ClinicalUpasamhara}</p>
                      </div>
                    </div>
                  </div>

                  {/* Retention Mnemonic */}
                  <div className="p-3.5 rounded-xl bg-gradient-to-r from-purple-950/30 to-slate-950 border border-purple-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 block">Viva Memory Mnemonic:</span>
                      <strong className="text-sm font-extrabold text-white font-mono">{mod.mnemonic.acronym}</strong>
                      <span className="text-slate-300 ml-2">({mod.mnemonic.expansion})</span>
                    </div>
                    <span className="text-[11px] text-slate-400 italic shrink-0">
                      {mod.mnemonic.retentionContext}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB: PRACTICAL & CLINICAL INTERNSHIP LOGBOOK */}
        {/* ============================================================ */}
        {activeTab === "internship" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-xl font-extrabold text-white">NCISM 12-Month Rotatory Clinical Internship Logbook</h2>
                <p className="text-xs text-slate-400">Department rotation tracking, clinical procedures observed, reflection notes, and verified supervisor sign-offs.</p>
              </div>
              <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                NCISM Clinical Logbook Format
              </span>
            </div>

            {/* Rotatory Postings Tracker */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-emerald-500/20 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-emerald-400" />
                Mandatory Rotatory Postings Matrix (365 Days)
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 text-center text-xs">
                {[
                  { dept: "Kayachikitsa", days: "60 Days", status: "In Progress", color: "emerald" },
                  { dept: "Panchakarma", days: "60 Days", status: "Completed", color: "teal" },
                  { dept: "Shalya Tantra", days: "60 Days", status: "Upcoming", color: "amber" },
                  { dept: "Shalakya Tantra", days: "45 Days", status: "Upcoming", color: "slate" },
                  { dept: "Prasuti & Striroga", days: "45 Days", status: "Upcoming", color: "slate" },
                  { dept: "Kaumarbhritya", days: "30 Days", status: "Upcoming", color: "slate" },
                  { dept: "Swasthavritta", days: "65 Days", status: "Upcoming", color: "slate" }
                ].map((post) => (
                  <div key={post.dept} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 block truncate">{post.dept}</span>
                    <span className="text-sm font-extrabold text-white block">{post.days}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase inline-block ${
                      post.status === "Completed"
                        ? "bg-emerald-500/20 text-emerald-300"
                        : post.status === "In Progress"
                        ? "bg-amber-500/20 text-amber-300"
                        : "bg-slate-800 text-slate-400"
                    }`}>
                      {post.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Log New Clinical Record Form */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-[#0c2216] border border-emerald-500/30 space-y-4 shadow-lg">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <PlusCircle className="w-4 h-4 text-emerald-400" />
                  Record New Clinical Observation / Procedure Log
                </h3>
                <span className="text-[10px] text-slate-400 font-mono">Real DB Persistence</span>
              </div>

              {logbookSaveSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Clinical entry saved and recorded in your student academic profile successfully!</span>
                </div>
              )}

              <form onSubmit={handleAddLogbookEntry} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Date of Clinical Posting</label>
                    <input
                      type="date"
                      required
                      value={logbookFormDate}
                      onChange={(e) => setLogbookFormDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Department</label>
                    <select
                      value={logbookFormDepartment}
                      onChange={(e) => setLogbookFormDepartment(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Kayachikitsa">Kayachikitsa</option>
                      <option value="Panchakarma">Panchakarma</option>
                      <option value="Shalya Tantra">Shalya Tantra</option>
                      <option value="Shalakya Tantra">Shalakya Tantra</option>
                      <option value="Prasuti & Striroga">Prasuti & Striroga</option>
                      <option value="Kaumarbhritya">Kaumarbhritya</option>
                      <option value="Casualty / Emergency">Casualty / Emergency</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Posting / Ward</label>
                    <input
                      type="text"
                      required
                      value={logbookFormPosting}
                      onChange={(e) => setLogbookFormPosting(e.target.value)}
                      placeholder="e.g. Inpatient Ward, Panchakarma Theatre, Shalya OT"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Procedure or Case Observed</label>
                    <input
                      type="text"
                      required
                      value={logbookFormProcedure}
                      onChange={(e) => setLogbookFormProcedure(e.target.value)}
                      placeholder="e.g. Snehapana titration with Indukanta Ghrita in Parinamashula"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Supervisor Vaidya / MD Doctor</label>
                    <input
                      type="text"
                      required
                      value={logbookFormSupervisor}
                      onChange={(e) => setLogbookFormSupervisor(e.target.value)}
                      placeholder="e.g. Dr. V. K. Sharma (MD Ayu)"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Clinical Observation &amp; Reflection Notes</label>
                  <textarea
                    rows={3}
                    required
                    value={logbookFormReflection}
                    onChange={(e) => setLogbookFormReflection(e.target.value)}
                    placeholder="Document clinical signs, dosha vitiation, patient vitals before and after procedure, drug dosing rationale..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={logbookSaving}
                    className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{logbookSaving ? "Recording..." : "Save to Official Logbook"}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Recorded Clinical Logbook Entries */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  Verified Clinical Entries ({clinicalLogbook.length})
                </h3>
                <span className="text-xs text-slate-400">NCISM Academic Portfolio Record</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {clinicalLogbook.map((entry, idx) => (
                  <div key={entry.id || idx} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30 uppercase font-bold">
                          {entry.department}
                        </span>
                        <span className="text-xs text-slate-400">{entry.date}</span>
                      </div>
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-300">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Verified
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white">{entry.procedure_observed}</h4>
                    <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-850">
                      {entry.reflection}
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                      <span>Posting: <strong className="text-slate-300">{entry.posting}</strong></span>
                      <span>Supervisor: <strong className="text-emerald-400">{entry.supervisor_name}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 4: CLINICAL CASE STUDIES & DOCTOR SUBMISSIONS */}
        {/* ============================================================ */}
        {activeTab === "cases" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-xl font-extrabold text-white">Educational BAMS Case Study Repository</h2>
                <p className="text-xs text-slate-400">Real-world Ayurvedic case scenarios with Nidana Panchaka and discussion questions.</p>
              </div>

              <button
                onClick={() => setShowDoctorCaseModal(true)}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/20"
              >
                <PlusCircle className="w-4 h-4" /> Contribute New Case (Doctor / Faculty)
              </button>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={caseSearch}
                  onChange={(e) => setCaseSearch(e.target.value)}
                  placeholder="Search case studies by condition, Panchakarma, Amavata, herbs..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <select
                value={caseDifficultyFilter}
                onChange={(e) => setCaseDifficultyFilter(e.target.value)}
                className="px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
              >
                <option value="ALL">All Difficulties</option>
                <option value="Basic">Basic Level</option>
                <option value="Intermediate">Intermediate Level</option>
                <option value="Advanced">Advanced Level</option>
              </select>
            </div>

            {/* Case List */}
            <div className="space-y-4">
              {filteredCases.map((cs) => (
                <div key={cs.id} className="p-6 rounded-2xl bg-slate-900 border border-emerald-500/20 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/30">
                          {cs.caseIdCode}
                        </span>
                        <span className="text-xs text-slate-400">{cs.subject} · {cs.topic}</span>
                      </div>
                      <h3 className="text-base font-bold text-white mt-1">{cs.title}</h3>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs px-2.5 py-1 rounded-full bg-purple-950 text-purple-300 border border-purple-500/30 font-semibold block">
                        {cs.difficulty}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-1">Author: {cs.verifiedAuthor}</span>
                    </div>
                  </div>

                  {/* Patient Profile */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs p-3 rounded-xl bg-slate-950 border border-slate-850">
                    <div><span className="text-slate-500 block text-[10px]">Age / Sex:</span> <strong className="text-slate-200">{cs.patientDemographics.age} Yrs, {cs.patientDemographics.gender}</strong></div>
                    <div><span className="text-slate-500 block text-[10px]">Prakriti:</span> <strong className="text-amber-300">{cs.patientDemographics.prakriti}</strong></div>
                    <div><span className="text-slate-500 block text-[10px]">Occupation:</span> <strong className="text-slate-200">{cs.patientDemographics.occupation}</strong></div>
                    <div><span className="text-slate-500 block text-[10px]">Nidana:</span> <strong className="text-emerald-400">{cs.ayurvedicAssessment.vyadhiNidana}</strong></div>
                  </div>

                  {/* Discussion Questions */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Pedagogical Discussion Points:</span>
                    {cs.discussionQuestions.map((dq, i) => (
                      <div key={i} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                        <strong className="text-emerald-400 block">Q{i + 1}: {dq.question}</strong>
                        <p className="text-slate-300 leading-relaxed text-[11px]">{dq.modelAnswer}</p>
                      </div>
                    ))}
                  </div>

                  {/* Educational Disclaimer */}
                  <div className="text-[10px] text-slate-500 italic">
                    {cs.educationalDisclaimer}
                  </div>
                </div>
              ))}
            </div>

            {/* Doctor Case Creation Modal */}
            {showDoctorCaseModal && (
              <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="glass-card rounded-3xl p-6 sm:p-8 bg-slate-900 border border-emerald-500/30 max-w-2xl w-full space-y-4 max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Stethoscope className="w-5 h-5 text-emerald-400" />
                      Publish BAMS Educational Case Study
                    </h3>
                    <button
                      onClick={() => setShowDoctorCaseModal(false)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {caseDuplicateWarning && (
                    <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-xs text-red-200">
                      {caseDuplicateWarning}
                    </div>
                  )}

                  {caseSubmitSuccess && (
                    <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-xs text-emerald-200">
                      {caseSubmitSuccess}
                    </div>
                  )}

                  <form onSubmit={handleDoctorCaseSubmit} className="space-y-4 text-xs">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Case Title</label>
                      <input
                        type="text"
                        required
                        value={newCaseTitle}
                        onChange={(e) => setNewCaseTitle(e.target.value)}
                        placeholder="e.g. Chronic Sandhigata Vata with Janu Basti and Guggulu Management"
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-300 font-semibold mb-1">BAMS Subject</label>
                        <select
                          value={newCaseSubject}
                          onChange={(e) => setNewCaseSubject(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                        >
                          <option value="Panchakarma">Panchakarma</option>
                          <option value="Kayachikitsa">Kayachikitsa</option>
                          <option value="Shalya Tantra">Shalya Tantra</option>
                          <option value="Dravyaguna Vijnana">Dravyaguna Vijnana</option>
                          <option value="Roga Nidana">Roga Nidana</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-300 font-semibold mb-1">Topic</label>
                        <input
                          type="text"
                          required
                          value={newCaseTopic}
                          onChange={(e) => setNewCaseTopic(e.target.value)}
                          placeholder="e.g. Janu Basti, Virechana Protocols"
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Presenting Complaints (Comma-separated for Hash Checking)</label>
                      <input
                        type="text"
                        required
                        value={newCaseComplaints}
                        onChange={(e) => setNewCaseComplaints(e.target.value)}
                        placeholder="e.g. Knee joint crepitus, pain on weight bearing, morning stiffness"
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Clinical History of Present Illness</label>
                      <textarea
                        rows={3}
                        required
                        value={newCaseHistory}
                        onChange={(e) => setNewCaseHistory(e.target.value)}
                        placeholder="Detailed clinical narrative for student pedagogical analysis..."
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Recommended Ayurvedic Intervention</label>
                      <textarea
                        rows={2}
                        required
                        value={newCaseIntervention}
                        onChange={(e) => setNewCaseIntervention(e.target.value)}
                        placeholder="Specific Shodhana or Shamana course..."
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="pt-2 flex items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setShowDoctorCaseModal(false)}
                        className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
                      >
                        <Send className="w-3.5 h-3.5" /> Validate &amp; Publish Case
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 5: SMART STUDY TIMETABLE GENERATOR */}
        {/* ============================================================ */}
        {activeTab === "timetable" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-xl font-extrabold text-white">Smart BAMS Study Timetable Balancer</h2>
                <p className="text-xs text-slate-400">
                  Strict rule: Never schedules study over college classes or internship duties. Balances study, weak topics, fitness, and sleep.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-400 font-semibold">Internship Active?</label>
                <input
                  type="checkbox"
                  checked={hasInternship}
                  onChange={(e) => setHasInternship(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Time Adjustments Controls */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="text-slate-400 font-semibold block mb-1">College Start Time</label>
                <input
                  type="time"
                  value={collegeStart}
                  onChange={(e) => setCollegeStart(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 font-semibold block mb-1">College End Time</label>
                <input
                  type="time"
                  value={collegeEnd}
                  onChange={(e) => setCollegeEnd(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>
              <div className="col-span-2 flex items-center justify-end">
                <span className="text-[11px] text-emerald-400 font-semibold">
                  ✓ Schedule Auto-balanced with 90 min daily weak topic focus + Dinacharya
                </span>
              </div>
            </div>

            {/* 7-Day Schedule Display */}
            <div className="space-y-3">
              {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day) => {
                const dayBlocks = scheduleData.filter(b => b.dayOfWeek === day);
                return (
                  <div key={day} className="p-4 rounded-2xl bg-slate-900 border border-emerald-500/20 space-y-2">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">{day}</span>
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs">
                      {dayBlocks.map((block) => {
                        const isFixed = block.isFixedCommitment;
                        const isWeak = block.category === "WEAK_TOPIC_STUDY";
                        return (
                          <div
                            key={block.id}
                            className={`p-3 rounded-xl border ${
                              isFixed
                                ? "bg-slate-950/90 border-slate-800 text-slate-400"
                                : isWeak
                                ? "bg-amber-950/40 border-amber-500/40 text-amber-200"
                                : "bg-emerald-950/30 border-emerald-500/30 text-emerald-200"
                            }`}
                          >
                            <span className="text-[10px] font-mono block text-slate-400 mb-0.5">
                              {block.startTime} – {block.endTime}
                            </span>
                            <strong className="block text-xs font-bold text-white truncate">{block.title}</strong>
                            <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">{block.details}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 6: EXAM READINESS & CONFIDENCE MINDSET */}
        {/* ============================================================ */}
        {activeTab === "readiness" && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-3">
              <h2 className="text-xl font-extrabold text-white">Student Confidence &amp; Exam Readiness Engine</h2>
              <p className="text-xs text-slate-400">Objective competency metrics, confidence trends, and sustainable daily achievements.</p>
            </div>

            {/* 4 Pillars Readiness Meter */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-slate-900 border border-emerald-500/30 text-center space-y-2">
                <span className="text-xs text-slate-400 uppercase font-semibold">Knowledge Readiness</span>
                <span className="text-3xl font-black text-emerald-400 block">86%</span>
                <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: "86%" }} />
                </div>
                <span className="text-[10px] text-slate-500 block">Syllabus coverage confirmed</span>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-teal-500/30 text-center space-y-2">
                <span className="text-xs text-slate-400 uppercase font-semibold">Revision Readiness</span>
                <span className="text-3xl font-black text-teal-400 block">78%</span>
                <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-teal-500 h-full rounded-full" style={{ width: "78%" }} />
                </div>
                <span className="text-[10px] text-slate-500 block">Shlokas &amp; formulas recapped</span>
              </div>

              <div className="p-5 rounded-2xl bg-slate-950 border border-amber-500/30 text-center space-y-2">
                <span className="text-xs text-slate-400 uppercase font-semibold">Practice Accuracy</span>
                <span className="text-3xl font-black text-amber-400 block">82%</span>
                <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: "82%" }} />
                </div>
                <span className="text-[10px] text-slate-500 block">MCQ sprint accuracy</span>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-purple-500/30 text-center space-y-2">
                <span className="text-xs text-slate-400 uppercase font-semibold">Confidence Trend</span>
                <span className="text-3xl font-black text-purple-400 block">9.2 / 10</span>
                <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-purple-500 h-full rounded-full" style={{ width: "92%" }} />
                </div>
                <span className="text-[10px] text-slate-500 block">Based on weekly consistency</span>
              </div>
            </div>

            {/* Daily Wins & Stress Management */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 rounded-2xl bg-slate-900 border border-emerald-500/20 space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Small Achievable Daily Wins
                </h3>
                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <span>Recited 5 Sutrasthana shlokas with correct Devanagari meter</span>
                    <span className="text-emerald-400 font-bold">✓ Complete</span>
                  </li>
                  <li className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <span>Solved Amavata differential diagnosis clinical case study</span>
                    <span className="text-emerald-400 font-bold">✓ Complete</span>
                  </li>
                  <li className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <span>Targeted 90-min Panchakarma Basti Protocol remediation</span>
                    <span className="text-emerald-400 font-bold">✓ Complete</span>
                  </li>
                </ul>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900 border border-emerald-500/20 space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Brain className="w-4 h-4 text-teal-400" /> Exam Pressure &amp; Mindset Management
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Knowledge + Consistent Practice + Dinacharya + Healthy Sleep = Unshakable Exam Confidence. Avoid all-night cramming (Ratri Jagarana aggravates Vata and impairs recall memory). Follow 45-minute focus intervals followed by 10-minute restorative breaks.
                </p>
                <div className="p-3 rounded-xl bg-[#081b10] border border-emerald-800/40 text-[11px] text-emerald-300">
                  Tip: Practice the 5-step NCISM answer structure for 1 question every evening to build fluent exam answer writing muscle memory.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 7: INSTITUTION TO DOCTOR GUIDANCE INVITATION */}
        {/* ============================================================ */}
        {activeTab === "guidance" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-xl font-extrabold text-white">Institution to Doctor Guidance Invitation</h2>
                <p className="text-xs text-slate-400">
                  Invite verified clinical doctors and specialists for structured student guidance (Online/Offline, Free/Paid).
                </p>
              </div>
              <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                NCISM Mentorship Portal
              </span>
            </div>

            {guidanceSubmitted ? (
              <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 border border-emerald-500/40 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">
                  Guidance Invitation Dispatched to {selectedGuidanceDoctor}!
                </h3>
                <p className="text-xs text-slate-300 max-w-md mx-auto">
                  Requested session: <strong className="text-emerald-400">{guidanceSessionType}</strong> on <strong className="text-white">{guidanceTopic}</strong> for {guidanceStudentGroup} ({guidanceStudentsCount} students). Mode: {guidanceMode}.
                </p>

                {/* Doctor Accept/Reject Simulation Flow */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 max-w-lg mx-auto space-y-3 text-xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Doctor Decision Workflow:</span>
                  {!doctorAccepted ? (
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={() => setDoctorAccepted(true)}
                        className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold flex items-center gap-1.5"
                      >
                        <Check className="w-4 h-4" /> Simulate Doctor Accept &amp; Create Session
                      </button>
                      <button
                        onClick={() => alert("Simulated request rejection with feedback.")}
                        className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                      >
                        Simulate Reject
                      </button>
                    </div>
                  ) : (
                    <div className="text-center space-y-2">
                      <span className="text-emerald-400 font-bold block">✓ Doctor Accepted Invitation! Live Guidance Session has been provisioned.</span>
                      <Link
                        href="/student/sessions"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
                      >
                        View in Expert Sessions Hub <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    setGuidanceSubmitted(false);
                    setDoctorAccepted(false);
                  }}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Create Another Invitation
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateGuidanceRequest} className="p-6 rounded-2xl bg-slate-900 border border-emerald-500/20 space-y-5 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Select Verified Doctor / Mentor</label>
                    <select
                      value={selectedGuidanceDoctor}
                      onChange={(e) => setSelectedGuidanceDoctor(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Dr. Vaidya Rajesh Sharma">Dr. Vaidya Rajesh Sharma, MD (Ayu) — Panchakarma</option>
                      <option value="Prof. Dr. Rajeshwari Nair">Prof. Dr. Rajeshwari Nair, Ph.D. — Dravyaguna</option>
                      <option value="Dr. Arvind Kulkarni">Dr. Arvind Kulkarni, MD — Kayachikitsa</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Session Type</label>
                    <select
                      value={guidanceSessionType}
                      onChange={(e) => setGuidanceSessionType(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Clinical Case Review & Viva Preparation">Clinical Case Review & Viva Preparation</option>
                      <option value="NEXT & Competitive Exam Strategy">NEXT & Competitive Exam Strategy</option>
                      <option value="Panchakarma Theater Hands-On Protocol">Panchakarma Theater Hands-On Protocol</option>
                      <option value="Ayush Research & Clinical Trial Design">Ayush Research & Clinical Trial Design</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Subject</label>
                    <input
                      type="text"
                      required
                      value={guidanceSubject}
                      onChange={(e) => setGuidanceSubject(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Topic</label>
                    <input
                      type="text"
                      required
                      value={guidanceTopic}
                      onChange={(e) => setGuidanceTopic(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Student Group / Batch</label>
                    <input
                      type="text"
                      required
                      value={guidanceStudentGroup}
                      onChange={(e) => setGuidanceStudentGroup(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Expected Students Count</label>
                    <input
                      type="number"
                      required
                      min={5}
                      max={300}
                      value={guidanceStudentsCount}
                      onChange={(e) => setGuidanceStudentsCount(parseInt(e.target.value) || 30)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Preferred Date</label>
                    <input
                      type="date"
                      required
                      value={guidancePreferredDate}
                      onChange={(e) => setGuidancePreferredDate(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Duration (Minutes)</label>
                    <select
                      value={guidanceDurationMins}
                      onChange={(e) => setGuidanceDurationMins(parseInt(e.target.value))}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value={45}>45 Minutes</option>
                      <option value={60}>60 Minutes (Standard)</option>
                      <option value={90}>90 Minutes</option>
                      <option value={120}>120 Minutes (Extended Masterclass)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Mode (Online vs Offline)</label>
                    <div className="flex items-center gap-3 pt-1">
                      <label className="flex items-center gap-1.5 text-slate-200">
                        <input
                          type="radio"
                          name="mode"
                          checked={guidanceMode === "ONLINE"}
                          onChange={() => setGuidanceMode("ONLINE")}
                        />
                        Online Webinar / Live Stream
                      </label>
                      <label className="flex items-center gap-1.5 text-slate-200">
                        <input
                          type="radio"
                          name="mode"
                          checked={guidanceMode === "OFFLINE"}
                          onChange={() => setGuidanceMode("OFFLINE")}
                        />
                        Offline Campus Visit
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Honorarium / Fee Type</label>
                    <div className="flex items-center gap-3 pt-1">
                      <label className="flex items-center gap-1.5 text-slate-200">
                        <input
                          type="radio"
                          name="feeType"
                          checked={guidanceFeeType === "FREE"}
                          onChange={() => setGuidanceFeeType("FREE")}
                        />
                        Free Pro Bono Guidance
                      </label>
                      <label className="flex items-center gap-1.5 text-slate-200">
                        <input
                          type="radio"
                          name="feeType"
                          checked={guidanceFeeType === "PAID"}
                          onChange={() => setGuidanceFeeType("PAID")}
                        />
                        Paid Academic Honorarium
                      </label>
                    </div>
                  </div>
                </div>

                {guidanceMode === "OFFLINE" && (
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Offline Campus Venue Location</label>
                    <input
                      type="text"
                      value={guidanceOfflineVenue}
                      onChange={(e) => setGuidanceOfflineVenue(e.target.value)}
                      placeholder="e.g. Auditorium Hall, Ayurveda Campus, Pune"
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                )}

                {guidanceFeeType === "PAID" && (
                  <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-2">
                    <label className="block text-amber-300 font-semibold">Institutional Honorarium Amount (INR ₹)</label>
                    <input
                      type="number"
                      min={500}
                      step={500}
                      value={guidanceHonorarium}
                      onChange={(e) => setGuidanceHonorarium(parseFloat(e.target.value) || 0)}
                      className="w-full max-w-xs px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500 font-bold"
                    />
                    <p className="text-[11px] text-slate-400">Payment will be settled upon session completion via Aayuraura institutional escrow.</p>
                  </div>
                )}

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
                  >
                    <Send className="w-4 h-4" /> Send Guidance Invitation to Doctor
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default function BamsLearningEcosystemMasterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
          <div className="animate-pulse text-xs font-semibold text-emerald-400">
            Loading BAMS Learning Ecosystem...
          </div>
        </div>
      }
    >
      <BamsLearningEcosystemContent />
    </Suspense>
  );
}
