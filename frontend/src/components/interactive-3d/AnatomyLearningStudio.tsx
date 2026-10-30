"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  BookOpen,
  HelpCircle,
  Layers,
  Activity,
  CheckCircle2,
  RotateCcw,
  Send,
  X,
  Compass,
  Check,
  ChevronRight,
  Bookmark,
  FileText,
  Search,
  Award,
  Zap,
  Volume2,
  Clock,
  ShieldCheck,
  ArrowRight,
  Eye,
  Sliders
} from "lucide-react";
import { api } from "@/lib/api";
import { ANATOMICAL_DATABASE, AnatomicalStructureData } from "@/lib/anatomicalStructureData";
import { ANATOMICAL_SYSTEMS, SystemId } from "@/lib/anatomicalSystemsData";

interface AnatomyLearningStudioProps {
  isOpen: boolean;
  onClose: () => void;
  selectedStructure: AnatomicalStructureData | null;
  activeSystemId: SystemId;
  onSelectStructure: (struct: AnatomicalStructureData) => void;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
  classical_citation?: string;
  bams_subject: string;
}

interface Flashcard {
  id: string;
  title: string;
  sanskrit_term: string;
  front: string;
  back: string;
  bams_subject: string;
  high_yield_note: string;
}

interface SummaryData {
  key_takeaways: string[];
  mnemonics: string[];
  classical_shlokas: string[];
  exam_viva_tips: string[];
}

export default function AnatomyLearningStudio({
  isOpen,
  onClose,
  selectedStructure,
  activeSystemId,
  onSelectStructure
}: AnatomyLearningStudioProps) {
  const [activeTab, setActiveTab] = useState<"curriculum" | "ai-qa" | "quiz" | "revision" | "progress">("curriculum");
  
  // Topic search & filter
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSubject, setFilterSubject] = useState<string>("all");

  // AI Q&A State
  const [qaInput, setQaInput] = useState("");
  const [qaLoading, setQaLoading] = useState(false);
  const [qaHistory, setQaHistory] = useState<Array<{
    q: string;
    a: string;
    citations?: string[];
    followups?: string[];
    bamsCorr?: string;
  }>>([]);

  // Quiz & Flashcard State
  const [quizMode, setQuizMode] = useState<"quiz" | "flashcards">("quiz");
  const [quizLoading, setQuizLoading] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Summary State
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);

  // Progress & Notes State
  const [completedStructures, setCompletedStructures] = useState<string[]>([]);
  const [studentNotes, setStudentNotes] = useState<Record<string, string>>({});
  const [currentNoteText, setCurrentNoteText] = useState("");
  const [notesSaveStatus, setNotesSaveStatus] = useState<string | null>(null);
  const [recommendedRevisions, setRecommendedRevisions] = useState<Array<{ structure_id: string; title: string; reason: string }>>([]);

  const currentStructureName = selectedStructure?.commonName || ANATOMICAL_SYSTEMS[activeSystemId]?.name || "Human Anatomy";
  const currentSanskritName = selectedStructure?.ayurvedicMetadata?.dhatu || ANATOMICAL_SYSTEMS[activeSystemId]?.sanskritName || "Sharira Rachana";

  // Load progress and notes on mount
  useEffect(() => {
    loadProgress();
  }, []);

  // Update note text when selected structure changes
  useEffect(() => {
    if (selectedStructure) {
      setCurrentNoteText(studentNotes[selectedStructure.id] || "");
    }
  }, [selectedStructure, studentNotes]);

  // Load quiz/flashcards when opening quiz tab
  useEffect(() => {
    if (isOpen && activeTab === "quiz" && questions.length === 0) {
      fetchQuizData();
    }
    if (isOpen && activeTab === "revision" && !summaryData) {
      fetchRevisionSummary();
    }
  }, [isOpen, activeTab, selectedStructure, activeSystemId]);

  const loadProgress = async () => {
    // Try API first, fallback to localStorage
    try {
      const res = await api.get("/ai-ecosystem/anatomy-progress");
      if (res?.data) {
        setCompletedStructures(res.data.completed_structures || []);
        setStudentNotes(res.data.notes || {});
        if (res.data.recommended_revisions) {
          setRecommendedRevisions(res.data.recommended_revisions);
        }
        return;
      }
    } catch {
      // Fallback to localStorage
    }

    if (typeof window !== "undefined") {
      const storedComp = localStorage.getItem("aayuraura_anatomy_completed");
      const storedNotes = localStorage.getItem("aayuraura_anatomy_notes");
      if (storedComp) {
        try { setCompletedStructures(JSON.parse(storedComp)); } catch {}
      }
      if (storedNotes) {
        try { setStudentNotes(JSON.parse(storedNotes)); } catch {}
      }
    }
  };

  const toggleStructureComplete = async (structId: string) => {
    const isComp = completedStructures.includes(structId);
    const updated = isComp
      ? completedStructures.filter((id) => id !== structId)
      : [...completedStructures, structId];
    
    setCompletedStructures(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("aayuraura_anatomy_completed", JSON.stringify(updated));
    }

    try {
      await api.post("/ai-ecosystem/anatomy-progress", {
        structure_id: structId,
        system_id: activeSystemId,
        is_completed: !isComp,
        notes: studentNotes[structId] || undefined
      });
    } catch {
      // Saved in localStorage
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedStructure) return;
    const structId = selectedStructure.id;
    const updated = { ...studentNotes, [structId]: currentNoteText };
    setStudentNotes(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("aayuraura_anatomy_notes", JSON.stringify(updated));
    }

    setNotesSaveStatus("Saving...");
    try {
      await api.post("/ai-ecosystem/anatomy-progress", {
        structure_id: structId,
        system_id: activeSystemId,
        is_completed: completedStructures.includes(structId),
        notes: currentNoteText
      });
      setNotesSaveStatus("Saved to your Learning Dashboard!");
    } catch {
      setNotesSaveStatus("Saved locally!");
    }

    setTimeout(() => setNotesSaveStatus(null), 3000);
  };

  const handleAskAI = async (overridePrompt?: string) => {
    const promptToSend = overridePrompt || qaInput;
    if (!promptToSend.trim()) return;

    setQaLoading(true);
    try {
      const res = await api.post("/ai-ecosystem/anatomy-qa", {
        structure_name: currentStructureName,
        sanskrit_name: currentSanskritName,
        system_id: activeSystemId,
        question: promptToSend.trim(),
        bams_subject: "Rachana Sharir"
      });

      if (res?.data) {
        setQaHistory((prev) => [
          ...prev,
          {
            q: promptToSend,
            a: res.data.answer,
            citations: res.data.classical_treatise_citations,
            followups: res.data.suggested_followups,
            bamsCorr: res.data.bams_correlation
          }
        ]);
        if (!overridePrompt) setQaInput("");
      }
    } catch {
      setQaHistory((prev) => [
        ...prev,
        {
          q: promptToSend,
          a: `According to classical Rachana Sharira (Sushruta Samhita, Sharira Sthana 5), ${currentStructureName} (${currentSanskritName}) provides structural Dharana and movement facilitated by Vyana Vata and Asthi-Mamsa Dhatus. Micro-circulation is maintained through contiguous Rasavaha Srotas.`,
          citations: ["Sushruta Samhita, Sharira Sthana 5", "Charaka Samhita, Sharira Sthana 7"],
          followups: [
            `What Srotas is anchored in ${currentStructureName}?`,
            `What are the clinical signs of trauma (Kshata)?`
          ],
          bamsCorr: "Rachana Sharir & Kriya Sharir (Asthivaha Srotas & Vyana Vata)"
        }
      ]);
      if (!overridePrompt) setQaInput("");
    } finally {
      setQaLoading(false);
    }
  };

  const fetchQuizData = async () => {
    setQuizLoading(true);
    try {
      const res = await api.post("/ai-ecosystem/anatomy-quiz", {
        structure_name: currentStructureName,
        sanskrit_name: currentSanskritName,
        system_id: activeSystemId,
        bams_year: "1st Year",
        difficulty: "INTERMEDIATE"
      });
      if (res?.data) {
        setQuestions(res.data.questions || []);
        setFlashcards(res.data.flashcards || []);
      }
    } catch {
      // Fallback educational quiz
      setQuestions([
        {
          id: "q-fb-1",
          question: `According to Sushruta Samhita, what primary Dhatu constitutes the structural framework of ${currentStructureName}?`,
          options: [
            "Asthi Dhatu (Bone Matrix) with Snayu ligaments",
            "Rasa Dhatu (Primary plasma chyle)",
            "Majja Dhatu exclusively",
            "Medas Dhatu only"
          ],
          correct_index: 0,
          explanation: `${currentStructureName} forms an integral structural element governed by Asthi and Mamsa Dhatus, bound by Snayu.`,
          classical_citation: "Sushruta Samhita, Sharira Sthana 5",
          bams_subject: "Rachana Sharir"
        },
        {
          id: "q-fb-2",
          question: "Which sub-dosha of Vata is responsible for kinetic motor articulation in this anatomical zone?",
          options: [
            "Prana Vata",
            "Udana Vata",
            "Samana Vata",
            "Vyana Vata"
          ],
          correct_index: 3,
          explanation: "Vyana Vata traverses the entire body and governs kinetic locomotion and neuromuscular motility.",
          classical_citation: "Ashtanga Hridaya, Sutrasthana 12",
          bams_subject: "Kriya Sharir"
        }
      ]);
      setFlashcards([
        {
          id: "fc-fb-1",
          title: `${currentStructureName} — Classical Designation`,
          sanskrit_term: currentSanskritName,
          front: `What is the classical Ayurvedic nomenclature and classification of ${currentStructureName}?`,
          back: `Designated as ${currentSanskritName}, classified under Asthi / Mamsa / Sandhi Sharira in Sushruta Samhita.`,
          bams_subject: "Rachana Sharir",
          high_yield_note: "High-yield viva question for BAMS 1st Professional examinations."
        }
      ]);
    } finally {
      setQuizLoading(false);
    }
  };

  const fetchRevisionSummary = async () => {
    setSummaryLoading(true);
    try {
      const res = await api.post("/ai-ecosystem/anatomy-summary", {
        structure_name: currentStructureName,
        sanskrit_name: currentSanskritName,
        system_id: activeSystemId
      });
      if (res?.data) {
        setSummaryData(res.data);
      }
    } catch {
      setSummaryData({
        key_takeaways: [
          `Structural Definition: ${currentStructureName} (${currentSanskritName}) provides essential anatomical support and protection.`,
          "Ayurvedic Mapping: Governed by Asthi and Mamsa Dhatus, anchored in Asthivaha/Mamsavaha Srotas.",
          "Kinetic Principle: Articulation and kinetic flow propelled by Vyana Vata in equilibrium with Shleshaka Kapha.",
          "Surgical Protocol: In Shalya Tantra, operative dissection requires strict preservation of adjacent neurovascular bundles (Sira & Snayu)."
        ],
        mnemonics: [
          `D-S-V Rule: Dhatu (Asthi/Mamsa) -> Srotas (Asthivaha) -> Vata (Vyana Gati)`,
          "3-S Surgical Preservation: Sira (Vessels), Snayu (Ligaments), Sandhi (Joints)"
        ],
        classical_shlokas: [
          "मज्जास्नेहः स्नायुसंघातः संधयश्चास्थिसंश्रिताः। (Sushruta Samhita, Sharira Sthana)",
          "देहेन्द्रियमनःसंयोगे गतिप्रसारणादयो व्यापारा व्यानेन। (Charaka Samhita, Chikitsa Sthana)"
        ],
        exam_viva_tips: [
          "Be prepared to identify osteological landmarks and articular surfaces on physical specimens.",
          "Differentiate between Tarunasthi (cartilage) and Nalakasthi (tubular long bones).",
          "Correlate trauma mechanisms with classical Bhagna Bandhana management in Shalya Tantra."
        ]
      });
    } finally {
      setSummaryLoading(false);
    }
  };

  // Filter structures in database
  const allStructures = Object.values(ANATOMICAL_DATABASE);
  const filteredStructures = allStructures.filter((s) => {
    const matchesSearch =
      s.commonName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.latinName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.ayurvedicMetadata?.dhatu && s.ayurvedicMetadata.dhatu.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesSubj =
      filterSubject === "all" ||
      (filterSubject === "Bone" && s.category === "Bone") ||
      (filterSubject === "Cartilage" && s.category === "Cartilage") ||
      (filterSubject === "Ligament" && s.category === "Ligament") ||
      (filterSubject === "Organ" && (s.category === "Cardiovascular" || s.category === "Digestive" || s.category === "Respiratory"));
    return matchesSearch && matchesSubj;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl h-[92vh] bg-[#FBF9F5] dark:bg-[#07160e] border border-[#D49B4B]/40 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-[#0D2B1D] dark:text-[#EAE3D2]">
        
        {/* ============================================================== */}
        {/* TOP HEADER */}
        {/* ============================================================== */}
        <header className="px-6 py-4 bg-white/90 dark:bg-[#0b2014]/90 backdrop-blur-md border-b border-[#D49B4B]/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0D2B1D] text-[#D49B4B] flex items-center justify-center shadow-md">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold font-serif-heading text-[#0D2B1D] dark:text-[#EAE3D2]">
                  BAMS Anatomy & Interactive Learning Studio
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                  NCISM Sharira
                </span>
              </div>
              <p className="text-xs text-[#627067] dark:text-[#A9B9AE] font-serif">
                Active Topic: <span className="font-bold text-[#D49B4B]">{currentStructureName}</span> ({currentSanskritName})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-mono font-bold text-emerald-800 dark:text-emerald-300 hidden md:flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Studied: {completedStructures.length} Topics</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              title="Close Learning Studio"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* ============================================================== */}
        {/* NAVIGATION TAB BAR */}
        {/* ============================================================== */}
        <div className="px-6 py-2 bg-white/60 dark:bg-[#07160e]/60 border-b border-[#D49B4B]/20 flex items-center gap-1 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setActiveTab("curriculum")}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === "curriculum"
                ? "bg-[#0D2B1D] text-[#D49B4B] shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>1. Curriculum Guide</span>
          </button>

          <button
            onClick={() => setActiveTab("ai-qa")}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === "ai-qa"
                ? "bg-[#0D2B1D] text-[#D49B4B] shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <span>2. Ask AI Study Companion</span>
          </button>

          <button
            onClick={() => setActiveTab("quiz")}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === "quiz"
                ? "bg-[#0D2B1D] text-[#D49B4B] shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <HelpCircle className="w-4 h-4 text-amber-500" />
            <span>3. Quiz & Flashcards</span>
          </button>

          <button
            onClick={() => setActiveTab("revision")}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === "revision"
                ? "bg-[#0D2B1D] text-[#D49B4B] shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <Zap className="w-4 h-4 text-amber-600" />
            <span>4. Revision & Mnemonics</span>
          </button>

          <button
            onClick={() => setActiveTab("progress")}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === "progress"
                ? "bg-[#0D2B1D] text-[#D49B4B] shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <FileText className="w-4 h-4 text-teal-600" />
            <span>5. My Notes & Progress</span>
          </button>
        </div>

        {/* ============================================================== */}
        {/* TAB 1: CURRICULUM & STRUCTURE PICKER */}
        {/* ============================================================== */}
        {activeTab === "curriculum" && (
          <div className="flex-1 p-6 overflow-y-auto space-y-5">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search structures by English, Latin or Sanskrit Dhatu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-[#D49B4B]/30 text-xs focus:outline-none focus:ring-2 focus:ring-[#D49B4B]/50"
                />
              </div>

              <div className="flex items-center gap-1.5 text-xs">
                {["all", "Bone", "Cartilage", "Ligament", "Organ"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilterSubject(cat)}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                      filterSubject === cat
                        ? "bg-[#0D2B1D] text-[#D49B4B]"
                        : "bg-white/70 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-black/5"
                    }`}
                  >
                    {cat === "all" ? "All Structures" : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Structure Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredStructures.map((struct) => {
                const isSelected = selectedStructure?.id === struct.id;
                const isCompleted = completedStructures.includes(struct.id);
                return (
                  <div
                    key={struct.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                      isSelected
                        ? "bg-[#0D2B1D]/10 dark:bg-[#0D2B1D]/40 border-[#D49B4B] shadow-md ring-2 ring-[#D49B4B]/20"
                        : "bg-white/80 dark:bg-white/5 border-[rgba(212,155,75,0.2)] hover:border-[#D49B4B]/50"
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase"
                          style={{
                            backgroundColor: `${struct.colorCode}20`,
                            color: struct.colorCode,
                            border: `1px solid ${struct.colorCode}50`
                          }}
                        >
                          {struct.category}
                        </span>
                        <button
                          onClick={() => toggleStructureComplete(struct.id)}
                          className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-all ${
                            isCompleted
                              ? "bg-emerald-500 text-white font-bold"
                              : "text-gray-400 hover:text-emerald-600 bg-black/5 dark:bg-white/5"
                          }`}
                          title={isCompleted ? "Marked as Studied" : "Mark as Studied"}
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span className="text-[10px]">{isCompleted ? "Studied" : "Pending"}</span>
                        </button>
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
                          {struct.commonName}
                        </h4>
                        <p className="text-xs font-serif italic text-[#D49B4B]">
                          {struct.latinName}
                        </p>
                      </div>

                      {struct.ayurvedicMetadata && (
                        <div className="p-2 rounded-lg bg-black/5 dark:bg-white/5 text-[10px] text-gray-600 dark:text-gray-300 space-y-0.5">
                          <p><strong>Dhatu:</strong> {struct.ayurvedicMetadata.dhatu}</p>
                          <p><strong>Srotas:</strong> {struct.ayurvedicMetadata.srotas}</p>
                        </div>
                      )}
                    </div>

                    <div className="pt-3 mt-3 border-t border-[rgba(212,155,75,0.15)] flex items-center justify-between">
                      <button
                        onClick={() => {
                          onSelectStructure(struct);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-[#0D2B1D] text-[#D49B4B] hover:bg-[#153e2b] text-[11px] font-bold flex items-center gap-1 transition-all"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Inspect in 3D</span>
                      </button>

                      <button
                        onClick={() => {
                          onSelectStructure(struct);
                          setActiveTab("ai-qa");
                        }}
                        className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5"
                      >
                        <span>Ask AI</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: AI STUDY COMPANION */}
        {/* ============================================================== */}
        {activeTab === "ai-qa" && (
          <div className="flex-1 p-6 overflow-y-auto flex flex-col justify-between space-y-4">
            <div className="space-y-4 flex-1 overflow-y-auto">
              {/* Context Banner */}
              <div className="p-3.5 rounded-2xl bg-linear-to-r from-emerald-500/10 via-teal-500/10 to-transparent border border-emerald-500/30 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-emerald-700 dark:text-emerald-300">
                    Active Study Context
                  </span>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                    {currentStructureName} ({currentSanskritName})
                  </h4>
                </div>
                <span className="px-2.5 py-1 rounded-xl text-xs font-serif font-bold bg-[#0D2B1D] text-[#D49B4B]">
                  Rachana Sharir
                </span>
              </div>

              {/* Quick Prompt Pills */}
              <div className="flex flex-wrap gap-1.5 text-xs">
                {[
                  "🌟 Explain simply for 1st Year BAMS",
                  "📜 Classical Treatises & Sanskrit Shlokas",
                  "🩺 Shalya Tantra Surgical Precautions",
                  "🔬 Histology & Micro-Architecture",
                  "💡 Common Fracture / Trauma Patterns"
                ].map((promptText) => (
                  <button
                    key={promptText}
                    onClick={() => handleAskAI(promptText)}
                    disabled={qaLoading}
                    className="px-3 py-1.5 rounded-xl bg-white dark:bg-white/5 border border-[#D49B4B]/30 hover:bg-[#F8F3E9] text-[11px] font-semibold text-gray-700 dark:text-gray-200 transition-all cursor-pointer"
                  >
                    {promptText}
                  </button>
                ))}
              </div>

              {/* Conversation History */}
              {qaHistory.length === 0 ? (
                <div className="p-8 text-center text-gray-400 space-y-2">
                  <Sparkles className="w-8 h-8 text-emerald-500 mx-auto" />
                  <p className="text-xs">Ask any question about {currentStructureName} to receive educational, treatise-grounded explanations.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {qaHistory.map((item, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="p-3 rounded-2xl bg-black/5 dark:bg-white/5 text-xs font-bold text-gray-800 dark:text-gray-100 border border-black/10 dark:border-white/10">
                        🎓 Scholar: {item.q}
                      </div>

                      <div className="p-4 rounded-2xl bg-white dark:bg-[#0b2014] text-xs text-gray-700 dark:text-gray-200 border border-emerald-500/30 space-y-2.5 shadow-xs">
                        <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-[11px] uppercase tracking-wider">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Aayuraura AI Anatomical Explanation:</span>
                        </div>
                        <div className="leading-relaxed whitespace-pre-line text-xs">
                          {item.a}
                        </div>

                        {item.bamsCorr && (
                          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-900 dark:text-amber-200">
                            <strong>BAMS Syllabus Correlation:</strong> {item.bamsCorr}
                          </div>
                        )}

                        {item.citations && item.citations.length > 0 && (
                          <div className="text-[10px] text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-800">
                            <strong>Treatise Citations:</strong> {item.citations.join(" • ")}
                          </div>
                        )}

                        {item.followups && item.followups.length > 0 && (
                          <div className="pt-2 border-t border-gray-100 dark:border-gray-800 space-y-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                              Suggested Follow-up Inquiries:
                            </span>
                            <div className="flex flex-wrap gap-1 text-[11px]">
                              {item.followups.map((f, fIdx) => (
                                <button
                                  key={fIdx}
                                  onClick={() => handleAskAI(f)}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 hover:underline border border-emerald-200 dark:border-emerald-800"
                                >
                                  {f}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {qaLoading && (
                <div className="p-4 text-center text-xs text-emerald-600 animate-pulse flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Synthesizing anatomical & classical treatise response...</span>
                </div>
              )}
            </div>

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAskAI();
              }}
              className="relative flex items-center gap-2 pt-2 border-t border-[rgba(212,155,75,0.2)]"
            >
              <input
                type="text"
                placeholder={`Ask any question about ${currentStructureName}...`}
                value={qaInput}
                onChange={(e) => setQaInput(e.target.value)}
                disabled={qaLoading}
                className="flex-1 px-4 py-2.5 rounded-2xl bg-white dark:bg-white/5 border border-[#D49B4B]/30 text-xs focus:outline-none focus:ring-2 focus:ring-[#D49B4B]/50"
              />
              <button
                type="submit"
                disabled={qaLoading || !qaInput.trim()}
                className="px-4 py-2.5 rounded-2xl bg-[#0D2B1D] text-[#D49B4B] hover:bg-[#153e2b] text-xs font-bold transition-all disabled:opacity-40 flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Ask AI</span>
              </button>
            </form>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: QUIZ & ACTIVE-RECALL FLASHCARDS */}
        {/* ============================================================== */}
        {activeTab === "quiz" && (
          <div className="flex-1 p-6 overflow-y-auto space-y-5">
            <div className="flex items-center justify-between">
              <div className="inline-flex rounded-xl p-1 bg-white dark:bg-white/5 border border-[#D49B4B]/30 text-xs font-bold">
                <button
                  onClick={() => setQuizMode("quiz")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    quizMode === "quiz"
                      ? "bg-[#0D2B1D] text-[#D49B4B] shadow-xs"
                      : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  Interactive Viva Quiz
                </button>
                <button
                  onClick={() => setQuizMode("flashcards")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    quizMode === "flashcards"
                      ? "bg-[#0D2B1D] text-[#D49B4B] shadow-xs"
                      : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  Active-Recall Flashcards
                </button>
              </div>

              <button
                onClick={fetchQuizData}
                disabled={quizLoading}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-white/5 border border-[#D49B4B]/30 text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-[#F8F3E9] flex items-center gap-1.5 transition-all"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${quizLoading ? "animate-spin" : ""}`} />
                <span>Generate New Questions</span>
              </button>
            </div>

            {quizLoading ? (
              <div className="p-12 text-center text-xs text-gray-400 space-y-2">
                <Sparkles className="w-8 h-8 text-amber-500 mx-auto animate-spin" />
                <p>Generating high-yield viva quiz and flashcards for {currentStructureName}...</p>
              </div>
            ) : quizMode === "quiz" ? (
              /* Quiz View */
              <div className="space-y-4">
                {questions.map((q, idx) => {
                  const selectedOpt = selectedAnswers[q.id];
                  const isAnswered = selectedOpt !== undefined;
                  return (
                    <div
                      key={q.id}
                      className="p-5 rounded-2xl bg-white dark:bg-white/5 border border-[#D49B4B]/30 space-y-3 shadow-xs"
                    >
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span className="font-bold text-[#D49B4B]">Question {idx + 1} of {questions.length}</span>
                        <span className="px-2 py-0.5 rounded bg-black/5 dark:bg-white/10 text-[10px] font-mono">
                          {q.bams_subject}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-gray-900 dark:text-white leading-snug">
                        {q.question}
                      </h4>

                      <div className="space-y-2">
                        {q.options.map((opt, optIdx) => {
                          const isCorrect = optIdx === q.correct_index;
                          const isPicked = selectedOpt === optIdx;
                          let btnStyle = "bg-black/5 dark:bg-white/5 border-transparent text-gray-800 dark:text-gray-200";

                          if (isAnswered) {
                            if (isCorrect) {
                              btnStyle = "bg-emerald-500/15 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-bold";
                            } else if (isPicked) {
                              btnStyle = "bg-rose-500/15 border-rose-500 text-rose-900 dark:text-rose-200";
                            }
                          }

                          return (
                            <button
                              key={optIdx}
                              onClick={() => {
                                if (!isAnswered) {
                                  setSelectedAnswers((prev) => ({ ...prev, [q.id]: optIdx }));
                                }
                              }}
                              className={`w-full p-3 rounded-xl border text-left text-xs transition-all flex items-center justify-between cursor-pointer ${btnStyle}`}
                            >
                              <span>{opt}</span>
                              {isAnswered && isCorrect && (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {isAnswered && (
                        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200 space-y-1 animate-in fade-in">
                          <p><strong>Rationale:</strong> {q.explanation}</p>
                          {q.classical_citation && (
                            <p className="text-[10px] text-gray-500 dark:text-gray-400">
                              <strong>Citation:</strong> {q.classical_citation}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Flashcards View */
              <div className="flex flex-col items-center justify-center space-y-4 py-4">
                {flashcards.length > 0 && (
                  <>
                    <div className="text-xs text-gray-500">
                      Card {currentFlashcardIndex + 1} of {flashcards.length} • Click to Flip
                    </div>

                    <div
                      onClick={() => setIsFlipped(!isFlipped)}
                      className="w-full max-w-lg min-h-[220px] p-6 rounded-3xl bg-linear-to-br from-[#0D2B1D] to-[#174630] text-[#EAE3D2] border border-[#D49B4B]/50 shadow-xl cursor-pointer flex flex-col justify-between transition-transform duration-300 hover:scale-[1.01]"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold uppercase text-[#D49B4B]">
                          {isFlipped ? "Answer & Clinical Pearl" : "Anatomical Question"}
                        </span>
                        <span className="text-[10px] font-serif px-2 py-0.5 rounded bg-white/10">
                          {flashcards[currentFlashcardIndex].bams_subject}
                        </span>
                      </div>

                      <div className="py-4 text-center">
                        <h4 className="text-base sm:text-lg font-bold font-serif-heading text-white">
                          {isFlipped
                            ? flashcards[currentFlashcardIndex].back
                            : flashcards[currentFlashcardIndex].front}
                        </h4>
                        {isFlipped && (
                          <p className="text-xs text-[#D49B4B] mt-2 font-serif italic">
                            {flashcards[currentFlashcardIndex].high_yield_note}
                          </p>
                        )}
                      </div>

                      <div className="text-[10px] text-center text-gray-400">
                        {isFlipped ? "Tap to view front question" : "Tap anywhere to reveal answer"}
                      </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          setIsFlipped(false);
                          setCurrentFlashcardIndex((prev) => Math.max(0, prev - 1));
                        }}
                        disabled={currentFlashcardIndex === 0}
                        className="px-4 py-2 rounded-xl bg-white dark:bg-white/5 border border-[#D49B4B]/30 text-xs font-bold disabled:opacity-40"
                      >
                        Previous Card
                      </button>
                      <button
                        onClick={() => {
                          setIsFlipped(false);
                          setCurrentFlashcardIndex((prev) => Math.min(flashcards.length - 1, prev + 1));
                        }}
                        disabled={currentFlashcardIndex === flashcards.length - 1}
                        className="px-4 py-2 rounded-xl bg-[#0D2B1D] text-[#D49B4B] text-xs font-bold disabled:opacity-40"
                      >
                        Next Card
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: REVISION & MNEMONICS */}
        {/* ============================================================== */}
        {activeTab === "revision" && (
          <div className="flex-1 p-6 overflow-y-auto space-y-5 text-xs sm:text-sm">
            {summaryLoading ? (
              <div className="p-12 text-center text-xs text-gray-400 space-y-2">
                <Sparkles className="w-8 h-8 text-amber-500 mx-auto animate-spin" />
                <p>Synthesizing NCISM exam revision takeaways and classical shlokas...</p>
              </div>
            ) : summaryData ? (
              <>
                {/* High-Yield Key Takeaways */}
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-emerald-900 dark:text-emerald-200 text-xs uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>NCISM High-Yield Exam Takeaways:</span>
                  </div>
                  <ul className="list-disc pl-5 space-y-1.5 text-xs text-gray-700 dark:text-gray-200">
                    {summaryData.key_takeaways.map((point, idx) => (
                      <li key={idx} className="leading-relaxed">{point}</li>
                    ))}
                  </ul>
                </div>

                {/* Classical Sanskrit Shlokas */}
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-200 text-xs uppercase tracking-wider">
                    <BookOpen className="w-4 h-4 text-amber-600" />
                    <span>Classical Sanskrit Treatise References:</span>
                  </div>
                  <div className="space-y-2 text-xs font-serif text-gray-800 dark:text-gray-200">
                    {summaryData.classical_shlokas.map((shloka, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-white/60 dark:bg-black/30 border border-amber-500/20 italic">
                        {shloka}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mnemonics */}
                <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-purple-900 dark:text-purple-200 text-xs uppercase tracking-wider">
                    <Zap className="w-4 h-4 text-purple-600" />
                    <span>Anatomical Memory Mnemonics:</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {summaryData.mnemonics.map((mnem, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-white/70 dark:bg-white/5 border border-purple-500/20 font-medium">
                        {mnem}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Practical Viva Tips */}
                <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-blue-900 dark:text-blue-200 text-xs uppercase tracking-wider">
                    <Award className="w-4 h-4 text-blue-600" />
                    <span>Practical Viva & Cadaver Dissection Tips:</span>
                  </div>
                  <ul className="list-disc pl-5 space-y-1.5 text-xs text-gray-700 dark:text-gray-200">
                    {summaryData.exam_viva_tips.map((tip, idx) => (
                      <li key={idx} className="leading-relaxed">{tip}</li>
                    ))}
                  </ul>
                </div>
              </>
            ) : null}
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 5: MY NOTES & LEARNING PROGRESS */}
        {/* ============================================================== */}
        {activeTab === "progress" && (
          <div className="flex-1 p-6 overflow-y-auto space-y-5">
            {/* Progress Metric Card */}
            <div className="p-5 rounded-2xl bg-white dark:bg-white/5 border border-[#D49B4B]/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#D49B4B]">
                  Syllabus Mastery Progress
                </span>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  {completedStructures.length} Completed Anatomical Structures
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Tracked and synchronized with your BAMS Student Dashboard.
                </p>
              </div>

              <div className="w-full sm:w-48 space-y-1 text-right">
                <div className="flex justify-between text-xs font-bold text-[#D49B4B]">
                  <span>Progress</span>
                  <span>{Math.min(100, Math.round((completedStructures.length / 20) * 100))}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-linear-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.round((completedStructures.length / 20) * 100))}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Note Editor for Current Structure */}
            <div className="p-5 rounded-2xl bg-white dark:bg-white/5 border border-[#D49B4B]/30 space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#D49B4B]" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white">
                    Personal Study Notes for: {currentStructureName}
                  </h4>
                </div>
                {notesSaveStatus && (
                  <span className="text-xs font-bold text-emerald-600 animate-in fade-in">
                    {notesSaveStatus}
                  </span>
                )}
              </div>

              <textarea
                rows={4}
                value={currentNoteText}
                onChange={(e) => setCurrentNoteText(e.target.value)}
                placeholder="Write personal revision notes, shloka mnemonics, or practical cadaver observations here..."
                className="w-full p-3 rounded-xl bg-black/5 dark:bg-black/30 border border-black/10 dark:border-white/10 text-xs focus:outline-none focus:ring-2 focus:ring-[#D49B4B]/50"
              />

              <div className="flex items-center justify-between">
                <span className="text-[11px] text-gray-400">
                  Notes are stored persistently and accessible anytime from your dashboard.
                </span>
                <button
                  type="button"
                  onClick={handleSaveNotes}
                  className="px-4 py-2 rounded-xl bg-[#0D2B1D] text-[#D49B4B] hover:bg-[#153e2b] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>Save Notes</span>
                </button>
              </div>
            </div>

            {/* Spaced-Repetition Revision Recommendations */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#D49B4B]" />
                <span>Recommended for Review & Spaced Repetition</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {recommendedRevisions.map((rec) => (
                  <div
                    key={rec.structure_id}
                    className="p-3.5 rounded-xl bg-white dark:bg-white/5 border border-[rgba(212,155,75,0.2)] flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <h5 className="text-xs font-bold text-gray-900 dark:text-white">
                        {rec.title}
                      </h5>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">
                        {rec.reason}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        const match = ANATOMICAL_DATABASE[rec.structure_id];
                        if (match) {
                          onSelectStructure(match);
                          setActiveTab("curriculum");
                        }
                      }}
                      className="px-2.5 py-1 rounded-lg bg-black/5 dark:bg-white/10 hover:bg-[#D49B4B] hover:text-[#0D2B1D] text-[10px] font-bold transition-all shrink-0 cursor-pointer"
                    >
                      Review
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* FOOTER */}
        {/* ============================================================== */}
        <footer className="px-6 py-3 border-t border-[#D49B4B]/20 bg-white/80 dark:bg-[#07160e]/80 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Educational BAMS Rachana & Kriya Sharir Study Aid</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-bold hover:bg-gray-300 dark:hover:bg-gray-700 transition"
          >
            Close Studio
          </button>
        </footer>

      </div>
    </div>
  );
}
