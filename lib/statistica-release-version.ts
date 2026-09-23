import type {NormalizedAssessmentAttempt} from './realm-progress-compat';
export function savedStatisticaReleaseVersion(ids:readonly string[]|undefined):0|1|null{
 if(!ids?.length)return null;
 return ids.every(id=>/^y[1-8]-statistica-(pretest|posttest)-\d{2}-v3$/.test(id))?1:0;
}
export function statisticaPostReleaseVersion(year:string,attempts:readonly NormalizedAssessmentAttempt[],ids?:readonly string[]):0|1{
 const saved=savedStatisticaReleaseVersion(ids);if(saved!==null)return saved;
 const baseline=attempts.filter(a=>a.realmId==='statistics'&&a.workingLevel===year&&a.assessmentType==='pretest').sort((a,b)=>Date.parse(a.completedAt)-Date.parse(b.completedAt)||a.id.localeCompare(b.id)).at(-1);
 if(!baseline)return 1;
 const evidence=baseline.placementResult.assessment_evidence as {comparison_group?:string}|undefined;
 return evidence?.comparison_group===`statistica-${year}-2026-09-23-v3`?1:0;
}
