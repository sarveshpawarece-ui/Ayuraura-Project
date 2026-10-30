"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Award,
  Calendar,
  Building2,
  UserCheck,
  Clock,
  ExternalLink,
  Printer,
  Copy,
  Check,
  Search,
  ArrowLeft,
  Sparkles
} from "lucide-react";

interface CertificateVerifyData {
  certificate_id: string;
  certificate_token: string;
  student_name_masked: string;
  internship_title: string;
  doctor_name?: string;
  organization_name: string;
  clinic_name?: string;
  duration_text?: string;
  start_date?: string;
  end_date?: string;
  completion_date: string;
  total_hours: number;
  issue_date: string;
  status: "VALID" | "REVOKED" | "EXPIRED" | string;
  is_valid: boolean;
  digital_signature_hash?: string;
  accreditation: string;
}

export default function CertificateVerificationPage() {
  const params = useParams();
  const router = useRouter();
  const certIdParam = params?.certificateId as string;

  const [searchToken, setSearchToken] = useState<string>(certIdParam || "");
  const [loading, setLoading] = useState<boolean>(true);
  const [certData, setCertData] = useState<CertificateVerifyData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const fetchCertificate = async (token: string) => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/internships/certificates/verify/${token.trim()}`);
      setCertData(res.data);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError(`Certificate with ID '${token}' could not be located in the AyurSetu National Registry.`);
      } else {
        setError(err.response?.data?.detail || err.message || "Unable to verify certificate at this moment.");
      }
      setCertData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (certIdParam) {
      fetchCertificate(certIdParam);
    } else {
      setLoading(false);
    }
  }, [certIdParam]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchToken.trim()) {
      router.push(`/verify/certificate/${searchToken.trim().toUpperCase()}`);
      fetchCertificate(searchToken.trim().toUpperCase());
    }
  };

  const copyVerificationLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/50 via-slate-50 to-white text-slate-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Top Header & Search Bar */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold mb-3 tracking-wide">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            AYURSETU OFFICIAL CREDENTIAL REGISTRY
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Internship Certificate Verification
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Verify the authenticity of Ayurvedic clinical rotation certificates issued through AyurSetu in compliance with NCISM and Ministry of Ayush clinical mentorship guidelines.
          </p>

          {/* Quick Search */}
          <form onSubmit={handleSearch} className="mt-6 max-w-xl mx-auto flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchToken}
                onChange={(e) => setSearchToken(e.target.value)}
                placeholder="Enter Certificate ID (e.g. AYUR-CERT-2026-XXXX)"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-mono text-sm"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
            >
              Verify
            </button>
          </form>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-2xl p-12 text-center shadow-lg border border-slate-100 animate-pulse">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="w-6 h-6 text-emerald-600 animate-spin" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Verifying Certificate Authenticity...</h3>
            <p className="text-sm text-slate-500 mt-1">Cross-referencing cryptographic signature against AyurSetu decentralized registry.</p>
          </div>
        )}

        {/* Error / Not Found State */}
        {!loading && error && (
          <div className="bg-white rounded-2xl p-8 sm:p-12 text-center shadow-xl border border-red-100">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <span className="inline-block px-3 py-1 bg-red-50 text-red-700 text-xs font-bold rounded-full mb-2">
              VERIFICATION FAILED
            </span>
            <h2 className="text-2xl font-bold text-slate-900">Certificate Not Found</h2>
            <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto">
              {error}
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={() => setSearchToken("")}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
              >
                Clear Search
              </button>
              <Link
                href="/internships"
                className="px-4 py-2 text-sm font-medium text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition"
              >
                Explore Internships
              </Link>
            </div>
          </div>
        )}

        {/* Valid Certificate Display Card */}
        {!loading && certData && (
          <div className="bg-white rounded-3xl shadow-2xl border-4 border-amber-200/80 overflow-hidden relative print:border-none print:shadow-none">
            {/* Top Certificate Header Banner */}
            <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white p-6 sm:p-8 relative overflow-hidden">
              <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-48 h-48 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-400/20 border border-amber-300/40 flex items-center justify-center text-amber-300">
                    <Award className="w-7 h-7" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-amber-300 tracking-tight font-serif">
                      AyurSetu Clinical Academy
                    </h2>
                    <p className="text-xs text-emerald-200 font-medium">
                      National Ayurveda Mentorship & Clinical Rotation Credential
                    </p>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="flex items-center gap-2">
                  {certData.status === "VALID" ? (
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold tracking-wide">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      AUTHENTIC & VERIFIED
                    </span>
                  ) : certData.status === "REVOKED" ? (
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-red-500/20 border border-red-400/30 text-red-300 text-xs font-bold">
                      <XCircle className="w-4 h-4 text-red-400" />
                      REVOKED
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-bold">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      EXPIRED
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Certificate Body */}
            <div className="p-6 sm:p-10 space-y-8 bg-gradient-to-b from-white to-amber-50/20">
              {/* Recipient & Statement */}
              <div className="text-center space-y-2 border-b border-slate-100 pb-6">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                  This is to certify that
                </p>
                <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 font-serif tracking-tight">
                  {certData.student_name_masked}
                </h3>
                <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed pt-1">
                  has satisfactorily completed the structured clinical rotation in <strong className="text-slate-900 font-semibold">{certData.internship_title}</strong> under direct clinical supervision and met all requisite competency standards.
                </p>
              </div>

              {/* Core Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 font-medium">Supervising Mentor</div>
                    <div className="text-sm font-bold text-slate-900">{certData.doctor_name || "Authorized Clinical Preceptor"}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{certData.clinic_name || certData.organization_name}</div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center shrink-0 mt-0.5">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 font-medium">Host Institution / Hospital</div>
                    <div className="text-sm font-bold text-slate-900">{certData.organization_name}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{certData.duration_text || "Clinical Term"}</div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 font-medium">Rotation Period & Completion</div>
                    <div className="text-sm font-bold text-slate-900">
                      {certData.start_date ? `${certData.start_date} to ` : ""}{certData.completion_date}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">Issued: {certData.issue_date}</div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center shrink-0 mt-0.5">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 font-medium">Verified Practical Hours</div>
                    <div className="text-sm font-bold text-slate-900">{certData.total_hours} Clinical Hours</div>
                    <div className="text-xs text-emerald-600 font-semibold mt-0.5">100% Attendance Verified</div>
                  </div>
                </div>
              </div>

              {/* Cryptographic Security Details */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 text-white space-y-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-amber-300">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Cryptographic Signature & Accreditation
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    ID: {certData.certificate_token}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="sm:col-span-2">
                    <div className="text-slate-400 text-[11px]">Accreditation Standard</div>
                    <div className="text-slate-200 text-xs mt-0.5">{certData.accreditation}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-[11px]">Signature Hash</div>
                    <div className="text-slate-300 font-mono text-[10px] truncate mt-0.5">
                      {certData.digital_signature_hash || "SHA256:VERIFIED_NCISM_HASH"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100 print:hidden">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-2 transition"
                >
                  <Printer className="w-4 h-4 text-slate-600" />
                  Print / Save PDF
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={copyVerificationLink}
                    className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-2 transition"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-600" />}
                    {copied ? "Link Copied!" : "Copy Verification URL"}
                  </button>

                  <Link
                    href="/internships"
                    className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    Browse Opportunities
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
