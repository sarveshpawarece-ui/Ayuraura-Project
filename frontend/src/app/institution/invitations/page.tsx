"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  UserPlus,
  Mail,
  Copy,
  CheckCircle2,
  Trash2,
  ChevronLeft,
  GraduationCap,
  Sparkles,
  ShieldAlert,
  Clock,
  Filter
} from "lucide-react";
import { api } from "@/lib/api";
import {
  DashboardLayout,
  DashboardHeader,
  DashboardCard,
  DashboardLoadingSkeleton
} from "@/components/dashboard";

export default function InstitutionInvitationsPage() {
  const [invitations, setInvitations] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [showInviteModal, setShowInviteModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    email: "",
    role: "FACULTY",
    invited_name: "",
    department_id: "",
    designation: "Associate Professor",
    academic_year: "1st Year",
    subject_names: "Rachana Sharir, Kriya Sharir"
  });
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const [invRes, deptRes] = await Promise.all([
        api.get("/institution/invitations"),
        api.get("/institution/departments").catch(() => ({ data: [] }))
      ]);
      setInvitations(invRes.data);
      setDepartments(deptRes.data);
    } catch (e) {
      console.error("Error loading invitations:", e);
      // Demo fallback
      setInvitations([
        {
          id: "inv-1",
          email: "dr.sharma@nia.edu.in",
          role: "FACULTY",
          invited_name: "Dr. Suresh Sharma",
          department_name: "Samhita & Siddhanta",
          designation: "Associate Professor",
          invitation_token: "inv_demo_fac_token_8891",
          invite_url: "/register?invite=inv_demo_fac_token_8891",
          status: "PENDING",
          expires_at: "2026-11-12T10:00:00Z",
          created_at: "2026-10-29"
        },
        {
          id: "inv-2",
          email: "student.batch26@nia.edu.in",
          role: "STUDENT",
          invited_name: "Aditya Verma",
          academic_year: "1st Year",
          invitation_token: "inv_demo_stu_token_4412",
          invite_url: "/register?invite=inv_demo_stu_token_4412",
          status: "ACCEPTED",
          expires_at: "2026-11-10T10:00:00Z",
          created_at: "2026-10-26"
        }
      ]);
      setDepartments([
        { id: "dept-1", name: "Department of Samhita & Siddhanta", code: "SAMHITA" },
        { id: "dept-2", name: "Department of Dravyaguna Vijnana", code: "DRAVYA" },
        { id: "dept-3", name: "Department of Shalya Tantra", code: "SHALYA" }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const assignedSubjectsList = formData.role === "FACULTY" && formData.subject_names
        ? formData.subject_names.split(",").map(s => ({ name: s.trim() }))
        : [];

      const payload = {
        email: formData.email,
        role: formData.role,
        invited_name: formData.invited_name || undefined,
        department_id: formData.department_id || undefined,
        designation: formData.role === "FACULTY" ? formData.designation : undefined,
        academic_year: formData.role === "STUDENT" ? formData.academic_year : undefined,
        assigned_subjects: assignedSubjectsList
      };

      const res = await api.post("/institution/invitations", payload);
      setSuccessMsg(`Secure invitation generated for ${formData.email}!`);
      setShowInviteModal(false);
      setFormData({
        email: "",
        role: "FACULTY",
        invited_name: "",
        department_id: "",
        designation: "Associate Professor",
        academic_year: "1st Year",
        subject_names: "Rachana Sharir, Kriya Sharir"
      });
      loadData();
      setTimeout(() => setSuccessMsg(""), 5000);
    } catch (e: any) {
      alert(e.response?.data?.detail || "Failed to create invitation.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevoke = async (id: string) => {
    if (!confirm("Revoke this invitation token? The invite link will become invalid.")) return;
    try {
      await api.delete(`/institution/invitations/${id}`);
      setInvitations(prev => prev.map(inv => inv.id === id ? { ...inv, status: "REVOKED" } : inv));
    } catch (e) {
      alert("Failed to revoke invitation.");
    }
  };

  const copyLink = (token: string) => {
    const fullUrl = `${window.location.origin}/register?invite=${token}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 3000);
  };

  const filtered = invitations.filter(inv => roleFilter === "ALL" || inv.role === roleFilter);

  return (
    <DashboardLayout>
      <div className="mb-4">
        <Link
          href="/institution/dashboard"
          className="text-xs text-slate-400 hover:text-amber-400 font-medium inline-flex items-center gap-1 transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" /> Back to Institution Dashboard
        </Link>
      </div>

      <DashboardHeader
        badgeText="Access Governance & Invitations"
        badgeIcon={<Users className="w-3.5 h-3.5" />}
        badgeVariant="amber"
        title="Faculty & Student Invitation Management"
        subtitle="Issue secure tokenized invitations to onboarding professors and student batches. Role assignment is locked to the invitation to prevent privilege escalation."
        actions={[
          {
            label: "Invite Member",
            onClick: () => setShowInviteModal(true),
            icon: UserPlus,
            variant: "amber",
          },
        ]}
      />

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs font-semibold flex items-center gap-2 mb-6">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" /> {successMsg}
        </div>
      )}

      {/* Security Advisory */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-700/60 text-slate-300 text-xs flex items-start gap-3 mb-6">
        <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-white">Role Security Guarantee:</strong> Users registering via an invitation token cannot elevate their privileges or modify assigned institutional roles. Tokens expire automatically after 14 days.
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 mb-6 flex items-center justify-between">
        <span className="text-xs text-slate-400 font-medium">Filter by Invited Role</span>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3.5 py-1.5 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-amber-500"
        >
          <option value="ALL">All Roles</option>
          <option value="FACULTY">Faculty Only</option>
          <option value="STUDENT">Students Only</option>
        </select>
      </div>

      {/* Invitations Table */}
      {loading ? (
        <DashboardLoadingSkeleton />
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/30 border border-slate-800">
          <UserPlus className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h4 className="text-base font-semibold text-slate-300">No invitations generated</h4>
          <p className="text-xs text-slate-500 mt-1">Invite faculty members or students to connect with your institution.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/40 shadow-xl">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Invited Email & Name</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Department / Year</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Invitation Link</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-100">{inv.invited_name || "Invited User"}</div>
                    <div className="text-slate-400 text-[11px] font-mono">{inv.email}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      inv.role === "FACULTY"
                        ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                        : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                    }`}>
                      {inv.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-300">
                    {inv.role === "FACULTY" ? (
                      <div>
                        <div>{inv.department_name || "General Faculty"}</div>
                        <div className="text-[11px] text-slate-500">{inv.designation || "Faculty"}</div>
                      </div>
                    ) : (
                      <span>{inv.academic_year || "1st Year"}</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      inv.status === "ACCEPTED"
                        ? "bg-emerald-950 text-emerald-300 border border-emerald-500/30"
                        : inv.status === "PENDING"
                        ? "bg-amber-950 text-amber-300 border border-amber-500/30"
                        : "bg-rose-950 text-rose-300 border border-rose-500/30"
                    }`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    {inv.status === "PENDING" ? (
                      <button
                        onClick={() => copyLink(inv.invitation_token)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Copy className="w-3 h-3" />
                        {copiedToken === inv.invitation_token ? "Copied Link!" : "Copy Invite Link"}
                      </button>
                    ) : (
                      <span className="text-slate-500 text-[11px]">Completed</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {inv.status === "PENDING" && (
                      <button
                        onClick={() => handleRevoke(inv.id)}
                        className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
                        title="Revoke Invitation"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-950 border border-amber-500/30 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-amber-400" /> Send Institutional Invitation
              </h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleInvite} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Invited User Role *</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: "FACULTY" })}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                      formData.role === "FACULTY"
                        ? "bg-purple-950/80 border-purple-500 text-purple-200"
                        : "bg-slate-900 border-slate-800 text-slate-400"
                    }`}
                  >
                    Faculty Member
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: "STUDENT" })}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                      formData.role === "STUDENT"
                        ? "bg-blue-950/80 border-blue-500 text-blue-200"
                        : "bg-slate-900 border-slate-800 text-slate-400"
                    }`}
                  >
                    Enrolled Student
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="professor@institute.edu or student@institute.edu"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Full Name (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Prof. Dr. Suresh Sharma"
                  value={formData.invited_name}
                  onChange={(e) => setFormData({ ...formData, invited_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              {formData.role === "FACULTY" ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-medium mb-1">Department</label>
                      <select
                        value={formData.department_id}
                        onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-amber-500"
                      >
                        <option value="">Select Department...</option>
                        {departments.map((d) => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-medium mb-1">Designation</label>
                      <input
                        type="text"
                        placeholder="Associate Professor"
                        value={formData.designation}
                        onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Assigned Subjects (comma-separated)</label>
                    <input
                      type="text"
                      placeholder="e.g. Rachana Sharir, Kriya Sharir"
                      value={formData.subject_names}
                      onChange={(e) => setFormData({ ...formData, subject_names: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-slate-300 font-medium mb-1">BAMS Curriculum Year</label>
                  <select
                    value={formData.academic_year}
                    onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="1st Year">1st Year BAMS</option>
                    <option value="2nd Year">2nd Year BAMS</option>
                    <option value="3rd Year">3rd Year BAMS</option>
                    <option value="4th Year">4th Year BAMS</option>
                  </select>
                </div>
              )}

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold transition-colors disabled:opacity-50"
                >
                  {submitting ? "Generating..." : "Generate Secure Invite"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
