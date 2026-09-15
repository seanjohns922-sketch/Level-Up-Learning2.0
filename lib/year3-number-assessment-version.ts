import type { NormalizedAssessmentAttempt } from "./realm-progress-compat";

export const YEAR3_NUMBER_V3_COMPARISON_GROUP = "paired-number-Year 3-2026-09-16-v3";

/** Prefer the version pinned by a saved sitting, including pre-release drafts. */
export function savedYear3NumberVersion(ids: readonly string[] | undefined): 2 | 3 | null {
  if (!ids?.length) return null;
  if (ids.every(id => /^y3-(?:number-(?:pre|post)|a|b)-.*-v2$/.test(id))) return 2;
  if (ids.every(id => /^y3-number-(pre|post)-\d{2}-v3$/.test(id))) return 3;
  return null;
}

/** Unknown historical baselines stay on the original pair; never relabel their evidence. */
export function year3NumberPostVersion(attempts: readonly NormalizedAssessmentAttempt[], draftIds?: readonly string[]): 2 | 3 {
  const saved = savedYear3NumberVersion(draftIds);
  if (saved) return saved;
  const baseline = attempts.filter(a => a.realmId === "number" && a.workingLevel === "Year 3" && a.assessmentType === "pretest")
    .sort((a, b) => Date.parse(a.completedAt) - Date.parse(b.completedAt) || a.id.localeCompare(b.id))
    .at(-1);
  const evidence = baseline?.placementResult.assessment_evidence as { comparison_group?: string } | undefined;
  return evidence?.comparison_group === YEAR3_NUMBER_V3_COMPARISON_GROUP ? 3 : 2;
}
