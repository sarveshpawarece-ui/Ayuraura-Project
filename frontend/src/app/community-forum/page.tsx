"use client";

import React, { useState, useEffect, useMemo } from "react";
import Navbar from "@/components/Navbar";
import {
  MessageSquare,
  Search,
  Sparkles,
  ThumbsUp,
  Bookmark,
  CheckCircle2,
  Flag,
  Send,
  Filter,
  PlusCircle,
  ShieldCheck,
  HelpCircle,
  BookOpen,
  Calendar,
  Users,
  Video,
  Star,
  Lock,
  ArrowRight,
  Clock,
  Layers,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  ExternalLink,
  Tag,
  GraduationCap,
  MessageCircle,
  Check,
  X,
  Share2,
  Award,
  FileText
} from "lucide-react";
import { api } from "@/lib/api";

const apiGet = async <T = any>(url: string, config?: any): Promise<T> => {
  const res = await api.get(url, config);
  return res.data;
};

const apiPost = async <T = any>(url: string, data?: any, config?: any): Promise<T> => {
  const res = await api.post(url, data, config);
  return res.data;
};

// BAMS Subjects Master List for Filtering & Categorization
const BAMS_SUBJECTS = [
  { id: "all", name: "All Subjects" },
  { id: "rachana_sharir", name: "Rachana Sharir (Anatomy)" },
  { id: "kriya_sharir", name: "Kriya Sharir (Physiology)" },
  { id: "dravyaguna", name: "Dravyaguna Vijnana (Pharmacology)" },
  { id: "rasa_shastra", name: "Rasa Shastra & Bhaishajya Kalpana" },
  { id: "charaka_samhita", name: "Charaka Samhita & Brihat-trayi" },
  { id: "kayachikitsa", name: "Kayachikitsa (Internal Medicine)" },
  { id: "shalya_tantra", name: "Shalya Tantra (Surgical Techniques)" },
  { id: "panchakarma", name: "Panchakarma (Detoxification Therapy)" },
  { id: "kaumarbhritya", name: "Kaumarbhritya (Pediatrics)" },
  { id: "prasuti_tantra", name: "Prasuti Tantra & Stri Roga (Obstetrics)" },
  { id: "shalakya_tantra", name: "Shalakya Tantra (ENT & Ophthalmology)" }
];

export default function CommunityCollaborationPage() {
  const [activeTab, setActiveTab] = useState<"discussions" | "qa" | "sessions" | "groups" | "feedback">("discussions");
  const [userRole, setUserRole] = useState<string>("STUDENT");

  // Discussions state
  const [discussions, setDiscussions] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedPostType, setSelectedPostType] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [onlyBookmarked, setOnlyBookmarked] = useState(false);
  const [loadingDiscussions, setLoadingDiscussions] = useState(false);

  // Active Discussion Thread view / replies
  const [activePost, setActivePost] = useState<any | null>(null);
  const [commentInput, setCommentInput] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  // New Discussion Modal
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [postSubject, setPostSubject] = useState("rachana_sharir");
  const [postType, setPostType] = useState("DISCUSSION");
  const [postYear, setPostYear] = useState("1st Year");
  const [postTopic, setPostTopic] = useState("");
  const [postResourceUrl, setPostResourceUrl] = useState("");
  const [postTags, setPostTags] = useState("");
  const [creatingPost, setCreatingPost] = useState(false);

  // Faculty Q&A state
  const [qaQuestions, setQaQuestions] = useState<any[]>([]);
  const [loadingQa, setLoadingQa] = useState(false);
  const [showAskModal, setShowAskModal] = useState(false);
  const [askSubject, setAskSubject] = useState("kayachikitsa");
  const [askTopic, setAskTopic] = useState("");
  const [askYear, setAskYear] = useState("Final Year");
  const [askTitle, setAskTitle] = useState("");
  const [askText, setAskText] = useState("");
  const [askAnonymous, setAskAnonymous] = useState(false);
  const [submittingQuestion, setSubmittingQuestion] = useState(false);
  const [answerInputs, setAnswerInputs] = useState<Record<string, string>>({});
  const [submittingAnswerId, setSubmittingAnswerId] = useState<string | null>(null);

  // Expert Sessions state
  const [sessions, setSessions] = useState<any[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [registeringSessionId, setRegisteringSessionId] = useState<string | null>(null);

  // Study Groups state
  const [studyGroups, setStudyGroups] = useState<any[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [showNewGroupModal, setShowNewGroupModal] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [groupSubject, setGroupSubject] = useState("dravyaguna");
  const [groupYear, setGroupYear] = useState("2nd Year");
  const [groupFocus, setGroupFocus] = useState("");
  const [groupMaxMembers, setGroupMaxMembers] = useState(15);
  const [groupIsPrivate, setGroupIsPrivate] = useState(false);
  const [groupPasscode, setGroupPasscode] = useState("");
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [joinPasscode, setJoinPasscode] = useState("");
  const [activeJoiningGroupId, setActiveJoiningGroupId] = useState<string | null>(null);

  // Educational Feedback state
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackTargetType, setFeedbackTargetType] = useState("EXPERT_SESSION");
  const [feedbackTargetId, setFeedbackTargetId] = useState("masterclass-panchakarma-2026");
  const [feedbackTargetTitle, setFeedbackTargetTitle] = useState("Panchakarma Clinical Protocol Masterclass");
  const [feedbackIsPublic, setFeedbackIsPublic] = useState(true);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackSummary, setFeedbackSummary] = useState<any | null>(null);

  // Report Modal state
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportTargetType, setReportTargetType] = useState("POST");
  const [reportTargetId, setReportTargetId] = useState("");
  const [reportReason, setReportReason] = useState("MEDICAL_MISINFORMATION");
  const [reportDetails, setReportDetails] = useState("");
  const [submittingReport, setSubmittingReport] = useState(false);

  // AI Modal state
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiData, setAiData] = useState<any | null>(null);

  // Alerts
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  useEffect(() => {
    const role = (
      localStorage.getItem("ayursetu_role") ||
      localStorage.getItem("role") ||
      "STUDENT"
    ).toUpperCase();
    setUserRole(role);
    loadCategories();
    loadDiscussions();
  }, []);

  useEffect(() => {
    if (activeTab === "discussions") {
      loadDiscussions();
    } else if (activeTab === "qa") {
      loadFacultyQuestions();
    } else if (activeTab === "sessions") {
      loadExpertSessions();
    } else if (activeTab === "groups") {
      loadStudyGroups();
    } else if (activeTab === "feedback") {
      loadFeedbackSummary();
    }
  }, [activeTab, selectedCategory, selectedSubject, selectedPostType, selectedYear, onlyBookmarked]);

  // ============================================================
  // LOADERS
  // ============================================================
  const loadCategories = async () => {
    try {
      const res = await apiGet("/community/categories");
      if (Array.isArray(res)) setCategories(res);
    } catch {
      // Fallback default categories
      setCategories([
        { id: "cat-1", slug: "bams-subjects", name: "BAMS Subject Discussions" },
        { id: "cat-2", slug: "clinical-cases", name: "Clinical Case Studies" },
        { id: "cat-3", slug: "exam-prep", name: "AIAPGET & NCISM Prep" },
        { id: "cat-4", slug: "study-tips", name: "Study Tips & Revision" },
        { id: "cat-5", slug: "samhita-shloka", name: "Samhita & Shloka Recitation" }
      ]);
    }
  };

  const loadDiscussions = async () => {
    setLoadingDiscussions(true);
    try {
      const params: any = {};
      if (selectedCategory !== "all") params.category_slug = selectedCategory;
      if (selectedSubject !== "all") params.subject_id = selectedSubject;
      if (selectedPostType !== "all") params.post_type = selectedPostType;
      if (selectedYear !== "all") params.academic_year = selectedYear;
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (onlyBookmarked) params.only_bookmarked = true;

      const res = await apiGet("/community/discussions", { params });
      if (Array.isArray(res)) {
        setDiscussions(res);
      } else {
        setDiscussions([]);
      }
    } catch {
      // Fallback starter discussions
      setDiscussions([
        {
          id: "disc-1",
          title: "Differential Diagnosis: Amavata vs. Vatarakta in Clinical Practice",
          content: "In outpatient settings, differentiating between early-stage Amavata and acute Vatarakta is crucial for initial Chikitsa. How do practitioners evaluate Kostha-gata vs Shakha-gata Ama?",
          subject_name: "Kayachikitsa (Internal Medicine)",
          topic: "Amavata Chikitsa",
          academic_year: "Final Year",
          author_name: "Dr. Arvind Vaidya",
          author_role: "FACULTY",
          post_type: "DISCUSSION",
          upvotes_count: 38,
          comments_count: 12,
          bookmarks_count: 14,
          is_bookmarked_by_user: false,
          created_at: new Date(Date.now() - 3600000 * 4).toISOString()
        },
        {
          id: "disc-2",
          title: "High-Yield Shloka Mnemonics for Dravyaguna Gana Memorization",
          content: "Sharing an easy rhythmic mnemonic to retain the 10 drugs of Dashamula (Brihat Panchamula + Laghu Panchamula) with classical botanical family correlations.",
          subject_name: "Dravyaguna Vijnana",
          topic: "Dashamula Posology",
          academic_year: "2nd Year",
          author_name: "Pooja Sharma",
          author_role: "STUDENT",
          post_type: "STUDY_TIP",
          upvotes_count: 52,
          comments_count: 8,
          bookmarks_count: 29,
          is_bookmarked_by_user: true,
          created_at: new Date(Date.now() - 3600000 * 24).toISOString()
        }
      ]);
    } finally {
      setLoadingDiscussions(false);
    }
  };

  const loadFacultyQuestions = async () => {
    setLoadingQa(true);
    try {
      const res = await apiGet("/community/faculty-questions");
      if (Array.isArray(res)) setQaQuestions(res);
    } catch {
      setQaQuestions([
        {
          id: "fq-1",
          title: "Clarification on Marma Prognosis: Sadyah Pranahara Marma Trauma Timing",
          question_text: "According to Sushruta Sharira Sthana, what is the precise physiological mechanism of rapid demise in Sadyah Pranahara Marma trauma, and how does it correlate with modern neurovascular collapse?",
          subject_name: "Rachana Sharir (Anatomy)",
          topic: "Marma Sharira",
          academic_year: "1st Year",
          student_display_name: "BAMS Scholar (1st Year)",
          is_anonymous_to_peers: true,
          status: "ANSWERED",
          faculty_name: "Prof. Ramchandra Shastri, MD (Ayu)",
          faculty_answer: "Sadyah Pranahara Marmas are predominant in Agni Mahabhuta. Injury results in acute severance of vital Pranavaha Srotas or major arterial trunks (e.g., Sringataka, Hridaya), precipitating irreversible hemorrhagic shock and cardiorespiratory arrest within seven days.",
          answered_at: new Date(Date.now() - 3600000 * 12).toISOString(),
          created_at: new Date(Date.now() - 3600000 * 24).toISOString()
        }
      ]);
    } finally {
      setLoadingQa(false);
    }
  };

  const loadExpertSessions = async () => {
    setLoadingSessions(true);
    try {
      const res = await apiGet("/community/sessions/upcoming");
      if (Array.isArray(res)) setSessions(res);
    } catch {
      setSessions([
        {
          id: "sess-1",
          title: "Clinical Panchakarma: Basti Vidhi & Complication Management",
          description: "Comprehensive step-by-step masterclass on classical Niruha and Anuvasana Basti administration, dose titration, and handling of Basti Vyapat.",
          expert_name: "Dr. K. S. Murthy",
          expert_role: "DOCTOR",
          institution: "National Institute of Ayurveda",
          category: "Panchakarma",
          level: "INTERMEDIATE",
          scheduled_date: "2026-11-05",
          start_time: "17:00 IST",
          duration_minutes: 90,
          learning_objectives: [
            "Formulation ratio for Vaitarana Basti",
            "Recognizing signs of Samyak Basti",
            "Emergency protocols in Atiyoga"
          ],
          live_stream_url: "https://meet.google.com/ayu-basti-live",
          recording_available: true,
          recording_url: "https://drive.google.com/ayursetu-basti-recording",
          average_rating: 4.9,
          total_ratings: 42,
          is_registered: false
        }
      ]);
    } finally {
      setLoadingSessions(false);
    }
  };

  const loadStudyGroups = async () => {
    setLoadingGroups(true);
    try {
      const res = await apiGet("/community/study-groups");
      if (Array.isArray(res)) setStudyGroups(res);
    } catch {
      setStudyGroups([
        {
          id: "grp-1",
          name: "Charaka Sutrasthana Chanting & Revision Circle",
          description: "Daily 30-minute collaborative recitation of fundamental Shlokas with Sanskrit metric breakdown and clinical annotation.",
          subject_name: "Charaka Samhita",
          academic_year: "1st Year",
          topic_focus: "Chapters 1-10",
          max_members: 15,
          current_members_count: 9,
          is_private: false,
          resources: [
            { title: "Sutrasthana Shloka Sheet", url: "https://storage.ayuraura.com/charaka_ch1.pdf", resource_type: "NOTES" }
          ],
          is_user_member: true,
          created_at: new Date(Date.now() - 3600000 * 48).toISOString()
        }
      ]);
    } finally {
      setLoadingGroups(false);
    }
  };

  const loadFeedbackSummary = async () => {
    try {
      const res = await apiGet(`/community/feedback/${feedbackTargetType}/${feedbackTargetId}`);
      setFeedbackSummary(res);
    } catch {
      setFeedbackSummary({
        average_rating: 4.8,
        total_ratings: 18,
        rating_breakdown: { 5: 14, 4: 3, 3: 1, 2: 0, 1: 0 },
        public_reviews: [
          {
            id: "rev-1",
            rating: 5,
            feedback_text: "Clear anatomical correlation between classical Marmas and brachial plexus branches. High yield for 1st Year professional exams!",
            author_name: "Vaidya Student",
            is_public: true,
            created_at: new Date().toISOString()
          }
        ]
      });
    }
  };

  // ============================================================
  // ACTION HANDLERS
  // ============================================================
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim() || !postContent.trim()) return;

    setCreatingPost(true);
    try {
      const subjObj = BAMS_SUBJECTS.find((s) => s.id === postSubject);
      const payload = {
        title: postTitle.trim(),
        content: postContent.trim(),
        subject_id: postSubject,
        subject_name: subjObj?.name || "BAMS Subject",
        topic: postTopic.trim() || undefined,
        academic_year: postYear,
        post_type: postType,
        resource_url: postResourceUrl.trim() || undefined,
        tags: postTags.split(",").map((t) => t.trim()).filter(Boolean)
      };

      const res = await apiPost("/community/discussions", payload);
      setDiscussions([res, ...discussions]);
      setShowNewPostModal(false);
      setPostTitle("");
      setPostContent("");
      setPostTopic("");
      setPostResourceUrl("");
      setPostTags("");
      showToast("Discussion post published to the academic community!");
    } catch (err: any) {
      showToast(err?.response?.data?.detail || "Failed to create discussion post.");
    } finally {
      setCreatingPost(false);
    }
  };

  const handleToggleBookmark = async (postId: string) => {
    try {
      const res = await apiPost(`/community/discussions/${postId}/bookmark`, {});
      setDiscussions((prev) =>
        prev.map((d) => (d.id === postId ? { ...d, is_bookmarked_by_user: res.is_bookmarked, bookmarks_count: res.bookmarks_count } : d))
      );
      showToast(res.is_bookmarked ? "Post saved to your bookmarks." : "Bookmark removed.");
    } catch {
      showToast("Unable to update bookmark.");
    }
  };

  const handleOpenDiscussionDetail = async (post: any) => {
    try {
      const detail = await apiGet(`/community/discussions/${post.id}`);
      setActivePost(detail);
    } catch {
      setActivePost({ ...post, comments: [] });
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim() || !activePost) return;

    setSubmittingComment(true);
    try {
      const res = await apiPost(`/community/discussions/${activePost.id}/comments`, {
        content: commentInput.trim()
      });
      setActivePost({
        ...activePost,
        comments: [...(activePost.comments || []), res],
        comments_count: (activePost.comments_count || 0) + 1
      });
      setCommentInput("");
      showToast("Reply posted successfully!");
    } catch (err: any) {
      showToast(err?.response?.data?.detail || "Failed to post comment.");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!askTitle.trim() || !askText.trim()) return;

    setSubmittingQuestion(true);
    try {
      const subjObj = BAMS_SUBJECTS.find((s) => s.id === askSubject);
      const payload = {
        subject_id: askSubject,
        subject_name: subjObj?.name || "BAMS Subject",
        topic: askTopic.trim() || undefined,
        academic_year: askYear,
        title: askTitle.trim(),
        question_text: askText.trim(),
        is_anonymous_to_peers: askAnonymous
      };

      const res = await apiPost("/community/faculty-questions", payload);
      setQaQuestions([res, ...qaQuestions]);
      setShowAskModal(false);
      setAskTitle("");
      setAskText("");
      setAskTopic("");
      showToast("Academic question submitted to faculty.");
    } catch (err: any) {
      showToast(err?.response?.data?.detail || "Failed to submit question.");
    } finally {
      setSubmittingQuestion(false);
    }
  };

  const handleFacultyAnswer = async (questionId: string) => {
    const text = answerInputs[questionId];
    if (!text || !text.trim()) return;

    setSubmittingAnswerId(questionId);
    try {
      const res = await apiPost(`/community/faculty-questions/${questionId}/answer`, {
        answer: text.trim()
      });
      setQaQuestions((prev) =>
        prev.map((q) =>
          q.id === questionId
            ? { ...q, status: "ANSWERED", faculty_answer: res.faculty_answer, answered_at: res.answered_at, faculty_name: res.faculty_name }
            : q
        )
      );
      setAnswerInputs((prev) => ({ ...prev, [questionId]: "" }));
      showToast("Faculty response posted and student notified.");
    } catch (err: any) {
      showToast(err?.response?.data?.detail || "Failed to submit answer.");
    } finally {
      setSubmittingAnswerId(null);
    }
  };

  const handleRegisterSession = async (sessId: string) => {
    setRegisteringSessionId(sessId);
    try {
      const res = await apiPost(`/community/sessions/${sessId}/register`, {});
      setSessions((prev) =>
        prev.map((s) => (s.id === sessId ? { ...s, is_registered: true } : s))
      );
      showToast(res.message || "Registered! Check notifications for meeting reminder.");
    } catch (err: any) {
      showToast(err?.response?.data?.detail || "Registration failed.");
    } finally {
      setRegisteringSessionId(null);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim() || !groupDescription.trim()) return;

    setCreatingGroup(true);
    try {
      const subjObj = BAMS_SUBJECTS.find((s) => s.id === groupSubject);
      const payload = {
        name: groupName.trim(),
        description: groupDescription.trim(),
        subject_id: groupSubject,
        subject_name: subjObj?.name || "BAMS Subject",
        academic_year: groupYear,
        topic_focus: groupFocus.trim() || undefined,
        max_members: Number(groupMaxMembers),
        is_private: groupIsPrivate,
        passcode: groupIsPrivate ? groupPasscode.trim() : undefined
      };

      const res = await apiPost("/community/study-groups", payload);
      setStudyGroups([res, ...studyGroups]);
      setShowNewGroupModal(false);
      setGroupName("");
      setGroupDescription("");
      setGroupFocus("");
      setGroupPasscode("");
      showToast("Study group formed successfully!");
    } catch (err: any) {
      showToast(err?.response?.data?.detail || "Failed to create study group.");
    } finally {
      setCreatingGroup(false);
    }
  };

  const handleJoinGroup = async (groupId: string) => {
    try {
      const res = await apiPost(`/community/study-groups/${groupId}/join`, {
        passcode: joinPasscode.trim() || undefined
      });
      setStudyGroups((prev) =>
        prev.map((g) => (g.id === groupId ? { ...g, is_user_member: true, current_members_count: g.current_members_count + 1 } : g))
      );
      setActiveJoiningGroupId(null);
      setJoinPasscode("");
      showToast(res.message || "Joined study group!");
    } catch (err: any) {
      showToast(err?.response?.data?.detail || "Unable to join study group.");
    }
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingFeedback(true);
    try {
      const payload = {
        target_type: feedbackTargetType,
        target_id: feedbackTargetId,
        target_title: feedbackTargetTitle,
        rating: Number(feedbackRating),
        feedback_text: feedbackText.trim() || undefined,
        is_public: feedbackIsPublic
      };

      const res = await apiPost("/community/feedback", payload);
      showToast(res.message || "Educational rating recorded successfully.");
      setFeedbackText("");
      loadFeedbackSummary();
    } catch (err: any) {
      showToast(err?.response?.data?.detail || "Feedback submission failed.");
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingReport(true);
    try {
      await apiPost("/community/reports", {
        target_type: reportTargetType,
        target_id: reportTargetId,
        reason: reportReason,
        details: reportDetails.trim() || undefined
      });
      showToast("Content reported to community moderators. Thank you for keeping Aayuraura safe.");
      setShowReportModal(false);
      setReportDetails("");
    } catch {
      showToast("Failed to submit report.");
    } finally {
      setSubmittingReport(false);
    }
  };

  const handleAiSummarize = async (postId: string) => {
    setAiLoading(true);
    setAiModalOpen(true);
    try {
      const res = await apiPost("/community/ai/summarize", { post_id: postId });
      setAiData(res);
    } catch {
      setAiData({
        is_ai_generated: true,
        title: "AI Synthesis",
        content: "Pedagogical summary synthesized for syllabus review.",
        advisory: "AI EDUCATIONAL ADVISORY: Generated automatically for concept review. Verify with classical treatises.",
        citations: ["Charaka Samhita", "Sushruta Samhita", "NCISM Syllabus"]
      });
    } finally {
      setAiLoading(false);
    }
  };

  const handleAiSimplify = async (concept: string, rawText?: string) => {
    setAiLoading(true);
    setAiModalOpen(true);
    try {
      const res = await apiPost("/community/ai/simplify", {
        concept_title: concept,
        raw_explanation: rawText
      });
      setAiData(res);
    } catch {
      setAiData({
        is_ai_generated: true,
        title: `Simplified: ${concept}`,
        content: `Everyday clinical breakdown for ${concept}.`,
        advisory: "AI EDUCATIONAL ADVISORY: Designed to simplify complex concepts. Always cross-check primary Shlokas.",
        citations: ["Sushruta Samhita, Sutrasthana 15"]
      });
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9F4] dark:bg-[#07160e] text-[#17231C] dark:text-[#d1e2d7] font-sans antialiased transition-colors">
      <Navbar />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl bg-[#0e301e] border border-[#2F6B4F] text-[#F1F6F2] text-xs font-semibold shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 text-[#78B895] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero Header */}
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-[#0e301e] via-[#143e28] to-[#0a2316] text-[#F1F6F2] shadow-xl border border-emerald-800/40 relative overflow-hidden">
          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold uppercase tracking-wider">
              <Users className="w-3.5 h-3.5" /> Academic Community & Collaboration Hub
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold font-serif tracking-tight text-white">
              Ayurveda Scholar & Faculty Learning Exchange
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
              Connect with BAMS peers, institutional educators, and verified Vaidyas. Ask academic questions, participate in clinical case discussions, join study groups, and review accredited masterclasses.
            </p>
          </div>
        </div>

        {/* Global Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#D5DED8] dark:border-white/10">
          <button
            onClick={() => { setActiveTab("discussions"); setActivePost(null); }}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
              activeTab === "discussions"
                ? "bg-[#0e301e] text-white shadow-sm"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-white/5"
            }`}
          >
            <MessageSquare className="w-4 h-4" /> Academic Discussions
          </button>

          <button
            onClick={() => setActiveTab("qa")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
              activeTab === "qa"
                ? "bg-[#0e301e] text-white shadow-sm"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-white/5"
            }`}
          >
            <HelpCircle className="w-4 h-4" /> Faculty Q&A
          </button>

          <button
            onClick={() => setActiveTab("sessions")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
              activeTab === "sessions"
                ? "bg-[#0e301e] text-white shadow-sm"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-white/5"
            }`}
          >
            <Video className="w-4 h-4" /> Expert Sessions
          </button>

          <button
            onClick={() => setActiveTab("groups")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
              activeTab === "groups"
                ? "bg-[#0e301e] text-white shadow-sm"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-white/5"
            }`}
          >
            <Users className="w-4 h-4" /> Study Groups
          </button>

          <button
            onClick={() => setActiveTab("feedback")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
              activeTab === "feedback"
                ? "bg-[#0e301e] text-white shadow-sm"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-white/5"
            }`}
          >
            <Star className="w-4 h-4" /> Educational Ratings & Feedback
          </button>
        </div>

        {/* ============================================================
            TAB 1: ACADEMIC DISCUSSIONS & COMMUNITY FORUM
        ============================================================ */}
        {activeTab === "discussions" && !activePost && (
          <div className="space-y-6">
            {/* Filter Bar */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#0c2419] border border-[#D5DED8] dark:border-white/10 shadow-xs flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
                {/* Search */}
                <div className="relative flex-1 min-w-[180px]">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search discussions, topics, Shlokas..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-[#F7F9F4] dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#2F6B4F]"
                  />
                </div>

                {/* Subject Selector */}
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="px-3 py-2 bg-[#F7F9F4] dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none"
                >
                  {BAMS_SUBJECTS.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>

                {/* Post Type Selector */}
                <select
                  value={selectedPostType}
                  onChange={(e) => setSelectedPostType(e.target.value)}
                  className="px-3 py-2 bg-[#F7F9F4] dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="all">All Post Types</option>
                  <option value="DISCUSSION">Discussions</option>
                  <option value="QUESTION">Academic Questions</option>
                  <option value="STUDY_TIP">Study Tips & Mnemonics</option>
                  <option value="EXAM_PREP">Exam Preparation</option>
                  <option value="RESOURCE_SHARE">Shared Resources</option>
                </select>

                {/* Bookmarked Filter Toggle */}
                <button
                  onClick={() => setOnlyBookmarked(!onlyBookmarked)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                    onlyBookmarked
                      ? "bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/40"
                      : "bg-[#F7F9F4] dark:bg-white/5 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-white/10"
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5" /> Bookmarked
                </button>
              </div>

              {/* Start Discussion Button */}
              <button
                onClick={() => setShowNewPostModal(true)}
                className="px-5 py-2.5 rounded-xl bg-[#0e301e] hover:bg-[#15452c] text-white text-xs font-bold flex items-center gap-2 shadow-sm transition"
              >
                <PlusCircle className="w-4 h-4" /> Start Discussion
              </button>
            </div>

            {/* Discussions Feed */}
            {loadingDiscussions ? (
              <div className="p-12 text-center text-xs text-slate-500 animate-pulse">Loading academic discussions...</div>
            ) : discussions.length === 0 ? (
              <div className="p-12 rounded-3xl bg-white dark:bg-[#0c2419] border border-dashed border-slate-300 dark:border-white/10 text-center space-y-3">
                <BookOpen className="w-10 h-10 text-slate-400 mx-auto" />
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">No discussions match your filter criteria</h3>
                <p className="text-xs text-slate-500">Be the first to initiate an educational dialogue on this topic!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {discussions.map((post) => (
                  <div
                    key={post.id}
                    className="p-6 rounded-2xl bg-white dark:bg-[#0c2419] border border-[#D5DED8] dark:border-white/10 hover:border-[#2F6B4F]/40 shadow-xs hover:shadow-md transition space-y-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2 text-[11px]">
                          <span className="px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                            {post.post_type}
                          </span>
                          {post.subject_name && (
                            <span className="text-slate-500 font-medium">
                              {post.subject_name} • {post.academic_year || "1st Year"}
                            </span>
                          )}
                          {post.topic && (
                            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 font-medium">
                              Topic: {post.topic}
                            </span>
                          )}
                        </div>

                        <h3
                          onClick={() => handleOpenDiscussionDetail(post)}
                          className="text-base font-bold text-slate-900 dark:text-slate-100 hover:text-[#2F6B4F] dark:hover:text-[#78B895] cursor-pointer transition"
                        >
                          {post.title}
                        </h3>
                      </div>

                      <button
                        onClick={() => handleToggleBookmark(post.id)}
                        className={`p-2 rounded-xl border transition ${
                          post.is_bookmarked_by_user
                            ? "bg-amber-500/20 text-amber-500 border-amber-500/30"
                            : "text-slate-400 hover:text-slate-600 border-slate-200 dark:border-white/10"
                        }`}
                        title="Bookmark discussion"
                      >
                        <Bookmark className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                      {post.content}
                    </p>

                    {post.resource_url && (
                      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs text-[#2F6B4F] dark:text-[#78B895]">
                        <FileText className="w-4 h-4 shrink-0" />
                        <span className="font-semibold truncate">Resource Attached:</span>
                        <a href={post.resource_url} target="_blank" rel="noopener noreferrer" className="hover:underline truncate text-slate-700 dark:text-slate-300">
                          {post.resource_url}
                        </a>
                      </div>
                    )}

                    {/* Metadata & Actions */}
                    <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {post.author_name}
                        </span>
                        {post.author_role === "FACULTY" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                            <ShieldCheck className="w-3 h-3" /> VERIFIED FACULTY
                          </span>
                        )}
                        <span>•</span>
                        <span>{new Date(post.created_at).toLocaleDateString()}</span>
                      </div>

                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => handleAiSummarize(post.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[11px] font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20 border border-purple-500/20 transition"
                        >
                          <Sparkles className="w-3.5 h-3.5" /> AI Synthesis
                        </button>

                        <button
                          onClick={() => {
                            setReportTargetType("POST");
                            setReportTargetId(String(post.id));
                            setShowReportModal(true);
                          }}
                          className="text-slate-400 hover:text-rose-500 transition"
                          title="Report inappropriate content"
                        >
                          <Flag className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleOpenDiscussionDetail(post)}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2F6B4F] dark:text-[#78B895] hover:underline"
                        >
                          <MessageCircle className="w-3.5 h-3.5" /> {post.comments_count || 0} Replies
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Active Discussion Detail View with Comments */}
        {activeTab === "discussions" && activePost && (
          <div className="space-y-6">
            <button
              onClick={() => setActivePost(null)}
              className="text-xs font-bold text-[#2F6B4F] dark:text-[#78B895] inline-flex items-center gap-1 hover:underline mb-2"
            >
              ← Back to All Discussions
            </button>

            <div className="p-7 rounded-3xl bg-white dark:bg-[#0c2419] border border-[#D5DED8] dark:border-white/10 shadow-md space-y-4">
              <div className="flex items-center gap-2 text-xs">
                <span className="px-3 py-0.5 rounded-full font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 uppercase">
                  {activePost.post_type}
                </span>
                <span className="text-slate-500">{activePost.subject_name} • {activePost.academic_year}</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">{activePost.title}</h2>

              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line">
                {activePost.content}
              </p>

              {activePost.resource_url && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs">
                  <span className="font-semibold text-[#2F6B4F] dark:text-[#78B895]">Shared Resource: </span>
                  <a href={activePost.resource_url} target="_blank" rel="noopener noreferrer" className="hover:underline text-blue-600 dark:text-blue-400">
                    {activePost.resource_url}
                  </a>
                </div>
              )}

              {/* AI Summary Banner if already generated */}
              {activePost.ai_summary && (
                <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/30 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold text-purple-700 dark:text-purple-300">
                    <Sparkles className="w-4 h-4" /> AI Academic Discussion Synthesis
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">{activePost.ai_summary}</p>
                </div>
              )}
            </div>

            {/* Comments Thread */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-[#2F6B4F]" /> Peer & Faculty Responses ({activePost.comments?.length || 0})
              </h3>

              {(!activePost.comments || activePost.comments.length === 0) ? (
                <p className="text-xs text-slate-400 py-4">No replies yet. Join the dialogue below.</p>
              ) : (
                <div className="space-y-3">
                  {activePost.comments.map((comment: any) => (
                    <div
                      key={comment.id}
                      className={`p-5 rounded-2xl border text-xs space-y-2 transition ${
                        comment.is_faculty_answer
                          ? "bg-emerald-500/10 border-emerald-500/30 dark:bg-emerald-950/30"
                          : "bg-white dark:bg-[#0c2419] border-slate-200 dark:border-white/10"
                      }`}
                    >
                      <div className="flex items-center justify-between text-slate-500">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800 dark:text-slate-200">{comment.author_name}</span>
                          {comment.is_faculty_answer && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-600 text-white flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3" /> VERIFIED FACULTY
                            </span>
                          )}
                        </div>
                        <span className="text-[11px]">{new Date(comment.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-200 leading-relaxed">{comment.content}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Comment Input */}
              <form onSubmit={handleAddComment} className="p-4 rounded-2xl bg-white dark:bg-[#0c2419] border border-slate-200 dark:border-white/10 space-y-3">
                <textarea
                  rows={3}
                  required
                  placeholder="Contribute your pedagogical observation or Shloka reference..."
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  className="w-full p-3 bg-[#F7F9F4] dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#2F6B4F]"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={submittingComment}
                    className="px-5 py-2 rounded-xl bg-[#0e301e] hover:bg-[#15452c] text-white text-xs font-bold transition flex items-center gap-2"
                  >
                    <Send className="w-3.5 h-3.5" /> {submittingComment ? "Posting..." : "Post Response"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ============================================================
            TAB 2: FACULTY Q&A (STUDENT ACADEMIC QUESTIONS)
        ============================================================ */}
        {activeTab === "qa" && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-[#0c2419] border border-[#D5DED8] dark:border-white/10 flex flex-wrap items-center justify-between gap-4 shadow-xs">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-[#2F6B4F]" /> Direct Academic Faculty Inquiries
                </h3>
                <p className="text-xs text-slate-500">
                  Submit formal curriculum questions to college educators. Student privacy is safeguarded through optional anonymous peer display.
                </p>
              </div>

              <button
                onClick={() => setShowAskModal(true)}
                className="px-5 py-2.5 rounded-xl bg-[#0e301e] hover:bg-[#15452c] text-white text-xs font-bold flex items-center gap-2 shadow-sm transition"
              >
                <PlusCircle className="w-4 h-4" /> Ask Faculty Question
              </button>
            </div>

            {loadingQa ? (
              <div className="p-12 text-center text-xs text-slate-500 animate-pulse">Loading faculty Q&A stream...</div>
            ) : qaQuestions.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#0c2419] border border-dashed border-slate-300 dark:border-white/10">
                <HelpCircle className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                <p className="text-xs text-slate-500">No unanswered questions in your queue.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {qaQuestions.map((q) => (
                  <div
                    key={q.id}
                    className="p-6 rounded-2xl bg-white dark:bg-[#0c2419] border border-[#D5DED8] dark:border-white/10 space-y-4 shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-[11px]">
                          <span
                            className={`px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                              q.status === "ANSWERED"
                                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30"
                                : "bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30"
                            }`}
                          >
                            {q.status}
                          </span>
                          <span className="font-semibold text-slate-600 dark:text-slate-400">
                            {q.subject_name} • {q.academic_year}
                          </span>
                        </div>
                        <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">{q.title}</h4>
                      </div>

                      <div className="text-right text-[11px] text-slate-400">
                        <span>{q.student_display_name}</span>
                        <p className="text-[10px] mt-0.5">{new Date(q.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed bg-[#F7F9F4] dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/10">
                      {q.question_text}
                    </p>

                    {/* Faculty Answer Section */}
                    {q.faculty_answer ? (
                      <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-500/30 text-xs space-y-2">
                        <div className="flex items-center justify-between text-emerald-800 dark:text-emerald-300 font-bold">
                          <span className="flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4 text-emerald-600" /> Answer by {q.faculty_name || "Authorized Faculty"}
                          </span>
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400">
                            {q.answered_at ? new Date(q.answered_at).toLocaleDateString() : ""}
                          </span>
                        </div>
                        <p className="text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line">
                          {q.faculty_answer}
                        </p>

                        <div className="pt-2 flex justify-end">
                          <button
                            onClick={() => handleAiSimplify(q.title, q.faculty_answer)}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20 border border-purple-500/20 transition"
                          >
                            <Sparkles className="w-3.5 h-3.5" /> Simplify for Exam Revision
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Faculty Response Input Form if viewer is Faculty */
                      userRole === "FACULTY" && (
                        <div className="pt-2 border-t border-slate-100 dark:border-white/5 space-y-3">
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                            Provide Official Pedagogical Answer:
                          </label>
                          <textarea
                            rows={3}
                            placeholder="Enter authoritative answer referencing classical Samhita principles..."
                            value={answerInputs[q.id] || ""}
                            onChange={(e) => setAnswerInputs({ ...answerInputs, [q.id]: e.target.value })}
                            className="w-full p-3 bg-[#F7F9F4] dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#2F6B4F]"
                          />
                          <button
                            onClick={() => handleFacultyAnswer(q.id)}
                            disabled={submittingAnswerId === q.id}
                            className="px-4 py-2 rounded-xl bg-[#0e301e] hover:bg-[#15452c] text-white text-xs font-bold transition flex items-center gap-2"
                          >
                            <Check className="w-3.5 h-3.5" /> {submittingAnswerId === q.id ? "Submitting..." : "Submit Verified Answer"}
                          </button>
                        </div>
                      )
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ============================================================
            TAB 3: EXPERT SESSIONS & LIVE LEARNING
        ============================================================ */}
        {activeTab === "sessions" && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-[#0c2419] border border-[#D5DED8] dark:border-white/10 flex items-center justify-between shadow-xs">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Video className="w-5 h-5 text-[#2F6B4F]" /> Accredited Expert Masterclasses & Clinical Talks
                </h3>
                <p className="text-xs text-slate-500">
                  Participate in live educational sessions conducted by authorized doctors and senior faculty with real conference meeting links.
                </p>
              </div>
            </div>

            {loadingSessions ? (
              <div className="p-12 text-center text-xs text-slate-500 animate-pulse">Loading upcoming expert sessions...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sessions.map((sess) => (
                  <div
                    key={sess.id}
                    className="p-6 rounded-3xl bg-white dark:bg-[#0c2419] border border-[#D5DED8] dark:border-white/10 hover:border-[#2F6B4F]/40 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="px-3 py-0.5 rounded-full font-bold bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/20 uppercase tracking-wider">
                          {sess.category}
                        </span>
                        <div className="flex items-center gap-1 text-amber-500 font-bold">
                          <Star className="w-3.5 h-3.5 fill-current" /> {sess.average_rating || 5.0} ({sess.total_ratings || 0})
                        </div>
                      </div>

                      <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">{sess.title}</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{sess.description}</p>

                      <div className="space-y-1 text-xs text-slate-500">
                        <div className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-emerald-600" /> Host: {sess.expert_name} ({sess.institution || "Ayurvedic Medical College"})
                        </div>
                        <div className="flex items-center gap-2 pt-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{sess.scheduled_date} at {sess.start_time} ({sess.duration_minutes} mins)</span>
                        </div>
                      </div>

                      {sess.learning_objectives?.length > 0 && (
                        <div className="pt-2 border-t border-slate-100 dark:border-white/5 space-y-1">
                          <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Core Objectives:</span>
                          <ul className="text-[11px] text-slate-600 dark:text-slate-300 space-y-0.5 list-disc pl-4">
                            {sess.learning_objectives.slice(0, 3).map((obj: string, i: number) => (
                              <li key={i}>{obj}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex flex-wrap items-center justify-between gap-3">
                      {sess.live_stream_url && (
                        <a
                          href={sess.live_stream_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 transition"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> Meeting Link
                        </a>
                      )}

                      {sess.recording_url && (
                        <a
                          href={sess.recording_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-2 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 text-xs font-bold flex items-center gap-1.5 transition"
                        >
                          <Video className="w-3.5 h-3.5" /> Recording
                        </a>
                      )}

                      <button
                        onClick={() => handleRegisterSession(sess.id)}
                        disabled={sess.is_registered || registeringSessionId === sess.id}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                          sess.is_registered
                            ? "bg-emerald-600 text-white cursor-default"
                            : "bg-[#0e301e] hover:bg-[#15452c] text-white shadow-sm"
                        }`}
                      >
                        {sess.is_registered ? (
                          <>
                            <Check className="w-3.5 h-3.5" /> Registered
                          </>
                        ) : registeringSessionId === sess.id ? (
                          "Registering..."
                        ) : (
                          "Register / RSVP"
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ============================================================
            TAB 4: STUDENT COLLABORATION / STUDY GROUPS
        ============================================================ */}
        {activeTab === "groups" && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-[#0c2419] border border-[#D5DED8] dark:border-white/10 flex flex-wrap items-center justify-between gap-4 shadow-xs">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#2F6B4F]" /> Peer Study Circles & Revision Groups
                </h3>
                <p className="text-xs text-slate-500">
                  Form intimate subject circles (up to 15 members) to share study notes, Shloka recordings, and group viva revision.
                </p>
              </div>

              <button
                onClick={() => setShowNewGroupModal(true)}
                className="px-5 py-2.5 rounded-xl bg-[#0e301e] hover:bg-[#15452c] text-white text-xs font-bold flex items-center gap-2 shadow-sm transition"
              >
                <PlusCircle className="w-4 h-4" /> Form Study Group
              </button>
            </div>

            {loadingGroups ? (
              <div className="p-12 text-center text-xs text-slate-500 animate-pulse">Loading study groups...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {studyGroups.map((grp) => (
                  <div
                    key={grp.id}
                    className="p-6 rounded-3xl bg-white dark:bg-[#0c2419] border border-[#D5DED8] dark:border-white/10 hover:border-[#2F6B4F]/40 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="px-2.5 py-0.5 rounded-full font-bold bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/20">
                          {grp.academic_year}
                        </span>
                        {grp.is_private && (
                          <span className="flex items-center gap-1 text-[11px] text-amber-500 font-semibold">
                            <Lock className="w-3 h-3" /> Private Circle
                          </span>
                        )}
                      </div>

                      <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">{grp.name}</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">{grp.description}</p>

                      <div className="text-xs text-slate-500 pt-1 space-y-1">
                        <div><strong className="text-slate-700 dark:text-slate-300">Subject:</strong> {grp.subject_name}</div>
                        {grp.topic_focus && (
                          <div><strong className="text-slate-700 dark:text-slate-300">Focus:</strong> {grp.topic_focus}</div>
                        )}
                        <div>
                          <strong className="text-slate-700 dark:text-slate-300">Members:</strong> {grp.current_members_count} / {grp.max_members}
                        </div>
                      </div>

                      {grp.resources?.length > 0 && (
                        <div className="pt-2 border-t border-slate-100 dark:border-white/5">
                          <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                            Shared Group Resources ({grp.resources.length})
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">Created by {grp.creator_name}</span>

                      {grp.is_user_member ? (
                        <span className="px-3 py-1 rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Joined
                        </span>
                      ) : (
                        grp.is_private ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="password"
                              placeholder="Passcode"
                              value={activeJoiningGroupId === grp.id ? joinPasscode : ""}
                              onFocus={() => setActiveJoiningGroupId(grp.id)}
                              onChange={(e) => setJoinPasscode(e.target.value)}
                              className="w-20 px-2 py-1 rounded text-xs bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10"
                            />
                            <button
                              onClick={() => handleJoinGroup(grp.id)}
                              className="px-3 py-1 rounded-xl bg-[#0e301e] text-white text-xs font-bold hover:bg-[#15452c]"
                            >
                              Join
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleJoinGroup(grp.id)}
                            className="px-4 py-1.5 rounded-xl bg-[#0e301e] hover:bg-[#15452c] text-white text-xs font-bold transition"
                          >
                            Join Group
                          </button>
                        )
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ============================================================
            TAB 5: EDUCATIONAL FEEDBACK & RATINGS (ANTI-MANIPULATION)
        ============================================================ */}
        {activeTab === "feedback" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Submit Rating Form */}
              <div className="lg:col-span-1 p-6 rounded-3xl bg-white dark:bg-[#0c2419] border border-[#D5DED8] dark:border-white/10 space-y-4 shadow-xs">
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Star className="w-5 h-5 text-amber-500" /> Submit Educational Feedback
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Provide constructive feedback on academic sessions and learning resources. System strictly enforces a single rating per user to maintain integrity.
                  </p>
                </div>

                <form onSubmit={handleSubmitFeedback} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Resource / Session Type</label>
                    <select
                      value={feedbackTargetType}
                      onChange={(e) => setFeedbackTargetType(e.target.value)}
                      className="w-full p-2.5 bg-[#F7F9F4] dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl"
                    >
                      <option value="EXPERT_SESSION">Expert Masterclass Session</option>
                      <option value="FACULTY_RESOURCE">Faculty Study Resource</option>
                      <option value="STUDY_MATERIAL">Classical Samhita Material</option>
                      <option value="LEARNING_ACTIVITY">Diagnostic Quiz / Logbook</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Item Title</label>
                    <input
                      type="text"
                      required
                      value={feedbackTargetTitle}
                      onChange={(e) => setFeedbackTargetTitle(e.target.value)}
                      className="w-full p-2.5 bg-[#F7F9F4] dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Star Rating (1 to 5)</label>
                    <div className="flex items-center gap-2 pt-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setFeedbackRating(s)}
                          className="p-1 focus:outline-none"
                        >
                          <Star
                            className={`w-6 h-6 ${
                              s <= feedbackRating
                                ? "text-amber-500 fill-amber-500"
                                : "text-slate-300 dark:text-slate-600"
                            }`}
                          />
                        </button>
                      ))}
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-2">{feedbackRating} / 5 Stars</span>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Constructive Academic Feedback</label>
                    <textarea
                      rows={3}
                      placeholder="Comment on clinical relevance, clarity of explanation, and syllabus alignment..."
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      className="w-full p-2.5 bg-[#F7F9F4] dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="fb_public"
                      checked={feedbackIsPublic}
                      onChange={(e) => setFeedbackIsPublic(e.target.checked)}
                      className="w-4 h-4 rounded text-[#2F6B4F]"
                    />
                    <label htmlFor="fb_public" className="text-slate-600 dark:text-slate-400">
                      Publish review publicly (Uncheck to keep private to faculty/admin)
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={submittingFeedback}
                    className="w-full py-2.5 rounded-xl bg-[#0e301e] hover:bg-[#15452c] text-white font-bold transition shadow-sm"
                  >
                    {submittingFeedback ? "Recording..." : "Record Verified Rating"}
                  </button>
                </form>
              </div>

              {/* Right Column: Feedback Aggregates & Public Reviews */}
              <div className="lg:col-span-2 space-y-6">
                <div className="p-6 rounded-3xl bg-white dark:bg-[#0c2419] border border-[#D5DED8] dark:border-white/10 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">{feedbackTargetTitle}</h4>
                      <p className="text-xs text-slate-500">Peer verified quality ratings aggregate</p>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-bold text-amber-500 flex items-center justify-end gap-1">
                        <Star className="w-6 h-6 fill-amber-500" /> {feedbackSummary?.average_rating || 0.0}
                      </div>
                      <span className="text-[11px] text-slate-400">{feedbackSummary?.total_ratings || 0} Ratings Total</span>
                    </div>
                  </div>

                  {/* Rating Breakdown Bars */}
                  {feedbackSummary?.rating_breakdown && (
                    <div className="space-y-1.5 pt-2">
                      {[5, 4, 3, 2, 1].map((r) => {
                        const count = feedbackSummary.rating_breakdown[r] || 0;
                        const pct = feedbackSummary.total_ratings > 0 ? (count / feedbackSummary.total_ratings) * 100 : 0;
                        return (
                          <div key={r} className="flex items-center gap-3 text-xs">
                            <span className="w-12 text-slate-500 font-semibold">{r} Stars</span>
                            <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-white/5 overflow-hidden">
                              <div className="h-full bg-amber-500 rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="w-8 text-right text-slate-400 text-[11px]">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Public Reviews Stream */}
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Verified Public Reviews</h4>
                  {(!feedbackSummary?.public_reviews || feedbackSummary.public_reviews.length === 0) ? (
                    <p className="text-xs text-slate-400 py-4">No public written reviews submitted yet.</p>
                  ) : (
                    feedbackSummary.public_reviews.map((rev: any) => (
                      <div
                        key={rev.id}
                        className="p-4 rounded-2xl bg-white dark:bg-[#0c2419] border border-slate-200 dark:border-white/10 space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800 dark:text-slate-200">{rev.author_name}</span>
                          <div className="flex items-center gap-1 text-amber-500">
                            {[...Array(rev.rating)].map((_, i) => (
                              <Star key={i} className="w-3.5 h-3.5 fill-current" />
                            ))}
                          </div>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{rev.feedback_text}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ============================================================
          MODALS: NEW DISCUSSION, ASK QUESTION, NEW GROUP, REPORT, AI
      ============================================================ */}

      {/* New Discussion Modal */}
      {showNewPostModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#0e271c] border border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 max-w-xl w-full space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-[#2F6B4F]" /> Start Academic Discussion
              </h3>
              <button onClick={() => setShowNewPostModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Post Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Evaluation of Shatkriyakala in early Pittaja pathology"
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  className="w-full p-2.5 bg-[#F7F9F4] dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Subject</label>
                  <select
                    value={postSubject}
                    onChange={(e) => setPostSubject(e.target.value)}
                    className="w-full p-2.5 bg-[#F7F9F4] dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl"
                  >
                    {BAMS_SUBJECTS.filter((s) => s.id !== "all").map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Post Type</label>
                  <select
                    value={postType}
                    onChange={(e) => setPostType(e.target.value)}
                    className="w-full p-2.5 bg-[#F7F9F4] dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl"
                  >
                    <option value="DISCUSSION">Clinical / Academic Discussion</option>
                    <option value="QUESTION">Curriculum Inquiry</option>
                    <option value="STUDY_TIP">Study Tip & Mnemonic</option>
                    <option value="EXAM_PREP">Exam Preparation</option>
                    <option value="RESOURCE_SHARE">Resource Share</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Topic / Chapter</label>
                  <input
                    type="text"
                    placeholder="e.g., Shatkriyakala, Marma Sharira"
                    value={postTopic}
                    onChange={(e) => setPostTopic(e.target.value)}
                    className="w-full p-2.5 bg-[#F7F9F4] dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Academic Year</label>
                  <select
                    value={postYear}
                    onChange={(e) => setPostYear(e.target.value)}
                    className="w-full p-2.5 bg-[#F7F9F4] dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl"
                  >
                    <option value="1st Year">1st Year BAMS</option>
                    <option value="2nd Year">2nd Year BAMS</option>
                    <option value="3rd Year">3rd Year BAMS</option>
                    <option value="Final Year">Final Year BAMS</option>
                    <option value="Intern">Intern / Post-Graduate</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Detailed Inquiry / Content *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Provide context, references from Brihat-trayi, or questions for discussion..."
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  className="w-full p-2.5 bg-[#F7F9F4] dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Resource URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/... or https://..."
                  value={postResourceUrl}
                  onChange={(e) => setPostResourceUrl(e.target.value)}
                  className="w-full p-2.5 bg-[#F7F9F4] dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewPostModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-white/10 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingPost}
                  className="px-5 py-2 rounded-xl bg-[#0e301e] hover:bg-[#15452c] text-white font-bold"
                >
                  {creatingPost ? "Publishing..." : "Publish Post"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ask Faculty Question Modal */}
      {showAskModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#0e271c] border border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-[#2F6B4F]" /> Ask College Faculty
              </h3>
              <button onClick={() => setShowAskModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAskQuestion} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Subject *</label>
                  <select
                    value={askSubject}
                    onChange={(e) => setAskSubject(e.target.value)}
                    className="w-full p-2.5 bg-[#F7F9F4] dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl"
                  >
                    {BAMS_SUBJECTS.filter((s) => s.id !== "all").map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Academic Year</label>
                  <select
                    value={askYear}
                    onChange={(e) => setAskYear(e.target.value)}
                    className="w-full p-2.5 bg-[#F7F9F4] dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl"
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="Final Year">Final Year</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Question Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Understanding Sroto Dushti Lakshana in Prameha"
                  value={askTitle}
                  onChange={(e) => setAskTitle(e.target.value)}
                  className="w-full p-2.5 bg-[#F7F9F4] dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Detailed Question *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Detail your question for the faculty educator..."
                  value={askText}
                  onChange={(e) => setAskText(e.target.value)}
                  className="w-full p-2.5 bg-[#F7F9F4] dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl"
                />
              </div>

              <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                <input
                  type="checkbox"
                  id="anonymous_peer"
                  checked={askAnonymous}
                  onChange={(e) => setAskAnonymous(e.target.checked)}
                  className="w-4 h-4 rounded text-[#2F6B4F]"
                />
                <label htmlFor="anonymous_peer" className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
                  <strong>Ask Anonymously to Peers</strong> (Your name remains visible to verified faculty for academic grading, but is masked to student peers).
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAskModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-white/10 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingQuestion}
                  className="px-5 py-2 rounded-xl bg-[#0e301e] hover:bg-[#15452c] text-white font-bold"
                >
                  {submittingQuestion ? "Submitting..." : "Submit to Faculty"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Form Study Group Modal */}
      {showNewGroupModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#0e271c] border border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Users className="w-5 h-5 text-[#2F6B4F]" /> Form Peer Study Group
              </h3>
              <button onClick={() => setShowNewGroupModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Group Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Kayachikitsa Differential Diagnosis Circle"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="w-full p-2.5 bg-[#F7F9F4] dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Subject</label>
                  <select
                    value={groupSubject}
                    onChange={(e) => setGroupSubject(e.target.value)}
                    className="w-full p-2.5 bg-[#F7F9F4] dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl"
                  >
                    {BAMS_SUBJECTS.filter((s) => s.id !== "all").map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Year</label>
                  <select
                    value={groupYear}
                    onChange={(e) => setGroupYear(e.target.value)}
                    className="w-full p-2.5 bg-[#F7F9F4] dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl"
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="Final Year">Final Year</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Topic / Exam Goal</label>
                <input
                  type="text"
                  placeholder="e.g., AIAPGET 2027 Mock Tests & Samhita Chanting"
                  value={groupFocus}
                  onChange={(e) => setGroupFocus(e.target.value)}
                  className="w-full p-2.5 bg-[#F7F9F4] dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Group Description *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Outline the study schedule, goals, and weekly revision plan..."
                  value={groupDescription}
                  onChange={(e) => setGroupDescription(e.target.value)}
                  className="w-full p-2.5 bg-[#F7F9F4] dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="group_private"
                  checked={groupIsPrivate}
                  onChange={(e) => setGroupIsPrivate(e.target.checked)}
                  className="w-4 h-4 rounded text-[#2F6B4F]"
                />
                <label htmlFor="group_private" className="text-slate-700 dark:text-slate-300 font-semibold">
                  Make Private (Require Passcode to Join)
                </label>
              </div>

              {groupIsPrivate && (
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Passcode</label>
                  <input
                    type="password"
                    placeholder="Enter circle passcode"
                    value={groupPasscode}
                    onChange={(e) => setGroupPasscode(e.target.value)}
                    className="w-full p-2.5 bg-[#F7F9F4] dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl"
                  />
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewGroupModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-white/10 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingGroup}
                  className="px-5 py-2 rounded-xl bg-[#0e301e] hover:bg-[#15452c] text-white font-bold"
                >
                  {creatingGroup ? "Forming Group..." : "Create Circle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Content Moderation Reporting Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0e271c] border border-slate-200 dark:border-white/10 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
                <Flag className="w-4 h-4" /> Report Inappropriate Content
              </h3>
              <button onClick={() => setShowReportModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitReport} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Violation Reason</label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full p-2.5 bg-[#F7F9F4] dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl"
                >
                  <option value="MEDICAL_MISINFORMATION">Medical / Formulation Misinformation</option>
                  <option value="SPAM">Spam or Irrelevant Promotion</option>
                  <option value="HARASSMENT">Harassment or Offensive Conduct</option>
                  <option value="OFF_TOPIC">Off-Topic / Non-Academic</option>
                  <option value="INAPPROPRIATE">Other Inappropriate Material</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Details (Optional)</label>
                <textarea
                  rows={3}
                  placeholder="Provide context for community moderators..."
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  className="w-full p-2.5 bg-[#F7F9F4] dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-white/10 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReport}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold"
                >
                  {submittingReport ? "Reporting..." : "Submit Report"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Assistant Modal (Summary / Simplification) */}
      {aiModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#0e271c] border border-purple-500/30 rounded-3xl p-6 sm:p-8 max-w-2xl w-full space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300 font-bold">
                <Sparkles className="w-5 h-5" /> Aayuraura AI Academic Assistant
              </div>
              <button onClick={() => setAiModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {aiLoading ? (
              <div className="p-8 text-center text-xs text-purple-500 animate-pulse space-y-2">
                <Sparkles className="w-8 h-8 animate-spin mx-auto text-purple-400" />
                <p>Synthesizing pedagogical breakdown from Brihat-trayi treatises...</p>
              </div>
            ) : aiData ? (
              <div className="space-y-4 text-xs">
                <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">{aiData.title}</h4>
                <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/20 text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line">
                  {aiData.content}
                </div>

                {aiData.followup_questions?.length > 0 && (
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-2">
                    <span className="font-bold text-purple-700 dark:text-purple-300">Curriculum Follow-Up Inquiries:</span>
                    <ul className="space-y-1 list-disc pl-4 text-slate-600 dark:text-slate-300">
                      {aiData.followup_questions.map((fq: string, i: number) => (
                        <li key={i}>{fq}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {aiData.citations?.length > 0 && (
                  <div className="text-[11px] text-slate-400 space-y-1">
                    <strong className="text-slate-500">Authentic Pramana Citations:</strong>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {aiData.citations.map((c: string, idx: number) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Safety Advisory */}
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-800 dark:text-amber-300 font-medium leading-relaxed">
                  {aiData.advisory}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
