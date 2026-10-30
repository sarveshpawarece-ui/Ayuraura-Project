"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Award,
  Calendar,
  Building2,
  Search,
  ArrowRight,
  Sparkles,
  Lock
} from "lucide-react";
import { api } from "@/lib/api";

export default function CertificateVerificationSearchPage() {
  const router = useRouter();
  const [tokenInput, setTokenInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [certData, setCertData] = useState<any | null>(null);

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanToken = tokenInput.trim();
    if (!cleanToken) {
      setError("Please enter a valid certificate ID or verification token.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/certificates/verify/${cleanToken}`);
      setCertData(res.data);
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.detail ||
          "No verified certificate found for this cryptographic identifier."
      );
      setCertData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f5ef] dark:bg-[#06150d] text-[#1c3826] dark:text-[#d3e5d9] flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-10 space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/50 text-xs font-mono font-bold tracking-wider uppercase shadow-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>AyurSetu Public Credential Registry</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-serif-heading font-bold text-[#143722] dark:text-white">
            Verify Ayurvedic Certificate
          </h1>

          <p className="text-sm text-[#466854] dark:text-[#9bb8a6] max-w-xl mx-auto">
            Validate the cryptographic authenticity of internship completion certificates, clinical rotation credentials, and AYUSH wellness credentials issued on AyurSetu.
          </p>
        </div>

        {/* Search Box */}
        <div className="bg-white dark:bg-[#0c2419] rounded-3xl border border-[#dce3d6] dark:border-white/15 p-6 sm:p-8 shadow-xl space-y-4">
          <form onSubmit={handleVerify} className="space-y-4">
            <label
              htmlFor="cert-token-input"
              className="block text-xs font-bold uppercase tracking-wider text-[#2d4d38] dark:text-emerald-300"
            >
              Enter Certificate ID or Verification Token
            </label>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                <input
                  id="cert-token-input"
                  type="text"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder="e.g. CERT-AYUR-2026-XXXX or SHA256 Hash"
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#f7f5ef] dark:bg-white/5 border border-[#d6ded0] dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 rounded-2xl bg-[#1a442b] hover:bg-[#12311f] text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <span>Verifying...</span>
                ) : (
                  <>
                    <span>Verify Authenticity</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-300 text-xs flex items-start gap-2.5">
              <XCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Certificate Result Card */}
        {certData && (
          <div className="bg-white dark:bg-[#0c2419] rounded-3xl border border-emerald-200 dark:border-emerald-800/40 p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-[#e5edd9] dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800/50 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#143722] dark:text-white">
                    {certData.internship_title}
                  </h3>
                  <p className="text-xs text-[#527260] dark:text-emerald-300 font-mono">
                    Certificate ID: {certData.certificate_token || certData.certificate_id}
                  </p>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-300 dark:border-emerald-700 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>OFFICIALLY VERIFIED</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-[#f7f5ef] dark:bg-white/5 space-y-1">
                <span className="text-gray-500 dark:text-gray-400 font-mono">Recipient:</span>
                <p className="font-bold text-[#163e26] dark:text-white text-sm">
                  {certData.student_name_masked || "Verified Ayurvedic Practitioner"}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#f7f5ef] dark:bg-white/5 space-y-1">
                <span className="text-gray-500 dark:text-gray-400 font-mono">Issuing Preceptor:</span>
                <p className="font-bold text-[#163e26] dark:text-white text-sm">
                  {certData.doctor_name || certData.organization_name || "AyurSetu Clinical Council"}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#f7f5ef] dark:bg-white/5 space-y-1">
                <span className="text-gray-500 dark:text-gray-400 font-mono">Total Clinical Hours:</span>
                <p className="font-bold text-[#163e26] dark:text-white text-sm">
                  {certData.total_hours || 120} Hours Logged & Approved
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#f7f5ef] dark:bg-white/5 space-y-1">
                <span className="text-gray-500 dark:text-gray-400 font-mono">Date of Issue:</span>
                <p className="font-bold text-[#163e26] dark:text-white text-sm">
                  {certData.completion_date || certData.issue_date || "August 2026"}
                </p>
              </div>
            </div>

            {certData.digital_signature_hash && (
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-black/30 border border-slate-200 dark:border-white/10 text-[11px] font-mono break-all text-slate-700 dark:text-slate-300">
                <span className="font-bold text-slate-900 dark:text-white">SHA-256 Digest:</span>{" "}
                {certData.digital_signature_hash}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
