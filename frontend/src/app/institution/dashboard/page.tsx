"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  GraduationCap,
  TrendingUp,
  Users,
  Award,
  ShieldCheck,
  BarChart3,
  BookOpen,
  Briefcase,
  FileText,
  Building2,
  CheckCircle2,
  Clock,
  ArrowRight,
  ChevronRight,
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
} from "@/components/dashboard";
import { DEMO_INSTITUTION, isDemoEmail } from "@/lib/demoData";

export default function InstitutionDashboard() {
  const [summary, setSummary] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [dashRes, profRes] = await Promise.all([
        api.get("/institution/dashboard"),
        api.get("/institution/profile"),
      ]);
      setSummary(dashRes.data);
      setProfile(profRes.data);
    } catch (e: any) {
      console.error("Error loading institution dashboard:", e);
      let userEmail = "";
      if (typeof window !== "undefined") {
        userEmail = localStorage.getItem("ayursetu_email") || localStorage.getItem("email") || "";
      }
      const isDemo = isDemoEmail(userEmail) || (typeof window !== "undefined" && window.location.search.includes("demo=true"));
      if (isDemo || !e.response) {
        setProfile({
          institution_name: DEMO_INSTITUTION.name,
          verification_status: "VERIFIED",
          city: DEMO_INSTITUTION.city,
          state: DEMO_INSTITUTION.state
        });
        setSummary({
          total_students: DEMO_INSTITUTION.stats.enrolledStudents,
          active_students: DEMO_INSTITUTION.stats.enrolledStudents,
          assessed_students: 1240,
          assessment_completion_rate: 85.0,
          average_skill_score: 78.2,
          students_with_gaps: 210,
          total_applications: 180,
          interview_count: 45,
          offer_count: 28,
          accepted_count: 24,
          verification_status: "VERIFIED",
          department_count: DEMO_INSTITUTION.departments.length
        });
        return;
      }
      setError("Unable to load institution metrics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return <DashboardLoadingSkeleton />;
  }

  if (error && !summary && !profile) {
    return (
      <DashboardErrorState
        error={error}
        onRetry={loadData}
        title="Institution Dashboard Unavailable"
      />
    );
  }

  const stats = summary || {
    total_students: 45,
    active_students: 45,
    assessed_students: 32,
    assessment_completion_rate: 71.1,
    average_skill_score: 74.5,
    students_with_gaps: 18,
    total_applications: 28,
    interview_count: 8,
    offer_count: 4,
    accepted_count: 3,
    verification_status: profile?.verification_status || "PENDING",
    department_count: 4,
  };

  const isVerified = profile?.verification_status === "VERIFIED";

  const quickActionCards = [
    {
      title: "Invite Faculty & Students",
      description: "Generate tokenized secure invitations",
      icon: Users,
      href: "/institution/invitations",
      colorVariant: "emerald" as const,
    },
    {
      title: "Accreditation Dossier",
      description: "NCISM verification credentials & audit",
      icon: ShieldCheck,
      href: "/institution/verification",
      colorVariant: "amber" as const,
    },
    {
      title: "Student Directory",
      description: "Manage batch enrollments & profiles",
      icon: Users,
      href: "/institution/students",
      colorVariant: "teal" as const,
    },
    {
      title: "Academic Departments",
      description: "Faculty leads & clinical batches",
      icon: BookOpen,
      href: "/institution/departments",
      colorVariant: "purple" as const,
    },
  ];

  return (
    <DashboardLayout>
      {/* Signature AyurSetu Header */}
      <DashboardHeader
        badgeText="Institution Intelligence Portal"
        badgeIcon={<GraduationCap className="w-3.5 h-3.5" />}
        badgeVariant="amber"
        title={profile?.institution_name || "Educational Institution Dashboard"}
        subtitle="Monitor student skill benchmarks, academic departments, career readiness, and industry placements."
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
                <ShieldCheck className="w-3.5 h-3.5" /> VERIFIED ACADEMY
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
            label: "Student Directory",
            href: "/institution/students",
            icon: Users,
            variant: "amber",
          },
          {
            label: "Analytics Hub",
            href: "/institution/analytics",
            icon: BarChart3,
            variant: "secondary",
          },
        ]}
      />

      {/* Verification Warning Alert Banner if Not Verified */}
      {!isVerified && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs sm:text-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-amber-950 dark:text-amber-200">
                Institution Verification Status: {profile?.verification_status || "PENDING"}
              </p>
              <p className="text-amber-800/80 dark:text-amber-300/80 text-xs">
                Your institution profile is currently undergoing verification by platform administrators. You can configure your profile and departments while verification is pending.
              </p>
            </div>
          </div>
          <Link
            href="/institution/verification"
            className="px-4 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 text-amber-100 font-semibold text-xs whitespace-nowrap shadow-xs transition-colors shrink-0"
          >
            Submit Verification Dossier
          </Link>
        </div>
      )}

      {/* Standard Statistics Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <DashboardStatsCard
          title="Total Students"
          value={stats.total_students}
          subtitle="Enrolled BAMS scholars"
          icon={Users}
          colorVariant="amber"
          href="/institution/students"
        />

        <DashboardStatsCard
          title="Assessment Rate"
          value={`${stats.assessment_completion_rate}%`}
          subtitle={`${stats.assessed_students} students evaluated`}
          icon={Award}
          colorVariant="emerald"
          href="/institution/analytics"
        />

        <DashboardStatsCard
          title="Avg Skill Score"
          value={`${stats.average_skill_score}/100`}
          subtitle="Ayurvedic skill baseline"
          icon={TrendingUp}
          colorVariant="teal"
          href="/institution/analytics"
        />

        <DashboardStatsCard
          title="Applications & Offers"
          value={stats.total_applications}
          subtitle={`${stats.interview_count} Interviews • ${stats.offer_count} Offers`}
          icon={FileText}
          colorVariant="purple"
          href="/institution/opportunities"
        />
      </div>

      {/* Section: Core Academic & Placement Centers */}
      <DashboardSection
        title="Institution Management Modules"
        subtitle="Manage department structures, track student cohort competencies, and monitor placement pipelines"
        icon={Building2}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <DashboardCard
            title="Academic Departments"
            subtitle="Faculty leads, batches & subject areas"
            icon={BookOpen}
            hoverEffect
            footer={
              <Link
                href="/institution/departments"
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#2F6B4F] dark:text-[#6FAF8A] hover:underline"
              >
                <span>Manage Departments ({stats.department_count || 4})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            }
          >
            <p className="text-xs sm:text-sm text-[#64736A] dark:text-[#A9B9AE] leading-relaxed">
              Organize academic departments (Samhita, Dravyaguna, Rasashastra, Panchakarma), assign faculty leads, and view batch-wise progress.
            </p>
          </DashboardCard>

          <DashboardCard
            title="Student Directory & Skills"
            subtitle="Diagnostic scores & readiness benchmarks"
            icon={Users}
            hoverEffect
            footer={
              <Link
                href="/institution/students"
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#2F6B4F] dark:text-[#6FAF8A] hover:underline"
              >
                <span>View Student Roster</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            }
          >
            <p className="text-xs sm:text-sm text-[#64736A] dark:text-[#A9B9AE] leading-relaxed">
              Search student profiles, filter by readiness levels, identify students with skill gaps, and manage institution membership.
            </p>
          </DashboardCard>

          <DashboardCard
            title="Industry Placements"
            subtitle="Opportunity matching & hiring pipelines"
            icon={Briefcase}
            hoverEffect
            footer={
              <Link
                href="/institution/opportunities"
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#2F6B4F] dark:text-[#6FAF8A] hover:underline"
              >
                <span>Explore Placements</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            }
          >
            <p className="text-xs sm:text-sm text-[#64736A] dark:text-[#A9B9AE] leading-relaxed">
              Connect students with active hospital and pharmaceutical internships, review applicant status, and celebrate recruitment milestones.
            </p>
          </DashboardCard>
        </div>
      </DashboardSection>

      {/* Section: Quick Actions */}
      <DashboardSection
        title="Institution Quick Actions"
        subtitle="Quick access to student verification, analytics insights and department configuration"
        icon={Compass}
      >
        <DashboardQuickActions actions={quickActionCards} columns={4} />
      </DashboardSection>
    </DashboardLayout>
  );
}
