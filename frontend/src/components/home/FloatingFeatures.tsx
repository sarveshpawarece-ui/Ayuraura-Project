"use client";

import Link from "next/link";
import { Sparkles, Box, Briefcase, ShoppingCart } from "lucide-react";

export default function FloatingFeatures() {
  const items = [
    {
      label: "AI Learning",
      iconSrc: "/assets/rail-ai.png",
      fallbackIcon: Sparkles,
      iconBg: "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300",
      href: "/ai-career",
    },
    {
      label: "3D Models",
      iconSrc: "/assets/rail-3d.png",
      fallbackIcon: Box,
      iconBg: "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300",
      href: "/interactive-3d",
    },
    {
      label: "Opportunities",
      iconSrc: "/assets/rail-opportunities.png",
      fallbackIcon: Briefcase,
      iconBg: "bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300",
      href: "/camps",
    },
    {
      label: "Marketplace",
      iconSrc: "/assets/rail-marketplace.png",
      fallbackIcon: ShoppingCart,
      iconBg: "bg-orange-50 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300",
      href: "/learning-hub",
    },
  ];

  return (
    <aside
      aria-label="Quick Features Rail"
      className="flex flex-col gap-1.5 p-2 bg-white/95 dark:bg-[#112a1d]/95 backdrop-blur-md border border-[#e2eae0] dark:border-white/10 rounded-2xl shadow-xl shadow-emerald-950/5 dark:shadow-black/40 sticky top-28 z-30 transition-all duration-300"
    >
      {items.map((item, idx) => {
        const FallbackIcon = item.fallbackIcon;
        return (
          <Link
            key={idx}
            href={item.href}
            className="group flex flex-col items-center justify-center p-2 rounded-xl hover:bg-[#f2f7f0] dark:hover:bg-white/10 transition-all text-center w-[76px]"
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center mb-1 transition-transform group-hover:scale-110 shadow-xs ${item.iconBg}`}
            >
              {item.iconSrc ? (
                <img
                  src={item.iconSrc}
                  alt={item.label}
                  className="w-5 h-5 object-contain"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              ) : (
                <FallbackIcon className="w-5 h-5" />
              )}
            </div>
            <span className="text-[11px] font-semibold text-[#2d4034] dark:text-[#d1e0d7] group-hover:text-[#183a27] dark:group-hover:text-emerald-300 leading-tight whitespace-nowrap">
              {item.label}
            </span>
          </Link>
        );
      })}
    </aside>
  );
}

