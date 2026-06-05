// ── Save & Resume state (pre-test + lesson) ─────────────────────────────────
// Trial feedback: students must never lose progress when they exit, log out, or
// get interrupted mid-assessment / mid-lesson. We persist a lightweight snapshot
// to localStorage, scoped per active student, and offer a "Resume" entry point
// on return. Snapshots are cleared once the assessment / lesson is completed.

import { ACTIVE_STUDENT_KEY } from "@/data/progress";

function activeStudentScope(): string {
  if (typeof window === "undefined") return "anon";
  return localStorage.getItem(ACTIVE_STUDENT_KEY)?.trim() || "anon";
}

// ── Pre-test resume ─────────────────────────────────────────────────────────

export type PretestResumeState = {
  year: string;
  index: number;
  answers: Array<string | null>;
  /** Question ids the student tapped "I Don't Know" on (for later analytics). */
  idkResponses: string[];
  updatedAt: number;
};

function pretestKey(year: string): string {
  return `lul:pretest-resume:${activeStudentScope()}:${year}`;
}

export function savePretestResume(state: PretestResumeState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(pretestKey(state.year), JSON.stringify(state));
  } catch {
    /* storage full / unavailable — non-fatal */
  }
}

export function loadPretestResume(year: string): PretestResumeState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(pretestKey(year));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PretestResumeState;
    if (!parsed || parsed.year !== year || !Array.isArray(parsed.answers)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearPretestResume(year: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(pretestKey(year));
  } catch {
    /* non-fatal */
  }
}

/** True when a resume snapshot has meaningful progress worth offering to restore. */
export function pretestResumeHasProgress(state: PretestResumeState | null): boolean {
  if (!state) return false;
  if (state.index > 0) return true;
  return state.answers.some((a) => a != null);
}

// ── Lesson resume ───────────────────────────────────────────────────────────

export type LessonResumeState = {
  lessonKey: string;
  /** Index of the current activity/step within the lesson. */
  activityIndex: number;
  /** Seconds left on the lesson countdown when saved. */
  secondsLeft: number;
  /** XP earned so far in this lesson. */
  xpEarned: number;
  updatedAt: number;
};

function lessonKey(lessonId: string): string {
  return `lul:lesson-resume:${activeStudentScope()}:${lessonId}`;
}

export function saveLessonResume(state: LessonResumeState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(lessonKey(state.lessonKey), JSON.stringify(state));
  } catch {
    /* non-fatal */
  }
}

export function loadLessonResume(lessonId: string): LessonResumeState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(lessonKey(lessonId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LessonResumeState;
    if (!parsed || parsed.lessonKey !== lessonId) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearLessonResume(lessonId: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(lessonKey(lessonId));
  } catch {
    /* non-fatal */
  }
}

/** True when a lesson snapshot has meaningful progress worth offering to restore. */
export function lessonResumeHasProgress(state: LessonResumeState | null): boolean {
  if (!state) return false;
  return state.activityIndex > 0 || state.xpEarned > 0;
}
