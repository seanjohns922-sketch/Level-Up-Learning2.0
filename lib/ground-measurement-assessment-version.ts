import type { NormalizedAssessmentAttempt } from './realm-progress-compat';
export function savedGroundMeasurementVersion(ids:readonly string[]|undefined):3|4|null {
 if(!ids?.length)return null;
 if(ids.every(id=>/^y0-measurement-(pre|post)-\d{2}-v4$/.test(id)))return 4;
 if(ids.every(id=>/^y0-measurement-(pre|post)-\d{2}-v3$/.test(id)))return 3;
 return null;
}
export function groundMeasurementPostVersion(attempts:readonly NormalizedAssessmentAttempt[],draftIds?:readonly string[]):3|4 {
 const saved=savedGroundMeasurementVersion(draftIds);if(saved)return saved;
 const baseline=attempts.filter(a=>a.realmId==='measurement'&&a.workingLevel==='Prep'&&a.assessmentType==='pretest').sort((a,b)=>Date.parse(a.completedAt)-Date.parse(b.completedAt)||a.id.localeCompare(b.id)).at(-1);
 if(!baseline)return 4;
 const evidence=baseline.placementResult.assessment_evidence as {comparison_group?:string}|undefined;
 return evidence?.comparison_group==='ground-measurement-2026-09-16-v4'?4:3;
}
