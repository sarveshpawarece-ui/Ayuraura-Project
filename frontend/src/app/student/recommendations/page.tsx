"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Target,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  ExternalLink,
  Trash2,
  RefreshCw,
  Search,
  Filter,
  Clock,
  Award,
  Layers,
  HelpCircle,
  ChevronRight,
  Zap,
  Tag
} from "lucide-react";

import { api } from "@/lib/api";
import { isDemoEmail } from "@/lib/demoData";

interface CareerRoleSimple {
  id: string;
  name: string;
  slug: string;
  category?: string;
}

interface LearningResource {
  id: string;
  title: string;
  description?: string;
  resource_type: string;
  provider: string;
  url?: string;
  thumbnail_url?: string;
  difficulty?: string;
  estimated_hours?: number;
  price_type?: string;
  language: string;
}

interface RecommendationItem {
  id: string;
  skill_id: string;
  skill_name: string;
  current_score: number | null;
  required_score: number;
  gap: number;
  classification: string;
  priority: "NONE" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  relevance_score: number;
  reason: string;
  resource: LearningResource;
  status: string;
  generated_at: string;
}

interface RecommendationSummary {
  total_recommendations: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
}

interface RecommendationsReport {
  career_role: CareerRoleSimple | null;
  summary: RecommendationSummary;
  recommendations: RecommendationItem[];
  generated_at: string;
}

const DEMO_RECOMMENDATIONS_REPORT: RecommendationsReport = {
  career_role: {
    id: "demo-role-1",
    name: "Ayurvedic Clinical Specialist & Panchakarma Consultant",
    slug: "ayurvedic-clinical-specialist",
    category: "Clinical Practice & Hospital Medicine"
  },
  summary: {
    total_recommendations: 4,
    critical: 2,
    high: 1,
    medium: 1,
    low: 0
  },
  recommendations: [
    {
      id: "demo-rec-1",
      skill_id: "s4",
      skill_name: "Ayurvedic Formulation Standardization & HPTLC",
      current_score: 62,
      required_score: 80,
      gap: 18,
      classification: "WEAK",
      priority: "CRITICAL",
      relevance_score: 96,
      reason: "Essential for quality testing classical asava, arishta, and herbal extracts per Ayurvedic Pharmacopoeia of India (API).",
      resource: {
        id: "res-1",
        title: "Standardization of Ayurvedic Formulations & Quality Control",
        description: "Hands-on module covering TLC/HPTLC fingerprinting, heavy metal profiling, and shelf-life analysis.",
        resource_type: "COURSE",
        provider: "National Institute of Ayurveda (NIA) & CCRAS",
        url: "https://ayush.gov.in",
        difficulty: "ADVANCED",
        estimated_hours: 24,
        price_type: "FREE",
        language: "English / Hindi"
      },
      status: "ACTIVE",
      generated_at: new Date().toISOString()
    },
    {
      id: "demo-rec-2",
      skill_id: "s7",
      skill_name: "Emergency Ayurvedic Management & Arishta Lakshana",
      current_score: 55,
      required_score: 75,
      gap: 20,
      classification: "WEAK",
      priority: "CRITICAL",
      relevance_score: 92,
      reason: "Critical clinical competency required during BAMS hospital internship and OPD acute emergency triage.",
      resource: {
        id: "res-2",
        title: "Ayurvedic Acute Care & Prognosis (Arishta Vijnana)",
        description: "Intensive clinical case studies and emergency stabilization protocols in integrated Ayurvedic hospitals.",
        resource_type: "WORKSHOP",
        provider: "All India Institute of Ayurveda (AIIA)",
        url: "https://aiia.gov.in",
        difficulty: "INTERMEDIATE",
        estimated_hours: 16,
        price_type: "FREE",
        language: "English"
      },
      status: "ACTIVE",
      generated_at: new Date().toISOString()
    },
    {
      id: "demo-rec-3",
      skill_id: "s6",
      skill_name: "Charaka & Sushruta Samhita Classical Interpretation",
      current_score: 74,
      required_score: 85,
      gap: 11,
      classification: "WEAK",
      priority: "HIGH",
      relevance_score: 88,
      reason: "Enhances diagnostic precision and classical shloka cross-referencing in clinical practice.",
      resource: {
        id: "res-3",
        title: "Classical Samhita Hermeneutics & Clinical Nidana",
        description: "In-depth textual analysis and clinical correlation of Charaka Samhita Chikitsa Sthana.",
        resource_type: "COURSE",
        provider: "Institute of Teaching and Research in Ayurveda (ITRA)",
        url: "https://itra.edu.in",
        difficulty: "ADVANCED",
        estimated_hours: 30,
        price_type: "FREE",
        language: "Sanskrit / English"
      },
      status: "ACTIVE",
      generated_at: new Date().toISOString()
    },
    {
      id: "demo-rec-4",
      skill_id: "s8",
      skill_name: "Suvarnaprashan & Kaumarbhritya Protocols",
      current_score: null,
      required_score: 75,
      gap: 75,
      classification: "MISSING",
      priority: "MEDIUM",
      relevance_score: 82,
      reason: "Foundational pediatric immunity and wellness protocol administered during Pushya Nakshatra.",
      resource: {
        id: "res-4",
        title: "Kaumarbhritya Clinical Practice & Pediatric Suvarnaprashan",
        description: "Guidelines, gold bhasma quality standards, dosage calculations, and outreach camp execution.",
        resource_type: "PROJECT",
        provider: "Aayuraura Clinical Academy",
        url: "https://aayuraura.in/resources/kaumarbhritya",
        difficulty: "BEGINNER",
        estimated_hours: 12,
        price_type: "FREE",
        language: "English"
      },
      status: "ACTIVE",
      generated_at: new Date().toISOString()
    }
  ],
  generated_at: new Date().toISOString()
};

export default function RecommendationsPage() {
  const [report, setReport] = useState<RecommendationsReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [noTargetCareer, setNoTargetCareer] = useState(false);
  const [isDemoActive, setIsDemoActive] = useState(false);
  const [dismissingId, setDismissingId] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [difficultyFilter, setDifficultyFilter] = useState("ALL");

  const loadDemoData = () => {
    setReport(DEMO_RECOMMENDATIONS_REPORT);
    setNoTargetCareer(false);
    setError(null);
    setIsDemoActive(true);
  };

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);
      setNoTargetCareer(false);

      const userEmail = typeof window !== "undefined" ? localStorage.getItem("ayursetu_user_email") || "" : "";
      const isDemo = isDemoEmail(userEmail);

      const res = await api.get("/students/me/recommendations");
      if (res.data) {
        setReport(res.data);
        setIsDemoActive(false);
      }
    } catch (err: any) {
      if (err.response?.status === 401 && !isDemoEmail(typeof window !== "undefined" ? localStorage.getItem("ayursetu_user_email") || "" : "")) {
        window.location.href = "/login";
        return;
      }

      const detail = err.response?.data?.detail;
      if (err.response?.status === 400 && detail && detail.toLowerCase().includes("target career")) {
        const userEmail = typeof window !== "undefined" ? localStorage.getItem("ayursetu_user_email") || "" : "";
        if (isDemoEmail(userEmail)) {
          loadDemoData();
          return;
        }
        setNoTargetCareer(true);
        setLoading(false);
        return;
      }

      const userEmail = typeof window !== "undefined" ? localStorage.getItem("ayursetu_user_email") || "" : "";
      if (isDemoEmail(userEmail)) {
        loadDemoData();
        return;
      }

      setError(detail || err.message || "Failed to load recommendations");
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = async (recId: string) => {
    setDismissingId(recId);
    try {
      if (isDemoActive || recId.startsWith("demo-")) {
        setReport((prev) => {
          if (!prev) return prev;
          const updatedRecs = prev.recommendations.filter((r) => r.id !== recId);
          return {
            ...prev,
            summary: {
              ...prev.summary,
              total_recommendations: updatedRecs.length
            },
            recommendations: updatedRecs
          };
        });
        return;
      }

      await api.post(`/students/me/recommendations/${recId}/dismiss`);
      setReport((prev) => {
        if (!prev) return prev;
        const updatedRecs = prev.recommendations.filter((r) => r.id !== recId);
        return {
          ...prev,
          summary: {
            ...prev.summary,
            total_recommendations: updatedRecs.length
          },
          recommendations: updatedRecs
        };
      });
    } catch (err) {
      console.error("Failed to dismiss recommendation", err);
    } finally {
      setDismissingId(null);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F9F4] dark:bg-[#0D1511] py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
        <div className="max-w-7xl mx-auto space-y-8 animate-pulse">
          <div className="h-44 bg-[#DCEBE1] dark:bg-[#294637] rounded-3xl" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-[#FFFFFF] dark:bg-[#17211B] rounded-2xl border border-[#D5DED8] dark:border-[#304036]" />
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
              Select your target career path to receive personalized learning resources aimed at bridging your skill gaps.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/student/career"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#2F6B4F] hover:bg-[#24563F] text-white dark:bg-[#78B895] dark:hover:bg-[#91CAA8] dark:text-[#0D1511] font-medium shadow-md transition-all hover:gap-3"
            >
              <span>Choose Target Career</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
            <button
              onClick={loadDemoData}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#EEF4EF] dark:bg-[#223128] hover:bg-[#DCEBE1] dark:hover:bg-[#294637] text-[#A96F16] dark:text-[#E5B85C] font-semibold border border-[#D5DED8] dark:border-[#304036] shadow-sm transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#A96F16] dark:text-[#E5B85C]" />
              <span>Preview Demo Ayurvedic Recommendations</span>
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
            onClick={fetchRecommendations}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2F6B4F] hover:bg-[#24563F] text-white dark:bg-[#78B895] dark:hover:bg-[#91CAA8] dark:text-[#0D1511] font-medium transition-colors shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    );
  }

  // Filter recommendations
  const filteredRecs = report.recommendations.filter((rec) => {
    const matchesSearch =
      rec.resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.skill_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.resource.provider.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === "ALL" || rec.resource.resource_type === typeFilter;
    const matchesPriority = priorityFilter === "ALL" || rec.priority === priorityFilter;
    const matchesDifficulty = difficultyFilter === "ALL" || rec.resource.difficulty === difficultyFilter;

    return matchesSearch && matchesType && matchesPriority && matchesDifficulty;
  });

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "CRITICAL":
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-900">
            CRITICAL PRIORITY
          </span>
        );
      case "HIGH":
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            HIGH PRIORITY
          </span>
        );
      case "MEDIUM":
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
            MEDIUM PRIORITY
          </span>
        );
      case "LOW":
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#EEF4EF] dark:bg-[#223128] text-[#526158] dark:text-[#C1CEC5] border border-[#D5DED8] dark:border-[#304036]">
            LOW PRIORITY
          </span>
        );
      default:
        return null;
    }
  };

  const getResourceTypeBadge = (type: string) => {
    switch (type) {
      case "COURSE":
        return <span className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">Course</span>;
      case "CERTIFICATION":
        return <span className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">Certification</span>;
      case "PROJECT":
        return <span className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-800">Project</span>;
      case "WORKSHOP":
        return <span className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800">Workshop</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-[#EEF4EF] dark:bg-[#223128] text-[#526158] dark:text-[#C1CEC5] border border-[#D5DED8] dark:border-[#304036]">{type}</span>;
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
                <strong>Demo Mode Active:</strong> Displaying curated Ayurvedic learning recommendations for BAMS 3rd Year.
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
                <span>FR-05 Learning Recommendation Engine</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight">
                Personalized Learning Recommendations
              </h1>
              <p className="text-emerald-100/90 text-sm sm:text-base">
                Target Career:{" "}
                <span className="font-semibold text-amber-300">
                  {report.career_role?.name || "Not Selected"}
                </span>
              </p>
              <p className="text-xs text-emerald-200/80">
                Curated learning resources, courses, projects, and workshops mapped directly to bridge your identified skill gaps.
              </p>
            </div>

            <button
              onClick={fetchRecommendations}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium border border-white/20 shadow-md transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh Recommendations</span>
            </button>
          </div>
        </div>

        {/* Metric Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[#526158] dark:text-[#C1CEC5] uppercase tracking-wider">Total Recommended</p>
              <p className="text-2xl font-bold font-serif text-[#142019] dark:text-[#FFFFFF] mt-1">{report.summary.total_recommendations}</p>
              <p className="text-[11px] text-[#2F6B4F] dark:text-[#78B895]">Active resources</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-[#2F6B4F] dark:text-[#78B895] flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[#526158] dark:text-[#C1CEC5] uppercase tracking-wider">Critical Priority</p>
              <p className="text-2xl font-bold font-serif text-[#142019] dark:text-[#FFFFFF] mt-1">{report.summary.critical}</p>
              <p className="text-[11px] text-[#B64040] dark:text-[#F18484]">Urgent gap focus</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-[#B64040] dark:text-[#F18484] flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[#526158] dark:text-[#C1CEC5] uppercase tracking-wider">High Priority</p>
              <p className="text-2xl font-bold font-serif text-[#142019] dark:text-[#FFFFFF] mt-1">{report.summary.high}</p>
              <p className="text-[11px] text-[#A96F16] dark:text-[#E5B85C]">Strong recommendation</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-[#A96F16] dark:text-[#E5B85C] flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[#526158] dark:text-[#C1CEC5] uppercase tracking-wider">Medium Priority</p>
              <p className="text-2xl font-bold font-serif text-[#142019] dark:text-[#FFFFFF] mt-1">{report.summary.medium}</p>
              <p className="text-[11px] text-[#356F9D] dark:text-[#80B5DD]">Secondary recommendation</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-[#356F9D] dark:text-[#80B5DD] flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-[#FFFFFF] dark:bg-[#17211B] rounded-2xl p-4 border border-[#D5DED8] dark:border-[#304036] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="relative flex-1 w-full md:w-auto">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#68776D] dark:text-[#98A99E]" />
            <input
              type="text"
              placeholder="Search resource, skill, or provider..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#F7F9F4] dark:bg-[#1D2A22] border border-[#D5DED8] dark:border-[#304036] text-xs font-medium text-[#17231C] dark:text-[#F1F6F2] focus:outline-none focus:border-[#2F6B4F] dark:focus:border-[#78B895]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-[#F7F9F4] dark:bg-[#1D2A22] border border-[#D5DED8] dark:border-[#304036] text-xs font-medium text-[#17231C] dark:text-[#F1F6F2] focus:outline-none focus:border-[#2F6B4F] dark:focus:border-[#78B895]"
            >
              <option value="ALL">All Types</option>
              <option value="COURSE">Course</option>
              <option value="CERTIFICATION">Certification</option>
              <option value="PROJECT">Project</option>
              <option value="WORKSHOP">Workshop</option>
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

            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-[#F7F9F4] dark:bg-[#1D2A22] border border-[#D5DED8] dark:border-[#304036] text-xs font-medium text-[#17231C] dark:text-[#F1F6F2] focus:outline-none focus:border-[#2F6B4F] dark:focus:border-[#78B895]"
            >
              <option value="ALL">All Difficulties</option>
              <option value="EASY">Easy / Beginner</option>
              <option value="MEDIUM">Medium / Intermediate</option>
              <option value="HARD">Hard / Advanced</option>
            </select>
          </div>
        </div>

        {/* Recommendations List / Grid */}
        {filteredRecs.length === 0 ? (
          <div className="bg-[#FFFFFF] dark:bg-[#17211B] rounded-3xl p-12 text-center space-y-4 border border-[#D5DED8] dark:border-[#304036] shadow-sm">
            <HelpCircle className="w-12 h-12 mx-auto text-[#68776D] dark:text-[#98A99E]" />
            <div className="space-y-1">
              <h3 className="text-lg font-serif font-bold text-[#142019] dark:text-[#FFFFFF]">No Recommendations Found</h3>
              <p className="text-xs text-[#526158] dark:text-[#C1CEC5] max-w-md mx-auto">
                {report.summary.total_recommendations === 0
                  ? "All your assessed skills currently meet the target requirements for your career!"
                  : "No learning resources match your current search and filter parameters."}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredRecs.map((rec) => (
              <div
                key={rec.id}
                className="bg-[#FFFFFF] dark:bg-[#17211B] rounded-3xl p-6 border border-[#D5DED8] dark:border-[#304036] shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-5"
              >
                <div className="space-y-4">
                  {/* Card Header: Type, Priority, Relevance */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      {getResourceTypeBadge(rec.resource.resource_type)}
                      {getPriorityBadge(rec.priority)}
                    </div>
                    <div className="px-3 py-1 rounded-full bg-[#DCEBE1] dark:bg-[#294637] text-[#2F6B4F] dark:text-[#78B895] font-serif text-xs font-bold shrink-0 border border-[#D5DED8] dark:border-[#304036]">
                      {rec.relevance_score}% Relevance
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-1">
                    <h3 className="text-lg font-serif font-bold text-[#142019] dark:text-[#FFFFFF] hover:text-[#2F6B4F] dark:hover:text-[#78B895] transition-colors">
                      {rec.resource.title}
                    </h3>
                    <p className="text-xs text-[#526158] dark:text-[#C1CEC5] leading-relaxed line-clamp-2">
                      {rec.resource.description}
                    </p>
                  </div>

                  {/* Skill Gap Traceability Reference */}
                  <div className="p-3.5 rounded-2xl bg-[#F7F9F4] dark:bg-[#1D2A22] border border-[#D5DED8] dark:border-[#304036] space-y-2">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="text-[#142019] dark:text-[#FFFFFF] font-bold">Addresses Skill: {rec.skill_name}</span>
                      <span className="text-[#A96F16] dark:text-[#E5B85C] font-bold">Gap: {rec.gap} pts</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-[#526158] dark:text-[#C1CEC5]">
                      <span>Current: {rec.current_score !== null ? `${rec.current_score}%` : "Not Assessed"}</span>
                      <span>Target Required: {rec.required_score}%</span>
                    </div>
                  </div>

                  {/* Explanation Reason */}
                  <div className="text-xs text-[#17231C] dark:text-[#F1F6F2] bg-amber-500/10 dark:bg-amber-950/30 p-3 rounded-xl border border-[#A96F16]/20 dark:border-[#E5B85C]/20 italic">
                    &ldquo;{rec.reason}&rdquo;
                  </div>

                  {/* Meta badges: Provider, Difficulty, Effort, Price */}
                  <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-[#526158] dark:text-[#C1CEC5] pt-1">
                    <span className="flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-[#2F6B4F] dark:text-[#78B895]" />
                      {rec.resource.provider}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#2F6B4F] dark:text-[#78B895]" />
                      ~{rec.resource.estimated_hours || 10} hours
                    </span>
                    <span className="flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5 text-[#2F6B4F] dark:text-[#78B895]" />
                      {rec.resource.price_type}
                    </span>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-[#D5DED8] dark:border-[#304036]">
                  <button
                    onClick={() => handleDismiss(rec.id)}
                    disabled={dismissingId === rec.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-[#B64040] dark:text-[#F18484] hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Dismiss</span>
                  </button>

                  {rec.resource.url ? (
                    <a
                      href={rec.resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2F6B4F] hover:bg-[#24563F] text-white dark:bg-[#78B895] dark:hover:bg-[#91CAA8] dark:text-[#0D1511] font-medium text-xs shadow-sm transition-all"
                    >
                      <span>Open Resource</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <span className="text-xs text-[#68776D] dark:text-[#98A99E] font-medium italic">
                      Internal Learning Resource
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
