"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import {
  ShieldCheck,
  Award,
  CheckCircle2,
  Search,
  ArrowRight,
  FileCheck,
  Building2,
  Lock,
  ExternalLink
} from "lucide-react";

export default function UniversalVerificationPage() {
  const router = useRouter();
  const [tokenOrCertId, setTokenOrCertId] = useState("");
  const [mode, setMode] = useState<"certificate" | "proof">("certificate");

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = tokenOrCertId.trim();
    if (!clean) return;

    if (mode === "certificate" || clean.toUpperCase().startsWith("AYUR-") || clean.toUpperCase().startsWith("CERT-")) {
      router.push(`/verify/certificate/${encodeURIComponent(clean)}`);
    } else {
      router.push(`/verification/${encodeURIComponent(clean)}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9F4] dark:bg-[#0D1511] text-[#17231C] dark:text-[#F1F6F2] flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto p-6 space-y-8 my-8">
        {/* Verification Hero */}
        <div className="rounded-3xl border border-[#D5DED8] dark:border-[#304036] bg-[#FFFFFF] dark:bg-[#17211B] p-8 md:p-12 shadow-sm text-center max-w-2xl mx-auto space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/10 text-[#2F6B4F] dark:text-[#78B895] flex items-center justify-center font-bold text-2xl border border-emerald-500/20">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider border border-emerald-500/20">
            Trust & Integrity Infrastructure
          </span>

          <h1 className="text-3xl md:text-4xl font-extrabold text-[#142019] dark:text-[#FFFFFF]">
            Aayuraura Verification Portal
          </h1>

          <p className="text-sm text-[#526158] dark:text-[#C1CEC5] leading-relaxed">
            Verify BAMS internship completion certificates, doctor clinical credentials, and student digital badges using tamper-evident cryptographic hashes.
          </p>

          {/* Form */}
          <form onSubmit={handleVerify} className="pt-4 space-y-4 text-left">
            <div className="flex items-center justify-center gap-4 text-xs font-semibold">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="vmode"
                  checked={mode === "certificate"}
                  onChange={() => setMode("certificate")}
                  className="accent-[#2F6B4F]"
                />
                <span>Internship Certificate ID</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="vmode"
                  checked={mode === "proof"}
                  onChange={() => setMode("proof")}
                  className="accent-[#2F6B4F]"
                />
                <span>Digital Proof Token</span>
              </label>
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#68776D] dark:text-[#98A99E] absolute left-3 top-3.5" />
                <input
                  type="text"
                  placeholder={
                    mode === "certificate"
                      ? "e.g. AYUR-2026-BAMS-0042"
                      : "e.g. proof-tk-9842a1"
                  }
                  value={tokenOrCertId}
                  onChange={(e) => setTokenOrCertId(e.target.value)}
                  className="w-full pl-9 pr-4 py-3 rounded-xl border border-[#D5DED8] dark:border-[#304036] bg-transparent text-xs text-[#17231C] dark:text-[#F1F6F2] focus:border-[#2F6B4F]"
                  required
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-[#2F6B4F] hover:bg-[#24563F] dark:bg-[#78B895] dark:hover:bg-[#91CAA8] text-white dark:text-[#0D1511] font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
              >
                Verify <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div className="p-6 rounded-3xl border border-[#D5DED8] dark:border-[#304036] bg-[#FFFFFF] dark:bg-[#17211B] shadow-sm space-y-2">
            <Award className="w-6 h-6 text-amber-500" />
            <h3 className="font-bold text-sm text-[#142019] dark:text-[#FFFFFF]">Internship Certificates</h3>
            <p className="text-[#526158] dark:text-[#C1CEC5]">
              Verify completed hours, preceptor doctor signatures, and clinical competencies.
            </p>
          </div>

          <div className="p-6 rounded-3xl border border-[#D5DED8] dark:border-[#304036] bg-[#FFFFFF] dark:bg-[#17211B] shadow-sm space-y-2">
            <Building2 className="w-6 h-6 text-blue-500" />
            <h3 className="font-bold text-sm text-[#142019] dark:text-[#FFFFFF]">Institutional Accreditation</h3>
            <p className="text-[#526158] dark:text-[#C1CEC5]">
              AISHE and NCISM syllabus-aligned credentials authenticated on the Aayuraura ledger.
            </p>
          </div>

          <div className="p-6 rounded-3xl border border-[#D5DED8] dark:border-[#304036] bg-[#FFFFFF] dark:bg-[#17211B] shadow-sm space-y-2">
            <Lock className="w-6 h-6 text-emerald-500" />
            <h3 className="font-bold text-sm text-[#142019] dark:text-[#FFFFFF]">Cryptographic Hashes</h3>
            <p className="text-[#526158] dark:text-[#C1CEC5]">
              Every certificate carries an SHA-256 digital signature to eliminate credential fraud.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
