"use client";

import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowRight, Play } from "lucide-react";
import StatsBar from "./StatsBar";
import AuthPromptModal from "./AuthPromptModal";

const DemoModal = dynamic(() => import("./DemoModal"), { ssr: false });

export default function HeroSection() {
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const handleGetStarted = () => {
    // Navigate smoothly to skill diagnostic without forcing an admin role
  };

  return (
    <section className="relative overflow-hidden bg-[#F6F3EB] dark:bg-[#07160e] pt-4 sm:pt-6 lg:pt-8 pb-16 lg:pb-24 px-4 sm:px-6 lg:px-10 transition-colors duration-300">
      {/* Background Artwork */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-0">
        <img
          src="/hero-bg.jpg"
          alt="Aayuraura Hero Artwork"
          fetchPriority="high"
          loading="eager"
          className="w-full h-full object-cover object-right-top sm:object-right opacity-95 dark:opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#F6F3EB] via-[#F6F3EB]/75 to-transparent dark:from-[#07160e] dark:via-[#07160e]/80 dark:to-transparent lg:w-[56%]" />
      </div>

      {/* Subtle organic background line accents */}
      <div 
        aria-hidden="true" 
        className="pointer-events-none absolute top-0 left-0 w-80 h-80 opacity-20 z-0"
        style={{
          backgroundImage: `radial-gradient(#0E2F1F 1px, transparent 1px), radial-gradient(#0E2F1F 1px, #F6F3EB 1px)`,
          backgroundSize: '24px 24px',
          backgroundPosition: '0 0, 12px 12px',
          maskImage: 'radial-gradient(circle at 15% 15%, black 40%, transparent 80%)'
        }}
      />

      <div className="max-w-[1400px] mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center min-h-[480px] lg:min-h-[540px]">
          {/* Left Column: Headline, Copy, CTAs & Stats (6 cols) */}
          <div className="lg:col-span-6 flex flex-col items-start space-y-5 lg:space-y-6 pt-2 sm:pt-4">
            {/* Welcome Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF7F2] dark:bg-emerald-950/80 backdrop-blur-xs border border-[#E5DFD3] dark:border-emerald-800/60 text-[#0E2F1F] dark:text-emerald-300 text-xs font-semibold tracking-wide shadow-xs">
              <span className="text-sm">🍃</span>
              <span>Welcome to Aayuraura</span>
            </div>

            {/* Serif Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-bold font-serif-heading text-[#1A241E] dark:text-[#F6F3EB] leading-[1.14] tracking-tight">
              Bridging Ayurveda,<br />
              <span className="text-[#C87D32]">Academia & Industry</span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-[#5C6B61] dark:text-[#9fbead] leading-relaxed max-w-lg">
              An intelligent platform that empowers Ayush students, connects industry opportunities, and preserves the timeless wisdom of Ayurveda.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 pt-1">
              <Link
                href="/student/assessments"
                onClick={handleGetStarted}
                className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-[#0E2F1F] hover:bg-[#184A33] text-white font-semibold text-sm sm:text-base shadow-lg shadow-[#0E2F1F]/20 dark:shadow-emerald-900/30 hover:shadow-xl transition-all group"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <button
                onClick={() => setIsDemoOpen(true)}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full border border-[#E5DFD3] dark:border-white/20 bg-[#F6F3EB] dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 text-[#0E2F1F] dark:text-white font-semibold text-sm sm:text-base shadow-xs hover:shadow transition-all cursor-pointer"
              >
                <div className="w-5 h-5 rounded-full border border-[#0E2F1F] dark:border-white flex items-center justify-center">
                  <Play className="w-2.5 h-2.5 fill-current text-[#0E2F1F] dark:text-white ml-0.5" />
                </div>
                <span>Watch Demo</span>
              </button>
            </div>

            {/* Stats Bar */}
            <div className="w-full pt-2">
              <StatsBar />
            </div>
          </div>

          {/* Right Column: Visual space where the 3D diorama in the background artwork shines (6 cols) */}
          <div className="lg:col-span-6 min-h-[300px] sm:min-h-[400px] lg:min-h-[500px]" />
        </div>
      </div>

      {/* Demo Tour Modal */}
      {isDemoOpen && (
        <DemoModal isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />
      )}

      {/* Auth Prompt Modal for Get Started when logged-out */}
      <AuthPromptModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        featureTitle="Diagnostic Skill Assessment"
        targetRoute="/student/assessments"
      />
    </section>
  );
}
