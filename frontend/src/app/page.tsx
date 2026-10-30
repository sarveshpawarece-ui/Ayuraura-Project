"use client";

import Navbar from "@/components/Navbar";
import HeroSection from "@/components/home/HeroSection";
import EcosystemSection from "@/components/home/EcosystemSection";
import Footer from "@/components/home/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F6F3EB] dark:bg-[#07160e] text-[#1A241E] dark:text-[#F6F3EB] flex flex-col selection:bg-[#0E2F1F] selection:text-white transition-colors duration-300">
      {/* Navigation Header */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Hero Section */}
        <HeroSection />

        {/* 6-Card Ecosystem Section */}
        <EcosystemSection />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
