"use client";

import React from "react";
import { RefreshCw } from "lucide-react";

interface ReloadButtonProps {
  className?: string;
  label?: string;
}

export default function ReloadButton({
  className = "w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl border border-[#D5DED8] dark:border-[#304036] bg-white dark:bg-[#17211B] hover:bg-neutral-50 dark:hover:bg-[#223128] text-xs font-semibold text-[#17231C] dark:text-[#F1F6F2] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2F6B4F]",
  label = "Retry Connection",
}: ReloadButtonProps) {
  const handleReload = () => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  return (
    <button type="button" onClick={handleReload} className={className}>
      <RefreshCw className="w-3.5 h-3.5" />
      <span>{label}</span>
    </button>
  );
}
