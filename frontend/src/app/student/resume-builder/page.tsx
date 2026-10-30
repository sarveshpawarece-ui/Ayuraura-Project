"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ResumeBuilderRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/student/portfolio");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#F7F9F4] dark:bg-[#0D1511] text-[#17231C] dark:text-[#F1F6F2] flex items-center justify-center font-sans">
      <div className="animate-pulse text-xs font-semibold text-[#2F6B4F] dark:text-[#78B895]">
        Opening Aayuraura Professional Portfolio & Resume Builder...
      </div>
    </div>
  );
}
