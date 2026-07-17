import type { MistakeReviewItem } from "@/components/review/MistakeReviewPanel";
import { ACTIVE_STUDENT_KEY } from "@/data/progress";

export type AssessmentReviewMode = "pretest" | "posttest";

type AssessmentReviewState = {
  year: string;
  realmId: "number" | "measurement";
  mode: AssessmentReviewMode;
  items: MistakeReviewItem[];
};

function normalizeRealmId(realmId?: string | null): "number" | "measurement" {
  return realmId === "measurement" ? "measurement" : "number";
}

function storageKey(year: string, realmId: string | null | undefined, mode: AssessmentReviewMode) {
  const studentId = localStorage.getItem(ACTIVE_STUDENT_KEY)?.trim() || "anon";
  return `level-up:assessment-review:${studentId}:${normalizeRealmId(realmId)}:${year}:${mode}`;
}

export function saveAssessmentReviewState(state: AssessmentReviewState) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(storageKey(state.year, state.realmId, state.mode), JSON.stringify(state));
  } catch {
    // Review is a convenience; assessment completion must not depend on storage.
  }
}

export function loadAssessmentReviewItems({
  year,
  realmId,
  mode,
}: {
  year: string;
  realmId?: string | null;
  mode: AssessmentReviewMode;
}): MistakeReviewItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(storageKey(year, realmId, mode));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Partial<AssessmentReviewState>;
    return Array.isArray(parsed.items) ? parsed.items : [];
  } catch {
    return [];
  }
}
