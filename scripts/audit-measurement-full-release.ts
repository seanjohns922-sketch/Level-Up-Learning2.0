import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {getPretestForYearLabel,getPosttestForYearLabel} from '../data/assessments/api';
import {getDiagnosticQuestions} from '../lib/whole-maths-diagnostic-questions';
import {isAssessmentAnswerCorrect} from '../data/assessments/analysis';
import {assessmentEvidenceMetadata} from '../lib/assessment-growth';
import {buildAssessmentQuestionSnapshots} from '../lib/assessment-replay';
import {savedYear3MeasurementVersion,year3MeasurementPostVersion} from '../lib/year3-measurement-assessment-version';
import {savedYear4MeasurementVersion,year4MeasurementPostVersion} from '../lib/year4-measurement-assessment-version';
let count=0;
for(let n=0;n<=8;n++){
 const level=n?`Year ${n}`:'Prep',total=n>=7?30:20;
 const pre=getPretestForYearLabel(level,'measurement'),post=getPosttestForYearLabel(level,'measurement')!.questions;
 const banks=[pre,post,...(['start','mid','end'] as const).map(form=>getDiagnosticQuestions('measurement',level,'release',form,5,3,3,3,3,3,3,8,4,4,4,4,4,1).map(x=>x.question))];
 for(const bank of banks){assert.equal(bank.length,total);assert.equal(new Set(bank.map(q=>q.id)).size,total);for(const q of bank){assert.match(q.id,/-v4$/);assert.ok(isAssessmentAnswerCorrect(q,String(q.correctAnswer)),q.id);assert.equal(isAssessmentAnswerCorrect(q,'idk'),false,q.id);count++;}}
 assert.equal(assessmentEvidenceMetadata('measurement',level,pre).assessment_evidence?.comparison_group,assessmentEvidenceMetadata('measurement',level,post).assessment_evidence?.comparison_group);
 assert.ok(assessmentEvidenceMetadata('measurement',level,pre).assessment_evidence?.comparison_group);
 const replay=buildAssessmentQuestionSnapshots(post,q=>q.correctAnswer,(q,a)=>isAssessmentAnswerCorrect({...q,correctAnswer:String(q.correctAnswer)},String(a)),'2026-09-17T00:00:00Z');assert.ok(replay.every(q=>q.correct));assert.deepEqual(replay[0].visual,post[0].visual);
 if(n===3||n===4){
  const legacy=getPretestForYearLabel(level,'measurement',5,3,3,3,3,3,3,4,4,4,4,4,0);
  const saved=n===3?savedYear3MeasurementVersion:savedYear4MeasurementVersion;
  const version=n===3?year3MeasurementPostVersion:year4MeasurementPostVersion;
  assert.equal(saved(legacy.map(q=>q.id)),3);assert.equal(saved(pre.map(q=>q.id)),4);assert.equal(version([],legacy.map(q=>q.id)),3);
  assert.ok(getDiagnosticQuestions('measurement',level,'old').every(q=>q.question.id.endsWith('-v3')));
 }
 if(n>=7)assert.equal(getDiagnosticQuestions('measurement',level,'old').length,0);
}
const postPage=readFileSync('app/posttest/page.tsx','utf8');assert.ok(!postPage.includes('if(progressRealmId === "measurement" && year === "Year 2")'),'All Measurement post versions must resolve outside the Level 2 condition');
const client=readFileSync('lib/whole-maths-diagnostic-client.ts','utf8');assert.ok(client.indexOf('rpc("get_pending_whole_math_diagnostic_measurement_full"')<client.indexOf('rpc("get_pending_whole_math_diagnostic_measurement6"'));
console.log(`Measurement full release: ${count} questions across 45 forms; scoring, replay, matched growth, legacy drafts and pinned checkpoints passed.`);
