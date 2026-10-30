"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  ChevronDown,
  ChevronRight,
  Bell,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Briefcase,
  Layers,
  GraduationCap,
  Stethoscope,
  Building2,
  Users,
  Settings,
  HelpCircle,
  ExternalLink,
  BookOpen,
  HeartHandshake,
  MessageSquare
} from "lucide-react";
import dynamic from "next/dynamic";
const SearchModal = dynamic(() => import("./home/SearchModal"), { ssr: false });
import { useTheme } from "./ThemeProvider";
import {
  getNavForRole,
  getDashboardRouteForRole,
  navigationConfig,
  NavItem,
  UserRole
} from "@/config/navigation";
import { getAuthSession, clearAuthSession } from "@/lib/authSession";

interface UserProfileState {
  id?: string;
  email?: string;
  role?: string;
  fullName?: string;
}

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
  type: "opportunity" | "assessment" | "session" | "verification" | "general";
  href?: string;
}

export default function RoleBasedNavbar() {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<UserProfileState | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  
  // Dialog & Dropdown States
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  
  // Mobile accordion state for nested items
  const [expandedMobileCategories, setExpandedMobileCategories] = useState<Record<string, boolean>>({});

  // Refs for outside click & focus management
  const navContainerRef = useRef<HTMLElement | null>(null);
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastOpenedViaHoverRef = useRef<number>(0);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);
  const notificationsMenuRef = useRef<HTMLDivElement | null>(null);
  const menuButtonsRef = useRef<Record<string, HTMLButtonElement | null>>({});
  const dropdownMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const mobileDrawerRef = useRef<HTMLDivElement | null>(null);

  const { theme, toggleTheme } = useTheme();

  // Role-based mock notifications for demo / live display
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Synchronize authentication and user profile
  const syncAuth = async () => {
    if (typeof window === "undefined") return;

    try {
      const storedToken =
        localStorage.getItem("ayursetu_token") || localStorage.getItem("token");
      const rawStoredRole =
        localStorage.getItem("ayursetu_role") || localStorage.getItem("role");
      const storedEmail =
        localStorage.getItem("ayursetu_email") || localStorage.getItem("email");

      if (!storedToken) {
        setCurrentUser(null);
        setNotifications([]);
        setIsAuthLoading(false);
        return;
      }

      const normalizedStoredRole = rawStoredRole ? rawStoredRole.trim().toUpperCase() : undefined;

      // Fast set from localStorage
      const userState: UserProfileState = {
        email: storedEmail || undefined,
        role: normalizedStoredRole,
      };
      setCurrentUser(userState);

      // Populate context notifications based on role
      populateRoleNotifications(normalizedStoredRole);

      // Verify active session with backend via deduplicated session cache
      try {
        const user = await getAuthSession();
        if (user && user.role) {
          const normalizedApiRole = user.role.trim().toUpperCase();
          setCurrentUser({
            id: user.id,
            email: user.email,
            role: normalizedApiRole,
          });
          populateRoleNotifications(normalizedApiRole);
        } else if (!user && !normalizedStoredRole) {
          setCurrentUser(null);
          setNotifications([]);
        }
      } catch (err: any) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          clearAuthSession();
          setCurrentUser(null);
          setNotifications([]);
        }
      }
    } finally {
      setIsAuthLoading(false);
    }
  };

  const populateRoleNotifications = (role?: string | null) => {
    if (!role) {
      setNotifications([]);
      return;
    }

    const normRole = role.toUpperCase();
    if (normRole === "STUDENT") {
      setNotifications([
        {
          id: "1",
          title: "Diagnostic Assessment Ready",
          description: "Measure skill proficiency for your target career role.",
          timestamp: "10m ago",
          isRead: false,
          type: "assessment",
          href: "/student/assessments",
        },
        {
          id: "2",
          title: "New Internship Match (92%)",
          description: "Herbal Formulation & QC at Dabur Research Foundation.",
          timestamp: "1h ago",
          isRead: false,
          type: "opportunity",
          href: "/student/opportunities",
        },
      ]);
    } else if (normRole === "DOCTOR") {
      setNotifications([
        {
          id: "1",
          title: "New Student Application",
          description: "Priya Sharma applied for Clinical Panchakarma Internship.",
          timestamp: "25m ago",
          isRead: false,
          type: "opportunity",
          href: "/doctor/applications",
        },
        {
          id: "2",
          title: "Pending Attendance Approval",
          description: "Daily logbook entries submitted for review.",
          timestamp: "2h ago",
          isRead: false,
          type: "session",
          href: "/doctor/attendance",
        },
      ]);
    } else if (normRole === "ADMIN") {
      setNotifications([
        {
          id: "1",
          title: "Verification Queue Alert",
          description: "New doctor credential documents pending audit.",
          timestamp: "5m ago",
          isRead: false,
          type: "verification",
          href: "/admin/verifications",
        },
      ]);
    } else if (normRole === "INDUSTRY") {
      setNotifications([
        {
          id: "1",
          title: "New Candidate Submission",
          description: "Candidate match score 94% on Ayurvedic Herbal Research.",
          timestamp: "30m ago",
          isRead: false,
          type: "opportunity",
          href: "/industry/applications",
        },
      ]);
    } else if (normRole === "INSTITUTION") {
      setNotifications([
        {
          id: "1",
          title: "Batch Assessment Progress",
          description: "71% student diagnostic test completion reached.",
          timestamp: "1h ago",
          isRead: false,
          type: "assessment",
          href: "/institution/analytics",
        },
      ]);
    } else {
      setNotifications([
        {
          id: "1",
          title: "Healthcare Camps Active",
          description: "Discover upcoming rural Ayurveda wellness camps.",
          timestamp: "2h ago",
          isRead: false,
          type: "general",
          href: "/camps",
        },
      ]);
    }
  };

  useEffect(() => {
    syncAuth();

    const handleAuthChange = () => syncAuth();
    window.addEventListener("storage", handleAuthChange);
    window.addEventListener("ayursetu_auth_change", handleAuthChange);

    return () => {
      window.removeEventListener("storage", handleAuthChange);
      window.removeEventListener("ayursetu_auth_change", handleAuthChange);
    };
  }, []);

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      const target = event.target as Node;

      if (profileMenuRef.current && !profileMenuRef.current.contains(target)) {
        setIsProfileMenuOpen(false);
      }
      if (notificationsMenuRef.current && !notificationsMenuRef.current.contains(target)) {
        setIsNotificationsOpen(false);
      }
      if (navContainerRef.current && !navContainerRef.current.contains(target)) {
        setActiveDropdown(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  // Close dropdowns and drawers on route change & browser back/forward navigation
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileMenuOpen(false);
    setIsNotificationsOpen(false);
    setActiveDropdown(null);
  }, [pathname]);

  // Global keyboard accessibility listener (Escape, Tab)
  const handleGlobalKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (activeDropdown) {
          const button = menuButtonsRef.current[activeDropdown];
          button?.focus();
          setActiveDropdown(null);
        }
        if (isProfileMenuOpen) {
          setIsProfileMenuOpen(false);
        }
        if (isNotificationsOpen) {
          setIsNotificationsOpen(false);
        }
        if (isMobileMenuOpen) {
          setIsMobileMenuOpen(false);
        }
      }
    },
    [activeDropdown, isProfileMenuOpen, isNotificationsOpen, isMobileMenuOpen]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [handleGlobalKeyDown]);

  const handleLogout = () => {
    clearAuthSession();
    setCurrentUser(null);
    setNotifications([]);
    setIsMobileMenuOpen(false);
    window.dispatchEvent(new Event("ayursetu_auth_change"));
    window.location.href = "/";
  };

  const handleMouseEnter = (label: string) => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    lastOpenedViaHoverRef.current = Date.now();
    setActiveDropdown(label);
  };

  const handleMouseLeave = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 350);
  };

  const toggleMobileCategory = (label: string) => {
    setExpandedMobileCategories((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  // Keyboard navigation for dropdown menus
  const handleDropdownButtonKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    label: string
  ) => {
    if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setActiveDropdown(label);
      setTimeout(() => {
        const menu = dropdownMenuRefs.current[label];
        const firstLink = menu?.querySelector<HTMLAnchorElement>("a");
        firstLink?.focus();
      }, 50);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveDropdown(label);
      setTimeout(() => {
        const menu = dropdownMenuRefs.current[label];
        const links = menu?.querySelectorAll<HTMLAnchorElement>("a");
        if (links && links.length > 0) {
          links[links.length - 1].focus();
        }
      }, 50);
    }
  };

  const handleMenuKeyDown = (
    event: React.KeyboardEvent<HTMLDivElement>,
    label: string
  ) => {
    const menu = dropdownMenuRefs.current[label];
    if (!menu) return;

    const links = Array.from(menu.querySelectorAll<HTMLAnchorElement>("a"));
    const currentIndex = links.findIndex((link) => link === document.activeElement);

    if (event.key === "ArrowDown") {
      event.preventDefault();
      const nextIndex = (currentIndex + 1) % links.length;
      links[nextIndex]?.focus();
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      const prevIndex = (currentIndex - 1 + links.length) % links.length;
      links[prevIndex]?.focus();
    } else if (event.key === "Home") {
      event.preventDefault();
      links[0]?.focus();
    } else if (event.key === "End") {
      event.preventDefault();
      links[links.length - 1]?.focus();
    } else if (event.key === "Tab") {
      if (
        (!event.shiftKey && currentIndex === links.length - 1) ||
        (event.shiftKey && currentIndex === 0)
      ) {
        setActiveDropdown(null);
      }
    }
  };

  const isPublicHome = pathname === "/" || pathname === "";
  const userRole = isPublicHome ? undefined : currentUser?.role;
  const navItems: NavItem[] = isPublicHome ? navigationConfig.guest : getNavForRole(userRole);
  const dashboardHref = getDashboardRouteForRole(userRole);
  const unreadNotificationsCount = notifications.filter((n) => !n.isRead).length;

  const getBadgeClasses = (variant?: string) => {
    switch (variant) {
      case "amber":
        return "bg-[#FAF0E1] text-[#A96F16] dark:bg-[#332512] dark:text-[#E5B85C] border-[#A96F16]/30";
      case "blue":
        return "bg-[#E5F0F8] text-[#356F9D] dark:bg-[#152533] dark:text-[#80B5DD] border-[#356F9D]/30";
      case "rose":
        return "bg-[#FAECEC] text-[#B64040] dark:bg-[#351919] dark:text-[#F18484] border-[#B64040]/30";
      case "emerald":
      default:
        return "bg-[#DCEBE1] text-[#2F6B4F] dark:bg-[#294637] dark:text-[#78B895] border-[#2F6B4F]/30";
    }
  };

  /**
   * Exact and prefix child matching logic for active route highlighting
   */
  const isChildActive = (childRoute: string) => {
    if (childRoute === "/" && pathname === "/") return true;
    if (childRoute === "/") return false;
    if (pathname === childRoute) return true;
    if (pathname.startsWith(childRoute + "/") || pathname.startsWith(childRoute + "?")) return true;
    return false;
  };

  /**
   * Determines if a parent dropdown item should be highlighted when a child is active
   */
  const isParentActive = (item: NavItem) => {
    if (item.route === "/" && pathname === "/") return true;
    if (item.route !== "/" && pathname === item.route) return true;
    if (item.children && item.children.length > 0) {
      return item.children.some((child) => isChildActive(child.route));
    }
    if (item.route !== "/" && pathname.startsWith(item.route + "/")) return true;
    return false;
  };

  // Auto-expand active category accordion in mobile drawer on route change
  useEffect(() => {
    const toExpand: Record<string, boolean> = {};
    let hasMatch = false;
    navItems.forEach((item) => {
      if (item.children && isParentActive(item)) {
        toExpand[item.label] = true;
        hasMatch = true;
      }
    });
    if (hasMatch) {
      setExpandedMobileCategories((prev) => {
        const needsUpdate = Object.keys(toExpand).some((k) => !prev[k]);
        if (!needsUpdate) return prev;
        return { ...prev, ...toExpand };
      });
    }
  }, [pathname, userRole]);

  const getRoleIcon = (role?: string) => {
    switch (role?.toUpperCase()) {
      case "DOCTOR":
        return Stethoscope;
      case "STUDENT":
        return GraduationCap;
      case "INDUSTRY":
        return Briefcase;
      case "INSTITUTION":
        return Building2;
      case "ADMIN":
        return ShieldCheck;
      case "NGO":
        return HeartHandshake;
      default:
        return UserIcon;
    }
  };

  const RoleIcon = getRoleIcon(userRole);

  const getProfileLink = () => {
    const role = userRole?.toUpperCase();
    if (role === "DOCTOR") return "/doctor/profile";
    if (role === "STUDENT") return "/student/profile";
    if (role === "INDUSTRY") return "/industry/organization";
    if (role === "INSTITUTION") return "/institution/profile";
    if (role === "ADMIN") return "/admin/verifications";
    if (role === "NGO") return "/camps";
    return "/";
  };

  return (
    <>
      <nav
        ref={navContainerRef}
        aria-label="Main Navigation"
        className="sticky top-0 z-40 w-full bg-[#FFFFFF]/95 dark:bg-[#17211B]/95 backdrop-blur-md border-b border-[#D5DED8] dark:border-[#304036] px-2.5 sm:px-4 md:px-5 lg:px-6 xl:px-8 py-2 sm:py-2.5 xl:py-3 transition-colors duration-300 select-none shadow-xs"
      >
        <div className="max-w-[1440px] w-full mx-auto flex items-center justify-between gap-1.5 sm:gap-2.5 md:gap-3 xl:gap-4 min-w-0">
          
          {/* ========================================================= */}
          {/* 1. BRAND LOGO AREA */}
          {/* ========================================================= */}
          <Link
            href="/"
            onClick={() => setActiveDropdown(null)}
            className="flex items-center gap-1.5 sm:gap-2.5 md:gap-3 group shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2F6B4F] rounded-xl p-0.5 sm:p-1"
          >
            <img
              src="/logo-emblem.png"
              alt="Aayuraura Official Emblem"
              className="w-8 h-8 sm:w-8.5 sm:h-8.5 md:w-9 md:h-9 xl:w-10 xl:h-10 object-contain drop-shadow-xs group-hover:scale-105 transition-transform"
            />
            <div className="flex flex-col justify-center">
              <div className="flex items-baseline tracking-tight font-serif-heading font-bold text-lg sm:text-xl md:text-[22px] xl:text-[24px] leading-none">
                <span className="text-[#2F6B4F] dark:text-[#78B895] group-hover:opacity-90 transition-opacity">
                  Aayur
                </span>
                <span className="text-[#A96F16] dark:text-[#E5B85C] group-hover:opacity-90 transition-opacity">
                  aura
                </span>
              </div>
              <span className="hidden md:inline text-[9px] sm:text-[10px] xl:text-[10.5px] text-[#68776D] dark:text-[#98A99E] font-serif font-medium tracking-normal leading-none mt-0.5 whitespace-nowrap">
                आयुर्वेदो अमृतानाम्
              </span>
            </div>
          </Link>

          {/* ========================================================= */}
          {/* 2. MAIN CENTER NAVIGATION */}
          {/* ========================================================= */}
          <div className="hidden lg:flex items-center justify-center gap-0.5 xl:gap-1.5 2xl:gap-2 text-xs xl:text-[13px] 2xl:text-[13.5px] font-medium text-[#526158] dark:text-[#C1CEC5] min-w-0 flex-1 px-1">
            {!isPublicHome && isAuthLoading ? (
              // Fast loading skeleton
              <div className="flex items-center gap-3 animate-pulse" aria-hidden="true">
                <div className="h-4 w-14 bg-[#DCEBE1]/50 dark:bg-[#223128] rounded-md" />
                <div className="h-4 w-20 bg-[#DCEBE1]/50 dark:bg-[#223128] rounded-md" />
                <div className="h-4 w-16 bg-[#DCEBE1]/50 dark:bg-[#223128] rounded-md" />
                <div className="h-4 w-18 bg-[#DCEBE1]/50 dark:bg-[#223128] rounded-md" />
              </div>
            ) : (
              navItems.map((item, index) => {
                const active = isParentActive(item);
                const hasChildren = item.children && item.children.length > 0;
                const isOpen = activeDropdown === item.label;
                const IconComponent = item.icon;
                const buttonId = `nav-btn-${item.label.toLowerCase().replace(/\s+/g, "-")}`;
                const menuId = `nav-menu-${item.label.toLowerCase().replace(/\s+/g, "-")}`;
                const isNearRightEdge = index >= navItems.length - 2 || item.label.toLowerCase() === "more";

                if (hasChildren) {
                  return (
                    <div
                      key={item.label}
                      className="relative py-1"
                      onMouseEnter={() => handleMouseEnter(item.label)}
                      onMouseLeave={handleMouseLeave}
                    >
                      <button
                        ref={(el) => {
                          menuButtonsRef.current[item.label] = el;
                        }}
                        id={buttonId}
                        type="button"
                        aria-haspopup="true"
                        aria-expanded={isOpen}
                        aria-controls={isOpen ? menuId : undefined}
                        onClick={(e) => {
                          e.preventDefault();
                          const timeSinceHover = Date.now() - lastOpenedViaHoverRef.current;
                          if (isOpen && timeSinceHover < 400) {
                            return;
                          }
                          setActiveDropdown(isOpen ? null : item.label);
                        }}
                        onKeyDown={(e) => handleDropdownButtonKeyDown(e, item.label)}
                        className={`inline-flex items-center gap-1 transition-colors py-1 px-1.5 xl:px-2 2xl:px-2.5 rounded-lg cursor-pointer select-none whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2F6B4F] ${
                          active
                            ? "font-semibold text-[#2F6B4F] dark:text-[#78B895]"
                            : "hover:text-[#2F6B4F] dark:hover:text-[#78B895] text-[#526158] dark:text-[#C1CEC5]"
                        }`}
                      >
                        {IconComponent && (
                          <IconComponent className="w-3.5 h-3.5 opacity-80 shrink-0" />
                        )}
                        <span>{item.label}</span>
                        <ChevronDown
                          className={`w-3.5 h-3.5 transition-transform duration-200 ${
                            isOpen
                              ? "rotate-180 text-[#2F6B4F] dark:text-[#78B895]"
                              : "opacity-60"
                          }`}
                        />
                        {active && (
                          <span className="absolute bottom-0 left-0 w-full h-[2.5px] bg-[#2F6B4F] dark:bg-[#78B895] rounded-full" />
                        )}
                      </button>

                      {/* Accessible Dropdown Menu */}
                      {isOpen && (
                        <div
                          ref={(el) => {
                            dropdownMenuRefs.current[item.label] = el;
                          }}
                          id={menuId}
                          role="menu"
                          aria-labelledby={buttonId}
                          onKeyDown={(e) => handleMenuKeyDown(e, item.label)}
                          className={`absolute top-full mt-2 w-56 sm:w-60 xl:w-64 max-w-[calc(100vw-2rem)] max-h-[calc(100vh-5rem)] overflow-y-auto rounded-2xl bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 before:absolute before:-top-3 before:left-0 before:right-0 before:h-3 before:content-[''] ${
                            isNearRightEdge
                              ? "right-0 left-auto"
                              : "left-1/2 -translate-x-1/2"
                          }`}
                          onMouseEnter={() => handleMouseEnter(item.label)}
                          onMouseLeave={handleMouseLeave}
                        >
                          <div className="space-y-0.5">
                            {item.children?.map((child) => {
                              const childSelected = isChildActive(child.route);
                              const ChildIcon = child.icon;

                              return (
                                <Link
                                  key={child.route + child.label}
                                  href={child.route}
                                  role="menuitem"
                                  onClick={() => {
                                    setTimeout(() => setActiveDropdown(null), 150);
                                  }}
                                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2F6B4F] ${
                                    childSelected
                                      ? "bg-[#DCEBE1] dark:bg-[#294637] text-[#2F6B4F] dark:text-[#78B895] font-semibold border-l-2 border-[#2F6B4F] dark:border-[#78B895] pl-2.5"
                                      : "text-[#17231C] dark:text-[#F1F6F2] hover:bg-[#EEF4EF] dark:hover:bg-[#223128] hover:text-[#2F6B4F] dark:hover:text-[#78B895]"
                                  }`}
                                >
                                  <div className="flex items-center gap-2.5">
                                    {ChildIcon && (
                                      <ChildIcon
                                        className={`w-3.5 h-3.5 shrink-0 ${
                                          childSelected
                                            ? "text-[#2F6B4F] dark:text-[#78B895]"
                                            : "text-[#68776D] dark:text-[#98A99E]"
                                        }`}
                                      />
                                    )}
                                    <span>{child.label}</span>
                                  </div>
                                  {child.badge && (
                                    <span
                                      className={`px-1.5 py-0.5 rounded text-[9.5px] font-bold border uppercase tracking-wider ${getBadgeClasses(
                                        child.badge.variant
                                      )}`}
                                    >
                                      {child.badge.text}
                                    </span>
                                  )}
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.route + item.label}
                    href={item.route}
                    onClick={() => setActiveDropdown(null)}
                    className={`relative py-1 inline-flex items-center gap-1 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2F6B4F] rounded-lg px-1.5 xl:px-2 2xl:px-2.5 whitespace-nowrap ${
                      active
                        ? "font-semibold text-[#2F6B4F] dark:text-[#78B895]"
                        : "hover:text-[#2F6B4F] dark:hover:text-[#78B895] text-[#526158] dark:text-[#C1CEC5]"
                    }`}
                  >
                    {IconComponent && (
                      <IconComponent className="w-3.5 h-3.5 opacity-80 shrink-0" />
                    )}
                    <span>{item.label}</span>
                    {item.badge && (
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9.5px] font-bold border uppercase tracking-wider ${getBadgeClasses(
                          item.badge.variant
                        )}`}
                      >
                        {item.badge.text}
                      </span>
                    )}
                    {active && (
                      <span className="absolute bottom-0 left-0 w-full h-[2.5px] bg-[#2F6B4F] dark:bg-[#78B895] rounded-full" />
                    )}
                  </Link>
                );
              })
            )}
          </div>

          {/* ========================================================= */}
          {/* 3. RIGHT ACTION CONTROLS */}
          {/* ========================================================= */}
          <div className="flex items-center gap-1 sm:gap-1.5 xl:gap-2 shrink-0">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="w-8 h-8 sm:w-8.5 sm:h-8.5 xl:w-9 xl:h-9 rounded-full border border-[#D5DED8] dark:border-[#304036] flex items-center justify-center text-[#526158] dark:text-[#E5B85C] hover:border-[#2F6B4F] dark:hover:border-[#E5B85C] hover:bg-[#EEF4EF] dark:hover:bg-[#223128] transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2F6B4F] shrink-0 min-h-[32px] min-w-[32px] sm:min-h-[36px] sm:min-w-[36px]"
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#E5B85C] animate-pulse-subtle" />
              ) : (
                <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#17231C]" />
              )}
            </button>

            {/* Quick Search Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="hidden sm:flex w-8 h-8 sm:w-8.5 sm:h-8.5 xl:w-9 xl:h-9 rounded-full border border-[#D5DED8] dark:border-[#304036] items-center justify-center text-[#526158] dark:text-[#C1CEC5] hover:border-[#2F6B4F] dark:hover:border-[#78B895] hover:bg-[#EEF4EF] dark:hover:bg-[#223128] transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2F6B4F] shrink-0 min-h-[32px] min-w-[32px] sm:min-h-[36px] sm:min-w-[36px]"
              title="Search Aayuraura (Press /)"
              aria-label="Search"
            >
              <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            {/* Notifications Popover (When Authenticated and NOT on Public Home) */}
            {!isPublicHome && currentUser && (
              <div className="relative" ref={notificationsMenuRef}>
                <button
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  aria-haspopup="true"
                  aria-expanded={isNotificationsOpen}
                  className="w-8 h-8 sm:w-8.5 sm:h-8.5 xl:w-9 xl:h-9 rounded-full border border-[#D5DED8] dark:border-[#304036] flex items-center justify-center text-[#526158] dark:text-[#C1CEC5] hover:border-[#2F6B4F] dark:hover:border-[#78B895] hover:bg-[#EEF4EF] dark:hover:bg-[#223128] transition-all cursor-pointer relative focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2F6B4F] shrink-0 min-h-[32px] min-w-[32px] sm:min-h-[36px] sm:min-w-[36px]"
                  title="Notifications"
                  aria-label="View notifications"
                >
                  <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  {unreadNotificationsCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#2F6B4F] dark:bg-[#78B895] text-white dark:text-[#0D1511] rounded-full text-[9px] font-bold flex items-center justify-center border-2 border-[#F7F9F4] dark:border-[#0D1511]">
                      {unreadNotificationsCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown Window */}
                {isNotificationsOpen && (
                  <div
                    role="region"
                    aria-label="Recent activity and alerts"
                    className="absolute right-0 mt-2 w-[calc(100vw-1.5rem)] sm:w-80 md:w-96 max-w-sm rounded-2xl bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] shadow-xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150 before:absolute before:-top-3 before:left-0 before:right-0 before:h-3 before:content-['']"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-[#D5DED8] dark:border-[#304036]">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-[#2F6B4F] dark:text-[#78B895]" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#142019] dark:text-[#FFFFFF]">
                          Activity & Alerts
                        </h4>
                      </div>
                      <span className="text-[11px] font-mono text-[#2F6B4F] dark:text-[#78B895] font-semibold">
                        {notifications.length} Updates
                      </span>
                    </div>

                    <div className="divide-y divide-[#D5DED8]/60 dark:divide-[#304036] max-h-72 overflow-y-auto my-2">
                      {notifications.length === 0 ? (
                        <div className="py-6 text-center text-xs text-[#68776D] dark:text-[#98A99E]">
                          No pending alerts at this time.
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <Link
                            key={n.id}
                            href={n.href || "#"}
                            onClick={() => {
                              setTimeout(() => setIsNotificationsOpen(false), 100);
                            }}
                            className="block py-2.5 px-2 rounded-xl hover:bg-[#EEF4EF] dark:hover:bg-[#223128] transition-colors group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2F6B4F]"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-xs font-semibold text-[#17231C] dark:text-[#F1F6F2] group-hover:text-[#2F6B4F] dark:group-hover:text-[#78B895]">
                                {n.title}
                              </p>
                              <span className="text-[10px] text-[#68776D] dark:text-[#98A99E] shrink-0">
                                {n.timestamp}
                              </span>
                            </div>
                            <p className="text-[11px] text-[#526158] dark:text-[#C1CEC5] mt-0.5 line-clamp-2">
                                {n.description}
                            </p>
                          </Link>
                        ))
                      )}
                    </div>

                    <div className="pt-2 border-t border-[#D5DED8] dark:border-[#304036] text-center">
                      <Link
                        href={dashboardHref}
                        onClick={() => {
                          setTimeout(() => setIsNotificationsOpen(false), 100);
                        }}
                        className="text-[11px] font-semibold text-[#2F6B4F] dark:text-[#78B895] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2F6B4F] rounded"
                      >
                        Go to {userRole} Dashboard &rarr;
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Profile / Account Control */}
            {!isPublicHome && isAuthLoading ? (
              <div className="w-8 h-8 sm:w-24 sm:h-9 bg-[#DCEBE1]/40 dark:bg-[#223128] rounded-full animate-pulse" />
            ) : !isPublicHome && currentUser?.email ? (
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  aria-haspopup="true"
                  aria-expanded={isProfileMenuOpen}
                  className="flex items-center gap-1.5 2xl:gap-2 px-2 sm:pl-2.5 sm:pr-3 py-1.5 rounded-full bg-[#2F6B4F] dark:bg-[#78B895] text-white dark:text-[#0D1511] hover:bg-[#24563F] dark:hover:bg-[#91CAA8] transition-all shadow-xs cursor-pointer border border-[#2F6B4F]/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2F6B4F] min-h-[32px] sm:min-h-[36px]"
                  title="User Profile"
                  aria-label="User Profile"
                >
                  <div className="w-5 h-5 rounded-full bg-white/20 dark:bg-black/20 flex items-center justify-center shrink-0">
                    <RoleIcon className="w-3 h-3 text-white dark:text-[#0D1511]" />
                  </div>
                  <span className="hidden sm:inline font-mono text-[10.5px] 2xl:text-[11px] tracking-wider font-semibold">
                    {userRole || "USER"}
                  </span>
                  <ChevronDown
                    className={`w-3 h-3 transition-transform duration-200 opacity-75 ${
                      isProfileMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Profile Dropdown Drawer */}
                {isProfileMenuOpen && (
                  <div
                    role="menu"
                    aria-label="User Account Menu"
                    className="absolute right-0 mt-2 w-60 xl:w-64 max-w-[calc(100vw-1.5rem)] rounded-2xl bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] shadow-xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150 space-y-2 before:absolute before:-top-3 before:left-0 before:right-0 before:h-3 before:content-['']"
                  >
                    {/* User Identity Header */}
                    <div className="p-2.5 rounded-xl bg-[#EEF4EF] dark:bg-[#223128] border border-[#D5DED8] dark:border-[#304036]">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#2F6B4F] dark:bg-[#78B895] text-white dark:text-[#0D1511] flex items-center justify-center text-xs font-bold shrink-0">
                          {currentUser.email?.charAt(0).toUpperCase()}
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-xs font-bold text-[#142019] dark:text-[#FFFFFF] truncate">
                            {currentUser.email}
                          </p>
                          <span className="inline-block text-[10px] font-mono text-[#2F6B4F] dark:text-[#78B895] font-semibold">
                            Role: {userRole}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Navigation Shortcuts */}
                    <div className="space-y-0.5 text-xs text-[#17231C] dark:text-[#F1F6F2]">
                      <Link
                        href={dashboardHref}
                        role="menuitem"
                        onClick={() => {
                          setTimeout(() => setIsProfileMenuOpen(false), 100);
                        }}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[#EEF4EF] dark:hover:bg-[#223128] hover:text-[#2F6B4F] dark:hover:text-[#78B895] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2F6B4F]"
                      >
                        <RoleIcon className="w-4 h-4 text-[#2F6B4F] dark:text-[#78B895]" />
                        <span>Role Dashboard</span>
                      </Link>

                      <Link
                        href={getProfileLink()}
                        role="menuitem"
                        onClick={() => {
                          setTimeout(() => setIsProfileMenuOpen(false), 100);
                        }}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[#EEF4EF] dark:hover:bg-[#223128] hover:text-[#2F6B4F] dark:hover:text-[#78B895] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2F6B4F]"
                      >
                        <UserIcon className="w-4 h-4 text-[#2F6B4F] dark:text-[#78B895]" />
                        <span>Profile</span>
                      </Link>

                      <Link
                        href={getProfileLink() + "?tab=settings"}
                        role="menuitem"
                        onClick={() => {
                          setTimeout(() => setIsProfileMenuOpen(false), 100);
                        }}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[#EEF4EF] dark:hover:bg-[#223128] hover:text-[#2F6B4F] dark:hover:text-[#78B895] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2F6B4F]"
                      >
                        <Settings className="w-4 h-4 text-[#2F6B4F] dark:text-[#78B895]" />
                        <span>Settings</span>
                      </Link>

                      <Link
                        href="/community-forum"
                        role="menuitem"
                        onClick={() => {
                          setTimeout(() => setIsProfileMenuOpen(false), 100);
                        }}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[#EEF4EF] dark:hover:bg-[#223128] hover:text-[#2F6B4F] dark:hover:text-[#78B895] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2F6B4F]"
                      >
                        <HelpCircle className="w-4 h-4 text-[#2F6B4F] dark:text-[#78B895]" />
                        <span>Help & Community</span>
                      </Link>

                      <Link
                        href="/feedback"
                        role="menuitem"
                        onClick={() => {
                          setTimeout(() => setIsProfileMenuOpen(false), 100);
                        }}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[#EEF4EF] dark:hover:bg-[#223128] hover:text-[#2F6B4F] dark:hover:text-[#78B895] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2F6B4F]"
                      >
                        <MessageSquare className="w-4 h-4 text-[#2F6B4F] dark:text-[#78B895]" />
                        <span>Feedback & Support</span>
                      </Link>

                      <Link
                        href="/demo/profile"
                        role="menuitem"
                        onClick={() => {
                          setTimeout(() => setIsProfileMenuOpen(false), 100);
                        }}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#DCEBE1] dark:bg-[#294637] text-[#2F6B4F] dark:text-[#78B895] font-bold hover:bg-[#DCEBE1]/80 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2F6B4F]"
                      >
                        <Sparkles className="w-4 h-4 text-[#A96F16] dark:text-[#E5B85C]" />
                        <span>Interactive Demo Hub</span>
                      </Link>

                      <Link
                        href="/learning-hub"
                        role="menuitem"
                        onClick={() => {
                          setTimeout(() => setIsProfileMenuOpen(false), 100);
                        }}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[#EEF4EF] dark:hover:bg-[#223128] hover:text-[#2F6B4F] dark:hover:text-[#78B895] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2F6B4F]"
                      >
                        <BookOpen className="w-4 h-4 text-[#A96F16] dark:text-[#E5B85C]" />
                        <span>Learning Hub</span>
                      </Link>
                    </div>

                    {/* Logout Action */}
                    <div className="pt-2 border-t border-[#D5DED8] dark:border-[#304036]">
                      <button
                        role="menuitem"
                        onClick={handleLogout}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-[#B64040] dark:text-[#F18484] hover:bg-[#FAECEC] dark:hover:bg-[#351919] transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B64040]"
                      >
                        <span>Sign Out / Logout</span>
                        <LogOut className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Link
                  href="/demo/profile"
                  className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 sm:py-2 rounded-full border border-[#A96F16]/40 bg-[#FAF0E1] dark:bg-[#332512] text-[#A96F16] dark:text-[#E5B85C] text-xs font-bold hover:shadow-xs transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A96F16] min-h-[32px] sm:min-h-[36px]"
                >
                  <Sparkles className="w-3 h-3 text-[#A96F16] dark:text-[#E5B85C]" />
                  <span>⚡ Demo Showcase</span>
                </Link>
                <Link
                  href="/login"
                  className="px-3 sm:px-3.5 2xl:px-4 py-1.5 sm:py-2 rounded-full border border-[#D5DED8] dark:border-[#304036] hover:border-[#2F6B4F] dark:hover:border-[#78B895] bg-[#FFFFFF] dark:bg-[#17211B] text-[#17231C] dark:text-[#F1F6F2] text-xs font-semibold hover:shadow-xs transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2F6B4F] min-h-[32px] sm:min-h-[36px] flex items-center justify-center"
                >
                  <span>Login</span>
                </Link>
                <Link
                  href="/register"
                  className="flex items-center gap-1.5 px-3.5 sm:px-4 2xl:px-5 py-1.5 sm:py-2 rounded-full bg-[#2F6B4F] hover:bg-[#24563F] dark:bg-[#78B895] dark:hover:bg-[#91CAA8] text-white dark:text-[#0D1511] text-xs font-semibold hover:shadow-md transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2F6B4F] min-h-[32px] sm:min-h-[36px]"
                >
                  <UserIcon className="w-3.5 h-3.5 text-white/90 dark:text-[#0D1511]" />
                  <span>Register</span>
                </Link>
              </div>
            )}

            {/* Mobile & Tablet Hamburger Toggle Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-expanded={isMobileMenuOpen}
              aria-label="Toggle navigation drawer"
              className="lg:hidden p-1.5 sm:p-2 text-[#64736A] dark:text-[#A9B9AE] hover:text-[#2F6B4F] dark:hover:text-[#6FAF8A] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2F6B4F] cursor-pointer rounded-xl hover:bg-[#DCE8DF]/40 dark:hover:bg-[#26372D]/40 min-h-[36px] min-w-[36px] sm:min-h-[40px] sm:min-w-[40px] flex items-center justify-center shrink-0"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 sm:w-6 sm:h-6 text-[#1B2A22] dark:text-[#E8F1EB]" />
              ) : (
                <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* ========================================================= */}
      {/* 4. FULL-FEATURED RESPONSIVE SLIDE-OUT DRAWER (< 1024px) */}
      {/* ========================================================= */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden overflow-hidden animate-in fade-in duration-200">
          {/* Backdrop Dimmer Overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Slide-out Drawer Panel */}
          <div
            ref={mobileDrawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation Menu"
            className="fixed inset-y-0 right-0 w-full sm:w-80 md:w-96 max-w-[88vw] sm:max-w-md bg-[#F7F9F4] dark:bg-[#0D1511] border-l border-[#D5DED8] dark:border-[#304036] shadow-2xl flex flex-col z-50 animate-in slide-in-from-right duration-250 ease-out"
          >
            {/* Drawer Header */}
            <div className="p-3.5 sm:p-4 md:p-5 border-b border-[#D5DED8] dark:border-[#304036] flex items-center justify-between bg-[#F7F9F4] dark:bg-[#0D1511]">
              <Link
                href="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 sm:gap-2.5 select-none"
              >
                <img
                  src="/logo-emblem.png"
                  alt="Aayuraura"
                  className="w-8 h-8 sm:w-9 sm:h-9 object-contain"
                />
                <div className="flex flex-col">
                  <div className="flex items-baseline tracking-tight font-serif-heading font-bold text-lg sm:text-xl leading-none">
                    <span className="text-[#2F6B4F] dark:text-[#78B895]">Aayur</span>
                    <span className="text-[#A96F16] dark:text-[#E5B85C]">aura</span>
                  </div>
                  <span className="text-[9.5px] sm:text-[10px] text-[#68776D] dark:text-[#98A99E] font-serif font-medium leading-none mt-0.5">
                    आयुर्वेदो अमृतानाम्
                  </span>
                </div>
              </Link>

              <button
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Close navigation menu"
                className="p-1.5 sm:p-2 rounded-xl text-[#68776D] dark:text-[#98A99E] hover:bg-[#EEF4EF] dark:hover:bg-[#223128] transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Authenticated User Banner (Hidden on Public Home) */}
            {!isPublicHome && currentUser?.email && (
              <div className="px-3.5 sm:px-4 py-2.5 sm:py-3 bg-[#EEF4EF] dark:bg-[#223128] border-b border-[#D5DED8] dark:border-[#304036] flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 sm:gap-2.5 overflow-hidden min-w-0">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#2F6B4F] dark:bg-[#78B895] text-white dark:text-[#0D1511] flex items-center justify-center text-xs font-bold shrink-0">
                    {currentUser.email.charAt(0).toUpperCase()}
                  </div>
                  <div className="overflow-hidden min-w-0">
                    <p className="text-xs font-bold text-[#142019] dark:text-[#FFFFFF] truncate">
                      {currentUser.email}
                    </p>
                    <span className="text-[9.5px] sm:text-[10px] font-mono text-[#2F6B4F] dark:text-[#78B895] font-semibold block truncate">
                      Active Portal: {userRole}
                    </span>
                  </div>
                </div>

                <Link
                  href={dashboardHref}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-2.5 py-1 rounded-lg bg-[#2F6B4F] dark:bg-[#78B895] text-white dark:text-[#0D1511] text-[10.5px] sm:text-[11px] font-semibold hover:opacity-90 transition-opacity shrink-0"
                >
                  Dashboard
                </Link>
              </div>
            )}

            {/* Scrollable Navigation List */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-1.5 sm:space-y-2 text-[#17231C] dark:text-[#F1F6F2]">
              {/* Quick Mobile Search Button */}
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsSearchOpen(true);
                }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] text-[#526158] dark:text-[#C1CEC5] hover:text-[#2F6B4F] dark:hover:text-[#78B895] transition-colors text-xs font-semibold min-h-[40px] shadow-xs cursor-pointer mb-1"
                aria-label="Search Aayuraura"
              >
                <div className="flex items-center gap-2.5">
                  <Search className="w-4 h-4 text-[#2F6B4F] dark:text-[#78B895] shrink-0" />
                  <span>Search Aayuraura...</span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#DCEBE1] dark:bg-[#294637] text-[#2F6B4F] dark:text-[#78B895]">
                  /
                </span>
              </button>

              {navItems.map((item) => {
                const active = isParentActive(item);
                const ItemIcon = item.icon;
                const hasChildren = item.children && item.children.length > 0;
                const isExpanded = !!expandedMobileCategories[item.label];

                if (hasChildren) {
                  return (
                    <div
                      key={item.label}
                      className="rounded-2xl bg-[#FFFFFF] dark:bg-[#17211B] p-1.5 space-y-1 transition-colors border border-[#D5DED8] dark:border-[#304036]"
                    >
                      <button
                        type="button"
                        aria-expanded={isExpanded}
                        onClick={() => toggleMobileCategory(item.label)}
                        className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-xl select-none transition-colors min-h-[40px] cursor-pointer ${
                          active
                            ? "text-[#2F6B4F] dark:text-[#78B895] bg-[#DCEBE1] dark:bg-[#294637]"
                            : "text-[#526158] dark:text-[#C1CEC5] hover:bg-[#EEF4EF] dark:hover:bg-[#223128]"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          {ItemIcon && <ItemIcon className="w-4 h-4 text-[#2F6B4F] dark:text-[#78B895] shrink-0" />}
                          <span>{item.label}</span>
                        </div>
                        <ChevronRight
                          className={`w-4 h-4 transition-transform duration-200 text-[#2F6B4F] dark:text-[#78B895] shrink-0 ${
                            isExpanded ? "rotate-90" : ""
                          }`}
                        />
                      </button>

                      {isExpanded && (
                        <div className="pl-2 space-y-1 pt-1 border-t border-[#D5DED8] dark:border-[#304036]">
                          {item.children?.map((child) => {
                            const childSelected = isChildActive(child.route);
                            const ChildIcon = child.icon;

                            return (
                              <Link
                                key={child.route + child.label}
                                href={child.route}
                                onClick={() => {
                                  setTimeout(() => setIsMobileMenuOpen(false), 100);
                                }}
                                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors min-h-[40px] ${
                                  childSelected
                                    ? "bg-[#DCEBE1] dark:bg-[#294637] text-[#2F6B4F] dark:text-[#78B895] font-bold border-l-2 border-[#2F6B4F] dark:border-[#78B895] pl-2.5"
                                    : "hover:bg-[#EEF4EF] dark:hover:bg-[#223128] text-[#17231C] dark:text-[#F1F6F2]"
                                }`}
                              >
                                <div className="flex items-center gap-2.5">
                                  {ChildIcon && (
                                    <ChildIcon
                                      className={`w-4 h-4 shrink-0 ${
                                        childSelected
                                          ? "text-[#2F6B4F] dark:text-[#78B895]"
                                          : "text-[#68776D] dark:text-[#98A99E]"
                                      }`}
                                    />
                                  )}
                                  <span>{child.label}</span>
                                </div>
                                {child.badge && (
                                  <span
                                    className={`px-1.5 py-0.5 rounded text-[9px] font-bold border shrink-0 ${getBadgeClasses(
                                      child.badge.variant
                                    )}`}
                                  >
                                    {child.badge.text}
                                  </span>
                                )}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.route + item.label}
                    href={item.route}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-medium transition-colors min-h-[40px] ${
                      active
                        ? "bg-[#DCEBE1] dark:bg-[#294637] text-[#2F6B4F] dark:text-[#78B895] font-bold border-l-2 border-[#2F6B4F] dark:border-[#78B895] pl-3"
                        : "hover:bg-[#EEF4EF] dark:hover:bg-[#223128] text-[#17231C] dark:text-[#F1F6F2]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {ItemIcon && (
                        <ItemIcon className="w-4 h-4 text-[#2F6B4F] dark:text-[#78B895] shrink-0" />
                      )}
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9.5px] font-bold border shrink-0 ${getBadgeClasses(
                          item.badge.variant
                        )}`}
                      >
                        {item.badge.text}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-3 sm:p-4 border-t border-[#D5DED8] dark:border-[#304036] bg-[#F7F9F4] dark:bg-[#0D1511] space-y-2">
              {/* Mobile Theme Toggle Button */}
              <button
                type="button"
                onClick={toggleTheme}
                className="w-full flex items-center justify-between py-2 px-3 rounded-xl bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] text-[#17231C] dark:text-[#F1F6F2] hover:bg-[#EEF4EF] dark:hover:bg-[#223128] transition-colors cursor-pointer min-h-[40px]"
                aria-label="Toggle theme"
              >
                <div className="flex items-center gap-2 text-xs font-semibold">
                  {theme === "dark" ? (
                    <Sun className="w-4 h-4 text-[#E5B85C] animate-pulse-subtle" />
                  ) : (
                    <Moon className="w-4 h-4 text-[#17231C]" />
                  )}
                  <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#DCEBE1] dark:bg-[#294637] text-[#2F6B4F] dark:text-[#78B895] font-bold uppercase">
                  {theme}
                </span>
              </button>

              {!isPublicHome && currentUser?.email ? (
                <>
                  <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                    <Link
                      href={getProfileLink()}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] text-[#17231C] dark:text-[#F1F6F2] hover:bg-[#EEF4EF] dark:hover:bg-[#223128] transition-colors min-h-[40px]"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-[#2F6B4F] dark:text-[#78B895]" />
                      <span>Profile</span>
                    </Link>

                    <Link
                      href="/learning-hub"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] text-[#17231C] dark:text-[#F1F6F2] hover:bg-[#EEF4EF] dark:hover:bg-[#223128] transition-colors min-h-[40px]"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-[#A96F16] dark:text-[#E5B85C]" />
                      <span>Learning</span>
                    </Link>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#FAECEC] dark:bg-[#351919] text-[#B64040] dark:text-[#F18484] font-semibold text-xs border border-[#B64040]/30 hover:opacity-90 transition-opacity cursor-pointer min-h-[40px]"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log Out of Aayuraura</span>
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] text-[#17231C] dark:text-[#F1F6F2] font-bold text-xs shadow-xs min-h-[40px]"
                  >
                    <span>Login</span>
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#2F6B4F] hover:bg-[#24563F] dark:bg-[#78B895] dark:hover:bg-[#91CAA8] text-white dark:text-[#0D1511] font-bold text-xs shadow-md min-h-[40px]"
                  >
                    <UserIcon className="w-3.5 h-3.5" />
                    <span>Register</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Global Search Dialog */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
}
