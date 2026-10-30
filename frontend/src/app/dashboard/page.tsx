"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getDashboardRouteForRole, UserRole } from "@/config/navigation";

export default function DashboardRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("ayursetu_token") || localStorage.getItem("token");
    const role = (localStorage.getItem("ayursetu_role") || localStorage.getItem("role") || "").trim().toUpperCase();

    if (!token || !role) {
      router.replace("/login?redirect=/dashboard");
    } else {
      const dashboardRoute = getDashboardRouteForRole(role as UserRole);
      if (dashboardRoute === "/login" || dashboardRoute === "/") {
        router.replace("/login?redirect=/dashboard");
      } else {
        router.replace(dashboardRoute);
      }
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F9F4] dark:bg-[#0F1713] text-[#1B2A22] dark:text-[#E8F1EB]">
      <div className="animate-pulse text-xs font-semibold text-[#64736A] dark:text-[#A9B9AE]">
        Redirecting to dashboard...
      </div>
    </div>
  );
}
