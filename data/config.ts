/**
 * ADMIN_MODE — bypasses all progression gating for testing/admin use.
 * Enabled via Vercel env var NEXT_PUBLIC_ADMIN_MODE=true on your own account.
 * Never set in production for regular users.
 */
export const DEMO_MODE = process.env.NEXT_PUBLIC_ADMIN_MODE === "true";

export const DEV_MODE =
  DEMO_MODE ||
  process.env.NEXT_PUBLIC_DEV_MODE === "true" ||
  process.env.NODE_ENV === "development";
