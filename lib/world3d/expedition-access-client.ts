'use client';
import {supabase} from '@/lib/supabase';
import {EXPEDITION_REALMS,expeditionAccessFromAssessments,type ExpeditionAssessment} from './expedition-access';
export async function fetchExpeditionAccess(studentId:string){
 const results=await Promise.all(EXPEDITION_REALMS.map(async realm=>{
  const {data,error}=await supabase.rpc('get_student_realm_assessments_secure',{p_student_id:studentId,p_realm_id:realm,p_working_level:null});
  if(error)throw error;
  return (data??[]) as ExpeditionAssessment[];
 }));
 return expeditionAccessFromAssessments(studentId,results.flat());
}
