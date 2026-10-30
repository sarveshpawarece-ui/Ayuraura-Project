"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface QuickActionItem {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  href: string;
  badge?: string;
  colorVariant?: "emerald" | "amber" | "teal" | "purple" | "blue";
}

export interface DashboardQuickActionsProps {
  actions: QuickActionItem[];
  columns?: 2 | 3 | 4;
}

export default function DashboardQuickActions({
  actions,
  columns = 3,
}: DashboardQuickActionsProps) {
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
  };

  const gridColsClass = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  }[columns];

  return (
    <div className={`grid ${gridColsClass} gap-4`}>
      {actions.map((act, idx) => {
        const Icon = act.icon;
        const variant = act.colorVariant || "emerald";

        return (
          <Link
            key={idx}
            href={act.href}
            className="p-5 rounded-2xl bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] shadow-xs hover:shadow-md hover:border-[#2F6B4F]/40 dark:hover:border-[#78B895]/40 transition-all duration-200 flex items-center justify-between group"
          >
            <div className="flex items-center gap-3.5 pr-2">
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center border shrink-0 transition-transform group-hover:scale-105 ${iconVariants[variant]}`}
              >
                <Icon className="w-5 h-5" />
              </div>

              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-[#142019] dark:text-[#FFFFFF] group-hover:text-[#2F6B4F] dark:group-hover:text-[#78B895] transition-colors">
                    {act.title}
                  </h4>
                  {act.badge && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#EEF4EF] dark:bg-[#223128] text-[#2F6B4F] dark:text-[#78B895] border border-[#D5DED8] dark:border-[#304036]">
                      {act.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#526158] dark:text-[#C1CEC5] line-clamp-1">
                  {act.description}
                </p>
              </div>
            </div>

            <ChevronRight className="w-5 h-5 text-[#526158] dark:text-[#C1CEC5] group-hover:text-[#2F6B4F] dark:group-hover:text-[#78B895] group-hover:translate-x-1 transition-all shrink-0" />
          </Link>
        );
      })}
    </div>
  );
}
