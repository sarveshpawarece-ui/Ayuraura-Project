"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import {
  Wifi,
  WifiOff,
  BookOpen,
  FileText,
  Sparkles,
  Search,
  Plus,
  Trash2,
  Edit3,
  Bookmark,
  CheckCircle2,
  AlertCircle,
  HardDrive,
  Download,
  Share2,
  ArrowRight,
  RefreshCw,
  HelpCircle,
  Layers,
  Award
} from "lucide-react";
import {
  offlineStorage,
  OfflineNote,
  OfflineShloka,
  OfflineFlashcard
} from "@/lib/offlineStorage";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";

export default function OfflineLearningPage() {
  const { isOnline } = useNetworkStatus();
  const [activeTab, setActiveTab] = useState<"notes" | "shlokas" | "flashcards" | "storage">("notes");

  // Notes state
  const [notes, setNotes] = useState<OfflineNote[]>([]);
  const [searchNotes, setSearchNotes] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("ALL");
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteSubject, setNoteSubject] = useState("Kayachikitsa");
  const [noteContent, setNoteContent] = useState("");
  const [noteTags, setNoteTags] = useState("Clinical, Exam");
  const [draftSavedToast, setDraftSavedToast] = useState(false);

  // Shlokas state
  const [shlokas, setShlokas] = useState<OfflineShloka[]>([]);
  const [searchShloka, setSearchShloka] = useState("");
  const [selectedTreatise, setSelectedTreatise] = useState("ALL");

  // Flashcards state
  const [flashcards, setFlashcards] = useState<OfflineFlashcard[]>([]);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Storage summary
  const [storageSummary, setStorageSummary] = useState({
    notesCount: 0,
    shlokasCount: 0,
    flashcardsCount: 0,
    estimatedSizeKb: 0
  });

  // Load offline data on mount
  useEffect(() => {
    loadAllOfflineData();

    // Check for draft autosave
    const draft = offlineStorage.getDraft();
    if (draft && !noteContent) {
      setNoteTitle(draft.title || "");
      setNoteSubject(draft.subject || "Kayachikitsa");
      setNoteContent(draft.content || "");
    }
  }, []);

  const loadAllOfflineData = () => {
    setNotes(offlineStorage.getNotes());
    setShlokas(offlineStorage.getShlokas());
    setFlashcards(offlineStorage.getFlashcards());
    setStorageSummary(offlineStorage.getStorageSummary());
  };

  // Autosave draft on typing
  useEffect(() => {
    if (isEditingNote && (noteTitle || noteContent)) {
      offlineStorage.saveDraft({
        title: noteTitle,
        subject: noteSubject,
        content: noteContent
      });
      setDraftSavedToast(true);
      const timer = setTimeout(() => setDraftSavedToast(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [noteTitle, noteSubject, noteContent, isEditingNote]);

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim() || !noteContent.trim()) return;

    const tagsArray = noteTags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    offlineStorage.saveNote({
      id: activeNoteId || undefined,
      title: noteTitle,
      subject: noteSubject,
      content: noteContent,
      tags: tagsArray
    });

    offlineStorage.clearDraft();
    setIsEditingNote(false);
    setActiveNoteId(null);
    setNoteTitle("");
    setNoteContent("");
    loadAllOfflineData();
  };

  const handleEditNote = (note: OfflineNote) => {
    setActiveNoteId(note.id);
    setNoteTitle(note.title);
    setNoteSubject(note.subject);
    setNoteContent(note.content);
    setNoteTags(note.tags.join(", "));
    setIsEditingNote(true);
  };

  const handleDeleteNote = (id: string) => {
    if (confirm("Delete this offline note from local storage?")) {
      offlineStorage.deleteNote(id);
      loadAllOfflineData();
    }
  };

  const handleToggleBookmarkShloka = (id: string) => {
    offlineStorage.toggleBookmarkShloka(id);
    loadAllOfflineData();
  };

  const handleExportNotes = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(notes, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `aayuraura_offline_notes_${new Date().toISOString().split("T")[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Filtered notes
  const filteredNotes = notes.filter((n) => {
    const matchesSubject = selectedSubject === "ALL" || n.subject === selectedSubject;
    const matchesQuery =
      !searchNotes.trim() ||
      n.title.toLowerCase().includes(searchNotes.toLowerCase()) ||
      n.content.toLowerCase().includes(searchNotes.toLowerCase()) ||
      n.tags.some((t) => t.toLowerCase().includes(searchNotes.toLowerCase()));
    return matchesSubject && matchesQuery;
  });

  // Filtered shlokas
  const filteredShlokas = shlokas.filter((s) => {
    const matchesTreatise = selectedTreatise === "ALL" || s.treatise === selectedTreatise;
    const matchesQuery =
      !searchShloka.trim() ||
      s.sanskrit.includes(searchShloka) ||
      s.transliteration.toLowerCase().includes(searchShloka.toLowerCase()) ||
      s.translation.toLowerCase().includes(searchShloka.toLowerCase()) ||
      s.clinicalCommentary.toLowerCase().includes(searchShloka.toLowerCase());
    return matchesTreatise && matchesQuery;
  });

  const subjectsList = ["ALL", "Kayachikitsa", "Panchakarma", "Dravyaguna", "Shalya Tantra", "Roganidana", "Swasthavritta"];
  const treatisesList = ["ALL", "Charaka Samhita", "Sushruta Samhita", "Ashtanga Hridaya"];

  return (
    <div className="min-h-screen bg-[#F7F9F4] dark:bg-[#0D1511] text-[#17231C] dark:text-[#F1F6F2] flex flex-col transition-colors duration-200 pb-20 md:pb-12">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Header with Connectivity Status */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#121E17] border border-[rgba(212,155,75,0.3)] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider uppercase border ${
                  isOnline
                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                    : "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30"
                }`}
              >
                {isOnline ? (
                  <>
                    <Wifi className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Online (Local Cache Active)</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 animate-pulse" />
                    <span>100% Offline Mode</span>
                  </>
                )}
              </span>

              <span className="text-xs text-[#627067] dark:text-[#A9B9AE] font-mono">
                {storageSummary.estimatedSizeKb} KB Cached
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0D2B1D] dark:text-white font-serif-heading">
              Offline Learning Hub
            </h1>
            <p className="text-xs sm:text-sm text-[#526158] dark:text-[#A9B9AE] mt-1 max-w-2xl leading-relaxed">
              Study without internet interruptions. Access saved clinical notes, NCISM classical treatises, and active-recall flashcards anywhere — even during rural hospital postings.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/student/dashboard"
              className="px-4 py-2 rounded-xl bg-white dark:bg-white/5 border border-[rgba(212,155,75,0.3)] hover:bg-[#F8F3E9] dark:hover:bg-white/10 text-xs font-semibold text-[#0D2B1D] dark:text-[#EAE3D2] transition-all flex items-center gap-1.5 shadow-xs"
            >
              <span>Back to Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Tab Navigation Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab("notes")}
            className={`px-4 py-2.5 rounded-2xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap border ${
              activeTab === "notes"
                ? "bg-[#0D2B1D] text-[#D49B4B] border-[#0D2B1D] shadow-md ring-2 ring-[#D49B4B]/30"
                : "bg-white dark:bg-white/5 text-[#526158] dark:text-[#A9B9AE] border-[rgba(212,155,75,0.25)] hover:bg-[#F8F3E9] dark:hover:bg-white/10"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>My Offline Notes ({notes.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("shlokas")}
            className={`px-4 py-2.5 rounded-2xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap border ${
              activeTab === "shlokas"
                ? "bg-[#0D2B1D] text-[#D49B4B] border-[#0D2B1D] shadow-md ring-2 ring-[#D49B4B]/30"
                : "bg-white dark:bg-white/5 text-[#526158] dark:text-[#A9B9AE] border-[rgba(212,155,75,0.25)] hover:bg-[#F8F3E9] dark:hover:bg-white/10"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Classical Shlokas ({shlokas.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("flashcards")}
            className={`px-4 py-2.5 rounded-2xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap border ${
              activeTab === "flashcards"
                ? "bg-[#0D2B1D] text-[#D49B4B] border-[#0D2B1D] shadow-md ring-2 ring-[#D49B4B]/30"
                : "bg-white dark:bg-white/5 text-[#526158] dark:text-[#A9B9AE] border-[rgba(212,155,75,0.25)] hover:bg-[#F8F3E9] dark:hover:bg-white/10"
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Active Recall ({flashcards.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("storage")}
            className={`px-4 py-2.5 rounded-2xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap border ${
              activeTab === "storage"
                ? "bg-[#0D2B1D] text-[#D49B4B] border-[#0D2B1D] shadow-md ring-2 ring-[#D49B4B]/30"
                : "bg-white dark:bg-white/5 text-[#526158] dark:text-[#A9B9AE] border-[rgba(212,155,75,0.25)] hover:bg-[#F8F3E9] dark:hover:bg-white/10"
            }`}
          >
            <HardDrive className="w-4 h-4" />
            <span>Storage & Sync</span>
          </button>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* TAB 1: OFFLINE NOTES & CLINICAL LOGBOOK                       */}
        {/* ------------------------------------------------------------- */}
        {activeTab === "notes" && (
          <div className="space-y-6">
            {/* Create/Edit Note Card */}
            {isEditingNote ? (
              <form
                onSubmit={handleSaveNote}
                className="p-6 rounded-3xl bg-white dark:bg-[#121E17] border border-[#D49B4B]/40 shadow-lg space-y-4 animate-in fade-in"
              >
                <div className="flex items-center justify-between border-b border-[rgba(212,155,75,0.2)] pb-3">
                  <div className="flex items-center gap-2">
                    <Edit3 className="w-4 h-4 text-[#D49B4B]" />
                    <h3 className="text-base font-bold text-[#0D2B1D] dark:text-[#EAE3D2] font-serif-heading">
                      {activeNoteId ? "Edit Offline Note" : "Create New Offline Note"}
                    </h3>
                  </div>

                  {draftSavedToast && (
                    <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1 animate-pulse">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Draft Autosaved
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-xs font-semibold text-[#526158] dark:text-[#A9B9AE]">Note Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Snehana Dosages & Complications"
                      value={noteTitle}
                      onChange={(e) => setNoteTitle(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F9F4] dark:bg-white/5 border border-[rgba(212,155,75,0.3)] text-xs text-[#0D2B1D] dark:text-[#EAE3D2] focus:border-[#D49B4B] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#526158] dark:text-[#A9B9AE]">BAMS Subject</label>
                    <select
                      value={noteSubject}
                      onChange={(e) => setNoteSubject(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F9F4] dark:bg-white/5 border border-[rgba(212,155,75,0.3)] text-xs text-[#0D2B1D] dark:text-[#EAE3D2] focus:border-[#D49B4B] focus:outline-none"
                    >
                      <option value="Kayachikitsa">Kayachikitsa</option>
                      <option value="Panchakarma">Panchakarma</option>
                      <option value="Dravyaguna">Dravyaguna</option>
                      <option value="Shalya Tantra">Shalya Tantra</option>
                      <option value="Roganidana">Roganidana</option>
                      <option value="Swasthavritta">Swasthavritta</option>
                      <option value="General Clinical">General Clinical</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#526158] dark:text-[#A9B9AE]">Clinical & Academic Notes</label>
                  <textarea
                    required
                    rows={6}
                    placeholder="Record dosage, contraindications, classical citations, or hospital observation..."
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F9F4] dark:bg-white/5 border border-[rgba(212,155,75,0.3)] text-xs text-[#0D2B1D] dark:text-[#EAE3D2] focus:border-[#D49B4B] focus:outline-none leading-relaxed font-sans"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#526158] dark:text-[#A9B9AE]">Tags (Comma separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. Panchakarma, Vamana, Shuddhi, Exam"
                    value={noteTags}
                    onChange={(e) => setNoteTags(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#F7F9F4] dark:bg-white/5 border border-[rgba(212,155,75,0.3)] text-xs text-[#0D2B1D] dark:text-[#EAE3D2] focus:border-[#D49B4B] focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingNote(false);
                      setActiveNoteId(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-white/5 text-[#526158] dark:text-[#A9B9AE] text-xs font-semibold hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#0D2B1D] to-[#1a4b33] text-[#D49B4B] text-xs font-bold border border-[#D49B4B]/40 hover:shadow-md transition-all cursor-pointer shadow-xs"
                  >
                    Save Note to Device
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingNote(true);
                    setActiveNoteId(null);
                    setNoteTitle("");
                    setNoteContent("");
                  }}
                  className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#0D2B1D] to-[#1a4b33] text-[#D49B4B] text-xs font-bold border border-[#D49B4B]/40 hover:shadow-md transition-all flex items-center gap-2 cursor-pointer shadow-xs active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Write New Offline Note</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportNotes}
                  className="px-3 py-2 rounded-xl bg-white dark:bg-white/5 border border-[rgba(212,155,75,0.3)] text-xs text-[#526158] dark:text-[#A9B9AE] hover:text-[#0D2B1D] dark:hover:text-white transition-colors flex items-center gap-1.5"
                  title="Export offline notes as JSON"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Export Notes</span>
                </button>
              </div>
            )}

            {/* Filter and Search Controls */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search offline notes by title, tag, or keyword..."
                  value={searchNotes}
                  onChange={(e) => setSearchNotes(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-white dark:bg-[#121E17] border border-[rgba(212,155,75,0.25)] text-xs text-[#0D2B1D] dark:text-[#EAE3D2] placeholder-gray-400 focus:border-[#D49B4B] focus:outline-none"
                />
              </div>

              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="px-3.5 py-2.5 rounded-2xl bg-white dark:bg-[#121E17] border border-[rgba(212,155,75,0.25)] text-xs text-[#0D2B1D] dark:text-[#EAE3D2] focus:border-[#D49B4B] focus:outline-none"
              >
                {subjectsList.map((s) => (
                  <option key={s} value={s}>
                    {s === "ALL" ? "All Subjects" : s}
                  </option>
                ))}
              </select>
            </div>

            {/* Notes Grid */}
            {filteredNotes.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#121E17] border border-[rgba(212,155,75,0.25)] space-y-3">
                <FileText className="w-8 h-8 text-gray-400 mx-auto" />
                <h4 className="text-sm font-bold text-[#0D2B1D] dark:text-[#EAE3D2]">No Offline Notes Found</h4>
                <p className="text-xs text-[#627067] dark:text-[#A9B9AE] max-w-sm mx-auto">
                  Click &quot;Write New Offline Note&quot; to record clinical case observations or exam pointers directly on your device.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredNotes.map((note) => (
                  <div
                    key={note.id}
                    className="p-5 rounded-3xl bg-white dark:bg-[#121E17] border border-[rgba(212,155,75,0.25)] hover:border-[#D49B4B]/50 transition-all shadow-xs flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                          {note.subject}
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleEditNote(note)}
                            className="p-1 text-gray-400 hover:text-[#0D2B1D] dark:hover:text-white transition-colors"
                            title="Edit Note"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteNote(note.id)}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                            title="Delete Note"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <h4 className="text-sm font-bold text-[#0D2B1D] dark:text-[#EAE3D2] font-serif-heading">
                        {note.title}
                      </h4>

                      <p className="text-xs text-[#526158] dark:text-[#A9B9AE] leading-relaxed line-clamp-4 whitespace-pre-wrap">
                        {note.content}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[rgba(212,155,75,0.15)] flex items-center justify-between text-[10px] font-mono text-gray-400">
                      <div className="flex flex-wrap gap-1">
                        {note.tags.map((tag) => (
                          <span key={tag} className="px-1.5 py-0.2 rounded bg-black/5 dark:bg-white/5">
                            #{tag}
                          </span>
                        ))}
                      </div>
                      <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 2: NCISM CLASSICAL SHLOKAS & TREATISES (100% OFFLINE)     */}
        {/* ------------------------------------------------------------- */}
        {activeTab === "shlokas" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search Sanskrit verses, transliterations, or clinical meanings..."
                  value={searchShloka}
                  onChange={(e) => setSearchShloka(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-white dark:bg-[#121E17] border border-[rgba(212,155,75,0.25)] text-xs text-[#0D2B1D] dark:text-[#EAE3D2] placeholder-gray-400 focus:border-[#D49B4B] focus:outline-none"
                />
              </div>

              <select
                value={selectedTreatise}
                onChange={(e) => setSelectedTreatise(e.target.value)}
                className="px-3.5 py-2.5 rounded-2xl bg-white dark:bg-[#121E17] border border-[rgba(212,155,75,0.25)] text-xs text-[#0D2B1D] dark:text-[#EAE3D2] focus:border-[#D49B4B] focus:outline-none"
              >
                {treatisesList.map((t) => (
                  <option key={t} value={t}>
                    {t === "ALL" ? "All Treatises" : t}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-4">
              {filteredShlokas.map((s) => (
                <div
                  key={s.id}
                  className="p-6 rounded-3xl bg-white dark:bg-[#121E17] border border-[rgba(212,155,75,0.25)] hover:border-[#D49B4B]/60 transition-all shadow-xs space-y-4"
                >
                  <div className="flex items-start justify-between gap-3 border-b border-[rgba(212,155,75,0.15)] pb-3">
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#D49B4B]">
                        {s.subject} • {s.treatise}
                      </span>
                      <h4 className="text-xs font-semibold text-[#627067] dark:text-[#A9B9AE]">
                        {s.sthana} • {s.chapter} ({s.verse})
                      </h4>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleBookmarkShloka(s.id)}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        s.isBookmarked
                          ? "bg-[#D49B4B] text-[#0D2B1D]"
                          : "text-gray-400 hover:text-[#D49B4B]"
                      }`}
                      title={s.isBookmarked ? "Remove Bookmark" : "Bookmark Shloka for Offline Revision"}
                    >
                      <Bookmark className="w-4 h-4 fill-current" />
                    </button>
                  </div>

                  {/* Devanagari Sanskrit */}
                  <div className="p-4 rounded-2xl bg-[#0D2B1D] text-[#D49B4B] border border-[#D49B4B]/30 font-serif-heading text-base leading-relaxed tracking-wide text-center">
                    <p className="whitespace-pre-line font-bold">{s.sanskrit}</p>
                  </div>

                  {/* Transliteration */}
                  <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 text-xs text-[#526158] dark:text-[#A9B9AE] font-mono italic text-center">
                    <p className="whitespace-pre-line">{s.transliteration}</p>
                  </div>

                  {/* English Translation */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase font-bold text-gray-500">
                      Meaning &amp; Translation:
                    </span>
                    <p className="text-xs text-[#0D2B1D] dark:text-[#EAE3D2] leading-relaxed">
                      {s.translation}
                    </p>
                  </div>

                  {/* Clinical Commentary */}
                  <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-500/20 text-xs text-emerald-950 dark:text-emerald-200 leading-relaxed">
                    <strong className="block text-[11px] font-bold text-emerald-800 dark:text-emerald-300 mb-1">
                      🔬 NCISM Clinical Utility:
                    </strong>
                    {s.clinicalCommentary}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 3: ACTIVE RECALL FLASHCARDS (100% OFFLINE)                */}
        {/* ------------------------------------------------------------- */}
        {activeTab === "flashcards" && (
          <div className="space-y-6">
            <div className="text-center max-w-md mx-auto space-y-1">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#D49B4B]">
                Card {activeCardIndex + 1} of {flashcards.length}
              </span>
              <p className="text-xs text-[#627067] dark:text-[#A9B9AE]">
                Tap anywhere on the card to flip between Question and Answer.
              </p>
            </div>

            {flashcards[activeCardIndex] && (
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="max-w-xl mx-auto min-h-[300px] p-8 rounded-3xl bg-white dark:bg-[#121E17] border-2 border-[#D49B4B]/40 hover:border-[#D49B4B] shadow-xl flex flex-col justify-between cursor-pointer transition-all active:scale-[0.99] select-none text-center relative overflow-hidden"
              >
                <div className="flex items-center justify-between text-xs text-gray-400 font-mono">
                  <span>{flashcards[activeCardIndex].category}</span>
                  <span className="px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/5 text-[10px] uppercase font-bold text-[#D49B4B]">
                    {isFlipped ? "Answer" : "Question"}
                  </span>
                </div>

                <div className="my-auto py-6 space-y-3">
                  <h3 className="text-lg font-bold text-[#0D2B1D] dark:text-white font-serif-heading">
                    {flashcards[activeCardIndex].term}
                  </h3>
                  <span className="text-xs text-[#855c1b] dark:text-amber-300 font-mono italic block">
                    {flashcards[activeCardIndex].sanskritName}
                  </span>

                  <p className="text-sm text-[#0D2B1D] dark:text-[#EAE3D2] leading-relaxed font-sans whitespace-pre-line mt-2">
                    {isFlipped
                      ? flashcards[activeCardIndex].back
                      : flashcards[activeCardIndex].front}
                  </p>
                </div>

                <div className="pt-4 border-t border-[rgba(212,155,75,0.2)] flex items-center justify-between text-[11px] text-gray-400">
                  <span className="text-[#D49B4B] font-medium">
                    💡 Hint: {flashcards[activeCardIndex].mnemonicHint}
                  </span>
                  <span className="font-mono">Tap to flip ↺</span>
                </div>
              </div>
            )}

            {/* Carousel navigation controls */}
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsFlipped(false);
                  setActiveCardIndex((prev) => (prev > 0 ? prev - 1 : flashcards.length - 1));
                }}
                className="px-4 py-2 rounded-xl bg-white dark:bg-white/5 border border-[rgba(212,155,75,0.3)] text-xs font-semibold text-[#0D2B1D] dark:text-[#EAE3D2] hover:bg-[#F8F3E9] transition-all cursor-pointer shadow-xs"
              >
                ← Previous Card
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsFlipped(false);
                  setActiveCardIndex((prev) => (prev < flashcards.length - 1 ? prev + 1 : 0));
                }}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#0D2B1D] to-[#1a4b33] text-[#D49B4B] text-xs font-bold border border-[#D49B4B]/40 hover:shadow-md transition-all cursor-pointer shadow-xs"
              >
                Next Card →
              </button>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 4: OFFLINE STORAGE & CONNECTIVITY DIAGNOSTICS             */}
        {/* ------------------------------------------------------------- */}
        {activeTab === "storage" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-3xl bg-white dark:bg-[#121E17] border border-[rgba(212,155,75,0.25)] space-y-1">
                <span className="text-xs text-[#627067] dark:text-[#A9B9AE] font-semibold">Cached Notes</span>
                <p className="text-2xl font-extrabold text-[#0D2B1D] dark:text-white font-mono">
                  {storageSummary.notesCount}
                </p>
                <span className="text-[10px] text-gray-400">Available offline</span>
              </div>

              <div className="p-5 rounded-3xl bg-white dark:bg-[#121E17] border border-[rgba(212,155,75,0.25)] space-y-1">
                <span className="text-xs text-[#627067] dark:text-[#A9B9AE] font-semibold">Classical Shlokas</span>
                <p className="text-2xl font-extrabold text-[#D49B4B] font-mono">
                  {storageSummary.shlokasCount}
                </p>
                <span className="text-[10px] text-gray-400">Precached in memory</span>
              </div>

              <div className="p-5 rounded-3xl bg-white dark:bg-[#121E17] border border-[rgba(212,155,75,0.25)] space-y-1">
                <span className="text-xs text-[#627067] dark:text-[#A9B9AE] font-semibold">Storage Footprint</span>
                <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                  {storageSummary.estimatedSizeKb} KB
                </p>
                <span className="text-[10px] text-gray-400">HTML5 Storage API</span>
              </div>
            </div>

            {/* Honest Technical Connectivity Disclosure */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#121E17] border border-amber-500/30 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                <HelpCircle className="w-5 h-5 shrink-0" />
                <h4 className="text-sm font-bold uppercase tracking-wider font-serif-heading">
                  What Works Offline vs What Requires Internet
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-500/20 space-y-2">
                  <span className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Works 100% Offline (No Internet Needed):
                  </span>
                  <ul className="space-y-1 text-emerald-950 dark:text-emerald-200 list-disc list-inside">
                    <li>Creating and reading personal clinical notes</li>
                    <li>Classical Sanskrit shlokas with transliteration</li>
                    <li>Active recall flashcards and viva mnemonics</li>
                    <li>NCISM curriculum syllabus reference</li>
                    <li>PWA app shell and offline navigation fallback</li>
                  </ul>
                </div>

                <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-500/20 space-y-2">
                  <span className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    Requires Active Internet Connection:
                  </span>
                  <ul className="space-y-1 text-amber-950 dark:text-amber-200 list-disc list-inside">
                    <li>AI Anatomy Explainer and streaming AI chat</li>
                    <li>Initial download of 3D GLTF models (3.5MB each)</li>
                    <li>Live faculty live streaming & Q&amp;A sessions</li>
                    <li>Cloud backup sync of newly created notes</li>
                    <li>Online quiz score submissions to dashboard</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Reset / Clear Actions */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 text-xs">
              <div>
                <span className="font-bold text-[#0D2B1D] dark:text-[#EAE3D2] block">Local Storage Management</span>
                <span className="text-[11px] text-[#627067] dark:text-[#A9B9AE]">Clear cached notes and bookmarked shlokas on this browser.</span>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (confirm("Reset local offline cache? Your notes will be reset to default sample.")) {
                    offlineStorage.clearOfflineCache();
                    loadAllOfflineData();
                  }
                }}
                className="px-3.5 py-1.5 rounded-xl bg-red-600/10 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white transition-colors font-bold text-xs cursor-pointer"
              >
                Reset Local Cache
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
