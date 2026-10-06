import "server-only";
import {EXPEDITION_REALMS,expeditionAccessFromAssessments,type ExpeditionAssessment,type ExpeditionPlacement} from './expedition-access';

// Always use the public role and the caller's validated student-session header.
// No service-role bypass, browser-supplied placement, or local progress is accepted.
export async function readStudentExpeditionAccess(studentId:string,token:string){
 const rpc=async(name:string,args:Record<string,unknown>)=>{
  const response=await fetch(`https://dqncplrxjxvjqbmwcyia.supabase.co/rest/v1/rpc/${name}`,{method:'POST',cache:'no-store',headers:{apikey:'sb_publishable_cvaUEdcS16I8T3EqAydiaA_ES8XRgOo','Content-Type':'application/json','x-student-session':token},body:JSON.stringify(args)});
  if(!response.ok)throw new Error('Expedition access could not be verified');
  return response.json();
 };
 // Check identity before making the realm reads. The RPC rejects cross-student sessions.
 const levels=await rpc('get_student_realm_levels_secure',{p_student_id:studentId}) as {realm_id:string;working_level:string}[];
 const [placements,...assessments]=await Promise.all([
  rpc('get_student_expedition_placements_secure',{p_student_id:studentId}),
  ...EXPEDITION_REALMS.map(realm=>rpc('get_student_realm_assessments_secure',{p_student_id:studentId,p_realm_id:realm,p_working_level:null})),
 ]);
 return expeditionAccessFromAssessments(studentId,assessments.flat() as ExpeditionAssessment[],[...placements as ExpeditionPlacement[],...levels.map(p=>({...p,student_id:studentId,is_current:true}))]);
}
