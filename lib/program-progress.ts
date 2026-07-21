/**
 * Shared program progress store – single source of truth for
 * lesson completions, quiz scores, and week gating.
 *
 * Both lesson/page.tsx and program/page.tsx MUST use these helpers
 * to read/write, so data stays in sync.
 */

import { ACTIVE_STUDENT_KEY } from "@/data/progress";
import { DEMO_PREVIEW_SCOPE, isDemoPreviewMode } from "@/lib/demo-mode";
import { isReviewMode } from "@/lib/review-mode";
import { requireCanonicalRealmId, type CanonicalRealmId } from "@/lib/realms/realm-registry";

export type WeekProgress = {
  lessonsCompleted: boolean[];   // [L1, L2, L3]
  quizCompleted: boolean;
  quizScore?: number;
};

export type ProgramProgressStore = Record<string, WeekProgress>;
export type ProgramRealmId = CanonicalRealmId;

// Realm-specific program length lives in a dependency-free module so scripts can
// import it too. Re-exported here so existing "@/lib/program-progress" imports work.
export {
  NUMBER_PROGRAM_WEEK_COUNT,
  MEASURELANDS_PROGRAM_WEEK_COUNT,
  STARPATH_PROGRAM_WEEK_COUNT,
  getProgramWeekCount,
  getProgramWeeks,
  getLastProgramWeek,
} from "./program-weeks";
import { getProgramWeeks } from "./program-weeks";

export const PROGRAM_STORE_KEY = "lul_program_progress_v1";

function getActiveStudentScope() {
  if (typeof window === "undefined") return "server";
  if (isDemoPreviewMode()) return DEMO_PREVIEW_SCOPE;
  const active = localStorage.getItem(ACTIVE_STUDENT_KEY);
  if (active && active.trim()) return active.trim();
  const isDemo = new URLSearchParams(window.location.search).get("demo") === "1";
  return isDemo ? "demo" : "anon";
}

export function getScopedProgramStoreKey(scope = getActiveStudentScope()) {
  return `lul:${scope}:program_progress_v1`;
}

export function normalizeRealmId(realmId: string | undefined): ProgramRealmId {
  return realmId == null || realmId.trim() === "" ? "number" : requireCanonicalRealmId(realmId);
}

export function makeProgramProgressKey(year: string, week: number | string, realmId: string = "number") {
  return `${normalizeRealmId(realmId)}|${year}|${week}`;
}

function legacyNumberKey(year: string, week: number | string) {
  return `${year}|${week}`;
}

export function readProgramStore(): ProgramProgressStore {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(getScopedProgramStoreKey());
    if (!raw) return {};
    return JSON.parse(raw) as ProgramProgressStore;
  } catch {
    return {};
  }
}

export function writeProgramStore(store: ProgramProgressStore) {
  if (typeof window === "undefined") return;
  // Reviewing a previous level is read-only — no lesson/quiz completions persist.
  if (isReviewMode()) return;
  localStorage.setItem(getScopedProgramStoreKey(), JSON.stringify(store));
}

export function clearScopedProgramStore(scope = getActiveStudentScope()) {
  if (typeof window === "undefined") return;
  localStorage.removeItem(getScopedProgramStoreKey(scope));
}

export function clearYearProgress(year: string, realmId: string = "number") {
  if (typeof window === "undefined") return {};
  const store = readProgramStore();
  const prefix = `${normalizeRealmId(realmId)}|${year}|`;
  const legacyPrefix = `${year}|`;
  const nextStore = Object.fromEntries(
    Object.entries(store).filter(([key]) => !key.startsWith(prefix) && !(normalizeRealmId(realmId) === "number" && key.startsWith(legacyPrefix)))
  ) as ProgramProgressStore;
  writeProgramStore(nextStore);
  return nextStore;
}

export function getWeekProgress(
  store: ProgramProgressStore,
  year: string,
  week: number | string,
  realmId: string = "number"
): WeekProgress {
  const key = makeProgramProgressKey(year, week, realmId);
  const legacy = normalizeRealmId(realmId) === "number" ? store[legacyNumberKey(year, week)] : undefined;
  return store[key] ?? legacy ?? { lessonsCompleted: [false, false, false], quizCompleted: false };
}

export function isWeekComplete(p: WeekProgress): boolean {
  return (p.quizScore ?? 0) >= 80;
}

export function normalizeWeekList(weeks: number[] | undefined | null, realmId?: string | null): number[] {
  if (!Array.isArray(weeks)) return [];
  const totalWeeks = getProgramWeeks(realmId).length;
  return [...new Set(weeks.map((week) => Number(week)).filter((week) => Number.isInteger(week) && week >= 1 && week <= totalWeeks))].sort(
    (a, b) => a - b
  );
}

export function getOptionalWeeks(
  requiredWeeks: number[] | undefined | null,
  realmId?: string | null,
): number[] {
  const required = new Set(normalizeWeekList(requiredWeeks, realmId));
  return getProgramWeeks(realmId).filter((week) => !required.has(week));
}

export function isFullRequiredPath(
  requiredWeeks: number[] | undefined | null,
  optionalWeeks: number[] | undefined | null,
  realmId?: string | null,
): boolean {
  const required = normalizeWeekList(requiredWeeks, realmId);
  const optional = normalizeWeekList(optionalWeeks, realmId);
  return required.length === getProgramWeeks(realmId).length && optional.length === 0;
}

export function getCompletedRequiredWeeks(
  store: ProgramProgressStore,
  year: string,
  requiredWeeks: number[] | undefined | null,
  realmId: string = "number"
): number[] {
  return normalizeWeekList(requiredWeeks, realmId).filter((week) => isWeekComplete(getWeekProgress(store, year, week, realmId)));
}

export function hasCompletedRequiredWeeks(
  store: ProgramProgressStore,
  year: string,
  requiredWeeks: number[] | undefined | null,
  realmId: string = "number"
): boolean {
  const normalized = normalizeWeekList(requiredWeeks, realmId);
  if (!normalized.length) return false;
  return normalized.every((week) => isWeekComplete(getWeekProgress(store, year, week, realmId)));
}

export function getFirstIncompleteRequiredWeek(
  store: ProgramProgressStore,
  year: string,
  requiredWeeks: number[] | undefined | null,
  realmId: string = "number"
): number | null {
  const normalized = normalizeWeekList(requiredWeeks, realmId);
  if (!normalized.length) return null;
  for (const week of normalized) {
    if (!isWeekComplete(getWeekProgress(store, year, week, realmId))) return week;
  }
  return null;
}

export function getRecommendedAssignedWeek(
  store: ProgramProgressStore,
  year: string,
  currentAssignedWeek: number | undefined,
  requiredWeeks: number[] | undefined | null,
  realmId: string = "number"
): number {
  const firstIncompleteRequired = getFirstIncompleteRequiredWeek(store, year, requiredWeeks, realmId);
  if (firstIncompleteRequired != null) return firstIncompleteRequired;
  return Math.max(1, Math.min(getProgramWeeks(realmId).length, currentAssignedWeek ?? 1));
}

export function getPlayableWeeks(
  store: ProgramProgressStore,
  year: string,
  requiredWeeks: number[] | undefined | null,
  optionalWeeks: number[] | undefined | null,
  realmId: string = "number"
): number[] {
  void optionalWeeks;
  const normalizedRequired = normalizeWeekList(requiredWeeks, realmId);
  if (!normalizedRequired.length) return getProgramWeeks(realmId);

  if (hasCompletedRequiredWeeks(store, year, normalizedRequired, realmId)) {
    return getProgramWeeks(realmId);
  }

  const completedRequired = getCompletedRequiredWeeks(store, year, normalizedRequired, realmId);
  const firstIncompleteRequired = getFirstIncompleteRequiredWeek(store, year, normalizedRequired, realmId);

  return normalizeWeekList([
    ...completedRequired,
    ...(firstIncompleteRequired != null ? [firstIncompleteRequired] : []),
  ], realmId);
}

export function isWeekPlayable(
  store: ProgramProgressStore,
  year: string,
  week: number,
  requiredWeeks: number[] | undefined | null,
  optionalWeeks: number[] | undefined | null,
  realmId: string = "number"
): boolean {
  return getPlayableWeeks(store, year, requiredWeeks, optionalWeeks, realmId).includes(week);
}

/**
 * Mark a specific lesson as complete in the store and persist.
 * lessonNumber is 1-based (1, 2, or 3).
 */
export function markLessonComplete(year: string, week: number, lessonNumber: number, realmId: string = "number") {
  const store = readProgramStore();
  const key = makeProgramProgressKey(year, week, realmId);
  const current = getWeekProgress(store, year, week, realmId);
  const nextLessons = [...current.lessonsCompleted];
  nextLessons[lessonNumber - 1] = true;
  store[key] = { ...current, lessonsCompleted: nextLessons };
  writeProgramStore(store);
  return store;
}

/**
 * Record a quiz score and mark quiz as complete.
 */
export function markQuizComplete(year: string, week: number, score: number, realmId: string = "number") {
  const store = readProgramStore();
  const key = makeProgramProgressKey(year, week, realmId);
  const current = getWeekProgress(store, year, week, realmId);
  store[key] = { ...current, quizCompleted: true, quizScore: score };
  writeProgramStore(store);
  return store;
}
