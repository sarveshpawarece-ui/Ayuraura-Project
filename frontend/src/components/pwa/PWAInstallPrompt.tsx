"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Download, X, Share } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    const isSafari = /safari/.test(userAgent) && !/chrome|crios|fxios/.test(userAgent);
    return isIosDevice && isSafari;
  });
  const [isStandalone] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
      document.referrer.includes("android-app://")
    );
  });

  useEffect(() => {
    if (typeof window === "undefined" || isStandalone) return;

    // Check dismissal cooldown (7 days)
    const dismissedUntil = localStorage.getItem("aayuraura_pwa_dismissed_until");
    if (dismissedUntil && parseInt(dismissedUntil, 10) > Date.now()) {
      return;
    }

    if (isIOS) {
      // Delayed appearance for smooth onboarding on iOS
      const timer = setTimeout(() => setShowPrompt(true), 3500);
      return () => clearTimeout(timer);
    }

    // Capture standard beforeinstallprompt for Android / Chromium browsers
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show prompt after brief delay
      setTimeout(() => setShowPrompt(true), 3000);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`[Aayuraura PWA] User response to install prompt: ${outcome}`);

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Dismiss for 7 days
    const nextPromptDate = Date.now() + 7 * 24 * 60 * 60 * 1000;
    localStorage.setItem("aayuraura_pwa_dismissed_until", nextPromptDate.toString());
  };

  if (!showPrompt || isStandalone) {
    return null;
  }

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 left-4 md:left-auto md:max-w-md z-50 animate-in slide-in-from-bottom-4 duration-300">
      <div className="p-4 rounded-2xl bg-white/95 dark:bg-[#121E17]/95 backdrop-blur-xl border border-[#D49B4B]/40 shadow-2xl relative overflow-hidden">
        {/* Vedic subtle gradient backdrop */}
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-[#D49B4B]/10 blur-2xl pointer-events-none" />

        <div className="flex items-start gap-3 relative">
          <div className="w-11 h-11 rounded-xl bg-[#0D2B1D] border border-[#D49B4B]/40 flex items-center justify-center shrink-0 shadow-md">
            <Image
              src="/logo-emblem.png"
              alt="Aayuraura Emblem"
              width={28}
              height={28}
              className="object-contain"
              priority
            />
          </div>

          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono uppercase font-bold text-[#D49B4B]">
                Install App
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <h4 className="text-sm font-bold text-[#0D2B1D] dark:text-[#EAE3D2] leading-tight mt-0.5">
              Install Aayuraura for BAMS
            </h4>
            <p className="text-xs text-[#526158] dark:text-[#A9B9AE] mt-1 leading-relaxed">
              Add to your home screen for quick offline shloka access, faster navigation, and full-screen study.
            </p>

            {isIOS ? (
              <div className="mt-2.5 p-2 rounded-lg bg-black/5 dark:bg-white/5 border border-black/5 text-[11px] text-[#627067] dark:text-[#A9B9AE] space-y-1">
                <div className="flex items-center gap-1.5 font-medium text-[#0D2B1D] dark:text-[#EAE3D2]">
                  <span>1. Tap the Share button</span>
                  <Share className="w-3.5 h-3.5 text-[#D49B4B]" />
                  <span>below in Safari</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span>2. Tap <strong>&quot;Add to Home Screen&quot;</strong></span>
                </div>
              </div>
            ) : (
              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#0D2B1D] to-[#1b4330] hover:from-[#133e2a] hover:to-[#22573f] text-[#D49B4B] text-xs font-bold transition-all flex items-center gap-1.5 shadow-md cursor-pointer active:scale-95 border border-[#D49B4B]/30"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Install Now</span>
                </button>
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="px-3 py-2 rounded-xl text-xs font-medium text-[#627067] dark:text-[#A9B9AE] hover:text-[#0D2B1D] dark:hover:text-white transition-colors"
                >
                  Maybe Later
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleDismiss}
            className="absolute top-0 right-0 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
            title="Dismiss install prompt"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
