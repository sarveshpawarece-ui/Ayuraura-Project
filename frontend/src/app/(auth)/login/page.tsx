"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  GraduationCap,
  Stethoscope,
  Briefcase,
  Building2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  LogIn,
  ShieldCheck,
  Heart,
  Sprout,
  Users,
  AlertCircle,
  Info,
  KeyRound,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";
import { api } from "@/lib/api";
import { clearAuthSession, setCachedSessionUser } from "@/lib/authSession";
import { getDashboardRouteForRole, UserRole } from "@/config/navigation";
import { isDemoEmail } from "@/lib/demoData";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";

export const validateGmail = (emailStr: string): string | null => {
  if (!emailStr || !emailStr.trim()) {
    return "Email address is required.";
  }
  const clean = emailStr.trim().toLowerCase();
  const emailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
  if (!emailRegex.test(clean)) {
    return "Please enter a valid email format.";
  }
  if (!clean.endsWith("@gmail.com")) {
    return "Registration and login are restricted to valid Gmail addresses (@gmail.com). Non-Gmail providers like Yahoo, Outlook, or custom domains are not accepted.";
  }
  const localPart = clean.slice(0, -10);
  if (!localPart || localPart.length < 3) {
    return "Invalid Gmail address. Username before @gmail.com must be at least 3 characters.";
  }
  return null;
};

function LoginForm() {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect");

  type AuthRole = "STUDENT" | "DOCTOR" | "INDUSTRY" | "INSTITUTION" | "NGO" | "ADMIN";
  const [role, setRole] = useState<AuthRole>("STUDENT");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // 2FA / OTP Verification States
  const [step, setStep] = useState<"CREDENTIALS" | "OTP">("CREDENTIALS");
  const [challengeToken, setChallengeToken] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const DEMO_CREDENTIALS: Record<AuthRole, { email: string; pass: string }> = {
    STUDENT: { email: "student@ayursetu.local", pass: "AyurSetu@2026" },
    DOCTOR: { email: "doctor@ayursetu.local", pass: "AyurSetu@2026" },
    INSTITUTION: { email: "institution@ayursetu.local", pass: "AyurSetu@2026" },
    INDUSTRY: { email: "industry@ayursetu.local", pass: "AyurSetu@2026" },
    NGO: { email: "ngo@ayursetu.local", pass: "AyurSetu@2026" },
    ADMIN: { email: "admin@ayursetu.local", pass: "AyurSetu@2026" },
  };

  const handleRoleSelect = (selectedRole: AuthRole) => {
    setRole(selectedRole);
    setEmail(DEMO_CREDENTIALS[selectedRole].email);
    setPassword(DEMO_CREDENTIALS[selectedRole].pass);
  };

  const handleFinalizeLogin = (authData: any) => {
    const rawRole = authData.role || role;
    const userRole = (rawRole || "").toString().trim().toUpperCase() as UserRole;

    if (!["STUDENT", "DOCTOR", "INSTITUTION", "INDUSTRY", "NGO", "ADMIN"].includes(userRole)) {
      setError("Invalid user role assigned. Please contact administrator.");
      return;
    }

    const token = authData.access_token;
    const userEmail = authData.email || email.trim();

    localStorage.setItem("aayuraura_token", token);
    localStorage.setItem("ayursetu_token", token);
    localStorage.setItem("token", token);
    localStorage.setItem("aayuraura_role", userRole);
    localStorage.setItem("ayursetu_role", userRole);
    localStorage.setItem("role", userRole);
    localStorage.setItem("aayuraura_email", userEmail);
    localStorage.setItem("ayursetu_email", userEmail);
    localStorage.setItem("email", userEmail);
    localStorage.setItem(
      "aayuraura_user",
      JSON.stringify({ id: authData.user_id, email: userEmail, role: userRole })
    );
    localStorage.setItem(
      "ayursetu_user",
      JSON.stringify({ id: authData.user_id, email: userEmail, role: userRole })
    );

    setCachedSessionUser({
      id: String(authData.user_id || "user-id"),
      email: userEmail,
      role: userRole,
      is_active: true,
      is_verified: true,
    });

    window.dispatchEvent(new Event("ayursetu_auth_change"));

    // Determine correct landing route
    const roleDashboardRoute = getDashboardRouteForRole(userRole);

    if (
      redirectUrl &&
      redirectUrl.startsWith("/") &&
      !redirectUrl.startsWith("/login") &&
      !redirectUrl.startsWith("/register")
    ) {
      if (redirectUrl.startsWith("/admin") && userRole !== "ADMIN") {
        window.location.href = roleDashboardRoute;
        return;
      }
      if (redirectUrl === "/dashboard") {
        window.location.href = roleDashboardRoute;
        return;
      }
      window.location.href = redirectUrl;
      return;
    }

    window.location.href = roleDashboardRoute;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    const cleanEmail = email.trim().toLowerCase();
    const isDemo =
      isDemoEmail(cleanEmail) &&
      DEMO_CREDENTIALS[role]?.email.toLowerCase() === cleanEmail &&
      password === DEMO_CREDENTIALS[role]?.pass;

    if (!isDemo) {
      const emailError = validateGmail(email);
      if (emailError) {
        setError(emailError);
        return;
      }
    }

    setLoading(true);

    try {
      clearAuthSession();

      const formData = new FormData();
      formData.append("username", cleanEmail);
      formData.append("password", password);

      const res = await api.post("/auth/login", formData, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      // Check if SMTP OTP 2FA challenge is issued
      if (res.data?.otp_required && res.data?.challenge_token) {
        setChallengeToken(res.data.challenge_token);
        setMaskedEmail(res.data.masked_email || "your registered email");
        setStep("OTP");
        setSuccessMsg(res.data.message || "A 6-digit verification code has been sent to your email.");
        setResendCooldown(30);
        return;
      }

      // Direct login (when OTP requirement is bypassed or disabled)
      handleFinalizeLogin(res.data);
    } catch (err: any) {
      const cleanEmail = email.trim().toLowerCase();
      const isDemo =
        isDemoEmail(cleanEmail) &&
        DEMO_CREDENTIALS[role]?.email.toLowerCase() === cleanEmail &&
        password === DEMO_CREDENTIALS[role]?.pass;

      // In case backend is offline / unreachable, seamless demo role authentication:
      if (isDemo && (!err.response || err.response.status >= 500 || err.code === "ERR_NETWORK")) {
        const demoRole = role.toUpperCase() as UserRole;
        clearAuthSession();
        localStorage.setItem("ayursetu_token", `demo_token_${demoRole.toLowerCase()}`);
        localStorage.setItem("token", `demo_token_${demoRole.toLowerCase()}`);
        localStorage.setItem("ayursetu_role", demoRole);
        localStorage.setItem("role", demoRole);
        localStorage.setItem("ayursetu_email", cleanEmail);
        localStorage.setItem("email", cleanEmail);
        localStorage.setItem(
          "ayursetu_user",
          JSON.stringify({ id: `demo-${demoRole.toLowerCase()}`, email: cleanEmail, role: demoRole })
        );

        setCachedSessionUser({
          id: `demo-${demoRole.toLowerCase()}`,
          email: cleanEmail,
          role: demoRole,
          is_active: true,
          is_verified: true,
        });

        window.dispatchEvent(new Event("ayursetu_auth_change"));
        const targetRoute = getDashboardRouteForRole(demoRole);
        window.location.href = targetRoute;
        return;
      }

      setError(
        err.response?.data?.detail ||
          "Invalid login credentials. Please check your email and password."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.trim().length !== 6) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }
    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const res = await api.post("/auth/verify-login-otp", {
        challenge_token: challengeToken,
        otp: otpCode.trim(),
      });
      handleFinalizeLogin(res.data);
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
          "Verification failed. The code may be incorrect or expired."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || loading) return;
    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const res = await api.post("/auth/resend-login-otp", {
        challenge_token: challengeToken,
      });
      if (res.data?.challenge_token) {
        setChallengeToken(res.data.challenge_token);
      }
      setSuccessMsg(res.data?.message || "A new 6-digit code has been dispatched to your email.");
      setResendCooldown(30);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Unable to resend verification code. Please wait a moment.");
    } finally {
      setLoading(false);
    }
  };

  const roleOptions = [
    {
      id: "STUDENT" as const,
      label: "Student",
      icon: GraduationCap,
    },
    {
      id: "DOCTOR" as const,
      label: "Doctor",
      icon: Stethoscope,
    },
    {
      id: "INDUSTRY" as const,
      label: "Industry",
      icon: Briefcase,
    },
    {
      id: "INSTITUTION" as const,
      label: "Institute",
      icon: Building2,
    },
    {
      id: "NGO" as const,
      label: "NGO",
      icon: Heart,
    },
    {
      id: "ADMIN" as const,
      label: "Admin",
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="min-h-screen lg:h-screen lg:max-h-screen relative flex flex-col justify-between overflow-x-hidden bg-[#f4f7f1] dark:bg-[#0F1713] text-[#1a3827] dark:text-[#E8F1EB] selection:bg-[#205c3b] selection:text-white transition-colors duration-300">
      {/* Landscape Artwork Background — EXACT original artwork without dark overlays */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none">
        <img
          src="/auth-bg.jpg"
          alt="Ayurvedic Landscape Background"
          className="w-full h-full object-cover object-bottom opacity-100 dark:opacity-30"
        />
      </div>

      {/* Top Header Bar */}
      <header className="relative z-20 px-6 sm:px-10 lg:px-14 pt-4 sm:pt-6 pb-2 flex items-center justify-between shrink-0">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#205c3b] rounded-xl p-1">
          <img
            src="/logo-emblem.png"
            alt="Aayuraura Logo"
            className="w-10 h-10 sm:w-11 sm:h-11 object-contain drop-shadow-xs group-hover:scale-105 transition-transform"
          />
          <div className="flex flex-col">
            <div className="flex items-baseline font-serif-heading font-bold text-2xl leading-none tracking-tight">
              <span className="text-[#134927] dark:text-[#6FAF8A] group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                Aayur
              </span>
              <span className="text-[#c08238] dark:text-[#E4B45D] group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                aura
              </span>
            </div>
            <span className="text-[10px] sm:text-[11px] text-[#426b52] dark:text-[#A9B9AE] font-medium tracking-tight mt-0.5 whitespace-nowrap">
              Ayush Skill Intelligence Platform
            </span>
          </div>
        </Link>

        {/* Top Right Motto */}
        <div className="hidden md:flex items-center gap-2 text-xs sm:text-[13px] font-medium text-[#466652] dark:text-[#A9B9AE]">
          <span>Tradition</span>
          <span className="text-[#9abcb0] dark:text-[#6FAF8A]">•</span>
          <span>Technology</span>
          <span className="text-[#9abcb0] dark:text-[#6FAF8A]">•</span>
          <span>A Healthier Tomorrow</span>
          <span className="text-base select-none ml-0.5">🍃</span>
        </div>
      </header>

      {/* Main Grid: 2-Column Hero on Sky Area & Right Login Card */}
      <main className="relative z-10 flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-8 lg:px-12 py-2 lg:py-3 flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full">
          
          {/* Left Column: Positioned in the upper sky area for maximum readability (6 cols) */}
          <div className="lg:col-span-6 flex flex-col justify-start space-y-3.5 sm:space-y-4 pt-0 lg:-translate-y-16 xl:-translate-y-20 pb-2">
            
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#eaf4ec]/95 dark:bg-[#26372D]/90 border border-[#cbe1d0] dark:border-[#6FAF8A]/30 text-[#205c3b] dark:text-[#6FAF8A] text-[11px] font-bold tracking-wider uppercase w-fit shadow-2xs">
              <span>LEARN</span>
              <span className="text-emerald-400 dark:text-[#E4B45D]">•</span>
              <span>HEAL</span>
              <span className="text-emerald-400 dark:text-[#E4B45D]">•</span>
              <span>GROW</span>
            </div>

            {/* Serif Heading in Sky Area */}
            <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-bold font-serif-heading text-[#143d26] dark:text-[#E8F1EB] leading-[1.16] tracking-tight max-w-lg">
              Building a Stronger<br />
              <span className="text-[#143d26] dark:text-[#6FAF8A]">Ayush Ecosystem</span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-[#446653] dark:text-[#A9B9AE] font-medium leading-relaxed max-w-lg">
              Connecting students, doctors, institutions and industry through skills, knowledge and opportunities.
            </p>

            {/* 4 Feature Circles Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-2 max-w-xl pl-2 sm:pl-6 lg:pl-8">
              {/* 1. Learn */}
              <div className="flex flex-col items-center text-center p-2 rounded-2xl bg-white/80 dark:bg-[#17221C]/80 backdrop-blur-xs border border-white/90 dark:border-[#2B3A31] shadow-2xs">
                <div className="w-11 h-11 rounded-full bg-white dark:bg-[#26372D] border border-[#b4d4be] dark:border-[#6FAF8A]/30 flex items-center justify-center text-[#134928] dark:text-[#6FAF8A] mb-1.5 shadow-xs">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <span className="font-bold text-xs sm:text-sm text-[#0f341e] dark:text-[#E8F1EB]">Learn</span>
                <span className="text-[10px] sm:text-[11px] text-[#345943] dark:text-[#A9B9AE] font-medium leading-tight mt-0.5 max-w-[95px]">
                  Gain skills for a better future
                </span>
              </div>

              {/* 2. Grow */}
              <div className="flex flex-col items-center text-center p-2 rounded-2xl bg-white/80 dark:bg-[#17221C]/80 backdrop-blur-xs border border-white/90 dark:border-[#2B3A31] shadow-2xs">
                <div className="w-11 h-11 rounded-full bg-white dark:bg-[#26372D] border border-[#b4d4be] dark:border-[#6FAF8A]/30 flex items-center justify-center text-[#134928] dark:text-[#6FAF8A] mb-1.5 shadow-xs">
                  <Sprout className="w-5 h-5" />
                </div>
                <span className="font-bold text-xs sm:text-sm text-[#0f341e] dark:text-[#E8F1EB]">Grow</span>
                <span className="text-[10px] sm:text-[11px] text-[#345943] dark:text-[#A9B9AE] font-medium leading-tight mt-0.5 max-w-[95px]">
                  Unlock your potential
                </span>
              </div>

              {/* 3. Connect */}
              <div className="flex flex-col items-center text-center p-2 rounded-2xl bg-white/80 dark:bg-[#17221C]/80 backdrop-blur-xs border border-white/90 dark:border-[#2B3A31] shadow-2xs">
                <div className="w-11 h-11 rounded-full bg-white dark:bg-[#26372D] border border-[#b4d4be] dark:border-[#6FAF8A]/30 flex items-center justify-center text-[#134928] dark:text-[#6FAF8A] mb-1.5 shadow-xs">
                  <Users className="w-5 h-5" />
                </div>
                <span className="font-bold text-xs sm:text-sm text-[#0f341e] dark:text-[#E8F1EB]">Connect</span>
                <span className="text-[10px] sm:text-[11px] text-[#345943] dark:text-[#A9B9AE] font-medium leading-tight mt-0.5 max-w-[95px]">
                  Build meaningful opportunities
                </span>
              </div>

              {/* 4. Serve */}
              <div className="flex flex-col items-center text-center p-2 rounded-2xl bg-white/80 dark:bg-[#17221C]/80 backdrop-blur-xs border border-white/90 dark:border-[#2B3A31] shadow-2xs">
                <div className="w-11 h-11 rounded-full bg-white dark:bg-[#26372D] border border-[#b4d4be] dark:border-[#6FAF8A]/30 flex items-center justify-center text-[#134928] dark:text-[#6FAF8A] mb-1.5 shadow-xs">
                  <Heart className="w-5 h-5" />
                </div>
                <span className="font-bold text-xs sm:text-sm text-[#0f341e] dark:text-[#E8F1EB]">Serve</span>
                <span className="text-[10px] sm:text-[11px] text-[#345943] dark:text-[#A9B9AE] font-medium leading-tight mt-0.5 max-w-[95px]">
                  For a healthier society
                </span>
              </div>
            </div>

            {/* Script Motto in empty sky area above the books */}
            <div className="pt-3 hidden sm:block">
              <span className="italic font-serif text-sm sm:text-base text-[#2e5b41] dark:text-[#6FAF8A] tracking-wide select-none drop-shadow-2xs">
                "Ancient Wisdom for a Better Tomorrow"
              </span>
            </div>
          </div>

          {/* Right Column: Clean, Polished Sign-in Card (6 cols) */}
          <div className="lg:col-span-6 flex justify-center lg:justify-end w-full">
            <div className="w-full max-w-[460px] bg-white dark:bg-[#17221C] rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(20,55,35,0.13),0_4px_16px_rgba(0,0,0,0.04)] border border-[#d8e6d9] dark:border-[#2B3A31] transition-all">
              
              {/* Card Header */}
              <div className="text-center mb-5 sm:mb-6">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-[#567a65] dark:text-[#A9B9AE]">
                  WELCOME TO
                </span>
                <div className="flex items-center justify-center gap-1 font-serif-heading font-bold text-3xl sm:text-[32px] text-[#143d26] dark:text-[#E8F1EB] mt-0.5">
                  <span className="text-[#134927] dark:text-[#6FAF8A]">Aayur</span>
                  <span className="text-[#c08238] dark:text-[#E4B45D]">aura</span>
                </div>
                <p className="text-xs sm:text-[13px] text-[#5a7a67] dark:text-[#A9B9AE] mt-1">
                  Sign in to continue your journey
                </p>
              </div>

              {/* Login Requirement Banner if redirected from protected route */}
              {redirectUrl && (
                <div className="mb-4 p-3 rounded-xl bg-[#FAF0E1] dark:bg-[#332512] border border-[#C58A32]/40 text-[#C58A32] dark:text-[#E4B45D] text-xs flex items-center gap-2.5 shadow-2xs">
                  <Info className="w-4 h-4 shrink-0 text-[#C58A32] dark:text-[#E4B45D]" />
                  <span className="font-semibold">
                    Please login or register to access this platform feature.
                  </span>
                </div>
              )}

              {/* Success Alert */}
              {successMsg && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Error Alert */}
              {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-xs flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />
                  <span>{error}</span>
                </div>
              )}

              {step === "OTP" ? (
                /* Step 2: 2FA OTP Form */
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="p-3.5 rounded-2xl bg-[#f0f7f2] dark:bg-[#1E2E25] border border-[#C5DEC9] dark:border-[#2B3A31] text-center">
                    <div className="w-10 h-10 rounded-full bg-white dark:bg-[#17221C] border border-[#205c3b]/30 flex items-center justify-center mx-auto mb-2 text-[#205c3b] dark:text-[#6FAF8A]">
                      <KeyRound className="w-5 h-5" />
                    </div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#134927] dark:text-[#6FAF8A]">
                      Two-Step Verification
                    </h3>
                    <p className="text-xs text-[#4b6957] dark:text-[#A9B9AE] mt-1">
                      Enter the 6-digit verification code sent to:
                    </p>
                    <p className="text-xs font-semibold text-[#1a3827] dark:text-[#E8F1EB] mt-0.5 font-mono">
                      {maskedEmail}
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="otp-input"
                      className="block text-xs font-semibold text-[#3b5947] dark:text-[#E8F1EB] mb-1.5 text-center"
                    >
                      Enter 6-Digit Code
                    </label>
                    <input
                      id="otp-input"
                      name="otp"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      autoFocus
                      required
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                      placeholder="••••••"
                      className="w-full h-[54px] text-center tracking-[0.5em] font-mono text-2xl font-bold rounded-xl bg-white dark:bg-[#1A2620] border-2 border-[#205c3b] dark:border-[#6FAF8A] text-[#1B2A22] dark:text-[#E8F1EB] focus:outline-none focus:ring-4 focus:ring-[#205c3b]/20 dark:focus:ring-[#6FAF8A]/25 transition-all shadow-sm"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otpCode.trim().length !== 6}
                    className="w-full h-[50px] rounded-xl bg-[#1b442c] hover:bg-[#143623] dark:bg-[#6FAF8A] dark:hover:bg-[#8BC4A2] text-white dark:text-[#0F1713] font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer disabled:opacity-50 mt-1"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>{loading ? "Verifying..." : "Verify & Sign In"}</span>
                  </button>

                  <div className="flex items-center justify-between text-xs pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setStep("CREDENTIALS");
                        setOtpCode("");
                        setError("");
                        setSuccessMsg("");
                      }}
                      className="text-[#4e6e5b] dark:text-[#A9B9AE] hover:text-[#205c3b] dark:hover:text-[#6FAF8A] font-medium cursor-pointer"
                    >
                      ← Back to Login
                    </button>

                    <button
                      type="button"
                      disabled={resendCooldown > 0 || loading}
                      onClick={handleResendOtp}
                      className="text-[#205c3b] dark:text-[#6FAF8A] font-semibold hover:underline cursor-pointer disabled:opacity-50 flex items-center gap-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>
                        {resendCooldown > 0
                          ? `Resend in ${resendCooldown}s`
                          : "Resend Code"}
                      </span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  {/* Step 1: Standard Credentials Form */}
                  {/* Official Google Sign-In Integration */}
                  <div>
                    <GoogleSignInButton
                      mode="signin"
                      role={role}
                      onSuccess={handleFinalizeLogin}
                      onOtpRequired={({ challenge_token, masked_email, message }) => {
                        setChallengeToken(challenge_token);
                        setMaskedEmail(masked_email);
                        setStep("OTP");
                        setSuccessMsg(message || "A 6-digit verification code has been sent to your Gmail.");
                        setResendCooldown(30);
                      }}
                      onError={(err) => setError(err)}
                      disabled={loading}
                    />
                  </div>

                  {/* Clean Divider */}
                  <div className="relative flex items-center justify-center my-3">
                    <div className="border-t border-[#D5DED8] dark:border-[#2e4738] w-full" />
                    <span className="bg-white dark:bg-[#17221C] px-3 text-[11px] text-[#6E7E73] dark:text-[#8FA596] uppercase font-semibold tracking-wider whitespace-nowrap">
                      or sign in with password
                    </span>
                    <div className="border-t border-[#D5DED8] dark:border-[#2e4738] w-full" />
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Role Selector Grid */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-semibold text-[#3b5947] dark:text-[#E8F1EB]">
                          Login as
                        </label>
                        <button
                          type="button"
                          onClick={() => handleRoleSelect(role)}
                          className="text-[11px] font-semibold text-[#205c3b] dark:text-[#6FAF8A] hover:underline cursor-pointer flex items-center gap-1"
                        >
                          ⚡ Auto-fill {role} Demo
                        </button>
                      </div>
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                        {roleOptions.map((opt) => {
                          const Icon = opt.icon;
                          const isSelected = role === opt.id;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => handleRoleSelect(opt.id)}
                              className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs font-semibold transition-all duration-200 cursor-pointer ${
                                isSelected
                                  ? "border-2 border-[#205c3b] bg-[#eef7f0] text-[#1b432a] dark:border-[#6FAF8A] dark:bg-[#26372D] dark:text-[#E8F1EB] shadow-xs"
                                  : "border-[#cadacb] dark:border-[#2B3A31] bg-white dark:bg-[#17221C] text-[#567362] dark:text-[#A9B9AE] hover:border-[#205c3b]/50 hover:bg-[#f9fbf9] dark:hover:bg-[#26372D]/30"
                              }`}
                            >
                              <Icon
                                className={`w-4 h-4 mb-1 ${
                                  isSelected
                                    ? "text-[#205c3b] dark:text-[#6FAF8A]"
                                    : "text-[#62816f] dark:text-[#A9B9AE]"
                                }`}
                              />
                              <span className="text-[10px] leading-none">{opt.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Email Field - Gmail Restricted */}
                    <div>
                      <label
                        htmlFor="login-email"
                        className="block text-xs font-semibold text-[#3b5947] dark:text-[#E8F1EB] mb-1"
                      >
                        Gmail Address
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-[#205c3b] dark:text-[#6FAF8A] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          id="login-email"
                          name="email"
                          type="email"
                          required
                          autoComplete="username"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="yourname@gmail.com"
                          className="w-full h-[50px] pl-10 pr-4 rounded-xl bg-white dark:bg-[#1A2620] border border-[#C9D8CE] dark:border-[#2B3A31] text-sm text-[#1B2A22] dark:text-[#E8F1EB] font-medium placeholder-[#64736A] dark:placeholder-[#A9B9AE] focus:outline-none focus:border-[#205c3b] dark:focus:border-[#6FAF8A] focus:ring-2 focus:ring-[#205c3b]/15 dark:focus:ring-[#6FAF8A]/25 hover:border-[#205c3b]/60 transition-all shadow-2xs"
                        />
                      </div>
                      <p className="text-[11px] text-[#567a65] dark:text-[#A9B9AE] mt-1">
                        Must be a valid verified <span className="font-semibold text-[#205c3b] dark:text-[#6FAF8A]">@gmail.com</span> address
                      </p>
                    </div>

                  {/* Password Field */}
                  <div>
                    <label
                      htmlFor="login-password"
                      className="block text-xs font-semibold text-[#3b5947] dark:text-[#E8F1EB] mb-1"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-[#205c3b] dark:text-[#6FAF8A] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        id="login-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        required
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="w-full h-[50px] pl-10 pr-11 rounded-xl bg-white dark:bg-[#1A2620] border border-[#C9D8CE] dark:border-[#2B3A31] text-sm text-[#1B2A22] dark:text-[#E8F1EB] font-medium placeholder-[#64736A] dark:placeholder-[#A9B9AE] focus:outline-none focus:border-[#205c3b] dark:focus:border-[#6FAF8A] focus:ring-2 focus:ring-[#205c3b]/15 dark:focus:ring-[#6FAF8A]/25 hover:border-[#205c3b]/60 transition-all shadow-2xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-[#64736A] dark:text-[#A9B9AE] hover:text-[#205c3b] dark:hover:text-[#6FAF8A] transition-colors cursor-pointer"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me & Forgot Password */}
                  <div className="flex items-center justify-between text-xs pt-0.5">
                    <label className="flex items-center gap-2 text-[#4e6e5b] dark:text-[#A9B9AE] cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded border-[#cadacb] text-[#205c3b] focus:ring-[#205c3b] accent-[#205c3b]"
                      />
                      <span className="font-medium">Remember me</span>
                    </label>
                    <Link
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        alert("Please contact your institute administrator or support to reset your credentials.");
                      }}
                      className="text-[#205c3b] dark:text-[#6FAF8A] hover:text-[#154229] font-medium hover:underline"
                    >
                      Forgot Password?
                    </Link>
                  </div>

                  {/* Primary Login Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-[50px] rounded-xl bg-[#1b442c] hover:bg-[#143623] dark:bg-[#6FAF8A] dark:hover:bg-[#8BC4A2] text-white dark:text-[#0F1713] font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer disabled:opacity-60 mt-1"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>{loading ? "Signing in..." : "Login"}</span>
                  </button>
                </form>
              </div>
            )}

              {/* Divider & Link to Register */}
              <div className="mt-4 pt-3 border-t border-[#e2ece2] dark:border-[#2B3A31] text-center text-xs text-[#527260] dark:text-[#A9B9AE]">
                <div className="flex items-center justify-center gap-1.5">
                  <span>Don't have an account?</span>
                  <Link
                    href={redirectUrl ? `/register?redirect=${encodeURIComponent(redirectUrl)}` : "/register"}
                    className="text-[#205c3b] dark:text-[#6FAF8A] font-bold hover:text-[#123e25] hover:underline inline-flex items-center gap-1"
                  >
                    <span>Create New Account</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Footer Bar */}
      <footer className="relative z-20 px-6 sm:px-10 lg:px-14 py-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#4d705c] dark:text-[#A9B9AE] shrink-0">
        {/* Trust Badges */}
        <div className="flex items-center gap-3.5 font-medium">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 dark:text-[#6FAF8A]" />
            <span>Secure</span>
          </span>
          <span className="text-[#a4c2b0] dark:text-[#2B3A31]">|</span>
          <span className="inline-flex items-center gap-1.5">
            <span>🌿</span>
            <span>Trusted</span>
          </span>
          <span className="text-[#a4c2b0] dark:text-[#2B3A31]">|</span>
          <span className="inline-flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-emerald-700 dark:text-[#6FAF8A]" />
            <span>For a Healthy Future</span>
          </span>
        </div>

        {/* Copyright */}
        <div className="text-[#5b7a67] dark:text-[#A9B9AE]">
          © 2026 Aayuraura. All rights reserved.
        </div>

        {/* Cursive Signature Badge */}
        <div className="italic font-serif text-sm text-[#2c5b40] dark:text-[#6FAF8A] flex items-center gap-1">
          <span>Ayush for All</span>
          <span className="text-xs">🍃</span>
        </div>
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#f4f7f1] dark:bg-[#0F1713]">
          <div className="animate-pulse text-xs font-semibold text-[#426b52] dark:text-[#6FAF8A]">Loading...</div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
