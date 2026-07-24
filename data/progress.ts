import type { AssessmentResultProfile } from "@/data/assessments/analysis";
import { DEMO_PREVIEW_SCOPE, isDemoPreviewMode } from "@/lib/demo-mode";
import { isReviewMode } from "@/lib/review-mode";

export type StudentProgress = {
  year: string; // "Year 3"
  scorePercent: number;
  status: "PASSED" | "ASSIGNED_PROGRAM";
  placementComplete?: boolean;
  assignedWeek?: number; // 1..12 (only for ASSIGNED_PROGRAM)
  assignedWeeksHistory?: number[];
  requiredWeeks?: number[];
  optionalWeeks?: number[];
  unlockedLegends: string[]; // legend ids
  lastPreTestPercent?: number;
  lastPreTestProfile?: AssessmentResultProfile;
  lastPostTestPercent?: number;
  lastPostTestProfile?: AssessmentResultProfile;
  teacherAdvancedWeeks?: number[];
};

export const STORAGE_KEY = "lul_student_progress_v1";
export const ACTIVE_STUDENT_KEY = "lul_active_student_v1";
export type ProgressRealmScope = "number" | "measurement" | "space";

type ProgressCacheEnvelope = {
  student_id: string;
  realm_id: ProgressRealmScope;
  server_version: "canonical-v1";
  updated_at: string;
  progress: StudentProgress;
};

function getActiveRealmScope(): ProgressRealmScope {
  if (typeof window === "undefined") return "number";
  const searchRealm = new URLSearchParams(window.location.search).get("realm_id");
  if (searchRealm === "measurement") return "measurement";
  if (searchRealm === "space") return "space";
  const pathname = window.location.pathname.toLowerCase();
  if (pathname.startsWith("/measurelands")) return "measurement";
  if (pathname.startsWith("/starpath") || pathname.startsWith("/legends/starpath")) return "space";
  return "number";
}

function getActiveStudentScope() {
  if (typeof window === "undefined") return "server";
  if (isDemoPreviewMode()) return DEMO_PREVIEW_SCOPE;
  const active = localStorage.getItem(ACTIVE_STUDENT_KEY);
  if (active && active.trim()) return active.trim();
  const isDemo = new URLSearchParams(window.location.search).get("demo") === "1";
  return isDemo ? "demo" : "anon";
}

export function getScopedProgressKey(
  scope = getActiveStudentScope(),
  realmId: ProgressRealmScope = getActiveRealmScope()
) {
  return `lul:${scope}:${realmId}:student_progress_v1`;
}

export function readProgress(realmId: ProgressRealmScope = getActiveRealmScope()): StudentProgress | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(getScopedProgressKey(undefined, realmId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StudentProgress | ProgressCacheEnvelope;
    if ("progress" in parsed) {
      const scope = getActiveStudentScope();
      if (parsed.student_id !== scope || parsed.realm_id !== realmId) return null;
      return parsed.progress;
    }
    // Legacy local progress is allowed only in isolated Demo Mode. Real student
    // routes must rebuild this cache from canonical server rows.
    return isDemoPreviewMode() ? parsed : null;
  } catch {
    return null;
  }
}

export function writeProgress(next: StudentProgress, realmId: ProgressRealmScope = getActiveRealmScope()) {
  if (typeof window === "undefined") return;
  // Reviewing a previous level is read-only — never touch stored progress.
  if (isReviewMode()) return;
  const envelope: ProgressCacheEnvelope = {
    student_id: getActiveStudentScope(),
    realm_id: realmId,
    server_version: "canonical-v1",
    updated_at: new Date().toISOString(),
    progress: next,
  };
  localStorage.setItem(getScopedProgressKey(undefined, realmId), JSON.stringify(envelope));
}

export function clearScopedProgress(
  scope = getActiveStudentScope(),
  realmId?: ProgressRealmScope
) {
  if (typeof window === "undefined") return;
  if (realmId) {
    localStorage.removeItem(getScopedProgressKey(scope, realmId));
    return;
  }
  localStorage.removeItem(getScopedProgressKey(scope, "number"));
  localStorage.removeItem(getScopedProgressKey(scope, "measurement"));
  localStorage.removeItem(getScopedProgressKey(scope, "space"));
}

export function updateProgress(
  patch: Partial<StudentProgress>,
  realmId: ProgressRealmScope = getActiveRealmScope(),
) {
  const current = readProgress(realmId);
  if (!current) return;

  const merged: StudentProgress = {
    ...current,
    ...patch,
    unlockedLegends: patch.unlockedLegends ?? current.unlockedLegends ?? [],
  };

  writeProgress(merged, realmId);
}

export function isPlacementComplete(progress: StudentProgress | null | undefined) {
  if (!progress) return false;
  if (typeof progress.placementComplete === "boolean") return progress.placementComplete;
  return progress.status === "PASSED";
}
