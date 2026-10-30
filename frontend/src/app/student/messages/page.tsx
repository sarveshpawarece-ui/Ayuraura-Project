"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import {
  MessageSquare,
  Search,
  Send,
  Stethoscope,
  Clock,
  CheckCheck,
  AlertCircle,
  RefreshCw,
  ChevronLeft
} from "lucide-react";
import { api } from "@/lib/api";

interface ConversationSummary {
  other_user_id: string;
  other_user_name: string;
  other_user_role: string;
  other_user_avatar?: string;
  other_user_subtitle?: string;
  last_message: string;
  last_message_at: string;
  unread_count: number;
}

interface MessageItem {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export default function StudentMessagesPage() {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [newContent, setNewContent] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingChat, setLoadingChat] = useState(false);
  const [sending, setSending] = useState(false);
  const [myUserId, setMyUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const loadConversations = async () => {
    try {
      setError(null);
      const meRes = await api.get("/auth/me");
      setMyUserId(meRes.data.id);

      const res = await api.get("/doctors/messages/conversations");
      setConversations(res.data);

      if (res.data.length > 0 && !selectedUserId) {
        setSelectedUserId(res.data[0].other_user_id);
      }
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 401) {
        window.location.href = "/login";
        return;
      }
      setError(err.response?.data?.detail || "Unable to load conversations.");
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (partnerId: string) => {
    try {
      setLoadingChat(true);
      const res = await api.get(`/doctors/messages/conversation/${partnerId}`);
      setMessages(res.data);
      setConversations((prev) =>
        prev.map((c) => (c.other_user_id === partnerId ? { ...c, unread_count: 0 } : c))
      );
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoadingChat(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      loadMessages(selectedUserId);
    }
  }, [selectedUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim() || !selectedUserId) return;

    setSending(true);
    try {
      const res = await api.post("/doctors/messages", {
        recipient_id: selectedUserId,
        content: newContent.trim()
      });

      setMessages((prev) => [...prev, res.data]);
      setNewContent("");

      setConversations((prev) =>
        prev.map((c) =>
          c.other_user_id === selectedUserId
            ? { ...c, last_message: res.data.content, last_message_at: res.data.created_at }
            : c
        )
      );
    } catch (err: any) {
      console.error(err);
      alert("Failed to send message: " + (err.response?.data?.detail || "Network error"));
    } finally {
      setSending(false);
    }
  };

  const selectedConv = conversations.find((c) => c.other_user_id === selectedUserId);

  const filteredConversations = conversations.filter((c) =>
    c.other_user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.other_user_subtitle && c.other_user_subtitle.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#fcfaf4] dark:bg-[#07160e] text-[#1a3827] dark:text-[#d1e2d7]">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
        {/* Breadcrumb */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-[#5a7a67] dark:text-emerald-400">
            <Link href="/student/dashboard" className="hover:underline">Student Dashboard</Link>
            <span>/</span>
            <span className="font-bold text-[#143d26] dark:text-white">Doctor Communication</span>
          </div>

          <button
            onClick={() => loadConversations()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#c8d8c8] text-xs font-semibold text-[#1a5b35] hover:bg-[#eef7f0] cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Messaging 2-Column Pane */}
        <div className="bg-white dark:bg-[#0c2419] rounded-3xl border border-[#e5edd9] dark:border-white/10 shadow-md overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[580px] max-h-[750px]">
          
          {/* Left Column: Conversations Sidebar */}
          <div className={`md:col-span-4 border-r border-[#edf3eb] dark:border-white/10 flex flex-col ${
            selectedUserId ? "hidden md:flex" : "flex"
          }`}>
            <div className="p-4 border-b border-[#edf3eb] dark:border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold font-serif-heading text-[#143d26] dark:text-white flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[#1a5b35]" />
                  <span>Doctor Chats</span>
                </h2>
                <span className="text-xs text-[#6e8e7c] dark:text-emerald-400 font-semibold">
                  {conversations.length} Active
                </span>
              </div>

              <div className="relative">
                <Search className="w-4 h-4 text-[#759381] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search doctors..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#f8faf6] dark:bg-white/5 border border-[#cadacb] dark:border-white/10 text-xs text-[#143d26] dark:text-white placeholder-[#8ca697] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-[#edf3eb] dark:divide-white/5">
              {loading ? (
                <div className="p-4 space-y-3 animate-pulse">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-14 bg-slate-100 dark:bg-white/5 rounded-xl" />
                  ))}
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#718f7d] space-y-1">
                  <MessageSquare className="w-8 h-8 mx-auto text-[#a0beae]" />
                  <p className="font-semibold">No active doctor conversations</p>
                  <p className="text-[11px]">Messages sent to doctors or received about internships will show here.</p>
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const isSelected = conv.other_user_id === selectedUserId;
                  return (
                    <button
                      key={conv.other_user_id}
                      onClick={() => setSelectedUserId(conv.other_user_id)}
                      className={`w-full p-4 text-left flex items-start gap-3 transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-[#eef7f0] dark:bg-emerald-950/70 border-l-4 border-l-[#1a5b35]"
                          : "hover:bg-[#f9fbf8] dark:hover:bg-white/5"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-[#17452b] text-amber-200 font-bold flex items-center justify-center text-sm shrink-0">
                        {conv.other_user_name.charAt(0)}
                      </div>

                      <div className="flex-1 min-w-0 space-y-0.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#143d26] dark:text-white truncate">
                            {conv.other_user_name}
                          </span>
                          <span className="text-[10px] text-[#7a9987] shrink-0">
                            {new Date(conv.last_message_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>

                        {conv.other_user_subtitle && (
                          <p className="text-[10px] text-[#1a5b35] dark:text-emerald-300 font-semibold truncate">
                            {conv.other_user_subtitle}
                          </p>
                        )}

                        <p className="text-xs text-[#527260] dark:text-emerald-200/70 truncate">
                          {conv.last_message}
                        </p>
                      </div>

                      {conv.unread_count > 0 && (
                        <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                          {conv.unread_count}
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Chat Pane */}
          <div className={`md:col-span-8 flex flex-col justify-between ${
            !selectedUserId ? "hidden md:flex" : "flex"
          }`}>
            {selectedConv ? (
              <>
                <div className="p-4 border-b border-[#edf3eb] dark:border-white/10 flex items-center justify-between gap-3 bg-[#fafcf9] dark:bg-white/5">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSelectedUserId(null)}
                      className="md:hidden p-1 rounded-lg text-slate-500 hover:bg-slate-100"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    <div className="w-10 h-10 rounded-full bg-[#17452b] text-amber-200 font-bold flex items-center justify-center text-sm shrink-0">
                      {selectedConv.other_user_name.charAt(0)}
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-[#143d26] dark:text-white">
                        {selectedConv.other_user_name}
                      </h3>
                      <p className="text-[11px] text-[#567563] dark:text-emerald-300">
                        {selectedConv.other_user_subtitle || "Doctor"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-3 bg-[#fdfdfb] dark:bg-[#07160e]/50 max-h-[500px]">
                  {loadingChat ? (
                    <div className="text-center py-10 text-xs text-[#718f7d]">Loading messages...</div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-12 text-xs text-[#718f7d] space-y-1">
                      <p className="font-semibold">No messages yet.</p>
                      <p className="text-[11px]">Type below to send a message to the doctor.</p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMe = msg.sender_id === myUserId;
                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                        >
                          <div
                            className={`max-w-[80%] sm:max-w-[70%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                              isMe
                                ? "bg-[#174d2d] text-white rounded-br-xs"
                                : "bg-white dark:bg-[#0c2419] border border-[#e2ece0] dark:border-white/10 text-[#143d26] dark:text-emerald-100 rounded-bl-xs"
                            }`}
                          >
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                            <div
                              className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${
                                isMe ? "text-emerald-200/70" : "text-[#718f7d]"
                              }`}
                            >
                              <span>
                                {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </span>
                              {isMe && <CheckCheck className="w-3 h-3" />}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <form
                  onSubmit={handleSendMessage}
                  className="p-3 sm:p-4 border-t border-[#edf3eb] dark:border-white/10 bg-white dark:bg-[#0c2419] flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    placeholder="Type your message to the doctor..."
                    className="flex-1 px-4 py-2.5 rounded-2xl border border-[#cadacb] dark:border-white/15 bg-[#f8faf6] dark:bg-white/5 text-xs sm:text-sm text-[#143d26] dark:text-white placeholder-[#8ca697] focus:outline-none focus:border-[#1a5b35]"
                  />
                  <button
                    type="submit"
                    disabled={sending || !newContent.trim()}
                    className="p-2.5 sm:px-4 sm:py-2.5 rounded-2xl bg-[#1a5b35] hover:bg-[#124226] text-amber-100 font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    <Send className="w-4 h-4" />
                    <span className="hidden sm:inline">{sending ? "Sending..." : "Send"}</span>
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-[#718f7d] space-y-2">
                <MessageSquare className="w-12 h-12 text-[#9bbdad]" />
                <h3 className="font-bold text-base font-serif-heading text-[#143d26] dark:text-white">
                  Select a Conversation
                </h3>
                <p className="text-xs max-w-xs">
                  Choose a doctor from the list on the left to start chatting.
                </p>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
