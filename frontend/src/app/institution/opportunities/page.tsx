"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { Briefcase, Search, MapPin, Clock, Users, Award, ShieldCheck, ArrowUpRight } from "lucide-react";
import { api } from "@/lib/api";

export default function InstitutionOpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadOpps() {
      try {
        const res = await api.get("/institution/opportunities", {
          params: search ? { search } : {}
        });
        setOpportunities(res.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadOpps();
  }, [search]);

  return (
    <div className="min-h-screen bg-[#F7F9F4] dark:bg-[#0D1511] text-[#17231C] dark:text-[#F1F6F2] font-sans flex flex-col transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] p-6 rounded-2xl shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DCEBE1] dark:bg-[#294637] text-[#2F6B4F] dark:text-[#78B895] border border-[#2F6B4F]/20 text-xs font-semibold uppercase tracking-wider mb-2">
              <Briefcase className="w-3.5 h-3.5" /> Industry Opportunities (Read-Only)
            </div>
            <h1 className="text-2xl font-extrabold text-[#142019] dark:text-white">Industry Opportunity Discovery</h1>
            <p className="text-xs text-[#526158] dark:text-[#C1CEC5] mt-1">
              Explore active Ayush industry postings, research roles, and track institutional student participation.
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] p-4 rounded-xl shadow-xs flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#68776D] dark:text-[#98A99E] absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search opportunity title or organization..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#EEF4EF] dark:bg-[#223128] border border-[#D5DED8] dark:border-[#304036] rounded-xl pl-10 pr-4 py-2 text-xs text-[#17231C] dark:text-[#F1F6F2] placeholder-[#68776D] dark:placeholder-[#98A99E] focus:outline-none focus:border-[#2F6B4F] dark:focus:border-[#78B895]"
            />
          </div>
        </div>

        {/* Opportunities List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {opportunities.map((opp) => (
            <div key={opp.id} className="bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] p-6 rounded-2xl shadow-xs space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-[#EEF4EF] dark:bg-[#223128] text-[#2F6B4F] dark:text-[#78B895] border border-[#D5DED8] dark:border-[#304036]">
                    {opp.opportunity_type}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-[#DCEBE1] dark:bg-[#294637] text-[#2F7D4A] dark:text-[#7BC894] border border-[#2F7D4A]/30">
                    {opp.employment_type}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[#142019] dark:text-white">{opp.title}</h3>
                <div className="text-xs font-semibold text-[#526158] dark:text-[#C1CEC5] mt-1">{opp.organization_name}</div>

                {opp.location_text && (
                  <div className="flex items-center gap-1.5 text-xs text-[#68776D] dark:text-[#98A99E] mt-3">
                    <MapPin className="w-3.5 h-3.5 text-[#68776D] dark:text-[#98A99E]" />
                    <span>{opp.location_text} ({opp.work_mode})</span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-[#D5DED8]/80 dark:border-[#304036]/80 flex items-center justify-between text-xs">
                <div>
                  <div className="text-[10px] text-[#68776D] dark:text-[#98A99E] font-semibold uppercase">Institution Applicants</div>
                  <div className="text-sm font-extrabold text-[#2F6B4F] dark:text-[#78B895] font-mono mt-0.5">
                    {opp.institution_applicant_count} Students
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-[#68776D] dark:text-[#98A99E] font-semibold uppercase">Avg Match Score</div>
                  <div className="text-sm font-extrabold text-[#2F7D4A] dark:text-[#7BC894] font-mono mt-0.5">
                    {opp.average_institution_match}%
                  </div>
                </div>
              </div>
            </div>
          ))}

          {opportunities.length === 0 && !loading && (
            <div className="col-span-2 text-center py-12 text-[#68776D] dark:text-[#98A99E] text-xs italic">
              No industry opportunities found matching search parameters.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
