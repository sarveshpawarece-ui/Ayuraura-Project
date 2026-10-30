"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { api } from "@/lib/api";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          renderButton: (
            element: HTMLElement,
            options: {
              type?: "standard" | "icon";
              theme?: "outline" | "filled_blue" | "filled_black";
              size?: "large" | "medium" | "small";
              text?: "signin_with" | "signup_with" | "continue_with" | "signin";
              shape?: "rectangular" | "pill" | "circle" | "square";
              width?: number | string;
            }
          ) => void;
          prompt: () => void;
        };
      };
    };
  }
}

interface GoogleSignInButtonProps {
  onSuccess: (authData: any) => void;
  onOtpRequired?: (challengeData: {
    challenge_token: string;
    masked_email: string;
    message?: string;
  }) => void;
  onError: (errorMsg: string) => void;
  role?: string;
  mode?: "signin" | "signup";
  disabled?: boolean;
}

export default function GoogleSignInButton({
  onSuccess,
  onOtpRequired,
  onError,
  role = "STUDENT",
  mode = "signin",
  disabled = false,
}: GoogleSignInButtonProps) {
  const [loading, setLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const googleBtnContainerRef = useRef<HTMLDivElement>(null);
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

  // Load Google Identity Services SDK script
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (window.google?.accounts?.id) {
      setScriptLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => setScriptLoaded(true);
    script.onerror = () => {
      console.warn("Google Identity Services script failed to load.");
    };
    document.body.appendChild(script);

    return () => {
      // Keep script for subsequent page visits
    };
  }, []);

  const handleCredentialResponse = async (response: { credential: string }) => {
    if (!response?.credential) {
      onError("Google did not provide a valid credential token. Please try again.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/google", {
        id_token: response.credential,
        role: role,
      });

      if (res.data?.otp_required && res.data?.challenge_token) {
        if (onOtpRequired) {
          onOtpRequired({
            challenge_token: res.data.challenge_token,
            masked_email: res.data.masked_email || "your registered Gmail",
            message: res.data.message,
          });
        } else {
          window.location.href = `/login?otp_challenge=${res.data.challenge_token}`;
        }
      } else {
        onSuccess(res.data);
      }
    } catch (err: any) {
      const detail =
        err.response?.data?.detail ||
        "Google authentication failed. Please ensure you are using a valid @gmail.com account.";
      onError(detail);
    } finally {
      setLoading(false);
    }
  };

  // Initialize GIS when script is ready and Client ID is configured
  useEffect(() => {
    if (!scriptLoaded || !clientId || !window.google?.accounts?.id) return;

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        cancel_on_tap_outside: true,
      });

      if (googleBtnContainerRef.current) {
        window.google.accounts.id.renderButton(googleBtnContainerRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: mode === "signup" ? "signup_with" : "continue_with",
          shape: "rectangular",
          width: "100%",
        });
      }
    } catch (e) {
      console.warn("Failed to initialize Google button:", e);
    }
  }, [scriptLoaded, clientId, mode]);

  const handleCustomButtonClick = async () => {
    if (disabled || loading) return;

    if (!clientId) {
      // Helpful modal or prompt for unconfigured Client ID in development
      onError(
        "Google OAuth Client ID is not configured. Please set NEXT_PUBLIC_GOOGLE_CLIENT_ID in .env.local to enable live Google Sign-In."
      );
      return;
    }

    if (window.google?.accounts?.id) {
      try {
        window.google.accounts.id.prompt();
      } catch (err) {
        console.warn("Google One Tap prompt failed:", err);
      }
    } else {
      onError("Google authentication service is still initializing. Please wait a moment.");
    }
  };

  return (
    <div className="w-full">
      {/* Hidden container for GIS rendered button when client ID is available */}
      {clientId && <div ref={googleBtnContainerRef} className="w-full hidden" />}

      {/* Styled accessible Google Sign-In button matching Aayuraura design */}
      <button
        type="button"
        onClick={handleCustomButtonClick}
        disabled={disabled || loading}
        className="w-full flex items-center justify-center gap-3 px-4 py-2.5 sm:py-3 bg-white dark:bg-[#1a2920] hover:bg-[#F9FAF9] dark:hover:bg-[#22362b] text-[#1E2922] dark:text-[#E8F0EA] border border-[#D5DED8] dark:border-[#2e4738] rounded-xl text-sm sm:text-base font-medium shadow-xs hover:shadow-sm transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#2F6B4F] focus:ring-offset-2 dark:focus:ring-offset-[#17211B]"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin text-[#2F6B4F] dark:text-[#78B895]" />
            <span>Connecting to Google...</span>
          </>
        ) : (
          <>
            {/* Official Google 'G' Logo SVG */}
            <svg
              className="w-5 h-5 shrink-0"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                fill="#EA4335"
              />
            </svg>
            <span>
              {mode === "signup" ? "Sign up with Google" : "Continue with Google"}
            </span>
          </>
        )}
      </button>

      {/* Helper notice regarding valid Gmail addresses */}
      <p className="mt-1.5 text-center text-[11px] text-[#6E7E73] dark:text-[#8FA596]">
        Restricted to verified <strong className="text-[#2F6B4F] dark:text-[#78B895]">@gmail.com</strong> accounts only
      </p>
    </div>
  );
}
