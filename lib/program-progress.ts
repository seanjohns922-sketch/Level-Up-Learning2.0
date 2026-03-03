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

export function getWeekProgress(store: ProgramProgressStore, year: string, week: number | string): WeekProgress {
  const key = makeKey(year, week);
  return store[key] ?? { lessonsCompleted: [false, false, false], quizCompleted: false };
}

export function isWeekComplete(p: WeekProgress): boolean {
  return (p.quizScore ?? 0) >= 80 || (p.lessonsCompleted.filter(Boolean).length === 3 && p.quizCompleted);
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
