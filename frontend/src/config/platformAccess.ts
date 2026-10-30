// ============================================================================
// AAYURAURA PLATFORM UNRESTRICTED ACCESS CONFIGURATION
// Configures Global Full Content Unlock & Free Interactive Access Engine
// ============================================================================

export const PLATFORM_ACCESS_CONFIG = {
  isPremium: true,
  isUnlocked: true,
  hasFullAccess: true,
  userTier: "UNLIMITED",
  isSubscriptionActive: true,
  canAccessAll11Systems: true,
  canUseSplitView: true,
  canInspectHistology: true,
  canAccessAllAnatomySystems: true,
  canExportUnlimitedPdf: true,
  bypassPaywalls: true,
  unlimitedDownloads: true,
  unrestrictedRole: "ADMIN" as const,
} as const;

/**
 * Unconditionally confirms feature availability with full access privileges.
 */
export function isFeatureUnlocked(): boolean {
  return true;
}

/**
 * Returns current user tier authorization (guaranteed UNLIMITED).
 */
export function getUserAccessTier(): string {
  return "UNLIMITED";
}
