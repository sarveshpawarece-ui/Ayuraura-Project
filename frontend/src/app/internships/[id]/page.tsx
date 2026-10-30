"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import VerifiedDoctorBadge from "@/components/doctor/VerifiedDoctorBadge";
import {
  Briefcase,
  Building2,
  Calendar,
  Clock,
  Users,
  MapPin,
  Award,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronLeft,
  DollarSign,
  Send,
  X,
  Stethoscope,
  Heart,
  Share2
} from "lucide-react";
import { api } from "@/lib/api";

interface InternshipDetail {
  id: string;
  employer_user_id: string;
  doctor_id?: string;
  clinic_id?: string;
  doctor_name?: string;
  doctor_qualification?: string;
  doctor_verification_status?: string;
  clinic_name?: string;
  organization_name: string;
  organization_type: string;
  title: string;
  description: string;
  department: string;
  specialization: string;
  internship_type: string;
  duration_months: number;
  duration_text?: string;
  mode: string;
  location_city: string;
  location_state: string;
  location_address?: string;
  stipend_inr_month: number;
  capacity: number;
  number_of_seats: number;
  start_date?: string;
  end_date?: string;
  deadline: string;
  application_deadline?: string;
  eligible_courses: string[];
  eligible_years: string[];
  minimum_qualification?: string;
  experience_required?: string;
  requirements: string;
  skills_required: string[];
  responsibilities?: string;
  learning_outcomes?: string;
  benefits: string[];
  working_hours?: string;
  status: string;
  applications_count: number;
  has_applied: boolean;
  created_at: string;
}

export default function InternshipDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const internshipId = resolvedParams.id;

  const [internship, setInternship] = useState<InternshipDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Application Modal state
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverNote, setCoverNote] = useState("");
  const [applying, setApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/internships/${internshipId}`);
        setInternship(res.data);
      } catch (err: any) {
        console.error(err);
        setError(err.response?.data?.detail || "Internship opportunity not found.");
      } finally {
        setLoading(false);
      }
    };
    if (internshipId) fetchDetail();
  }, [internshipId]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!internship) return;
    setApplying(true);
    try {
      await api.post(`/internships/${internship.id}/apply`, {
        cover_note: coverNote
      });
      setApplySuccess(true);
      setShowApplyModal(false);
      setInternship({ ...internship, has_applied: true, applications_count: internship.applications_count + 1 });
    } catch (err: any) {
      alert("Application failed: " + (err.response?.data?.detail || "Please log in as a student to apply."));
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fcfaf4] dark:bg-[#07160e]">
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 py-12 animate-pulse space-y-6">
          <div className="h-56 bg-[#143924]/10 rounded-3xl" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 h-96 bg-[#143924]/5 rounded-3xl" />
            <div className="h-96 bg-[#143924]/5 rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !internship) {
    return (
      <div className="min-h-screen bg-[#fcfaf4] dark:bg-[#07160e]">
        <Navbar />
        <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
          <AlertCircle className="w-12 h-12 mx-auto text-rose-600" />
          <h2 className="text-xl font-bold font-serif-heading">{error || "Internship not found."}</h2>
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

  const isOpen = internship.status === "PUBLISHED" || internship.status === "OPEN";

  return (
    <div className="min-h-screen bg-[#fcfaf4] dark:bg-[#07160e] text-[#1a3827] dark:text-[#d1e2d7]">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Top Back Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/doctor/internships"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5a7a67] dark:text-emerald-400 hover:text-[#143d26]"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Opportunities</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (navigator.clipboard) {
                  navigator.clipboard.writeText(window.location.href);
                  alert("Internship link copied to clipboard!");
                }
              }}
              className="p-2 rounded-xl border border-[#cadacb] dark:border-white/10 text-xs font-semibold text-[#5a7a67] hover:bg-[#eef7f0] cursor-pointer"
              title="Share Internship"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {applySuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs sm:text-sm font-semibold flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Your application was submitted successfully! The doctor/organization will review your profile.</span>
          </div>
        )}

        {/* Hero Banner Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#0e301e] via-[#16432b] to-[#0a2316] text-[#f7f4ea] shadow-xl border border-emerald-800/40 space-y-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  {internship.internship_type}
                </span>
                <span className="text-xs text-emerald-300 font-semibold">
                  • {internship.specialization}
                </span>
                {internship.doctor_verification_status && (
                  <VerifiedDoctorBadge status={internship.doctor_verification_status} size="sm" />
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-serif-heading text-white">
                {internship.title}
              </h1>

              <p className="text-xs sm:text-sm text-emerald-200/90 font-medium">
                {internship.clinic_name || internship.organization_name} {internship.doctor_name ? `• Supervised by ${internship.doctor_name}` : ""}
              </p>
            </div>

            {/* Apply CTA Box */}
            <div className="flex flex-col items-stretch lg:items-end gap-2.5 shrink-0 w-full lg:w-auto">
              {internship.has_applied ? (
                <div className="px-6 py-3 rounded-2xl bg-emerald-700/80 border border-emerald-500 text-amber-200 font-bold text-xs flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-300" />
                  <span>Applied</span>
                </div>
              ) : isOpen ? (
                <button
                  onClick={() => setShowApplyModal(true)}
                  className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-[#0e301e] font-bold text-sm shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Apply for Internship</span>
                </button>
              ) : (
                <div className="px-6 py-3 rounded-2xl bg-slate-800 text-slate-400 font-semibold text-xs text-center">
                  Applications Closed ({internship.status})
                </div>
              )}

              <span className="text-[11px] text-emerald-300/80 text-center lg:text-right">
                Deadline: {internship.deadline} • {internship.applications_count} candidate(s) applied
              </span>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="pt-4 border-t border-emerald-800/60 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-emerald-200/90">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-300 shrink-0" />
              <div>
                <p className="text-[10px] text-emerald-400/80 uppercase">Location & Mode</p>
                <p className="font-semibold text-white">{internship.location_city}, {internship.location_state} ({internship.mode})</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-300 shrink-0" />
              <div>
                <p className="text-[10px] text-emerald-400/80 uppercase">Duration</p>
                <p className="font-semibold text-white">{internship.duration_text || `${internship.duration_months} Months`}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-300 shrink-0" />
              <div>
                <p className="text-[10px] text-emerald-400/80 uppercase">Open Seats</p>
                <p className="font-semibold text-white">{internship.number_of_seats} Seats Available</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-amber-300 shrink-0" />
              <div>
                <p className="text-[10px] text-emerald-400/80 uppercase">Monthly Stipend</p>
                <p className="font-semibold text-white">
                  {internship.stipend_inr_month > 0 ? `₹${internship.stipend_inr_month.toLocaleString("en-IN")}/mo` : "Experience Based"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 2-Column Body: Content & Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Main Content Pane */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Description */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#0c2419] border border-[#e5edd9] dark:border-white/10 shadow-xs space-y-3">
              <h2 className="text-base font-bold font-serif-heading text-[#143d26] dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-[#1a5b35]" />
                <span>Internship Overview</span>
              </h2>
              <p className="text-xs sm:text-sm text-[#466955] dark:text-emerald-200/90 leading-relaxed whitespace-pre-line">
                {internship.description}
              </p>
            </div>

            {/* Responsibilities */}
            {internship.responsibilities && (
              <div className="p-6 rounded-3xl bg-white dark:bg-[#0c2419] border border-[#e5edd9] dark:border-white/10 shadow-xs space-y-3">
                <h2 className="text-base font-bold font-serif-heading text-[#143d26] dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#1a5b35]" />
                  <span>Clinical Responsibilities & Daily Routine</span>
                </h2>
                <p className="text-xs sm:text-sm text-[#466955] dark:text-emerald-200/90 leading-relaxed whitespace-pre-line">
                  {internship.responsibilities}
                </p>
              </div>
            )}

            {/* Learning Outcomes */}
            {internship.learning_outcomes && (
              <div className="p-6 rounded-3xl bg-white dark:bg-[#0c2419] border border-[#e5edd9] dark:border-white/10 shadow-xs space-y-3">
                <h2 className="text-base font-bold font-serif-heading text-[#143d26] dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#1a5b35]" />
                  <span>Expected Learning Outcomes</span>
                </h2>
                <p className="text-xs sm:text-sm text-[#466955] dark:text-emerald-200/90 leading-relaxed whitespace-pre-line">
                  {internship.learning_outcomes}
                </p>
              </div>
            )}

            {/* Skills & Prerequisites */}
            {internship.skills_required?.length > 0 && (
              <div className="p-6 rounded-3xl bg-white dark:bg-[#0c2419] border border-[#e5edd9] dark:border-white/10 shadow-xs space-y-3">
                <h2 className="text-base font-bold font-serif-heading text-[#143d26] dark:text-white uppercase tracking-wider">
                  Required Clinical Competencies & Skills
                </h2>
                <div className="flex flex-wrap gap-2">
                  {internship.skills_required.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 rounded-full bg-[#eef7f0] dark:bg-emerald-950/60 text-[#1a5b35] dark:text-emerald-300 border border-[#c8dccb] dark:border-emerald-700/50 text-xs font-semibold"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Pane */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Eligibility Card */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#0c2419] border border-[#e5edd9] dark:border-white/10 shadow-xs space-y-4">
              <h3 className="text-base font-bold font-serif-heading text-[#143d26] dark:text-white">
                Eligibility Criteria
              </h3>

              <div className="space-y-3 text-xs divide-y divide-[#edf3eb] dark:divide-white/5">
                <div className="space-y-1">
                  <span className="text-[#718f7d] dark:text-emerald-400/60 uppercase font-semibold text-[10px]">
                    Eligible Degree Programs
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {internship.eligible_courses.map((c) => (
                      <span key={c} className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 font-medium text-[#143d26] dark:text-white">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 space-y-1">
                  <span className="text-[#718f7d] dark:text-emerald-400/60 uppercase font-semibold text-[10px]">
                    Eligible Cohorts
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {internship.eligible_years.map((y) => (
                      <span key={y} className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 font-medium text-[#143d26] dark:text-white">
                        {y}
                      </span>
                    ))}
                  </div>
                </div>

                {internship.working_hours && (
                  <div className="pt-2 flex justify-between">
                    <span className="text-[#718f7d]">Working Hours:</span>
                    <span className="font-semibold text-[#143d26] dark:text-white">{internship.working_hours}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Benefits Card */}
            {internship.benefits?.length > 0 && (
              <div className="p-6 rounded-3xl bg-white dark:bg-[#0c2419] border border-[#e5edd9] dark:border-white/10 shadow-xs space-y-3">
                <h3 className="text-base font-bold font-serif-heading text-[#143d26] dark:text-white">
                  Benefits & Perks
                </h3>
                <ul className="space-y-2 text-xs text-[#3b5947] dark:text-emerald-200">
                  {internship.benefits.map((b) => (
                    <li key={b} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Doctor Profile Card */}
            {internship.doctor_id && (
              <div className="p-6 rounded-3xl bg-gradient-to-br from-[#123824] to-[#1d5c39] text-amber-100 shadow-md space-y-3">
                <div className="flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-amber-300" />
                  <h4 className="font-serif-heading font-bold text-sm text-white">Mentoring Physician</h4>
                </div>
                <p className="text-xs text-emerald-100/90">
                  {internship.doctor_name || "Certified Ayurvedic Doctor"}
                </p>
                <Link
                  href={`/doctor/${internship.doctor_id}`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-300 hover:text-amber-200"
                >
                  <span>View Full Doctor Profile</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}

          </div>

        </div>

        {/* Modal: Apply for Internship */}
        {showApplyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <div className="w-full max-w-lg bg-white dark:bg-[#0c2419] rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#d8e6d9] dark:border-white/10 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#edf3eb] dark:border-white/10">
                <h3 className="text-base font-bold font-serif-heading text-[#143d26] dark:text-white flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-[#1a5b35]" />
                  <span>Apply for {internship.title}</span>
                </h3>
                <button
                  onClick={() => setShowApplyModal(false)}
                  className="text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleApply} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[#3b5947] dark:text-emerald-300 mb-1">
                    Cover Note / Why are you interested in this clinical rotation?
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={coverNote}
                    onChange={(e) => setCoverNote(e.target.value)}
                    placeholder="Describe your relevant academic coursework, clinical interests, Panchakarma background, or aspirations..."
                    className="w-full px-3.5 py-2 rounded-xl border border-[#cadacb] dark:border-white/15 bg-white dark:bg-[#07160e] text-xs text-[#143d26] dark:text-white focus:outline-none focus:border-[#1a5b35]"
                  />
                </div>

                <div className="p-3 rounded-xl bg-[#eef7f0] dark:bg-white/5 border border-emerald-200 text-xs text-[#1a5b35] dark:text-emerald-300">
                  ✓ Your verified student profile, academic scores, and skill certificates will be submitted to Dr. {internship.doctor_name || "Supervisor"}.
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#edf3eb] dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowApplyModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={applying || !coverNote.trim()}
                    className="px-5 py-2.5 rounded-xl bg-[#1a5b35] text-amber-100 text-xs font-bold hover:bg-[#124226] disabled:opacity-60"
                  >
                    {applying ? "Submitting Application..." : "Submit Application"}
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
