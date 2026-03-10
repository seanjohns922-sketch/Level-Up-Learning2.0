/**
 * DEMO_MODE — set to `true` to bypass all progression gating
 * (lesson locks, week locks, level locks) for testing.
 * Set to `false` before pushing to production.
 */
export const DEMO_MODE = true;

export const DEV_MODE =
  DEMO_MODE ||
  process.env.NEXT_PUBLIC_DEV_MODE === "true" ||
  process.env.NODE_ENV === "development";
