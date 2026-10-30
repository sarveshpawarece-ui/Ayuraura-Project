"use client";

import React from "react";
import Link from "next/link";
import { X, Lock, ArrowRight, Sparkles, UserPlus, LogIn } from "lucide-react";

interface AuthPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureTitle?: string;
  targetRoute?: string;
}

export default function AuthPromptModal({
  isOpen,
  onClose,
  featureTitle,
  targetRoute = "/student/dashboard",
}: AuthPromptModalProps) {
  if (!isOpen) return null;

  const loginHref = `/login?redirect=${encodeURIComponent(targetRoute)}`;
  const registerHref = `/register?redirect=${encodeURIComponent(targetRoute)}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-white dark:bg-[#17221C] rounded-3xl shadow-2xl border border-[#DCE4DE] dark:border-[#2B3A31] p-6 sm:p-8 space-y-6 text-[#1B2A22] dark:text-[#E8F1EB] transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-[#64736A] dark:text-[#A9B9AE] hover:text-[#1B2A22] dark:hover:text-white hover:bg-[#F7F9F4] dark:hover:bg-[#0F1713] transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon & Title */}
        <div className="text-center space-y-3 pt-2">
          <div className="w-14 h-14 rounded-2xl bg-[#DCE8DF] dark:bg-[#26372D] text-[#2F6B4F] dark:text-[#6FAF8A] flex items-center justify-center mx-auto shadow-sm">
            <Lock className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DCE8DF]/60 dark:bg-[#26372D]/60 text-[#2F6B4F] dark:text-[#6FAF8A] text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> Platform Access
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Login or Register to use this feature
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-[#64736A] dark:text-[#A9B9AE] leading-relaxed">
            {featureTitle ? (
              <>
                You are accessing <strong className="text-[#1B2A22] dark:text-[#E8F1EB]">{featureTitle}</strong>. Please sign in or create an Aayuraura account to proceed.
              </>
            ) : (
              "Please sign in to access clinical sessions, career tools, internships, and student assessments."
            )}
          </p>
        </div>

        {/* Action Buttons: [Login] [Register] */}
        <div className="space-y-3 pt-2">
          <Link
            href={loginHref}
            onClick={onClose}
            className="w-full py-3.5 px-5 rounded-2xl bg-[#2F6B4F] hover:bg-[#24563F] dark:bg-[#6FAF8A] dark:hover:bg-[#8BC4A2] text-white dark:text-[#0F1713] font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all"
          >
            <LogIn className="w-4 h-4" />
            <span>Login to Continue</span>
            <ArrowRight className="w-4 h-4 ml-auto" />
          </Link>

          <Link
            href={registerHref}
            onClick={onClose}
            className="w-full py-3 px-5 rounded-2xl bg-[#F7F9F4] dark:bg-[#0F1713] hover:bg-[#DCE8DF]/60 dark:hover:bg-[#26372D] border border-[#DCE4DE] dark:border-[#2B3A31] text-[#1B2A22] dark:text-[#E8F1EB] font-bold text-sm flex items-center justify-center gap-2 transition-all"
          >
            <UserPlus className="w-4 h-4 text-[#2F6B4F] dark:text-[#6FAF8A]" />
            <span>Create New Account (Register)</span>
          </Link>
        </div>

        {/* Guest note */}
        <div className="text-center pt-1 border-t border-[#DCE4DE] dark:border-[#2B3A31]">
          <button
            onClick={onClose}
            className="text-xs text-[#64736A] dark:text-[#A9B9AE] hover:text-[#1B2A22] dark:hover:text-white font-medium transition-colors"
          >
            Continue browsing public Home
          </button>
        </div>
      </div>
    </div>
  );
}
