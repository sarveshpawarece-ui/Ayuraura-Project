"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import VerifiedDoctorBadge from "@/components/doctor/VerifiedDoctorBadge";
import {
  ShieldCheck,
  UploadCloud,
  FileText,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  ExternalLink,
  Info,
  HelpCircle,
  FileCheck,
  Plus
} from "lucide-react";
import { api } from "@/lib/api";

interface VerificationDoc {
  id: string;
  document_type: string;
  document_name: string;
  file_url: string;
  file_name?: string;
  file_size_bytes?: number;
  mime_type?: string;
  verification_status: string;
  rejection_reason?: string;
  uploaded_at: string;
}

interface VerificationStatusData {
  doctor_id: string;
  doctor_name: string;
  registration_number: string;
  state_medical_council: string;
  verification_status: string;
  verification_remarks?: string;
  verified_at?: string;
  documents: VerificationDoc[];
}

const DOCUMENT_TYPES = [
  { id: "MEDICAL_REGISTRATION_CERTIFICATE", label: "State Medical Council Registration Certificate", required: true },
  { id: "DEGREE_CERTIFICATE", label: "Ayurvedic Degree / Diploma Certificate (BAMS/MD)", required: true },
  { id: "IDENTITY_PROOF", label: "Government Issued Photo ID Proof (Aadhaar / Passport / Voter ID)", required: true },
  { id: "CLINIC_REGISTRATION_PROOF", label: "Clinical Establishment Registration / Hospital Proof", required: false },
  { id: "EXPERIENCE_CERTIFICATE", label: "Clinical Experience / Hospital Appointment Letter", required: false },
  { id: "OTHER", label: "Other Supporting Document", required: false },
];

export default function DoctorVerificationPage() {
  const [statusData, setStatusData] = useState<VerificationStatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Upload Form state
  const [docType, setDocType] = useState("MEDICAL_REGISTRATION_CERTIFICATE");
  const [docName, setDocName] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [submissionNotes, setSubmissionNotes] = useState("");

  const loadVerificationStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/doctors/verification/me");
      setStatusData(res.data);
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 401) {
        window.location.href = "/login";
        return;
      }
      setError(err.response?.data?.detail || "Unable to fetch verification status.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVerificationStatus();
  }, []);

  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileUrl.trim()) {
      setError("Please provide a valid document URL or storage link.");
      return;
    }

    setUploading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const selectedTypeObj = DOCUMENT_TYPES.find((d) => d.id === docType);
      const payload = {
        document_type: docType,
        document_name: docName.trim() || selectedTypeObj?.label || "Verification Document",
        file_url: fileUrl.trim(),
        file_name: fileName.trim() || "document.pdf",
        file_size_bytes: 1024 * 500,
        mime_type: "application/pdf"
      };

      await api.post("/doctors/documents", payload);
      setDocName("");
      setFileUrl("");
      setFileName("");
      setSuccessMsg("Document uploaded successfully.");
      await loadVerificationStatus();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || "Failed to upload document.");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    if (!confirm("Are you sure you want to remove this verification document?")) return;
    try {
      await api.delete(`/doctors/documents/${docId}`);
      setSuccessMsg("Document deleted.");
      await loadVerificationStatus();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || "Failed to delete document.");
    }
  };

  const handleSubmitVerification = async () => {
    setSubmitting(true);
    setError(null);
    setSuccessMsg(null);

    try {
      await api.post("/doctors/verification/submit", { notes: submissionNotes });
      setSuccessMsg("Verification request submitted successfully! Our administrative panel will review your credentials.");
      await loadVerificationStatus();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || "Failed to submit verification request.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fcfaf4] dark:bg-[#07160e]">
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse space-y-6">
          <div className="h-40 bg-[#143924]/10 rounded-3xl" />
          <div className="h-80 bg-[#143924]/5 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (!statusData) {
    return (
      <div className="min-h-screen bg-[#fcfaf4] dark:bg-[#07160e]">
        <Navbar />
        <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
          <AlertCircle className="w-12 h-12 mx-auto text-rose-600" />
          <p className="text-lg font-bold">Verification portal unavailable.</p>
        </div>
      </div>
    );
  }

  const isVerified = statusData.verification_status === "VERIFIED";

  return (
    <div className="min-h-screen bg-[#fcfaf4] dark:bg-[#07160e] text-[#1a3827] dark:text-[#d1e2d7]">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#5a7a67] dark:text-emerald-400">
          <Link href="/doctor/dashboard" className="hover:underline">Doctor Dashboard</Link>
          <span>/</span>
          <span className="font-bold text-[#143d26] dark:text-white">Doctor Verification Center</span>
        </div>

        {/* Hero Header Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#0e301e] via-[#16432b] to-[#0a2316] text-[#f7f4ea] shadow-xl border border-emerald-800/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-300">
                CREDENTIAL AUTHENTICATION
              </span>
              <VerifiedDoctorBadge status={statusData.verification_status} size="md" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif-heading font-bold tracking-tight text-white">
              NCISM & State Medical Council Verification
            </h1>
            <p className="text-xs sm:text-sm text-emerald-200/90 leading-relaxed">
              Dr. {statusData.doctor_name} • Reg No: <span className="font-mono font-semibold text-amber-200">{statusData.registration_number}</span> ({statusData.state_medical_council})
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center min-w-[200px]">
            <span className="text-xs text-amber-200 uppercase font-semibold">Current Status</span>
            <p className="text-xl font-bold font-serif-heading text-white mt-0.5">{statusData.verification_status}</p>
            {statusData.verified_at && (
              <span className="text-[10px] text-emerald-300">
                Verified: {new Date(statusData.verified_at).toLocaleDateString()}
              </span>
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

        {/* Verification Status Timeline */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#0c2419] border border-[#e5edd9] dark:border-white/10 shadow-xs space-y-4">
          <h2 className="text-sm font-bold font-serif-heading text-[#143d26] dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#1a5b35]" />
            <span>Verification Process Steps</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-[#eef7f0] dark:bg-white/5 border border-emerald-300 dark:border-white/10 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-[#143d26] dark:text-white">
                <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px]">1</span>
                <span>Upload Documents</span>
              </div>
              <p className="text-[11px] text-[#557763] dark:text-emerald-300/70">
                Submit your council registration and BAMS degree certificate.
              </p>
            </div>

            <div className={`p-3 rounded-xl border space-y-1 ${
              statusData.documents.length > 0 ? "bg-[#eef7f0] dark:bg-white/5 border-emerald-300 dark:border-white/10" : "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5 opacity-60"
            }`}>
              <div className="flex items-center gap-1.5 font-bold text-[#143d26] dark:text-white">
                <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px]">2</span>
                <span>Submit for Review</span>
              </div>
              <p className="text-[11px] text-[#557763] dark:text-emerald-300/70">
                Send submitted files to the AyurSetu credential audit queue.
              </p>
            </div>

            <div className={`p-3 rounded-xl border space-y-1 ${
              statusData.verification_status === "UNDER_REVIEW" || isVerified ? "bg-[#eef7f0] dark:bg-white/5 border-emerald-300 dark:border-white/10" : "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5 opacity-60"
            }`}>
              <div className="flex items-center gap-1.5 font-bold text-[#143d26] dark:text-white">
                <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px]">3</span>
                <span>Authority Check</span>
              </div>
              <p className="text-[11px] text-[#557763] dark:text-emerald-300/70">
                Council and NCISM practitioner register matching.
              </p>
            </div>

            <div className={`p-3 rounded-xl border space-y-1 ${
              isVerified ? "bg-emerald-100 dark:bg-emerald-950/60 border-emerald-400" : "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5 opacity-60"
            }`}>
              <div className="flex items-center gap-1.5 font-bold text-[#143d26] dark:text-white">
                <span className="w-5 h-5 rounded-full bg-emerald-800 text-amber-200 flex items-center justify-center text-[10px]">✓</span>
                <span>Badge Granted</span>
              </div>
              <p className="text-[11px] text-[#557763] dark:text-emerald-300/70">
                ✓ Verified Doctor badge issued across profile and search.
              </p>
            </div>
          </div>

          {statusData.verification_remarks && (
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 text-xs text-amber-950 dark:text-amber-200 space-y-1">
              <span className="font-bold flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-amber-700" />
                Administrative Remarks:
              </span>
              <p className="text-[11px] text-amber-900/90 dark:text-amber-300/90">{statusData.verification_remarks}</p>
            </div>
          )}
        </div>

        {/* 2-Column Section: Upload Form & Uploaded Documents List */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Upload New Document */}
          <div className="lg:col-span-5 p-6 rounded-3xl bg-white dark:bg-[#0c2419] border border-[#e5edd9] dark:border-white/10 shadow-xs space-y-4">
            <h3 className="text-sm font-bold font-serif-heading text-[#143d26] dark:text-white flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-[#1a5b35]" />
              <span>Upload Verification Document</span>
            </h3>

            <form onSubmit={handleUploadDocument} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#3b5947] dark:text-emerald-300 mb-1">
                  Document Category *
                </label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#cadacb] dark:border-white/15 bg-white dark:bg-[#07160e] text-xs text-[#143d26] dark:text-white"
                >
                  {DOCUMENT_TYPES.map((dt) => (
                    <option key={dt.id} value={dt.id}>
                      {dt.label} {dt.required ? "(Required)" : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3b5947] dark:text-emerald-300 mb-1">
                  Document Title / Description
                </label>
                <input
                  type="text"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  placeholder="e.g. State Registration Certificate 2026"
                  className="w-full px-3 py-2 rounded-xl border border-[#cadacb] dark:border-white/15 bg-white dark:bg-[#07160e] text-xs text-[#143d26] dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3b5947] dark:text-emerald-300 mb-1">
                  File Document URL / Cloud Link *
                </label>
                <input
                  type="url"
                  required
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  placeholder="https://drive.google.com/... or https://ayursetu.in/doc.pdf"
                  className="w-full px-3 py-2 rounded-xl border border-[#cadacb] dark:border-white/15 bg-white dark:bg-[#07160e] text-xs text-[#143d26] dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3b5947] dark:text-emerald-300 mb-1">
                  File Name (optional)
                </label>
                <input
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="registration_certificate_2026.pdf"
                  className="w-full px-3 py-2 rounded-xl border border-[#cadacb] dark:border-white/15 bg-white dark:bg-[#07160e] text-xs text-[#143d26] dark:text-white"
                />
              </div>

              <button
                type="submit"
                disabled={uploading}
                className="w-full py-2.5 rounded-xl bg-[#1a5b35] hover:bg-[#124226] text-amber-100 font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                <Plus className="w-4 h-4" />
                <span>{uploading ? "Attaching Document..." : "Add to Verification Portfolio"}</span>
              </button>
            </form>
          </div>

          {/* Right Column: Uploaded Documents List */}
          <div className="lg:col-span-7 p-6 rounded-3xl bg-white dark:bg-[#0c2419] border border-[#e5edd9] dark:border-white/10 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold font-serif-heading text-[#143d26] dark:text-white flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-[#1a5b35]" />
                <span>Uploaded Documents ({statusData.documents.length})</span>
              </h3>
            </div>

            {statusData.documents.length === 0 ? (
              <div className="text-center py-10 bg-[#f8faf6] dark:bg-white/5 rounded-2xl border border-dashed border-[#d8e4d8] dark:border-white/10 space-y-2">
                <FileText className="w-8 h-8 mx-auto text-[#7e9d8b]" />
                <p className="text-xs font-medium text-[#466553] dark:text-emerald-300">
                  No verification documents uploaded yet.
                </p>
                <p className="text-[11px] text-[#718f7d] dark:text-emerald-400/60 max-w-sm mx-auto">
                  Please upload your medical council registration certificate and degree certificate to proceed with verification.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {statusData.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3.5 rounded-2xl bg-[#f8faf6] dark:bg-white/5 border border-[#e2ece0] dark:border-white/10 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#eef7f0] dark:bg-emerald-950/60 text-[#1a5b35] dark:text-emerald-300 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-[#143d26] dark:text-white">
                          {doc.document_name}
                        </p>
                        <p className="text-[10px] text-[#60806e] dark:text-emerald-300/70">
                          Type: {doc.document_type} • Uploaded {new Date(doc.uploaded_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={doc.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg border border-[#cadacb] dark:border-white/10 text-[#1a5b35] dark:text-emerald-300 hover:bg-[#eef7f0] text-xs font-medium inline-flex items-center gap-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Preview</span>
                      </a>

                      <button
                        onClick={() => handleDeleteDocument(doc.id)}
                        className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-medium cursor-pointer"
                        title="Delete Document"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Final Submission Card */}
                {!isVerified && (
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-[#123824] to-[#1d5c39] text-amber-100 shadow-md space-y-3 mt-4">
                    <h4 className="font-serif-heading font-bold text-xs text-white uppercase tracking-wider">
                      Ready to Submit for Audit?
                    </h4>
                    <input
                      type="text"
                      value={submissionNotes}
                      onChange={(e) => setSubmissionNotes(e.target.value)}
                      placeholder="Optional remarks for verification officer..."
                      className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-xs text-white placeholder-emerald-200/50 focus:outline-none"
                    />
                    <button
                      onClick={handleSubmitVerification}
                      disabled={submitting || statusData.documents.length === 0}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-[#0f2e1c] font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>{submitting ? "Submitting..." : "Submit Profile for Verification"}</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
