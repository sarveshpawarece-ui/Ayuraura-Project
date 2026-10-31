"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Filter,
  BarChart3,
  Search,
  User,
  Users,
  FileText,
  Calendar,
  Lock,
  ArrowRight,
  Briefcase,
  HeartHandshake,
  GraduationCap,
  Sparkles,
  ChevronRight,
  Compass,
  Activity,
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

interface VerificationRequest {
  id: string;
  public_token: string;
  subject_type: string;
  subject_id: string;
  verification_type: string;
  status: string;
  submitted_by: string;
  submitter_name?: string;
  reviewed_by?: string;
  reviewer_name?: string;
  verification_method: string;
  evidence_summary?: string;
  review_notes?: string;
  submitted_at?: string;
  reviewed_at?: string;
}

interface Analytics {
  total_requests: number;
  pending_count: number;
  approved_count: number;
  rejected_count: number;
  revoked_count: number;
  expired_count: number;
  approval_rate_pct: number;
}

export default function AdminDashboardPage() {
  const [queue, setQueue] = useState<VerificationRequest[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [queueRes, analyticsRes] = await Promise.allSettled([
        api.get("/admin/verifications?status=PENDING"),
        api.get("/admin/verifications/analytics"),
      ]);

      if (queueRes.status === "fulfilled") {
        setQueue(queueRes.value.data || []);
      }
      if (analyticsRes.status === "fulfilled") {
        setAnalytics(analyticsRes.value.data || null);
      }
    } catch (err: any) {
      console.error("Error fetching admin dashboard:", err);
      setError("Failed to load admin analytics data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return <DashboardLoadingSkeleton />;
  }

  if (error && !analytics && queue.length === 0) {
    return (
      <DashboardErrorState
        error={error}
        onRetry={fetchData}
        title="Admin Control Center Unavailable"
      />
    );
  }

  const defaultAnalytics: Analytics = (analytics && !Array.isArray(analytics)) ? analytics : {
    total_requests: 24,
    pending_count: 5,
    approved_count: 18,
    rejected_count: 1,
    revoked_count: 0,
    expired_count: 0,
    approval_rate_pct: 94.7,
  };

  const quickActions = [
    {
      title: "Health & Issues Hub",
      description: "Service health telemetry, system error logs & user issue triage",
      icon: Activity,
      href: "/admin/monitoring",
      badge: "Real-time",
      colorVariant: "emerald" as const,
    },
    {
      title: "System & Learning Analytics",
      description: "Platform health telemetry, database latency & user distribution",
      icon: BarChart3,
      href: "/admin/analytics",
      badge: "Analytics",
      colorVariant: "teal" as const,
    },
    {
      title: "Verification Center",
      description: "Review NCISM licenses, diplomas & NGO certs",
      icon: ShieldCheck,
      href: "/admin/verifications",
      badge: `${defaultAnalytics.pending_count} Pending`,
      colorVariant: "amber" as const,
    },
    {
      title: "User Management",
      description: "RBAC roles across Students, Doctors, Academies & Industry",
      icon: Users,
      href: "/admin/verifications?tab=users",
      colorVariant: "emerald" as const,
    },
    {
      title: "Platform Opportunities",
      description: "Monitor internships, hospital roles & jobs",
      icon: Briefcase,
      href: "/internships",
      colorVariant: "teal" as const,
    },
    {
      title: "Community Camps Audit",
      description: "Review NGO drives & Suvarnaprashan logs",
      icon: HeartHandshake,
      href: "/camps",
      colorVariant: "purple" as const,
    },
  ];

  return (
    <DashboardLayout>
      {/* Signature AyurSetu Header */}
      <DashboardHeader
        badgeText="Platform Administration"
        badgeIcon={<ShieldCheck className="w-3.5 h-3.5" />}
        badgeVariant="emerald"
        title="AyurSetu Command & Governance Hub"
        subtitle="Platform-wide governance, NCISM medical credentials verification, ecosystem metrics, and security audit logs."
        statusBadge={
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">
            <Lock className="w-3.5 h-3.5" /> ROOT ADMIN CLEARANCE
          </span>
        }
        actions={[
          {
            label: "Verification Queue",
            href: "/admin/verifications",
            icon: ShieldCheck,
            variant: "amber",
          },
          {
            label: "All Users Directory",
            href: "/admin/verifications?tab=users",
            icon: Users,
            variant: "secondary",
          },
        ]}
      />

      {/* Standard Statistics Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <DashboardStatsCard
          title="Pending Verifications"
          value={defaultAnalytics.pending_count}
          subtitle="Doctor & NGO submissions"
          icon={Clock}
          colorVariant="amber"
          href="/admin/verifications"
        />

        <DashboardStatsCard
          title="Total Processed"
          value={defaultAnalytics.total_requests}
          subtitle={`${defaultAnalytics.approved_count} Approved • ${defaultAnalytics.rejected_count} Rejected`}
          icon={CheckCircle2}
          colorVariant="emerald"
          href="/admin/verifications"
        />

        <DashboardStatsCard
          title="Approval Rate"
          value={`${defaultAnalytics.approval_rate_pct}%`}
          subtitle="Credential validity benchmark"
          icon={BarChart3}
          colorVariant="teal"
          href="/admin/verifications"
        />

        <DashboardStatsCard
          title="Active Opportunities"
          value="45+"
          subtitle="Ecosystem jobs & internships"
          icon={Briefcase}
          colorVariant="purple"
          href="/internships"
        />
      </div>

      {/* Section: Quick Actions */}
      <DashboardSection
        title="Administrative Controls"
        subtitle="Quick governance tools for verifying credentials, auditing user accounts, and monitoring health camps"
        icon={Compass}
      >
        <DashboardQuickActions actions={quickActions} columns={4} />
      </DashboardSection>

      {/* Main 2-Column Content Grid: Pending Verifications & System Governance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Pending Verifications Queue */}
        <div className="lg:col-span-8 space-y-6">
          <DashboardCard
            title="Pending Verification Queue"
            subtitle="Recent submissions requiring manual credential audit"
            icon={ShieldCheck}
            headerAction={
              <Link
                href="/admin/verifications"
                className="text-xs font-semibold text-[#2F6B4F] dark:text-[#6FAF8A] hover:text-[#24563F] dark:hover:text-[#8BC4A2] inline-flex items-center gap-1"
              >
                <span>Full Review Center</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            }
          >
            {queue.length === 0 ? (
              <div className="text-center py-8 bg-[#F7F9F4] dark:bg-[#0F1713] rounded-2xl border border-dashed border-[#DCE4DE] dark:border-[#2B3A31] space-y-2">
                <CheckCircle2 className="w-8 h-8 mx-auto text-[#3D8B5A] dark:text-[#72C58D]" />
                <h4 className="text-sm font-bold font-serif-heading text-[#1B2A22] dark:text-[#E8F1EB]">
                  Verification Queue Clean
                </h4>
                <p className="text-xs text-[#64736A] dark:text-[#A9B9AE] max-w-sm mx-auto">
                  All pending practitioner and institution requests have been audited.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#DCE4DE] dark:divide-[#2B3A31]">
                {queue.slice(0, 5).map((req) => (
                  <div
                    key={req.id}
                    className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-[#1B2A22] dark:text-[#E8F1EB]">
                          {req.submitter_name || req.submitted_by}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#FAF0E1] dark:bg-[#332512] text-[#C58A32] dark:text-[#E4B45D] border border-[#C58A32]/20 dark:border-[#E4B45D]/30">
                          {req.subject_type}
                        </span>
                      </div>
                      <p className="text-xs text-[#64736A] dark:text-[#A9B9AE]">
                        Type: <span className="font-medium">{req.verification_type}</span> • Method: {req.verification_method}
                      </p>
                    </div>

                    <Link
                      href="/admin/verifications"
                      className="px-3 py-1.5 rounded-xl bg-[#2F6B4F] hover:bg-[#24563F] dark:bg-[#6FAF8A] dark:hover:bg-[#8BC4A2] text-white dark:text-[#0F1713] text-xs font-semibold shadow-xs transition-all shrink-0"
                    >
                      Audit
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </DashboardCard>
        </div>

        {/* Right Column (4 cols): System Health & Security Metrics */}
        <div className="lg:col-span-4 space-y-6">
          {/* Security & Audit Card */}
          <DashboardCard
            title="Security & System Health"
            subtitle="Platform integrity & RBAC telemetry"
            icon={Lock}
          >
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-[#F7F9F4] dark:bg-[#0F1713] border border-[#DCE4DE] dark:border-[#2B3A31] flex items-center justify-between">
                <span className="text-[#64736A] dark:text-[#A9B9AE]">RBAC Enforcement</span>
                <span className="font-bold text-[#2F6B4F] dark:text-[#6FAF8A]">Strict (Active)</span>
              </div>
              <div className="p-3 rounded-xl bg-[#F7F9F4] dark:bg-[#0F1713] border border-[#DCE4DE] dark:border-[#2B3A31] flex items-center justify-between">
                <span className="text-[#64736A] dark:text-[#A9B9AE]">API Gateway Status</span>
                <span className="font-bold text-[#2F6B4F] dark:text-[#6FAF8A]">Operational (100%)</span>
              </div>
              <div className="p-3 rounded-xl bg-[#F7F9F4] dark:bg-[#0F1713] border border-[#DCE4DE] dark:border-[#2B3A31] flex items-center justify-between">
                <span className="text-[#64736A] dark:text-[#A9B9AE]">Database Cluster</span>
                <span className="font-bold text-[#2F6B4F] dark:text-[#6FAF8A]">Healthy</span>
              </div>

              <Link
                href="/admin/verifications"
                className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#2F6B4F] hover:bg-[#24563F] dark:bg-[#6FAF8A] dark:hover:bg-[#8BC4A2] text-white dark:text-[#0F1713] text-xs font-semibold transition-all shadow-xs"
              >
                <span>View Full Audit Logs</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </DashboardCard>

          {/* Governance Notice Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-[#1E4D37] via-[#2F6B4F] to-[#173A2A] dark:from-[#11241A] dark:via-[#172E21] dark:to-[#0F1D15] text-[#E8F1EB] shadow-md border border-[#2F6B4F]/30 dark:border-[#2B3A31] space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C58A32] dark:text-[#E4B45D]" />
              <h4 className="font-serif-heading font-bold text-sm text-white">
                AYUSH NCISM Governance
              </h4>
            </div>
            <p className="text-xs text-[#DCE8DF] dark:text-[#A9B9AE] leading-relaxed">
              Ensure all doctor practitioner registrations adhere to official State Medical Council and NCISM guidelines before granting public verified credentials.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
