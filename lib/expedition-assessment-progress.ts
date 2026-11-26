import type { AssessmentQuestion } from '@/data/assessments/api';
import { buildExpeditionAssessmentPlan, canStartExpeditionAssessment, type ExpeditionLevel } from '@/lib/expedition-assessment-plan';
import { assessmentEvidenceMetadata } from '@/lib/assessment-growth';
import { LEVEL7_LIVE } from '@/lib/level7-release';
import { LEVEL8_LIVE } from '@/lib/level8-release';
import { getProgramWeeks, getWeekProgress, hasCompletedRequiredWeeks, readProgramStore } from '@/lib/program-progress';
import { restoreStudentStateFromServer, saveRealmAssessment, type StudentProgressRealmId } from '@/lib/student-progress-sync';

const LIVE:Record<ExpeditionLevel,boolean>={7:LEVEL7_LIVE,8:LEVEL8_LIVE};

/** Use the same canonical programme and completion rules as the earlier levels. */
export async function loadExpeditionAssessment(level:ExpeditionLevel,studentId:string,realm:StudentProgressRealmId,form:'pretest'|'posttest') {
 if(!LIVE[level])throw new Error(`Level ${level} is not available yet.`);
 const year=`Year ${level}`,{progress}=await restoreStudentStateFromServer(studentId,realm);
 if(!progress||!canStartExpeditionAssessment(level,progress,form))throw new Error('Open the assessment for your current level.');
 if(form==='posttest'){
  const weeks=getProgramWeeks(realm,year),store=readProgramStore();
  const complete=progress.requiredWeeks?.length
   ?hasCompletedRequiredWeeks(store,year,progress.requiredWeeks,realm,progress.teacherAdvancedWeeks)
   :getWeekProgress(store,year,weeks.length,realm).lessonsCompleted.filter(Boolean).length===3;
  if(!progress.placementComplete||(!complete&&progress.status!=='PASSED'))throw new Error('Complete your assigned weeks before starting the post-test.');
 }
 return progress;
}

export async function saveExpeditionAssessment(level:ExpeditionLevel,studentId:string,realm:StudentProgressRealmId,form:'pretest'|'posttest',completionId:string,questions:AssessmentQuestion[],answers:Record<string,string>,snapshots:unknown[],startedAt:string,completedAt:string){
 const year=`Year ${level}`,prev=await loadExpeditionAssessment(level,studentId,realm,form);
 const {profile,passed,required,optional,assigned}=buildExpeditionAssessmentPlan(level,realm,form,questions,answers,prev,studentId);
 await saveRealmAssessment(studentId,year,form,{
  correct_count:profile.score,total_questions:questions.length,score_percent:profile.percentage,passed,
  placement_result:{...profile,...assessmentEvidenceMetadata(realm,year,questions),replay_metadata:{started_at:startedAt,completed_at:completedAt}},question_results:snapshots,completed_at:completedAt,
 },completionId,{
  ...(form==='pretest'?{pretest_score:profile.percentage}:{}),status:passed?'PASSED':'ASSIGNED_PROGRAM',
  placement_complete:form==='posttest'||!passed,current_week:assigned,assigned_week:assigned,
  required_weeks:required,optional_weeks:optional,unlocked_legends:prev.unlockedLegends??[],
  // Passing the Level 7 pre-test moves straight on to Level 8; Level 8 is the top level.
  next_working_level:form==='pretest'&&passed&&level===7?'Year 8':null,
 },realm);
 await restoreStudentStateFromServer(studentId,realm);
}
