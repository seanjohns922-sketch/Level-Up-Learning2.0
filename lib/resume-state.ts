// ── Save & Resume state (pre-test + lesson) ─────────────────────────────────
// Trial feedback: students must never lose progress when they exit, log out, or
// get interrupted mid-assessment / mid-lesson. We persist a lightweight snapshot
// to localStorage, scoped per active student, and offer a "Resume" entry point
// on return. Snapshots are cleared once the assessment / lesson is completed.

import { ACTIVE_STUDENT_KEY, type ProgressRealmScope } from "@/data/progress";

function activeStudentScope(): string {
  if (typeof window === "undefined") return "anon";
  return localStorage.getItem(ACTIVE_STUDENT_KEY)?.trim() || "anon";
}

// ── Pre-test resume ─────────────────────────────────────────────────────────

export type PretestResumeState = {
  year: string;
  realmId?: ProgressRealmScope;
  index: number;
  answers: Array<string | null>;
  /** Question ids the student tapped "I Don't Know" on (for later analytics). */
  idkResponses: string[];
  updatedAt: number;
};

function currentRealmScope(): ProgressRealmScope {
  if (typeof window === "undefined") return "number";
  const searchRealm = new URLSearchParams(window.location.search).get("realm_id");
  if (searchRealm === "measurement") return "measurement";
  const pathname = window.location.pathname.toLowerCase();
  if (pathname.startsWith("/measurelands")) return "measurement";
  return "number";
}

function pretestKey(year: string, realmId: ProgressRealmScope = currentRealmScope()): string {
  return `lul:pretest-resume:${activeStudentScope()}:${realmId}:${year}`;
}

export function savePretestResume(state: PretestResumeState): void {
  if (typeof window === "undefined") return;
  try {
    const realmId = state.realmId ?? currentRealmScope();
    localStorage.setItem(pretestKey(state.year, realmId), JSON.stringify({ ...state, realmId }));
  } catch {
    /* storage full / unavailable — non-fatal */
  }
}

export function loadPretestResume(
  year: string,
  realmId: ProgressRealmScope = currentRealmScope()
): PretestResumeState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(pretestKey(year, realmId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PretestResumeState;
    if (!parsed || parsed.year !== year || !Array.isArray(parsed.answers)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearPretestResume(
  year: string,
  realmId: ProgressRealmScope = currentRealmScope()
): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(pretestKey(year, realmId));
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
  /** Seconds left on the lesson countdown when saved. */
  secondsLeft: number;
  /** Questions answered so far (drives the HUD progress). */
  questionsAnswered: number;
  /** Correct answers / XP earned so far. */
  correctAnswers: number;
  /** Current combo chain. */
  comboCount: number;
  /** Initial incorrect attempts captured for read-only end-of-lesson review. */
  lessonMistakes?: Array<{
    id: string;
    questionNumber: number;
    prompt: string;
    studentAnswer?: string | null;
    correctAnswer?: string | null;
    explanation?: string | null;
    week?: number | null;
    lesson?: number | null;
    lessonTitle?: string | null;
    skillLabel?: string | null;
  }>;
  /** Per-question attempt summary used to rebuild lesson coach data on resume. */
  attemptLog?: Array<{ topicLabel: string; correct: boolean; timeSpentSeconds: number }>;
  /** Index of the current activity/step (Year 2+ engine only). */
  activityIndex?: number;
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
  if (state.secondsLeft <= 0) return false; // already finished
  return state.questionsAnswered > 0 || state.correctAnswers > 0 || (state.activityIndex ?? 0) > 0;
}
