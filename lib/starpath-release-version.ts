import type {NormalizedAssessmentAttempt} from './realm-progress-compat';
export function savedStarpathReleaseVersion(ids:readonly string[]|undefined):0|1|null{
 if(!ids?.length)return null;
 return ids.every(id=>/^y[0-8]-starpath-(pretest|posttest)-\d{2}-v9$/.test(id))?1:0;
}
export function starpathPostReleaseVersion(year:string,attempts:readonly NormalizedAssessmentAttempt[],ids?:readonly string[]):0|1{
 const saved=savedStarpathReleaseVersion(ids);if(saved!==null)return saved;
 const baseline=attempts.filter(a=>a.realmId==='space'&&a.workingLevel===year&&a.assessmentType==='pretest').sort((a,b)=>Date.parse(a.completedAt)-Date.parse(b.completedAt)||a.id.localeCompare(b.id)).at(-1);
 if(!baseline)return 1;
 const evidence=baseline.placementResult.assessment_evidence as {comparison_group?:string}|undefined;
 return evidence?.comparison_group===`starpath-${year}-2026-09-22-v9`?1:0;
}
