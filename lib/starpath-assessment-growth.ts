import type {NormalizedAssessmentAttempt} from "@/lib/realm-progress-compat";
export const STARPATH_COMPARISON_GROUP = "starpath-space-2026-09-14";
export function starpathAssessmentMetadata(realmId: string, year: string, questions: readonly {id:string}[]) {
  if(realmId !== "space") return {};
  return {assessment_evidence:{realm: "space", working_level:year, comparison_group:STARPATH_COMPARISON_GROUP, bank_versions:[...new Set(questions.map(q=>q.id.match(/-v(\d+)$/)?.[1]??"unknown"))], calibration_status:"uncalibrated", baseline_only:year==="Prep"}};
}
function group(attempt: NormalizedAssessmentAttempt): string | null {
  const metadata=attempt.placementResult.assessment_evidence;
  return metadata && typeof metadata === "object" && "comparison_group" in metadata && typeof metadata.comparison_group === "string" ? metadata.comparison_group : null;
}
export function starpathAssessmentGrowth(attempts: readonly NormalizedAssessmentAttempt[], year: string) {
  const ordered=attempts.filter(a=>a.realmId==="space" && a.workingLevel===year && Number.isFinite(Date.parse(a.completedAt))).sort((a,b)=>Date.parse(a.completedAt)-Date.parse(b.completedAt)||a.id.localeCompare(b.id));
  const baseline=ordered.find(a=>a.assessmentType==="pretest");
  if(!baseline)return {baseline:null,post:null,change:null,days:null,reason:"No recorded baseline"};
  const post=ordered.filter(a=>a.assessmentType==="posttest" && Date.parse(a.completedAt)>Date.parse(baseline.completedAt)).at(-1);
  if(!post)return {baseline,post:null,change:null,days:null,reason:"Awaiting a later post-test"};
  const comparable=group(baseline)!==null && group(baseline)===group(post);
  return {baseline,post,change:comparable?post.scorePercent-baseline.scorePercent:null,days:Math.floor((Date.parse(post.completedAt)-Date.parse(baseline.completedAt))/86400000),reason:comparable?null:"Assessment versions differ or are unrecorded"};
}
