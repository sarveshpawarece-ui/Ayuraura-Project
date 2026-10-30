"use client";

import React from "react";

export interface DashboardCardProps {
  title?: React.ReactNode;
  subtitle?: string;
  icon?: React.ComponentType<{ className?: string }>;
  headerAction?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

export default function DashboardCard({
  title,
  subtitle,
  icon: Icon,
  headerAction,
  footer,
  children,
  className = "",
  hoverEffect = false,
}: DashboardCardProps) {
  const hasHeader = Boolean(title || subtitle || Icon || headerAction);

  return (
    <div
      className={`rounded-2xl bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] shadow-xs ${
        hoverEffect
          ? "hover:shadow-md hover:border-[#2F6B4F]/40 dark:hover:border-[#78B895]/40 transition-all duration-200"
          : ""
      } flex flex-col justify-between overflow-hidden ${className}`}
    >
      {hasHeader && (
        <div className="p-5 sm:p-6 border-b border-[#D5DED8] dark:border-[#304036] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="w-9 h-9 rounded-xl bg-[#EEF4EF] dark:bg-[#223128] border border-[#D5DED8] dark:border-[#304036] text-[#2F6B4F] dark:text-[#78B895] flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4" />
              </div>
            )}
            <div>
              {typeof title === "string" ? (
                <h3 className="font-bold text-base sm:text-lg font-serif-heading text-[#142019] dark:text-[#FFFFFF]">
                  {title}
                </h3>
              ) : (
                title
              )}
              {subtitle && (
                <p className="text-xs text-[#526158] dark:text-[#C1CEC5] mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {headerAction && <div>{headerAction}</div>}
        </div>
      )}

      <div className="p-5 sm:p-6 flex-1">{children}</div>

      {footer && (
        <div className="px-5 sm:px-6 py-3.5 bg-[#F7F9F4] dark:bg-[#1D2A22] border-t border-[#D5DED8] dark:border-[#304036] flex items-center justify-between">
          {footer}
        </div>
      )}
    </div>
  );
}
