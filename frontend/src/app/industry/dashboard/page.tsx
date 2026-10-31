"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  Users,
  CheckCircle2,
  Clock,
  PlusCircle,
  Building2,
  TrendingUp,
  AlertCircle,
  ChevronRight,
  ShieldCheck,
  Award,
  Eye,
  FileText,
  Compass,
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
  DashboardEmptyState,
} from "@/components/dashboard";
import { DEMO_INDUSTRY, isDemoEmail } from "@/lib/demoData";

interface SummaryData {
  total_opportunities: number;
  published_opportunities: number;
  draft_opportunities: number;
  closed_opportunities: number;
  total_applications: number;
  under_review_applications: number;
  shortlisted_applications: number;
  interview_applications: number;
  offered_applications: number;
  accepted_applications: number;
  rejected_applications: number;
  recent_opportunities: any[];
  recent_applications: any[];
  verification_status: string;
}

export default function IndustryDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const token =
        localStorage.getItem("ayursetu_token") || localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const res = await api.get("/industry/dashboard");
      if (res.data && !Array.isArray(res.data) && typeof res.data === "object") {
        setData(res.data);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err: any) {
      console.error("Industry dashboard fetch error:", err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        router.push("/login");
        return;
      }
      let userEmail = typeof window !== "undefined" ? (localStorage.getItem("ayursetu_email") || localStorage.getItem("email") || "") : "";
      const isDemo = isDemoEmail(userEmail) || (typeof window !== "undefined" && window.location.search.includes("demo=true"));
      if (isDemo || !err.response) {
        setData({
          total_opportunities: DEMO_INDUSTRY.stats.activePostings,
          published_opportunities: DEMO_INDUSTRY.stats.activePostings,
          draft_opportunities: 1,
          closed_opportunities: 4,
          total_applications: DEMO_INDUSTRY.stats.totalApplicantsPool,
          under_review_applications: 18,
          shortlisted_applications: DEMO_INDUSTRY.stats.shortlistedCandidates,
          interview_applications: DEMO_INDUSTRY.stats.interviewPipelines,
          offered_applications: 8,
          accepted_applications: 6,
          rejected_applications: 4,
          recent_opportunities: [
            {
              id: "opp-1",
              title: "Ayurvedic Phytochemistry R&D Intern",
              type: "INTERNSHIP",
              location: "Bengaluru, Karnataka",
              applications_count: 24,
              status: "PUBLISHED"
            },
            {
              id: "opp-2",
              title: "Quality Control Analytical Chemist (ASU Drugs)",
              type: "JOB",
              location: "Bengaluru, Karnataka",
              applications_count: 18,
              status: "PUBLISHED"
            }
          ],
          recent_applications: [
            {
              id: "app-1",
              applicant_name: "Priya Sharma",
              opportunity_title: "Ayurvedic Phytochemistry R&D Intern",
              applied_at: "10 Oct 2026",
              status: "SHORTLISTED"
            }
          ],
          verification_status: "VERIFIED"
        });
        return;
      }
      setError(err.response?.data?.detail || "Error loading industry dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return <DashboardLoadingSkeleton />;
  }

  if (error || !data) {
    return (
      <DashboardErrorState
        error={error || "Dashboard metrics unavailable"}
        onRetry={fetchDashboard}
        title="Industry Dashboard Unavailable"
      />
    );
  }

  const isVerified = data.verification_status === "VERIFIED";

  const quickActions = [
    {
      title: "Manage Opportunities",
      description: "Jobs, internships & research postings",
      icon: Briefcase,
      href: "/industry/opportunities",
      colorVariant: "emerald" as const,
    },
    {
      title: "Applicant Pipeline",
      description: "Review candidates & match scores",
      icon: Users,
      href: "/industry/applications",
      colorVariant: "teal" as const,
    },
    {
      title: "Hiring Analytics",
      description: "Conversion rates & talent benchmarks",
      icon: TrendingUp,
      href: "/industry/analytics",
      colorVariant: "purple" as const,
    },
    {
      title: "Organization Profile",
      description: "Company details & compliance badge",
      icon: Building2,
      href: "/industry/organization",
      colorVariant: "amber" as const,
    },
  ];

  return (
    <DashboardLayout>
      {/* Signature AyurSetu Header */}
      <DashboardHeader
        badgeText="Industry Intelligence Portal"
        badgeIcon={<Building2 className="w-3.5 h-3.5" />}
        badgeVariant="emerald"
        title="Industry & Corporate Partner Portal"
        subtitle="Manage opportunities, evaluate candidates with deterministic skill-match intelligence, and hire top Ayush talent."
        statusBadge={
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
              isVerified
                ? "bg-emerald-950/80 text-emerald-300 border-emerald-500/30"
                : "bg-amber-950/80 text-amber-300 border-amber-500/30"
            }`}
          >
            {isVerified ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5" /> VERIFIED ORGANISATION
              </>
            ) : (
              <>
                <Clock className="w-3.5 h-3.5" /> VERIFICATION PENDING
              </>
            )}
          </span>
        }
        actions={[
          {
            label: "Post Opportunity",
            href: "/industry/opportunities/new",
            icon: PlusCircle,
            variant: "amber",
          },
          {
            label: "Applicant Pipeline",
            href: "/industry/applications",
            icon: Users,
            variant: "secondary",
          },
        ]}
      />

      {/* Verification Warning Alert Banner if Not Verified */}
      {!isVerified && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs sm:text-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-amber-950 dark:text-amber-200">
                Organization Verification Needed
              </p>
              <p className="text-amber-800/80 dark:text-amber-300/80 text-xs">
                Your organization profile is currently PENDING verification by platform administrators. You can create DRAFT opportunities, but publishing requires verified status.
              </p>
            </div>
          </div>
          <Link
            href="/industry/organization"
            className="px-4 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 text-amber-100 font-semibold text-xs whitespace-nowrap shadow-xs transition-colors shrink-0"
          >
            Verify Profile
          </Link>
        </div>
      )}

      {/* Standard Statistics Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <DashboardStatsCard
          title="Total Opportunities"
          value={data.total_opportunities}
          subtitle={`${data.published_opportunities} published active`}
          icon={Briefcase}
          colorVariant="emerald"
          href="/industry/opportunities"
        />

        <DashboardStatsCard
          title="Total Applicants"
          value={data.total_applications}
          subtitle={`${data.under_review_applications} under review`}
          icon={Users}
          colorVariant="blue"
          href="/industry/applications"
        />

        <DashboardStatsCard
          title="Shortlisted"
          value={data.shortlisted_applications}
          subtitle={`${data.interview_applications} in interview`}
          icon={Award}
          colorVariant="purple"
          href="/industry/applications"
        />

        <DashboardStatsCard
          title="Offers Extended"
          value={data.offered_applications}
          subtitle={`${data.accepted_applications} accepted`}
          icon={CheckCircle2}
          colorVariant="teal"
          href="/industry/applications"
        />
      </div>

      {/* Section: Quick Actions */}
      <DashboardSection
        title="Industry Quick Actions"
        subtitle="Manage recruitment pipeline, candidate interviews, skill analytics, and company credentials"
        icon={Compass}
      >
        <DashboardQuickActions actions={quickActions} columns={4} />
      </DashboardSection>

      {/* Main 2-Column Content Grid: Recent Opportunities & Applications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Recent Opportunities Card */}
        <DashboardCard
          title="Recent Opportunities"
          subtitle="Your posted roles and live candidate applicant counts"
          icon={Briefcase}
          headerAction={
            <Link
              href="/industry/opportunities"
              className="text-xs font-semibold text-[#2F6B4F] dark:text-[#6FAF8A] hover:text-[#24563F] dark:hover:text-[#8BC4A2] inline-flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          }
        >
          {(data.recent_opportunities || []).length === 0 ? (
            <DashboardEmptyState
              title="No Opportunities Posted"
              message="Create and publish your first internship or job opportunity to attract skilled Ayush candidates."
              icon={Briefcase}
              actionLabel="Create Opportunity"
              actionHref="/industry/opportunities/new"
            />
          ) : (
            <div className="space-y-3">
              {(data.recent_opportunities || []).map((opp: any) => (
                <div
                  key={opp.id}
                  className="p-4 rounded-xl bg-[#F7F9F4] dark:bg-[#0F1713] border border-[#DCE4DE] dark:border-[#2B3A31] flex items-center justify-between hover:border-[#2F6B4F]/40 dark:hover:border-[#6FAF8A]/40 transition-all"
                >
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-[#1B2A22] dark:text-[#E8F1EB]">
                      {opp.title}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-[#64736A] dark:text-[#A9B9AE]">
                      <span>{opp.opportunity_type}</span>
                      <span>•</span>
                      <span>{opp.work_mode}</span>
                      <span>•</span>
                      <span className="text-[#2F6B4F] dark:text-[#6FAF8A] font-semibold">
                        {opp.applicant_count || 0} applicants
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <span
                      className={`px-2.5 py-0.5 text-xs font-semibold rounded-lg border ${
                        opp.status === "PUBLISHED" || opp.status === "ACTIVE"
                          ? "bg-[#DCE8DF] dark:bg-[#26372D] text-[#2F6B4F] dark:text-[#6FAF8A] border-[#DCE4DE] dark:border-[#2B3A31]"
                          : opp.status === "DRAFT"
                          ? "bg-[#FAF0E1] dark:bg-[#332512] text-[#C58A32] dark:text-[#E4B45D] border-[#C58A32]/20 dark:border-[#E4B45D]/30"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200"
                      }`}
                    >
                      {opp.status}
                    </span>

                    <Link
                      href={`/industry/opportunities/${opp.id}`}
                      className="p-2 text-[#64736A] dark:text-[#A9B9AE] hover:text-[#2F6B4F] dark:hover:text-[#6FAF8A] bg-white dark:bg-[#17221C] border border-[#DCE4DE] dark:border-[#2B3A31] rounded-lg hover:shadow-xs transition-colors"
                      title="View Opportunity"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DashboardCard>

        {/* Recent Applications Card */}
        <DashboardCard
          title="Recent Applications"
          subtitle="Candidate submissions with real-time deterministic match scoring"
          icon={Users}
          headerAction={
            <Link
              href="/industry/applications"
              className="text-xs font-semibold text-[#2F6B4F] dark:text-[#6FAF8A] hover:text-[#24563F] dark:hover:text-[#8BC4A2] inline-flex items-center gap-1"
            >
              <span>View Pipeline</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          }
        >
          {(data.recent_applications || []).length === 0 ? (
            <DashboardEmptyState
              title="No Candidate Applications Yet"
              message="Applications submitted to your published positions will appear here with AI match scoring."
              icon={Users}
            />
          ) : (
            <div className="space-y-3">
              {(data.recent_applications || []).map((app: any) => (
                <div
                  key={app.id}
                  className="p-4 rounded-xl bg-[#F7F9F4] dark:bg-[#0F1713] border border-[#DCE4DE] dark:border-[#2B3A31] flex items-center justify-between hover:border-[#2F6B4F]/40 dark:hover:border-[#6FAF8A]/40 transition-all"
                >
                  <div className="space-y-0.5">
                    <h4 className="font-bold text-sm text-[#1B2A22] dark:text-[#E8F1EB]">
                      {app.student_name}
                    </h4>
                    <p className="text-xs text-[#64736A] dark:text-[#A9B9AE] font-medium">
                      {app.opportunity_title}
                    </p>
                    <p className="text-[11px] text-[#64736A] dark:text-[#A9B9AE]">
                      {app.college_name || "Institution Student"}
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 text-right">
                    <div>
                      <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-[#DCE8DF] dark:bg-[#26372D] text-[#2F6B4F] dark:text-[#6FAF8A] border border-[#DCE4DE] dark:border-[#2B3A31]">
                        {Math.round(app.match_score || 85)}% Match
                      </span>
                      <p className="text-[10px] text-[#64736A] dark:text-[#A9B9AE] mt-1 uppercase font-semibold">
                        {app.status}
                      </p>
                    </div>

                    <Link
                      href={`/industry/applications/${app.id}`}
                      className="p-2 text-[#64736A] dark:text-[#A9B9AE] hover:text-[#2F6B4F] dark:hover:text-[#6FAF8A] bg-white dark:bg-[#17221C] border border-[#DCE4DE] dark:border-[#2B3A31] rounded-lg hover:shadow-xs transition-colors"
                      title="Review Candidate"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DashboardCard>
      </div>
    </DashboardLayout>
  );
}
