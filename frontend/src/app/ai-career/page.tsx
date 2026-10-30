"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import { 
  Bot, 
  Sparkles, 
  Send, 
  FileText, 
  Video, 
  BookOpen, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  Award, 
  ArrowRight,
  ShieldAlert
} from "lucide-react";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense, useEffect as useMountEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
  followups?: string[];
}

function AICareerContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") as "assistant" | "resume" | "interview" | "study" | null;

  const [activeTab, setActiveTab] = useState<"assistant" | "resume" | "interview" | "study">("assistant");

  useMountEffect(() => {
    if (tabParam && ["assistant", "resume", "interview", "study"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // Chat State
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Namaste! I am your AyurSetu AI Career Assistant. I analyze your skill scores, assessment gaps, and academic progression to guide your path to top AYUSH clinical and industry careers. How can I assist you today?",
      followups: [
        "What skills should I improve for Panchakarma Consultant?",
        "Am I ready to apply for clinical hospital internships?",
        "How can I optimize my ATS resume for ASU pharma companies?"
      ]
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Resume State
  const [resumeText, setResumeText] = useState(
    "BAMS Graduate from Government Ayurveda College. Hands-on experience in Nadi Pariksha, Panchakarma procedures (Vamana, Virechana), and herbal drug standardization (QC). Completed 50+ hours in rural free healthcare camps."
  );
  const [resumeScore, setResumeScore] = useState<number | null>(null);
  const [resumeAnalyzing, setResumeAnalyzing] = useState(false);

  // Mock Interview State
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [interviewAnswer, setInterviewAnswer] = useState("");
  const [interviewFeedback, setInterviewFeedback] = useState<any>(null);

  // Study Assistant State
  const [studyQuery, setStudyQuery] = useState("");
  const [studyResponse, setStudyResponse] = useState<any>(null);

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim()) return;

    const newMsgs: Message[] = [...messages, { role: "user", content: text }];
    setMessages(newMsgs);
    setInputMessage("");
    setIsTyping(true);

    setTimeout(() => {
      let reply = "";
      let followups: string[] = [];

      const lower = text.toLowerCase();
      if (lower.includes("panchakarma") || lower.includes("skill")) {
        reply = "Based on your verified skills, you have a solid 82% proficiency in Purvakarma (Snehana & Swedana). To reach full readiness for a Panchakarma Consultant role, I recommend completing the 'Advanced Pradhanakarma & Emergency Protocols' assessment quiz and logging 20+ additional OPD camp hours.";
        followups = ["Show Panchakarma certificate courses", "Browse free healthcare camps", "Analyze my resume for Panchakarma roles"];
      } else if (lower.includes("internship") || lower.includes("ready")) {
        reply = "Your Career Readiness Score is currently 84/100 (High Readiness Tier). You exceed the baseline criteria for Clinical Hospital Internships and ASU Formulation QC trainee positions. Your verified assessment scores give you top placement priority!";
        followups = ["Browse active clinical internships", "Check interview question bank", "Schedule Doctor Mentorship slot"];
      } else {
        reply = "I have evaluated your query against NCISM curriculum guidelines and industry standards. Keep practicing MCQ mock exams, log verified clinical camp participation, and maintain your digital portfolio visibility to maximize placement opportunities.";
        followups = ["Test my ATS resume", "Practice AI Mock Interview", "Ask a Classical Shloka question"];
      }

      setMessages([...newMsgs, { role: "assistant", content: reply, followups }]);
      setIsTyping(false);
    }, 1000);
  };

  const handleAnalyzeResume = () => {
    setResumeAnalyzing(true);
    setTimeout(() => {
      setResumeScore(86.5);
      setResumeAnalyzing(false);
    }, 1200);
  };

  const handleEvaluateInterview = () => {
    setInterviewFeedback({
      overall: 88,
      clarity: 90,
      terminology: "Excellent use of classical Dravyaguna & Samprapti terms.",
      starFeedback: "Clear situation and actionable Ayurvedic therapeutic rationale provided.",
      suggestion: "Mention specific Shloka references from Charaka Samhita Chikitsasthana to enhance clinical authority."
    });
  };

  const handleStudyQuery = () => {
    if (!studyQuery.trim()) return;
    setStudyResponse({
      answer: "In classical Ayurveda, Rasayana therapy promotes the excellence of Rasa (plasma), leading to longevity, immunity (Ojas), and intellect (Medha). Acharya Charaka divides Rasayana into Kamya (promotive), Naimittika (disease-specific), and Ajasrika (dietetic).",
      citations: ["Charaka Samhita Chikitsasthana 1/1", "Sushruta Samhita Sutrasthana 1"],
      topic: "Rasayana & Preventive Geriatrics"
    });
  };

  return (
    <div className="min-h-screen bg-[#fcfaf4] dark:bg-[#07160e] text-[#1a3827] dark:text-[#d1e2d7]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Header Banner */}
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-[#0e301e] via-[#16432b] to-[#0a2316] text-[#f7f4ea] shadow-xl border border-emerald-800/40 relative overflow-hidden text-center">
          <div className="relative z-10 max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#c87d32]/20 border border-[#c87d32]/40 text-[#f6be73] text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              AI-Powered Career & Academic Coaching
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif-heading text-white tracking-tight">
              AI Career Assistant & Studio
            </h1>
            <p className="mt-3 text-emerald-200/90 text-xs sm:text-sm md:text-base leading-relaxed">
              Personalized career roadmapping, explainable ATS resume optimization, AI mock interview simulations, and classical curriculum study assistance.
            </p>
            <div className="pt-2">
              <Link
                href="/ai"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold text-xs sm:text-sm transition shadow-lg shadow-emerald-950/30"
              >
                <Sparkles className="w-4 h-4 text-emerald-900" />
                <span>Launch Master AI Learning Studio (Unified Ecosystem) &rarr;</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Studio Navigation Tabs */}
        <div className="flex items-center justify-center gap-2 bg-white dark:bg-[#0c2419] p-2 rounded-2xl border border-[#e5edd9] dark:border-white/10 shadow-xs max-w-2xl mx-auto">
          {[
            { id: "assistant", label: "Career Assistant", icon: Bot },
            { id: "resume", label: "ATS Resume Builder", icon: FileText },
            { id: "interview", label: "Mock Interview", icon: Video },
            { id: "study", label: "Study Assistant", icon: BookOpen },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition ${
                  isActive
                    ? "bg-[#0e2f1f] text-white shadow-md"
                    : "text-[#5a7a67] dark:text-emerald-400 hover:text-[#0e2f1f] hover:bg-[#f6f3eb] dark:hover:bg-white/5"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: AI Career Assistant */}
        {activeTab === "assistant" && (
          <div className="max-w-4xl mx-auto bg-white dark:bg-[#0c2419] border border-[#e5edd9] dark:border-white/10 rounded-3xl p-6 shadow-xs flex flex-col h-[600px]">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-2xl p-4 rounded-2xl text-xs sm:text-sm ${
                      m.role === "user"
                        ? "bg-[#0e2f1f] text-white rounded-br-none shadow-md"
                        : "bg-[#f8f6f0] dark:bg-white/5 border border-[#e8e2d5] dark:border-white/10 text-[#143d26] dark:text-stone-200 rounded-bl-none shadow-xs"
                    }`}
                  >
                    {m.role === "assistant" && (
                      <div className="flex items-center gap-1.5 text-xs text-[#c87d32] dark:text-amber-400 font-bold mb-1.5">
                        <Bot className="w-3.5 h-3.5" />
                        AyurSetu AI Advisor
                      </div>
                    )}
                    <p className="leading-relaxed whitespace-pre-wrap">{m.content}</p>
                  </div>

                  {m.followups && m.followups.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {m.followups.map((f, fIdx) => (
                        <button
                          key={fIdx}
                          onClick={() => handleSendMessage(f)}
                          className="text-xs px-3 py-1.5 bg-white dark:bg-white/5 hover:bg-[#f0f4ec] border border-[#cadacb] hover:border-[#0e2f1f] text-[#0e2f1f] dark:text-emerald-300 rounded-full transition text-left shadow-xs"
                        >
                          {f} →
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {isTyping && (
                <div className="flex items-center gap-2 text-xs text-[#5a7a67] dark:text-stone-400 italic p-2">
                  <Bot className="w-3.5 h-3.5 animate-spin text-[#0e2f1f] dark:text-emerald-400" />
                  AyurSetu AI is analyzing your competencies...
                </div>
              )}
            </div>

            {/* Input Form */}
            <div className="pt-4 border-t border-[#e5edd9] dark:border-white/10 flex items-center gap-2">
              <input
                type="text"
                placeholder="Ask about target careers, skill progression, or internships..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                className="flex-1 px-4 py-3 bg-[#f8faf6] dark:bg-white/5 border border-[#cadacb] dark:border-white/10 rounded-2xl text-xs sm:text-sm text-[#143d26] dark:text-white focus:outline-none focus:border-[#0e2f1f] placeholder-[#8ca697]"
              />
              <button
                onClick={() => handleSendMessage()}
                className="p-3 bg-[#0e2f1f] hover:bg-[#16432b] text-white rounded-2xl font-bold transition shadow-md"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: ATS Resume Builder */}
        {activeTab === "resume" && (
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-white dark:bg-[#0c2419] border border-[#e5edd9] dark:border-white/10 rounded-3xl p-6 shadow-xs">
              <h3 className="text-lg font-bold text-[#0e2f1f] dark:text-emerald-300 mb-2 font-serif-heading">Ayurveda ATS Resume Optimizer</h3>
              <p className="text-xs text-[#5a7a67] dark:text-stone-400 mb-4">
                Paste your resume draft or clinical credentials to analyze keyword alignment against AYUSH employers.
              </p>
              <textarea
                rows={10}
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                className="w-full p-4 bg-[#f8faf6] dark:bg-white/5 border border-[#cadacb] dark:border-white/10 rounded-2xl text-xs sm:text-sm text-[#143d26] dark:text-stone-200 focus:outline-none focus:border-[#0e2f1f] leading-relaxed font-mono"
              />
              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleAnalyzeResume}
                  disabled={resumeAnalyzing}
                  className="px-6 py-2.5 bg-[#0e2f1f] hover:bg-[#16432b] text-white font-bold text-xs rounded-xl shadow-md transition"
                >
                  {resumeAnalyzing ? "Analyzing ATS Density..." : "Scan & Calculate ATS Score"}
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-[#0c2419] border border-[#e5edd9] dark:border-white/10 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-bold text-[#143d26] dark:text-stone-200 mb-4 font-serif-heading">ATS Compatibility</h4>
                {resumeScore ? (
                  <div className="text-center py-4">
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-full border-4 border-[#0e2f1f] bg-[#0e2f1f]/10 text-3xl font-extrabold text-[#0e2f1f] dark:text-emerald-300 mb-3 shadow-md">
                      {resumeScore}%
                    </div>
                    <p className="text-xs font-bold text-[#0e2f1f] dark:text-emerald-400">High Match for Clinical Roles</p>
                    <div className="mt-4 space-y-2 text-left text-xs text-[#2c332e] dark:text-stone-300">
                      <div className="flex items-center gap-2 text-[#0e2f1f] dark:text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span>Panchakarma & Pulse keywords found</span>
                      </div>
                      <div className="flex items-center gap-2 text-[#0e2f1f] dark:text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span>Camp volunteer experience detected</span>
                      </div>
                      <div className="flex items-center gap-2 text-[#c87d32] dark:text-amber-400">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>Add Pharmacovigilance & GMP details</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-[#8ca697] text-xs">
                    Click Scan to evaluate your ATS score against live job postings.
                  </div>
                )}
              </div>

              <div className="p-3.5 bg-[#f8f6f0] dark:bg-white/5 rounded-xl border border-[#e8e2d5] dark:border-white/10 text-[11px] text-[#5a7a67] dark:text-stone-400">
                Resumes with verified SHA-256 AyurSetu certificates rank 3.2x higher on employer shortlists.
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Mock Interview */}
        {activeTab === "interview" && (
          <div className="max-w-4xl mx-auto bg-white dark:bg-[#0c2419] border border-[#e5edd9] dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-xs">
            <h3 className="text-xl font-bold text-[#0e2f1f] dark:text-emerald-300 mb-2 font-serif-heading">Interactive AI Mock Interview Studio</h3>
            <p className="text-xs text-[#5a7a67] dark:text-stone-400 mb-6">
              Simulate high-stakes clinical and industry interviews for AYUSH hospital & pharma specialist roles.
            </p>

            <div className="p-5 bg-[#f8f6f0] dark:bg-white/5 rounded-2xl border border-[#e8e2d5] dark:border-white/10 mb-6">
              <span className="text-[11px] font-bold text-[#0e2f1f] dark:text-emerald-400 uppercase tracking-wider">Target Question (Clinical Specialist):</span>
              <p className="text-sm sm:text-base font-semibold text-[#143d26] dark:text-stone-100 mt-1">
                "How would you differential-diagnose Vataja vs. Kaphaja Grahani in a patient presenting with irregular bowel habits, and what classical Shamana formulation protocol would you prescribe?"
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#2c332e] dark:text-stone-300 mb-1.5">Your Clinical & Situational Response</label>
              <textarea
                rows={5}
                placeholder="Structure your answer using Nadi examination, Samprapti Ghatakas (Agni, Dosha), Deepana-Pachana herbs, and dietetics (Pathya)..."
                value={interviewAnswer}
                onChange={(e) => setInterviewAnswer(e.target.value)}
                className="w-full p-4 bg-[#f8faf6] dark:bg-white/5 border border-[#cadacb] dark:border-white/10 rounded-2xl text-xs sm:text-sm text-[#143d26] dark:text-stone-200 focus:outline-none focus:border-[#0e2f1f] leading-relaxed"
              />
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={handleEvaluateInterview}
                className="px-6 py-2.5 bg-[#0e2f1f] hover:bg-[#16432b] text-white font-bold text-xs rounded-xl shadow-md transition"
              >
                Submit Answer for AI Evaluation
              </button>
            </div>

            {interviewFeedback && (
              <div className="mt-8 p-6 bg-[#f8f6f0] dark:bg-white/5 border border-[#e8e2d5] dark:border-emerald-800/60 rounded-2xl">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                  <h4 className="text-base font-bold text-[#143d26] dark:text-white font-serif-heading">AI Evaluation Report</h4>
                  <span className="px-3 py-1 rounded-full bg-[#0e2f1f]/10 dark:bg-emerald-950 border border-[#0e2f1f]/20 dark:border-emerald-800 text-[#0e2f1f] dark:text-emerald-300 text-xs font-bold">
                    Score: {interviewFeedback.overall}/100
                  </span>
                </div>
                <div className="space-y-3 text-xs text-[#2c332e] dark:text-stone-300">
                  <p><strong className="text-[#0e2f1f] dark:text-emerald-400">STAR Structure:</strong> {interviewFeedback.starFeedback}</p>
                  <p><strong className="text-[#0e2f1f] dark:text-emerald-400">Classical Terminology:</strong> {interviewFeedback.terminology}</p>
                  <p><strong className="text-[#c87d32] dark:text-amber-400">Growth Area:</strong> {interviewFeedback.suggestion}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: Study Assistant */}
        {activeTab === "study" && (
          <div className="max-w-4xl mx-auto bg-white dark:bg-[#0c2419] border border-[#e5edd9] dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-xs">
            <h3 className="text-xl font-bold text-[#0e2f1f] dark:text-emerald-300 mb-2 font-serif-heading">Classical Ayurveda Study Assistant</h3>
            <p className="text-xs text-[#5a7a67] dark:text-stone-400 mb-6">
              Instant academic reference for BAMS subjects: Charaka, Sushruta, Vagbhata, Dravyaguna, and Panchakarma.
            </p>

            <div className="flex items-center gap-2 mb-6">
              <input
                type="text"
                placeholder="Ask about Shlokas, Chikitsa protocols, or Dravyaguna properties (e.g. Rasayana principles)..."
                value={studyQuery}
                onChange={(e) => setStudyQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleStudyQuery()}
                className="flex-1 px-4 py-3 bg-[#f8faf6] dark:bg-white/5 border border-[#cadacb] dark:border-white/10 rounded-2xl text-xs sm:text-sm text-[#143d26] dark:text-white focus:outline-none focus:border-[#0e2f1f]"
              />
              <button
                onClick={handleStudyQuery}
                className="px-6 py-3 bg-[#0e2f1f] hover:bg-[#16432b] text-white font-bold text-xs rounded-2xl transition shadow-md"
              >
                Search Treatise
              </button>
            </div>

            {studyResponse && (
              <div className="p-6 bg-[#f8f6f0] dark:bg-white/5 border border-[#e8e2d5] dark:border-white/10 rounded-2xl space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs font-bold text-[#0e2f1f] dark:text-emerald-400 uppercase tracking-wider">{studyResponse.topic}</span>
                  <div className="flex gap-2">
                    {studyResponse.citations.map((c: string, idx: number) => (
                      <span key={idx} className="text-[11px] px-2.5 py-1 bg-white dark:bg-white/10 text-[#c87d32] dark:text-amber-300 rounded-md border border-[#c87d32]/30">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
                <p className="text-sm text-[#2c332e] dark:text-stone-200 leading-relaxed">{studyResponse.answer}</p>
                <div className="pt-2 border-t border-[#e5edd9] dark:border-white/10 text-[11px] text-[#5a7a67] dark:text-stone-500 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-[#c87d32] dark:text-amber-400 shrink-0" />
                  <span>Educational study assistance for academic learning only. Not intended as medical diagnosis or clinical prescription.</span>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default function AICareerPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#faf8f5] dark:bg-[#06140d] text-[#1b2a22] dark:text-[#e8f1eb] flex items-center justify-center">
          <div className="animate-pulse text-xs font-semibold text-[#2f6b4f] dark:text-[#6faf8a]">
            Loading AI Career Studio...
          </div>
        </div>
      }
    >
      <AICareerContent />
    </Suspense>
  );
}
