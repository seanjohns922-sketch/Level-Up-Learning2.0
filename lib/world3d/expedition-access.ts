export const EXPEDITION_REALMS = ['number','measurement','space','statistics','pattern','chance'] as const;
export type ExpeditionRealm = typeof EXPEDITION_REALMS[number];
export type ExpeditionAccess = {level7:ExpeditionRealm[];level8:ExpeditionRealm[]};
export type ExpeditionAssessment = {student_id:string;realm_id:string;working_level:string;assessment_type:string;correct_count:number|null;total_questions:number|null;score_percent:number;passed:boolean|null;completed_at:string|null};
export type ExpeditionPlacement = {student_id:string;realm_id:string;assigned_start_level?:string|null;working_level?:string|null;is_current?:boolean};
export function expeditionAccessFromAssessments(studentId:string,rows:ExpeditionAssessment[],placements:ExpeditionPlacement[]=[]):ExpeditionAccess{
 const level7=new Set<ExpeditionRealm>(),level8=new Set<ExpeditionRealm>();
 for(const p of placements){
  if(p.student_id===studentId&&EXPEDITION_REALMS.includes(p.realm_id as ExpeditionRealm)&&(p.assigned_start_level==='Year 7'||(p.working_level==='Year 7'&&p.is_current!==false)))level7.add(p.realm_id as ExpeditionRealm);
 }
 for(const row of rows){
  if(row.student_id!==studentId||row.assessment_type!=='posttest'||!row.completed_at||!EXPEDITION_REALMS.includes(row.realm_id as ExpeditionRealm))continue;
  const countsValid=typeof row.correct_count==='number'&&typeof row.total_questions==='number'&&Number.isFinite(row.correct_count)&&Number.isFinite(row.total_questions)&&row.total_questions>0&&row.correct_count>=0&&row.correct_count<=row.total_questions;
  const percent=countsValid?row.correct_count!/row.total_questions!*100:row.score_percent;
  if(!Number.isFinite(percent)||percent<0||percent>100)continue;
  const realm=row.realm_id as ExpeditionRealm;
  if(row.working_level==='Year 6'&&percent>=85)level7.add(realm);
  if(row.working_level==='Year 7'&&percent>=85)level8.add(realm);
 }
 return {level7:[...level7],level8:[...level8].filter(realm=>level7.has(realm))};
}
