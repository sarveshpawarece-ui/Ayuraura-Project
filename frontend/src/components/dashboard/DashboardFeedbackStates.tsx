"use client";

import React from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { AlertCircle, RefreshCw, Inbox, ArrowRight } from "lucide-react";

export function DashboardLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-[#F7F9F4] dark:bg-[#0D1511] flex flex-col">
      <Navbar />
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse space-y-8">
        {/* Banner Skeleton */}
        <div className="h-44 bg-[#2F6B4F]/10 dark:bg-[#223128]/60 rounded-3xl" />

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-28 bg-[#2F6B4F]/5 dark:bg-[#223128]/30 rounded-2xl border border-[#D5DED8]/60 dark:border-[#304036]/60"
            />
          ))}
        </div>

        {/* Content Section Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-[#2F6B4F]/5 dark:bg-[#223128]/30 rounded-3xl border border-[#D5DED8]/60 dark:border-[#304036]/60" />
          <div className="h-96 bg-[#2F6B4F]/5 dark:bg-[#223128]/30 rounded-3xl border border-[#D5DED8]/60 dark:border-[#304036]/60" />
        </div>
      </div>
    </div>
  );
}

export interface DashboardErrorStateProps {
  error?: string | null;
  onRetry?: () => void;
  title?: string;
}

export function DashboardErrorState({
  error,
  onRetry,
  title = "Unable to Load Dashboard",
}: DashboardErrorStateProps) {
  return (
    <div className="min-h-screen bg-[#F7F9F4] dark:bg-[#0D1511] text-[#17231C] dark:text-[#F1F6F2] flex flex-col">
      <Navbar />
      <div className="flex-1 max-w-md mx-auto py-20 px-4 text-center flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-[#FAECEC] dark:bg-[#351919] border border-[#B64040]/30 text-[#B64040] dark:text-[#F18484] flex items-center justify-center">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold font-serif-heading text-[#142019] dark:text-[#FFFFFF]">
          {title}
        </h2>
        <p className="text-xs sm:text-sm text-[#526158] dark:text-[#C1CEC5] max-w-sm">
          {error || "An unexpected error occurred while fetching your dashboard data."}
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2F6B4F] hover:bg-[#24563F] dark:bg-[#78B895] dark:hover:bg-[#91CAA8] text-white dark:text-[#0D1511] text-xs font-semibold shadow-md transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retry Connection</span>
          </button>
        )}
      </div>
    </div>
  );
}

export interface DashboardEmptyStateProps {
  title: string;
  message: string;
  icon?: React.ComponentType<{ className?: string }>;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export function DashboardEmptyState({
  title,
  message,
  icon: Icon = Inbox,
  actionLabel,
  actionHref,
  onAction,
}: DashboardEmptyStateProps) {
  return (
    <div className="p-8 sm:p-12 text-center rounded-2xl bg-white/70 dark:bg-[#17211B]/70 border border-dashed border-[#D5DED8] dark:border-[#304036] flex flex-col items-center justify-center space-y-3">
      <div className="w-12 h-12 rounded-xl bg-[#EEF4EF] dark:bg-[#223128] text-[#2F6B4F] dark:text-[#78B895] flex items-center justify-center">
        <Icon className="w-6 h-6" />
      </div>
      <h4 className="text-base font-bold font-serif-heading text-[#142019] dark:text-[#FFFFFF]">
        {title}
      </h4>
      <p className="text-xs text-[#526158] dark:text-[#C1CEC5] max-w-md">
        {message}
      </p>
      {actionLabel && (
        <div className="pt-2">
          {actionHref ? (
            <Link
              href={actionHref}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2F6B4F] hover:bg-[#24563F] dark:bg-[#78B895] dark:hover:bg-[#91CAA8] text-white dark:text-[#0D1511] text-xs font-semibold shadow-xs transition-all"
            >
              <span>{actionLabel}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <button
              onClick={onAction}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2F6B4F] hover:bg-[#24563F] dark:bg-[#78B895] dark:hover:bg-[#91CAA8] text-white dark:text-[#0D1511] text-xs font-semibold shadow-xs transition-all"
            >
              <span>{actionLabel}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
