"use client";

import React from "react";
import { ShieldCheck, Clock, AlertTriangle, XCircle } from "lucide-react";

interface VerifiedDoctorBadgeProps {
  status?: string;
  size?: "sm" | "md" | "lg";
  showTooltip?: boolean;
}

export default function VerifiedDoctorBadge({
  status = "VERIFIED",
  size = "md",
  showTooltip = true,
}: VerifiedDoctorBadgeProps) {
  const normalizedStatus = (status || "").toUpperCase();

  const isVerified = normalizedStatus === "VERIFIED";
  const isPending = normalizedStatus === "PENDING" || normalizedStatus === "UNDER_REVIEW";
  const isRejected = normalizedStatus === "REJECTED";

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5 gap-1",
    md: "text-xs sm:text-sm px-2.5 py-1 gap-1.5",
    lg: "text-sm sm:text-base px-3.5 py-1.5 gap-2",
  }[size];

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  }[size];

  if (isVerified) {
    return (
      <span
        title={showTooltip ? "NCISM / State Medical Board Verified Doctor" : undefined}
        className={`inline-flex items-center rounded-full font-serif-heading font-semibold bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 text-amber-200 border border-amber-400/40 shadow-xs hover:border-amber-400 transition-all ${sizeClasses}`}
      >
        <ShieldCheck className={`${iconSizes} text-amber-300 drop-shadow-xs`} />
        <span>✓ Verified Doctor</span>
      </span>
    );
  }

  if (isPending) {
    return (
      <span
        title={showTooltip ? "Verification documents are currently under review" : undefined}
        className={`inline-flex items-center rounded-full font-serif-heading font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-700/60 ${sizeClasses}`}
      >
        <Clock className={`${iconSizes} text-amber-600 animate-spin-slow`} />
        <span>⏳ Verification Pending</span>
      </span>
    );
  }

  if (isRejected) {
    return (
      <span
        title={showTooltip ? "Verification was not approved. Please re-submit documents." : undefined}
        className={`inline-flex items-center rounded-full font-serif-heading font-medium bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 border border-rose-300 dark:border-rose-700/60 ${sizeClasses}`}
      >
        <XCircle className={`${iconSizes} text-rose-600`} />
        <span>✕ Verification Rejected</span>
      </span>
    );
  }

  return (
    <span
      title={showTooltip ? "Doctor profile not yet submitted for verification" : undefined}
      className={`inline-flex items-center rounded-full font-serif-heading font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 ${sizeClasses}`}
    >
      <AlertTriangle className={`${iconSizes} text-slate-500`} />
      <span>Unverified Doctor</span>
    </span>
  );
}
