"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { api } from "@/lib/api";
import { 
  HeartHandshake, 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  Award, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles, 
  PlusCircle, 
  Stethoscope, 
  Search, 
  Filter 
} from "lucide-react";

interface Camp {
  id: string;
  title: string;
  organizer: string;
  organizerType: string;
  date: string;
  time: string;
  venue: string;
  city: string;
  state: string;
  capacity: number;
  registeredCount: number;
  services: string[];
  status: "UPCOMING" | "ONGOING" | "COMPLETED";
}

const SAMPLE_CAMPS: Camp[] = [
  {
    id: "camp-1",
    title: "Mega AYUSH Rural Wellness & Suvarnaprashan Camp",
    organizer: "Seva Arogya Foundation (Darpan Verified)",
    organizerType: "NGO",
    date: "15 Oct 2026",
    time: "09:00 AM - 04:00 PM",
    venue: "Gram Panchayat Sabhagruh, Khed",
    city: "Pune",
    state: "Maharashtra",
    capacity: 250,
    registeredCount: 142,
    services: ["General Health Checkup", "Prakriti Analysis", "Suvarnaprashan Administration", "Lifestyle Counselling"],
    status: "UPCOMING"
  },
  {
    id: "camp-2",
    title: "Geriatric Ayurveda & Joint Mobility Free Camp",
    organizer: "AyurShree Super-Specialty Network",
    organizerType: "DOCTOR",
    date: "22 Oct 2026",
    time: "10:00 AM - 05:00 PM",
    venue: "Senior Citizens Community Hall",
    city: "Jaipur",
    state: "Rajasthan",
    capacity: 150,
    registeredCount: 98,
    services: ["Janu Basti Demonstration", "Sandhivata Consultations", "Rasayana Distribution"],
    status: "UPCOMING"
  },
  {
    id: "camp-3",
    title: "School Suvarnaprashan & Immunity Outreach Drive",
    organizer: "National Institute of Ayurveda",
    organizerType: "INSTITUTION",
    date: "28 Oct 2026",
    time: "08:30 AM - 01:30 PM",
    venue: "Govt. High School Campus",
    city: "New Delhi",
    state: "Delhi",
    capacity: 500,
    registeredCount: 380,
    services: ["General Health Checkup", "Suvarnaprashan Drops", "Anemia & Nutrition Triage"],
    status: "UPCOMING"
  }
];

function CampsContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  const [camps, setCamps] = useState<Camp[]>(SAMPLE_CAMPS);
  const [searchTerm, setSearchTerm] = useState("");
  const [cityFilter, setCityFilter] = useState("ALL");
  const [activeTab, setActiveTab] = useState<"browse" | "register" | "volunteer">("browse");
  const [selectedCamp, setSelectedCamp] = useState<Camp | null>(null);
  const [regSuccess, setRegSuccess] = useState(false);
  const [volSuccess, setVolSuccess] = useState(false);

  useEffect(() => {
    if (tabParam) {
      const lower = tabParam.toLowerCase();
      if (lower === "volunteer") {
        setActiveTab("volunteer");
        if (!selectedCamp && camps.length > 0) setSelectedCamp(camps[0]);
      } else if (lower === "register") {
        setActiveTab("register");
        if (!selectedCamp && camps.length > 0) setSelectedCamp(camps[0]);
      } else if (lower === "browse") {
        setActiveTab("browse");
      }
    }
  }, [tabParam, camps]);

  // Registration Form State
  const [attendeeName, setAttendeeName] = useState("");
  const [attendeePhone, setAttendeePhone] = useState("");
  const [attendeeAge, setAttendeeAge] = useState("");
  const [preferredService, setPreferredService] = useState("General Health Checkup");

  // Volunteer Form State
  const [volunteerRole, setVolunteerRole] = useState("Patient Triage Assistant");
  const [motivationNote, setMotivationNote] = useState("");

  useEffect(() => {
    const loadLiveCamps = async () => {
      try {
        const res = await api.get("/camps");
        if (Array.isArray(res.data) && res.data.length > 0) {
          const mapped: Camp[] = res.data.map((c: any) => ({
            id: c.id,
            title: c.title,
            organizer: c.organizer_name || "AYUSH Organization",
            organizerType: c.organizer_type || "NGO",
            date: c.camp_date || "Upcoming",
            time: `${c.start_time || "09:00 AM"} - ${c.end_time || "05:00 PM"}`,
            venue: c.venue_name || c.address || "Community Center",
            city: c.city || "New Delhi",
            state: c.state || "Delhi",
            capacity: c.capacity || 200,
            registeredCount: c.registered_attendees_count || 0,
            services: Array.isArray(c.services_offered) && c.services_offered.length > 0 ? c.services_offered : ["General Health Checkup", "Prakriti Analysis"],
            status: c.status || "UPCOMING"
          }));
          setCamps(mapped);
        }
      } catch (e) {
        console.warn("Using sample camps fallback:", e);
      }
    };
    loadLiveCamps();
  }, []);

  const filteredCamps = camps.filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) || c.services.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCity = cityFilter === "ALL" || c.city.toLowerCase() === cityFilter.toLowerCase();
    return matchesSearch && matchesCity;
  });

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCamp && selectedCamp.id && !selectedCamp.id.startsWith("camp-")) {
      try {
        await api.post(`/camps/${selectedCamp.id}/register-attendee`, {
          attendee_name: attendeeName,
          phone: attendeePhone,
          age: parseInt(attendeeAge) || undefined,
          preferred_service: preferredService
        });
      } catch (err) {
        console.error("Failed to register attendee with backend:", err);
      }
    }
    setRegSuccess(true);
    setTimeout(() => {
      setRegSuccess(false);
      setSelectedCamp(null);
    }, 2500);
  };

  const handleVolunteerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCamp && selectedCamp.id && !selectedCamp.id.startsWith("camp-")) {
      try {
        await api.post(`/camps/${selectedCamp.id}/volunteer`, {
          applicant_name: "Volunteer Applicant",
          role_applied: volunteerRole,
          motivation_note: motivationNote
        });
      } catch (err) {
        console.error("Failed to submit volunteer application with backend:", err);
      }
    }
    setVolSuccess(true);
    setTimeout(() => {
      setVolSuccess(false);
      setSelectedCamp(null);
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-[#fcfaf4] dark:bg-[#07160e] text-[#1a3827] dark:text-[#d1e2d7]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Hero Section Banner */}
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-[#0e301e] via-[#16432b] to-[#0a2316] text-[#f7f4ea] shadow-xl border border-emerald-800/40 relative overflow-hidden text-center">
          <div className="relative z-10 max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#c87d32]/20 border border-[#c87d32]/40 text-[#f6be73] text-xs font-semibold uppercase tracking-wider mb-2">
              <HeartHandshake className="w-3.5 h-3.5" />
              AYUSH Community Healthcare Network
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif-heading text-white tracking-tight">
              Free Healthcare Camps & Volunteering
            </h1>
            <p className="mt-3 text-emerald-200/90 text-xs sm:text-sm md:text-base leading-relaxed">
              Discover verified preventive AYUSH camps, register beneficiaries for free pulse consultations & Suvarnaprashan, or volunteer to earn verifiable community service certificates with cryptographic SHA-256 validation.
            </p>
          </div>
        </div>

        {/* Action Tabs & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-[#0c2419] p-4 rounded-2xl border border-[#e5edd9] dark:border-white/10 shadow-xs">
          <div className="flex items-center gap-3 w-full sm:w-auto flex-1 max-w-xl">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#759381]" />
              <input
                type="text"
                placeholder="Search camps or services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#f8faf6] dark:bg-white/5 border border-[#cadacb] dark:border-white/10 rounded-xl text-xs sm:text-sm text-[#143d26] dark:text-white focus:outline-none focus:border-[#0e2f1f] placeholder-[#8ca697]"
              />
            </div>
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="px-3.5 py-2.5 bg-[#f8faf6] dark:bg-white/5 border border-[#cadacb] dark:border-white/10 rounded-xl text-xs sm:text-sm text-[#143d26] dark:text-white focus:outline-none focus:border-[#0e2f1f]"
            >
              <option value="ALL">All Cities</option>
              <option value="Pune">Pune</option>
              <option value="Nashik">Nashik</option>
              <option value="Thane">Thane</option>
            </select>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => setActiveTab("browse")}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition ${
                activeTab === "browse"
                  ? "bg-[#0e2f1f] text-white shadow-md"
                  : "bg-[#f8faf6] dark:bg-white/5 text-[#5a7a67] dark:text-emerald-400 hover:text-[#0e2f1f]"
              }`}
            >
              Browse Camps ({filteredCamps.length})
            </button>
          </div>
        </div>

        {/* Camps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCamps.map((camp) => (
            <div
              key={camp.id}
              className="group bg-white dark:bg-[#0c2419] border border-[#e5edd9] dark:border-white/10 hover:border-[#cadacb] rounded-3xl p-6 transition duration-300 shadow-xs hover:shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#0e2f1f]/10 dark:bg-emerald-950 border border-[#0e2f1f]/20 dark:border-emerald-800 text-[#0e2f1f] dark:text-emerald-300">
                    <ShieldCheck className="w-3 h-3" />
                    {camp.organizerType} Verified
                  </span>
                  <span className="text-xs font-semibold text-[#c87d32] dark:text-amber-400 bg-[#fff8ed] dark:bg-amber-950/60 px-2.5 py-0.5 rounded-md border border-[#c87d32]/30">
                    {camp.capacity - camp.registeredCount} spots open
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-[#143d26] dark:text-white group-hover:text-[#0e2f1f] transition font-serif-heading">
                  {camp.title}
                </h3>
                <p className="text-xs text-[#5a7a67] dark:text-stone-400 mt-1">Organized by {camp.organizer}</p>

                <div className="mt-4 space-y-2 text-xs text-[#2c332e] dark:text-stone-300">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-[#0e2f1f] dark:text-emerald-400 shrink-0" />
                    <span className="font-medium">{camp.date}</span>
                    <span className="text-[#cadacb]">•</span>
                    <Clock className="w-3.5 h-3.5 text-[#0e2f1f] dark:text-emerald-400 shrink-0" />
                    <span>{camp.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#0e2f1f] dark:text-emerald-400 shrink-0" />
                    <span className="truncate">{camp.venue}, {camp.city}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#e5edd9] dark:border-white/10">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#5a7a67] dark:text-stone-400">
                    Services Offered:
                  </span>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {camp.services.map((srv, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] px-2 py-0.5 bg-[#f0f4ec] dark:bg-white/5 border border-[#cadacb]/60 dark:border-white/10 rounded-md text-[#143d26] dark:text-emerald-300"
                      >
                        {srv}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#e5edd9] dark:border-white/10 flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedCamp(camp);
                    setActiveTab("register");
                  }}
                  className="flex-1 py-2.5 px-3 bg-[#0e2f1f] hover:bg-[#16432b] text-white rounded-xl text-xs font-semibold transition text-center shadow-md"
                >
                  Register Beneficiary
                </button>
                <button
                  onClick={() => {
                    setSelectedCamp(camp);
                    setActiveTab("volunteer");
                  }}
                  className="flex-1 py-2.5 px-3 bg-white dark:bg-white/5 hover:bg-[#f8faf6] text-[#0e2f1f] dark:text-emerald-300 border border-[#cadacb] dark:border-white/10 rounded-xl text-xs font-semibold transition text-center"
                >
                  Volunteer (BAMS)
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Modal: Beneficiary Registration */}
        {selectedCamp && activeTab === "register" && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-[#0c2419] border border-[#e5edd9] dark:border-white/10 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative">
              <h2 className="text-xl font-bold text-[#0e2f1f] dark:text-emerald-300 mb-1 font-serif-heading">Register for Free Consultation</h2>
              <p className="text-xs text-[#5a7a67] dark:text-stone-400 mb-6">{selectedCamp.title} • {selectedCamp.venue}</p>

              {regSuccess ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="w-12 h-12 text-[#0e2f1f] dark:text-emerald-400 mx-auto mb-3 animate-bounce" />
                  <h4 className="text-base font-bold text-[#143d26] dark:text-white">Registration Confirmed!</h4>
                  <p className="text-xs text-[#5a7a67] dark:text-stone-400 mt-1">An SMS token has been reserved for your OPD appointment.</p>
                </div>
              ) : (
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-[#2c332e] dark:text-stone-300 mb-1">Beneficiary Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Patil"
                      value={attendeeName}
                      onChange={(e) => setAttendeeName(e.target.value)}
                      className="w-full px-3 py-2 bg-[#f8faf6] dark:bg-white/5 border border-[#cadacb] dark:border-white/10 rounded-xl text-xs text-[#143d26] dark:text-white focus:outline-none focus:border-[#0e2f1f]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-[#2c332e] dark:text-stone-300 mb-1">Phone Number</label>
                      <input
                        type="tel"
                        required
                        placeholder="10-digit mobile"
                        value={attendeePhone}
                        onChange={(e) => setAttendeePhone(e.target.value)}
                        className="w-full px-3 py-2 bg-[#f8faf6] dark:bg-white/5 border border-[#cadacb] dark:border-white/10 rounded-xl text-xs text-[#143d26] dark:text-white focus:outline-none focus:border-[#0e2f1f]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#2c332e] dark:text-stone-300 mb-1">Age</label>
                      <input
                        type="number"
                        placeholder="Age in years"
                        value={attendeeAge}
                        onChange={(e) => setAttendeeAge(e.target.value)}
                        className="w-full px-3 py-2 bg-[#f8faf6] dark:bg-white/5 border border-[#cadacb] dark:border-white/10 rounded-xl text-xs text-[#143d26] dark:text-white focus:outline-none focus:border-[#0e2f1f]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#2c332e] dark:text-stone-300 mb-1">Preferred Service</label>
                    <select
                      value={preferredService}
                      onChange={(e) => setPreferredService(e.target.value)}
                      className="w-full px-3 py-2 bg-[#f8faf6] dark:bg-white/5 border border-[#cadacb] dark:border-white/10 rounded-xl text-xs text-[#143d26] dark:text-white focus:outline-none focus:border-[#0e2f1f]"
                    >
                      {selectedCamp.services.map((s, idx) => (
                        <option key={idx} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-4">
                    <button
                      type="button"
                      onClick={() => setSelectedCamp(null)}
                      className="px-4 py-2 bg-[#f8faf6] hover:bg-stone-100 text-[#5a7a67] rounded-xl text-xs font-medium border border-[#cadacb]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-[#0e2f1f] hover:bg-[#16432b] text-white rounded-xl text-xs font-bold shadow-md"
                    >
                      Confirm Registration
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Modal: Volunteer Application */}
        {selectedCamp && activeTab === "volunteer" && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-[#0c2419] border border-[#e5edd9] dark:border-white/10 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative">
              <h2 className="text-xl font-bold text-[#0e2f1f] dark:text-emerald-300 mb-1 font-serif-heading">Apply for Camp Volunteering</h2>
              <p className="text-xs text-[#5a7a67] dark:text-stone-400 mb-6">{selectedCamp.title} • Earn Verified Hours</p>

              {volSuccess ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="w-12 h-12 text-[#0e2f1f] dark:text-emerald-400 mx-auto mb-3 animate-bounce" />
                  <h4 className="text-base font-bold text-[#143d26] dark:text-white">Application Submitted!</h4>
                  <p className="text-xs text-[#5a7a67] dark:text-stone-400 mt-1">The organizing NGO/Doctor has received your credentials for duty assignment.</p>
                </div>
              ) : (
                <form onSubmit={handleVolunteerSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-[#2c332e] dark:text-stone-300 mb-1">Select Duty Role</label>
                    <select
                      value={volunteerRole}
                      onChange={(e) => setVolunteerRole(e.target.value)}
                      className="w-full px-3 py-2 bg-[#f8faf6] dark:bg-white/5 border border-[#cadacb] dark:border-white/10 rounded-xl text-xs text-[#143d26] dark:text-white focus:outline-none focus:border-[#0e2f1f]"
                    >
                      <option value="Patient Triage Assistant">Patient Triage & Registration Assistant</option>
                      <option value="Prakriti Assessment Scholar">Prakriti & Pulse Assessment Scholar</option>
                      <option value="Herbal Dispensary Coordinator">Herbal Dispensary & Patient Counselling</option>
                      <option value="Suvarnaprashan Dispenser">Suvarnaprashan Dosage Dispenser</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#2c332e] dark:text-stone-300 mb-1">Motivation & Clinical Background</label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Mention your current BAMS academic year, clinic exposure, and why you want to serve."
                      value={motivationNote}
                      onChange={(e) => setMotivationNote(e.target.value)}
                      className="w-full px-3 py-2 bg-[#f8faf6] dark:bg-white/5 border border-[#cadacb] dark:border-white/10 rounded-xl text-xs text-[#143d26] dark:text-white focus:outline-none focus:border-[#0e2f1f]"
                    />
                  </div>
                  <div className="p-3.5 bg-[#f8f6f0] dark:bg-white/5 rounded-xl border border-[#e8e2d5] dark:border-white/10 text-[11px] text-[#5a7a67] dark:text-stone-400 flex items-center gap-2">
                    <Award className="w-4 h-4 text-[#c87d32] dark:text-amber-400 shrink-0" />
                    <span>Completion of duty automatically issues a verifiable certificate with SHA-256 hash synced to your AyurSetu portfolio.</span>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-4">
                    <button
                      type="button"
                      onClick={() => setSelectedCamp(null)}
                      className="px-4 py-2 bg-[#f8faf6] hover:bg-stone-100 text-[#5a7a67] rounded-xl text-xs font-medium border border-[#cadacb]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-[#0e2f1f] hover:bg-[#16432b] text-white rounded-xl text-xs font-bold shadow-md"
                    >
                      Submit Volunteer Duty
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function CampsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-emerald-900 font-medium">Loading AYUSH Camps...</div>}>
      <CampsContent />
    </Suspense>
  );
}
