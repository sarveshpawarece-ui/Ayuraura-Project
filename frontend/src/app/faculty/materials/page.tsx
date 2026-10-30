"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  FileText,
  PlusCircle,
  Video,
  Award,
  Sparkles,
  Search,
  Filter,
  Trash2,
  Edit3,
  ExternalLink,
  ChevronLeft,
  CheckCircle2,
  Clock,
  Send,
  ShieldCheck,
  AlertCircle,
  Archive,
  RefreshCw
} from "lucide-react";
import { api } from "@/lib/api";
import {
  DashboardLayout,
  DashboardHeader,
  DashboardCard,
  DashboardStatsCard,
  DashboardLoadingSkeleton
} from "@/components/dashboard";

export default function FacultyMaterialsPage() {
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedYear, setSelectedYear] = useState<string>("ALL");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingResource, setEditingResource] = useState<any | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    resource_type: "NOTES",
    academic_year: "1st Year",
    subject_id: "rachana_sharir",
    subject_name: "Rachana Sharir (Anatomy)",
    unit_number: 1,
    unit_name: "Garbha Sharir",
    topic_name: "",
    class_or_batch: "All",
    file_url: "",
    content_text: "",
    is_published: true,
    workflow_status: "PUBLISHED",
    is_ai_generated: false,
    ai_disclaimer: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const loadResources = async () => {
    try {
      setLoading(true);
      const res = await api.get("/faculty/resources");
      if (Array.isArray(res.data)) {
        setResources(res.data);
      }
    } catch (e) {
      console.error("Error loading resources:", e);
      // Fallback records
      setResources([
        {
          id: "res-1",
          title: "Comprehensive Marma Points & Clinical Significance Compendium",
          description: "Classical breakdown of 107 Marma points according to Acharya Sushruta with modern anatomical correlations.",
          subject_name: "Rachana Sharir (Anatomy)",
          academic_year: "1st Year",
          resource_type: "NOTES",
          unit_number: 3,
          unit_name: "Marma Sharir",
          topic_name: "Trimarma & Sadhyo Pranahara",
          class_or_batch: "Batch A & B",
          workflow_status: "APPROVED",
          is_published: true,
          is_ai_generated: false,
          created_at: "2026-10-27"
        },
        {
          id: "res-2",
          title: "Dravyaguna 50 Classical Herbs Identification Guide & Posology",
          description: "Field herbarium manual covering Rasa, Guna, Virya, Vipaka, and Karma of classical Dravyas.",
          subject_name: "Dravyaguna Vijnana",
          academic_year: "2nd Year",
          resource_type: "STUDY_MATERIAL",
          unit_number: 2,
          unit_name: "Dravya Varga",
          topic_name: "Haritakyadi Varga",
          class_or_batch: "All",
          workflow_status: "PUBLISHED",
          is_published: true,
          is_ai_generated: false,
          created_at: "2026-10-25"
        },
        {
          id: "res-3",
          title: "Mid-Term Examination Model Question Paper 2026",
          description: "Full format LAQ, SAQ, and MCQ practice test for 1st Year scholars.",
          subject_name: "Kriya Sharir (Physiology)",
          academic_year: "1st Year",
          resource_type: "PRACTICE_QUESTIONS",
          unit_number: 1,
          unit_name: "Dosha Vijnana",
          topic_name: "Kriya Kala Stages",
          class_or_batch: "All",
          workflow_status: "SUBMITTED",
          is_published: false,
          is_ai_generated: true,
          reviewer_feedback: "Pending review by Department Board of Studies.",
          created_at: "2026-10-22"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setErrorMsg("");
      const isPublished = formData.workflow_status === "PUBLISHED" || formData.workflow_status === "APPROVED";
      const payload = {
        ...formData,
        is_published: isPublished,
        ai_disclaimer: formData.is_ai_generated ? "AI-assisted outline verified by faculty." : undefined
      };
      await api.post("/faculty/resources", payload);
      setSuccessMsg("Educational resource created successfully!");
      setShowUploadModal(false);
      setFormData({
        title: "",
        description: "",
        resource_type: "NOTES",
        academic_year: "1st Year",
        subject_id: "rachana_sharir",
        subject_name: "Rachana Sharir (Anatomy)",
        unit_number: 1,
        unit_name: "Garbha Sharir",
        topic_name: "",
        class_or_batch: "All",
        file_url: "",
        content_text: "",
        is_published: true,
        workflow_status: "PUBLISHED",
        is_ai_generated: false,
        ai_disclaimer: ""
      });
      loadResources();
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (e: any) {
      setErrorMsg(e.response?.data?.detail || "Failed to create resource.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateWorkflow = async (resourceId: string, newStatus: string) => {
    try {
      await api.patch(`/faculty/resources/${resourceId}/workflow`, {
        workflow_status: newStatus
      });
      setResources((prev) =>
        prev.map((r) =>
          r.id === resourceId
            ? { ...r, workflow_status: newStatus, is_published: newStatus === "PUBLISHED" || newStatus === "APPROVED" }
            : r
        )
      );
      setSuccessMsg(`Resource workflow state updated to ${newStatus}.`);
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (e: any) {
      alert(e.response?.data?.detail || "Failed to update workflow state.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this educational resource?")) return;
    try {
      await api.delete(`/faculty/resources/${id}`);
      setResources((prev) => prev.filter((r) => r.id !== id));
      setSuccessMsg("Resource deleted successfully.");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (e) {
      alert("Failed to delete resource.");
    }
  };

  const filtered = resources.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.subject_name.toLowerCase().includes(search.toLowerCase());
    const matchesYear = selectedYear === "ALL" || r.academic_year === selectedYear;
    const matchesType = selectedType === "ALL" || r.resource_type === selectedType;
    const status = r.workflow_status || (r.is_published ? "PUBLISHED" : "DRAFT");
    const matchesStatus = selectedStatus === "ALL" || status === selectedStatus;
    return matchesSearch && matchesYear && matchesType && matchesStatus;
  });

  const getWorkflowBadge = (status: string | undefined, isPublished: boolean) => {
    const st = (status || (isPublished ? "PUBLISHED" : "DRAFT")).toUpperCase();
    switch (st) {
      case "DRAFT":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">DRAFT</span>;
      case "SUBMITTED":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">SUBMITTED FOR REVIEW</span>;
      case "UNDER_REVIEW":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">UNDER REVIEW</span>;
      case "APPROVED":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-500/15 text-teal-400 border border-teal-500/30">APPROVED</span>;
      case "PUBLISHED":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">PUBLISHED</span>;
      case "REJECTED":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">REVISION REQUESTED</span>;
      case "ARCHIVED":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-stone-500/15 text-stone-400 border border-stone-500/30">ARCHIVED</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400">{st}</span>;
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-4">
        <Link
          href="/faculty/dashboard"
          className="text-xs text-slate-400 hover:text-emerald-400 font-medium inline-flex items-center gap-1 transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" /> Back to Faculty Dashboard
        </Link>
      </div>

      <DashboardHeader
        badgeText="NCISM Curriculum Resource Sharing"
        badgeIcon={<BookOpen className="w-3.5 h-3.5" />}
        badgeVariant="emerald"
        title="Educational Resource Management"
        subtitle="Manage BAMS subject notes, lecture recordings, revision aids, and university practice tests across verified editorial review states."
        actions={[
          {
            label: "Create & Upload Material",
            onClick: () => setShowUploadModal(true),
            icon: PlusCircle,
            variant: "primary",
          },
        ]}
      />

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs font-semibold flex items-center gap-2 mb-6">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs font-semibold flex items-center gap-2 mb-6">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <DashboardStatsCard
          title="Total Materials"
          value={resources.length}
          subtitle="Curriculum items created"
          icon={BookOpen}
        />
        <DashboardStatsCard
          title="Published to Students"
          value={resources.filter(r => r.workflow_status === "PUBLISHED" || (r.is_published && !r.workflow_status)).length}
          subtitle="Live on student dashboards"
          icon={CheckCircle2}
        />
        <DashboardStatsCard
          title="Pending Review"
          value={resources.filter(r => r.workflow_status === "SUBMITTED" || r.workflow_status === "UNDER_REVIEW").length}
          subtitle="In departmental evaluation"
          icon={Clock}
        />
        <DashboardStatsCard
          title="AI-Assisted Items"
          value={resources.filter(r => r.is_ai_generated).length}
          subtitle="Incorporates NCISM AI tag"
          icon={Sparkles}
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search title, subject, unit..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Academic Years</option>
            <option value="1st Year">1st Year BAMS</option>
            <option value="2nd Year">2nd Year BAMS</option>
            <option value="3rd Year">3rd Year BAMS</option>
            <option value="4th Year">4th Year BAMS</option>
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Resource Types</option>
            <option value="NOTES">Notes & Syntheses</option>
            <option value="STUDY_MATERIAL">Study Material</option>
            <option value="PRACTICE_QUESTIONS">Practice Questions</option>
            <option value="REVISION_RESOURCE">Revision Resource</option>
            <option value="LECTURE_RECORDING">Lecture Recording</option>
            <option value="ASSIGNMENT">Assignment</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Review Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="APPROVED">Approved</option>
            <option value="PUBLISHED">Published</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
      </div>

      {/* Resource Cards Grid */}
      {loading ? (
        <DashboardLoadingSkeleton />
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/30 border border-slate-800">
          <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h4 className="text-base font-semibold text-slate-300">No educational materials match your criteria</h4>
          <p className="text-xs text-slate-500 mt-1">Publish study notes, revision guides, or lecture recordings for your enrolled students.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((res) => (
            <div
              key={res.id}
              className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800/90 hover:border-emerald-500/40 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {res.academic_year}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {res.resource_type.replace("_", " ")}
                    </span>
                  </div>
                  {getWorkflowBadge(res.workflow_status, res.is_published)}
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-100 leading-snug">{res.title}</h4>
                  <p className="text-xs text-emerald-400 font-medium mt-1">{res.subject_name}</p>
                  {res.description && (
                    <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                      {res.description}
                    </p>
                  )}
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60 text-[11px] text-slate-400 space-y-1">
                  {res.unit_name && <div><strong className="text-slate-300">Unit:</strong> {res.unit_name}</div>}
                  {res.topic_name && <div><strong className="text-slate-300">Topic:</strong> {res.topic_name}</div>}
                  <div><strong className="text-slate-300">Target Group:</strong> {res.class_or_batch || "All Students"}</div>
                </div>

                {res.reviewer_feedback && (
                  <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-200 text-[11px] space-y-0.5">
                    <strong className="text-amber-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Reviewer Notes:
                    </strong>
                    <p className="text-amber-100/90">{res.reviewer_feedback}</p>
                  </div>
                )}

                {res.is_ai_generated && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-950/40 text-amber-300 border border-amber-500/30 text-[11px]">
                    <Sparkles className="w-3 h-3 shrink-0" />
                    <span>AI-Generated Pedagogy (Subject to Review)</span>
                  </div>
                )}
              </div>

              {/* Workflow Actions & Controls */}
              <div className="mt-5 pt-3 border-t border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 text-[11px]">{res.created_at?.slice(0, 10)}</span>
                  <div className="flex items-center gap-1.5">
                    {res.file_url && (
                      <a
                        href={res.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 rounded-lg bg-emerald-600/80 hover:bg-emerald-600 text-white font-semibold text-xs inline-flex items-center gap-1 transition-colors"
                      >
                        View <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    <button
                      onClick={() => handleDelete(res.id)}
                      className="p-1 rounded-lg text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
                      title="Delete Resource"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Workflow Transition Dropdown */}
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/40 text-[11px]">
                  <span className="text-slate-400 font-medium">Workflow:</span>
                  <select
                    value={res.workflow_status || (res.is_published ? "PUBLISHED" : "DRAFT")}
                    onChange={(e) => handleUpdateWorkflow(res.id, e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-0.5 text-[11px] text-slate-200 focus:outline-none focus:border-emerald-500 transition"
                  >
                    <option value="DRAFT">Save as Draft</option>
                    <option value="SUBMITTED">Submit for Review</option>
                    <option value="UNDER_REVIEW">Under Review</option>
                    <option value="APPROVED">Approved</option>
                    <option value="PUBLISHED">Publish to Students</option>
                    <option value="ARCHIVED">Archive Resource</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-950 border border-emerald-500/30 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-emerald-400" /> Create Educational Resource
              </h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Resource Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Srotas Classification & Dushti Lakshana Reference Notes"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Resource Type *</label>
                  <select
                    value={formData.resource_type}
                    onChange={(e) => setFormData({ ...formData, resource_type: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="NOTES">Notes & Study Guides</option>
                    <option value="STUDY_MATERIAL">Study Material / Treatises</option>
                    <option value="PRACTICE_QUESTIONS">Practice Questions / Mock Tests</option>
                    <option value="REVISION_RESOURCE">Revision Resource</option>
                    <option value="LECTURE_RECORDING">Lecture Recording Link</option>
                    <option value="ASSIGNMENT">Clinical Assignment</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Academic Year *</label>
                  <select
                    value={formData.academic_year}
                    onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="1st Year">1st Year BAMS</option>
                    <option value="2nd Year">2nd Year BAMS</option>
                    <option value="3rd Year">3rd Year BAMS</option>
                    <option value="4th Year">4th Year BAMS</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Subject Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.subject_name}
                    onChange={(e) => setFormData({ ...formData, subject_name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Class / Batch Target</label>
                  <input
                    type="text"
                    placeholder="e.g. All, Batch A, Clinical Group 2"
                    value={formData.class_or_batch}
                    onChange={(e) => setFormData({ ...formData, class_or_batch: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Syllabus Unit Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Unit 3: Roganidana & Samprapti"
                    value={formData.unit_name}
                    onChange={(e) => setFormData({ ...formData, unit_name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Specific Topic</label>
                  <input
                    type="text"
                    placeholder="e.g. Ama Lakshana & Agni Mandala"
                    value={formData.topic_name}
                    onChange={(e) => setFormData({ ...formData, topic_name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Description / Summary</label>
                <textarea
                  rows={2}
                  placeholder="Key instructions or summary for your students..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Document / Recording Link (Optional)</label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/... or lecture recording URL"
                  value={formData.file_url}
                  onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Initial Workflow State</label>
                  <select
                    value={formData.workflow_status}
                    onChange={(e) => setFormData({ ...formData, workflow_status: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="DRAFT">Save as Draft (Private)</option>
                    <option value="SUBMITTED">Submit for Department Review</option>
                    <option value="PUBLISHED">Publish Directly to Enrolled Students</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="modal_ai_generated"
                    checked={formData.is_ai_generated}
                    onChange={(e) => {
                      const isAi = e.target.checked;
                      setFormData({
                        ...formData,
                        is_ai_generated: isAi,
                        // AI-generated content cannot be published directly without review
                        workflow_status: isAi && formData.workflow_status === "PUBLISHED" ? "SUBMITTED" : formData.workflow_status
                      });
                    }}
                    className="rounded border-slate-700 text-emerald-600 focus:ring-0"
                  />
                  <label htmlFor="modal_ai_generated" className="text-slate-300 font-medium cursor-pointer text-xs">
                    Tag as AI-Generated Pedagogical Content (Requires Review)
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? "Saving..." : "Save & Proceed"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
