"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import {
  Building2,
  Plus,
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  Bed,
  Sparkles,
  Edit3,
  Trash2,
  X,
  Save,
  AlertCircle,
  CheckCircle2,
  ShieldCheck
} from "lucide-react";
import { api } from "@/lib/api";

interface ClinicData {
  id: string;
  name: string;
  organization_type: string;
  description?: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode?: string;
  phone?: string;
  email?: string;
  website_url?: string;
  services_offered: string[];
  facilities: string[];
  working_hours?: string;
  bed_capacity?: number;
  is_verified: boolean;
  created_at: string;
}

export default function DoctorClinicsPage() {
  const [clinics, setClinics] = useState<ClinicData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingClinicId, setEditingClinicId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [orgType, setOrgType] = useState("AYURVEDIC_PANCHAKARMA_CENTRE");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [workingHours, setWorkingHours] = useState("Mon-Sat: 09:00 AM - 07:00 PM");
  const [bedCapacity, setBedCapacity] = useState<number>(0);
  const [servicesList, setServicesList] = useState<string[]>([]);
  const [newServiceTag, setNewServiceTag] = useState("");
  const [facilitiesList, setFacilitiesList] = useState<string[]>([]);
  const [newFacilityTag, setNewFacilityTag] = useState("");

  const loadClinics = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/doctors/clinics/me");
      setClinics(res.data);
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 401) {
        window.location.href = "/login";
        return;
      }
      setError(err.response?.data?.detail || "Unable to fetch clinics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClinics();
  }, []);

  const openCreateModal = () => {
    setEditingClinicId(null);
    setName("");
    setOrgType("AYURVEDIC_PANCHAKARMA_CENTRE");
    setDescription("");
    setAddress("");
    setCity("");
    setState("");
    setPincode("");
    setPhone("");
    setEmail("");
    setWebsiteUrl("");
    setWorkingHours("Mon-Sat: 09:00 AM - 07:00 PM");
    setBedCapacity(0);
    setServicesList(["Panchakarma", "Nadi Pariksha", "Kati Basti", "Shirodhara"]);
    setFacilitiesList(["Panchakarma Theater", "Herbal Pharmacy", "OPD Consultation"]);
    setShowModal(true);
  };

  const openEditModal = (clinic: ClinicData) => {
    setEditingClinicId(clinic.id);
    setName(clinic.name);
    setOrgType(clinic.organization_type);
    setDescription(clinic.description || "");
    setAddress(clinic.address);
    setCity(clinic.city);
    setState(clinic.state);
    setPincode(clinic.pincode || "");
    setPhone(clinic.phone || "");
    setEmail(clinic.email || "");
    setWebsiteUrl(clinic.website_url || "");
    setWorkingHours(clinic.working_hours || "Mon-Sat: 09:00 AM - 07:00 PM");
    setBedCapacity(clinic.bed_capacity || 0);
    setServicesList(clinic.services_offered || []);
    setFacilitiesList(clinic.facilities || []);
    setShowModal(true);
  };

  const handleSaveClinic = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMsg(null);

    const payload = {
      name,
      organization_type: orgType,
      description,
      address,
      city,
      state,
      country: "India",
      pincode,
      phone,
      email,
      website_url: websiteUrl,
      services_offered: servicesList,
      facilities: facilitiesList,
      working_hours: workingHours,
      bed_capacity: Number(bedCapacity)
    };

    try {
      if (editingClinicId) {
        await api.put(`/doctors/clinics/${editingClinicId}`, payload);
        setSuccessMsg("Clinic updated successfully.");
      } else {
        await api.post("/doctors/clinics", payload);
        setSuccessMsg("New clinic added successfully.");
      }
      setShowModal(false);
      await loadClinics();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || "Failed to save clinic profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClinic = async (clinicId: string) => {
    if (!confirm("Are you sure you want to delete this clinic location?")) return;
    try {
      await api.delete(`/doctors/clinics/${clinicId}`);
      setSuccessMsg("Clinic deleted.");
      await loadClinics();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || "Failed to delete clinic.");
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfaf4] dark:bg-[#07160e] text-[#1a3827] dark:text-[#d1e2d7]">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-[#5a7a67] dark:text-emerald-400">
              <Link href="/doctor/dashboard" className="hover:underline">Doctor Dashboard</Link>
              <span>/</span>
              <span className="font-bold text-[#143d26] dark:text-white">Clinic & Hospital Locations</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif-heading text-[#143d26] dark:text-white">
              My Clinical Establishments
            </h1>
          </div>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1a5b35] hover:bg-[#124226] text-amber-100 text-xs font-bold shadow-md transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Clinic / Hospital</span>
          </button>
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

        {/* Clinic Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
            {[1, 2].map((i) => (
              <div key={i} className="h-64 bg-[#143924]/5 rounded-3xl" />
            ))}
          </div>
        ) : clinics.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-[#0c2419] rounded-3xl border border-dashed border-[#d8e4d8] dark:border-white/10 space-y-3">
            <Building2 className="w-12 h-12 mx-auto text-[#7e9d8b]" />
            <h3 className="text-base font-bold font-serif-heading text-[#143d26] dark:text-white">
              No Clinics or Hospitals Added Yet
            </h3>
            <p className="text-xs text-[#5a7a67] dark:text-emerald-300 max-w-md mx-auto">
              Add your Ayurvedic OPD clinic, Panchakarma center, or Hospital establishment to offer internships and mentorship.
            </p>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1a5b35] text-amber-100 text-xs font-bold"
            >
              <Plus className="w-4 h-4" />
              <span>Add First Clinic</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {clinics.map((clinic) => (
              <div
                key={clinic.id}
                className="p-6 rounded-3xl bg-white dark:bg-[#0c2419] border border-[#e5edd9] dark:border-white/10 shadow-xs flex flex-col justify-between space-y-4 hover:border-[#1a5b35] transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold font-serif-heading text-[#143d26] dark:text-white">
                          {clinic.name}
                        </h3>
                        {clinic.is_verified && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            ✓ Verified
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-semibold text-[#1a5b35] dark:text-emerald-400">
                        {clinic.organization_type.replace(/_/g, " ")}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openEditModal(clinic)}
                        className="p-1.5 rounded-lg text-[#5a7a67] hover:text-[#143d26] hover:bg-[#eef7f0] transition-colors cursor-pointer"
                        title="Edit Clinic"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClinic(clinic.id)}
                        className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete Clinic"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {clinic.description && (
                    <p className="text-xs text-[#527260] dark:text-emerald-300/80 line-clamp-2">
                      {clinic.description}
                    </p>
                  )}

                  {/* Address & Contact Info */}
                  <div className="space-y-1.5 text-xs text-[#41624f] dark:text-emerald-200/90 pt-2 border-t border-[#edf3eb] dark:border-white/5">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#1a5b35] shrink-0" />
                      <span className="truncate">{clinic.address}, {clinic.city}, {clinic.state} {clinic.pincode ? `- ${clinic.pincode}` : ""}</span>
                    </div>
                    {clinic.working_hours && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-[#1a5b35] shrink-0" />
                        <span>{clinic.working_hours}</span>
                      </div>
                    )}
                    {clinic.bed_capacity !== undefined && clinic.bed_capacity > 0 && (
                      <div className="flex items-center gap-2">
                        <Bed className="w-3.5 h-3.5 text-[#1a5b35] shrink-0" />
                        <span>{clinic.bed_capacity} IPD Beds Available</span>
                      </div>
                    )}
                  </div>

                  {/* Services & Facilities Tags */}
                  {clinic.services_offered?.length > 0 && (
                    <div className="space-y-1 pt-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#6b8b78] dark:text-emerald-400">Services</span>
                      <div className="flex flex-wrap gap-1.5">
                        {clinic.services_offered.map((s) => (
                          <span
                            key={s}
                            className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#eef7f0] dark:bg-emerald-950/60 text-[#1a5b35] dark:text-emerald-300 border border-[#c8dccb] dark:border-emerald-700/50"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-[#edf3eb] dark:border-white/5 flex items-center justify-between text-[11px] text-[#718f7d]">
                  <span>Added {new Date(clinic.created_at).toLocaleDateString()}</span>
                  <span className="text-[#1a5b35] font-semibold">Ready for Internships</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal: Add or Edit Clinic */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <div className="w-full max-w-2xl bg-white dark:bg-[#0c2419] rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#d8e6d9] dark:border-white/10 max-h-[90vh] overflow-y-auto space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#edf3eb] dark:border-white/10">
                <h3 className="text-lg font-bold font-serif-heading text-[#143d26] dark:text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[#1a5b35]" />
                  <span>{editingClinicId ? "Edit Clinic Establishment" : "Add New Clinic / Hospital"}</span>
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveClinic} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#3b5947] dark:text-emerald-300 mb-1">
                      Clinic / Hospital Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. AyurSetu Panchakarma Clinic"
                      className="w-full px-3.5 py-2 rounded-xl border border-[#cadacb] dark:border-white/15 bg-white dark:bg-[#07160e] text-xs sm:text-sm text-[#143d26] dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#3b5947] dark:text-emerald-300 mb-1">
                      Establishment Type *
                    </label>
                    <select
                      value={orgType}
                      onChange={(e) => setOrgType(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#cadacb] dark:border-white/15 bg-white dark:bg-[#07160e] text-xs text-[#143d26] dark:text-white"
                    >
                      <option value="AYURVEDIC_PANCHAKARMA_CENTRE">Ayurvedic Panchakarma Centre</option>
                      <option value="AYURVEDIC_HOSPITAL">Ayurvedic Hospital (IPD & OPD)</option>
                      <option value="AYURVEDIC_CLINIC">Ayurvedic OPD Clinic</option>
                      <option value="AYUSH_WELLNESS_CENTRE">Ayush Wellness & Yoga Retreat</option>
                      <option value="RESEARCH_CENTRE">Clinical Research Facility</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#3b5947] dark:text-emerald-300 mb-1">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. 12/A, Ferguson College Road, Deccan Gymkhana"
                    className="w-full px-3.5 py-2 rounded-xl border border-[#cadacb] dark:border-white/15 bg-white dark:bg-[#07160e] text-xs text-[#143d26] dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#3b5947] dark:text-emerald-300 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Pune"
                      className="w-full px-3 py-2 rounded-xl border border-[#cadacb] dark:border-white/15 bg-white dark:bg-[#07160e] text-xs text-[#143d26] dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#3b5947] dark:text-emerald-300 mb-1">
                      State *
                    </label>
                    <input
                      type="text"
                      required
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="Maharashtra"
                      className="w-full px-3 py-2 rounded-xl border border-[#cadacb] dark:border-white/15 bg-white dark:bg-[#07160e] text-xs text-[#143d26] dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#3b5947] dark:text-emerald-300 mb-1">
                      Pincode
                    </label>
                    <input
                      type="text"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      placeholder="411004"
                      className="w-full px-3 py-2 rounded-xl border border-[#cadacb] dark:border-white/15 bg-white dark:bg-[#07160e] text-xs text-[#143d26] dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#3b5947] dark:text-emerald-300 mb-1">
                      Working Hours / OPD Timings
                    </label>
                    <input
                      type="text"
                      value={workingHours}
                      onChange={(e) => setWorkingHours(e.target.value)}
                      placeholder="Mon-Sat: 09:00 AM - 07:00 PM"
                      className="w-full px-3 py-2 rounded-xl border border-[#cadacb] dark:border-white/15 bg-white dark:bg-[#07160e] text-xs text-[#143d26] dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#3b5947] dark:text-emerald-300 mb-1">
                      Bed Capacity (IPD)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={bedCapacity}
                      onChange={(e) => setBedCapacity(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-[#cadacb] dark:border-white/15 bg-white dark:bg-[#07160e] text-xs text-[#143d26] dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#3b5947] dark:text-emerald-300 mb-1">
                      Clinic Phone
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full px-3 py-2 rounded-xl border border-[#cadacb] dark:border-white/15 bg-white dark:bg-[#07160e] text-xs text-[#143d26] dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#3b5947] dark:text-emerald-300 mb-1">
                    About the Centre / Facilities Summary
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe clinical capabilities, specialized panchakarma setups, in-house herbal pharmacy..."
                    className="w-full px-3 py-2 rounded-xl border border-[#cadacb] dark:border-white/15 bg-white dark:bg-[#07160e] text-xs text-[#143d26] dark:text-white"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#edf3eb] dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2.5 rounded-xl bg-[#1a5b35] text-amber-100 text-xs font-bold hover:bg-[#124226] disabled:opacity-60"
                  >
                    {saving ? "Saving..." : "Save Clinic"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
