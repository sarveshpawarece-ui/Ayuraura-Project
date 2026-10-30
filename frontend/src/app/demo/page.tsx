"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DemoRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/demo/profile");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#F7F9F4] dark:bg-[#0F1713] text-[#1B2A22] dark:text-[#E8F1EB] flex items-center justify-center">
      <div className="text-center space-y-2">
        <div className="w-8 h-8 border-2 border-[#205c3b] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-semibold text-[#205c3b] dark:text-[#6FAF8A]">
          Loading AyurSetu Interactive Demonstration Showcase...
        </p>
      </div>
    </div>
  );
}
