"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import { 
  Sprout, 
  Search, 
  Sparkles, 
  FileText, 
  Award, 
  ExternalLink, 
  Filter, 
  FlaskConical, 
  BookOpen 
} from "lucide-react";

interface Herb {
  id: string;
  sanskrit: string;
  devanagari: string;
  botanical: string;
  family: string;
  rasa: string[];
  guna: string[];
  virya: string;
  vipaka: string;
  prabhava: string;
  doshakarma: string;
  indications: string[];
}

const HERBS_DATA: Herb[] = [
  {
    id: "h-1",
    sanskrit: "Ashwagandha",
    devanagari: "अश्वगन्धा",
    botanical: "Withania somnifera (L.) Dunal",
    family: "Solanaceae",
    rasa: ["Tikta", "Kashaya", "Madhura"],
    guna: ["Laghu", "Snigdha"],
    virya: "Ushna (Heating)",
    vipaka: "Madhura (Sweet)",
    prabhava: "Balya & Rasayana (Adaptogenic Strength)",
    doshakarma: "Vata-Kapha Shamaka",
    indications: ["Dhatukshaya", "Klaibya", "Manasika Shrama", "Insomnia"]
  },
  {
    id: "h-2",
    sanskrit: "Guduchi",
    devanagari: "गुडूची (अमृता)",
    botanical: "Tinospora cordifolia (Willd.) Miers",
    family: "Menispermaceae",
    rasa: ["Tikta", "Kashaya"],
    guna: ["Laghu", "Snigdha"],
    virya: "Ushna",
    vipaka: "Madhura",
    prabhava: "Rasayana & Vishaghna (Immunomodulator)",
    doshakarma: "Tridoshashamaka (Balances Vata, Pitta, Kapha)",
    indications: ["Jwara", "Prameha", "Kushtha", "Kamala", "Autoimmune states"]
  },
  {
    id: "h-3",
    sanskrit: "Brahmi",
    devanagari: "ब्राह्मी",
    botanical: "Bacopa monnieri (L.) Wettst.",
    family: "Scrophulariaceae",
    rasa: ["Tikta", "Kashaya", "Madhura"],
    guna: ["Laghu", "Sara"],
    virya: "Sheeta (Cooling)",
    vipaka: "Madhura",
    prabhava: "Medhya (Cognitive Nootropic)",
    doshakarma: "Tridoshahara (Especially Vata-Pitta)",
    indications: ["Smritibhramsha", "Unmada", "Apasmara", "Stress"]
  }
];

const RESEARCH_PAPERS = [
  {
    id: "p-1",
    title: "Double-Blind Placebo-Controlled Clinical Evaluation of Standardized Withania somnifera in Stress & Cortisol Modulation",
    authors: ["Dr. V. K. Chandola", "Dr. S. K. Maurya"],
    journal: "Journal of Ayurveda and Integrative Medicine (JAIM)",
    year: 2025,
    doi: "10.1016/j.jaim.2025.100892",
    studyType: "Clinical RCT",
    abstract: "Evaluation of 600mg full-spectrum root extract demonstrated significant 27.9% reduction in serum cortisol and elevated cognitive executive function over an 8-week timeline."
  },
  {
    id: "p-2",
    title: "HPTLC Chromatographic Profiling & Phytochemical Fingerprinting of Tinospora cordifolia Stem Formulations",
    authors: ["Dr. P. R. Joshi", "A. Deshmukh"],
    journal: "AyurSci International Reviews",
    year: 2026,
    doi: "10.1016/j.asi.2026.10214",
    studyType: "Phytochemistry QC",
    abstract: "Validation of berberine and tinosporide marker quantification across multiple seasonal harvest batches compliant with ASU Pharmacopoeia of India standards."
  }
];

export default function HerbsResearchPage() {
  const [activeTab, setActiveTab] = useState<"herbs" | "research" | "projects">("herbs");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedHerb, setSelectedHerb] = useState<Herb>(HERBS_DATA[0]);

  const filteredHerbs = HERBS_DATA.filter((h) =>
    h.sanskrit.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.botanical.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.doshakarma.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#fcfaf4] dark:bg-[#07160e] text-[#1a3827] dark:text-[#d1e2d7]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Hero Section Banner */}
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-[#0e301e] via-[#16432b] to-[#0a2316] text-[#f7f4ea] shadow-xl border border-emerald-800/40 relative overflow-hidden text-center">
          <div className="relative z-10 max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#c87d32]/20 border border-[#c87d32]/40 text-[#f6be73] text-xs font-semibold uppercase tracking-wider mb-2">
              <Sprout className="w-3.5 h-3.5" />
              Dravyaguna Herbology & AYUSH Research Showcase
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif-heading text-white tracking-tight">
              Medicinal Plants & Research Portal
            </h1>
            <p className="mt-3 text-emerald-200/90 text-xs sm:text-sm md:text-base leading-relaxed">
              Authentic botanical directory with Rasa-Panchaka pharmacology, verified clinical AYUSH research papers, and student formulation showcases.
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center justify-center gap-2 bg-white dark:bg-[#0c2419] p-2 rounded-2xl border border-[#e5edd9] dark:border-white/10 shadow-xs max-w-2xl mx-auto">
          {[
            { id: "herbs", label: "Herb Explorer", icon: Sprout },
            { id: "research", label: "Research Papers", icon: FlaskConical },
            { id: "projects", label: "Student Projects", icon: Award },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition ${
                  isActive
                    ? "bg-[#0e2f1f] text-white shadow-md"
                    : "text-[#5a7a67] dark:text-emerald-400 hover:text-[#0e2f1f] hover:bg-[#f6f3eb] dark:hover:bg-white/5"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: Herb Explorer */}
        {activeTab === "herbs" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#759381]" />
                <input
                  type="text"
                  placeholder="Search Sanskrit name or botanical..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-[#0c2419] border border-[#cadacb] dark:border-white/10 rounded-xl text-xs sm:text-sm text-[#143d26] dark:text-white placeholder-[#8ca697] focus:outline-none focus:border-[#0e2f1f] dark:focus:border-emerald-400 shadow-xs"
                />
              </div>

              <div className="space-y-3">
                {filteredHerbs.map((herb) => (
                  <div
                    key={herb.id}
                    onClick={() => setSelectedHerb(herb)}
                    className={`p-4 rounded-2xl border cursor-pointer transition ${
                      selectedHerb.id === herb.id
                        ? "bg-[#0e2f1f]/5 dark:bg-[#0e2f1f]/40 border-[#0e2f1f] dark:border-emerald-500 shadow-xs"
                        : "bg-white dark:bg-[#0c2419] border-[#e5edd9] dark:border-white/10 hover:border-[#cadacb]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-base font-bold text-[#143d26] dark:text-white font-serif-heading">{herb.sanskrit}</h4>
                      <span className="text-xs font-serif font-bold text-[#c87d32]">{herb.devanagari}</span>
                    </div>
                    <p className="text-xs text-[#5a7a67] dark:text-stone-400 italic mt-0.5">{herb.botanical}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] px-2 py-0.5 bg-[#f0f4ec] dark:bg-white/5 text-[#0e2f1f] dark:text-emerald-300 rounded-md border border-[#cadacb]/50">
                        {herb.virya}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 bg-[#fff8ed] dark:bg-amber-950/40 text-[#c87d32] dark:text-amber-300 rounded-md border border-[#c87d32]/30">
                        {herb.doshakarma}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Herb Details Full Card */}
            <div className="lg:col-span-2 bg-white dark:bg-[#0c2419] border border-[#e5edd9] dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-xs hover:shadow-md transition space-y-6">
              <div className="flex items-start justify-between flex-wrap gap-2">
                <div>
                  <span className="text-xs font-bold text-[#0e2f1f] dark:text-emerald-400 uppercase tracking-wider">{selectedHerb.family} Family</span>
                  <h2 className="text-3xl font-extrabold text-[#143d26] dark:text-white mt-1 font-serif-heading">{selectedHerb.sanskrit}</h2>
                  <p className="text-xl font-serif text-[#c87d32] font-bold mt-0.5">{selectedHerb.devanagari}</p>
                  <p className="text-sm font-mono text-[#5a7a67] dark:text-stone-400 italic mt-1">{selectedHerb.botanical}</p>
                </div>
                <span className="px-3 py-1 bg-[#0e2f1f]/10 dark:bg-emerald-950 border border-[#0e2f1f]/20 dark:border-emerald-800 text-[#0e2f1f] dark:text-emerald-300 text-xs font-bold rounded-full">
                  Pharmacopoeia Standard
                </span>
              </div>

              {/* Rasa-Panchaka Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 bg-[#f8f6f0] dark:bg-white/5 rounded-xl border border-[#e8e2d5] dark:border-white/10">
                  <span className="text-[10px] font-bold text-[#5a7a67] dark:text-stone-400 uppercase tracking-wider">Rasa (Taste)</span>
                  <p className="text-xs font-semibold text-[#143d26] dark:text-stone-200 mt-1">{selectedHerb.rasa.join(", ")}</p>
                </div>
                <div className="p-3.5 bg-[#f8f6f0] dark:bg-white/5 rounded-xl border border-[#e8e2d5] dark:border-white/10">
                  <span className="text-[10px] font-bold text-[#5a7a67] dark:text-stone-400 uppercase tracking-wider">Guna (Quality)</span>
                  <p className="text-xs font-semibold text-[#143d26] dark:text-stone-200 mt-1">{selectedHerb.guna.join(", ")}</p>
                </div>
                <div className="p-3.5 bg-[#f8f6f0] dark:bg-white/5 rounded-xl border border-[#e8e2d5] dark:border-white/10">
                  <span className="text-[10px] font-bold text-[#5a7a67] dark:text-stone-400 uppercase tracking-wider">Virya (Potency)</span>
                  <p className="text-xs font-semibold text-[#143d26] dark:text-stone-200 mt-1">{selectedHerb.virya}</p>
                </div>
                <div className="p-3.5 bg-[#f8f6f0] dark:bg-white/5 rounded-xl border border-[#e8e2d5] dark:border-white/10">
                  <span className="text-[10px] font-bold text-[#5a7a67] dark:text-stone-400 uppercase tracking-wider">Vipaka (Post-Digest)</span>
                  <p className="text-xs font-semibold text-[#143d26] dark:text-stone-200 mt-1">{selectedHerb.vipaka}</p>
                </div>
              </div>

              <div className="space-y-3 text-xs text-[#2c332e] dark:text-stone-300">
                <div className="p-4 bg-[#f8f6f0] dark:bg-white/5 rounded-xl border border-[#e8e2d5] dark:border-white/10">
                  <strong className="text-[#0e2f1f] dark:text-emerald-400 block mb-1 uppercase tracking-wider text-[11px]">Prabhava (Specific Action):</strong>
                  <p className="leading-relaxed">{selectedHerb.prabhava}</p>
                </div>
                <div className="p-4 bg-[#f8f6f0] dark:bg-white/5 rounded-xl border border-[#e8e2d5] dark:border-white/10">
                  <strong className="text-[#0e2f1f] dark:text-teal-400 block mb-1 uppercase tracking-wider text-[11px]">Doshakarma & Balances:</strong>
                  <p className="leading-relaxed">{selectedHerb.doshakarma}</p>
                </div>
                <div className="p-4 bg-[#f8f6f0] dark:bg-white/5 rounded-xl border border-[#e8e2d5] dark:border-white/10">
                  <strong className="text-[#c87d32] dark:text-amber-400 block mb-1 uppercase tracking-wider text-[11px]">Classical Clinical Indications (Rogaghnata):</strong>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedHerb.indications.map((ind, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-white dark:bg-white/10 text-[#143d26] dark:text-stone-200 rounded-md border border-[#cadacb]">
                        {ind}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Research Papers */}
        {activeTab === "research" && (
          <div className="max-w-4xl mx-auto space-y-6">
            {RESEARCH_PAPERS.map((p) => (
              <div
                key={p.id}
                className="bg-white dark:bg-[#0c2419] border border-[#e5edd9] dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-xs hover:shadow-md transition space-y-4"
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="px-3 py-1 bg-[#0e2f1f]/10 dark:bg-emerald-950 border border-[#0e2f1f]/20 dark:border-emerald-800 text-[#0e2f1f] dark:text-emerald-300 text-xs font-bold rounded-full">
                    {p.studyType}
                  </span>
                  <span className="text-xs text-[#5a7a67] dark:text-stone-400">{p.journal} • {p.year}</span>
                </div>

                <h3 className="text-base sm:text-xl font-bold text-[#143d26] dark:text-white leading-snug font-serif-heading">{p.title}</h3>
                <p className="text-xs text-[#0e2f1f] dark:text-emerald-400 font-semibold">Authors: {p.authors.join(", ")}</p>

                <div className="p-4 bg-[#f8f6f0] dark:bg-white/5 rounded-2xl border border-[#e8e2d5] dark:border-white/10 text-xs text-[#2c332e] dark:text-stone-300 leading-relaxed">
                  <strong className="text-[#5a7a67] dark:text-stone-400 block mb-1 uppercase tracking-wider text-[10px]">Abstract:</strong>
                  {p.abstract}
                </div>

                <div className="flex items-center justify-between pt-2 flex-wrap gap-2">
                  <span className="text-xs font-mono text-[#5a7a67] dark:text-stone-500">DOI: {p.doi}</span>
                  <button className="flex items-center gap-1.5 text-xs text-[#0e2f1f] dark:text-emerald-400 font-bold hover:underline">
                    <span>Read Full Paper</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: Student Projects */}
        {activeTab === "projects" && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white dark:bg-[#0c2419] border border-[#e5edd9] dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-xs hover:shadow-md transition space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="px-3 py-1 bg-[#c87d32]/10 dark:bg-amber-950/80 border border-[#c87d32]/30 dark:border-amber-800 text-[#c87d32] dark:text-amber-300 text-xs font-bold rounded-full">
                  Faculty Verified Project
                </span>
                <span className="text-xs text-[#5a7a67] dark:text-stone-400">Published: Sep 2026</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#143d26] dark:text-white font-serif-heading">
                Standardization & Formulation of Polyherbal Guggulu Extract for Metabolic Syndrome
              </h3>
              <p className="text-xs text-[#5a7a67] dark:text-stone-400">By BAMS Final Year Scholar • Verified by Faculty Mentor</p>
              <p className="text-xs sm:text-sm text-[#2c332e] dark:text-stone-300 leading-relaxed">
                Comparative analysis of Shodhana methods for Commiphora mukul using Triphala Kwatha vs. Gomutra, and their impact on guggulsterone E & Z content.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="text-[11px] px-2.5 py-1 bg-[#f0f4ec] dark:bg-white/5 border border-[#cadacb] text-[#143d26] dark:text-stone-300 rounded-md">
                  Bhaishajya Kalpana
                </span>
                <span className="text-[11px] px-2.5 py-1 bg-[#f0f4ec] dark:bg-white/5 border border-[#cadacb] text-[#143d26] dark:text-stone-300 rounded-md">
                  Phytochemical Assay
                </span>
                <span className="text-[11px] px-2.5 py-1 bg-[#f0f4ec] dark:bg-white/5 border border-[#cadacb] text-[#143d26] dark:text-stone-300 rounded-md">
                  Shodhana Protocol
                </span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
