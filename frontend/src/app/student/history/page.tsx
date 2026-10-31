"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import {
  History,
  Award,
  Calendar,
  Building2,
  Clock,
  Star,
  ExternalLink,
  Search,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  BookOpen
} from "lucide-react";

import { api } from "@/lib/api";

interface InternshipHistoryItem {
  application_id: string;
  internship_id: string;
  internship_title: string;
  specialization?: string;
  organization_name: string;
  clinic_name?: string;
  doctor_name?: string;
  student_name?: string;
  role_title?: string;
  status: string;
  start_date?: string;
  end_date?: string;
  completion_date?: string;
  certificate_token?: string;
  attendance_percentage: number;
  overall_progress_percentage: number;
  doctor_rating?: number;
  student_rating?: number;
}

export default function StudentInternshipHistoryPage() {
  const [historyItems, setHistoryItems] = useState<InternshipHistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("" );

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const res = await api.get("/internships/student/history");
        setHistoryItems(res.data || []);
      } catch (err) {
        console.error("Error fetching student history:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const filteredHistory = historyItems.filter((item) => {
    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "ACTIVE" && ["ACCEPTED", "ACTIVE", "IN_PROGRESS"].includes(item.status)) ||
      (statusFilter === "COMPLETED" && item.status === "COMPLETED") ||
      (statusFilter === "APPLIED" && ["APPLIED", "UNDER_REVIEW", "SHORTLISTED"].includes(item.status));

    const matchesSearch =
      searchQuery === "" ||
      item.internship_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.organization_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.certificate_token && item.certificate_token.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#F7F9F4] dark:bg-[#0D1511] text-[#17231C] dark:text-[#F1F6F2] font-sans transition-colors duration-200">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#D5DED8] dark:border-[#304036] pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DCEBE1] dark:bg-[#294637] border border-[#B9C8BE] dark:border-[#425449] text-[#2F6B4F] dark:text-[#78B895] text-xs font-semibold mb-2">
              <History className="w-3.5 h-3.5" />
              AYURVEDA CLINICAL TRACK RECORD
            </div>
            <h1 className="text-3xl font-bold text-[#17231C] dark:text-[#F1F6F2] tracking-tight">
              My Internship History & Certificates
            </h1>
            <p className="text-sm text-[#526158] dark:text-[#C1CEC5] mt-1">
              Your verified clinical rotation portfolio, NCISM completion credentials, and mentorship performance history.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/internships"
              className="px-4 py-2.5 rounded-2xl bg-[#2F6B4F] hover:bg-[#24563F] dark:bg-[#78B895] dark:hover:bg-[#91CAA8] text-white dark:text-[#0D1511] text-xs font-bold transition shadow-xs"
            >
              Explore New Internships
            </Link>
            <Link
              href="/student/portfolio"
              className="px-4 py-2.5 rounded-2xl bg-[#EEF4EF] dark:bg-[#223128] hover:bg-[#D5DED8] dark:hover:bg-[#304036] text-[#17231C] dark:text-[#F1F6F2] text-xs font-semibold border border-[#D5DED8] dark:border-[#304036] transition"
            >
              Public Portfolio
            </Link>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="bg-[#FFFFFF] dark:bg-[#17211B] p-4 rounded-3xl border border-[#D5DED8] dark:border-[#304036] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
            {["ALL", "COMPLETED", "ACTIVE", "APPLIED"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3.5 py-1.5 rounded-2xl text-xs font-semibold transition ${
                  statusFilter === st
                    ? "bg-[#2F6B4F] dark:bg-[#78B895] text-white dark:text-[#0D1511] shadow-xs"
                    : "bg-[#EEF4EF] dark:bg-[#223128] text-[#526158] dark:text-[#C1CEC5] hover:text-[#17231C] dark:hover:text-[#F1F6F2]"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#526158] dark:text-[#98A99E]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search title, clinic, cert ID..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-2xl border border-[#D5DED8] dark:border-[#304036] bg-[#EEF4EF] dark:bg-[#223128] text-[#17231C] dark:text-[#F1F6F2] placeholder-[#68776D] dark:placeholder-[#98A99E] focus:outline-none focus:border-[#2F6B4F] dark:focus:border-[#78B895]"
            />
          </div>
        </div>

        {/* History Item Cards */}
        {loading ? (
          <div className="py-24 text-center space-y-3">
            <div className="inline-block w-8 h-8 border-4 border-[#2F6B4F] dark:border-[#78B895] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-[#526158] dark:text-[#C1CEC5]">Loading your clinical rotation history...</p>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="p-12 text-center bg-[#FFFFFF] dark:bg-[#17211B] rounded-3xl border border-[#D5DED8] dark:border-[#304036] text-[#526158] dark:text-[#C1CEC5] space-y-3 shadow-xs">
            <BookOpen className="w-12 h-12 text-[#68776D] dark:text-[#98A99E] mx-auto" />
            <h3 className="text-base font-bold text-[#17231C] dark:text-[#F1F6F2]">No Internship Records Found</h3>
            <p className="text-xs text-[#526158] dark:text-[#C1CEC5] max-w-sm mx-auto">
              You do not have any internship records under this filter. Apply for hospital or clinic rotations to begin building your verifiable clinical portfolio.
            </p>
            <div className="pt-2">
              <Link
                href="/internships"
                className="px-4 py-2 rounded-2xl bg-[#2F6B4F] hover:bg-[#24563F] dark:bg-[#78B895] dark:hover:bg-[#91CAA8] text-white dark:text-[#0D1511] text-xs font-bold transition"
              >
                Find Clinical Internships
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredHistory.map((item) => {
              const isCompleted = item.status === "COMPLETED";
              return (
                <div
                  key={item.application_id}
                  className="bg-[#FFFFFF] dark:bg-[#17211B] rounded-3xl p-6 border border-[#D5DED8] dark:border-[#304036] shadow-xs hover:border-[#2F6B4F] dark:hover:border-[#78B895] transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase border ${
                          isCompleted
                            ? "bg-[#DCEBE1] text-[#2F6B4F] border-[#B9C8BE] dark:bg-[#294637] dark:text-[#78B895] dark:border-[#425449]"
                            : item.status === "ACCEPTED" || item.status === "ACTIVE"
                            ? "bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-900"
                            : "bg-[#EEF4EF] text-[#526158] border-[#D5DED8] dark:bg-[#223128] dark:text-[#C1CEC5] dark:border-[#304036]"
                        }`}
                      >
                        {item.status}
                      </span>
                      {item.specialization && (
                        <span className="px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 border-teal-200 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800 text-[11px]">
                          {item.specialization}
                        </span>
                      )}
                      {item.certificate_token && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[#A96F16] dark:text-[#E5B85C] bg-amber-50 dark:bg-amber-950/40 px-2.5 py-0.5 rounded-md border border-amber-200 dark:border-amber-800">
                          <Award className="w-3.5 h-3.5 text-[#A96F16] dark:text-[#E5B85C]" />
                          {item.certificate_token}
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-[#17231C] dark:text-[#F1F6F2]">
                      {item.internship_title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#526158] dark:text-[#98A99E]">
                      <div className="flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-[#2F6B4F] dark:text-[#78B895]" />
                        {item.organization_name}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[#68776D] dark:text-[#98A99E]" />
                        {item.start_date || "Term"} to {item.completion_date || item.end_date || "Present"}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 sm:gap-6 border-t lg:border-t-0 pt-4 lg:pt-0 border-[#D5DED8] dark:border-[#304036]">
                    <div className="text-left sm:text-center">
                      <div className="text-[11px] text-[#526158] dark:text-[#98A99E] font-medium">Attendance</div>
                      <div className="text-sm font-bold text-[#17231C] dark:text-[#F1F6F2]">{item.attendance_percentage}%</div>
                    </div>

                    {item.doctor_rating && (
                      <div className="text-left sm:text-center">
                        <div className="text-[11px] text-[#526158] dark:text-[#98A99E] font-medium">Mentor Rating</div>
                        <div className="text-sm font-bold text-[#2F7D4A] dark:text-[#7BC894] flex items-center gap-0.5">
                          <Star className="w-3.5 h-3.5 text-[#A96F16] dark:text-[#E5B85C] fill-[#A96F16] dark:fill-[#E5B85C]" />
                          {item.doctor_rating}/5
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2 shrink-0">
                      {item.certificate_token && (
                        <Link
                          href={`/verify/certificate/${item.certificate_token}`}
                          target="_blank"
                          className="px-3 py-1.5 rounded-2xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-[#A96F16] dark:text-[#E5B85C] text-xs font-semibold flex items-center gap-1 transition"
                        >
                          <Award className="w-3.5 h-3.5 text-[#A96F16] dark:text-[#E5B85C]" />
                          Verify Certificate
                          <ExternalLink className="w-3 h-3 text-[#A96F16] dark:text-[#E5B85C]" />
                        </Link>
                      )}

                      <Link
                        href={`/student/progress/${item.application_id}`}
                        className="px-3.5 py-1.5 rounded-2xl bg-[#EEF4EF] dark:bg-[#223128] hover:bg-[#D5DED8] dark:hover:bg-[#304036] text-[#17231C] dark:text-[#F1F6F2] text-xs font-semibold flex items-center gap-1 transition border border-[#D5DED8] dark:border-[#304036]"
                      >
                        Progress Hub
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
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
