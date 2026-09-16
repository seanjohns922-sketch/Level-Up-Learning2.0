import type { NormalizedAssessmentAttempt } from "@/lib/realm-progress-compat";

export const STARPATH_COMPARISON_GROUP = "starpath-space-2026-09-14";
export function isGroundBaseline(realmId: string, year: string) {
  return year === "Prep" && ["number", "measurement", "space"].includes(realmId);
}
export function hasComparableAssessmentGrowth(realmId: string, year: string) {
  return year === "Prep" ? isGroundBaseline(realmId, year) : ["number", "measurement", "space", "statistics", "pattern", "chance"].includes(realmId);
}
function comparisonGroup(realmId: string, year: string, questions: readonly { id: string }[]): string | null {
  const usesVersion = (version: number) => questions.some(q => q.id.endsWith(`-v${version}`));
  if (realmId === "space") return STARPATH_COMPARISON_GROUP + (usesVersion(5) ? "-v5" : "");
  if (realmId === "number" && year === "Prep" && questions.length===20 && questions.every(q=>/^y0-number-(pre|post)-\d{2}-v3$/.test(q.id))) return "ground-number-2026-09-15-v3";
  if (realmId==="measurement" && year==="Prep" && questions.length===20 && questions.every(q=>/^y0-measurement-(pre|post)-\d{2}-v4$/.test(q.id))) return "ground-measurement-2026-09-16-v4";
  if (realmId==="measurement" && year==="Year 1" && questions.length===20 && questions.every(q=>/^y1-measurement-(pre|post)-\d{2}-v4$/.test(q.id))) return "year1-measurement-2026-09-16-v4";
  if (isGroundBaseline(realmId, year)) return `ground-${realmId}-2026-09-14${realmId === "measurement" && usesVersion(3) ? "-v3" : ""}`;
  if (realmId === "number" && year === "Year 1" && questions.length === 20 && questions.every(q => /^y1-number-(pre|post)-\d{2}-v3$/.test(q.id))) return "paired-number-Year 1-2026-09-15-v3";
  if (realmId === "number" && year === "Year 1" && questions.length === 20 && questions.every(q => /^y1-number-(pre|post)-\d{2}-v5$/.test(q.id))) return "paired-number-Year 1-2026-09-15-v5";
  if (realmId === "number" && year === "Year 2" && questions.length === 20 && questions.every(q => /^y2-number-(pre|post)-\d{2}-v3$/.test(q.id))) return "paired-number-Year 2-2026-09-15-v3";
  if (realmId === "number" && year === "Year 4" && questions.length === 20 && questions.every(q => /^y4-number-(pre|post)-\d{2}-v3$/.test(q.id))) return "paired-number-Year 4-2026-09-15-v3";
  if (realmId === "number" && year === "Year 5" && questions.length === 20 && questions.every(q => /^y5-number-(pre|post)-\d{2}-v3$/.test(q.id))) return "paired-number-Year 5-2026-09-15-v3";
  if (realmId === "number" && year === "Year 6" && questions.length === 20 && questions.every(q => /^y6-number-(pre|post)-\d{2}-v3$/.test(q.id))) return "paired-number-Year 6-2026-09-15-v3";
  if (realmId === "number" && year === "Year 3" && questions.length === 20 && questions.every(q => /^y3-number-(pre|post)-\d{2}-v3$/.test(q.id))) return "paired-number-Year 3-2026-09-16-v3";
  if (realmId === "number" && year === "Year 8" && questions.length === 30 && questions.every(q => /^y8-number-(pre|post)-\d{2}-v1$/.test(q.id))) return "paired-number-Year 8-2026-09-16-v1";
  if (realmId === "number" && year === "Year 7" && questions.length === 30 && questions.every(q => /^y7-number-(pre|post)-\d{2}-v1$/.test(q.id))) return "paired-number-Year 7-2026-09-16-v1";
  const expectedVersion = realmId === "measurement" || realmId === "pattern" ? 3 : 2;
  if (!questions.length || questions.some(q => !q.id.endsWith(`-v${expectedVersion}`))) return null;
  return `paired-${realmId}-${year}-2026-09-14-repair-v${expectedVersion}`;
}
export function assessmentEvidenceMetadata(realmId: string, year: string, questions: readonly { id: string }[]) {
  if (!hasComparableAssessmentGrowth(realmId, year)) return {};
  return { assessment_evidence: {
    realm: realmId, working_level: year,
    comparison_group: comparisonGroup(realmId, year, questions),
    comparability_status: comparisonGroup(realmId, year, questions) ? "blueprint_matched_uncalibrated" : "unmatched_version",
    bank_versions: [...new Set(questions.map(q => q.id.match(/-v(\d+)$/)?.[1] ?? "unknown"))],
    calibration_status: "uncalibrated", baseline_only: isGroundBaseline(realmId, year),
  } };
}

function group(attempt: NormalizedAssessmentAttempt): string | null {
  const metadata = attempt.placementResult.assessment_evidence;
  return metadata && typeof metadata === "object" && "comparison_group" in metadata && typeof metadata.comparison_group === "string" ? metadata.comparison_group : null;
}
function cycle(attempt: NormalizedAssessmentAttempt): string | null {
  const metadata = attempt.placementResult.assessment_evidence;
  return metadata && typeof metadata === "object" && "learning_cycle_id" in metadata && typeof metadata.learning_cycle_id === "string" ? metadata.learning_cycle_id : null;
}
export function comparableAssessmentGrowth(attempts: readonly NormalizedAssessmentAttempt[], realmId: string, year: string) {
  const ordered = attempts.filter(a => a.realmId === realmId && a.workingLevel === year && Number.isFinite(Date.parse(a.completedAt)))
    .sort((a,b) => Date.parse(a.completedAt)-Date.parse(b.completedAt) || a.id.localeCompare(b.id));
  const latest = ordered.at(-1);
  const cycleAttempts = latest && cycle(latest) ? ordered.filter(a => cycle(a) === cycle(latest)) : ordered;
  const baseline = cycleAttempts.find(a => a.assessmentType === "pretest");
  if (!baseline) return {baseline:null,post:null,change:null,days:null,reason:"No recorded baseline"};
  const post = cycleAttempts.filter(a => a.assessmentType === "posttest" && Date.parse(a.completedAt)>Date.parse(baseline.completedAt)).at(-1);
  if (!post) return {baseline,post:null,change:null,days:null,reason:"Awaiting a later post-test"};
  const comparable = group(baseline)!==null && group(baseline)===group(post) && cycle(baseline)===cycle(post);
  return {baseline,post,change:comparable ? post.scorePercent-baseline.scorePercent : null,
    days:Math.floor((Date.parse(post.completedAt)-Date.parse(baseline.completedAt))/86400000),
    reason:comparable ? null : "Assessment versions differ or are unrecorded"};
}
