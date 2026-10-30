"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, X, BookOpen, Sparkles, Building, Briefcase, Award, ArrowRight } from "lucide-react";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SEARCH_ITEMS = [
  { title: "AI Skill Gap Analysis & Career Roadmap", category: "AI Studio", href: "/ai-career", icon: Sparkles },
  { title: "Interactive 3D Ayurveda & Marma Anatomy", category: "Learning", href: "/interactive-3d", icon: BookOpen },
  { title: "Free Health Camps & Volunteer Registry", category: "Opportunities", href: "/camps", icon: Award },
  { title: "Ayurvedic Herbs & Phytochemistry Database", category: "Research", href: "/herbs-research", icon: BookOpen },
  { title: "Institution Analytics & Student Skill Tracker", category: "Institute", href: "/institution/dashboard", icon: Building },
  { title: "Industry Postings & Clinical Internships", category: "Careers", href: "/industry/dashboard", icon: Briefcase },
  { title: "Verified Credentials & Trust System", category: "Security", href: "/verification", icon: Award },
  { title: "Digital Portfolio & Badges Showcase", category: "Portfolio", href: "/student/portfolio", icon: Sparkles },
  { title: "Community & Discussion Forum", category: "Community", href: "/community-forum", icon: BookOpen },
  { title: "Learning Hub - Sanskrit Shlokas & Notes", category: "Knowledge", href: "/learning-hub", icon: BookOpen },
];

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");

  if (!isOpen) return null;

  const filtered = SEARCH_ITEMS.filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[#FFFFFF] dark:bg-[#17211B] rounded-2xl shadow-2xl border border-[#D5DED8] dark:border-[#304036] overflow-hidden transition-colors duration-300">
        
        {/* Search Input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#D5DED8] dark:border-[#304036]">
          <Search className="w-5 h-5 text-[#2F6B4F] dark:text-[#78B895] shrink-0" />
          <input
            type="text"
            placeholder="Search herbs, 3D models, internships, shlokas, institutions..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full text-base text-[#17231C] dark:text-[#F1F6F2] placeholder-[#68776D] dark:placeholder-[#98A99E] bg-transparent outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#68776D] dark:text-[#98A99E] hover:text-[#17231C] dark:hover:text-[#F1F6F2] hover:bg-[#EEF4EF] dark:hover:bg-[#223128] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-1">
          {filtered.length > 0 ? (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              return (
                <Link
                  key={idx}
                  href={item.href}
                  onClick={onClose}
                  className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-[#EEF4EF] dark:hover:bg-[#223128] transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#DCEBE1] dark:bg-[#294637] text-[#2F6B4F] dark:text-[#78B895] flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-[#17231C] dark:text-[#F1F6F2] group-hover:text-[#2F6B4F] dark:group-hover:text-[#78B895]">
                        {item.title}
                      </div>
                      <div className="text-xs text-[#68776D] dark:text-[#98A99E]">{item.category}</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#68776D] dark:text-[#98A99E] group-hover:text-[#2F6B4F] dark:group-hover:text-[#78B895] group-hover:translate-x-1 transition-all" />
                </Link>
              );
            })
          ) : (
            <div className="p-8 text-center text-sm text-[#68776D] dark:text-[#98A99E]">
              No results found for &ldquo;{query}&rdquo;
            </div>
          )}
        </div>

        <div className="px-5 py-2.5 bg-[#F7F9F4] dark:bg-[#0D1511] border-t border-[#D5DED8] dark:border-[#304036] text-[11px] text-[#68776D] dark:text-[#98A99E] flex justify-between items-center">
          <span>Quick jump to Aayuraura resources</span>
          <span>Press ESC to close</span>
        </div>
      </div>
    </div>
  );
}
