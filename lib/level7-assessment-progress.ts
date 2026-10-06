import type { AssessmentQuestion } from '@/data/assessments/api';
import { buildLevel7AssessmentPlan } from '@/lib/level7-assessment-plan';
import { assessmentEvidenceMetadata } from '@/lib/assessment-growth';
import { LEVEL7_LIVE } from '@/lib/level7-release';
import { getProgramWeeks, getWeekProgress, hasCompletedRequiredWeeks, readProgramStore } from '@/lib/program-progress';
import { restoreStudentStateFromServer, saveRealmAssessment, type StudentProgressRealmId } from '@/lib/student-progress-sync';

/** Use the same canonical programme and completion rules as the earlier levels. */
export async function loadLevel7Assessment(studentId:string,realm:StudentProgressRealmId,form:'pretest'|'posttest') {
 if(!LEVEL7_LIVE)throw new Error('Level 7 is not available yet.');
 const {progress}=await restoreStudentStateFromServer(studentId,realm);
 if(!progress||progress.year!=='Year 7')throw new Error('Open the assessment for your current level.');
 if(form==='posttest'){
  const weeks=getProgramWeeks(realm,'Year 7'),store=readProgramStore();
  const complete=progress.requiredWeeks?.length
   ?hasCompletedRequiredWeeks(store,'Year 7',progress.requiredWeeks,realm,progress.teacherAdvancedWeeks)
   :getWeekProgress(store,'Year 7',weeks.length,realm).lessonsCompleted.filter(Boolean).length===3;
  if(!progress.placementComplete||(!complete&&progress.status!=='PASSED'))throw new Error('Complete your assigned weeks before starting the post-test.');
 }
 return progress;
}

export async function saveLevel7Assessment(studentId:string,realm:StudentProgressRealmId,form:'pretest'|'posttest',completionId:string,questions:AssessmentQuestion[],answers:Record<string,string>,snapshots:unknown[],startedAt:string,completedAt:string){
 const prev=await loadLevel7Assessment(studentId,realm,form);
 const {profile,passed,required,optional,assigned}=buildLevel7AssessmentPlan(realm,form,questions,answers,prev,studentId);
 await saveRealmAssessment(studentId,'Year 7',form,{
  correct_count:profile.score,total_questions:questions.length,score_percent:profile.percentage,passed,
  placement_result:{...profile,...assessmentEvidenceMetadata(realm,'Year 7',questions),replay_metadata:{started_at:startedAt,completed_at:completedAt}},question_results:snapshots,completed_at:completedAt,
 },completionId,{
  ...(form==='pretest'?{pretest_score:profile.percentage}:{}),status:passed?'PASSED':'ASSIGNED_PROGRAM',
  placement_complete:form==='posttest'||!passed,current_week:assigned,assigned_week:assigned,
  required_weeks:required,optional_weeks:optional,unlocked_legends:prev.unlockedLegends??[],
  next_working_level:form==='pretest'&&passed?'Year 8':null,
 },realm);
 await restoreStudentStateFromServer(studentId,realm);
}
