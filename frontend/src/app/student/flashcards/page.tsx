"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function StudentFlashcardsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/bams/flashcards");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#F8FAF6] dark:bg-[#0B120E] flex items-center justify-center font-sans">
      <div className="animate-pulse text-xs font-semibold text-emerald-700 dark:text-emerald-400">
        Loading BAMS Active Recall Flashcards...
      </div>
    </div>
  );
}
