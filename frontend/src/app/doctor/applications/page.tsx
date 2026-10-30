"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  MessageSquare,
  Calendar,
  Eye,
  FileText,
  Award,
  AlertCircle,
  Briefcase,
  Sparkles,
  ChevronRight,
  X,
  Send,
  Building2,
  MapPin,
  Check,
  UserCheck
} from "lucide-react";
import { api } from "@/lib/api";

interface StudentPreview {
  id: string;
  full_name: string;
  email?: string;
  phone?: string;
  profile_photo_url?: string;
  city?: string;
  state?: string;
  qualification?: string;
  college_name?: string;
  current_year_of_study?: string;
  skills: string[];
  profile_strength: number;
  verification_status: string;
  portfolio_slug?: string;
  resume_url?: string;
  bio?: string;
  assessment_score?: number;
}

interface ApplicationItem {
  id: string;
  internship_id: string;
  student_id: string;
  status: string;
  rejection_reason?: string;
  match_score: number;
  cover_note?: string;
  cover_letter?: string;
  resume_url?: string;
  portfolio_url?: string;
  additional_message?: string;
  applied_at: string;
  reviewed_at?: string;
  shortlisted_at?: string;
  rejected_at?: string;
  internship_title: string;
  internship_type: string;
  specialization: string;
  organization_name: string;
  location_city: string;
  location_state: string;
  mode: string;
  stipend_inr_month?: number;
  deadline?: string;
  student?: StudentPreview;
}

interface DoctorInternshipOption {
  id: string;
  title: string;
}

export default function DoctorApplicationsDashboardPage() {
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [internshipsList, setInternshipsList] = useState<DoctorInternshipOption[]>([]);
  const [selectedInternshipId, setSelectedInternshipId] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modal: View Application & Student Profile Preview
  const [activeApp, setActiveApp] = useState<ApplicationItem | null>(null);

  // Modal: Reject with reason
  const [rejectAppId, setRejectAppId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejecting, setRejecting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load Doctor's internships for dropdown
      const intRes = await api.get("/internships/doctor/me?status=ALL");
      setInternshipsList(intRes.data);

      // Load applications
      const params = new URLSearchParams();
      if (selectedInternshipId !== "ALL") params.append("internship_id", selectedInternshipId);
      if (statusFilter !== "ALL") params.append("status", statusFilter);
      if (searchQuery) params.append("search", searchQuery);

      const appRes = await api.get(`/doctor/applications?${params.toString()}`);
      setApplications(appRes.data);
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 401) {
        window.location.href = "/login";
        return;
      }
      setError(err.response?.data?.detail || "Failed to load applications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 200);
    return () => clearTimeout(timer);
  }, [selectedInternshipId, statusFilter, searchQuery]);

  const handleShortlist = async (appId: string) => {
    try {
      await api.post(`/applications/${appId}/shortlist`);
      setSuccessMsg("Candidate has been shortlisted! Notification sent.");
      await loadData();
      if (activeApp && activeApp.id === appId) {
        setActiveApp({ ...activeApp, status: "SHORTLISTED" });
      }
    } catch (err: any) {
      alert("Shortlisting failed: " + (err.response?.data?.detail || "Error"));
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectAppId) return;
    try {
      setRejecting(true);
      await api.post(`/applications/${rejectAppId}/reject`, {
        rejection_reason: rejectionReason || "Profile not suited for this cohort."
      });
      setSuccessMsg("Application rejected with reason. Notification dispatched.");
      setRejectAppId(null);
      setRejectionReason("");
      await loadData();
      if (activeApp && activeApp.id === rejectAppId) {
        setActiveApp({ ...activeApp, status: "REJECTED", rejection_reason: rejectionReason });
      }
    } catch (err: any) {
      alert("Rejection failed: " + (err.response?.data?.detail || "Error"));
    } finally {
      setRejecting(false);
    }
  };

  const totalApps = applications.length;
  const appliedCount = applications.filter((a) => a.status === "APPLIED" || a.status === "UNDER_REVIEW").length;
  const shortlistedCount = applications.filter((a) => a.status === "SHORTLISTED").length;
  const selectedCount = applications.filter((a) => a.status === "SELECTED" || a.status === "OFFERED" || a.status === "ACCEPTED").length;
  const rejectedCount = applications.filter((a) => a.status === "REJECTED").length;

  return (
    <div className="min-h-screen bg-[#fcfaf4] dark:bg-[#07160e] text-[#1a3827] dark:text-[#d1e2d7]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Top Breadcrumb & Title */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-[#5a7a67] dark:text-emerald-400">
              <Link href="/doctor/dashboard" className="hover:underline">Doctor Dashboard</Link>
              <span>/</span>
              <span className="font-bold text-[#143d26] dark:text-white">Internship Applications</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif-heading text-[#143d26] dark:text-white">
              Candidate Applications & Shortlisting
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/doctor/internships"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#cadacb] dark:border-white/10 text-xs font-semibold text-[#143d26] dark:text-white hover:bg-[#eef7f0]"
            >
              <Briefcase className="w-3.5 h-3.5 text-[#1a5b35]" />
              <span>Manage Internships</span>
            </Link>
          </div>
        </div>

        {successMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg(null)} className="text-emerald-700 hover:text-emerald-900">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
          <div className="p-4 rounded-2xl bg-white dark:bg-[#0c2419] border border-[#e5edd9] dark:border-white/10 shadow-xs">
            <p className="text-[10px] font-bold text-[#5a7a67] dark:text-emerald-400 uppercase tracking-wider">Total Received</p>
            <p className="text-xl font-bold font-serif-heading text-[#143d26] dark:text-white mt-0.5">{totalApps}</p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#0c2419] border border-[#e5edd9] dark:border-white/10 shadow-xs">
            <p className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">Pending Review</p>
            <p className="text-xl font-bold font-serif-heading text-amber-700 dark:text-amber-300 mt-0.5">{appliedCount}</p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#0c2419] border border-[#e5edd9] dark:border-white/10 shadow-xs">
            <p className="text-[10px] font-bold text-[#1a5b35] dark:text-emerald-400 uppercase tracking-wider">Shortlisted</p>
            <p className="text-xl font-bold font-serif-heading text-[#1a5b35] dark:text-emerald-300 mt-0.5">{shortlistedCount}</p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#0c2419] border border-[#e5edd9] dark:border-white/10 shadow-xs">
            <p className="text-[10px] font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider">Offered / Accepted</p>
            <p className="text-xl font-bold font-serif-heading text-indigo-700 dark:text-indigo-300 mt-0.5">{selectedCount}</p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#0c2419] border border-[#e5edd9] dark:border-white/10 shadow-xs">
            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Rejected</p>
            <p className="text-xl font-bold font-serif-heading text-slate-600 dark:text-slate-300 mt-0.5">{rejectedCount}</p>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0c2419] border border-[#e5edd9] dark:border-white/10 shadow-xs space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-6 relative">
              <Search className="w-4 h-4 text-[#759381] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search candidate name, skills, internship..."
                className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-[#f8faf6] dark:bg-white/5 border border-[#cadacb] dark:border-white/10 text-xs text-[#143d26] dark:text-white placeholder-[#8ca697] focus:outline-none"
              />
            </div>

            <div className="sm:col-span-6">
              <select
                value={selectedInternshipId}
                onChange={(e) => setSelectedInternshipId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#f8faf6] dark:bg-white/5 border border-[#cadacb] dark:border-white/10 text-xs text-[#143d26] dark:text-white focus:outline-none"
              >
                <option value="ALL">All Internships ({internshipsList.length})</option>
                {internshipsList.map((i) => (
                  <option key={i.id} value={i.id}>{i.title}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {["ALL", "APPLIED", "UNDER_REVIEW", "SHORTLISTED", "OFFERED", "SELECTED", "REJECTED", "WITHDRAWN"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-full font-semibold shrink-0 transition-all cursor-pointer ${
                  statusFilter === st
                    ? "bg-[#1a5b35] text-amber-100 shadow-xs"
                    : "bg-[#f8faf6] dark:bg-white/5 text-[#527260] dark:text-emerald-300 hover:bg-[#eef7f0]"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Applications List */}
        {loading ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-[#143924]/5 rounded-3xl" />
            ))}
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-[#0c2419] rounded-3xl border border-dashed border-[#d8e4d8] dark:border-white/10 space-y-3">
            <Users className="w-12 h-12 mx-auto text-[#7e9d8b]" />
            <h3 className="text-base font-bold font-serif-heading text-[#143d26] dark:text-white">
              No applications matching current filters
            </h3>
            <p className="text-xs text-[#5a7a67] dark:text-emerald-300 max-w-sm mx-auto">
              When students apply for your clinical internships, their profiles and verified certificates will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {applications.map((app) => {
              const student = app.student;
              const isApplied = app.status === "APPLIED" || app.status === "UNDER_REVIEW";
              const isShortlisted = app.status === "SHORTLISTED";
              const isRejected = app.status === "REJECTED";
              const isOffered = app.status === "OFFERED" || app.status === "SELECTED";

              return (
                <div
                  key={app.id}
                  className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#0c2419] border border-[#e5edd9] dark:border-white/10 shadow-xs hover:border-[#1a5b35] transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5"
                >
                  {/* Student Info & Target Internship */}
                  <div className="space-y-2.5 max-w-3xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isShortlisted
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300"
                          : isOffered
                          ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300"
                          : isRejected
                          ? "bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300"
                      }`}>
                        {app.status}
                      </span>

                      <span className="text-xs font-semibold text-[#1a5b35] dark:text-emerald-400">
                        {app.internship_title} ({app.specialization})
                      </span>

                      <span className="text-[11px] text-[#718f7d] dark:text-emerald-300/70">
                        • Applied on {app.applied_at?.split("T")[0]}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-[#143d26] text-amber-200 font-bold flex items-center justify-center text-sm shrink-0">
                        {student?.full_name?.charAt(0) || "S"}
                      </div>
                      <div>
                        <h2 className="text-base sm:text-lg font-bold font-serif-heading text-[#143d26] dark:text-white flex items-center gap-2">
                          <span>{student?.full_name || "Ayurveda Candidate"}</span>
                          {student?.verification_status === "VERIFIED" && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                              ✓ Verified
                            </span>
                          )}
                        </h2>
                        <p className="text-xs text-[#5a7a67] dark:text-emerald-200/90">
                          {student?.qualification || "BAMS Student"} • {student?.college_name || "Ayurvedic Medical College"} ({student?.city || "Pune"})
                        </p>
                      </div>
                    </div>

                    {/* Skills & Match Score */}
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                      <span className="px-2 py-0.5 rounded-md bg-[#eef7f0] dark:bg-emerald-950/60 text-[#1a5b35] dark:text-emerald-300 font-bold text-[11px]">
                        Match: {app.match_score}%
                      </span>

                      {student?.skills?.slice(0, 3).map((sk) => (
                        <span key={sk} className="px-2 py-0.5 rounded-md bg-[#f4f7f3] dark:bg-white/5 text-[10px] text-[#2c4737] dark:text-emerald-200 font-medium">
                          {sk}
                        </span>
                      ))}

                      {app.cover_note && (
                        <span className="text-[11px] text-[#527260] dark:text-emerald-300/80 italic line-clamp-1 max-w-md">
                          "{app.cover_note}"
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions Hub */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0 w-full lg:w-auto justify-end">
                    <button
                      onClick={() => setActiveApp(app)}
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 text-[#143d26] dark:text-white text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#1a5b35]" />
                      <span>View Profile</span>
                    </button>

                    <Link
                      href={`/doctor/messages?other_user_id=${student?.id || ""}`}
                      className="p-2 rounded-xl border border-[#cadacb] dark:border-white/10 text-[#143d26] dark:text-white hover:bg-[#eef7f0] transition-colors"
                      title="Send Message"
                    >
                      <MessageSquare className="w-4 h-4 text-[#1a5b35]" />
                    </Link>

                    <Link
                      href={`/doctor/sessions`}
                      className="p-2 rounded-xl border border-[#cadacb] dark:border-white/10 text-[#143d26] dark:text-white hover:bg-[#eef7f0] transition-colors"
                      title="Schedule Mentorship Session"
                    >
                      <Calendar className="w-4 h-4 text-[#1a5b35]" />
                    </Link>

                    {!isShortlisted && !isOffered && (
                      <button
                        onClick={() => handleShortlist(app.id)}
                        className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-[#1a5b35] hover:bg-[#124226] text-amber-100 text-xs font-bold transition-all shadow-xs cursor-pointer"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Shortlist</span>
                      </button>
                    )}

                    {!isRejected && (
                      <button
                        onClick={() => {
                          setRejectAppId(app.id);
                          setRejectionReason("");
                        }}
                        className="p-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs transition-colors cursor-pointer"
                        title="Reject Application"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* MODAL 1: Full Candidate Profile & Application Review */}
        {activeApp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
            <div className="w-full max-w-2xl bg-white dark:bg-[#0c2419] rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#d8e6d9] dark:border-white/10 space-y-6 my-8">
              <div className="flex items-center justify-between pb-3 border-b border-[#edf3eb] dark:border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-[#143d26] text-amber-200 font-bold flex items-center justify-center text-base">
                    {activeApp.student?.full_name?.charAt(0) || "S"}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold font-serif-heading text-[#143d26] dark:text-white">
                      {activeApp.student?.full_name}
                    </h3>
                    <p className="text-xs text-[#5a7a67] dark:text-emerald-300">
                      Applicant for {activeApp.internship_title}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveApp(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status Banner */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#eef7f0] dark:bg-white/5 border border-emerald-200 dark:border-emerald-800 text-xs">
                <div>
                  <span className="text-[#62816f] dark:text-emerald-300/80">Application Status:</span>
                  <span className="font-bold text-[#1a5b35] dark:text-emerald-300 ml-1.5 uppercase">
                    {activeApp.status}
                  </span>
                </div>
                <div className="font-semibold text-[#143d26] dark:text-white">
                  Match Score: <span className="text-emerald-700 font-bold">{activeApp.match_score}%</span>
                </div>
              </div>

              {/* Academic & Profile Details */}
              <div className="space-y-4 text-xs">
                <h4 className="font-bold text-sm text-[#143d26] dark:text-white flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-[#1a5b35]" />
                  <span>Academic & Clinical Background</span>
                </h4>

                <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-[#fafcf9] dark:bg-white/5 border border-[#e4ede3] dark:border-white/10">
                  <div>
                    <span className="text-[#72917f] block font-medium text-[11px]">Degree Program</span>
                    <span className="font-semibold text-[#143d26] dark:text-white">{activeApp.student?.qualification || "BAMS"}</span>
                  </div>
                  <div>
                    <span className="text-[#72917f] block font-medium text-[11px]">Current Year / Cohort</span>
                    <span className="font-semibold text-[#143d26] dark:text-white">{activeApp.student?.current_year_of_study || "Final Year"}</span>
                  </div>
                  <div>
                    <span className="text-[#72917f] block font-medium text-[11px]">Medical College</span>
                    <span className="font-semibold text-[#143d26] dark:text-white">{activeApp.student?.college_name || "Ayurvedic Medical College"}</span>
                  </div>
                  <div>
                    <span className="text-[#72917f] block font-medium text-[11px]">Location</span>
                    <span className="font-semibold text-[#143d26] dark:text-white">{activeApp.student?.city}, {activeApp.student?.state}</span>
                  </div>
                </div>

                {/* Verified Skills */}
                <div>
                  <span className="font-semibold text-[#3b5947] dark:text-emerald-300 block mb-1.5">Clinical Skills:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {activeApp.student?.skills?.map((sk) => (
                      <span key={sk} className="px-2.5 py-1 rounded-lg bg-[#eef7f0] dark:bg-emerald-950/60 text-[#1a5b35] dark:text-emerald-300 border border-[#c8dccb] dark:border-emerald-700/50 text-[11px] font-semibold">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Cover Letter */}
                <div>
                  <span className="font-semibold text-[#3b5947] dark:text-emerald-300 block mb-1">Cover Note / Statement of Purpose:</span>
                  <p className="p-3.5 rounded-2xl bg-[#fafcf9] dark:bg-white/5 border border-[#e4ede3] dark:border-white/10 text-xs text-[#395744] dark:text-emerald-100 leading-relaxed whitespace-pre-line">
                    {activeApp.cover_letter || activeApp.cover_note || "No cover note provided."}
                  </p>
                </div>

                {/* Attachments */}
                <div className="flex flex-wrap gap-3 pt-2">
                  {activeApp.resume_url && (
                    <a
                      href={activeApp.resume_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#cadacb] dark:border-white/10 text-xs font-semibold text-[#1a5b35] dark:text-emerald-300 hover:bg-[#eef7f0]"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>View Resume Document</span>
                    </a>
                  )}

                  {activeApp.portfolio_url && (
                    <a
                      href={activeApp.portfolio_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#cadacb] dark:border-white/10 text-xs font-semibold text-[#1a5b35] dark:text-emerald-300 hover:bg-[#eef7f0]"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Verified Digital Portfolio</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Action Buttons in Modal */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#edf3eb] dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setActiveApp(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700"
                >
                  Close
                </button>

                {activeApp.status !== "SHORTLISTED" && (
                  <button
                    type="button"
                    onClick={() => handleShortlist(activeApp.id)}
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#1a5b35] hover:bg-[#124226] text-amber-100 text-xs font-bold shadow-xs cursor-pointer"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Shortlist Candidate</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* MODAL 2: Rejection Reason Dialog */}
        {rejectAppId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="w-full max-w-md bg-white dark:bg-[#0c2419] rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#d8e6d9] dark:border-white/10 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#edf3eb] dark:border-white/10">
                <h3 className="text-base font-bold font-serif-heading text-rose-700 flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-rose-600" />
                  <span>Reject Application</span>
                </h3>
                <button onClick={() => setRejectAppId(null)} className="text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <p className="text-[#5a7a67] dark:text-emerald-300">
                  Please provide an optional feedback or reason for the student regarding this decision:
                </p>
                <textarea
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Current cohort is full; candidate does not meet pulse diagnosis prerequisite..."
                  className="w-full px-3.5 py-2 rounded-xl border border-[#cadacb] dark:border-white/15 bg-white dark:bg-[#07160e] text-xs text-[#143d26] dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#edf3eb] dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setRejectAppId(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleRejectConfirm}
                  disabled={rejecting}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold disabled:opacity-60 cursor-pointer"
                >
                  {rejecting ? "Rejecting..." : "Confirm Rejection"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
