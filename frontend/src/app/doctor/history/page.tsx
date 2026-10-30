"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import {
  History,
  TrendingUp,
  Award,
  Users,
  CheckCircle2,
  Calendar,
  Star,
  Search,
  ExternalLink,
  ShieldCheck,
  Building2,
  Clock,
  ArrowRight,
  Filter,
  BarChart3,
  GraduationCap
} from "lucide-react";

interface DoctorAnalytics {
  total_internships: number;
  active_internships: number;
  completed_internships: number;
  cancelled_internships: number;
  total_applications: number;
  shortlisted_count: number;
  accepted_count: number;
  completed_students_count: number;
  average_attendance_percentage: number;
  average_student_rating: number;
}

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

export default function DoctorInternshipHistoryPage() {
  const [analytics, setAnalytics] = useState<DoctorAnalytics | null>(null);
  const [historyItems, setHistoryItems] = useState<InternshipHistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    const fetchAnalyticsAndHistory = async () => {
      setLoading(true);
      try {
        // 1. Fetch Analytics & History in parallel
        const [anRes, histRes] = await Promise.allSettled([
          api.get("/internships/doctor/analytics"),
          api.get("/internships/doctor/history")
        ]);

        if (anRes.status === "fulfilled") {
          setAnalytics(anRes.value.data);
        }
        if (histRes.status === "fulfilled") {
          setHistoryItems(histRes.value.data || []);
        }
      } catch (err) {
        console.error("Error fetching doctor history:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsAndHistory();
  }, []);

  const filteredHistory = historyItems.filter((item) => {
    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "ACTIVE" && ["ACCEPTED", "ACTIVE", "IN_PROGRESS"].includes(item.status)) ||
      (statusFilter === "COMPLETED" && item.status === "COMPLETED") ||
      (statusFilter === "CANCELLED" && ["CANCELLED", "REJECTED", "WITHDRAWN"].includes(item.status));

    const matchesSearch =
      searchQuery === "" ||
      item.internship_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.student_name && item.student_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.certificate_token && item.certificate_token.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#F7F9F4] dark:bg-[#0D1511] text-[#17231C] dark:text-[#F1F6F2] font-sans transition-colors duration-200 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#D5DED8] dark:border-[#304036] pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DCEBE1] dark:bg-[#294637] text-[#2F6B4F] dark:text-[#78B895] text-xs font-semibold mb-2">
              <BarChart3 className="w-3.5 h-3.5" />
              DOCTOR CLINICAL MENTORSHIP
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#142019] dark:text-[#FFFFFF] tracking-tight">
              Internship Analytics & History
            </h1>
            <p className="text-sm text-[#526158] dark:text-[#98A99E] mt-1">
              Track student rotation outcomes, verify completion credentials, and evaluate mentorship performance metrics.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/doctor/internships/new"
              className="px-4 py-2.5 rounded-xl bg-[#2F6B4F] hover:bg-[#24563F] dark:bg-[#78B895] dark:hover:bg-[#91CAA8] text-white dark:text-[#0D1511] text-xs sm:text-sm font-bold shadow-xs transition"
            >
              + Create New Internship
            </Link>
            <Link
              href="/doctor/dashboard"
              className="px-4 py-2.5 rounded-xl border border-[#D5DED8] dark:border-[#304036] bg-[#EEF4EF] dark:bg-[#223128] hover:bg-[#D5DED8] dark:hover:bg-[#304036] text-[#17231C] dark:text-[#F1F6F2] text-xs sm:text-sm font-semibold transition"
            >
              Dashboard
            </Link>
          </div>
        </div>

        {/* Analytics KPIs Section */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#FFFFFF] dark:bg-[#17211B] p-5 rounded-2xl border border-[#D5DED8] dark:border-[#304036] shadow-xs hover:shadow-md transition space-y-1">
            <div className="flex items-center justify-between text-[#68776D] dark:text-[#98A99E] mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Internships</span>
              <Building2 className="w-4 h-4 text-[#2F6B4F] dark:text-[#78B895]" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#142019] dark:text-[#FFFFFF]">
              {analytics?.total_internships ?? 0}
            </div>
            <div className="text-xs text-[#526158] dark:text-[#98A99E] mt-1">
              {analytics?.active_internships ?? 0} active / {analytics?.completed_internships ?? 0} completed
            </div>
          </div>

          <div className="bg-[#FFFFFF] dark:bg-[#17211B] p-5 rounded-2xl border border-[#D5DED8] dark:border-[#304036] shadow-xs hover:shadow-md transition space-y-1">
            <div className="flex items-center justify-between text-[#68776D] dark:text-[#98A99E] mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider">Scholars Mentored</span>
              <GraduationCap className="w-4 h-4 text-[#356F9D] dark:text-[#80B5DD]" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#142019] dark:text-[#FFFFFF]">
              {analytics?.completed_students_count ?? 0}
            </div>
            <div className="text-xs text-[#526158] dark:text-[#98A99E] mt-1">
              from {analytics?.total_applications ?? 0} total applications
            </div>
          </div>

          <div className="bg-[#FFFFFF] dark:bg-[#17211B] p-5 rounded-2xl border border-[#D5DED8] dark:border-[#304036] shadow-xs hover:shadow-md transition space-y-1">
            <div className="flex items-center justify-between text-[#68776D] dark:text-[#98A99E] mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider">Avg Attendance</span>
              <Clock className="w-4 h-4 text-[#A96F16] dark:text-[#E5B85C]" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#142019] dark:text-[#FFFFFF]">
              {analytics?.average_attendance_percentage ? `${analytics.average_attendance_percentage}%` : "100%"}
            </div>
            <div className="text-xs text-[#2F7D4A] dark:text-[#7BC894] font-semibold mt-1">
              Verified clinical OPD logs
            </div>
          </div>

          <div className="bg-[#FFFFFF] dark:bg-[#17211B] p-5 rounded-2xl border border-[#D5DED8] dark:border-[#304036] shadow-xs hover:shadow-md transition space-y-1">
            <div className="flex items-center justify-between text-[#68776D] dark:text-[#98A99E] mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider">Student Rating</span>
              <Star className="w-4 h-4 text-[#A96F16] dark:text-[#E5B85C] fill-current" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#142019] dark:text-[#FFFFFF] flex items-center gap-1.5">
              {analytics?.average_student_rating ? analytics.average_student_rating.toFixed(1) : "5.0"}
              <span className="text-xs text-[#68776D] dark:text-[#98A99E] font-normal">/ 5.0</span>
            </div>
            <div className="text-xs text-[#A96F16] dark:text-[#E5B85C] font-semibold mt-1 flex items-center gap-1">
              ★★★★★ Top Mentorship Score
            </div>
          </div>
        </div>

        {/* Filters & Search Header */}
        <div className="bg-[#FFFFFF] dark:bg-[#17211B] p-4 rounded-2xl border border-[#D5DED8] dark:border-[#304036] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
            {["ALL", "ACTIVE", "COMPLETED", "CANCELLED"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  statusFilter === st
                    ? "bg-[#2F6B4F] dark:bg-[#78B895] text-white dark:text-[#0D1511] shadow-xs"
                    : "bg-[#EEF4EF] dark:bg-[#223128] text-[#526158] dark:text-[#98A99E] hover:text-[#17231C] dark:hover:text-[#F1F6F2]"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#68776D] dark:text-[#98A99E]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search scholar, title, token..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-[#D5DED8] dark:border-[#304036] bg-[#EEF4EF] dark:bg-[#223128] text-[#17231C] dark:text-[#F1F6F2] placeholder-[#68776D] dark:placeholder-[#98A99E] focus:outline-none focus:border-[#2F6B4F] dark:focus:border-[#78B895]"
            />
          </div>
        </div>

        {/* Rotation History List */}
        {loading ? (
          <div className="bg-[#FFFFFF] dark:bg-[#17211B] rounded-2xl p-12 text-center border border-[#D5DED8] dark:border-[#304036] shadow-xs">
            <div className="w-10 h-10 border-4 border-[#2F6B4F] dark:border-[#78B895] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-[#526158] dark:text-[#98A99E]">Loading mentorship records and credentials...</p>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="bg-[#FFFFFF] dark:bg-[#17211B] rounded-2xl p-12 text-center border border-[#D5DED8] dark:border-[#304036] shadow-xs">
            <History className="w-12 h-12 text-[#68776D] dark:text-[#98A99E] mx-auto mb-3" />
            <h3 className="text-base font-bold text-[#142019] dark:text-[#FFFFFF]">No Rotation History Records Found</h3>
            <p className="text-xs text-[#526158] dark:text-[#98A99E] mt-1 max-w-md mx-auto">
              No clinical mentorship records match the selected filter. Once you accept applicants and mark rotations as completed, records and certificates will appear here.
            </p>
            <div className="mt-5">
              <Link
                href="/doctor/applications"
                className="px-4 py-2 rounded-xl bg-[#2F6B4F] hover:bg-[#24563F] dark:bg-[#78B895] dark:hover:bg-[#91CAA8] text-white dark:text-[#0D1511] text-xs font-bold transition shadow-xs"
              >
                Review Student Applications
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
                  className="bg-[#FFFFFF] dark:bg-[#17211B] p-5 sm:p-6 rounded-2xl border border-[#D5DED8] dark:border-[#304036] shadow-xs hover:shadow-md transition flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                >
                  {/* Info Column */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase ${
                          isCompleted
                            ? "bg-[#DCEBE1] dark:bg-[#294637] text-[#2F7D4A] dark:text-[#7BC894] border border-[#2F7D4A]/30"
                            : item.status === "ACCEPTED" || item.status === "ACTIVE"
                            ? "bg-[#DCEBE1] dark:bg-[#294637] text-[#2F6B4F] dark:text-[#78B895] border border-[#2F6B4F]/30"
                            : "bg-[#EEF4EF] dark:bg-[#223128] text-[#526158] dark:text-[#98A99E] border border-[#D5DED8] dark:border-[#304036]"
                        }`}
                      >
                        {item.status}
                      </span>
                      {item.specialization && (
                        <span className="px-2 py-0.5 rounded-md bg-[#EEF4EF] dark:bg-[#223128] text-[#2F6B4F] dark:text-[#78B895] text-[11px] font-semibold border border-[#D5DED8] dark:border-[#304036]">
                          {item.specialization}
                        </span>
                      )}
                      {item.certificate_token && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[#A96F16] dark:text-[#E5B85C] bg-[#FFF8E6] dark:bg-[#3D2E14] px-2 py-0.5 rounded-md border border-[#A96F16]/30">
                          <Award className="w-3 h-3 text-[#A96F16] dark:text-[#E5B85C]" />
                          {item.certificate_token}
                        </span>
                      )}
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-[#142019] dark:text-[#FFFFFF]">
                      {item.student_name || "Ayurveda Scholar"} &mdash; {item.internship_title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#526158] dark:text-[#98A99E]">
                      <div className="flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-[#68776D] dark:text-[#98A99E]" />
                        {item.clinic_name || item.organization_name}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[#68776D] dark:text-[#98A99E]" />
                        {item.start_date || "Term"} to {item.completion_date || item.end_date || "Present"}
                      </div>
                    </div>
                  </div>

                  {/* Metrics & Ratings */}
                  <div className="flex flex-wrap items-center gap-4 sm:gap-6 border-t lg:border-t-0 pt-3 lg:pt-0 border-[#D5DED8] dark:border-[#304036]">
                    <div className="text-left sm:text-center">
                      <div className="text-[11px] text-[#68776D] dark:text-[#98A99E] font-medium">Attendance</div>
                      <div className="text-sm font-bold text-[#17231C] dark:text-[#F1F6F2]">{item.attendance_percentage}%</div>
                    </div>

                    {item.doctor_rating && (
                      <div className="text-left sm:text-center">
                        <div className="text-[11px] text-[#68776D] dark:text-[#98A99E] font-medium">Supervisor Score</div>
                        <div className="text-sm font-bold text-[#2F7D4A] dark:text-[#7BC894] flex items-center gap-0.5">
                          <Star className="w-3.5 h-3.5 text-[#2F7D4A] dark:text-[#7BC894] fill-current" />
                          {item.doctor_rating}/5
                        </div>
                      </div>
                    )}

                    {item.student_rating && (
                      <div className="text-left sm:text-center">
                        <div className="text-[11px] text-[#68776D] dark:text-[#98A99E] font-medium">Student Review</div>
                        <div className="text-sm font-bold text-[#A96F16] dark:text-[#E5B85C] flex items-center gap-0.5">
                          <Star className="w-3.5 h-3.5 text-[#A96F16] dark:text-[#E5B85C] fill-current" />
                          {item.student_rating}/5
                        </div>
                      </div>
                    )}

                    {/* Action Links */}
                    <div className="flex items-center gap-2 shrink-0">
                      {item.certificate_token && (
                        <Link
                          href={`/verify/certificate/${item.certificate_token}`}
                          target="_blank"
                          className="px-3 py-1.5 rounded-xl border border-[#A96F16]/30 bg-[#FFF8E6] dark:bg-[#3D2E14] hover:bg-[#FEE9B6] dark:hover:bg-[#4E3B1B] text-[#A96F16] dark:text-[#E5B85C] text-xs font-semibold flex items-center gap-1 transition"
                        >
                          <Award className="w-3.5 h-3.5 text-[#A96F16] dark:text-[#E5B85C]" />
                          Certificate
                          <ExternalLink className="w-3 h-3 text-[#A96F16] dark:text-[#E5B85C]" />
                        </Link>
                      )}

                      <Link
                        href={`/doctor/progress/${item.application_id}`}
                        className="px-3.5 py-1.5 rounded-xl bg-[#2F6B4F] hover:bg-[#24563F] dark:bg-[#78B895] dark:hover:bg-[#91CAA8] text-white dark:text-[#0D1511] text-xs font-bold flex items-center gap-1 transition shadow-xs"
                      >
                        Progress Hub
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
