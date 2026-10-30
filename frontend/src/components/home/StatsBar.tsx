"use client";

import { Users, Briefcase, BookOpen, Building2 } from "lucide-react";

export default function StatsBar() {
  const stats = [
    {
      icon: Users,
      value: "50K+",
      label: "Students",
      iconBg: "bg-[#eaf4eb] dark:bg-emerald-950/70",
      iconColor: "text-[#205c3b] dark:text-emerald-300",
    },
    {
      icon: Briefcase,
      value: "2K+",
      label: "Opportunities",
      iconBg: "bg-[#eaf4eb] dark:bg-emerald-950/70",
      iconColor: "text-[#205c3b] dark:text-emerald-300",
    },
    {
      icon: BookOpen,
      value: "1K+",
      label: "Learning Resources",
      iconBg: "bg-[#eaf4eb] dark:bg-emerald-950/70",
      iconColor: "text-[#205c3b] dark:text-emerald-300",
    },
    {
      icon: Building2,
      value: "500+",
      label: "Doctors & Institutes",
      iconBg: "bg-[#fbf2e3] dark:bg-amber-950/50",
      iconColor: "text-[#c08238] dark:text-amber-400",
    },
  ];

  return (
    <div className="w-full max-w-xl bg-white/90 dark:bg-[#112a1d]/90 backdrop-blur-md border border-[#e2eae0] dark:border-white/10 rounded-2xl shadow-lg shadow-emerald-950/5 dark:shadow-black/30 p-3 sm:p-3.5 mt-4 transition-colors duration-300">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 divide-y sm:divide-y-0 sm:divide-x divide-[#edf2eb] dark:divide-white/10">
        {stats.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className={`flex items-center gap-2.5 pt-2 sm:pt-0 ${
                idx > 0 ? "sm:pl-3" : ""
              }`}
            >
              <div className={`w-8 h-8 rounded-lg ${item.iconBg} flex items-center justify-center shrink-0`}>
                <Icon className={`w-4 h-4 ${item.iconColor}`} />
              </div>
              <div className="min-w-0">
                <div className="text-base sm:text-lg font-bold text-[#183a27] dark:text-[#f0fdf4] font-mono leading-none mb-0.5">
                  {item.value}
                </div>
                <div className="text-[11px] font-medium text-[#657d6e] dark:text-[#9fbead] leading-tight truncate">
                  {item.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

