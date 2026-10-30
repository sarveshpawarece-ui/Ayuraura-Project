"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import {
  Bell,
  CheckCircle2,
  Clock,
  Briefcase,
  Award,
  Calendar,
  ShieldCheck,
  AlertCircle,
  Trash2,
  Check,
  ExternalLink,
  Filter,
  Sparkles,
  ArrowRight,
  Settings,
  X,
  MessageSquare,
  Video,
  Users
} from "lucide-react";
import { api } from "@/lib/api";

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
  category: "opportunity" | "assessment" | "session" | "verification" | "general";
  href?: string;
  actionText?: string;
}

export default function NotificationsPage() {
  const [role, setRole] = useState<string>("STUDENT");
  const [activeFilter, setActiveFilter] = useState<string>("ALL");
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Preferences Modal state
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  const [prefLoading, setPrefLoading] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [preferences, setPreferences] = useState({
    faculty_replies: true,
    session_announcements: true,
    session_reminders: true,
    study_group_activity: true,
    discussion_replies: true,
    available_recordings: true
  });
  const [prefSaveSuccess, setPrefSaveSuccess] = useState(false);

  useEffect(() => {
    const storedRole = (
      localStorage.getItem("ayursetu_role") ||
      localStorage.getItem("role") ||
      "STUDENT"
    ).toUpperCase();
    setRole(storedRole);
    fetchNotifications(storedRole);
  }, []);

  const fetchNotifications = async (userRole: string) => {
    setLoading(true);
    try {
      const res = (await api.get("/community/notifications")).data;
      if (res && Array.isArray(res.notifications)) {
        const mapped = res.notifications.map((n: any) => ({
          id: n.id,
          title: n.title,
          description: n.message,
          timestamp: new Date(n.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isRead: n.is_read,
          category: n.notification_type?.toLowerCase().includes("session")
            ? "session"
            : n.notification_type?.toLowerCase().includes("reply") || n.notification_type?.toLowerCase().includes("faculty")
            ? "assessment"
            : "general",
          href: n.action_url || "/community-forum",
          actionText: "View Details"
        }));
        setNotifications(mapped);
      } else {
        loadDefaultNotifications(userRole);
      }
    } catch {
      loadDefaultNotifications(userRole);
    } finally {
      setLoading(false);
    }
  };

  const loadDefaultNotifications = (storedRole: string) => {
    const defaultNotifs: Record<string, NotificationItem[]> = {
      STUDENT: [
        {
          id: "notif-s-1",
          title: "Faculty Answered Your Question",
          description: "Prof. Ramchandra Shastri answered your question on Marma Sharira trauma timing.",
          timestamp: "10 mins ago",
          isRead: false,
          category: "assessment",
          href: "/community-forum?tab=qa",
          actionText: "View Verified Answer"
        },
        {
          id: "notif-s-2",
          title: "Panchakarma Clinical Masterclass RSVP",
          description: "Dr. K. S. Murthy scheduled 'Basti Vidhi & Complication Management' for this Friday at 5:00 PM.",
          timestamp: "1 hour ago",
          isRead: false,
          category: "session",
          href: "/community-forum?tab=sessions",
          actionText: "Session Studio"
        },
        {
          id: "notif-s-3",
          title: "New Member in Charaka Chanting Circle",
          description: "Ananya joined your study circle: 'Charaka Sutrasthana Chanting & Revision Circle'.",
          timestamp: "3 hours ago",
          isRead: true,
          category: "general",
          href: "/community-forum?tab=groups",
          actionText: "Open Study Group"
        }
      ],
      FACULTY: [
        {
          id: "notif-f-1",
          title: "New Student Academic Question",
          description: "A 1st Year scholar submitted an inquiry on Sadyah Pranahara Marma prognosis.",
          timestamp: "15 mins ago",
          isRead: false,
          category: "assessment",
          href: "/community-forum?tab=qa",
          actionText: "Answer Question"
        },
        {
          id: "notif-f-2",
          title: "Lecture Material Published",
          description: "Your 'Kshara Sutra Preparation Protocol' has been shared with 3rd Year BAMS batch.",
          timestamp: "2 hours ago",
          isRead: true,
          category: "general",
          href: "/faculty/materials",
          actionText: "View Materials"
        }
      ],
      INSTITUTION: [
        {
          id: "notif-inst-1",
          title: "Faculty Invitation Accepted",
          description: "Prof. Ramchandra Shastri accepted faculty invitation and unlocked Rachana Sharir portal.",
          timestamp: "30 mins ago",
          isRead: false,
          category: "verification",
          href: "/institution/invitations",
          actionText: "Manage Roster"
        }
      ]
    };
    setNotifications(defaultNotifs[storedRole] || defaultNotifs.STUDENT);
  };

  const markAsRead = async (id: string) => {
    try {
      await api.post(`/community/notifications/${id}/read`, {});
    } catch {
      // Local fallback
    }
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllAsRead = async () => {
    try {
      await api.post("/community/notifications/mark-all-read", {});
    } catch {
      // Local fallback
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const openPreferencesModal = async () => {
    setShowPreferencesModal(true);
    setPrefLoading(true);
    setPrefSaveSuccess(false);
    try {
      const res = (await api.get("/community/notifications/preferences")).data;
      if (res) {
        setPreferences({
          faculty_replies: res.faculty_replies ?? true,
          session_announcements: res.session_announcements ?? true,
          session_reminders: res.session_reminders ?? true,
          study_group_activity: res.study_group_activity ?? true,
          discussion_replies: res.discussion_replies ?? true,
          available_recordings: res.available_recordings ?? true
        });
      }
    } catch {
      // Keep defaults
    } finally {
      setPrefLoading(false);
    }
  };

  const savePreferences = async () => {
    setSavingPrefs(true);
    try {
      await api.put("/community/notifications/preferences", preferences);
      setPrefSaveSuccess(true);
      setTimeout(() => {
        setPrefSaveSuccess(false);
        setShowPreferencesModal(false);
      }, 1500);
    } catch {
      // Continue
    } finally {
      setSavingPrefs(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === "UNREAD") return !n.isRead;
    if (activeFilter === "OPPORTUNITIES") return n.category === "opportunity";
    if (activeFilter === "ASSESSMENTS") return n.category === "assessment";
    if (activeFilter === "SESSIONS") return n.category === "session";
    return true;
  });

  return (
    <div className="min-h-screen bg-[#F7F9F4] dark:bg-[#07160e] text-[#17231C] dark:text-[#d1e2d7] selection:bg-[#2F6B4F] selection:text-white flex flex-col font-sans transition-colors">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#0e301e] via-[#143e28] to-[#0a2316] text-[#F1F6F2] shadow-xl border border-emerald-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-1">
              <Bell className="w-3.5 h-3.5 text-amber-400" />
              <span>{role} Activity & Alert Stream</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif tracking-tight text-white">
              Notifications & Academic Reminders
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
              Real-time updates on faculty answers, masterclass registrations, study group activity, and institutional notices.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={openPreferencesModal}
              className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition flex items-center gap-1.5"
              title="Notification Preferences"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Preferences</span>
            </button>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Mark All Read</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-[#D5DED8] dark:border-white/10 pb-3">
          {[
            { id: "ALL", label: `All (${notifications.length})` },
            { id: "UNREAD", label: `Unread (${unreadCount})` },
            { id: "ASSESSMENTS", label: "Faculty Q&A & Academic" },
            { id: "SESSIONS", label: "Sessions & Reminders" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                activeFilter === tab.id
                  ? "bg-[#0e301e] text-white shadow-xs"
                  : "bg-white dark:bg-[#0c2419] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-[#D5DED8] dark:border-white/10"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500 animate-pulse">Loading notifications...</div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-12 rounded-3xl bg-white dark:bg-[#0c2419] border border-[#D5DED8] dark:border-white/10 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">You are all caught up!</h3>
            <p className="text-xs text-slate-500">No new notifications in this category.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-5 rounded-2xl border transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  notif.isRead
                    ? "bg-white/60 dark:bg-[#0c2419]/60 border-[#D5DED8] dark:border-white/10 opacity-80"
                    : "bg-white dark:bg-[#0c2419] border-[#2F6B4F]/40 shadow-xs"
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0 mt-0.5">
                    {notif.category === "session" ? (
                      <Video className="w-4 h-4" />
                    ) : (
                      <Bell className="w-4 h-4" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{notif.title}</h4>
                      {!notif.isRead && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{notif.description}</p>
                    <div className="text-[11px] text-slate-400">{notif.timestamp}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {notif.href && (
                    <Link
                      href={notif.href}
                      onClick={() => markAsRead(notif.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-[#0e301e] hover:bg-[#15452c] text-white text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <span>{notif.actionText || "View"}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}

                  {!notif.isRead && (
                    <button
                      onClick={() => markAsRead(notif.id)}
                      className="p-1.5 text-slate-400 hover:text-emerald-500 transition"
                      title="Mark as read"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Notification Preferences Modal */}
      {showPreferencesModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0e271c] border border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Settings className="w-5 h-5 text-[#2F6B4F]" /> Notification Preferences
              </h3>
              <button onClick={() => setShowPreferencesModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Configure which academic alerts and community activity triggers you receive to avoid notification fatigue.
            </p>

            {prefLoading ? (
              <div className="p-6 text-center text-xs text-slate-400">Loading settings...</div>
            ) : (
              <div className="space-y-3 text-xs">
                {[
                  { key: "faculty_replies", label: "Faculty Q&A Answers", desc: "Notify when faculty answers your academic inquiry" },
                  { key: "session_announcements", label: "Session Announcements", desc: "Broadcasts for upcoming masterclasses and workshops" },
                  { key: "session_reminders", label: "Session Reminders", desc: "1-hour reminders before registered sessions start" },
                  { key: "study_group_activity", label: "Study Group Activity", desc: "New member joins, notes, and discussion messages" },
                  { key: "discussion_replies", label: "Discussion Thread Replies", desc: "Replies to your academic forum posts" },
                  { key: "available_recordings", label: "Recorded Session Uploads", desc: "Alerts when session recordings become available" }
                ].map((item) => (
                  <div key={item.key} className="flex items-start justify-between gap-3 p-3 rounded-xl bg-[#F7F9F4] dark:bg-white/5 border border-slate-200 dark:border-white/10">
                    <div className="space-y-0.5">
                      <div className="font-bold text-slate-800 dark:text-slate-200">{item.label}</div>
                      <div className="text-[11px] text-slate-500">{item.desc}</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={(preferences as any)[item.key]}
                      onChange={(e) => setPreferences({ ...preferences, [item.key]: e.target.checked })}
                      className="w-4 h-4 rounded text-[#2F6B4F] mt-1 shrink-0"
                    />
                  </div>
                ))}

                {prefSaveSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold text-center">
                    Preferences saved successfully!
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPreferencesModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-300 dark:border-white/10 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={savePreferences}
                    disabled={savingPrefs}
                    className="px-5 py-2 rounded-xl bg-[#0e301e] hover:bg-[#15452c] text-white font-bold"
                  >
                    {savingPrefs ? "Saving..." : "Save Preferences"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
