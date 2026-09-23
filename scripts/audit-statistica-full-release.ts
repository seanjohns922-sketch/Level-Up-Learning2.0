import assert from 'node:assert/strict';
import {releasedStatisticaQuestions} from '../data/assessments/releases/statistica';
import {getPretestForYearLabel,getPosttestForYearLabel} from '../data/assessments/api';
import {isAssessmentAnswerCorrect} from '../data/assessments/analysis';
import {statisticaReleaseVisual,encodeReleasedStatistica,readReleasedStatistica,readyReleasedStatistica,emptyStatsResponse} from '../lib/statistica-release-response';
import {getDiagnosticQuestions} from '../lib/whole-maths-diagnostic-questions';
import {buildAssessmentQuestionSnapshots} from '../lib/assessment-replay';
import {STATISTICA_FORMS} from '../data/assessments/revisions/level1StatisticaFiveForms';
import {savedStatisticaReleaseVersion,statisticaPostReleaseVersion} from '../lib/statistica-release-version';
const ids=new Set<string>();
for(let level=1;level<=8;level++)for(const form of STATISTICA_FORMS){
 const year=`Year ${level}`,bank=releasedStatisticaQuestions(year,form),total=level>=7?30:20;assert.equal(bank.length,total);assert.equal(new Set(bank.map(q=>q.skillId)).size,total);
 if(form==='pretest')assert.deepEqual(getPretestForYearLabel(year,'statistics'),bank);
 else if(form==='posttest')assert.deepEqual(getPosttestForYearLabel(year,'statistics')?.questions,bank);
 else assert.deepEqual(new Set(getDiagnosticQuestions('statistics',year,'fixture',form,5,3,3,3,3,3,3,8,4,4,4,4,4,1,3,1,1).map(q=>q.question.id)),new Set(bank.map(q=>q.id)));
 for(const q of bank){assert(!ids.has(q.id));ids.add(q.id);const v=statisticaReleaseVisual(q)!;assert(v);const item=v.item;
 const correct={...emptyStatsResponse(item),touched:true,...(item.mode==='leaves'?{leaves:item.leafAnswer}:typeof item.answer==='string'?{choice:item.answer}:{values:item.answer})};
 const encoded=encodeReleasedStatistica(q.id,correct);assert(readyReleasedStatistica(q,encoded));assert(isAssessmentAnswerCorrect(q,encoded),q.id);assert.deepEqual(readReleasedStatistica(q.id,encoded),JSON.parse(JSON.stringify(correct)));
 for(const bad of [null,'idk','__unknown__','broken',String(q.correctAnswer),encodeReleasedStatistica('wrong-question',correct),encodeReleasedStatistica(q.id,{correct:true}),encodeReleasedStatistica(q.id,emptyStatsResponse(item))])assert(!isAssessmentAnswerCorrect(q,bad as string),q.id+' rejects incorrect response');
 assert(readyReleasedStatistica(q,'idk'));assert(!readyReleasedStatistica(q,null));
 const snapshots=buildAssessmentQuestionSnapshots([q],()=>encoded,(qq,a)=>isAssessmentAnswerCorrect({...qq,correctAnswer:String(qq.correctAnswer)},String(a)),'2026-09-23T00:00:00Z');assert.deepEqual(snapshots[0].student_answer,JSON.parse(JSON.stringify(correct)));assert(snapshots[0].correct);assert.equal(snapshots[0].scorer_version,'statistica-release-2026-09-23-v3');
 }
}
assert.equal(ids.size,900);assert.equal(releasedStatisticaQuestions('Prep','pretest').length,0);assert.equal(savedStatisticaReleaseVersion(['old-id']),0);assert.equal(savedStatisticaReleaseVersion(['y1-statistica-pretest-01-v3']),1);assert.equal(statisticaPostReleaseVersion('Year 1',[]),1);
const baseline={id:'baseline',realmId:'statistics',workingLevel:'Year 1',assessmentType:'pretest',completedAt:'2026-09-23T01:00:00Z',placementResult:{assessment_evidence:{comparison_group:'legacy'}}} as unknown as Parameters<typeof statisticaPostReleaseVersion>[1][number];
assert.equal(statisticaPostReleaseVersion('Year 1',[baseline]),0);
assert.equal(statisticaPostReleaseVersion('Year 1',[{...baseline,placementResult:{assessment_evidence:{comparison_group:'statistica-Year 1-2026-09-23-v3'}}}]),1);
assert.equal(statisticaPostReleaseVersion('Year 1',[baseline],['y1-statistica-posttest-01-v3']),1);
assert(!getDiagnosticQuestions('statistics','Year 1','legacy').some(q=>statisticaReleaseVisual(q.question)));
console.log('PASS: 900 released Statistica items, 40 forms, live selection, diagnostic pinning, scoring, response replay and legacy selection.');
