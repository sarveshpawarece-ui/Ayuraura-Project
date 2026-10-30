"use client";

import { useState, useEffect, use } from "react";
import Navbar from "@/components/Navbar";
import { api } from "@/lib/api";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  ExternalLink,
  Award,
  Lock,
  Sparkles
} from "lucide-react";

interface PublicProof {
  public_token: string;
  subject_type: string;
  verification_type: string;
  status: string;
  verification_method: string;
  verified_at?: string;
  expires_at?: string;
  is_valid: boolean;
  badge_label: string;

}

export default function PublicVerificationPage({ params }: { params: Promise<{ token: string }> }) {
  const resolvedParams = use(params);
  const token = resolvedParams.token;

  const [proof, setProof] = useState<PublicProof | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchProof = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/public/verifications/${token}`);
        setProof(res.data);
      } catch (err) {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchProof();
  }, [token]);

  return (
    <div className="min-h-screen bg-[#F7F9F4] dark:bg-[#0D1511] text-[#17231C] dark:text-[#F1F6F2] font-sans transition-colors duration-200">
      <Navbar />

      <main className="max-w-3xl mx-auto px-6 py-16">
        {loading ? (
          <div className="bg-[#FFFFFF] dark:bg-[#17211B] p-12 rounded-3xl border border-[#D5DED8] dark:border-[#304036] text-center text-[#526158] dark:text-[#C1CEC5] animate-pulse flex flex-col items-center gap-3 shadow-xs">
            <ShieldCheck className="w-10 h-10 text-[#2F6B4F] dark:text-[#78B895] animate-bounce" />
            Resolving public verification proof token...
          </div>
        ) : notFound || !proof ? (
          <div className="bg-[#FFFFFF] dark:bg-[#17211B] p-12 rounded-3xl border border-rose-200 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-950/20 text-center shadow-xs">
            <XCircle className="w-14 h-14 text-rose-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-[#17231C] dark:text-[#F1F6F2]">Verification Proof Not Found</h1>
            <p className="text-[#526158] dark:text-[#C1CEC5] text-sm max-w-md mx-auto mt-2">
              The requested verification token is either invalid, expired, revoked, or kept private by the record owner.
            </p>
          </div>
        ) : (
          <div className="bg-[#FFFFFF] dark:bg-[#17211B] rounded-3xl border border-[#D5DED8] dark:border-[#304036] p-8 sm:p-10 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#D5DED8] dark:border-[#304036] pb-6 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#DCEBE1] dark:bg-[#294637] border border-[#B9C8BE] dark:border-[#425449] flex items-center justify-center">
                  <ShieldCheck className="w-7 h-7 text-[#2F6B4F] dark:text-[#78B895]" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#2F6B4F] dark:text-[#78B895] font-bold">AyurSetu Audit Registry</span>
                  <h1 className="text-xl font-bold text-[#17231C] dark:text-[#F1F6F2]">Official Verification Proof</h1>
                </div>
              </div>

              {proof.is_valid ? (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#DCEBE1] text-[#2F6B4F] border border-[#B9C8BE] dark:bg-[#294637] dark:text-[#78B895] dark:border-[#425449] text-xs font-bold font-mono">
                  <CheckCircle2 className="w-4 h-4 text-[#2F7D4A] dark:text-[#7BC894]" /> ACTIVE VERIFIED
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-900 text-xs font-bold font-mono">
                  <XCircle className="w-4 h-4 text-rose-500" /> INVALID / EXPIRED
                </span>
              )}
            </div>

            {/* Main Badge Card */}
            <div className="bg-[#EEF4EF] dark:bg-[#223128] rounded-2xl border border-[#D5DED8] dark:border-[#304036] p-6 mb-8 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-mono text-[#526158] dark:text-[#98A99E] font-semibold">Badge Label</span>
                <span className="px-3 py-1 rounded-full bg-[#DCEBE1] dark:bg-[#294637] text-[#2F6B4F] dark:text-[#78B895] text-xs font-bold font-mono border border-[#B9C8BE] dark:border-[#425449]">
                  {proof.badge_label}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-[#D5DED8] dark:border-[#304036] text-xs">
                <div>
                  <span className="text-[#526158] dark:text-[#98A99E] block mb-0.5">Subject Type</span>
                  <span className="font-semibold text-[#17231C] dark:text-[#F1F6F2]">{proof.subject_type}</span>
                </div>
                <div>
                  <span className="text-[#526158] dark:text-[#98A99E] block mb-0.5">Verification Method</span>
                  <span className="font-semibold text-[#17231C] dark:text-[#F1F6F2]">{proof.verification_method}</span>
                </div>
                <div>
                  <span className="text-[#526158] dark:text-[#98A99E] block mb-0.5">Verified Date</span>
                  <span className="font-mono font-semibold text-[#2F7D4A] dark:text-[#7BC894]">
                    {proof.verified_at ? new Date(proof.verified_at).toLocaleDateString() : "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-[#526158] dark:text-[#98A99E] block mb-0.5">Validity Expiration</span>
                  <span className="font-mono text-[#17231C] dark:text-[#F1F6F2]">
                    {proof.expires_at ? new Date(proof.expires_at).toLocaleDateString() : "Permanent Valid"}
                  </span>
                </div>
              </div>
            </div>

            {/* Token Integrity Information */}
            <div className="bg-[#FFFFFF] dark:bg-[#17211B] rounded-2xl p-4 border border-[#D5DED8] dark:border-[#304036] text-xs space-y-2 font-mono">
              <div className="flex justify-between text-[#526158] dark:text-[#98A99E]">
                <span>Public Verification Token:</span>
                <span className="text-[#2F6B4F] dark:text-[#78B895] font-bold">{proof.public_token}</span>
              </div>
              <div className="flex justify-between text-[#526158] dark:text-[#98A99E]">
                <span>Issuer Authority:</span>
                <span className="text-[#17231C] dark:text-[#F1F6F2]">AyurSetu Central Verification Audit System</span>
              </div>
              <div className="flex justify-between text-[#526158] dark:text-[#98A99E]">
                <span>Tamper Guarantee:</span>
                <span className="text-teal-700 dark:text-teal-400 font-semibold">SHA-256 Cryptographic Record Integrity</span>
              </div>
            </div>

            {/* Privacy Disclaimer */}
            <div className="mt-6 flex items-start gap-2.5 text-[11px] text-[#526158] dark:text-[#C1CEC5] bg-[#EEF4EF] dark:bg-[#223128] p-3 rounded-xl border border-[#D5DED8] dark:border-[#304036]">
              <Lock className="w-4 h-4 text-[#2F6B4F] dark:text-[#78B895] flex-shrink-0 mt-0.5" />
              <span>
                <strong>Privacy Guaranteed:</strong> Platform audit rules protect candidate privacy. Identity documents, reviewer notes, and personal contact details are never exposed on public proof tokens.
              </span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
