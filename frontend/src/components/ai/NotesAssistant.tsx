"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  Sparkles,
  Save,
  Plus,
  Trash2,
  Folder,
  Tag,
  Search,
  CheckCircle2,
  XCircle,
  Copy,
  History,
  RotateCcw,
  BookOpen,
  HelpCircle,
  ArrowRight,
  Split,
  Maximize2,
  Check,
  Award,
  Layers,
  ChevronDown
} from "lucide-react";
import { api } from "@/lib/api";
import { VoiceReaderControls } from "./VoiceAssistantControls";

interface StudyNote {
  id: string;
  title: string;
  content: string;
  subject: string;
  topic: string;
  chapter: string;
  folder_name: string;
  tags: string[];
  color_code: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  version_count?: number;
}

interface NoteVersion {
  id: string;
  version_number: number;
  title: string;
  content: string;
  change_summary: string;
  created_at: string;
}

interface AITransformationResult {
  transformation_type: string;
  original_snippet: string;
  improved_content: string;
  diff_summary: string;
  headings_suggested: string[];
  key_concepts: string[];
  missing_points: string[];
  flashcards: { front: string; back: string }[];
  revision_checklist: string[];
  classical_references: string[];
}

export default function NotesAssistant() {
  const [notes, setNotes] = useState<StudyNote[]>([]);
  const [selectedNote, setSelectedNote] = useState<StudyNote | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("ALL");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Editor states
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editSubject, setEditSubject] = useState("Maulik Siddhanta");
  const [editTopic, setEditTopic] = useState("General");
  const [editFolder, setEditFolder] = useState("General");

  // AI Transformation & Diff Panel states
  const [isTransforming, setIsTransforming] = useState(false);
  const [transformationResult, setTransformationResult] = useState<AITransformationResult | null>(null);
  const [activeFlippedCard, setActiveFlippedCard] = useState<number | null>(null);

  // Version History states
  const [versions, setVersions] = useState<NoteVersion[]>([]);
  const [showVersionHistory, setShowVersionHistory] = useState(false);

  useEffect(() => {
    fetchNotes();
  }, [subjectFilter]);

  const fetchNotes = async () => {
    try {
      const params: any = {};
      if (subjectFilter !== "ALL") params.subject = subjectFilter;
      const res = await api.get("/ai-ecosystem/notes", { params });
      if (res.data && Array.isArray(res.data)) {
        setNotes(res.data);
        if (res.data.length > 0 && !selectedNote) {
          loadNoteIntoEditor(res.data[0]);
        }
      }
    } catch (err) {
      console.error("Failed to fetch notes:", err);
    }
  };

  const loadNoteIntoEditor = (note: StudyNote) => {
    setSelectedNote(note);
    setEditTitle(note.title);
    setEditContent(note.content);
    setEditSubject(note.subject);
    setEditTopic(note.topic);
    setEditFolder(note.folder_name);
    setTransformationResult(null);
    setShowVersionHistory(false);
  };

  const handleCreateNewNote = async () => {
    try {
      const res = await api.post("/ai-ecosystem/notes", {
        title: "New BAMS Study Note",
        content: "Write your notes here or paste classical Ayurvedic concepts...",
        subject: editSubject,
        topic: "General",
        chapter: "Chapter 1",
        folder_name: "My Notes",
        tags: ["BAMS", "Revision"],
        color_code: "emerald",
        is_pinned: false
      });
      if (res.data) {
        setNotes([res.data, ...notes]);
        loadNoteIntoEditor(res.data);
      }
    } catch (err) {
      console.error("Failed to create new note:", err);
    }
  };

  const handleSaveNote = async () => {
    if (!selectedNote) return;
    setIsSaving(true);
    try {
      const res = await api.put(`/ai-ecosystem/notes/${selectedNote.id}`, {
        title: editTitle,
        content: editContent,
        subject: editSubject,
        topic: editTopic,
        folder_name: editFolder,
        change_summary: "Manual user edit"
      });
      if (res.data) {
        setNotes((prev) => prev.map((n) => (n.id === selectedNote.id ? res.data : n)));
        setSelectedNote(res.data);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
      }
    } catch (err) {
      console.error("Failed to save note:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm("Are you sure you want to delete this study note?")) return;
    try {
      await api.delete(`/ai-ecosystem/notes/${noteId}`);
      const remaining = notes.filter((n) => n.id !== noteId);
      setNotes(remaining);
      if (remaining.length > 0) {
        loadNoteIntoEditor(remaining[0]);
      } else {
        setSelectedNote(null);
      }
    } catch (err) {
      console.error("Failed to delete note:", err);
    }
  };

  const handleAITransform = async (type: string) => {
    if (!editContent.trim()) return;
    setIsTransforming(true);
    try {
      const res = await api.post("/ai-ecosystem/notes/transform", {
        note_id: selectedNote?.id,
        content: editContent,
        subject: editSubject,
        transformation_type: type
      });
      if (res.data) {
        setTransformationResult(res.data);
      }
    } catch (err) {
      console.error("AI Transformation error:", err);
    } finally {
      setIsTransforming(false);
    }
  };

  const handleAcceptAISuggestion = () => {
    if (!transformationResult) return;
    setEditContent(transformationResult.improved_content);
    setTransformationResult(null);
    handleSaveNote();
  };

  const handleSaveAsNewNote = async () => {
    if (!transformationResult) return;
    try {
      const res = await api.post("/ai-ecosystem/notes", {
        title: `${editTitle} (AI Enhanced: ${transformationResult.transformation_type})`,
        content: transformationResult.improved_content,
        subject: editSubject,
        topic: editTopic,
        chapter: "AI Revised",
        folder_name: "AI Improved Notes",
        tags: ["AI Enhanced", editSubject],
        color_code: "purple",
        is_pinned: false
      });
      if (res.data) {
        setNotes([res.data, ...notes]);
        loadNoteIntoEditor(res.data);
      }
    } catch (err) {
      console.error("Failed to save as new note:", err);
    }
  };

  const handleViewVersions = async () => {
    if (!selectedNote) return;
    try {
      const res = await api.get(`/ai-ecosystem/notes/${selectedNote.id}/versions`);
      if (res.data && Array.isArray(res.data)) {
        setVersions(res.data);
        setShowVersionHistory(true);
      }
    } catch (err) {
      console.error("Failed to load versions:", err);
    }
  };

  const handleRestoreVersion = async (versionId: string) => {
    if (!selectedNote) return;
    try {
      const res = await api.post(`/ai-ecosystem/notes/${selectedNote.id}/restore/${versionId}`);
      if (res.data) {
        loadNoteIntoEditor(res.data);
        setShowVersionHistory(false);
        fetchNotes();
      }
    } catch (err) {
      console.error("Failed to restore version:", err);
    }
  };

  const filteredNotes = notes.filter((n) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      n.title.toLowerCase().includes(q) ||
      n.content.toLowerCase().includes(q) ||
      n.subject.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex flex-col lg:flex-row h-[840px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl overflow-hidden">
      {/* 1. LEFT SIDEBAR: NOTES DIRECTORY */}
      <div className="w-full lg:w-72 max-h-52 lg:max-h-none bg-gray-50/80 dark:bg-gray-950/60 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-800 flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-600 text-white shadow-md shadow-purple-600/20">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">My Study Notes</h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">{notes.length} Saved Records</p>
            </div>
          </div>
          <button
            onClick={handleCreateNewNote}
            title="Create New Note"
            className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition shadow flex items-center justify-center"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Filter */}
        <div className="p-3 space-y-2 border-b border-gray-200 dark:border-gray-800 bg-white/40 dark:bg-gray-900/40">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes..."
              className="w-full text-xs py-1.5 pl-8 pr-2.5 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-800 dark:text-gray-200 focus:outline-none"
            />
          </div>
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="w-full text-xs py-1 px-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 focus:outline-none"
          >
            <option value="ALL">All Subjects</option>
            <option value="Maulik Siddhanta">Maulik Siddhanta</option>
            <option value="Rachana Sharira">Rachana Sharira</option>
            <option value="Kriya Sharira">Kriya Sharira</option>
            <option value="Dravyaguna">Dravyaguna</option>
            <option value="Panchakarma">Panchakarma</option>
            <option value="Kayachikitsa">Kayachikitsa</option>
          </select>
        </div>

        {/* Notes List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
          {filteredNotes.length === 0 ? (
            <div className="p-4 text-center text-xs text-gray-400">
              No matching notes found. Click + to create one!
            </div>
          ) : (
            filteredNotes.map((note) => {
              const isSelected = selectedNote?.id === note.id;
              return (
                <div
                  key={note.id}
                  onClick={() => loadNoteIntoEditor(note)}
                  className={`w-full text-left p-3 rounded-xl text-xs transition cursor-pointer border ${
                    isSelected
                      ? "bg-purple-50/80 dark:bg-purple-950/40 border-purple-300 dark:border-purple-800 shadow-sm"
                      : "bg-white dark:bg-gray-800/60 border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700"
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-bold text-gray-900 dark:text-white truncate">
                      {note.title}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 flex-shrink-0">
                      {note.subject}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2">
                    {note.content}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 2. CENTER: NOTES EDITOR */}
      <div className="flex-1 flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 overflow-hidden">
        {selectedNote ? (
          <>
            {/* Editor Toolbar */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/30 flex flex-wrap items-center justify-between gap-3">
              <div className="flex-1 min-w-[240px]">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Note Title..."
                  className="w-full text-base font-bold bg-transparent border-b border-transparent hover:border-gray-300 focus:border-purple-500 text-gray-900 dark:text-white focus:outline-none px-1"
                />
                <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-500 dark:text-gray-400 px-1">
                  <span>Subject:</span>
                  <select
                    value={editSubject}
                    onChange={(e) => setEditSubject(e.target.value)}
                    className="bg-transparent text-purple-700 dark:text-purple-300 font-semibold focus:outline-none"
                  >
                    <option value="Maulik Siddhanta">Maulik Siddhanta</option>
                    <option value="Rachana Sharira">Rachana Sharira</option>
                    <option value="Kriya Sharira">Kriya Sharira</option>
                    <option value="Dravyaguna">Dravyaguna</option>
                    <option value="Rasashastra">Rasashastra</option>
                    <option value="Roganidana">Roganidana</option>
                    <option value="Kayachikitsa">Kayachikitsa</option>
                    <option value="Panchakarma">Panchakarma</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <VoiceReaderControls textToRead={editContent} />

                <button
                  onClick={handleViewVersions}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                  title="View Version History"
                >
                  <History className="w-3.5 h-3.5" />
                  <span>Versions</span>
                </button>

                <button
                  onClick={handleSaveNote}
                  disabled={isSaving}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition shadow shadow-emerald-600/20"
                >
                  {saveSuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Saved!</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>{isSaving ? "Saving..." : "Save"}</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleDeleteNote(selectedNote.id)}
                  className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                  title="Delete Note"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Note Textarea Workspace */}
            <div className="flex-1 p-5 overflow-y-auto">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="Type or paste your study notes, shlokas, and clinical case observations..."
                className="w-full h-full min-h-[380px] bg-transparent resize-none focus:outline-none text-xs sm:text-sm text-gray-800 dark:text-gray-100 font-mono leading-relaxed"
              />
            </div>

            {/* Bottom AI Trigger Toolbar */}
            <div className="p-3 border-t border-gray-200 dark:border-gray-800 bg-purple-50/50 dark:bg-purple-950/20">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span className="text-xs font-bold text-purple-950 dark:text-purple-200 uppercase tracking-wider">
                  AI Notes Improvement Engine:
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: "🌱 Simplify (Beginner)", type: "SIMPLIFY" },
                  { label: "⚡ Concise Revision", type: "CONCISE_REVISION" },
                  { label: "🎓 BAMS Exam-Ready (10 Marks)", type: "EXAM_READY_ANSWER" },
                  { label: "📊 Comparison Table", type: "COMPARISON_TABLE" },
                  { label: "🗂️ Generate Flashcards", type: "FLASHCARDS" },
                  { label: "✅ Revision Checklist", type: "REVISION_CHECKLIST" },
                  { label: "✨ Grammar & Flow", type: "GRAMMAR_CLARITY" }
                ].map((act, idx) => (
                  <button
                    key={idx}
                    disabled={isTransforming || !editContent.trim()}
                    onClick={() => handleAITransform(act.type)}
                    className="px-2.5 py-1 text-xs rounded-lg font-medium bg-white dark:bg-gray-800 border border-purple-200 dark:border-purple-800/60 hover:bg-purple-100 dark:hover:bg-purple-900/50 text-purple-800 dark:text-purple-300 transition shadow-sm"
                  >
                    {act.label}
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-400">
            <FileText className="w-12 h-12 mb-3 text-gray-300 dark:text-gray-700" />
            <h4 className="text-sm font-bold text-gray-600 dark:text-gray-300">No Note Selected</h4>
            <p className="text-xs max-w-sm mt-1">Select an existing note from the sidebar or click + to create a new revision note.</p>
          </div>
        )}
      </div>

      {/* 3. RIGHT PANEL: AI SUGGESTIONS / DIFF PREVIEW OR VERSION HISTORY */}
      <div className="w-full lg:w-96 bg-gray-50/70 dark:bg-gray-950/50 flex flex-col h-full overflow-hidden">
        {showVersionHistory ? (
          /* VERSION HISTORY INSPECTOR */
          <div className="flex-1 flex flex-col p-4 overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800 mb-3">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-purple-600" />
                <h4 className="text-sm font-bold text-gray-900 dark:text-white">Version History</h4>
              </div>
              <button
                onClick={() => setShowVersionHistory(false)}
                className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                Close
              </button>
            </div>
            <div className="space-y-3">
              {versions.map((ver) => (
                <div
                  key={ver.id}
                  className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs space-y-1.5 shadow-sm"
                >
                  <div className="flex items-center justify-between font-bold text-gray-900 dark:text-white">
                    <span>Version #{ver.version_number}</span>
                    <button
                      onClick={() => handleRestoreVersion(ver.id)}
                      className="px-2 py-0.5 text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-300 rounded font-semibold hover:bg-emerald-100"
                    >
                      Restore
                    </button>
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">{ver.change_summary}</p>
                  <p className="text-[10px] text-gray-400">
                    {new Date(ver.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : transformationResult ? (
          /* AI SUGGESTIONS & DIFF PREVIEW */
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            <div className="p-4 border-b border-purple-200 dark:border-purple-900/50 bg-purple-50/80 dark:bg-purple-950/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span className="text-xs font-bold text-purple-950 dark:text-purple-200">
                  AI Improved Suggestion
                </span>
              </div>
              <button
                onClick={() => setTransformationResult(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
              {/* Diff summary banner */}
              <div className="p-3 bg-white dark:bg-gray-800 border border-purple-200 dark:border-purple-800 rounded-xl shadow-sm">
                <span className="font-bold text-purple-900 dark:text-purple-200 block mb-1">
                  Enhancement Summary:
                </span>
                <p className="text-gray-600 dark:text-gray-300">{transformationResult.diff_summary}</p>
              </div>

              {/* Flashcards rendering if flashcards type */}
              {transformationResult.flashcards && transformationResult.flashcards.length > 0 ? (
                <div className="space-y-3">
                  <span className="font-bold text-gray-900 dark:text-white block">
                    Interactive Flashcards (Click to flip):
                  </span>
                  {transformationResult.flashcards.map((card, cIdx) => {
                    const isFlipped = activeFlippedCard === cIdx;
                    return (
                      <div
                        key={cIdx}
                        onClick={() => setActiveFlippedCard(isFlipped ? null : cIdx)}
                        className={`p-4 rounded-xl border text-xs cursor-pointer transition-all duration-300 shadow-sm ${
                          isFlipped
                            ? "bg-emerald-50 border-emerald-300 dark:bg-emerald-950/50 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100"
                            : "bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700 text-gray-800 dark:text-gray-200"
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] uppercase font-bold text-gray-400 mb-1">
                          <span>Card {cIdx + 1}</span>
                          <span>{isFlipped ? "Answer" : "Question"}</span>
                        </div>
                        <p className="font-semibold">{isFlipped ? card.back : card.front}</p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Improved text preview */
                <div className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm whitespace-pre-line prose dark:prose-invert max-w-none">
                  {transformationResult.improved_content}
                </div>
              )}
            </div>

            {/* Accept / Reject actions */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col gap-2">
              <button
                onClick={handleAcceptAISuggestion}
                className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition shadow"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Accept & Replace Note Content</span>
              </button>

              <button
                onClick={handleSaveAsNewNote}
                className="w-full py-2 px-3 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 dark:bg-purple-950/40 dark:text-purple-300 dark:hover:bg-purple-900/60 font-semibold text-xs border border-purple-200 dark:border-purple-800 transition"
              >
                <span>Save Separately as New Note</span>
              </button>

              <button
                onClick={() => setTransformationResult(null)}
                className="w-full py-1 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                Dismiss Suggestions
              </button>
            </div>
          </div>
        ) : (
          /* EMPTY STATE */
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-gray-400">
            <Sparkles className="w-10 h-10 mb-2 text-purple-300 dark:text-purple-800" />
            <h5 className="text-xs font-bold text-gray-600 dark:text-gray-300">AI Transformation Panel</h5>
            <p className="text-[11px] max-w-xs mt-1 text-gray-400">
              Select an action below your note (e.g. "BAMS Exam-Ready", "Simplify", or "Flashcards") to preview improvements here without altering your original text.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
