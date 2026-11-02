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
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Heart,
  Sprout,
  Users,
  AlertCircle,
  Phone,
  MapPin,
  Award,
  BookOpen,
  Sparkles,
  CheckCircle2,
  KeyRound,
  RotateCw
} from "lucide-react";
import { api } from "@/lib/api";
import { clearAuthSession, setCachedSessionUser } from "@/lib/authSession";
import { getDashboardRouteForRole, UserRole } from "@/config/navigation";
import { getRolePrefixOptions, getDefaultPrefixForRole, formatFullName } from "@/lib/nameFormatter";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import { validateGmail } from "@/app/(auth)/login/page";

const AYURVEDA_QUALIFICATIONS = [
  "BAMS (Bachelor of Ayurvedic Medicine & Surgery)",
  "MD Ayurveda (Kayachikitsa)",
  "MD Ayurveda (Panchakarma)",
  "MD Ayurveda (Dravyaguna)",
  "MD Ayurveda (Rasa Shastra & Bhaishajya Kalpana)",
  "MS Ayurveda (Shalya Tantra)",
  "MS Ayurveda (Shalakya Tantra)",
  "MS Ayurveda (Prasuti Tantra & Stri Roga)",
  "MD Ayurveda (Kaumarbhritya)",
  "MD Ayurveda (Swasthavritta)",
  "MD Ayurveda (Roganidana)",
  "MD Ayurveda (Samhita & Siddhanta)",
  "PhD in Ayurvedic Medicine",
  "Other Ayurvedic Degree"
];

const AYURVEDA_SPECIALIZATIONS = [
  "Panchakarma & Detoxification",
  "Kayachikitsa (General Medicine)",
  "Dravyaguna (Herbal Pharmacology)",
  "Shalya Tantra (Surgical Protocols)",
  "Shalakya Tantra (ENT & Ophthalmology)",
  "Prasuti & Stri Roga (Gynaecology)",
  "Kaumarbhritya (Pediatrics)",
  "Rasa Shastra (Formulations)",
  "Swasthavritta & Yoga (Preventive)",
  "Ayurvedic Chronic Disease Management",
  "Clinical Research & Standardization",
  "Holistic Wellness & Lifestyle"
];

function RegisterForm() {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect");
  const inviteToken = searchParams.get("invite");

  type RegisterRole = "STUDENT" | "DOCTOR" | "FACULTY" | "INDUSTRY" | "INSTITUTION" | "NGO";
  type RegisterStep = "FORM" | "OTP";

  const [step, setStep] = useState<RegisterStep>("FORM");
  const [role, setRole] = useState<RegisterRole>("STUDENT");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [inviteDetails, setInviteDetails] = useState<any>(null);

  // 2FA OTP Challenge states
  const [challengeToken, setChallengeToken] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [successMsg, setSuccessMsg] = useState("");

  // Role-based structured name states
  const [prefix, setPrefix] = useState<string>(() => getDefaultPrefixForRole("STUDENT"));
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");

  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  
  // Organization / Student fields
  const [org, setOrg] = useState("");
  const [regNum, setRegNum] = useState("");

  // Doctor-specific fields
  const [qualification, setQualification] = useState("BAMS (Bachelor of Ayurvedic Medicine & Surgery)");
  const [specialization, setSpecialization] = useState("Panchakarma & Detoxification");
  const [council, setCouncil] = useState("State Council of Indian Medicine");
  const [designation, setDesignation] = useState("Ayurvedic Physician");
  const [experience, setExperience] = useState(2);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  useEffect(() => {
    if (inviteToken) {
      api.get(`/auth/invitation/${inviteToken}`)
        .then((res) => {
          if (res.data && res.data.valid) {
            setInviteDetails(res.data);
            setEmail(res.data.email);
            setRole(res.data.role as any);
            if (res.data.role === "FACULTY") {
              setPrefix("Prof.");
              setOrg(res.data.institution_name);
              setDesignation(res.data.designation || "Associate Professor");
            }
          }
        })
        .catch((err) => {
          console.error("Invalid invitation token:", err);
        });
    }
  }, [inviteToken]);

  // Switch role and update default prefix accordingly
  const handleRoleChange = (newRole: RegisterRole) => {
    setRole(newRole);
    setPrefix(getDefaultPrefixForRole(newRole));
  };

  const formattedDisplayName = formatFullName({
    prefix,
    firstName,
    middleName,
    lastName,
  });

  const handleFinalizeLogin = (authData: any) => {
    const token = authData?.access_token;
    if (!token || typeof token !== "string" || token === "undefined" || token === "null") {
      setError("Account created, but authentication token was not received. Please sign in with your password.");
      return;
    }

    clearAuthSession();

    const finalRole = (authData.role || role || "STUDENT").toString().trim().toUpperCase() as UserRole;
    const userEmail = authData.email || email;

    localStorage.setItem("aayuraura_token", token);
    localStorage.setItem("ayursetu_token", token);
    localStorage.setItem("token", token);
    localStorage.setItem("aayuraura_role", finalRole);
    localStorage.setItem("ayursetu_role", finalRole);
    localStorage.setItem("role", finalRole);
    localStorage.setItem("aayuraura_email", userEmail);
    localStorage.setItem("ayursetu_email", userEmail);
    localStorage.setItem("email", userEmail);
    localStorage.setItem(
      "aayuraura_user",
      JSON.stringify({ id: authData.user_id, email: userEmail, role: finalRole })
    );
    localStorage.setItem(
      "ayursetu_user",
      JSON.stringify({ id: authData.user_id, email: userEmail, role: finalRole })
    );

    setCachedSessionUser({
      id: String(authData.user_id || "user-id"),
      email: userEmail,
      role: finalRole,
      is_active: true,
      is_verified: true,
    });

    window.dispatchEvent(new Event("ayursetu_auth_change"));

    const roleDashboardRoute = getDashboardRouteForRole(finalRole);

    if (
      redirectUrl &&
      redirectUrl.startsWith("/") &&
      !redirectUrl.startsWith("/login") &&
      !redirectUrl.startsWith("/register")
    ) {
      if (redirectUrl.startsWith("/admin") && finalRole !== "ADMIN") {
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

  const handleGoogleSuccess = (authData: any) => {
    handleFinalizeLogin(authData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    const cleanEmail = email.trim().toLowerCase();
    const emailErr = validateGmail(cleanEmail);
    if (emailErr) {
      setError(emailErr);
      return;
    }

    const cleanPhone = phone.trim();
    if (!cleanPhone || !/^\d{10}$/.test(cleanPhone)) {
      setError("Phone number must contain exactly 10 numeric digits.");
      return;
    }

    if (!password || password.trim().length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);

    try {
      const resolvedFullName = formattedDisplayName || `${firstName} ${lastName}`.trim();

      if (inviteToken && inviteDetails) {
        // Accept secure institutional invitation
        const loginRes = await api.post("/auth/accept-invitation", {
          invitation_token: inviteToken,
          password,
          full_name: resolvedFullName,
          name_prefix: prefix,
          first_name: firstName,
          last_name: lastName,
          phone: cleanPhone,
          qualifications: qualification,
          specialization: specialization
        });
        handleFinalizeLogin(loginRes.data);
      } else {
        await api.post("/auth/register", {
          email: cleanEmail,
          password,
          role,
          name_prefix: prefix || undefined,
          first_name: firstName,
          middle_name: middleName || undefined,
          last_name: lastName,
          full_name: resolvedFullName,
          organization_or_institution: org,
          code_or_reg_number: regNum,
          phone: cleanPhone,
          qualification: role === "DOCTOR" || role === "FACULTY" ? qualification : undefined,
          specialization: role === "DOCTOR" || role === "FACULTY" ? specialization : undefined,
          state_medical_council: role === "DOCTOR" ? council : undefined,
          designation: role === "DOCTOR" || role === "FACULTY" ? designation : undefined,
          years_of_experience: role === "DOCTOR" ? Number(experience) : undefined,
          city: city || "New Delhi",
          state: state || "Delhi"
        });

        // Auto login after registration
        const formData = new FormData();
        formData.append("username", cleanEmail);
        formData.append("password", password);

        const loginRes = await api.post("/auth/login", formData, {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });

        if (loginRes.data?.otp_required && loginRes.data?.challenge_token) {
          setChallengeToken(loginRes.data.challenge_token);
          setMaskedEmail(loginRes.data.masked_email || cleanEmail);
          setStep("OTP");
          setSuccessMsg(loginRes.data.message || "Account registered successfully! Enter the 6-digit verification code sent to your email.");
          setResendCooldown(30);
          return;
        }

        handleFinalizeLogin(loginRes.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || "Registration failed. Please check your details.");
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
      setSuccessMsg(res.data?.message || "A new 6-digit verification code has been sent to your email.");
      setResendCooldown(30);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to resend code. Please try again.");
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
      label: "Institution",
      icon: Building2,
    },
    {
      id: "NGO" as const,
      label: "NGO",
      icon: Heart,
    },
  ];

  return (
    <div className="min-h-screen relative flex flex-col justify-between overflow-x-hidden bg-[#f4f7f1] text-[#1a3827] selection:bg-[#205c3b] selection:text-white py-6">
      {/* Background image & artwork */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none">
        <img
          src="/auth-bg.jpg"
          alt="AyurSetu Classical Background"
          className="w-full h-full object-cover object-bottom"
        />
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header */}
        <div className="flex items-center justify-between mb-4">
          <Link href="/" className="flex items-center gap-2 group">
            <img
              src="/logo-emblem.png"
              alt="Aayuraura Official Emblem"
              className="w-9 h-9 sm:w-10 sm:h-10 object-contain drop-shadow-xs"
            />
            <div className="flex items-baseline tracking-tight font-serif-heading font-bold text-2xl">
              <span className="text-[#134927]">Aayur</span>
              <span className="text-[#c08238]">aura</span>
            </div>
          </Link>
          <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-[#3b5947]">
            <span>Already registered?</span>
            <Link
              href="/login"
              className="font-bold text-[#1b5233] hover:text-[#0f341e] underline underline-offset-4"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Branding / Highlights */}
          <div className="lg:col-span-5 flex flex-col justify-center space-y-4 pt-2 lg:pt-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#e3efe5] border border-[#b8dabf] text-xs font-semibold text-[#1a4e2f] w-fit shadow-2xs">
              <Sprout className="w-3.5 h-3.5 text-[#205c3b]" />
              <span>National Ayush Skill & Career Ecosystem</span>
            </div>

            <div className="space-y-2">
              <h1 className="font-serif-heading text-3xl sm:text-4xl lg:text-5xl font-bold leading-[1.12] text-[#0f341e] tracking-tight">
                Empowering <span className="text-[#1a5b35]">Ayurvedic</span> Healthcare
              </h1>
              <p className="text-xs sm:text-sm text-[#416850] leading-relaxed max-w-[440px]">
                Connect students, certified doctors, clinical panchakarma centers, research labs, and academic institutions on India's verified Ayush platform.
              </p>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-3 gap-2.5 pt-2">
              <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-white/70 backdrop-blur-xs border border-white shadow-xs">
                <div className="w-9 h-9 rounded-full bg-[#eef7f0] border border-[#b4d4be] flex items-center justify-center text-[#134928] mb-1.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span className="font-bold text-xs text-[#0f341e]">Verified</span>
                <span className="text-[10px] text-[#345943] leading-tight mt-0.5">
                  NCISM compliant trust
                </span>
              </div>

              <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-white/70 backdrop-blur-xs border border-white shadow-xs">
                <div className="w-9 h-9 rounded-full bg-[#eef7f0] border border-[#b4d4be] flex items-center justify-center text-[#134928] mb-1.5">
                  <Users className="w-4 h-4" />
                </div>
                <span className="font-bold text-xs text-[#0f341e]">Mentorship</span>
                <span className="text-[10px] text-[#345943] leading-tight mt-0.5">
                  Doctor-student network
                </span>
              </div>

              <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-white/70 backdrop-blur-xs border border-white shadow-xs">
                <div className="w-9 h-9 rounded-full bg-[#eef7f0] border border-[#b4d4be] flex items-center justify-center text-[#134928] mb-1.5">
                  <Heart className="w-4 h-4" />
                </div>
                <span className="font-bold text-xs text-[#0f341e]">Healthcare</span>
                <span className="text-[10px] text-[#345943] leading-tight mt-0.5">
                  Camps & internships
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Dynamic Register Form */}
          <div className="lg:col-span-7 flex justify-center lg:justify-end">
            <div className="w-full max-w-[560px] bg-white rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(20,55,35,0.12)] border border-[#d8e6d9] transition-all">
              
              <div className="text-center mb-4">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-[#567a65]">
                  CREATE YOUR ACCOUNT
                </span>
                <div className="flex items-center justify-center gap-1 font-serif-heading font-bold text-2xl sm:text-3xl text-[#143d26] mt-0.5">
                  <span className="text-[#134927]">Aayur</span>
                  <span className="text-[#c08238]">aura</span>
                </div>
                <p className="text-xs text-[#5a7a67] mt-0.5">
                  {role === "DOCTOR"
                    ? "Register as an Ayurvedic Doctor & Mentor"
                    : "Join our nationwide Ayush intelligence platform"}
                </p>
              </div>

              {successMsg && (
                <div className="mb-3.5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{successMsg}</span>
                </div>
              )}

              {error && (
                <div className="mb-3.5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{error}</span>
                </div>
              )}

              {step === "OTP" ? (
                /* 2FA OTP Verification Step */
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="p-3.5 rounded-2xl bg-[#f0f7f2] border border-[#C5DEC9] text-center">
                    <div className="w-10 h-10 rounded-full bg-white border border-[#205c3b]/30 flex items-center justify-center mx-auto mb-2 text-[#205c3b]">
                      <KeyRound className="w-5 h-5" />
                    </div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#134927]">
                      Two-Step Verification
                    </h3>
                    <p className="text-xs text-[#4b6957] mt-1">
                      Enter the 6-digit verification code sent to:
                    </p>
                    <p className="text-xs font-semibold text-[#1a3827] mt-0.5 font-mono">
                      {maskedEmail}
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="otp-input-reg"
                      className="block text-xs font-semibold text-[#3b5947] mb-1.5 text-center"
                    >
                      Enter 6-Digit Code
                    </label>
                    <input
                      id="otp-input-reg"
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
                      className="w-full h-[52px] text-center tracking-[0.5em] font-mono text-2xl font-bold rounded-xl bg-white border-2 border-[#205c3b] text-[#1B2A22] focus:outline-none focus:ring-4 focus:ring-[#205c3b]/20 transition-all shadow-xs"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otpCode.trim().length !== 6}
                    className="w-full h-[48px] rounded-xl bg-[#1b442c] hover:bg-[#143623] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer disabled:opacity-50 mt-1"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>{loading ? "Verifying..." : "Verify & Sign In"}</span>
                  </button>

                  <div className="flex items-center justify-between text-xs pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setStep("FORM");
                        setError("");
                      }}
                      className="text-[#567a65] hover:text-[#134927] font-semibold cursor-pointer"
                    >
                      ← Back to Form
                    </button>

                    <button
                      type="button"
                      disabled={resendCooldown > 0 || loading}
                      onClick={handleResendOtp}
                      className="text-[#1b442c] hover:text-[#134927] font-bold disabled:text-[#8aa393] disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                      <span>
                        {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
                      </span>
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  {!inviteDetails && (
                    <div className="mb-4 space-y-3">
                      <GoogleSignInButton
                        mode="signup"
                        role={role}
                        onSuccess={handleGoogleSuccess}
                        onError={(err) => setError(err)}
                      />

                      <div className="relative flex items-center justify-center my-2">
                        <div className="border-t border-[#d8e6d9] w-full" />
                        <span className="bg-white px-3 text-[11px] font-semibold text-[#668874] uppercase tracking-wider shrink-0">
                          Or Register With Gmail
                        </span>
                        <div className="border-t border-[#d8e6d9] w-full" />
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-3">
                {/* Institutional Invitation Alert */}
                {inviteDetails && (
                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs mb-2 space-y-1">
                    <div className="flex items-center gap-2 font-bold text-emerald-950">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      Institutional Invitation Verified
                    </div>
                    <p className="text-[11px] text-emerald-800">
                      You are invited by <strong>{inviteDetails.institution_name}</strong> as{" "}
                      <strong>{inviteDetails.role}</strong>
                      {inviteDetails.department_name ? ` in ${inviteDetails.department_name}` : ""}.
                    </p>
                  </div>
                )}

                {/* Role Selector */}
                <div>
                  <label className="block text-xs font-semibold text-[#3b5947] mb-1">
                    {inviteDetails ? "Assigned Institutional Role" : "Select Your Role"}
                  </label>
                  {inviteDetails ? (
                    <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center justify-between">
                      <span>{role} Member</span>
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        Locked by Invite
                      </span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-5 gap-2">
                      {roleOptions.map((opt) => {
                        const Icon = opt.icon;
                        const isSelected = role === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => handleRoleChange(opt.id)}
                            className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs font-semibold transition-all duration-200 cursor-pointer ${
                              isSelected
                                ? "border-[1.5px] border-[#205c3b] bg-[#eef7f0] text-[#1b432a] shadow-xs"
                                : "border-[#dce6dc] bg-white text-[#567362] hover:border-[#b4ceba] hover:bg-[#f9fbf9]"
                            }`}
                          >
                            <Icon
                              className={`w-4 h-4 mb-1 ${
                                isSelected ? "text-[#205c3b]" : "text-[#62816f]"
                              }`}
                            />
                            <span className="text-[11px] leading-none">{opt.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Role-Based Structured Name Entry */}
                <div className="p-3.5 rounded-2xl bg-[#fafcfa] border border-[#d6e4d7] space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#143e26] flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-[#205c3b]" />
                      <span>Legal & Professional Name</span>
                    </label>
                    <span className="text-[10px] uppercase font-semibold tracking-wider text-[#577965] px-2 py-0.5 rounded-full bg-[#e8f2e9]">
                      {role} Profile
                    </span>
                  </div>

                  {/* Prefix + First Name */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                    <div className="sm:col-span-4">
                      <label className="block text-[11px] font-semibold text-[#3b5947] mb-1">
                        Title / Prefix *
                      </label>
                      <select
                        value={prefix}
                        onChange={(e) => setPrefix(e.target.value)}
                        className="w-full px-2.5 py-2 rounded-xl bg-white border border-[#cadacb] text-xs font-semibold text-[#163826] focus:outline-none focus:border-[#205c3b] transition-all"
                      >
                        {getRolePrefixOptions(role).map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-8">
                      <label className="block text-[11px] font-semibold text-[#3b5947] mb-1">
                        First Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="e.g. Rajesh or Priya"
                        className="w-full px-3 py-2 rounded-xl bg-white border border-[#cadacb] text-xs text-[#163826] placeholder-[#8ca697] focus:outline-none focus:border-[#205c3b] transition-all"
                      />
                    </div>
                  </div>

                  {/* Middle Name + Last Name */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#3b5947] mb-1">
                        Middle Name <span className="text-[10px] text-[#718f7d] font-normal">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        value={middleName}
                        onChange={(e) => setMiddleName(e.target.value)}
                        placeholder="e.g. Kumar or Chandra"
                        className="w-full px-3 py-2 rounded-xl bg-white border border-[#cadacb] text-xs text-[#163826] placeholder-[#8ca697] focus:outline-none focus:border-[#205c3b] transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#3b5947] mb-1">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="e.g. Varma or Sharma"
                        className="w-full px-3 py-2 rounded-xl bg-white border border-[#cadacb] text-xs text-[#163826] placeholder-[#8ca697] focus:outline-none focus:border-[#205c3b] transition-all"
                      />
                    </div>
                  </div>

                  {/* Live Formatted Name Display Preview */}
                  <div className="pt-2 border-t border-[#e2ede3] flex items-center justify-between text-xs">
                    <span className="text-[11px] text-[#557563] font-medium">Display Name Preview:</span>
                    <span className="font-bold text-[#143e26] bg-[#eef7f0] border border-[#bad6c1] px-2.5 py-1 rounded-lg">
                      {formattedDisplayName || <span className="text-slate-400 font-normal italic">Enter names above</span>}
                    </span>
                  </div>
                </div>

                {/* Mobile / Phone Number */}
                <div>
                  <div className="flex items-center justify-between mb-0.5">
                    <label className="block text-xs font-semibold text-[#3b5947]">
                      Mobile / Phone Number *
                    </label>
                    <span className={`text-[10px] font-semibold ${phone.length === 10 ? "text-emerald-700" : "text-[#5a7c66]"}`}>
                      {phone.length}/10 digits
                    </span>
                  </div>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-[#759381] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]{10}"
                      maxLength={10}
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      placeholder="10-digit mobile number"
                      className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-[#cadacb] text-xs sm:text-sm text-[#163826] placeholder-[#8ca697] focus:outline-none focus:border-[#205c3b] transition-all font-mono tracking-wider"
                    />
                  </div>
                  <p className="mt-1 text-[10px] text-[#557563]">
                    Enter exactly 10 numeric digits without country code (+91), spaces, or symbols.
                  </p>
                </div>

                {/* Email Address */}
                <div>
                  <div className="flex items-center justify-between mb-0.5">
                    <label className="block text-xs font-semibold text-[#3b5947]">
                      Gmail Address *
                    </label>
                    <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      @gmail.com only
                    </span>
                  </div>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#759381] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="yourname@gmail.com"
                      className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-[#cadacb] text-xs sm:text-sm text-[#163826] placeholder-[#8ca697] focus:outline-none focus:border-[#205c3b] transition-all"
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-[#557563]">
                    Only personal or verified @gmail.com accounts are accepted for registration.
                  </p>
                </div>

                {/* DOCTOR SPECIALIZED FIELDS */}
                {role === "DOCTOR" && (
                  <div className="space-y-3 pt-1 border-t border-[#e2ece3]">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#143e26]">
                      <Award className="w-3.5 h-3.5 text-amber-600" />
                      <span>Ayurveda Professional Credentials</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#3b5947] mb-0.5">
                          Medical Registration Number *
                        </label>
                        <input
                          type="text"
                          required
                          value={regNum}
                          onChange={(e) => setRegNum(e.target.value)}
                          placeholder="e.g. NCISM-AYUR-123456"
                          className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#cadacb] text-xs text-[#163826] placeholder-[#8ca697] focus:outline-none focus:border-[#205c3b]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[#3b5947] mb-0.5">
                          State Medical Council / Board *
                        </label>
                        <input
                          type="text"
                          required
                          value={council}
                          onChange={(e) => setCouncil(e.target.value)}
                          placeholder="e.g. Maharashtra Council of Indian Medicine"
                          className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#cadacb] text-xs text-[#163826] placeholder-[#8ca697] focus:outline-none focus:border-[#205c3b]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#3b5947] mb-0.5">
                          Degree / Qualification *
                        </label>
                        <select
                          value={qualification}
                          onChange={(e) => setQualification(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-[#cadacb] text-xs text-[#163826] focus:outline-none focus:border-[#205c3b]"
                        >
                          {AYURVEDA_QUALIFICATIONS.map((q) => (
                            <option key={q} value={q}>{q}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[#3b5947] mb-0.5">
                          Primary Specialization *
                        </label>
                        <select
                          value={specialization}
                          onChange={(e) => setSpecialization(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-[#cadacb] text-xs text-[#163826] focus:outline-none focus:border-[#205c3b]"
                        >
                          {AYURVEDA_SPECIALIZATIONS.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#3b5947] mb-0.5">
                          Current Designation
                        </label>
                        <input
                          type="text"
                          value={designation}
                          onChange={(e) => setDesignation(e.target.value)}
                          placeholder="Consultant / Senior Physician / Professor"
                          className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#cadacb] text-xs text-[#163826] placeholder-[#8ca697] focus:outline-none focus:border-[#205c3b]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[#3b5947] mb-0.5">
                          Years of Clinical Experience
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="60"
                          value={experience}
                          onChange={(e) => setExperience(Number(e.target.value))}
                          className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#cadacb] text-xs text-[#163826] focus:outline-none focus:border-[#205c3b]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Organization Details for Industry & Institution */}
                {(role === "INDUSTRY" || role === "INSTITUTION") && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-[#3b5947] mb-0.5">
                        {role === "INDUSTRY" ? "Company Name" : "Institution Name"}
                      </label>
                      <input
                        type="text"
                        required
                        value={org}
                        onChange={(e) => setOrg(e.target.value)}
                        placeholder="Organization name"
                        className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#cadacb] text-xs text-[#163826] placeholder-[#8ca697] focus:outline-none focus:border-[#205c3b]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#3b5947] mb-0.5">
                        {role === "INDUSTRY" ? "CIN / Reg Number" : "AISHE Code"}
                      </label>
                      <input
                        type="text"
                        value={regNum}
                        onChange={(e) => setRegNum(e.target.value)}
                        placeholder="Registration code"
                        className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#cadacb] text-xs text-[#163826] placeholder-[#8ca697] focus:outline-none focus:border-[#205c3b]"
                      />
                    </div>
                  </div>
                )}

                {/* Location: City & State */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-[#3b5947] mb-0.5">
                      City
                    </label>
                    <div className="relative">
                      <MapPin className="w-3.5 h-3.5 text-[#759381] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="e.g. Pune / New Delhi"
                        className="w-full pl-8 pr-3 py-2 rounded-xl bg-white border border-[#cadacb] text-xs text-[#163826] placeholder-[#8ca697] focus:outline-none focus:border-[#205c3b]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#3b5947] mb-0.5">
                      State
                    </label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="e.g. Maharashtra"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#cadacb] text-xs text-[#163826] placeholder-[#8ca697] focus:outline-none focus:border-[#205c3b]"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <div className="flex items-center justify-between mb-0.5">
                    <label className="block text-xs font-semibold text-[#3b5947]">
                      Create Password *
                    </label>
                    <span className={`text-[10px] font-semibold ${password.length >= 8 ? "text-emerald-700" : "text-[#557563]"}`}>
                      {password.length > 0 ? `${password.length} chars (min 8)` : "Min. 8 characters"}
                    </span>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#759381] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      className="w-full pl-10 pr-10 py-2 rounded-xl bg-white border border-[#cadacb] text-xs sm:text-sm text-[#163826] placeholder-[#8ca697] focus:outline-none focus:border-[#205c3b] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#759381] hover:text-[#205c3b] cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-2.5 rounded-xl font-serif-heading font-semibold text-sm text-white bg-gradient-to-r from-[#174e2f] to-[#256c44] hover:from-[#113f25] hover:to-[#1e5837] shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {loading ? (
                    <span>Registering Account...</span>
                  ) : (
                    <>
                      <span>Complete Registration</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </>
          )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f4f7f4] flex items-center justify-center text-xs font-semibold text-[#205c3b]">
          <div className="animate-pulse">Loading registration...</div>
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}

