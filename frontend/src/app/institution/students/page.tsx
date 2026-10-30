"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Users, Search, Filter, Plus, UserCheck, ShieldAlert, Award, FileText, ArrowRight, Mail, CheckCircle2, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";

export default function StudentDirectoryPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [assessmentFilter, setAssessmentFilter] = useState("");

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteIdentifier, setInviteIdentifier] = useState("");
  const [inviteDept, setInviteDept] = useState("");
  const [inviting, setInviting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function loadStudents() {
    try {
      const params: any = {};
      if (search) params.search = search;
      if (deptFilter) params.department_id = deptFilter;
      if (assessmentFilter) params.assessment_status = assessmentFilter;

      const res = await api.get("/institution/students", { params });
      setStudents(res.data.items || []);
    } catch (e: any) {
      console.error(e);
      if (e.response?.status === 403) {
        setMessage({
          type: "error",
          text: "Access to student directory requires VERIFIED institution status. Complete your profile and wait for admin review."
        });
      }
    } finally {
      setLoading(false);
    }
  }

  async function loadDepts() {
    try {
      const res = await api.get("/institution/departments");
      setDepartments(res.data || []);
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    loadStudents();
    loadDepts();
  }, [search, deptFilter, assessmentFilter]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviting(true);
    setMessage(null);

    try {
      const res = await api.post("/institution/students/invite", {
        email: inviteEmail,
        student_identifier: inviteIdentifier || undefined,
        department_id: inviteDept || undefined
      });
      setMessage({ type: "success", text: res.data.message });
      setShowInviteModal(false);
      setInviteEmail("");
      setInviteIdentifier("");
      loadStudents();
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.response?.data?.detail || "Failed to invite student."
      });
    } finally {
      setInviting(false);
    }
  };

  const handleDeactivateMembership = async (studentId: string) => {
    if (!confirm("Deactivate this student's institution membership? Student profile and application data will remain preserved.")) return;
    try {
      await api.delete(`/institution/students/${studentId}/membership`);
      loadStudents();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9F4] dark:bg-[#0D1511] text-[#17231C] dark:text-[#F1F6F2] font-sans flex flex-col transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] p-6 rounded-2xl shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DCEBE1] dark:bg-[#294637] text-[#2F6B4F] dark:text-[#78B895] border border-[#2F6B4F]/20 text-xs font-semibold uppercase tracking-wider mb-2">
              <Users className="w-3.5 h-3.5" /> Enrolled Students
            </div>
            <h1 className="text-2xl font-extrabold text-[#142019] dark:text-white">Student Directory</h1>
            <p className="text-xs text-[#526158] dark:text-[#C1CEC5] mt-1">
              Search students, track skill assessment completion, readiness scores, and manage memberships.
            </p>
          </div>
          <button
            onClick={() => setShowInviteModal(true)}
            className="px-4 py-2.5 rounded-xl bg-[#2F6B4F] hover:bg-[#24563F] dark:bg-[#78B895] dark:hover:bg-[#91CAA8] text-white dark:text-[#0D1511] font-bold text-xs transition-colors flex items-center gap-2 shadow-xs"
          >
            <Plus className="w-4 h-4" /> Link / Invite Student
          </button>
        </div>

        {message && (
          <div className={`p-4 rounded-xl border flex items-center gap-3 text-xs font-semibold ${
            message.type === "success"
              ? "bg-[#DCEBE1] dark:bg-[#294637] border-[#2F7D4A]/40 text-[#2F7D4A] dark:text-[#7BC894]"
              : "bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-900 text-red-700 dark:text-red-300"
          }`}>
            {message.type === "success" ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
            <span>{message.text}</span>
          </div>
        )}

        {/* Filters & Search */}
        <div className="bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] p-4 rounded-xl shadow-xs flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-[#68776D] dark:text-[#98A99E] absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by student name or degree program..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#EEF4EF] dark:bg-[#223128] border border-[#D5DED8] dark:border-[#304036] rounded-xl pl-10 pr-4 py-2 text-xs text-[#17231C] dark:text-[#F1F6F2] placeholder-[#68776D] dark:placeholder-[#98A99E] focus:outline-none focus:border-[#2F6B4F] dark:focus:border-[#78B895]"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="bg-[#EEF4EF] dark:bg-[#223128] border border-[#D5DED8] dark:border-[#304036] rounded-xl px-3 py-2 text-xs text-[#17231C] dark:text-[#F1F6F2] focus:outline-none focus:border-[#2F6B4F] dark:focus:border-[#78B895]"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>

            <select
              value={assessmentFilter}
              onChange={(e) => setAssessmentFilter(e.target.value)}
              className="bg-[#EEF4EF] dark:bg-[#223128] border border-[#D5DED8] dark:border-[#304036] rounded-xl px-3 py-2 text-xs text-[#17231C] dark:text-[#F1F6F2] focus:outline-none focus:border-[#2F6B4F] dark:focus:border-[#78B895]"
            >
              <option value="">All Assessment Status</option>
              <option value="ASSESSED">Assessed Only</option>
              <option value="NOT_ASSESSED">Pending Assessment</option>
            </select>
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#EEF4EF]/60 dark:bg-[#223128]/60 border-b border-[#D5DED8] dark:border-[#304036] text-[11px] font-bold text-[#526158] dark:text-[#C1CEC5] uppercase tracking-wider">
                  <th className="p-4">Student Name</th>
                  <th className="p-4">Department</th>
                  <th className="p-4">Degree / Year</th>
                  <th className="p-4 text-center">Profile %</th>
                  <th className="p-4 text-center">Avg Skill Score</th>
                  <th className="p-4 text-center">Applications</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D5DED8]/60 dark:divide-[#304036]/60 text-xs">
                {students.map((s) => (
                  <tr key={s.id} className="hover:bg-[#EEF4EF]/40 dark:hover:bg-[#223128]/40 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-[#17231C] dark:text-[#F1F6F2]">{s.full_name}</div>
                      <div className="text-[10px] text-[#68776D] dark:text-[#98A99E] font-mono mt-0.5">{s.email}</div>
                    </td>
                    <td className="p-4 text-[#526158] dark:text-[#C1CEC5]">
                      {s.department_name ? (
                        <span className="px-2 py-0.5 rounded bg-[#DCEBE1] dark:bg-[#294637] text-[#2F6B4F] dark:text-[#78B895] border border-[#2F6B4F]/20 text-[10px] font-semibold">
                          {s.department_name}
                        </span>
                      ) : (
                        <span className="text-[#68776D] dark:text-[#98A99E] italic">Unassigned</span>
                      )}
                    </td>
                    <td className="p-4 text-[#526158] dark:text-[#C1CEC5]">
                      <div className="font-medium text-[#17231C] dark:text-[#F1F6F2]">{s.degree_program || "BAMS"}</div>
                      {s.current_year && <div className="text-[10px] text-[#68776D] dark:text-[#98A99E]">Year {s.current_year}</div>}
                    </td>
                    <td className="p-4 text-center font-mono font-bold text-[#2F7D4A] dark:text-[#7BC894]">
                      {s.profile_completion_pct}%
                    </td>
                    <td className="p-4 text-center font-mono font-bold">
                      {s.assessment_completed ? (
                        <span className="text-[#2F6B4F] dark:text-[#78B895]">{s.average_skill_score} / 100</span>
                      ) : (
                        <span className="text-[#68776D] dark:text-[#98A99E] text-[10px] italic">Pending</span>
                      )}
                    </td>
                    <td className="p-4 text-center font-mono text-[#356F9D] dark:text-[#80B5DD] font-bold">
                      {s.total_applications_count}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/institution/students/${s.id}`}
                          className="px-3 py-1.5 rounded-lg bg-[#DCEBE1] dark:bg-[#294637] hover:bg-[#2F6B4F] hover:text-white dark:hover:bg-[#78B895] dark:hover:text-[#0D1511] text-[#2F6B4F] dark:text-[#78B895] font-bold text-[11px] transition-colors border border-[#2F6B4F]/30 flex items-center gap-1"
                        >
                          View Profile <ArrowRight className="w-3 h-3" />
                        </Link>
                        <button
                          onClick={() => handleDeactivateMembership(s.id)}
                          className="px-2 py-1 rounded bg-[#EEF4EF] dark:bg-[#223128] hover:bg-red-50 dark:hover:bg-red-950/50 text-[#68776D] hover:text-red-600 dark:hover:text-red-400 text-[10px] transition-colors"
                          title="Deactivate Membership"
                        >
                          Deactivate
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {students.length === 0 && !loading && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-[#68776D] dark:text-[#98A99E] text-xs">
                      No enrolled students found matching search filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal for Linking Student */}
        {showInviteModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] max-w-md w-full p-6 rounded-2xl shadow-xl space-y-6">
              <h3 className="text-lg font-bold text-[#142019] dark:text-white">Link or Invite Student</h3>
              <form onSubmit={handleInvite} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#526158] dark:text-[#C1CEC5] uppercase tracking-wider mb-2">
                    Student Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full bg-[#EEF4EF] dark:bg-[#223128] border border-[#D5DED8] dark:border-[#304036] rounded-xl px-4 py-2.5 text-sm text-[#17231C] dark:text-[#F1F6F2] focus:outline-none focus:border-[#2F6B4F] dark:focus:border-[#78B895]"
                    placeholder="student@institution.edu.in"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#526158] dark:text-[#C1CEC5] uppercase tracking-wider mb-2">
                    Student Identifier / Roll No
                  </label>
                  <input
                    type="text"
                    value={inviteIdentifier}
                    onChange={(e) => setInviteIdentifier(e.target.value)}
                    className="w-full bg-[#EEF4EF] dark:bg-[#223128] border border-[#D5DED8] dark:border-[#304036] rounded-xl px-4 py-2.5 text-sm text-[#17231C] dark:text-[#F1F6F2] focus:outline-none focus:border-[#2F6B4F] dark:focus:border-[#78B895]"
                    placeholder="AYUR-2026-101"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#526158] dark:text-[#C1CEC5] uppercase tracking-wider mb-2">
                    Assign Department
                  </label>
                  <select
                    value={inviteDept}
                    onChange={(e) => setInviteDept(e.target.value)}
                    className="w-full bg-[#EEF4EF] dark:bg-[#223128] border border-[#D5DED8] dark:border-[#304036] rounded-xl px-4 py-2.5 text-sm text-[#17231C] dark:text-[#F1F6F2] focus:outline-none focus:border-[#2F6B4F] dark:focus:border-[#78B895]"
                  >
                    <option value="">Select Department</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    className="px-4 py-2 rounded-xl bg-[#EEF4EF] dark:bg-[#223128] hover:bg-[#D5DED8] dark:hover:bg-[#304036] text-[#17231C] dark:text-[#F1F6F2] font-bold text-xs transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={inviting}
                    className="px-4 py-2 rounded-xl bg-[#2F6B4F] hover:bg-[#24563F] dark:bg-[#78B895] dark:hover:bg-[#91CAA8] text-white dark:text-[#0D1511] font-bold text-xs transition-colors disabled:opacity-50"
                  >
                    {inviting ? "Linking..." : "Link Student"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
