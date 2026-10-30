"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import {
  Briefcase,
  Target,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  ExternalLink,
  Trash2,
  RefreshCw,
  Search,
  MapPin,
  Clock,
  Building,
  Award,
  ChevronRight,
  Filter,
  ArrowUpRight,
  HelpCircle,
  BookOpen
} from "lucide-react";

interface CareerRoleSimple {
  id: string;
  name: string;
  slug: string;
}

interface RequiredSkill {
  id: string;
  skill_id: string;
  skill_name: string;
  required_score: number;
  importance: string;
  is_required: boolean;
}

interface Opportunity {
  id: string;
  title: string;
  description: string;
  responsibilities?: string;
  requirements?: string;
  opportunity_type: string;
  organization_name: string;
  organization_description?: string;
  location_text?: string;
  city?: string;
  state?: string;
  country: string;
  work_mode: string;
  employment_type: string;
  experience_level: string;
  application_url?: string;
  source_name: string;
  source_type: string;
  application_deadline?: string;
  salary_min?: number;
  salary_max?: number;
  salary_currency: string;
  is_salary_disclosed: boolean;
  status: string;
  required_skills: RequiredSkill[];
}

interface Breakdown {
  skill_match_score: number;
  career_match_score: number;
  required_skill_coverage: number;
  experience_fit: number;
  overall_match_score: number;
}

interface OpportunityMatchItem {
  id: string;
  opportunity: Opportunity;
  match_score: number;
  match_classification: "EXCELLENT" | "GOOD" | "PARTIAL" | "LOW";
  priority: string;
  breakdown: Breakdown;
  matched_skills: string[];
  partial_skills: string[];
  missing_skills: string[];
  critical_missing_skills: string[];
  reason: string;
  status: string;
  generated_at: string;
}

interface Summary {
  total_opportunities: number;
  excellent: number;
  good: number;
  partial: number;
  low: number;
  internships: number;
  jobs: number;
  research: number;
}

interface OpportunitiesReport {
  target_career: CareerRoleSimple | null;
  summary: Summary;
  opportunities: OpportunityMatchItem[];
  generated_at: string;
}

function StudentOpportunitiesContent() {
  const searchParams = useSearchParams();
  const typeParam = searchParams.get("type");

  const [report, setReport] = useState<OpportunitiesReport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [noTargetCareer, setNoTargetCareer] = useState<boolean>(false);
  const [dismissingId, setDismissingId] = useState<string | null>(null);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>(typeParam || "ALL");
  const [workModeFilter, setWorkModeFilter] = useState<string>("ALL");
  const [matchFilter, setMatchFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<string>("BEST_MATCH");

  useEffect(() => {
    if (typeParam) {
      setTypeFilter(typeParam);
    }
  }, [typeParam]);

  const fetchOpportunities = async () => {
    setLoading(true);
    setError(null);
    setNoTargetCareer(false);

    try {
      const res = await api.get("/students/me/opportunities");
      if (res.data) {
        setReport(res.data);
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        window.location.href = "/login";
        return;
      }

      const detail = err.response?.data?.detail;
      if (err.response?.status === 400 && detail && detail.toLowerCase().includes("target career")) {
        setNoTargetCareer(true);
        setLoading(false);
        return;
      }

      setError(detail || err.message || "Failed to load opportunities");
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = async (oppId: string) => {
    setDismissingId(oppId);
    try {
      await api.post(`/students/me/opportunities/${oppId}/dismiss`);
      setReport((prev) => {
        if (!prev) return prev;
        const updated = prev.opportunities.filter((o) => o.opportunity.id !== oppId);
        return {
          ...prev,
          summary: {
            ...prev.summary,
            total_opportunities: updated.length
          },
          opportunities: updated
        };
      });
    } catch (err) {
      console.error("Failed to dismiss opportunity", err);
    } finally {
      setDismissingId(null);
    }
  };

  useEffect(() => {
    fetchOpportunities();
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
              Select your target career path to receive personalized industry job, internship, and research project matches.
            </p>
          </div>
          <Link
            href="/student/career"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#2F6B4F] hover:bg-[#24563F] text-white dark:bg-[#78B895] dark:hover:bg-[#91CAA8] dark:text-[#0D1511] font-medium shadow-md transition-all hover:gap-3"
          >
            <span>Choose Target Career</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
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
            onClick={fetchOpportunities}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2F6B4F] hover:bg-[#24563F] text-white dark:bg-[#78B895] dark:hover:bg-[#91CAA8] dark:text-[#0D1511] font-medium transition-colors shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    );
  }

  // Filter & Sort matches
  let filteredMatches = report.opportunities.filter((item) => {
    const opp = item.opportunity;
    const matchesSearch =
      opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.organization_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (opp.location_text && opp.location_text.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = typeFilter === "ALL" || opp.opportunity_type === typeFilter;
    const matchesWorkMode = workModeFilter === "ALL" || opp.work_mode === workModeFilter;
    const matchesClassification = matchFilter === "ALL" || item.match_classification === matchFilter;

    return matchesSearch && matchesType && matchesWorkMode && matchesClassification;
  });

  if (sortBy === "BEST_MATCH") {
    filteredMatches.sort((a, b) => b.match_score - a.match_score);
  } else if (sortBy === "NEWEST") {
    filteredMatches.sort((a, b) => b.id.localeCompare(a.id));
  }

  const getMatchClassificationBadge = (classification: string, score: number) => {
    switch (classification) {
      case "EXCELLENT":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 shadow-sm">
            {score}% EXCELLENT MATCH
          </span>
        );
      case "GOOD":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            {score}% GOOD MATCH
          </span>
        );
      case "PARTIAL":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
            {score}% PARTIAL MATCH
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#EEF4EF] dark:bg-[#223128] text-[#526158] dark:text-[#C1CEC5] border border-[#D5DED8] dark:border-[#304036]">
            {score}% LOW MATCH
          </span>
        );
    }
  };

  const getOppTypeBadge = (type: string) => {
    switch (type) {
      case "INTERNSHIP":
        return <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">INTERNSHIP</span>;
      case "JOB":
        return <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-800">JOB</span>;
      case "RESEARCH":
        return <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-800">RESEARCH</span>;
      case "PROJECT":
        return <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">PROJECT</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-[#EEF4EF] dark:bg-[#223128] text-[#526158] dark:text-[#C1CEC5] border border-[#D5DED8] dark:border-[#304036]">{type}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9F4] dark:bg-[#0D1511] text-[#17231C] dark:text-[#F1F6F2] py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#2F6B4F] via-[#24563F] to-[#17231C] text-white p-8 shadow-xl border border-[#2F6B4F]/40">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800/60 border border-emerald-700/50 text-xs font-medium text-amber-300">
                <Sparkles className="w-3.5 h-3.5" />
                <span>FR-06 Industry Opportunities Engine</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight">
                Industry Opportunities & Career Matching
              </h1>
              <p className="text-emerald-100/90 text-sm sm:text-base">
                Target Career:{" "}
                <span className="font-semibold text-amber-300">
                  {report.target_career?.name || "Not Selected"}
                </span>
              </p>
              <p className="text-xs text-emerald-200/80">
                Matches are generated by evaluating your target career, current skill profile, and skill gaps against real industry opportunity requirements.
              </p>
            </div>

            <button
              onClick={fetchOpportunities}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium border border-white/20 shadow-md transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh Matches</span>
            </button>
          </div>
        </div>

        {/* Metric Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[#526158] dark:text-[#C1CEC5] uppercase tracking-wider">Total Opportunities</p>
              <p className="text-2xl font-bold font-serif text-[#142019] dark:text-[#FFFFFF] mt-1">{report.summary.total_opportunities}</p>
              <p className="text-[11px] text-[#2F6B4F] dark:text-[#78B895]">Active matches</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-[#2F6B4F] dark:text-[#78B895] flex items-center justify-center">
              <Briefcase className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[#526158] dark:text-[#C1CEC5] uppercase tracking-wider">Excellent Matches</p>
              <p className="text-2xl font-bold font-serif text-[#142019] dark:text-[#FFFFFF] mt-1">{report.summary.excellent}</p>
              <p className="text-[11px] text-[#2F7D4A] dark:text-[#7BC894]">85%+ score alignment</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-[#2F7D4A] dark:text-[#7BC894] flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[#526158] dark:text-[#C1CEC5] uppercase tracking-wider">Good Matches</p>
              <p className="text-2xl font-bold font-serif text-[#142019] dark:text-[#FFFFFF] mt-1">{report.summary.good}</p>
              <p className="text-[11px] text-[#A96F16] dark:text-[#E5B85C]">70%–84% score alignment</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-[#A96F16] dark:text-[#E5B85C] flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[#526158] dark:text-[#C1CEC5] uppercase tracking-wider">Internships / Jobs</p>
              <p className="text-2xl font-bold font-serif text-[#142019] dark:text-[#FFFFFF] mt-1">{report.summary.internships + report.summary.jobs}</p>
              <p className="text-[11px] text-[#356F9D] dark:text-[#80B5DD]">Industry postings</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 flex items-center justify-center">
              <Building className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-[#FFFFFF] dark:bg-[#17211B] rounded-2xl p-4 border border-[#D5DED8] dark:border-[#304036] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="relative flex-1 w-full md:w-auto">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#68776D] dark:text-[#98A99E]" />
            <input
              type="text"
              placeholder="Search opportunity title, company, or location..."
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
              <option value="JOB">Job</option>
              <option value="INTERNSHIP">Internship</option>
              <option value="RESEARCH">Research</option>
              <option value="PROJECT">Project</option>
            </select>

            <select
              value={workModeFilter}
              onChange={(e) => setWorkModeFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-[#F7F9F4] dark:bg-[#1D2A22] border border-[#D5DED8] dark:border-[#304036] text-xs font-medium text-[#17231C] dark:text-[#F1F6F2] focus:outline-none focus:border-[#2F6B4F] dark:focus:border-[#78B895]"
            >
              <option value="ALL">All Work Modes</option>
              <option value="ONSITE">Onsite</option>
              <option value="REMOTE">Remote</option>
              <option value="HYBRID">Hybrid</option>
            </select>

            <select
              value={matchFilter}
              onChange={(e) => setMatchFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-[#F7F9F4] dark:bg-[#1D2A22] border border-[#D5DED8] dark:border-[#304036] text-xs font-medium text-[#17231C] dark:text-[#F1F6F2] focus:outline-none focus:border-[#2F6B4F] dark:focus:border-[#78B895]"
            >
              <option value="ALL">All Match Levels</option>
              <option value="EXCELLENT">Excellent (85%+)</option>
              <option value="GOOD">Good (70%-84%)</option>
              <option value="PARTIAL">Partial (50%-69%)</option>
              <option value="LOW">Low (&lt;50%)</option>
            </select>
          </div>
        </div>

        {/* Opportunity Cards List */}
        {filteredMatches.length === 0 ? (
          <div className="bg-[#FFFFFF] dark:bg-[#17211B] rounded-3xl p-12 text-center space-y-4 border border-[#D5DED8] dark:border-[#304036] shadow-sm">
            <HelpCircle className="w-12 h-12 mx-auto text-[#68776D] dark:text-[#98A99E]" />
            <div className="space-y-1">
              <h3 className="text-lg font-serif font-bold text-[#142019] dark:text-[#FFFFFF]">No Opportunities Found</h3>
              <p className="text-xs text-[#526158] dark:text-[#C1CEC5] max-w-md mx-auto">
                No active industry opportunities match your current filter parameters.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredMatches.map((item) => {
              const opp = item.opportunity;
              return (
                <div
                  key={item.id}
                  className="bg-[#FFFFFF] dark:bg-[#17211B] rounded-3xl p-6 border border-[#D5DED8] dark:border-[#304036] shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-5"
                >
                  <div className="space-y-4">
                    {/* Header: Badges & Match Gauge */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        {getOppTypeBadge(opp.opportunity_type)}
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#EEF4EF] dark:bg-[#223128] text-[#526158] dark:text-[#C1CEC5] border border-[#D5DED8] dark:border-[#304036]">
                          {opp.work_mode}
                        </span>
                      </div>
                      {getMatchClassificationBadge(item.match_classification, item.match_score)}
                    </div>

                    {/* Title & Organization */}
                    <div className="space-y-1">
                      <h3 className="text-lg font-serif font-bold text-[#142019] dark:text-[#FFFFFF] hover:text-[#2F6B4F] dark:hover:text-[#78B895] transition-colors">
                        {opp.title}
                      </h3>
                      <p className="text-xs font-semibold text-[#A96F16] dark:text-[#E5B85C] flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-[#A96F16] dark:text-[#E5B85C] shrink-0" />
                        {opp.organization_name}
                      </p>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-[#526158] dark:text-[#C1CEC5] leading-relaxed line-clamp-2">
                      {opp.description}
                    </p>

                    {/* Critical Requirement Warning */}
                    {item.critical_missing_skills.length > 0 && (
                      <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-[#B64040]/30 text-xs text-[#B64040] dark:text-[#F18484] flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-[#B64040] dark:text-[#F18484] shrink-0" />
                        <span>
                          Critical skill gap: <strong>{item.critical_missing_skills.join(", ")}</strong>
                        </span>
                      </div>
                    )}

                    {/* Skill Breakdown Summary */}
                    <div className="p-3.5 rounded-2xl bg-[#F7F9F4] dark:bg-[#1D2A22] border border-[#D5DED8] dark:border-[#304036] space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#142019] dark:text-[#FFFFFF] font-bold">Matched Skills: {item.matched_skills.length}</span>
                        <span className="text-[#526158] dark:text-[#C1CEC5] font-medium">Skill Alignment: {item.breakdown.skill_match_score}%</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {item.matched_skills.map((s, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#DCEBE1] dark:bg-[#294637] text-[#2F6B4F] dark:text-[#78B895] border border-[#D5DED8] dark:border-[#304036]">
                            ✓ {s}
                          </span>
                        ))}
                        {item.missing_skills.map((s, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded text-[11px] font-medium bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-900">
                            ✕ {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Explanation Reason */}
                    <div className="text-xs text-[#17231C] dark:text-[#F1F6F2] bg-amber-500/10 dark:bg-amber-950/30 p-3 rounded-xl border border-[#A96F16]/20 dark:border-[#E5B85C]/20 italic">
                      &ldquo;{item.reason}&rdquo;
                    </div>

                    {/* Meta info: Location & Salary */}
                    <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-[#526158] dark:text-[#C1CEC5] pt-1">
                      {opp.location_text && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#2F6B4F] dark:text-[#78B895]" />
                          {opp.location_text}
                        </span>
                      )}
                      {opp.salary_min && (
                        <span className="flex items-center gap-1 font-mono text-[#142019] dark:text-[#FFFFFF] font-bold">
                          ₹{opp.salary_min.toLocaleString()} - ₹{opp.salary_max?.toLocaleString() || "Max"} / mo
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Footer CTAs */}
                  <div className="flex items-center justify-between pt-4 border-t border-[#D5DED8] dark:border-[#304036]">
                    <button
                      onClick={() => handleDismiss(opp.id)}
                      disabled={dismissingId === opp.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-[#B64040] dark:text-[#F18484] hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Dismiss</span>
                    </button>

                    <Link
                      href={`/student/opportunities/${opp.id}`}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2F6B4F] hover:bg-[#24563F] text-white dark:bg-[#78B895] dark:hover:bg-[#91CAA8] dark:text-[#0D1511] font-medium text-xs shadow-sm transition-all hover:gap-3"
                    >
                      <span>View Match Breakdown</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Disclaimer Callout */}
        <div className="p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-950/30 border border-[#A96F16]/30 dark:border-[#E5B85C]/30 text-xs text-[#526158] dark:text-[#C1CEC5] leading-relaxed text-center">
          <strong>Disclaimer:</strong> Match scores indicate profile alignment based on candidate skills, target career role, and opportunity requirements. They measure suitability and do not predict selection or guarantee hiring.
        </div>

      </div>
    </div>
  );
}

export default function StudentOpportunitiesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F7F9F4] dark:bg-[#0D1511] py-12 flex items-center justify-center text-[#68776D] dark:text-[#98A99E] font-medium">Loading opportunities...</div>}>
      <StudentOpportunitiesContent />
    </Suspense>
  );
}
