"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { FileText, Search, Filter, Calendar, Award, Building2, User } from "lucide-react";
import { api } from "@/lib/api";

export default function InstitutionApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    async function loadApps() {
      try {
        const res = await api.get("/institution/applications", {
          params: {
            search: search || undefined,
            status: statusFilter !== "ALL" ? statusFilter : undefined
          }
        });
        setApplications(res.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadApps();
  }, [search, statusFilter]);

  return (
    <div className="min-h-screen bg-[#F7F9F4] dark:bg-[#0D1511] text-[#17231C] dark:text-[#F1F6F2] font-sans flex flex-col transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] p-6 rounded-2xl shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DCEBE1] dark:bg-[#294637] text-[#2F6B4F] dark:text-[#78B895] border border-[#2F6B4F]/20 text-xs font-semibold uppercase tracking-wider mb-2">
              <FileText className="w-3.5 h-3.5" /> Placement & Application Monitoring (Read-Only)
            </div>
            <h1 className="text-2xl font-extrabold text-[#142019] dark:text-white">Student Application Monitor</h1>
            <p className="text-xs text-[#526158] dark:text-[#C1CEC5] mt-1">
              Track student application progress across industry partners, interview statuses, and placement offers.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] p-4 rounded-xl shadow-xs flex flex-col sm:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-[#68776D] dark:text-[#98A99E] absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search student name or opportunity title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#EEF4EF] dark:bg-[#223128] border border-[#D5DED8] dark:border-[#304036] rounded-xl pl-10 pr-4 py-2 text-xs text-[#17231C] dark:text-[#F1F6F2] placeholder-[#68776D] dark:placeholder-[#98A99E] focus:outline-none focus:border-[#2F6B4F] dark:focus:border-[#78B895]"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#EEF4EF] dark:bg-[#223128] border border-[#D5DED8] dark:border-[#304036] rounded-xl px-3 py-2 text-xs text-[#17231C] dark:text-[#F1F6F2] focus:outline-none focus:border-[#2F6B4F] dark:focus:border-[#78B895] w-full sm:w-auto"
          >
            <option value="ALL">All Application Statuses</option>
            <option value="APPLIED">Applied</option>
            <option value="REVIEWING">Under Review</option>
            <option value="SHORTLISTED">Shortlisted</option>
            <option value="INTERVIEW">Interview Scheduled</option>
            <option value="OFFERED">Offer Extended</option>
            <option value="ACCEPTED">Offer Accepted</option>
            <option value="REJECTED">Not Selected</option>
          </select>
        </div>

        {/* Applications Table */}
        <div className="bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#EEF4EF]/60 dark:bg-[#223128]/60 border-b border-[#D5DED8] dark:border-[#304036] text-[11px] font-bold text-[#526158] dark:text-[#C1CEC5] uppercase tracking-wider">
                  <th className="p-4">Student</th>
                  <th className="p-4">Opportunity & Partner</th>
                  <th className="p-4 text-center">Match Score</th>
                  <th className="p-4 text-center">Status Stage</th>
                  <th className="p-4 text-right">Applied Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D5DED8]/60 dark:divide-[#304036]/60 text-xs">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-[#EEF4EF]/40 dark:hover:bg-[#223128]/40 transition-colors">
                    <td className="p-4 font-bold text-[#17231C] dark:text-[#F1F6F2]">
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-[#2F6B4F] dark:text-[#78B895]" />
                        <span>{app.student_name}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-[#17231C] dark:text-[#F1F6F2]">{app.opportunity_title}</div>
                      <div className="text-[10px] text-[#68776D] dark:text-[#98A99E] mt-0.5">{app.organization_name}</div>
                    </td>
                    <td className="p-4 text-center font-mono font-bold text-[#2F6B4F] dark:text-[#78B895]">
                      {app.match_score}%
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${
                        app.status === "OFFERED" || app.status === "ACCEPTED"
                          ? "bg-[#DCEBE1] dark:bg-[#294637] text-[#2F7D4A] dark:text-[#7BC894] border-[#2F7D4A]/40"
                          : app.status === "INTERVIEW"
                          ? "bg-amber-100 dark:bg-amber-950/60 text-[#A96F16] dark:text-[#E5B85C] border-amber-300 dark:border-amber-700/50"
                          : "bg-[#EEF4EF] dark:bg-[#223128] text-[#526158] dark:text-[#C1CEC5] border-[#D5DED8] dark:border-[#304036]"
                      }`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="p-4 text-right text-[#68776D] dark:text-[#98A99E] text-[11px] font-mono">
                      {app.applied_at ? new Date(app.applied_at).toLocaleDateString() : "Recent"}
                    </td>
                  </tr>
                ))}

                {applications.length === 0 && !loading && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-[#68776D] dark:text-[#98A99E] text-xs italic">
                      No application records found matching filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
