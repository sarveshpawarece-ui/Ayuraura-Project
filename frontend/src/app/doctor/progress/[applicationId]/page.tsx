"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { api } from "@/lib/api";
import {
  TrendingUp,
  CheckCircle2,
  Clock,
  PlusCircle,
  Award,
  Activity,
  User,
  Building2,
  Calendar,
  AlertCircle,
  FileCheck2,
  ChevronRight,
  ListTodo,
  Sparkles
} from "lucide-react";

export default function DoctorProgressTrackerPage({
  params
}: {
  params: Promise<{ applicationId: string }>;
}) {
  const { applicationId } = use(params);
  const [progressData, setProgressData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showCertModal, setShowCertModal] = useState(false);
  const [certificateData, setCertificateData] = useState<any | null>(null);
  const [activeMilestoneId, setActiveMilestoneId] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Complete Rotation Form (Phase 6)
  const [completeForm, setCompleteForm] = useState({
    clinical_skills_rating: 5,
    communication_rating: 5,
    professionalism_rating: 5,
    punctuality_rating: 5,
    technical_knowledge_rating: 5,
    teamwork_rating: 5,
    learning_ability_rating: 5,
    overall_rating: 5,
    written_feedback: "Demonstrated exemplary clinical acumen, pulse diagnosis diligence, and compassionate patient care.",
    strengths_notes: "Strong knowledge of Ayurvedic Samhitas and procedural accuracy in Panchakarma therapies.",
    areas_for_growth: "Continue expanding practical experience with customized Rasashastra preparations.",
    recommendations: "Highly recommended for advanced clinical residency and autonomous Ayurvedic practice.",
    generate_certificate: true,
    add_to_student_portfolio: true
  });

  // New Milestone Form
  const [milestoneForm, setMilestoneForm] = useState({
    milestone_title: "",
    description: "",
    category: "CLINICAL",
    due_date: "",
    status: "IN_PROGRESS"
  });

  // New Task Form
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    task_type: "CLINICAL_ACTIVITY",
    status: "NOT_STARTED",
    doctor_remarks: ""
  });

  const fetchProgress = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/internships/applications/${applicationId}/progress`);
      setProgressData(res.data);
    } catch (err) {
      console.error("Failed to load progress:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, [applicationId]);

  const handleCreateMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMsg(null);
    try {
      await api.post(`/internships/applications/${applicationId}/milestones`, {
        milestone_title: milestoneForm.milestone_title,
        description: milestoneForm.description || undefined,
        category: milestoneForm.category,
        due_date: milestoneForm.due_date || undefined,
        status: milestoneForm.status
      });

      setMsg({ type: "success", text: "Milestone added successfully!" });
      setShowMilestoneModal(false);
      setMilestoneForm({
        milestone_title: "",
        description: "",
        category: "CLINICAL",
        due_date: "",
        status: "IN_PROGRESS"
      });
      fetchProgress();
    } catch (err: any) {
      setMsg({ type: "error", text: err.response?.data?.detail || "Failed to add milestone." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMilestoneId) return;
    setSubmitting(true);
    setMsg(null);

    try {
      await api.post(`/internships/milestones/${activeMilestoneId}/tasks`, {
        title: taskForm.title,
        description: taskForm.description || undefined,
        task_type: taskForm.task_type,
        status: taskForm.status,
        doctor_remarks: taskForm.doctor_remarks || undefined
      });

      setMsg({ type: "success", text: "Clinical task added successfully!" });
      setShowTaskModal(false);
      setTaskForm({
        title: "",
        description: "",
        task_type: "CLINICAL_ACTIVITY",
        status: "NOT_STARTED",
        doctor_remarks: ""
      });
      fetchProgress();
    } catch (err: any) {
      setMsg({ type: "error", text: err.response?.data?.detail || "Failed to add task." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      await api.put(`/internships/tasks/${taskId}`, {
        status: newStatus
      });
      fetchProgress();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to update task");
    }
  };

  const handleUpdateMilestoneStatus = async (milestoneId: string, newStatus: string) => {
    try {
      await api.put(`/internships/milestones/${milestoneId}`, {
        status: newStatus,
        completion_percentage: newStatus === "COMPLETED" ? 100 : newStatus === "IN_PROGRESS" ? 50 : 0
      });
      fetchProgress();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to update milestone");
    }
  };

  const fetchCertificate = async () => {
    try {
      const res = await api.get(`/internships/applications/${applicationId}/certificate`);
      setCertificateData(res.data);
      setShowCertModal(true);
    } catch (err: any) {
      alert(err.response?.data?.detail || "Certificate not found or not yet generated.");
    }
  };

  const handleCompleteRotation = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMsg(null);
    try {
      const res = await api.post(`/internships/applications/${applicationId}/complete`, {
        generate_certificate: completeForm.generate_certificate,
        add_to_student_portfolio: completeForm.add_to_student_portfolio,
        doctor_feedback: {
          clinical_skills_rating: Number(completeForm.clinical_skills_rating),
          communication_rating: Number(completeForm.communication_rating),
          professionalism_rating: Number(completeForm.professionalism_rating),
          punctuality_rating: Number(completeForm.punctuality_rating),
          technical_knowledge_rating: Number(completeForm.technical_knowledge_rating),
          teamwork_rating: Number(completeForm.teamwork_rating),
          learning_ability_rating: Number(completeForm.learning_ability_rating),
          overall_rating: Number(completeForm.overall_rating),
          written_feedback: completeForm.written_feedback,
          strengths_notes: completeForm.strengths_notes,
          areas_for_growth: completeForm.areas_for_growth,
          recommendations: completeForm.recommendations
        }
      });
      setCertificateData(res.data);
      setShowCompleteModal(false);
      setShowCertModal(true);
      setMsg({ type: "success", text: "🎓 Internship marked COMPLETED! Verifiable certificate issued and synced to scholar's portfolio." });
      fetchProgress();
    } catch (err: any) {
      setMsg({ type: "error", text: err.response?.data?.detail || "Failed to complete rotation." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9F4] dark:bg-[#0D1511] text-[#17231C] dark:text-[#F1F6F2] font-sans transition-colors duration-200">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#D5DED8] dark:border-[#304036] pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#2F6B4F] dark:text-[#78B895] uppercase tracking-wider mb-1">
              <TrendingUp className="w-4 h-4" /> Doctor Clinical Mentorship Hub • Phase 6
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#142019] dark:text-[#FFFFFF] tracking-tight">
              Internship Progress & Certification
            </h1>
            <p className="text-sm text-[#526158] dark:text-[#98A99E] mt-1">
              Track clinical competencies, learning objectives, log evaluations, and issue verifiable NCISM certificates.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/doctor/history"
              className="px-3.5 py-2 rounded-xl bg-[#EEF4EF] dark:bg-[#223128] hover:bg-[#D5DED8] dark:hover:bg-[#304036] text-[#17231C] dark:text-[#F1F6F2] text-xs font-semibold border border-[#D5DED8] dark:border-[#304036] transition-colors flex items-center gap-1.5"
            >
              Analytics & History
            </Link>
            <Link
              href="/doctor/attendance"
              className="px-3.5 py-2 rounded-xl bg-[#EEF4EF] dark:bg-[#223128] hover:bg-[#D5DED8] dark:hover:bg-[#304036] text-[#17231C] dark:text-[#F1F6F2] text-xs font-semibold border border-[#D5DED8] dark:border-[#304036] transition-colors flex items-center gap-1.5"
            >
              <Activity className="w-4 h-4 text-[#2F6B4F] dark:text-[#78B895]" /> Attendance
            </Link>
            <button
              onClick={() => {
                setShowMilestoneModal(true);
                setMsg(null);
              }}
              className="px-3.5 py-2 rounded-xl bg-[#EEF4EF] dark:bg-[#223128] hover:bg-[#D5DED8] dark:hover:bg-[#304036] text-[#17231C] dark:text-[#F1F6F2] text-xs font-semibold transition-colors border border-[#D5DED8] dark:border-[#304036] flex items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-[#2F6B4F] dark:text-[#78B895]" /> Add Milestone
            </button>
            <button
              onClick={() => {
                setShowCompleteModal(true);
                setMsg(null);
              }}
              className="px-4 py-2 rounded-xl bg-[#A96F16] hover:bg-[#8F5D12] dark:bg-[#E5B85C] dark:hover:bg-[#D4A74B] text-white dark:text-[#0D1511] text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Award className="w-4 h-4 text-white dark:text-[#0D1511]" /> Complete Rotation & Issue Certificate
            </button>
          </div>
        </div>

        {/* Message Alert */}
        {msg && (
          <div
            className={`p-4 rounded-2xl text-xs flex items-center justify-between ${
              msg.type === "success"
                ? "bg-[#DCEBE1] dark:bg-[#294637] border border-[#2F7D4A]/30 text-[#2F7D4A] dark:text-[#7BC894]"
                : "bg-[#FDE8E8] dark:bg-[#3B1E1E] border border-[#B64040]/30 text-[#B64040] dark:text-[#F18484]"
            }`}
          >
            <span>{msg.text}</span>
            <button onClick={() => setMsg(null)} className="font-bold cursor-pointer">✕</button>
          </div>
        )}

        {loading ? (
          <div className="py-24 text-center space-y-3">
            <div className="inline-block w-8 h-8 border-4 border-[#2F6B4F] dark:border-[#78B895] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-[#526158] dark:text-[#98A99E]">Loading progress tracker...</p>
          </div>
        ) : !progressData ? (
          <div className="p-12 text-center bg-[#FFFFFF] dark:bg-[#17211B] rounded-3xl border border-[#D5DED8] dark:border-[#304036] text-[#526158] dark:text-[#98A99E] text-xs shadow-xs">
            Progress record not found for this application.
          </div>
        ) : (
          <div className="space-y-8">
            {/* Student & Rotation Card */}
            <div className="bg-[#FFFFFF] dark:bg-[#17211B] rounded-3xl p-6 border border-[#D5DED8] dark:border-[#304036] shadow-xs space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#D5DED8] dark:border-[#304036] pb-5">
                <div>
                  <span className="text-[10px] font-mono text-[#2F6B4F] dark:text-[#78B895] uppercase tracking-widest block">
                    Internship Rotation Details
                  </span>
                  <h2 className="text-xl font-bold text-[#142019] dark:text-[#FFFFFF] mt-0.5">
                    {progressData.internship_title}
                  </h2>
                  <p className="text-xs text-[#526158] dark:text-[#98A99E] flex items-center gap-2 mt-1">
                    <User className="w-3.5 h-3.5 text-[#526158] dark:text-[#98A99E]" /> Student: <strong className="text-[#17231C] dark:text-[#F1F6F2]">{progressData.student_name}</strong>
                    {progressData.doctor_name && (
                      <>
                        <span className="text-[#68776D] dark:text-[#98A99E]">•</span>
                        <span>Guide: <strong className="text-[#2F6B4F] dark:text-[#78B895]">{progressData.doctor_name}</strong></span>
                      </>
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-[11px] text-[#526158] dark:text-[#98A99E] font-medium">Overall Progress</p>
                    <p className="text-3xl font-black text-[#2F6B4F] dark:text-[#78B895]">
                      {progressData.overall_progress_percentage}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-[#526158] dark:text-[#98A99E]">
                  <span>Milestones Completion: {progressData.completed_milestones} of {progressData.total_milestones} Done</span>
                  <span className="font-mono font-bold text-[#2F6B4F] dark:text-[#78B895]">{progressData.overall_progress_percentage}%</span>
                </div>
                <div className="w-full bg-[#EEF4EF] dark:bg-[#223128] rounded-full h-3 overflow-hidden border border-[#D5DED8] dark:border-[#304036]">
                  <div
                    className="bg-[#2F6B4F] dark:bg-[#78B895] h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(0, progressData.overall_progress_percentage))}%` }}
                  />
                </div>
              </div>

              {/* Stat Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-3 rounded-2xl bg-[#EEF4EF] dark:bg-[#223128] border border-[#D5DED8] dark:border-[#304036] text-center">
                  <p className="text-[10px] text-[#68776D] dark:text-[#98A99E]">Tasks Completed</p>
                  <p className="text-lg font-bold text-[#17231C] dark:text-[#F1F6F2] mt-0.5">
                    {progressData.completed_tasks} / {progressData.total_tasks}
                  </p>
                </div>
                <div className="p-3 rounded-2xl bg-[#EEF4EF] dark:bg-[#223128] border border-[#D5DED8] dark:border-[#304036] text-center">
                  <p className="text-[10px] text-[#68776D] dark:text-[#98A99E]">Milestones</p>
                  <p className="text-lg font-bold text-[#17231C] dark:text-[#F1F6F2] mt-0.5">
                    {progressData.completed_milestones} / {progressData.total_milestones}
                  </p>
                </div>
                <div className="p-3 rounded-2xl bg-[#EEF4EF] dark:bg-[#223128] border border-[#D5DED8] dark:border-[#304036] text-center">
                  <p className="text-[10px] text-[#68776D] dark:text-[#98A99E]">Attendance Rate</p>
                  <p className="text-lg font-bold text-[#2F7D4A] dark:text-[#7BC894] mt-0.5">
                    {progressData.attendance_percentage}%
                  </p>
                </div>
                <div className="p-3 rounded-2xl bg-[#EEF4EF] dark:bg-[#223128] border border-[#D5DED8] dark:border-[#304036] text-center">
                  <p className="text-[10px] text-[#68776D] dark:text-[#98A99E]">Total Hours Logged</p>
                  <p className="text-lg font-bold text-[#356F9D] dark:text-[#80B5DD] mt-0.5">
                    {progressData.total_hours_completed} hrs
                  </p>
                </div>
              </div>
            </div>

            {/* Milestones & Tasks Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-[#142019] dark:text-[#FFFFFF] flex items-center gap-2">
                  <ListTodo className="w-5 h-5 text-[#2F6B4F] dark:text-[#78B895]" /> Clinical Milestones & Objectives
                </h3>
                <span className="text-xs text-[#526158] dark:text-[#98A99E]">
                  {progressData.milestones.length} Defined Milestones
                </span>
              </div>

              {progressData.milestones.length === 0 ? (
                <div className="bg-[#FFFFFF] dark:bg-[#17211B] rounded-3xl p-10 text-center border border-[#D5DED8] dark:border-[#304036] space-y-3 shadow-xs">
                  <p className="text-xs text-[#526158] dark:text-[#98A99E]">No milestones configured yet for this rotation.</p>
                  <button
                    onClick={() => setShowMilestoneModal(true)}
                    className="px-4 py-2 rounded-xl bg-[#2F6B4F] hover:bg-[#24563F] dark:bg-[#78B895] dark:hover:bg-[#91CAA8] text-white dark:text-[#0D1511] text-xs font-bold transition-all shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4" /> Define First Milestone
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {progressData.milestones.map((m: any, idx: number) => (
                    <div
                      key={m.id}
                      className="bg-[#FFFFFF] dark:bg-[#17211B] rounded-3xl border border-[#D5DED8] dark:border-[#304036] p-6 space-y-5 shadow-xs"
                    >
                      {/* Milestone Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D5DED8] dark:border-[#304036] pb-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#DCEBE1] dark:bg-[#294637] text-[#2F6B4F] dark:text-[#78B895] border border-[#2F6B4F]/30 uppercase">
                              {m.category || "CLINICAL"}
                            </span>
                            {m.due_date && (
                              <span className="text-[11px] text-[#526158] dark:text-[#98A99E] font-mono flex items-center gap-1">
                                <Calendar className="w-3 h-3" /> Due: {m.due_date}
                              </span>
                            )}
                          </div>
                          <h4 className="text-base font-bold text-[#142019] dark:text-[#FFFFFF]">
                            {idx + 1}. {m.milestone_title}
                          </h4>
                          {m.description && (
                            <p className="text-xs text-[#526158] dark:text-[#C1CEC5] leading-relaxed">
                              {m.description}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          <select
                            value={m.status}
                            onChange={(e) => handleUpdateMilestoneStatus(m.id, e.target.value)}
                            className="bg-[#EEF4EF] dark:bg-[#223128] border border-[#D5DED8] dark:border-[#304036] text-[#17231C] dark:text-[#F1F6F2] text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#2F6B4F] dark:focus:border-[#78B895] font-medium"
                          >
                            <option value="NOT_STARTED">Not Started</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="COMPLETED">Completed (100%)</option>
                          </select>

                          <button
                            onClick={() => {
                              setActiveMilestoneId(m.id);
                              setShowTaskModal(true);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-[#EEF4EF] dark:bg-[#223128] hover:bg-[#D5DED8] dark:hover:bg-[#304036] text-[#2F6B4F] dark:text-[#78B895] border border-[#D5DED8] dark:border-[#304036] text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <PlusCircle className="w-3.5 h-3.5" /> Add Task
                          </button>
                        </div>
                      </div>

                      {/* Tasks List */}
                      <div className="space-y-3">
                        <p className="text-[11px] font-semibold text-[#68776D] dark:text-[#98A99E] uppercase tracking-wider">
                          Competencies & Activities ({m.tasks?.length || 0})
                        </p>

                        {!m.tasks || m.tasks.length === 0 ? (
                          <p className="text-xs text-[#68776D] dark:text-[#98A99E] italic">No tasks added to this milestone yet.</p>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {m.tasks.map((t: any) => (
                              <div
                                key={t.id}
                                className="p-3.5 rounded-2xl bg-[#EEF4EF] dark:bg-[#223128] border border-[#D5DED8] dark:border-[#304036] space-y-2 flex flex-col justify-between"
                              >
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="text-[10px] font-mono text-[#526158] dark:text-[#98A99E] uppercase">
                                      {t.task_type.replace("_", " ")}
                                    </span>
                                    <select
                                      value={t.status}
                                      onChange={(e) => handleUpdateTaskStatus(t.id, e.target.value)}
                                      className={`text-[10px] font-bold rounded-lg px-2 py-0.5 border uppercase ${
                                        t.status === "COMPLETED"
                                          ? "bg-[#DCEBE1] dark:bg-[#294637] text-[#2F7D4A] dark:text-[#7BC894] border-[#2F7D4A]/30"
                                          : t.status === "IN_PROGRESS"
                                          ? "bg-[#FFF8E6] dark:bg-[#3D2E14] text-[#A96F16] dark:text-[#E5B85C] border-[#A96F16]/30"
                                          : "bg-[#FFFFFF] dark:bg-[#17211B] text-[#526158] dark:text-[#98A99E] border-[#D5DED8] dark:border-[#304036]"
                                      }`}
                                    >
                                      <option value="NOT_STARTED">Pending</option>
                                      <option value="IN_PROGRESS">In Progress</option>
                                      <option value="COMPLETED">Completed</option>
                                    </select>
                                  </div>

                                  <h5 className="text-xs font-bold text-[#17231C] dark:text-[#F1F6F2]">
                                    {t.title}
                                  </h5>
                                  {t.description && (
                                    <p className="text-[11px] text-[#526158] dark:text-[#C1CEC5] leading-snug">
                                      {t.description}
                                    </p>
                                  )}
                                </div>

                                {t.doctor_remarks && (
                                  <p className="text-[10px] text-[#2F6B4F] dark:text-[#78B895] italic pt-1 border-t border-[#D5DED8] dark:border-[#304036]">
                                    <strong>Doctor Note:</strong> &quot;{t.doctor_remarks}&quot;
                                  </p>
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
          </div>
        )}
      </main>

      {/* CREATE MILESTONE MODAL */}
      {showMilestoneModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#D5DED8] dark:border-[#304036] pb-3">
              <h3 className="text-base font-bold text-[#142019] dark:text-[#FFFFFF] flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-[#2F6B4F] dark:text-[#78B895]" /> Define Clinical Milestone
              </h3>
              <button
                onClick={() => setShowMilestoneModal(false)}
                className="text-[#526158] dark:text-[#98A99E] hover:text-[#17231C] dark:hover:text-[#F1F6F2] font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateMilestone} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#526158] dark:text-[#C1CEC5] mb-1">
                  Milestone Title <span className="text-[#2F6B4F] dark:text-[#78B895]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={milestoneForm.milestone_title}
                  onChange={(e) => setMilestoneForm({ ...milestoneForm, milestone_title: e.target.value })}
                  className="w-full bg-[#EEF4EF] dark:bg-[#223128] border border-[#D5DED8] dark:border-[#304036] text-[#17231C] dark:text-[#F1F6F2] text-xs rounded-xl p-3 focus:outline-none focus:border-[#2F6B4F] dark:focus:border-[#78B895]"
                  placeholder="e.g. Snehana & Swedana Preparatory Protocols"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#526158] dark:text-[#C1CEC5] mb-1">
                    Category <span className="text-[#2F6B4F] dark:text-[#78B895]">*</span>
                  </label>
                  <select
                    value={milestoneForm.category}
                    onChange={(e) => setMilestoneForm({ ...milestoneForm, category: e.target.value })}
                    className="w-full bg-[#EEF4EF] dark:bg-[#223128] border border-[#D5DED8] dark:border-[#304036] text-[#17231C] dark:text-[#F1F6F2] text-xs rounded-xl p-3 focus:outline-none focus:border-[#2F6B4F] dark:focus:border-[#78B895]"
                  >
                    <option value="CLINICAL">Clinical Practice</option>
                    <option value="RESEARCH">Ayurveda Research</option>
                    <option value="LEARNING">Learning Objective</option>
                    <option value="GENERAL">General Orientation</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#526158] dark:text-[#C1CEC5] mb-1">
                    Target Due Date
                  </label>
                  <input
                    type="date"
                    value={milestoneForm.due_date}
                    onChange={(e) => setMilestoneForm({ ...milestoneForm, due_date: e.target.value })}
                    className="w-full bg-[#EEF4EF] dark:bg-[#223128] border border-[#D5DED8] dark:border-[#304036] text-[#17231C] dark:text-[#F1F6F2] text-xs rounded-xl p-3 focus:outline-none focus:border-[#2F6B4F] dark:focus:border-[#78B895]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#526158] dark:text-[#C1CEC5] mb-1">
                  Description & Key Objectives
                </label>
                <textarea
                  rows={3}
                  value={milestoneForm.description}
                  onChange={(e) => setMilestoneForm({ ...milestoneForm, description: e.target.value })}
                  className="w-full bg-[#EEF4EF] dark:bg-[#223128] border border-[#D5DED8] dark:border-[#304036] text-[#17231C] dark:text-[#F1F6F2] text-xs rounded-xl p-3 focus:outline-none focus:border-[#2F6B4F] dark:focus:border-[#78B895] resize-none"
                  placeholder="Outline procedures, drug preparations, and diagnostic skills required."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#D5DED8] dark:border-[#304036]">
                <button
                  type="button"
                  onClick={() => setShowMilestoneModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#EEF4EF] dark:bg-[#223128] hover:bg-[#D5DED8] dark:hover:bg-[#304036] text-[#526158] dark:text-[#C1CEC5] border border-[#D5DED8] dark:border-[#304036] text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-[#2F6B4F] hover:bg-[#24563F] dark:bg-[#78B895] dark:hover:bg-[#91CAA8] text-white dark:text-[#0D1511] text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? "Adding..." : "Save Milestone"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE TASK MODAL */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#D5DED8] dark:border-[#304036] pb-3">
              <h3 className="text-base font-bold text-[#142019] dark:text-[#FFFFFF] flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-[#2F6B4F] dark:text-[#78B895]" /> Add Clinical Task / Activity
              </h3>
              <button
                onClick={() => setShowTaskModal(false)}
                className="text-[#526158] dark:text-[#98A99E] hover:text-[#17231C] dark:hover:text-[#F1F6F2] font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#526158] dark:text-[#C1CEC5] mb-1">
                  Task / Activity Title <span className="text-[#2F6B4F] dark:text-[#78B895]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  className="w-full bg-[#EEF4EF] dark:bg-[#223128] border border-[#D5DED8] dark:border-[#304036] text-[#17231C] dark:text-[#F1F6F2] text-xs rounded-xl p-3 focus:outline-none focus:border-[#2F6B4F] dark:focus:border-[#78B895]"
                  placeholder="e.g. Assist in Shirodhara with Ksheerabala Taila"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#526158] dark:text-[#C1CEC5] mb-1">
                  Activity Type
                </label>
                <select
                  value={taskForm.task_type}
                  onChange={(e) => setTaskForm({ ...taskForm, task_type: e.target.value })}
                  className="w-full bg-[#EEF4EF] dark:bg-[#223128] border border-[#D5DED8] dark:border-[#304036] text-[#17231C] dark:text-[#F1F6F2] text-xs rounded-xl p-3 focus:outline-none focus:border-[#2F6B4F] dark:focus:border-[#78B895]"
                >
                  <option value="CLINICAL_ACTIVITY">Clinical OPD/IPD Activity</option>
                  <option value="RESEARCH_ACTIVITY">Research & Literature Review</option>
                  <option value="LEARNING_OBJECTIVE">Learning Objective / Study</option>
                  <option value="CASE_STUDY">Case Study Documentation</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#526158] dark:text-[#C1CEC5] mb-1">
                  Task Details
                </label>
                <textarea
                  rows={2}
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  className="w-full bg-[#EEF4EF] dark:bg-[#223128] border border-[#D5DED8] dark:border-[#304036] text-[#17231C] dark:text-[#F1F6F2] text-xs rounded-xl p-3 focus:outline-none focus:border-[#2F6B4F] dark:focus:border-[#78B895] resize-none"
                  placeholder="Brief details or procedure instructions."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#526158] dark:text-[#C1CEC5] mb-1">
                  Doctor / Supervisor Initial Remarks
                </label>
                <input
                  type="text"
                  value={taskForm.doctor_remarks}
                  onChange={(e) => setTaskForm({ ...taskForm, doctor_remarks: e.target.value })}
                  className="w-full bg-[#EEF4EF] dark:bg-[#223128] border border-[#D5DED8] dark:border-[#304036] text-[#17231C] dark:text-[#F1F6F2] text-xs rounded-xl p-3 focus:outline-none focus:border-[#2F6B4F] dark:focus:border-[#78B895]"
                  placeholder="e.g. Ensure accurate taila temperature measurement."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#D5DED8] dark:border-[#304036]">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#EEF4EF] dark:bg-[#223128] hover:bg-[#D5DED8] dark:hover:bg-[#304036] text-[#526158] dark:text-[#C1CEC5] border border-[#D5DED8] dark:border-[#304036] text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-[#2F6B4F] hover:bg-[#24563F] dark:bg-[#78B895] dark:hover:bg-[#91CAA8] text-white dark:text-[#0D1511] text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? "Adding..." : "Add Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* COMPLETE ROTATION & ISSUE CERTIFICATE MODAL (PHASE 6) */}
      {showCompleteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-[#D5DED8] dark:border-[#304036] pb-4">
              <div>
                <div className="text-[11px] font-bold text-[#A96F16] dark:text-[#E5B85C] uppercase tracking-wider flex items-center gap-1.5 mb-1">
                  <Award className="w-4 h-4 text-[#A96F16] dark:text-[#E5B85C]" /> NCISM Clinical Accreditation
                </div>
                <h3 className="text-xl font-bold text-[#142019] dark:text-[#FFFFFF]">
                  Internship Completion & Certification
                </h3>
              </div>
              <button
                onClick={() => setShowCompleteModal(false)}
                className="text-[#526158] dark:text-[#98A99E] hover:text-[#17231C] dark:hover:text-[#F1F6F2] font-bold p-1 rounded-lg hover:bg-[#EEF4EF] dark:hover:bg-[#223128] cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCompleteRotation} className="space-y-6">
              {/* 8-Category Evaluation Grid */}
              <div>
                <h4 className="text-xs font-bold text-[#2F6B4F] dark:text-[#78B895] uppercase tracking-wider mb-3">
                  1. Clinical Competency Evaluation (1 &ndash; 5 Scale)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-[#EEF4EF] dark:bg-[#223128] p-4 rounded-2xl border border-[#D5DED8] dark:border-[#304036]">
                  {[
                    { key: "clinical_skills_rating", label: "Clinical Skills & Diagnostics" },
                    { key: "communication_rating", label: "Patient Communication & Rapport" },
                    { key: "professionalism_rating", label: "Professionalism & Medical Ethics" },
                    { key: "punctuality_rating", label: "Punctuality & OPD Attendance" },
                    { key: "technical_knowledge_rating", label: "Ayurvedic Samhita & Pharmacopoeia" },
                    { key: "teamwork_rating", label: "Teamwork & Hospital Collaboration" },
                    { key: "learning_ability_rating", label: "Learning Ability & Receptiveness" },
                    { key: "overall_rating", label: "Overall Mentorship Performance" }
                  ].map((field) => (
                    <div key={field.key} className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-[#526158] dark:text-[#C1CEC5] font-medium">{field.label}</span>
                        <span className="font-bold text-[#A96F16] dark:text-[#E5B85C]">{(completeForm as any)[field.key]}/5</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        value={(completeForm as any)[field.key]}
                        onChange={(e) =>
                          setCompleteForm({
                            ...completeForm,
                            [field.key]: parseInt(e.target.value)
                          })
                        }
                        className="w-full accent-[#2F6B4F] dark:accent-[#78B895] h-1.5 bg-[#D5DED8] dark:bg-[#304036] rounded-lg cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Written Qualitative Feedback */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-[#2F6B4F] dark:text-[#78B895] uppercase tracking-wider">
                  2. Written Supervisor Evaluation & Recommendations
                </h4>

                <div>
                  <label className="block text-xs font-semibold text-[#526158] dark:text-[#C1CEC5] mb-1">
                    Overall Written Evaluation
                  </label>
                  <textarea
                    rows={2}
                    value={completeForm.written_feedback}
                    onChange={(e) => setCompleteForm({ ...completeForm, written_feedback: e.target.value })}
                    className="w-full bg-[#EEF4EF] dark:bg-[#223128] border border-[#D5DED8] dark:border-[#304036] text-[#17231C] dark:text-[#F1F6F2] text-xs rounded-xl p-3 focus:outline-none focus:border-[#2F6B4F] dark:focus:border-[#78B895] resize-none"
                    placeholder="Provide detailed comments on clinical observations and treatment protocols."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#526158] dark:text-[#C1CEC5] mb-1">
                      Key Strengths Observed
                    </label>
                    <textarea
                      rows={2}
                      value={completeForm.strengths_notes}
                      onChange={(e) => setCompleteForm({ ...completeForm, strengths_notes: e.target.value })}
                      className="w-full bg-[#EEF4EF] dark:bg-[#223128] border border-[#D5DED8] dark:border-[#304036] text-[#17231C] dark:text-[#F1F6F2] text-xs rounded-xl p-3 focus:outline-none focus:border-[#2F6B4F] dark:focus:border-[#78B895] resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#526158] dark:text-[#C1CEC5] mb-1">
                      Areas for Clinical Growth
                    </label>
                    <textarea
                      rows={2}
                      value={completeForm.areas_for_growth}
                      onChange={(e) => setCompleteForm({ ...completeForm, areas_for_growth: e.target.value })}
                      className="w-full bg-[#EEF4EF] dark:bg-[#223128] border border-[#D5DED8] dark:border-[#304036] text-[#17231C] dark:text-[#F1F6F2] text-xs rounded-xl p-3 focus:outline-none focus:border-[#2F6B4F] dark:focus:border-[#78B895] resize-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#526158] dark:text-[#C1CEC5] mb-1">
                    Mentor Recommendation for Future Career / PG
                  </label>
                  <input
                    type="text"
                    value={completeForm.recommendations}
                    onChange={(e) => setCompleteForm({ ...completeForm, recommendations: e.target.value })}
                    className="w-full bg-[#EEF4EF] dark:bg-[#223128] border border-[#D5DED8] dark:border-[#304036] text-[#17231C] dark:text-[#F1F6F2] text-xs rounded-xl p-3 focus:outline-none focus:border-[#2F6B4F] dark:focus:border-[#78B895]"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="bg-[#EEF4EF] dark:bg-[#223128] p-3.5 rounded-xl border border-[#D5DED8] dark:border-[#304036] space-y-2">
                <label className="flex items-center gap-2.5 cursor-pointer text-xs text-[#526158] dark:text-[#C1CEC5] font-medium">
                  <input
                    type="checkbox"
                    checked={completeForm.add_to_student_portfolio}
                    onChange={(e) => setCompleteForm({ ...completeForm, add_to_student_portfolio: e.target.checked })}
                    className="rounded accent-[#2F6B4F] dark:accent-[#78B895] w-4 h-4 cursor-pointer"
                  />
                  <span>Automatically add verified clinical credential to scholar&apos;s Public Portfolio</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer text-xs text-[#526158] dark:text-[#C1CEC5] font-medium">
                  <input
                    type="checkbox"
                    checked={completeForm.generate_certificate}
                    onChange={(e) => setCompleteForm({ ...completeForm, generate_certificate: e.target.checked })}
                    className="rounded accent-[#2F6B4F] dark:accent-[#78B895] w-4 h-4 cursor-pointer"
                  />
                  <span>Generate cryptographic NCISM Certificate with public verification hash</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#D5DED8] dark:border-[#304036]">
                <button
                  type="button"
                  onClick={() => setShowCompleteModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#EEF4EF] dark:bg-[#223128] hover:bg-[#D5DED8] dark:hover:bg-[#304036] text-[#526158] dark:text-[#C1CEC5] text-xs font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-[#A96F16] hover:bg-[#8F5D12] dark:bg-[#E5B85C] dark:hover:bg-[#D4A74B] text-white dark:text-[#0D1511] text-xs font-bold transition shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? "Issuing Certificate..." : "🎓 Complete Rotation & Issue Certificate"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CERTIFICATE PREVIEW MODAL */}
      {showCertModal && certificateData && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#FFFFFF] dark:bg-[#17211B] text-[#17231C] dark:text-[#F1F6F2] rounded-3xl max-w-2xl w-full p-8 space-y-6 shadow-2xl border-4 border-[#A96F16]/30 dark:border-[#E5B85C]/30 relative my-8">
            <div className="flex justify-between items-start border-b border-[#D5DED8] dark:border-[#304036] pb-4">
              <div>
                <span className="px-2.5 py-1 bg-[#DCEBE1] dark:bg-[#294637] text-[#2F7D4A] dark:text-[#7BC894] text-[10px] font-bold rounded-full">
                  OFFICIAL ISSUANCE
                </span>
                <h3 className="text-xl font-bold text-[#142019] dark:text-[#FFFFFF] mt-1">
                  AyurSetu Clinical Rotation Certificate
                </h3>
              </div>
              <button
                onClick={() => setShowCertModal(false)}
                className="text-[#526158] dark:text-[#98A99E] hover:text-[#17231C] dark:hover:text-[#F1F6F2] font-bold p-1 rounded-lg hover:bg-[#EEF4EF] dark:hover:bg-[#223128] text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="text-center space-y-2 py-4 bg-[#EEF4EF] dark:bg-[#223128] rounded-2xl border border-[#D5DED8] dark:border-[#304036] p-6">
              <div className="text-xs uppercase tracking-widest text-[#68776D] dark:text-[#98A99E] font-semibold">Awarded To</div>
              <div className="text-2xl font-bold text-[#142019] dark:text-[#FFFFFF]">
                {certificateData.student_name}
              </div>
              <p className="text-xs text-[#526158] dark:text-[#C1CEC5] max-w-md mx-auto">
                for successful completion of <strong className="text-[#17231C] dark:text-[#F1F6F2]">{certificateData.internship_title}</strong> with {certificateData.total_hours_completed} verified clinical hours.
              </p>
              <div className="text-xs text-[#526158] dark:text-[#98A99E] font-mono pt-2">
                Credential ID: <span className="font-bold text-[#17231C] dark:text-[#F1F6F2]">{certificateData.certificate_token}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <Link
                href={`/verify/certificate/${certificateData.certificate_token}`}
                target="_blank"
                className="px-4 py-2 rounded-xl bg-[#2F6B4F] hover:bg-[#24563F] dark:bg-[#78B895] dark:hover:bg-[#91CAA8] text-white dark:text-[#0D1511] text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
              >
                <Award className="w-4 h-4" /> Open Public Verification Page
              </Link>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-[#EEF4EF] dark:bg-[#223128] hover:bg-[#D5DED8] dark:hover:bg-[#304036] text-[#17231C] dark:text-[#F1F6F2] border border-[#D5DED8] dark:border-[#304036] text-xs font-semibold transition cursor-pointer"
              >
                Print Certificate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
