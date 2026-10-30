"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ShieldAlert, ArrowRight } from "lucide-react";
import { getDashboardRouteForRole, UserRole } from "@/config/navigation";

const ALL_ROLES = ["STUDENT", "DOCTOR", "FACULTY", "INSTITUTION", "INDUSTRY", "NGO", "ADMIN"];

interface RouteGuardProps {
  allowedRoles: string[];
  children: React.ReactNode;
}

export default function RouteGuard({ allowedRoles, children }: RouteGuardProps) {
  const pathname = usePathname();

  const isAnyAuthAllowed =
    allowedRoles.includes("AUTHENTICATED") ||
    allowedRoles.includes("ANY") ||
    allowedRoles.length === 0;

  const targetAllowedRoles = isAnyAuthAllowed
    ? ALL_ROLES
    : allowedRoles.map((r) => r.toUpperCase());

  // Optimistic initial state based on local storage cache
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(() => {
    if (typeof window === "undefined") return null;
    const token =
      localStorage.getItem("ayursetu_token") || localStorage.getItem("token");
    if (!token) return false;
    const role = (
      localStorage.getItem("ayursetu_role") ||
      localStorage.getItem("role") ||
      ""
    ).trim().toUpperCase();
    return isAnyAuthAllowed || targetAllowedRoles.includes(role);
  });

  const [currentUserRole, setCurrentUserRole] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    const role = (
      localStorage.getItem("ayursetu_role") ||
      localStorage.getItem("role") ||
      ""
    ).trim().toUpperCase();
    return role || null;
  });

  const [userEmail, setUserEmail] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return (
      localStorage.getItem("ayursetu_email") ||
      localStorage.getItem("email") ||
      null
    );
  });

  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    async function checkAuth() {
      if (typeof window === "undefined") return;

      const token =
        localStorage.getItem("ayursetu_token") || localStorage.getItem("token");

      if (!token) {
        if (isMounted) {
          setIsAuthorized(false);
          setIsVerifying(false);
        }
        window.location.href = `/login?redirect=${encodeURIComponent(pathname)}`;
        return;
      }

      const role = (
        localStorage.getItem("ayursetu_role") ||
        localStorage.getItem("role") ||
        ""
      ).trim().toUpperCase();

      const email =
        localStorage.getItem("ayursetu_email") ||
        localStorage.getItem("email") ||
        null;

      const authorized = isAnyAuthAllowed || targetAllowedRoles.includes(role);

      if (isMounted) {
        setCurrentUserRole(role || null);
        setUserEmail(email);
        setIsAuthorized(authorized);
        setIsVerifying(false);
      }
    }

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [pathname]);

  // Loading Screen only when cold-booting without cached credentials
  if (isVerifying) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F7F9F4] dark:bg-[#0F1713] text-[#1B2A22] dark:text-[#E8F1EB] p-4 select-none">
        <div className="flex flex-col items-center gap-4 text-center max-w-sm animate-pulse">
          <img
            src="/logo-emblem.png"
            alt="AyurSetu"
            className="w-14 h-14 object-contain drop-shadow-md animate-bounce"
          />
          <div className="space-y-1">
            <h3 className="text-lg font-bold font-serif-heading text-[#1B2A22] dark:text-[#E8F1EB]">
              Authenticating Session
            </h3>
            <p className="text-xs text-[#64736A] dark:text-[#A9B9AE]">
              Verifying your AyurSetu role credentials...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Unauthenticated Redirecting Screen
  const token = typeof window !== "undefined" ? localStorage.getItem("ayursetu_token") || localStorage.getItem("token") : null;
  if (isAuthorized === false && !token) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F7F9F4] dark:bg-[#0F1713] text-[#1B2A22] dark:text-[#E8F1EB] p-4 select-none">
        <div className="flex flex-col items-center gap-3 text-center max-w-sm">
          <img
            src="/logo-emblem.png"
            alt="AyurSetu"
            className="w-12 h-12 object-contain drop-shadow-sm"
          />
          <p className="text-xs font-semibold text-[#64736A] dark:text-[#A9B9AE]">
            Redirecting to Login...
          </p>
        </div>
      </div>
    );
  }

  // Unauthorized (Logged in but Restricted Role) Screen
  if (isAuthorized === false) {
    const roleLanding = getDashboardRouteForRole(currentUserRole as UserRole);

    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F7F9F4] dark:bg-[#0F1713] text-[#1B2A22] dark:text-[#E8F1EB] p-6 selection:bg-[#2F6B4F] selection:text-white">
        <div className="max-w-md w-full rounded-3xl bg-[#FFFFFF] dark:bg-[#17221C] border border-[#DCE4DE] dark:border-[#2B3A31] p-8 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-[#FAF0E1] dark:bg-[#332512] border border-[#C58A32]/30 text-[#C58A32] dark:text-[#E4B45D] flex items-center justify-center mx-auto shadow-xs">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-[11px] uppercase tracking-widest font-bold text-[#C58A32] dark:text-[#E4B45D]">
              Access Restricted
            </span>
            <h2 className="text-2xl font-bold font-serif-heading text-[#1B2A22] dark:text-[#E8F1EB]">
              Role Authorization Required
            </h2>
            <p className="text-xs sm:text-sm text-[#64736A] dark:text-[#A9B9AE] leading-relaxed">
              This portal requires one of the following permissions:
              <br />
              <strong className="text-[#1B2A22] dark:text-[#E8F1EB] font-mono">
                {targetAllowedRoles.join(" • ")}
              </strong>
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#F7F9F4] dark:bg-[#0F1713]/80 border border-[#DCE4DE] dark:border-[#2B3A31] text-xs text-left space-y-1 text-[#64736A] dark:text-[#A9B9AE]">
            <div className="flex justify-between">
              <span className="font-semibold">Current Account:</span>
              <span className="font-mono text-[#1B2A22] dark:text-[#E8F1EB]">
                {userEmail || "Anonymous"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Assigned Role:</span>
              <span className="font-mono font-bold text-[#C58A32] dark:text-[#E4B45D]">
                {currentUserRole || "GUEST"}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <Link
              href={roleLanding}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#2F6B4F] hover:bg-[#24563F] dark:bg-[#6FAF8A] dark:hover:bg-[#8BC4A2] text-white dark:text-[#0F1713] font-semibold text-xs shadow-md transition-all group"
            >
              <span>Go to My Dashboard</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/login"
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#DCE8DF] dark:bg-[#26372D] hover:bg-[#c9dacf] dark:hover:bg-[#344b3e] text-[#2F6B4F] dark:text-[#6FAF8A] font-semibold text-xs border border-[#DCE4DE] dark:border-[#2B3A31] transition-all"
            >
              Switch Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

