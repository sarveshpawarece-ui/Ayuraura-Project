"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import {
  Sparkles,
  Target,
  ArrowRight,
  Briefcase,
  Award,
  Layers,
  CheckCircle2,
  ShieldCheck,
  History,
  BookOpen,
  TrendingUp,
  FileText,
  User,
  Compass,
  Video,
  Radio,
  PlayCircle,
  Star,
  Users,
  ChevronRight,
  CheckSquare,
  Zap,
  AlertTriangle,
  Flame,
  Stethoscope,
  Activity,
  Clock,
  Bell,
  HeartHandshake,
  Download,
  Share2,
  HelpCircle
} from "lucide-react";
import { DEMO_STUDENT } from "@/lib/demoData";

export default function DemoDashboardPage() {
  const student = DEMO_STUDENT;

  return (
    <div className="min-h-screen bg-[#F7F9F4] dark:bg-[#0F1713] text-[#1B2A22] dark:text-[#E8F1EB] flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      {/* Global Demo Notice Banner */}
      <aside aria-label="Demo Banner" className="bg-gradient-to-r from-[#205c3b] via-[#2a734b] to-[#c98e32] text-white py-2.5 px-4 text-xs font-medium shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-mono uppercase tracking-wider font-bold">
              ⚡ Full Platform Demo Dashboard
            </span>
            <span>
              Every card on this dashboard is interactive and directly opens the live working AyurSetu feature.
            </span>
          </div>
          <Link
            href="/demo/profile"
            className="underline font-bold hover:text-amber-200 flex items-center gap-1"
          >
            View Full Demo Profile <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </aside>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* 1. Welcome Section & Identity Banner */}
        <div className="bg-white dark:bg-[#17221C] border border-[#cadacb] dark:border-[#2B3A31] rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold border border-emerald-300 dark:border-emerald-800">
                  AYURSETU DEMO SCHOLAR
                </span>
                <span className="text-xs text-[#567362] dark:text-[#A9B9AE] font-mono">
                  AYU-BAMS-2023-8824
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Namaste, {student.name}
              </h1>
              <p className="text-xs text-[#567362] dark:text-[#A9B9AE]">
                {student.education.degree} • {student.education.professionalYear} • {student.education.college}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <Link
                href="/demo/profile"
                className="px-4 py-2 rounded-xl bg-white dark:bg-[#26372D] border border-[#cadacb] dark:border-[#2B3A31] hover:bg-[#F7F9F4] text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <User className="w-3.5 h-3.5 text-[#205c3b] dark:text-[#6FAF8A]" /> Demo Profile
              </Link>
              <Link
                href="/student/ecosystem"
                className="px-4 py-2 rounded-xl bg-[#205c3b] hover:bg-[#1b432a] text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Compass className="w-3.5 h-3.5 text-amber-300" /> BAMS Ecosystem
              </Link>
            </div>
          </div>

          {/* 2. Profile Completion Bar */}
          <div className="pt-3 border-t border-[#cadacb]/60 dark:border-[#2B3A31] space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-[#567362] dark:text-[#A9B9AE] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Profile Completeness: <strong className="text-[#1B2A22] dark:text-[#E8F1EB]">92% Completed</strong>
              </span>
              <span className="text-[11px] font-mono font-bold text-emerald-700 dark:text-emerald-400">
                Verified Dossier
              </span>
            </div>
            <div className="w-full bg-[#cadacb]/40 dark:bg-[#2B3A31] h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 via-teal-500 to-[#c98e32] h-full rounded-full transition-all duration-500"
                style={{ width: "92%" }}
              />
            </div>
          </div>
        </div>

        {/* 16 DEMO DASHBOARD CARDS GRID (Section 4) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 3: Career Goal */}
          <Link
            href="/student/career"
            className="p-5 rounded-2xl bg-white dark:bg-[#17221C] border border-[#cadacb] dark:border-[#2B3A31] hover:border-[#205c3b] dark:hover:border-[#6FAF8A] shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#205c3b] dark:text-[#6FAF8A]">
                  Career Target
                </span>
                <Target className="w-4 h-4 text-[#205c3b] dark:text-[#6FAF8A]" />
              </div>
              <h3 className="font-bold text-sm text-[#1B2A22] dark:text-[#E8F1EB] line-clamp-2">
                {student.career.goal}
              </h3>
              <p className="text-[11px] text-[#567362] dark:text-[#A9B9AE] line-clamp-2">
                {student.career.shortDescription}
              </p>
            </div>
            <div className="pt-3 border-t border-[#cadacb]/50 flex justify-between items-center text-xs font-semibold text-[#205c3b] dark:text-[#6FAF8A] mt-3">
              <span>View Career Roadmap</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 4: Career Readiness */}
          <Link
            href="/student/readiness"
            className="p-5 rounded-2xl bg-white dark:bg-[#17221C] border border-[#cadacb] dark:border-[#2B3A31] hover:border-[#205c3b] dark:hover:border-[#6FAF8A] shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  Readiness Score
                </span>
                <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="text-3xl font-extrabold text-[#1B2A22] dark:text-[#E8F1EB]">
                {student.career.readinessScore}%
              </div>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold">
                {student.career.readinessClassification}
              </p>
              <div className="w-full bg-[#cadacb]/40 dark:bg-[#2B3A31] h-1.5 rounded-full overflow-hidden mt-1">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${student.career.readinessScore}%` }} />
              </div>
            </div>
            <div className="pt-3 border-t border-[#cadacb]/50 flex justify-between items-center text-xs font-semibold text-[#205c3b] dark:text-[#6FAF8A] mt-3">
              <span>Exam Readiness Matrix</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 5: Skill Progress */}
          <Link
            href="/student/skills"
            className="p-5 rounded-2xl bg-white dark:bg-[#17221C] border border-[#cadacb] dark:border-[#2B3A31] hover:border-[#205c3b] dark:hover:border-[#6FAF8A] shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#205c3b] dark:text-[#6FAF8A]">
                  Skill Competencies
                </span>
                <Award className="w-4 h-4 text-[#205c3b] dark:text-[#6FAF8A]" />
              </div>
              <div className="text-3xl font-extrabold text-[#1B2A22] dark:text-[#E8F1EB]">
                {student.skills.length} Active
              </div>
              <p className="text-[11px] text-[#567362] dark:text-[#A9B9AE]">
                Top: {student.skills[0].name} ({student.skills[0].proficiency})
              </p>
            </div>
            <div className="pt-3 border-t border-[#cadacb]/50 flex justify-between items-center text-xs font-semibold text-[#205c3b] dark:text-[#6FAF8A] mt-3">
              <span>View All Skills</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 6: Skill Gaps */}
          <Link
            href="/student/skill-gap"
            className="p-5 rounded-2xl bg-white dark:bg-[#17221C] border border-[#cadacb] dark:border-[#2B3A31] hover:border-amber-400 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                  Target Skill Gaps
                </span>
                <AlertTriangle className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-3xl font-extrabold text-[#1B2A22] dark:text-[#E8F1EB]">
                {student.skillGaps.length} Identified
              </div>
              <p className="text-[11px] text-[#567362] dark:text-[#A9B9AE] line-clamp-2">
                Critical: {student.skillGaps[0].skill}
              </p>
            </div>
            <div className="pt-3 border-t border-[#cadacb]/50 flex justify-between items-center text-xs font-semibold text-amber-700 dark:text-amber-400 mt-3">
              <span>Remediation Roadmap</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 7: Learning Progress */}
          <Link
            href="/learning-hub"
            className="p-5 rounded-2xl bg-white dark:bg-[#17221C] border border-[#cadacb] dark:border-[#2B3A31] hover:border-[#205c3b] dark:hover:border-[#6FAF8A] shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#205c3b] dark:text-[#6FAF8A]">
                  Learning Hub
                </span>
                <BookOpen className="w-4 h-4 text-[#205c3b] dark:text-[#6FAF8A]" />
              </div>
              <div className="text-3xl font-extrabold text-[#1B2A22] dark:text-[#E8F1EB]">
                4 Modules
              </div>
              <p className="text-[11px] text-[#567362] dark:text-[#A9B9AE]">
                Current: Phytochemistry & Chromatography
              </p>
            </div>
            <div className="pt-3 border-t border-[#cadacb]/50 flex justify-between items-center text-xs font-semibold text-[#205c3b] dark:text-[#6FAF8A] mt-3">
              <span>Open Learning Resources</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 8: Upcoming Sessions */}
          <Link
            href="/student/sessions"
            className="p-5 rounded-2xl bg-white dark:bg-[#17221C] border border-[#cadacb] dark:border-[#2B3A31] hover:border-[#205c3b] dark:hover:border-[#6FAF8A] shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">
                  Live Expert Sessions
                </span>
                <Video className="w-4 h-4 text-rose-500" />
              </div>
              <div className="text-3xl font-extrabold text-[#1B2A22] dark:text-[#E8F1EB]">
                2 Upcoming
              </div>
              <p className="text-[11px] text-[#567362] dark:text-[#A9B9AE] line-clamp-1">
                Next: {student.expertSessions[0].title}
              </p>
            </div>
            <div className="pt-3 border-t border-[#cadacb]/50 flex justify-between items-center text-xs font-semibold text-[#205c3b] dark:text-[#6FAF8A] mt-3">
              <span>View Session Schedule</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 9: Recommended Opportunities */}
          <Link
            href="/student/opportunities"
            className="p-5 rounded-2xl bg-white dark:bg-[#17221C] border border-[#cadacb] dark:border-[#2B3A31] hover:border-[#205c3b] dark:hover:border-[#6FAF8A] shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#205c3b] dark:text-[#6FAF8A]">
                  Opportunities
                </span>
                <Briefcase className="w-4 h-4 text-[#205c3b] dark:text-[#6FAF8A]" />
              </div>
              <div className="text-3xl font-extrabold text-[#1B2A22] dark:text-[#E8F1EB]">
                {student.opportunities.length} Matched
              </div>
              <p className="text-[11px] text-[#567362] dark:text-[#A9B9AE] line-clamp-1">
                96% Match: Himalaya Wellness Labs
              </p>
            </div>
            <div className="pt-3 border-t border-[#cadacb]/50 flex justify-between items-center text-xs font-semibold text-[#205c3b] dark:text-[#6FAF8A] mt-3">
              <span>Explore Internships</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 10: Recent Applications */}
          <Link
            href="/student/applications"
            className="p-5 rounded-2xl bg-white dark:bg-[#17221C] border border-[#cadacb] dark:border-[#2B3A31] hover:border-[#205c3b] dark:hover:border-[#6FAF8A] shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#205c3b] dark:text-[#6FAF8A]">
                  My Applications
                </span>
                <CheckCircle2 className="w-4 h-4 text-[#205c3b] dark:text-[#6FAF8A]" />
              </div>
              <div className="text-3xl font-extrabold text-[#1B2A22] dark:text-[#E8F1EB]">
                {student.applications.length} Tracked
              </div>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold">
                1 Selected • 1 Shortlisted
              </p>
            </div>
            <div className="pt-3 border-t border-[#cadacb]/50 flex justify-between items-center text-xs font-semibold text-[#205c3b] dark:text-[#6FAF8A] mt-3">
              <span>Application Tracker</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 11: Quiz Performance */}
          <Link
            href="/student/quiz"
            className="p-5 rounded-2xl bg-white dark:bg-[#17221C] border border-[#cadacb] dark:border-[#2B3A31] hover:border-[#205c3b] dark:hover:border-[#6FAF8A] shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#205c3b] dark:text-[#6FAF8A]">
                  Quiz Accuracy
                </span>
                <HelpCircle className="w-4 h-4 text-[#205c3b] dark:text-[#6FAF8A]" />
              </div>
              <div className="text-3xl font-extrabold text-[#1B2A22] dark:text-[#E8F1EB]">
                88.0%
              </div>
              <p className="text-[11px] text-[#567362] dark:text-[#A9B9AE]">
                5 Tests • 110 Questions Practiced
              </p>
            </div>
            <div className="pt-3 border-t border-[#cadacb]/50 flex justify-between items-center text-xs font-semibold text-[#205c3b] dark:text-[#6FAF8A] mt-3">
              <span>Take New Quiz</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 12: BAMS Study Progress */}
          <Link
            href="/student/syllabus"
            className="p-5 rounded-2xl bg-white dark:bg-[#17221C] border border-[#cadacb] dark:border-[#2B3A31] hover:border-[#205c3b] dark:hover:border-[#6FAF8A] shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#205c3b] dark:text-[#6FAF8A]">
                  BAMS Syllabus
                </span>
                <Layers className="w-4 h-4 text-[#205c3b] dark:text-[#6FAF8A]" />
              </div>
              <div className="text-3xl font-extrabold text-[#1B2A22] dark:text-[#E8F1EB]">
                86% Done
              </div>
              <p className="text-[11px] text-[#567362] dark:text-[#A9B9AE]">
                Year 1–3: 100% • Year 4: 76%
              </p>
            </div>
            <div className="pt-3 border-t border-[#cadacb]/50 flex justify-between items-center text-xs font-semibold text-[#205c3b] dark:text-[#6FAF8A] mt-3">
              <span>Syllabus Breakdown</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 13: Exam Readiness */}
          <Link
            href="/student/exam-prep"
            className="p-5 rounded-2xl bg-white dark:bg-[#17221C] border border-[#cadacb] dark:border-[#2B3A31] hover:border-amber-400 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                  AIAPGET Readiness
                </span>
                <Flame className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-3xl font-extrabold text-[#1B2A22] dark:text-[#E8F1EB]">
                382 / 400
              </div>
              <p className="text-[11px] text-[#567362] dark:text-[#A9B9AE]">
                Top 4% Projected Entrance Rank
              </p>
            </div>
            <div className="pt-3 border-t border-[#cadacb]/50 flex justify-between items-center text-xs font-semibold text-amber-700 dark:text-amber-400 mt-3">
              <span>Exam Prep Portal</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 14: Timetable Summary */}
          <Link
            href="/student/timetable"
            className="p-5 rounded-2xl bg-white dark:bg-[#17221C] border border-[#cadacb] dark:border-[#2B3A31] hover:border-[#205c3b] dark:hover:border-[#6FAF8A] shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#205c3b] dark:text-[#6FAF8A]">
                  Smart Schedule
                </span>
                <Clock className="w-4 h-4 text-[#205c3b] dark:text-[#6FAF8A]" />
              </div>
              <div className="text-3xl font-extrabold text-[#1B2A22] dark:text-[#E8F1EB]">
                Mon–Fri
              </div>
              <p className="text-[11px] text-[#567362] dark:text-[#A9B9AE]">
                Next: 08:30 AM IPD Ward Clinical Rounds
              </p>
            </div>
            <div className="pt-3 border-t border-[#cadacb]/50 flex justify-between items-center text-xs font-semibold text-[#205c3b] dark:text-[#6FAF8A] mt-3">
              <span>Daily Class & OPD Schedule</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 15: Notifications */}
          <Link
            href="/notifications"
            className="p-5 rounded-2xl bg-white dark:bg-[#17221C] border border-[#cadacb] dark:border-[#2B3A31] hover:border-[#205c3b] dark:hover:border-[#6FAF8A] shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#205c3b] dark:text-[#6FAF8A]">
                  Notifications
                </span>
                <Bell className="w-4 h-4 text-[#205c3b] dark:text-[#6FAF8A]" />
              </div>
              <div className="text-3xl font-extrabold text-[#1B2A22] dark:text-[#E8F1EB]">
                {student.notifications.filter(n => !n.read).length} New
              </div>
              <p className="text-[11px] text-[#567362] dark:text-[#A9B9AE] line-clamp-1">
                Latest: {student.notifications[0].title}
              </p>
            </div>
            <div className="pt-3 border-t border-[#cadacb]/50 flex justify-between items-center text-xs font-semibold text-[#205c3b] dark:text-[#6FAF8A] mt-3">
              <span>View All Alerts</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 16: Achievements & Certificates */}
          <Link
            href="/verify/certificate"
            className="p-5 rounded-2xl bg-white dark:bg-[#17221C] border border-[#cadacb] dark:border-[#2B3A31] hover:border-[#205c3b] dark:hover:border-[#6FAF8A] shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  Verified Badges
                </span>
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="text-3xl font-extrabold text-[#1B2A22] dark:text-[#E8F1EB]">
                {student.certificates.length} Verified
              </div>
              <p className="text-[11px] text-[#567362] dark:text-[#A9B9AE]">
                Includes: AyurSetu Phytochemistry Specialist
              </p>
            </div>
            <div className="pt-3 border-t border-[#cadacb]/50 flex justify-between items-center text-xs font-semibold text-[#205c3b] dark:text-[#6FAF8A] mt-3">
              <span>Verify Any Certificate</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
