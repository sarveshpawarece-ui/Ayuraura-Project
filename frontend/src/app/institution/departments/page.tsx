"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { BookOpen, Plus, Users, Award, BarChart3, Edit3, Trash2, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { api } from "@/lib/api";

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDept, setEditingDept] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: ""
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function loadDepartments() {
    try {
      const res = await api.get("/institution/departments");
      setDepartments(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDepartments();
  }, []);

  const handleOpenAdd = () => {
    setEditingDept(null);
    setFormData({ name: "", code: "", description: "" });
    setShowModal(true);
  };

  const handleOpenEdit = (dept: any) => {
    setEditingDept(dept);
    setFormData({ name: dept.name, code: dept.code, description: dept.description || "" });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      if (editingDept) {
        await api.patch(`/institution/departments/${editingDept.id}`, formData);
        setMessage({ type: "success", text: "Department updated successfully!" });
      } else {
        await api.post("/institution/departments", formData);
        setMessage({ type: "success", text: "New department added successfully!" });
      }
      setShowModal(false);
      loadDepartments();
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.response?.data?.detail || "Failed to save department details."
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to deactivate ${name}?`)) return;
    try {
      await api.post(`/institution/departments/${id}/deactivate`);
      loadDepartments();
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
              <BookOpen className="w-3.5 h-3.5" /> Department Structure
            </div>
            <h1 className="text-2xl font-extrabold text-[#142019] dark:text-white">Academic Departments</h1>
            <p className="text-xs text-[#526158] dark:text-[#C1CEC5] mt-1">
              Organize academic departments, faculty oversight, and batch skill metrics.
            </p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl bg-[#2F6B4F] hover:bg-[#24563F] dark:bg-[#78B895] dark:hover:bg-[#91CAA8] text-white dark:text-[#0D1511] font-bold text-xs transition-colors flex items-center gap-2 shadow-xs"
          >
            <Plus className="w-4 h-4" /> Add Department
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

        {/* Departments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((d) => (
            <div key={d.id} className="bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] p-6 rounded-2xl shadow-xs space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#EEF4EF] dark:bg-[#223128] text-[#2F6B4F] dark:text-[#78B895] border border-[#D5DED8] dark:border-[#304036]">
                    {d.code}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                    d.is_active
                      ? "bg-[#DCEBE1] dark:bg-[#294637] text-[#2F7D4A] dark:text-[#7BC894] border-[#2F7D4A]/30"
                      : "bg-[#EEF4EF] dark:bg-[#223128] text-[#68776D] dark:text-[#98A99E] border-[#D5DED8] dark:border-[#304036]"
                  }`}>
                    {d.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[#142019] dark:text-white">{d.name}</h3>
                {d.description && (
                  <p className="text-xs text-[#526158] dark:text-[#C1CEC5] mt-1 line-clamp-2">{d.description}</p>
                )}
              </div>

              <div className="pt-4 border-t border-[#D5DED8]/80 dark:border-[#304036]/80 grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded-lg bg-[#EEF4EF] dark:bg-[#223128]">
                  <div className="text-[10px] text-[#68776D] dark:text-[#98A99E] uppercase font-semibold">Students</div>
                  <div className="text-sm font-extrabold text-[#17231C] dark:text-[#F1F6F2] mt-0.5 font-mono">{d.student_count}</div>
                </div>
                <div className="p-2 rounded-lg bg-[#EEF4EF] dark:bg-[#223128]">
                  <div className="text-[10px] text-[#68776D] dark:text-[#98A99E] uppercase font-semibold">Avg Score</div>
                  <div className="text-sm font-extrabold text-[#2F6B4F] dark:text-[#78B895] mt-0.5 font-mono">{d.average_skill_score}</div>
                </div>
                <div className="p-2 rounded-lg bg-[#EEF4EF] dark:bg-[#223128]">
                  <div className="text-[10px] text-[#68776D] dark:text-[#98A99E] uppercase font-semibold">Assessed</div>
                  <div className="text-sm font-extrabold text-[#2F7D4A] dark:text-[#7BC894] mt-0.5 font-mono">{d.assessment_completion_rate}%</div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => handleOpenEdit(d)}
                  className="p-2 rounded-lg hover:bg-[#EEF4EF] dark:hover:bg-[#223128] text-[#68776D] hover:text-[#2F6B4F] dark:text-[#98A99E] dark:hover:text-[#78B895] transition-colors"
                  title="Edit Department"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                {d.is_active && (
                  <button
                    onClick={() => handleDeactivate(d.id, d.name)}
                    className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/50 text-[#68776D] hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    title="Deactivate Department"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Modal for Add / Edit */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] max-w-md w-full p-6 rounded-2xl shadow-xl space-y-6">
              <h3 className="text-lg font-bold text-[#142019] dark:text-white">
                {editingDept ? "Edit Department" : "Add New Department"}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#526158] dark:text-[#C1CEC5] uppercase tracking-wider mb-2">
                    Department Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#EEF4EF] dark:bg-[#223128] border border-[#D5DED8] dark:border-[#304036] rounded-xl px-4 py-2.5 text-sm text-[#17231C] dark:text-[#F1F6F2] focus:outline-none focus:border-[#2F6B4F] dark:focus:border-[#78B895]"
                    placeholder="e.g. Department of Dravyaguna"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#526158] dark:text-[#C1CEC5] uppercase tracking-wider mb-2">
                    Department Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full bg-[#EEF4EF] dark:bg-[#223128] border border-[#D5DED8] dark:border-[#304036] rounded-xl px-4 py-2.5 text-sm text-[#17231C] dark:text-[#F1F6F2] focus:outline-none focus:border-[#2F6B4F] dark:focus:border-[#78B895]"
                    placeholder="e.g. DG-01"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#526158] dark:text-[#C1CEC5] uppercase tracking-wider mb-2">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-[#EEF4EF] dark:bg-[#223128] border border-[#D5DED8] dark:border-[#304036] rounded-xl p-3 text-sm text-[#17231C] dark:text-[#F1F6F2] focus:outline-none focus:border-[#2F6B4F] dark:focus:border-[#78B895] resize-none"
                    placeholder="Brief description of department scope..."
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-xl bg-[#EEF4EF] dark:bg-[#223128] hover:bg-[#D5DED8] dark:hover:bg-[#304036] text-[#17231C] dark:text-[#F1F6F2] font-bold text-xs transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 rounded-xl bg-[#2F6B4F] hover:bg-[#24563F] dark:bg-[#78B895] dark:hover:bg-[#91CAA8] text-white dark:text-[#0D1511] font-bold text-xs transition-colors disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save Department"}
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
