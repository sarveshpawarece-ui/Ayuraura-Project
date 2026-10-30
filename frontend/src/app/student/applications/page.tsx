"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { api } from "@/lib/api";
import {
  Briefcase,
  Search,
  Filter,
  ArrowUpDown,
  Calendar,
  ExternalLink,
  ChevronRight,
  Sparkles,
  BarChart3,
  Bookmark,
  Send,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  TrendingUp,
  FileText
} from "lucide-react";

export default function ApplicationDashboardPage() {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [sort, setSort] = useState("recently_updated");
  const [page, setPage] = useState(1);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {
        page,
        page_size: 15,
        sort,
      };
      if (search.trim()) params.search = search.trim();
      if (statusFilter !== "ALL") params.status = statusFilter;
      if (typeFilter !== "ALL") params.type = typeFilter;

      const [res, internshipAppsRes] = await Promise.allSettled([
        api.get("/students/me/applications", { params }),
        api.get("/internships/applications/me")
      ]);

      let combinedReport = res.status === "fulfilled" ? res.value.data : { applications: [], summary: {} };
      
      if (internshipAppsRes.status === "fulfilled" && Array.isArray(internshipAppsRes.value.data)) {
        const internApps = internshipAppsRes.value.data.map((ia: any) => ({
          id: ia.id,
          status: ia.status,
          match_score: ia.match_score,
          applied_date: ia.applied_at,
          applied_at: ia.applied_at,
          updated_at: ia.reviewed_at || ia.applied_at,
          opportunity: {
            id: ia.internship_id,
            title: ia.internship_title,
            opportunity_type: "INTERNSHIP",
            organization_name: ia.organization_name,
            city: ia.location_city,
            state: ia.location_state,
            work_mode: ia.mode,
            stipend_inr_month: ia.stipend_inr_month
          }
        }));

        // Filter internApps if filters active
        let filteredInternApps = internApps;
        if (typeFilter !== "ALL" && typeFilter !== "INTERNSHIP") {
          filteredInternApps = [];
        }
        if (statusFilter !== "ALL") {
          filteredInternApps = filteredInternApps.filter((x: any) => x.status === statusFilter);
        }
        if (search.trim()) {
          const s = search.toLowerCase();
          filteredInternApps = filteredInternApps.filter((x: any) =>
            (x.opportunity?.title || "").toLowerCase().includes(s) ||
            (x.opportunity?.organization_name || "").toLowerCase().includes(s)
          );
        }

        const existingApps = combinedReport.applications || [];
        combinedReport = {
          ...combinedReport,
          applications: [...filteredInternApps, ...existingApps],
          summary: {
            ...combinedReport.summary,
            total_applications: (combinedReport.summary?.total_applications || 0) + internApps.length,
            applied: (combinedReport.summary?.applied || 0) + internApps.filter((x: any) => x.status === "APPLIED").length,
            shortlisted: (combinedReport.summary?.shortlisted || 0) + internApps.filter((x: any) => x.status === "SHORTLISTED").length,
          }
        };
      }

      setReport(combinedReport);
    } catch (err) {
      console.error("Failed to load applications:", err);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, typeFilter, sort, search]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const summary = report?.summary || {};
  const apps = report?.applications || [];

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "SAVED":
        return "bg-[#EEF4EF] text-[#526158] border-[#D5DED8] dark:bg-[#223128] dark:text-[#C1CEC5] dark:border-[#304036]";
      case "PLANNED":
        return "bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-900";
      case "APPLIED":
        return "bg-[#DCEBE1] text-[#2F6B4F] border-[#B9C8BE] dark:bg-[#294637] dark:text-[#78B895] dark:border-[#425449] font-semibold";
      case "UNDER_REVIEW":
        return "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-900 font-semibold";
      case "SHORTLISTED":
        return "bg-teal-50 text-teal-800 border-teal-200 dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-900 font-semibold";
      case "INTERVIEW":
      case "INTERVIEWED":
        return "bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-900 font-bold";
      case "OFFERED":
        return "bg-yellow-50 text-yellow-800 border-yellow-300 dark:bg-yellow-950/50 dark:text-yellow-300 dark:border-yellow-800 font-bold";
      case "ACCEPTED":
        return "bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800 font-bold";
      case "REJECTED":
        return "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-900";
      case "WITHDRAWN":
        return "bg-zinc-100 text-zinc-700 border-zinc-300 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700";
      case "EXPIRED":
        return "bg-orange-50 text-orange-800 border-orange-200 dark:bg-orange-950/50 dark:text-orange-300 dark:border-orange-900";
      default:
        return "bg-[#EEF4EF] text-[#526158] border-[#D5DED8] dark:bg-[#223128] dark:text-[#C1CEC5] dark:border-[#304036]";
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9F4] dark:bg-[#0D1511] text-[#17231C] dark:text-[#F1F6F2] flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#D5DED8] dark:border-[#304036] pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-[#DCEBE1] dark:bg-[#294637] text-[#2F6B4F] dark:text-[#78B895] border border-[#B9C8BE] dark:border-[#425449]">
                <Briefcase className="w-6 h-6" />
              </span>
              <h1 className="text-3xl font-bold text-[#17231C] dark:text-[#F1F6F2] tracking-tight">My Applications</h1>
            </div>
            <p className="text-[#526158] dark:text-[#C1CEC5] text-sm pl-11">
              Track and manage your career opportunities, application statuses, and interview schedules.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <Link
              href="/student/applications/analytics"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#EEF4EF] dark:bg-[#223128] text-[#2F6B4F] dark:text-[#78B895] hover:bg-[#DCEBE1] dark:hover:bg-[#294637] border border-[#D5DED8] dark:border-[#304036] text-xs font-semibold transition-all shadow-xs"
            >
              <BarChart3 className="w-4 h-4" />
              Application Analytics
            </Link>
            <Link
              href="/student/opportunities"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#2F6B4F] hover:bg-[#24563F] dark:bg-[#78B895] dark:hover:bg-[#91CAA8] text-white dark:text-[#0D1511] text-xs font-bold transition-all shadow-xs"
            >
              <Search className="w-4 h-4" />
              Explore Opportunities
            </Link>
          </div>
        </div>

        {/* Top Summary Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          <div className="p-4 rounded-2xl bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] text-center space-y-1 shadow-xs">
            <p className="text-[11px] font-medium text-[#526158] dark:text-[#98A99E]">Total</p>
            <p className="text-2xl font-bold text-[#17231C] dark:text-[#F1F6F2]">{summary.total_applications || 0}</p>
          </div>
          <div className="p-4 rounded-2xl bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] text-center space-y-1 shadow-xs">
            <p className="text-[11px] font-medium text-[#526158] dark:text-[#98A99E] flex items-center justify-center gap-1">
              <Bookmark className="w-3.5 h-3.5" /> Saved
            </p>
            <p className="text-2xl font-bold text-[#17231C] dark:text-[#F1F6F2]">{summary.saved || 0}</p>
          </div>
          <div className="p-4 rounded-2xl bg-[#DCEBE1]/60 dark:bg-[#294637]/50 border border-[#B9C8BE] dark:border-[#425449] text-center space-y-1 shadow-xs">
            <p className="text-[11px] font-medium text-[#2F6B4F] dark:text-[#78B895] flex items-center justify-center gap-1">
              <Send className="w-3.5 h-3.5" /> Applied
            </p>
            <p className="text-2xl font-bold text-[#2F6B4F] dark:text-[#78B895]">{summary.applied || 0}</p>
          </div>
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-center space-y-1 shadow-xs">
            <p className="text-[11px] font-medium text-amber-800 dark:text-amber-300 flex items-center justify-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Review
            </p>
            <p className="text-2xl font-bold text-amber-800 dark:text-amber-300">{summary.under_review || 0}</p>
          </div>
          <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-center space-y-1 shadow-xs">
            <p className="text-[11px] font-medium text-purple-800 dark:text-purple-300 flex items-center justify-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Interview
            </p>
            <p className="text-2xl font-bold text-purple-800 dark:text-purple-300">{summary.interview || 0}</p>
          </div>
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-1 shadow-xs">
            <p className="text-[11px] font-medium text-emerald-800 dark:text-emerald-300 flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Offers
            </p>
            <p className="text-2xl font-bold text-emerald-800 dark:text-emerald-300">{(summary.offered || 0) + (summary.accepted || 0)}</p>
          </div>
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-center space-y-1 shadow-xs">
            <p className="text-[11px] font-medium text-rose-800 dark:text-rose-300 flex items-center justify-center gap-1">
              <XCircle className="w-3.5 h-3.5" /> Rejected
            </p>
            <p className="text-2xl font-bold text-rose-800 dark:text-rose-300">{summary.rejected || 0}</p>
          </div>
        </div>

        {/* Toolbar: Search, Filters, Sort */}
        <div className="bg-[#FFFFFF] dark:bg-[#17211B] rounded-3xl p-4 border border-[#D5DED8] dark:border-[#304036] shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-[#526158] dark:text-[#98A99E]" />
            <input
              type="text"
              placeholder="Search by title, organization, or notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#EEF4EF] dark:bg-[#223128] border border-[#D5DED8] dark:border-[#304036] text-[#17231C] dark:text-[#F1F6F2] text-xs rounded-2xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-[#2F6B4F] dark:focus:border-[#78B895] transition-all placeholder:text-[#68776D] dark:placeholder:text-[#98A99E]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Status Filter */}
            <div className="flex items-center gap-2 bg-[#EEF4EF] dark:bg-[#223128] border border-[#D5DED8] dark:border-[#304036] px-3 py-1.5 rounded-2xl text-xs">
              <Filter className="w-3.5 h-3.5 text-[#2F6B4F] dark:text-[#78B895]" />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="bg-transparent text-[#17231C] dark:text-[#F1F6F2] focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="SAVED">Saved</option>
                <option value="PLANNED">Planned</option>
                <option value="APPLIED">Applied</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="SHORTLISTED">Shortlisted</option>
                <option value="INTERVIEW">Interview</option>
                <option value="OFFERED">Offered</option>
                <option value="ACCEPTED">Accepted</option>
                <option value="REJECTED">Rejected</option>
                <option value="WITHDRAWN">Withdrawn</option>
                <option value="EXPIRED">Expired</option>
              </select>
            </div>

            {/* Type Filter */}
            <div className="flex items-center gap-2 bg-[#EEF4EF] dark:bg-[#223128] border border-[#D5DED8] dark:border-[#304036] px-3 py-1.5 rounded-2xl text-xs">
              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setPage(1);
                }}
                className="bg-transparent text-[#17231C] dark:text-[#F1F6F2] focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Types</option>
                <option value="JOB">Job</option>
                <option value="INTERNSHIP">Internship</option>
                <option value="RESEARCH">Research</option>
                <option value="PROJECT">Project</option>
                <option value="WORKSHOP">Workshop</option>
              </select>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2 bg-[#EEF4EF] dark:bg-[#223128] border border-[#D5DED8] dark:border-[#304036] px-3 py-1.5 rounded-2xl text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#526158] dark:text-[#98A99E]" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="bg-transparent text-[#17231C] dark:text-[#F1F6F2] focus:outline-none cursor-pointer"
              >
                <option value="recently_updated">Recently Updated</option>
                <option value="recently_applied">Recently Applied</option>
                <option value="deadline_soon">Deadline Soon</option>
                <option value="highest_match">Highest Match</option>
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
              </select>
            </div>
          </div>
        </div>

        {/* Applications List */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="inline-block w-8 h-8 border-4 border-[#2F6B4F] dark:border-[#78B895] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-[#526158] dark:text-[#C1CEC5]">Loading your applications...</p>
          </div>
        ) : apps.length === 0 ? (
          <div className="bg-[#FFFFFF] dark:bg-[#17211B] rounded-3xl p-12 text-center border border-[#D5DED8] dark:border-[#304036] space-y-4 max-w-xl mx-auto shadow-sm">
            <div className="p-4 rounded-full bg-[#DCEBE1] dark:bg-[#294637] text-[#2F6B4F] dark:text-[#78B895] inline-block">
              <FileText className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-[#17231C] dark:text-[#F1F6F2]">No Applications Found</h3>
              <p className="text-xs text-[#526158] dark:text-[#C1CEC5] leading-relaxed">
                You haven&apos;t saved or applied to any career opportunities matching the current filters.
              </p>
            </div>
            <Link
              href="/student/opportunities"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#2F6B4F] hover:bg-[#24563F] dark:bg-[#78B895] dark:hover:bg-[#91CAA8] text-white dark:text-[#0D1511] text-xs font-bold transition-all shadow-xs"
            >
              Explore Industry Opportunities <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Desktop Table View */}
            <div className="hidden md:block bg-[#FFFFFF] dark:bg-[#17211B] rounded-3xl border border-[#D5DED8] dark:border-[#304036] overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#EEF4EF] dark:bg-[#223128] text-[#526158] dark:text-[#C1CEC5] font-semibold border-b border-[#D5DED8] dark:border-[#304036]">
                    <th className="py-4 px-6">Opportunity & Organization</th>
                    <th className="py-4 px-4 text-center">Match at Apply</th>
                    <th className="py-4 px-4 text-center">Current Match</th>
                    <th className="py-4 px-4">Status</th>
                    <th className="py-4 px-4">Applied Date</th>
                    <th className="py-4 px-4">Deadline</th>
                    <th className="py-4 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D5DED8] dark:divide-[#304036] text-[#17231C] dark:text-[#F1F6F2]">
                  {apps.map((item: any) => (
                    <tr key={item.id} className="hover:bg-[#EEF4EF]/50 dark:hover:bg-[#223128]/50 transition-colors">
                      <td className="py-4 px-6 space-y-0.5">
                        <Link
                          href={`/student/applications/${item.id}`}
                          className="font-bold text-[#17231C] dark:text-[#F1F6F2] hover:text-[#2F6B4F] dark:hover:text-[#78B895] transition-colors text-sm block"
                        >
                          {item.title_snapshot || item.opportunity?.title}
                        </Link>
                        <p className="text-xs text-[#526158] dark:text-[#98A99E]">{item.organization_snapshot || item.opportunity?.organization_name}</p>
                      </td>

                      <td className="py-4 px-4 text-center font-mono font-bold text-[#A96F16] dark:text-[#E5B85C]">
                        {item.match_score_snapshot ? `${item.match_score_snapshot}%` : "N/A"}
                      </td>

                      <td className="py-4 px-4 text-center font-mono">
                        {item.current_match_score ? (
                          <div className="flex items-center justify-center gap-1">
                            <span className="font-bold text-[#2F7D4A] dark:text-[#7BC894]">{item.current_match_score}%</span>
                            {item.match_score_delta !== null && (
                              <span className={`text-[10px] ${item.match_score_delta >= 0 ? "text-[#2F7D4A] dark:text-[#7BC894]" : "text-[#B64040] dark:text-[#F18484]"}`}>
                                ({item.match_score_delta >= 0 ? `+${item.match_score_delta}` : item.match_score_delta})
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[#68776D] dark:text-[#98A99E]">-</span>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-[11px] border uppercase ${getStatusBadgeClass(item.status)}`}>
                          {item.status.replace("_", " ")}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-[#526158] dark:text-[#C1CEC5] font-mono text-[11px]">
                        {item.applied_at ? new Date(item.applied_at).toLocaleDateString() : "Not yet"}
                      </td>

                      <td className="py-4 px-4 text-[#526158] dark:text-[#C1CEC5] font-mono text-[11px]">
                        {item.application_deadline ? new Date(item.application_deadline).toLocaleDateString() : "Rolling"}
                      </td>

                      <td className="py-4 px-6 text-right">
                        <Link
                          href={`/student/applications/${item.id}`}
                          className="inline-flex items-center gap-1 text-[#2F6B4F] dark:text-[#78B895] hover:underline font-semibold text-xs transition-colors"
                        >
                          Manage <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="md:hidden space-y-3">
              {apps.map((item: any) => (
                <div key={item.id} className="p-5 rounded-3xl bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] space-y-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <Link href={`/student/applications/${item.id}`} className="font-bold text-[#17231C] dark:text-[#F1F6F2] text-base block hover:text-[#2F6B4F] dark:hover:text-[#78B895]">
                        {item.title_snapshot || item.opportunity?.title}
                      </Link>
                      <p className="text-xs text-[#526158] dark:text-[#98A99E]">{item.organization_snapshot || item.opportunity?.organization_name}</p>
                    </div>

                    <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] border uppercase shrink-0 ${getStatusBadgeClass(item.status)}`}>
                      {item.status.replace("_", " ")}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-[#EEF4EF] dark:bg-[#223128] p-3 rounded-2xl border border-[#D5DED8] dark:border-[#304036]">
                    <div>
                      <p className="text-[10px] text-[#526158] dark:text-[#98A99E]">Match at Apply</p>
                      <p className="font-mono font-bold text-[#A96F16] dark:text-[#E5B85C]">{item.match_score_snapshot}%</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#526158] dark:text-[#98A99E]">Current Match</p>
                      <p className="font-mono font-bold text-[#2F7D4A] dark:text-[#7BC894]">{item.current_match_score ? `${item.current_match_score}%` : "N/A"}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#D5DED8] dark:border-[#304036] text-xs">
                    <span className="text-[#526158] dark:text-[#C1CEC5] text-[11px]">
                      {item.applied_at ? `Applied: ${new Date(item.applied_at).toLocaleDateString()}` : "Saved Opportunity"}
                    </span>
                    <Link
                      href={`/student/applications/${item.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#2F6B4F] hover:bg-[#24563F] dark:bg-[#78B895] dark:hover:bg-[#91CAA8] text-white dark:text-[#0D1511] font-bold text-xs"
                    >
                      Manage <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
