import type { NormalizedAssessmentAttempt } from "./realm-progress-compat";
export function savedGroundNumberVersion(ids:readonly string[]|undefined):1|3|null {
  if(!ids?.length) return null;
  if(ids.every(id=>/^y0-number-(pre|post)-\d{2}-v1$/.test(id))) return 1;
  if(ids.every(id=>/^y0-number-(pre|post)-\d{2}-v3$/.test(id))) return 3;
  return null;
}
export function groundNumberPostVersion(attempts:readonly NormalizedAssessmentAttempt[],draftIds?:readonly string[]):1|3 {
  const saved=savedGroundNumberVersion(draftIds);
  if(saved) return saved;
  const baseline=attempts.filter(a=>a.realmId==='number'&&a.workingLevel==='Prep'&&a.assessmentType==='pretest')
    .sort((a,b)=>Date.parse(a.completedAt)-Date.parse(b.completedAt)||a.id.localeCompare(b.id)).at(-1);
  const evidence=baseline?.placementResult.assessment_evidence as {comparison_group?:string}|undefined;
  return evidence?.comparison_group==='ground-number-2026-09-15-v3'?3:1;
}
