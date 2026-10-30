"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProfileRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("ayursetu_token") || localStorage.getItem("token");
    const role = (localStorage.getItem("ayursetu_role") || localStorage.getItem("role") || "").toUpperCase();

    if (!token) {
      router.replace("/login?redirect=/profile");
    } else {
      if (role === "STUDENT") router.replace("/student/profile");
      else if (role === "DOCTOR") router.replace("/doctor/profile");
      else if (role === "INSTITUTION") router.replace("/institution/profile");
      else if (role === "INDUSTRY") router.replace("/industry/organization");
      else if (role === "ADMIN") router.replace("/admin/verifications");
      else if (role === "NGO") router.replace("/ngo/dashboard");
      else router.replace("/login");
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F9F4] dark:bg-[#0F1713] text-[#1B2A22] dark:text-[#E8F1EB]">
      <div className="animate-pulse text-xs font-semibold text-[#64736A] dark:text-[#A9B9AE]">
        Redirecting to profile...
      </div>
    </div>
  );
}
