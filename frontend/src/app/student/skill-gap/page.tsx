"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Target,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Search,
  Filter,
  ArrowRight,
  TrendingDown,
  RefreshCw,
  Award,
  Layers,
  ChevronRight,
  BookOpen
} from "lucide-react";

import { api } from "@/lib/api";
import { isDemoEmail } from "@/lib/demoData";

interface CareerRoleSimple {
  id: string;
  name: string;
  slug: string;
  category?: string;
}

interface SkillGapItem {
  skill_id: string;
  skill_name: string;
  category: string;
  current_score: number | null;
  required_score: number;
  gap: number;
  classification: "MASTERED" | "ADEQUATE" | "WEAK" | "MISSING";
  priority: "NONE" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  importance: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  is_required: boolean;
}

interface SkillGapSummary {
  total_required_skills: number;
  mastered: number;
  adequate: number;
  weak: number;
  missing: number;
  critical_gaps: number;
  high_priority_gaps: number;
  overall_gap_percentage: number;
}

interface SkillGapReport {
  career_role: CareerRoleSimple | null;
  summary: SkillGapSummary;
  skills: SkillGapItem[];
  generated_at: string;
}

const DEMO_SKILL_GAP_REPORT: SkillGapReport = {
  career_role: {
    id: "demo-role-1",
    name: "Ayurvedic Clinical Specialist & Panchakarma Consultant",
    slug: "ayurvedic-clinical-specialist",
    category: "Clinical Practice & Hospital Medicine"
  },
  summary: {
    total_required_skills: 8,
    mastered: 2,
    adequate: 3,
    weak: 2,
    missing: 1,
    critical_gaps: 2,
    high_priority_gaps: 3,
    overall_gap_percentage: 24.5
  },
  skills: [
    {
      skill_id: "s1",
      skill_name: "Nadi Pariksha (Pulse Diagnosis)",
      category: "Clinical Diagnostics",
      current_score: 88,
      required_score: 90,
      gap: 2,
      classification: "ADEQUATE",
      priority: "LOW",
      importance: "CRITICAL",
      is_required: true
    },
    {
      skill_id: "s2",
      skill_name: "Dravyaguna Pharmacology & Rasa Shastra",
      category: "Therapeutics & Formulations",
      current_score: 92,
      required_score: 85,
      gap: 0,
      classification: "MASTERED",
      priority: "NONE",
      importance: "HIGH",
      is_required: true
    },
    {
      skill_id: "s3",
      skill_name: "Panchakarma Vamana & Virechana Protocols",
      category: "Detoxification Therapies",
      current_score: 85,
      required_score: 88,
      gap: 3,
      classification: "ADEQUATE",
      priority: "MEDIUM",
      importance: "HIGH",
      is_required: true
    },
    {
      skill_id: "s4",
      skill_name: "Ayurvedic Formulation Standardization & HPTLC",
      category: "Research & Pharmacology",
      current_score: 62,
      required_score: 80,
      gap: 18,
      classification: "WEAK",
      priority: "CRITICAL",
      importance: "HIGH",
      is_required: true
    },
    {
      skill_id: "s5",
      skill_name: "Clinical Case Documentation (Ayush Grid / EMR)",
      category: "Healthcare Informatics",
      current_score: 90,
      required_score: 80,
      gap: 0,
      classification: "MASTERED",
      priority: "NONE",
      importance: "MEDIUM",
      is_required: true
    },
    {
      skill_id: "s6",
      skill_name: "Charaka & Sushruta Samhita Classical Interpretation",
      category: "Classical Foundations",
      current_score: 74,
      required_score: 85,
      gap: 11,
      classification: "WEAK",
      priority: "HIGH",
      importance: "HIGH",
      is_required: true
    },
    {
      skill_id: "s7",
      skill_name: "Ayurvedic Herb-Drug Interaction Screening",
      category: "Pharmacovigilance",
      current_score: 72,
      required_score: 75,
      gap: 3,
      classification: "ADEQUATE",
      priority: "LOW",
      importance: "MEDIUM",
      is_required: true
    },
    {
      skill_id: "s8",
      skill_name: "Suvarnaprashan & Kaumarbhritya Protocols",
      category: "Pediatric Ayurveda",
      current_score: null,
      required_score: 75,
      gap: 75,
      classification: "MISSING",
      priority: "CRITICAL",
      importance: "HIGH",
      is_required: true
    }
  ],
  generated_at: new Date().toISOString()
};

export default function SkillGapPage() {
  const [report, setReport] = useState<SkillGapReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [noTargetCareer, setNoTargetCareer] = useState(false);
  const [isDemoActive, setIsDemoActive] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  const loadDemoData = () => {
    setReport(DEMO_SKILL_GAP_REPORT);
    setNoTargetCareer(false);
    setError(null);
    setIsDemoActive(true);
  };

  const fetchSkillGaps = async () => {
    try {
      setLoading(true);
      setError(null);
      setNoTargetCareer(false);

      const userEmail = typeof window !== "undefined" ? localStorage.getItem("ayursetu_user_email") || "" : "";
      const isDemo = isDemoEmail(userEmail);

      const res = await api.get("/students/me/skill-gap");
      if (res.data) {
        setReport(res.data);
      }
    } catch (err: any) {
      console.error("Error fetching skill gaps:", err);
      const detail = err.response?.data?.detail;

      if (detail && detail.toLowerCase().includes("no target career")) {
        setNoTargetCareer(true);
        return;
      }

      const userEmail = typeof window !== "undefined" ? localStorage.getItem("ayursetu_user_email") || "" : "";
      const isDemo = isDemoEmail(userEmail);
      if (isDemo) {
        loadDemoData();
        return;
      }

      setError(detail || err.message || "Failed to load skill gap report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkillGaps();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F9F4] dark:bg-[#0D1511] py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
        <div className="max-w-7xl mx-auto space-y-8 animate-pulse">
          <div className="h-44 bg-[#DCEBE1] dark:bg-[#294637] rounded-3xl" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 bg-[#FFFFFF] dark:bg-[#17211B] rounded-2xl border border-[#D5DED8] dark:border-[#304036]" />
            ))}
          </div>
          <div className="h-96 bg-[#FFFFFF] dark:bg-[#17211B] rounded-3xl border border-[#D5DED8] dark:border-[#304036]" />
        </div>
      </div>
    );
  }

  if (noTargetCareer) {
    return (
      <div className="min-h-screen bg-[#F7F9F4] dark:bg-[#0D1511] text-[#17231C] dark:text-[#F1F6F2] py-16 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-500/10 border border-[#A96F16]/30 dark:border-[#E5B85C]/30 flex items-center justify-center text-[#A96F16] dark:text-[#E5B85C] shadow-inner">
            <Target className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-serif font-bold text-[#142019] dark:text-[#FFFFFF]">Select Your Target Career</h1>
            <p className="text-[#526158] dark:text-[#C1CEC5] max-w-md mx-auto">
              Before analyzing your skill gaps, please select the career path you want to prepare for.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/student/career"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#2F6B4F] hover:bg-[#24563F] text-white dark:bg-[#78B895] dark:hover:bg-[#91CAA8] dark:text-[#0D1511] font-medium shadow-md transition-all hover:gap-3"
            >
              <span>Choose Target Career</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              onClick={loadDemoData}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#EEF4EF] dark:bg-[#223128] hover:bg-[#DCEBE1] dark:hover:bg-[#294637] text-[#A96F16] dark:text-[#E5B85C] font-semibold border border-[#D5DED8] dark:border-[#304036] shadow-sm transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#A96F16] dark:text-[#E5B85C]" />
              <span>Preview Demo BAMS Gap Analysis</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-[#F7F9F4] dark:bg-[#0D1511] text-[#17231C] dark:text-[#F1F6F2] py-16 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
        <div className="max-w-md mx-auto text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-[#B64040] dark:text-[#F18484] flex items-center justify-center">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-[#142019] dark:text-[#FFFFFF]">{error || "Something went wrong"}</h2>
          <button
            onClick={fetchSkillGaps}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2F6B4F] hover:bg-[#24563F] text-white dark:bg-[#78B895] dark:hover:bg-[#91CAA8] dark:text-[#0D1511] font-medium transition-colors shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    );
  }

  // Filter skills
  const filteredSkills = report.skills.filter((sk) => {
    const matchesSearch = sk.skill_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || sk.classification === statusFilter;
    const matchesPriority = priorityFilter === "ALL" || sk.priority === priorityFilter;
    const matchesCategory = categoryFilter === "ALL" || sk.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "MASTERED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Mastered
          </span>
        );
      case "ADEQUATE":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Adequate
          </span>
        );
      case "WEAK":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            <AlertTriangle className="w-3.5 h-3.5" />
            Weak
          </span>
        );
      case "MISSING":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-900">
            <AlertCircle className="w-3.5 h-3.5" />
            Missing
          </span>
        );
      default:
        return null;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "CRITICAL":
        return (
          <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-900">
            CRITICAL
          </span>
        );
      case "HIGH":
        return (
          <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            HIGH
          </span>
        );
      case "MEDIUM":
        return (
          <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
            MEDIUM
          </span>
        );
      case "LOW":
        return (
          <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-[#EEF4EF] dark:bg-[#223128] text-[#526158] dark:text-[#C1CEC5] border border-[#D5DED8] dark:border-[#304036]">
            LOW
          </span>
        );
      case "NONE":
        return (
          <span className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-[#DCEBE1] dark:bg-[#294637] text-[#2F6B4F] dark:text-[#78B895]">
            NONE
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9F4] dark:bg-[#0D1511] text-[#17231C] dark:text-[#F1F6F2] py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Demo Mode Notice */}
        {isDemoActive && (
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-[#A96F16]/30 text-[#A96F16] dark:text-[#E5B85C] flex flex-wrap items-center justify-between gap-3 text-sm shadow-sm">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#A96F16] dark:text-[#E5B85C] shrink-0" />
              <span>
                <strong>Demo Mode Active:</strong> Displaying realistic Ayurvedic Clinical Specialist skill gap intelligence for BAMS 3rd Year.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/demo/profile"
                className="text-xs px-3 py-1.5 rounded-lg bg-amber-200 dark:bg-amber-900/60 hover:bg-amber-300 text-amber-950 dark:text-amber-200 font-semibold transition-colors"
              >
                Demo Hub
              </Link>
              <Link
                href="/student/career"
                className="text-xs px-3 py-1.5 rounded-lg bg-[#2F6B4F] hover:bg-[#24563F] text-white dark:bg-[#78B895] dark:hover:bg-[#91CAA8] dark:text-[#0D1511] font-semibold transition-colors shadow-sm"
              >
                Set Official Career
              </Link>
            </div>
          </div>
        )}

        {/* Header / Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#2F6B4F] via-[#24563F] to-[#17231C] text-white p-8 shadow-xl border border-[#2F6B4F]/40">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800/60 border border-emerald-700/50 text-xs font-medium text-amber-300">
                <Sparkles className="w-3.5 h-3.5" />
                <span>FR-04 Skill Gap Intelligence</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight">
                Target Skill Gap Analysis
              </h1>
              <p className="text-emerald-100/90 text-sm sm:text-base">
                Target Career:{" "}
                <span className="font-semibold text-amber-300">
                  {report.career_role?.name || "Not Selected"}
                </span>
              </p>
              <p className="text-xs text-emerald-200/80">
                Calculates required-vs-current score alignment for your chosen Ayush career path.
              </p>
            </div>

            {/* Overall Gap Metric Badge */}
            <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-black/25 border border-white/20 backdrop-blur-sm min-w-[200px] text-center space-y-1">
              <span className="text-xs font-medium uppercase tracking-wider text-amber-200/90">
                Overall Skill Gap
              </span>
              <div className="flex items-baseline gap-1 text-4xl font-extrabold text-amber-300 font-serif">
                <span>{report.summary.overall_gap_percentage}%</span>
              </div>
              <span className="text-[11px] text-emerald-100/80">
                Points below target requirement
              </span>
              <Link
                href="/student/career"
                className="mt-2 text-xs text-amber-300 hover:text-amber-200 font-medium underline underline-offset-4 flex items-center gap-1"
              >
                <span>Change Career</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Metric Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[#526158] dark:text-[#C1CEC5] uppercase tracking-wider">Mastered</p>
              <p className="text-2xl font-bold font-serif text-[#142019] dark:text-[#FFFFFF] mt-1">{report.summary.mastered}</p>
              <p className="text-[11px] text-[#2F7D4A] dark:text-[#7BC894]">Current ≥ Required</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-[#2F7D4A] dark:text-[#7BC894] flex items-center justify-center font-bold">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[#526158] dark:text-[#C1CEC5] uppercase tracking-wider">Adequate</p>
              <p className="text-2xl font-bold font-serif text-[#142019] dark:text-[#FFFFFF] mt-1">{report.summary.adequate}</p>
              <p className="text-[11px] text-[#356F9D] dark:text-[#80B5DD]">Gap ≤ 10 points</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-[#356F9D] dark:text-[#80B5DD] flex items-center justify-center font-bold">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[#526158] dark:text-[#C1CEC5] uppercase tracking-wider">Weak</p>
              <p className="text-2xl font-bold font-serif text-[#142019] dark:text-[#FFFFFF] mt-1">{report.summary.weak}</p>
              <p className="text-[11px] text-[#A96F16] dark:text-[#E5B85C]">Gap &gt; 10 points</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-[#A96F16] dark:text-[#E5B85C] flex items-center justify-center font-bold">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[#526158] dark:text-[#C1CEC5] uppercase tracking-wider">Missing</p>
              <p className="text-2xl font-bold font-serif text-[#142019] dark:text-[#FFFFFF] mt-1">{report.summary.missing}</p>
              <p className="text-[11px] text-[#B64040] dark:text-[#F18484]">Unassessed required</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-[#B64040] dark:text-[#F18484] flex items-center justify-center font-bold">
              <AlertCircle className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Priority Gaps Section */}
        {report.skills.filter(s => s.priority === "CRITICAL" || s.priority === "HIGH").length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-serif font-bold text-[#142019] dark:text-[#FFFFFF] flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-[#A96F16] dark:text-[#E5B85C]" />
                <span>Priority Skill Gaps</span>
              </h2>
              <span className="text-xs font-medium text-[#526158] dark:text-[#C1CEC5]">
                Action required for target role alignment
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {report.skills
                .filter(s => s.priority === "CRITICAL" || s.priority === "HIGH")
                .map((sk) => (
                  <div
                    key={sk.skill_id}
                    className="p-5 rounded-2xl bg-[#FFFFFF] dark:bg-[#17211B] border border-[#A96F16]/30 dark:border-[#E5B85C]/30 shadow-sm hover:shadow-md transition-shadow space-y-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-[#142019] dark:text-[#FFFFFF] text-base">{sk.skill_name}</h3>
                        <p className="text-xs text-[#526158] dark:text-[#C1CEC5] capitalize">{sk.category.toLowerCase().replace("_", " ")}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {getPriorityBadge(sk.priority)}
                        {getStatusBadge(sk.classification)}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-[#17231C] dark:text-[#F1F6F2]">
                          Current: {sk.current_score !== null ? `${sk.current_score}%` : "Not Assessed"}
                        </span>
                        <span className="text-[#2F6B4F] dark:text-[#78B895]">
                          Required: {sk.required_score}%
                        </span>
                      </div>

                      {/* Progress Comparison Bars */}
                      <div className="space-y-1.5">
                        <div className="w-full h-2.5 bg-[#EEF4EF] dark:bg-[#223128] rounded-full overflow-hidden flex">
                          <div
                            className="bg-[#2F6B4F] dark:bg-[#78B895] h-full rounded-full transition-all"
                            style={{ width: `${Math.min(sk.current_score || 0, 100)}%` }}
                          />
                        </div>
                        <div className="w-full h-1.5 bg-amber-100 dark:bg-amber-950/40 rounded-full overflow-hidden">
                          <div
                            className="bg-[#A96F16] dark:bg-[#E5B85C] h-full rounded-full"
                            style={{ width: `${Math.min(sk.required_score, 100)}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1">
                        <span className="text-[#526158] dark:text-[#C1CEC5] font-medium">
                          Gap: <span className="font-bold text-[#A96F16] dark:text-[#E5B85C]">{sk.gap} points</span>
                        </span>
                        <span className="text-[#68776D] dark:text-[#98A99E] font-medium">
                          Importance: {sk.importance}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Detailed Skill Gap Matrix Section */}
        <div className="bg-[#FFFFFF] dark:bg-[#17211B] rounded-3xl p-6 sm:p-8 border border-[#D5DED8] dark:border-[#304036] shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-[#D5DED8] dark:border-[#304036]">
            <div>
              <h2 className="text-xl font-serif font-bold text-[#142019] dark:text-[#FFFFFF]">All Required Skills Comparison</h2>
              <p className="text-xs text-[#526158] dark:text-[#C1CEC5]">
                Detailed comparison of current score vs target role requirement
              </p>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#68776D] dark:text-[#98A99E]" />
                <input
                  type="text"
                  placeholder="Search skill..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#F7F9F4] dark:bg-[#1D2A22] border border-[#D5DED8] dark:border-[#304036] text-xs font-medium text-[#17231C] dark:text-[#F1F6F2] focus:outline-none focus:border-[#2F6B4F] dark:focus:border-[#78B895]"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-[#F7F9F4] dark:bg-[#1D2A22] border border-[#D5DED8] dark:border-[#304036] text-xs font-medium text-[#17231C] dark:text-[#F1F6F2] focus:outline-none focus:border-[#2F6B4F] dark:focus:border-[#78B895]"
              >
                <option value="ALL">All Statuses</option>
                <option value="MASTERED">Mastered</option>
                <option value="ADEQUATE">Adequate</option>
                <option value="WEAK">Weak</option>
                <option value="MISSING">Missing</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-[#F7F9F4] dark:bg-[#1D2A22] border border-[#D5DED8] dark:border-[#304036] text-xs font-medium text-[#17231C] dark:text-[#F1F6F2] focus:outline-none focus:border-[#2F6B4F] dark:focus:border-[#78B895]"
              >
                <option value="ALL">All Priorities</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
          </div>

          {/* Table / List */}
          {filteredSkills.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <HelpCircle className="w-10 h-10 mx-auto text-[#68776D] dark:text-[#98A99E]" />
              <p className="text-sm font-medium text-[#526158] dark:text-[#C1CEC5]">No skill gaps match your filter criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-[#D5DED8] dark:border-[#304036]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#EEF4EF] dark:bg-[#223128] border-b border-[#D5DED8] dark:border-[#304036] text-xs font-semibold text-[#526158] dark:text-[#C1CEC5] uppercase tracking-wider">
                    <th className="py-3 px-4">Skill Name</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4 text-center">Current</th>
                    <th className="py-3 px-4 text-center">Required</th>
                    <th className="py-3 px-4 text-center">Gap</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Priority</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D5DED8] dark:divide-[#304036] text-sm">
                  {filteredSkills.map((sk) => (
                    <tr key={sk.skill_id} className="hover:bg-[#F7F9F4] dark:hover:bg-[#1D2A22]/50 transition-colors">
                      <td className="py-4 px-4 font-semibold text-[#142019] dark:text-[#FFFFFF]">
                        {sk.skill_name}
                      </td>
                      <td className="py-4 px-4 text-xs font-medium text-[#526158] dark:text-[#C1CEC5] capitalize">
                        {sk.category.toLowerCase().replace("_", " ")}
                      </td>
                      <td className="py-4 px-4 text-center font-bold text-[#142019] dark:text-[#FFFFFF]">
                        {sk.current_score !== null ? `${sk.current_score}%` : <span className="text-[#B64040] dark:text-[#F18484] font-normal">Unassessed</span>}
                      </td>
                      <td className="py-4 px-4 text-center font-bold text-[#2F6B4F] dark:text-[#78B895]">
                        {sk.required_score}%
                      </td>
                      <td className="py-4 px-4 text-center font-bold text-[#A96F16] dark:text-[#E5B85C]">
                        {sk.gap > 0 ? `${sk.gap} pts` : "0"}
                      </td>
                      <td className="py-4 px-4 text-center">
                        {getStatusBadge(sk.classification)}
                      </td>
                      <td className="py-4 px-4 text-center">
                        {getPriorityBadge(sk.priority)}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <Link
                          href={`/student/ecosystem?tab=pipeline&skill=${encodeURIComponent(sk.skill_name)}`}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-[#2F6B4F] hover:bg-[#24563F] text-white dark:bg-[#78B895] dark:hover:bg-[#91CAA8] dark:text-[#0D1511] text-xs font-semibold transition-colors shadow-sm"
                        >
                          <span>Remediate</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Next Stage Readiness Banner */}
        <div className="rounded-3xl bg-amber-500/10 dark:bg-amber-950/30 border border-[#A96F16]/30 dark:border-[#E5B85C]/30 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-[#A96F16] dark:text-[#E5B85C] flex items-center justify-center shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-serif font-bold text-[#142019] dark:text-[#FFFFFF] text-lg">Next Step: Skill Gap Bridging &amp; BAMS Remediation</h3>
              <p className="text-xs text-[#526158] dark:text-[#C1CEC5] max-w-2xl">
                Bridge your identified gaps with NCISM BAMS structured curriculum, classical shlokas, procedural diagrams, voice readers, clinical case studies, and live doctor guidance.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/student/ecosystem?tab=pipeline"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#A96F16] hover:bg-[#8A5B12] text-white dark:bg-[#E5B85C] dark:hover:bg-[#F0C973] dark:text-[#0D1511] font-bold text-xs transition-colors shadow-sm"
            >
              <Sparkles className="w-4 h-4" />
              <span>Launch BAMS Remediation</span>
            </Link>
            <Link
              href="/student/assessments"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#EEF4EF] dark:bg-[#223128] hover:bg-[#DCEBE1] dark:hover:bg-[#294637] text-[#17231C] dark:text-[#F1F6F2] font-medium text-xs border border-[#D5DED8] dark:border-[#304036] transition-colors"
            >
              <span>Retake Skill Assessment</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
