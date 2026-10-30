"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { User, BookOpen, Award, Briefcase, Code, Link as LinkIcon, Sparkles, CheckCircle2, AlertCircle, AlertTriangle, Plus, Trash2, Save, Edit3, X, Target, Compass, Activity, FileText, ExternalLink, HelpCircle, Stethoscope, Clock, Video, HeartHandshake, Bell, ShieldCheck, ArrowRight, Flame, Layers, TrendingUp } from "lucide-react";
import { api } from "@/lib/api";
import { getRolePrefixOptions, formatFullName, parseNameParts } from "@/lib/nameFormatter";
import { DEMO_STUDENT, isDemoEmail } from "@/lib/demoData";

export default function StudentProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [showDemoShowcase, setShowDemoShowcase] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    name_prefix: "",
    first_name: "",
    middle_name: "",
    last_name: "",
    phone: "",
    city: "",
    state: "",
    country: "India",
    bio: "",
    college_name: "",
    course: "",
    specialization: "",
    current_year: "",
    graduation_year: "",
    cgpa: "",
    linkedin_url: "",
    github_url: "",
    website_url: "",
  });

  // Modal / Add items state
  const [newSkill, setNewSkill] = useState({ name: "", level: "INTERMEDIATE" });
  const [newInterest, setNewInterest] = useState("");
  const [newExp, setNewExp] = useState({ title: "", organization: "", type: "INTERNSHIP", description: "", start_date: "", end_date: "" });
  const [newProj, setNewProj] = useState({ title: "", description: "", technologies: "", role: "", project_url: "" });

  const [showSkillForm, setShowSkillForm] = useState(false);
  const [showExpForm, setShowExpForm] = useState(false);
  const [showProjForm, setShowProjForm] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get("/students/me/profile");
      setProfile(res.data);
      let userEmail = "";
      if (typeof window !== "undefined") {
        const u = localStorage.getItem("ayursetu_user");
        if (u) {
          try {
            userEmail = JSON.parse(u)?.email || "";
          } catch (e) {}
        }
      }
      const isDemo = isDemoEmail(res.data?.email || userEmail) || (typeof window !== "undefined" && window.location.search.includes("demo=true"));
      setIsDemoMode(isDemo);

      const nameParts = parseNameParts(res.data.full_name, "STUDENT");
      setFormData({
        name_prefix: res.data.name_prefix !== undefined && res.data.name_prefix !== null ? res.data.name_prefix : nameParts.prefix,
        first_name: res.data.first_name || nameParts.firstName || "",
        middle_name: res.data.middle_name || nameParts.middleName || "",
        last_name: res.data.last_name || nameParts.lastName || "",
        phone: res.data.phone || "",
        city: res.data.city || "",
        state: res.data.state || "",
        country: res.data.country || "India",
        bio: res.data.bio || "",
        college_name: res.data.college_name || "",
        course: res.data.course || "",
        specialization: res.data.specialization || "",
        current_year: res.data.current_year ? String(res.data.current_year) : "",
        graduation_year: res.data.graduation_year ? String(res.data.graduation_year) : "",
        cgpa: res.data.cgpa ? String(res.data.cgpa) : "",
        linkedin_url: res.data.linkedin_url || "",
        github_url: res.data.github_url || "",
        website_url: res.data.website_url || "",
      });
    } catch (err: any) {
      console.error(err);
      setMessage({ type: "error", text: "Failed to load student profile. Please log in as a Student." });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    if (isDemoMode) {
      setTimeout(() => {
        setSaving(false);
        setIsEditing(false);
        setMessage({
          type: "success",
          text: "Demo profile updated successfully in preview mode! (Production records are safely protected).",
        });
      }, 500);
      return;
    }

    try {
      const full_name = formatFullName({
        prefix: formData.name_prefix,
        firstName: formData.first_name,
        middleName: formData.middle_name,
        lastName: formData.last_name,
        fallbackFullName: `${formData.first_name} ${formData.last_name}`.trim(),
      });

      const payload = {
        ...formData,
        full_name,
        current_year: formData.current_year ? parseInt(formData.current_year) : null,
        graduation_year: formData.graduation_year ? parseInt(formData.graduation_year) : null,
        cgpa: formData.cgpa ? parseFloat(formData.cgpa) : null,
      };

      const res = await api.put("/students/me/profile", payload);
      setProfile(res.data);
      setIsEditing(false);
      setMessage({ type: "success", text: "Profile updated successfully!" });
    } catch (err: any) {
      setMessage({ type: "error", text: err.response?.data?.detail || "Failed to update profile." });
    } finally {
      setSaving(false);
    }
  };

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkill.name.trim()) return;
    try {
      const res = await api.post("/students/me/skills", {
        skill_name_or_id: newSkill.name.trim(),
        proficiency_level: newSkill.level,
      });
      setProfile(res.data);
      setNewSkill({ name: "", level: "INTERMEDIATE" });
      setShowSkillForm(false);
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to add skill");
    }
  };

  const handleDeleteSkill = async (skillId: string) => {
    try {
      await api.delete(`/students/me/skills/${skillId}`);
      await loadProfile();
    } catch (err: any) {
      alert("Failed to delete skill");
    }
  };

  const handleAddInterest = async () => {
    if (!newInterest.trim() || !profile) return;
    const updatedInterests = [...(profile.interests || []), newInterest.trim()];
    try {
      const res = await api.put("/students/me/profile", { interests: updatedInterests });
      setProfile(res.data);
      setNewInterest("");
    } catch (err: any) {
      alert("Failed to add interest");
    }
  };

  const handleAddExperience = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/students/me/experiences", newExp);
      setNewExp({ title: "", organization: "", type: "INTERNSHIP", description: "", start_date: "", end_date: "" });
      setShowExpForm(false);
      await loadProfile();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to add experience");
    }
  };

  const handleDeleteExperience = async (expId: string) => {
    try {
      await api.delete(`/students/me/experiences/${expId}`);
      await loadProfile();
    } catch (err: any) {
      alert("Failed to delete experience");
    }
  };

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/students/me/projects", newProj);
      setNewProj({ title: "", description: "", technologies: "", role: "", project_url: "" });
      setShowProjForm(false);
      await loadProfile();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to add project");
    }
  };

  const handleDeleteProject = async (projId: string) => {
    try {
      await api.delete(`/students/me/projects/${projId}`);
      await loadProfile();
    } catch (err: any) {
      alert("Failed to delete project");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F9F4] dark:bg-[#0D1511] text-[#17231C] dark:text-[#F1F6F2] flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-6 text-[#68776D] dark:text-[#98A99E]">Loading student profile...</div>
      </div>
    );
  }

  const completionPct = profile?.profile_completion_percentage ?? 0;
  const isComplete = profile?.profile_status === "COMPLETE";

  return (
    <div className="min-h-screen bg-[#F7F9F4] dark:bg-[#0D1511] text-[#17231C] dark:text-[#F1F6F2] flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8">
        {/* Header & Completion Meter */}
        <div className="bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] p-6 rounded-2xl space-y-4 shadow-xs">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DCEBE1] dark:bg-[#294637] text-[#2F6B4F] dark:text-[#78B895] text-xs font-semibold uppercase tracking-wider mb-2 border border-[#2F6B4F]/30">
                <User className="w-3.5 h-3.5" /> Student Profile Management
              </div>
              <h1 className="text-2xl md:text-3xl font-bold font-serif-heading text-[#142019] dark:text-[#FFFFFF]">
                {formatFullName({
                  prefix: profile?.name_prefix,
                  firstName: profile?.first_name,
                  middleName: profile?.middle_name,
                  lastName: profile?.last_name,
                  fallbackFullName: profile?.full_name || "Ayurveda Student"
                })}
              </h1>
              <p className="text-xs text-[#68776D] dark:text-[#98A99E] mt-0.5">{profile?.college_name || "Ayurveda Institution"} • {profile?.course || "BAMS"}</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  isEditing
                    ? "bg-[#EEF4EF] hover:bg-[#DCEBE1] dark:bg-[#223128] dark:hover:bg-[#294637] text-[#17231C] dark:text-[#F1F6F2] border border-[#D5DED8] dark:border-[#304036]"
                    : "bg-[#2F6B4F] hover:bg-[#24563F] dark:bg-[#78B895] dark:hover:bg-[#91CAA8] text-white dark:text-[#0D1511] shadow-xs"
                }`}
              >
                {isEditing ? <><X className="w-4 h-4" /> Cancel Edit</> : <><Edit3 className="w-4 h-4" /> Edit Profile</>}
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="pt-2 border-t border-[#D5DED8] dark:border-[#304036] space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-[#526158] dark:text-[#C1CEC5] flex items-center gap-2">
                Profile Completeness: <span className="font-mono text-[#2F6B4F] dark:text-[#78B895] font-bold">{completionPct}%</span>
              </span>
              <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${
                isComplete ? "bg-[#DCEBE1] dark:bg-[#294637] text-[#2F7D4A] dark:text-[#7BC894] border-[#2F7D4A]/30" : "bg-[#FAF0E1] dark:bg-[#332512] text-[#A96F16] dark:text-[#E5B85C] border-[#A96F16]/30"
              }`}>
                {profile?.profile_status || "INCOMPLETE"}
              </span>
            </div>

            <div className="w-full bg-[#EEF4EF] dark:bg-[#223128] h-2.5 rounded-full overflow-hidden border border-[#D5DED8] dark:border-[#304036]">
              <div
                className="bg-gradient-to-r from-[#2F6B4F] via-[#78B895] to-[#A96F16] h-full transition-all duration-500"
                style={{ width: `${completionPct}%` }}
              />
            </div>
          </div>
        </div>

        {message && (
          <div className={`p-4 rounded-xl text-xs flex items-center gap-3 border ${
            message.type === "success"
              ? "bg-[#DCEBE1] dark:bg-[#294637] border-[#2F7D4A]/30 text-[#2F7D4A] dark:text-[#7BC894]"
              : "bg-[#FAECEC] dark:bg-[#351919] border-[#B64040]/30 text-[#B64040] dark:text-[#F18484]"
          }`}>
            {message.type === "success" ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
            <span>{message.text}</span>
          </div>
        )}

        {/* Demo Mode Notice & Quick Feature Navigation Bar */}
        {isDemoMode && (
          <div className="p-5 rounded-2xl bg-[#FFFFFF] dark:bg-[#17211B] border border-[#A96F16]/40 dark:border-[#E5B85C]/30 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-0.5">
                <span className="px-2 py-0.5 rounded bg-[#FAF0E1] dark:bg-[#332512] text-[#A96F16] dark:text-[#E5B85C] font-mono text-[10px] font-bold uppercase tracking-wider border border-[#A96F16]/30">
                  🌟 Live Demo Profile Active
                </span>
                <h3 className="text-sm font-bold text-[#142019] dark:text-[#FFFFFF]">
                  Every Demo Profile Option Connects to its Working Feature
                </h3>
                <p className="text-xs text-[#68776D] dark:text-[#98A99E]">
                  Click any platform feature below to explore its dedicated demonstration page without redirecting to a generic dashboard.
                </p>
              </div>
              <Link
                href="/demo/profile"
                className="px-4 py-2 rounded-xl bg-[#2F6B4F] hover:bg-[#24563F] dark:bg-[#78B895] dark:hover:bg-[#91CAA8] text-white dark:text-[#0D1511] text-xs font-bold shrink-0 self-start sm:self-center transition-all flex items-center gap-1.5 shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5" /> Full Showcase Hub
              </Link>
            </div>

            {/* 24 Direct Feature Links Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 text-xs pt-1">
              {[
                { name: "Career Goal", route: "/student/career", icon: Target },
                { name: "Career Roadmap", route: "/student/career", icon: TrendingUp },
                { name: "Career Readiness", route: "/student/readiness", icon: Activity },
                { name: "Skill Progress", route: "/student/skills", icon: Award },
                { name: "Skill Gap", route: "/student/skill-gap", icon: AlertTriangle },
                { name: "Learning Path", route: "/student/ecosystem", icon: Compass },
                { name: "Assessment", route: "/student/assessments", icon: FileText },
                { name: "My Scores", route: "/student/assessments/history", icon: Award },
                { name: "Jobs", route: "/opportunities?type=JOB", icon: Briefcase },
                { name: "Internships", route: "/student/opportunities", icon: Briefcase },
                { name: "Applications", route: "/student/applications", icon: CheckCircle2 },
                { name: "AI Features", route: "/ai-career", icon: Sparkles },
                { name: "Resume Builder", route: "/student/resume-builder", icon: FileText },
                { name: "Portfolio", route: "/student/portfolio", icon: ExternalLink },
                { name: "Learning Hub", route: "/learning-hub", icon: BookOpen },
                { name: "BAMS Content", route: "/student/syllabus", icon: Layers },
                { name: "Exam Prep", route: "/student/exam-prep", icon: Flame },
                { name: "Quiz History", route: "/student/quiz", icon: HelpCircle },
                { name: "Case Studies", route: "/student/cases", icon: Stethoscope },
                { name: "Smart Timetable", route: "/student/timetable", icon: Clock },
                { name: "Expert Sessions", route: "/student/sessions", icon: Video },
                { name: "Events & Camps", route: "/camps", icon: HeartHandshake },
                { name: "Notifications", route: "/notifications", icon: Bell },
                { name: "Certificates", route: "/verify/certificate", icon: ShieldCheck },
              ].map((opt, i) => {
                const Icon = opt.icon;
                return (
                  <Link
                    key={i}
                    href={opt.route}
                    className="p-2.5 rounded-xl border border-[#D5DED8] dark:border-[#304036] bg-[#F7F9F4] dark:bg-[#0D1511] hover:bg-[#EEF4EF] dark:hover:bg-[#223128] hover:border-[#2F6B4F] dark:hover:border-[#78B895] flex items-center justify-between transition-all group"
                  >
                    <div className="flex items-center gap-1.5 overflow-hidden">
                      <Icon className="w-3.5 h-3.5 text-[#2F6B4F] dark:text-[#78B895] shrink-0" />
                      <span className="font-semibold text-[#17231C] dark:text-[#F1F6F2] truncate">{opt.name}</span>
                    </div>
                    <ArrowRight className="w-3 h-3 text-[#68776D] dark:text-[#98A99E] group-hover:translate-x-0.5 transition-transform shrink-0" />
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Profile Edit Form vs View Mode */}
        {isEditing ? (
          <form onSubmit={handleSaveProfile} className="bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] p-6 rounded-2xl space-y-6 shadow-xs">
            <h2 className="text-lg font-bold border-b border-[#D5DED8] dark:border-[#304036] pb-3 text-[#142019] dark:text-[#FFFFFF] font-serif-heading">Edit Student Information</h2>

            {/* Personal Info */}
            <div className="space-y-4">
              <h3 className="text-xs uppercase tracking-wider font-semibold text-[#2F6B4F] dark:text-[#78B895]">1. Personal Information</h3>
              
              {/* Structured Name with Role-Based Prefix Selector */}
              <div className="p-4 rounded-xl bg-[#EEF4EF] dark:bg-[#223128] border border-[#D5DED8] dark:border-[#304036] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#2F6B4F] dark:text-[#78B895] flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" /> Student Identity & Legal Name
                  </span>
                  <span className="text-[10px] font-mono uppercase bg-[#DCEBE1] dark:bg-[#294637] text-[#2F6B4F] dark:text-[#78B895] px-2 py-0.5 rounded border border-[#2F6B4F]/30">
                    Non-Professional Prefix Only
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 text-xs">
                  <div className="md:col-span-4">
                    <label className="block mb-1 font-medium text-[#526158] dark:text-[#C1CEC5]">Prefix / Title</label>
                    <select
                      value={formData.name_prefix || ""}
                      onChange={(e) => setFormData({ ...formData, name_prefix: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] text-[#17231C] dark:text-[#F1F6F2] font-semibold focus:border-[#2F6B4F] dark:focus:border-[#78B895] outline-none"
                    >
                      {getRolePrefixOptions("STUDENT").map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-8">
                    <label className="block mb-1 font-medium text-[#526158] dark:text-[#C1CEC5]">First Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] text-[#17231C] dark:text-[#F1F6F2] focus:border-[#2F6B4F] dark:focus:border-[#78B895] outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block mb-1 font-medium text-[#526158] dark:text-[#C1CEC5]">
                      Middle Name <span className="text-[#68776D] dark:text-[#98A99E] font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={formData.middle_name}
                      onChange={(e) => setFormData({ ...formData, middle_name: e.target.value })}
                      placeholder="e.g. Kumar"
                      className="w-full px-3 py-2 rounded-lg bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] text-[#17231C] dark:text-[#F1F6F2] focus:border-[#2F6B4F] dark:focus:border-[#78B895] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 font-medium text-[#526158] dark:text-[#C1CEC5]">Last Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] text-[#17231C] dark:text-[#F1F6F2] focus:border-[#2F6B4F] dark:focus:border-[#78B895] outline-none"
                    />
                  </div>
                </div>

                {/* Display Name Preview */}
                <div className="pt-2 border-t border-[#D5DED8] dark:border-[#304036] flex items-center justify-between text-xs">
                  <span className="text-[#68776D] dark:text-[#98A99E]">Platform Display Name:</span>
                  <span className="font-bold text-[#2F6B4F] dark:text-[#78B895] bg-[#DCEBE1] dark:bg-[#294637] border border-[#2F6B4F]/30 px-2.5 py-1 rounded-md">
                    {formatFullName({
                      prefix: formData.name_prefix,
                      firstName: formData.first_name,
                      middleName: formData.middle_name,
                      lastName: formData.last_name,
                    }) || <span className="text-[#68776D] dark:text-[#98A99E] italic">Enter name fields</span>}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block mb-1 font-medium text-[#526158] dark:text-[#C1CEC5]">Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 9876543210"
                    className="w-full px-3 py-2 rounded-lg bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] text-[#17231C] dark:text-[#F1F6F2] focus:border-[#2F6B4F] dark:focus:border-[#78B895] outline-none"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium text-[#526158] dark:text-[#C1CEC5]">City & State</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="City"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] text-[#17231C] dark:text-[#F1F6F2] focus:border-[#2F6B4F] dark:focus:border-[#78B895] outline-none"
                    />
                    <input
                      type="text"
                      placeholder="State"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] text-[#17231C] dark:text-[#F1F6F2] focus:border-[#2F6B4F] dark:focus:border-[#78B895] outline-none"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block mb-1 text-xs font-medium text-[#526158] dark:text-[#C1CEC5]">Bio</label>
                <textarea
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Share a brief overview of your academic background and passion for Ayush R&D..."
                  className="w-full px-3 py-2 rounded-lg bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] text-xs text-[#17231C] dark:text-[#F1F6F2] focus:border-[#2F6B4F] dark:focus:border-[#78B895] outline-none"
                />
              </div>
            </div>

            {/* Academic Info */}
            <div className="space-y-4 pt-4 border-t border-[#D5DED8] dark:border-[#304036]">
              <h3 className="text-xs uppercase tracking-wider font-semibold text-[#A96F16] dark:text-[#E5B85C]">2. Academic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="md:col-span-2">
                  <label className="block mb-1 font-medium text-[#526158] dark:text-[#C1CEC5]">College / Institution</label>
                  <input
                    type="text"
                    value={formData.college_name}
                    onChange={(e) => setFormData({ ...formData, college_name: e.target.value })}
                    placeholder="National Institute of Ayurveda"
                    className="w-full px-3 py-2 rounded-lg bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] text-[#17231C] dark:text-[#F1F6F2] focus:border-[#2F6B4F] dark:focus:border-[#78B895] outline-none"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium text-[#526158] dark:text-[#C1CEC5]">Course / Degree</label>
                  <input
                    type="text"
                    value={formData.course}
                    onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                    placeholder="BAMS / MD (Ayurveda)"
                    className="w-full px-3 py-2 rounded-lg bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] text-[#17231C] dark:text-[#F1F6F2] focus:border-[#2F6B4F] dark:focus:border-[#78B895] outline-none"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium text-[#526158] dark:text-[#C1CEC5]">Specialization</label>
                  <input
                    type="text"
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    placeholder="Dravyaguna / Rasashastra"
                    className="w-full px-3 py-2 rounded-lg bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] text-[#17231C] dark:text-[#F1F6F2] focus:border-[#2F6B4F] dark:focus:border-[#78B895] outline-none"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium text-[#526158] dark:text-[#C1CEC5]">Current Academic Year</label>
                  <input
                    type="number"
                    value={formData.current_year}
                    onChange={(e) => setFormData({ ...formData, current_year: e.target.value })}
                    placeholder="4"
                    className="w-full px-3 py-2 rounded-lg bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] text-[#17231C] dark:text-[#F1F6F2] focus:border-[#2F6B4F] dark:focus:border-[#78B895] outline-none"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium text-[#526158] dark:text-[#C1CEC5]">Graduation Year & CGPA</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="2027"
                      value={formData.graduation_year}
                      onChange={(e) => setFormData({ ...formData, graduation_year: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] text-[#17231C] dark:text-[#F1F6F2] focus:border-[#2F6B4F] dark:focus:border-[#78B895] outline-none"
                    />
                    <input
                      type="text"
                      placeholder="8.5"
                      value={formData.cgpa}
                      onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] text-[#17231C] dark:text-[#F1F6F2] focus:border-[#2F6B4F] dark:focus:border-[#78B895] outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="space-y-4 pt-4 border-t border-[#D5DED8] dark:border-[#304036]">
              <h3 className="text-xs uppercase tracking-wider font-semibold text-[#356F9D] dark:text-[#80B5DD]">3. Professional Links</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block mb-1 font-medium text-[#526158] dark:text-[#C1CEC5]">LinkedIn URL</label>
                  <input
                    type="url"
                    value={formData.linkedin_url}
                    onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                    placeholder="https://linkedin.com/in/..."
                    className="w-full px-3 py-2 rounded-lg bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] text-[#17231C] dark:text-[#F1F6F2] focus:border-[#2F6B4F] dark:focus:border-[#78B895] outline-none"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium text-[#526158] dark:text-[#C1CEC5]">GitHub URL</label>
                  <input
                    type="url"
                    value={formData.github_url}
                    onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                    placeholder="https://github.com/..."
                    className="w-full px-3 py-2 rounded-lg bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] text-[#17231C] dark:text-[#F1F6F2] focus:border-[#2F6B4F] dark:focus:border-[#78B895] outline-none"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium text-[#526158] dark:text-[#C1CEC5]">Portfolio Website</label>
                  <input
                    type="url"
                    value={formData.website_url}
                    onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                    placeholder="https://mywebsite.com"
                    className="w-full px-3 py-2 rounded-lg bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] text-[#17231C] dark:text-[#F1F6F2] focus:border-[#2F6B4F] dark:focus:border-[#78B895] outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-[#D5DED8] dark:border-[#304036]">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-[#68776D] dark:text-[#98A99E] hover:text-[#17231C] dark:hover:text-[#FFFFFF] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-lg bg-[#2F6B4F] hover:bg-[#24563F] dark:bg-[#78B895] dark:hover:bg-[#91CAA8] text-white dark:text-[#0D1511] font-bold text-xs flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <Save className="w-4 h-4" /> {saving ? "Saving Changes..." : "Save Profile"}
              </button>
            </div>
          </form>
        ) : (
          /* Profile View Grid */
          <div className="space-y-6 sm:space-y-8">
            {/* Bio & Academic Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] p-6 rounded-2xl space-y-4 shadow-xs">
                <h2 className="text-base font-bold flex items-center gap-2 border-b border-[#D5DED8] dark:border-[#304036] pb-3 text-[#142019] dark:text-[#FFFFFF] font-serif-heading">
                  <User className="w-4 h-4 text-[#2F6B4F] dark:text-[#78B895]" /> Personal Overview
                </h2>
                <div className="text-xs text-[#526158] dark:text-[#C1CEC5] leading-relaxed">
                  {profile?.bio || "No bio added yet. Click 'Edit Profile' to share your academic and research background."}
                </div>
                <div className="pt-2 text-xs space-y-1.5 text-[#68776D] dark:text-[#98A99E]">
                  <div><strong className="text-[#17231C] dark:text-[#F1F6F2]">Phone:</strong> {profile?.phone || "Not specified"}</div>
                  <div><strong className="text-[#17231C] dark:text-[#F1F6F2]">Location:</strong> {profile?.city ? `${profile.city}, ${profile.state || ""}, ${profile.country}` : "Not specified"}</div>
                </div>
              </div>

              <div className="bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] p-6 rounded-2xl space-y-4 shadow-xs">
                <h2 className="text-base font-bold flex items-center gap-2 border-b border-[#D5DED8] dark:border-[#304036] pb-3 text-[#142019] dark:text-[#FFFFFF] font-serif-heading">
                  <BookOpen className="w-4 h-4 text-[#A96F16] dark:text-[#E5B85C]" /> Academic Details
                </h2>
                <div className="text-xs space-y-2 text-[#526158] dark:text-[#C1CEC5]">
                  <div className="flex justify-between"><span className="text-[#68776D] dark:text-[#98A99E]">College:</span><span className="font-semibold text-[#17231C] dark:text-[#F1F6F2]">{profile?.college_name || "N/A"}</span></div>
                  <div className="flex justify-between"><span className="text-[#68776D] dark:text-[#98A99E]">Course / Degree:</span><span className="font-semibold text-[#17231C] dark:text-[#F1F6F2]">{profile?.course || "BAMS"}</span></div>
                  <div className="flex justify-between"><span className="text-[#68776D] dark:text-[#98A99E]">Specialization:</span><span className="font-semibold text-[#17231C] dark:text-[#F1F6F2]">{profile?.specialization || "Ayurveda"}</span></div>
                  <div className="flex justify-between"><span className="text-[#68776D] dark:text-[#98A99E]">Current Academic Year:</span><span className="font-semibold text-[#17231C] dark:text-[#F1F6F2]">Year {profile?.current_year || 4}</span></div>
                  <div className="flex justify-between"><span className="text-[#68776D] dark:text-[#98A99E]">Graduation Year / CGPA:</span><span className="font-semibold text-[#17231C] dark:text-[#F1F6F2]">{profile?.graduation_year || 2027} (CGPA: {profile?.cgpa || "N/A"})</span></div>
                </div>
              </div>
            </div>

            {/* Self-declared Skills & Interests */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Skills */}
              <div className="bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] p-6 rounded-2xl space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-[#D5DED8] dark:border-[#304036] pb-3">
                  <h2 className="text-base font-bold flex items-center gap-2 text-[#142019] dark:text-[#FFFFFF] font-serif-heading">
                    <Award className="w-4 h-4 text-[#2F6B4F] dark:text-[#78B895]" /> Self-Declared Competencies
                  </h2>
                  <button
                    onClick={() => setShowSkillForm(true)}
                    className="text-xs text-[#2F6B4F] dark:text-[#78B895] font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Skill
                  </button>
                </div>

                {showSkillForm && (
                  <form onSubmit={handleAddSkill} className="p-3 rounded-xl bg-[#EEF4EF] dark:bg-[#223128] border border-[#D5DED8] dark:border-[#304036] space-y-3">
                    <input
                      type="text"
                      required
                      placeholder="e.g. GMP, Ayurvedic Formulation, Pharmacognosy"
                      value={newSkill.name}
                      onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] text-xs text-[#17231C] dark:text-[#F1F6F2] focus:border-[#2F6B4F] dark:focus:border-[#78B895] outline-none"
                    />
                    <div className="flex justify-between items-center gap-2">
                      <select
                        value={newSkill.level}
                        onChange={(e) => setNewSkill({ ...newSkill, level: e.target.value })}
                        className="px-3 py-1.5 rounded-lg bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] text-xs text-[#17231C] dark:text-[#F1F6F2] outline-none"
                      >
                        <option value="NOVICE">NOVICE</option>
                        <option value="INTERMEDIATE">INTERMEDIATE</option>
                        <option value="ADVANCED">ADVANCED</option>
                        <option value="EXPERT">EXPERT</option>
                      </select>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => setShowSkillForm(false)} className="text-xs text-[#68776D] dark:text-[#98A99E] cursor-pointer">Cancel</button>
                        <button type="submit" className="px-3 py-1 rounded bg-[#2F6B4F] hover:bg-[#24563F] dark:bg-[#78B895] text-white dark:text-[#0D1511] font-bold text-xs cursor-pointer">Save</button>
                      </div>
                    </div>
                  </form>
                )}

                <div className="space-y-2">
                  {(profile?.skills && profile.skills.length > 0) ? (
                    profile.skills.map((s: any) => (
                      <div key={s.id} className="p-2.5 rounded-xl bg-[#F7F9F4] dark:bg-[#0D1511] border border-[#D5DED8] dark:border-[#304036] flex justify-between items-center text-xs">
                        <span className="font-medium text-[#17231C] dark:text-[#F1F6F2]">{s.skill_name}</span>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-[#DCEBE1] dark:bg-[#294637] text-[#2F6B4F] dark:text-[#78B895] font-mono text-[10px] border border-[#2F6B4F]/20 font-semibold">{s.proficiency_level}</span>
                          <button onClick={() => handleDeleteSkill(s.id)} className="text-[#68776D] dark:text-[#98A99E] hover:text-[#B64040] dark:hover:text-[#F18484] cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-[#68776D] dark:text-[#98A99E]">No self-declared skills added yet.</div>
                  )}
                </div>
              </div>

              {/* Interests */}
              <div className="bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] p-6 rounded-2xl space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-[#D5DED8] dark:border-[#304036] pb-3">
                  <h2 className="text-base font-bold flex items-center gap-2 text-[#142019] dark:text-[#FFFFFF] font-serif-heading">
                    <Sparkles className="w-4 h-4 text-[#A96F16] dark:text-[#E5B85C]" /> Career Interests & Domains
                  </h2>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Pharmaceutical R&D, Clinical Trials"
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] text-xs text-[#17231C] dark:text-[#F1F6F2] focus:border-[#2F6B4F] dark:focus:border-[#78B895] outline-none"
                  />
                  <button onClick={handleAddInterest} className="px-4 py-1.5 rounded-lg bg-[#A96F16] hover:bg-[#8F5D12] text-white font-bold text-xs shrink-0 cursor-pointer">
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {(profile?.interests && profile.interests.length > 0) ? (
                    profile.interests.map((item: string, idx: number) => (
                      <span key={idx} className="px-3 py-1 rounded-full bg-[#FAF0E1] dark:bg-[#332512] text-[#A96F16] dark:text-[#E5B85C] text-xs border border-[#A96F16]/20 font-medium">
                        {item}
                      </span>
                    ))
                  ) : (
                    <div className="text-xs text-[#68776D] dark:text-[#98A99E]">No interests specified yet.</div>
                  )}
                </div>
              </div>
            </div>

            {/* Experience & Projects */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Experiences */}
              <div className="bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] p-6 rounded-2xl space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-[#D5DED8] dark:border-[#304036] pb-3">
                  <h2 className="text-base font-bold flex items-center gap-2 text-[#142019] dark:text-[#FFFFFF] font-serif-heading">
                    <Briefcase className="w-4 h-4 text-[#356F9D] dark:text-[#80B5DD]" /> Experience & Internships
                  </h2>
                  <button
                    onClick={() => setShowExpForm(true)}
                    className="text-xs text-[#356F9D] dark:text-[#80B5DD] font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Experience
                  </button>
                </div>

                {showExpForm && (
                  <form onSubmit={handleAddExperience} className="p-4 rounded-xl bg-[#EEF4EF] dark:bg-[#223128] border border-[#D5DED8] dark:border-[#304036] space-y-3 text-xs">
                    <input
                      type="text"
                      required
                      placeholder="Title (e.g. Research Intern)"
                      value={newExp.title}
                      onChange={(e) => setNewExp({ ...newExp, title: e.target.value })}
                      className="w-full px-3 py-1.5 rounded bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] text-[#17231C] dark:text-[#F1F6F2] outline-none"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Organization (e.g. Patanjali R&D)"
                      value={newExp.organization}
                      onChange={(e) => setNewExp({ ...newExp, organization: e.target.value })}
                      className="w-full px-3 py-1.5 rounded bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] text-[#17231C] dark:text-[#F1F6F2] outline-none"
                    />
                    <textarea
                      rows={2}
                      placeholder="Description..."
                      value={newExp.description}
                      onChange={(e) => setNewExp({ ...newExp, description: e.target.value })}
                      className="w-full px-3 py-1.5 rounded bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] text-[#17231C] dark:text-[#F1F6F2] outline-none"
                    />
                    <div className="flex justify-end gap-2">
                      <button type="button" onClick={() => setShowExpForm(false)} className="text-[#68776D] dark:text-[#98A99E] cursor-pointer">Cancel</button>
                      <button type="submit" className="px-3 py-1 rounded bg-[#356F9D] hover:bg-[#2B5A80] text-white font-bold cursor-pointer">Save</button>
                    </div>
                  </form>
                )}

                <div className="space-y-3">
                  {(profile?.experiences && profile.experiences.length > 0) ? (
                    profile.experiences.map((exp: any) => (
                      <div key={exp.id} className="p-3 rounded-xl bg-[#F7F9F4] dark:bg-[#0D1511] border border-[#D5DED8] dark:border-[#304036] space-y-1 text-xs">
                        <div className="flex justify-between items-start">
                          <h3 className="font-bold text-[#142019] dark:text-[#FFFFFF]">{exp.title}</h3>
                          <button onClick={() => handleDeleteExperience(exp.id)} className="text-[#68776D] dark:text-[#98A99E] hover:text-[#B64040] dark:hover:text-[#F18484] cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                        <div className="text-[#356F9D] dark:text-[#80B5DD] font-medium">{exp.organization} • {exp.experience_type}</div>
                        {exp.description && <p className="text-[#68776D] dark:text-[#98A99E] text-[11px] mt-1">{exp.description}</p>}
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-[#68776D] dark:text-[#98A99E]">No experiences listed yet.</div>
                  )}
                </div>
              </div>

              {/* Projects */}
              <div className="bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] p-6 rounded-2xl space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-[#D5DED8] dark:border-[#304036] pb-3">
                  <h2 className="text-base font-bold flex items-center gap-2 text-[#142019] dark:text-[#FFFFFF] font-serif-heading">
                    <Code className="w-4 h-4 text-[#2F6B4F] dark:text-[#78B895]" /> Academic & Research Projects
                  </h2>
                  <button
                    onClick={() => setShowProjForm(true)}
                    className="text-xs text-[#2F6B4F] dark:text-[#78B895] font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Project
                  </button>
                </div>

                {showProjForm && (
                  <form onSubmit={handleAddProject} className="p-4 rounded-xl bg-[#EEF4EF] dark:bg-[#223128] border border-[#D5DED8] dark:border-[#304036] space-y-3 text-xs">
                    <input
                      type="text"
                      required
                      placeholder="Project Title (e.g. Herbal Formulation Analysis)"
                      value={newProj.title}
                      onChange={(e) => setNewProj({ ...newProj, title: e.target.value })}
                      className="w-full px-3 py-1.5 rounded bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] text-[#17231C] dark:text-[#F1F6F2] outline-none"
                    />
                    <textarea
                      rows={2}
                      placeholder="Project Description..."
                      value={newProj.description}
                      onChange={(e) => setNewProj({ ...newProj, description: e.target.value })}
                      className="w-full px-3 py-1.5 rounded bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] text-[#17231C] dark:text-[#F1F6F2] outline-none"
                    />
                    <div className="flex justify-end gap-2">
                      <button type="button" onClick={() => setShowProjForm(false)} className="text-[#68776D] dark:text-[#98A99E] cursor-pointer">Cancel</button>
                      <button type="submit" className="px-3 py-1 rounded bg-[#2F6B4F] hover:bg-[#24563F] dark:bg-[#78B895] text-white dark:text-[#0D1511] font-bold cursor-pointer">Save</button>
                    </div>
                  </form>
                )}

                <div className="space-y-3">
                  {(profile?.projects && profile.projects.length > 0) ? (
                    profile.projects.map((proj: any) => (
                      <div key={proj.id} className="p-3 rounded-xl bg-[#F7F9F4] dark:bg-[#0D1511] border border-[#D5DED8] dark:border-[#304036] space-y-1 text-xs">
                        <div className="flex justify-between items-start">
                          <h3 className="font-bold text-[#142019] dark:text-[#FFFFFF]">{proj.title}</h3>
                          <button onClick={() => handleDeleteProject(proj.id)} className="text-[#68776D] dark:text-[#98A99E] hover:text-[#B64040] dark:hover:text-[#F18484] cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                        {proj.description && <p className="text-[#68776D] dark:text-[#98A99E] text-[11px] mt-1">{proj.description}</p>}
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-[#68776D] dark:text-[#98A99E]">No projects listed yet.</div>
                  )}
                </div>
              </div>
            </div>

            {/* Social Links Bar */}
            <div className="bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs shadow-xs">
              <div className="flex items-center gap-2 text-[#526158] dark:text-[#C1CEC5] font-semibold">
                <LinkIcon className="w-4 h-4 text-[#2F6B4F] dark:text-[#78B895]" /> Professional Profiles & Links
              </div>
              <div className="flex items-center gap-4">
                {profile?.linkedin_url ? <a href={profile.linkedin_url} target="_blank" rel="noreferrer" className="text-[#2F6B4F] dark:text-[#78B895] hover:underline font-medium">LinkedIn</a> : <span className="text-[#68776D] dark:text-[#98A99E]">No LinkedIn</span>}
                {profile?.github_url ? <a href={profile.github_url} target="_blank" rel="noreferrer" className="text-[#2F6B4F] dark:text-[#78B895] hover:underline font-medium">GitHub</a> : <span className="text-[#68776D] dark:text-[#98A99E]">No GitHub</span>}
                {profile?.website_url ? <a href={profile.website_url} target="_blank" rel="noreferrer" className="text-[#2F6B4F] dark:text-[#78B895] hover:underline font-medium">Website</a> : <span className="text-[#68776D] dark:text-[#98A99E]">No Website</span>}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
