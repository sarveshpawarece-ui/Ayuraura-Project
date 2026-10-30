"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { api } from "@/lib/api";
import {
  ShieldCheck,
  ShieldAlert,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Plus,
  ExternalLink,
  Lock,
  Eye,
  EyeOff,
  RefreshCw,
  Award,
  BookOpen,
  Briefcase,
  User,
  GraduationCap,
  Sparkles,
  FileText
} from "lucide-react";

interface VerificationRequest {
  id: string;
  public_token: string;
  subject_type: string;
  subject_id: string;
  verification_type: string;
  status: string;
  verification_method: string;
  evidence_summary?: string;
  review_notes?: string;
  rejection_reason?: string;
  is_public_badge: boolean;
  submitted_at?: string;
  reviewed_at?: string;
  expires_at?: string;
  evidences: Array<{
    id: string;
    evidence_type: string;
    file_url?: string;
    credential_id?: string;
    issuer_name?: string;
    verification_url?: string;
    description?: string;
  }>;
}

export default function StudentVerificationPage() {
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showResubmitModal, setShowResubmitModal] = useState<VerificationRequest | null>(null);

  // Form State
  const [subjectType, setSubjectType] = useState("CERTIFICATION");
  const [subjectId, setSubjectId] = useState("");
  const [verificationType, setVerificationType] = useState("CERTIFICATION");
  const [evidenceSummary, setEvidenceSummary] = useState("");
  const [issuerName, setIssuerName] = useState("");
  const [credentialId, setCredentialId] = useState("");
  const [verificationUrl, setVerificationUrl] = useState("");
  const [description, setDescription] = useState("");
  const [isPublicBadge, setIsPublicBadge] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get("/student/verifications");
      setRequests(res.data || []);
    } catch (err) {
      console.error("Failed to load verifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");

    const finalSubId = subjectId.trim() || crypto.randomUUID();

    try {
      await api.post("/student/verifications", {
        subject_type: subjectType,
        subject_id: finalSubId,
        verification_type: verificationType,
        evidence_summary: evidenceSummary,
        is_public_badge: isPublicBadge,
        evidence: {
          evidence_type: verificationUrl ? "CREDENTIAL_URL" : "FILE",
          issuer_name: issuerName,
          credential_id: credentialId,
          verification_url: verificationUrl || undefined,
          description: description
        }
      });

      setShowCreateModal(false);
      resetForm();
      fetchRequests();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || "Failed to submit verification request");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showResubmitModal) return;
    setSubmitting(true);
    setErrorMsg("");

    try {
      await api.post(`/student/verifications/${showResubmitModal.id}/resubmit`, {
        evidence_summary: evidenceSummary || showResubmitModal.evidence_summary,
        evidence: {
          evidence_type: verificationUrl ? "CREDENTIAL_URL" : "FILE",
          issuer_name: issuerName,
          credential_id: credentialId,
          verification_url: verificationUrl || undefined,
          description: description
        }
      });

      setShowResubmitModal(null);
      resetForm();
      fetchRequests();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || "Failed to resubmit request");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleBadgeVisibility = async (reqId: string, currentVal: boolean) => {
    try {
      await api.patch(`/student/verifications/${reqId}/visibility?is_public_badge=${!currentVal}`);
      fetchRequests();
    } catch (err) {
      console.error("Failed to toggle badge visibility:", err);
    }
  };

  const resetForm = () => {
    setSubjectType("CERTIFICATION");
    setSubjectId("");
    setVerificationType("CERTIFICATION");
    setEvidenceSummary("");
    setIssuerName("");
    setCredentialId("");
    setVerificationUrl("");
    setDescription("");
    setIsPublicBadge(true);
    setErrorMsg("");
  };

  const totalVerified = requests.filter(r => r.status === "VERIFIED").length;
  const totalPending = requests.filter(r => r.status === "PENDING").length;
  const totalRejected = requests.filter(r => r.status === "REJECTED").length;

  return (
    <div className="min-h-screen bg-[#F7F9F4] dark:bg-[#0D1511] text-[#17231C] dark:text-[#F1F6F2] font-sans transition-colors duration-200">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 border-b border-[#D5DED8] dark:border-[#304036] pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DCEBE1] dark:bg-[#294637] border border-[#D5DED8] dark:border-[#304036] text-[#2F6B4F] dark:text-[#78B895] text-xs font-mono mb-3">
              <ShieldCheck className="w-3.5 h-3.5" /> Secure Evidence Audit Engine
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#142019] dark:text-[#FFFFFF]">
              Verification Center
            </h1>
            <p className="text-[#526158] dark:text-[#C1CEC5] text-sm mt-1 max-w-2xl">
              Submit credentials, certifications, and experience evidence for official audit verification. Verified badges appear on your public portfolio.
            </p>
          </div>

          <button
            onClick={() => { resetForm(); setShowCreateModal(true); }}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#2F6B4F] hover:bg-[#24563F] text-white dark:bg-[#78B895] dark:hover:bg-[#91CAA8] dark:text-[#0D1511] font-semibold text-sm shadow-md transition-all"
          >
            <Plus className="w-4 h-4 font-bold" /> Request Verification
          </button>
        </div>

        {/* Analytics Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <div className="p-6 rounded-2xl border border-[#2F7D4A]/30 dark:border-[#7BC894]/30 bg-[#FFFFFF] dark:bg-[#17211B] shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-mono text-[#2F7D4A] dark:text-[#7BC894] tracking-wider">Verified Badges</span>
              <CheckCircle2 className="w-5 h-5 text-[#2F7D4A] dark:text-[#7BC894]" />
            </div>
            <div className="text-3xl font-bold text-[#142019] dark:text-[#FFFFFF] mt-3">{totalVerified}</div>
            <p className="text-xs text-[#526158] dark:text-[#C1CEC5] mt-1">Audited & Active Badges</p>
          </div>

          <div className="p-6 rounded-2xl border border-[#A96F16]/30 dark:border-[#E5B85C]/30 bg-[#FFFFFF] dark:bg-[#17211B] shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-mono text-[#A96F16] dark:text-[#E5B85C] tracking-wider">Under Review</span>
              <Clock className="w-5 h-5 text-[#A96F16] dark:text-[#E5B85C]" />
            </div>
            <div className="text-3xl font-bold text-[#142019] dark:text-[#FFFFFF] mt-3">{totalPending}</div>
            <p className="text-xs text-[#526158] dark:text-[#C1CEC5] mt-1">Pending Audit Queue</p>
          </div>

          <div className="p-6 rounded-2xl border border-[#B64040]/30 dark:border-[#F18484]/30 bg-[#FFFFFF] dark:bg-[#17211B] shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-mono text-[#B64040] dark:text-[#F18484] tracking-wider">Action Needed</span>
              <XCircle className="w-5 h-5 text-[#B64040] dark:text-[#F18484]" />
            </div>
            <div className="text-3xl font-bold text-[#142019] dark:text-[#FFFFFF] mt-3">{totalRejected}</div>
            <p className="text-xs text-[#526158] dark:text-[#C1CEC5] mt-1">Rejected / Require Resubmission</p>
          </div>
        </div>

        {/* Requests Table */}
        <div className="rounded-2xl border border-[#D5DED8] dark:border-[#304036] bg-[#FFFFFF] dark:bg-[#17211B] overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-[#D5DED8] dark:border-[#304036] flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#142019] dark:text-[#FFFFFF] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#2F6B4F] dark:text-[#78B895]" /> Submitted Verification Claims
            </h2>
            <button onClick={fetchRequests} className="p-2 rounded-lg hover:bg-[#EEF4EF] dark:hover:bg-[#223128] text-[#68776D] dark:text-[#98A99E] hover:text-[#17231C] dark:hover:text-[#FFFFFF] transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {loading ? (
            <div className="p-12 text-center text-[#68776D] dark:text-[#98A99E] flex flex-col items-center gap-3">
              <RefreshCw className="w-6 h-6 animate-spin text-[#2F6B4F] dark:text-[#78B895]" /> Loading claims...
            </div>
          ) : requests.length === 0 ? (
            <div className="p-16 text-center text-[#68776D] dark:text-[#98A99E]">
              <ShieldAlert className="w-12 h-12 text-[#68776D] dark:text-[#98A99E] mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-[#142019] dark:text-[#FFFFFF]">No verification requests submitted yet</h3>
              <p className="text-sm text-[#526158] dark:text-[#C1CEC5] max-w-md mx-auto mt-1 mb-6">
                Submit evidence for your certificates, internship experiences, or educational qualifications to receive audited platform badges.
              </p>
              <button
                onClick={() => { resetForm(); setShowCreateModal(true); }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2F6B4F] hover:bg-[#24563F] text-white dark:bg-[#78B895] dark:hover:bg-[#91CAA8] dark:text-[#0D1511] text-sm font-semibold transition-all shadow-sm"
              >
                <Plus className="w-4 h-4" /> Submit First Claim
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-[#17231C] dark:text-[#F1F6F2]">
                <thead className="bg-[#EEF4EF] dark:bg-[#223128] text-xs font-mono uppercase text-[#526158] dark:text-[#C1CEC5] border-b border-[#D5DED8] dark:border-[#304036]">
                  <tr>
                    <th className="px-6 py-3.5">Type</th>
                    <th className="px-6 py-3.5">Claim Summary</th>
                    <th className="px-6 py-3.5">Submitted</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5">Public Badge</th>
                    <th className="px-6 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D5DED8] dark:divide-[#304036]">
                  {requests.map(req => (
                    <tr key={req.id} className="hover:bg-[#F7F9F4] dark:hover:bg-[#1D2A22]/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-[#142019] dark:text-[#FFFFFF]">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#EEF4EF] dark:bg-[#223128] text-xs text-[#2F6B4F] dark:text-[#78B895] font-mono border border-[#D5DED8] dark:border-[#304036]">
                          {req.verification_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 max-w-xs">
                        <div className="font-semibold text-[#142019] dark:text-[#FFFFFF] truncate">{req.evidence_summary || "Verification Evidence"}</div>
                        {req.evidences?.[0]?.issuer_name && (
                          <div className="text-xs text-[#68776D] dark:text-[#98A99E] font-mono mt-0.5">Issuer: {req.evidences[0].issuer_name}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs font-mono text-[#68776D] dark:text-[#98A99E]">
                        {req.submitted_at ? new Date(req.submitted_at).toLocaleDateString() : "N/A"}
                      </td>
                      <td className="px-6 py-4">
                        {req.status === "VERIFIED" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" /> VERIFIED
                          </span>
                        )}
                        {req.status === "PENDING" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-semibold">
                            <Clock className="w-3.5 h-3.5" /> PENDING
                          </span>
                        )}
                        {req.status === "REJECTED" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-100 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-xs font-semibold">
                            <XCircle className="w-3.5 h-3.5" /> REJECTED
                          </span>
                        )}
                        {req.status === "REVOKED" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-100 dark:bg-purple-950/60 border border-purple-300 dark:border-purple-800 text-purple-800 dark:text-purple-300 text-xs font-semibold">
                            <AlertTriangle className="w-3.5 h-3.5" /> REVOKED
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {req.status === "VERIFIED" ? (
                          <button
                            onClick={() => toggleBadgeVisibility(req.id, req.is_public_badge)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium border border-[#D5DED8] dark:border-[#304036] transition-colors ${
                              req.is_public_badge
                                ? "bg-[#DCEBE1] dark:bg-[#294637] text-[#2F6B4F] dark:text-[#78B895]"
                                : "bg-[#EEF4EF] dark:bg-[#223128] text-[#526158] dark:text-[#C1CEC5]"
                            }`}
                          >
                            {req.is_public_badge ? <Eye className="w-3.5 h-3.5 text-[#2F6B4F] dark:text-[#78B895]" /> : <EyeOff className="w-3.5 h-3.5" />}
                            {req.is_public_badge ? "Public" : "Private"}
                          </button>
                        ) : (
                          <span className="text-xs text-[#68776D] dark:text-[#98A99E] font-mono">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {req.status === "VERIFIED" && (
                            <a
                              href={`/verification/${req.public_token}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-lg bg-[#EEF4EF] dark:bg-[#223128] hover:bg-[#DCEBE1] dark:hover:bg-[#294637] text-[#2F6B4F] dark:text-[#78B895] text-xs inline-flex items-center gap-1 border border-[#D5DED8] dark:border-[#304036]"
                              title="View Public Proof"
                            >
                              <ExternalLink className="w-3.5 h-3.5" /> Proof
                            </a>
                          )}
                          {req.status === "REJECTED" && (
                            <button
                              onClick={() => { resetForm(); setShowResubmitModal(req); }}
                              className="px-3 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-[#B64040]/30 text-[#B64040] dark:text-[#F18484] hover:bg-rose-100 text-xs font-medium"
                            >
                              Resubmit
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Modal: Request New Verification */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] rounded-2xl w-full max-w-xl p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-[#142019] dark:text-[#FFFFFF] mb-2 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#2F6B4F] dark:text-[#78B895]" /> Request Verification Claim
            </h2>
            <p className="text-xs text-[#526158] dark:text-[#C1CEC5] mb-6">
              Submit official credential evidence. Claims are audited by platform administrators before badges are issued.
            </p>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-[#B64040]/30 text-[#B64040] dark:text-[#F18484] text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-[#526158] dark:text-[#C1CEC5] mb-1">Claim Subject Type</label>
                <select
                  value={subjectType}
                  onChange={e => { setSubjectType(e.target.value); setVerificationType(e.target.value); }}
                  className="w-full bg-[#FFFFFF] dark:bg-[#1D2A22] border border-[#D5DED8] dark:border-[#304036] rounded-xl px-4 py-2.5 text-sm text-[#17231C] dark:text-[#F1F6F2] focus:outline-none focus:border-[#2F6B4F] dark:focus:border-[#78B895]"
                >
                  <option value="CERTIFICATION">CERTIFICATION (Ayush / Professional Certificate)</option>
                  <option value="EDUCATION">EDUCATION (Degree / Diploma Qualification)</option>
                  <option value="EXPERIENCE">EXPERIENCE (Internship / Work Experience)</option>
                  <option value="ACHIEVEMENT">ACHIEVEMENT (Hackathon / Project Award)</option>
                  <option value="STUDENT">IDENTITY (Student Identity Verification)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-[#526158] dark:text-[#C1CEC5] mb-1">Claim Summary / Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. GMP Ayurvedic Quality Assurance Certificate"
                  value={evidenceSummary}
                  onChange={e => setEvidenceSummary(e.target.value)}
                  className="w-full bg-[#FFFFFF] dark:bg-[#1D2A22] border border-[#D5DED8] dark:border-[#304036] rounded-xl px-4 py-2.5 text-sm text-[#17231C] dark:text-[#F1F6F2] placeholder-[#68776D] dark:placeholder-[#98A99E] focus:outline-none focus:border-[#2F6B4F] dark:focus:border-[#78B895]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-[#526158] dark:text-[#C1CEC5] mb-1">Issuer Organization</label>
                  <input
                    type="text"
                    placeholder="e.g. Quality Council of India"
                    value={issuerName}
                    onChange={e => setIssuerName(e.target.value)}
                    className="w-full bg-[#FFFFFF] dark:bg-[#1D2A22] border border-[#D5DED8] dark:border-[#304036] rounded-xl px-4 py-2.5 text-sm text-[#17231C] dark:text-[#F1F6F2] placeholder-[#68776D] dark:placeholder-[#98A99E] focus:outline-none focus:border-[#2F6B4F] dark:focus:border-[#78B895]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-[#526158] dark:text-[#C1CEC5] mb-1">Credential / Reg. ID</label>
                  <input
                    type="text"
                    placeholder="e.g. QCI-AYUSH-2026-88"
                    value={credentialId}
                    onChange={e => setCredentialId(e.target.value)}
                    className="w-full bg-[#FFFFFF] dark:bg-[#1D2A22] border border-[#D5DED8] dark:border-[#304036] rounded-xl px-4 py-2.5 text-sm text-[#17231C] dark:text-[#F1F6F2] placeholder-[#68776D] dark:placeholder-[#98A99E] focus:outline-none focus:border-[#2F6B4F] dark:focus:border-[#78B895]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-[#526158] dark:text-[#C1CEC5] mb-1">Secure Verification URL (HTTPS only)</label>
                <input
                  type="url"
                  placeholder="https://ayush.gov.in/verify/QCI-AYUSH-2026-88"
                  value={verificationUrl}
                  onChange={e => setVerificationUrl(e.target.value)}
                  className="w-full bg-[#FFFFFF] dark:bg-[#1D2A22] border border-[#D5DED8] dark:border-[#304036] rounded-xl px-4 py-2.5 text-sm text-[#17231C] dark:text-[#F1F6F2] placeholder-[#68776D] dark:placeholder-[#98A99E] focus:outline-none focus:border-[#2F6B4F] dark:focus:border-[#78B895]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#526158] dark:text-[#C1CEC5] mb-1">Evidence Description & Notes</label>
                <textarea
                  rows={3}
                  placeholder="Provide context for the reviewer regarding how this evidence was earned..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full bg-[#FFFFFF] dark:bg-[#1D2A22] border border-[#D5DED8] dark:border-[#304036] rounded-xl px-4 py-2.5 text-sm text-[#17231C] dark:text-[#F1F6F2] placeholder-[#68776D] dark:placeholder-[#98A99E] focus:outline-none focus:border-[#2F6B4F] dark:focus:border-[#78B895] resize-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="public_badge"
                  checked={isPublicBadge}
                  onChange={e => setIsPublicBadge(e.target.checked)}
                  className="w-4 h-4 rounded border-[#D5DED8] dark:border-[#304036] accent-[#2F6B4F] dark:accent-[#78B895]"
                />
                <label htmlFor="public_badge" className="text-xs text-[#17231C] dark:text-[#F1F6F2]">
                  Enable public badge on portfolio upon verification approval
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#D5DED8] dark:border-[#304036]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#EEF4EF] dark:bg-[#223128] text-[#526158] dark:text-[#C1CEC5] text-sm hover:bg-[#DCEBE1] dark:hover:bg-[#294637] transition-all border border-[#D5DED8] dark:border-[#304036]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-[#2F6B4F] hover:bg-[#24563F] text-white dark:bg-[#78B895] dark:hover:bg-[#91CAA8] dark:text-[#0D1511] font-semibold text-sm transition-all shadow-md"
                >
                  {submitting ? "Submitting..." : "Submit Claim"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Resubmit Claim */}
      {showResubmitModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] rounded-2xl w-full max-w-xl p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-[#142019] dark:text-[#FFFFFF] mb-2 flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-[#A96F16] dark:text-[#E5B85C]" /> Resubmit Verification Evidence
            </h2>
            <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-[#B64040]/30 text-[#B64040] dark:text-[#F18484] text-xs">
              <div className="font-semibold mb-1">Rejection Reason:</div>
              {showResubmitModal.rejection_reason || "Evidence was insufficient or unverified."}
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-[#B64040]/30 text-[#B64040] dark:text-[#F18484] text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleResubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-[#526158] dark:text-[#C1CEC5] mb-1">Updated Claim Summary</label>
                <input
                  type="text"
                  required
                  value={evidenceSummary || showResubmitModal.evidence_summary || ""}
                  onChange={e => setEvidenceSummary(e.target.value)}
                  className="w-full bg-[#FFFFFF] dark:bg-[#1D2A22] border border-[#D5DED8] dark:border-[#304036] rounded-xl px-4 py-2.5 text-sm text-[#17231C] dark:text-[#F1F6F2] focus:outline-none focus:border-[#2F6B4F] dark:focus:border-[#78B895]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-[#526158] dark:text-[#C1CEC5] mb-1">Issuer Organization</label>
                  <input
                    type="text"
                    value={issuerName}
                    onChange={e => setIssuerName(e.target.value)}
                    className="w-full bg-[#FFFFFF] dark:bg-[#1D2A22] border border-[#D5DED8] dark:border-[#304036] rounded-xl px-4 py-2.5 text-sm text-[#17231C] dark:text-[#F1F6F2] focus:outline-none focus:border-[#2F6B4F] dark:focus:border-[#78B895]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-[#526158] dark:text-[#C1CEC5] mb-1">Credential ID</label>
                  <input
                    type="text"
                    value={credentialId}
                    onChange={e => setCredentialId(e.target.value)}
                    className="w-full bg-[#FFFFFF] dark:bg-[#1D2A22] border border-[#D5DED8] dark:border-[#304036] rounded-xl px-4 py-2.5 text-sm text-[#17231C] dark:text-[#F1F6F2] focus:outline-none focus:border-[#2F6B4F] dark:focus:border-[#78B895]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-[#526158] dark:text-[#C1CEC5] mb-1">Secure Verification URL (HTTPS only)</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={verificationUrl}
                  onChange={e => setVerificationUrl(e.target.value)}
                  className="w-full bg-[#FFFFFF] dark:bg-[#1D2A22] border border-[#D5DED8] dark:border-[#304036] rounded-xl px-4 py-2.5 text-sm text-[#17231C] dark:text-[#F1F6F2] focus:outline-none focus:border-[#2F6B4F] dark:focus:border-[#78B895]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#526158] dark:text-[#C1CEC5] mb-1">Clarification for Reviewer</label>
                <textarea
                  rows={3}
                  placeholder="Explain how the updated evidence resolves the previous rejection..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full bg-[#FFFFFF] dark:bg-[#1D2A22] border border-[#D5DED8] dark:border-[#304036] rounded-xl px-4 py-2.5 text-sm text-[#17231C] dark:text-[#F1F6F2] focus:outline-none focus:border-[#2F6B4F] dark:focus:border-[#78B895] resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#D5DED8] dark:border-[#304036]">
                <button
                  type="button"
                  onClick={() => setShowResubmitModal(null)}
                  className="px-4 py-2 rounded-xl bg-[#EEF4EF] dark:bg-[#223128] text-[#526158] dark:text-[#C1CEC5] text-sm hover:bg-[#DCEBE1] dark:hover:bg-[#294637] transition-all border border-[#D5DED8] dark:border-[#304036]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-[#A96F16] hover:bg-[#8A5B12] text-white dark:bg-[#E5B85C] dark:hover:bg-[#F0C973] dark:text-[#0D1511] font-semibold text-sm transition-all shadow-md"
                >
                  {submitting ? "Resubmitting..." : "Resubmit Evidence"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
