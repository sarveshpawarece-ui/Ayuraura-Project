"use client";

import React, { useState } from "react";
import {
  Search,
  BookOpen,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Tag,
  Filter,
  FileText,
  Layers,
  GraduationCap
} from "lucide-react";
import { api } from "@/lib/api";

interface SearchResultItem {
  id: string;
  title: string;
  snippet: string;
  category: string;
  subject: string;
  source_citation: string;
  relevance_score: number;
  url?: string;
}

interface SearchResponse {
  query: string;
  total_results: number;
  results: SearchResultItem[];
  ai_synthesis: string;
  suggested_followups: string[];
}

interface EducationalSearchProps {
  onAskAI?: (query: string) => void;
}

export default function EducationalSearch({ onAskAI }: EducationalSearchProps) {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResponse, setSearchResponse] = useState<SearchResponse | null>(null);

  const handleSearch = async (queryText?: string) => {
    const q = (queryText || query).trim();
    if (!q || isSearching) return;
    setIsSearching(true);
    try {
      const res = await api.post("/ai-ecosystem/search", { query: q });
      if (res.data) {
        setSearchResponse(res.data);
      }
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. SEARCH INPUT HERO */}
      <div className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-gray-100 dark:border-gray-800">
          <div className="p-2 rounded-xl bg-blue-600 text-white shadow-md shadow-blue-600/20">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              AI Educational Content & Classical Treatise Search
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Natural Language Semantic Search Across Brihat-trayi Treatises, NCISM Syllabus, Case Studies & Private Notes
            </p>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="flex items-center gap-2"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search concepts, shlokas, or herbs (e.g. 'Panchakarma', 'Triphala Rasa', 'Shat-Kriya Kala')..."
              className="w-full py-3 pl-10 pr-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={!query.trim() || isSearching}
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 transition shadow-lg shadow-blue-600/20"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isSearching ? "Searching..." : "Search"}</span>
          </button>
        </form>

        {/* Quick query pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] text-gray-400 font-semibold">Popular queries:</span>
          {["Panchakarma", "Shat Kriya Kala", "Triphala", "Marma Sharira", "Vata Vyadhi"].map((tag, tIdx) => (
            <button
              key={tIdx}
              onClick={() => {
                setQuery(tag);
                handleSearch(tag);
              }}
              className="px-2.5 py-1 rounded-lg text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium transition"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* 2. SEARCH RESULTS & SYNTHESIS */}
      {searchResponse && (
        <div className="space-y-4 animate-fadeIn">
          {/* AI Synthesis Summary */}
          <div className="p-4 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 rounded-2xl flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-blue-900 dark:text-blue-200 text-xs block mb-0.5">
                AI Knowledge Engine Synthesis:
              </span>
              <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
                {searchResponse.ai_synthesis}
              </p>
            </div>
          </div>

          {/* Results List */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white">
              Retrieved Resources ({searchResponse.total_results}):
            </h4>

            {searchResponse.results.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-400 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
                No matching classical resources found. Try another search term.
              </div>
            ) : (
              searchResponse.results.map((item, rIdx) => (
                <div
                  key={rIdx}
                  className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm text-xs space-y-2 hover:border-blue-300 transition"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-gray-900 dark:text-white">
                        {item.title}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                        {item.category}
                      </span>
                    </div>

                    <button
                      onClick={() => onAskAI?.(`Tell me more about ${item.title}`)}
                      className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      <span>Ask AI About This</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>

                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {item.snippet}
                  </p>

                  <div className="flex items-center justify-between pt-1 border-t border-gray-100 dark:border-gray-800 text-[11px] text-gray-400">
                    <span>Source: {item.source_citation}</span>
                    <span>Subject: {item.subject}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
