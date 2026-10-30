"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export interface DashboardSectionProps {
  title: string;
  subtitle?: string;
  icon?: React.ComponentType<{ className?: string }>;
  iconColorClass?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  children: React.ReactNode;
  className?: string;
}

export default function DashboardSection({
  title,
  subtitle,
  icon: Icon,
  iconColorClass = "text-[#2F6B4F] dark:text-[#78B895]",
  action,
  children,
  className = "",
}: DashboardSectionProps) {
  return (
    <section className={`space-y-4 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
        <div className="flex items-center gap-2.5">
          {Icon && (
            <div className="p-1.5 rounded-lg bg-[#EEF4EF] dark:bg-[#223128] border border-[#D5DED8] dark:border-[#304036]">
              <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${iconColorClass}`} />
            </div>
          )}
          <div>
            <h2 className="text-lg sm:text-xl font-bold font-serif-heading text-[#142019] dark:text-[#FFFFFF]">
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs text-[#526158] dark:text-[#C1CEC5]">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {action && (
          <div>
            {action.href ? (
              <Link
                href={action.href}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#2F6B4F] dark:text-[#78B895] hover:text-[#24563F] dark:hover:text-[#91CAA8] transition-colors group"
              >
                <span>{action.label}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            ) : (
              <button
                onClick={action.onClick}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#2F6B4F] dark:text-[#6FAF8A] hover:text-[#24563F] dark:hover:text-[#8BC4A2] transition-colors group"
              >
                <span>{action.label}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            )}
          </div>
        )}
      </div>

      <div>{children}</div>
    </section>
  );
}
