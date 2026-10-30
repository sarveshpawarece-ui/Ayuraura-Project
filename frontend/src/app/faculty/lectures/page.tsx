"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  Video,
  PlusCircle,
  ExternalLink,
  ChevronLeft,
  CheckCircle2,
  Trash2,
  MapPin,
  Megaphone,
  Filter
} from "lucide-react";
import { api } from "@/lib/api";
import {
  DashboardLayout,
  DashboardHeader,
  DashboardLoadingSkeleton
} from "@/components/dashboard";

export default function FacultyLecturesPage() {
  const [lectures, setLectures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<string>("ALL");
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    subject_id: "rachana_sharir",
    subject_name: "Rachana Sharir (Anatomy)",
    academic_year: "1st Year",
    topic: "",
    session_type: "LECTURE",
    scheduled_date: new Date().toISOString().split("T")[0],
    start_time: "10:00 AM",
    end_time: "11:30 AM",
    venue_or_link: "Ayurveda Lecture Hall 3B",
    session_link: "",
    recording_url: "",
    announcement: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const loadLectures = async () => {
    try {
      setLoading(true);
      const res = await api.get("/faculty/lectures");
      setLectures(res.data);
    } catch (e) {
      console.error("Error loading lectures:", e);
      // Demo fallback
      setLectures([
        {
          id: "lec-1",
          title: "Sharira Pramana & Marmas in Surgical Anatomy",
          subject_name: "Rachana Sharir (Anatomy)",
          academic_year: "1st Year",
          topic: "Sushruta Samhita Sharira Sthana Ch. 6",
          session_type: "LECTURE",
          scheduled_date: "2026-10-30",
          start_time: "10:00 AM",
          end_time: "11:30 AM",
          venue_or_link: "Ayurveda Lecture Hall 3B",
          session_link: "https://meet.google.com/ayur-lect-1",
          announcement: "Please bring your Sushruta Samhita Sharira Sthana handbook for recitation.",
          status: "SCHEDULED"
        },
        {
          id: "lec-2",
          title: "Clinical Srotas Diagnosis & Dushti Patterns",
          subject_name: "Kriya Sharir (Physiology)",
          academic_year: "1st Year",
          topic: "Dosha-Dhatu-Mala Vijnana Bedside Examination",
          session_type: "CLINICAL_POSTING",
          scheduled_date: "2026-10-31",
          start_time: "02:00 PM",
          end_time: "04:00 PM",
          venue_or_link: "IPD Ward 4 - Panchakarma Unit",
          status: "SCHEDULED"
        },
        {
          id: "lec-3",
          title: "Dravyaguna Field Identification & Rasa Pariksha",
          subject_name: "Dravyaguna Vijnana",
          academic_year: "2nd Year",
          topic: "Haritakyadi Varga Live Plants",
          session_type: "PRACTICAL",
          scheduled_date: "2026-10-28",
          start_time: "09:00 AM",
          end_time: "11:00 AM",
          venue_or_link: "Institutional Botanical Herb Garden",
          recording_url: "https://youtube.com/watch?v=demo-herbal",
          status: "COMPLETED"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLectures();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.post("/faculty/lectures", formData);
      setSuccessMsg("Lecture scheduled successfully!");
      setShowScheduleModal(false);
      setFormData({
        title: "",
        subject_id: "rachana_sharir",
        subject_name: "Rachana Sharir (Anatomy)",
        academic_year: "1st Year",
        topic: "",
        session_type: "LECTURE",
        scheduled_date: new Date().toISOString().split("T")[0],
        start_time: "10:00 AM",
        end_time: "11:30 AM",
        venue_or_link: "Ayurveda Lecture Hall 3B",
        session_link: "",
        recording_url: "",
        announcement: ""
      });
      loadLectures();
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (e: any) {
      alert(e.response?.data?.detail || "Failed to schedule lecture.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this lecture?")) return;
    try {
      await api.delete(`/faculty/lectures/${id}`);
      setLectures(prev => prev.filter(l => l.id !== id));
    } catch (e) {
      alert("Failed to delete lecture.");
    }
  };

  const filtered = lectures.filter(l => selectedYear === "ALL" || l.academic_year === selectedYear);

  return (
    <DashboardLayout>
      <div className="mb-4">
        <Link
          href="/faculty/dashboard"
          className="text-xs text-slate-400 hover:text-emerald-400 font-medium inline-flex items-center gap-1 transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" /> Back to Faculty Dashboard
        </Link>
      </div>

      <DashboardHeader
        badgeText="Timetable & Clinical Schedule"
        badgeIcon={<Calendar className="w-3.5 h-3.5" />}
        badgeVariant="emerald"
        title="Lecture Planner & Session Management"
        subtitle="Schedule upcoming classroom lectures, hospital ward clinical postings, practical demonstrations, and post announcements."
        actions={[
          {
            label: "Schedule New Session",
            onClick: () => setShowScheduleModal(true),
            icon: PlusCircle,
            variant: "primary",
          },
        ]}
      />

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs font-semibold flex items-center gap-2 mb-6">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" /> {successMsg}
        </div>
      )}

      {/* Filter */}
      <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 mb-6 flex items-center justify-between">
        <span className="text-xs text-slate-400 font-medium">Filter by Curriculum Year</span>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="px-3.5 py-1.5 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500"
        >
          <option value="ALL">All Academic Years</option>
          <option value="1st Year">1st Year BAMS</option>
          <option value="2nd Year">2nd Year BAMS</option>
          <option value="3rd Year">3rd Year BAMS</option>
          <option value="4th Year">4th Year BAMS</option>
        </select>
      </div>

      {loading ? (
        <DashboardLoadingSkeleton />
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/30 border border-slate-800">
          <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h4 className="text-base font-semibold text-slate-300">No scheduled sessions</h4>
          <p className="text-xs text-slate-500 mt-1">Schedule your next clinical demonstration or lecture.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((lec) => (
            <div
              key={lec.id}
              className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800/90 hover:border-emerald-500/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    {lec.session_type}
                  </span>
                  <span className="text-xs text-emerald-400 font-semibold">{lec.academic_year}</span>
                  <span className="text-xs text-slate-500">•</span>
                  <span className="text-xs text-slate-300 font-medium">{lec.subject_name}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    lec.status === "COMPLETED" ? "bg-slate-800 text-slate-400" : "bg-emerald-950 text-emerald-300 border border-emerald-500/30"
                  }`}>
                    {lec.status}
                  </span>
                </div>

                <h4 className="text-sm md:text-base font-bold text-slate-100">{lec.title}</h4>
                {lec.topic && <p className="text-xs text-slate-400 font-medium">Topic: {lec.topic}</p>}

                {lec.announcement && (
                  <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/20 text-xs text-amber-200/90 flex items-start gap-2">
                    <Megaphone className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>{lec.announcement}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col md:items-end gap-2.5 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-800">
                <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> {lec.scheduled_date} • {lec.start_time} - {lec.end_time}
                </div>
                <div className="text-xs text-slate-400 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" /> {lec.venue_or_link || "Ayurveda Lecture Hall"}
                </div>

                <div className="flex items-center gap-2 mt-1">
                  {lec.session_link && (
                    <a
                      href={lec.session_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs inline-flex items-center gap-1.5 transition-colors"
                    >
                      <Video className="w-3.5 h-3.5" /> Join Live
                    </a>
                  )}
                  {lec.recording_url && (
                    <a
                      href={lec.recording_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs inline-flex items-center gap-1.5 transition-colors"
                    >
                      <Video className="w-3.5 h-3.5" /> Recording
                    </a>
                  )}
                  <button
                    onClick={() => handleDelete(lec.id)}
                    className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
                    title="Delete Lecture"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-950 border border-emerald-500/30 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-400" /> Schedule Academic Session
              </h3>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Session Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ashtavidha Pariksha Clinical Demonstration"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Session Type *</label>
                  <select
                    value={formData.session_type}
                    onChange={(e) => setFormData({ ...formData, session_type: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="LECTURE">Theory Lecture</option>
                    <option value="CLINICAL_POSTING">Hospital Ward Clinical Posting</option>
                    <option value="PRACTICAL">Laboratory / Dissection Practical</option>
                    <option value="TUTORIAL">Tutorial & Shloka Recitation</option>
                    <option value="SEMINAR">Academic Seminar</option>
                    <option value="REVISION">Pre-Exam Revision</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Academic Year *</label>
                  <select
                    value={formData.academic_year}
                    onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="1st Year">1st Year BAMS</option>
                    <option value="2nd Year">2nd Year BAMS</option>
                    <option value="3rd Year">3rd Year BAMS</option>
                    <option value="4th Year">4th Year BAMS</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Subject Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.subject_name}
                    onChange={(e) => setFormData({ ...formData, subject_name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Specific Topic</label>
                  <input
                    type="text"
                    placeholder="e.g. Nadi & Jihva Pariksha Protocol"
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.scheduled_date}
                    onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Start Time *</label>
                  <input
                    type="text"
                    required
                    placeholder="10:00 AM"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">End Time *</label>
                  <input
                    type="text"
                    required
                    placeholder="11:30 AM"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Venue / Physical Location</label>
                <input
                  type="text"
                  placeholder="e.g. Ayurveda Lecture Hall 3B or IPD Ward 4"
                  value={formData.venue_or_link}
                  onChange={(e) => setFormData({ ...formData, venue_or_link: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Online Session Link (Optional)</label>
                <input
                  type="url"
                  placeholder="https://meet.google.com/..."
                  value={formData.session_link}
                  onChange={(e) => setFormData({ ...formData, session_link: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Faculty Announcement for Students</label>
                <textarea
                  rows={2}
                  placeholder="Important instructions, required textbooks, or pre-readings..."
                  value={formData.announcement}
                  onChange={(e) => setFormData({ ...formData, announcement: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors disabled:opacity-50"
                >
                  {submitting ? "Scheduling..." : "Schedule Session"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
