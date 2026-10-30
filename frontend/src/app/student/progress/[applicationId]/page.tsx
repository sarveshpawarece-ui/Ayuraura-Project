"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { api } from "@/lib/api";
import {
  TrendingUp,
  CheckCircle2,
  Clock,
  Award,
  Activity,
  User,
  Building2,
  Calendar,
  Percent,
  ListTodo,
  FileCheck2,
  ChevronRight,
  Sparkles
} from "lucide-react";

export default function StudentProgressTrackerPage({
  params
}: {
  params: Promise<{ applicationId: string }>;
}) {
  const { applicationId } = use(params);
  const [progressData, setProgressData] = useState<any | null>(null);
  const [attendanceSummary, setAttendanceSummary] = useState<any | null>(null);
  const [certificateData, setCertificateData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showCertModal, setShowCertModal] = useState(false);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Student Feedback Form
  const [feedbackForm, setFeedbackForm] = useState({
    overall_rating: 5,
    learning_experience_rating: 5,
    doctor_mentorship_rating: 5,
    clinical_exposure_rating: 5,
    organization_rating: 5,
    facilities_rating: 5,
    overall_experience_comments: "Gained immense hands-on OPD and Panchakarma clinical insights under expert mentorship.",
    review_comments: "The diagnostic protocols and pulse reading sessions were profoundly structured and impactful.",
    is_anonymous: false,
    is_public: true
  });

  const fetchProgressAndAttendance = async () => {
    setLoading(true);
    try {
      const [progRes, attRes, certRes] = await Promise.allSettled([
        api.get(`/internships/applications/${applicationId}/progress`),
        api.get(`/internships/applications/${applicationId}/attendance`),
        api.get(`/internships/applications/${applicationId}/certificate`)
      ]);

      if (progRes.status === "fulfilled") {
        setProgressData(progRes.value.data);
      }
      if (attRes.status === "fulfilled") {
        setAttendanceSummary(attRes.value.data);
      }
      if (certRes.status === "fulfilled") {
        setCertificateData(certRes.value.data);
      }
    } catch (err) {
      console.error("Failed to load student progress:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStudentFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingFeedback(true);
    setFeedbackMsg(null);
    try {
      await api.post(`/internships/applications/${applicationId}/feedback/student`, {
        overall_rating: Number(feedbackForm.overall_rating),
        learning_experience_rating: Number(feedbackForm.learning_experience_rating),
        doctor_mentorship_rating: Number(feedbackForm.doctor_mentorship_rating),
        clinical_exposure_rating: Number(feedbackForm.clinical_exposure_rating),
        organization_rating: Number(feedbackForm.organization_rating),
        facilities_rating: Number(feedbackForm.facilities_rating),
        overall_experience_comments: feedbackForm.overall_experience_comments,
        review_comments: feedbackForm.review_comments,
        is_anonymous: feedbackForm.is_anonymous,
        is_public: feedbackForm.is_public
      });
      setFeedbackSuccess(true);
      setFeedbackMsg({ type: "success", text: "⭐ Thank you! Your mentorship feedback has been submitted successfully." });
      setTimeout(() => setShowFeedbackModal(false), 2000);
    } catch (err: any) {
      setFeedbackMsg({ type: "error", text: err.response?.data?.detail || "Failed to submit feedback." });
    } finally {
      setSubmittingFeedback(false);
    }
  };

  useEffect(() => {
    fetchProgressAndAttendance();
  }, [applicationId]);

  return (
    <div className="min-h-screen bg-[#F7F9F4] dark:bg-[#0D1511] text-[#17231C] dark:text-[#F1F6F2] transition-colors duration-200">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#D5DED8] dark:border-[#304036] pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#2F6B4F] dark:text-[#78B895] uppercase tracking-wider mb-1">
              <TrendingUp className="w-4 h-4" /> Clinical Rotation Tracker • Phase 6
            </div>
            <h1 className="text-3xl font-serif font-bold text-[#142019] dark:text-[#FFFFFF] tracking-tight">
              My Internship Progress & Certification
            </h1>
            <p className="text-sm text-[#526158] dark:text-[#C1CEC5] mt-1">
              Monitor your clinical competency achievements, verified attendance logs, and download official NCISM certificates.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowFeedbackModal(true)}
              className="px-4 py-2 rounded-xl bg-[#EEF4EF] dark:bg-[#223128] hover:bg-[#DCEBE1] dark:hover:bg-[#294637] text-[#17231C] dark:text-[#F1F6F2] text-xs font-semibold border border-[#D5DED8] dark:border-[#304036] transition-all flex items-center gap-1.5 shadow-sm"
            >
              ⭐ Submit Feedback
            </button>
            {certificateData && (
              <button
                onClick={() => setShowCertModal(true)}
                className="px-4 py-2 rounded-xl bg-[#2F6B4F] hover:bg-[#24563F] text-white dark:bg-[#78B895] dark:hover:bg-[#91CAA8] dark:text-[#0D1511] text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
              >
                <Award className="w-4 h-4" /> View Official Certificate
              </button>
            )}
            <Link
              href="/student/offers"
              className="px-4 py-2 rounded-xl bg-[#EEF4EF] dark:bg-[#223128] hover:bg-[#DCEBE1] dark:hover:bg-[#294637] text-[#17231C] dark:text-[#F1F6F2] text-xs font-semibold border border-[#D5DED8] dark:border-[#304036] transition-all flex items-center gap-2 shadow-sm"
            >
              <Award className="w-4 h-4 text-[#2F6B4F] dark:text-[#78B895]" /> View Offer
            </Link>
          </div>
        </div>

        {/* Certificate Graduation Banner if completed */}
        {certificateData && (
          <div className="p-6 rounded-3xl bg-gradient-to-r from-[#DCEBE1] via-[#FFFFFF] to-[#EEF4EF] dark:from-[#294637]/80 dark:via-[#17211B] dark:to-[#1D2A22] border border-[#2F7D4A]/40 dark:border-[#7BC894]/40 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-[#A96F16]/40 dark:border-[#E5B85C]/40 flex items-center justify-center text-[#A96F16] dark:text-[#E5B85C] shrink-0">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#A96F16] dark:text-[#E5B85C] uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" /> Rotation Completed & Certificate Issued!
                </div>
                <p className="text-xs text-[#526158] dark:text-[#C1CEC5] mt-0.5">
                  Your supervisor has verified your clinical hours. Your verifiable certificate has been issued and linked to your public portfolio.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowCertModal(true)}
                className="px-4 py-2 rounded-xl bg-[#2F6B4F] hover:bg-[#24563F] text-white dark:bg-[#78B895] dark:hover:bg-[#91CAA8] dark:text-[#0D1511] text-xs font-bold transition shadow-sm"
              >
                View Certificate
              </button>
              <Link
                href={`/verify/certificate/${certificateData.certificate_token}`}
                target="_blank"
                className="px-4 py-2 rounded-xl bg-[#EEF4EF] dark:bg-[#223128] hover:bg-[#DCEBE1] dark:hover:bg-[#294637] text-[#17231C] dark:text-[#F1F6F2] text-xs font-semibold border border-[#D5DED8] dark:border-[#304036] transition"
              >
                Public Registry Link ↗
              </Link>
            </div>
          </div>
        )}

        {loading ? (
          <div className="py-24 text-center space-y-3">
            <div className="inline-block w-8 h-8 border-4 border-[#2F6B4F] dark:border-[#78B895] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-[#68776D] dark:text-[#98A99E]">Loading your rotation progress...</p>
          </div>
        ) : !progressData ? (
          <div className="p-12 text-center bg-[#FFFFFF] dark:bg-[#17211B] rounded-3xl border border-[#D5DED8] dark:border-[#304036] text-[#68776D] dark:text-[#98A99E] text-xs shadow-sm">
            No progress record found for this clinical internship.
          </div>
        ) : (
          <div className="space-y-8">
            {/* Rotation Card */}
            <div className="bg-[#FFFFFF] dark:bg-[#17211B] rounded-3xl p-6 border border-[#D5DED8] dark:border-[#304036] shadow-sm space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#D5DED8] dark:border-[#304036] pb-5">
                <div>
                  <span className="text-[10px] font-mono text-[#2F6B4F] dark:text-[#78B895] uppercase tracking-widest block">
                    Active Clinical Rotation
                  </span>
                  <h2 className="text-xl font-serif font-bold text-[#142019] dark:text-[#FFFFFF] mt-0.5">
                    {progressData.internship_title}
                  </h2>
                  <p className="text-xs text-[#526158] dark:text-[#C1CEC5] flex items-center gap-2 mt-1">
                    <User className="w-3.5 h-3.5 text-[#68776D] dark:text-[#98A99E]" /> Preceptor: <strong className="text-[#2F6B4F] dark:text-[#78B895]">{progressData.doctor_name || "Ayurvedic Doctor"}</strong>
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-[11px] text-[#526158] dark:text-[#C1CEC5] font-medium">Rotation Progress</p>
                  <p className="text-3xl font-serif font-bold text-[#2F6B4F] dark:text-[#78B895]">
                    {progressData.overall_progress_percentage}%
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-[#526158] dark:text-[#C1CEC5]">
                  <span>Milestones: {progressData.completed_milestones} of {progressData.total_milestones} Completed</span>
                  <span className="font-mono font-bold text-[#2F6B4F] dark:text-[#78B895]">{progressData.overall_progress_percentage}%</span>
                </div>
                <div className="w-full bg-[#EEF4EF] dark:bg-[#223128] rounded-full h-3.5 overflow-hidden border border-[#D5DED8] dark:border-[#304036]">
                  <div
                    className="bg-gradient-to-r from-[#2F6B4F] via-[#2F7D4A] to-[#78B895] dark:from-[#294637] dark:via-[#78B895] dark:to-[#7BC894] h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(0, progressData.overall_progress_percentage))}%` }}
                  />
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-3.5 rounded-2xl bg-[#F7F9F4] dark:bg-[#1D2A22] border border-[#D5DED8] dark:border-[#304036] text-center">
                  <p className="text-[10px] text-[#68776D] dark:text-[#98A99E]">Completed Tasks</p>
                  <p className="text-lg font-serif font-bold text-[#142019] dark:text-[#FFFFFF] mt-0.5">
                    {progressData.completed_tasks} / {progressData.total_tasks}
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#F7F9F4] dark:bg-[#1D2A22] border border-[#D5DED8] dark:border-[#304036] text-center">
                  <p className="text-[10px] text-[#68776D] dark:text-[#98A99E]">Milestones Done</p>
                  <p className="text-lg font-serif font-bold text-[#142019] dark:text-[#FFFFFF] mt-0.5">
                    {progressData.completed_milestones} / {progressData.total_milestones}
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#F7F9F4] dark:bg-[#1D2A22] border border-[#D5DED8] dark:border-[#304036] text-center">
                  <p className="text-[10px] text-[#68776D] dark:text-[#98A99E]">Attendance Rate</p>
                  <p className="text-lg font-serif font-bold text-[#2F6B4F] dark:text-[#78B895] mt-0.5">
                    {progressData.attendance_percentage}%
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#F7F9F4] dark:bg-[#1D2A22] border border-[#D5DED8] dark:border-[#304036] text-center">
                  <p className="text-[10px] text-[#68776D] dark:text-[#98A99E]">Total Hours Completed</p>
                  <p className="text-lg font-serif font-bold text-[#2F7D4A] dark:text-[#7BC894] mt-0.5">
                    {progressData.total_hours_completed} hrs
                  </p>
                </div>
              </div>
            </div>

            {/* Milestones & Tasks Section */}
            <div className="space-y-6">
              <h3 className="text-lg font-serif font-bold text-[#142019] dark:text-[#FFFFFF] flex items-center gap-2">
                <ListTodo className="w-5 h-5 text-[#2F6B4F] dark:text-[#78B895]" /> Clinical Milestones & Evaluation
              </h3>

              {progressData.milestones.length === 0 ? (
                <div className="bg-[#FFFFFF] dark:bg-[#17211B] rounded-3xl p-10 text-center border border-[#D5DED8] dark:border-[#304036] text-[#68776D] dark:text-[#98A99E] text-xs shadow-sm">
                  Your clinical mentor is preparing the milestone roadmap for this rotation.
                </div>
              ) : (
                <div className="space-y-6">
                  {progressData.milestones.map((m: any, idx: number) => (
                    <div
                      key={m.id}
                      className="bg-[#FFFFFF] dark:bg-[#17211B] rounded-3xl border border-[#D5DED8] dark:border-[#304036] p-6 space-y-5 shadow-sm"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D5DED8] dark:border-[#304036] pb-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#DCEBE1] dark:bg-[#294637] text-[#2F6B4F] dark:text-[#78B895] border border-[#D5DED8] dark:border-[#304036] uppercase">
                              {m.category || "CLINICAL"}
                            </span>
                            {m.due_date && (
                              <span className="text-[11px] text-[#68776D] dark:text-[#98A99E] font-mono flex items-center gap-1">
                                <Calendar className="w-3 h-3" /> Target Date: {m.due_date}
                              </span>
                            )}
                          </div>
                          <h4 className="text-base font-serif font-bold text-[#142019] dark:text-[#FFFFFF]">
                            {idx + 1}. {m.milestone_title}
                          </h4>
                          {m.description && (
                            <p className="text-xs text-[#526158] dark:text-[#C1CEC5] leading-relaxed">
                              {m.description}
                            </p>
                          )}
                        </div>

                        <span
                          className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold border uppercase self-start sm:self-auto ${
                            m.status === "COMPLETED"
                              ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800"
                              : m.status === "IN_PROGRESS"
                              ? "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800"
                              : "bg-[#EEF4EF] dark:bg-[#223128] text-[#526158] dark:text-[#C1CEC5] border-[#D5DED8] dark:border-[#304036]"
                          }`}
                        >
                          {m.status.replace("_", " ")}
                        </span>
                      </div>

                      {/* Tasks */}
                      <div className="space-y-3">
                        <p className="text-[11px] font-semibold text-[#526158] dark:text-[#C1CEC5] uppercase tracking-wider">
                          Competencies & Assigned Tasks ({m.tasks?.length || 0})
                        </p>

                        {!m.tasks || m.tasks.length === 0 ? (
                          <p className="text-xs text-[#68776D] dark:text-[#98A99E] italic">No specific tasks listed under this milestone.</p>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {m.tasks.map((t: any) => (
                              <div
                                key={t.id}
                                className="p-4 rounded-2xl bg-[#F7F9F4] dark:bg-[#1D2A22] border border-[#D5DED8] dark:border-[#304036] space-y-2 flex flex-col justify-between"
                              >
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="text-[10px] font-mono text-[#68776D] dark:text-[#98A99E] uppercase">
                                      {t.task_type.replace("_", " ")}
                                    </span>
                                    <span
                                      className={`text-[10px] font-bold rounded-md px-2 py-0.5 border uppercase ${
                                        t.status === "COMPLETED"
                                          ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800"
                                          : t.status === "IN_PROGRESS"
                                          ? "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800"
                                          : "bg-[#EEF4EF] dark:bg-[#223128] text-[#526158] dark:text-[#C1CEC5] border-[#D5DED8] dark:border-[#304036]"
                                      }`}
                                    >
                                      {t.status.replace("_", " ")}
                                    </span>
                                  </div>

                                  <h5 className="text-xs font-bold text-[#142019] dark:text-[#FFFFFF]">
                                    {t.title}
                                  </h5>
                                  {t.description && (
                                    <p className="text-[11px] text-[#526158] dark:text-[#C1CEC5] leading-snug">
                                      {t.description}
                                    </p>
                                  )}
                                </div>

                                {t.doctor_remarks && (
                                  <div className="pt-2 border-t border-[#D5DED8] dark:border-[#304036] text-[10px] text-[#2F7D4A] dark:text-[#7BC894] italic">
                                    <strong>Doctor Feedback:</strong> &quot;{t.doctor_remarks}&quot;
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Attendance Logs Section */}
            {attendanceSummary && (
              <div className="bg-[#FFFFFF] dark:bg-[#17211B] rounded-3xl border border-[#D5DED8] dark:border-[#304036] overflow-hidden shadow-sm">
                <div className="p-6 border-b border-[#D5DED8] dark:border-[#304036] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-serif font-bold text-[#142019] dark:text-[#FFFFFF] flex items-center gap-2">
                      <Activity className="w-5 h-5 text-[#2F6B4F] dark:text-[#78B895]" /> Verified Attendance Records
                    </h3>
                    <p className="text-xs text-[#526158] dark:text-[#C1CEC5] mt-0.5">
                      Verified daily check-in / check-out records and doctor clinical observations.
                    </p>
                  </div>
                  <div className="text-xs font-mono text-[#2F6B4F] dark:text-[#78B895] bg-[#EEF4EF] dark:bg-[#223128] px-3 py-1.5 rounded-xl border border-[#D5DED8] dark:border-[#304036] self-start sm:self-auto">
                    Attendance: <strong>{attendanceSummary.attendance_percentage}%</strong> ({attendanceSummary.present_days} Present, {attendanceSummary.leave_days} Leave)
                  </div>
                </div>

                {attendanceSummary.logs.length === 0 ? (
                  <div className="p-8 text-center text-xs text-[#68776D] dark:text-[#98A99E]">
                    No daily attendance recorded yet by your clinical mentor.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-[#EEF4EF] dark:bg-[#223128] text-[#526158] dark:text-[#C1CEC5] font-semibold border-b border-[#D5DED8] dark:border-[#304036]">
                          <th className="py-3.5 px-6">Date</th>
                          <th className="py-3.5 px-4">Status</th>
                          <th className="py-3.5 px-4">Check-In</th>
                          <th className="py-3.5 px-4">Check-Out</th>
                          <th className="py-3.5 px-4">Hours</th>
                          <th className="py-3.5 px-6">Doctor Remarks</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#D5DED8] dark:divide-[#304036] text-[#17231C] dark:text-[#F1F6F2]">
                        {attendanceSummary.logs.map((log: any) => (
                          <tr key={log.id} className="hover:bg-[#F7F9F4] dark:hover:bg-[#1D2A22]/50 transition-colors">
                            <td className="py-3.5 px-6 font-mono font-medium text-[#142019] dark:text-[#FFFFFF]">
                              {log.date}
                            </td>
                            <td className="py-3.5 px-4">
                              <span
                                className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase ${
                                  log.status === "PRESENT"
                                    ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800"
                                    : log.status === "HALF_DAY"
                                    ? "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800"
                                    : log.status === "LEAVE"
                                    ? "bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-800"
                                    : "bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-900"
                                }`}
                              >
                                {log.status.replace("_", " ")}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-[#68776D] dark:text-[#98A99E] font-mono">
                              {log.check_in || "--"}
                            </td>
                            <td className="py-3.5 px-4 text-[#68776D] dark:text-[#98A99E] font-mono">
                              {log.check_out || "--"}
                            </td>
                            <td className="py-3.5 px-4 font-mono font-bold text-[#142019] dark:text-[#FFFFFF]">
                              {log.hours_worked}h
                            </td>
                            <td className="py-3.5 px-6 text-[#526158] dark:text-[#C1CEC5] italic">
                              {log.remarks || "Regular OPD attendance"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* STUDENT FEEDBACK MODAL */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-5 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-[#D5DED8] dark:border-[#304036] pb-3">
              <div>
                <span className="text-[10px] font-bold text-[#2F6B4F] dark:text-[#78B895] uppercase tracking-wider">
                  Mentorship Feedback
                </span>
                <h3 className="text-lg font-serif font-bold text-[#142019] dark:text-[#FFFFFF]">
                  Rate Your Internship Experience
                </h3>
              </div>
              <button
                onClick={() => setShowFeedbackModal(false)}
                className="text-[#68776D] dark:text-[#98A99E] hover:text-[#17231C] dark:hover:text-[#FFFFFF] font-bold p-1 rounded-lg hover:bg-[#EEF4EF] dark:hover:bg-[#223128]"
              >
                ✕
              </button>
            </div>

            {feedbackMsg && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold ${
                  feedbackMsg.type === "success"
                    ? "bg-[#DCEBE1] dark:bg-[#294637]/60 border border-[#2F7D4A]/40 text-[#2F7D4A] dark:text-[#7BC894]"
                    : "bg-rose-50 dark:bg-rose-950/60 border border-[#B64040]/40 text-[#B64040] dark:text-[#F18484]"
                }`}
              >
                {feedbackMsg.text}
              </div>
            )}

            <form onSubmit={handleStudentFeedbackSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#F7F9F4] dark:bg-[#1D2A22] p-4 rounded-2xl border border-[#D5DED8] dark:border-[#304036]">
                {[
                  { key: "overall_rating", label: "Overall Rotation Experience" },
                  { key: "doctor_mentorship_rating", label: "Doctor Mentorship Quality" },
                  { key: "learning_experience_rating", label: "Practical Learning & Depth" },
                  { key: "clinical_exposure_rating", label: "Clinical OPD / IPD Exposure" },
                  { key: "organization_rating", label: "Hospital / Clinic Organization" },
                  { key: "facilities_rating", label: "Panchakarma Facilities" }
                ].map((field) => (
                  <div key={field.key} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[#17231C] dark:text-[#F1F6F2] font-medium">{field.label}</span>
                      <span className="font-bold text-[#A96F16] dark:text-[#E5B85C]">{(feedbackForm as any)[field.key]}/5</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={(feedbackForm as any)[field.key]}
                      onChange={(e) =>
                        setFeedbackForm({
                          ...feedbackForm,
                          [field.key]: parseInt(e.target.value)
                        })
                      }
                      className="w-full accent-[#2F6B4F] dark:accent-[#78B895] h-1.5 bg-[#EEF4EF] dark:bg-[#223128] rounded-lg cursor-pointer"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#526158] dark:text-[#C1CEC5] mb-1">
                  Overall Experience Comments
                </label>
                <textarea
                  rows={2}
                  value={feedbackForm.overall_experience_comments}
                  onChange={(e) =>
                    setFeedbackForm({ ...feedbackForm, overall_experience_comments: e.target.value })
                  }
                  className="w-full bg-[#FFFFFF] dark:bg-[#1D2A22] border border-[#D5DED8] dark:border-[#304036] text-[#17231C] dark:text-[#F1F6F2] text-xs rounded-xl p-3 focus:outline-none focus:border-[#2F6B4F] dark:focus:border-[#78B895] resize-none"
                  placeholder="Share details of your clinical journey..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#526158] dark:text-[#C1CEC5] mb-1">
                  Specific Mentorship Review
                </label>
                <textarea
                  rows={2}
                  value={feedbackForm.review_comments}
                  onChange={(e) =>
                    setFeedbackForm({ ...feedbackForm, review_comments: e.target.value })
                  }
                  className="w-full bg-[#FFFFFF] dark:bg-[#1D2A22] border border-[#D5DED8] dark:border-[#304036] text-[#17231C] dark:text-[#F1F6F2] text-xs rounded-xl p-3 focus:outline-none focus:border-[#2F6B4F] dark:focus:border-[#78B895] resize-none"
                  placeholder="Feedback on supervisor guidance, case discussions, etc."
                />
              </div>

              <div className="flex items-center gap-4 bg-[#F7F9F4] dark:bg-[#1D2A22] p-3 rounded-xl border border-[#D5DED8] dark:border-[#304036] text-xs">
                <label className="flex items-center gap-2 text-[#17231C] dark:text-[#F1F6F2] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={feedbackForm.is_anonymous}
                    onChange={(e) =>
                      setFeedbackForm({ ...feedbackForm, is_anonymous: e.target.checked })
                    }
                    className="rounded accent-[#2F6B4F] dark:accent-[#78B895]"
                  />
                  <span>Submit Anonymously</span>
                </label>
                <label className="flex items-center gap-2 text-[#17231C] dark:text-[#F1F6F2] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={feedbackForm.is_public}
                    onChange={(e) =>
                      setFeedbackForm({ ...feedbackForm, is_public: e.target.checked })
                    }
                    className="rounded accent-[#2F6B4F] dark:accent-[#78B895]"
                  />
                  <span>Public Review</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#D5DED8] dark:border-[#304036]">
                <button
                  type="button"
                  onClick={() => setShowFeedbackModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#EEF4EF] dark:bg-[#223128] hover:bg-[#DCEBE1] dark:hover:bg-[#294637] text-[#526158] dark:text-[#C1CEC5] text-xs font-semibold transition border border-[#D5DED8] dark:border-[#304036]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingFeedback || feedbackSuccess}
                  className="px-5 py-2 rounded-xl bg-[#2F6B4F] hover:bg-[#24563F] text-white dark:bg-[#78B895] dark:hover:bg-[#91CAA8] dark:text-[#0D1511] text-xs font-bold transition shadow-md disabled:opacity-50"
                >
                  {submittingFeedback ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STUDENT CERTIFICATE VIEW MODAL */}
      {showCertModal && certificateData && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#FFFFFF] dark:bg-[#17211B] text-[#17231C] dark:text-[#F1F6F2] rounded-3xl max-w-2xl w-full p-8 space-y-6 shadow-2xl border-4 border-[#A96F16]/40 dark:border-[#E5B85C]/40 relative my-8">
            <div className="flex justify-between items-start border-b border-[#D5DED8] dark:border-[#304036] pb-4">
              <div>
                <span className="px-2.5 py-1 bg-[#DCEBE1] dark:bg-[#294637] text-[#2F6B4F] dark:text-[#78B895] text-[10px] font-bold rounded-full border border-[#D5DED8] dark:border-[#304036]">
                  VERIFIED ACCREDITED CREDENTIAL
                </span>
                <h3 className="text-xl font-bold font-serif text-[#142019] dark:text-[#FFFFFF] mt-1">
                  Aayuraura Clinical Completion Certificate
                </h3>
              </div>
              <button
                onClick={() => setShowCertModal(false)}
                className="text-[#68776D] dark:text-[#98A99E] hover:text-[#17231C] dark:hover:text-[#FFFFFF] font-bold p-1 rounded-lg hover:bg-[#EEF4EF] dark:hover:bg-[#223128] text-lg"
              >
                ✕
              </button>
            </div>

            <div className="text-center space-y-3 py-6 bg-gradient-to-b from-[#DCEBE1]/30 to-[#FFFFFF] dark:from-[#294637]/30 dark:to-[#17211B] rounded-2xl border border-[#D5DED8] dark:border-[#304036] p-6">
              <div className="text-xs uppercase tracking-widest text-[#68776D] dark:text-[#98A99E] font-semibold">This certifies that</div>
              <div className="text-2xl font-bold font-serif text-[#142019] dark:text-[#FFFFFF]">
                {certificateData.student_name}
              </div>
              <p className="text-xs text-[#526158] dark:text-[#C1CEC5] max-w-md mx-auto leading-relaxed">
                has successfully completed the structured clinical internship in <strong className="text-[#142019] dark:text-[#FFFFFF]">{certificateData.internship_title}</strong> with {certificateData.total_hours_completed} verified clinical OPD hours under direct preceptor supervision.
              </p>
              <div className="inline-block bg-[#EEF4EF] dark:bg-[#223128] text-[#A96F16] dark:text-[#E5B85C] text-xs font-mono font-bold px-3 py-1 rounded-lg mt-2 border border-[#D5DED8] dark:border-[#304036]">
                {certificateData.certificate_token}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <Link
                href={`/verify/certificate/${certificateData.certificate_token}`}
                target="_blank"
                className="px-4 py-2 rounded-xl bg-[#2F6B4F] hover:bg-[#24563F] text-white dark:bg-[#78B895] dark:hover:bg-[#91CAA8] dark:text-[#0D1511] text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
              >
                <Award className="w-4 h-4" /> Open Public Verification Link ↗
              </Link>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-[#EEF4EF] dark:bg-[#223128] hover:bg-[#DCEBE1] dark:hover:bg-[#294637] text-[#17231C] dark:text-[#F1F6F2] text-xs font-semibold border border-[#D5DED8] dark:border-[#304036] transition"
              >
                Print / Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
