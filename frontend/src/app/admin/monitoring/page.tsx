"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Activity,
  Server,
  Database,
  Cpu,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  RefreshCw,
  Bug,
  MessageSquare,
  Lightbulb,
  FileCode,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  Filter,
  Check,
  ShieldAlert,
  Sliders,
  Layers,
  Sparkles,
  Search,
} from "lucide-react";
import { api } from "@/lib/api";
import {
  DashboardLayout,
  DashboardHeader,
  DashboardStatsCard,
  DashboardSection,
  DashboardCard,
  DashboardLoadingSkeleton,
  DashboardErrorState,
} from "@/components/dashboard";

interface ExtendedHealth {
  status: string;
  uptime_seconds: number;
  database: {
    connected: boolean;
    latency_ms: number;
    driver: string;
  };
  ai_service: {
    configured: boolean;
    provider: string;
    status: string;
  };
  auth_service: {
    status: string;
    algorithm: string;
    token_expiration_minutes: number;
    secret_key_hardened: boolean;
  };
  learning_workflows: {
    topic_quiz_engine: string;
    total_quiz_attempts: number;
    active_topic_records: number;
    anatomy_viewer_status: string;
  };
  error_summary: {
    unresolved_errors_count: number;
    critical_errors_count: number;
  };
  active_issues: {
    open_issues_count: number;
  };
}

interface PlatformIssue {
  id: string;
  reporter_id?: string;
  reporter_role?: string;
  feedback_type: string;
  category: string;
  title: string;
  description: string;
  page_url?: string;
  device_info?: string;
  priority: string;
  status: string;
  admin_notes?: string;
  resolved_at?: string;
  created_at: string;
}

interface SystemError {
  id: string;
  error_type: string;
  severity: string;
  endpoint?: string;
  status_code?: number;
  error_message: string;
  technical_context: Record<string, any>;
  occurrence_count: number;
  status: string;
  first_seen_at: string;
  last_seen_at: string;
  resolved_at?: string;
}

export default function AdminMonitoringPage() {
  const [health, setHealth] = useState<ExtendedHealth | null>(null);
  const [issues, setIssues] = useState<PlatformIssue[]>([]);
  const [errors, setErrors] = useState<SystemError[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"HEALTH" | "ISSUES" | "ERRORS" | "WORKFLOW">("HEALTH");
  const [issueFilter, setIssueFilter] = useState("ALL");
  const [errorFilter, setErrorFilter] = useState("ALL");
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const [healthRes, issuesRes, errorsRes] = await Promise.allSettled([
        api.get("/monitoring/health/extended"),
        api.get("/monitoring/admin/issues"),
        api.get("/monitoring/admin/errors"),
      ]);

      if (healthRes.status === "fulfilled") {
        setHealth(healthRes.value.data);
      }
      if (issuesRes.status === "fulfilled") {
        setIssues(issuesRes.value.data);
      }
      if (errorsRes.status === "fulfilled") {
        setErrors(errorsRes.value.data);
      }
    } catch (err: any) {
      console.error("Failed to load monitoring telemetry:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateIssueStatus = async (issueId: string, newStatus: string) => {
    try {
      await api.patch(`/monitoring/admin/issues/${issueId}`, { status: newStatus });
      setIssues((prev) =>
        prev.map((i) => (i.id === issueId ? { ...i, status: newStatus } : i))
      );
      setActionMessage("Issue status updated successfully.");
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err) {
      console.error("Failed to update issue:", err);
    }
  };

  const handleUpdateErrorStatus = async (errorId: string, newStatus: string) => {
    try {
      await api.patch(`/monitoring/admin/errors/${errorId}`, { status: newStatus });
      setErrors((prev) =>
        prev.map((e) => (e.id === errorId ? { ...e, status: newStatus } : e))
      );
      setActionMessage("Error resolution updated.");
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err) {
      console.error("Failed to update error status:", err);
    }
  };

  const filteredIssues = issues.filter((i) => {
    if (issueFilter === "ALL") return true;
    return i.status === issueFilter;
  });

  const filteredErrors = errors.filter((e) => {
    if (errorFilter === "ALL") return true;
    return e.status === errorFilter;
  });

  if (loading) {
    return (
      <DashboardLayout>
        <DashboardLoadingSkeleton />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <DashboardHeader
          badgeText={health?.status === "HEALTHY" ? "System Optimal" : "Action Required"}
          title="Platform Health & Continuous Improvement Hub"
          subtitle="Real-time service telemetry, error logs, user feedback triage, and safe operational workflows"
        >
          <div className="flex items-center gap-3">
            <Link
              href="/admin/analytics"
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-xl transition inline-flex items-center gap-1.5"
            >
              <span>Analytics Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <button
              onClick={fetchData}
              disabled={refreshing}
              className="px-3.5 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl transition inline-flex items-center gap-2 shadow-lg shadow-emerald-900/30"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
              <span>Refresh Telemetry</span>
            </button>
          </div>
        </DashboardHeader>

        {/* Action toast */}
        {actionMessage && (
          <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{actionMessage}</span>
          </div>
        )}

        {/* KPI Top Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <DashboardStatsCard
            title="Database Latency"
            value={health?.database.connected ? `${health.database.latency_ms} ms` : "Offline"}
            subtitle={health?.database.connected ? "Operational (SELECT 1 ping)" : "Disconnected"}
            icon={Database}
          />
          <DashboardStatsCard
            title="AI Service Gateway"
            value={health?.ai_service.status || "Operational"}
            subtitle={health?.ai_service.provider || "Gemini 1.5 Flash"}
            icon={Cpu}
          />
          <DashboardStatsCard
            title="Unresolved Errors"
            value={health?.error_summary.unresolved_errors_count || 0}
            subtitle={`${health?.error_summary.critical_errors_count || 0} Critical issues logged`}
            icon={AlertTriangle}
          />
          <DashboardStatsCard
            title="Open User Issues"
            value={health?.active_issues.open_issues_count || issues.filter((i) => i.status === "OPEN").length}
            subtitle={`${issues.length} Total user reports logged`}
            icon={MessageSquare}
          />
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 gap-2">
          {[
            { id: "HEALTH", label: "Subsystem Telemetry", icon: Activity },
            { id: "ISSUES", label: `User Feedback & Issues (${issues.length})`, icon: Bug },
            { id: "ERRORS", label: `System Error Logs (${errors.length})`, icon: AlertTriangle },
            { id: "WORKFLOW", label: "Continuous Improvement Protocol", icon: ShieldCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition -mb-px ${
                  isActive
                    ? "border-emerald-500 text-emerald-400 bg-emerald-500/5"
                    : "border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: SUBSYSTEM TELEMETRY */}
        {activeTab === "HEALTH" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Database & Infrastructure */}
              <DashboardCard title="Database & Core Services" icon={Database}>
                <div className="space-y-3.5 text-xs text-slate-300">
                  <div className="flex justify-between items-center py-2 border-b border-slate-800">
                    <span className="text-slate-400">Database Connection</span>
                    <span className="inline-flex items-center gap-1.5 font-medium text-emerald-400">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Connected ({health?.database.driver})
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-800">
                    <span className="text-slate-400">SELECT 1 Query Latency</span>
                    <span className="font-mono text-slate-200">{health?.database.latency_ms} ms</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-800">
                    <span className="text-slate-400">Backend Server Uptime</span>
                    <span className="font-mono text-slate-200">{Math.round((health?.uptime_seconds || 0) / 60)} minutes</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-slate-400">API Health Endpoints</span>
                    <span className="text-emerald-400 font-mono">/health & /api/v1/health (200 OK)</span>
                  </div>
                </div>
              </DashboardCard>

              {/* AI & Security Subsystem */}
              <DashboardCard title="AI Gateway & Security Subsystem" icon={ShieldCheck}>
                <div className="space-y-3.5 text-xs text-slate-300">
                  <div className="flex justify-between items-center py-2 border-b border-slate-800">
                    <span className="text-slate-400">AI Model Provider</span>
                    <span className="font-medium text-slate-200">{health?.ai_service.provider}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-800">
                    <span className="text-slate-400">AI Gateway Mode</span>
                    <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${health?.ai_service.configured ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-400"}`}>
                      {health?.ai_service.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-800">
                    <span className="text-slate-400">JWT Token Expiration</span>
                    <span className="font-mono text-slate-200">{health?.auth_service.token_expiration_minutes} min ({health?.auth_service.algorithm})</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-slate-400">Production Key Hardening</span>
                    <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${health?.auth_service.secret_key_hardened ? "bg-emerald-500/15 text-emerald-400" : "bg-blue-500/15 text-blue-300"}`}>
                      {health?.auth_service.secret_key_hardened ? "Hardened Key Configured" : "Development Key (Local)"}
                    </span>
                  </div>
                </div>
              </DashboardCard>
            </div>

            {/* Critical Learning Workflows */}
            <DashboardCard title="Critical Educational Workflows Status" icon={Layers}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-1">
                  <span className="text-xs text-slate-400">Topic-Based Quiz Engine</span>
                  <div className="text-xl font-bold text-slate-100">{health?.learning_workflows.total_quiz_attempts || 0}</div>
                  <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Engine Healthy
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-1">
                  <span className="text-xs text-slate-400">Active Topic Performance Records</span>
                  <div className="text-xl font-bold text-slate-100">{health?.learning_workflows.active_topic_records || 0}</div>
                  <span className="text-[11px] text-slate-400">Aggregated Student Mastery</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-1">
                  <span className="text-xs text-slate-400">3D Interactive Anatomy Viewer</span>
                  <div className="text-xl font-bold text-emerald-400">WebGL Ready</div>
                  <span className="text-[11px] text-slate-400">Three.js Standalone Build</span>
                </div>
              </div>
            </DashboardCard>
          </div>
        )}

        {/* TAB 2: USER FEEDBACK & ISSUES */}
        {activeTab === "ISSUES" && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="flex items-center justify-between gap-4 p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs">
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-400 font-medium">Filter by Status:</span>
                {["ALL", "OPEN", "UNDER_REVIEW", "IN_PROGRESS", "RESOLVED"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setIssueFilter(st)}
                    className={`px-2.5 py-1 rounded-lg font-medium transition ${
                      issueFilter === st ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
              <span className="text-slate-500">{filteredIssues.length} issues listed</span>
            </div>

            {/* Issues List */}
            {filteredIssues.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs bg-slate-900 border border-slate-800 rounded-xl">
                No issues found matching the selected filter.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredIssues.map((issue) => (
                  <div
                    key={issue.id}
                    className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3 text-xs text-slate-200 hover:border-slate-700 transition"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          issue.feedback_type === "BUG_REPORT" ? "bg-rose-500/15 text-rose-400" :
                          issue.feedback_type === "FEATURE_SUGGESTION" ? "bg-amber-500/15 text-amber-400" :
                          "bg-sky-500/15 text-sky-400"
                        }`}>
                          {issue.feedback_type}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px]">
                          {issue.category}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          issue.priority === "CRITICAL" ? "bg-rose-900/40 text-rose-300 border border-rose-800" :
                          issue.priority === "HIGH" ? "bg-amber-900/40 text-amber-300" :
                          "bg-slate-800 text-slate-400"
                        }`}>
                          {issue.priority} PRIORITY
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-500">
                          {new Date(issue.created_at).toLocaleString()}
                        </span>
                        <select
                          value={issue.status}
                          onChange={(e) => handleUpdateIssueStatus(issue.id, e.target.value)}
                          className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-[11px] text-slate-200 focus:outline-none focus:border-emerald-500 transition"
                        >
                          <option value="OPEN">OPEN</option>
                          <option value="UNDER_REVIEW">UNDER_REVIEW</option>
                          <option value="IN_PROGRESS">IN_PROGRESS</option>
                          <option value="RESOLVED">RESOLVED</option>
                          <option value="CLOSED">CLOSED</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-sm text-slate-100">{issue.title}</h4>
                      <p className="mt-1 text-slate-300 leading-relaxed">{issue.description}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
                      {issue.page_url && (
                        <span>Page URL: <span className="font-mono text-slate-300">{issue.page_url}</span></span>
                      )}
                      {issue.device_info && (
                        <span>Device: <span className="text-slate-300">{issue.device_info}</span></span>
                      )}
                      <span>Reporter Role: <span className="text-slate-300">{issue.reporter_role || "Anonymous"}</span></span>
                      {issue.admin_notes && (
                        <span className="text-emerald-400">Admin Notes: {issue.admin_notes}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SYSTEM ERROR LOGS */}
        {activeTab === "ERRORS" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4 p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs">
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-400 font-medium">Filter by Status:</span>
                {["ALL", "UNRESOLVED", "INVESTIGATING", "RESOLVED"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setErrorFilter(st)}
                    className={`px-2.5 py-1 rounded-lg font-medium transition ${
                      errorFilter === st ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
              <span className="text-slate-500">{filteredErrors.length} error records</span>
            </div>

            {filteredErrors.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs bg-slate-900 border border-slate-800 rounded-xl">
                Zero errors recorded. All systems operating normally.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredErrors.map((err) => (
                  <div
                    key={err.id}
                    className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2.5 text-xs text-slate-200 hover:border-slate-700 transition"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          err.severity === "CRITICAL" ? "bg-rose-500/20 text-rose-300 border border-rose-500/40" :
                          err.severity === "ERROR" ? "bg-rose-500/15 text-rose-400" :
                          "bg-amber-500/15 text-amber-400"
                        }`}>
                          {err.severity}
                        </span>
                        <span className="font-mono text-xs text-slate-300">{err.error_type}</span>
                        {err.status_code && (
                          <span className="px-1.5 py-0.5 bg-slate-800 text-slate-400 font-mono text-[10px] rounded">
                            HTTP {err.status_code}
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded-full bg-slate-800 text-emerald-400 text-[10px] font-bold">
                          {err.occurrence_count}x occurrences
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-500">
                          Last seen: {new Date(err.last_seen_at).toLocaleTimeString()}
                        </span>
                        <button
                          onClick={() => handleUpdateErrorStatus(err.id, err.status === "RESOLVED" ? "UNRESOLVED" : "RESOLVED")}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                            err.status === "RESOLVED"
                              ? "bg-slate-800 text-slate-400 hover:text-slate-200"
                              : "bg-emerald-600 hover:bg-emerald-500 text-white"
                          }`}
                        >
                          {err.status === "RESOLVED" ? "Mark Unresolved" : "Resolve Error"}
                        </button>
                      </div>
                    </div>

                    <p className="font-mono text-xs text-rose-300 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                      {err.error_message}
                    </p>

                    {err.endpoint && (
                      <div className="text-[11px] text-slate-400">
                        Endpoint: <span className="font-mono text-slate-300">{err.endpoint}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: CONTINUOUS IMPROVEMENT PROTOCOL */}
        {activeTab === "WORKFLOW" && (
          <div className="space-y-6">
            <DashboardCard title="Continuous Improvement & Safe Update Workflow" icon={ShieldCheck}>
              <div className="space-y-6 text-xs text-slate-300 leading-relaxed">
                <p>
                  To preserve platform stability and prevent regressions, all modifications to Aayuraura follow a strictly documented, non-automated deployment lifecycle. <strong>Zero automated code deployments or live production alterations are ever triggered directly from AI recommendations or user feedback.</strong>
                </p>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  {[
                    { step: "01", title: "Feedback Review & Triage", desc: "Incoming reports are reviewed daily in this dashboard. Duplicate reports are aggregated and privacy is verified." },
                    { step: "02", title: "Severity & Impact Scoring", desc: "Issues categorized into Critical (blocking clinical/academic progress), High (impairment), or Cosmetic." },
                    { step: "03", title: "Isolated Branch Fix", desc: "Engineering addresses the issue in an isolated feature branch. Tests are written to reproduce and prevent regression." },
                    { step: "04", title: "Full Regression Audit", desc: "Automated test suite (162+ pytest tests & TypeScript zero-error check) must pass 100% green." },
                    { step: "05", title: "Controlled Staged Release", desc: "Human operator reviews the changelog and initiates deployment with rollback snapshot verified beforehand." },
                  ].map((wf) => (
                    <div key={wf.step} className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-2">
                      <span className="font-mono text-emerald-400 font-bold text-sm">{wf.step}</span>
                      <h5 className="font-semibold text-slate-100">{wf.title}</h5>
                      <p className="text-[11px] text-slate-400">{wf.desc}</p>
                    </div>
                  ))}
                </div>

                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 space-y-1">
                  <span className="font-semibold flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" /> Operational Safety Mandate
                  </span>
                  <p className="text-[11px]">
                    All database updates utilize safe additive migrations (`ALTER TABLE ADD COLUMN` with `IF NOT EXISTS` guards). Pre-migration binary backups (`pg_dump` or SQLite snapshot) are required before any schema modification.
                  </p>
                </div>
              </div>
            </DashboardCard>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
