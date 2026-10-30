'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import {
  Briefcase,
  PlusCircle,
  Trash2,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Award,
  Layers,
  Sparkles
} from 'lucide-react';

interface SkillCatalogItem {
  id: string;
  name: string;
  category: string;
}

interface CareerRoleItem {
  id: string;
  title: string;
}

interface SkillRequirementIn {
  skill_id: string;
  skill_name: string;
  required_score: number;
  importance: string;
  is_required: boolean;
}

export default function NewOpportunityPage() {
  const router = useRouter();
  const [skillsCatalog, setSkillsCatalog] = useState<SkillCatalogItem[]>([]);
  const [careerRoles, setCareerRoles] = useState<CareerRoleItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    responsibilities: '',
    requirements: '',
    opportunity_type: 'JOB',
    work_mode: 'ONSITE',
    employment_type: 'FULL_TIME',
    experience_level: 'FRESHER',
    location_text: '',
    city: '',
    state: '',
    country: 'India',
    application_deadline: '',
    salary_min: '',
    salary_max: '',
    salary_currency: 'INR',
    is_salary_disclosed: true,
    status: 'DRAFT'
  });

  const [selectedSkillId, setSelectedSkillId] = useState<string>('');
  const [selectedScore, setSelectedScore] = useState<number>(70);
  const [selectedImportance, setSelectedImportance] = useState<string>('HIGH');
  const [requiredSkills, setRequiredSkills] = useState<SkillRequirementIn[]>([]);
  const [selectedCareerRoleIds, setSelectedCareerRoleIds] = useState<string[]>([]);

  useEffect(() => {
    fetchCatalogs();
  }, []);

  const fetchCatalogs = async () => {
    try {
      setLoading(true);
      const [resSkills, resRoles] = await Promise.allSettled([
        api.get('/skills'),
        api.get('/career-roles')
      ]);

      if (resSkills.status === 'fulfilled') {
        const skillsData = resSkills.value.data;
        setSkillsCatalog(Array.isArray(skillsData) ? skillsData : skillsData.skills || []);
      }
      if (resRoles.status === 'fulfilled') {
        const rolesData = resRoles.value.data;
        setCareerRoles(Array.isArray(rolesData) ? rolesData : rolesData.career_roles || []);
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        router.push('/login');
        return;
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkillRequirement = () => {
    if (!selectedSkillId) return;
    const existing = requiredSkills.find((s) => s.skill_id === selectedSkillId);
    if (existing) return;

    const skillObj = skillsCatalog.find((s) => s.id === selectedSkillId);
    if (!skillObj) return;

    setRequiredSkills([
      ...requiredSkills,
      {
        skill_id: selectedSkillId,
        skill_name: skillObj.name,
        required_score: Number(selectedScore),
        importance: selectedImportance,
        is_required: true
      }
    ]);
    setSelectedSkillId('');
  };

  const handleRemoveSkillRequirement = (skillId: string) => {
    setRequiredSkills(requiredSkills.filter((s) => s.skill_id !== skillId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      const payload = {
        ...formData,
        salary_min: formData.salary_min ? parseFloat(formData.salary_min) : null,
        salary_max: formData.salary_max ? parseFloat(formData.salary_max) : null,
        application_deadline: formData.application_deadline ? new Date(formData.application_deadline).toISOString() : null,
        required_skills: requiredSkills.map((s) => ({
          skill_id: s.skill_id,
          required_score: s.required_score,
          importance: s.importance,
          is_required: s.is_required
        })),
        career_role_ids: selectedCareerRoleIds
      };

      await api.post('/industry/opportunities', payload);
      router.push('/industry/opportunities');
    } catch (err: any) {
      setError(err.message || 'Error creating opportunity');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9F4] dark:bg-[#0D1511] text-[#17231C] dark:text-[#F1F6F2] font-sans p-6 md:p-10 transition-colors duration-200">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div>
          <Link
            href="/industry/opportunities"
            className="inline-flex items-center gap-2 text-sm text-[#526158] hover:text-[#2F6B4F] dark:text-[#C1CEC5] dark:hover:text-[#78B895] mb-4 transition font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Opportunities
          </Link>
          <div className="bg-[#FFFFFF] dark:bg-[#17211B] p-6 rounded-2xl border border-[#D5DED8] dark:border-[#304036] shadow-xs">
            <h1 className="text-2xl md:text-3xl font-bold text-[#142019] dark:text-white flex items-center gap-3">
              <PlusCircle className="w-8 h-8 text-[#2F6B4F] dark:text-[#78B895]" /> Post Opportunity & Build Requirements
            </h1>
            <p className="text-[#526158] dark:text-[#C1CEC5] text-sm mt-1">
              Specify position parameters and define benchmark skill scores for deterministic candidate matching.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-900 rounded-xl text-red-700 dark:text-red-300 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Section 1: Basic Details */}
          <div className="bg-[#FFFFFF] dark:bg-[#17211B] rounded-2xl border border-[#D5DED8] dark:border-[#304036] p-6 shadow-xs space-y-4">
            <h3 className="text-lg font-bold text-[#142019] dark:text-white flex items-center gap-2 border-b border-[#D5DED8] dark:border-[#304036] pb-3">
              <Briefcase className="w-5 h-5 text-[#2F6B4F] dark:text-[#78B895]" /> 1. Opportunity Details
            </h3>

            <div>
              <label className="block text-xs font-semibold uppercase text-[#526158] dark:text-[#C1CEC5] mb-1">Position Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Senior Ayurvedic Clinical Researcher"
                className="w-full bg-[#EEF4EF] dark:bg-[#223128] border border-[#D5DED8] dark:border-[#304036] rounded-xl px-4 py-2.5 text-[#17231C] dark:text-[#F1F6F2] placeholder-[#68776D] dark:placeholder-[#98A99E] focus:outline-none focus:border-[#2F6B4F] dark:focus:border-[#78B895]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-[#526158] dark:text-[#C1CEC5] mb-1">Opportunity Type</label>
                <select
                  value={formData.opportunity_type}
                  onChange={(e) => setFormData({ ...formData, opportunity_type: e.target.value })}
                  className="w-full bg-[#EEF4EF] dark:bg-[#223128] border border-[#D5DED8] dark:border-[#304036] rounded-xl px-4 py-2.5 text-[#17231C] dark:text-[#F1F6F2] focus:outline-none focus:border-[#2F6B4F] dark:focus:border-[#78B895]"
                >
                  <option value="JOB">Job</option>
                  <option value="INTERNSHIP">Internship</option>
                  <option value="RESEARCH">Research Fellow</option>
                  <option value="APPRENTICESHIP">Apprenticeship</option>
                  <option value="PROJECT">Project / Contract</option>
                  <option value="WORKSHOP">Workshop</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-[#526158] dark:text-[#C1CEC5] mb-1">Work Mode</label>
                <select
                  value={formData.work_mode}
                  onChange={(e) => setFormData({ ...formData, work_mode: e.target.value })}
                  className="w-full bg-[#EEF4EF] dark:bg-[#223128] border border-[#D5DED8] dark:border-[#304036] rounded-xl px-4 py-2.5 text-[#17231C] dark:text-[#F1F6F2] focus:outline-none focus:border-[#2F6B4F] dark:focus:border-[#78B895]"
                >
                  <option value="ONSITE">Onsite</option>
                  <option value="REMOTE">Remote</option>
                  <option value="HYBRID">Hybrid</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-[#526158] dark:text-[#C1CEC5] mb-1">Employment Type</label>
                <select
                  value={formData.employment_type}
                  onChange={(e) => setFormData({ ...formData, employment_type: e.target.value })}
                  className="w-full bg-[#EEF4EF] dark:bg-[#223128] border border-[#D5DED8] dark:border-[#304036] rounded-xl px-4 py-2.5 text-[#17231C] dark:text-[#F1F6F2] focus:outline-none focus:border-[#2F6B4F] dark:focus:border-[#78B895]"
                >
                  <option value="FULL_TIME">Full Time</option>
                  <option value="PART_TIME">Part Time</option>
                  <option value="CONTRACT">Contract</option>
                  <option value="INTERNSHIP">Internship</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-[#526158] dark:text-[#C1CEC5] mb-1">Description *</label>
              <textarea
                required
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Overview of the role, team objectives, and expected impact..."
                className="w-full bg-[#EEF4EF] dark:bg-[#223128] border border-[#D5DED8] dark:border-[#304036] rounded-xl px-4 py-2.5 text-[#17231C] dark:text-[#F1F6F2] placeholder-[#68776D] dark:placeholder-[#98A99E] focus:outline-none focus:border-[#2F6B4F] dark:focus:border-[#78B895]"
              />
            </div>
          </div>

          {/* Section 2: Location, Compensation & Deadline */}
          <div className="bg-[#FFFFFF] dark:bg-[#17211B] rounded-2xl border border-[#D5DED8] dark:border-[#304036] p-6 shadow-xs space-y-4">
            <h3 className="text-lg font-bold text-[#142019] dark:text-white flex items-center gap-2 border-b border-[#D5DED8] dark:border-[#304036] pb-3">
              <Layers className="w-5 h-5 text-[#2F6B4F] dark:text-[#78B895]" /> 2. Location & Compensation
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-[#526158] dark:text-[#C1CEC5] mb-1">Location Text</label>
                <input
                  type="text"
                  value={formData.location_text}
                  onChange={(e) => setFormData({ ...formData, location_text: e.target.value })}
                  placeholder="e.g. Bengaluru / Remote"
                  className="w-full bg-[#EEF4EF] dark:bg-[#223128] border border-[#D5DED8] dark:border-[#304036] rounded-xl px-4 py-2.5 text-[#17231C] dark:text-[#F1F6F2] placeholder-[#68776D] dark:placeholder-[#98A99E] focus:outline-none focus:border-[#2F6B4F] dark:focus:border-[#78B895]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-[#526158] dark:text-[#C1CEC5] mb-1">Application Deadline</label>
                <input
                  type="datetime-local"
                  value={formData.application_deadline}
                  onChange={(e) => setFormData({ ...formData, application_deadline: e.target.value })}
                  className="w-full bg-[#EEF4EF] dark:bg-[#223128] border border-[#D5DED8] dark:border-[#304036] rounded-xl px-4 py-2.5 text-[#17231C] dark:text-[#F1F6F2] focus:outline-none focus:border-[#2F6B4F] dark:focus:border-[#78B895]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-[#526158] dark:text-[#C1CEC5] mb-1">Min Salary / Stipend (INR)</label>
                <input
                  type="number"
                  value={formData.salary_min}
                  onChange={(e) => setFormData({ ...formData, salary_min: e.target.value })}
                  placeholder="e.g. 350000"
                  className="w-full bg-[#EEF4EF] dark:bg-[#223128] border border-[#D5DED8] dark:border-[#304036] rounded-xl px-4 py-2.5 text-[#17231C] dark:text-[#F1F6F2] placeholder-[#68776D] dark:placeholder-[#98A99E] focus:outline-none focus:border-[#2F6B4F] dark:focus:border-[#78B895]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-[#526158] dark:text-[#C1CEC5] mb-1">Max Salary / Stipend (INR)</label>
                <input
                  type="number"
                  value={formData.salary_max}
                  onChange={(e) => setFormData({ ...formData, salary_max: e.target.value })}
                  placeholder="e.g. 600000"
                  className="w-full bg-[#EEF4EF] dark:bg-[#223128] border border-[#D5DED8] dark:border-[#304036] rounded-xl px-4 py-2.5 text-[#17231C] dark:text-[#F1F6F2] placeholder-[#68776D] dark:placeholder-[#98A99E] focus:outline-none focus:border-[#2F6B4F] dark:focus:border-[#78B895]"
                />
              </div>
            </div>
          </div>

          {/* Section 3: REQUIREMENT BUILDER */}
          <div className="bg-[#FFFFFF] dark:bg-[#17211B] rounded-2xl border border-[#D5DED8] dark:border-[#304036] p-6 shadow-xs space-y-6">
            <div>
              <h3 className="text-lg font-bold text-[#142019] dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#2F6B4F] dark:text-[#78B895]" /> 3. Skill Requirement Builder
              </h3>
              <p className="text-xs text-[#526158] dark:text-[#C1CEC5] mt-1">
                Define the minimum required skill scores (0-100) and importance weights. These parameters feed into candidate matching.
              </p>
            </div>

            {/* Requirement Selector Inputs */}
            <div className="bg-[#EEF4EF]/60 dark:bg-[#223128]/60 p-4 rounded-xl border border-[#D5DED8] dark:border-[#304036] grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold uppercase text-[#526158] dark:text-[#C1CEC5] mb-1">Select Skill from Catalog</label>
                <select
                  value={selectedSkillId}
                  onChange={(e) => setSelectedSkillId(e.target.value)}
                  className="w-full bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] rounded-xl px-4 py-2.5 text-[#17231C] dark:text-[#F1F6F2] focus:outline-none focus:border-[#2F6B4F] dark:focus:border-[#78B895]"
                >
                  <option value="">-- Choose Skill --</option>
                  {skillsCatalog.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-[#526158] dark:text-[#C1CEC5] mb-1">Required Score (0-100)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={selectedScore}
                  onChange={(e) => setSelectedScore(Number(e.target.value))}
                  className="w-full bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] rounded-xl px-4 py-2.5 text-[#17231C] dark:text-[#F1F6F2] focus:outline-none focus:border-[#2F6B4F] dark:focus:border-[#78B895]"
                />
              </div>

              <div>
                <button
                  type="button"
                  onClick={handleAddSkillRequirement}
                  className="w-full py-2.5 bg-[#2F6B4F] hover:bg-[#24563F] dark:bg-[#78B895] dark:hover:bg-[#91CAA8] text-white dark:text-[#0D1511] font-semibold text-xs rounded-xl shadow-xs transition"
                >
                  Add Requirement
                </button>
              </div>
            </div>

            {/* Selected Skill Requirements List */}
            {requiredSkills.length === 0 ? (
              <p className="text-xs text-[#68776D] dark:text-[#98A99E] italic text-center py-4">No skill requirements added yet.</p>
            ) : (
              <div className="space-y-3">
                {requiredSkills.map((req) => (
                  <div
                    key={req.skill_id}
                    className="p-3 bg-[#EEF4EF] dark:bg-[#223128] rounded-xl border border-[#D5DED8] dark:border-[#304036] flex items-center justify-between"
                  >
                    <div>
                      <span className="font-semibold text-[#17231C] dark:text-[#F1F6F2] text-sm">{req.skill_name}</span>
                      <div className="flex items-center gap-3 text-xs text-[#526158] dark:text-[#C1CEC5] mt-0.5">
                        <span>Required Score: <strong className="text-[#2F7D4A] dark:text-[#7BC894]">{req.required_score}</strong></span>
                        <span>&bull;</span>
                        <span>Importance: <strong className="text-[#2F6B4F] dark:text-[#78B895]">{req.importance}</strong></span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveSkillRequirement(req.skill_id)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit CTA */}
          <div className="flex items-center justify-end gap-4 pt-4 border-t border-[#D5DED8] dark:border-[#304036]">
            <Link
              href="/industry/opportunities"
              className="px-6 py-3 bg-[#EEF4EF] dark:bg-[#223128] hover:bg-[#D5DED8] dark:hover:bg-[#304036] text-[#17231C] dark:text-[#F1F6F2] font-medium rounded-xl transition"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-3 bg-[#2F6B4F] hover:bg-[#24563F] dark:bg-[#78B895] dark:hover:bg-[#91CAA8] text-white dark:text-[#0D1511] font-bold rounded-xl shadow-xs transition"
            >
              {submitting ? 'Creating Posting...' : 'Save Opportunity'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
