'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import {
  Building2,
  ShieldCheck,
  Clock,
  Globe,
  Mail,
  Phone,
  MapPin,
  FileText,
  Edit3,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  X
} from 'lucide-react';

interface OrganizationProfile {
  id: string;
  company_name: string;
  registration_number?: string;
  industry_domain?: string;
  description?: string;
  organization_type?: string;
  website_url?: string;
  logo_url?: string;
  contact_email?: string;
  contact_phone?: string;
  location?: string;
  verification_status: string;
}

export default function OrganizationProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<OrganizationProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    company_name: '',
    registration_number: '',
    industry_domain: '',
    description: '',
    organization_type: 'AYURVEDIC_COMPANY',
    website_url: '',
    logo_url: '',
    contact_email: '',
    contact_phone: '',
    location: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/industry/organization');
      const data = res.data;
      setProfile(data);
      setFormData({
        company_name: data.company_name || '',
        registration_number: data.registration_number || '',
        industry_domain: data.industry_domain || '',
        description: data.description || '',
        organization_type: data.organization_type || 'AYURVEDIC_COMPANY',
        website_url: data.website_url || '',
        logo_url: data.logo_url || '',
        contact_email: data.contact_email || '',
        contact_phone: data.contact_phone || '',
        location: data.location || ''
      });
    } catch (err: any) {
      if (err.response?.status === 401) {
        router.push('/login');
        return;
      }
      setError(err.response?.data?.detail || err.message || 'Error loading profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      const res = await api.patch('/industry/organization', formData);
      const updated = res.data;
      setProfile(updated);
      setEditing(false);
      setSuccessMsg('Organization profile updated successfully.');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F9F4] dark:bg-[#0D1511] text-[#17231C] dark:text-[#F1F6F2] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#2F6B4F] dark:border-[#78B895] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!profile) return null;

  const isVerified = profile.verification_status === 'VERIFIED';

  return (
    <div className="min-h-screen bg-[#F7F9F4] dark:bg-[#0D1511] text-[#17231C] dark:text-[#F1F6F2] font-sans transition-colors duration-200 p-6 md:p-10">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Navigation & Header */}
        <div>
          <Link
            href="/industry/dashboard"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#526158] dark:text-[#98A99E] hover:text-[#2F6B4F] dark:hover:text-[#78B895] mb-4 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#FFFFFF] dark:bg-[#17211B] p-6 rounded-2xl border border-[#D5DED8] dark:border-[#304036] shadow-xs">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#DCEBE1] dark:bg-[#294637] border border-[#2F6B4F]/30 dark:border-[#78B895]/30 flex items-center justify-center text-[#2F6B4F] dark:text-[#78B895] font-bold text-2xl">
                {profile.company_name ? profile.company_name.charAt(0).toUpperCase() : 'O'}
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-[#142019] dark:text-[#FFFFFF]">{profile.company_name}</h1>
                <p className="text-[#526158] dark:text-[#98A99E] text-sm">{profile.industry_domain || 'Ayurveda & Life Sciences Sector'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 border ${
                isVerified
                  ? 'bg-[#DCEBE1] dark:bg-[#294637] text-[#2F7D4A] dark:text-[#7BC894] border-[#2F7D4A]/30'
                  : 'bg-[#FFF8E6] dark:bg-[#3D2E14] text-[#A96F16] dark:text-[#E5B85C] border-[#A96F16]/30'
              }`}>
                {isVerified ? (
                  <>
                    <ShieldCheck className="w-4 h-4" /> VERIFIED ORGANISATION
                  </>
                ) : (
                  <>
                    <Clock className="w-4 h-4" /> VERIFICATION PENDING
                  </>
                )}
              </div>

              <button
                onClick={() => setEditing(true)}
                className="px-5 py-2.5 bg-[#EEF4EF] dark:bg-[#223128] hover:bg-[#D5DED8] dark:hover:bg-[#304036] text-[#17231C] dark:text-[#F1F6F2] font-semibold rounded-xl border border-[#D5DED8] dark:border-[#304036] flex items-center gap-2 transition cursor-pointer"
              >
                <Edit3 className="w-4 h-4 text-[#2F6B4F] dark:text-[#78B895]" /> Edit Profile
              </button>
            </div>
          </div>
        </div>

        {/* Notifications */}
        {successMsg && (
          <div className="p-4 bg-[#DCEBE1] dark:bg-[#294637] border border-[#2F7D4A]/30 rounded-xl text-[#2F7D4A] dark:text-[#7BC894] flex items-center gap-3 text-sm">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {error && (
          <div className="p-4 bg-[#FDE8E8] dark:bg-[#3B1E1E] border border-[#B64040]/30 rounded-xl text-[#B64040] dark:text-[#F18484] flex items-center gap-3 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Profile Card View */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="md:col-span-2 bg-[#FFFFFF] dark:bg-[#17211B] rounded-2xl border border-[#D5DED8] dark:border-[#304036] p-6 space-y-6 shadow-xs">
            <div>
              <h3 className="text-lg font-bold text-[#142019] dark:text-[#FFFFFF] mb-2">About Organization</h3>
              <p className="text-[#526158] dark:text-[#C1CEC5] leading-relaxed text-sm">
                {profile.description || 'No organization description provided yet. Click "Edit Profile" to add company overview, mission, and focus areas.'}
              </p>
            </div>

            <div className="border-t border-[#D5DED8] dark:border-[#304036] pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-[#68776D] dark:text-[#98A99E] block text-xs uppercase font-medium">Organization Type</span>
                <span className="text-[#17231C] dark:text-[#F1F6F2] font-semibold mt-1 block">{profile.organization_type || 'Ayurvedic Company'}</span>
              </div>
              <div>
                <span className="text-[#68776D] dark:text-[#98A99E] block text-xs uppercase font-medium">Registration Number</span>
                <span className="text-[#17231C] dark:text-[#F1F6F2] font-semibold mt-1 block">{profile.registration_number || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[#68776D] dark:text-[#98A99E] block text-xs uppercase font-medium">Domain / Industry</span>
                <span className="text-[#17231C] dark:text-[#F1F6F2] font-semibold mt-1 block">{profile.industry_domain || 'Ayurveda'}</span>
              </div>
              <div>
                <span className="text-[#68776D] dark:text-[#98A99E] block text-xs uppercase font-medium">Verification Status</span>
                <span className={`font-semibold mt-1 inline-block ${isVerified ? 'text-[#2F7D4A] dark:text-[#7BC894]' : 'text-[#A96F16] dark:text-[#E5B85C]'}`}>
                  {profile.verification_status}
                </span>
              </div>
            </div>
          </div>

          {/* Contact Info Sidebar */}
          <div className="bg-[#FFFFFF] dark:bg-[#17211B] rounded-2xl border border-[#D5DED8] dark:border-[#304036] p-6 space-y-5 shadow-xs">
            <h3 className="text-lg font-bold text-[#142019] dark:text-[#FFFFFF]">Contact & Location</h3>

            <div className="space-y-4 text-sm">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-[#2F6B4F] dark:text-[#78B895] flex-shrink-0" />
                <div>
                  <span className="text-xs text-[#68776D] dark:text-[#98A99E] block">Website</span>
                  {profile.website_url ? (
                    <a
                      href={profile.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#2F6B4F] dark:text-[#78B895] hover:underline font-semibold break-all"
                    >
                      {profile.website_url}
                    </a>
                  ) : (
                    <span className="text-[#68776D] dark:text-[#98A99E]">Not provided</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#356F9D] dark:text-[#80B5DD] flex-shrink-0" />
                <div>
                  <span className="text-xs text-[#68776D] dark:text-[#98A99E] block">Contact Email</span>
                  <span className="text-[#17231C] dark:text-[#F1F6F2] font-semibold">{profile.contact_email || 'Not provided'}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[#2F6B4F] dark:text-[#78B895] flex-shrink-0" />
                <div>
                  <span className="text-xs text-[#68776D] dark:text-[#98A99E] block">Contact Phone</span>
                  <span className="text-[#17231C] dark:text-[#F1F6F2] font-semibold">{profile.contact_phone || 'Not provided'}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-[#A96F16] dark:text-[#E5B85C] flex-shrink-0" />
                <div>
                  <span className="text-xs text-[#68776D] dark:text-[#98A99E] block">Location</span>
                  <span className="text-[#17231C] dark:text-[#F1F6F2] font-semibold">{profile.location || 'Not provided'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Modal */}
        {editing && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-[#FFFFFF] dark:bg-[#17211B] rounded-2xl border border-[#D5DED8] dark:border-[#304036] max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 space-y-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-[#D5DED8] dark:border-[#304036] pb-4">
                <h3 className="text-xl font-bold text-[#142019] dark:text-[#FFFFFF] flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[#2F6B4F] dark:text-[#78B895]" /> Edit Organization Profile
                </h3>
                <button
                  onClick={() => setEditing(false)}
                  className="p-2 text-[#526158] dark:text-[#98A99E] hover:text-[#17231C] dark:hover:text-[#F1F6F2] rounded-lg hover:bg-[#EEF4EF] dark:hover:bg-[#223128] transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUpdate} className="space-y-4 text-sm">
                <div>
                  <label className="block text-xs font-semibold uppercase text-[#526158] dark:text-[#C1CEC5] mb-1">Company / Organization Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    className="w-full bg-[#EEF4EF] dark:bg-[#223128] border border-[#D5DED8] dark:border-[#304036] rounded-xl px-4 py-2.5 text-[#17231C] dark:text-[#F1F6F2] placeholder-[#68776D] dark:placeholder-[#98A99E] focus:outline-none focus:border-[#2F6B4F] dark:focus:border-[#78B895]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-[#526158] dark:text-[#C1CEC5] mb-1">Organization Type</label>
                    <select
                      value={formData.organization_type}
                      onChange={(e) => setFormData({ ...formData, organization_type: e.target.value })}
                      className="w-full bg-[#EEF4EF] dark:bg-[#223128] border border-[#D5DED8] dark:border-[#304036] rounded-xl px-4 py-2.5 text-[#17231C] dark:text-[#F1F6F2] focus:outline-none focus:border-[#2F6B4F] dark:focus:border-[#78B895]"
                    >
                      <option value="AYURVEDIC_COMPANY">Ayurvedic Company</option>
                      <option value="PHARMA">Pharma Company</option>
                      <option value="RESEARCH_INSTITUTE">Research Institute</option>
                      <option value="HOSPITAL">Hospital / Clinic</option>
                      <option value="STARTUP">AyurTech Startup</option>
                      <option value="GOVERNMENT">Government Body</option>
                      <option value="NGO">NGO / Non-profit</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-[#526158] dark:text-[#C1CEC5] mb-1">Registration / CIN Number</label>
                    <input
                      type="text"
                      value={formData.registration_number}
                      onChange={(e) => setFormData({ ...formData, registration_number: e.target.value })}
                      className="w-full bg-[#EEF4EF] dark:bg-[#223128] border border-[#D5DED8] dark:border-[#304036] rounded-xl px-4 py-2.5 text-[#17231C] dark:text-[#F1F6F2] placeholder-[#68776D] dark:placeholder-[#98A99E] focus:outline-none focus:border-[#2F6B4F] dark:focus:border-[#78B895]"
                      placeholder="e.g. U74999KA2026PTC123456"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-[#526158] dark:text-[#C1CEC5] mb-1">Industry Sector / Domain</label>
                  <input
                    type="text"
                    value={formData.industry_domain}
                    onChange={(e) => setFormData({ ...formData, industry_domain: e.target.value })}
                    className="w-full bg-[#EEF4EF] dark:bg-[#223128] border border-[#D5DED8] dark:border-[#304036] rounded-xl px-4 py-2.5 text-[#17231C] dark:text-[#F1F6F2] placeholder-[#68776D] dark:placeholder-[#98A99E] focus:outline-none focus:border-[#2F6B4F] dark:focus:border-[#78B895]"
                    placeholder="e.g. Dravya Guna Research, Herbal Formulations, Panchakarma"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-[#526158] dark:text-[#C1CEC5] mb-1">Organization Description</label>
                  <textarea
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-[#EEF4EF] dark:bg-[#223128] border border-[#D5DED8] dark:border-[#304036] rounded-xl px-4 py-2.5 text-[#17231C] dark:text-[#F1F6F2] placeholder-[#68776D] dark:placeholder-[#98A99E] focus:outline-none focus:border-[#2F6B4F] dark:focus:border-[#78B895]"
                    placeholder="Describe your organization's focus, mission, and key products/services..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-[#526158] dark:text-[#C1CEC5] mb-1">Website URL (HTTPS)</label>
                    <input
                      type="url"
                      value={formData.website_url}
                      onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                      className="w-full bg-[#EEF4EF] dark:bg-[#223128] border border-[#D5DED8] dark:border-[#304036] rounded-xl px-4 py-2.5 text-[#17231C] dark:text-[#F1F6F2] placeholder-[#68776D] dark:placeholder-[#98A99E] focus:outline-none focus:border-[#2F6B4F] dark:focus:border-[#78B895]"
                      placeholder="https://example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-[#526158] dark:text-[#C1CEC5] mb-1">Contact Email</label>
                    <input
                      type="email"
                      value={formData.contact_email}
                      onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                      className="w-full bg-[#EEF4EF] dark:bg-[#223128] border border-[#D5DED8] dark:border-[#304036] rounded-xl px-4 py-2.5 text-[#17231C] dark:text-[#F1F6F2] placeholder-[#68776D] dark:placeholder-[#98A99E] focus:outline-none focus:border-[#2F6B4F] dark:focus:border-[#78B895]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-[#526158] dark:text-[#C1CEC5] mb-1">Contact Phone</label>
                    <input
                      type="text"
                      value={formData.contact_phone}
                      onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                      className="w-full bg-[#EEF4EF] dark:bg-[#223128] border border-[#D5DED8] dark:border-[#304036] rounded-xl px-4 py-2.5 text-[#17231C] dark:text-[#F1F6F2] placeholder-[#68776D] dark:placeholder-[#98A99E] focus:outline-none focus:border-[#2F6B4F] dark:focus:border-[#78B895]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-[#526158] dark:text-[#C1CEC5] mb-1">City / Location</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full bg-[#EEF4EF] dark:bg-[#223128] border border-[#D5DED8] dark:border-[#304036] rounded-xl px-4 py-2.5 text-[#17231C] dark:text-[#F1F6F2] placeholder-[#68776D] dark:placeholder-[#98A99E] focus:outline-none focus:border-[#2F6B4F] dark:focus:border-[#78B895]"
                      placeholder="e.g. New Delhi, India"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#D5DED8] dark:border-[#304036]">
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="px-5 py-2.5 bg-[#EEF4EF] dark:bg-[#223128] hover:bg-[#D5DED8] dark:hover:bg-[#304036] text-[#526158] dark:text-[#C1CEC5] font-semibold rounded-xl border border-[#D5DED8] dark:border-[#304036] transition cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 bg-[#2F6B4F] hover:bg-[#24563F] dark:bg-[#78B895] dark:hover:bg-[#91CAA8] disabled:opacity-50 text-white dark:text-[#0D1511] font-bold rounded-xl transition shadow-xs cursor-pointer"
                  >
                    {saving ? 'Saving...' : 'Save Profile'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
