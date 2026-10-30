"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import {
  Briefcase,
  Plus,
  Search,
  Filter,
  Calendar,
  Users,
  MapPin,
  Clock,
  ExternalLink,
  Edit3,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Building2,
  Sparkles,
  RefreshCw,
  Eye,
  Check,
  XCircle,
  Lock
} from "lucide-react";
import { api } from "@/lib/api";

interface DoctorInternshipSummary {
  id: string;
  title: string;
  specialization: string;
  internship_type: string;
  clinic_name?: string;
  location_city: string;
  location_state: string;
  mode: string;
  duration_text?: string;
  duration_months: number;
  number_of_seats: number;
  deadline: string;
  status: string;
  applications_count: number;
  created_at: string;
}

export default function DoctorInternshipsPage() {
  const [internships, setInternships] = useState<DoctorInternshipSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadInternships = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/internships/doctor/me?status=${statusFilter}`);
      setInternships(res.data);
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 401) {
        window.location.href = "/login";
        return;
      }
      setError(err.response?.data?.detail || "Unable to fetch internships.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInternships();
  }, [statusFilter]);

  const handlePublish = async (id: string) => {
    try {
      await api.post(`/internships/${id}/publish`);
      setSuccessMsg("Internship published successfully and is now open for student applications.");
      await loadInternships();
    } catch (err: any) {
      alert("Failed to publish: " + (err.response?.data?.detail || "Error"));
    }
  };

  const handleClose = async (id: string) => {
    if (!confirm("Are you sure you want to close applications for this internship?")) return;
    try {
      await api.post(`/internships/${id}/close`);
      setSuccessMsg("Internship marked as CLOSED.");
      await loadInternships();
    } catch (err: any) {
      alert("Failed to close: " + (err.response?.data?.detail || "Error"));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this internship posting?")) return;
    try {
      await api.delete(`/internships/${id}`);
      setSuccessMsg("Internship posting deleted.");
      await loadInternships();
    } catch (err: any) {
      alert("Failed to delete: " + (err.response?.data?.detail || "Error"));
    }
  };

  const filteredInternships = internships.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.clinic_name && item.clinic_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalPostings = internships.length;
  const activePostings = internships.filter((i) => i.status === "PUBLISHED" || i.status === "OPEN").length;
  const totalApps = internships.reduce((sum, i) => sum + i.applications_count, 0);
  const totalSeats = internships.reduce((sum, i) => sum + i.number_of_seats, 0);

  return (
    <div className="min-h-screen bg-[#fcfaf4] dark:bg-[#07160e] text-[#1a3827] dark:text-[#d1e2d7]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-[#5a7a67] dark:text-emerald-400">
              <Link href="/doctor/dashboard" className="hover:underline">Doctor Dashboard</Link>
              <span>/</span>
              <span className="font-bold text-[#143d26] dark:text-white">Internship Management</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif-heading text-[#143d26] dark:text-white">
              Clinical & Practice Internships
            </h1>
          </div>

          <Link
            href="/doctor/internships/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1a5b35] hover:bg-[#124226] text-amber-100 text-xs font-bold shadow-md transition-all shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Internship</span>
          </Link>
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

        {/* Quick KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0c2419] border border-[#e5edd9] dark:border-white/10 shadow-xs">
            <p className="text-[11px] font-semibold text-[#5a7a67] dark:text-emerald-400 uppercase tracking-wider">Total Postings</p>
            <p className="text-2xl font-bold font-serif-heading text-[#143d26] dark:text-white mt-0.5">{totalPostings}</p>
          </div>
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0c2419] border border-[#e5edd9] dark:border-white/10 shadow-xs">
            <p className="text-[11px] font-semibold text-[#5a7a67] dark:text-emerald-400 uppercase tracking-wider">Active & Open</p>
            <p className="text-2xl font-bold font-serif-heading text-[#1a5b35] dark:text-emerald-300 mt-0.5">{activePostings}</p>
          </div>
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0c2419] border border-[#e5edd9] dark:border-white/10 shadow-xs">
            <p className="text-[11px] font-semibold text-[#5a7a67] dark:text-emerald-400 uppercase tracking-wider">Applications Received</p>
            <p className="text-2xl font-bold font-serif-heading text-[#143d26] dark:text-white mt-0.5">{totalApps}</p>
          </div>
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0c2419] border border-[#e5edd9] dark:border-white/10 shadow-xs">
            <p className="text-[11px] font-semibold text-[#5a7a67] dark:text-emerald-400 uppercase tracking-wider">Total Capacity Seats</p>
            <p className="text-2xl font-bold font-serif-heading text-[#143d26] dark:text-white mt-0.5">{totalSeats}</p>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-[#0c2419] p-4 rounded-2xl border border-[#e5edd9] dark:border-white/10 shadow-xs">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
            {["ALL", "PUBLISHED", "DRAFT", "CLOSED", "CANCELLED"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-full font-semibold transition-all cursor-pointer ${
                  statusFilter === st
                    ? "bg-[#1a5b35] text-amber-100 shadow-xs"
                    : "bg-[#f8faf6] dark:bg-white/5 text-[#527260] dark:text-emerald-300 hover:bg-[#eef7f0]"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-[#759381] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search internships..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#f8faf6] dark:bg-white/5 border border-[#cadacb] dark:border-white/10 text-xs text-[#143d26] dark:text-white placeholder-[#8ca697] focus:outline-none"
            />
          </div>
        </div>

        {/* Internship List Cards */}
        {loading ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 bg-[#143924]/5 rounded-3xl" />
            ))}
          </div>
        ) : filteredInternships.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-[#0c2419] rounded-3xl border border-dashed border-[#d8e4d8] dark:border-white/10 space-y-3">
            <Briefcase className="w-12 h-12 mx-auto text-[#7e9d8b]" />
            <h3 className="text-base font-bold font-serif-heading text-[#143d26] dark:text-white">
              No Internship Postings Found
            </h3>
            <p className="text-xs text-[#5a7a67] dark:text-emerald-300 max-w-sm mx-auto">
              Create a clinical training or practice internship to train BAMS students and offer hands-on Panchakarma experience.
            </p>
            <Link
              href="/doctor/internships/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1a5b35] text-amber-100 text-xs font-bold"
            >
              <Plus className="w-4 h-4" />
              <span>Create Your First Internship</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredInternships.map((item) => {
              const isDraft = item.status === "DRAFT";
              const isPublished = item.status === "PUBLISHED" || item.status === "OPEN";
              const isClosed = item.status === "CLOSED";

              return (
                <div
                  key={item.id}
                  className="p-6 rounded-3xl bg-white dark:bg-[#0c2419] border border-[#e5edd9] dark:border-white/10 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 hover:border-[#1a5b35] transition-all"
                >
                  <div className="space-y-2 max-w-3xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isPublished
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300"
                          : isDraft
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300"
                          : "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-300"
                      }`}>
                        {item.status}
                      </span>
                      <span className="text-xs font-bold text-[#1a5b35] dark:text-emerald-400">
                        {item.internship_type} • {item.specialization}
                      </span>
                    </div>

                    <h2 className="text-lg sm:text-xl font-bold font-serif-heading text-[#143d26] dark:text-white">
                      {item.title}
                    </h2>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-[#4b6d59] dark:text-emerald-200/90">
                      {item.clinic_name && (
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-[#1a5b35]" />
                          <span>{item.clinic_name}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#1a5b35]" />
                        <span>{item.location_city}, {item.location_state} ({item.mode})</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#1a5b35]" />
                        <span>{item.duration_text || `${item.duration_months} Months`}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-[#1a5b35]" />
                        <span>{item.number_of_seats} Seats</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#1a5b35]" />
                        <span>Deadline: {item.deadline}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Stats */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-stretch lg:items-end gap-2.5 shrink-0 w-full lg:w-auto">
                    <div className="flex items-center gap-2 justify-between lg:justify-end">
                      <span className="text-xs font-semibold text-[#5a7a67] dark:text-emerald-300">
                        Applications: <strong className="text-base text-[#143d26] dark:text-white">{item.applications_count}</strong>
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/internships/${item.id}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#cadacb] dark:border-white/10 text-xs font-semibold text-[#1a5b35] dark:text-emerald-300 hover:bg-[#eef7f0] transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </Link>

                      <Link
                        href={`/doctor/internships/${item.id}/edit`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#cadacb] dark:border-white/10 text-xs font-semibold text-[#143d26] dark:text-white hover:bg-slate-100 transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </Link>

                      {isDraft && (
                        <button
                          onClick={() => handlePublish(item.id)}
                          className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Publish</span>
                        </button>
                      )}

                      {isPublished && (
                        <button
                          onClick={() => handleClose(item.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-amber-300 text-amber-800 hover:bg-amber-50 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          <Lock className="w-3.5 h-3.5" />
                          <span>Close</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs transition-colors cursor-pointer"
                        title="Delete Internship"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
