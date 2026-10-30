"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { GraduationCap, Building2, Globe, Mail, Phone, MapPin, ShieldCheck, Save, CheckCircle2, AlertCircle, User } from "lucide-react";
import { api } from "@/lib/api";
import { getRolePrefixOptions, formatFullName, parseNameParts } from "@/lib/nameFormatter";

export default function InstitutionProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [formData, setFormData] = useState({
    institution_name: "",
    code: "",
    institution_type: "AYURVEDIC_COLLEGE",
    description: "",
    website_url: "",
    contact_email: "",
    contact_phone: "",
    contact_person_prefix: "Principal",
    contact_person_first_name: "",
    contact_person_middle_name: "",
    contact_person_last_name: "",
    contact_person_name: "",
    address: "",
    city: "",
    state: "",
    country: "India",
    logo_url: ""
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await api.get("/institution/profile");
        setProfile(res.data);
        const nameParts = parseNameParts(res.data.contact_person_name, "INSTITUTION");
        setFormData({
          institution_name: res.data.institution_name || "",
          code: res.data.code || "",
          institution_type: res.data.institution_type || "AYURVEDIC_COLLEGE",
          description: res.data.description || "",
          website_url: res.data.website_url || "",
          contact_email: res.data.contact_email || "",
          contact_phone: res.data.contact_phone || "",
          contact_person_prefix: res.data.contact_person_prefix || nameParts.prefix || "Principal",
          contact_person_first_name: res.data.contact_person_first_name || nameParts.firstName || "",
          contact_person_middle_name: res.data.contact_person_middle_name || nameParts.middleName || "",
          contact_person_last_name: res.data.contact_person_last_name || nameParts.lastName || "",
          contact_person_name: res.data.contact_person_name || "",
          address: res.data.address || "",
          city: res.data.city || "",
          state: res.data.state || "",
          country: res.data.country || "India",
          logo_url: res.data.logo_url || ""
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setSaving(true);

    if (formData.website_url && !formData.website_url.startsWith("https://")) {
      setMessage({ type: "error", text: "Website URL must start with https://" });
      setSaving(false);
      return;
    }

    try {
      const contactPersonFormatted = formatFullName({
        prefix: formData.contact_person_prefix,
        firstName: formData.contact_person_first_name,
        middleName: formData.contact_person_middle_name,
        lastName: formData.contact_person_last_name,
        fallbackFullName: formData.contact_person_name,
      });

      const patchData = {
        ...formData,
        contact_person_name: contactPersonFormatted,
      };

      const res = await api.patch("/institution/profile", patchData);
      setProfile(res.data);
      setMessage({ type: "success", text: "Institution profile updated successfully!" });
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.response?.data?.detail || "Failed to update profile. Ensure URL starts with https://"
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9F4] dark:bg-[#0D1511] text-[#17231C] dark:text-[#F1F6F2] font-sans flex flex-col transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] p-6 rounded-2xl shadow-xs flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DCEBE1] dark:bg-[#294637] text-[#2F6B4F] dark:text-[#78B895] border border-[#2F6B4F]/20 text-xs font-semibold uppercase tracking-wider mb-2">
              <Building2 className="w-3.5 h-3.5" /> Institution Details & Branding
            </div>
            <h1 className="text-2xl font-extrabold text-[#142019] dark:text-white">Institution Profile</h1>
            <p className="text-xs text-[#526158] dark:text-[#C1CEC5] mt-1">Manage institutional credentials, contact details, and accreditation information.</p>
          </div>
          {profile?.verification_status && (
            <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${
              profile.verification_status === "VERIFIED"
                ? "bg-[#DCEBE1] dark:bg-[#294637] text-[#2F7D4A] dark:text-[#7BC894] border-[#2F7D4A]/40"
                : "bg-amber-100 dark:bg-amber-950/60 text-[#A96F16] dark:text-[#E5B85C] border-amber-300 dark:border-amber-700/40"
            }`}>
              {profile.verification_status}
            </span>
          )}
        </div>

        {message && (
          <div className={`p-4 rounded-xl border flex items-center gap-3 text-xs font-semibold ${
            message.type === "success"
              ? "bg-[#DCEBE1] dark:bg-[#294637] border-[#2F7D4A]/40 text-[#2F7D4A] dark:text-[#7BC894]"
              : "bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-900 text-red-700 dark:text-red-300"
          }`}>
            {message.type === "success" ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
            <span>{message.text}</span>
          </div>
        )}

        {/* Form Card */}
        <form onSubmit={handleSubmit} className="bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] p-6 rounded-2xl shadow-xs space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-[#526158] dark:text-[#C1CEC5] uppercase tracking-wider mb-2">
                Institution Name *
              </label>
              <input
                type="text"
                required
                value={formData.institution_name}
                onChange={(e) => setFormData({ ...formData, institution_name: e.target.value })}
                className="w-full bg-[#EEF4EF] dark:bg-[#223128] border border-[#D5DED8] dark:border-[#304036] rounded-xl px-4 py-2.5 text-sm text-[#17231C] dark:text-[#F1F6F2] focus:outline-none focus:border-[#2F6B4F] dark:focus:border-[#78B895]"
                placeholder="e.g. National Institute of Ayurveda"
              />
            </div>

            {/* Institutional Representative / Authority Section */}
            <div className="col-span-1 md:col-span-2 p-4 rounded-xl bg-[#EEF4EF] dark:bg-[#223128] border border-[#D5DED8] dark:border-[#304036] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#2F6B4F] dark:text-[#78B895] flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" /> Institutional Head / Authorized Representative
                </span>
                <span className="text-[10px] font-mono uppercase bg-[#DCEBE1] dark:bg-[#294637] text-[#2F6B4F] dark:text-[#78B895] px-2 py-0.5 rounded border border-[#2F6B4F]/30">
                  Institutional Designation
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 text-xs">
                <div className="md:col-span-4">
                  <label className="block mb-1 font-medium text-[#526158] dark:text-[#C1CEC5]">Designation / Prefix *</label>
                  <select
                    value={formData.contact_person_prefix}
                    onChange={(e) => setFormData({ ...formData, contact_person_prefix: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] text-[#17231C] dark:text-[#F1F6F2] font-semibold focus:border-[#2F6B4F] dark:focus:border-[#78B895]"
                  >
                    {getRolePrefixOptions("INSTITUTION").map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-8">
                  <label className="block mb-1 font-medium text-[#526158] dark:text-[#C1CEC5]">First Name *</label>
                  <input
                    type="text"
                    value={formData.contact_person_first_name}
                    onChange={(e) => setFormData({ ...formData, contact_person_first_name: e.target.value })}
                    placeholder="e.g. Sanjeev"
                    className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] text-[#17231C] dark:text-[#F1F6F2] focus:border-[#2F6B4F] dark:focus:border-[#78B895]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block mb-1 font-medium text-[#526158] dark:text-[#C1CEC5]">
                    Middle Name <span className="text-[#68776D] dark:text-[#98A99E] font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.contact_person_middle_name}
                    onChange={(e) => setFormData({ ...formData, contact_person_middle_name: e.target.value })}
                    placeholder="e.g. Kumar"
                    className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] text-[#17231C] dark:text-[#F1F6F2] focus:border-[#2F6B4F] dark:focus:border-[#78B895]"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium text-[#526158] dark:text-[#C1CEC5]">Last Name</label>
                  <input
                    type="text"
                    value={formData.contact_person_last_name}
                    onChange={(e) => setFormData({ ...formData, contact_person_last_name: e.target.value })}
                    placeholder="e.g. Sharma"
                    className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] text-[#17231C] dark:text-[#F1F6F2] focus:border-[#2F6B4F] dark:focus:border-[#78B895]"
                  />
                </div>
              </div>

              {/* Display Preview */}
              <div className="pt-2 border-t border-[#D5DED8] dark:border-[#304036] flex items-center justify-between text-xs">
                <span className="text-[#526158] dark:text-[#C1CEC5]">Platform Representative Display:</span>
                <span className="font-bold text-[#2F6B4F] dark:text-[#78B895] bg-[#DCEBE1] dark:bg-[#294637] border border-[#2F6B4F]/30 px-2.5 py-1 rounded-md">
                  {formatFullName({
                    prefix: formData.contact_person_prefix,
                    firstName: formData.contact_person_first_name,
                    middleName: formData.contact_person_middle_name,
                    lastName: formData.contact_person_last_name,
                    fallbackFullName: formData.contact_person_name,
                  }) || <span className="text-[#68776D] dark:text-[#98A99E] italic">Enter representative name</span>}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#526158] dark:text-[#C1CEC5] uppercase tracking-wider mb-2">
                Institution Code / AISHE Code
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full bg-[#EEF4EF] dark:bg-[#223128] border border-[#D5DED8] dark:border-[#304036] rounded-xl px-4 py-2.5 text-sm text-[#17231C] dark:text-[#F1F6F2] focus:outline-none focus:border-[#2F6B4F] dark:focus:border-[#78B895]"
                placeholder="e.g. NIA-AYUSH-2026"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#526158] dark:text-[#C1CEC5] uppercase tracking-wider mb-2">
                Institution Type
              </label>
              <select
                value={formData.institution_type}
                onChange={(e) => setFormData({ ...formData, institution_type: e.target.value })}
                className="w-full bg-[#EEF4EF] dark:bg-[#223128] border border-[#D5DED8] dark:border-[#304036] rounded-xl px-4 py-2.5 text-sm text-[#17231C] dark:text-[#F1F6F2] focus:outline-none focus:border-[#2F6B4F] dark:focus:border-[#78B895]"
              >
                <option value="AYURVEDIC_COLLEGE">Ayurvedic College</option>
                <option value="COLLEGE">College</option>
                <option value="UNIVERSITY">University</option>
                <option value="INSTITUTE">Institute</option>
                <option value="RESEARCH_INSTITUTE">Research Institute</option>
                <option value="PHARMACY_COLLEGE">Pharmacy College</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#526158] dark:text-[#C1CEC5] uppercase tracking-wider mb-2">
                Website URL (HTTPS Required)
              </label>
              <div className="relative">
                <Globe className="w-4 h-4 text-[#68776D] dark:text-[#98A99E] absolute left-3.5 top-3" />
                <input
                  type="url"
                  value={formData.website_url}
                  onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                  className="w-full bg-[#EEF4EF] dark:bg-[#223128] border border-[#D5DED8] dark:border-[#304036] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#17231C] dark:text-[#F1F6F2] placeholder-[#68776D] dark:placeholder-[#98A99E] focus:outline-none focus:border-[#2F6B4F] dark:focus:border-[#78B895]"
                  placeholder="https://nia.nic.in"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#526158] dark:text-[#C1CEC5] uppercase tracking-wider mb-2">
                Contact Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#68776D] dark:text-[#98A99E] absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                  className="w-full bg-[#EEF4EF] dark:bg-[#223128] border border-[#D5DED8] dark:border-[#304036] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#17231C] dark:text-[#F1F6F2] placeholder-[#68776D] dark:placeholder-[#98A99E] focus:outline-none focus:border-[#2F6B4F] dark:focus:border-[#78B895]"
                  placeholder="contact@nia.nic.in"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#526158] dark:text-[#C1CEC5] uppercase tracking-wider mb-2">
                Contact Phone
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-[#68776D] dark:text-[#98A99E] absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={formData.contact_phone}
                  onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                  className="w-full bg-[#EEF4EF] dark:bg-[#223128] border border-[#D5DED8] dark:border-[#304036] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#17231C] dark:text-[#F1F6F2] placeholder-[#68776D] dark:placeholder-[#98A99E] focus:outline-none focus:border-[#2F6B4F] dark:focus:border-[#78B895]"
                  placeholder="+91 141 2635816"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#526158] dark:text-[#C1CEC5] uppercase tracking-wider mb-2">
                City
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full bg-[#EEF4EF] dark:bg-[#223128] border border-[#D5DED8] dark:border-[#304036] rounded-xl px-4 py-2.5 text-sm text-[#17231C] dark:text-[#F1F6F2] focus:outline-none focus:border-[#2F6B4F] dark:focus:border-[#78B895]"
                placeholder="Jaipur"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#526158] dark:text-[#C1CEC5] uppercase tracking-wider mb-2">
                State
              </label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full bg-[#EEF4EF] dark:bg-[#223128] border border-[#D5DED8] dark:border-[#304036] rounded-xl px-4 py-2.5 text-sm text-[#17231C] dark:text-[#F1F6F2] focus:outline-none focus:border-[#2F6B4F] dark:focus:border-[#78B895]"
                placeholder="Rajasthan"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#526158] dark:text-[#C1CEC5] uppercase tracking-wider mb-2">
              Institution Overview & History
            </label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-[#EEF4EF] dark:bg-[#223128] border border-[#D5DED8] dark:border-[#304036] rounded-xl p-4 text-sm text-[#17231C] dark:text-[#F1F6F2] focus:outline-none focus:border-[#2F6B4F] dark:focus:border-[#78B895] resize-none"
              placeholder="Describe institutional focus, academic programs, research laboratories, and clinical affiliations..."
            />
          </div>

          <div className="flex justify-end pt-4 border-t border-[#D5DED8] dark:border-[#304036]">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 rounded-xl bg-[#2F6B4F] hover:bg-[#24563F] dark:bg-[#78B895] dark:hover:bg-[#91CAA8] text-white dark:text-[#0D1511] font-extrabold text-sm transition-colors flex items-center gap-2 shadow-xs disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : "Save Profile Details"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
