"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function QuizRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    const token =
      localStorage.getItem("ayursetu_token") || localStorage.getItem("token");

    if (!token) {
      router.replace("/login?redirect=/student/quiz");
    } else {
      router.replace("/student/quiz");
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F9F4] dark:bg-[#0F1713] text-[#1B2A22] dark:text-[#E8F1EB]">
      <div className="animate-pulse text-xs font-semibold text-[#64736A] dark:text-[#A9B9AE]">
        Redirecting to Topic Quiz...
      </div>
    </div>
  );
}
