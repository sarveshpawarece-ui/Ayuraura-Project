"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  Briefcase,
  Building,
  MapPin,
  Clock,
  ArrowLeft,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Award,
  Sparkles,
  RefreshCw,
  BookOpen
} from "lucide-react";

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
  match_classification: string;
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

export default function OpportunityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const oppId = resolvedParams.id;

  const [matchData, setMatchData] = useState<OpportunityMatchItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          window.location.href = "/login";
          return;
        }

        const res = await fetch(`/api/v1/students/me/opportunities/${oppId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!res.ok) {
          throw new Error("Unable to load opportunity detail.");
        }

        const data: OpportunityMatchItem = await res.json();
        setMatchData(data);
      } catch (err: any) {
        setError(err.message || "Failed to load opportunity match detail");
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [oppId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F9F4] dark:bg-[#0D1511] text-[#17231C] dark:text-[#F1F6F2] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8 animate-pulse">
          <div className="h-10 w-32 bg-[#2F6B4F]/10 dark:bg-[#78B895]/10 rounded-xl" />
          <div className="h-64 bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] rounded-3xl" />
          <div className="h-96 bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] rounded-3xl" />
        </div>
      </div>
    );
  }

  if (error || !matchData) {
    return (
      <div className="min-h-screen bg-[#F7F9F4] dark:bg-[#0D1511] text-[#17231C] dark:text-[#F1F6F2] py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900 flex items-center justify-center">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-[#17231C] dark:text-[#F1F6F2]">{error || "Opportunity not found"}</h2>
          <Link
            href="/student/opportunities"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2F6B4F] hover:bg-[#24563F] dark:bg-[#78B895] dark:hover:bg-[#91CAA8] text-white dark:text-[#0D1511] font-semibold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Opportunities</span>
          </Link>
        </div>
      </div>
    );
  }

  const opp = matchData.opportunity;
  const bd = matchData.breakdown;

  return (
    <div className="min-h-screen bg-[#F7F9F4] dark:bg-[#0D1511] text-[#17231C] dark:text-[#F1F6F2] py-8 px-4 sm:px-6 lg:px-8 font-sans transition-colors duration-200">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Back Link */}
        <Link
          href="/student/opportunities"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#2F6B4F] dark:text-[#78B895] hover:underline transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Opportunities</span>
        </Link>

        {/* Top Opportunity Header Card */}
        <div className="bg-[#FFFFFF] dark:bg-[#17211B] rounded-3xl p-6 sm:p-8 border border-[#D5DED8] dark:border-[#304036] shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#D5DED8] dark:border-[#304036]">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#DCEBE1] dark:bg-[#294637] text-[#2F6B4F] dark:text-[#78B895]">
                  {opp.opportunity_type}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#EEF4EF] dark:bg-[#223128] text-[#526158] dark:text-[#C1CEC5]">
                  {opp.work_mode}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#17231C] dark:text-[#F1F6F2]">{opp.title}</h1>
              <p className="text-sm font-semibold text-[#A96F16] dark:text-[#E5B85C] flex items-center gap-1.5">
                <Building className="w-4 h-4" />
                {opp.organization_name}
              </p>
            </div>

            {/* Match Score Badge */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-[#1B3828] to-[#0F2318] dark:from-[#172E21] dark:to-[#0D1B13] text-amber-100 text-center shrink-0 border border-emerald-500/30 shadow-lg">
              <p className="text-3xl font-bold text-amber-300">{matchData.match_score}%</p>
              <p className="text-xs font-semibold tracking-wider uppercase text-emerald-300 mt-1">{matchData.match_classification} MATCH</p>
            </div>
          </div>

          {/* Meta Details */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <p className="text-[11px] text-[#526158] dark:text-[#98A99E] uppercase tracking-wider font-semibold">Location</p>
              <p className="font-semibold text-[#17231C] dark:text-[#F1F6F2] mt-0.5">{opp.location_text || "Not specified"}</p>
            </div>
            <div>
              <p className="text-[11px] text-[#526158] dark:text-[#98A99E] uppercase tracking-wider font-semibold">Employment Type</p>
              <p className="font-semibold text-[#17231C] dark:text-[#F1F6F2] mt-0.5">{opp.employment_type}</p>
            </div>
            <div>
              <p className="text-[11px] text-[#526158] dark:text-[#98A99E] uppercase tracking-wider font-semibold">Experience Level</p>
              <p className="font-semibold text-[#17231C] dark:text-[#F1F6F2] mt-0.5">{opp.experience_level}</p>
            </div>
            <div>
              <p className="text-[11px] text-[#526158] dark:text-[#98A99E] uppercase tracking-wider font-semibold">Stipend / Salary</p>
              <p className="font-semibold text-[#17231C] dark:text-[#F1F6F2] mt-0.5 font-mono">
                {opp.salary_min ? `₹${opp.salary_min.toLocaleString()} / mo` : "Disclosed on interview"}
              </p>
            </div>
          </div>
        </div>

        {/* Match Score Breakdown Section */}
        <div className="bg-[#FFFFFF] dark:bg-[#17211B] rounded-3xl p-6 sm:p-8 border border-[#D5DED8] dark:border-[#304036] shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#D5DED8] dark:border-[#304036] pb-4">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-[#17231C] dark:text-[#F1F6F2] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" /> Advanced Matching Engine Factor Breakdown
              </h2>
              <p className="text-xs text-[#526158] dark:text-[#C1CEC5]">
                100% deterministic multi-factor match score evaluating candidate skills, career relevance, requirement coverage, and experience fit.
              </p>
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#DCEBE1] dark:bg-[#294637] text-[#2F6B4F] dark:text-[#78B895] border border-[#B9C8BE] dark:border-[#425449] shrink-0">
              ENGINE: v2_advanced
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-[#EEF4EF] dark:bg-[#223128] border border-[#D5DED8] dark:border-[#304036] text-center space-y-1">
              <p className="text-xs font-semibold text-[#526158] dark:text-[#C1CEC5]">Skill Match (50%)</p>
              <p className="text-2xl font-bold text-[#17231C] dark:text-[#F1F6F2]">{bd.skill_match_score}%</p>
              <p className="text-[10px] text-[#2F6B4F] dark:text-[#78B895] font-medium">Proficiency ratio</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#EEF4EF] dark:bg-[#223128] border border-[#D5DED8] dark:border-[#304036] text-center space-y-1">
              <p className="text-xs font-semibold text-[#526158] dark:text-[#C1CEC5]">Career Match (25%)</p>
              <p className="text-2xl font-bold text-[#17231C] dark:text-[#F1F6F2]">{bd.career_match_score}%</p>
              <p className="text-[10px] text-[#2F6B4F] dark:text-[#78B895] font-medium">Target role fit</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#EEF4EF] dark:bg-[#223128] border border-[#D5DED8] dark:border-[#304036] text-center space-y-1">
              <p className="text-xs font-semibold text-[#526158] dark:text-[#C1CEC5]">Requirement Coverage (15%)</p>
              <p className="text-2xl font-bold text-[#17231C] dark:text-[#F1F6F2]">{bd.required_skill_coverage}%</p>
              <p className="text-[10px] text-[#2F6B4F] dark:text-[#78B895] font-medium">Mandatory skills met</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#EEF4EF] dark:bg-[#223128] border border-[#D5DED8] dark:border-[#304036] text-center space-y-1">
              <p className="text-xs font-semibold text-[#526158] dark:text-[#C1CEC5]">Experience Fit (10%)</p>
              <p className="text-2xl font-bold text-[#17231C] dark:text-[#F1F6F2]">{bd.experience_fit}%</p>
              <p className="text-[10px] text-[#2F6B4F] dark:text-[#78B895] font-medium">Level compatibility</p>
            </div>
          </div>

          {/* Explanation Reason Callout */}
          <div className="p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 text-xs text-[#17231C] dark:text-[#F1F6F2] space-y-1">
            <p className="font-bold text-[#A96F16] dark:text-[#E5B85C] uppercase tracking-wider text-[11px]">Engine Explanation</p>
            <p className="italic leading-relaxed">&ldquo;{matchData.reason}&rdquo;</p>
          </div>
        </div>


        {/* Required Skills Comparison Table */}
        <div className="bg-[#FFFFFF] dark:bg-[#17211B] rounded-3xl p-6 sm:p-8 border border-[#D5DED8] dark:border-[#304036] shadow-sm space-y-6">
          <div className="space-y-1 border-b border-[#D5DED8] dark:border-[#304036] pb-4">
            <h2 className="text-xl font-bold text-[#17231C] dark:text-[#F1F6F2] flex items-center gap-2">
              <Award className="w-5 h-5 text-[#2F6B4F] dark:text-[#78B895]" /> Skill Requirements Comparison
            </h2>
            <p className="text-xs text-[#526158] dark:text-[#C1CEC5]">
              Detailed comparison between your current skill profile and this opportunity&apos;s required thresholds.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#D5DED8] dark:border-[#304036] text-[#526158] dark:text-[#98A99E] font-semibold uppercase tracking-wider">
                  <th className="pb-3">Required Skill</th>
                  <th className="pb-3">Importance</th>
                  <th className="pb-3">Required Threshold</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D5DED8] dark:divide-[#304036]">
                {opp.required_skills.map((sk) => {
                  const isMatched = matchData.matched_skills.includes(sk.skill_name);
                  const isPartial = matchData.partial_skills.includes(sk.skill_name);

                  return (
                    <tr key={sk.id} className="hover:bg-[#EEF4EF]/50 dark:hover:bg-[#223128]/50 transition-colors">
                      <td className="py-3 font-semibold text-[#17231C] dark:text-[#F1F6F2]">{sk.skill_name}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${sk.importance === "CRITICAL" ? "bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300" : "bg-[#EEF4EF] dark:bg-[#223128] text-[#526158] dark:text-[#C1CEC5]"}`}>
                          {sk.importance}
                        </span>
                      </td>
                      <td className="py-3 font-mono font-bold text-[#17231C] dark:text-[#F1F6F2]">{sk.required_score}%</td>
                      <td className="py-3">
                        {isMatched ? (
                          <span className="text-[#2F7D4A] dark:text-[#7BC894] font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Requirement Met
                          </span>
                        ) : isPartial ? (
                          <span className="text-[#A96F16] dark:text-[#E5B85C] font-bold flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" /> Partial Match
                          </span>
                        ) : (
                          <span className="text-[#B64040] dark:text-[#F18484] font-bold flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" /> Missing Requirement
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Integration Link */}
          {matchData.missing_skills.length > 0 && (
            <div className="p-4 rounded-2xl bg-[#EEF4EF] dark:bg-[#223128] border border-[#D5DED8] dark:border-[#304036] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-[#17231C] dark:text-[#F1F6F2]">Bridge Identified Skill Gaps</p>
                <p className="text-[11px] text-[#526158] dark:text-[#C1CEC5]">
                  Access recommended courses and projects curated to elevate your skills for this opportunity.
                </p>
              </div>
              <Link
                href="/student/recommendations"
                className="px-4 py-2 rounded-xl bg-[#2F6B4F] hover:bg-[#24563F] dark:bg-[#78B895] dark:hover:bg-[#91CAA8] text-white dark:text-[#0D1511] font-semibold text-xs shrink-0 flex items-center gap-1.5 shadow-xs"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>View Learning Recommendations</span>
              </Link>
            </div>
          )}
        </div>

        {/* Description & Responsibilities Section */}
        <div className="bg-[#FFFFFF] dark:bg-[#17211B] rounded-3xl p-6 sm:p-8 border border-[#D5DED8] dark:border-[#304036] shadow-sm space-y-6">
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-[#17231C] dark:text-[#F1F6F2]">Opportunity Description</h3>
            <p className="text-xs text-[#526158] dark:text-[#C1CEC5] leading-relaxed whitespace-pre-line">{opp.description}</p>
          </div>

          {opp.responsibilities && (
            <div className="space-y-3 pt-4 border-t border-[#D5DED8] dark:border-[#304036]">
              <h3 className="text-lg font-bold text-[#17231C] dark:text-[#F1F6F2]">Key Responsibilities</h3>
              <p className="text-xs text-[#526158] dark:text-[#C1CEC5] leading-relaxed whitespace-pre-line">{opp.responsibilities}</p>
            </div>
          )}

          {opp.requirements && (
            <div className="space-y-3 pt-4 border-t border-[#D5DED8] dark:border-[#304036]">
              <h3 className="text-lg font-bold text-[#17231C] dark:text-[#F1F6F2]">Candidate Eligibility & Requirements</h3>
              <p className="text-xs text-[#526158] dark:text-[#C1CEC5] leading-relaxed whitespace-pre-line">{opp.requirements}</p>
            </div>
          )}

          {/* External Application Link CTA */}
          <div className="pt-6 border-t border-[#D5DED8] dark:border-[#304036] flex items-center justify-between">
            <span className="text-xs text-[#526158] dark:text-[#98A99E] font-medium">
              Source: {opp.source_name} ({opp.source_type})
            </span>

            {opp.application_url ? (
              <a
                href={opp.application_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#2F6B4F] hover:bg-[#24563F] dark:bg-[#78B895] dark:hover:bg-[#91CAA8] text-white dark:text-[#0D1511] font-semibold text-xs shadow-xs transition-all hover:gap-3"
              >
                <span>Apply / View Application</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            ) : (
              <span className="text-xs text-[#526158] dark:text-[#98A99E] italic font-medium">
                Internal Opportunity Posting
              </span>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
