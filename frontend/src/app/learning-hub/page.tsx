"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { 
  BookOpen, 
  Search, 
  Sparkles, 
  GraduationCap, 
  FileText, 
  CheckCircle2, 
  Award, 
  ExternalLink,
  Tag, 
  Bookmark, 
  Clock, 
  HelpCircle,
  Building2,
  Users,
  Filter
} from "lucide-react";
import { api } from "@/lib/api";

export default function LearningHubPage() {
  const [activeTab, setActiveTab] = useState<"shlokas" | "courses" | "scholarships" | "notes" | "faculty_materials">("shlokas");
  const [shlokaSearch, setShlokaSearch] = useState("");
  
  // Faculty Materials State
  const [facultyMaterials, setFacultyMaterials] = useState<any[]>([]);
  const [loadingFacultyMaterials, setLoadingFacultyMaterials] = useState(false);
  const [facultySearch, setFacultySearch] = useState("");
  const [facultySubjectFilter, setFacultySubjectFilter] = useState("ALL");

  useEffect(() => {
    async function loadFacultyMaterials() {
      try {
        setLoadingFacultyMaterials(true);
        const res = await api.get("/faculty/student-resources");
        if (Array.isArray(res.data) && res.data.length > 0) {
          setFacultyMaterials(res.data);
        } else {
          setFacultyMaterials([
            {
              id: "fm-1",
              title: "Comprehensive Marma Points & Clinical Significance Compendium",
              description: "Classical breakdown of 107 Marma points according to Acharya Sushruta with modern anatomical correlations.",
              subject_name: "Rachana Sharir (Anatomy)",
              academic_year: "1st Year",
              resource_type: "NOTES",
              unit_name: "Marma Sharir",
              topic_name: "Trimarma & Sadhyo Pranahara",
              faculty_name: "Prof. Ramchandra Shastri",
              institution_name: "National Institute of Ayurveda",
              workflow_status: "PUBLISHED",
              is_ai_generated: false,
              created_at: "2026-10-27"
            },
            {
              id: "fm-2",
              title: "Dravyaguna 50 Classical Herbs Identification Guide & Posology",
              description: "Field herbarium manual covering Rasa, Guna, Virya, Vipaka, and Karma of classical Dravyas.",
              subject_name: "Dravyaguna Vijnana",
              academic_year: "2nd Year",
              resource_type: "STUDY_MATERIAL",
              unit_name: "Dravya Varga",
              topic_name: "Haritakyadi Varga",
              faculty_name: "Dr. P. R. Joshi, Ph.D.",
              institution_name: "National Institute of Ayurveda",
              workflow_status: "PUBLISHED",
              is_ai_generated: false,
              created_at: "2026-10-25"
            }
          ]);
        }
      } catch (e) {
        console.warn("Could not load faculty materials:", e);
        setFacultyMaterials([
          {
            id: "fm-1",
            title: "Comprehensive Marma Points & Clinical Significance Compendium",
            description: "Classical breakdown of 107 Marma points according to Acharya Sushruta with modern anatomical correlations.",
            subject_name: "Rachana Sharir (Anatomy)",
            academic_year: "1st Year",
            resource_type: "NOTES",
            unit_name: "Marma Sharir",
            topic_name: "Trimarma & Sadhyo Pranahara",
            faculty_name: "Prof. Ramchandra Shastri",
            institution_name: "National Institute of Ayurveda",
            workflow_status: "PUBLISHED",
            is_ai_generated: false,
            created_at: "2026-10-27"
          },
          {
            id: "fm-2",
            title: "Dravyaguna 50 Classical Herbs Identification Guide & Posology",
            description: "Field herbarium manual covering Rasa, Guna, Virya, Vipaka, and Karma of classical Dravyas.",
            subject_name: "Dravyaguna Vijnana",
            academic_year: "2nd Year",
            resource_type: "STUDY_MATERIAL",
            unit_name: "Dravya Varga",
            topic_name: "Haritakyadi Varga",
            faculty_name: "Dr. P. R. Joshi, Ph.D.",
            institution_name: "National Institute of Ayurveda",
            workflow_status: "PUBLISHED",
            is_ai_generated: false,
            created_at: "2026-10-25"
          }
        ]);
      } finally {
        setLoadingFacultyMaterials(false);
      }
    }
    loadFacultyMaterials();
  }, []);

  const [notes, setNotes] = useState([
    {
      id: "note-1",
      title: "Shad-Vidha Pariksha Diagnostics",
      subject: "Roganidana",
      content: "Sparshana (palpation), Darshana (inspection), Prashna (interrogation), Shravana (auscultation), Ghrana (olfaction), Rasana (indirect assessment).",
      tags: ["Diagnosis", "Clinical"],
      date: "28 Sep 2026"
    }
  ]);
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteContent, setNewNoteContent] = useState("");
  const [newNoteSubject, setNewNoteSubject] = useState("Dravyaguna");

  const SHLOKAS = [
    {
      id: "s-1",
      treatise: "Charaka Samhita",
      sthana: "Sutrasthana",
      chapter: "Chapter 1 (Dirghanjivitiya Adhyaya)",
      verse: "Verse 41",
      sanskrit: "सर्वदा सर्वभावानां सामान्यं वृद्धि कारणम् ।\nह्रासहेतुर्विशेषश्च प्रवृत्तिरुभयस्य तु ॥",
      transliteration: "sarvadā sarvabhāvānāṃ sāmānyaṃ vṛddhikāraṇam |\nhrāsaheturviśeṣaśca pravṛttirubhayasya tu ||",
      meaning: "Similarity (Samanya) is always the cause of increase in all entities, whereas dissimilarity (Vishesha) is the cause of decrease. Both are principles in therapeutic action.",
      subject: "Maulik Siddhanta"
    },
    {
      id: "s-2",
      treatise: "Sushruta Samhita",
      sthana: "Sutrasthana",
      chapter: "Chapter 15 (Dosha-Dhatu-Mala Kshaya-Vriddhi)",
      verse: "Verse 41",
      sanskrit: "समदोषः समाग्निश्च समधातुमलक्रियः ।\nप्रसन्नात्मेन्द्रियमनाः स्वस्थ इत्यभिधीयते ॥",
      transliteration: "samadoṣaḥ samāgniśca samadhātumalakriyaḥ |\nprasannātmendriyamanaḥ svastha ityabhidhīyate ||",
      meaning: "One whose Doshas, digestive Agni, Dhatus, and excretory Malas are in equilibrium, and whose Soul, Senses, and Mind are serene, is defined as healthy (Swastha).",
      subject: "Swasthavritta"
    }
  ];

  const COURSES = [
    {
      id: "c-1",
      title: "Advanced Ayurvedic Pharmacovigilance & ASU QC Certification",
      instructor: "Dr. P. R. Joshi, Ph.D. (Dravyaguna)",
      category: "Pharmacology & QC",
      hours: 24,
      skills: ["HPTLC Fingerprinting", "AAS Heavy Metals QC", "GMP Compliance"],
      passingScore: "75%"
    },
    {
      id: "c-2",
      title: "Clinical Panchakarma Protocols & Emergency Case Management",
      instructor: "Vaidya Rajesh Sharma, MD (Ayu)",
      category: "Clinical Therapeutics",
      hours: 30,
      skills: ["Vamana Protocol", "Basti Formulations", "Complication Management"],
      passingScore: "80%"
    }
  ];

  const SCHOLARSHIPS = [
    {
      id: "sch-1",
      name: "CCRAS Ayush National Post-Graduate Research Fellowship",
      provider: "Central Council for Research in Ayurvedic Sciences (CCRAS)",
      type: "GOVERNMENT",
      amount: "₹35,000 / month + Contingency",
      deadline: "15 Dec 2026",
      criteria: "BAMS graduates with minimum 60% aggregate enrolled in MD/MS (Ayu)."
    },
    {
      id: "sch-2",
      name: "Dabur AYUSH Merit Scholarship for BAMS Scholars",
      provider: "Dabur Research Foundation CSR",
      type: "CORPORATE_CSR",
      amount: "₹50,000 one-time grant",
      deadline: "30 Nov 2026",
      criteria: "Top 5% students in 2nd and 3rd year BAMS annual university examinations."
    }
  ];

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle.trim()) return;
    const note = {
      id: `note-${Date.now()}`,
      title: newNoteTitle,
      subject: newNoteSubject,
      content: newNoteContent,
      tags: ["Study", newNoteSubject],
      date: "Just now"
    };
    setNotes([note, ...notes]);
    setNewNoteTitle("");
    setNewNoteContent("");
  };

  const filteredShlokas = SHLOKAS.filter(s => 
    s.sanskrit.includes(shlokaSearch) || 
    s.meaning.toLowerCase().includes(shlokaSearch.toLowerCase()) || 
    s.treatise.toLowerCase().includes(shlokaSearch.toLowerCase()) ||
    s.subject.toLowerCase().includes(shlokaSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#fcfaf4] dark:bg-[#07160e] text-[#1a3827] dark:text-[#d1e2d7]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Hero Section Banner */}
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-[#0e301e] via-[#16432b] to-[#0a2316] text-[#f7f4ea] shadow-xl border border-emerald-800/40 relative overflow-hidden text-center">
          <div className="relative z-10 max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#c87d32]/20 border border-[#c87d32]/40 text-[#f6be73] text-xs font-semibold uppercase tracking-wider mb-2">
              <BookOpen className="w-3.5 h-3.5" />
              AYUSH Academic Knowledge Repository
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif-heading text-white tracking-tight">
              Ayurveda Knowledge Library & Learning Hub
            </h1>
            <p className="mt-3 text-emerald-200/90 text-xs sm:text-sm md:text-base leading-relaxed">
              Classical Shlokas with Devanagari Sanskrit & IAST transliteration, Modular Certificate Courses with SHA-256 Hashes, Personal Notes, and AYUSH Scholarship Directory.
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-center gap-2 bg-white dark:bg-[#0c2419] p-2 rounded-2xl border border-[#e5edd9] dark:border-white/10 shadow-xs max-w-3xl mx-auto flex-wrap">
          {[
            { id: "shlokas", label: "Classical Shlokas", icon: BookOpen },
            { id: "faculty_materials", label: "Faculty Materials", icon: GraduationCap },
            { id: "courses", label: "Certificate Courses", icon: Award },
            { id: "scholarships", label: "Scholarships", icon: Award },
            { id: "notes", label: "Study Notes", icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
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

        {/* TAB 1: Shlokas */}
        {activeTab === "shlokas" && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#759381]" />
              <input
                type="text"
                placeholder="Search Shlokas by Devanagari, English meaning, treatise (Charaka, Sushruta), or subject..."
                value={shlokaSearch}
                onChange={(e) => setShlokaSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white dark:bg-[#0c2419] border border-[#cadacb] dark:border-white/10 rounded-2xl text-xs sm:text-sm text-[#143d26] dark:text-white placeholder-[#8ca697] focus:outline-none focus:border-[#0e2f1f] dark:focus:border-emerald-400 shadow-xs"
              />
            </div>

            <div className="space-y-6">
              {filteredShlokas.map((s) => (
                <div
                  key={s.id}
                  className="bg-white dark:bg-[#0c2419] border border-[#e5edd9] dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-xs hover:shadow-md transition relative overflow-hidden"
                >
                  <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                    <span className="px-3 py-1 bg-[#0e2f1f]/10 dark:bg-emerald-950/80 border border-[#0e2f1f]/20 dark:border-emerald-800 text-[#0e2f1f] dark:text-emerald-300 text-xs font-bold rounded-full">
                      {s.treatise} • {s.sthana}
                    </span>
                    <span className="text-xs font-semibold text-[#c87d32] dark:text-amber-400 bg-[#c87d32]/10 dark:bg-stone-800/80 px-2.5 py-1 rounded-lg border border-[#c87d32]/30">
                      {s.chapter} • {s.verse}
                    </span>
                  </div>

                  <div className="bg-[#f8f6f0] dark:bg-black/30 p-6 rounded-2xl border border-[#e8e2d5] dark:border-white/10 mb-4 text-center">
                    <p className="text-base sm:text-xl font-serif font-bold text-[#b56f2b] dark:text-amber-200 leading-loose whitespace-pre-line">
                      {s.sanskrit}
                    </p>
                    <p className="text-xs font-mono text-[#5c6b61] dark:text-stone-400 mt-3 italic">
                      {s.transliteration}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#0e2f1f] dark:text-emerald-400 mb-1">
                      English Meaning & Clinical Rationale:
                    </h4>
                    <p className="text-xs sm:text-sm text-[#2c332e] dark:text-[#d1e2d7] leading-relaxed">
                      {s.meaning}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: Courses */}
        {activeTab === "courses" && (
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
            {COURSES.map((c) => (
              <div
                key={c.id}
                className="bg-white dark:bg-[#0c2419] border border-[#e5edd9] dark:border-white/10 rounded-3xl p-6 shadow-xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <span className="px-3 py-1 bg-[#0e2f1f]/10 dark:bg-emerald-950/80 border border-[#0e2f1f]/20 dark:border-emerald-800 text-[#0e2f1f] dark:text-emerald-300 text-xs font-bold rounded-full">
                    {c.category}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-[#143d26] dark:text-white mt-3 font-serif-heading">
                    {c.title}
                  </h3>
                  <p className="text-xs text-[#5a7a67] dark:text-stone-400 mt-1">Instructor: {c.instructor}</p>

                  <div className="mt-4 flex items-center gap-4 text-xs text-[#2c332e] dark:text-stone-300">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#0e2f1f] dark:text-emerald-400" />
                      <span className="font-medium">{c.hours} Hours</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-[#c87d32] dark:text-amber-400" />
                      <span className="font-medium">Pass: {c.passingScore}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#e5edd9] dark:border-white/10">
                    <span className="text-[11px] font-bold text-[#5a7a67] dark:text-stone-400 uppercase tracking-wider">
                      Skills Taught:
                    </span>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {c.skills.map((sk, idx) => (
                        <span key={idx} className="text-[11px] px-2 py-0.5 bg-[#f0f4ec] dark:bg-white/5 border border-[#cadacb]/60 dark:border-white/10 text-[#143d26] dark:text-emerald-300 rounded-md">
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[#e5edd9] dark:border-white/10">
                  <button className="w-full py-2.5 bg-[#0e2f1f] hover:bg-[#16432b] text-white text-xs font-bold rounded-xl transition shadow-md">
                    Enroll & Start Modules
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: Scholarships */}
        {activeTab === "scholarships" && (
          <div className="max-w-4xl mx-auto space-y-6">
            {SCHOLARSHIPS.map((sch) => (
              <div
                key={sch.id}
                className="bg-white dark:bg-[#0c2419] border border-[#e5edd9] dark:border-white/10 rounded-3xl p-6 shadow-xs hover:shadow-md transition flex flex-col sm:flex-row sm:items-center justify-between gap-6"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-[#c87d32]/10 dark:bg-amber-950/80 border border-[#c87d32]/30 dark:border-amber-800 text-[#c87d32] dark:text-amber-300 text-xs font-bold rounded-full">
                      {sch.type}
                    </span>
                    <span className="text-xs text-[#5a7a67] dark:text-stone-400">Deadline: {sch.deadline}</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-[#143d26] dark:text-white font-serif-heading">
                    {sch.name}
                  </h3>
                  <p className="text-xs text-[#0e2f1f] dark:text-emerald-400 font-semibold">{sch.provider}</p>
                  <p className="text-xs text-[#2c332e] dark:text-stone-300">{sch.criteria}</p>
                  <p className="text-xs font-bold text-[#c87d32] dark:text-amber-300">Grant / Benefit: {sch.amount}</p>
                </div>

                <button className="px-5 py-2.5 bg-[#0e2f1f] hover:bg-[#16432b] text-white text-xs font-bold rounded-xl transition shrink-0 shadow-md flex items-center gap-2 justify-center">
                  <span>Apply Now</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* TAB 4: Study Notes */}
        {activeTab === "notes" && (
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-[#0c2419] border border-[#e5edd9] dark:border-white/10 rounded-3xl p-6 shadow-xs">
              <h3 className="text-base font-bold text-[#0e2f1f] dark:text-emerald-300 mb-4 font-serif-heading">
                Create Study Note
              </h3>
              <form onSubmit={handleAddNote} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-[#2c332e] dark:text-stone-300 mb-1">Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rasa-Panchaka Principles"
                    value={newNoteTitle}
                    onChange={(e) => setNewNoteTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-[#f8faf6] dark:bg-white/5 border border-[#cadacb] dark:border-white/10 rounded-xl text-xs text-[#143d26] dark:text-white focus:outline-none focus:border-[#0e2f1f]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#2c332e] dark:text-stone-300 mb-1">Subject</label>
                  <select
                    value={newNoteSubject}
                    onChange={(e) => setNewNoteSubject(e.target.value)}
                    className="w-full px-3 py-2 bg-[#f8faf6] dark:bg-white/5 border border-[#cadacb] dark:border-white/10 rounded-xl text-xs text-[#143d26] dark:text-white focus:outline-none focus:border-[#0e2f1f]"
                  >
                    <option value="Dravyaguna">Dravyaguna (Herbal Pharmacology)</option>
                    <option value="Panchakarma">Panchakarma</option>
                    <option value="Roganidana">Roganidana (Pathology)</option>
                    <option value="Maulik Siddhanta">Maulik Siddhanta</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#2c332e] dark:text-stone-300 mb-1">
                    Key Insights & Shloka Notes
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Summarize high-yield points..."
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    className="w-full px-3 py-2 bg-[#f8faf6] dark:bg-white/5 border border-[#cadacb] dark:border-white/10 rounded-xl text-xs text-[#143d26] dark:text-white focus:outline-none focus:border-[#0e2f1f]"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-[#0e2f1f] hover:bg-[#16432b] text-white font-bold text-xs rounded-xl transition shadow-md"
                >
                  Save Study Note
                </button>
              </form>
            </div>

            <div className="md:col-span-2 space-y-4">
              <h3 className="text-base font-bold text-[#143d26] dark:text-stone-200 font-serif-heading">
                Your Saved Study Notes ({notes.length})
              </h3>
              {notes.map((n) => (
                <div key={n.id} className="p-5 bg-white dark:bg-[#0c2419] border border-[#e5edd9] dark:border-white/10 rounded-2xl shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#0e2f1f] dark:text-emerald-400">{n.subject}</span>
                    <span className="text-[11px] text-[#5a7a67] dark:text-stone-500">{n.date}</span>
                  </div>
                  <h4 className="text-sm font-bold text-[#143d26] dark:text-white">{n.title}</h4>
                  <p className="text-xs text-[#2c332e] dark:text-stone-300 leading-relaxed">{n.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: Faculty Materials & Institutional Resources */}
        {activeTab === "faculty_materials" && (
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Filter and Search */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#0c2419] border border-[#e5edd9] dark:border-white/10 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#759381]" />
                <input
                  type="text"
                  placeholder="Search faculty notes, units, topics..."
                  value={facultySearch}
                  onChange={(e) => setFacultySearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-[#f8faf6] dark:bg-white/5 border border-[#cadacb] dark:border-white/10 text-[#143d26] dark:text-white focus:outline-none focus:border-[#0e2f1f]"
                />
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                <Filter className="w-4 h-4 text-[#759381]" />
                <select
                  value={facultySubjectFilter}
                  onChange={(e) => setFacultySubjectFilter(e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl bg-[#f8faf6] dark:bg-white/5 border border-[#cadacb] dark:border-white/10 text-[#143d26] dark:text-white focus:outline-none focus:border-[#0e2f1f]"
                >
                  <option value="ALL">All Subjects</option>
                  <option value="Rachana Sharir">Rachana Sharir</option>
                  <option value="Dravyaguna">Dravyaguna</option>
                  <option value="Kriya Sharir">Kriya Sharir</option>
                  <option value="Panchakarma">Panchakarma</option>
                  <option value="Roganidana">Roganidana</option>
                </select>
              </div>
            </div>

            {loadingFacultyMaterials ? (
              <div className="p-12 text-center text-xs text-slate-500 animate-pulse">
                Loading approved faculty resources...
              </div>
            ) : facultyMaterials.length === 0 ? (
              <div className="p-12 text-center bg-white dark:bg-[#0c2419] border border-[#e5edd9] dark:border-white/10 rounded-3xl">
                <BookOpen className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                <p className="text-xs text-slate-500 font-medium">No institutional materials published for your cohort yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {facultyMaterials
                  .filter((m) => {
                    const matchesSearch =
                      m.title.toLowerCase().includes(facultySearch.toLowerCase()) ||
                      m.subject_name.toLowerCase().includes(facultySearch.toLowerCase());
                    const matchesSub =
                      facultySubjectFilter === "ALL" || m.subject_name.toLowerCase().includes(facultySubjectFilter.toLowerCase());
                    return matchesSearch && matchesSub;
                  })
                  .map((mat) => (
                    <div
                      key={mat.id}
                      className="p-5 bg-white dark:bg-[#0c2419] border border-[#e5edd9] dark:border-white/10 rounded-2xl shadow-xs hover:shadow-md transition space-y-3 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                            {mat.academic_year || "BAMS"}
                          </span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-stone-800 text-slate-600 dark:text-stone-300">
                            {mat.resource_type?.replace("_", " ") || "NOTES"}
                          </span>
                        </div>

                        <div>
                          <h4 className="text-sm font-bold text-[#143d26] dark:text-white leading-snug">{mat.title}</h4>
                          <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium mt-0.5">{mat.subject_name}</p>
                          {mat.description && (
                            <p className="text-xs text-[#5a7a67] dark:text-stone-300 mt-1 line-clamp-2 leading-relaxed">
                              {mat.description}
                            </p>
                          )}
                        </div>

                        <div className="p-2.5 rounded-xl bg-[#f8faf6] dark:bg-black/20 border border-[#e5edd9] dark:border-white/5 text-[11px] text-[#5a7a67] dark:text-stone-400 space-y-0.5">
                          {mat.unit_name && <div><strong>Unit:</strong> {mat.unit_name}</div>}
                          {mat.topic_name && <div><strong>Topic:</strong> {mat.topic_name}</div>}
                          {mat.faculty_name && (
                            <div className="text-emerald-700 dark:text-emerald-400 font-semibold pt-1">
                              Instructor: {mat.faculty_name}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-[#e5edd9] dark:border-white/10 flex items-center justify-between text-xs">
                        <span className="text-[11px] text-slate-400">{mat.created_at?.slice(0, 10)}</span>
                        {mat.file_url ? (
                          <a
                            href={mat.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-xl bg-[#0e2f1f] hover:bg-[#16432b] text-white font-semibold text-xs inline-flex items-center gap-1.5 transition shadow-sm"
                          >
                            <span>Access Material</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg">
                            Institutional Curriculum
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
