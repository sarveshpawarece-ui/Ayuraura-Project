"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface HeaderAction {
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: React.ComponentType<{ className?: string }>;
  variant?: "primary" | "secondary" | "outline" | "amber";
}

export interface HeaderProgress {
  label: string;
  value: number;
  max?: number;
  helperText?: string;
  helperLink?: string;
}

export interface DashboardHeaderProps {
  badgeText: string;
  badgeIcon?: React.ReactNode;
  badgeVariant?: "emerald" | "amber" | "teal" | "purple" | "blue";
  title: string;
  subtitle?: React.ReactNode;
  statusBadge?: React.ReactNode;
  progress?: HeaderProgress;
  actions?: HeaderAction[];
  children?: React.ReactNode;
}

export default function DashboardHeader({
  badgeText,
  badgeIcon,
  badgeVariant = "emerald",
  title,
  subtitle,
  statusBadge,
  progress,
  actions,
  children,
}: DashboardHeaderProps) {
  const badgeStyles = {
    emerald: "bg-[#DCEBE1] dark:bg-[#294637] text-[#2F6B4F] dark:text-[#78B895] border-[#2F6B4F]/20 dark:border-[#78B895]/30",
    amber: "bg-[#FAF0E1] dark:bg-[#332512] text-[#A96F16] dark:text-[#E5B85C] border-[#A96F16]/20 dark:border-[#E5B85C]/30",
    teal: "bg-[#E5F0F8] dark:bg-[#152533] text-[#356F9D] dark:text-[#80B5DD] border-[#356F9D]/20 dark:border-[#80B5DD]/30",
    purple: "bg-[#EEF4EF] dark:bg-[#223128] text-[#2F6B4F] dark:text-[#78B895] border-[#2F6B4F]/20 dark:border-[#78B895]/30",
    blue: "bg-[#E5F0F8] dark:bg-[#152533] text-[#356F9D] dark:text-[#80B5DD] border-[#356F9D]/20 dark:border-[#80B5DD]/30",
  };

  const getButtonClass = (variant: HeaderAction["variant"] = "primary") => {
    switch (variant) {
      case "amber":
        return "bg-[#A96F16] hover:bg-[#885810] dark:bg-[#E5B85C] dark:hover:bg-[#A96F16] text-white dark:text-[#0D1511] font-bold shadow-md";
      case "secondary":
        return "bg-white/15 hover:bg-white/25 text-white font-semibold border border-white/20";
      case "outline":
        return "bg-transparent hover:bg-white/10 text-white font-medium border border-white/25";
      case "primary":
      default:
        return "bg-white hover:bg-[#F7F9F4] text-[#2F6B4F] dark:bg-[#78B895] dark:hover:bg-[#91CAA8] dark:text-[#0D1511] font-bold shadow-md";
    }
  };

  const progressPercent = progress
    ? Math.min(100, Math.max(0, Math.round((progress.value / (progress.max || 100)) * 100)))
    : 0;

  const progressColor =
    progressPercent >= 80
      ? "bg-[#2F7D4A] dark:bg-[#7BC894]"
      : progressPercent >= 50
      ? "bg-[#A96F16] dark:bg-[#E5B85C]"
      : "bg-[#B64040] dark:bg-[#F18484]";

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1E4D37] via-[#2F6B4F] to-[#173A2A] dark:from-[#11241A] dark:via-[#172E21] dark:to-[#0F1D15] text-[#F1F6F2] p-6 sm:p-8 shadow-md border border-[#2F6B4F]/30 dark:border-[#304036]">
      {/* Ambient background glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#C58A32]/10 dark:bg-[#E4B45D]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-[#2F6B4F]/20 dark:bg-[#6FAF8A]/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-2.5 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2.5">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${
                badgeStyles[badgeVariant]
              }`}
            >
              {badgeIcon && <span className="text-sm">{badgeIcon}</span>}
              <span>{badgeText}</span>
            </span>

            {statusBadge && <div>{statusBadge}</div>}
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif-heading font-bold tracking-tight text-white leading-tight">
            {title}
          </h1>

          {subtitle && (
            <div className="text-xs sm:text-sm text-[#DCE8DF] dark:text-[#A9B9AE] leading-relaxed">
              {subtitle}
            </div>
          )}

          {children && <div className="pt-2">{children}</div>}
        </div>

        {/* Right side: Progress Bar & Actions */}
        <div className="w-full lg:w-auto flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-4 shrink-0">
          {progress && (
            <div className="w-full sm:w-64 bg-black/20 dark:bg-black/40 backdrop-blur-xs p-4 rounded-2xl border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-[#DCE8DF] dark:text-[#A9B9AE]">{progress.label}</span>
                <span className="font-bold text-white">{progressPercent}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-black/30 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              {progress.helperText && (
                <div className="flex items-center justify-between text-[11px] text-[#A9B9AE]">
                  <span>{progress.helperText}</span>
                  {progress.helperLink && (
                    <Link
                      href={progress.helperLink}
                      className="text-[#E8F1EB] font-semibold hover:underline inline-flex items-center gap-0.5"
                    >
                      <span>Complete</span>
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              )}
            </div>
          )}

          {actions && actions.length > 0 && (
            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
              {actions.map((act, idx) => {
                const Icon = act.icon;
                const btnClass = `inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs transition-all ${getButtonClass(
                  act.variant
                )}`;

                if (act.href) {
                  return (
                    <Link key={idx} href={act.href} className={btnClass}>
                      {Icon && <Icon className="w-4 h-4" />}
                      <span>{act.label}</span>
                    </Link>
                  );
                }

                return (
                  <button key={idx} type="button" onClick={act.onClick} className={btnClass}>
                    {Icon && <Icon className="w-4 h-4" />}
                    <span>{act.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
