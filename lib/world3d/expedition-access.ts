import {ASSESSMENT_THRESHOLDS} from '@/lib/assessment-rules';
export const EXPEDITION_REALMS = ['number','measurement','space','statistics','pattern','chance'] as const;
export type ExpeditionRealm = typeof EXPEDITION_REALMS[number];
/** level7: cave trails open. level8: stronghold open. recovered: Level 8 mastered (85%+ on its pre- or post-test), so the Core is free. */
export type ExpeditionAccess = {level7:ExpeditionRealm[];level8:ExpeditionRealm[];recovered:ExpeditionRealm[]};
export type ExpeditionAssessment = {student_id:string;realm_id:string;working_level:string;assessment_type:string;correct_count:number|null;total_questions:number|null;score_percent:number;passed:boolean|null;completed_at:string|null};
export type ExpeditionPlacement = {student_id:string;realm_id:string;assigned_start_level?:string|null;working_level?:string|null;is_current?:boolean};
export function expeditionAccessFromAssessments(studentId:string,rows:ExpeditionAssessment[],placements:ExpeditionPlacement[]=[]):ExpeditionAccess{
 const level7=new Set<ExpeditionRealm>(),level8=new Set<ExpeditionRealm>(),recovered=new Set<ExpeditionRealm>();
 const placedAt=(p:ExpeditionPlacement,level:string)=>p.assigned_start_level===level||(p.working_level===level&&p.is_current!==false);
 for(const p of placements){
  if(p.student_id!==studentId||!EXPEDITION_REALMS.includes(p.realm_id as ExpeditionRealm))continue;
  const realm=p.realm_id as ExpeditionRealm;
  if(placedAt(p,'Year 7'))level7.add(realm);
  // A Level 8 placement opens both the realm's trail and its stronghold on the volcano above it.
  if(placedAt(p,'Year 8')){level7.add(realm);level8.add(realm);}
 }
 for(const row of rows){
  if(row.student_id!==studentId||!['pretest','posttest'].includes(row.assessment_type)||!row.completed_at||!EXPEDITION_REALMS.includes(row.realm_id as ExpeditionRealm))continue;
  const countsValid=typeof row.correct_count==='number'&&typeof row.total_questions==='number'&&Number.isFinite(row.correct_count)&&Number.isFinite(row.total_questions)&&row.total_questions>0&&row.correct_count>=0&&row.correct_count<=row.total_questions;
  const percent=countsValid?row.correct_count!/row.total_questions!*100:row.score_percent;
  if(!Number.isFinite(percent)||percent<0||percent>100)continue;
  const realm=row.realm_id as ExpeditionRealm;
  if(percent<ASSESSMENT_THRESHOLDS.posttestPassPercent)continue;
  if(row.assessment_type==='posttest'&&row.working_level==='Year 6')level7.add(realm);
  if(row.assessment_type==='posttest'&&row.working_level==='Year 7')level8.add(realm);
  if(row.working_level==='Year 8')recovered.add(realm);
 }
 return {level7:[...level7],level8:[...level8].filter(realm=>level7.has(realm)),recovered:[...recovered].filter(realm=>level8.has(realm))};
}
