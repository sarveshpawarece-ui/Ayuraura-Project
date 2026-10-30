"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import VerifiedDoctorBadge from "@/components/doctor/VerifiedDoctorBadge";
import {
  Stethoscope,
  Award,
  MapPin,
  Calendar,
  MessageSquare,
  Building2,
  Clock,
  Sparkles,
  ShieldCheck,
  Send,
  X,
  AlertCircle,
  CheckCircle2,
  Phone,
  Mail,
  UserCheck
} from "lucide-react";
import { api } from "@/lib/api";
import { formatFullName } from "@/lib/nameFormatter";

interface PublicDoctorProfile {
  id: string;
  user_id: string;
  name_prefix?: string;
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  full_name: string;
  qualification: string;
  specialization: string;
  years_of_experience: number;
  designation?: string;
  areas_of_expertise: string[];
  bio?: string;
  registration_number: string;
  state_medical_council: string;
  city?: string;
  state?: string;
  country?: string;
  clinic_address?: string;
  verification_status: string;
  verified_at?: string;
  clinics: Array<{
    id: string;
    name: string;
    organization_type: string;
    address: string;
    city: string;
    state: string;
    working_hours?: string;
    services_offered: string[];
  }>;
}

export default function PublicDoctorProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const doctorId = resolvedParams.id;

  const [doctor, setDoctor] = useState<PublicDoctorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [sessionPurpose, setSessionPurpose] = useState("Clinical Mentorship");
  const [sessionDate, setSessionDate] = useState("");
  const [sessionTime, setSessionTime] = useState("11:00 AM");
  const [sessionNotes, setSessionNotes] = useState("");
  const [messageContent, setMessageContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/doctors/${doctorId}`);
        setDoctor(res.data);
      } catch (err: any) {
        console.error(err);
        setError(err.response?.data?.detail || "Doctor profile not found.");
      } finally {
        setLoading(false);
      }
    };
    if (doctorId) fetchDoctor();
  }, [doctorId]);

  const handleRequestSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctor) return;
    setSubmitting(true);
    setActionSuccess(null);

    try {
      await api.post("/doctors/sessions/request", {
        doctor_user_id: doctor.user_id,
        purpose: sessionPurpose,
        session_type: "Clinical Mentorship",
        meeting_mode: "Online",
        scheduled_date: sessionDate || new Date().toISOString().split("T")[0],
        start_time: sessionTime,
        duration_minutes: 45,
        notes: sessionNotes
      });
      setActionSuccess("Mentorship session requested successfully! The doctor will review your request.");
      setShowSessionModal(false);
    } catch (err: any) {
      alert("Failed to request session: " + (err.response?.data?.detail || "Please log in as a student."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctor || !messageContent.trim()) return;
    setSubmitting(true);
    setActionSuccess(null);

    try {
      await api.post("/doctors/messages", {
        recipient_id: doctor.user_id,
        content: messageContent.trim()
      });
      const docFormattedName = formatFullName({
        prefix: doctor.name_prefix,
        firstName: doctor.first_name,
        middleName: doctor.middle_name,
        lastName: doctor.last_name,
        fallbackFullName: doctor.full_name,
      });
      setActionSuccess(`Message sent to ${docFormattedName}!`);
      setShowMessageModal(false);
      setMessageContent("");
    } catch (err: any) {
      alert("Failed to send message: " + (err.response?.data?.detail || "Please log in first."));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fcfaf4] dark:bg-[#07160e]">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-12 animate-pulse space-y-6">
          <div className="h-48 bg-[#143924]/10 rounded-3xl" />
          <div className="h-72 bg-[#143924]/5 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="min-h-screen bg-[#fcfaf4] dark:bg-[#07160e]">
        <Navbar />
        <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
          <AlertCircle className="w-12 h-12 mx-auto text-rose-600" />
          <h2 className="text-xl font-bold font-serif-heading">{error || "Doctor not found."}</h2>
          <Link
            href="/"
            className="inline-block px-4 py-2 rounded-xl bg-[#143d26] text-amber-100 text-xs font-semibold"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfaf4] dark:bg-[#07160e] text-[#1a3827] dark:text-[#d1e2d7]">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {actionSuccess && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* Profile Hero Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#0e301e] via-[#16432b] to-[#0a2316] text-[#f7f4ea] shadow-xl border border-emerald-800/40 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#123824] to-[#1f633c] text-amber-300 font-serif-heading font-bold text-3xl flex items-center justify-center shadow-md shrink-0 border border-emerald-700/50">
                {doctor.full_name?.charAt(0) || "D"}
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-bold font-serif-heading text-white">
                    {formatFullName({
                      prefix: doctor.name_prefix,
                      firstName: doctor.first_name,
                      middleName: doctor.middle_name,
                      lastName: doctor.last_name,
                      fallbackFullName: doctor.full_name,
                    })}
                  </h1>
                  <VerifiedDoctorBadge status={doctor.verification_status} size="sm" />
                </div>
                <p className="text-xs sm:text-sm text-emerald-200/90 font-medium">
                  {doctor.designation || "Ayurvedic Physician"} • {doctor.qualification}
                </p>
                <p className="text-xs text-emerald-300/70">
                  {doctor.specialization} • {doctor.years_of_experience} yrs clinical experience
                </p>
              </div>
            </div>

            <div className="flex flex-wrap sm:flex-col items-stretch gap-2 w-full sm:w-auto">
              <button
                onClick={() => {
                  setSessionDate(new Date().toISOString().split("T")[0]);
                  setShowSessionModal(true);
                }}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-[#0e301e] font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>Request Mentorship Session</span>
              </button>

              <button
                onClick={() => setShowMessageModal(true)}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs transition-all cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Send Direct Message</span>
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-emerald-800/60 flex flex-wrap items-center gap-6 text-xs text-emerald-200/80">
            <div className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-300" />
              <span>Reg: <strong className="text-white">{doctor.registration_number}</strong> ({doctor.state_medical_council})</span>
            </div>
            {doctor.city && (
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-amber-300" />
                <span>{doctor.city}, {doctor.state || "India"}</span>
              </div>
            )}
          </div>
        </div>

        {/* Bio & Clinical Overview */}
        {doctor.bio && (
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0c2419] border border-[#e5edd9] dark:border-white/10 shadow-xs space-y-2">
            <h2 className="text-sm font-bold font-serif-heading text-[#143d26] dark:text-white uppercase tracking-wider">
              About Dr. {doctor.full_name}
            </h2>
            <p className="text-xs sm:text-sm text-[#466955] dark:text-emerald-200/90 leading-relaxed whitespace-pre-line">
              {doctor.bio}
            </p>
          </div>
        )}

        {/* Areas of Expertise */}
        {doctor.areas_of_expertise?.length > 0 && (
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0c2419] border border-[#e5edd9] dark:border-white/10 shadow-xs space-y-3">
            <h2 className="text-sm font-bold font-serif-heading text-[#143d26] dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#1a5b35]" />
              <span>Areas of Clinical Expertise</span>
            </h2>
            <div className="flex flex-wrap gap-2">
              {doctor.areas_of_expertise.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full bg-[#eef7f0] dark:bg-emerald-950/60 text-[#1a5b35] dark:text-emerald-300 border border-[#c8dccb] dark:border-emerald-700/50 text-xs font-semibold"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Practice Clinics & Hospitals */}
        {doctor.clinics?.length > 0 && (
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0c2419] border border-[#e5edd9] dark:border-white/10 shadow-xs space-y-4">
            <h2 className="text-sm font-bold font-serif-heading text-[#143d26] dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#1a5b35]" />
              <span>Practice Clinics & Hospitals ({doctor.clinics.length})</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {doctor.clinics.map((clinic) => (
                <div
                  key={clinic.id}
                  className="p-4 rounded-2xl bg-[#f8faf6] dark:bg-white/5 border border-[#e2ece0] dark:border-white/10 space-y-2"
                >
                  <h3 className="text-sm font-bold text-[#143d26] dark:text-white">
                    {clinic.name}
                  </h3>
                  <p className="text-[11px] text-[#1a5b35] dark:text-emerald-400 font-semibold">
                    {clinic.organization_type.replace(/_/g, " ")}
                  </p>
                  <div className="text-xs text-[#527260] dark:text-emerald-300/80 space-y-1">
                    <p className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#1a5b35]" />
                      <span>{clinic.address}, {clinic.city}</span>
                    </p>
                    {clinic.working_hours && (
                      <p className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#1a5b35]" />
                        <span>{clinic.working_hours}</span>
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal: Request Mentorship Session */}
        {showSessionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <div className="w-full max-w-lg bg-white dark:bg-[#0c2419] rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#d8e6d9] dark:border-white/10 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#edf3eb] dark:border-white/10">
                <h3 className="text-base font-bold font-serif-heading text-[#143d26] dark:text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#1a5b35]" />
                  <span>Request Session with Dr. {doctor.full_name}</span>
                </h3>
                <button
                  onClick={() => setShowSessionModal(false)}
                  className="text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleRequestSession} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[#3b5947] dark:text-emerald-300 mb-1">
                    Purpose of Session *
                  </label>
                  <select
                    value={sessionPurpose}
                    onChange={(e) => setSessionPurpose(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#cadacb] dark:border-white/15 bg-white dark:bg-[#07160e] text-xs text-[#143d26] dark:text-white"
                  >
                    <option value="Clinical Mentorship">Clinical Mentorship</option>
                    <option value="Internship Discussion">Internship Discussion</option>
                    <option value="Case Study Review">Case Study & Pulse Diagnosis Review</option>
                    <option value="Career & Higher Studies (MD/MS)">Career & Higher Studies (MD/MS)</option>
                    <option value="Panchakarma Protocol Guidance">Panchakarma Protocol Guidance</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#3b5947] dark:text-emerald-300 mb-1">
                      Preferred Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={sessionDate}
                      onChange={(e) => setSessionDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#cadacb] dark:border-white/15 bg-white dark:bg-[#07160e] text-xs text-[#143d26] dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#3b5947] dark:text-emerald-300 mb-1">
                      Preferred Time *
                    </label>
                    <input
                      type="text"
                      required
                      value={sessionTime}
                      onChange={(e) => setSessionTime(e.target.value)}
                      placeholder="11:00 AM"
                      className="w-full px-3 py-2 rounded-xl border border-[#cadacb] dark:border-white/15 bg-white dark:bg-[#07160e] text-xs text-[#143d26] dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#3b5947] dark:text-emerald-300 mb-1">
                    Topics / Questions you want to discuss
                  </label>
                  <textarea
                    rows={3}
                    value={sessionNotes}
                    onChange={(e) => setSessionNotes(e.target.value)}
                    placeholder="Briefly describe what clinical cases, internship queries, or guidance you require..."
                    className="w-full px-3.5 py-2 rounded-xl border border-[#cadacb] dark:border-white/15 bg-white dark:bg-[#07160e] text-xs text-[#143d26] dark:text-white"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#edf3eb] dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowSessionModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2.5 rounded-xl bg-[#1a5b35] text-amber-100 text-xs font-bold hover:bg-[#124226] disabled:opacity-60"
                  >
                    {submitting ? "Submitting..." : "Send Request"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Send Direct Message */}
        {showMessageModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <div className="w-full max-w-md bg-white dark:bg-[#0c2419] rounded-3xl p-6 shadow-2xl border border-[#d8e6d9] dark:border-white/10 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#edf3eb] dark:border-white/10">
                <h3 className="text-base font-bold font-serif-heading text-[#143d26] dark:text-white flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[#1a5b35]" />
                  <span>Message Dr. {doctor.full_name}</span>
                </h3>
                <button
                  onClick={() => setShowMessageModal(false)}
                  className="text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSendMessage} className="space-y-3">
                <textarea
                  rows={4}
                  required
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  placeholder="Namaste Doctor, I am interested in your clinical internship / guidance..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#cadacb] dark:border-white/15 bg-white dark:bg-[#07160e] text-xs text-[#143d26] dark:text-white focus:outline-none focus:border-[#1a5b35]"
                />

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowMessageModal(false)}
                    className="px-3 py-1.5 rounded-xl border text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !messageContent.trim()}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1a5b35] hover:bg-[#124226] text-amber-100 font-bold text-xs disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{submitting ? "Sending..." : "Send Message"}</span>
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
