"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { api } from "@/lib/api";
import {
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  Building2,
  User,
  Calendar,
  IndianRupee,
  Eye,
  Sparkles,
  ArrowRight,
  TrendingUp,
  FileCheck2,
  AlertCircle
} from "lucide-react";

export default function StudentOffersPage() {
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOffer, setSelectedOffer] = useState<any | null>(null);
  const [actionModal, setActionModal] = useState<"ACCEPT" | "DECLINE" | null>(null);
  const [declineReason, setDeclineReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/internships/offers/student/me");
      if (Array.isArray(res.data)) {
        setOffers(res.data);
      }
    } catch (err) {
      console.error("Failed to load student offers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const handleAcceptOffer = async (offerId: string) => {
    setSubmitting(true);
    setMsg(null);
    try {
      await api.post(`/internships/offers/${offerId}/accept`);
      setMsg({ type: "success", text: "Congratulations! You have accepted the internship offer." });
      setActionModal(null);
      setSelectedOffer(null);
      fetchOffers();
    } catch (err: any) {
      setMsg({ type: "error", text: err.response?.data?.detail || "Failed to accept offer." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeclineOffer = async (offerId: string) => {
    setSubmitting(true);
    setMsg(null);
    try {
      await api.post(`/internships/offers/${offerId}/decline`, {
        reason: declineReason || undefined
      });
      setMsg({ type: "success", text: "Offer letter declined." });
      setActionModal(null);
      setSelectedOffer(null);
      setDeclineReason("");
      fetchOffers();
    } catch (err: any) {
      setMsg({ type: "error", text: err.response?.data?.detail || "Failed to decline offer." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F3EB] dark:bg-[#07160e] text-[#2C332E] dark:text-[#FAF7F2] selection:bg-[#1E3A2B] selection:text-white">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#0e301e] via-[#16432b] to-[#0a2316] text-[#f7f4ea] shadow-xl border border-emerald-800/40 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/60 border border-emerald-700/50 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-1">
              <Award className="w-3.5 h-3.5 text-[#C87D32]" />
              <span>Student Career Portal • Official Appointments</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif-heading text-white">
              Clinical Internship Offer Letters
            </h1>
            <p className="text-xs sm:text-sm text-emerald-200/90 max-w-2xl">
              Review formal appointment offers from Ayurvedic clinics and hospitals, accept appointments, and start clinical rotations.
            </p>
          </div>

          <Link
            href="/student/applications"
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold border border-white/20 transition-all self-start md:self-auto flex items-center gap-2"
          >
            ← Back to Applications
          </Link>
        </div>

        {/* Message Alert */}
        {msg && (
          <div
            className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-xs ${
              msg.type === "success"
                ? "bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[#1E3A2B] dark:text-emerald-300"
                : "bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300"
            }`}
          >
            <span className="flex items-center gap-2">
              {msg.type === "success" ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
              {msg.text}
            </span>
            <button onClick={() => setMsg(null)} className="font-bold">✕</button>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="py-24 text-center space-y-3">
            <div className="inline-block w-8 h-8 border-4 border-[#1E3A2B] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-[#6B7260]">Loading received offer letters...</p>
          </div>
        ) : offers.length === 0 ? (
          <div className="bg-white dark:bg-[#0c2419] rounded-3xl p-12 text-center border border-[#E5DFD3] dark:border-white/10 space-y-4 max-w-xl mx-auto shadow-xs">
            <div className="p-4 rounded-full bg-[#FAF7F2] dark:bg-white/5 text-[#1E3A2B] dark:text-emerald-400 inline-block border border-[#E5DFD3] dark:border-white/10">
              <Award className="w-8 h-8 text-[#C87D32]" />
            </div>
            <h3 className="text-lg font-serif-heading font-bold text-[#1E3A2B] dark:text-white">No Offer Letters Yet</h3>
            <p className="text-xs text-[#6B7260] dark:text-slate-400 leading-relaxed">
              When doctors and Ayurvedic hospitals review and select your application, your official offer letter and appointment terms will appear here.
            </p>
            <Link
              href="/internships"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1E3A2B] hover:bg-[#134927] text-white text-xs font-bold transition-all shadow-md"
            >
              Explore Clinical Internships <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {offers.map((offer) => (
              <div
                key={offer.id}
                className="bg-white dark:bg-[#0c2419] rounded-3xl border border-[#E5DFD3] dark:border-white/10 p-6 space-y-5 hover:border-[#C87D32]/50 transition-all shadow-xs hover:shadow-md flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-mono text-[#C87D32] uppercase tracking-widest block font-bold">
                        Offer #{offer.id.slice(0, 8)}
                      </span>
                      <h3 className="text-lg font-serif-heading font-bold text-[#1E3A2B] dark:text-white mt-0.5">
                        {offer.role_title}
                      </h3>
                      <p className="text-xs text-[#6B7260] dark:text-slate-400 flex items-center gap-1.5 mt-1">
                        <Building2 className="w-3.5 h-3.5 text-[#6B7260]" /> Clinic: <strong className="text-[#2C332E] dark:text-slate-200">{offer.clinic_name || "Ayurvedic Centre"}</strong>
                      </p>
                      {offer.doctor_name && (
                        <p className="text-xs text-emerald-700 dark:text-emerald-400/90 flex items-center gap-1.5 mt-0.5">
                          <User className="w-3.5 h-3.5 text-[#6B7260]" /> Preceptor: <strong>{offer.doctor_name}</strong>
                        </p>
                      )}
                    </div>

                    <span
                      className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                        offer.status === "ACCEPTED"
                          ? "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border-emerald-200"
                          : offer.status === "ISSUED"
                          ? "bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 border-amber-200"
                          : offer.status === "DECLINED"
                          ? "bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-400 border-rose-200"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 border-slate-200"
                      }`}
                    >
                      {offer.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-[#FAF7F2] dark:bg-black/20 p-3.5 rounded-2xl border border-[#E5DFD3] dark:border-white/10">
                    <div className="space-y-0.5">
                      <p className="text-[10px] text-[#6B7260] flex items-center gap-1 font-semibold">
                        <Calendar className="w-3 h-3" /> Duration
                      </p>
                      <p className="text-[#2C332E] dark:text-slate-200 text-[11px] font-mono">
                        {offer.start_date} → {offer.end_date}
                      </p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[10px] text-[#6B7260] flex items-center gap-1 font-semibold">
                        <IndianRupee className="w-3 h-3" /> Monthly Stipend
                      </p>
                      <p className="font-mono font-bold text-[#1E3A2B] dark:text-emerald-400">
                        {offer.stipend_amount > 0 ? `₹${offer.stipend_amount.toLocaleString()}/mo` : "Academic Rotation"}
                      </p>
                    </div>
                    <div className="space-y-0.5 col-span-2 pt-1.5 border-t border-[#E5DFD3]/60 dark:border-white/10">
                      <p className="text-[10px] text-[#6B7260] flex items-center gap-1 font-semibold">
                        <Clock className="w-3 h-3" /> Working Hours
                      </p>
                      <p className="text-[#2C332E] dark:text-slate-300 text-xs">{offer.working_hours}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-[#E5DFD3] dark:border-white/10 gap-2">
                  <button
                    onClick={() => setSelectedOffer(offer)}
                    className="px-3.5 py-2 rounded-xl bg-[#FAF7F2] hover:bg-[#F0ECDF] dark:bg-white/10 text-[#1E3A2B] dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-[#E5DFD3] dark:border-white/10 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#C87D32]" /> View Formal Letter
                  </button>

                  <div className="flex items-center gap-2">
                    {offer.status === "ACCEPTED" ? (
                      <Link
                        href={`/student/progress/${offer.application_id}`}
                        className="px-4 py-2 rounded-xl bg-[#1E3A2B] hover:bg-[#134927] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
                      >
                        <TrendingUp className="w-3.5 h-3.5" /> Launch Progress Hub
                      </Link>
                    ) : offer.status === "ISSUED" ? (
                      <>
                        <button
                          onClick={() => {
                            setSelectedOffer(offer);
                            setActionModal("DECLINE");
                          }}
                          className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold border border-rose-200 transition-colors cursor-pointer"
                        >
                          Decline
                        </button>
                        <button
                          onClick={() => {
                            setSelectedOffer(offer);
                            setActionModal("ACCEPT");
                          }}
                          className="px-4 py-1.5 rounded-xl bg-[#1E3A2B] hover:bg-[#134927] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Accept Offer
                        </button>
                      </>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* FORMAL OFFER LETTER MODAL */}
      {selectedOffer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#0c2419] border-2 border-[#C87D32]/40 rounded-3xl max-w-2xl w-full p-8 space-y-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="text-center border-b-2 border-[#C87D32]/30 pb-6 space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF7F2] dark:bg-emerald-950 border border-[#E5DFD3] dark:border-emerald-800 text-[10px] font-bold text-[#1E3A2B] dark:text-emerald-400 uppercase tracking-widest">
                <Sparkles className="w-3.5 h-3.5 text-[#C87D32]" /> Aayuraura Official Internship Offer Letter
              </div>
              <h2 className="text-2xl font-serif-heading font-bold text-[#1E3A2B] dark:text-white tracking-wide">
                APPOINTMENT AS CLINICAL INTERN
              </h2>
              <p className="text-xs text-[#6B7260] dark:text-slate-400">
                Issued in accordance with NCISM Clinical Mentorship Framework
              </p>
            </div>

            {/* Body */}
            <div className="space-y-4 text-xs text-[#2C332E] dark:text-slate-300 leading-relaxed bg-[#FAF7F2] dark:bg-black/30 p-6 rounded-2xl border border-[#E5DFD3] dark:border-white/10 font-sans">
              <div className="flex items-center justify-between text-[#6B7260] text-[11px] pb-2 border-b border-[#E5DFD3] dark:border-white/10">
                <span>Date: <strong>{selectedOffer.issued_date || "Current"}</strong></span>
                <span>Ref: <strong>#{selectedOffer.id.slice(0, 8)}</strong></span>
              </div>

              <p>
                Dear <strong>{selectedOffer.student_name}</strong>,
              </p>
              <p>
                We are pleased to offer you the position of <strong>{selectedOffer.role_title}</strong> at <strong>{selectedOffer.clinic_name || "our Ayurvedic Clinical Practice"}</strong> under the mentorship of <strong>{selectedOffer.doctor_name || "Chief Ayurvedic Consultant"}</strong>.
              </p>

              <div className="grid grid-cols-2 gap-3 p-4 bg-white dark:bg-black/40 rounded-xl border border-[#E5DFD3] dark:border-white/10">
                <div>
                  <span className="text-[#6B7260] text-[10px] font-semibold uppercase">Commencement Date:</span>
                  <p className="font-mono font-bold text-[#1E3A2B] dark:text-slate-100">{selectedOffer.start_date}</p>
                </div>
                <div>
                  <span className="text-[#6B7260] text-[10px] font-semibold uppercase">Completion Date:</span>
                  <p className="font-mono font-bold text-[#1E3A2B] dark:text-slate-100">{selectedOffer.end_date}</p>
                </div>
                <div>
                  <span className="text-[#6B7260] text-[10px] font-semibold uppercase">Working Hours:</span>
                  <p className="font-medium text-[#2C332E] dark:text-slate-200">{selectedOffer.working_hours}</p>
                </div>
                <div>
                  <span className="text-[#6B7260] text-[10px] font-semibold uppercase">Monthly Stipend:</span>
                  <p className="font-mono font-bold text-[#C87D32]">
                    {selectedOffer.stipend_amount > 0 ? `₹${selectedOffer.stipend_amount.toLocaleString()}` : "Academic Credits"}
                  </p>
                </div>
              </div>

              <div>
                <strong className="text-[#1E3A2B] dark:text-slate-200">Terms & Clinical Regulations:</strong>
                <p className="text-[#6B7260] dark:text-slate-400 mt-1 italic leading-relaxed">
                  &quot;{selectedOffer.terms_and_conditions}&quot;
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-[#E5DFD3] dark:border-white/10">
              <button
                onClick={() => {
                  setSelectedOffer(null);
                  setActionModal(null);
                }}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 text-[#2C332E] dark:text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                Close
              </button>

              {selectedOffer.status === "ISSUED" && (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setActionModal("DECLINE")}
                    className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold border border-rose-200 transition-colors cursor-pointer"
                  >
                    Decline
                  </button>
                  <button
                    onClick={() => handleAcceptOffer(selectedOffer.id)}
                    disabled={submitting}
                    className="px-5 py-2 rounded-xl bg-[#1E3A2B] hover:bg-[#134927] text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" /> {submitting ? "Accepting..." : "Accept & Confirm Offer"}
                  </button>
                </div>
              )}
            </div>

            {/* Decline Reason sub-card */}
            {actionModal === "DECLINE" && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-3">
                <p className="text-xs font-bold text-rose-800">
                  Please provide a reason for declining (optional):
                </p>
                <textarea
                  rows={2}
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                  className="w-full bg-white dark:bg-[#07160e] border border-rose-300 text-[#2C332E] dark:text-white text-xs rounded-xl p-2.5 focus:outline-none focus:border-rose-500"
                  placeholder="e.g. Schedule clash with university exams, accepted another position, etc."
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setActionModal(null)}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDeclineOffer(selectedOffer.id)}
                    disabled={submitting}
                    className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer"
                  >
                    {submitting ? "Declining..." : "Confirm Decline"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
