"use client";

import React from "react";
import Link from "next/link";
import {
  Layers,
  Sparkles,
  HeartHandshake,
  BookOpen,
  Stethoscope,
  ShieldCheck,
  ArrowRight
} from "lucide-react";

interface EcosystemCard {
  title: string;
  sanskritSubtitle: string;
  description: string;
  route: string;
  icon: React.ElementType;
  badge: string;
  badgeColor: string;
  accentGradient: string;
}

const ECOSYSTEM_CARDS: EcosystemCard[] = [
  {
    title: "Interactive 3D Anatomy & 107 Marma",
    sanskritSubtitle: "Sharira Rachana & Marma Vijnana",
    description: "Multi-system photorealistic human anatomical inspection, dual-sex GLTF models, cross-sectional internal histology, and Sushruta 107 Marma points with vital angles.",
    route: "/interactive-3d",
    icon: Layers,
    badge: "Interactive 3D Engine",
    badgeColor: "bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300/40",
    accentGradient: "from-amber-500/10 to-transparent dark:from-amber-500/5"
  },
  {
    title: "AI Career Diagnostics & Guidance",
    sanskritSubtitle: "Yukti & Karmapatha Nirupana",
    description: "Predictive Ayurvedic career roadmaps, postgraduate clinical specialization diagnostics, skills benchmarking, and AI-powered curriculum mentorship.",
    route: "/ai-career",
    icon: Sparkles,
    badge: "AI Powered",
    badgeColor: "bg-emerald-100 text-emerald-900 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-300/40",
    accentGradient: "from-emerald-500/10 to-transparent dark:from-emerald-500/5"
  },
  {
    title: "Medical Camps & Field Outreaches",
    sanskritSubtitle: "Chikitsa Shibir & Seva Abhiyan",
    description: "Nationwide community health outreach management, patient intake triage, volunteer logistics, medicine distribution, and post-camp outcome tracking.",
    route: "/camps",
    icon: HeartHandshake,
    badge: "Clinical Operations",
    badgeColor: "bg-teal-100 text-teal-900 dark:bg-teal-950/80 dark:text-teal-300 border-teal-300/40",
    accentGradient: "from-teal-500/10 to-transparent dark:from-teal-500/5"
  },
  {
    title: "Classical Learning Hub & Pharmacopoeia",
    sanskritSubtitle: "Samhita & Dravyaguna Kosha",
    description: "Digitized classical Samhitas (Charaka, Sushruta, Ashtanga), botanical herbarium monographs, formulation preparation protocols, and modern clinical research.",
    route: "/learning-hub",
    icon: BookOpen,
    badge: "Classical Knowledge",
    badgeColor: "bg-orange-100 text-orange-900 dark:bg-orange-950/80 dark:text-orange-300 border-orange-300/40",
    accentGradient: "from-orange-500/10 to-transparent dark:from-orange-500/5"
  },
  {
    title: "Clinical Tele-Consultation Suite",
    sanskritSubtitle: "Rogi Pariksha & Chikitsa Setu",
    description: "Comprehensive Prakriti assessment, pulse diagnosis records, digital prescription generation, follow-up scheduling, and encrypted patient histories.",
    route: "/consultations",
    icon: Stethoscope,
    badge: "Tele-Health",
    badgeColor: "bg-blue-100 text-blue-900 dark:bg-blue-950/80 dark:text-blue-300 border-blue-300/40",
    accentGradient: "from-blue-500/10 to-transparent dark:from-blue-500/5"
  },
  {
    title: "Accreditation & Regulatory Registry",
    sanskritSubtitle: "Pramanikaran & Vidhi Niyamak",
    description: "Practitioner credential verification, AYUSH regulatory compliance benchmarks, institute licensing auditing, and authentic certified institution badges.",
    route: "/regulatory",
    icon: ShieldCheck,
    badge: "Regulatory Standards",
    badgeColor: "bg-purple-100 text-purple-900 dark:bg-purple-950/80 dark:text-purple-300 border-purple-300/40",
    accentGradient: "from-purple-500/10 to-transparent dark:from-purple-500/5"
  }
];

export default function EcosystemSection() {
  return (
    <section className="relative py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-10 bg-[#F6F3EB] dark:bg-[#07160e] transition-colors duration-300 border-t border-[#E5DFD3]/80 dark:border-white/5">
      <div className="max-w-[1400px] mx-auto space-y-12">
        {/* Section Header */}
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300/40 text-emerald-800 dark:text-emerald-300 text-xs font-mono font-bold uppercase tracking-wider">
            <span>🌿</span>
            <span>Ayurvedic Healthcare Ecosystem</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-[#0E2F1F] dark:text-[#F6F3EB] tracking-tight">
            Bridging Ancient Ayurvedic Wisdom with State-of-the-Art Digital Technologies
          </h2>
          <p className="text-sm sm:text-base text-[#627067] dark:text-[#A9B9AE] leading-relaxed">
            Aayuraura empowers clinicians, scholars, students, and healthcare institutions through an integrated suite of 3D anatomical visualization, intelligent diagnostic engines, and decentralized clinical workflows.
          </p>
        </div>

        {/* 6-Card Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ECOSYSTEM_CARDS.map((card, idx) => {
            const Icon = card.icon;
            return (
              <Link
                key={idx}
                href={card.route}
                className="group relative p-6 sm:p-7 rounded-3xl bg-white/90 dark:bg-[#0D2419]/80 backdrop-blur-md border border-[rgba(212,155,75,0.25)] hover:border-[#D49B4B] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer active:scale-[0.99]"
              >
                {/* Subtle Ambient Gradient Glow */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${card.accentGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}
                />

                <div className="space-y-4 relative z-10">
                  {/* Top Badge & Icon */}
                  <div className="flex items-center justify-between gap-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-mono font-bold uppercase tracking-wide border ${card.badgeColor}`}
                    >
                      {card.badge}
                    </span>
                    <div className="w-10 h-10 rounded-2xl bg-[#0E2F1F]/5 dark:bg-white/5 border border-[rgba(212,155,75,0.2)] flex items-center justify-center text-[#D49B4B] group-hover:scale-110 group-hover:bg-[#0E2F1F] group-hover:text-[#D49B4B] transition-all duration-300">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Title & Sanskrit Subtitle */}
                  <div>
                    <h3 className="text-lg font-bold font-serif-heading text-[#0E2F1F] dark:text-[#EAE3D2] group-hover:text-[#D49B4B] transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-xs font-serif italic text-[#D49B4B] mt-0.5">
                      {card.sanskritSubtitle}
                    </p>
                  </div>

                  {/* Description */}
                  <p className="text-xs sm:text-[13px] text-[#627067] dark:text-[#A9B9AE] leading-relaxed">
                    {card.description}
                  </p>
                </div>

                {/* Bottom Action Link */}
                <div className="pt-5 mt-4 border-t border-gray-100 dark:border-white/5 flex items-center justify-between text-xs font-bold text-[#0E2F1F] dark:text-[#D49B4B] group-hover:translate-x-1 transition-transform relative z-10">
                  <span>Explore Module</span>
                  <ArrowRight className="w-4 h-4 text-[#D49B4B]" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
