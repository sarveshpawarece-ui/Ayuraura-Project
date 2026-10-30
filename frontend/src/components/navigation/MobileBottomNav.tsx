"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Sparkles,
  WifiOff,
  Bell,
  User,
  Compass,
  CheckCircle2
} from "lucide-react";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  isOfflineHub?: boolean;
}

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { isOnline } = useNetworkStatus();
  const [unreadNotifs, setUnreadNotifs] = useState(() => {
    if (typeof window === "undefined") return 0;
    try {
      const count = localStorage.getItem("aayuraura_unread_notifications_count");
      return count ? parseInt(count, 10) : 0;
    } catch {
      return 0;
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleStorage = () => {
      try {
        const count = localStorage.getItem("aayuraura_unread_notifications_count");
        if (count) setUnreadNotifs(parseInt(count, 10));
      } catch {
        // ignore
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Hide on auth pages or specific full-screen views if needed
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/forgot-password")
  ) {
    return null;
  }

  const NAV_ITEMS: NavItem[] = [
    {
      label: "Dashboard",
      href: "/student/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Syllabus",
      href: "/student/ecosystem?tab=syllabus",
      icon: BookOpen,
    },
    {
      label: "3D Anatomy",
      href: "/interactive-3d",
      icon: Sparkles,
    },
    {
      label: "Offline Hub",
      href: "/student/offline",
      icon: isOnline ? Compass : WifiOff,
      isOfflineHub: true,
    },
    {
      label: "Notices",
      href: "/notifications",
      icon: Bell,
      badge: unreadNotifs > 0 ? unreadNotifs : undefined,
    },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-[#07160e]/95 backdrop-blur-xl border-t border-[rgba(212,155,75,0.25)] dark:border-[#304036] shadow-[0_-4px_20px_rgba(0,0,0,0.08)] pb-[max(env(safe-area-inset-bottom),0.5rem)]"
    >
      <div className="grid grid-cols-5 h-14 items-center">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href.includes("?") && pathname === item.href.split("?")[0]) ||
            (item.href !== "/student/dashboard" && pathname.startsWith(item.href.split("?")[0]));

          const IconComponent = item.icon;

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center justify-center h-full min-h-[44px] px-1 transition-all select-none relative group ${
                isActive
                  ? "text-[#D49B4B] dark:text-[#D49B4B] font-bold"
                  : "text-[#627067] dark:text-[#A9B9AE] hover:text-[#0D2B1D] dark:hover:text-white"
              }`}
            >
              {/* Active top accent bar */}
              {isActive && (
                <span className="absolute top-0 w-8 h-0.5 rounded-full bg-[#D49B4B] shadow-xs" />
              )}

              <div className="relative">
                <IconComponent
                  className={`w-5 h-5 transition-transform duration-150 ${
                    isActive ? "scale-110 drop-shadow-xs" : "group-active:scale-90"
                  } ${item.isOfflineHub && !isOnline ? "text-amber-500 animate-pulse" : ""}`}
                />

                {/* Unread badge */}
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-4 h-4 px-1 rounded-full bg-red-600 text-white text-[9px] font-mono font-bold flex items-center justify-center">
                    {item.badge > 9 ? "9+" : item.badge}
                  </span>
                )}

                {/* Offline hub glow when disconnected */}
                {item.isOfflineHub && !isOnline && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                )}
              </div>

              <span
                className={`text-[10px] tracking-tight mt-1 truncate max-w-[64px] ${
                  isActive ? "font-bold text-[#0D2B1D] dark:text-[#EAE3D2]" : "font-medium"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
