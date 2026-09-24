import assert from 'node:assert/strict';
import {releasedChanceQuestions} from '../data/assessments/releases/chance';
import {getPretestForYearLabel,getPosttestForYearLabel} from '../data/assessments/api';
import {isAssessmentAnswerCorrect} from '../data/assessments/analysis';
import {chanceReleaseVisual,encodeReleasedChance,readReleasedChance,readyReleasedChance} from '../lib/chance-release-response';
import {getDiagnosticQuestions} from '../lib/whole-maths-diagnostic-questions';
import {buildAssessmentQuestionSnapshots} from '../lib/assessment-replay';
import {CH_FORMS,chEmpty,chScore,chOutcome,type CHResponse} from '../data/assessments/revisions/level3ChanceHollowFiveForms';
import {savedChanceReleaseVersion,chancePostReleaseVersion} from '../lib/chance-release-version';
const ids=new Set<string>();
for(let level=3;level<=8;level++)for(const form of CH_FORMS){
 const year=`Year ${level}`,bank=releasedChanceQuestions(year,form),total=level>=7?30:20;assert.equal(bank.length,total);assert.equal(new Set(bank.map(q=>q.skillId)).size,total);
 if(form==='pretest')assert.deepEqual(getPretestForYearLabel(year,'chance'),bank);
 else if(form==='posttest')assert.deepEqual(getPosttestForYearLabel(year,'chance')?.questions,bank);
 else assert.deepEqual(new Set(getDiagnosticQuestions('probability',year,'fixture',form,5,3,3,3,3,3,3,8,4,4,4,4,4,1,3,1,1,1,1).map(q=>q.question.id)),new Set(bank.map(q=>q.id)));
 for(const q of bank){assert(!ids.has(q.id));ids.add(q.id);const item=chanceReleaseVisual(q)!.item;
 const trials=item.mode==='experiment'?Array.from({length:item.target!},(_,i)=>chOutcome(item,((i*73)%1000)/1000,((i*317+37)%1000)/1000)):item.trials??[];
 const correct:CHResponse={...chEmpty(),choice:item.correct,trials,values:item.mode==='complete'?item.completion!.map(f=>f.answer):(item.outcomes??[]).map(o=>String(trials.filter(t=>t===o).length))};
 assert(chScore(item,correct),item.id);
 const encoded=encodeReleasedChance(q.id,correct);assert(readyReleasedChance(q,encoded));assert(isAssessmentAnswerCorrect(q,encoded),q.id);assert.deepEqual(readReleasedChance(q.id,encoded),JSON.parse(JSON.stringify(correct)));
 for(const bad of [null,'idk','__unknown__','broken','structured',encodeReleasedChance('wrong-question',correct),encodeReleasedChance(q.id,{correct:true}),encodeReleasedChance(q.id,chEmpty())])assert(!isAssessmentAnswerCorrect(q,bad as string),q.id+' rejects invalid response');
 assert(readyReleasedChance(q,'idk'));assert(!readyReleasedChance(q,null));
 const snapshots=buildAssessmentQuestionSnapshots([q],()=>encoded,(qq,a)=>isAssessmentAnswerCorrect({...qq,correctAnswer:String(qq.correctAnswer)},String(a)),'2026-09-24T00:00:00Z');assert.deepEqual(snapshots[0].student_answer,JSON.parse(JSON.stringify(correct)));assert(snapshots[0].correct);assert.equal(snapshots[0].scorer_version,'chance-release-2026-09-24-v1');
 }
}
assert.equal(ids.size,700);assert.equal(releasedChanceQuestions('Year 2','pretest').length,0);assert.equal(savedChanceReleaseVersion(['old-id']),0);assert.equal(savedChanceReleaseVersion(['y3-chance-pretest-01-v1']),1);assert.equal(chancePostReleaseVersion('Year 3',[]),1);
assert(!getDiagnosticQuestions('probability','Year 3','legacy').some(q=>chanceReleaseVisual(q.question)));
const baseline={id:'old',realmId:'chance',workingLevel:'Year 3',assessmentType:'pretest',completedAt:'2026-09-24T01:00:00Z',placementResult:{assessment_evidence:{comparison_group:'legacy'}}} as unknown as Parameters<typeof chancePostReleaseVersion>[1][number];
assert.equal(chancePostReleaseVersion('Year 3',[baseline]),0);
assert.equal(chancePostReleaseVersion('Year 3',[{...baseline,placementResult:{assessment_evidence:{comparison_group:'chance-Year 3-2026-09-24-v1'}}}]),1);
assert.equal(chancePostReleaseVersion('Year 3',[baseline],['y3-chance-posttest-01-v1']),1);
console.log('PASS: 700 released items, 30 forms, live selectors, diagnostics, scoring, structured replay, invalid response rejection and legacy selection.');
