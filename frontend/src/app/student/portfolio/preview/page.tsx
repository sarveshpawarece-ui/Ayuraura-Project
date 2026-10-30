"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import {
  Sparkles,
  ArrowLeft,
  Globe,
  Share2,
  CheckCircle2,
  Briefcase,
  Award,
  BookOpen,
  GraduationCap,
  Mail,
  Phone,
  ExternalLink,
  ShieldCheck,
  Zap,
  Printer
} from "lucide-react";
import { api } from "@/lib/api";

export default function StudentPortfolioPreviewPage() {
  const [portfolio, setPortfolio] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPreview() {
      try {
        const res = await api.get("/student/portfolio");
        setPortfolio(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadPreview();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F9F4] dark:bg-[#0D1511] text-[#17231C] dark:text-[#F1F6F2] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2F6B4F] dark:border-[#78B895]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F9F4] dark:bg-[#0D1511] text-[#17231C] dark:text-[#F1F6F2] flex flex-col transition-colors duration-200">
      <Navbar />

      {/* Sticky Preview Banner */}
      <div className="sticky top-0 z-40 bg-[#DCEBE1]/90 dark:bg-[#294637]/90 backdrop-blur-md border-b border-[#2F6B4F]/30 dark:border-[#78B895]/30 px-6 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold text-[#2F6B4F] dark:text-[#78B895]">
          <Sparkles className="w-4 h-4 text-[#2F6B4F] dark:text-[#78B895]" />
          <span>PREVIEW MODE — This is how your portfolio appears when published.</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handlePrint} className="px-3 py-1 rounded-lg bg-[#FFFFFF] dark:bg-[#17211B] hover:bg-[#EEF4EF] dark:hover:bg-[#223128] text-[#17231C] dark:text-[#F1F6F2] text-xs font-bold transition-all flex items-center gap-1.5 border border-[#D5DED8] dark:border-[#304036]">
            <Printer className="w-3.5 h-3.5" /> Print PDF
          </button>
          <Link
            href="/student/portfolio"
            className="px-3.5 py-1.5 rounded-lg bg-[#2F6B4F] hover:bg-[#24563F] text-white dark:bg-[#78B895] dark:hover:bg-[#91CAA8] dark:text-[#0D1511] font-extrabold text-xs transition-all flex items-center gap-1.5 shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Return to Editor
          </Link>
        </div>
      </div>

      <main className="flex-1 max-w-5xl w-full mx-auto p-6 md:p-10 space-y-10">
        {/* HERO HEADER */}
        <div className="rounded-3xl border border-[#D5DED8] dark:border-[#304036] bg-[#FFFFFF] dark:bg-[#17211B] p-8 shadow-sm space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#2F6B4F]/5 dark:bg-[#78B895]/5 rounded-full blur-3xl -z-10" />

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-[#A96F16] dark:text-[#E5B85C] text-xs font-semibold uppercase tracking-wider border border-[#A96F16]/30 dark:border-[#E5B85C]/30">
                <ShieldCheck className="w-3.5 h-3.5" /> Verified Aayuraura Professional Profile
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#142019] dark:text-[#FFFFFF]">
                {portfolio?.title || "My Professional Portfolio"}
              </h1>
              <p className="text-lg font-medium text-[#2F6B4F] dark:text-[#78B895]">
                {portfolio?.headline || "Aspiring Ayurvedic Professional"}
              </p>
            </div>

            <div className="flex flex-col items-end gap-1 font-mono text-xs text-[#526158] dark:text-[#C1CEC5] bg-[#F7F9F4] dark:bg-[#1D2A22] p-4 rounded-2xl border border-[#D5DED8] dark:border-[#304036]">
              <div>Visibility: <span className="text-[#2F7D4A] dark:text-[#7BC894] font-bold">{portfolio?.visibility}</span></div>
              <div>Published: <span className="text-[#A96F16] dark:text-[#E5B85C] font-bold">{portfolio?.is_published ? "Yes" : "Draft"}</span></div>
            </div>
          </div>

          {portfolio?.summary && (
            <div className="pt-4 border-t border-[#D5DED8] dark:border-[#304036]">
              <h3 className="text-xs font-bold text-[#68776D] dark:text-[#98A99E] uppercase tracking-wider mb-2">Executive Summary</h3>
              <p className="text-sm text-[#17231C] dark:text-[#F1F6F2] leading-relaxed">{portfolio.summary}</p>
            </div>
          )}
        </div>

        {/* PROJECTS SECTION */}
        {portfolio?.projects?.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2 text-[#142019] dark:text-[#FFFFFF]">
              <Briefcase className="w-5 h-5 text-[#A96F16] dark:text-[#E5B85C]" /> Research & Applied Projects
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {portfolio.projects.map((p: any) => (
                <div key={p.id} className="rounded-2xl border border-[#D5DED8] dark:border-[#304036] bg-[#FFFFFF] dark:bg-[#17211B] p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-[#142019] dark:text-[#FFFFFF] text-base">{p.title}</h3>
                    {p.is_featured && <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-[#A96F16] dark:text-[#E5B85C] border border-[#A96F16]/30 dark:border-[#E5B85C]/30">Featured</span>}
                  </div>
                  <p className="text-xs text-[#526158] dark:text-[#C1CEC5] leading-relaxed">{p.description}</p>
                  {p.technologies?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {p.technologies.map((t: string, i: number) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-[#EEF4EF] dark:bg-[#223128] text-[#2F6B4F] dark:text-[#78B895] border border-[#D5DED8] dark:border-[#304036] font-mono">
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

        {/* EXPERIENCES SECTION */}
        {portfolio?.experiences?.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2 text-[#142019] dark:text-[#FFFFFF]">
              <BookOpen className="w-5 h-5 text-[#2F6B4F] dark:text-[#78B895]" /> Experience & Rotations
            </h2>
            <div className="space-y-3">
              {portfolio.experiences.map((e: any) => (
                <div key={e.id} className="rounded-2xl border border-[#D5DED8] dark:border-[#304036] bg-[#FFFFFF] dark:bg-[#17211B] p-5 shadow-sm flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-[#142019] dark:text-[#FFFFFF] text-sm">{e.role}</h3>
                    <div className="text-xs text-[#A96F16] dark:text-[#E5B85C] font-medium">{e.organization}</div>
                    {e.description && <p className="text-xs text-[#526158] dark:text-[#C1CEC5] mt-1">{e.description}</p>}
                  </div>
                  <div className="text-xs text-[#68776D] dark:text-[#98A99E] font-mono">{e.start_date} – {e.end_date || "Present"}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CERTIFICATIONS & ACHIEVEMENTS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {portfolio?.certifications?.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-lg font-bold flex items-center gap-2 text-[#142019] dark:text-[#FFFFFF]">
                <Award className="w-5 h-5 text-[#2F7D4A] dark:text-[#7BC894]" /> Certifications
              </h2>
              <div className="space-y-3">
                {portfolio.certifications.map((c: any) => (
                  <div key={c.id} className="rounded-xl border border-[#D5DED8] dark:border-[#304036] bg-[#FFFFFF] dark:bg-[#17211B] p-4 shadow-sm">
                    <div className="font-bold text-sm text-[#142019] dark:text-[#FFFFFF]">{c.name}</div>
                    <div className="text-xs text-[#68776D] dark:text-[#98A99E]">{c.issuer}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {portfolio?.achievements?.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-lg font-bold flex items-center gap-2 text-[#142019] dark:text-[#FFFFFF]">
                <Award className="w-5 h-5 text-[#A96F16] dark:text-[#E5B85C]" /> Achievements
              </h2>
              <div className="space-y-3">
                {portfolio.achievements.map((a: any) => (
                  <div key={a.id} className="rounded-xl border border-[#D5DED8] dark:border-[#304036] bg-[#FFFFFF] dark:bg-[#17211B] p-4 shadow-sm">
                    <div className="font-bold text-sm text-[#142019] dark:text-[#FFFFFF]">{a.title}</div>
                    <div className="text-xs text-[#68776D] dark:text-[#98A99E]">{a.issuer}</div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
