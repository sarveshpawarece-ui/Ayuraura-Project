"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export type StatColorVariant =
  | "emerald"
  | "amber"
  | "teal"
  | "purple"
  | "blue"
  | "rose";

export interface DashboardStatsCardProps {
  title: string;
  value: string | number;
  subtitle?: React.ReactNode;
  icon: React.ComponentType<{ className?: string }>;
  colorVariant?: StatColorVariant;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  badge?: string;
  href?: string;
}

export default function DashboardStatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  colorVariant = "emerald",
  trend,
  badge,
  href,
}: DashboardStatsCardProps) {
  const iconVariants = {
    emerald:
      "bg-[#DCEBE1] dark:bg-[#294637] text-[#2F6B4F] dark:text-[#78B895] border-[#D5DED8] dark:border-[#304036]",
    amber:
      "bg-[#FAF0E1] dark:bg-[#332512] text-[#A96F16] dark:text-[#E5B85C] border-[#A96F16]/20 dark:border-[#E5B85C]/30",
    teal:
      "bg-[#E5F0F8] dark:bg-[#152533] text-[#356F9D] dark:text-[#80B5DD] border-[#356F9D]/20 dark:border-[#80B5DD]/30",
    purple:
      "bg-[#EEF4EF] dark:bg-[#223128] text-[#2F6B4F] dark:text-[#78B895] border-[#D5DED8] dark:border-[#304036]",
    blue:
      "bg-[#E5F0F8] dark:bg-[#152533] text-[#356F9D] dark:text-[#80B5DD] border-[#356F9D]/20 dark:border-[#80B5DD]/30",
    rose:
      "bg-[#FAECEC] dark:bg-[#351919] text-[#B64040] dark:text-[#F18484] border-[#B64040]/20 dark:border-[#F18484]/30",
  };

  const CardContent = (
    <div className="relative p-5 rounded-2xl bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] shadow-xs hover:shadow-md hover:border-[#2F6B4F]/40 dark:hover:border-[#78B895]/40 transition-all duration-200 flex flex-col justify-between h-full group">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="space-y-1">
          <p className="text-[11px] font-bold text-[#526158] dark:text-[#C1CEC5] uppercase tracking-wider">
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <h4 className="text-2xl sm:text-3xl font-bold font-serif-heading text-[#142019] dark:text-[#FFFFFF] tracking-tight">
              {value}
            </h4>
            {badge && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EEF4EF] dark:bg-[#223128] text-[#2F6B4F] dark:text-[#78B895] border border-[#D5DED8] dark:border-[#304036]">
                {badge}
              </span>
            )}
          </div>
        </div>

        <div
          className={`w-11 h-11 rounded-2xl flex items-center justify-center border shrink-0 transition-transform group-hover:scale-105 duration-200 ${iconVariants[colorVariant]}`}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="flex items-center justify-between text-xs pt-2 border-t border-[#D5DED8] dark:border-[#304036]">
        <div className="text-[#526158] dark:text-[#C1CEC5] text-xs">
          {subtitle}
        </div>

        {trend && (
          <span
            className={`font-semibold text-xs flex items-center gap-0.5 ${
              trend.isPositive !== false
                ? "text-[#2F7D4A] dark:text-[#7BC894]"
                : "text-[#B64040] dark:text-[#F18484]"
            }`}
          >
            {trend.value}
          </span>
        )}

        {href && (
          <ArrowUpRight className="w-4 h-4 text-[#526158] dark:text-[#C1CEC5] group-hover:text-[#2F6B4F] dark:group-hover:text-[#78B895] transition-colors ml-auto" />
        )}
      </div>
    </div>
  );

  if (href) {
    return <Link href={href} className="block h-full">{CardContent}</Link>;
  }

  return CardContent;
}
