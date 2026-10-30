"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { api } from "@/lib/api";
import {
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  Ban,
  Building2,
  User,
  Calendar,
  IndianRupee,
  PlusCircle,
  Search,
  Filter,
  Eye,
  Award,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Activity
} from "lucide-react";

export default function DoctorOffersPage() {
  const [offers, setOffers] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedOfferForPreview, setSelectedOfferForPreview] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Create offer form
  const [selectedAppId, setSelectedAppId] = useState("");
  const [formData, setFormData] = useState({
    clinic_name: "",
    role_title: "Clinical Ayurvedic Intern",
    start_date: "",
    end_date: "",
    stipend_amount: 15000,
    working_hours: "09:00 AM - 05:00 PM (Mon-Sat)",
    terms_and_conditions: "The intern must maintain 85%+ attendance, observe clinical confidentiality protocols under NCISM guidelines, and complete assigned OPD case documentations."
  });

  const fetchOffersAndApps = async () => {
    setLoading(true);
    try {
      const [offersRes, appsRes] = await Promise.allSettled([
        api.get("/internships/offers/doctor/me"),
        api.get("/internships/applications/doctor/me")
      ]);

      if (offersRes.status === "fulfilled" && Array.isArray(offersRes.value.data)) {
        setOffers(offersRes.value.data);
      }
      if (appsRes.status === "fulfilled" && Array.isArray(appsRes.value.data)) {
        setApplications(appsRes.value.data);
      }
    } catch (err) {
      console.error("Failed to load offers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffersAndApps();
  }, []);

  const handleCreateOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppId) {
      setErrorMsg("Please select a student applicant.");
      return;
    }
    setSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      await api.post(`/internships/applications/${selectedAppId}/offer`, {
        clinic_name: formData.clinic_name || undefined,
        role_title: formData.role_title,
        start_date: formData.start_date,
        end_date: formData.end_date,
        stipend_amount: Number(formData.stipend_amount) || 0,
        working_hours: formData.working_hours,
        terms_and_conditions: formData.terms_and_conditions
      });

      setSuccessMsg("Offer letter issued successfully!");
      setShowCreateModal(false);
      setSelectedAppId("");
      fetchOffersAndApps();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || "Failed to issue offer letter.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelOffer = async (offerId: string) => {
    if (!confirm("Are you sure you want to cancel this offer letter?")) return;
    try {
      await api.post(`/internships/offers/${offerId}/cancel`);
      fetchOffersAndApps();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to cancel offer");
    }
  };

  const filteredOffers = offers.filter((o) => {
    if (statusFilter !== "ALL" && o.status !== statusFilter) return false;
    if (search.trim()) {
      const s = search.toLowerCase();
      return (
        (o.student_name || "").toLowerCase().includes(s) ||
        (o.role_title || "").toLowerCase().includes(s) ||
        (o.clinic_name || "").toLowerCase().includes(s)
      );
    }
    return true;
  });

  const counts = {
    total: offers.length,
    issued: offers.filter((o) => o.status === "ISSUED").length,
    accepted: offers.filter((o) => o.status === "ACCEPTED").length,
    declined: offers.filter((o) => o.status === "DECLINED").length,
    cancelled: offers.filter((o) => o.status === "CANCELLED").length
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
              <span>Doctor Clinical Hub • Official Appointment System</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif-heading text-white">
              Internship Offer Letters
            </h1>
            <p className="text-xs sm:text-sm text-emerald-200/90 max-w-2xl">
              Issue formal clinical appointments, track candidate acceptance statuses, and initialize structured student training rotations.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/doctor/attendance"
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold border border-white/20 transition-all flex items-center gap-2"
            >
              <Activity className="w-4 h-4 text-emerald-400" /> Daily Attendance
            </Link>
            <button
              onClick={() => {
                setShowCreateModal(true);
                setErrorMsg("");
              }}
              className="px-4 py-2.5 rounded-xl bg-[#C87D32] hover:bg-[#b06a26] text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" /> Issue New Offer
            </button>
          </div>
        </div>

        {/* Success / Error Alerts */}
        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[#1E3A2B] dark:text-emerald-300 text-xs font-semibold flex items-center justify-between shadow-xs">
            <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> {successMsg}</span>
            <button onClick={() => setSuccessMsg("")} className="text-emerald-700 hover:text-emerald-900 font-bold">✕</button>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-[#0c2419] border border-[#E5DFD3] dark:border-white/10 text-center shadow-xs">
            <p className="text-[11px] font-semibold text-[#6B7260] dark:text-slate-400">Total Offers</p>
            <p className="text-2xl font-serif-heading font-bold text-[#1E3A2B] dark:text-white mt-1">{counts.total}</p>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-[#0c2419] border border-[#E5DFD3] dark:border-white/10 text-center shadow-xs">
            <p className="text-[11px] font-semibold text-[#C87D32] flex items-center justify-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Pending
            </p>
            <p className="text-2xl font-serif-heading font-bold text-[#C87D32] mt-1">{counts.issued}</p>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-[#0c2419] border border-[#E5DFD3] dark:border-white/10 text-center shadow-xs">
            <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Accepted
            </p>
            <p className="text-2xl font-serif-heading font-bold text-emerald-700 dark:text-emerald-300 mt-1">{counts.accepted}</p>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-[#0c2419] border border-[#E5DFD3] dark:border-white/10 text-center shadow-xs">
            <p className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 flex items-center justify-center gap-1">
              <XCircle className="w-3.5 h-3.5" /> Declined
            </p>
            <p className="text-2xl font-serif-heading font-bold text-rose-600 dark:text-rose-400 mt-1">{counts.declined}</p>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-[#0c2419] border border-[#E5DFD3] dark:border-white/10 text-center shadow-xs">
            <p className="text-[11px] font-semibold text-[#6B7260] dark:text-slate-400 flex items-center justify-center gap-1">
              <Ban className="w-3.5 h-3.5" /> Cancelled
            </p>
            <p className="text-2xl font-serif-heading font-bold text-[#2C332E] dark:text-slate-300 mt-1">{counts.cancelled}</p>
          </div>
        </div>

        {/* Filter bar */}
        <div className="bg-white dark:bg-[#0c2419] rounded-2xl p-4 border border-[#E5DFD3] dark:border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-[#6B7260]" />
            <input
              type="text"
              placeholder="Search by student name, role, or clinic..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#FAF7F2] dark:bg-[#07160e] border border-[#E5DFD3] dark:border-white/15 text-[#2C332E] dark:text-white text-xs rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-[#1E3A2B] transition-all placeholder:text-[#6B7260]"
            />
          </div>

          <div className="flex items-center gap-2 bg-[#FAF7F2] dark:bg-[#07160e] border border-[#E5DFD3] dark:border-white/15 px-3 py-1.5 rounded-xl text-xs">
            <Filter className="w-3.5 h-3.5 text-[#1E3A2B] dark:text-emerald-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-[#2C332E] dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="ISSUED">Issued / Pending</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="DECLINED">Declined</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Offers List */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="inline-block w-8 h-8 border-4 border-[#1E3A2B] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-[#6B7260]">Loading offer letters...</p>
          </div>
        ) : filteredOffers.length === 0 ? (
          <div className="bg-white dark:bg-[#0c2419] rounded-3xl p-12 text-center border border-[#E5DFD3] dark:border-white/10 space-y-4 max-w-xl mx-auto shadow-xs">
            <div className="p-4 rounded-full bg-[#FAF7F2] dark:bg-white/5 text-[#1E3A2B] dark:text-emerald-400 inline-block border border-[#E5DFD3] dark:border-white/10">
              <FileText className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-serif-heading font-bold text-[#1E3A2B] dark:text-white">No Offer Letters Found</h3>
            <p className="text-xs text-[#6B7260] dark:text-slate-400 leading-relaxed">
              You haven&apos;t issued any offer letters matching this criteria yet. Shortlist applicants and issue formal offer letters to commence clinical rotations.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1E3A2B] hover:bg-[#134927] text-white text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" /> Issue Offer Letter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredOffers.map((offer) => (
              <div
                key={offer.id}
                className="bg-white dark:bg-[#0c2419] rounded-2xl border border-[#E5DFD3] dark:border-white/10 p-5 space-y-4 hover:border-[#C87D32]/50 transition-all shadow-xs hover:shadow-md flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-mono text-[#C87D32] uppercase tracking-wider block font-bold">
                        Offer Ref: #{offer.id.slice(0, 8)}
                      </span>
                      <h3 className="text-base font-serif-heading font-bold text-[#1E3A2B] dark:text-white mt-0.5">
                        {offer.role_title}
                      </h3>
                      <p className="text-xs text-[#6B7260] dark:text-slate-400 flex items-center gap-1.5 mt-1">
                        <User className="w-3.5 h-3.5 text-[#6B7260]" /> Student: <strong className="text-[#2C332E] dark:text-slate-200">{offer.student_name}</strong>
                      </p>
                    </div>

                    <span
                      className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                        offer.status === "ACCEPTED"
                          ? "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800"
                          : offer.status === "ISSUED"
                          ? "bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800"
                          : offer.status === "DECLINED"
                          ? "bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-900"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 border-slate-300 dark:border-slate-700"
                      }`}
                    >
                      {offer.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-[#FAF7F2] dark:bg-black/20 p-3 rounded-xl border border-[#E5DFD3] dark:border-white/10">
                    <div className="space-y-0.5">
                      <p className="text-[10px] text-[#6B7260] flex items-center gap-1 font-semibold">
                        <Building2 className="w-3 h-3" /> Clinic
                      </p>
                      <p className="font-medium text-[#2C332E] dark:text-slate-200 truncate">{offer.clinic_name || "Doctor Practice"}</p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[10px] text-[#6B7260] flex items-center gap-1 font-semibold">
                        <IndianRupee className="w-3 h-3" /> Monthly Stipend
                      </p>
                      <p className="font-mono font-bold text-[#1E3A2B] dark:text-emerald-400">
                        {offer.stipend_amount > 0 ? `₹${offer.stipend_amount.toLocaleString()}` : "Unpaid / Volunteer"}
                      </p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[10px] text-[#6B7260] flex items-center gap-1 font-semibold">
                        <Calendar className="w-3 h-3" /> Duration
                      </p>
                      <p className="text-[#2C332E] dark:text-slate-300 text-[11px] font-mono">
                        {offer.start_date} → {offer.end_date}
                      </p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[10px] text-[#6B7260] flex items-center gap-1 font-semibold">
                        <Clock className="w-3 h-3" /> Working Hours
                      </p>
                      <p className="text-[#2C332E] dark:text-slate-300 text-[11px] truncate">{offer.working_hours}</p>
                    </div>
                  </div>

                  {offer.decline_reason && (
                    <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                      <strong>Decline Reason:</strong> {offer.decline_reason}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[#E5DFD3] dark:border-white/10 gap-2">
                  <button
                    onClick={() => setSelectedOfferForPreview(offer)}
                    className="px-3 py-1.5 rounded-xl bg-[#FAF7F2] hover:bg-[#F0ECDF] dark:bg-white/10 dark:hover:bg-white/15 text-[#1E3A2B] dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-[#E5DFD3] dark:border-white/10 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#C87D32]" /> Preview Letter
                  </button>

                  <div className="flex items-center gap-2">
                    {offer.status === "ACCEPTED" && (
                      <Link
                        href={`/doctor/progress/${offer.application_id}`}
                        className="px-3 py-1.5 rounded-xl bg-[#1E3A2B] hover:bg-[#134927] text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                      >
                        <TrendingUp className="w-3.5 h-3.5" /> Track Progress
                      </Link>
                    )}

                    {offer.status === "ISSUED" && (
                      <button
                        onClick={() => handleCancelOffer(offer.id)}
                        className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold border border-rose-200 transition-colors cursor-pointer"
                      >
                        Cancel Offer
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* CREATE OFFER MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#0c2419] border border-[#E5DFD3] dark:border-white/15 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#E5DFD3] dark:border-white/10 pb-4">
              <div>
                <h3 className="text-lg font-serif-heading font-bold text-[#1E3A2B] dark:text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#C87D32]" /> Issue Official Internship Offer Letter
                </h3>
                <p className="text-xs text-[#6B7260] dark:text-slate-400 mt-0.5">
                  Formalize candidate selection with official role terms and rotation timelines.
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-[#6B7260] hover:text-[#1E3A2B] text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreateOffer} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#3b5947] dark:text-emerald-300 mb-1">
                  Select Applicant <span className="text-[#C87D32]">*</span>
                </label>
                <select
                  required
                  value={selectedAppId}
                  onChange={(e) => setSelectedAppId(e.target.value)}
                  className="w-full bg-[#FAF7F2] dark:bg-[#07160e] border border-[#E5DFD3] dark:border-white/15 text-[#2C332E] dark:text-white text-xs rounded-xl p-3 focus:outline-none focus:border-[#1E3A2B]"
                >
                  <option value="">-- Choose Candidate from Applications --</option>
                  {applications.map((app) => (
                    <option key={app.id} value={app.id}>
                      {app.student_name} — {app.internship_title} (Status: {app.status})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#3b5947] dark:text-emerald-300 mb-1">
                    Internship Role Title <span className="text-[#C87D32]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.role_title}
                    onChange={(e) => setFormData({ ...formData, role_title: e.target.value })}
                    className="w-full bg-[#FAF7F2] dark:bg-[#07160e] border border-[#E5DFD3] dark:border-white/15 text-[#2C332E] dark:text-white text-xs rounded-xl p-3 focus:outline-none focus:border-[#1E3A2B]"
                    placeholder="e.g. Clinical Panchakarma Resident Intern"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#3b5947] dark:text-emerald-300 mb-1">
                    Clinic / Hospital Name
                  </label>
                  <input
                    type="text"
                    value={formData.clinic_name}
                    onChange={(e) => setFormData({ ...formData, clinic_name: e.target.value })}
                    className="w-full bg-[#FAF7F2] dark:bg-[#07160e] border border-[#E5DFD3] dark:border-white/15 text-[#2C332E] dark:text-white text-xs rounded-xl p-3 focus:outline-none focus:border-[#1E3A2B]"
                    placeholder="AyurSetu Clinical Centre"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#3b5947] dark:text-emerald-300 mb-1">
                    Start Date <span className="text-[#C87D32]">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full bg-[#FAF7F2] dark:bg-[#07160e] border border-[#E5DFD3] dark:border-white/15 text-[#2C332E] dark:text-white text-xs rounded-xl p-3 focus:outline-none focus:border-[#1E3A2B]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#3b5947] dark:text-emerald-300 mb-1">
                    End Date <span className="text-[#C87D32]">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full bg-[#FAF7F2] dark:bg-[#07160e] border border-[#E5DFD3] dark:border-white/15 text-[#2C332E] dark:text-white text-xs rounded-xl p-3 focus:outline-none focus:border-[#1E3A2B]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#3b5947] dark:text-emerald-300 mb-1">
                    Monthly Stipend (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.stipend_amount}
                    onChange={(e) => setFormData({ ...formData, stipend_amount: Number(e.target.value) })}
                    className="w-full bg-[#FAF7F2] dark:bg-[#07160e] border border-[#E5DFD3] dark:border-white/15 text-[#2C332E] dark:text-white text-xs rounded-xl p-3 focus:outline-none focus:border-[#1E3A2B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3b5947] dark:text-emerald-300 mb-1">
                  Working Hours & Schedule
                </label>
                <input
                  type="text"
                  value={formData.working_hours}
                  onChange={(e) => setFormData({ ...formData, working_hours: e.target.value })}
                  className="w-full bg-[#FAF7F2] dark:bg-[#07160e] border border-[#E5DFD3] dark:border-white/15 text-[#2C332E] dark:text-white text-xs rounded-xl p-3 focus:outline-none focus:border-[#1E3A2B]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3b5947] dark:text-emerald-300 mb-1">
                  Terms & Clinical Regulations
                </label>
                <textarea
                  rows={3}
                  value={formData.terms_and_conditions}
                  onChange={(e) => setFormData({ ...formData, terms_and_conditions: e.target.value })}
                  className="w-full bg-[#FAF7F2] dark:bg-[#07160e] border border-[#E5DFD3] dark:border-white/15 text-[#2C332E] dark:text-white text-xs rounded-xl p-3 focus:outline-none focus:border-[#1E3A2B] resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E5DFD3] dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 text-[#2C332E] dark:text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-[#1E3A2B] hover:bg-[#134927] text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? "Issuing..." : "Issue & Dispatch Offer Letter"} <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PREVIEW OFFER MODAL */}
      {selectedOfferForPreview && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#0c2419] border-2 border-[#C87D32]/40 rounded-3xl max-w-2xl w-full p-8 space-y-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            {/* Certificate Header Banner */}
            <div className="text-center border-b-2 border-[#C87D32]/30 pb-6 space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF7F2] dark:bg-emerald-950 border border-[#E5DFD3] dark:border-emerald-800 text-[10px] font-bold text-[#1E3A2B] dark:text-emerald-400 uppercase tracking-widest">
                <Sparkles className="w-3.5 h-3.5 text-[#C87D32]" /> AyurSetu Verified Clinical Appointment
              </div>
              <h2 className="text-2xl font-serif-heading font-bold text-[#1E3A2B] dark:text-white tracking-wide">
                OFFICIAL INTERNSHIP OFFER LETTER
              </h2>
              <p className="text-xs text-[#6B7260] dark:text-slate-400">
                Issued under the Clinical Mentorship Guidelines of NCISM & Ministry of Ayush
              </p>
            </div>

            {/* Letter Body */}
            <div className="space-y-4 text-xs text-[#2C332E] dark:text-slate-300 leading-relaxed bg-[#FAF7F2] dark:bg-black/30 p-6 rounded-2xl border border-[#E5DFD3] dark:border-white/10 font-sans">
              <p>
                <strong>Date:</strong> {selectedOfferForPreview.issued_date || "Current"}
              </p>
              <p>
                Dear <strong>{selectedOfferForPreview.student_name}</strong>,
              </p>
              <p>
                On behalf of <strong>{selectedOfferForPreview.clinic_name || "our Ayurvedic Practice"}</strong>, Dr. <strong>{selectedOfferForPreview.doctor_name || "Lead Physician"}</strong> is pleased to extend to you an offer for the position of <strong>{selectedOfferForPreview.role_title}</strong>.
              </p>

              <div className="grid grid-cols-2 gap-3 p-4 bg-white dark:bg-black/40 rounded-xl border border-[#E5DFD3] dark:border-white/10">
                <div>
                  <span className="text-[#6B7260] text-[10px] font-semibold">Start Date:</span>
                  <p className="font-mono font-bold text-[#1E3A2B] dark:text-slate-200">{selectedOfferForPreview.start_date}</p>
                </div>
                <div>
                  <span className="text-[#6B7260] text-[10px] font-semibold">End Date:</span>
                  <p className="font-mono font-bold text-[#1E3A2B] dark:text-slate-200">{selectedOfferForPreview.end_date}</p>
                </div>
                <div>
                  <span className="text-[#6B7260] text-[10px] font-semibold">Working Hours:</span>
                  <p className="font-medium text-[#2C332E] dark:text-slate-200">{selectedOfferForPreview.working_hours}</p>
                </div>
                <div>
                  <span className="text-[#6B7260] text-[10px] font-semibold">Monthly Stipend:</span>
                  <p className="font-mono font-bold text-[#C87D32]">
                    {selectedOfferForPreview.stipend_amount > 0 ? `₹${selectedOfferForPreview.stipend_amount.toLocaleString()}` : "Volunteer / Academic Credits"}
                  </p>
                </div>
              </div>

              <div>
                <strong>Terms & Clinical Obligations:</strong>
                <p className="text-[#6B7260] dark:text-slate-400 mt-1 italic">
                  &quot;{selectedOfferForPreview.terms_and_conditions}&quot;
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#E5DFD3] dark:border-white/10">
              <span className="text-[11px] text-[#6B7260] font-mono">
                Status: <strong className="text-emerald-700 dark:text-emerald-400 uppercase">{selectedOfferForPreview.status}</strong>
              </span>
              <button
                onClick={() => setSelectedOfferForPreview(null)}
                className="px-5 py-2 rounded-xl bg-[#1E3A2B] hover:bg-[#134927] text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
