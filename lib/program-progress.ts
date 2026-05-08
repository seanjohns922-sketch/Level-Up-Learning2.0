/**
 * Shared program progress store – single source of truth for
 * lesson completions, quiz scores, and week gating.
 *
 * Both lesson/page.tsx and program/page.tsx MUST use these helpers
 * to read/write, so data stays in sync.
 */

import { ACTIVE_STUDENT_KEY } from "@/data/progress";

export type WeekProgress = {
  lessonsCompleted: boolean[];   // [L1, L2, L3]
  quizCompleted: boolean;
  quizScore?: number;
};

export type ProgramProgressStore = Record<string, WeekProgress>;
export const ALL_PROGRAM_WEEKS = Array.from({ length: 12 }, (_, index) => index + 1);

export const PROGRAM_STORE_KEY = "lul_program_progress_v1";

function getActiveStudentScope() {
  if (typeof window === "undefined") return "server";
  const active = localStorage.getItem(ACTIVE_STUDENT_KEY);
  if (active && active.trim()) return active.trim();
  const isDemo = new URLSearchParams(window.location.search).get("demo") === "1";
  return isDemo ? "demo" : "anon";
}

export function getScopedProgramStoreKey(scope = getActiveStudentScope()) {
  return `lul:${scope}:program_progress_v1`;
}

function makeKey(year: string, week: number | string) {
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
  localStorage.setItem(getScopedProgramStoreKey(), JSON.stringify(store));
}

export function clearScopedProgramStore(scope = getActiveStudentScope()) {
  if (typeof window === "undefined") return;
  localStorage.removeItem(getScopedProgramStoreKey(scope));
}

export function clearYearProgress(year: string) {
  if (typeof window === "undefined") return {};
  const store = readProgramStore();
  const nextStore = Object.fromEntries(
    Object.entries(store).filter(([key]) => !key.startsWith(`${year}|`))
  ) as ProgramProgressStore;
  writeProgramStore(nextStore);
  return nextStore;
}

export function getWeekProgress(store: ProgramProgressStore, year: string, week: number | string): WeekProgress {
  const key = makeKey(year, week);
  return store[key] ?? { lessonsCompleted: [false, false, false], quizCompleted: false };
}

export function isWeekComplete(p: WeekProgress): boolean {
  return (p.quizScore ?? 0) >= 80 || (p.lessonsCompleted.filter(Boolean).length === 3 && p.quizCompleted);
}

export function normalizeWeekList(weeks: number[] | undefined | null): number[] {
  if (!Array.isArray(weeks)) return [];
  return [...new Set(weeks.map((week) => Number(week)).filter((week) => Number.isInteger(week) && week >= 1 && week <= 12))].sort(
    (a, b) => a - b
  );
}

export function getOptionalWeeks(requiredWeeks: number[] | undefined | null): number[] {
  const required = new Set(normalizeWeekList(requiredWeeks));
  return ALL_PROGRAM_WEEKS.filter((week) => !required.has(week));
}

export function isFullRequiredPath(
  requiredWeeks: number[] | undefined | null,
  optionalWeeks: number[] | undefined | null
): boolean {
  const required = normalizeWeekList(requiredWeeks);
  const optional = normalizeWeekList(optionalWeeks);
  return required.length === ALL_PROGRAM_WEEKS.length && optional.length === 0;
}

export function getCompletedRequiredWeeks(
  store: ProgramProgressStore,
  year: string,
  requiredWeeks: number[] | undefined | null
): number[] {
  return normalizeWeekList(requiredWeeks).filter((week) => isWeekComplete(getWeekProgress(store, year, week)));
}

export function hasCompletedRequiredWeeks(
  store: ProgramProgressStore,
  year: string,
  requiredWeeks: number[] | undefined | null
): boolean {
  const normalized = normalizeWeekList(requiredWeeks);
  if (!normalized.length) return false;
  return normalized.every((week) => isWeekComplete(getWeekProgress(store, year, week)));
}

export function getFirstIncompleteRequiredWeek(
  store: ProgramProgressStore,
  year: string,
  requiredWeeks: number[] | undefined | null
): number | null {
  const normalized = normalizeWeekList(requiredWeeks);
  if (!normalized.length) return null;
  for (const week of normalized) {
    if (!isWeekComplete(getWeekProgress(store, year, week))) return week;
  }
  return null;
}

export function getRecommendedAssignedWeek(
  store: ProgramProgressStore,
  year: string,
  currentAssignedWeek: number | undefined,
  requiredWeeks: number[] | undefined | null
): number {
  const firstIncompleteRequired = getFirstIncompleteRequiredWeek(store, year, requiredWeeks);
  if (firstIncompleteRequired != null) return firstIncompleteRequired;
  return Math.max(1, Math.min(12, currentAssignedWeek ?? 1));
}

export function getPlayableWeeks(
  store: ProgramProgressStore,
  year: string,
  requiredWeeks: number[] | undefined | null,
  optionalWeeks: number[] | undefined | null
): number[] {
  void optionalWeeks;
  const normalizedRequired = normalizeWeekList(requiredWeeks);
  if (!normalizedRequired.length) return ALL_PROGRAM_WEEKS;

  if (hasCompletedRequiredWeeks(store, year, normalizedRequired)) {
    return ALL_PROGRAM_WEEKS;
  }

  const completedRequired = getCompletedRequiredWeeks(store, year, normalizedRequired);
  const firstIncompleteRequired = getFirstIncompleteRequiredWeek(store, year, normalizedRequired);

  return normalizeWeekList([
    ...completedRequired,
    ...(firstIncompleteRequired != null ? [firstIncompleteRequired] : []),
  ]);
}

export function isWeekPlayable(
  store: ProgramProgressStore,
  year: string,
  week: number,
  requiredWeeks: number[] | undefined | null,
  optionalWeeks: number[] | undefined | null
): boolean {
  return getPlayableWeeks(store, year, requiredWeeks, optionalWeeks).includes(week);
}

/**
 * Mark a specific lesson as complete in the store and persist.
 * lessonNumber is 1-based (1, 2, or 3).
 */
export function markLessonComplete(year: string, week: number, lessonNumber: number) {
  const store = readProgramStore();
  const key = makeKey(year, week);
  const current = getWeekProgress(store, year, week);
  const nextLessons = [...current.lessonsCompleted];
  nextLessons[lessonNumber - 1] = true;
  store[key] = { ...current, lessonsCompleted: nextLessons };
  writeProgramStore(store);
  return store;
}

/**
 * Record a quiz score and mark quiz as complete.
 */
export function markQuizComplete(year: string, week: number, score: number) {
  const store = readProgramStore();
  const key = makeKey(year, week);
  const current = getWeekProgress(store, year, week);
  store[key] = { ...current, quizCompleted: true, quizScore: score };
  writeProgramStore(store);
  return store;
}
