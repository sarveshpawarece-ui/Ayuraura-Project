"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Clock,
  AlertTriangle,
  Upload,
  CheckCircle2,
  ChevronLeft,
  FileText,
  Building2,
  ExternalLink,
  Info
} from "lucide-react";
import { api } from "@/lib/api";
import {
  DashboardLayout,
  DashboardHeader,
  DashboardCard,
  DashboardLoadingSkeleton
} from "@/components/dashboard";

export default function InstitutionVerificationPage() {
  const [statusData, setStatusData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState({
    ncism_approval_number: "",
    university_affiliation: "",
    contact_person_name: "",
    contact_email: "",
    contact_phone: "",
    remarks: "",
    document_url_1: "",
    document_type_1: "NCISM_APPROVAL_LETTER",
    document_url_2: "",
    document_type_2: "UNIVERSITY_AFFILIATION_CERTIFICATE"
  });

  const loadStatus = async () => {
    try {
      setLoading(true);
      const res = await api.get("/institution/verification-status");
      setStatusData(res.data);
      if (res.data) {
        setFormData(prev => ({
          ...prev,
          ncism_approval_number: res.data.ncism_approval_number || "",
          university_affiliation: res.data.university_affiliation || "",
          remarks: res.data.verification_notes || ""
        }));
      }
    } catch (e: any) {
      console.error("Error loading verification status:", e);
      // Demo fallback
      setStatusData({
        institution_name: "National Institute of Ayurveda",
        aishe_code: "AISHE-U-0128",
        ncism_approval_number: "NCISM/AYUR/AFF/2026-89",
        university_affiliation: "Dr. Sarvepalli Radhakrishnan Rajasthan Ayurved University",
        verification_status: "PENDING",
        verification_submitted_at: "2026-10-28T14:30:00Z",
        verification_documents: [
          { document_type: "NCISM_APPROVAL_LETTER", file_url: "https://ayursetu-documents.storage/ncism-2026.pdf" }
        ],
        verification_notes: "Awaiting final scrutiny by AYUSH Ministry Directorate."
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setErrorMsg("");

      const docs = [];
      if (formData.document_url_1) {
        docs.push({
          document_type: formData.document_type_1,
          document_name: "NCISM Annual Sanction / Approval Order",
          file_url: formData.document_url_1
        });
      }
      if (formData.document_url_2) {
        docs.push({
          document_type: formData.document_type_2,
          document_name: "State Medical University Affiliation Order",
          file_url: formData.document_url_2
        });
      }

      const payload = {
        ncism_approval_number: formData.ncism_approval_number,
        university_affiliation: formData.university_affiliation,
        contact_person_name: formData.contact_person_name,
        contact_email: formData.contact_email || undefined,
        contact_phone: formData.contact_phone,
        remarks: formData.remarks,
        documents: docs
      };

      const res = await api.post("/institution/verification-submit", payload);
      setStatusData(res.data);
      setSuccessMsg("Verification dossier submitted successfully! Status updated to PENDING scrutiny.");
      setTimeout(() => setSuccessMsg(""), 5000);
    } catch (e: any) {
      setErrorMsg(e.response?.data?.detail || "Failed to submit verification details.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <DashboardLoadingSkeleton />;

  const isVerified = statusData?.verification_status === "VERIFIED";
  const isPending = statusData?.verification_status === "PENDING";
  const isRejected = statusData?.verification_status === "REJECTED";

  return (
    <DashboardLayout>
      <div className="mb-4">
        <Link
          href="/institution/dashboard"
          className="text-xs text-slate-400 hover:text-emerald-400 font-medium inline-flex items-center gap-1 transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" /> Back to Institution Dashboard
        </Link>
      </div>

      <DashboardHeader
        badgeText="Institutional Compliance"
        badgeIcon={<ShieldCheck className="w-3.5 h-3.5" />}
        badgeVariant="amber"
        title="Institution Verification & Accreditation Dossier"
        subtitle="Submit regulatory credentials to authenticate your college under the National Commission for Indian System of Medicine (NCISM)."
        statusBadge={
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
            isVerified
              ? "bg-emerald-950/80 text-emerald-300 border-emerald-500/30"
              : isPending
              ? "bg-amber-950/80 text-amber-300 border-amber-500/30"
              : "bg-rose-950/80 text-rose-300 border-rose-500/30"
          }`}>
            {isVerified ? (
              <><ShieldCheck className="w-3.5 h-3.5" /> VERIFIED INSTITUTION</>
            ) : isPending ? (
              <><Clock className="w-3.5 h-3.5" /> PENDING ADMINISTRATOR REVIEW</>
            ) : (
              <><AlertTriangle className="w-3.5 h-3.5" /> UNVERIFIED / ACTION REQUIRED</>
            )}
          </span>
        }
      />

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs font-semibold flex items-center gap-2 mb-6">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" /> {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs font-semibold flex items-center gap-2 mb-6">
          <AlertTriangle className="w-4 h-4 text-rose-400" /> {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Form: Submission */}
        <div className="lg:col-span-2 space-y-6">
          <DashboardCard title="Institutional Accreditation Form" icon={Building2}>
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">AISHE Code</label>
                  <input
                    type="text"
                    disabled
                    value={statusData?.aishe_code || "AISHE-AUTO"}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-400 font-mono cursor-not-allowed"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">Pre-registered AISHE identifier</p>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">NCISM Sanction / Approval Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. NCISM/AYUR/AFF/2026-92"
                    value={formData.ncism_approval_number}
                    onChange={(e) => setFormData({ ...formData, ncism_approval_number: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Affiliated Health University *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Sarvepalli Radhakrishnan Rajasthan Ayurved University, Jodhpur"
                  value={formData.university_affiliation}
                  onChange={(e) => setFormData({ ...formData, university_affiliation: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Principal / Registrar Name</label>
                  <input
                    type="text"
                    placeholder="Dr. Vaidya Principal"
                    value={formData.contact_person_name}
                    onChange={(e) => setFormData({ ...formData, contact_person_name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Official Contact Email</label>
                  <input
                    type="email"
                    placeholder="principal@college.edu"
                    value={formData.contact_email}
                    onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Official Landline / Mobile</label>
                  <input
                    type="text"
                    placeholder="+91 141 263155"
                    value={formData.contact_phone}
                    onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 space-y-3">
                <h5 className="font-semibold text-slate-200 text-xs">Accreditation Evidence Documents</h5>

                <div>
                  <label className="block text-slate-400 mb-1">1. NCISM Letter of Permission (PDF URL)</label>
                  <input
                    type="url"
                    placeholder="https://... secure link to uploaded NCISM Letter"
                    value={formData.document_url_1}
                    onChange={(e) => setFormData({ ...formData, document_url_1: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">2. University Affiliation Gazette Order (PDF URL)</label>
                  <input
                    type="url"
                    placeholder="https://... secure link to University Affiliation"
                    value={formData.document_url_2}
                    onChange={(e) => setFormData({ ...formData, document_url_2: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Remarks or Administrative Notes</label>
                <textarea
                  rows={2}
                  placeholder="Additional accreditation notes for auditing team..."
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs transition-colors shadow-lg shadow-amber-900/30 disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? "Submitting Dossier..." : "Submit Verification Dossier"}
                </button>
              </div>
            </form>
          </DashboardCard>
        </div>

        {/* Right Column: Status & Timeline */}
        <div className="space-y-6">
          <DashboardCard title="Verification Process Overview" icon={Info}>
            <div className="space-y-4 text-xs text-slate-300">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0">1</div>
                <div>
                  <h5 className="font-semibold text-slate-100">Dossier Submission</h5>
                  <p className="text-slate-400 mt-0.5">Institute submits AISHE, NCISM approval orders, and official contact credentials.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0">2</div>
                <div>
                  <h5 className="font-semibold text-slate-100">Administrative Audit</h5>
                  <p className="text-slate-400 mt-0.5">Platform administrators review documents against state medical councils and NCISM rosters.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center shrink-0">3</div>
                <div>
                  <h5 className="font-semibold text-slate-100">Accredited Badge & Roster Access</h5>
                  <p className="text-slate-400 mt-0.5">Verified badge unlocked; full student cohort analytics & official invitations activated.</p>
                </div>
              </div>
            </div>
          </DashboardCard>

          {/* Submitted Documents List */}
          {statusData?.verification_documents?.length > 0 && (
            <DashboardCard title="Submitted Evidence Documents" icon={FileText}>
              <div className="space-y-2">
                {statusData.verification_documents.map((doc: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-300">{doc.document_type || `Document ${idx+1}`}</span>
                    {doc.file_url && (
                      <a
                        href={doc.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-amber-400 hover:text-amber-300 font-semibold inline-flex items-center gap-1"
                      >
                        Inspect <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </DashboardCard>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
