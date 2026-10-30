"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  GraduationCap,
  BookOpen,
  Calendar,
  Sparkles,
  Users,
  Clock,
  ShieldCheck,
  PlusCircle,
  FileText,
  Video,
  ArrowRight,
  ChevronRight,
  ExternalLink,
  Award,
  Layers,
  CheckCircle2,
  AlertCircle,
  TrendingUp
} from "lucide-react";
import { api } from "@/lib/api";
import {
  DashboardLayout,
  DashboardHeader,
  DashboardStatsCard,
  DashboardSection,
  DashboardCard,
  DashboardLoadingSkeleton,
  DashboardErrorState
} from "@/components/dashboard";
import FacultyAssistant from "@/components/ai/FacultyAssistant";

export default function FacultyDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAiModal, setShowAiModal] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/faculty/dashboard");
      setData(res.data);
    } catch (e: any) {
      console.error("Error loading faculty dashboard:", e);
      // Demo fallback data
      setData({
        faculty_profile: {
          full_name: "Prof. Dr. Vaidya Suresh Sharma",
          name_prefix: "Prof.",
          department: "Department of Samhita & Siddhanta",
          designation: "Associate Professor & Senior Vaidya",
          institution_name: "National Institute of Ayurveda (Deemed University)",
          qualifications: "MD (Ayurveda - Kayachikitsa), BAMS, Ph.D.",
          specialization: "Brihat-trayi Treatises, Panchakarma & Clinical Roganidana",
          assigned_subjects: [
            { id: "rachana_sharir", name: "Rachana Sharir (Anatomy)", academic_year: "1st Year" },
            { id: "kriya_sharir", name: "Kriya Sharir (Physiology)", academic_year: "1st Year" },
            { id: "dravyaguna", name: "Dravyaguna Vijnana", academic_year: "2nd Year" }
          ],
          assigned_academic_years: ["1st Year", "2nd Year"]
        },
        institution: {
          name: "National Institute of Ayurveda, Jaipur",
          aishe_code: "AISHE-U-0128",
          verification_status: "VERIFIED"
        },
        metrics: {
          assigned_subjects_count: 3,
          total_resources_count: 14,
          upcoming_lectures_count: 4,
          students_count: 180
        },
        assigned_subjects: [
          { id: "rachana_sharir", name: "Rachana Sharir (Anatomy)", academic_year: "1st Year" },
          { id: "kriya_sharir", name: "Kriya Sharir (Physiology)", academic_year: "1st Year" },
          { id: "dravyaguna", name: "Dravyaguna Vijnana", academic_year: "2nd Year" }
        ],
        upcoming_lectures: [
          {
            id: "lec-1",
            title: "Sharira Pramana & Marmas in Surgical Anatomy",
            subject_name: "Rachana Sharir",
            academic_year: "1st Year",
            topic: "Sushruta Samhita Sharira Sthana Ch. 6",
            session_type: "LECTURE",
            scheduled_date: "Tomorrow, 10:00 AM",
            start_time: "10:00 AM",
            end_time: "11:30 AM",
            venue_or_link: "Ayurveda Lecture Hall 3B",
            status: "SCHEDULED"
          },
          {
            id: "lec-2",
            title: "Clinical Srotas Diagnosis & Dushti Patterns",
            subject_name: "Kriya Sharir",
            academic_year: "1st Year",
            topic: "Dosha-Dhatu-Mala Vijnana",
            session_type: "CLINICAL_POSTING",
            scheduled_date: "Friday, 02:00 PM",
            start_time: "02:00 PM",
            end_time: "04:00 PM",
            venue_or_link: "OPD 4 - Panchakarma Ward",
            status: "SCHEDULED"
          }
        ],
        recent_resources: [
          {
            id: "res-1",
            title: "Comprehensive Marma Points & Clinical Significance Compendium",
            subject_name: "Rachana Sharir",
            resource_type: "NOTES",
            academic_year: "1st Year",
            is_ai_generated: true,
            created_at: "2026-10-27"
          },
          {
            id: "res-2",
            title: "Dravyaguna 50 Classical Herbs Identification Guide & Posology",
            subject_name: "Dravyaguna Vijnana",
            resource_type: "STUDY_MATERIAL",
            academic_year: "2nd Year",
            is_ai_generated: false,
            created_at: "2026-10-25"
          },
          {
            id: "res-3",
            title: "Model University Question Paper: Samhita Exam 2026",
            subject_name: "Kriya Sharir",
            resource_type: "PRACTICE_QUESTIONS",
            academic_year: "1st Year",
            is_ai_generated: true,
            created_at: "2026-10-22"
          }
        ],
        announcements: [
          {
            id: "ann-1",
            title: "NCISM Curriculum Assessment & Evaluation Norms Circulated",
            date: "2026-10-26",
            department: "Dean's Office"
          }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) return <DashboardLoadingSkeleton />;
  if (error && !data) return <DashboardErrorState error={error} onRetry={loadData} title="Faculty Dashboard Unavailable" />;

  const prof = data?.faculty_profile;
  const inst = data?.institution;
  const metrics = data?.metrics || {
    assigned_subjects_count: 0,
    total_resources_count: 0,
    upcoming_lectures_count: 0,
    students_count: 0
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <DashboardHeader
        badgeText="Faculty & Academic Portal"
        badgeIcon={<GraduationCap className="w-3.5 h-3.5" />}
        badgeVariant="emerald"
        title={prof?.full_name || "Faculty Member Dashboard"}
        subtitle={`${prof?.designation || "Faculty"} • ${prof?.department || "Department of Ayurveda"} • ${inst?.name || "Ayurvedic Institution"}`}
        statusBadge={
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">
            <ShieldCheck className="w-3.5 h-3.5" /> AUTHORIZED FACULTY
          </span>
        }
        actions={[
          {
            label: "Cohort Analytics",
            href: "/faculty/analytics",
            icon: TrendingUp,
            variant: "primary",
          },
          {
            label: "AI Faculty Assistant",
            onClick: () => setShowAiModal(true),
            icon: Sparkles,
            variant: "primary",
          },
          {
            label: "Schedule Lecture",
            href: "/faculty/lectures",
            icon: Calendar,
            variant: "secondary",
          },
        ]}
      />

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <DashboardStatsCard
          title="Assigned Subjects"
          value={metrics.assigned_subjects_count}
          subtitle="Active curriculum courses"
          icon={BookOpen}
          colorVariant="emerald"
          href="/faculty/materials"
        />
        <DashboardStatsCard
          title="Teaching Materials"
          value={metrics.total_resources_count}
          subtitle="Shared notes & question banks"
          icon={FileText}
          colorVariant="amber"
          href="/faculty/materials"
        />
        <DashboardStatsCard
          title="Upcoming Lectures"
          value={metrics.upcoming_lectures_count}
          subtitle="Scheduled sessions"
          icon={Calendar}
          colorVariant="blue"
          href="/faculty/lectures"
        />
        <DashboardStatsCard
          title="Scholars Reached"
          value={metrics.students_count}
          subtitle="Enrolled BAMS students"
          icon={Users}
          colorVariant="purple"
          href="/faculty/students"
        />
      </div>

      {/* COHORT EDUCATIONAL ANALYTICS BANNER */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-[#13231B] dark:to-[#172B21] border border-emerald-200 dark:border-emerald-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#2F6B4F] text-white shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <h3 className="text-sm font-bold text-[#142019] dark:text-[#FFFFFF] flex items-center gap-2">
              <span>Cohort Assessment Analytics & Topic-Level Trends</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                Institutional
              </span>
            </h3>
            <p className="text-xs text-[#526158] dark:text-[#A7B9AF]">
              Review pass rates, cohort challenging topics, and evidence-based lecture recommendations across your assigned BAMS subjects.
            </p>
          </div>
        </div>
        <Link
          href="/faculty/analytics"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2F6B4F] hover:bg-[#255740] dark:bg-[#78B895] dark:hover:bg-[#68A785] text-white dark:text-[#0D1511] font-semibold text-xs transition-colors shrink-0 shadow-xs"
        >
          <span>Open Cohort Insights</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Main Grid: Teaching Tools & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Assigned Subjects Overview */}
          <DashboardCard title="Assigned Subjects & Curriculum" icon={BookOpen}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {(prof?.assigned_subjects || []).map((subj: any, idx: number) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-900/40 border border-slate-700/50 hover:border-emerald-500/40 transition-all flex flex-col justify-between"
                >
                  <div>
                    <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2">
                      {subj.academic_year || "1st Year"}
                    </span>
                    <h4 className="font-semibold text-slate-100 text-sm">{subj.name}</h4>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                    <span>Syllabus Aligned</span>
                    <Link
                      href={`/faculty/materials?subject=${subj.id}`}
                      className="text-emerald-400 hover:text-emerald-300 font-medium inline-flex items-center gap-1"
                    >
                      Materials <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </DashboardCard>

          {/* Upcoming Lecture Sessions */}
          <DashboardCard
            title="Upcoming Lectures & Clinical Postings"
            icon={Calendar}
            headerAction={
              <Link
                href="/faculty/lectures"
                className="text-xs text-emerald-400 hover:text-emerald-300 font-medium inline-flex items-center gap-1"
              >
                View Planner <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            }
          >
            {(!data?.upcoming_lectures || data.upcoming_lectures.length === 0) ? (
              <p className="text-sm text-slate-400 py-6 text-center">No lectures currently scheduled. Click Schedule Lecture to plan your next session.</p>
            ) : (
              <div className="space-y-3">
                {data.upcoming_lectures.map((lec: any) => (
                  <div
                    key={lec.id}
                    className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 hover:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          {lec.session_type}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">
                          {lec.subject_name} • {lec.academic_year}
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-slate-100">{lec.title}</h4>
                      {lec.topic && <p className="text-xs text-slate-400">Topic: {lec.topic}</p>}
                    </div>

                    <div className="text-left sm:text-right shrink-0">
                      <div className="text-xs font-semibold text-emerald-400 flex items-center sm:justify-end gap-1.5">
                        <Clock className="w-3.5 h-3.5" /> {lec.scheduled_date || `${lec.start_time} - ${lec.end_time}`}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">{lec.venue_or_link || "Ayurveda Lecture Hall"}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </DashboardCard>

          {/* Recently Shared Educational Materials */}
          <DashboardCard
            title="Recent Shared Teaching Materials"
            icon={FileText}
            headerAction={
              <Link
                href="/faculty/materials"
                className="text-xs text-emerald-400 hover:text-emerald-300 font-medium inline-flex items-center gap-1"
              >
                All Materials <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            }
          >
            {(!data?.recent_resources || data.recent_resources.length === 0) ? (
              <p className="text-sm text-slate-400 py-6 text-center">No educational materials uploaded yet.</p>
            ) : (
              <div className="space-y-2.5">
                {data.recent_resources.map((res: any) => (
                  <div
                    key={res.id}
                    className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/80 hover:border-slate-700/80 flex items-center justify-between gap-3 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                        {res.resource_type === "LECTURE_RECORDING" ? (
                          <Video className="w-4 h-4" />
                        ) : res.resource_type === "PRACTICE_QUESTIONS" ? (
                          <Award className="w-4 h-4" />
                        ) : (
                          <FileText className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <h5 className="text-xs sm:text-sm font-semibold text-slate-100">{res.title}</h5>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                          <span>{res.subject_name}</span>
                          <span>•</span>
                          <span className="text-emerald-400">{res.academic_year}</span>
                          {res.is_ai_generated && (
                            <>
                              <span>•</span>
                              <span className="inline-flex items-center gap-0.5 text-amber-300 font-medium">
                                <Sparkles className="w-2.5 h-2.5" /> AI Assisted
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 shrink-0">
                      {res.resource_type.replace("_", " ")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </DashboardCard>
        </div>

        {/* Right Column (1 Col) */}
        <div className="space-y-6">
          {/* AI Faculty Assistant Promo Card */}
          <div className="relative overflow-hidden p-6 rounded-2xl bg-gradient-to-br from-emerald-950/80 via-teal-950/60 to-slate-900/90 border border-emerald-500/30 shadow-xl">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Sparkles className="w-32 h-32 text-emerald-400" />
            </div>
            <div className="relative z-10 space-y-3">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <Sparkles className="w-3 h-3" /> NCISM PEDAGOGY AI
              </span>
              <h3 className="text-lg font-bold text-white">AI Faculty Assistant</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Generate university exam question papers, 45-minute lesson outlines, clinical case scenarios, and active revision activities instantly.
              </p>
              <button
                onClick={() => setShowAiModal(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/40 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" /> Open AI Faculty Studio
              </button>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <DashboardCard title="Teaching Shortcuts" icon={Layers}>
            <div className="space-y-2">
              <Link
                href="/faculty/materials"
                className="p-3 rounded-xl bg-slate-900/50 hover:bg-slate-800/60 border border-slate-800 hover:border-slate-700 flex items-center justify-between text-xs font-semibold text-slate-200 transition-colors"
              >
                <span className="flex items-center gap-2.5">
                  <PlusCircle className="w-4 h-4 text-emerald-400" /> Share Learning Material
                </span>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </Link>
              <Link
                href="/faculty/lectures"
                className="p-3 rounded-xl bg-slate-900/50 hover:bg-slate-800/60 border border-slate-800 hover:border-slate-700 flex items-center justify-between text-xs font-semibold text-slate-200 transition-colors"
              >
                <span className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-blue-400" /> Schedule Class / Clinic
                </span>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </Link>
              <Link
                href="/faculty/students"
                className="p-3 rounded-xl bg-slate-900/50 hover:bg-slate-800/60 border border-slate-800 hover:border-slate-700 flex items-center justify-between text-xs font-semibold text-slate-200 transition-colors"
              >
                <span className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-purple-400" /> View Class Scholars Roster
                </span>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </Link>
              <Link
                href="/learning-hub"
                className="p-3 rounded-xl bg-slate-900/50 hover:bg-slate-800/60 border border-slate-800 hover:border-slate-700 flex items-center justify-between text-xs font-semibold text-slate-200 transition-colors"
              >
                <span className="flex items-center gap-2.5">
                  <BookOpen className="w-4 h-4 text-amber-400" /> Classical Samhita Treatises
                </span>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </Link>
            </div>
          </DashboardCard>

          {/* Academic Announcements */}
          <DashboardCard title="Institutional Announcements" icon={AlertCircle}>
            <div className="space-y-3">
              {(data?.announcements || []).map((ann: any) => (
                <div key={ann.id} className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>{ann.department}</span>
                    <span className="text-slate-500">{ann.date}</span>
                  </div>
                  <h5 className="text-xs font-medium text-slate-200">{ann.title}</h5>
                </div>
              ))}
            </div>
          </DashboardCard>
        </div>
      </div>

      {/* AI Assistant Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-950 border border-emerald-500/30 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">AI Faculty Assistant & Question Generator</h3>
                  <p className="text-xs text-slate-400">Syllabus-grounded pedagogical tools for BAMS professors</p>
                </div>
              </div>
              <button
                onClick={() => setShowAiModal(false)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Close
              </button>
            </div>
            <FacultyAssistant />
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
