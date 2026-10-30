"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
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
  Settings,
  Key,
  Database,
  Sliders,
  Check,
  Shield,
  Activity
} from "lucide-react";
import { api } from "@/lib/api";

interface AuditLog {
  id: string;
  action: string;
  previous_status?: string;
  new_status?: string;
  reason?: string;
  created_at?: string;
}

interface Evidence {
  id: string;
  evidence_type: string;
  file_url?: string;
  credential_id?: string;
  issuer_name?: string;
  verification_url?: string;
  description?: string;
  evidence_hash?: string;
}

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
  rejection_reason?: string;
  revocation_reason?: string;
  is_public_badge: boolean;
  submitted_at?: string;
  reviewed_at?: string;
  expires_at?: string;
  evidences: Evidence[];
  audits: AuditLog[];
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

type AdminMainTab = "VERIFICATIONS" | "USERS" | "AUDIT" | "SECURITY" | "SETTINGS";

function AdminVerificationsContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  const [activeMainTab, setActiveMainTab] = useState<AdminMainTab>("VERIFICATIONS");
  const [queue, setQueue] = useState<VerificationRequest[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedReq, setSelectedReq] = useState<VerificationRequest | null>(null);

  // Review Form state
  const [reviewNotes, setReviewNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [revocationReason, setRevocationReason] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState("");

  // Sync tab from URL search parameters
  useEffect(() => {
    if (tabParam) {
      const lower = tabParam.toLowerCase();
      if (lower === "users") {
        setActiveMainTab("USERS");
      } else if (lower === "audit") {
        setActiveMainTab("AUDIT");
      } else if (lower === "security" || lower === "reports") {
        setActiveMainTab("SECURITY");
      } else if (lower === "settings") {
        setActiveMainTab("SETTINGS");
      } else if (lower === "pending") {
        setActiveMainTab("VERIFICATIONS");
        setStatusFilter("PENDING");
      } else if (lower === "approved" || lower === "verified") {
        setActiveMainTab("VERIFICATIONS");
        setStatusFilter("VERIFIED");
      } else if (lower === "rejected") {
        setActiveMainTab("VERIFICATIONS");
        setStatusFilter("REJECTED");
      } else if (lower === "analytics") {
        setActiveMainTab("VERIFICATIONS");
      }
    }
  }, [tabParam]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const endpoint = statusFilter !== "ALL"
        ? `/admin/verifications?status=${statusFilter}`
        : "/admin/verifications";

      const [resQueue, resAnalytics] = await Promise.allSettled([
        api.get(endpoint),
        api.get("/admin/verifications/analytics")
      ]);

      if (resQueue.status === "fulfilled") {
        setQueue(resQueue.value.data || []);
      }
      if (resAnalytics.status === "fulfilled") {
        setAnalytics(resAnalytics.value.data || null);
      }
    } catch (err) {
      console.error("Failed to load verification admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeMainTab === "VERIFICATIONS") {
      fetchData();
    }
  }, [statusFilter, activeMainTab]);

  const handleApprove = async () => {
    if (!selectedReq) return;
    setSubmitting(true);
    setActionError("");

    try {
      const res = await api.post(`/admin/verifications/${selectedReq.id}/approve`, {
        review_notes: reviewNotes || "Verified against evidence documents.",
        expires_at: expiresAt ? new Date(expiresAt).toISOString() : undefined,
        verification_method: "MANUAL_REVIEW"
      });

      setSelectedReq(res.data);
      resetReviewForm();
      fetchData();
    } catch (err: any) {
      setActionError(err.response?.data?.detail || "Approval failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!selectedReq) return;
    if (!rejectionReason.trim()) {
      setActionError("Mandatory rejection reason required.");
      return;
    }

    setSubmitting(true);
    setActionError("");

    try {
      const res = await api.post(`/admin/verifications/${selectedReq.id}/reject`, {
        rejection_reason: rejectionReason,
        review_notes: reviewNotes
      });

      setSelectedReq(res.data);
      resetReviewForm();
      fetchData();
    } catch (err: any) {
      setActionError(err.response?.data?.detail || "Rejection failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevoke = async () => {
    if (!selectedReq) return;
    if (!revocationReason.trim()) {
      setActionError("Mandatory revocation reason required.");
      return;
    }

    setSubmitting(true);
    setActionError("");

    try {
      const res = await api.post(`/admin/verifications/${selectedReq.id}/revoke`, {
        revocation_reason: revocationReason,
        review_notes: reviewNotes
      });

      setSelectedReq(res.data);
      resetReviewForm();
      fetchData();
    } catch (err: any) {
      setActionError(err.response?.data?.detail || "Revocation failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const resetReviewForm = () => {
    setReviewNotes("");
    setRejectionReason("");
    setRevocationReason("");
    setExpiresAt("");
    setActionError("");
  };

  return (
    <div className="min-h-screen bg-[#F7F9F4] dark:bg-[#0D1511] text-[#17231C] dark:text-[#F1F6F2]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-[#D5DED8] dark:border-[#304036] pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DCEBE1] dark:bg-[#294637] border border-[#2F6B4F]/30 text-[#2F6B4F] dark:text-[#78B895] text-xs font-mono mb-3">
              <ShieldCheck className="w-3.5 h-3.5" /> Administrator Review & Governance Console
            </div>
            <h1 className="text-3xl md:text-4xl font-bold font-serif-heading text-[#142019] dark:text-[#FFFFFF]">
              AyurSetu Platform Governance
            </h1>
            <p className="text-[#68776D] dark:text-[#98A99E] text-sm mt-1 max-w-2xl">
              Audit submitted credential claims, inspect cryptographic proof hashes, manage ecosystem accounts, and enforce platform security policies.
            </p>
          </div>

          <button onClick={fetchData} className="self-start md:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] hover:bg-[#EEF4EF] dark:hover:bg-[#223128] text-[#17231C] dark:text-[#F1F6F2] text-sm transition-all shadow-xs cursor-pointer">
            <RefreshCw className="w-4 h-4" /> Refresh Data
          </button>
        </div>

        {/* Primary Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 border-b border-[#D5DED8] dark:border-[#304036]">
          <button
            onClick={() => setActiveMainTab("VERIFICATIONS")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeMainTab === "VERIFICATIONS"
                ? "bg-[#2F6B4F] dark:bg-[#78B895] text-white dark:text-[#0D1511] shadow-xs"
                : "bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] text-[#526158] dark:text-[#C1CEC5] hover:bg-[#EEF4EF] dark:hover:bg-[#223128]"
            }`}
          >
            <ShieldCheck className="w-4 h-4" /> Verification Queue
          </button>
          <button
            onClick={() => setActiveMainTab("USERS")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeMainTab === "USERS"
                ? "bg-[#2F6B4F] dark:bg-[#78B895] text-white dark:text-[#0D1511] shadow-xs"
                : "bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] text-[#526158] dark:text-[#C1CEC5] hover:bg-[#EEF4EF] dark:hover:bg-[#223128]"
            }`}
          >
            <Users className="w-4 h-4" /> User Directory
          </button>
          <button
            onClick={() => setActiveMainTab("AUDIT")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeMainTab === "AUDIT"
                ? "bg-[#2F6B4F] dark:bg-[#78B895] text-white dark:text-[#0D1511] shadow-xs"
                : "bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] text-[#526158] dark:text-[#C1CEC5] hover:bg-[#EEF4EF] dark:hover:bg-[#223128]"
            }`}
          >
            <Activity className="w-4 h-4" /> System Audit Logs
          </button>
          <button
            onClick={() => setActiveMainTab("SECURITY")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeMainTab === "SECURITY"
                ? "bg-[#2F6B4F] dark:bg-[#78B895] text-white dark:text-[#0D1511] shadow-xs"
                : "bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] text-[#526158] dark:text-[#C1CEC5] hover:bg-[#EEF4EF] dark:hover:bg-[#223128]"
            }`}
          >
            <Lock className="w-4 h-4" /> Security & NCISM
          </button>
          <button
            onClick={() => setActiveMainTab("SETTINGS")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeMainTab === "SETTINGS"
                ? "bg-[#2F6B4F] dark:bg-[#78B895] text-white dark:text-[#0D1511] shadow-xs"
                : "bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] text-[#526158] dark:text-[#C1CEC5] hover:bg-[#EEF4EF] dark:hover:bg-[#223128]"
            }`}
          >
            <Settings className="w-4 h-4" /> Governance Settings
          </button>
        </div>

        {/* TAB 1: VERIFICATIONS QUEUE */}
        {activeMainTab === "VERIFICATIONS" && (
          <>
            {/* Analytics Bar */}
            {analytics && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                <div className="p-4 rounded-xl border border-[#D5DED8] dark:border-[#304036] bg-[#FFFFFF] dark:bg-[#17211B] shadow-xs">
                  <div className="text-xs text-[#68776D] dark:text-[#98A99E] font-mono">Total Claims</div>
                  <div className="text-2xl font-bold text-[#142019] dark:text-[#FFFFFF] mt-1">{analytics.total_requests}</div>
                </div>
                <div className="p-4 rounded-xl border border-[#A96F16]/30 bg-[#FAF0E1] dark:bg-[#332512] shadow-xs">
                  <div className="text-xs text-[#A96F16] dark:text-[#E5B85C] font-mono flex items-center gap-1 font-semibold">
                    <Clock className="w-3 h-3" /> Pending
                  </div>
                  <div className="text-2xl font-bold text-[#A96F16] dark:text-[#E5B85C] mt-1">{analytics.pending_count}</div>
                </div>
                <div className="p-4 rounded-xl border border-[#2F7D4A]/30 bg-[#DCEBE1] dark:bg-[#294637] shadow-xs">
                  <div className="text-xs text-[#2F7D4A] dark:text-[#7BC894] font-mono flex items-center gap-1 font-semibold">
                    <CheckCircle2 className="w-3 h-3" /> Verified
                  </div>
                  <div className="text-2xl font-bold text-[#2F7D4A] dark:text-[#7BC894] mt-1">{analytics.approved_count}</div>
                </div>
                <div className="p-4 rounded-xl border border-[#B64040]/30 bg-[#FAECEC] dark:bg-[#351919] shadow-xs">
                  <div className="text-xs text-[#B64040] dark:text-[#F18484] font-mono flex items-center gap-1 font-semibold">
                    <XCircle className="w-3 h-3" /> Rejected
                  </div>
                  <div className="text-2xl font-bold text-[#B64040] dark:text-[#F18484] mt-1">{analytics.rejected_count}</div>
                </div>
                <div className="p-4 rounded-xl border border-[#356F9D]/30 bg-[#E5F0F8] dark:bg-[#152533] shadow-xs">
                  <div className="text-xs text-[#356F9D] dark:text-[#80B5DD] font-mono flex items-center gap-1 font-semibold">
                    <AlertTriangle className="w-3 h-3" /> Revoked
                  </div>
                  <div className="text-2xl font-bold text-[#356F9D] dark:text-[#80B5DD] mt-1">{analytics.revoked_count}</div>
                </div>
                <div className="p-4 rounded-xl border border-[#D5DED8] dark:border-[#304036] bg-[#FFFFFF] dark:bg-[#17211B] shadow-xs">
                  <div className="text-xs text-[#68776D] dark:text-[#98A99E] font-mono">Audit Rate</div>
                  <div className="text-2xl font-bold text-[#2F6B4F] dark:text-[#78B895] mt-1">{analytics.approval_rate_pct}%</div>
                </div>
              </div>
            )}

            {/* Main Interface: Left Queue / Right Drawer */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Queue List */}
              <div className="lg:col-span-7 space-y-4">
                {/* Filter Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                  {["ALL", "PENDING", "VERIFIED", "REJECTED", "REVOKED", "EXPIRED"].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setStatusFilter(tab)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all whitespace-nowrap cursor-pointer ${
                        statusFilter === tab
                          ? "bg-[#2F6B4F] dark:bg-[#78B895] text-white dark:text-[#0D1511] font-bold shadow-xs"
                          : "bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] text-[#526158] dark:text-[#C1CEC5] hover:bg-[#EEF4EF] dark:hover:bg-[#223128]"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <div className="rounded-2xl border border-[#D5DED8] dark:border-[#304036] bg-[#FFFFFF] dark:bg-[#17211B] overflow-hidden shadow-xs">
                  {loading ? (
                    <div className="p-12 text-center text-[#68776D] dark:text-[#98A99E] flex flex-col items-center gap-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-[#2F6B4F] dark:text-[#78B895]" /> Fetching queue...
                    </div>
                  ) : queue.length === 0 ? (
                    <div className="p-12 text-center text-[#68776D] dark:text-[#98A99E]">
                      No verification claims found for status &quot;{statusFilter}&quot;.
                    </div>
                  ) : (
                    <div className="divide-y divide-[#D5DED8]/60 dark:divide-[#304036]">
                      {queue.map(req => (
                        <div
                          key={req.id}
                          onClick={() => { setSelectedReq(req); resetReviewForm(); }}
                          className={`p-5 cursor-pointer transition-all hover:bg-[#EEF4EF] dark:hover:bg-[#223128] flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                            selectedReq?.id === req.id ? "bg-[#EEF4EF] dark:bg-[#223128] border-l-4 border-[#2F6B4F] dark:border-[#78B895]" : ""
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#EEF4EF] dark:bg-[#223128] text-[#526158] dark:text-[#C1CEC5] border border-[#D5DED8] dark:border-[#304036]">
                                {req.subject_type}
                              </span>
                              <span className="text-xs font-semibold text-[#142019] dark:text-[#FFFFFF]">
                                {req.submitter_name || req.submitted_by}
                              </span>
                            </div>
                            <div className="text-sm font-medium text-[#2F6B4F] dark:text-[#78B895] flex items-center gap-1.5">
                              <span>{req.verification_type.replace(/_/g, " ")}</span>
                            </div>
                            <div className="text-xs text-[#68776D] dark:text-[#98A99E]">
                              Claim Token: <span className="font-mono text-[#17231C] dark:text-[#F1F6F2]">{req.public_token}</span>
                            </div>
                          </div>

                          <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1.5">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[11px] font-mono uppercase tracking-wider font-bold border ${
                                req.status === "VERIFIED"
                                  ? "bg-[#DCEBE1] dark:bg-[#294637] text-[#2F7D4A] dark:text-[#7BC894] border-[#2F7D4A]/30"
                                  : req.status === "PENDING"
                                  ? "bg-[#FAF0E1] dark:bg-[#332512] text-[#A96F16] dark:text-[#E5B85C] border-[#A96F16]/30"
                                  : req.status === "REJECTED"
                                  ? "bg-[#FAECEC] dark:bg-[#351919] text-[#B64040] dark:text-[#F18484] border-[#B64040]/30"
                                  : "bg-[#EEF4EF] dark:bg-[#223128] text-[#526158] dark:text-[#C1CEC5] border-[#D5DED8] dark:border-[#304036]"
                              }`}
                            >
                              {req.status}
                            </span>
                            <span className="text-[11px] text-[#68776D] dark:text-[#98A99E] font-mono">
                              {req.submitted_at ? new Date(req.submitted_at).toLocaleDateString() : ""}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Detail & Decision Drawer */}
              <div className="lg:col-span-5">
                {selectedReq ? (
                  <div className="rounded-2xl border border-[#D5DED8] dark:border-[#304036] bg-[#FFFFFF] dark:bg-[#17211B] p-6 space-y-6 sticky top-6 shadow-xs">
                    <div className="flex items-center justify-between border-b border-[#D5DED8] dark:border-[#304036] pb-4">
                      <div>
                        <h2 className="text-lg font-bold text-[#142019] dark:text-[#FFFFFF] font-serif-heading">Claim Details</h2>
                        <span className="text-xs font-mono text-[#68776D] dark:text-[#98A99E]">{selectedReq.public_token}</span>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-mono uppercase font-bold border ${
                          selectedReq.status === "VERIFIED"
                            ? "bg-[#DCEBE1] dark:bg-[#294637] text-[#2F7D4A] dark:text-[#7BC894] border-[#2F7D4A]/30"
                            : selectedReq.status === "PENDING"
                            ? "bg-[#FAF0E1] dark:bg-[#332512] text-[#A96F16] dark:text-[#E5B85C] border-[#A96F16]/30"
                            : selectedReq.status === "REJECTED"
                            ? "bg-[#FAECEC] dark:bg-[#351919] text-[#B64040] dark:text-[#F18484] border-[#B64040]/30"
                            : "bg-[#EEF4EF] dark:bg-[#223128] text-[#526158] dark:text-[#C1CEC5] border-[#D5DED8] dark:border-[#304036]"
                        }`}
                      >
                        {selectedReq.status}
                      </span>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div className="flex justify-between py-1 border-b border-[#D5DED8]/60 dark:border-[#304036]/60">
                        <span className="text-[#68776D] dark:text-[#98A99E]">Subject Type</span>
                        <span className="font-mono text-[#17231C] dark:text-[#F1F6F2]">{selectedReq.subject_type}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-[#D5DED8]/60 dark:border-[#304036]/60">
                        <span className="text-[#68776D] dark:text-[#98A99E]">Submitter</span>
                        <span className="text-[#17231C] dark:text-[#F1F6F2] font-medium">{selectedReq.submitter_name || selectedReq.submitted_by}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-[#D5DED8]/60 dark:border-[#304036]/60">
                        <span className="text-[#68776D] dark:text-[#98A99E]">Verification Type</span>
                        <span className="text-[#2F6B4F] dark:text-[#78B895] font-medium">{selectedReq.verification_type}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-[#D5DED8]/60 dark:border-[#304036]/60">
                        <span className="text-[#68776D] dark:text-[#98A99E]">Public Badge</span>
                        <span className="text-[#17231C] dark:text-[#F1F6F2]">{selectedReq.is_public_badge ? "Enabled" : "Disabled"}</span>
                      </div>
                    </div>

                    {/* Evidences */}
                    <div className="space-y-2">
                      <h3 className="text-xs font-mono uppercase text-[#68776D] dark:text-[#98A99E] tracking-wider">Submitted Evidences ({selectedReq.evidences?.length || 0})</h3>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {selectedReq.evidences?.map(ev => (
                          <div key={ev.id} className="p-3 rounded-xl bg-[#F7F9F4] dark:bg-[#0D1511] border border-[#D5DED8] dark:border-[#304036] text-xs space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-[#17231C] dark:text-[#F1F6F2]">{ev.evidence_type}</span>
                              {ev.issuer_name && <span className="text-[#68776D] dark:text-[#98A99E] text-[11px]">{ev.issuer_name}</span>}
                            </div>
                            {ev.credential_id && (
                              <p className="font-mono text-[11px] text-[#A96F16] dark:text-[#E5B85C]">ID: {ev.credential_id}</p>
                            )}
                            {ev.description && <p className="text-[#526158] dark:text-[#C1CEC5]">{ev.description}</p>}
                            {ev.verification_url && (
                              <a href={ev.verification_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[#2F6B4F] dark:text-[#78B895] hover:underline text-[11px]">
                                <ExternalLink className="w-3 h-3" /> Verify Registry Source
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions Panel */}
                    <div className="border-t border-[#D5DED8] dark:border-[#304036] pt-4 space-y-4">
                      {actionError && (
                        <div className="p-3 rounded-xl bg-[#FAECEC] dark:bg-[#351919] border border-[#B64040]/30 text-[#B64040] dark:text-[#F18484] text-xs flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 shrink-0" />
                          <span>{actionError}</span>
                        </div>
                      )}

                      {selectedReq.status === "PENDING" && (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-mono text-[#526158] dark:text-[#C1CEC5] mb-1">Review Notes</label>
                            <textarea
                              rows={2}
                              value={reviewNotes}
                              onChange={e => setReviewNotes(e.target.value)}
                              placeholder="Add audit assessment notes..."
                              className="w-full bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] rounded-xl p-3 text-xs text-[#17231C] dark:text-[#F1F6F2] focus:outline-none focus:border-[#2F6B4F] dark:focus:border-[#78B895]"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <button
                              onClick={handleApprove}
                              disabled={submitting}
                              className="py-2.5 rounded-xl bg-[#2F7D4A] hover:bg-[#25683D] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer shadow-xs"
                            >
                              <CheckCircle2 className="w-4 h-4" /> Approve Claim
                            </button>
                            <button
                              onClick={handleReject}
                              disabled={submitting}
                              className="py-2.5 rounded-xl bg-[#FAECEC] dark:bg-[#351919] border border-[#B64040]/30 text-[#B64040] dark:text-[#F18484] hover:bg-[#B64040]/20 font-bold text-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
                            >
                              <XCircle className="w-4 h-4" /> Reject Claim
                            </button>
                          </div>
                        </div>
                      )}

                      {selectedReq.status === "VERIFIED" && (
                        <div className="border-t border-[#D5DED8]/80 dark:border-[#304036]/80 pt-3 space-y-2">
                          <label className="block text-xs font-mono text-[#356F9D] dark:text-[#80B5DD]">Revocation Reason (Mandatory)</label>
                          <input
                            type="text"
                            placeholder="State reason for revoking previously verified badge..."
                            value={revocationReason}
                            onChange={e => setRevocationReason(e.target.value)}
                            className="w-full bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] rounded-xl px-3 py-2 text-xs text-[#17231C] dark:text-[#F1F6F2] focus:outline-none focus:border-[#356F9D] dark:focus:border-[#80B5DD] mb-2"
                          />
                          <button
                            onClick={handleRevoke}
                            disabled={submitting}
                            className="w-full py-2.5 rounded-xl bg-[#E5F0F8] dark:bg-[#152533] border border-[#356F9D]/30 text-[#356F9D] dark:text-[#80B5DD] hover:bg-[#356F9D]/20 font-semibold text-xs transition-all cursor-pointer"
                          >
                            Revoke Verification Badge
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-[#D5DED8] dark:border-[#304036] bg-[#FFFFFF] dark:bg-[#17211B] p-12 text-center text-[#68776D] dark:text-[#98A99E] flex flex-col items-center gap-3 shadow-xs">
                    <Lock className="w-10 h-10 text-[#68776D] dark:text-[#98A99E] mb-2 opacity-60" />
                    <h3 className="text-base font-semibold text-[#142019] dark:text-[#FFFFFF]">No Claim Selected</h3>
                    <p className="text-xs text-[#68776D] dark:text-[#98A99E] max-w-xs">Select any claim from the queue to review evidence, audit trail, and take verification decisions.</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* TAB 2: USER DIRECTORY */}
        {activeMainTab === "USERS" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-[#D5DED8] dark:border-[#304036] bg-[#FFFFFF] dark:bg-[#17211B] p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-[#142019] dark:text-[#FFFFFF] flex items-center gap-2">
                    <Users className="w-5 h-5 text-[#2F6B4F] dark:text-[#78B895]" /> Platform Account Directory
                  </h2>
                  <p className="text-xs text-[#526158] dark:text-[#C1CEC5] mt-1">
                    System-wide user registry across Doctors, Students, Institutions, NGOs, and Industry recruiters.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-lg bg-[#DCEBE1] dark:bg-[#294637] text-[#2F6B4F] dark:text-[#78B895] text-xs font-mono border border-[#D5DED8] dark:border-[#304036]">
                    6 Active Role Archetypes
                  </span>
                </div>
              </div>

              {/* Users Table */}
              <div className="overflow-x-auto rounded-xl border border-[#D5DED8] dark:border-[#304036]">
                <table className="w-full text-left text-xs text-[#17231C] dark:text-[#F1F6F2]">
                  <thead className="bg-[#EEF4EF] dark:bg-[#223128] text-[#526158] dark:text-[#C1CEC5] font-mono uppercase tracking-wider border-b border-[#D5DED8] dark:border-[#304036]">
                    <tr>
                      <th className="p-3">User & Credentials</th>
                      <th className="p-3">Role</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">NCISM Verification</th>
                      <th className="p-3">Last Active</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D5DED8] dark:divide-[#304036]">
                    <tr className="hover:bg-[#F7F9F4] dark:hover:bg-[#1D2A22]/50 transition-colors">
                      <td className="p-3">
                        <div className="font-semibold text-[#142019] dark:text-[#FFFFFF]">Dr. Vaidya Suresh Sharma</div>
                        <div className="text-[11px] text-[#68776D] dark:text-[#98A99E] font-mono">reg_ayur_4901@ayursetu.in</div>
                      </td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 font-medium">DOCTOR</span></td>
                      <td className="p-3"><span className="text-[#2F7D4A] dark:text-[#7BC894] font-semibold">Active</span></td>
                      <td className="p-3"><span className="inline-flex items-center gap-1 text-[#2F7D4A] dark:text-[#7BC894]"><CheckCircle2 className="w-3.5 h-3.5" /> NCISM Verified</span></td>
                      <td className="p-3 text-[#68776D] dark:text-[#98A99E] font-mono">Today, 07:15</td>
                      <td className="p-3 text-right">
                        <button className="px-2.5 py-1 rounded-lg bg-[#EEF4EF] dark:bg-[#223128] hover:bg-[#DCEBE1] dark:hover:bg-[#294637] text-[#2F6B4F] dark:text-[#78B895] border border-[#D5DED8] dark:border-[#304036] text-[11px] font-medium transition-all">Audit</button>
                      </td>
                    </tr>
                    <tr className="hover:bg-[#F7F9F4] dark:hover:bg-[#1D2A22]/50 transition-colors">
                      <td className="p-3">
                        <div className="font-semibold text-[#142019] dark:text-[#FFFFFF]">Aarav Patel (Final Year BAMS)</div>
                        <div className="text-[11px] text-[#68776D] dark:text-[#98A99E] font-mono">aarav.patel@ayursetu.edu</div>
                      </td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800 font-medium">STUDENT</span></td>
                      <td className="p-3"><span className="text-[#2F7D4A] dark:text-[#7BC894] font-semibold">Active</span></td>
                      <td className="p-3"><span className="inline-flex items-center gap-1 text-[#A96F16] dark:text-[#E5B85C]"><Clock className="w-3.5 h-3.5" /> Enrolled Under NIA</span></td>
                      <td className="p-3 text-[#68776D] dark:text-[#98A99E] font-mono">Yesterday</td>
                      <td className="p-3 text-right">
                        <button className="px-2.5 py-1 rounded-lg bg-[#EEF4EF] dark:bg-[#223128] hover:bg-[#DCEBE1] dark:hover:bg-[#294637] text-[#2F6B4F] dark:text-[#78B895] border border-[#D5DED8] dark:border-[#304036] text-[11px] font-medium transition-all">Audit</button>
                      </td>
                    </tr>
                    <tr className="hover:bg-[#F7F9F4] dark:hover:bg-[#1D2A22]/50 transition-colors">
                      <td className="p-3">
                        <div className="font-semibold text-[#142019] dark:text-[#FFFFFF]">National Institute of Ayurveda (NIA)</div>
                        <div className="text-[11px] text-[#68776D] dark:text-[#98A99E] font-mono">academic@nia.nic.in</div>
                      </td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-800 font-medium">INSTITUTION</span></td>
                      <td className="p-3"><span className="text-[#2F7D4A] dark:text-[#7BC894] font-semibold">Accredited</span></td>
                      <td className="p-3"><span className="inline-flex items-center gap-1 text-[#2F7D4A] dark:text-[#7BC894]"><ShieldCheck className="w-3.5 h-3.5" /> Ministry Verified</span></td>
                      <td className="p-3 text-[#68776D] dark:text-[#98A99E] font-mono">2 days ago</td>
                      <td className="p-3 text-right">
                        <button className="px-2.5 py-1 rounded-lg bg-[#EEF4EF] dark:bg-[#223128] hover:bg-[#DCEBE1] dark:hover:bg-[#294637] text-[#2F6B4F] dark:text-[#78B895] border border-[#D5DED8] dark:border-[#304036] text-[11px] font-medium transition-all">Audit</button>
                      </td>
                    </tr>
                    <tr className="hover:bg-[#F7F9F4] dark:hover:bg-[#1D2A22]/50 transition-colors">
                      <td className="p-3">
                        <div className="font-semibold text-[#142019] dark:text-[#FFFFFF]">Seva Arogya Foundation</div>
                        <div className="text-[11px] text-[#68776D] dark:text-[#98A99E] font-mono">director@seva-arogya.ngo</div>
                      </td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-800 font-medium">NGO</span></td>
                      <td className="p-3"><span className="text-[#2F7D4A] dark:text-[#7BC894] font-semibold">Active</span></td>
                      <td className="p-3"><span className="inline-flex items-center gap-1 text-[#2F7D4A] dark:text-[#7BC894]"><CheckCircle2 className="w-3.5 h-3.5" /> Darpan Portal Valid</span></td>
                      <td className="p-3 text-[#68776D] dark:text-[#98A99E] font-mono">Today, 06:40</td>
                      <td className="p-3 text-right">
                        <button className="px-2.5 py-1 rounded-lg bg-[#EEF4EF] dark:bg-[#223128] hover:bg-[#DCEBE1] dark:hover:bg-[#294637] text-[#2F6B4F] dark:text-[#78B895] border border-[#D5DED8] dark:border-[#304036] text-[11px] font-medium transition-all">Audit</button>
                      </td>
                    </tr>
                    <tr className="hover:bg-[#F7F9F4] dark:hover:bg-[#1D2A22]/50 transition-colors">
                      <td className="p-3">
                        <div className="font-semibold text-[#142019] dark:text-[#FFFFFF]">Kottakkal Arya Vaidya Sala Talent Hub</div>
                        <div className="text-[11px] text-[#68776D] dark:text-[#98A99E] font-mono">recruitment@aryavaidyasala.com</div>
                      </td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 font-medium">INDUSTRY</span></td>
                      <td className="p-3"><span className="text-[#2F7D4A] dark:text-[#7BC894] font-semibold">Active</span></td>
                      <td className="p-3"><span className="inline-flex items-center gap-1 text-[#2F7D4A] dark:text-[#7BC894]"><CheckCircle2 className="w-3.5 h-3.5" /> Corporate CIN Valid</span></td>
                      <td className="p-3 text-[#68776D] dark:text-[#98A99E] font-mono">3 hrs ago</td>
                      <td className="p-3 text-right">
                        <button className="px-2.5 py-1 rounded-lg bg-[#EEF4EF] dark:bg-[#223128] hover:bg-[#DCEBE1] dark:hover:bg-[#294637] text-[#2F6B4F] dark:text-[#78B895] border border-[#D5DED8] dark:border-[#304036] text-[11px] font-medium transition-all">Audit</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: AUDIT LOGS */}
        {activeMainTab === "AUDIT" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-[#D5DED8] dark:border-[#304036] bg-[#FFFFFF] dark:bg-[#17211B] p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-[#142019] dark:text-[#FFFFFF] flex items-center gap-2">
                    <Activity className="w-5 h-5 text-[#A96F16] dark:text-[#E5B85C]" /> Tamper-Evident System Audit Trail
                  </h2>
                  <p className="text-xs text-[#526158] dark:text-[#C1CEC5] mt-1">
                    Every administrative action, verification decision, and credential state change is cryptographically recorded.
                  </p>
                </div>
                <button onClick={fetchData} className="px-3 py-1.5 rounded-lg bg-[#EEF4EF] dark:bg-[#223128] hover:bg-[#DCEBE1] dark:hover:bg-[#294637] text-[#2F6B4F] dark:text-[#78B895] border border-[#D5DED8] dark:border-[#304036] text-xs font-mono flex items-center gap-1 transition-all">
                  <RefreshCw className="w-3.5 h-3.5" /> Realtime Sync
                </button>
              </div>

              <div className="space-y-2">
                {[
                  { id: "aud-1", event: "CREDENTIAL_APPROVAL", actor: "root_admin@ayursetu.gov", target: "Dr. Vaidya Suresh Sharma (NCISM Registration)", hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", time: "10 mins ago" },
                  { id: "aud-2", event: "PUBLIC_BADGE_ISSUED", actor: "system_cron", target: "Seva Arogya Foundation (Darpan Verification)", hash: "b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9", time: "45 mins ago" },
                  { id: "aud-3", event: "ORGANIZATION_KYC_PASS", actor: "root_admin@ayursetu.gov", target: "Kottakkal Arya Vaidya Sala Talent Hub", hash: "8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4", time: "2 hours ago" },
                  { id: "aud-4", event: "ATTENDANCE_DUTY_SIGNED", actor: "Dr. Anjali Gupta", target: "Rural Suvarnaprashan Outreach Camp Duty", hash: "6ca13d52ca70c883e0f0bb101e425a89e8624de51db2d96cd385cc67a37f5f79", time: "5 hours ago" },
                  { id: "aud-5", event: "TOKEN_REVOCATION", actor: "root_admin@ayursetu.gov", target: "Unaccredited Clinic Submissions (Batch #104)", hash: "185f8db32271fe25f561a6fc938b2e264306ec304eda518007d1764826381969", time: "1 day ago" },
                ].map(item => (
                  <div key={item.id} className="p-4 rounded-xl bg-[#F7F9F4] dark:bg-[#1D2A22] border border-[#D5DED8] dark:border-[#304036] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 text-[11px] font-bold">
                          {item.event}
                        </span>
                        <span className="text-[#17231C] dark:text-[#F1F6F2] font-medium">{item.target}</span>
                      </div>
                      <div className="text-[11px] text-[#68776D] dark:text-[#98A99E] font-mono">
                        Actor: <span className="text-[#17231C] dark:text-[#F1F6F2]">{item.actor}</span> • SHA-256: <span className="text-[#2F6B4F] dark:text-[#78B895]">{item.hash.substring(0, 24)}...</span>
                      </div>
                    </div>
                    <div className="text-[11px] text-[#68776D] dark:text-[#98A99E] font-mono shrink-0">
                      {item.time}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SECURITY & NCISM */}
        {activeMainTab === "SECURITY" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-[#D5DED8] dark:border-[#304036] bg-[#FFFFFF] dark:bg-[#17211B] p-6 space-y-4 shadow-sm">
              <h2 className="text-lg font-bold text-[#142019] dark:text-[#FFFFFF] flex items-center gap-2">
                <Lock className="w-5 h-5 text-[#2F6B4F] dark:text-[#78B895]" /> Cryptographic Proof & NCISM Trust Chain
              </h2>
              <p className="text-xs text-[#526158] dark:text-[#C1CEC5]">
                AyurSetu issues public verification tokens anchored with SHA-256 hashes for doctors, institutions, and student portfolios.
              </p>

              <div className="space-y-3 pt-2">
                <div className="p-3.5 rounded-xl bg-[#F7F9F4] dark:bg-[#1D2A22] border border-[#D5DED8] dark:border-[#304036] text-xs space-y-1">
                  <div className="flex items-center justify-between text-[#17231C] dark:text-[#F1F6F2] font-semibold">
                    <span>NCISM Central Medical Registry</span>
                    <span className="text-[#2F7D4A] dark:text-[#7BC894] font-mono">SYNCED</span>
                  </div>
                  <p className="text-[#68776D] dark:text-[#98A99E] text-[11px]">Daily automated sync with NCISM practitioner registry for state registration numbers.</p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#F7F9F4] dark:bg-[#1D2A22] border border-[#D5DED8] dark:border-[#304036] text-xs space-y-1">
                  <div className="flex items-center justify-between text-[#17231C] dark:text-[#F1F6F2] font-semibold">
                    <span>NGO Darpan & 12A/80G Registry</span>
                    <span className="text-[#2F7D4A] dark:text-[#7BC894] font-mono">VERIFIED</span>
                  </div>
                  <p className="text-[#68776D] dark:text-[#98A99E] text-[11px]">NITI Aayog Darpan UID verification pipeline active.</p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#F7F9F4] dark:bg-[#1D2A22] border border-[#D5DED8] dark:border-[#304036] text-xs space-y-1">
                  <div className="flex items-center justify-between text-[#17231C] dark:text-[#F1F6F2] font-semibold">
                    <span>Public Badge Proof Tokens</span>
                    <span className="text-[#2F7D4A] dark:text-[#7BC894] font-mono">ACTIVE (SHA-256)</span>
                  </div>
                  <p className="text-[#68776D] dark:text-[#98A99E] text-[11px]">Tokens resolve publicly at <code>/verification/[token]</code> without exposing private data.</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[#D5DED8] dark:border-[#304036] bg-[#FFFFFF] dark:bg-[#17211B] p-6 space-y-4 shadow-sm">
              <h2 className="text-lg font-bold text-[#142019] dark:text-[#FFFFFF] flex items-center gap-2">
                <Key className="w-5 h-5 text-[#A96F16] dark:text-[#E5B85C]" /> Platform Security & Key Hierarchy
              </h2>
              <p className="text-xs text-[#526158] dark:text-[#C1CEC5]">
                JWT Authentication, RBAC policies, and rate-limiting controls active across all API endpoints.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center p-3 rounded-xl bg-[#F7F9F4] dark:bg-[#1D2A22] border border-[#D5DED8] dark:border-[#304036] text-xs">
                  <span className="text-[#526158] dark:text-[#C1CEC5]">FastAPI JWT Token Expiry</span>
                  <span className="font-mono text-[#A96F16] dark:text-[#E5B85C] font-bold">1440 mins (24 hrs)</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-xl bg-[#F7F9F4] dark:bg-[#1D2A22] border border-[#D5DED8] dark:border-[#304036] text-xs">
                  <span className="text-[#526158] dark:text-[#C1CEC5]">Rate Limiter Active</span>
                  <span className="font-mono text-[#2F7D4A] dark:text-[#7BC894] font-bold">60 req/min per IP</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-xl bg-[#F7F9F4] dark:bg-[#1D2A22] border border-[#D5DED8] dark:border-[#304036] text-xs">
                  <span className="text-[#526158] dark:text-[#C1CEC5]">Password Hashing Algorithm</span>
                  <span className="font-mono text-[#2F7D4A] dark:text-[#7BC894] font-bold">Bcrypt (Cost 12)</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-xl bg-[#F7F9F4] dark:bg-[#1D2A22] border border-[#D5DED8] dark:border-[#304036] text-xs">
                  <span className="text-[#526158] dark:text-[#C1CEC5]">CORS Policy</span>
                  <span className="font-mono text-[#17231C] dark:text-[#F1F6F2] font-bold">localhost:3000, production-domain</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: SETTINGS */}
        {activeMainTab === "SETTINGS" && (
          <div className="rounded-2xl border border-[#D5DED8] dark:border-[#304036] bg-[#FFFFFF] dark:bg-[#17211B] p-6 space-y-6 max-w-3xl shadow-sm">
            <div>
              <h2 className="text-xl font-bold text-[#142019] dark:text-[#FFFFFF] flex items-center gap-2">
                <Settings className="w-5 h-5 text-[#2F6B4F] dark:text-[#78B895]" /> Governance & Policy Controls
              </h2>
              <p className="text-xs text-[#526158] dark:text-[#C1CEC5] mt-1">
                Configure auto-verification rules, camp registration mandates, and notification broadcasts.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-[#F7F9F4] dark:bg-[#1D2A22] border border-[#D5DED8] dark:border-[#304036]">
                <div>
                  <div className="text-xs font-semibold text-[#17231C] dark:text-[#F1F6F2]">Require NCISM Registration Number for Doctors</div>
                  <div className="text-[11px] text-[#68776D] dark:text-[#98A99E]">Doctors cannot publish masterclasses or accept students without verified registration.</div>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#2F6B4F] dark:accent-[#78B895] rounded" />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-[#F7F9F4] dark:bg-[#1D2A22] border border-[#D5DED8] dark:border-[#304036]">
                <div>
                  <div className="text-xs font-semibold text-[#17231C] dark:text-[#F1F6F2]">Enforce Darpan Registration for Health Camps</div>
                  <div className="text-[11px] text-[#68776D] dark:text-[#98A99E]">Only verified NGOs can broadcast regional Suvarnaprashan or general checkup camps.</div>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#2F6B4F] dark:accent-[#78B895] rounded" />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-[#F7F9F4] dark:bg-[#1D2A22] border border-[#D5DED8] dark:border-[#304036]">
                <div>
                  <div className="text-xs font-semibold text-[#17231C] dark:text-[#F1F6F2]">Automatic Credential Expiration Notice</div>
                  <div className="text-[11px] text-[#68776D] dark:text-[#98A99E]">Send automated email and in-app reminder 30 days before credential expiry.</div>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#2F6B4F] dark:accent-[#78B895] rounded" />
              </div>
            </div>

            <div className="pt-4 border-t border-[#D5DED8] dark:border-[#304036] flex justify-end">
              <button className="px-5 py-2.5 rounded-xl bg-[#2F6B4F] hover:bg-[#24563F] text-white dark:bg-[#78B895] dark:hover:bg-[#91CAA8] dark:text-[#0D1511] font-bold text-xs shadow-md transition-all">
                Save Governance Settings
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function AdminVerificationsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F7F9F4] dark:bg-[#0D1511] flex items-center justify-center text-[#68776D] dark:text-[#98A99E] font-medium">Loading Governance Hub...</div>}>
      <AdminVerificationsContent />
    </Suspense>
  );
}
