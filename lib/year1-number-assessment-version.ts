import type { NormalizedAssessmentAttempt } from "./realm-progress-compat";

/** Prefer the version pinned by a saved sitting, including pre-release drafts. */
export function savedYear1NumberVersion(ids: readonly string[] | undefined): 2 | 3 | null {
  if (!ids?.length) return null;
  if (ids.every(id => /^y1-number-(pre|post)-\d{2}-v2$/.test(id))) return 2;
  if (ids.every(id => /^y1-number-(pre|post)-\d{2}-v3$/.test(id))) return 3;
  return null;
}

/** Unknown historical baselines stay on the original pair; never relabel their evidence. */
export function year1NumberPostVersion(attempts: readonly NormalizedAssessmentAttempt[], draftIds?: readonly string[]): 2 | 3 {
  const saved = savedYear1NumberVersion(draftIds);
  if (saved) return saved;
  const baselines = attempts.filter(a => a.realmId === "number" && a.workingLevel === "Year 1" && a.assessmentType === "pretest")
    .sort((a, b) => Date.parse(a.completedAt) - Date.parse(b.completedAt) || a.id.localeCompare(b.id));
  const baseline = baselines.at(-1);
  const evidence = baseline?.placementResult.assessment_evidence as { comparison_group?: string } | undefined;
  return evidence?.comparison_group === "paired-number-Year 1-2026-09-15-v3" ? 3 : 2;
}
