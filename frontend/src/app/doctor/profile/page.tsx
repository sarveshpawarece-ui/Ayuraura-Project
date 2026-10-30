"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import VerifiedDoctorBadge from "@/components/doctor/VerifiedDoctorBadge";
import {
  Stethoscope,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Award,
  BookOpen,
  Building2,
  ShieldCheck,
  Edit3,
  Save,
  X,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ExternalLink,
  Camera,
  Upload,
  Loader2,
  Image as ImageIcon,
  Briefcase,
  ChevronRight,
  ArrowUpRight,
  Globe,
  Video
} from "lucide-react";
import { api } from "@/lib/api";
import { getRolePrefixOptions, formatFullName, parseNameParts } from "@/lib/nameFormatter";

interface DoctorProfileData {
  id: string;
  user_id: string;
  email: string;
  name_prefix?: string;
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  full_name: string;
  registration_number: string;
  state_medical_council: string;
  qualification: string;
  specialization: string;
  years_of_experience: number;
  designation?: string;
  areas_of_expertise: string[];
  bio?: string;
  phone?: string;
  gender?: string;
  date_of_birth?: string;
  profile_photo_url?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  clinic_address?: string;
  verification_status: string;
  verification_remarks?: string;
  verified_at?: string;
  profile_completion_percentage: number;
}

interface ClinicItem {
  id: string;
  name: string;
  organization_type?: string;
  address: string;
  city: string;
  state: string;
  pincode?: string;
  phone?: string;
  email?: string;
  services_offered?: string[];
  working_hours?: string;
  bed_capacity?: number;
}

interface InternshipItem {
  id: string;
  title: string;
  specialization: string;
  internship_type?: string;
  mode?: string;
  duration_months?: number;
  number_of_seats?: number;
  status: string;
  applications_count?: number;
  created_at?: string;
}

interface DoctorSessionItem {
  id: string;
  student_name?: string;
  session_title?: string;
  title?: string;
  session_type?: string;
  meeting_mode?: string;
  scheduled_date?: string;
  start_time?: string;
  status: string;
  duration_minutes?: number;
}

interface VerificationSummary {
  verification_status: string;
  verified_at?: string;
  verification_notes?: string;
  documents?: Array<{
    id: string;
    document_type: string;
    document_name: string;
    verification_status: string;
    created_at?: string;
  }>;
}

export default function DoctorProfilePage() {
  const [profile, setProfile] = useState<DoctorProfileData | null>(null);
  const [clinics, setClinics] = useState<ClinicItem[]>([]);
  const [internships, setInternships] = useState<InternshipItem[]>([]);
  const [sessions, setSessions] = useState<DoctorSessionItem[]>([]);
  const [verificationSummary, setVerificationSummary] = useState<VerificationSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Photo management states
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [removingPhoto, setRemovingPhoto] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [photoTimestamp, setPhotoTimestamp] = useState<number>(() => Date.now());
  const [imgError, setImgError] = useState(false);

  // Existing verification status check: strictly only "VERIFIED" shows the Verified Doctor badge
  const isDoctorVerified = (profile?.verification_status || "").trim().toUpperCase() === "VERIFIED";

  // Form edit states
  const [namePrefix, setNamePrefix] = useState("Dr.");
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [fullName, setFullName] = useState("");
  const [designation, setDesignation] = useState("");
  const [qualification, setQualification] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [yearsOfExperience, setYearsOfExperience] = useState(1);
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [stateMedicalCouncil, setStateMedicalCouncil] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [bio, setBio] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("India");
  const [pincode, setPincode] = useState("");
  const [clinicAddress, setClinicAddress] = useState("");
  const [expertiseList, setExpertiseList] = useState<string[]>([]);
  const [newExpertiseTag, setNewExpertiseTag] = useState("");

  // Clean up object URL when modal closes or component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const resolvePhotoUrl = (url?: string | null, timestamp?: number) => {
    if (!url) return "";
    let fullUrl = url;
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
      if (apiBase && (apiBase.startsWith("http://") || apiBase.startsWith("https://"))) {
        try {
          const origin = new URL(apiBase).origin;
          fullUrl = `${origin}${url.startsWith("/") ? url : `/${url}`}`;
        } catch {
          fullUrl = url.startsWith("/") ? url : `/${url}`;
        }
      } else {
        fullUrl = url.startsWith("/") ? url : `/${url}`;
      }
    }
    const sep = fullUrl.includes("?") ? "&" : "?";
    return timestamp ? `${fullUrl}${sep}t=${timestamp}` : fullUrl;
  };

  const handleTriggerFileInput = () => {
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate image format
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      setError("Please select a valid image file (JPG, PNG, or WebP).");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError("Photo size exceeds 5MB limit. Please choose a smaller image.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setSelectedFile(file);
    setPreviewUrl(objectUrl);
    setUploadError(null);
    setShowPreviewModal(true);

    // Reset input so same file can be selected again if canceled
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCancelPreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setShowPreviewModal(false);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleConfirmUpload = async () => {
    if (!selectedFile) return;
    setUploadingPhoto(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("photo", selectedFile);

      const res = await api.post("/doctors/profile/photo", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const updatedProfile: DoctorProfileData = res.data;
      setProfile(updatedProfile);
      setPhotoTimestamp(Date.now());
      setImgError(false);

      if (typeof window !== "undefined" && updatedProfile.profile_photo_url) {
        localStorage.setItem("doctor_profile_photo", updatedProfile.profile_photo_url);
      }

      setSuccessMsg("Professional photo updated successfully!");
      setTimeout(() => setSuccessMsg(null), 4000);
      handleCancelPreview();
    } catch (err: any) {
      console.error("Failed to upload photo:", err);
      const detail = err.response?.data?.detail;
      setUploadError(typeof detail === "string" ? detail : "Failed to upload photo. Please ensure it is JPG, PNG, or WebP under 5MB.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleRemovePhoto = async () => {
    if (!confirm("Are you sure you want to remove your professional photo?")) return;
    setRemovingPhoto(true);
    setError(null);
    try {
      await api.delete("/doctors/profile/photo");
      setProfile((prev) => (prev ? { ...prev, profile_photo_url: undefined } : null));
      if (typeof window !== "undefined") {
        localStorage.removeItem("doctor_profile_photo");
      }
      setPhotoTimestamp(Date.now());
      setImgError(false);
      setSuccessMsg("Professional photo removed.");
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      console.error("Failed to remove photo:", err);
      setError(err.response?.data?.detail || "Failed to remove photo.");
    } finally {
      setRemovingPhoto(false);
    }
  };

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/doctors/profile/me");
      const data: DoctorProfileData = res.data;
      setProfile(data);

      if (typeof window !== "undefined" && data.profile_photo_url) {
        localStorage.setItem("doctor_profile_photo", data.profile_photo_url);
      }
      setPhotoTimestamp(Date.now());
      setImgError(false);

      const nameParts = parseNameParts(data.full_name, "DOCTOR");
      setNamePrefix(data.name_prefix || nameParts.prefix || "Dr.");
      setFirstName(data.first_name || nameParts.firstName || "");
      setMiddleName(data.middle_name || nameParts.middleName || "");
      setLastName(data.last_name || nameParts.lastName || "");
      setFullName(data.full_name || "");
      setDesignation(data.designation || "");
      setQualification(data.qualification || "");
      setSpecialization(data.specialization || "");
      setYearsOfExperience(data.years_of_experience || 1);
      setRegistrationNumber(data.registration_number || "");
      setStateMedicalCouncil(data.state_medical_council || "");
      setPhone(data.phone || "");
      setGender(data.gender || "");
      setDateOfBirth(data.date_of_birth ? data.date_of_birth.split("T")[0] : "");
      setBio(data.bio || "");
      setCity(data.city || "");
      setState(data.state || "");
      setCountry(data.country || "India");
      setPincode(data.pincode || "");
      setClinicAddress(data.clinic_address || "");
      setExpertiseList(data.areas_of_expertise || []);

      // Concurrently load associated real doctor data
      const [clinicsRes, internshipsRes, sessionsRes, verifRes] = await Promise.allSettled([
        api.get("/doctors/clinics/me"),
        api.get("/internships/doctor/me?status=ALL"),
        api.get("/doctors/sessions?status=ALL"),
        api.get("/doctors/verification/me"),
      ]);

      if (clinicsRes.status === "fulfilled" && Array.isArray(clinicsRes.value.data)) {
        setClinics(clinicsRes.value.data);
      }
      if (internshipsRes.status === "fulfilled" && Array.isArray(internshipsRes.value.data)) {
        setInternships(internshipsRes.value.data);
      }
      if (sessionsRes.status === "fulfilled" && Array.isArray(sessionsRes.value.data)) {
        setSessions(sessionsRes.value.data);
      }
      if (verifRes.status === "fulfilled" && verifRes.value.data) {
        setVerificationSummary(verifRes.value.data);
      }
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 401) {
        window.location.href = "/login";
        return;
      }
      setError(err.response?.data?.detail || "Failed to load doctor profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleAddExpertise = () => {
    if (newExpertiseTag.trim() && !expertiseList.includes(newExpertiseTag.trim())) {
      setExpertiseList([...expertiseList, newExpertiseTag.trim()]);
      setNewExpertiseTag("");
    }
  };

  const handleRemoveExpertise = (tag: string) => {
    setExpertiseList(expertiseList.filter((t) => t !== tag));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const formattedFullName = formatFullName({
        prefix: namePrefix,
        firstName,
        middleName,
        lastName,
        fallbackFullName: fullName || `${firstName} ${lastName}`.trim(),
      });

      const updatePayload = {
        name_prefix: namePrefix,
        first_name: firstName,
        middle_name: middleName,
        last_name: lastName,
        full_name: formattedFullName,
        designation,
        qualification,
        specialization,
        years_of_experience: Number(yearsOfExperience),
        registration_number: registrationNumber,
        state_medical_council: stateMedicalCouncil,
        phone,
        gender: gender || null,
        date_of_birth: dateOfBirth || null,
        bio,
        city,
        state,
        country,
        pincode,
        clinic_address: clinicAddress,
        areas_of_expertise: expertiseList,
        profile_photo_url: profile?.profile_photo_url,
      };

      const res = await api.put("/doctors/profile/me", updatePayload);
      setProfile(res.data);
      setEditing(false);
      setSuccessMsg("Doctor profile updated successfully!");
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || "Failed to save profile changes.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fcfaf4] dark:bg-[#07160e]">
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse space-y-6">
          <div className="h-52 bg-[#143924]/10 rounded-3xl" />
          <div className="h-96 bg-[#143924]/5 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#fcfaf4] dark:bg-[#07160e]">
        <Navbar />
        <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
          <AlertCircle className="w-12 h-12 mx-auto text-rose-600" />
          <p className="text-lg font-bold">{error || "Doctor profile not found."}</p>
          <Link
            href="/doctor/dashboard"
            className="inline-block px-4 py-2 rounded-xl bg-[#143d26] text-white text-xs font-semibold"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfaf4] dark:bg-[#07160e] text-[#1a3827] dark:text-[#d1e2d7]">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Top Breadcrumb & Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-[#5a7a67] dark:text-emerald-400">
            <Link href="/doctor/dashboard" className="hover:underline">Doctor Dashboard</Link>
            <span>/</span>
            <span className="font-bold text-[#143d26] dark:text-white">Profile Management</span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/doctor/${profile.id}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#c8d8c8] dark:border-white/10 text-xs font-semibold text-[#1a5b35] dark:text-emerald-300 hover:bg-[#eef7f0] dark:hover:bg-white/5 transition-all"
            >
              <span>Public Preview</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#1a5b35] hover:bg-[#124226] text-amber-100 text-xs font-bold shadow-xs transition-all cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>
            ) : (
              <button
                onClick={() => setEditing(false)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-300 transition-all cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </button>
            )}
          </div>
        </div>

        {successMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Profile Header Hero Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0c2419] border border-[#e5edd9] dark:border-white/10 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-[#edf3eb] dark:border-white/10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5">
              {/* Avatar / Professional Photo container with quick camera action */}
              <div className="relative group shrink-0">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden ring-4 ring-[#1a5b35]/20 dark:ring-emerald-500/30 shadow-md bg-emerald-950/10 dark:bg-black/30 flex items-center justify-center">
                  {profile.profile_photo_url && !imgError ? (
                    <img
                      src={resolvePhotoUrl(profile.profile_photo_url, photoTimestamp)}
                      alt={formatFullName({
                        prefix: profile.name_prefix,
                        firstName: profile.first_name,
                        middleName: profile.middle_name,
                        lastName: profile.last_name,
                        fallbackFullName: profile.full_name,
                      })}
                      className="w-full h-full object-cover object-center rounded-full transition-transform duration-300 group-hover:scale-105"
                      onError={() => setImgError(true)}
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-[#123824] to-[#1f633c] text-amber-300 font-serif-heading font-bold text-2xl sm:text-3xl flex items-center justify-center border border-emerald-700/40">
                      {profile.full_name?.charAt(0) || "D"}
                    </div>
                  )}
                </div>
                {/* Floating camera trigger button */}
                <button
                  type="button"
                  onClick={handleTriggerFileInput}
                  title={profile.profile_photo_url ? "Change Photo" : "Upload Professional Photo"}
                  className="absolute bottom-0 right-0 p-2 rounded-full bg-[#1a5b35] hover:bg-[#124226] text-amber-100 shadow-md border-2 border-white dark:border-[#0c2419] transition-transform hover:scale-110 cursor-pointer"
                  aria-label={profile.profile_photo_url ? "Change Photo" : "Upload Professional Photo"}
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Doctor Details: Name, Title, Specialization, Verification Status */}
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold font-serif-heading text-[#143d26] dark:text-white">
                    {formatFullName({
                      prefix: profile.name_prefix,
                      firstName: profile.first_name,
                      middleName: profile.middle_name,
                      lastName: profile.last_name,
                      fallbackFullName: profile.full_name,
                    })}
                  </h1>
                  {isDoctorVerified && (
                    <VerifiedDoctorBadge status={profile.verification_status} size="sm" />
                  )}
                </div>
                <p className="text-xs sm:text-sm text-[#4f715e] dark:text-emerald-300/80 font-medium">
                  {profile.designation || "Ayurvedic Physician"}{profile.qualification ? ` • ${profile.qualification}` : ""}
                </p>
                <p className="text-xs text-[#718f7d] dark:text-emerald-400/60 font-medium">
                  Specialization: <span className="text-[#1a5b35] dark:text-emerald-300 font-semibold">{profile.specialization}</span> • {profile.years_of_experience} yrs experience • {profile.city || "New Delhi"}, {profile.state || "Delhi"}
                </p>

                {/* Explicit Photo Action Buttons */}
                <div className="pt-1 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleTriggerFileInput}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#eef7f0] dark:bg-white/5 hover:bg-[#dcefe0] dark:hover:bg-white/10 text-[#1a5b35] dark:text-emerald-300 border border-[#b8dabf] dark:border-white/15 transition-all cursor-pointer shadow-2xs"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{profile.profile_photo_url ? "Change Photo" : "Upload Professional Photo"}</span>
                  </button>

                  {profile.profile_photo_url && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      disabled={removingPhoto}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                      title="Remove professional photo"
                    >
                      {removingPhoto ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Trash2 className="w-3 h-3" />
                      )}
                      <span>Remove</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Completion Dial */}
            <div className="flex sm:flex-col items-center sm:items-end gap-2 text-right">
              <span className="text-xs font-semibold text-[#5a7a67] dark:text-emerald-400">
                Profile Completeness
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold font-serif-heading text-[#143d26] dark:text-white">
                  {profile.profile_completion_percentage}%
                </span>
                <div className="w-24 h-2 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full"
                    style={{ width: `${profile.profile_completion_percentage}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Form or Read-Only View */}
          {editing ? (
            <form onSubmit={handleSaveProfile} className="space-y-6">
              {/* Section 1: Personal Information */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold font-serif-heading text-[#143d26] dark:text-white flex items-center gap-2">
                  <User className="w-4 h-4 text-[#1a5b35]" />
                  <span>1. Personal Information</span>
                </h3>

                {/* Role-Based Structured Name Entry */}
                <div className="p-3.5 rounded-2xl bg-[#fafcfa] dark:bg-white/5 border border-[#d6e4d7] dark:border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#143e26] dark:text-white flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-[#1a5b35]" /> Doctor Identity & Professional Title
                    </span>
                    <span className="text-[10px] uppercase font-semibold text-[#577965] dark:text-emerald-400 bg-[#e8f2e9] dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-[#c2ddc8] dark:border-emerald-800/40">
                      Medical / Clinical Prefix
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    <div className="sm:col-span-4">
                      <label className="block text-xs font-semibold text-[#3b5947] dark:text-emerald-300 mb-1">
                        Prefix / Title *
                      </label>
                      <select
                        value={namePrefix}
                        onChange={(e) => setNamePrefix(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-[#cadacb] dark:border-white/15 bg-white dark:bg-[#07160e] text-xs font-semibold text-[#143d26] dark:text-white focus:outline-none focus:border-[#1a5b35]"
                      >
                        {getRolePrefixOptions("DOCTOR").map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-8">
                      <label className="block text-xs font-semibold text-[#3b5947] dark:text-emerald-300 mb-1">
                        First Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="e.g. Rajesh"
                        className="w-full px-3.5 py-2 rounded-xl border border-[#cadacb] dark:border-white/15 bg-white dark:bg-[#07160e] text-xs sm:text-sm text-[#143d26] dark:text-white focus:outline-none focus:border-[#1a5b35]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#3b5947] dark:text-emerald-300 mb-1">
                        Middle Name <span className="text-[10px] text-[#718f7d] font-normal">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        value={middleName}
                        onChange={(e) => setMiddleName(e.target.value)}
                        placeholder="e.g. Kumar"
                        className="w-full px-3.5 py-2 rounded-xl border border-[#cadacb] dark:border-white/15 bg-white dark:bg-[#07160e] text-xs sm:text-sm text-[#143d26] dark:text-white focus:outline-none focus:border-[#1a5b35]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#3b5947] dark:text-emerald-300 mb-1">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="e.g. Varma"
                        className="w-full px-3.5 py-2 rounded-xl border border-[#cadacb] dark:border-white/15 bg-white dark:bg-[#07160e] text-xs sm:text-sm text-[#143d26] dark:text-white focus:outline-none focus:border-[#1a5b35]"
                      />
                    </div>
                  </div>

                  {/* Live Formatted Name Display Preview */}
                  <div className="pt-2 border-t border-[#edf3eb] dark:border-white/10 flex items-center justify-between text-xs">
                    <span className="text-[#557563] dark:text-emerald-400/80 font-medium">Display Name Preview:</span>
                    <span className="font-bold text-[#143e26] dark:text-emerald-300 bg-[#eef7f0] dark:bg-emerald-950/60 border border-[#bad6c1] dark:border-emerald-800/40 px-2.5 py-1 rounded-lg">
                      {formatFullName({
                        prefix: namePrefix,
                        firstName,
                        middleName,
                        lastName,
                        fallbackFullName: `${firstName} ${lastName}`.trim(),
                      }) || <span className="text-slate-400 italic">Enter name fields</span>}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#3b5947] dark:text-emerald-300 mb-1">
                      Current Designation
                    </label>
                    <input
                      type="text"
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      placeholder="e.g. Senior Ayurvedic Consultant & Panchakarma Specialist"
                      className="w-full px-3.5 py-2 rounded-xl border border-[#cadacb] dark:border-white/15 bg-white dark:bg-[#07160e] text-xs sm:text-sm text-[#143d26] dark:text-white focus:outline-none focus:border-[#1a5b35]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#3b5947] dark:text-emerald-300 mb-1">
                      Contact Phone
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full px-3.5 py-2 rounded-xl border border-[#cadacb] dark:border-white/15 bg-white dark:bg-[#07160e] text-xs sm:text-sm text-[#143d26] dark:text-white focus:outline-none focus:border-[#1a5b35]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#3b5947] dark:text-emerald-300 mb-1">
                      Gender
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#cadacb] dark:border-white/15 bg-white dark:bg-[#07160e] text-xs sm:text-sm text-[#143d26] dark:text-white focus:outline-none focus:border-[#1a5b35]"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#3b5947] dark:text-emerald-300 mb-1">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-[#cadacb] dark:border-white/15 bg-white dark:bg-[#07160e] text-xs sm:text-sm text-[#143d26] dark:text-white focus:outline-none focus:border-[#1a5b35]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#3b5947] dark:text-emerald-300 mb-1">
                      City & State
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="City"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-[#cadacb] dark:border-white/15 bg-white dark:bg-[#07160e] text-xs text-[#143d26] dark:text-white"
                      />
                      <input
                        type="text"
                        placeholder="State"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-[#cadacb] dark:border-white/15 bg-white dark:bg-[#07160e] text-xs text-[#143d26] dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Professional & Clinical Credentials */}
              <div className="space-y-3 pt-4 border-t border-[#edf3eb] dark:border-white/10">
                <h3 className="text-sm font-bold font-serif-heading text-[#143d26] dark:text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#1a5b35]" />
                  <span>2. Professional Credentials</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#3b5947] dark:text-emerald-300 mb-1">
                      Degree / Qualification *
                    </label>
                    <input
                      type="text"
                      required
                      value={qualification}
                      onChange={(e) => setQualification(e.target.value)}
                      placeholder="e.g. BAMS, MD Ayurveda (Kayachikitsa)"
                      className="w-full px-3.5 py-2 rounded-xl border border-[#cadacb] dark:border-white/15 bg-white dark:bg-[#07160e] text-xs sm:text-sm text-[#143d26] dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#3b5947] dark:text-emerald-300 mb-1">
                      Specialization *
                    </label>
                    <input
                      type="text"
                      required
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                      placeholder="e.g. Panchakarma, Rasayana, Pulse Diagnosis"
                      className="w-full px-3.5 py-2 rounded-xl border border-[#cadacb] dark:border-white/15 bg-white dark:bg-[#07160e] text-xs sm:text-sm text-[#143d26] dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#3b5947] dark:text-emerald-300 mb-1">
                      Medical Registration Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={registrationNumber}
                      onChange={(e) => setRegistrationNumber(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-[#cadacb] dark:border-white/15 bg-white dark:bg-[#07160e] text-xs sm:text-sm text-[#143d26] dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#3b5947] dark:text-emerald-300 mb-1">
                      State Medical Council / Board *
                    </label>
                    <input
                      type="text"
                      required
                      value={stateMedicalCouncil}
                      onChange={(e) => setStateMedicalCouncil(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-[#cadacb] dark:border-white/15 bg-white dark:bg-[#07160e] text-xs sm:text-sm text-[#143d26] dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#3b5947] dark:text-emerald-300 mb-1">
                      Years of Experience
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="60"
                      value={yearsOfExperience}
                      onChange={(e) => setYearsOfExperience(Number(e.target.value))}
                      className="w-full px-3.5 py-2 rounded-xl border border-[#cadacb] dark:border-white/15 bg-white dark:bg-[#07160e] text-xs sm:text-sm text-[#143d26] dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#3b5947] dark:text-emerald-300 mb-1">
                      Primary Clinic / Practice Address
                    </label>
                    <input
                      type="text"
                      value={clinicAddress}
                      onChange={(e) => setClinicAddress(e.target.value)}
                      placeholder="Clinic name, street and area"
                      className="w-full px-3.5 py-2 rounded-xl border border-[#cadacb] dark:border-white/15 bg-white dark:bg-[#07160e] text-xs sm:text-sm text-[#143d26] dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Areas of Expertise & Bio */}
              <div className="space-y-3 pt-4 border-t border-[#edf3eb] dark:border-white/10">
                <h3 className="text-sm font-bold font-serif-heading text-[#143d26] dark:text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#1a5b35]" />
                  <span>3. Expertise & Biography</span>
                </h3>

                <div>
                  <label className="block text-xs font-semibold text-[#3b5947] dark:text-emerald-300 mb-1">
                    Areas of Clinical Expertise (Tags)
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newExpertiseTag}
                      onChange={(e) => setNewExpertiseTag(e.target.value)}
                      placeholder="Add clinical skill e.g. Nadi Pariksha, Shirodhara, Agnikarma"
                      className="flex-1 px-3.5 py-2 rounded-xl border border-[#cadacb] dark:border-white/15 bg-white dark:bg-[#07160e] text-xs text-[#143d26] dark:text-white"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddExpertise();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddExpertise}
                      className="px-4 py-2 rounded-xl bg-[#1a5b35] text-white text-xs font-bold hover:bg-[#124226]"
                    >
                      Add Tag
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {expertiseList.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#eef7f0] dark:bg-emerald-950/60 text-[#1a5b35] dark:text-emerald-300 border border-[#c8dccb] dark:border-emerald-700/50 text-xs font-semibold"
                      >
                        <span>{tag}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveExpertise(tag)}
                          className="hover:text-rose-600 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#3b5947] dark:text-emerald-300 mb-1">
                    Doctor Biography & Clinical Philosophy
                  </label>
                  <textarea
                    rows={4}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Describe your clinical practice, background, experience in Panchakarma, publications, or research..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#cadacb] dark:border-white/15 bg-white dark:bg-[#07160e] text-xs sm:text-sm text-[#143d26] dark:text-white focus:outline-none focus:border-[#1a5b35]"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#edf3eb] dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-white/10 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1a5b35] text-amber-100 text-xs font-bold hover:bg-[#124226] shadow-md transition-all disabled:opacity-60 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? "Saving Changes..." : "Save Profile"}</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              {/* 2. PERSONAL INFORMATION & 3. PROFESSIONAL INFORMATION */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 2. PERSONAL INFORMATION */}
                <div className="p-6 rounded-3xl bg-white dark:bg-[#0c2419] border border-[#e5edd9] dark:border-white/10 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#edf3eb] dark:border-white/10">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-[#eef7f0] dark:bg-emerald-950/60 text-[#1a5b35] dark:text-emerald-300">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold font-serif-heading text-[#143d26] dark:text-white">
                          2. Personal Information
                        </h3>
                        <p className="text-[11px] text-[#718f7d] dark:text-emerald-400/60">
                          Personal contact details & geographic location
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2.5 text-xs divide-y divide-[#edf3eb] dark:divide-white/5">
                    <div className="pt-1.5 flex justify-between items-center">
                      <span className="text-[#718f7d] dark:text-emerald-400/60 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-[#5a7a67]" /> Full Name:
                      </span>
                      <span className="font-semibold text-[#143d26] dark:text-white">{profile.full_name}</span>
                    </div>
                    <div className="pt-2 flex justify-between items-center">
                      <span className="text-[#718f7d] dark:text-emerald-400/60 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-[#5a7a67]" /> Email Address:
                      </span>
                      <span className="font-semibold text-[#143d26] dark:text-white truncate max-w-[200px]">{profile.email}</span>
                    </div>
                    <div className="pt-2 flex justify-between items-center">
                      <span className="text-[#718f7d] dark:text-emerald-400/60 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-[#5a7a67]" /> Phone Number:
                      </span>
                      <span className="font-semibold text-[#143d26] dark:text-white">
                        {profile.phone || <span className="text-slate-400 italic">Not specified</span>}
                      </span>
                    </div>
                    <div className="pt-2 flex justify-between items-center">
                      <span className="text-[#718f7d] dark:text-emerald-400/60">Gender:</span>
                      <span className="font-semibold text-[#143d26] dark:text-white">
                        {profile.gender || <span className="text-slate-400 italic">Not specified</span>}
                      </span>
                    </div>
                    <div className="pt-2 flex justify-between items-center">
                      <span className="text-[#718f7d] dark:text-emerald-400/60 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#5a7a67]" /> Date of Birth:
                      </span>
                      <span className="font-semibold text-[#143d26] dark:text-white">
                        {profile.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : <span className="text-slate-400 italic">Not specified</span>}
                      </span>
                    </div>
                    <div className="pt-2 flex justify-between items-center">
                      <span className="text-[#718f7d] dark:text-emerald-400/60 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#5a7a67]" /> Location (City & State):
                      </span>
                      <span className="font-semibold text-[#143d26] dark:text-white">
                        {profile.city || "New Delhi"}, {profile.state || "Delhi"}
                      </span>
                    </div>
                    <div className="pt-2 flex justify-between items-center">
                      <span className="text-[#718f7d] dark:text-emerald-400/60 flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-[#5a7a67]" /> Country:
                      </span>
                      <span className="font-semibold text-[#143d26] dark:text-white">{profile.country || "India"}</span>
                    </div>
                    <div className="pt-2 flex justify-between items-center">
                      <span className="text-[#718f7d] dark:text-emerald-400/60">Postal / PIN Code:</span>
                      <span className="font-semibold text-[#143d26] dark:text-white">
                        {profile.pincode || <span className="text-slate-400 italic">Not specified</span>}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. PROFESSIONAL INFORMATION */}
                <div className="p-6 rounded-3xl bg-white dark:bg-[#0c2419] border border-[#e5edd9] dark:border-white/10 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#edf3eb] dark:border-white/10">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-[#eef7f0] dark:bg-emerald-950/60 text-[#1a5b35] dark:text-emerald-300">
                        <Award className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold font-serif-heading text-[#143d26] dark:text-white">
                          3. Professional Information
                        </h3>
                        <p className="text-[11px] text-[#718f7d] dark:text-emerald-400/60">
                          Medical registration, qualification & philosophy
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2.5 text-xs divide-y divide-[#edf3eb] dark:divide-white/5">
                    <div className="pt-1.5 flex justify-between items-center">
                      <span className="text-[#718f7d] dark:text-emerald-400/60">Registration Number:</span>
                      <span className="font-mono font-bold text-[#1a5b35] dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                        {profile.registration_number}
                      </span>
                    </div>
                    <div className="pt-2 flex justify-between items-center">
                      <span className="text-[#718f7d] dark:text-emerald-400/60">Registration Authority:</span>
                      <span className="font-semibold text-[#143d26] dark:text-white text-right max-w-[220px]">
                        {profile.state_medical_council}
                      </span>
                    </div>
                    <div className="pt-2 flex justify-between items-center">
                      <span className="text-[#718f7d] dark:text-emerald-400/60">Degree / Qualification:</span>
                      <span className="font-semibold text-[#143d26] dark:text-white">{profile.qualification}</span>
                    </div>
                    <div className="pt-2 flex justify-between items-center">
                      <span className="text-[#718f7d] dark:text-emerald-400/60">Specialization:</span>
                      <span className="font-semibold text-[#1a5b35] dark:text-emerald-300">{profile.specialization}</span>
                    </div>
                    <div className="pt-2 flex justify-between items-center">
                      <span className="text-[#718f7d] dark:text-emerald-400/60">Clinical Experience:</span>
                      <span className="font-semibold text-[#143d26] dark:text-white">{profile.years_of_experience} Years</span>
                    </div>
                    <div className="pt-2 flex justify-between items-center">
                      <span className="text-[#718f7d] dark:text-emerald-400/60">Professional Title:</span>
                      <span className="font-semibold text-[#143d26] dark:text-white">{profile.designation || "Ayurvedic Physician"}</span>
                    </div>
                    <div className="pt-2 flex justify-between items-center">
                      <span className="text-[#718f7d] dark:text-emerald-400/60">Languages:</span>
                      <span className="font-semibold text-[#143d26] dark:text-white">
                        English, Hindi, Sanskrit (Classical Ayurveda)
                      </span>
                    </div>
                  </div>

                  {/* Professional Bio */}
                  <div className="pt-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#5a7a67] dark:text-emerald-400 block mb-1">
                      Professional Bio & Philosophy
                    </span>
                    {profile.bio ? (
                      <div className="p-3 rounded-2xl bg-[#f8faf6] dark:bg-white/5 border border-[#e2ece0] dark:border-white/10 text-xs text-[#3b5947] dark:text-emerald-200/90 leading-relaxed whitespace-pre-line">
                        {profile.bio}
                      </div>
                    ) : (
                      <p className="text-xs text-[#718f7d] italic">No professional biography added yet.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* 4. CLINIC / HOSPITAL */}
              <div className="p-6 rounded-3xl bg-white dark:bg-[#0c2419] border border-[#e5edd9] dark:border-white/10 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#edf3eb] dark:border-white/10">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-[#eef7f0] dark:bg-emerald-950/60 text-[#1a5b35] dark:text-emerald-300">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold font-serif-heading text-[#143d26] dark:text-white">
                        4. Clinic & Hospital Practice
                      </h3>
                      <p className="text-[11px] text-[#718f7d] dark:text-emerald-400/60">
                        Practice location, clinic facilities & contact
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/doctor/clinics"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#1a5b35] dark:text-emerald-300 hover:underline"
                  >
                    <span>Manage Clinics</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {clinics.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {clinics.map((clinic) => (
                      <div
                        key={clinic.id}
                        className="p-4 rounded-2xl bg-[#f9fbf8] dark:bg-white/5 border border-[#e2ede1] dark:border-white/10 space-y-2.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="font-bold text-sm text-[#143d26] dark:text-white">{clinic.name}</h4>
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#1a5b35] dark:text-emerald-400">
                              {(clinic.organization_type || "Ayurvedic Centre").replace(/_/g, " ")}
                            </span>
                          </div>
                          {clinic.bed_capacity && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                              {clinic.bed_capacity} Beds
                            </span>
                          )}
                        </div>
                        <div className="text-xs space-y-1 text-[#4f715e] dark:text-emerald-300/80">
                          <p className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 shrink-0 text-[#718f7d]" />
                            <span>{clinic.address}, {clinic.city}, {clinic.state} {clinic.pincode ? `- ${clinic.pincode}` : ""}</span>
                          </p>
                          {clinic.phone && (
                            <p className="flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5 shrink-0 text-[#718f7d]" />
                              <span>{clinic.phone}</span>
                            </p>
                          )}
                        </div>
                        {clinic.services_offered && clinic.services_offered.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {clinic.services_offered.map((s, idx) => (
                              <span key={idx} className="px-2 py-0.5 rounded-md bg-white dark:bg-black/30 border border-[#cadacb] dark:border-white/10 text-[10px] text-[#2c4837] dark:text-slate-300">
                                {s}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : profile.clinic_address ? (
                  <div className="p-4 rounded-2xl bg-[#f9fbf8] dark:bg-white/5 border border-[#e2ede1] dark:border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h4 className="font-bold text-sm text-[#143d26] dark:text-white">Primary Practice Address</h4>
                      <p className="text-xs text-[#4f715e] dark:text-emerald-300/80 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 shrink-0 text-[#718f7d]" />
                        <span>{profile.clinic_address}, {profile.city || "New Delhi"}, {profile.state || "Delhi"}</span>
                      </p>
                      <p className="text-xs text-[#718f7d]">Contact Phone: {profile.phone || "Not specified"}</p>
                    </div>
                    <Link
                      href="/doctor/clinics"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#1a5b35] text-amber-100 text-xs font-semibold hover:bg-[#124226] shrink-0"
                    >
                      <span>Register Full Facility</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </Link>
                  </div>
                ) : (
                  <div className="p-6 text-center rounded-2xl bg-[#fbfdfa] dark:bg-white/5 border border-dashed border-[#cadacb] dark:border-white/10 space-y-2">
                    <Building2 className="w-8 h-8 mx-auto text-[#718f7d]" />
                    <p className="text-xs font-semibold text-[#2c4837] dark:text-slate-200">No Clinic Facility Registered</p>
                    <p className="text-[11px] text-[#718f7d] max-w-sm mx-auto">
                      Add your Panchakarma clinic or hospital location to connect with patients and student interns.
                    </p>
                    <Link
                      href="/doctor/clinics"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1a5b35] text-amber-100 text-xs font-bold hover:bg-[#124226] mt-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Clinic</span>
                    </Link>
                  </div>
                )}
              </div>

              {/* 5. VERIFICATION */}
              <div className="p-6 rounded-3xl bg-white dark:bg-[#0c2419] border border-[#e5edd9] dark:border-white/10 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#edf3eb] dark:border-white/10">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-[#eef7f0] dark:bg-emerald-950/60 text-[#1a5b35] dark:text-emerald-300">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold font-serif-heading text-[#143d26] dark:text-white">
                        5. Medical Council Verification
                      </h3>
                      <p className="text-[11px] text-[#718f7d] dark:text-emerald-400/60">
                        NCISM / State Board credential verification status
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/doctor/verification"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#1a5b35] dark:text-emerald-300 hover:underline"
                  >
                    <span>Manage Documents</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-700/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#143d26] dark:text-white">Verification Status:</span>
                      <VerifiedDoctorBadge status={profile.verification_status} size="sm" />
                    </div>
                    {profile.verification_remarks && (
                      <p className="text-amber-900/90 dark:text-amber-300/90 text-xs">
                        <span className="font-semibold">Council Remarks:</span> {profile.verification_remarks}
                      </p>
                    )}
                    {profile.verified_at && (
                      <p className="text-amber-900/70 dark:text-amber-400/70 text-[11px]">
                        Verified on: {new Date(profile.verified_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                      </p>
                    )}
                    {verificationSummary?.documents && verificationSummary.documents.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        <span className="text-[11px] text-[#5a7a67] dark:text-emerald-400 font-semibold self-center">Submitted Documents:</span>
                        {verificationSummary.documents.map((doc) => (
                          <span key={doc.id} className="px-2 py-0.5 rounded-md bg-white dark:bg-black/30 border border-amber-300 dark:border-amber-700/50 text-[10px] font-medium text-amber-900 dark:text-amber-200">
                            {doc.document_type.replace(/_/g, " ")} ({doc.verification_status})
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <Link
                    href="/doctor/verification"
                    className="px-4 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 text-amber-100 text-xs font-semibold shadow-xs transition-colors shrink-0"
                  >
                    Review Credentials
                  </Link>
                </div>
              </div>

              {/* 6. EXPERTISE */}
              <div className="p-6 rounded-3xl bg-white dark:bg-[#0c2419] border border-[#e5edd9] dark:border-white/10 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#edf3eb] dark:border-white/10">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-[#eef7f0] dark:bg-emerald-950/60 text-[#1a5b35] dark:text-emerald-300">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold font-serif-heading text-[#143d26] dark:text-white">
                        6. Clinical Expertise & Specialization
                      </h3>
                      <p className="text-[11px] text-[#718f7d] dark:text-emerald-400/60">
                        Ayurvedic therapeutic proficiencies & clinical skills
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="p-3.5 rounded-2xl bg-[#f0f6f2] dark:bg-white/5 border border-[#d2e4d5] dark:border-white/10 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-[#5a7a67] dark:text-emerald-400 font-bold uppercase tracking-wider">
                        Primary Clinical Discipline
                      </span>
                      <p className="text-sm font-bold text-[#143d26] dark:text-white">{profile.specialization}</p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#1a5b35] text-amber-100">
                      {profile.years_of_experience} Years Practice
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#5a7a67] dark:text-emerald-400 block mb-2">
                      Clinical Skills & Therapeutic Focus Areas
                    </span>
                    {profile.areas_of_expertise && profile.areas_of_expertise.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {profile.areas_of_expertise.map((tag) => (
                          <span
                            key={tag}
                            className="px-3 py-1 rounded-full bg-[#eef7f0] dark:bg-emerald-950/60 text-[#1a5b35] dark:text-emerald-300 border border-[#c8dccb] dark:border-emerald-700/50 text-xs font-semibold"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-[#718f7d] italic">
                        No clinical expertise tags added yet. Edit your profile to list clinical competencies like Panchakarma, Nadi Pariksha, Dravyaguna, etc.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* 7. INTERNSHIPS */}
              <div className="p-6 rounded-3xl bg-white dark:bg-[#0c2419] border border-[#e5edd9] dark:border-white/10 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#edf3eb] dark:border-white/10">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-[#eef7f0] dark:bg-emerald-950/60 text-[#1a5b35] dark:text-emerald-300">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold font-serif-heading text-[#143d26] dark:text-white">
                        7. Clinical Internships
                      </h3>
                      <p className="text-[11px] text-[#718f7d] dark:text-emerald-400/60">
                        Published clinical training & rotation opportunities
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/doctor/internships"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#1a5b35] dark:text-emerald-300 hover:underline"
                  >
                    <span>Manage Internships</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {internships.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {internships.map((internship) => (
                      <div
                        key={internship.id}
                        className="p-4 rounded-2xl bg-[#f9fbf8] dark:bg-white/5 border border-[#e2ede1] dark:border-white/10 space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="font-bold text-xs sm:text-sm text-[#143d26] dark:text-white line-clamp-1">
                              {internship.title}
                            </h4>
                            <span className="text-[11px] text-[#1a5b35] dark:text-emerald-400 font-medium">
                              {internship.specialization}
                            </span>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              internship.status === "ACTIVE" || internship.status === "OPEN"
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                : "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-300"
                            }`}
                          >
                            {internship.status}
                          </span>
                        </div>

                        <div className="text-xs text-[#5a7a67] dark:text-emerald-400/70 flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span>{internship.mode || "In-Clinic"}</span>
                          <span>•</span>
                          <span>{internship.duration_months ? `${internship.duration_months} Months` : "Flexible"}</span>
                          <span>•</span>
                          <span>{internship.number_of_seats || 0} Seats</span>
                          <span>•</span>
                          <span className="font-semibold text-[#1a5b35] dark:text-emerald-300">
                            {internship.applications_count || 0} Applicants
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center rounded-2xl bg-[#fbfdfa] dark:bg-white/5 border border-dashed border-[#cadacb] dark:border-white/10 space-y-2">
                    <Briefcase className="w-8 h-8 mx-auto text-[#718f7d]" />
                    <p className="text-xs font-semibold text-[#2c4837] dark:text-slate-200">No Clinical Internships Posted Yet</p>
                    <p className="text-[11px] text-[#718f7d] max-w-sm mx-auto">
                      Offer clinical training rotations and hands-on guidance to aspiring Ayurveda graduates and interns.
                    </p>
                    <Link
                      href="/doctor/internships"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#1a5b35] text-amber-100 text-xs font-bold hover:bg-[#124226] mt-1 shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Post an Internship</span>
                    </Link>
                  </div>
                )}
              </div>

              {/* 8. SESSIONS */}
              <div className="p-6 rounded-3xl bg-white dark:bg-[#0c2419] border border-[#e5edd9] dark:border-white/10 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#edf3eb] dark:border-white/10">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-[#eef7f0] dark:bg-emerald-950/60 text-[#1a5b35] dark:text-emerald-300">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold font-serif-heading text-[#143d26] dark:text-white">
                        8. Guidance & Mentorship Sessions
                      </h3>
                      <p className="text-[11px] text-[#718f7d] dark:text-emerald-400/60">
                        Upcoming & completed 1-on-1 consultations with students
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/doctor/sessions"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#1a5b35] dark:text-emerald-300 hover:underline"
                  >
                    <span>View All Sessions</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {sessions.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {sessions.map((session) => (
                      <div
                        key={session.id}
                        className="p-4 rounded-2xl bg-[#f9fbf8] dark:bg-white/5 border border-[#e2ede1] dark:border-white/10 space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="font-bold text-xs sm:text-sm text-[#143d26] dark:text-white line-clamp-1">
                              {session.session_title || session.title || "Ayurvedic Clinical Mentorship"}
                            </h4>
                            <p className="text-[11px] text-[#1a5b35] dark:text-emerald-300 font-medium">
                              Mentee: {session.student_name || "Ayurveda Student"}
                            </p>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              session.status === "SCHEDULED" || session.status === "CONFIRMED"
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                : session.status === "COMPLETED"
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                                : "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-300"
                            }`}
                          >
                            {session.status}
                          </span>
                        </div>

                        <div className="text-xs text-[#5a7a67] dark:text-emerald-400/70 flex flex-wrap items-center gap-x-3 gap-y-1">
                          {session.scheduled_date && <span>{session.scheduled_date}</span>}
                          {session.start_time && (
                            <>
                              <span>•</span>
                              <span>{session.start_time}</span>
                            </>
                          )}
                          <span>•</span>
                          <span>{session.meeting_mode || "Online"}</span>
                          {session.duration_minutes && (
                            <>
                              <span>•</span>
                              <span>{session.duration_minutes} Mins</span>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center rounded-2xl bg-[#fbfdfa] dark:bg-white/5 border border-dashed border-[#cadacb] dark:border-white/10 space-y-2">
                    <Calendar className="w-8 h-8 mx-auto text-[#718f7d]" />
                    <p className="text-xs font-semibold text-[#2c4837] dark:text-slate-200">No Mentorship Sessions Scheduled</p>
                    <p className="text-[11px] text-[#718f7d] max-w-sm mx-auto">
                      Conduct 1-on-1 clinical case guidance, career mentoring, or clinical discussions with verified students.
                    </p>
                    <Link
                      href="/doctor/sessions"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#1a5b35] text-amber-100 text-xs font-bold hover:bg-[#124226] mt-1 shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Schedule Session</span>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Hidden File Input for Doctor Photo Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/jpeg,image/png,image/webp,image/jpg"
        className="hidden"
        id="doctor-photo-upload-input"
      />

      {/* Photo Preview & Confirmation Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#0c2419] rounded-3xl border border-[#d6e5d8] dark:border-white/10 shadow-2xl max-w-md w-full p-6 space-y-5 text-[#143d26] dark:text-[#d1e2d7] animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#edf3eb] dark:border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#eef7f0] dark:bg-white/5 text-[#1a5b35] dark:text-emerald-300">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold font-serif-heading text-[#143d26] dark:text-white">
                    {profile?.profile_photo_url ? "Change Professional Photo" : "Upload Professional Photo"}
                  </h3>
                  <p className="text-[11px] text-[#5a7a67] dark:text-emerald-400">
                    Preview how your photo will appear across AyurSetu
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCancelPreview}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Circular Preview Container */}
            <div className="py-2 flex flex-col items-center justify-center space-y-3">
              <div className="w-44 h-44 sm:w-48 sm:h-48 rounded-full overflow-hidden ring-4 ring-[#1a5b35]/20 dark:ring-emerald-500/30 shadow-xl bg-[#f0f6f2] dark:bg-black/30 relative">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover object-center rounded-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    No image selected
                  </div>
                )}
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-700/40">
                <CheckCircle2 className="w-3 h-3" />
                1:1 Profile Ratio Preview
              </span>
            </div>

            {/* Selected File Details */}
            {selectedFile && (
              <div className="p-3 rounded-2xl bg-[#f8faf7] dark:bg-white/5 border border-[#e4ede2] dark:border-white/10 text-xs space-y-1">
                <div className="flex justify-between font-semibold">
                  <span className="truncate max-w-[220px] text-[#2c4837] dark:text-slate-200">{selectedFile.name}</span>
                  <span className="text-[#5a7a67] dark:text-emerald-400">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-[#718f7d] dark:text-slate-400">
                  <span>Type: {selectedFile.type || "Image"}</span>
                  <span className={selectedFile.size > 5 * 1024 * 1024 ? "text-rose-600 font-bold" : "text-emerald-600 font-medium"}>
                    {selectedFile.size > 5 * 1024 * 1024 ? "Exceeds 5MB limit" : "Within 5MB limit"}
                  </span>
                </div>
              </div>
            )}

            {/* Error Banner */}
            {uploadError && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{uploadError}</span>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#edf3eb] dark:border-white/10">
              <button
                type="button"
                onClick={handleCancelPreview}
                disabled={uploadingPhoto}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmUpload}
                disabled={uploadingPhoto || !selectedFile || (selectedFile && selectedFile.size > 5 * 1024 * 1024)}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#1a5b35] hover:bg-[#124226] text-amber-100 text-xs font-bold shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploadingPhoto ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving Photo...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Photo</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
