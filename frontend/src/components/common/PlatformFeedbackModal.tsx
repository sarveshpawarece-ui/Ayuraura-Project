"use client";

import React, { useState, useEffect } from "react";
import {
  MessageSquarePlus,
  Bug,
  Lightbulb,
  BookOpen,
  Zap,
  X,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Send,
  Loader2
} from "lucide-react";
import { api } from "@/lib/api";

interface PlatformFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: "BUG_REPORT" | "FEATURE_SUGGESTION" | "RESOURCE_FEEDBACK" | "USABILITY_ISSUE";
  defaultCategory?: string;
}

export function PlatformFeedbackModal({
  isOpen,
  onClose,
  defaultType = "BUG_REPORT",
  defaultCategory = "GENERAL",
}: PlatformFeedbackModalProps) {
  const [feedbackType, setFeedbackType] = useState<string>(defaultType);
  const [category, setCategory] = useState<string>(defaultCategory);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [pageUrl, setPageUrl] = useState("");
  
  const [submitting, setSubmitting] = useState(false);
  const [successTicket, setSuccessTicket] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setPageUrl(window.location.pathname);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError("Please provide both a title and description.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const deviceInfo = typeof navigator !== "undefined"
        ? `${navigator.userAgent.slice(0, 80)} | ${window.innerWidth}x${window.innerHeight}`
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

      setSuccessTicket(res.data.id || "RECEIVED");
    } catch (err: any) {
      console.error("Failed to submit platform feedback:", err);
      const msg = err.response?.data?.detail || "Could not submit feedback. Please check your network and try again.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setTitle("");
    setDescription("");
    setSuccessTicket(null);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <MessageSquarePlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-slate-100">Platform Feedback & Issue Reporter</h3>
              <p className="text-xs text-slate-400">Help us improve the Aayuraura academic & clinical platform</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {successTicket ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-semibold text-slate-100">Feedback Submitted Successfully</h4>
            <p className="text-sm text-slate-300 max-w-md mx-auto">
              Thank you for helping enhance Aayuraura. Your report has been logged under ticket reference:
            </p>
            <div className="inline-block px-4 py-2 bg-slate-800/80 border border-slate-700 rounded-lg text-emerald-400 font-mono text-xs font-semibold">
              #{successTicket.slice(0, 8).toUpperCase()}
            </div>
            <div className="pt-4">
              <button
                onClick={handleReset}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-medium transition shadow-lg shadow-emerald-900/30"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Feedback Type Selection */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">Report Type</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: "BUG_REPORT", label: "Bug Report", icon: Bug, color: "text-rose-400" },
                  { id: "FEATURE_SUGGESTION", label: "Idea / Feature", icon: Lightbulb, color: "text-amber-400" },
                  { id: "RESOURCE_FEEDBACK", label: "Learning Content", icon: BookOpen, color: "text-sky-400" },
                  { id: "USABILITY_ISSUE", label: "Usability", icon: Zap, color: "text-emerald-400" },
                ].map((type) => {
                  const Icon = type.icon;
                  const isSelected = feedbackType === type.id;
                  return (
                    <button
                      type="button"
                      key={type.id}
                      onClick={() => setFeedbackType(type.id)}
                      className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border text-xs font-medium transition ${
                        isSelected
                          ? "bg-emerald-500/15 border-emerald-500/50 text-white shadow-sm"
                          : "bg-slate-800/40 border-slate-700/60 text-slate-400 hover:border-slate-600 hover:text-slate-200"
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isSelected ? "text-emerald-400" : type.color}`} />
                      <span>{type.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Category & Priority Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Module / Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition"
                >
                  <option value="GENERAL">General Platform</option>
                  <option value="3D_ANATOMY">3D Anatomy Viewer</option>
                  <option value="TOPIC_QUIZ">Topic Quizzes & Mastery</option>
                  <option value="SYLLABUS">BAMS Syllabus & Curriculum</option>
                  <option value="AUTH_LOGIN">Authentication & Profile</option>
                  <option value="COMMUNITY">Community & Discussions</option>
                  <option value="PERFORMANCE">Performance & Loading</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Perceived Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition"
                >
                  <option value="LOW">Low — Cosmetic or Minor</option>
                  <option value="MEDIUM">Medium — Normal Operation</option>
                  <option value="HIGH">High — Impairs Workflow</option>
                  <option value="CRITICAL">Critical — Blocking Usage</option>
                </select>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Summary / Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 3D canvas does not reload when switching between Doshas"
                maxLength={200}
                required
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Detailed Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please describe what happened, what you expected, and any steps to reproduce..."
                rows={4}
                required
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition resize-none"
              />
            </div>

            {/* Privacy Assurance Banner */}
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/60 text-[11px] text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Protected Privacy: Passwords, private notes, and clinical records are never recorded in feedback reports.
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-medium transition shadow-lg shadow-emerald-900/30"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Report</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
