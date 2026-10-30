"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Bot,
  Send,
  Sparkles,
  BookOpen,
  MessageSquare,
  Plus,
  Trash2,
  ChevronRight,
  ShieldAlert,
  GraduationCap,
  FileText,
  HelpCircle,
  RotateCcw,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  Volume2
} from "lucide-react";
import { api } from "@/lib/api";
import { VoiceInputButton, VoiceReaderControls } from "./VoiceAssistantControls";

interface ChatSession {
  id: string;
  title: string;
  user_role: string;
  current_subject?: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  message_count?: number;
}

interface ChatMessage {
  id?: string;
  role: "user" | "assistant";
  content: string;
  suggested_followups?: string[];
  classical_citations?: string[];
  created_at?: string;
}

interface NoteSnippet {
  id: string;
  title: string;
  subject: string;
  content: string;
}

export default function MasterChatbot() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputQuery, setInputQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState("Maulik Siddhanta");
  const [availableNotes, setAvailableNotes] = useState<NoteSnippet[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string>("");
  const [showNotesPicker, setShowNotesPicker] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Load chat sessions & saved notes on mount
  useEffect(() => {
    fetchSessions();
    fetchNotes();
  }, []);

  const fetchSessions = async () => {
    try {
      const res = await api.get("/ai-ecosystem/sessions");
      if (res.data && Array.isArray(res.data)) {
        setSessions(res.data);
        if (res.data.length > 0 && !activeSessionId) {
          selectSession(res.data[0].id);
        } else if (res.data.length === 0) {
          // Initialize a welcome placeholder
          setMessages([
            {
              role: "assistant",
              content:
                "**Namaste! Welcome to Aayuraura Master AI Assistant.**\n\n" +
                "I am calibrated to support your BAMS academic mastery, clinical curriculum, and examination preparations under NCISM guidelines.\n\n" +
                "You can ask me about classical Samhitas, pharmacological properties of Dravyaguna herbs, Marma points, or request exam-ready answer breakdowns.",
              suggested_followups: [
                "Explain Tridosha in simple language with daily life examples.",
                "How should I structure a 10-mark answer on Panchakarma in BAMS exams?",
                "What are the 107 Marma points and their prognostic categories?",
                "Generate 5 practice MCQs on Dravyaguna Rasapanchaka."
              ],
              classical_citations: ["Charaka Samhita Sutrasthana", "Sushruta Samhita Sharirasthana"]
            }
          ]);
        }
      }
    } catch (err) {
      console.error("Failed to fetch AI chat sessions:", err);
    }
  };

  const fetchNotes = async () => {
    try {
      const res = await api.get("/ai-ecosystem/notes");
      if (res.data && Array.isArray(res.data)) {
        setAvailableNotes(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch notes for context:", err);
    }
  };

  const selectSession = async (sessionId: string) => {
    setActiveSessionId(sessionId);
    try {
      const res = await api.get(`/ai-ecosystem/sessions/${sessionId}/messages`);
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        setMessages(
          res.data.map((m: any) => ({
            id: m.id,
            role: m.role,
            content: m.content,
            suggested_followups: m.suggested_followups || [],
            classical_citations: m.classical_citations || [],
            created_at: m.created_at
          }))
        );
      } else {
        // Empty session
        setMessages([
          {
            role: "assistant",
            content:
              "**Session Started.** How can I assist your Ayurvedic learning journey today?",
            suggested_followups: [
              "Explain the Shad-Kriya Kala with a clinical flow chart.",
              "What is the difference between Vipaka and Rasa?",
              "Summarize the contraindications of Vamana Karma."
            ]
          }
        ]);
      }
    } catch (err) {
      console.error("Failed to load session messages:", err);
    }
  };

  const handleCreateNewSession = async () => {
    try {
      const res = await api.post("/ai-ecosystem/sessions", {
        title: "New BAMS Consultation",
        current_subject: selectedSubject
      });
      if (res.data) {
        setSessions([res.data, ...sessions]);
        setActiveSessionId(res.data.id);
        setMessages([
          {
            role: "assistant",
            content:
              `**New Session Initialized for ${selectedSubject}.**\n\n` +
              "Ask any curriculum question, request Shloka explanations, or select a saved note from the context toolbar below.",
            suggested_followups: [
              `What are the high-yield topics in ${selectedSubject}?`,
              "Generate a 5-question diagnostic quiz.",
              "Show classical treatise citations for this subject."
            ]
          }
        ]);
      }
    } catch (err) {
      console.error("Failed to create new session:", err);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputQuery).trim();
    if (!query || isTyping) return;

    // Attach note context if selected
    let noteContext: string | undefined = undefined;
    if (selectedNoteId) {
      const n = availableNotes.find((item) => item.id === selectedNoteId);
      if (n) {
        noteContext = `Note Title: "${n.title}" | Subject: ${n.subject}\nContent: ${n.content}`;
      }
    }

    const optimisticMsg: ChatMessage = {
      role: "user",
      content: query
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setInputQuery("");
    setIsTyping(true);

    try {
      const res = await api.post("/ai-ecosystem/chat", {
        session_id: activeSessionId || undefined,
        message: query,
        subject_context: selectedSubject,
        note_context: noteContext
      });

      if (res.data) {
        const assistantMsg: ChatMessage = {
          role: "assistant",
          content: res.data.reply,
          suggested_followups: res.data.suggested_followups || [],
          classical_citations: res.data.classical_citations || []
        };
        setMessages((prev) => [...prev, assistantMsg]);

        // If a new session was created implicitly, update state
        if (!activeSessionId && res.data.session_id) {
          setActiveSessionId(res.data.session_id);
          fetchSessions();
        }
      }
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.detail || "An error occurred while contacting the AI service. Please try again.";
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `⚠️ **Notice:** ${errorMsg}`,
          suggested_followups: ["Try asking another question", "Refresh conversation"]
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-[780px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl overflow-hidden">
      {/* LEFT: SESSIONS SIDEBAR */}
      <div className="w-full lg:w-72 max-h-52 lg:max-h-none bg-gray-50/80 dark:bg-gray-950/60 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-800 flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Conversations</h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">History & Consultations</p>
            </div>
          </div>
          <button
            onClick={handleCreateNewSession}
            title="Start New Conversation"
            className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition flex items-center justify-center shadow"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Sessions list */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
          {sessions.length === 0 ? (
            <div className="p-4 text-center text-xs text-gray-400">
              No previous chats found. Click + to begin!
            </div>
          ) : (
            sessions.map((sess) => {
              const isActive = sess.id === activeSessionId;
              return (
                <button
                  key={sess.id}
                  onClick={() => selectSession(sess.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs transition flex items-center justify-between group ${
                    isActive
                      ? "bg-emerald-600 text-white font-semibold shadow-md shadow-emerald-600/20"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/60"
                  }`}
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <MessageSquare className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? "text-white" : "text-gray-400"}`} />
                    <span className="truncate">{sess.title}</span>
                  </div>
                  <ChevronRight className={`w-3 h-3 opacity-0 group-hover:opacity-100 transition ${isActive ? "text-white opacity-100" : "text-gray-400"}`} />
                </button>
              );
            })
          )}
        </div>

        {/* Current Subject Selector */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/40">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
            Active Subject Focus
          </label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full text-xs py-1.5 px-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="Maulik Siddhanta">Maulik Siddhanta</option>
            <option value="Rachana Sharira">Rachana Sharira (Anatomy)</option>
            <option value="Kriya Sharira">Kriya Sharira (Physiology)</option>
            <option value="Dravyaguna">Dravyaguna (Pharmacology)</option>
            <option value="Rasashastra">Rasashastra & Bhaishajya</option>
            <option value="Roganidana">Roganidana (Pathology)</option>
            <option value="Kayachikitsa">Kayachikitsa (Internal Medicine)</option>
            <option value="Panchakarma">Panchakarma (Detoxification)</option>
            <option value="Shalya Tantra">Shalya Tantra (Surgery)</option>
            <option value="Shalakya Tantra">Shalakya Tantra (ENT & Eye)</option>
          </select>
        </div>
      </div>

      {/* RIGHT: CHAT WORKSPACE */}
      <div className="flex-1 flex flex-col h-full bg-white dark:bg-gray-900 overflow-hidden">
        {/* Chat Header */}
        <div className="px-5 py-3.5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-gray-900/90 backdrop-blur z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-gray-900 dark:text-white">Aayuraura Master AI Assistant</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  NCISM Curriculum Verified
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Multi-Turn Classical Ayurvedic Reasoning & Examination Coach
              </p>
            </div>
          </div>

          {/* Note Context Attachment Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowNotesPicker(!showNotesPicker)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                selectedNoteId
                  ? "bg-purple-50 text-purple-700 border-purple-300 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800"
                  : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-purple-600" />
              <span>{selectedNoteId ? "Note Attached" : "Attach Note Context"}</span>
              <ChevronDown className="w-3 h-3 ml-0.5" />
            </button>
          </div>
        </div>

        {/* Note Attachment Dropdown Panel */}
        {showNotesPicker && (
          <div className="px-5 py-3 bg-purple-50/70 dark:bg-purple-950/30 border-b border-purple-200 dark:border-purple-900/50 flex flex-wrap items-center justify-between gap-3 text-xs animate-fadeIn">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-600" />
              <span className="font-semibold text-purple-900 dark:text-purple-200">
                Ask questions about your saved study notes:
              </span>
            </div>
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <select
                value={selectedNoteId}
                onChange={(e) => setSelectedNoteId(e.target.value)}
                className="flex-1 py-1 px-2.5 bg-white dark:bg-gray-800 border border-purple-200 dark:border-purple-800 rounded-lg text-gray-800 dark:text-gray-200 focus:outline-none"
              >
                <option value="">-- No note selected (General consultation) --</option>
                {availableNotes.map((note) => (
                  <option key={note.id} value={note.id}>
                    [{note.subject}] {note.title}
                  </option>
                ))}
              </select>
              {selectedNoteId && (
                <button
                  onClick={() => setSelectedNoteId("")}
                  className="px-2 py-1 text-xs text-purple-700 dark:text-purple-300 hover:underline font-medium"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        )}

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {messages.map((msg, index) => {
            const isUser = msg.role === "user";
            return (
              <div key={index} className={`flex gap-3.5 ${isUser ? "justify-end" : "justify-start"}`}>
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-emerald-600/20 mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className={`max-w-[85%] lg:max-w-[75%] space-y-2.5`}>
                  <div
                    className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm ${
                      isUser
                        ? "bg-emerald-600 text-white rounded-tr-none"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-tl-none border border-gray-200/80 dark:border-gray-700"
                    }`}
                  >
                    <div className="whitespace-pre-line prose dark:prose-invert max-w-none">
                      {msg.content}
                    </div>

                    {/* Speech / Voice reader controls for Assistant responses */}
                    {!isUser && (
                      <div className="mt-3 pt-2.5 border-t border-gray-200 dark:border-gray-700/60 flex items-center justify-between">
                        <VoiceReaderControls textToRead={msg.content} />
                        <span className="text-[10px] text-gray-400">AyurSetu Knowledge Engine</span>
                      </div>
                    )}
                  </div>

                  {/* Classical Citations */}
                  {!isUser && msg.classical_citations && msg.classical_citations.length > 0 && (
                    <div className="p-3 bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 rounded-xl text-xs space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-amber-900 dark:text-amber-200 text-[11px] uppercase tracking-wider">
                        <BookOpen className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                        <span>Classical Citations & Treatises:</span>
                      </div>
                      <ul className="list-disc list-inside space-y-0.5 text-amber-800 dark:text-amber-300 text-[11px]">
                        {msg.classical_citations.map((cite, i) => (
                          <li key={i}>{cite}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Contextual Suggested Next Questions (1-Click send) */}
                  {!isUser && msg.suggested_followups && msg.suggested_followups.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-emerald-500" />
                        <span>Suggested Next Questions:</span>
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.suggested_followups.map((suggestion, sIdx) => (
                          <button
                            key={sIdx}
                            onClick={() => handleSendMessage(suggestion)}
                            className="px-3 py-1.5 rounded-xl text-xs bg-emerald-50 text-emerald-700 border border-emerald-200/80 hover:bg-emerald-100 hover:border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 dark:hover:bg-emerald-900/60 transition shadow-sm text-left"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 flex items-center justify-center flex-shrink-0 mt-1">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isTyping && (
            <div className="flex gap-3.5 justify-start">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 animate-pulse">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-4 rounded-2xl rounded-tl-none bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
                <span className="text-gray-500 dark:text-gray-400">
                  Synthesizing classical Samhita context & curriculum guidelines...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar & Controls */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/30">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            {/* Voice Input Button */}
            <VoiceInputButton
              onTranscript={(spokenText) => {
                setInputQuery(spokenText);
                handleSendMessage(spokenText);
              }}
              disabled={isTyping}
            />

            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder={`Ask any BAMS educational question in ${selectedSubject}...`}
              disabled={isTyping}
              className="flex-1 py-3 px-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-inner"
            />

            <button
              type="submit"
              disabled={!inputQuery.trim() || isTyping}
              className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-xs sm:text-sm flex items-center gap-1.5 transition shadow-lg shadow-emerald-600/20"
            >
              <span>Ask</span>
              <Send className="w-4 h-4" />
            </button>
          </form>

          {/* Safety Disclaimer Banner */}
          <div className="mt-2.5 flex items-center justify-center gap-1.5 text-[11px] text-gray-400 dark:text-gray-500 text-center">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
            <span>
              Academic educational guidance system under NCISM syllabus. Not a substitute for licensed clinical diagnosis.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
