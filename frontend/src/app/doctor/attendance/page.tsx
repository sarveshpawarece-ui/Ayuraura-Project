"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { api } from "@/lib/api";
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Activity,
  PlusCircle,
  User,
  ArrowRight,
  TrendingUp,
  Percent,
  Search,
  Filter
} from "lucide-react";

export default function DoctorAttendancePage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [selectedAppId, setSelectedAppId] = useState<string>("");
  const [attendanceSummary, setAttendanceSummary] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingModal, setLoggingModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form
  const [logForm, setLogForm] = useState({
    date: new Date().toISOString().split("T")[0],
    check_in: "09:00",
    check_out: "17:00",
    status: "PRESENT",
    hours_worked: 8,
    remarks: "Attended Panchakarma OPD, observed Vamana therapy setup."
  });

  const fetchAcceptedStudents = async () => {
    setLoading(true);
    try {
      const res = await api.get("/internships/applications/doctor/me");
      if (Array.isArray(res.data)) {
        // Filter applications that are accepted or offered
        const accepted = res.data.filter((a: any) =>
          ["ACCEPTED", "OFFERED", "SHORTLISTED", "UNDER_REVIEW"].includes(a.status)
        );
        setApplications(accepted);
        if (accepted.length > 0 && !selectedAppId) {
          setSelectedAppId(accepted[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to load applicants for attendance:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceForApp = async (appId: string) => {
    if (!appId) return;
    try {
      const res = await api.get(`/internships/applications/${appId}/attendance`);
      setAttendanceSummary(res.data);
    } catch (err) {
      console.error("Failed to fetch attendance:", err);
      setAttendanceSummary(null);
    }
  };

  useEffect(() => {
    fetchAcceptedStudents();
  }, []);

  useEffect(() => {
    if (selectedAppId) {
      fetchAttendanceForApp(selectedAppId);
    }
  }, [selectedAppId]);

  const handleRecordAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppId) return;
    setSubmitting(true);
    setMsg(null);

    try {
      await api.post(`/internships/applications/${selectedAppId}/attendance`, {
        date: logForm.date,
        check_in: logForm.check_in || undefined,
        check_out: logForm.check_out || undefined,
        status: logForm.status,
        hours_worked: Number(logForm.hours_worked) || 0,
        remarks: logForm.remarks || undefined
      });

      setMsg({ type: "success", text: "Daily attendance logged successfully!" });
      setLoggingModal(false);
      fetchAttendanceForApp(selectedAppId);
    } catch (err: any) {
      setMsg({ type: "error", text: err.response?.data?.detail || "Failed to log attendance." });
    } finally {
      setSubmitting(false);
    }
  };

  const selectedApp = applications.find((a) => a.id === selectedAppId);

  return (
    <div className="min-h-screen bg-[#F6F3EB] dark:bg-[#07160e] text-[#2C332E] dark:text-[#FAF7F2] selection:bg-[#1E3A2B] selection:text-white">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#0e301e] via-[#16432b] to-[#0a2316] text-[#f7f4ea] shadow-xl border border-emerald-800/40 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/60 border border-emerald-700/50 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-1">
              <Activity className="w-3.5 h-3.5 text-[#C87D32]" />
              <span>Doctor Attendance Portal • Clinical Practice Logs</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif-heading text-white">
              Intern Attendance & Time Logs
            </h1>
            <p className="text-xs sm:text-sm text-emerald-200/90 max-w-2xl">
              Record daily check-in / check-out times, calculate attendance percentage, and verify clinical training hours.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {selectedAppId && (
              <Link
                href={`/doctor/progress/${selectedAppId}`}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold border border-white/20 transition-all flex items-center gap-2"
              >
                <TrendingUp className="w-4 h-4 text-emerald-400" /> View Milestones
              </Link>
            )}
            <button
              onClick={() => {
                setLoggingModal(true);
                setMsg(null);
              }}
              disabled={!selectedAppId}
              className="px-4 py-2.5 rounded-xl bg-[#C87D32] hover:bg-[#b06a26] text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" /> Log Today&apos;s Attendance
            </button>
          </div>
        </div>

        {/* Message Alert */}
        {msg && (
          <div
            className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-xs ${
              msg.type === "success"
                ? "bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[#1E3A2B] dark:text-emerald-300"
                : "bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300"
            }`}
          >
            <span>{msg.text}</span>
            <button onClick={() => setMsg(null)} className="font-bold">✕</button>
          </div>
        )}

        {/* Student Selector Card */}
        <div className="bg-white dark:bg-[#0c2419] rounded-2xl p-5 border border-[#E5DFD3] dark:border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
          <div className="w-full md:w-auto">
            <label className="block text-xs font-semibold text-[#6B7260] dark:text-slate-400 mb-1">
              Select Active Intern:
            </label>
            <select
              value={selectedAppId}
              onChange={(e) => setSelectedAppId(e.target.value)}
              className="w-full md:w-80 bg-[#FAF7F2] dark:bg-[#07160e] border border-[#E5DFD3] dark:border-white/15 text-[#2C332E] dark:text-white text-xs rounded-xl p-2.5 focus:outline-none focus:border-[#1E3A2B] font-medium"
            >
              {applications.length === 0 ? (
                <option value="">No applicants found</option>
              ) : (
                applications.map((app) => (
                  <option key={app.id} value={app.id}>
                    {app.student_name} — {app.internship_title} ({app.status})
                  </option>
                ))
              )}
            </select>
          </div>

          {selectedApp && (
            <div className="flex items-center gap-4 text-xs bg-[#FAF7F2] dark:bg-black/20 px-4 py-3 rounded-xl border border-[#E5DFD3] dark:border-white/10">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-[#1E3A2B] dark:text-emerald-400" />
                <span className="text-[#6B7260] dark:text-slate-300">Student: <strong className="text-[#2C332E] dark:text-white">{selectedApp.student_name}</strong></span>
              </div>
              <div className="hidden sm:block text-[#E5DFD3]">•</div>
              <div className="text-[#6B7260] dark:text-slate-400">
                Course: <strong className="text-[#2C332E] dark:text-slate-200">{selectedApp.student_course || "BAMS"}</strong>
              </div>
              <div className="hidden sm:block text-[#E5DFD3]">•</div>
              <div>
                Status: <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 uppercase">{selectedApp.status}</span>
              </div>
            </div>
          )}
        </div>

        {/* Attendance Summary Widgets */}
        {attendanceSummary && (
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-[#0c2419] border border-[#E5DFD3] dark:border-white/10 text-center shadow-xs">
              <p className="text-[11px] font-semibold text-[#6B7260] dark:text-slate-400">Total Logged</p>
              <p className="text-2xl font-serif-heading font-bold text-[#1E3A2B] dark:text-white mt-1">
                {attendanceSummary.total_days} <span className="text-xs font-normal text-[#6B7260]">Days</span>
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-[#0c2419] border border-[#E5DFD3] dark:border-white/10 text-center shadow-xs">
              <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Present
              </p>
              <p className="text-2xl font-serif-heading font-bold text-emerald-700 dark:text-emerald-300 mt-1">
                {attendanceSummary.present_days}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-[#0c2419] border border-[#E5DFD3] dark:border-white/10 text-center shadow-xs">
              <p className="text-[11px] font-semibold text-[#C87D32] flex items-center justify-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Half Days
              </p>
              <p className="text-2xl font-serif-heading font-bold text-[#C87D32] mt-1">
                {attendanceSummary.half_days}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-[#0c2419] border border-[#E5DFD3] dark:border-white/10 text-center shadow-xs">
              <p className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 flex items-center justify-center gap-1">
                <XCircle className="w-3.5 h-3.5" /> Absent
              </p>
              <p className="text-2xl font-serif-heading font-bold text-rose-600 dark:text-rose-400 mt-1">
                {attendanceSummary.absent_days}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-[#0c2419] border border-[#E5DFD3] dark:border-white/10 text-center shadow-xs">
              <p className="text-[11px] font-semibold text-purple-700 dark:text-purple-300 flex items-center justify-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Leave Days
              </p>
              <p className="text-2xl font-serif-heading font-bold text-purple-700 dark:text-purple-300 mt-1">
                {attendanceSummary.leave_days}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-[#FAF7F2] dark:bg-[#0c2419] border-2 border-[#1E3A2B] text-center shadow-xs">
              <p className="text-[11px] font-semibold text-[#1E3A2B] dark:text-emerald-300 flex items-center justify-center gap-1">
                <Percent className="w-3.5 h-3.5 text-[#C87D32]" /> Rate
              </p>
              <p className="text-2xl font-serif-heading font-bold text-[#1E3A2B] dark:text-emerald-300 mt-1">
                {attendanceSummary.attendance_percentage}%
              </p>
            </div>
          </div>
        )}

        {/* Logs Table */}
        <div className="bg-white dark:bg-[#0c2419] rounded-2xl border border-[#E5DFD3] dark:border-white/10 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-[#E5DFD3] dark:border-white/10 flex items-center justify-between">
            <h3 className="text-sm font-serif-heading font-bold text-[#1E3A2B] dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#C87D32]" /> Attendance History & Logs
            </h3>
            <span className="text-xs text-[#6B7260] font-mono">
              Total Hours: <strong className="text-[#1E3A2B] dark:text-emerald-400 font-bold">{attendanceSummary?.total_hours_worked || 0} hrs</strong>
            </span>
          </div>

          {loading ? (
            <div className="py-16 text-center space-y-3">
              <div className="inline-block w-8 h-8 border-4 border-[#1E3A2B] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs text-[#6B7260]">Loading attendance data...</p>
            </div>
          ) : !attendanceSummary || attendanceSummary.logs.length === 0 ? (
            <div className="p-10 text-center space-y-3">
              <p className="text-xs text-[#6B7260] dark:text-slate-400">No attendance records logged yet for this intern.</p>
              <button
                onClick={() => setLoggingModal(true)}
                className="px-4 py-2 rounded-xl bg-[#1E3A2B] hover:bg-[#134927] text-white text-xs font-bold transition-all shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" /> Record First Entry
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse font-sans">
                <thead>
                  <tr className="bg-[#FAF7F2] dark:bg-black/20 text-[#6B7260] dark:text-slate-400 font-semibold border-b border-[#E5DFD3] dark:border-white/10">
                    <th className="py-3.5 px-6">Date</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Check-In</th>
                    <th className="py-3.5 px-4">Check-Out</th>
                    <th className="py-3.5 px-4">Hours</th>
                    <th className="py-3.5 px-6">Doctor Clinical Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5DFD3]/60 dark:divide-white/10 text-[#2C332E] dark:text-slate-200">
                  {attendanceSummary.logs.map((log: any) => (
                    <tr key={log.id} className="hover:bg-[#FAF7F2] dark:hover:bg-white/5 transition-colors">
                      <td className="py-3.5 px-6 font-mono font-medium text-[#2C332E] dark:text-slate-200">
                        {log.date}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase ${
                            log.status === "PRESENT"
                              ? "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border-emerald-200"
                              : log.status === "HALF_DAY"
                              ? "bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 border-amber-200"
                              : log.status === "LEAVE"
                              ? "bg-purple-50 dark:bg-purple-950/80 text-purple-700 dark:text-purple-400 border-purple-200"
                              : "bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-400 border-rose-200"
                          }`}
                        >
                          {log.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-[#6B7260] font-mono">
                        {log.check_in || "--"}
                      </td>
                      <td className="py-3.5 px-4 text-[#6B7260] font-mono">
                        {log.check_out || "--"}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-[#1E3A2B] dark:text-slate-300">
                        {log.hours_worked}h
                      </td>
                      <td className="py-3.5 px-6 text-[#6B7260] dark:text-slate-400 italic">
                        {log.remarks || "Regular OPD attendance"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* LOG ATTENDANCE MODAL */}
      {loggingModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#0c2419] border border-[#E5DFD3] dark:border-white/15 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#E5DFD3] dark:border-white/10 pb-3">
              <h3 className="text-base font-serif-heading font-bold text-[#1E3A2B] dark:text-white flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-[#C87D32]" /> Log Daily Attendance
              </h3>
              <button
                onClick={() => setLoggingModal(false)}
                className="text-[#6B7260] hover:text-[#1E3A2B] font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRecordAttendance} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#3b5947] dark:text-emerald-300 mb-1">
                  Attendance Date <span className="text-[#C87D32]">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={logForm.date}
                  onChange={(e) => setLogForm({ ...logForm, date: e.target.value })}
                  className="w-full bg-[#FAF7F2] dark:bg-[#07160e] border border-[#E5DFD3] dark:border-white/15 text-[#2C332E] dark:text-white text-xs rounded-xl p-3 focus:outline-none focus:border-[#1E3A2B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#3b5947] dark:text-emerald-300 mb-1">
                    Check-In Time
                  </label>
                  <input
                    type="time"
                    value={logForm.check_in}
                    onChange={(e) => setLogForm({ ...logForm, check_in: e.target.value })}
                    className="w-full bg-[#FAF7F2] dark:bg-[#07160e] border border-[#E5DFD3] dark:border-white/15 text-[#2C332E] dark:text-white text-xs rounded-xl p-3 focus:outline-none focus:border-[#1E3A2B]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#3b5947] dark:text-emerald-300 mb-1">
                    Check-Out Time
                  </label>
                  <input
                    type="time"
                    value={logForm.check_out}
                    onChange={(e) => setLogForm({ ...logForm, check_out: e.target.value })}
                    className="w-full bg-[#FAF7F2] dark:bg-[#07160e] border border-[#E5DFD3] dark:border-white/15 text-[#2C332E] dark:text-white text-xs rounded-xl p-3 focus:outline-none focus:border-[#1E3A2B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#3b5947] dark:text-emerald-300 mb-1">
                    Attendance Status <span className="text-[#C87D32]">*</span>
                  </label>
                  <select
                    value={logForm.status}
                    onChange={(e) => setLogForm({ ...logForm, status: e.target.value })}
                    className="w-full bg-[#FAF7F2] dark:bg-[#07160e] border border-[#E5DFD3] dark:border-white/15 text-[#2C332E] dark:text-white text-xs rounded-xl p-3 focus:outline-none focus:border-[#1E3A2B]"
                  >
                    <option value="PRESENT">PRESENT (Full Day)</option>
                    <option value="HALF_DAY">HALF DAY (0.5 Day)</option>
                    <option value="ABSENT">ABSENT</option>
                    <option value="LEAVE">LEAVE / PERMITTED</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#3b5947] dark:text-emerald-300 mb-1">
                    Effective Hours
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={logForm.hours_worked}
                    onChange={(e) => setLogForm({ ...logForm, hours_worked: Number(e.target.value) })}
                    className="w-full bg-[#FAF7F2] dark:bg-[#07160e] border border-[#E5DFD3] dark:border-white/15 text-[#2C332E] dark:text-white text-xs rounded-xl p-3 focus:outline-none focus:border-[#1E3A2B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3b5947] dark:text-emerald-300 mb-1">
                  Clinical Observation / Remarks
                </label>
                <textarea
                  rows={2}
                  value={logForm.remarks}
                  onChange={(e) => setLogForm({ ...logForm, remarks: e.target.value })}
                  className="w-full bg-[#FAF7F2] dark:bg-[#07160e] border border-[#E5DFD3] dark:border-white/15 text-[#2C332E] dark:text-white text-xs rounded-xl p-3 focus:outline-none focus:border-[#1E3A2B] resize-none"
                  placeholder="e.g. Conducted Prakriti assessment on 4 OPD patients."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E5DFD3] dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setLoggingModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 text-[#2C332E] dark:text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-[#1E3A2B] hover:bg-[#134927] text-white text-xs font-bold transition-all shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? "Saving..." : "Save Daily Log"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
