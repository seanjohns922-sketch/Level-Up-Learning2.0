import type { NormalizedAssessmentAttempt } from "./realm-progress-compat";

export const YEAR4_NUMBER_V3_COMPARISON_GROUP = "paired-number-Year 4-2026-09-15-v3";

/** Prefer the version pinned by a saved sitting, including pre-release drafts. */
export function savedYear4NumberVersion(ids: readonly string[] | undefined): 2 | 3 | null {
  if (!ids?.length) return null;
  if (ids.every(id => /^y4-number-(pre|post)-\d{2}-v2$/.test(id))) return 2;
  if (ids.every(id => /^y4-number-(pre|post)-\d{2}-v3$/.test(id))) return 3;
  return null;
}

/** Unknown historical baselines stay on the original pair; never relabel their evidence. */
export function year4NumberPostVersion(attempts: readonly NormalizedAssessmentAttempt[], draftIds?: readonly string[]): 2 | 3 {
  const saved = savedYear4NumberVersion(draftIds);
  if (saved) return saved;
  const baseline = attempts.filter(a => a.realmId === "number" && a.workingLevel === "Year 4" && a.assessmentType === "pretest")
    .sort((a, b) => Date.parse(a.completedAt) - Date.parse(b.completedAt) || a.id.localeCompare(b.id))
    .at(-1);
  const evidence = baseline?.placementResult.assessment_evidence as { comparison_group?: string } | undefined;
  return evidence?.comparison_group === YEAR4_NUMBER_V3_COMPARISON_GROUP ? 3 : 2;
}
