import type { NormalizedAssessmentAttempt } from './realm-progress-compat';
export function savedYear3MeasurementVersion(ids:readonly string[]|undefined):3|4|null {
 if(!ids?.length)return null;
 if(ids.every(id=>/^y3-measurement-(pre|post)-\d{2}-v4$/.test(id)))return 4;
 if(ids.every(id=>/^y3-measurement-(pre|post)-\d{2}-v3$/.test(id)))return 3;
 return null;
}
export function year3MeasurementPostVersion(attempts:readonly NormalizedAssessmentAttempt[],draftIds?:readonly string[]):3|4 {
 const saved=savedYear3MeasurementVersion(draftIds);if(saved)return saved;
 const baseline=attempts.filter(a=>a.realmId==='measurement'&&a.workingLevel==='Year 3'&&a.assessmentType==='pretest').sort((a,b)=>Date.parse(a.completedAt)-Date.parse(b.completedAt)||a.id.localeCompare(b.id)).at(-1);
 if(!baseline)return 4;
 const evidence=baseline.placementResult.assessment_evidence as {comparison_group?:string}|undefined;
 return evidence?.comparison_group==='year3-measurement-2026-09-17-v4'?4:3;
}
