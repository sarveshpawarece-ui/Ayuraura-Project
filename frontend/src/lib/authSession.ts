import { api } from "./api";

export interface AuthSessionUser {
  id: string;
  email: string;
  role: string;
  is_active?: boolean;
  is_verified?: boolean;
}

interface CacheEntry {
  user: AuthSessionUser;
  timestamp: number;
}

const CACHE_TTL_MS = 45000; // 45 seconds TTL
let cachedSession: CacheEntry | null = null;
let inFlightPromise: Promise<AuthSessionUser | null> | null = null;

/**
 * Normalizes a role string to uppercase trimmed format.
 */
export function normalizeUserRole(role: string | null | undefined): string | null {
  if (!role) return null;
  const cleaned = role.trim().toUpperCase();
  const validRoles = ["STUDENT", "DOCTOR", "INSTITUTION", "INDUSTRY", "NGO", "ADMIN"];
  return validRoles.includes(cleaned) ? cleaned : null;
}

/**
 * Fetches the authenticated user session with deduplication and in-memory TTL caching.
 * NEVER forces non-admin roles to Admin.
 */
export async function getAuthSession(forceRefresh: boolean = false): Promise<AuthSessionUser | null> {
  if (typeof window === "undefined") return null;

  const rawToken =
    localStorage.getItem("aayuraura_token") ||
    localStorage.getItem("ayursetu_token") ||
    localStorage.getItem("token");
  if (!rawToken || rawToken === "undefined" || rawToken === "null" || !rawToken.trim()) {
    cachedSession = null;
    return null;
  }

  const storedRole = normalizeUserRole(
    localStorage.getItem("aayuraura_role") ||
    localStorage.getItem("ayursetu_role") ||
    localStorage.getItem("role")
  );
  const storedEmail =
    localStorage.getItem("aayuraura_email") ||
    localStorage.getItem("ayursetu_email") ||
    localStorage.getItem("email") || "";

  const now = Date.now();
  if (!forceRefresh && cachedSession && now - cachedSession.timestamp < CACHE_TTL_MS) {
    return cachedSession.user;
  }

  // Deduplicate concurrent in-flight requests
  if (inFlightPromise) {
    return inFlightPromise;
  }

  inFlightPromise = (async () => {
    try {
      const res = await api.get("/auth/me");
      if (res.data) {
        const resolvedRole = normalizeUserRole(res.data.role) || storedRole;
        if (!resolvedRole) {
          // If no valid role exists, return null
          return null;
        }

        const user: AuthSessionUser = {
          id: String(res.data.id || "user-id"),
          email: res.data.email || storedEmail,
          role: resolvedRole,
          is_active: res.data.is_active ?? true,
          is_verified: res.data.is_verified ?? true,
        };

        cachedSession = {
          user,
          timestamp: Date.now(),
        };

        // Synchronize all localStorage keys for instant cold bootstrap
        localStorage.setItem("aayuraura_role", user.role);
        localStorage.setItem("ayursetu_role", user.role);
        localStorage.setItem("role", user.role);
        if (user.email) {
          localStorage.setItem("aayuraura_email", user.email);
          localStorage.setItem("ayursetu_email", user.email);
          localStorage.setItem("email", user.email);
        }

        return user;
      }
      return null;
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number } };
      if (axiosErr.response?.status === 401 || axiosErr.response?.status === 403) {
        clearAuthSession();
        return null;
      }

      // If network error / backend offline but user has stored credentials:
      if (storedRole) {
        const offlineUser: AuthSessionUser = {
          id: "offline-session",
          email: storedEmail,
          role: storedRole,
          is_active: true,
          is_verified: true,
        };
        cachedSession = {
          user: offlineUser,
          timestamp: Date.now(),
        };
        return offlineUser;
      }

      cachedSession = null;
      return null;
    } finally {
      inFlightPromise = null;
    }
  })();

  return inFlightPromise;
}

/**
 * Manually updates the cached session in memory.
 */
export function setCachedSessionUser(user: AuthSessionUser) {
  cachedSession = {
    user,
    timestamp: Date.now(),
  };
}

/**
 * Clears the session cache and all local auth tokens and role data.
 */
export function clearAuthSession() {
  cachedSession = null;
  inFlightPromise = null;
  if (typeof window !== "undefined") {
    localStorage.removeItem("aayuraura_token");
    localStorage.removeItem("ayursetu_token");
    localStorage.removeItem("token");
    localStorage.removeItem("aayuraura_role");
    localStorage.removeItem("ayursetu_role");
    localStorage.removeItem("role");
    localStorage.removeItem("aayuraura_email");
    localStorage.removeItem("ayursetu_email");
    localStorage.removeItem("email");
    localStorage.removeItem("aayuraura_user");
    localStorage.removeItem("ayursetu_user");
  }
}
