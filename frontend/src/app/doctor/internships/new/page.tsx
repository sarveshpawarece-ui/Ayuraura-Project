"use client";

import { useEffect, useState } from "react";
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
  ArrowRight,
  BookOpen
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

interface ClinicOption {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
}

export default function CreateInternshipPage() {
  const [clinics, setClinics] = useState<ClinicOption[]>([]);
  const [selectedClinicId, setSelectedClinicId] = useState("");
  
  // Basic Info
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [specialization, setSpecialization] = useState(SPECIALIZATIONS[0]);
  const [internshipType, setInternshipType] = useState(INTERNSHIP_TYPES[0]);
  const [organizationName, setOrganizationName] = useState("");
  
  // Location & Mode
  const [locationCity, setLocationCity] = useState("Pune");
  const [locationState, setLocationState] = useState("Maharashtra");
  const [locationAddress, setLocationAddress] = useState("");
  const [mode, setMode] = useState("ON_SITE");
  
  // Dates & Capacity
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [durationMonths, setDurationMonths] = useState(6);
  const [durationText, setDurationText] = useState("6 Months Full-Time");
  const [numberOfSeats, setNumberOfSeats] = useState(4);
  const [applicationDeadline, setApplicationDeadline] = useState("");
  
  // Eligibility
  const [selectedCourses, setSelectedCourses] = useState<string[]>([COURSES_OPTIONS[0]]);
  const [selectedYears, setSelectedYears] = useState<string[]>([YEARS_OPTIONS[1], YEARS_OPTIONS[2]]);
  const [minimumQualification, setMinimumQualification] = useState("BAMS Ongoing / Completed");
  const [experienceRequired, setExperienceRequired] = useState("None / Open to Fresher Interns");
  
  // Skills & Benefits tags
  const [skillsList, setSkillsList] = useState<string[]>(["Nadi Pariksha", "Snehan & Swedan", "Case History Taking"]);
  const [newSkill, setNewSkill] = useState("");
  const [benefitsList, setBenefitsList] = useState<string[]>([
    "Official NCISM Clinical Experience Certificate",
    "Direct Patient OPD Observation & Mentorship",
    "Letter of Recommendation for Exceptional Performers"
  ]);
  const [newBenefit, setNewBenefit] = useState("");

  // Scope
  const [responsibilities, setResponsibilities] = useState("");
  const [learningOutcomes, setLearningOutcomes] = useState("");
  const [requirements, setRequirements] = useState("");
  const [workingHours, setWorkingHours] = useState("09:00 AM - 05:00 PM (Mon-Sat)");
  const [stipendInrMonth, setStipendInrMonth] = useState<number>(8000);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClinics = async () => {
      try {
        const res = await api.get("/doctors/clinics/me");
        setClinics(res.data);
        if (res.data.length > 0) {
          setSelectedClinicId(res.data[0].id);
          setLocationCity(res.data[0].city);
          setLocationState(res.data[0].state);
          setLocationAddress(res.data[0].address);
          setOrganizationName(res.data[0].name);
        }
      } catch (err) {
        console.error("No clinics found:", err);
      }
    };
    fetchClinics();

    // Default dates
    const today = new Date();
    const start = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);
    const end = new Date(start.getTime() + 180 * 24 * 60 * 60 * 1000);
    const deadline = new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000);

    setStartDate(start.toISOString().split("T")[0]);
    setEndDate(end.toISOString().split("T")[0]);
    setApplicationDeadline(deadline.toISOString().split("T")[0]);
  }, []);

  const handleClinicChange = (clinicId: string) => {
    setSelectedClinicId(clinicId);
    const found = clinics.find((c) => c.id === clinicId);
    if (found) {
      setLocationCity(found.city);
      setLocationState(found.state);
      setLocationAddress(found.address);
      setOrganizationName(found.name);
    }
  };

  const handleToggleCourse = (c: string) => {
    if (selectedCourses.includes(c)) {
      setSelectedCourses(selectedCourses.filter((x) => x !== c));
    } else {
      setSelectedCourses([...selectedCourses, c]);
    }
  };

  const handleToggleYear = (y: string) => {
    if (selectedYears.includes(y)) {
      setSelectedYears(selectedYears.filter((x) => x !== y));
    } else {
      setSelectedYears([...selectedYears, y]);
    }
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

  const handleSubmit = async (targetStatus: "DRAFT" | "PUBLISHED") => {
    if (!title.trim() || !description.trim()) {
      setError("Please provide an internship title and detailed description.");
      return;
    }

    if (startDate && endDate && endDate < startDate) {
      setError("End date cannot be earlier than start date.");
      return;
    }

    if (applicationDeadline && startDate && applicationDeadline > startDate) {
      setError("Application deadline cannot be after start date.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const payload = {
        title,
        description,
        specialization,
        internship_type: internshipType,
        clinic_id: selectedClinicId ? selectedClinicId : undefined,
        organization_name: organizationName || undefined,
        location_city: locationCity,
        location_state: locationState,
        location_address: locationAddress,
        mode,
        start_date: startDate,
        end_date: endDate,
        duration_months: Number(durationMonths),
        duration_text: durationText,
        number_of_seats: Number(numberOfSeats),
        application_deadline: applicationDeadline,
        eligible_courses: selectedCourses,
        eligible_years: selectedYears,
        minimum_qualification: minimumQualification,
        experience_required: experienceRequired,
        skills_required: skillsList,
        responsibilities: responsibilities || "Participate in clinical OPD rounds and Panchakarma administration.",
        learning_outcomes: learningOutcomes || "Comprehensive practical training in classical Ayurvedic treatments.",
        requirements: requirements || `Must be pursuing ${selectedCourses.join(", ")}.`,
        benefits: benefitsList,
        working_hours: workingHours,
        stipend_inr_month: Number(stipendInrMonth),
        status: targetStatus
      };

      const res = await api.post("/internships", payload);
      window.location.href = "/doctor/internships";
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || "Failed to create internship posting.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfaf4] dark:bg-[#07160e] text-[#1a3827] dark:text-[#d1e2d7]">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#5a7a67] dark:text-emerald-400">
          <Link href="/doctor/internships" className="hover:underline">Internships</Link>
          <span>/</span>
          <span className="font-bold text-[#143d26] dark:text-white">Create New Internship</span>
        </div>

        {/* Hero Header */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#0e301e] via-[#16432b] to-[#0a2316] text-[#f7f4ea] shadow-xl border border-emerald-800/40">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-300">
              CLINICAL OPPORTUNITY CREATION
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif-heading text-white">
              Post Ayurvedic Clinical Internship
            </h1>
            <p className="text-xs sm:text-sm text-emerald-200/90 max-w-2xl">
              Publish structured clinical apprenticeship or training rotations for BAMS and MD Ayurveda students across India.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Multi-Section Form */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0c2419] border border-[#e5edd9] dark:border-white/10 shadow-xs space-y-8">
          
          {/* Section 1: Basic Information */}
          <div className="space-y-4">
            <h2 className="text-base font-bold font-serif-heading text-[#143d26] dark:text-white flex items-center gap-2 pb-2 border-b border-[#edf3eb] dark:border-white/10">
              <Briefcase className="w-4 h-4 text-[#1a5b35]" />
              <span>1. Basic Internship Details</span>
            </h2>

            <div>
              <label className="block text-xs font-semibold text-[#3b5947] dark:text-emerald-300 mb-1">
                Internship Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Clinical Panchakarma & Metabolic Disorders Internship"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#cadacb] dark:border-white/15 bg-white dark:bg-[#07160e] text-xs sm:text-sm text-[#143d26] dark:text-white focus:outline-none focus:border-[#1a5b35]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#3b5947] dark:text-emerald-300 mb-1">
                  Specialization / Branch *
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
                  Internship Type *
                </label>
                <select
                  value={internshipType}
                  onChange={(e) => setInternshipType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#cadacb] dark:border-white/15 bg-white dark:bg-[#07160e] text-xs text-[#143d26] dark:text-white"
                >
                  {INTERNSHIP_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            {clinics.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-[#3b5947] dark:text-emerald-300 mb-1">
                  Associated Clinic / Hospital Establishment
                </label>
                <select
                  value={selectedClinicId}
                  onChange={(e) => handleClinicChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#cadacb] dark:border-white/15 bg-white dark:bg-[#07160e] text-xs text-[#143d26] dark:text-white"
                >
                  <option value="">General Practice (No specific clinic)</option>
                  {clinics.map((cl) => (
                    <option key={cl.id} value={cl.id}>{cl.name} ({cl.city})</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#3b5947] dark:text-emerald-300 mb-1">
                Detailed Internship Description *
              </label>
              <textarea
                rows={4}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the clinical focus, exposure to patient therapies, panchakarma theater operations, diagnosis routines..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#cadacb] dark:border-white/15 bg-white dark:bg-[#07160e] text-xs sm:text-sm text-[#143d26] dark:text-white focus:outline-none focus:border-[#1a5b35]"
              />
            </div>
          </div>

          {/* Section 2: Location, Mode & Capacity */}
          <div className="space-y-4 pt-4 border-t border-[#edf3eb] dark:border-white/10">
            <h2 className="text-base font-bold font-serif-heading text-[#143d26] dark:text-white flex items-center gap-2 pb-2 border-b border-[#edf3eb] dark:border-white/10">
              <MapPin className="w-4 h-4 text-[#1a5b35]" />
              <span>2. Location, Mode & Capacity</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#3b5947] dark:text-emerald-300 mb-1">
                  Working Mode *
                </label>
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#cadacb] dark:border-white/15 bg-white dark:bg-[#07160e] text-xs text-[#143d26] dark:text-white"
                >
                  <option value="ON_SITE">On-Site (At Clinic/Hospital)</option>
                  <option value="HYBRID">Hybrid</option>
                  <option value="REMOTE">Remote / Tele-Health</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3b5947] dark:text-emerald-300 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  required
                  value={locationCity}
                  onChange={(e) => setLocationCity(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#cadacb] dark:border-white/15 bg-white dark:bg-[#07160e] text-xs text-[#143d26] dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3b5947] dark:text-emerald-300 mb-1">
                  State *
                </label>
                <input
                  type="text"
                  required
                  value={locationState}
                  onChange={(e) => setLocationState(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#cadacb] dark:border-white/15 bg-white dark:bg-[#07160e] text-xs text-[#143d26] dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#3b5947] dark:text-emerald-300 mb-1">
                  Start Date *
                </label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#cadacb] dark:border-white/15 bg-white dark:bg-[#07160e] text-xs text-[#143d26] dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3b5947] dark:text-emerald-300 mb-1">
                  End Date *
                </label>
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#cadacb] dark:border-white/15 bg-white dark:bg-[#07160e] text-xs text-[#143d26] dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3b5947] dark:text-emerald-300 mb-1">
                  Seats Available *
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  required
                  value={numberOfSeats}
                  onChange={(e) => setNumberOfSeats(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-[#cadacb] dark:border-white/15 bg-white dark:bg-[#07160e] text-xs text-[#143d26] dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3b5947] dark:text-emerald-300 mb-1">
                  Application Deadline *
                </label>
                <input
                  type="date"
                  required
                  value={applicationDeadline}
                  onChange={(e) => setApplicationDeadline(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#cadacb] dark:border-white/15 bg-white dark:bg-[#07160e] text-xs text-[#143d26] dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Eligibility & Requirements */}
          <div className="space-y-4 pt-4 border-t border-[#edf3eb] dark:border-white/10">
            <h2 className="text-base font-bold font-serif-heading text-[#143d26] dark:text-white flex items-center gap-2 pb-2 border-b border-[#edf3eb] dark:border-white/10">
              <Award className="w-4 h-4 text-[#1a5b35]" />
              <span>3. Candidate Eligibility & Skills</span>
            </h2>

            <div>
              <label className="block text-xs font-semibold text-[#3b5947] dark:text-emerald-300 mb-2">
                Eligible Degree Programs
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {COURSES_OPTIONS.map((c) => (
                  <label key={c} className="flex items-center gap-2 text-xs text-[#143d26] dark:text-white cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedCourses.includes(c)}
                      onChange={() => handleToggleCourse(c)}
                      className="rounded text-emerald-700 focus:ring-emerald-500"
                    />
                    <span>{c}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#3b5947] dark:text-emerald-300 mb-2">
                Eligible Student Cohort / Year
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {YEARS_OPTIONS.map((y) => (
                  <label key={y} className="flex items-center gap-2 text-xs text-[#143d26] dark:text-white cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedYears.includes(y)}
                      onChange={() => handleToggleYear(y)}
                      className="rounded text-emerald-700 focus:ring-emerald-500"
                    />
                    <span>{y}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Skills Required Tags */}
            <div>
              <label className="block text-xs font-semibold text-[#3b5947] dark:text-emerald-300 mb-1">
                Required Prerequisite Skills
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="e.g. Shirodhara, Agnikarma, Vamana Observation"
                  className="flex-1 px-3.5 py-2 rounded-xl border border-[#cadacb] dark:border-white/15 bg-white dark:bg-[#07160e] text-xs text-[#143d26] dark:text-white"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="px-4 py-2 rounded-xl bg-[#1a5b35] text-amber-100 text-xs font-bold hover:bg-[#124226]"
                >
                  Add Skill
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {skillsList.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#eef7f0] dark:bg-emerald-950/60 text-[#1a5b35] dark:text-emerald-300 border border-[#c8dccb] dark:border-emerald-700/50 text-xs font-semibold"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => setSkillsList(skillsList.filter((s) => s !== skill))}
                      className="hover:text-rose-600 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Section 4: Responsibilities, Learning & Stipend */}
          <div className="space-y-4 pt-4 border-t border-[#edf3eb] dark:border-white/10">
            <h2 className="text-base font-bold font-serif-heading text-[#143d26] dark:text-white flex items-center gap-2 pb-2 border-b border-[#edf3eb] dark:border-white/10">
              <Sparkles className="w-4 h-4 text-[#1a5b35]" />
              <span>4. Scope, Outcomes & Benefits</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#3b5947] dark:text-emerald-300 mb-1">
                  Key Daily Responsibilities
                </label>
                <textarea
                  rows={3}
                  value={responsibilities}
                  onChange={(e) => setResponsibilities(e.target.value)}
                  placeholder="Daily patient rounds, assisting in panchakarma preparations, herbal formulations..."
                  className="w-full px-3.5 py-2 rounded-xl border border-[#cadacb] dark:border-white/15 bg-white dark:bg-[#07160e] text-xs text-[#143d26] dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3b5947] dark:text-emerald-300 mb-1">
                  Expected Learning Outcomes
                </label>
                <textarea
                  rows={3}
                  value={learningOutcomes}
                  onChange={(e) => setLearningOutcomes(e.target.value)}
                  placeholder="Proficiency in Nadi diagnosis, formulation selection, conducting classical shodhana..."
                  className="w-full px-3.5 py-2 rounded-xl border border-[#cadacb] dark:border-white/15 bg-white dark:bg-[#07160e] text-xs text-[#143d26] dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#3b5947] dark:text-emerald-300 mb-1">
                  Working Hours / Shift
                </label>
                <input
                  type="text"
                  value={workingHours}
                  onChange={(e) => setWorkingHours(e.target.value)}
                  placeholder="09:00 AM - 05:00 PM (Mon-Sat)"
                  className="w-full px-3.5 py-2 rounded-xl border border-[#cadacb] dark:border-white/15 bg-white dark:bg-[#07160e] text-xs text-[#143d26] dark:text-white"
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
                  placeholder="e.g. 10000"
                  className="w-full px-3.5 py-2 rounded-xl border border-[#cadacb] dark:border-white/15 bg-white dark:bg-[#07160e] text-xs text-[#143d26] dark:text-white"
                />
              </div>
            </div>

            {/* Benefits Tags */}
            <div>
              <label className="block text-xs font-semibold text-[#3b5947] dark:text-emerald-300 mb-1">
                Internship Benefits & Perks
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newBenefit}
                  onChange={(e) => setNewBenefit(e.target.value)}
                  placeholder="e.g. Free Hostel Accommodation, Certificate of Excellence"
                  className="flex-1 px-3.5 py-2 rounded-xl border border-[#cadacb] dark:border-white/15 bg-white dark:bg-[#07160e] text-xs text-[#143d26] dark:text-white"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddBenefit();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddBenefit}
                  className="px-4 py-2 rounded-xl bg-[#1a5b35] text-amber-100 text-xs font-bold hover:bg-[#124226]"
                >
                  Add Benefit
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {benefitsList.map((b) => (
                  <span
                    key={b}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-700/60 text-xs font-semibold"
                  >
                    <span>{b}</span>
                    <button
                      type="button"
                      onClick={() => setBenefitsList(benefitsList.filter((x) => x !== b))}
                      className="hover:text-rose-600 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-6 border-t border-[#edf3eb] dark:border-white/10">
            <Link
              href="/doctor/internships"
              className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              Cancel
            </Link>

            <button
              type="button"
              onClick={() => handleSubmit("DRAFT")}
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-slate-200 dark:bg-white/10 text-slate-800 dark:text-slate-200 text-xs font-bold hover:bg-slate-300 transition-all cursor-pointer disabled:opacity-60"
            >
              Save as Draft
            </button>

            <button
              type="button"
              onClick={() => handleSubmit("PUBLISHED")}
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#174e2f] to-[#256c44] hover:from-[#113f25] hover:to-[#1e5837] text-amber-100 font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-60"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{saving ? "Publishing..." : "Publish Internship Now"}</span>
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}
