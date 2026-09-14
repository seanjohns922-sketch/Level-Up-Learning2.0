import type { NormalizedAssessmentAttempt } from "@/lib/realm-progress-compat";
import { assessmentEvidenceMetadata, comparableAssessmentGrowth } from "@/lib/assessment-growth";
export { STARPATH_COMPARISON_GROUP } from "@/lib/assessment-growth";
export function starpathAssessmentMetadata(realmId: string, year: string, questions: readonly {id:string}[]) {
  return realmId === "space" ? assessmentEvidenceMetadata(realmId, year, questions) : {};
}
export function starpathAssessmentGrowth(attempts: readonly NormalizedAssessmentAttempt[], year: string) {
  return comparableAssessmentGrowth(attempts, "space", year);
}
