"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import {
  Sparkles,
  Eye,
  Globe,
  Lock,
  Link as LinkIcon,
  Copy,
  CheckCircle2,
  AlertCircle,
  Plus,
  Edit3,
  Trash2,
  Award,
  Briefcase,
  BookOpen,
  GraduationCap,
  Save,
  Share2,
  FileText,
  ExternalLink
} from "lucide-react";
import { api } from "@/lib/api";

export default function StudentPortfolioBuilderPage() {
  const [portfolio, setPortfolio] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form states for Header & Settings
  const [headline, setHeadline] = useState("");
  const [summary, setSummary] = useState("");
  const [slug, setSlug] = useState("");
  const [visibility, setVisibility] = useState("PRIVATE");
  const [contactEmailPublic, setContactEmailPublic] = useState(false);
  const [showSkillScores, setShowSkillScores] = useState(true);

  // Modal states for section items
  const [activeModal, setActiveModal] = useState<"project" | "experience" | "certification" | "achievement" | "education" | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Project form
  const [projectForm, setProjectForm] = useState({ title: "", description: "", role: "", techInput: "", project_url: "", is_featured: false });
  // Experience form
  const [expForm, setExpForm] = useState({ organization: "", role: "", experience_type: "INTERNSHIP", start_date: "", end_date: "", description: "" });
  // Certification form
  const [certForm, setCertForm] = useState({ name: "", issuer: "", issue_date: "", credential_url: "", description: "" });
  // Achievement form
  const [achForm, setAchForm] = useState({ title: "", issuer: "", date: "", description: "", credential_url: "" });
  // Education form
  const [eduForm, setEduForm] = useState({ institution: "", degree: "", field_of_study: "", start_year: "", end_year: "" });

  async function loadPortfolio() {
    try {
      const res = await api.get("/student/portfolio");
      setPortfolio(res.data);
      setHeadline(res.data.headline || "");
      setSummary(res.data.summary || "");
      setSlug(res.data.slug || "");
      setVisibility(res.data.visibility || "PRIVATE");
      setContactEmailPublic(res.data.contact_email_public || false);
      setShowSkillScores(res.data.show_skill_scores !== false);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPortfolio();
  }, []);

  const handleSaveHeaderSettings = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await api.patch("/student/portfolio", {
        headline,
        summary,
        slug,
        visibility,
        contact_email_public: contactEmailPublic,
        show_skill_scores: showSkillScores
      });
      setPortfolio(res.data);
      setMessage({ type: "success", text: "Portfolio settings updated successfully!" });
    } catch (err: any) {
      setMessage({ type: "error", text: err.response?.data?.detail || "Failed to update portfolio settings." });
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublish = async () => {
    setSaving(true);
    setMessage(null);
    try {
      if (portfolio?.is_published) {
        const res = await api.post("/student/portfolio/unpublish");
        setPortfolio(res.data);
        setVisibility(res.data.visibility);
        setMessage({ type: "success", text: "Portfolio unpublished and set to Private." });
      } else {
        const res = await api.post("/student/portfolio/publish");
        setPortfolio(res.data);
        setVisibility(res.data.visibility);
        setMessage({ type: "success", text: "Portfolio successfully published!" });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.response?.data?.detail || "Failed to toggle publication state." });
    } finally {
      setSaving(false);
    }
  };

  const handleCopyLink = () => {
    const publicUrl = `${window.location.origin}/portfolio/${slug}`;
    navigator.clipboard.writeText(publicUrl);
    setMessage({ type: "success", text: "Portfolio link copied to clipboard!" });
  };

  // --- PROJECT HANDLERS ---
  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        title: projectForm.title,
        description: projectForm.description,
        role: projectForm.role || undefined,
        technologies: projectForm.techInput ? projectForm.techInput.split(",").map(t => t.trim()) : [],
        project_url: projectForm.project_url || undefined,
        is_featured: projectForm.is_featured
      };
      if (editingItem) {
        await api.patch(`/student/portfolio/projects/${editingItem.id}`, payload);
      } else {
        await api.post("/student/portfolio/projects", payload);
      }
      setActiveModal(null);
      loadPortfolio();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to save project.");
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm("Delete project record?")) return;
    await api.delete(`/student/portfolio/projects/${id}`);
    loadPortfolio();
  };

  // --- EXPERIENCE HANDLERS ---
  const handleSaveExp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        organization: expForm.organization,
        role: expForm.role,
        experience_type: expForm.experience_type,
        start_date: expForm.start_date,
        end_date: expForm.end_date || undefined,
        description: expForm.description || undefined
      };
      if (editingItem) {
        await api.patch(`/student/portfolio/experiences/${editingItem.id}`, payload);
      } else {
        await api.post("/student/portfolio/experiences", payload);
      }
      setActiveModal(null);
      loadPortfolio();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to save experience.");
    }
  };

  const handleDeleteExp = async (id: string) => {
    if (!confirm("Delete experience record?")) return;
    await api.delete(`/student/portfolio/experiences/${id}`);
    loadPortfolio();
  };

  // --- CERTIFICATION HANDLERS ---
  const handleSaveCert = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: certForm.name,
        issuer: certForm.issuer,
        issue_date: certForm.issue_date || undefined,
        credential_url: certForm.credential_url || undefined,
        description: certForm.description || undefined
      };
      if (editingItem) {
        await api.patch(`/student/portfolio/certifications/${editingItem.id}`, payload);
      } else {
        await api.post("/student/portfolio/certifications", payload);
      }
      setActiveModal(null);
      loadPortfolio();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to save certification.");
    }
  };

  const handleDeleteCert = async (id: string) => {
    if (!confirm("Delete certification record?")) return;
    await api.delete(`/student/portfolio/certifications/${id}`);
    loadPortfolio();
  };

  // --- ACHIEVEMENT HANDLERS ---
  const handleSaveAch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        title: achForm.title,
        issuer: achForm.issuer || undefined,
        date: achForm.date || undefined,
        credential_url: achForm.credential_url || undefined,
        description: achForm.description || undefined
      };
      if (editingItem) {
        await api.patch(`/student/portfolio/achievements/${editingItem.id}`, payload);
      } else {
        await api.post("/student/portfolio/achievements", payload);
      }
      setActiveModal(null);
      loadPortfolio();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to save achievement.");
    }
  };

  const handleDeleteAch = async (id: string) => {
    if (!confirm("Delete achievement record?")) return;
    await api.delete(`/student/portfolio/achievements/${id}`);
    loadPortfolio();
  };

  // --- EDUCATION HANDLERS ---
  const handleSaveEdu = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        institution: eduForm.institution,
        degree: eduForm.degree,
        field_of_study: eduForm.field_of_study || undefined,
        start_year: eduForm.start_year ? parseInt(eduForm.start_year) : undefined,
        end_year: eduForm.end_year ? parseInt(eduForm.end_year) : undefined
      };
      if (editingItem) {
        await api.patch(`/student/portfolio/education/${editingItem.id}`, payload);
      } else {
        await api.post("/student/portfolio/education", payload);
      }
      setActiveModal(null);
      loadPortfolio();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to save education record.");
    }
  };

  const handleDeleteEdu = async (id: string) => {
    if (!confirm("Delete education record?")) return;
    await api.delete(`/student/portfolio/education/${id}`);
    loadPortfolio();
  };

  // Calculate completion percentage
  let comp = 30; // Base profile & career
  if (headline) comp += 15;
  if (summary) comp += 15;
  if (portfolio?.projects?.length) comp += 15;
  if (portfolio?.experiences?.length || portfolio?.certifications?.length) comp += 15;
  if (portfolio?.is_published) comp += 10;
  const completionPct = Math.min(100, comp);

  return (
    <div className="min-h-screen bg-[#F7F9F4] dark:bg-[#0D1511] text-[#17231C] dark:text-[#F1F6F2] flex flex-col transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="rounded-2xl border border-[#D5DED8] dark:border-[#304036] bg-[#FFFFFF] dark:bg-[#17211B] p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-[#A96F16] dark:text-[#E5B85C] text-xs font-semibold uppercase tracking-wider mb-2 border border-[#A96F16]/30 dark:border-[#E5B85C]/30">
              <Sparkles className="w-3.5 h-3.5" /> Professional Showcase
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#142019] dark:text-[#FFFFFF]">My Portfolio</h1>
            <p className="text-xs text-[#526158] dark:text-[#C1CEC5] mt-1">
              Build and showcase your professional profile, evaluated skill scores, research projects, and accomplishments.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/student/portfolio/preview"
              className="px-4 py-2.5 rounded-xl bg-[#EEF4EF] dark:bg-[#223128] hover:bg-[#DCEBE1] dark:hover:bg-[#294637] text-[#17231C] dark:text-[#F1F6F2] font-bold text-xs border border-[#D5DED8] dark:border-[#304036] transition-all flex items-center gap-2 shadow-sm"
            >
              <Eye className="w-4 h-4 text-[#A96F16] dark:text-[#E5B85C]" /> Preview Portfolio
            </Link>

            <button
              onClick={handleTogglePublish}
              disabled={saving}
              className={`px-5 py-2.5 rounded-xl font-extrabold text-xs transition-all flex items-center gap-2 shadow-md ${
                portfolio?.is_published
                  ? "bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-950/80 text-[#B64040] dark:text-[#F18484] border border-[#B64040]/30"
                  : "bg-[#2F6B4F] hover:bg-[#24563F] text-white dark:bg-[#78B895] dark:hover:bg-[#91CAA8] dark:text-[#0D1511]"
              }`}
            >
              <Globe className="w-4 h-4" />
              {portfolio?.is_published ? "Unpublish Portfolio" : "Publish Portfolio"}
            </button>
          </div>
        </div>

        {message && (
          <div className={`p-4 rounded-xl border flex items-center gap-3 text-xs font-semibold ${
            message.type === "success"
              ? "bg-[#DCEBE1] dark:bg-[#294637]/60 border-[#2F7D4A]/40 text-[#2F7D4A] dark:text-[#7BC894]"
              : "bg-red-50 dark:bg-red-950/40 border-[#B64040]/40 text-[#B64040] dark:text-[#F18484]"
          }`}>
            {message.type === "success" ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
            <span>{message.text}</span>
          </div>
        )}

        {/* Status & Completion Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-[#D5DED8] dark:border-[#304036] bg-[#FFFFFF] dark:bg-[#17211B] p-5 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs text-[#526158] dark:text-[#C1CEC5] font-medium">Publication Status</div>
              <div className="flex items-center gap-2 mt-1">
                <span className={`w-2.5 h-2.5 rounded-full ${portfolio?.is_published ? "bg-[#2F7D4A] dark:bg-[#7BC894]" : "bg-[#A96F16] dark:bg-[#E5B85C]"}`} />
                <span className="text-sm font-extrabold text-[#142019] dark:text-[#FFFFFF] uppercase font-mono">
                  {portfolio?.is_published ? "Published" : "Draft (Private)"}
                </span>
              </div>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded bg-[#EEF4EF] dark:bg-[#223128] text-[#A96F16] dark:text-[#E5B85C] border border-[#D5DED8] dark:border-[#304036]">
              {visibility}
            </span>
          </div>

          <div className="rounded-2xl border border-[#D5DED8] dark:border-[#304036] bg-[#FFFFFF] dark:bg-[#17211B] p-5 shadow-sm space-y-2 md:col-span-2">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-[#526158] dark:text-[#C1CEC5]">Portfolio Completion Index</span>
              <span className="text-[#A96F16] dark:text-[#E5B85C] font-mono">{completionPct}%</span>
            </div>
            <div className="w-full bg-[#EEF4EF] dark:bg-[#223128] h-2.5 rounded-full overflow-hidden border border-[#D5DED8] dark:border-[#304036]">
              <div
                className="bg-gradient-to-r from-[#A96F16] via-[#2F6B4F] to-[#2F7D4A] dark:from-[#E5B85C] dark:via-[#78B895] dark:to-[#7BC894] h-full rounded-full transition-all"
                style={{ width: `${completionPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Main Settings & Header Editor */}
        <div className="rounded-2xl border border-[#D5DED8] dark:border-[#304036] bg-[#FFFFFF] dark:bg-[#17211B] p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-[#D5DED8] dark:border-[#304036] pb-4">
            <h2 className="text-lg font-bold flex items-center gap-2 text-[#142019] dark:text-[#FFFFFF]">
              <Sparkles className="w-5 h-5 text-[#A96F16] dark:text-[#E5B85C]" /> Header & Privacy Settings
            </h2>
            <button
              onClick={handleSaveHeaderSettings}
              disabled={saving}
              className="px-4 py-2 rounded-xl bg-[#2F6B4F] hover:bg-[#24563F] text-white dark:bg-[#78B895] dark:hover:bg-[#91CAA8] dark:text-[#0D1511] font-bold text-xs transition-all flex items-center gap-2 disabled:opacity-50 shadow-sm"
            >
              <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save Settings"}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex justify-between text-xs font-bold text-[#526158] dark:text-[#C1CEC5] uppercase tracking-wider mb-2">
                <span>Professional Headline *</span>
                <span className="text-[#68776D] dark:text-[#98A99E] font-mono">{headline.length} / 120</span>
              </div>
              <input
                type="text"
                maxLength={120}
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                className="w-full bg-[#FFFFFF] dark:bg-[#1D2A22] border border-[#D5DED8] dark:border-[#304036] rounded-xl px-4 py-2.5 text-sm text-[#17231C] dark:text-[#F1F6F2] placeholder-[#68776D] dark:placeholder-[#98A99E] focus:outline-none focus:border-[#2F6B4F] dark:focus:border-[#78B895]"
                placeholder="e.g. Aspiring Ayurvedic Pharmaceutical R&D Professional"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-[#526158] dark:text-[#C1CEC5] uppercase tracking-wider mb-2">
                <span>Custom Portfolio URL Slug *</span>
                <button onClick={handleCopyLink} className="text-[#2F6B4F] dark:text-[#78B895] hover:underline flex items-center gap-1">
                  <Copy className="w-3 h-3" /> Copy URL
                </button>
              </div>
              <div className="flex items-center bg-[#F7F9F4] dark:bg-[#1D2A22] border border-[#D5DED8] dark:border-[#304036] rounded-xl px-4 py-2.5 text-xs font-mono text-[#526158] dark:text-[#C1CEC5]">
                <span className="text-[#68776D] dark:text-[#98A99E]">ayursetu.org/portfolio/</span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="bg-transparent text-[#A96F16] dark:text-[#E5B85C] font-bold focus:outline-none ml-1 w-full"
                />
              </div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold text-[#526158] dark:text-[#C1CEC5] uppercase tracking-wider mb-2">
              <span>Professional Summary / Bio Introduction</span>
              <span className="text-[#68776D] dark:text-[#98A99E] font-mono">{summary.length} / 1000</span>
            </div>
            <textarea
              rows={4}
              maxLength={1000}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full bg-[#FFFFFF] dark:bg-[#1D2A22] border border-[#D5DED8] dark:border-[#304036] rounded-xl p-4 text-sm text-[#17231C] dark:text-[#F1F6F2] placeholder-[#68776D] dark:placeholder-[#98A99E] focus:outline-none focus:border-[#2F6B4F] dark:focus:border-[#78B895] resize-none"
              placeholder="Tell industry partners and educational institutions about your clinical skills, research background, and career goals..."
            />
          </div>

          {/* Privacy Controls */}
          <div className="pt-4 border-t border-[#D5DED8] dark:border-[#304036] grid grid-cols-1 sm:grid-cols-3 gap-4">
            <label className="flex items-center gap-3 p-3 rounded-xl bg-[#F7F9F4] dark:bg-[#1D2A22] border border-[#D5DED8] dark:border-[#304036] cursor-pointer">
              <input
                type="checkbox"
                checked={contactEmailPublic}
                onChange={(e) => setContactEmailPublic(e.target.checked)}
                className="w-4 h-4 rounded border-[#D5DED8] dark:border-[#304036] accent-[#2F6B4F] dark:accent-[#78B895]"
              />
              <span className="text-xs font-medium text-[#17231C] dark:text-[#F1F6F2]">Show Email Publicly</span>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-xl bg-[#F7F9F4] dark:bg-[#1D2A22] border border-[#D5DED8] dark:border-[#304036] cursor-pointer">
              <input
                type="checkbox"
                checked={showSkillScores}
                onChange={(e) => setShowSkillScores(e.target.checked)}
                className="w-4 h-4 rounded border-[#D5DED8] dark:border-[#304036] accent-[#2F6B4F] dark:accent-[#78B895]"
              />
              <span className="text-xs font-medium text-[#17231C] dark:text-[#F1F6F2]">Show Skill Scores</span>
            </label>

            <div className="p-3 rounded-xl bg-[#F7F9F4] dark:bg-[#1D2A22] border border-[#D5DED8] dark:border-[#304036] text-[11px] text-[#68776D] dark:text-[#98A99E] flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-[#A96F16] dark:text-[#E5B85C]" />
              <span>Skill Gaps & Applications are PRIVATE by default</span>
            </div>
          </div>
        </div>

        {/* PROJECTS SECTION */}
        <div className="rounded-2xl border border-[#D5DED8] dark:border-[#304036] bg-[#FFFFFF] dark:bg-[#17211B] p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-[#D5DED8] dark:border-[#304036] pb-4">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2 text-[#142019] dark:text-[#FFFFFF]">
                <Briefcase className="w-5 h-5 text-[#A96F16] dark:text-[#E5B85C]" /> Research & Applied Projects
              </h2>
              <p className="text-xs text-[#526158] dark:text-[#C1CEC5] mt-0.5">Showcase formulation studies, clinical trials, or digital health applications.</p>
            </div>
            <button
              onClick={() => {
                setEditingItem(null);
                setProjectForm({ title: "", description: "", role: "", techInput: "", project_url: "", is_featured: false });
                setActiveModal("project");
              }}
              className="px-3.5 py-2 rounded-xl bg-[#EEF4EF] dark:bg-[#223128] hover:bg-[#DCEBE1] dark:hover:bg-[#294637] text-[#2F6B4F] dark:text-[#78B895] font-bold text-xs border border-[#D5DED8] dark:border-[#304036] transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" /> Add Project
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {portfolio?.projects?.map((p: any) => (
              <div key={p.id} className="p-5 rounded-xl bg-[#F7F9F4] dark:bg-[#1D2A22] border border-[#D5DED8] dark:border-[#304036] space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className="font-bold text-[#142019] dark:text-[#FFFFFF]">{p.title}</h3>
                    {p.is_featured && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-[#A96F16] dark:text-[#E5B85C] border border-[#A96F16]/30 dark:border-[#E5B85C]/30">
                        Featured
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#526158] dark:text-[#C1CEC5] line-clamp-3">{p.description}</p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[#D5DED8] dark:border-[#304036]">
                  <div className="flex flex-wrap gap-1">
                    {p.technologies?.map((t: string, i: number) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-[#FFFFFF] dark:bg-[#17211B] text-[#526158] dark:text-[#C1CEC5] border border-[#D5DED8] dark:border-[#304036] font-mono">
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleDeleteProject(p.id)} className="p-1.5 text-[#68776D] dark:text-[#98A99E] hover:text-[#B64040] dark:hover:text-[#F18484] transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {(!portfolio?.projects || portfolio.projects.length === 0) && (
              <div className="col-span-2 text-center py-8 text-[#68776D] dark:text-[#98A99E] text-xs italic">
                No research or applied projects added yet. Click "Add Project" to showcase your work.
              </div>
            )}
          </div>
        </div>

        {/* EXPERIENCES SECTION */}
        <div className="rounded-2xl border border-[#D5DED8] dark:border-[#304036] bg-[#FFFFFF] dark:bg-[#17211B] p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-[#D5DED8] dark:border-[#304036] pb-4">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2 text-[#142019] dark:text-[#FFFFFF]">
                <FileText className="w-5 h-5 text-[#2F6B4F] dark:text-[#78B895]" /> Work & Internship Experience
              </h2>
              <p className="text-xs text-[#526158] dark:text-[#C1CEC5] mt-0.5">Highlight industry internships, clinical rotations, or research fellowships.</p>
            </div>
            <button
              onClick={() => {
                setEditingItem(null);
                setExpForm({ organization: "", role: "", experience_type: "INTERNSHIP", start_date: "", end_date: "", description: "" });
                setActiveModal("experience");
              }}
              className="px-3.5 py-2 rounded-xl bg-[#EEF4EF] dark:bg-[#223128] hover:bg-[#DCEBE1] dark:hover:bg-[#294637] text-[#2F6B4F] dark:text-[#78B895] font-bold text-xs border border-[#D5DED8] dark:border-[#304036] transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" /> Add Experience
            </button>
          </div>

          <div className="space-y-3">
            {portfolio?.experiences?.map((e: any) => (
              <div key={e.id} className="p-4 rounded-xl bg-[#F7F9F4] dark:bg-[#1D2A22] border border-[#D5DED8] dark:border-[#304036] flex items-center justify-between gap-4">
                <div>
                  <div className="font-bold text-[#142019] dark:text-[#FFFFFF] text-sm">{e.role} — <span className="text-[#A96F16] dark:text-[#E5B85C]">{e.organization}</span></div>
                  <div className="text-[11px] text-[#68776D] dark:text-[#98A99E] mt-0.5">{e.start_date} to {e.end_date || "Present"}</div>
                </div>
                <button onClick={() => handleDeleteExp(e.id)} className="p-1.5 text-[#68776D] dark:text-[#98A99E] hover:text-[#B64040] dark:hover:text-[#F18484] transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* CERTIFICATIONS & ACHIEVEMENTS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Certifications */}
          <div className="rounded-2xl border border-[#D5DED8] dark:border-[#304036] bg-[#FFFFFF] dark:bg-[#17211B] p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-[#D5DED8] dark:border-[#304036] pb-4">
              <h2 className="text-lg font-bold flex items-center gap-2 text-[#142019] dark:text-[#FFFFFF]">
                <Award className="w-5 h-5 text-[#2F7D4A] dark:text-[#7BC894]" /> Certifications
              </h2>
              <button
                onClick={() => {
                  setEditingItem(null);
                  setCertForm({ name: "", issuer: "", issue_date: "", credential_url: "", description: "" });
                  setActiveModal("certification");
                }}
                className="p-2 rounded-lg bg-[#EEF4EF] dark:bg-[#223128] hover:bg-[#DCEBE1] dark:hover:bg-[#294637] text-[#2F6B4F] dark:text-[#78B895] transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {portfolio?.certifications?.map((c: any) => (
                <div key={c.id} className="p-3 rounded-xl bg-[#F7F9F4] dark:bg-[#1D2A22] border border-[#D5DED8] dark:border-[#304036] flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-[#142019] dark:text-[#FFFFFF]">{c.name}</div>
                    <div className="text-[10px] text-[#68776D] dark:text-[#98A99E]">{c.issuer}</div>
                  </div>
                  <button onClick={() => handleDeleteCert(c.id)} className="p-1 text-[#68776D] dark:text-[#98A99E] hover:text-[#B64040] dark:hover:text-[#F18484] transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Achievements */}
          <div className="rounded-2xl border border-[#D5DED8] dark:border-[#304036] bg-[#FFFFFF] dark:bg-[#17211B] p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-[#D5DED8] dark:border-[#304036] pb-4">
              <h2 className="text-lg font-bold flex items-center gap-2 text-[#142019] dark:text-[#FFFFFF]">
                <Award className="w-5 h-5 text-[#A96F16] dark:text-[#E5B85C]" /> Achievements
              </h2>
              <button
                onClick={() => {
                  setEditingItem(null);
                  setAchForm({ title: "", issuer: "", date: "", description: "", credential_url: "" });
                  setActiveModal("achievement");
                }}
                className="p-2 rounded-lg bg-[#EEF4EF] dark:bg-[#223128] hover:bg-[#DCEBE1] dark:hover:bg-[#294637] text-[#2F6B4F] dark:text-[#78B895] transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {portfolio?.achievements?.map((a: any) => (
                <div key={a.id} className="p-3 rounded-xl bg-[#F7F9F4] dark:bg-[#1D2A22] border border-[#D5DED8] dark:border-[#304036] flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-[#142019] dark:text-[#FFFFFF]">{a.title}</div>
                    <div className="text-[10px] text-[#68776D] dark:text-[#98A99E]">{a.issuer}</div>
                  </div>
                  <button onClick={() => handleDeleteAch(a.id)} className="p-1 text-[#68776D] dark:text-[#98A99E] hover:text-[#B64040] dark:hover:text-[#F18484] transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* MODAL FOR PROJECTS */}
        {activeModal === "project" && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="max-w-lg w-full p-6 rounded-2xl border border-[#D5DED8] dark:border-[#304036] bg-[#FFFFFF] dark:bg-[#17211B] shadow-2xl space-y-4">
              <h3 className="text-lg font-bold text-[#142019] dark:text-[#FFFFFF]">Add Project</h3>
              <form onSubmit={handleSaveProject} className="space-y-4">
                <input
                  type="text"
                  required
                  placeholder="Project Title *"
                  value={projectForm.title}
                  onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                  className="w-full bg-[#FFFFFF] dark:bg-[#1D2A22] border border-[#D5DED8] dark:border-[#304036] rounded-xl px-4 py-2 text-xs text-[#17231C] dark:text-[#F1F6F2] placeholder-[#68776D] dark:placeholder-[#98A99E] focus:outline-none focus:border-[#2F6B4F] dark:focus:border-[#78B895]"
                />
                <textarea
                  rows={3}
                  required
                  placeholder="Description *"
                  value={projectForm.description}
                  onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                  className="w-full bg-[#FFFFFF] dark:bg-[#1D2A22] border border-[#D5DED8] dark:border-[#304036] rounded-xl p-3 text-xs text-[#17231C] dark:text-[#F1F6F2] placeholder-[#68776D] dark:placeholder-[#98A99E] focus:outline-none focus:border-[#2F6B4F] dark:focus:border-[#78B895] resize-none"
                />
                <input
                  type="text"
                  placeholder="Technologies (comma-separated, e.g. Python, HPLC, GMP)"
                  value={projectForm.techInput}
                  onChange={(e) => setProjectForm({ ...projectForm, techInput: e.target.value })}
                  className="w-full bg-[#FFFFFF] dark:bg-[#1D2A22] border border-[#D5DED8] dark:border-[#304036] rounded-xl px-4 py-2 text-xs text-[#17231C] dark:text-[#F1F6F2] placeholder-[#68776D] dark:placeholder-[#98A99E] focus:outline-none focus:border-[#2F6B4F] dark:focus:border-[#78B895]"
                />
                <input
                  type="url"
                  placeholder="Project URL (HTTPS)"
                  value={projectForm.project_url}
                  onChange={(e) => setProjectForm({ ...projectForm, project_url: e.target.value })}
                  className="w-full bg-[#FFFFFF] dark:bg-[#1D2A22] border border-[#D5DED8] dark:border-[#304036] rounded-xl px-4 py-2 text-xs text-[#17231C] dark:text-[#F1F6F2] placeholder-[#68776D] dark:placeholder-[#98A99E] focus:outline-none focus:border-[#2F6B4F] dark:focus:border-[#78B895]"
                />
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 text-xs text-[#68776D] dark:text-[#98A99E] hover:text-[#17231C] dark:hover:text-[#F1F6F2] font-bold transition-colors">Cancel</button>
                  <button type="submit" className="px-4 py-2 rounded-xl bg-[#2F6B4F] hover:bg-[#24563F] text-white dark:bg-[#78B895] dark:hover:bg-[#91CAA8] dark:text-[#0D1511] font-bold text-xs transition-all shadow-sm">Save Project</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL FOR EXPERIENCE */}
        {activeModal === "experience" && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="max-w-lg w-full p-6 rounded-2xl border border-[#D5DED8] dark:border-[#304036] bg-[#FFFFFF] dark:bg-[#17211B] shadow-2xl space-y-4">
              <h3 className="text-lg font-bold text-[#142019] dark:text-[#FFFFFF]">Add Experience</h3>
              <form onSubmit={handleSaveExp} className="space-y-4">
                <input
                  type="text"
                  required
                  placeholder="Organization / Company Name *"
                  value={expForm.organization}
                  onChange={(e) => setExpForm({ ...expForm, organization: e.target.value })}
                  className="w-full bg-[#FFFFFF] dark:bg-[#1D2A22] border border-[#D5DED8] dark:border-[#304036] rounded-xl px-4 py-2 text-xs text-[#17231C] dark:text-[#F1F6F2] placeholder-[#68776D] dark:placeholder-[#98A99E] focus:outline-none focus:border-[#2F6B4F] dark:focus:border-[#78B895]"
                />
                <input
                  type="text"
                  required
                  placeholder="Role / Designation *"
                  value={expForm.role}
                  onChange={(e) => setExpForm({ ...expForm, role: e.target.value })}
                  className="w-full bg-[#FFFFFF] dark:bg-[#1D2A22] border border-[#D5DED8] dark:border-[#304036] rounded-xl px-4 py-2 text-xs text-[#17231C] dark:text-[#F1F6F2] placeholder-[#68776D] dark:placeholder-[#98A99E] focus:outline-none focus:border-[#2F6B4F] dark:focus:border-[#78B895]"
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    required
                    placeholder="Start Date (e.g. 2025-06) *"
                    value={expForm.start_date}
                    onChange={(e) => setExpForm({ ...expForm, start_date: e.target.value })}
                    className="w-full bg-[#FFFFFF] dark:bg-[#1D2A22] border border-[#D5DED8] dark:border-[#304036] rounded-xl px-4 py-2 text-xs text-[#17231C] dark:text-[#F1F6F2] placeholder-[#68776D] dark:placeholder-[#98A99E] focus:outline-none focus:border-[#2F6B4F] dark:focus:border-[#78B895]"
                  />
                  <input
                    type="text"
                    placeholder="End Date (e.g. 2025-12 or Present)"
                    value={expForm.end_date}
                    onChange={(e) => setExpForm({ ...expForm, end_date: e.target.value })}
                    className="w-full bg-[#FFFFFF] dark:bg-[#1D2A22] border border-[#D5DED8] dark:border-[#304036] rounded-xl px-4 py-2 text-xs text-[#17231C] dark:text-[#F1F6F2] placeholder-[#68776D] dark:placeholder-[#98A99E] focus:outline-none focus:border-[#2F6B4F] dark:focus:border-[#78B895]"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 text-xs text-[#68776D] dark:text-[#98A99E] hover:text-[#17231C] dark:hover:text-[#F1F6F2] font-bold transition-colors">Cancel</button>
                  <button type="submit" className="px-4 py-2 rounded-xl bg-[#2F6B4F] hover:bg-[#24563F] text-white dark:bg-[#78B895] dark:hover:bg-[#91CAA8] dark:text-[#0D1511] font-bold text-xs transition-all shadow-sm">Save Experience</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL FOR CERTIFICATIONS */}
        {activeModal === "certification" && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="max-w-lg w-full p-6 rounded-2xl border border-[#D5DED8] dark:border-[#304036] bg-[#FFFFFF] dark:bg-[#17211B] shadow-2xl space-y-4">
              <h3 className="text-lg font-bold text-[#142019] dark:text-[#FFFFFF]">Add Certification</h3>
              <form onSubmit={handleSaveCert} className="space-y-4">
                <input
                  type="text"
                  required
                  placeholder="Certification Name *"
                  value={certForm.name}
                  onChange={(e) => setCertForm({ ...certForm, name: e.target.value })}
                  className="w-full bg-[#FFFFFF] dark:bg-[#1D2A22] border border-[#D5DED8] dark:border-[#304036] rounded-xl px-4 py-2 text-xs text-[#17231C] dark:text-[#F1F6F2] placeholder-[#68776D] dark:placeholder-[#98A99E] focus:outline-none focus:border-[#2F6B4F] dark:focus:border-[#78B895]"
                />
                <input
                  type="text"
                  required
                  placeholder="Issuer / Council *"
                  value={certForm.issuer}
                  onChange={(e) => setCertForm({ ...certForm, issuer: e.target.value })}
                  className="w-full bg-[#FFFFFF] dark:bg-[#1D2A22] border border-[#D5DED8] dark:border-[#304036] rounded-xl px-4 py-2 text-xs text-[#17231C] dark:text-[#F1F6F2] placeholder-[#68776D] dark:placeholder-[#98A99E] focus:outline-none focus:border-[#2F6B4F] dark:focus:border-[#78B895]"
                />
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 text-xs text-[#68776D] dark:text-[#98A99E] hover:text-[#17231C] dark:hover:text-[#F1F6F2] font-bold transition-colors">Cancel</button>
                  <button type="submit" className="px-4 py-2 rounded-xl bg-[#2F6B4F] hover:bg-[#24563F] text-white dark:bg-[#78B895] dark:hover:bg-[#91CAA8] dark:text-[#0D1511] font-bold text-xs transition-all shadow-sm">Save Certification</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL FOR ACHIEVEMENTS */}
        {activeModal === "achievement" && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="max-w-lg w-full p-6 rounded-2xl border border-[#D5DED8] dark:border-[#304036] bg-[#FFFFFF] dark:bg-[#17211B] shadow-2xl space-y-4">
              <h3 className="text-lg font-bold text-[#142019] dark:text-[#FFFFFF]">Add Achievement</h3>
              <form onSubmit={handleSaveAch} className="space-y-4">
                <input
                  type="text"
                  required
                  placeholder="Achievement / Award Title *"
                  value={achForm.title}
                  onChange={(e) => setAchForm({ ...achForm, title: e.target.value })}
                  className="w-full bg-[#FFFFFF] dark:bg-[#1D2A22] border border-[#D5DED8] dark:border-[#304036] rounded-xl px-4 py-2 text-xs text-[#17231C] dark:text-[#F1F6F2] placeholder-[#68776D] dark:placeholder-[#98A99E] focus:outline-none focus:border-[#2F6B4F] dark:focus:border-[#78B895]"
                />
                <input
                  type="text"
                  placeholder="Issuer / Organization"
                  value={achForm.issuer}
                  onChange={(e) => setAchForm({ ...achForm, issuer: e.target.value })}
                  className="w-full bg-[#FFFFFF] dark:bg-[#1D2A22] border border-[#D5DED8] dark:border-[#304036] rounded-xl px-4 py-2 text-xs text-[#17231C] dark:text-[#F1F6F2] placeholder-[#68776D] dark:placeholder-[#98A99E] focus:outline-none focus:border-[#2F6B4F] dark:focus:border-[#78B895]"
                />
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 text-xs text-[#68776D] dark:text-[#98A99E] hover:text-[#17231C] dark:hover:text-[#F1F6F2] font-bold transition-colors">Cancel</button>
                  <button type="submit" className="px-4 py-2 rounded-xl bg-[#2F6B4F] hover:bg-[#24563F] text-white dark:bg-[#78B895] dark:hover:bg-[#91CAA8] dark:text-[#0D1511] font-bold text-xs transition-all shadow-sm">Save Achievement</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
