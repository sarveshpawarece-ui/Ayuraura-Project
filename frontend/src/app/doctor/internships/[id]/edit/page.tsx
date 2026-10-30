"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import {
  Briefcase,
  Building2,
  Calendar,
  Clock,
  Users,
  MapPin,
  Award,
  Sparkles,
  Save,
  CheckCircle2,
  AlertCircle,
  Plus,
  X,
  ArrowRight
} from "lucide-react";
import { api } from "@/lib/api";

const SPECIALIZATIONS = [
  "General Ayurveda & Clinical Practice",
  "Panchakarma & Detoxification",
  "Kayachikitsa (Internal Medicine)",
  "Dravyaguna (Herbal Pharmacology)",
  "Rasa Shastra & Bhaishajya Kalpana",
  "Shalya Tantra (Surgical Protocols)",
  "Shalakya Tantra (ENT & Ophthalmology)",
  "Prasuti & Stri Roga (Gynaecology)",
  "Kaumarbhritya (Pediatrics)",
  "Swasthavritta & Yoga Therapy",
  "Agada Tantra (Toxicology)",
  "Clinical Diagnostics & Nadi Pariksha"
];

const INTERNSHIP_TYPES = [
  "Clinical Internship",
  "Research Internship",
  "Hospital Internship",
  "Ayurveda Practice",
  "Panchakarma",
  "Pharmacy",
  "Wellness",
  "Teaching",
  "Healthcare Camp",
  "Other"
];

const COURSES_OPTIONS = [
  "BAMS (Bachelor of Ayurvedic Medicine & Surgery)",
  "MD Ayurveda",
  "MS Ayurveda",
  "Diploma in Panchakarma Therapy",
  "Diploma in Ayurvedic Pharmacy",
  "B.Pharm (Ayurveda)"
];

const YEARS_OPTIONS = [
  "3rd Year BAMS",
  "4th Year / Final Year BAMS",
  "Intern / House Surgeon",
  "MD/MS Postgraduate Scholar",
  "Fresh Ayurveda Graduate"
];

export default function EditInternshipPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const internshipId = resolvedParams.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [specialization, setSpecialization] = useState(SPECIALIZATIONS[0]);
  const [internshipType, setInternshipType] = useState(INTERNSHIP_TYPES[0]);
  const [locationCity, setLocationCity] = useState("");
  const [locationState, setLocationState] = useState("");
  const [locationAddress, setLocationAddress] = useState("");
  const [mode, setMode] = useState("ON_SITE");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [durationMonths, setDurationMonths] = useState(6);
  const [durationText, setDurationText] = useState("");
  const [numberOfSeats, setNumberOfSeats] = useState(5);
  const [applicationDeadline, setApplicationDeadline] = useState("");
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [selectedYears, setSelectedYears] = useState<string[]>([]);
  const [minimumQualification, setMinimumQualification] = useState("");
  const [experienceRequired, setExperienceRequired] = useState("");
  const [skillsList, setSkillsList] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [benefitsList, setBenefitsList] = useState<string[]>([]);
  const [newBenefit, setNewBenefit] = useState("");
  const [responsibilities, setResponsibilities] = useState("");
  const [learningOutcomes, setLearningOutcomes] = useState("");
  const [requirements, setRequirements] = useState("");
  const [workingHours, setWorkingHours] = useState("");
  const [stipendInrMonth, setStipendInrMonth] = useState<number>(0);
  const [currentStatus, setCurrentStatus] = useState("PUBLISHED");

  useEffect(() => {
    const fetchInternship = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/internships/${internshipId}`);
        const data = res.data;
        setTitle(data.title || "");
        setDescription(data.description || "");
        setSpecialization(data.specialization || SPECIALIZATIONS[0]);
        setInternshipType(data.internship_type || INTERNSHIP_TYPES[0]);
        setLocationCity(data.location_city || "");
        setLocationState(data.location_state || "");
        setLocationAddress(data.location_address || "");
        setMode(data.mode || "ON_SITE");
        setStartDate(data.start_date ? data.start_date.split("T")[0] : "");
        setEndDate(data.end_date ? data.end_date.split("T")[0] : "");
        setDurationMonths(data.duration_months || 6);
        setDurationText(data.duration_text || "");
        setNumberOfSeats(data.number_of_seats || 5);
        setApplicationDeadline(data.deadline ? data.deadline.split("T")[0] : "");
        setSelectedCourses(data.eligible_courses || []);
        setSelectedYears(data.eligible_years || []);
        setMinimumQualification(data.minimum_qualification || "");
        setExperienceRequired(data.experience_required || "");
        setSkillsList(data.skills_required || []);
        setBenefitsList(data.benefits || []);
        setResponsibilities(data.responsibilities || "");
        setLearningOutcomes(data.learning_outcomes || "");
        setRequirements(data.requirements || "");
        setWorkingHours(data.working_hours || "");
        setStipendInrMonth(data.stipend_inr_month || 0);
        setCurrentStatus(data.status || "PUBLISHED");
      } catch (err: any) {
        console.error(err);
        setError(err.response?.data?.detail || "Failed to load internship details.");
      } finally {
        setLoading(false);
      }
    };
    if (internshipId) fetchInternship();
  }, [internshipId]);

  const handleToggleCourse = (c: string) => {
    setSelectedCourses(
      selectedCourses.includes(c) ? selectedCourses.filter((x) => x !== c) : [...selectedCourses, c]
    );
  };

  const handleToggleYear = (y: string) => {
    setSelectedYears(
      selectedYears.includes(y) ? selectedYears.filter((x) => x !== y) : [...selectedYears, y]
    );
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !skillsList.includes(newSkill.trim())) {
      setSkillsList([...skillsList, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const handleAddBenefit = () => {
    if (newBenefit.trim() && !benefitsList.includes(newBenefit.trim())) {
      setBenefitsList([...benefitsList, newBenefit.trim()]);
      setNewBenefit("");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const payload = {
        title,
        description,
        specialization,
        internship_type: internshipType,
        location_city: locationCity,
        location_state: locationState,
        location_address: locationAddress,
        mode,
        start_date: startDate || null,
        end_date: endDate || null,
        duration_months: Number(durationMonths),
        duration_text: durationText,
        number_of_seats: Number(numberOfSeats),
        application_deadline: applicationDeadline || null,
        eligible_courses: selectedCourses,
        eligible_years: selectedYears,
        minimum_qualification: minimumQualification,
        experience_required: experienceRequired,
        skills_required: skillsList,
        responsibilities,
        learning_outcomes: learningOutcomes,
        requirements,
        benefits: benefitsList,
        working_hours: workingHours,
        stipend_inr_month: Number(stipendInrMonth),
        status: currentStatus
      };

      await api.put(`/internships/${internshipId}`, payload);
      window.location.href = "/doctor/internships";
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || "Failed to update internship.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fcfaf4] dark:bg-[#07160e]">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-12 animate-pulse space-y-6">
          <div className="h-40 bg-[#143924]/10 rounded-3xl" />
          <div className="h-96 bg-[#143924]/5 rounded-3xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfaf4] dark:bg-[#07160e] text-[#1a3827] dark:text-[#d1e2d7]">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex items-center gap-2 text-xs text-[#5a7a67] dark:text-emerald-400">
          <Link href="/doctor/internships" className="hover:underline">Internships</Link>
          <span>/</span>
          <span className="font-bold text-[#143d26] dark:text-white">Edit Internship Posting</span>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0c2419] border border-[#e5edd9] dark:border-white/10 shadow-xs space-y-6">
          <h1 className="text-xl sm:text-2xl font-bold font-serif-heading text-[#143d26] dark:text-white">
            Edit Internship: {title}
          </h1>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#3b5947] dark:text-emerald-300 mb-1">
                Internship Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#cadacb] dark:border-white/15 bg-white dark:bg-[#07160e] text-xs sm:text-sm text-[#143d26] dark:text-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#3b5947] dark:text-emerald-300 mb-1">
                  Specialization *
                </label>
                <select
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#cadacb] dark:border-white/15 bg-white dark:bg-[#07160e] text-xs text-[#143d26] dark:text-white"
                >
                  {SPECIALIZATIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3b5947] dark:text-emerald-300 mb-1">
                  Status
                </label>
                <select
                  value={currentStatus}
                  onChange={(e) => setCurrentStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#cadacb] dark:border-white/15 bg-white dark:bg-[#07160e] text-xs text-[#143d26] dark:text-white"
                >
                  <option value="DRAFT">DRAFT</option>
                  <option value="PUBLISHED">PUBLISHED</option>
                  <option value="CLOSED">CLOSED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#3b5947] dark:text-emerald-300 mb-1">
                Description *
              </label>
              <textarea
                rows={4}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#cadacb] dark:border-white/15 bg-white dark:bg-[#07160e] text-xs sm:text-sm text-[#143d26] dark:text-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#3b5947] dark:text-emerald-300 mb-1">
                  Seats Available
                </label>
                <input
                  type="number"
                  min="1"
                  value={numberOfSeats}
                  onChange={(e) => setNumberOfSeats(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-[#cadacb] dark:border-white/15 bg-white dark:bg-[#07160e] text-xs text-[#143d26] dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3b5947] dark:text-emerald-300 mb-1">
                  Monthly Stipend (INR)
                </label>
                <input
                  type="number"
                  min="0"
                  value={stipendInrMonth}
                  onChange={(e) => setStipendInrMonth(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-[#cadacb] dark:border-white/15 bg-white dark:bg-[#07160e] text-xs text-[#143d26] dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3b5947] dark:text-emerald-300 mb-1">
                  Working Hours
                </label>
                <input
                  type="text"
                  value={workingHours}
                  onChange={(e) => setWorkingHours(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#cadacb] dark:border-white/15 bg-white dark:bg-[#07160e] text-xs text-[#143d26] dark:text-white"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-6 border-t border-[#edf3eb] dark:border-white/10">
            <Link
              href="/doctor/internships"
              className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 text-xs font-semibold"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-[#1a5b35] hover:bg-[#124226] text-amber-100 font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-60"
            >
              {saving ? "Saving Changes..." : "Save Changes"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
