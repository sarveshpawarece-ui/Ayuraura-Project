"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import VerifiedDoctorBadge from "@/components/doctor/VerifiedDoctorBadge";
import {
  Briefcase,
  Search,
  MapPin,
  Clock,
  Users,
  Building2,
  Calendar,
  Sparkles,
  Award,
  ChevronRight,
  Filter,
  DollarSign
} from "lucide-react";
import { api } from "@/lib/api";

const SPECIALIZATION_FILTERS = [
  "ALL",
  "Panchakarma",
  "Kayachikitsa",
  "Dravyaguna",
  "General Ayurveda",
  "Rasa Shastra",
  "Shalya Tantra",
  "Swasthavritta"
];

const MODE_FILTERS = ["ALL", "ON_SITE", "HYBRID", "REMOTE"];

export default function PublicInternshipsDirectoryPage() {
  const [internships, setInternships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpec, setSelectedSpec] = useState("ALL");
  const [selectedMode, setSelectedMode] = useState("ALL");
  const [cityFilter, setCityFilter] = useState("");

  const loadInternships = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (selectedSpec !== "ALL") params.append("specialization", selectedSpec);
      if (selectedMode !== "ALL") params.append("mode", selectedMode);
      if (cityFilter) params.append("city", cityFilter);

      const res = await api.get(`/internships?${params.toString()}`);
      setInternships(res.data);
    } catch (err) {
      console.error("Failed to load internships:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadInternships();
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedSpec, selectedMode, cityFilter]);

  return (
    <div className="min-h-screen bg-[#fcfaf4] dark:bg-[#07160e] text-[#1a3827] dark:text-[#d1e2d7]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Hero Section */}
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-[#0e301e] via-[#16432b] to-[#0a2316] text-[#f7f4ea] shadow-xl border border-emerald-800/40 relative overflow-hidden">
          <div className="relative z-10 max-w-3xl space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
              NATIONAL AYURVEDIC CLINICAL TRAINING PORTAL
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif-heading text-white">
              Discover Clinical & Practice Internships
            </h1>
            <p className="text-xs sm:text-sm text-emerald-200/90 leading-relaxed">
              Explore verified clinical rotations, Panchakarma training centers, and hospital apprenticeships mentored by experienced Ayurvedic Vaidyas.
            </p>
          </div>
        </div>

        {/* Search & Filters Bar */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0c2419] border border-[#e5edd9] dark:border-white/10 shadow-xs space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-6 relative">
              <Search className="w-4 h-4 text-[#759381] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by keywords, diagnosis, Panchakarma, hospital..."
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#f8faf6] dark:bg-white/5 border border-[#cadacb] dark:border-white/10 text-xs sm:text-sm text-[#143d26] dark:text-white placeholder-[#8ca697] focus:outline-none"
              />
            </div>

            <div className="md:col-span-3">
              <input
                type="text"
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                placeholder="Filter by City (e.g. Pune, Delhi)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#f8faf6] dark:bg-white/5 border border-[#cadacb] dark:border-white/10 text-xs sm:text-sm text-[#143d26] dark:text-white placeholder-[#8ca697] focus:outline-none"
              />
            </div>

            <div className="md:col-span-3">
              <select
                value={selectedMode}
                onChange={(e) => setSelectedMode(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#f8faf6] dark:bg-white/5 border border-[#cadacb] dark:border-white/10 text-xs sm:text-sm text-[#143d26] dark:text-white"
              >
                <option value="ALL">All Modes</option>
                <option value="ON_SITE">On-Site</option>
                <option value="HYBRID">Hybrid</option>
                <option value="REMOTE">Remote</option>
              </select>
            </div>
          </div>

          {/* Specialization Tags */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-xs font-semibold text-[#5a7a67] dark:text-emerald-400 mr-2 shrink-0">Specialization:</span>
            {SPECIALIZATION_FILTERS.map((spec) => (
              <button
                key={spec}
                onClick={() => setSelectedSpec(spec)}
                className={`px-3 py-1 rounded-full font-semibold shrink-0 transition-all cursor-pointer ${
                  selectedSpec === spec
                    ? "bg-[#1a5b35] text-amber-100 shadow-xs"
                    : "bg-[#f8faf6] dark:bg-white/5 text-[#527260] dark:text-emerald-300 hover:bg-[#eef7f0]"
                }`}
              >
                {spec}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#5a7a67] dark:text-emerald-400 uppercase tracking-wider">
            {internships.length} Clinical Opportunities Available
          </span>
        </div>

        {/* Postings Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-64 bg-[#143924]/5 rounded-3xl" />
            ))}
          </div>
        ) : internships.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-[#0c2419] rounded-3xl border border-dashed border-[#d8e4d8] dark:border-white/10 space-y-3">
            <Briefcase className="w-12 h-12 mx-auto text-[#7e9d8b]" />
            <h3 className="text-lg font-bold font-serif-heading text-[#143d26] dark:text-white">
              No matching clinical internships found
            </h3>
            <p className="text-xs text-[#5a7a67] dark:text-emerald-300 max-w-sm mx-auto">
              Try adjusting your search criteria or clear specialization filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {internships.map((item) => (
              <div
                key={item.id}
                className="p-6 rounded-3xl bg-white dark:bg-[#0c2419] border border-[#e5edd9] dark:border-white/10 shadow-xs hover:border-[#1a5b35] transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#eef7f0] dark:bg-emerald-950/60 text-[#1a5b35] dark:text-emerald-300 border border-[#c8dccb] dark:border-emerald-700/50">
                      {item.internship_type}
                    </span>
                    {item.doctor_verification_status && (
                      <VerifiedDoctorBadge status={item.doctor_verification_status} size="sm" />
                    )}
                  </div>

                  <h2 className="text-lg font-bold font-serif-heading text-[#143d26] dark:text-white line-clamp-2">
                    {item.title}
                  </h2>

                  <p className="text-xs text-[#5a7a67] dark:text-emerald-300 font-medium">
                    {item.clinic_name || item.organization_name} {item.doctor_name ? `• Dr. ${item.doctor_name}` : ""}
                  </p>

                  <p className="text-xs text-[#466955] dark:text-emerald-200/80 line-clamp-3 leading-relaxed">
                    {item.description}
                  </p>

                  {item.skills_required?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {item.skills_required.slice(0, 4).map((s: string) => (
                        <span key={s} className="px-2 py-0.5 rounded-md bg-[#f4f7f3] dark:bg-white/5 text-[10px] font-semibold text-[#1a5b35] dark:text-emerald-300">
                          {s}
                        </span>
                      ))}
                      {item.skills_required.length > 4 && (
                        <span className="text-[10px] text-[#789684] self-center">+{item.skills_required.length - 4} more</span>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-[#edf3eb] dark:border-white/10 space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-xs text-[#5a7a67] dark:text-emerald-300">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#1a5b35]" />
                      <span>{item.location_city}, {item.location_state}</span>
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
                      <DollarSign className="w-3.5 h-3.5 text-[#1a5b35]" />
                      <span>{item.stipend_inr_month > 0 ? `₹${item.stipend_inr_month}/mo` : "Experience"}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-[#7a9986]">
                      Deadline: {item.deadline}
                    </span>

                    <Link
                      href={`/internships/${item.id}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1a5b35] hover:bg-[#124226] text-amber-100 text-xs font-bold shadow-xs transition-all cursor-pointer"
                    >
                      <span>View & Apply</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
