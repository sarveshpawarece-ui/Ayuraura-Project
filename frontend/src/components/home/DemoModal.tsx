"use client";

import { useState } from "react";
import Link from "next/link";
import { X, Sparkles, Box, ShieldCheck, Award, ArrowRight, Play } from "lucide-react";

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DemoModal({ isOpen, onClose }: DemoModalProps) {
  const [activeTab, setActiveTab] = useState<number>(0);

  if (!isOpen) return null;

  const demoSteps = [
    {
      title: "1. AI Skill Intelligence",
      tag: "Explainable Diagnostics",
      description:
        "Take standardized clinical and phytochemistry assessments. The AI engine evaluates your answers against industry competency weights and generates a customized career roadmap.",
      cta: "Try AI Assessment",
      href: "/ai-career",
      icon: Sparkles,
      color: "from-emerald-600 to-teal-700",
    },
    {
      title: "2. Interactive 3D Anatomy",
      tag: "Spatial Learning",
      description:
        "Explore interactive 3D Ayurveda human models, Marma points, Srotas channels, and organ relationships with rotation, zoom, and Sanskrit shloka references.",
      cta: "Open 3D Viewer",
      href: "/interactive-3d",
      icon: Box,
      color: "from-teal-600 to-emerald-800",
    },
    {
      title: "3. Clinical Camps & Internships",
      tag: "Hands-on Practice",
      description:
        "Doctors and NGOs post free Ayurvedic health camps and clinical internships. Students apply, track volunteer hours, and receive tamper-proof certificates.",
      cta: "View Free Camps",
      href: "/camps",
      icon: Award,
      color: "from-amber-600 to-yellow-700",
    },
    {
      title: "4. Trust & Verified Credentials",
      tag: "Academic Integrity",
      description:
        "Verified badges for Students, Doctors, and NGOs. Secure document storage and tamper-evident digital portfolios with verifiable QR codes.",
      cta: "Explore Verification",
      href: "/verification",
      icon: ShieldCheck,
      color: "from-emerald-700 to-green-900",
    },
  ];

  const current = demoSteps[activeTab];
  const Icon = current.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-[#FFFFFF] dark:bg-[#17211B] rounded-3xl shadow-2xl border border-[#D5DED8] dark:border-[#304036] overflow-hidden transition-colors duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#D5DED8] dark:border-[#304036] bg-[#F7F9F4] dark:bg-[#0D1511]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#DCEBE1] dark:bg-[#294637] text-[#2F6B4F] dark:text-[#78B895] flex items-center justify-center">
              <Play className="w-3.5 h-3.5 fill-current" />
            </div>
            <h3 className="text-lg font-bold font-serif-heading text-[#142019] dark:text-[#FFFFFF]">
              Aayuraura Platform Interactive Tour
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#68776D] dark:text-[#98A99E] hover:text-[#17231C] dark:hover:text-[#F1F6F2] hover:bg-[#EEF4EF] dark:hover:bg-[#223128] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 p-2 bg-[#EEF4EF] dark:bg-[#223128] border-b border-[#D5DED8] dark:border-[#304036]">
          {demoSteps.map((step, idx) => (
            <button
              key={idx}
              onClick={() => setActiveTab(idx)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === idx
                  ? "bg-[#FFFFFF] dark:bg-[#17211B] text-[#142019] dark:text-[#FFFFFF] shadow-xs border border-[#D5DED8] dark:border-[#304036]"
                  : "text-[#526158] dark:text-[#C1CEC5] hover:text-[#17231C] dark:hover:text-[#FFFFFF] hover:bg-white/50 dark:hover:bg-white/5"
              }`}
            >
              {step.title}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div
              className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${current.color} text-white flex items-center justify-center shrink-0 shadow-lg`}
            >
              <Icon className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#A96F16] dark:text-[#E5B85C] bg-[#FAF0E1] dark:bg-[#332512] px-2.5 py-1 rounded-full border border-[#A96F16]/30">
                {current.tag}
              </span>
              <h4 className="text-2xl font-bold font-serif-heading text-[#142019] dark:text-[#FFFFFF]">
                {current.title}
              </h4>
              <p className="text-sm text-[#526158] dark:text-[#C1CEC5] leading-relaxed">
                {current.description}
              </p>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between pt-6 border-t border-[#D5DED8] dark:border-[#304036]">
            <span className="text-xs text-[#68776D] dark:text-[#98A99E]">
              Step {activeTab + 1} of {demoSteps.length}
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-semibold text-[#526158] dark:text-[#C1CEC5] hover:text-[#17231C] dark:hover:text-[#FFFFFF]"
              >
                Close Tour
              </button>
              <Link
                href={current.href}
                onClick={onClose}
                className="px-5 py-2.5 rounded-full bg-[#2F6B4F] hover:bg-[#24563F] dark:bg-[#78B895] dark:hover:bg-[#91CAA8] text-white dark:text-[#0D1511] text-sm font-semibold flex items-center gap-2 transition-all shadow-md"
              >
                {current.cta} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
