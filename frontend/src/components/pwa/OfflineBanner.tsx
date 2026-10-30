"use client";

import React, { useState } from "react";
import Link from "next/link";
import { WifiOff, Wifi, BookOpen, X, RefreshCw } from "lucide-react";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";

export default function OfflineBanner() {
  const { isOnline, wasOffline } = useNetworkStatus();
  const [dismissed, setDismissed] = useState(false);

  // If online and was not previously offline, render nothing
  if (isOnline && !wasOffline) {
    return null;
  }

  // If dismissed during current offline session
  if (!isOnline && dismissed) {
    return (
      <div className="fixed bottom-20 md:bottom-6 right-4 z-50 animate-in fade-in slide-in-from-bottom-2">
        <button
          type="button"
          onClick={() => setDismissed(false)}
          className="p-2.5 rounded-full bg-amber-600 text-white shadow-xl flex items-center gap-2 hover:bg-amber-700 transition-all text-xs font-semibold"
          title="You are offline. Click to view offline options."
        >
          <WifiOff className="w-4 h-4" />
          <span className="hidden sm:inline">Offline Mode</span>
        </button>
      </div>
    );
  }

  // Returning online recovery toast
  if (isOnline && wasOffline) {
    return (
      <aside
        aria-label="Network Status"
        className="fixed top-0 inset-x-0 z-50 bg-emerald-600 text-white text-xs font-medium px-4 py-2 flex items-center justify-between shadow-md animate-in slide-in-from-top duration-300"
      >
        <div className="max-w-6xl mx-auto w-full flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Wifi className="w-4 h-4 text-emerald-200 animate-pulse shrink-0" />
            <span>Connected to Aayuraura. All live features and sync restored.</span>
          </div>
          <span className="text-[10px] uppercase font-mono opacity-80">Online</span>
        </div>
      </aside>
    );
  }

  // Disconnected offline alert banner
  return (
    <aside
      aria-label="Network Status"
      className="fixed top-0 inset-x-0 z-50 bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 text-white text-xs px-4 py-2 shadow-lg animate-in slide-in-from-top duration-300"
    >
      <div className="max-w-6xl mx-auto w-full flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <WifiOff className="w-4 h-4 text-amber-200 shrink-0" />
          <span className="font-semibold truncate">
            You are offline.
          </span>
          <span className="hidden sm:inline opacity-90 truncate">
            Offline mode active — saved notes and NCISM shlokas remain accessible.
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/student/offline"
            className="px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white text-[11px] font-bold transition-all flex items-center gap-1.5 shadow-xs"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Open Offline Hub</span>
          </Link>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="p-1 rounded-md hover:bg-white/20 text-white transition-colors"
            title="Retry Connection"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="p-1 rounded-md hover:bg-white/20 text-white transition-colors"
            title="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
