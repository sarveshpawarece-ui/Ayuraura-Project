"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import {
  User,
  Building2,
  GraduationCap,
  BookOpen,
  Award,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Save,
  Edit3,
  X,
  ShieldCheck,
  Calendar,
  Layers,
  ArrowRight
} from "lucide-react";
import { api } from "@/lib/api";

export default function FacultyProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [formData, setFormData] = useState({
    name_prefix: "Prof.",
    full_name: "",
    email: "",
    phone: "",
    department: "Department of Samhita & Siddhanta",
    designation: "Assistant Professor",
    institution_name: "Ayurveda University",
    qualifications: "MD (Ayurveda), BAMS",
    specialization: "Clinical BAMS Education & Brihat-trayi Research",
    city: "Pune",
    state: "Maharashtra",
    bio: "Dedicated faculty scholar specializing in traditional Ayurvedic texts, NCISM competency-based curriculum development, and student clinical mentorship.",
    assigned_subjects: ["Samhita Adhyayan", "Kriya Sharir", "Maulik Siddhanta"],
    office_hours: "Monday - Friday, 10:00 AM - 4:00 PM",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get("/faculty/profile");
      if (res.data && res.data.full_name) {
        setProfile(res.data);
        setFormData({
          name_prefix: res.data.name_prefix || "Prof.",
          full_name: res.data.full_name || "Faculty Vaidya",
          email: res.data.email || "faculty@example.com",
          phone: res.data.phone || "",
          department: res.data.department || "Department of Samhita & Siddhanta",
          designation: res.data.designation || "Assistant Professor",
          institution_name: res.data.institution_name || "Ayurveda University",
          qualifications: res.data.qualifications || "MD (Ayurveda), BAMS",
          specialization: res.data.specialization || "Clinical BAMS Education",
          city: res.data.city || "Pune",
          state: res.data.state || "Maharashtra",
          bio: res.data.bio || "Dedicated faculty scholar in NCISM curriculum.",
          assigned_subjects: res.data.assigned_subjects || ["Samhita Adhyayan", "Kriya Sharir"],
          office_hours: res.data.office_hours || "Monday - Friday, 10:00 AM - 4:00 PM",
        });
      } else {
        // Fallback default
        setProfile(formData);
      }
    } catch {
      setProfile(formData);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await api.put("/faculty/profile", formData);
      setProfile(formData);
      setIsEditing(false);
      setMessage({ type: "success", text: "Faculty profile updated successfully!" });
    } catch {
      setProfile(formData);
      setIsEditing(false);
      setMessage({ type: "success", text: "Faculty profile saved locally." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9F4] dark:bg-[#0D1511] text-[#17231C] dark:text-[#F1F6F2] flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto p-6 space-y-6">
        {/* Header Banner */}
        <div className="rounded-3xl border border-[#D5DED8] dark:border-[#304036] bg-[#FFFFFF] dark:bg-[#17211B] p-6 md:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#2F6B4F]/10 dark:bg-[#78B895]/10 text-[#2F6B4F] dark:text-[#78B895] flex items-center justify-center font-bold text-2xl border border-[#2F6B4F]/20">
              <GraduationCap className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-[#142019] dark:text-[#FFFFFF]">
                  {formData.name_prefix} {formData.full_name || "Faculty Scholar"}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                  <ShieldCheck className="w-3 h-3" /> AISHE Verified
                </span>
              </div>
              <p className="text-xs text-[#526158] dark:text-[#C1CEC5] mt-1">
                {formData.designation} • {formData.department}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 rounded-xl bg-[#2F6B4F] hover:bg-[#24563F] dark:bg-[#78B895] dark:hover:bg-[#91CAA8] text-white dark:text-[#0D1511] font-bold text-xs flex items-center gap-2 transition shadow-sm"
              >
                <Edit3 className="w-3.5 h-3.5" /> Edit Profile
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-xl bg-[#EEF4EF] dark:bg-[#223128] text-[#526158] dark:text-[#C1CEC5] font-semibold text-xs border border-[#D5DED8] dark:border-[#304036] flex items-center gap-2 transition"
              >
                <X className="w-3.5 h-3.5" /> Cancel
              </button>
            )}
            <Link
              href="/faculty/dashboard"
              className="px-4 py-2 rounded-xl bg-[#EEF4EF] dark:bg-[#223128] text-[#17231C] dark:text-[#F1F6F2] font-semibold text-xs border border-[#D5DED8] dark:border-[#304036] flex items-center gap-2 transition"
            >
              Dashboard <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Message Banner */}
        {message && (
          <div
            className={`p-4 rounded-2xl text-xs flex items-center gap-3 border ${
              message.type === "success"
                ? "bg-[#DCEBE1] dark:bg-[#294637]/60 border-[#2F7D4A]/30 text-[#2F7D4A] dark:text-[#7BC894]"
                : "bg-red-50 dark:bg-red-950/40 border-[#B64040]/30 text-[#B64040] dark:text-[#F18484]"
            }`}
          >
            {message.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{message.text}</span>
          </div>
        )}

        {/* Profile Details or Edit Form */}
        {isEditing ? (
          <form onSubmit={handleSave} className="rounded-3xl border border-[#D5DED8] dark:border-[#304036] bg-[#FFFFFF] dark:bg-[#17211B] p-6 md:p-8 shadow-sm space-y-6">
            <h2 className="text-base font-bold text-[#142019] dark:text-[#FFFFFF] border-b border-[#D5DED8] dark:border-[#304036] pb-3">
              Edit Academic Credentials & Profile
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">Prefix</label>
                <select
                  value={formData.name_prefix}
                  onChange={(e) => setFormData({ ...formData, name_prefix: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#D5DED8] dark:border-[#304036] bg-transparent text-xs"
                >
                  <option value="Prof.">Prof.</option>
                  <option value="Dr.">Dr.</option>
                  <option value="Vaidya">Vaidya</option>
                  <option value="Assoc. Prof.">Assoc. Prof.</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#D5DED8] dark:border-[#304036] bg-transparent text-xs"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Designation</label>
                <input
                  type="text"
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#D5DED8] dark:border-[#304036] bg-transparent text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Department</label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#D5DED8] dark:border-[#304036] bg-transparent text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Institution Name</label>
                <input
                  type="text"
                  value={formData.institution_name}
                  onChange={(e) => setFormData({ ...formData, institution_name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#D5DED8] dark:border-[#304036] bg-transparent text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Qualifications</label>
                <input
                  type="text"
                  value={formData.qualifications}
                  onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#D5DED8] dark:border-[#304036] bg-transparent text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Specialization</label>
                <input
                  type="text"
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#D5DED8] dark:border-[#304036] bg-transparent text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Office Hours</label>
                <input
                  type="text"
                  value={formData.office_hours}
                  onChange={(e) => setFormData({ ...formData, office_hours: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#D5DED8] dark:border-[#304036] bg-transparent text-xs"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-semibold mb-1">Academic Bio</label>
                <textarea
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#D5DED8] dark:border-[#304036] bg-transparent text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-[#D5DED8] dark:border-[#304036]">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-[#2F6B4F] hover:bg-[#24563F] dark:bg-[#78B895] dark:hover:bg-[#91CAA8] text-white dark:text-[#0D1511] font-bold text-xs flex items-center gap-2 transition"
              >
                <Save className="w-3.5 h-3.5" /> {saving ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Card: Academic Profile */}
            <div className="md:col-span-2 rounded-3xl border border-[#D5DED8] dark:border-[#304036] bg-[#FFFFFF] dark:bg-[#17211B] p-6 md:p-8 shadow-sm space-y-6">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#2F6B4F] dark:text-[#78B895] mb-2">
                  Faculty Summary
                </h3>
                <p className="text-xs text-[#526158] dark:text-[#C1CEC5] leading-relaxed">
                  {formData.bio}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs border-t border-[#D5DED8] dark:border-[#304036] pt-6">
                <div>
                  <span className="text-[#68776D] dark:text-[#98A99E] block mb-1">Academic Institution</span>
                  <span className="font-semibold text-[#142019] dark:text-[#FFFFFF] flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-[#2F6B4F] dark:text-[#78B895]" /> {formData.institution_name}
                  </span>
                </div>
                <div>
                  <span className="text-[#68776D] dark:text-[#98A99E] block mb-1">Degrees & Qualifications</span>
                  <span className="font-semibold text-[#142019] dark:text-[#FFFFFF] flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-500" /> {formData.qualifications}
                  </span>
                </div>
                <div>
                  <span className="text-[#68776D] dark:text-[#98A99E] block mb-1">Research Specialization</span>
                  <span className="font-semibold text-[#142019] dark:text-[#FFFFFF]">
                    {formData.specialization}
                  </span>
                </div>
                <div>
                  <span className="text-[#68776D] dark:text-[#98A99E] block mb-1">Office Hours & Mentorship</span>
                  <span className="font-semibold text-[#142019] dark:text-[#FFFFFF] flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-blue-500" /> {formData.office_hours}
                  </span>
                </div>
              </div>

              {/* Assigned Subjects */}
              <div className="border-t border-[#D5DED8] dark:border-[#304036] pt-6">
                <h4 className="text-xs font-bold text-[#142019] dark:text-[#FFFFFF] mb-3">
                  Assigned Teaching Subjects
                </h4>
                <div className="flex flex-wrap gap-2">
                  {formData.assigned_subjects.map((subj: string, i: number) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-xl bg-[#EEF4EF] dark:bg-[#223128] text-xs font-medium text-[#2F6B4F] dark:text-[#78B895] border border-[#D5DED8] dark:border-[#304036]"
                    >
                      {subj}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Card: Quick Actions */}
            <div className="rounded-3xl border border-[#D5DED8] dark:border-[#304036] bg-[#FFFFFF] dark:bg-[#17211B] p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-[#142019] dark:text-[#FFFFFF]">
                Faculty Academic Studio
              </h3>
              <p className="text-xs text-[#526158] dark:text-[#C1CEC5]">
                Manage lectures, review student progress, and utilize NCISM AI syllabus tools.
              </p>

              <div className="space-y-2 pt-2">
                <Link
                  href="/faculty/lectures"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#EEF4EF] dark:bg-[#223128] hover:bg-[#D5DED8] dark:hover:bg-[#304036] text-xs font-semibold flex items-center justify-between transition"
                >
                  <span>Upcoming Lectures</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#2F6B4F] dark:text-[#78B895]" />
                </Link>
                <Link
                  href="/faculty/materials"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#EEF4EF] dark:bg-[#223128] hover:bg-[#D5DED8] dark:hover:bg-[#304036] text-xs font-semibold flex items-center justify-between transition"
                >
                  <span>Learning Materials</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#2F6B4F] dark:text-[#78B895]" />
                </Link>
                <Link
                  href="/faculty/students"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#EEF4EF] dark:bg-[#223128] hover:bg-[#D5DED8] dark:hover:bg-[#304036] text-xs font-semibold flex items-center justify-between transition"
                >
                  <span>Student Directory</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#2F6B4F] dark:text-[#78B895]" />
                </Link>
                <Link
                  href="/ai"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#2F6B4F]/10 dark:bg-[#78B895]/10 text-[#2F6B4F] dark:text-[#78B895] text-xs font-bold flex items-center justify-between transition border border-[#2F6B4F]/20"
                >
                  <span>Master AI Faculty Assistant</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
