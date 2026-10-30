"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SessionsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    const token =
      localStorage.getItem("ayursetu_token") || localStorage.getItem("token");
    const role = (
      localStorage.getItem("ayursetu_role") ||
      localStorage.getItem("role") ||
      ""
    ).toUpperCase();

    if (!token) {
      router.replace("/login?redirect=/student/sessions");
    } else {
      if (role === "DOCTOR" || role === "FACULTY") {
        router.replace("/doctor/sessions");
      } else {
        router.replace("/student/sessions");
      }
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F9F4] dark:bg-[#0F1713] text-[#1B2A22] dark:text-[#E8F1EB]">
      <div className="animate-pulse text-xs font-semibold text-[#64736A] dark:text-[#A9B9AE]">
        Redirecting to Expert Guidance & Sessions...
      </div>
    </div>
  );
}
