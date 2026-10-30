"use client";

import Link from "next/link";
import { Sparkles, ShieldCheck } from "lucide-react";

export default function Footer() {
  return (
    <footer id="about" className="bg-[#08170f] text-[#8ea898] pt-14 pb-8 border-t border-white/10">
      <div id="contact" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-12 border-b border-white/10">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <img
                src="/logo-emblem.png"
                alt="Aayuraura Official Logo"
                className="w-12 h-12 object-contain drop-shadow"
              />
              <div className="flex flex-col">
                <div className="flex items-baseline font-serif-heading font-bold text-2xl leading-tight">
                  <span className="text-white">Aayur</span>
                  <span className="text-[#c08238]">aura</span>
                </div>
                <span className="text-xs text-[#8ec4a2] font-serif tracking-normal leading-none mt-0.5">
                  आयुर्वेदो अमृतानाम्
                </span>
              </div>
            </Link>
            <p className="text-xs sm:text-sm text-[#839e8f] max-w-sm leading-relaxed">
              Empowering Ayush students, institutions, and healthcare industry partners with explainable AI skill diagnostics, 3D spatial anatomy, and clinical opportunities.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#c08238] bg-[#162e20] px-3 py-1.5 rounded-full w-fit border border-[#c08238]/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>SIH 2026 — Problem Statement 26044</span>
            </div>
          </div>

          {/* Quick Links Column 1 */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white font-serif-heading">
              Platform
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link href="/student/dashboard" className="hover:text-white transition-colors">
                  Student Portal
                </Link>
              </li>
              <li>
                <Link href="/ai-career" className="hover:text-white transition-colors">
                  AI Career Studio
                </Link>
              </li>
              <li>
                <Link href="/interactive-3d" className="hover:text-white transition-colors">
                  3D Anatomy & Marma
                </Link>
              </li>
              <li>
                <Link href="/camps" className="hover:text-white transition-colors">
                  Clinical Camps
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links Column 2 */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white font-serif-heading">
              Ecosystem
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link href="/institution/dashboard" className="hover:text-white transition-colors">
                  Institutions & Faculty
                </Link>
              </li>
              <li>
                <Link href="/industry/dashboard" className="hover:text-white transition-colors">
                  Industry & Recruiters
                </Link>
              </li>
              <li>
                <Link href="/verification" className="hover:text-white transition-colors">
                  Trust & Badges
                </Link>
              </li>
              <li>
                <Link href="/learning-hub" className="hover:text-white transition-colors">
                  Learning Hub
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links Column 3 */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white font-serif-heading">
              Knowledge
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link href="/herbs-research" className="hover:text-white transition-colors">
                  Herbs & Research
                </Link>
              </li>
              <li>
                <Link href="/community-forum" className="hover:text-white transition-colors">
                  Discussion Forum
                </Link>
              </li>
              <li>
                <Link href="/student/portfolio" className="hover:text-white transition-colors">
                  Digital Portfolio
                </Link>
              </li>
              <li>
                <Link href="/student/assessments" className="hover:text-white transition-colors">
                  Skill Assessments
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#6e8a7a]">
          <div className="flex items-center gap-2">
            <span>© 2026 Aayuraura. Built for Ministry of Ayush & SIH 2026.</span>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Ayush Educational Compliance</span>
            </div>
            <Link href="/verification" className="hover:text-white transition-colors">
              Trust & Verification
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
