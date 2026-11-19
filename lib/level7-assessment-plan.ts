import type { AssessmentQuestion } from '@/data/assessments/api';
import type { StudentProgress } from '@/data/progress';
import { analyzeAssessmentResult } from '@/data/assessments/analysis';
import { ASSESSMENT_THRESHOLDS, pretestPathwayForPercent } from '@/lib/assessment-rules';
import { getProgramWeeks, normalizeWeekList } from '@/lib/program-progress';
import { extensionPlanWeeks, type ExtensionRealm } from '@/lib/extension-plan-weeks';

export function buildLevel7AssessmentPlan(realm:string,form:'pretest'|'posttest',questions:AssessmentQuestion[],answers:Record<string,string>,prev:StudentProgress,studentId:string){
 const analysed=analyzeAssessmentResult({questions:questions.map(q=>({...q,correctAnswer:String(q.correctAnswer)})),answers,yearLevel:7,testType:form==='pretest'?'pre':'post',passThreshold:ASSESSMENT_THRESHOLDS.pretestPassPercent,studentId});
 // Level 7 questions carry curriculum codes, not week links: a post-test plan matches missed questions to the weeks that teach them.
 const plan=form==='posttest'&&!analysed.recommendedWeeks.length?extensionPlanWeeks(realm as ExtensionRealm,7,questions,answers):[];
 const profile=plan.length?{...analysed,recommendedWeeks:plan.map(w=>w.week),recommendedLessonTargets:plan.map(w=>({week:w.week,lessons:[w.lesson]}))}:analysed;
 const all=getProgramWeeks(realm,'Year 7'),passed=profile.percentage>=ASSESSMENT_THRESHOLDS.posttestPassPercent;
 const diagnostic=normalizeWeekList(profile.recommendedWeeks,realm,'Year 7');
 const required=form==='pretest'?(passed?[]:pretestPathwayForPercent(profile.percentage)==='full'||!diagnostic.length?all:diagnostic):passed?prev.requiredWeeks??[]:[];
 const optional=form==='pretest'?(passed?all:all.filter(w=>!required.includes(w))):passed?prev.optionalWeeks??[]:all;
 const assigned=form==='pretest'?(required[0]??1):(prev.assignedWeek??1);
 return {profile,passed,required,optional,assigned};
}

export function canStartLevel7Assessment(progress:StudentProgress|null|undefined,form:'pretest'|'posttest'){
 return progress?.year==='Year 7'||(form==='pretest'&&progress?.year==='Year 6'&&progress.status==='PASSED');
}
