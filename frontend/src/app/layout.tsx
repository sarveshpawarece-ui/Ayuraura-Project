import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import PWARegister from "@/components/pwa/PWARegister";
import OfflineBanner from "@/components/pwa/OfflineBanner";
import PWAInstallPrompt from "@/components/pwa/PWAInstallPrompt";
import MobileBottomNav from "@/components/navigation/MobileBottomNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-serif-heading",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

export const viewport: Viewport = {
  themeColor: "#0D2B1D",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "Aayuraura - BAMS Education & Ayush Skill Intelligence Platform",
  description: "Aayuraura - Complete BAMS Student Learning, Curriculum Mastery, and Ayush Clinical Intelligence Platform",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Aayuraura",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/logo-emblem.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans bg-[#F7F9F4] text-[#17231C] dark:bg-[#0D1511] dark:text-[#F1F6F2] transition-colors duration-300">
        <ThemeProvider>
          <PWARegister />
          <OfflineBanner />
          {children}
          <MobileBottomNav />
          <PWAInstallPrompt />
        </ThemeProvider>
      </body>
    </html>
  );
}

