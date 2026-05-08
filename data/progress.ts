import type { AssessmentResultProfile } from "@/data/assessments/analysis";

export type StudentProgress = {
  year: string; // "Year 3"
  scorePercent: number;
  status: "PASSED" | "ASSIGNED_PROGRAM";
  assignedWeek?: number; // 1..12 (only for ASSIGNED_PROGRAM)
  assignedWeeksHistory?: number[];
  requiredWeeks?: number[];
  optionalWeeks?: number[];
  unlockedLegends: string[]; // legend ids
  lastPreTestPercent?: number;
  lastPreTestProfile?: AssessmentResultProfile;
  lastPostTestPercent?: number;
  lastPostTestProfile?: AssessmentResultProfile;
};

export const STORAGE_KEY = "lul_student_progress_v1";
export const ACTIVE_STUDENT_KEY = "lul_active_student_v1";

function getActiveStudentScope() {
  if (typeof window === "undefined") return "server";
  const active = localStorage.getItem(ACTIVE_STUDENT_KEY);
  if (active && active.trim()) return active.trim();
  const isDemo = new URLSearchParams(window.location.search).get("demo") === "1";
  return isDemo ? "demo" : "anon";
}

export function getScopedProgressKey(scope = getActiveStudentScope()) {
  return `lul:${scope}:student_progress_v1`;
}

export function readProgress(): StudentProgress | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(getScopedProgressKey());
    if (!raw) return null;
    return JSON.parse(raw) as StudentProgress;
  } catch {
    return null;
  }
}

export function writeProgress(next: StudentProgress) {
  if (typeof window === "undefined") return;
  localStorage.setItem(getScopedProgressKey(), JSON.stringify(next));
}

export function clearScopedProgress(scope = getActiveStudentScope()) {
  if (typeof window === "undefined") return;
  localStorage.removeItem(getScopedProgressKey(scope));
}

export function updateProgress(patch: Partial<StudentProgress>) {
  const current = readProgress();
  if (!current) return;

  const merged: StudentProgress = {
    ...current,
    ...patch,
    unlockedLegends: patch.unlockedLegends ?? current.unlockedLegends ?? [],
  };

  writeProgress(merged);
}
