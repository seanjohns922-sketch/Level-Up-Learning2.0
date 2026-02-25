export type StudentProgress = {
  year: string; // "Year 3"
  scorePercent: number;
  status: "PASSED" | "ASSIGNED_PROGRAM";
  assignedWeek?: number; // 1..12 (only for ASSIGNED_PROGRAM)
  unlockedLegends: string[]; // legend ids
};

export const STORAGE_KEY = "lul_student_progress_v1";

export function readProgress(): StudentProgress | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StudentProgress;
  } catch {
    return null;
  }
}

export function writeProgress(next: StudentProgress) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
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
