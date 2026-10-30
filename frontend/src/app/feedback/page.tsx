"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  MessageSquarePlus,
  Bug,
  Lightbulb,
  BookOpen,
  Zap,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Send,
  Loader2,
  Filter,
  RefreshCw,
  AlertCircle,
  ChevronRight,
  ExternalLink,
  MessageCircle,
  HelpCircle,
  Search,
  Check,
  RotateCcw
} from "lucide-react";
import { api } from "@/lib/api";
import {
  DashboardLayout,
  DashboardHeader,
  DashboardCard,
  DashboardStatsCard,
  DashboardLoadingSkeleton
} from "@/components/dashboard";

interface UserFeedbackItem {
  id: string;
  feedback_type: string;
  category: string;
  title: string;
  description: string;
  page_url?: string;
  device_info?: string;
  priority: string;
  status: string;
  admin_notes?: string;
  resolved_at?: string;
  created_at: string;
  updated_at?: string;
}

export default function UserFeedbackPage() {
  const [activeTab, setActiveTab] = useState<"SUBMIT" | "MY_TICKETS">("SUBMIT");
  
  // Submission Form State
  const [feedbackType, setFeedbackType] = useState<string>("BUG_REPORT");
  const [category, setCategory] = useState<string>("GENERAL");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [pageUrl, setPageUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Tickets List State
  const [tickets, setTickets] = useState<UserFeedbackItem[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setPageUrl(window.location.pathname);
    }
    loadMyTickets();
  }, []);

  const loadMyTickets = async () => {
    try {
      setLoadingTickets(true);
      const res = await api.get("/monitoring/feedback/my");
      if (Array.isArray(res.data)) {
        setTickets(res.data);
      }
    } catch (err: any) {
      console.warn("Could not load user feedback tickets:", err);
    } finally {
      setLoadingTickets(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setSubmitError("Please provide both a summary title and detailed description.");
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError(null);
      const deviceInfo = typeof navigator !== "undefined"
        ? `${navigator.userAgent.slice(0, 70)} | ${window.innerWidth}x${window.innerHeight}`
        : "Web Browser";

      const res = await api.post("/monitoring/feedback", {
        feedback_type: feedbackType,
        category,
        title: title.trim(),
        description: description.trim(),
        page_url: pageUrl,
        device_info: deviceInfo,
        priority,
      });

      const ticketId = res.data?.id || "LOGGED";
      setSubmitSuccess(ticketId);
      setTitle("");
      setDescription("");
      loadMyTickets();
    } catch (err: any) {
      setSubmitError(err.response?.data?.detail || "Could not submit feedback. Please check your connection.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredTickets = tickets.filter((t) => {
    const matchesStatus = statusFilter === "ALL" || t.status === statusFilter;
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "OPEN":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">SUBMITTED</span>;
      case "UNDER_REVIEW":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">UNDER REVIEW</span>;
      case "IN_PROGRESS":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/15 text-purple-400 border border-purple-500/30">IN PROGRESS</span>;
      case "RESOLVED":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">COMPLETED</span>;
      case "CLOSED":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-500/15 text-slate-400 border border-slate-500/30">DECLINED</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-500/15 text-slate-400">{status}</span>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <DashboardHeader
          badgeText="Student & Faculty Voice"
          badgeIcon={<MessageSquarePlus className="w-3.5 h-3.5" />}
          badgeVariant="emerald"
          title="Feedback & Issue Tracking Portal"
          subtitle="Submit bug reports, educational resource feedback, feature suggestions, and track real-time administrative review status."
          actions={[
            {
              label: "Refresh Status",
              onClick: loadMyTickets,
              icon: RefreshCw,
              variant: "outline",
            },
          ]}
        />

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <DashboardStatsCard
            title="Total Submitted"
            value={tickets.length}
            subtitle="Your logged feedback reports"
            icon={MessageCircle}
          />
          <DashboardStatsCard
            title="Under Review"
            value={tickets.filter(t => t.status === "UNDER_REVIEW" || t.status === "OPEN").length}
            subtitle="Currently evaluated by admins"
            icon={Clock}
          />
          <DashboardStatsCard
            title="In Progress"
            value={tickets.filter(t => t.status === "IN_PROGRESS").length}
            subtitle="Actively in development"
            icon={Zap}
          />
          <DashboardStatsCard
            title="Completed & Resolved"
            value={tickets.filter(t => t.status === "RESOLVED").length}
            subtitle="Implemented improvements"
            icon={CheckCircle2}
          />
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 gap-2">
          <button
            onClick={() => setActiveTab("SUBMIT")}
            className={`flex items-center gap-2 px-5 py-3 text-xs font-semibold border-b-2 transition -mb-px ${
              activeTab === "SUBMIT"
                ? "border-emerald-500 text-emerald-400 bg-emerald-500/5"
                : "border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700"
            }`}
          >
            <MessageSquarePlus className="w-4 h-4" />
            <span>Submit New Feedback</span>
          </button>

          <button
            onClick={() => setActiveTab("MY_TICKETS")}
            className={`flex items-center gap-2 px-5 py-3 text-xs font-semibold border-b-2 transition -mb-px ${
              activeTab === "MY_TICKETS"
                ? "border-emerald-500 text-emerald-400 bg-emerald-500/5"
                : "border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700"
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>My Submitted Feedback ({tickets.length})</span>
          </button>
        </div>

        {/* TAB 1: SUBMIT NEW FEEDBACK */}
        {activeTab === "SUBMIT" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8">
              <DashboardCard title="Feedback & Bug Reporting Form" icon={MessageSquarePlus}>
                {submitSuccess ? (
                  <div className="py-8 text-center space-y-4">
                    <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h4 className="text-lg font-bold text-slate-100">Feedback Submitted Successfully</h4>
                    <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                      Thank you for contributing to Aayuraura's academic and clinical excellence. Your report has been dispatched to the administration team under reference:
                    </p>
                    <div className="inline-block px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-emerald-400 font-mono text-sm font-bold">
                      #{submitSuccess.slice(0, 8).toUpperCase()}
                    </div>
                    <div className="pt-4 flex items-center justify-center gap-3">
                      <button
                        onClick={() => {
                          setSubmitSuccess(null);
                          setActiveTab("MY_TICKETS");
                        }}
                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition shadow-md"
                      >
                        Track Ticket Status
                      </button>
                      <button
                        onClick={() => setSubmitSuccess(null)}
                        className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
                      >
                        Submit Another Report
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                    {submitError && (
                      <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{submitError}</span>
                      </div>
                    )}

                    {/* Feedback Type Selector */}
                    <div>
                      <label className="block font-semibold text-slate-300 mb-2">Feedback Category</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        {[
                          { id: "BUG_REPORT", label: "Bug Report", icon: Bug, color: "text-rose-400" },
                          { id: "FEATURE_SUGGESTION", label: "Feature Idea", icon: Lightbulb, color: "text-amber-400" },
                          { id: "RESOURCE_FEEDBACK", label: "Learning Content", icon: BookOpen, color: "text-sky-400" },
                          { id: "USABILITY_ISSUE", label: "UI / UX Feedback", icon: Zap, color: "text-emerald-400" },
                        ].map((type) => {
                          const Icon = type.icon;
                          const isSelected = feedbackType === type.id;
                          return (
                            <button
                              type="button"
                              key={type.id}
                              onClick={() => setFeedbackType(type.id)}
                              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-medium transition cursor-pointer ${
                                isSelected
                                  ? "bg-emerald-500/15 border-emerald-500/50 text-white shadow-sm"
                                  : "bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                              }`}
                            >
                              <Icon className={`w-4 h-4 ${isSelected ? "text-emerald-400" : type.color}`} />
                              <span>{type.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Module & Priority Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-300 mb-1.5">Module / Feature</label>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 transition"
                        >
                          <option value="GENERAL">General Platform Experience</option>
                          <option value="3D_ANATOMY">3D Anatomy & Models</option>
                          <option value="LEARNING_HUB">BAMS Learning Hub & Shlokas</option>
                          <option value="FACULTY_MATERIALS">Faculty Materials & Lectures</option>
                          <option value="TOPIC_QUIZ">Topic Quizzes & Flashcards</option>
                          <option value="PORTFOLIO">Portfolio & Credentials</option>
                          <option value="INTERNSHIP">Internships & Rotations</option>
                          <option value="AUTH_LOGIN">Authentication & 2FA OTP</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-300 mb-1.5">Urgency / Priority</label>
                        <select
                          value={priority}
                          onChange={(e) => setPriority(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 transition"
                        >
                          <option value="LOW">Low — Suggestion or minor cosmetic note</option>
                          <option value="MEDIUM">Medium — Normal inquiry or feature enhancement</option>
                          <option value="HIGH">High — Impairs learning or clinical task</option>
                          <option value="CRITICAL">Critical — Blocking workflow or page error</option>
                        </select>
                      </div>
                    </div>

                    {/* Title */}
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1.5">Summary / Title *</label>
                      <input
                        type="text"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Dravyaguna herbarium photos missing in mobile portrait view"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1.5">Detailed Description *</label>
                      <textarea
                        required
                        rows={5}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Please describe what you observed, what you expected, or your feature idea..."
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition resize-none leading-relaxed"
                      />
                    </div>

                    {/* Page URL */}
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1.5">Associated Page URL (Optional)</label>
                      <input
                        type="text"
                        value={pageUrl}
                        onChange={(e) => setPageUrl(e.target.value)}
                        placeholder="/student/ecosystem or /faculty/materials"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-300 font-mono text-xs focus:outline-none focus:border-emerald-500 transition"
                      />
                    </div>

                    {/* Privacy Guarantee Note */}
                    <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>
                        Strict Privacy: Your report is confidential and only accessible to authorized administrators. Password credentials and personal health details are never recorded.
                      </span>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2 flex justify-end">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold rounded-xl text-xs transition shadow-lg shadow-emerald-900/30 cursor-pointer"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Dispatching Report...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            <span>Submit Feedback</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </DashboardCard>
            </div>

            {/* Right Side: Process Info Card */}
            <div className="lg:col-span-4 space-y-4">
              <DashboardCard title="Feedback & Triage Process" icon={HelpCircle}>
                <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                    <span className="font-bold text-slate-100 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-emerald-400" /> Administrative Review
                    </span>
                    <p className="text-[11px] text-slate-400">
                      Feedback is evaluated by academic and platform administrators. Recurring items are prioritized for the next release cycle.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                    <span className="font-bold text-slate-100 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-purple-400" /> Continuous Improvement
                    </span>
                    <p className="text-[11px] text-slate-400">
                      Our engineering and NCISM curriculum specialists review pedagogical suggestions to improve the BAMS syllabus compendium.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                    <span className="font-bold text-slate-100 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-sky-400" /> Private Tracking
                    </span>
                    <p className="text-[11px] text-slate-400">
                      You can check administrative status and resolution notes under the "My Submitted Feedback" tab at any time.
                    </p>
                  </div>
                </div>
              </DashboardCard>
            </div>
          </div>
        )}

        {/* TAB 2: MY TICKETS & STATUS */}
        {activeTab === "MY_TICKETS" && (
          <div className="space-y-4">
            {/* Filter and Search Bar */}
            <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search your reports..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-slate-400 font-medium">Status:</span>
                {["ALL", "OPEN", "UNDER_REVIEW", "IN_PROGRESS", "RESOLVED", "CLOSED"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                      statusFilter === st
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {st === "OPEN" ? "SUBMITTED" : st === "RESOLVED" ? "COMPLETED" : st === "CLOSED" ? "DECLINED" : st}
                  </button>
                ))}
              </div>
            </div>

            {/* Tickets List */}
            {loadingTickets ? (
              <DashboardLoadingSkeleton />
            ) : filteredTickets.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-slate-900/30 border border-slate-800 text-xs">
                <MessageSquarePlus className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <h4 className="font-semibold text-slate-300 text-sm">No feedback reports found</h4>
                <p className="text-slate-500 mt-1">Submit a report to help us improve the platform.</p>
                <button
                  onClick={() => setActiveTab("SUBMIT")}
                  className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold inline-flex items-center gap-1.5 transition"
                >
                  <MessageSquarePlus className="w-3.5 h-3.5" />
                  <span>Submit Feedback</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/90 hover:border-slate-700 transition space-y-3 text-xs"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {getStatusBadge(ticket.status)}
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] font-semibold">
                          {ticket.feedback_type.replace("_", " ")}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-800/60 text-slate-400 text-[10px]">
                          {ticket.category}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          ticket.priority === "CRITICAL" ? "bg-rose-900/40 text-rose-300 border border-rose-800" :
                          ticket.priority === "HIGH" ? "bg-amber-900/40 text-amber-300" :
                          "bg-slate-800 text-slate-400"
                        }`}>
                          {ticket.priority} PRIORITY
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                        <span>Ticket #{ticket.id.slice(0, 8).toUpperCase()}</span>
                        <span>•</span>
                        <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-bold text-sm text-slate-100">{ticket.title}</h4>
                      <p className="mt-1 text-slate-300 leading-relaxed">{ticket.description}</p>
                    </div>

                    {/* Admin Response Section */}
                    {ticket.admin_notes && (
                      <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-[11px] text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Administrative Response & Progress Update</span>
                        </div>
                        <p className="text-xs leading-relaxed text-emerald-100/90">{ticket.admin_notes}</p>
                        {ticket.resolved_at && (
                          <div className="text-[10px] text-emerald-400/80 pt-1">
                            Resolved on: {new Date(ticket.resolved_at).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    )}

                    {ticket.page_url && (
                      <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-800/80 flex items-center gap-2">
                        <span>Associated Path:</span>
                        <span className="font-mono text-slate-400">{ticket.page_url}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
