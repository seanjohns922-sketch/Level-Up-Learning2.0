// Review Mode — a tab-scoped, READ-ONLY visit to a level the student has already
// passed. Revisiting an earlier level must NEVER change the student's working
// level, teacher dashboards, Continue Learning, adaptive placement, realm
// progression, unlocks, or award progression XP/legends. The current level stays
// the single source of truth.
//
// State lives in sessionStorage (per tab, cleared when the review session ends).
// The two progress-write chokepoints (writeProgress, writeProgramStore) no-op
// while this is active, so a reviewed session persists nothing.
const KEY = "lul:review_mode_v1";

export type ReviewState = { realmId: string; year: string };

export function enterReviewMode(realmId: string, year: string) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify({ realmId, year }));
  } catch {
    /* ignore */
  }
}

export function exitReviewMode() {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

export function getReviewState(): ReviewState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as ReviewState) : null;
  } catch {
    return null;
  }
}

export function isReviewMode(): boolean {
  return getReviewState() !== null;
}
