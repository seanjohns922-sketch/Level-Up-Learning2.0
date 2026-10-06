import type { AssessmentQuestion } from '@/data/assessments/api';
import type { StudentProgress } from '@/data/progress';
import { analyzeAssessmentResult } from '@/data/assessments/analysis';
import { ASSESSMENT_THRESHOLDS, pretestPathwayForPercent } from '@/lib/assessment-rules';
import { getProgramWeeks, normalizeWeekList } from '@/lib/program-progress';

export function buildLevel7AssessmentPlan(realm:string,form:'pretest'|'posttest',questions:AssessmentQuestion[],answers:Record<string,string>,prev:StudentProgress,studentId:string){
 const profile=analyzeAssessmentResult({questions:questions.map(q=>({...q,correctAnswer:String(q.correctAnswer)})),answers,yearLevel:7,testType:form==='pretest'?'pre':'post',passThreshold:ASSESSMENT_THRESHOLDS.pretestPassPercent,studentId});
 const all=getProgramWeeks(realm,'Year 7'),passed=profile.percentage>=ASSESSMENT_THRESHOLDS.posttestPassPercent;
 const diagnostic=normalizeWeekList(profile.recommendedWeeks,realm,'Year 7');
 const required=form==='pretest'?(passed?[]:pretestPathwayForPercent(profile.percentage)==='full'||!diagnostic.length?all:diagnostic):passed?prev.requiredWeeks??[]:[];
 const optional=form==='pretest'?(passed?all:all.filter(w=>!required.includes(w))):passed?prev.optionalWeeks??[]:all;
 const assigned=form==='pretest'?(required[0]??1):(prev.assignedWeek??1);
 return {profile,passed,required,optional,assigned};
}
