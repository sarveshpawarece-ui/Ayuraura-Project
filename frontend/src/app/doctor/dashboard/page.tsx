"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import VerifiedDoctorBadge from "@/components/doctor/VerifiedDoctorBadge";
import {
  Stethoscope,
  Briefcase,
  Users,
  Calendar,
  MessageSquare,
  ShieldCheck,
  Building2,
  ChevronRight,
  PlusCircle,
  FileText,
  HeartHandshake,
  Sparkles,
  Clock,
  ArrowUpRight,
  Video,
  Radio,
  Star
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
import { DEMO_DOCTOR, isDemoEmail } from "@/lib/demoData";

interface DashboardSummary {
  doctor_id: string;
  doctor_name: string;
  qualification: string;
  specialization: string;
  years_of_experience: number;
  profile_completion_percentage: number;
  verification_status: string;
  active_internships_count: number;
  total_internships_count: number;
  applications_count: number;
  shortlisted_students_count: number;
  active_students_count: number;
  upcoming_sessions_count: number;
  completed_internships_count: number;
  clinics_count: number;
  recent_applications: Array<{
    id: string;
    student_name: string;
    student_college?: string;
    internship_title: string;
    applied_at: string;
    status: string;
  }>;
  upcoming_sessions: Array<{
    id: string;
    student_name: string;
    session_title: string;
    scheduled_date: string;
    start_time: string;
    session_type: string;
    meeting_mode: string;
    status: string;
  }>;
  recent_messages: Array<{
    id: string;
    sender_name: string;
    content: string;
    created_at: string;
    is_read: boolean;
  }>;
}

export default function DoctorDashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const token =
        localStorage.getItem("ayursetu_token") || localStorage.getItem("token");
      if (!token) {
        window.location.href = "/login";
        return;
      }

      const res = await api.get("/doctors/dashboard/summary");
      setSummary(res.data);
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 401) {
        window.location.href = "/login";
        return;
      }
      let userEmail = "";
      if (typeof window !== "undefined") {
        userEmail = localStorage.getItem("ayursetu_email") || localStorage.getItem("email") || "";
      }
      const isDemo = isDemoEmail(userEmail) || (typeof window !== "undefined" && window.location.search.includes("demo=true"));
      if (isDemo || !err.response) {
        setSummary({
          doctor_id: "demo-doctor-id",
          doctor_name: DEMO_DOCTOR.name,
          qualification: DEMO_DOCTOR.qualification,
          specialization: DEMO_DOCTOR.specialization,
          years_of_experience: DEMO_DOCTOR.yearsOfExperience,
          profile_completion_percentage: 95,
          verification_status: "VERIFIED",
          active_internships_count: 3,
          total_internships_count: 5,
          applications_count: 12,
          shortlisted_students_count: 4,
          active_students_count: 6,
          upcoming_sessions_count: 2,
          completed_internships_count: 8,
          clinics_count: 1,
          recent_applications: [
            {
              id: "app-1",
              student_name: "Priya Sharma",
              student_college: "National Institute of Ayurveda, Jaipur",
              internship_title: "Clinical Panchakarma Ward Assistant",
              applied_at: "10 Oct 2026",
              status: "REVIEWING"
            }
          ],
          upcoming_sessions: [
            {
              id: "sess-1",
              student_name: "Aarav Patel",
              session_title: "Nadi Pariksha Masterclass Case Discussion",
              scheduled_date: "18 Oct 2026",
              start_time: "10:00 AM",
              session_type: "CLINICAL_CASE",
              meeting_mode: "VIDEO",
              status: "SCHEDULED"
            }
          ],
          recent_messages: []
        });
        return;
      }
      setError(err.response?.data?.detail || "Unable to load doctor dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return <DashboardLoadingSkeleton />;
  }

  if (error || !summary) {
    return (
      <DashboardErrorState
        error={error || "Dashboard data unavailable"}
        onRetry={loadDashboard}
      />
    );
  }

  const quickActions = [
    {
      title: "Live Lecture Studio",
      description: "Broadcast live masterclasses & lectures",
      icon: Video,
      href: "/doctor/sessions",
      badge: "Go Live",
      colorVariant: "emerald" as const,
    },
    {
      title: "Doctor Profile",
      description: "Personal, qualifications & bio",
      icon: Stethoscope,
      href: "/doctor/profile",
      colorVariant: "teal" as const,
    },
    {
      title: "NCISM Verification",
      description: "Council registration & credentials",
      icon: ShieldCheck,
      href: "/doctor/verification",
      badge: summary?.verification_status || "VERIFIED",
      colorVariant: "amber" as const,
    },
    {
      title: "Clinic & OPD Locations",
      description: "Manage clinical practice centers",
      icon: Building2,
      href: "/doctor/clinics",
      colorVariant: "purple" as const,
    },
    {
      title: "Mentorship & Case Review",
      description: "Schedule & review 1-on-1 sessions",
      icon: Calendar,
      href: "/doctor/sessions",
      colorVariant: "blue" as const,
    },
    {
      title: "Healthcare Camps",
      description: "Community outreach & Suvarnaprashan",
      icon: HeartHandshake,
      href: "/camps",
      colorVariant: "emerald" as const,
    },
  ];

  return (
    <DashboardLayout>
      {/* Signature AyurSetu Header */}
      <DashboardHeader
        badgeText="Doctor Clinical Portal"
        badgeIcon={<Stethoscope className="w-3.5 h-3.5" />}
        badgeVariant="emerald"
        statusBadge={<VerifiedDoctorBadge status={summary?.verification_status || "VERIFIED"} size="sm" />}
        title={`Namaste, Dr. ${summary?.doctor_name || "Vaidya"}`}
        subtitle={
          <span>
            {summary?.qualification || "BAMS"} • {summary?.specialization || "Ayurveda"} •{" "}
            <strong className="text-amber-300">
              {summary?.years_of_experience ?? 10} Years
            </strong>{" "}
            Clinical Experience
          </span>
        }
        progress={{
          label: "Profile Completion",
          value: summary?.profile_completion_percentage ?? 90,
          helperText:
            summary.profile_completion_percentage < 100
              ? "Complete profile to unlock all features"
              : undefined,
          helperLink: "/doctor/profile",
        }}
        actions={[
          {
            label: "Live Lecture Studio",
            href: "/doctor/sessions",
            icon: Radio,
            variant: "amber",
          },
          {
            label: "Create Internship",
            href: "/doctor/internships/new",
            icon: PlusCircle,
            variant: "primary",
          },
        ]}
      />

      {/* Verification Warning Alert Banner if Not Verified */}
      {summary.verification_status !== "VERIFIED" && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs sm:text-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-amber-950 dark:text-amber-200">
                {summary.verification_status === "PENDING"
                  ? "Credentials Under Verification"
                  : "Complete Your Doctor Verification"}
              </p>
              <p className="text-amber-800/80 dark:text-amber-300/80 text-xs">
                Upload your NCISM / State Medical Council registration certificate to receive the Verified Doctor badge and publish internships.
              </p>
            </div>
          </div>
          <Link
            href="/doctor/verification"
            className="px-4 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 text-amber-100 font-semibold text-xs whitespace-nowrap shadow-xs transition-colors shrink-0"
          >
            Verification Center
          </Link>
        </div>
      )}

      {/* Standard Statistics Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <DashboardStatsCard
          title="Active Internships"
          value={summary.active_internships_count}
          subtitle={`Total posted: ${summary.total_internships_count}`}
          icon={Briefcase}
          colorVariant="emerald"
          href="/doctor/internships"
        />

        <DashboardStatsCard
          title="Student Applications"
          value={summary.applications_count}
          subtitle={`Shortlisted: ${summary.shortlisted_students_count}`}
          icon={Users}
          colorVariant="blue"
          href="/doctor/applications"
        />

        <DashboardStatsCard
          title="Live & Mentorship"
          value={summary.upcoming_sessions_count}
          subtitle="Interactive sessions"
          icon={Video}
          colorVariant="purple"
          href="/doctor/sessions"
        />

        <DashboardStatsCard
          title="Managed Clinics"
          value={summary.clinics_count}
          subtitle="Practice locations"
          icon={Building2}
          colorVariant="amber"
          href="/doctor/clinics"
        />
      </div>

      {/* Section: Quick Actions */}
      <DashboardSection
        title="Doctor Quick Actions"
        subtitle="Manage live lectures, clinical sessions, student applications, verified credentials and practice OPDs"
        icon={Stethoscope}
      >
        <DashboardQuickActions actions={quickActions} columns={3} />
      </DashboardSection>

      {/* Main 2-Column Section: Sessions/Applications & Messages/Trust */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Upcoming Sessions & Recent Applications */}
        <div className="lg:col-span-8 space-y-6">
          {/* Upcoming Sessions Card */}
          <DashboardCard
            title="Upcoming Mentorship & Live Sessions"
            subtitle="Scheduled clinical consultations, masterclasses and case study discussions"
            icon={Calendar}
            headerAction={
              <Link
                href="/doctor/sessions"
                className="text-xs font-semibold text-[#2F6B4F] dark:text-[#6FAF8A] hover:text-[#24563F] dark:hover:text-[#8BC4A2] inline-flex items-center gap-1"
              >
                <span>Studio & Sessions</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            }
          >
            {(summary?.upcoming_sessions || []).length === 0 ? (
              <DashboardEmptyState
                title="No Upcoming Sessions"
                message="You have no mentorship sessions scheduled at this moment."
                icon={Calendar}
                actionLabel="Schedule Session"
                actionHref="/doctor/sessions"
              />
            ) : (
              <div className="divide-y divide-[#DCE4DE] dark:divide-[#2B3A31]">
                {(summary?.upcoming_sessions || []).map((sess) => (
                  <div
                    key={sess.id}
                    className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <p className="text-xs sm:text-sm font-bold text-[#1B2A22] dark:text-[#E8F1EB]">
                        {sess.session_title}
                      </p>
                      <p className="text-[11px] text-[#64736A] dark:text-[#A9B9AE]">
                        Student: <span className="font-semibold">{sess.student_name}</span> •{" "}
                        {sess.session_type} ({sess.meeting_mode})
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-[#DCE8DF] dark:bg-[#26372D] text-[#2F6B4F] dark:text-[#6FAF8A] border border-[#DCE4DE] dark:border-[#2B3A31]">
                        {sess.scheduled_date} at {sess.start_time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </DashboardCard>

          {/* Recent Applications Card */}
          <DashboardCard
            title="Recent Internship Applications"
            subtitle="Students applying to your published clinical apprenticeships"
            icon={FileText}
            headerAction={
              <Link
                href="/doctor/applications"
                className="text-xs font-semibold text-[#2F6B4F] dark:text-[#6FAF8A] hover:text-[#24563F] dark:hover:text-[#8BC4A2] inline-flex items-center gap-1"
              >
                <span>All Applications</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            }
          >
            {(summary?.recent_applications || []).length === 0 ? (
              <DashboardEmptyState
                title="No Student Applications Yet"
                message="Applications will appear here as students apply for your clinical internships."
                icon={FileText}
                actionLabel="Create Internship"
                actionHref="/doctor/internships/new"
              />
            ) : (
              <div className="divide-y divide-[#DCE4DE] dark:divide-[#2B3A31]">
                {(summary?.recent_applications || []).map((app) => (
                  <div
                    key={app.id}
                    className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3"
                  >
                    <div className="space-y-0.5">
                      <p className="text-xs sm:text-sm font-bold text-[#1B2A22] dark:text-[#E8F1EB]">
                        {app.student_name}
                      </p>
                      <p className="text-[11px] text-[#64736A] dark:text-[#A9B9AE]">
                        Applied for: <span className="font-semibold">{app.internship_title}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          app.status === "SHORTLISTED"
                            ? "bg-emerald-100 dark:bg-emerald-950/80 text-[#2F6B4F] dark:text-[#6FAF8A]"
                            : app.status === "ACCEPTED"
                            ? "bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300"
                            : "bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300"
                        }`}
                      >
                        {app.status}
                      </span>
                      <Link
                        href="/doctor/applications"
                        className="text-xs text-[#2F6B4F] dark:text-[#6FAF8A] hover:underline font-semibold"
                      >
                        Review
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </DashboardCard>
        </div>

        {/* Right Column (4 cols): Direct Student Messages & Verification Status */}
        <div className="lg:col-span-4 space-y-6">
          {/* Direct Messages Card */}
          <DashboardCard
            title="Direct Inquiries"
            subtitle="Student consultations & queries"
            icon={MessageSquare}
            headerAction={
              <Link
                href="/doctor/messages"
                className="text-xs font-semibold text-[#2F6B4F] dark:text-[#6FAF8A] hover:text-[#24563F] dark:hover:text-[#8BC4A2] inline-flex items-center gap-1"
              >
                <span>Chat</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            }
          >
            {summary.recent_messages.length === 0 ? (
              <DashboardEmptyState
                title="No Recent Messages"
                message="No student inquiries at the moment."
                icon={MessageSquare}
                actionLabel="Open Messenger"
                actionHref="/doctor/messages"
              />
            ) : (
              <div className="divide-y divide-[#DCE4DE] dark:divide-[#2B3A31]">
                {summary.recent_messages.map((msg) => (
                  <Link
                    key={msg.id}
                    href="/doctor/messages"
                    className="py-3 first:pt-0 last:pb-0 block hover:bg-[#F7F9F4] dark:hover:bg-[#0F1713] -mx-2 px-2 rounded-xl transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-[#1B2A22] dark:text-[#E8F1EB]">
                        {msg.sender_name}
                      </span>
                      <span className="text-[10px] text-[#64736A] dark:text-[#A9B9AE]">
                        {new Date(msg.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-[#64736A] dark:text-[#A9B9AE] line-clamp-1">
                      {msg.content}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </DashboardCard>

          {/* NCISM Credential Trust Card */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-[#2F6B4F] to-[#24563F] text-white space-y-3 shadow-md border border-[#2F6B4F]/40">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-300" />
              <h4 className="font-serif-heading font-bold text-sm">
                NCISM Credential Assurance
              </h4>
            </div>
            <p className="text-xs text-[#DCE8DF] leading-relaxed">
              AyurSetu ensures every clinical mentor and faculty is authenticated with state medical councils and NCISM, ensuring clinical excellence.
            </p>
            <div className="pt-2">
              <Link
                href="/doctor/verification"
                className="inline-flex items-center gap-1 text-xs font-bold text-amber-200 hover:text-white transition-colors"
              >
                <span>View Registration & Badges</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
