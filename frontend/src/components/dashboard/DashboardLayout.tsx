"use client";

import React from "react";
import Navbar from "@/components/Navbar";

interface DashboardLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export default function DashboardLayout({
  children,
  className = "",
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-[#F7F9F4] dark:bg-[#0D1511] text-[#17231C] dark:text-[#F1F6F2] flex flex-col selection:bg-[#2F6B4F] selection:text-white dark:selection:bg-[#78B895] dark:selection:text-[#0D1511] transition-colors duration-200">
      <Navbar />
      <main className={`flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-24 md:pb-8 space-y-8 ${className}`}>
        {children}
      </main>
    </div>
  );
}
