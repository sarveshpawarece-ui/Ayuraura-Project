"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { api } from "@/lib/api";
import {
  ArrowLeft,
  Briefcase,
  ExternalLink,
  Calendar,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Sparkles,
  FileText,
  Save,
  Trash2,
  CornerDownRight,
  ShieldCheck,
  TrendingUp,
  Award,
  Layers
} from "lucide-react";

export default function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [appData, setAppData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Form states
  const [notes, setNotes] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [coverLetterStatus, setCoverLetterStatus] = useState("NOT_REQUIRED");
  const [resumeVersion, setResumeVersion] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);

  // Status transition modal / controls
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [actionNotes, setActionNotes] = useState("");
  const [newStatus, setNewStatus] = useState("");

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/students/me/applications/${id}`);
      setAppData(res.data);
      setNotes(res.data.notes || "");
      setFollowUpDate(res.data.follow_up_date ? res.data.follow_up_date.split("T")[0] : "");
      setCoverLetterStatus(res.data.cover_letter_status || "NOT_REQUIRED");
      setResumeVersion(res.data.resume_version || "");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to load application details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const handleSaveDetails = async () => {
    try {
      setSavingNotes(true);
      await api.patch(`/students/me/applications/${id}`, {
        notes,
        follow_up_date: followUpDate ? new Date(followUpDate).toISOString() : null,
        cover_letter_status: coverLetterStatus,
        resume_version: resumeVersion
      });
      alert("Private details updated successfully!");
      fetchDetail();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to save details.");
    } finally {
      setSavingNotes(false);
    }
  };

  const handleMarkApplied = async () => {
    try {
      await api.post(`/students/me/applications/${id}/mark-applied`, {
        notes: actionNotes || "Applied via external provider portal.",
        cover_letter_status: coverLetterStatus,
        resume_version: resumeVersion
      });
      setShowApplyModal(false);
      setActionNotes("");
      alert("Application marked as Applied successfully!");
      fetchDetail();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to mark as applied.");
    }
  };

  const handleStatusChange = async (targetStatus: string) => {
    if (!targetStatus) return;
    try {
      await api.patch(`/students/me/applications/${id}/status`, {
        status: targetStatus,
        notes: `Status updated to ${targetStatus}`
      });
      alert(`Status updated to ${targetStatus}!`);
      setNewStatus("");
      fetchDetail();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to update status.");
    }
  };

  const handleWithdraw = async () => {
    try {
      await api.post(`/students/me/applications/${id}/withdraw`, {
        notes: actionNotes || "Withdrawn by student."
      });
      setShowWithdrawModal(false);
      setActionNotes("");
      alert("Application withdrawn.");
      fetchDetail();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to withdraw application.");
    }
  };

  const handleDeleteSaved = async () => {
    if (!confirm("Are you sure you want to remove this saved application?")) return;
    try {
      await api.delete(`/students/me/applications/${id}`);
      alert("Saved application deleted.");
      router.push("/student/applications");
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to delete saved application.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F9F4] dark:bg-[#0D1511] text-[#17231C] dark:text-[#F1F6F2] flex flex-col font-sans transition-colors duration-200">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="inline-block w-8 h-8 border-4 border-[#2F6B4F] dark:border-[#78B895] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error || !appData) {
    return (
      <div className="min-h-screen bg-[#F7F9F4] dark:bg-[#0D1511] text-[#17231C] dark:text-[#F1F6F2] flex flex-col font-sans transition-colors duration-200">
        <Navbar />
        <div className="flex-1 max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold text-[#17231C] dark:text-[#F1F6F2]">{error || "Application not found"}</h2>
          <Link href="/student/applications" className="inline-flex items-center gap-2 text-[#2F6B4F] dark:text-[#78B895] hover:underline font-semibold text-xs">
            <ArrowLeft className="w-4 h-4" /> Back to My Applications
          </Link>
        </div>
      </div>
    );
  }

  const opp = appData.opportunity;

  return (
    <div className="min-h-screen bg-[#F7F9F4] dark:bg-[#0D1511] text-[#17231C] dark:text-[#F1F6F2] flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Back Button */}
        <Link href="/student/applications" className="inline-flex items-center gap-2 text-[#526158] dark:text-[#C1CEC5] hover:text-[#2F6B4F] dark:hover:text-[#78B895] text-xs font-semibold transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to My Applications
        </Link>

        {/* Opportunity Summary Card */}
        <div className="bg-[#FFFFFF] dark:bg-[#17211B] rounded-3xl p-6 sm:p-8 border border-[#D5DED8] dark:border-[#304036] shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#DCEBE1] dark:bg-[#294637] text-[#2F6B4F] dark:text-[#78B895] border border-[#B9C8BE] dark:border-[#425449] uppercase tracking-wider">
                  {opp?.opportunity_type || "OPPORTUNITY"}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${
                  appData.status === "APPLIED" ? "bg-[#DCEBE1] text-[#2F6B4F] border-[#B9C8BE] dark:bg-[#294637] dark:text-[#78B895] dark:border-[#425449]" :
                  appData.status === "SAVED" ? "bg-[#EEF4EF] text-[#526158] border-[#D5DED8] dark:bg-[#223128] dark:text-[#C1CEC5] dark:border-[#304036]" :
                  "bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800"
                }`}>
                  {appData.status.replace("_", " ")}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-[#17231C] dark:text-[#F1F6F2] tracking-tight">
                {appData.title_snapshot || opp?.title}
              </h1>

              <p className="text-[#526158] dark:text-[#C1CEC5] text-sm font-medium">
                {appData.organization_snapshot || opp?.organization_name} • {opp?.location || "Remote / Various"}
              </p>
            </div>

            {/* External Application CTA */}
            {appData.application_url && (
              <a
                href={appData.application_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[#2F6B4F] hover:bg-[#24563F] dark:bg-[#78B895] dark:hover:bg-[#91CAA8] text-white dark:text-[#0D1511] font-bold text-xs transition-all shadow-xs shrink-0"
              >
                Open External Portal & Apply <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>

          {/* Banner Notice about Manual Tracking */}
          <div className="p-4 rounded-2xl bg-[#DCEBE1]/60 dark:bg-[#294637]/50 border border-[#B9C8BE] dark:border-[#425449] flex items-start gap-3 text-xs text-[#2F6B4F] dark:text-[#78B895]">
            <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
            <p>
              <strong>Aayuraura Application Protocol:</strong> Aayuraura connects you directly to industry provider application portals. Once you submit your application on the organization portal, update your status here to track your progress and interview milestones.
            </p>
          </div>
        </div>

        {/* Match Snapshot vs Real-time Match comparison */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-6 rounded-3xl bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] space-y-2 shadow-xs">
            <p className="text-xs font-semibold text-[#526158] dark:text-[#98A99E]">Match at Application Creation</p>
            <p className="text-3xl font-bold text-[#A96F16] dark:text-[#E5B85C]">{appData.match_score_snapshot}%</p>
            <p className="text-[11px] text-[#68776D] dark:text-[#98A99E]">Immutable snapshot preserved for compliance.</p>
          </div>

          <div className="p-6 rounded-3xl bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] space-y-2 shadow-xs">
            <p className="text-xs font-semibold text-[#526158] dark:text-[#98A99E]">Current Skill Profile Match</p>
            <div className="flex items-center gap-2">
              <p className="text-3xl font-bold text-[#2F7D4A] dark:text-[#7BC894]">{appData.current_match_score || "N/A"}%</p>
              {appData.match_score_delta !== null && (
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${appData.match_score_delta >= 0 ? "bg-emerald-100 dark:bg-emerald-950/60 text-[#2F7D4A] dark:text-[#7BC894]" : "bg-rose-100 dark:bg-rose-950/60 text-[#B64040] dark:text-[#F18484]"}`}>
                  {appData.match_score_delta >= 0 ? `+${appData.match_score_delta}%` : `${appData.match_score_delta}%`}
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#68776D] dark:text-[#98A99E]">Calculated in real-time as your skills update.</p>
          </div>

          <div className="p-6 rounded-3xl bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] space-y-2 shadow-xs">
            <p className="text-xs font-semibold text-[#526158] dark:text-[#98A99E]">Key Dates & Deadline</p>
            <div className="space-y-1 text-xs text-[#526158] dark:text-[#C1CEC5]">
              <p>Applied: <strong className="text-[#17231C] dark:text-[#F1F6F2]">{appData.applied_at ? new Date(appData.applied_at).toLocaleDateString() : "Not submitted yet"}</strong></p>
              <p>Deadline: <strong className="text-[#17231C] dark:text-[#F1F6F2]">{appData.application_deadline ? new Date(appData.application_deadline).toLocaleDateString() : "Rolling"}</strong></p>
            </div>
          </div>
        </div>

        {/* Status Lifecycle Controls */}
        <div className="bg-[#FFFFFF] dark:bg-[#17211B] rounded-3xl p-6 sm:p-8 border border-[#D5DED8] dark:border-[#304036] space-y-6 shadow-xs">
          <h3 className="text-lg font-bold text-[#17231C] dark:text-[#F1F6F2] flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#2F6B4F] dark:text-[#78B895]" /> Status Management & Lifecycle Actions
          </h3>

          <div className="flex flex-wrap items-center gap-4">
            {/* Mark as Applied CTA */}
            {(appData.status === "SAVED" || appData.status === "PLANNED") && (
              <button
                onClick={() => setShowApplyModal(true)}
                className="px-5 py-2.5 rounded-2xl bg-[#2F6B4F] hover:bg-[#24563F] dark:bg-[#78B895] dark:hover:bg-[#91CAA8] text-white dark:text-[#0D1511] font-bold text-xs transition-all shadow-xs flex items-center gap-2"
              >
                <Send className="w-4 h-4" /> Mark as Applied
              </button>
            )}

            {/* Advance Status Dropdown */}
            {appData.status !== "WITHDRAWN" && appData.status !== "EXPIRED" && appData.status !== "CLOSED" && (
              <div className="flex items-center gap-2 bg-[#EEF4EF] dark:bg-[#223128] border border-[#D5DED8] dark:border-[#304036] px-4 py-2 rounded-2xl text-xs">
                <span className="text-[#526158] dark:text-[#C1CEC5] font-medium">Update Status:</span>
                <select
                  value={newStatus}
                  onChange={(e) => {
                    setNewStatus(e.target.value);
                    if (e.target.value) handleStatusChange(e.target.value);
                  }}
                  className="bg-transparent text-[#2F6B4F] dark:text-[#78B895] font-bold focus:outline-none cursor-pointer"
                >
                  <option value="">Select new status...</option>
                  <option value="UNDER_REVIEW">Under Review</option>
                  <option value="SHORTLISTED">Shortlisted</option>
                  <option value="INTERVIEW">Interview Scheduled</option>
                  <option value="INTERVIEWED">Interviewed</option>
                  <option value="OFFERED">Job/Internship Offered</option>
                  <option value="ACCEPTED">Offer Accepted</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
            )}

            {/* Withdraw CTA */}
            {appData.status !== "WITHDRAWN" && appData.status !== "REJECTED" && appData.status !== "EXPIRED" && (
              <button
                onClick={() => setShowWithdrawModal(true)}
                className="px-4 py-2 rounded-2xl bg-rose-50 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-900 font-bold text-xs transition-all"
              >
                Withdraw Application
              </button>
            )}

            {/* Delete Saved CTA */}
            {appData.status === "SAVED" && (
              <button
                onClick={handleDeleteSaved}
                className="px-4 py-2 rounded-2xl bg-[#EEF4EF] text-[#526158] dark:bg-[#223128] dark:text-[#C1CEC5] hover:bg-rose-100 hover:text-rose-700 dark:hover:bg-rose-950/50 dark:hover:text-rose-300 font-bold text-xs transition-all flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete Saved
              </button>
            )}
          </div>
        </div>

        {/* Private Student Notes & Preparation Section */}
        <div className="bg-[#FFFFFF] dark:bg-[#17211B] rounded-3xl p-6 sm:p-8 border border-[#D5DED8] dark:border-[#304036] space-y-6 shadow-xs">
          <h3 className="text-lg font-bold text-[#17231C] dark:text-[#F1F6F2] flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#2F6B4F] dark:text-[#78B895]" /> Private Notes & Preparation Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#526158] dark:text-[#98A99E] mb-1">Follow-up Date</label>
              <input
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className="w-full bg-[#EEF4EF] dark:bg-[#223128] border border-[#D5DED8] dark:border-[#304036] rounded-2xl px-4 py-2.5 text-xs text-[#17231C] dark:text-[#F1F6F2] focus:outline-none focus:border-[#2F6B4F] dark:focus:border-[#78B895]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#526158] dark:text-[#98A99E] mb-1">Cover Letter Status</label>
              <select
                value={coverLetterStatus}
                onChange={(e) => setCoverLetterStatus(e.target.value)}
                className="w-full bg-[#EEF4EF] dark:bg-[#223128] border border-[#D5DED8] dark:border-[#304036] rounded-2xl px-4 py-2.5 text-xs text-[#17231C] dark:text-[#F1F6F2] focus:outline-none focus:border-[#2F6B4F] dark:focus:border-[#78B895]"
              >
                <option value="NOT_REQUIRED">Not Required</option>
                <option value="DRAFTED">Drafted</option>
                <option value="READY">Ready</option>
                <option value="SUBMITTED">Submitted</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#526158] dark:text-[#98A99E] mb-1">Resume Version Mapped</label>
              <input
                type="text"
                placeholder="e.g. v2_Ayush_RD_Specialist.pdf"
                value={resumeVersion}
                onChange={(e) => setResumeVersion(e.target.value)}
                className="w-full bg-[#EEF4EF] dark:bg-[#223128] border border-[#D5DED8] dark:border-[#304036] rounded-2xl px-4 py-2.5 text-xs text-[#17231C] dark:text-[#F1F6F2] focus:outline-none focus:border-[#2F6B4F] dark:focus:border-[#78B895]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#526158] dark:text-[#98A99E] mb-1">
              Private Preparation Notes (Visible only to you)
            </label>
            <textarea
              rows={5}
              maxLength={5000}
              placeholder="Record interview notes, technical questions, salary details, or follow-up contacts..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-[#EEF4EF] dark:bg-[#223128] border border-[#D5DED8] dark:border-[#304036] rounded-2xl p-4 text-xs text-[#17231C] dark:text-[#F1F6F2] focus:outline-none focus:border-[#2F6B4F] dark:focus:border-[#78B895] leading-relaxed placeholder:text-[#68776D] dark:placeholder:text-[#98A99E]"
            />
            <p className="text-[10px] text-[#68776D] dark:text-[#98A99E] text-right mt-1">{notes.length}/5000 characters</p>
          </div>

          <button
            onClick={handleSaveDetails}
            disabled={savingNotes}
            className="px-6 py-2.5 rounded-2xl bg-[#2F6B4F] hover:bg-[#24563F] dark:bg-[#78B895] dark:hover:bg-[#91CAA8] text-white dark:text-[#0D1511] font-bold text-xs transition-all flex items-center gap-2 shadow-xs"
          >
            <Save className="w-4 h-4" /> {savingNotes ? "Saving..." : "Save Private Details"}
          </button>
        </div>

        {/* Status History & Audit Log */}
        <div className="bg-[#FFFFFF] dark:bg-[#17211B] rounded-3xl p-6 sm:p-8 border border-[#D5DED8] dark:border-[#304036] space-y-4 shadow-xs">
          <h3 className="text-lg font-bold text-[#17231C] dark:text-[#F1F6F2] flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#2F6B4F] dark:text-[#78B895]" /> Status Transition Audit Log
          </h3>

          <div className="divide-y divide-[#D5DED8] dark:divide-[#304036]">
            {appData.status_history?.map((h: any) => (
              <div key={h.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#17231C] dark:text-[#F1F6F2] uppercase">{h.new_status.replace("_", " ")}</span>
                    {h.old_status && <span className="text-[#526158] dark:text-[#98A99E]">from {h.old_status.replace("_", " ")}</span>}
                  </div>
                  {h.notes && <p className="text-[#526158] dark:text-[#C1CEC5]">{h.notes}</p>}
                </div>

                <div className="text-[#68776D] dark:text-[#98A99E] text-[11px] font-mono">
                  {new Date(h.changed_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-[#17231C] dark:text-[#F1F6F2]">Confirm Application Submission</h3>
            <p className="text-xs text-[#526158] dark:text-[#C1CEC5]">
              Confirm that you have completed and submitted your application on the provider&apos;s portal.
            </p>
            <textarea
              rows={3}
              placeholder="Optional notes regarding submission..."
              value={actionNotes}
              onChange={(e) => setActionNotes(e.target.value)}
              className="w-full bg-[#EEF4EF] dark:bg-[#223128] border border-[#D5DED8] dark:border-[#304036] rounded-2xl p-3 text-xs text-[#17231C] dark:text-[#F1F6F2] focus:outline-none focus:border-[#2F6B4F] dark:focus:border-[#78B895] placeholder:text-[#68776D] dark:placeholder:text-[#98A99E]"
            />
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowApplyModal(false)}
                className="px-4 py-2 rounded-xl bg-[#EEF4EF] dark:bg-[#223128] text-[#526158] dark:text-[#C1CEC5] font-semibold text-xs hover:bg-[#D5DED8] dark:hover:bg-[#304036] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleMarkApplied}
                className="px-5 py-2 rounded-xl bg-[#2F6B4F] hover:bg-[#24563F] dark:bg-[#78B895] dark:hover:bg-[#91CAA8] text-white dark:text-[#0D1511] font-bold text-xs transition-colors"
              >
                Confirm Applied
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-[#17231C] dark:text-[#F1F6F2]">Withdraw Application</h3>
            <p className="text-xs text-[#526158] dark:text-[#C1CEC5]">
              Are you sure you want to withdraw this application? This action will record the withdrawal in your application history.
            </p>
            <textarea
              rows={3}
              placeholder="Reason for withdrawal (optional)..."
              value={actionNotes}
              onChange={(e) => setActionNotes(e.target.value)}
              className="w-full bg-[#EEF4EF] dark:bg-[#223128] border border-[#D5DED8] dark:border-[#304036] rounded-2xl p-3 text-xs text-[#17231C] dark:text-[#F1F6F2] focus:outline-none focus:border-[#2F6B4F] dark:focus:border-[#78B895] placeholder:text-[#68776D] dark:placeholder:text-[#98A99E]"
            />
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="px-4 py-2 rounded-xl bg-[#EEF4EF] dark:bg-[#223128] text-[#526158] dark:text-[#C1CEC5] font-semibold text-xs hover:bg-[#D5DED8] dark:hover:bg-[#304036] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleWithdraw}
                className="px-5 py-2 rounded-xl bg-[#B64040] hover:bg-rose-700 text-white font-bold text-xs transition-colors"
              >
                Confirm Withdraw
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
