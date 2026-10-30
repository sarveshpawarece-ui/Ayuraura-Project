"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { clearAuthSession, setCachedSessionUser } from "@/lib/authSession";
import {
  User,
  GraduationCap,
  BookOpen,
  Award,
  Target,
  Compass,
  TrendingUp,
  AlertTriangle,
  FileText,
  Briefcase,
  Sparkles,
  CheckCircle2,
  Calendar,
  Clock,
  Video,
  Radio,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  Bell,
  HeartHandshake,
  Layers,
  HelpCircle,
  Building2,
  Users,
  Search,
  ArrowRight,
  Download,
  Share2,
  Stethoscope,
  Activity,
  Flame,
  Check
} from "lucide-react";
import {
  DEMO_STUDENT,
  DEMO_DOCTOR,
  DEMO_INSTITUTION,
  DEMO_INDUSTRY,
  DEMO_NGO,
  DEMO_ADMIN
} from "@/lib/demoData";

type DemoRole = "STUDENT" | "DOCTOR" | "INSTITUTION" | "INDUSTRY" | "NGO" | "ADMIN";

export default function DemoProfilePage() {
  const [selectedRole, setSelectedRole] = useState<DemoRole>("STUDENT");
  const [activeTab, setActiveTab] = useState<"OVERVIEW" | "ACADEMICS" | "CAREER_SKILLS" | "APPLICATIONS" | "SESSIONS_CASES">("OVERVIEW");
  const [copiedLink, setCopiedLink] = useState(false);

  const student = DEMO_STUDENT;
  const doctor = DEMO_DOCTOR;
  const institution = DEMO_INSTITUTION;
  const industry = DEMO_INDUSTRY;
  const ngo = DEMO_NGO;
  const admin = DEMO_ADMIN;

  const DEMO_EMAILS: Record<DemoRole, string> = {
    STUDENT: "student@ayursetu.local",
    DOCTOR: "doctor@ayursetu.local",
    INSTITUTION: "institution@ayursetu.local",
    INDUSTRY: "industry@ayursetu.local",
    NGO: "ngo@ayursetu.local",
    ADMIN: "admin@ayursetu.local",
  };

  const handleSelectRole = (role: DemoRole) => {
    setSelectedRole(role);
    if (typeof window !== "undefined") {
      const email = DEMO_EMAILS[role];
      clearAuthSession();
      localStorage.setItem("ayursetu_token", `demo_token_${role.toLowerCase()}`);
      localStorage.setItem("token", `demo_token_${role.toLowerCase()}`);
      localStorage.setItem("ayursetu_role", role);
      localStorage.setItem("role", role);
      localStorage.setItem("ayursetu_email", email);
      localStorage.setItem("email", email);
      localStorage.setItem(
        "ayursetu_user",
        JSON.stringify({ id: `demo-${role.toLowerCase()}`, email, role })
      );
      setCachedSessionUser({
        id: `demo-${role.toLowerCase()}`,
        email,
        role,
        is_active: true,
        is_verified: true,
      });
      window.dispatchEvent(new Event("ayursetu_auth_change"));
    }
  };

  const getDemoDashboardRoute = (role: DemoRole) => {
    switch (role) {
      case "STUDENT":
        return "/demo/dashboard";
      case "DOCTOR":
        return "/doctor/dashboard?demo=true";
      case "INSTITUTION":
        return "/institution/dashboard?demo=true";
      case "INDUSTRY":
        return "/industry/dashboard?demo=true";
      case "NGO":
        return "/ngo/dashboard?demo=true";
      case "ADMIN":
        return "/admin/dashboard?demo=true";
      default:
        return "/demo/dashboard";
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const roleParam = params.get("role")?.toUpperCase();
      if (roleParam && ["STUDENT", "DOCTOR", "INSTITUTION", "INDUSTRY", "NGO", "ADMIN"].includes(roleParam)) {
        handleSelectRole(roleParam as DemoRole);
      } else {
        const storedRole = (localStorage.getItem("ayursetu_role") || localStorage.getItem("role") || "").toUpperCase();
        if (storedRole && ["STUDENT", "DOCTOR", "INSTITUTION", "INDUSTRY", "NGO", "ADMIN"].includes(storedRole)) {
          setSelectedRole(storedRole as DemoRole);
        }
      }
    }
  }, []);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#F7F9F4] dark:bg-[#0F1713] text-[#1B2A22] dark:text-[#E8F1EB] flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      {/* Demo Platform Global Banner */}
      <aside aria-label="Demo Mode Notice" className="bg-gradient-to-r from-[#205c3b] via-[#2a734b] to-[#c98e32] text-white py-2.5 px-4 text-xs font-medium shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-mono uppercase tracking-wider font-bold">
              🌟 Platform Demo Mode
            </span>
            <span>
              You are exploring the official <strong>AyurSetu Interactive Demonstration Showcase</strong>. All features are active and safe to test.
            </span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href={getDemoDashboardRoute(selectedRole)}
              onClick={() => handleSelectRole(selectedRole)}
              className="underline font-bold hover:text-amber-200 flex items-center gap-1"
            >
              Open {selectedRole} Demo Dashboard <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </aside>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* Role Switcher Toolbar */}
        <section aria-label="Role Switcher" className="bg-white dark:bg-[#17221C] border border-[#cadacb] dark:border-[#2B3A31] rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#205c3b] dark:text-[#6FAF8A] flex items-center gap-2">
                <Users className="w-4 h-4" /> Multi-Role Demonstration Switcher
              </h2>
              <p className="text-xs text-[#567362] dark:text-[#A9B9AE]">
                Toggle roles to inspect demonstration profiles and dashboards tailored for each stakeholder.
              </p>
            </div>
            <button
              onClick={handleShare}
              className="self-start sm:self-auto px-3 py-1.5 rounded-xl border border-[#cadacb] dark:border-[#2B3A31] hover:bg-[#eef7f0] dark:hover:bg-[#26372D] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-[#205c3b] dark:text-[#6FAF8A]" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedLink ? "Link Copied!" : "Share Showcase"}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-1">
            {[
              { id: "STUDENT", label: "Student Demo", icon: GraduationCap, sub: "BAMS Scholar" },
              { id: "DOCTOR", label: "Doctor Demo", icon: Stethoscope, sub: "Verified MD" },
              { id: "INSTITUTION", label: "Institution Demo", icon: Building2, sub: "Univ. NIA" },
              { id: "INDUSTRY", label: "Industry Demo", icon: Briefcase, sub: "Himalaya Labs" },
              { id: "NGO", label: "NGO Demo", icon: HeartHandshake, sub: "Arogya Seva" },
              { id: "ADMIN", label: "Admin Demo", icon: ShieldCheck, sub: "Governance" },
            ].map((r) => {
              const Icon = r.icon;
              const isSelected = selectedRole === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => handleSelectRole(r.id as DemoRole)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? "border-2 border-[#205c3b] dark:border-[#6FAF8A] bg-[#eef7f0] dark:bg-[#26372D] shadow-xs"
                      : "border-[#cadacb] dark:border-[#2B3A31] bg-white dark:bg-[#17221C] hover:border-[#205c3b]/40 hover:bg-[#F7F9F4] dark:hover:bg-[#26372D]/30"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className={`w-4 h-4 ${isSelected ? "text-[#205c3b] dark:text-[#6FAF8A]" : "text-[#567362] dark:text-[#A9B9AE]"}`} />
                    <span className="font-bold text-xs">{r.label}</span>
                  </div>
                  <span className="text-[10px] text-[#567362] dark:text-[#A9B9AE] block font-mono">{r.sub}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* ------------------------------------------------------------- */}
        {/* STUDENT DEMO SHOWCASE VIEW */}
        {/* ------------------------------------------------------------- */}
        {selectedRole === "STUDENT" && (
          <div className="space-y-8">
            {/* 1. Profile Header Hero */}
            <div className="bg-white dark:bg-[#17221C] border border-[#cadacb] dark:border-[#2B3A31] rounded-3xl overflow-hidden shadow-sm">
              {/* Cover Banner */}
              <div className="h-36 sm:h-48 w-full relative bg-gradient-to-r from-[#205c3b] via-[#2f754e] to-[#c98e32] overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-black/40 backdrop-blur-md text-white text-[11px] font-semibold flex items-center gap-1.5 border border-white/20">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Ayush ID Verified
                  </span>
                  <span className="px-3 py-1 rounded-full bg-amber-500/90 text-slate-950 text-[11px] font-bold">
                    Official Demo Account
                  </span>
                </div>
              </div>

              {/* Identity Details */}
              <div className="px-6 sm:px-8 pb-6 pt-0 relative">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-14 sm:-mt-16 mb-4">
                  <div className="flex items-end gap-4">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-4 border-white dark:border-[#17221C] bg-[#205c3b] text-white flex items-center justify-center font-extrabold text-3xl shadow-lg shrink-0 overflow-hidden relative">
                      <span className="bg-gradient-to-br from-[#205c3b] to-[#123623] w-full h-full flex items-center justify-center">
                        AS
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1B2A22] dark:text-[#E8F1EB]">
                          {student.name}
                        </h1>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[11px] font-bold border border-emerald-300 dark:border-emerald-800">
                          {student.education.professionalYear}
                        </span>
                      </div>
                      <p className="text-xs text-[#567362] dark:text-[#A9B9AE] font-medium flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-[#205c3b] dark:text-[#6FAF8A]" />
                        {student.education.college}
                      </p>
                    </div>
                  </div>

                  {/* Primary Profile Action Bar */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    <Link
                      href="/student/resume-builder"
                      className="px-4 py-2 rounded-xl bg-white dark:bg-[#26372D] border border-[#cadacb] dark:border-[#2B3A31] text-xs font-bold hover:bg-[#F7F9F4] dark:hover:bg-[#26372D]/60 flex items-center gap-1.5 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" /> View Resume
                    </Link>
                    <Link
                      href="/student/portfolio"
                      className="px-4 py-2 rounded-xl bg-white dark:bg-[#26372D] border border-[#cadacb] dark:border-[#2B3A31] text-xs font-bold hover:bg-[#F7F9F4] dark:hover:bg-[#26372D]/60 flex items-center gap-1.5 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Clinical Portfolio
                    </Link>
                    <Link
                      href="/demo/dashboard"
                      onClick={() => handleSelectRole("STUDENT")}
                      className="px-4 py-2 rounded-xl bg-[#205c3b] hover:bg-[#1b432a] text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Demo Dashboard
                    </Link>
                  </div>
                </div>

                {/* Sanskrit Classical Motto Quote */}
                <div className="p-3 rounded-xl bg-[#eef7f0]/70 dark:bg-[#26372D]/40 border border-[#cadacb] dark:border-[#2B3A31] text-xs italic text-[#205c3b] dark:text-[#8BC4A2]">
                  {student.motto}
                </div>

                {/* Key Metrics Quick Ribbon */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-[#cadacb]/60 dark:border-[#2B3A31] mt-4 text-xs">
                  <div>
                    <span className="text-[#567362] dark:text-[#A9B9AE] block text-[11px]">Academic Merit</span>
                    <strong className="text-[#1B2A22] dark:text-[#E8F1EB] text-sm">CGPA {student.education.cgpa} / 10</strong>
                  </div>
                  <div>
                    <span className="text-[#567362] dark:text-[#A9B9AE] block text-[11px]">Career Readiness</span>
                    <strong className="text-emerald-700 dark:text-emerald-400 text-sm">{student.career.readinessScore}% • Tier 1 Fit</strong>
                  </div>
                  <div>
                    <span className="text-[#567362] dark:text-[#A9B9AE] block text-[11px]">Clinical Attendance</span>
                    <strong className="text-[#1B2A22] dark:text-[#E8F1EB] text-sm">{student.education.attendance}% (Compliant)</strong>
                  </div>
                  <div>
                    <span className="text-[#567362] dark:text-[#A9B9AE] block text-[11px]">Verified Credentials</span>
                    <strong className="text-amber-700 dark:text-amber-400 text-sm">6 Cryptographic Badges</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Demo Option Navigation Directory (Section 2 Requirements) */}
            <div className="bg-white dark:bg-[#17221C] border border-[#cadacb] dark:border-[#2B3A31] rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#205c3b] dark:text-[#6FAF8A] flex items-center gap-2">
                  <Compass className="w-4 h-4" /> Live Demo Option Directory (Click Any Feature)
                </h3>
                <span className="text-xs text-[#567362] dark:text-[#A9B9AE]">All 24 Options Open Working Pages</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 text-xs">
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
                      className="p-2.5 rounded-xl border border-[#cadacb] dark:border-[#2B3A31] hover:border-[#205c3b] dark:hover:border-[#6FAF8A] bg-[#F7F9F4] dark:bg-[#26372D]/30 hover:bg-[#eef7f0] dark:hover:bg-[#26372D] flex items-center justify-between transition-all group"
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <Icon className="w-3.5 h-3.5 text-[#205c3b] dark:text-[#6FAF8A] shrink-0" />
                        <span className="font-semibold truncate">{opt.name}</span>
                      </div>
                      <ChevronRight className="w-3 h-3 text-[#567362] group-hover:translate-x-0.5 transition-transform shrink-0" />
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* In-Page Showcase Tabs */}
            <div className="flex items-center gap-2 border-b border-[#cadacb] dark:border-[#2B3A31] pb-2 overflow-x-auto text-xs font-bold">
              {[
                { id: "OVERVIEW", label: "1. Overview & Profile" },
                { id: "ACADEMICS", label: "2. BAMS Curriculum & Exams" },
                { id: "CAREER_SKILLS", label: "3. Skills & Career Roadmap" },
                { id: "APPLICATIONS", label: "4. Internships & Research" },
                { id: "SESSIONS_CASES", label: "5. Clinical Sessions & Cases" },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id as any)}
                  className={`px-4 py-2 rounded-xl transition-all cursor-pointer shrink-0 ${
                    activeTab === t.id
                      ? "bg-[#205c3b] text-white shadow-xs"
                      : "text-[#567362] dark:text-[#A9B9AE] hover:bg-[#eef7f0] dark:hover:bg-[#26372D]"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* TAB 1: OVERVIEW & PROFILE */}
            {activeTab === "OVERVIEW" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Personal & Academic Info */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Career Goal & AI Match */}
                  <div className="bg-white dark:bg-[#17221C] border border-[#cadacb] dark:border-[#2B3A31] rounded-2xl p-6 space-y-4 shadow-sm">
                    <div className="flex items-center justify-between border-b border-[#cadacb]/60 dark:border-[#2B3A31] pb-3">
                      <h3 className="text-sm font-bold flex items-center gap-2 text-[#205c3b] dark:text-[#6FAF8A]">
                        <Target className="w-4 h-4" /> Career Goal & Target Specialization
                      </h3>
                      <Link
                        href="/student/career"
                        className="text-xs font-semibold text-[#205c3b] dark:text-[#6FAF8A] hover:underline flex items-center gap-1"
                      >
                        Change Goal <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                    <div>
                      <h4 className="text-base font-extrabold text-[#1B2A22] dark:text-[#E8F1EB]">
                        {student.career.goal}
                      </h4>
                      <p className="text-xs text-[#567362] dark:text-[#A9B9AE] mt-1 leading-relaxed">
                        {student.career.shortDescription}
                      </p>
                    </div>

                    {/* Readiness Gauge */}
                    <div className="p-4 rounded-xl bg-[#eef7f0]/60 dark:bg-[#26372D]/40 border border-[#cadacb] dark:border-[#2B3A31] space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-[#205c3b] dark:text-[#8BC4A2] flex items-center gap-1.5">
                          <Activity className="w-4 h-4" /> Real-time Career Readiness Score
                        </span>
                        <span className="font-mono font-bold text-[#205c3b] dark:text-[#6FAF8A]">{student.career.readinessScore}% (Tier-1 Fit)</span>
                      </div>
                      <div className="w-full bg-[#cadacb]/40 dark:bg-[#2B3A31] h-2.5 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-emerald-500 via-teal-500 to-[#c98e32] h-full rounded-full transition-all duration-500"
                          style={{ width: `${student.career.readinessScore}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Self-Declared & Verified Skills */}
                  <div className="bg-white dark:bg-[#17221C] border border-[#cadacb] dark:border-[#2B3A31] rounded-2xl p-6 space-y-4 shadow-sm">
                    <div className="flex items-center justify-between border-b border-[#cadacb]/60 dark:border-[#2B3A31] pb-3">
                      <h3 className="text-sm font-bold flex items-center gap-2 text-[#205c3b] dark:text-[#6FAF8A]">
                        <Award className="w-4 h-4" /> Skills & Clinical Competencies
                      </h3>
                      <Link
                        href="/student/skills"
                        className="text-xs font-semibold text-[#205c3b] dark:text-[#6FAF8A] hover:underline flex items-center gap-1"
                      >
                        Manage Skills <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {student.skills.map((s) => (
                        <div
                          key={s.id}
                          className="p-3 rounded-xl bg-[#F7F9F4] dark:bg-[#26372D]/30 border border-[#cadacb] dark:border-[#2B3A31] space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs">{s.name}</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                              {s.proficiency}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-[10px] text-[#567362] dark:text-[#A9B9AE]">
                            <span>{s.category}</span>
                            <span>Endorsed by {s.endorsedBy}</span>
                          </div>
                          <div className="w-full bg-[#cadacb]/40 dark:bg-[#2B3A31] h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-[#205c3b] dark:bg-[#6FAF8A] h-full rounded-full"
                              style={{ width: `${s.levelPercentage}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* AI Recommendations Panel */}
                  <div className="bg-gradient-to-br from-[#eef7f0] to-[#FAF0E1] dark:from-[#17221C] dark:to-[#221c15] border border-[#cadacb] dark:border-[#2B3A31] rounded-2xl p-6 space-y-4 shadow-sm">
                    <div className="flex items-center justify-between border-b border-[#cadacb]/60 dark:border-[#2B3A31] pb-3">
                      <h3 className="text-sm font-bold flex items-center gap-2 text-amber-700 dark:text-amber-400">
                        <Sparkles className="w-4 h-4" /> AI Recommendations & Learning Trajectory
                      </h3>
                      <Link
                        href="/ai-career"
                        className="text-xs font-semibold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1"
                      >
                        AI Career Hub <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>

                    <div className="space-y-3">
                      {student.aiRecommendations.map((rec, i) => (
                        <div
                          key={i}
                          className="p-3.5 rounded-xl bg-white dark:bg-[#17221C] border border-[#cadacb] dark:border-[#2B3A31] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                              {rec.type}
                            </span>
                            <h4 className="text-xs font-bold text-[#1B2A22] dark:text-[#E8F1EB] mt-1">{rec.headline}</h4>
                            <p className="text-[11px] text-[#567362] dark:text-[#A9B9AE]">{rec.reason}</p>
                          </div>
                          <Link
                            href={rec.targetRoute}
                            className="px-3 py-1.5 rounded-lg bg-[#205c3b] hover:bg-[#1b432a] text-white text-[11px] font-bold shrink-0 self-start sm:self-center transition-colors"
                          >
                            {rec.actionLabel}
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column: Key Details, Achievements, Notifications */}
                <div className="space-y-6">
                  {/* Verified Achievements & Badges */}
                  <div className="bg-white dark:bg-[#17221C] border border-[#cadacb] dark:border-[#2B3A31] rounded-2xl p-5 space-y-3 shadow-sm">
                    <h3 className="text-sm font-bold text-[#205c3b] dark:text-[#6FAF8A] flex items-center gap-2 border-b border-[#cadacb]/60 dark:border-[#2B3A31] pb-2.5">
                      <Award className="w-4 h-4" /> Cryptographic Badges & Honors
                    </h3>
                    <div className="space-y-2.5">
                      {student.achievements.map((ach, i) => (
                        <div key={i} className="flex items-start gap-3 text-xs">
                          <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
                            <Sparkles className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <p className="font-bold text-[#1B2A22] dark:text-[#E8F1EB]">{ach.title}</p>
                            <p className="text-[11px] text-[#567362] dark:text-[#A9B9AE]">{ach.description}</p>
                            <span className="text-[10px] text-[#567362]/80 font-mono">{ach.date}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Followed Experts / Mentors */}
                  <div className="bg-white dark:bg-[#17221C] border border-[#cadacb] dark:border-[#2B3A31] rounded-2xl p-5 space-y-3 shadow-sm">
                    <div className="flex justify-between items-center border-b border-[#cadacb]/60 dark:border-[#2B3A31] pb-2.5">
                      <h3 className="text-sm font-bold text-[#205c3b] dark:text-[#6FAF8A] flex items-center gap-2">
                        <Stethoscope className="w-4 h-4" /> Followed Mentors & Faculty
                      </h3>
                      <Link href="/student/sessions" className="text-xs text-[#205c3b] dark:text-[#6FAF8A] font-semibold hover:underline">
                        All Mentors
                      </Link>
                    </div>
                    <div className="space-y-2.5">
                      {student.followedExperts.map((exp) => (
                        <div key={exp.id} className="flex items-center justify-between text-xs p-2 rounded-xl bg-[#F7F9F4] dark:bg-[#26372D]/30 border border-[#cadacb] dark:border-[#2B3A31]">
                          <div>
                            <p className="font-bold text-[#1B2A22] dark:text-[#E8F1EB]">{exp.name}</p>
                            <p className="text-[10px] text-[#567362] dark:text-[#A9B9AE]">{exp.specialization}</p>
                          </div>
                          <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-[10px]">
                            ★ {exp.rating}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Real-time Notifications Preview */}
                  <div className="bg-white dark:bg-[#17221C] border border-[#cadacb] dark:border-[#2B3A31] rounded-2xl p-5 space-y-3 shadow-sm">
                    <div className="flex justify-between items-center border-b border-[#cadacb]/60 dark:border-[#2B3A31] pb-2.5">
                      <h3 className="text-sm font-bold text-[#205c3b] dark:text-[#6FAF8A] flex items-center gap-2">
                        <Bell className="w-4 h-4" /> Live Notifications
                      </h3>
                      <Link href="/notifications" className="text-xs text-[#205c3b] dark:text-[#6FAF8A] font-semibold hover:underline">
                        View All
                      </Link>
                    </div>
                    <div className="space-y-2">
                      {student.notifications.slice(0, 3).map((notif) => (
                        <div key={notif.id} className="text-xs p-2.5 rounded-xl bg-[#F7F9F4] dark:bg-[#26372D]/30 border border-[#cadacb] dark:border-[#2B3A31] space-y-0.5">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-[#1B2A22] dark:text-[#E8F1EB]">{notif.title}</span>
                            <span className="text-[10px] text-[#567362] font-mono">{notif.timeAgo}</span>
                          </div>
                          <p className="text-[11px] text-[#567362] dark:text-[#A9B9AE] leading-snug">{notif.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: ACADEMICS & EXAMS */}
            {activeTab === "ACADEMICS" && (
              <div className="space-y-6">
                {/* 8 BAMS Subjects Breakdown */}
                <div className="bg-white dark:bg-[#17221C] border border-[#cadacb] dark:border-[#2B3A31] rounded-2xl p-6 space-y-4 shadow-sm">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-[#cadacb]/60 dark:border-[#2B3A31] pb-3">
                    <div>
                      <h3 className="text-sm font-bold text-[#205c3b] dark:text-[#6FAF8A] flex items-center gap-2">
                        <BookOpen className="w-4 h-4" /> BAMS Professional Curriculum & Subject Mastery
                      </h3>
                      <p className="text-xs text-[#567362] dark:text-[#A9B9AE]">
                        Central Council of Indian Medicine (CCIM) / NCISM Standardized BAMS Syllabus
                      </p>
                    </div>
                    <Link
                      href="/student/syllabus"
                      className="text-xs font-bold text-[#205c3b] dark:text-[#6FAF8A] hover:underline flex items-center gap-1"
                    >
                      Interactive Syllabus Explorer <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {student.subjects.map((sub) => (
                      <div
                        key={sub.code}
                        className="p-4 rounded-xl bg-[#F7F9F4] dark:bg-[#26372D]/30 border border-[#cadacb] dark:border-[#2B3A31] space-y-2"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] font-mono text-[#567362] dark:text-[#A9B9AE] block">{sub.code}</span>
                            <h4 className="font-bold text-xs text-[#1B2A22] dark:text-[#E8F1EB]">{sub.name}</h4>
                            <span className="text-xs font-serif text-[#205c3b] dark:text-[#8BC4A2]">{sub.sanskritName}</span>
                          </div>
                          <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-white dark:bg-[#17221C] border border-[#cadacb] dark:border-[#2B3A31]">
                            Grade {sub.grade}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs text-[#567362] dark:text-[#A9B9AE]">
                          <span>Clinical OPD: {sub.clinicalHours} Hours</span>
                          <span className="font-mono font-bold text-[#205c3b] dark:text-[#6FAF8A]">{sub.progress}%</span>
                        </div>
                        <div className="w-full bg-[#cadacb]/40 dark:bg-[#2B3A31] h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-[#205c3b] dark:bg-[#6FAF8A] h-full rounded-full"
                            style={{ width: `${sub.progress}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Exam Readiness & Quiz Performance */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* AIAPGET Exam Prep Widget */}
                  <div className="bg-white dark:bg-[#17221C] border border-[#cadacb] dark:border-[#2B3A31] rounded-2xl p-6 space-y-4 shadow-sm">
                    <div className="flex justify-between items-center border-b border-[#cadacb]/60 dark:border-[#2B3A31] pb-3">
                      <h3 className="text-sm font-bold text-[#205c3b] dark:text-[#6FAF8A] flex items-center gap-2">
                        <Flame className="w-4 h-4 text-amber-500" /> Exam Readiness & AIAPGET Mock Benchmarks
                      </h3>
                      <Link href="/student/exam-prep" className="text-xs text-[#205c3b] dark:text-[#6FAF8A] font-semibold hover:underline">
                        Exam Portal
                      </Link>
                    </div>
                    <div className="p-4 rounded-xl bg-[#eef7f0]/60 dark:bg-[#26372D]/40 border border-[#cadacb] dark:border-[#2B3A31] space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold">{student.examPreparation.targetExam}</span>
                        <span className="font-mono font-bold text-[#205c3b] dark:text-[#6FAF8A]">
                          Predicted: {student.examPreparation.predictedScore} / {student.examPreparation.targetScore}
                        </span>
                      </div>
                      <div className="w-full bg-[#cadacb]/40 dark:bg-[#2B3A31] h-2.5 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-emerald-500 to-amber-500 h-full rounded-full"
                          style={{ width: `${(student.examPreparation.predictedScore / student.examPreparation.targetScore) * 100}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[11px] text-[#567362] dark:text-[#A9B9AE] pt-1">
                        <span>{student.examPreparation.totalMockTests} Mocks Taken</span>
                        <span>Avg Accuracy: {student.examPreparation.avgAccuracy}%</span>
                        <span>Next Mock: {student.examPreparation.nextMockDate}</span>
                      </div>
                    </div>
                  </div>

                  {/* Quiz History */}
                  <div className="bg-white dark:bg-[#17221C] border border-[#cadacb] dark:border-[#2B3A31] rounded-2xl p-6 space-y-4 shadow-sm">
                    <div className="flex justify-between items-center border-b border-[#cadacb]/60 dark:border-[#2B3A31] pb-3">
                      <h3 className="text-sm font-bold text-[#205c3b] dark:text-[#6FAF8A] flex items-center gap-2">
                        <HelpCircle className="w-4 h-4" /> Recent Completed Quizzes
                      </h3>
                      <Link href="/student/quiz" className="text-xs text-[#205c3b] dark:text-[#6FAF8A] font-semibold hover:underline">
                        Take Quiz
                      </Link>
                    </div>
                    <div className="space-y-2.5">
                      {student.quizHistory.slice(0, 4).map((qz) => (
                        <div
                          key={qz.id}
                          className="p-3 rounded-xl bg-[#F7F9F4] dark:bg-[#26372D]/30 border border-[#cadacb] dark:border-[#2B3A31] flex justify-between items-center text-xs"
                        >
                          <div>
                            <h4 className="font-bold text-[#1B2A22] dark:text-[#E8F1EB]">{qz.topic}</h4>
                            <span className="text-[10px] text-[#567362] font-mono">{qz.questionsCount} Qs • {qz.date}</span>
                          </div>
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold font-mono">
                            {qz.scorePercentage}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Smart Timetable Weekly Summary */}
                <div className="bg-white dark:bg-[#17221C] border border-[#cadacb] dark:border-[#2B3A31] rounded-2xl p-6 space-y-4 shadow-sm">
                  <div className="flex justify-between items-center border-b border-[#cadacb]/60 dark:border-[#2B3A31] pb-3">
                    <h3 className="text-sm font-bold text-[#205c3b] dark:text-[#6FAF8A] flex items-center gap-2">
                      <Clock className="w-4 h-4" /> Weekly Clinical & Academic Timetable
                    </h3>
                    <Link href="/student/timetable" className="text-xs text-[#205c3b] dark:text-[#6FAF8A] font-semibold hover:underline">
                      Full Timetable
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    {student.timetable.slice(0, 3).map((day, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-[#F7F9F4] dark:bg-[#26372D]/30 border border-[#cadacb] dark:border-[#2B3A31] space-y-2">
                        <span className="font-bold text-[#205c3b] dark:text-[#8BC4A2] block border-b border-[#cadacb]/50 pb-1">{day.day}</span>
                        <div className="space-y-2">
                          {day.slots.slice(0, 2).map((slot, sIdx) => (
                            <div key={sIdx} className="space-y-0.5">
                              <span className="text-[10px] font-mono text-[#567362] block">{slot.time}</span>
                              <p className="font-semibold leading-tight">{slot.subject}</p>
                              <span className="text-[10px] text-[#567362] block">📍 {slot.location}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: CAREER & SKILLS */}
            {activeTab === "CAREER_SKILLS" && (
              <div className="space-y-6">
                {/* 4-Stage Career Roadmap */}
                <div className="bg-white dark:bg-[#17221C] border border-[#cadacb] dark:border-[#2B3A31] rounded-2xl p-6 space-y-4 shadow-sm">
                  <div className="flex justify-between items-center border-b border-[#cadacb]/60 dark:border-[#2B3A31] pb-3">
                    <h3 className="text-sm font-bold text-[#205c3b] dark:text-[#6FAF8A] flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" /> Multi-Stage Career Roadmap
                    </h3>
                    <Link href="/student/career" className="text-xs text-[#205c3b] dark:text-[#6FAF8A] font-semibold hover:underline">
                      Explore Roadmap
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {student.career.roadmapSteps.map((step) => (
                      <div
                        key={step.stage}
                        className={`p-4 rounded-xl border space-y-2 relative ${
                          step.status === "COMPLETED"
                            ? "border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20"
                            : step.status === "CURRENT"
                            ? "border-2 border-[#205c3b] dark:border-[#6FAF8A] bg-[#eef7f0] dark:bg-[#26372D]"
                            : "border-[#cadacb] dark:border-[#2B3A31] bg-white dark:bg-[#17221C] opacity-75"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#205c3b] dark:text-[#8BC4A2]">
                            Stage {step.stage} • {step.timeline}
                          </span>
                          {step.status === "COMPLETED" && <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                          {step.status === "CURRENT" && <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />}
                        </div>
                        <h4 className="font-bold text-xs text-[#1B2A22] dark:text-[#E8F1EB]">{step.title}</h4>
                        <p className="text-[11px] text-[#567362] dark:text-[#A9B9AE] leading-relaxed">{step.description}</p>
                        <div className="flex flex-wrap gap-1 pt-1">
                          {step.competencies.map((c, i) => (
                            <span key={i} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/70 dark:bg-black/30 border border-[#cadacb] dark:border-[#2B3A31]">
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Skill Gap Analysis */}
                <div className="bg-white dark:bg-[#17221C] border border-[#cadacb] dark:border-[#2B3A31] rounded-2xl p-6 space-y-4 shadow-sm">
                  <div className="flex justify-between items-center border-b border-[#cadacb]/60 dark:border-[#2B3A31] pb-3">
                    <h3 className="text-sm font-bold text-amber-700 dark:text-amber-400 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" /> Critical Skill Gaps & Remediation Pathway
                    </h3>
                    <Link href="/student/skill-gap" className="text-xs text-amber-700 dark:text-amber-400 font-semibold hover:underline">
                      Full Skill Gap Report
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {student.skillGaps.map((gap, i) => (
                      <div key={i} className="p-4 rounded-xl bg-[#FAF0E1]/40 dark:bg-[#26372D]/30 border border-amber-300/60 dark:border-amber-900/40 space-y-2 text-xs">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-[#1B2A22] dark:text-[#E8F1EB]">{gap.skill}</h4>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-200 dark:bg-amber-950 text-amber-900 dark:text-amber-300">
                            {gap.priority} PRIORITY
                          </span>
                        </div>
                        <div className="flex justify-between text-[11px] text-[#567362]">
                          <span>Current Proficiency: {gap.currentScore}%</span>
                          <span>Required Target: {gap.requiredScore}%</span>
                        </div>
                        <div className="w-full bg-[#cadacb]/50 dark:bg-[#2B3A31] h-2 rounded-full overflow-hidden">
                          <div className="bg-amber-500 h-full rounded-full" style={{ width: `${gap.currentScore}%` }} />
                        </div>
                        <p className="text-[11px] text-[#567362] dark:text-[#A9B9AE] pt-1">
                          <strong>Remediation:</strong> {gap.actionItem}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Completed Benchmark Assessments & Scores */}
                <div className="bg-white dark:bg-[#17221C] border border-[#cadacb] dark:border-[#2B3A31] rounded-2xl p-6 space-y-4 shadow-sm">
                  <div className="flex justify-between items-center border-b border-[#cadacb]/60 dark:border-[#2B3A31] pb-3">
                    <h3 className="text-sm font-bold text-[#205c3b] dark:text-[#6FAF8A] flex items-center gap-2">
                      <Award className="w-4 h-4" /> Benchmark Skill Assessments & Verified Scores
                    </h3>
                    <Link href="/student/assessments/history" className="text-xs text-[#205c3b] dark:text-[#6FAF8A] font-semibold hover:underline">
                      Score History
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
                    {student.assessments.map((ass) => (
                      <div key={ass.id} className="p-4 rounded-xl bg-[#F7F9F4] dark:bg-[#26372D]/30 border border-[#cadacb] dark:border-[#2B3A31] space-y-2">
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-mono text-[#567362] block">{ass.category}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                            {ass.status}
                          </span>
                        </div>
                        <h4 className="font-bold text-xs text-[#1B2A22] dark:text-[#E8F1EB]">{ass.title}</h4>
                        <div className="flex justify-between text-xs pt-1 border-t border-[#cadacb]/50">
                          <span>Score: <strong>{ass.score}/{ass.maxScore}</strong></span>
                          <span>Percentile: <strong className="text-emerald-700 dark:text-emerald-400">{ass.percentile}th</strong></span>
                        </div>
                        <span className="text-[10px] text-[#567362] block">Completed on {ass.dateCompleted}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: APPLICATIONS, JOBS & RESEARCH */}
            {activeTab === "APPLICATIONS" && (
              <div className="space-y-6">
                {/* Active Applications Tracker */}
                <div className="bg-white dark:bg-[#17221C] border border-[#cadacb] dark:border-[#2B3A31] rounded-2xl p-6 space-y-4 shadow-sm">
                  <div className="flex justify-between items-center border-b border-[#cadacb]/60 dark:border-[#2B3A31] pb-3">
                    <h3 className="text-sm font-bold text-[#205c3b] dark:text-[#6FAF8A] flex items-center gap-2">
                      <Briefcase className="w-4 h-4" /> Real-time Application Pipeline & Status
                    </h3>
                    <Link href="/student/applications" className="text-xs text-[#205c3b] dark:text-[#6FAF8A] font-semibold hover:underline">
                      Manage Applications
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {student.applications.map((app) => (
                      <div key={app.id} className="p-4 rounded-xl bg-[#F7F9F4] dark:bg-[#26372D]/30 border border-[#cadacb] dark:border-[#2B3A31] space-y-2 text-xs">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] font-mono text-[#567362] uppercase block">{app.type.replace("_", " ")}</span>
                            <h4 className="font-bold text-xs text-[#1B2A22] dark:text-[#E8F1EB]">{app.roleTitle}</h4>
                            <p className="text-[#567362] dark:text-[#A9B9AE]">{app.organization}</p>
                          </div>
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-mono ${
                              app.status === "SELECTED"
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                : app.status === "SHORTLISTED"
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                                : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                            }`}
                          >
                            {app.status}
                          </span>
                        </div>
                        <div className="flex justify-between text-[11px] text-[#567362] pt-1 border-t border-[#cadacb]/50">
                          <span>Stipend: {app.stipend}</span>
                          <span>📍 {app.location}</span>
                        </div>
                        <span className="text-[10px] text-[#567362] block">Applied on {app.appliedDate}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Published Research Papers & Fellowships */}
                <div className="bg-white dark:bg-[#17221C] border border-[#cadacb] dark:border-[#2B3A31] rounded-2xl p-6 space-y-4 shadow-sm">
                  <div className="flex justify-between items-center border-b border-[#cadacb]/60 dark:border-[#2B3A31] pb-3">
                    <h3 className="text-sm font-bold text-[#205c3b] dark:text-[#6FAF8A] flex items-center gap-2">
                      <BookOpen className="w-4 h-4" /> Published Research & Scientific Monographs
                    </h3>
                    <Link href="/herbs-research" className="text-xs text-[#205c3b] dark:text-[#6FAF8A] font-semibold hover:underline">
                      Research Library
                    </Link>
                  </div>
                  <div className="space-y-3">
                    {student.research.map((paper) => (
                      <div key={paper.id} className="p-4 rounded-xl bg-[#F7F9F4] dark:bg-[#26372D]/30 border border-[#cadacb] dark:border-[#2B3A31] space-y-1.5 text-xs">
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="font-bold text-xs text-[#1B2A22] dark:text-[#E8F1EB]">{paper.title}</h4>
                          <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold shrink-0">
                            {paper.role}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#567362] dark:text-[#A9B9AE] italic">{paper.journal} • {paper.year} • DOI: {paper.doi}</p>
                        <p className="text-[11px] text-[#567362] dark:text-[#A9B9AE] leading-relaxed">{paper.abstract}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Verified Certificates Showcase */}
                <div className="bg-white dark:bg-[#17221C] border border-[#cadacb] dark:border-[#2B3A31] rounded-2xl p-6 space-y-4 shadow-sm">
                  <div className="flex justify-between items-center border-b border-[#cadacb]/60 dark:border-[#2B3A31] pb-3">
                    <h3 className="text-sm font-bold text-[#205c3b] dark:text-[#6FAF8A] flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" /> Cryptographically Verified Credentials
                    </h3>
                    <Link href="/verify/certificate" className="text-xs text-[#205c3b] dark:text-[#6FAF8A] font-semibold hover:underline">
                      Verify Certificate
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
                    {student.certificates.map((cert) => (
                      <div key={cert.id} className="p-4 rounded-xl bg-[#F7F9F4] dark:bg-[#26372D]/30 border border-[#cadacb] dark:border-[#2B3A31] space-y-2">
                        <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-mono text-[9px] font-bold">
                          VERIFIED CREDENTIAL
                        </span>
                        <h4 className="font-bold text-xs text-[#1B2A22] dark:text-[#E8F1EB]">{cert.title}</h4>
                        <p className="text-[11px] text-[#567362]">{cert.issuer}</p>
                        <div className="pt-1 border-t border-[#cadacb]/50 flex justify-between items-center text-[10px]">
                          <span className="font-mono">{cert.credentialId}</span>
                          <Link href={cert.verificationUrl} className="text-[#205c3b] dark:text-[#6FAF8A] font-bold hover:underline flex items-center gap-0.5">
                            Verify <ExternalLink className="w-2.5 h-2.5" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: CLINICAL SESSIONS & CASES */}
            {activeTab === "SESSIONS_CASES" && (
              <div className="space-y-6">
                {/* Clinical Case Studies */}
                <div className="bg-white dark:bg-[#17221C] border border-[#cadacb] dark:border-[#2B3A31] rounded-2xl p-6 space-y-4 shadow-sm">
                  <div className="flex justify-between items-center border-b border-[#cadacb]/60 dark:border-[#2B3A31] pb-3">
                    <h3 className="text-sm font-bold text-[#205c3b] dark:text-[#6FAF8A] flex items-center gap-2">
                      <Stethoscope className="w-4 h-4" /> Documented Clinical Case Studies & Outcomes
                    </h3>
                    <Link href="/student/cases" className="text-xs text-[#205c3b] dark:text-[#6FAF8A] font-semibold hover:underline">
                      All Cases
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {student.caseStudies.map((cs) => (
                      <div key={cs.id} className="p-4 rounded-xl bg-[#F7F9F4] dark:bg-[#26372D]/30 border border-[#cadacb] dark:border-[#2B3A31] space-y-2 text-xs">
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-mono text-[#205c3b] dark:text-[#8BC4A2] font-bold">{cs.sanskritName}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-white dark:bg-[#17221C] font-mono border border-[#cadacb] dark:border-[#2B3A31]">
                            {cs.patientAge}y • {cs.patientGender}
                          </span>
                        </div>
                        <h4 className="font-bold text-xs text-[#1B2A22] dark:text-[#E8F1EB]">{cs.title}</h4>
                        <div className="space-y-1 text-[11px] text-[#567362] dark:text-[#A9B9AE] pt-1">
                          <p><strong>Prakriti:</strong> {cs.prakriti}</p>
                          <p><strong>Dosha:</strong> {cs.doshaImbalance}</p>
                          <p><strong>Chikitsa:</strong> {cs.lineOfTreatment}</p>
                          <p className="text-emerald-700 dark:text-emerald-400 font-semibold"><strong>Outcome:</strong> {cs.outcome}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Expert Mentorship & Recorded Lectures */}
                <div className="bg-white dark:bg-[#17221C] border border-[#cadacb] dark:border-[#2B3A31] rounded-2xl p-6 space-y-4 shadow-sm">
                  <div className="flex justify-between items-center border-b border-[#cadacb]/60 dark:border-[#2B3A31] pb-3">
                    <h3 className="text-sm font-bold text-[#205c3b] dark:text-[#6FAF8A] flex items-center gap-2">
                      <Video className="w-4 h-4" /> Live Clinical Demonstrations & Recorded Lectures
                    </h3>
                    <Link href="/student/sessions" className="text-xs text-[#205c3b] dark:text-[#6FAF8A] font-semibold hover:underline">
                      Session Schedule
                    </Link>
                  </div>
                  <div className="space-y-3">
                    {student.expertSessions.map((sess) => (
                      <div key={sess.id} className="p-4 rounded-xl bg-[#F7F9F4] dark:bg-[#26372D]/30 border border-[#cadacb] dark:border-[#2B3A31] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono ${sess.status === "UPCOMING" ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300" : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"}`}>
                              {sess.status}
                            </span>
                            <span className="text-[11px] text-[#567362] font-mono">{sess.dateTime}</span>
                          </div>
                          <h4 className="font-bold text-xs text-[#1B2A22] dark:text-[#E8F1EB]">{sess.title}</h4>
                          <p className="text-[11px] text-[#567362] dark:text-[#A9B9AE]">{sess.doctorName} • {sess.doctorQualification}</p>
                        </div>
                        <Link
                          href={sess.recordingUrl || "/student/sessions"}
                          className="px-4 py-2 rounded-xl bg-[#205c3b] hover:bg-[#1b432a] text-white font-bold text-xs flex items-center gap-1.5 shrink-0 self-start sm:self-center transition-colors"
                        >
                          {sess.status === "UPCOMING" ? "Join Stream" : "Watch Lecture"} <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Healthcare Camps & Community Outreaches */}
                <div className="bg-white dark:bg-[#17221C] border border-[#cadacb] dark:border-[#2B3A31] rounded-2xl p-6 space-y-4 shadow-sm">
                  <div className="flex justify-between items-center border-b border-[#cadacb]/60 dark:border-[#2B3A31] pb-3">
                    <h3 className="text-sm font-bold text-[#205c3b] dark:text-[#6FAF8A] flex items-center gap-2">
                      <HeartHandshake className="w-4 h-4 text-rose-500" /> Rural Healthcare Camps & NGO Coordination
                    </h3>
                    <Link href="/camps" className="text-xs text-[#205c3b] dark:text-[#6FAF8A] font-semibold hover:underline">
                      Explore All Camps
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    {student.eventsAndCamps.map((ev) => (
                      <div key={ev.id} className="p-4 rounded-xl bg-[#F7F9F4] dark:bg-[#26372D]/30 border border-[#cadacb] dark:border-[#2B3A31] space-y-1.5">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-xs text-[#1B2A22] dark:text-[#E8F1EB]">{ev.title}</h4>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold">
                            {ev.role}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#567362]">Organized by {ev.ngoName}</p>
                        <div className="flex justify-between text-[11px] text-[#567362] pt-1 border-t border-[#cadacb]/50">
                          <span>📅 {ev.date}</span>
                          <span>📍 {ev.location}</span>
                          <span>👥 {ev.expectedBeneficiaries} Beneficiaries</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* DOCTOR DEMO SHOWCASE VIEW (Section 7) */}
        {/* ------------------------------------------------------------- */}
        {selectedRole === "DOCTOR" && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-[#17221C] border border-[#cadacb] dark:border-[#2B3A31] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl bg-[#205c3b] text-white flex items-center justify-center font-bold text-2xl shrink-0 shadow-md">
                    DR
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-extrabold text-[#1B2A22] dark:text-[#E8F1EB]">{doctor.name}</h2>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" /> VERIFIED MEDICAL LICENSE
                      </span>
                    </div>
                    <p className="text-xs text-[#567362] dark:text-[#A9B9AE]">{doctor.qualification} • {doctor.specialization}</p>
                    <p className="text-[11px] text-[#567362] font-mono">{doctor.stateMedicalCouncil} • Reg No: {doctor.registrationNumber}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link
                    href="/doctor/dashboard?demo=true"
                    onClick={() => handleSelectRole("DOCTOR")}
                    className="px-4 py-2 rounded-xl bg-[#205c3b] hover:bg-[#1b432a] text-white text-xs font-bold shadow-xs transition-colors"
                  >
                    Open Doctor Dashboard
                  </Link>
                  <Link
                    href="/doctor/profile"
                    className="px-4 py-2 rounded-xl border border-[#cadacb] dark:border-[#2B3A31] hover:bg-[#F7F9F4] text-xs font-bold transition-colors"
                  >
                    Doctor Profile Page
                  </Link>
                </div>
              </div>

              {/* Doctor Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-[#cadacb] dark:border-[#2B3A31] text-xs">
                <div className="p-3 rounded-xl bg-[#F7F9F4] dark:bg-[#26372D]/30 border border-[#cadacb] dark:border-[#2B3A31]">
                  <span className="text-[#567362] block text-[11px]">Experience</span>
                  <strong className="text-base font-bold">{doctor.yearsOfExperience} Years</strong>
                </div>
                <div className="p-3 rounded-xl bg-[#F7F9F4] dark:bg-[#26372D]/30 border border-[#cadacb] dark:border-[#2B3A31]">
                  <span className="text-[#567362] block text-[11px]">Students Mentored</span>
                  <strong className="text-base font-bold text-emerald-700 dark:text-emerald-400">{doctor.stats.totalStudentsMentored} Scholars</strong>
                </div>
                <div className="p-3 rounded-xl bg-[#F7F9F4] dark:bg-[#26372D]/30 border border-[#cadacb] dark:border-[#2B3A31]">
                  <span className="text-[#567362] block text-[11px]">Expert Rating</span>
                  <strong className="text-base font-bold text-amber-700 dark:text-amber-400">★ {doctor.stats.averageRating} / 5.0</strong>
                </div>
                <div className="p-3 rounded-xl bg-[#F7F9F4] dark:bg-[#26372D]/30 border border-[#cadacb] dark:border-[#2B3A31]">
                  <span className="text-[#567362] block text-[11px]">Followers & Impact</span>
                  <strong className="text-base font-bold">{doctor.stats.followersCount} Followers</strong>
                </div>
              </div>

              {/* Clinic / Hospital Profile */}
              <div className="p-4 rounded-xl bg-[#eef7f0]/50 dark:bg-[#26372D]/30 border border-[#cadacb] dark:border-[#2B3A31] space-y-2 text-xs">
                <h3 className="font-bold text-sm text-[#205c3b] dark:text-[#6FAF8A] flex items-center gap-2">
                  <Building2 className="w-4 h-4" /> Associated Clinical Practice & Hospital
                </h3>
                <p className="font-semibold text-[#1B2A22] dark:text-[#E8F1EB]">{doctor.clinic.name}</p>
                <p className="text-[#567362] dark:text-[#A9B9AE]">📍 {doctor.clinic.address}, {doctor.clinic.city} • Bed Capacity: {doctor.clinic.bedCapacity} IPD Beds</p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {doctor.clinic.servicesOffered.map((srv, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-white dark:bg-[#17221C] text-[10px] font-medium border border-[#cadacb] dark:border-[#2B3A31]">
                      {srv}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* INSTITUTION DEMO SHOWCASE VIEW (Section 8) */}
        {/* ------------------------------------------------------------- */}
        {selectedRole === "INSTITUTION" && (
          <div className="bg-white dark:bg-[#17221C] border border-[#cadacb] dark:border-[#2B3A31] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 text-[10px] font-bold">
                  AISHE CODE: {institution.aisheCode}
                </span>
                <h2 className="text-2xl font-extrabold text-[#1B2A22] dark:text-[#E8F1EB] mt-1">{institution.name}</h2>
                <p className="text-xs text-[#567362] dark:text-[#A9B9AE]">{institution.type} • {institution.city}, {institution.state}</p>
              </div>
              <Link
                href="/institution/dashboard?demo=true"
                onClick={() => handleSelectRole("INSTITUTION")}
                className="px-4 py-2 rounded-xl bg-[#205c3b] hover:bg-[#1b432a] text-white text-xs font-bold shadow-xs transition-colors self-start sm:self-auto"
              >
                Open Institution Dashboard
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-[#F7F9F4] dark:bg-[#26372D]/30 border border-[#cadacb] dark:border-[#2B3A31]">
                <span className="text-[#567362] block text-[11px]">Enrolled Students</span>
                <strong className="text-lg font-bold">{institution.stats.enrolledStudents}</strong>
              </div>
              <div className="p-3.5 rounded-xl bg-[#F7F9F4] dark:bg-[#26372D]/30 border border-[#cadacb] dark:border-[#2B3A31]">
                <span className="text-[#567362] block text-[11px]">Placement Rate</span>
                <strong className="text-lg font-bold text-emerald-700 dark:text-emerald-400">{institution.stats.placementRate}%</strong>
              </div>
              <div className="p-3.5 rounded-xl bg-[#F7F9F4] dark:bg-[#26372D]/30 border border-[#cadacb] dark:border-[#2B3A31]">
                <span className="text-[#567362] block text-[11px]">Industry Tie-Ups</span>
                <strong className="text-lg font-bold">{institution.stats.industryTieUps} Partners</strong>
              </div>
              <div className="p-3.5 rounded-xl bg-[#F7F9F4] dark:bg-[#26372D]/30 border border-[#cadacb] dark:border-[#2B3A31]">
                <span className="text-[#567362] block text-[11px]">Active Departments</span>
                <strong className="text-lg font-bold">{institution.stats.activeDepartments}</strong>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* INDUSTRY DEMO SHOWCASE VIEW (Section 9) */}
        {/* ------------------------------------------------------------- */}
        {selectedRole === "INDUSTRY" && (
          <div className="bg-white dark:bg-[#17221C] border border-[#cadacb] dark:border-[#2B3A31] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 text-[10px] font-bold font-mono">
                  {industry.cin}
                </span>
                <h2 className="text-2xl font-extrabold text-[#1B2A22] dark:text-[#E8F1EB] mt-1">{industry.companyName}</h2>
                <p className="text-xs text-[#567362] dark:text-[#A9B9AE]">{industry.domain} • {industry.location}</p>
              </div>
              <Link
                href="/industry/dashboard?demo=true"
                onClick={() => handleSelectRole("INDUSTRY")}
                className="px-4 py-2 rounded-xl bg-[#205c3b] hover:bg-[#1b432a] text-white text-xs font-bold shadow-xs transition-colors self-start sm:self-auto"
              >
                Open Industry Dashboard
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-[#F7F9F4] dark:bg-[#26372D]/30 border border-[#cadacb] dark:border-[#2B3A31]">
                <span className="text-[#567362] block text-[11px]">Active Job/Internship Postings</span>
                <strong className="text-lg font-bold">{industry.stats.activePostings}</strong>
              </div>
              <div className="p-3.5 rounded-xl bg-[#F7F9F4] dark:bg-[#26372D]/30 border border-[#cadacb] dark:border-[#2B3A31]">
                <span className="text-[#567362] block text-[11px]">Applicants Pool</span>
                <strong className="text-lg font-bold text-blue-700 dark:text-blue-400">{industry.stats.totalApplicantsPool}</strong>
              </div>
              <div className="p-3.5 rounded-xl bg-[#F7F9F4] dark:bg-[#26372D]/30 border border-[#cadacb] dark:border-[#2B3A31]">
                <span className="text-[#567362] block text-[11px]">Shortlisted Candidates</span>
                <strong className="text-lg font-bold text-emerald-700 dark:text-emerald-400">{industry.stats.shortlistedCandidates}</strong>
              </div>
              <div className="p-3.5 rounded-xl bg-[#F7F9F4] dark:bg-[#26372D]/30 border border-[#cadacb] dark:border-[#2B3A31]">
                <span className="text-[#567362] block text-[11px]">Interview Pipelines</span>
                <strong className="text-lg font-bold">{industry.stats.interviewPipelines} Active</strong>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* NGO DEMO SHOWCASE VIEW (Section 10) */}
        {/* ------------------------------------------------------------- */}
        {selectedRole === "NGO" && (
          <div className="bg-white dark:bg-[#17221C] border border-[#cadacb] dark:border-[#2B3A31] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 text-[10px] font-bold font-mono">
                  {ngo.registrationId}
                </span>
                <h2 className="text-2xl font-extrabold text-[#1B2A22] dark:text-[#E8F1EB] mt-1">{ngo.name}</h2>
                <p className="text-xs text-[#567362] dark:text-[#A9B9AE]">{ngo.focusArea} • {ngo.headquarters}</p>
              </div>
              <Link
                href="/ngo/dashboard?demo=true"
                onClick={() => handleSelectRole("NGO")}
                className="px-4 py-2 rounded-xl bg-[#205c3b] hover:bg-[#1b432a] text-white text-xs font-bold shadow-xs transition-colors self-start sm:self-auto"
              >
                Open NGO Dashboard
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-[#F7F9F4] dark:bg-[#26372D]/30 border border-[#cadacb] dark:border-[#2B3A31]">
                <span className="text-[#567362] block text-[11px]">Healthcare Camps Held</span>
                <strong className="text-lg font-bold">{ngo.stats.campsConducted}</strong>
              </div>
              <div className="p-3.5 rounded-xl bg-[#F7F9F4] dark:bg-[#26372D]/30 border border-[#cadacb] dark:border-[#2B3A31]">
                <span className="text-[#567362] block text-[11px]">Patients Served</span>
                <strong className="text-lg font-bold text-rose-700 dark:text-rose-400">{ngo.stats.patientsServed}+</strong>
              </div>
              <div className="p-3.5 rounded-xl bg-[#F7F9F4] dark:bg-[#26372D]/30 border border-[#cadacb] dark:border-[#2B3A31]">
                <span className="text-[#567362] block text-[11px]">Volunteer Doctors</span>
                <strong className="text-lg font-bold">{ngo.stats.volunteerDoctors}</strong>
              </div>
              <div className="p-3.5 rounded-xl bg-[#F7F9F4] dark:bg-[#26372D]/30 border border-[#cadacb] dark:border-[#2B3A31]">
                <span className="text-[#567362] block text-[11px]">Student Coordinators</span>
                <strong className="text-lg font-bold text-emerald-700 dark:text-emerald-400">{ngo.stats.studentCoordinators}</strong>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* ADMIN DEMO SHOWCASE VIEW (Section 11) */}
        {/* ------------------------------------------------------------- */}
        {selectedRole === "ADMIN" && (
          <div className="bg-white dark:bg-[#17221C] border border-[#cadacb] dark:border-[#2B3A31] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-[10px] font-bold font-mono">
                  CENTRAL GOVERNANCE PORTAL
                </span>
                <h2 className="text-2xl font-extrabold text-[#1B2A22] dark:text-[#E8F1EB] mt-1">{admin.platform}</h2>
                <p className="text-xs text-[#567362] dark:text-[#A9B9AE]">Platform System Administrator • System Uptime: {admin.stats.systemUptime}</p>
              </div>
              <Link
                href="/admin/dashboard?demo=true"
                onClick={() => handleSelectRole("ADMIN")}
                className="px-4 py-2 rounded-xl bg-[#205c3b] hover:bg-[#1b432a] text-white text-xs font-bold shadow-xs transition-colors self-start sm:self-auto"
              >
                Open Admin Dashboard
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-[#F7F9F4] dark:bg-[#26372D]/30 border border-[#cadacb] dark:border-[#2B3A31]">
                <span className="text-[#567362] block text-[11px]">Total Registered Users</span>
                <strong className="text-lg font-bold">{admin.stats.totalRegisteredUsers}</strong>
              </div>
              <div className="p-3.5 rounded-xl bg-[#F7F9F4] dark:bg-[#26372D]/30 border border-[#cadacb] dark:border-[#2B3A31]">
                <span className="text-[#567362] block text-[11px]">Pending Verifications</span>
                <strong className="text-lg font-bold text-amber-700 dark:text-amber-400">{admin.stats.pendingVerifications}</strong>
              </div>
              <div className="p-3.5 rounded-xl bg-[#F7F9F4] dark:bg-[#26372D]/30 border border-[#cadacb] dark:border-[#2B3A31]">
                <span className="text-[#567362] block text-[11px]">Verification Rate</span>
                <strong className="text-lg font-bold text-emerald-700 dark:text-emerald-400">{admin.stats.verifiedRatePercentage}%</strong>
              </div>
              <div className="p-3.5 rounded-xl bg-[#F7F9F4] dark:bg-[#26372D]/30 border border-[#cadacb] dark:border-[#2B3A31]">
                <span className="text-[#567362] block text-[11px]">Platform Health</span>
                <strong className="text-lg font-bold text-emerald-700 dark:text-emerald-400">Optimal (200 OK)</strong>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
