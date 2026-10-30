"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Sparkles,
  ShieldCheck,
  Briefcase,
  Award,
  BookOpen,
  GraduationCap,
  Mail,
  Phone,
  Globe,

  Share2,
  Printer,
  Copy,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Target
} from "lucide-react";
import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export default function PublicPortfolioPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [portfolio, setPortfolio] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchPublicPortfolio() {
      if (!slug) return;
      try {
        const res = await axios.get(`${API_BASE}/public/portfolio/${slug}`);
        setPortfolio(res.data);
      } catch (err: any) {
        setError(err.response?.data?.detail || "Portfolio not found or is currently private.");
      } finally {
        setLoading(false);
      }
    }
    fetchPublicPortfolio();
  }, [slug]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F9F4] dark:bg-[#0D1511] text-[#17231C] dark:text-[#F1F6F2] flex flex-col items-center justify-center p-6">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#2F6B4F] dark:border-[#78B895] mb-4" />
        <p className="text-xs text-[#526158] dark:text-[#98A99E] font-mono">Resolving AyurSetu Public Portfolio...</p>
      </div>
    );
  }

  if (error || !portfolio) {
    return (
      <div className="min-h-screen bg-[#F7F9F4] dark:bg-[#0D1511] text-[#17231C] dark:text-[#F1F6F2] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] flex items-center justify-center text-[#A96F16] dark:text-[#E5B85C] shadow-xs">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-[#142019] dark:text-[#FFFFFF]">Portfolio Unavailable</h1>
        <p className="text-sm text-[#526158] dark:text-[#C1CEC5] max-w-md">{error || "The requested portfolio does not exist or has been made private by the student."}</p>
        <Link href="/" className="px-5 py-2.5 rounded-xl bg-[#2F6B4F] hover:bg-[#24563F] dark:bg-[#78B895] dark:hover:bg-[#91CAA8] text-white dark:text-[#0D1511] font-bold text-xs transition-colors shadow-xs">
          Return to AyurSetu Portal
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F9F4] dark:bg-[#0D1511] text-[#17231C] dark:text-[#F1F6F2] flex flex-col font-sans transition-colors duration-200">
      {/* Top Branding Navigation */}
      <header className="bg-[#FFFFFF]/90 dark:bg-[#17211B]/90 backdrop-blur-md border-b border-[#D5DED8] dark:border-[#304036] sticky top-0 z-30 px-6 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#2F6B4F] dark:text-[#78B895]" />
            <span className="font-extrabold text-base bg-gradient-to-r from-[#2F6B4F] via-[#2F7D4A] to-[#A96F16] dark:from-[#78B895] dark:via-[#7BC894] dark:to-[#E5B85C] bg-clip-text text-transparent">
              AyurSetu
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCopyLink}
              className="px-3.5 py-1.5 rounded-2xl bg-[#EEF4EF] dark:bg-[#223128] hover:bg-[#D5DED8] dark:hover:bg-[#304036] text-xs font-bold text-[#17231C] dark:text-[#F1F6F2] border border-[#D5DED8] dark:border-[#304036] transition-colors flex items-center gap-1.5"
            >
              {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-[#2F7D4A] dark:text-[#7BC894]" /> : <Copy className="w-3.5 h-3.5 text-[#A96F16] dark:text-[#E5B85C]" />}
              <span>{copied ? "Copied Link" : "Share"}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-2xl bg-[#2F6B4F] hover:bg-[#24563F] dark:bg-[#78B895] dark:hover:bg-[#91CAA8] text-white dark:text-[#0D1511] text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" /> Print PDF
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto p-6 md:p-10 space-y-10">
        {/* HERO CARD */}
        <div className="bg-[#FFFFFF] dark:bg-[#17211B] p-8 md:p-10 rounded-3xl border border-[#D5DED8] dark:border-[#304036] space-y-6 shadow-xs relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#DCEBE1] dark:bg-[#294637] text-[#2F6B4F] dark:text-[#78B895] text-xs font-semibold uppercase tracking-wider border border-[#B9C8BE] dark:border-[#425449]">
                <ShieldCheck className="w-4 h-4 text-[#2F7D4A] dark:text-[#7BC894]" /> Verified AyurSetu Talent Profile
              </div>

              <h1 className="text-3xl md:text-5xl font-bold text-[#17231C] dark:text-[#F1F6F2] tracking-tight">
                {portfolio.student_name}
              </h1>

              <p className="text-lg md:text-xl font-semibold text-[#A96F16] dark:text-[#E5B85C]">
                {portfolio.headline || "Ayurvedic Medical & Research Practitioner"}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-[#526158] dark:text-[#C1CEC5] pt-1">
                {portfolio.college_name && (
                  <span className="flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-[#526158] dark:text-[#98A99E]" /> {portfolio.college_name}
                  </span>
                )}
                {portfolio.degree_program && (
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-[#526158] dark:text-[#98A99E]" /> {portfolio.degree_program}
                  </span>
                )}
                {(portfolio.city || portfolio.state) && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#526158] dark:text-[#98A99E]" /> {portfolio.city}{portfolio.city && portfolio.state ? ", " : ""}{portfolio.state}
                  </span>
                )}
              </div>
            </div>

            {portfolio.target_career_title && (
              <div className="p-4 rounded-2xl bg-[#EEF4EF] dark:bg-[#223128] border border-[#D5DED8] dark:border-[#304036] text-left md:text-right space-y-1">
                <div className="text-[11px] font-bold text-[#526158] dark:text-[#98A99E] uppercase tracking-wider flex items-center gap-1.5 md:justify-end">
                  <Target className="w-3.5 h-3.5 text-[#A96F16] dark:text-[#E5B85C]" /> Target Career Role
                </div>
                <div className="text-base font-bold text-[#2F6B4F] dark:text-[#78B895]">{portfolio.target_career_title}</div>
              </div>
            )}
          </div>

          {portfolio.summary && (
            <div className="pt-6 border-t border-[#D5DED8] dark:border-[#304036] space-y-2">
              <h2 className="text-xs font-bold text-[#526158] dark:text-[#98A99E] uppercase tracking-wider">Executive Summary</h2>
              <p className="text-sm md:text-base text-[#17231C] dark:text-[#F1F6F2] leading-relaxed">{portfolio.summary}</p>
            </div>
          )}
        </div>

        {/* EVALUATED SKILLS SECTION */}
        {portfolio.skills?.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2 text-[#17231C] dark:text-[#F1F6F2]">
              <Sparkles className="w-5 h-5 text-[#2F6B4F] dark:text-[#78B895]" /> Evaluated Skill Competencies
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {portfolio.skills.map((s: any, i: number) => (
                <div key={i} className="bg-[#FFFFFF] dark:bg-[#17211B] p-3.5 rounded-2xl border border-[#D5DED8] dark:border-[#304036] shadow-xs flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-[#17231C] dark:text-[#F1F6F2]">{s.skill_name}</div>
                    <div className="text-[10px] text-[#526158] dark:text-[#98A99E]">{s.proficiency_level}</div>
                  </div>
                  {s.score !== undefined && (
                    <span className="text-xs font-mono font-bold text-[#A96F16] dark:text-[#E5B85C] bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800">
                      {Math.round(s.score)}%
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* RESEARCH & APPLIED PROJECTS */}
        {portfolio.projects?.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2 text-[#17231C] dark:text-[#F1F6F2]">
              <Briefcase className="w-5 h-5 text-[#2F6B4F] dark:text-[#78B895]" /> Research & Applied Projects
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {portfolio.projects.map((p: any) => (
                <div key={p.id} className="bg-[#FFFFFF] dark:bg-[#17211B] p-6 rounded-3xl border border-[#D5DED8] dark:border-[#304036] shadow-xs space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-[#17231C] dark:text-[#F1F6F2] text-base">{p.title}</h3>
                      {p.is_featured && (
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#DCEBE1] dark:bg-[#294637] text-[#2F6B4F] dark:text-[#78B895] border border-[#B9C8BE] dark:border-[#425449]">
                          Featured
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#526158] dark:text-[#C1CEC5] leading-relaxed">{p.description}</p>
                  </div>

                  {p.technologies?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-3 border-t border-[#D5DED8] dark:border-[#304036]">
                      {p.technologies.map((t: string, i: number) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-[#EEF4EF] dark:bg-[#223128] text-[#2F6B4F] dark:text-[#78B895] border border-[#D5DED8] dark:border-[#304036] font-mono">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* EXPERIENCE SECTION */}
        {portfolio.experiences?.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2 text-[#17231C] dark:text-[#F1F6F2]">
              <BookOpen className="w-5 h-5 text-[#2F6B4F] dark:text-[#78B895]" /> Experience & Rotations
            </h2>
            <div className="space-y-3">
              {portfolio.experiences.map((e: any) => (
                <div key={e.id} className="bg-[#FFFFFF] dark:bg-[#17211B] p-5 rounded-2xl border border-[#D5DED8] dark:border-[#304036] shadow-xs flex items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-[#17231C] dark:text-[#F1F6F2] text-sm">{e.role}</h3>
                    <div className="text-xs text-[#A96F16] dark:text-[#E5B85C] font-semibold">{e.organization}</div>
                    {e.description && <p className="text-xs text-[#526158] dark:text-[#C1CEC5] mt-1">{e.description}</p>}
                  </div>
                  <div className="text-xs text-[#526158] dark:text-[#98A99E] font-mono shrink-0">{e.start_date} – {e.end_date || "Present"}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CERTIFICATIONS & ACHIEVEMENTS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {portfolio.certifications?.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-lg font-bold flex items-center gap-2 text-[#17231C] dark:text-[#F1F6F2]">
                <Award className="w-5 h-5 text-[#2F7D4A] dark:text-[#7BC894]" /> Certifications
              </h2>
              <div className="space-y-3">
                {portfolio.certifications.map((c: any) => (
                  <div key={c.id} className="bg-[#FFFFFF] dark:bg-[#17211B] p-4 rounded-2xl border border-[#D5DED8] dark:border-[#304036] shadow-xs">
                    <div className="font-bold text-sm text-[#17231C] dark:text-[#F1F6F2]">{c.name}</div>
                    <div className="text-xs text-[#526158] dark:text-[#98A99E]">{c.issuer}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {portfolio.achievements?.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-lg font-bold flex items-center gap-2 text-[#17231C] dark:text-[#F1F6F2]">
                <Award className="w-5 h-5 text-[#A96F16] dark:text-[#E5B85C]" /> Achievements
              </h2>
              <div className="space-y-3">
                {portfolio.achievements.map((a: any) => (
                  <div key={a.id} className="bg-[#FFFFFF] dark:bg-[#17211B] p-4 rounded-2xl border border-[#D5DED8] dark:border-[#304036] shadow-xs">
                    <div className="font-bold text-sm text-[#17231C] dark:text-[#F1F6F2]">{a.title}</div>
                    <div className="text-xs text-[#526158] dark:text-[#98A99E]">{a.issuer}</div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* PUBLIC CONTACT CARD */}
        {portfolio.public_email && (
          <div className="bg-[#FFFFFF] dark:bg-[#17211B] p-6 rounded-2xl border border-[#D5DED8] dark:border-[#304036] shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-[#526158] dark:text-[#98A99E] uppercase tracking-wider">Contact & Connect</h3>
              <div className="text-sm font-bold text-[#17231C] dark:text-[#F1F6F2] flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#A96F16] dark:text-[#E5B85C]" /> {portfolio.public_email}
              </div>
            </div>
            <a
              href={`mailto:${portfolio.public_email}`}
              className="px-4 py-2 rounded-2xl bg-[#2F6B4F] hover:bg-[#24563F] dark:bg-[#78B895] dark:hover:bg-[#91CAA8] text-white dark:text-[#0D1511] font-bold text-xs transition-colors shadow-xs"
            >
              Send Direct Inquiry
            </a>
          </div>
        )}
      </main>

      <footer className="bg-[#EEF4EF] dark:bg-[#17211B] border-t border-[#D5DED8] dark:border-[#304036] py-6 text-center text-xs text-[#526158] dark:text-[#98A99E] font-mono">
        AyurSetu Skill Intelligence & Career Platform — SIH 2K26 Problem Statement 26044
      </footer>
    </div>
  );
}
