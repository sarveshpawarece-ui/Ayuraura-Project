"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Sparkles, Target, Search, CheckCircle2, ChevronRight, AlertCircle, Trash2, ArrowRight, Check, X } from "lucide-react";
import { api } from "@/lib/api";

const CATEGORY_FILTERS = [
  { id: "ALL", label: "All Roles" },
  { id: "AYURVEDA_PHARMACEUTICAL", label: "Pharma R&D" },
  { id: "AYURVEDA_RESEARCH", label: "Clinical Research" },
  { id: "AYURVEDA_QUALITY", label: "Quality Control" },
  { id: "AYURVEDA_CLINICAL", label: "Clinical Practice" },
  { id: "AYURVEDA_MANUFACTURING", label: "Manufacturing & GMP" },
  { id: "AYUSH_TECHNOLOGY", label: "Ayush Tech & EMR" },
  { id: "AYURVEDA_PUBLIC_HEALTH", label: "Public Health" },
];

export default function TargetCareerPage() {
  const [careerRoles, setCareerRoles] = useState<any[]>([]);
  const [targetCareer, setTargetCareer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("ALL");

  const [selectedRoleForModal, setSelectedRoleForModal] = useState<any>(null);
  const [roleToConfirm, setRoleToConfirm] = useState<any>(null);

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    loadData();
  }, [activeCategory]);

  const loadData = async () => {
    try {
      setLoading(true);
      const categoryParam = activeCategory !== "ALL" ? `?category=${activeCategory}` : "";
      const rolesRes = await api.get(`/career-roles${categoryParam}`);
      setCareerRoles(rolesRes.data);

      try {
        const targetRes = await api.get("/students/me/target-career");
        setTargetCareer(targetRes.data.target_career);
      } catch (err) {
        // Target career empty or user not student
      }
    } catch (err: any) {
      console.error(err);
      setMessage({ type: "error", text: "Unable to load career options. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const executeSetTargetCareer = async (role: any) => {
    setSubmitting(true);
    setMessage(null);
    try {
      const res = await api.put("/students/me/target-career", { career_role_id: role.id });
      setTargetCareer(res.data.target_career);
      setSelectedRoleForModal(null);
      setRoleToConfirm(null);
      setMessage({
        type: "success",
        text: `Target career updated successfully to "${role.name}".`
      });
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.response?.data?.detail || "Unable to update your target career. Please try again."
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClearRole = async () => {
    if (!confirm("Are you sure you want to clear your current target career role?")) return;
    try {
      await api.delete("/students/me/target-career");
      setTargetCareer(null);
      setMessage({ type: "success", text: "Target career cleared." });
    } catch (err: any) {
      alert("Unable to clear target career. Please try again.");
    }
  };

  const filteredRoles = careerRoles.filter((role) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      role.name.toLowerCase().includes(q) ||
      (role.short_description && role.short_description.toLowerCase().includes(q)) ||
      (role.description && role.description.toLowerCase().includes(q)) ||
      (role.domain && role.domain.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen bg-[#F7F9F4] dark:bg-[#0D1511] text-[#17231C] dark:text-[#F1F6F2] flex flex-col transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto p-6 space-y-8">
        {/* Page Header */}
        <div className="rounded-2xl border border-[#D5DED8] dark:border-[#304036] bg-[#FFFFFF] dark:bg-[#17211B] p-6 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-[#A96F16] dark:text-[#E5B85C] text-xs font-semibold uppercase tracking-wider mb-2 border border-[#A96F16]/30 dark:border-[#E5B85C]/30">
                <Target className="w-3.5 h-3.5" /> Target Career Pathways
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-[#142019] dark:text-[#FFFFFF]">Choose Your Target Career</h1>
              <p className="text-xs text-[#526158] dark:text-[#C1CEC5] mt-1 max-w-2xl">
                Select the career path you want to prepare for. Aayuraura uses your target role to benchmark your skills and guide your learning journey.
              </p>
            </div>

            {targetCareer && (
              <Link
                href="/student/dashboard"
                className="px-5 py-2.5 rounded-xl bg-[#2F6B4F] hover:bg-[#24563F] text-white dark:bg-[#78B895] dark:hover:bg-[#91CAA8] dark:text-[#0D1511] font-bold text-xs flex items-center gap-2 transition-all shadow-md shrink-0"
              >
                Back to Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>

        {/* User Alert Message */}
        {message && (
          <div className={`p-4 rounded-xl text-xs flex items-center justify-between gap-3 border ${
            message.type === "success"
              ? "bg-[#DCEBE1] dark:bg-[#294637]/60 border-[#2F7D4A]/30 text-[#2F7D4A] dark:text-[#7BC894]"
              : "bg-red-50 dark:bg-red-950/40 border-[#B64040]/30 text-[#B64040] dark:text-[#F18484]"
          }`}>
            <div className="flex items-center gap-3">
              {message.type === "success" ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
              <span>{message.text}</span>
            </div>
            {message.type === "success" && (
              <Link href="/student/dashboard" className="underline font-bold hover:text-[#24563F] dark:hover:text-[#91CAA8]">
                View Dashboard
              </Link>
            )}
          </div>
        )}

        {/* Current Target Career Section */}
        <div className="rounded-2xl border border-[#D5DED8] dark:border-[#304036] bg-gradient-to-r from-[#DCEBE1]/40 via-[#FFFFFF] to-[#EEF4EF] dark:from-[#294637]/30 dark:via-[#17211B] dark:to-[#1D2A22] p-6 shadow-sm relative overflow-hidden space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#D5DED8] dark:border-[#304036] pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-[#A96F16]/30 dark:border-[#E5B85C]/30 flex items-center justify-center">
                <Target className="w-5 h-5 text-[#A96F16] dark:text-[#E5B85C]" />
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#A96F16] dark:text-[#E5B85C] font-bold">CURRENT TARGET CAREER</span>
                <h2 className="text-xl font-extrabold text-[#142019] dark:text-[#FFFFFF]">
                  {targetCareer ? targetCareer.name : "No Target Career Selected"}
                </h2>
              </div>
            </div>

            {targetCareer && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleClearRole}
                  className="px-3.5 py-1.5 rounded-lg bg-red-50 dark:bg-red-950/60 text-[#B64040] dark:text-[#F18484] border border-[#B64040]/30 hover:bg-red-100 dark:hover:bg-red-950/80 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear Selection
                </button>
              </div>
            )}
          </div>

          {targetCareer ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-[#68776D] dark:text-[#98A99E] block mb-1">Domain:</span>
                <span className="font-semibold text-[#2F6B4F] dark:text-[#78B895]">{targetCareer.domain || "Ayurveda R&D"}</span>
              </div>
              <div>
                <span className="text-[#68776D] dark:text-[#98A99E] block mb-1">Category:</span>
                <span className="px-2 py-0.5 rounded bg-[#EEF4EF] dark:bg-[#223128] text-[#A96F16] dark:text-[#E5B85C] font-mono text-[10px] border border-[#D5DED8] dark:border-[#304036]">
                  {targetCareer.category}
                </span>
              </div>
              <div className="md:col-span-3 pt-2 text-[#526158] dark:text-[#C1CEC5]">
                {targetCareer.description || targetCareer.short_description}
              </div>
            </div>
          ) : (
            <div className="text-xs text-[#68776D] dark:text-[#98A99E] py-2">
              Explore the career roles below and click <strong>&quot;Select Career →&quot;</strong> to set your baseline.
            </div>
          )}
        </div>

        {/* Search and Category Filter Bar */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-[#68776D] dark:text-[#98A99E] absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search career roles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] text-xs text-[#17231C] dark:text-[#F1F6F2] placeholder-[#68776D] dark:placeholder-[#98A99E] focus:border-[#2F6B4F] dark:focus:border-[#78B895] transition-colors shadow-sm"
              />
            </div>

            <span className="text-xs text-[#526158] dark:text-[#C1CEC5] font-medium">
              Showing <strong className="text-[#2F6B4F] dark:text-[#78B895]">{filteredRoles.length}</strong> roles
            </span>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs scrollbar-none">
            {CATEGORY_FILTERS.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl font-medium transition-all whitespace-nowrap ${
                  activeCategory === cat.id
                    ? "bg-[#2F6B4F] text-white dark:bg-[#78B895] dark:text-[#0D1511] font-bold shadow-sm"
                    : "bg-[#FFFFFF] dark:bg-[#17211B] text-[#526158] dark:text-[#C1CEC5] border border-[#D5DED8] dark:border-[#304036] hover:bg-[#EEF4EF] dark:hover:bg-[#223128]"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Loading / Empty / Error State */}
        {loading ? (
          <div className="p-12 text-center text-xs text-[#68776D] dark:text-[#98A99E] rounded-2xl border border-[#D5DED8] dark:border-[#304036] bg-[#FFFFFF] dark:bg-[#17211B] shadow-sm">
            Loading career roles...
          </div>
        ) : filteredRoles.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#68776D] dark:text-[#98A99E] rounded-2xl border border-[#D5DED8] dark:border-[#304036] bg-[#FFFFFF] dark:bg-[#17211B] space-y-2 shadow-sm">
            <div>No careers found matching your search criteria.</div>
            <div className="text-[#68776D] dark:text-[#98A99E]">Try another search keyword or select &quot;All Roles&quot;.</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredRoles.map((role) => {
              const isSelected = targetCareer?.id === role.id;
              return (
                <div
                  key={role.id}
                  className={`p-6 rounded-2xl border transition-all flex flex-col justify-between space-y-4 shadow-sm ${
                    isSelected
                      ? "border-[#A96F16]/50 bg-amber-500/5 dark:bg-amber-950/20"
                      : "border-[#D5DED8] dark:border-[#304036] bg-[#FFFFFF] dark:bg-[#17211B] hover:border-[#2F6B4F]/40 dark:hover:border-[#78B895]/40"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <span className="px-2.5 py-0.5 rounded-md bg-[#DCEBE1] dark:bg-[#294637] text-[#2F6B4F] dark:text-[#78B895] font-mono text-[10px] border border-[#D5DED8] dark:border-[#304036]">
                        {role.domain || "Ayush Domain"}
                      </span>
                      {isSelected && (
                        <span className="px-2.5 py-0.5 rounded-full bg-[#A96F16] dark:bg-[#E5B85C] text-white dark:text-[#0D1511] font-bold text-[10px] flex items-center gap-1">
                          <Check className="w-3 h-3" /> Current Target
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-[#142019] dark:text-[#FFFFFF]">{role.name}</h3>

                    <p className="text-xs text-[#526158] dark:text-[#C1CEC5] line-clamp-3 leading-relaxed">
                      {role.short_description || role.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#D5DED8] dark:border-[#304036] flex items-center justify-between">
                    <button
                      onClick={() => setSelectedRoleForModal(role)}
                      className="text-xs text-[#2F6B4F] dark:text-[#78B895] font-semibold flex items-center gap-1 hover:underline"
                    >
                      View Role Details <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      disabled={isSelected || submitting}
                      onClick={() => setRoleToConfirm(role)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                        isSelected
                          ? "bg-[#EEF4EF] dark:bg-[#223128] text-[#68776D] dark:text-[#98A99E] cursor-default border border-[#D5DED8] dark:border-[#304036]"
                          : "bg-[#2F6B4F] hover:bg-[#24563F] text-white dark:bg-[#78B895] dark:hover:bg-[#91CAA8] dark:text-[#0D1511]"
                      }`}
                    >
                      {isSelected ? "Current Role" : "Select Career →"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Role Blueprint Details Modal */}
        {selectedRoleForModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="max-w-xl w-full p-6 rounded-2xl border border-[#D5DED8] dark:border-[#304036] bg-[#FFFFFF] dark:bg-[#17211B] text-[#17231C] dark:text-[#F1F6F2] shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start border-b border-[#D5DED8] dark:border-[#304036] pb-4">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-[#2F6B4F] dark:text-[#78B895] font-bold">Role Details</span>
                  <h2 className="text-xl font-extrabold text-[#142019] dark:text-[#FFFFFF] mt-0.5">{selectedRoleForModal.name}</h2>
                  <p className="text-xs text-[#A96F16] dark:text-[#E5B85C] font-medium">{selectedRoleForModal.domain} • {selectedRoleForModal.category}</p>
                </div>
                <button onClick={() => setSelectedRoleForModal(null)} className="text-[#68776D] dark:text-[#98A99E] hover:text-[#17231C] dark:hover:text-[#FFFFFF] text-xs">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs text-[#526158] dark:text-[#C1CEC5] leading-relaxed">
                <div>
                  <h3 className="font-bold text-[#142019] dark:text-[#FFFFFF] mb-1 text-xs uppercase tracking-wider text-[#2F6B4F] dark:text-[#78B895]">Description</h3>
                  <p>{selectedRoleForModal.description || selectedRoleForModal.short_description}</p>
                </div>

                <div className="p-4 rounded-xl bg-[#F7F9F4] dark:bg-[#1D2A22] border border-[#D5DED8] dark:border-[#304036] space-y-2">
                  <h3 className="font-bold text-[#142019] dark:text-[#FFFFFF] text-xs uppercase tracking-wider text-[#A96F16] dark:text-[#E5B85C]">Skills You&apos;ll Be Assessed On</h3>
                  <p className="text-[#526158] dark:text-[#C1CEC5] text-xs italic">
                    Your skill assessment will evaluate the skills required for this career.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#D5DED8] dark:border-[#304036]">
                <button
                  onClick={() => setSelectedRoleForModal(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#526158] dark:text-[#C1CEC5] hover:text-[#17231C] dark:hover:text-[#FFFFFF] bg-[#EEF4EF] dark:bg-[#223128] border border-[#D5DED8] dark:border-[#304036]"
                >
                  Close
                </button>
                <button
                  disabled={targetCareer?.id === selectedRoleForModal.id || submitting}
                  onClick={() => {
                    setRoleToConfirm(selectedRoleForModal);
                    setSelectedRoleForModal(null);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-[#2F6B4F] hover:bg-[#24563F] text-white dark:bg-[#78B895] dark:hover:bg-[#91CAA8] dark:text-[#0D1511] font-bold text-xs flex items-center gap-2 shadow-md"
                >
                  <CheckCircle2 className="w-4 h-4" /> Select This Career
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Selection Confirmation Dialog */}
        {roleToConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="max-w-md w-full p-6 rounded-2xl border border-[#D5DED8] dark:border-[#304036] bg-[#FFFFFF] dark:bg-[#17211B] text-[#17231C] dark:text-[#F1F6F2] shadow-2xl space-y-5 text-center">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-[#A96F16]/30 dark:border-[#E5B85C]/30 flex items-center justify-center mx-auto text-[#A96F16] dark:text-[#E5B85C]">
                <Target className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-base font-bold text-[#142019] dark:text-[#FFFFFF]">Set Target Career</h3>
                <p className="text-xs text-[#526158] dark:text-[#C1CEC5] mt-2">
                  Set <strong>&quot;{roleToConfirm.name}&quot;</strong> as your target career?
                </p>
              </div>

              <div className="flex justify-center gap-3 pt-2">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setRoleToConfirm(null)}
                  className="px-5 py-2 rounded-xl text-xs font-semibold text-[#526158] dark:text-[#C1CEC5] hover:text-[#17231C] dark:hover:text-[#FFFFFF] bg-[#EEF4EF] dark:bg-[#223128] border border-[#D5DED8] dark:border-[#304036]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => executeSetTargetCareer(roleToConfirm)}
                  className="px-6 py-2 rounded-xl bg-[#2F6B4F] hover:bg-[#24563F] text-white dark:bg-[#78B895] dark:hover:bg-[#91CAA8] dark:text-[#0D1511] font-bold text-xs shadow-md"
                >
                  {submitting ? "Saving Target Career..." : "Confirm Career"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
