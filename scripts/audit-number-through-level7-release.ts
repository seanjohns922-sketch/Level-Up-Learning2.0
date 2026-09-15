import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {getPretestForYearLabel,getPosttestForYearLabel} from '../data/assessments/api';
import {getDiagnosticQuestions} from '../lib/whole-maths-diagnostic-questions';
import {decideDiagnosticPlacement,diagnosticQuestionCount} from '../lib/whole-maths-diagnostic';
import {YEAR3_NUMBER_RELEASED_FORMS as level3} from '../data/assessments/revisions/year3NumberReleasedForms';
import {YEAR7_NUMBER_RELEASED_FORMS as level7} from '../data/assessments/revisions/year7NumberReleasedForms';
import {NUMBER_LEVEL3_FIVE_FORMS as review3} from '../data/assessments/revisions/year3NumberFiveForms';
import {NUMBER_LEVEL7_FIVE_FORMS as review7} from '../data/assessments/revisions/year7NumberFiveForms';
import {savedYear3NumberVersion,year3NumberPostVersion} from '../lib/year3-number-assessment-version';
import {assessmentEvidenceMetadata,comparableAssessmentGrowth} from '../lib/assessment-growth';
import {buildAssessmentQuestionSnapshots} from '../lib/assessment-replay';
import {isAssessmentAnswerCorrect} from '../data/assessments/analysis';
import type {NormalizedAssessmentAttempt} from '../lib/realm-progress-compat';
const forms=['pretest','posttest','start','mid','end'] as const;
for(const [level,banks,review,count] of [[3,level3,review3,20],[7,level7,review7,30]] as const){
 for(const form of forms){
  const bank=banks[form];assert.equal(bank.length,count);
  bank.forEach((q,i)=>{
   assert.equal(q.prompt,review[form][i].prompt);assert.equal(q.correctAnswer,review[form][i].correctAnswer);
   assert.deepEqual(q.visual,review[form][i].visual);assert.deepEqual(q.options,review[form][i].options);
   assert.ok(isAssessmentAnswerCorrect(q,String(q.correctAnswer)),q.id);
   assert.ok(!q.id.includes('review'));
  });
 }
 assert.deepEqual(getPretestForYearLabel(`Year ${level}`).map(q=>q.id),banks.pretest.map(q=>q.id));
 assert.deepEqual(getPosttestForYearLabel(`Year ${level}`)!.questions.map(q=>q.id),banks.posttest.map(q=>q.id));
 for(const checkpoint of ['start','mid','end'] as const){
  const selected=getDiagnosticQuestions('number',`Year ${level}`,'sitting',checkpoint,5,3,3,3,3,3,3,7);
  assert.equal(selected.length,count);assert.deepEqual(selected.map(q=>q.question.id).sort(),banks[checkpoint].map(q=>q.id).sort());
 }
 const attempt=(type:'pretest'|'posttest',percent:number,cycle='cycle-a'):NormalizedAssessmentAttempt=>({id:type,realmId:'number',workingLevel:`Year ${level}`,assessmentType:type,attemptNumber:1,correctCount:count*percent/100,totalQuestions:count,scorePercent:percent,passed:percent>=85,completedAt:type==='pretest'?'2026-09-16T00:00:00Z':'2026-12-16T00:00:00Z',questionResults:[],placementResult:{assessment_evidence:{...assessmentEvidenceMetadata('number',`Year ${level}`,banks[type]).assessment_evidence,learning_cycle_id:cycle}}});
 assert.equal(comparableAssessmentGrowth([attempt('pretest',40),attempt('posttest',90)],'number',`Year ${level}`).change,50);
 assert.equal(comparableAssessmentGrowth([attempt('pretest',40),attempt('posttest',90,'other')],'number',`Year ${level}`).change,null);
 const snapshots=buildAssessmentQuestionSnapshots(banks.posttest,q=>String(q.correctAnswer),(q,a)=>isAssessmentAnswerCorrect({...q,correctAnswer:String(q.correctAnswer)},String(a)),'2026-09-16T00:00:00Z');
 assert.equal(snapshots.length,count);assert.ok(snapshots.every(s=>s.correct));assert.equal(JSON.parse(JSON.stringify(snapshots)).length,count);
}
for(const level of ['Prep','Year 1','Year 2','Year 3','Year 4','Year 5','Year 6']){
 assert.equal(getPretestForYearLabel(level).length,20);assert.equal(getPosttestForYearLabel(level)?.questions.length,20);
}
const old3=getPretestForYearLabel('Year 3','number',2,1,2,2,2,2,2);
assert.equal(savedYear3NumberVersion(old3.map(q=>q.id)),2);assert.equal(savedYear3NumberVersion(level3.pretest.map(q=>q.id)),3);
assert.equal(year3NumberPostVersion([]),2);
assert.equal(year3NumberPostVersion([],old3.map(q=>q.id)),2);
assert.ok(getDiagnosticQuestions('number','Year 3','old').every(q=>q.question.id.endsWith('-v2')));
assert.equal(getDiagnosticQuestions('number','Year 7','old').length,0);
const probe={level:'Year 6',score:18,total:20,percent:90};
assert.equal(decideDiagnosticPlacement('Year 6',[probe],0,6).shouldProbeNext,false);
assert.equal(decideDiagnosticPlacement('Year 6',[probe],0,7).shouldProbeNext,true);
assert.equal(decideDiagnosticPlacement('Year 6',[probe,{level:'Year 7',score:27,total:30,percent:90}],0,7).shouldProbeNext,false);
assert.equal(diagnosticQuestionCount('number','Year 7'),30);assert.equal(diagnosticQuestionCount('space','Year 6'),20);
const sql=readFileSync('supabase/migrations/20260916090000_number_level3_and_level7_release.sql','utf8');
assert.ok(sql.includes('number_maximum_level integer not null default 6'));
assert.ok(sql.includes("p_active_level='Year 7' then 29 else 19"));
assert.ok(sql.includes("v_level=7 then 30 else 20"));
console.log('Number release: Ground–6 20 items, Level 7 30; approved content, five checkpoint banks, historical Level 3 pinning, old diagnostic ceilings, scoring, replay and growth verified.');
