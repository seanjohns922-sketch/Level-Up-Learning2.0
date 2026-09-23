import assert from 'node:assert/strict';
import {releasedPatternQuestions} from '../data/assessments/releases/pattern';
import {getPretestForYearLabel,getPosttestForYearLabel} from '../data/assessments/api';
import {isAssessmentAnswerCorrect} from '../data/assessments/analysis';
import {patternReleaseVisual,encodeReleasedPattern,readReleasedPattern,readyReleasedPattern} from '../lib/pattern-release-response';
import {getDiagnosticQuestions} from '../lib/whole-maths-diagnostic-questions';
import {buildAssessmentQuestionSnapshots} from '../lib/assessment-replay';
import {PP_FORMS,PP_OPERATIONS,ppEmpty,ppScore,type PPResponse} from '../data/assessments/revisions/level3PatternPeaksFiveForms';
import {savedPatternReleaseVersion,patternPostReleaseVersion} from '../lib/pattern-release-version';
const ids=new Set<string>();
for(let level=3;level<=8;level++)for(const form of PP_FORMS){
 const year=`Year ${level}`,bank=releasedPatternQuestions(year,form),total=level>=7?30:20;assert.equal(bank.length,total);assert.equal(new Set(bank.map(q=>q.skillId)).size,total);
 if(form==='pretest')assert.deepEqual(getPretestForYearLabel(year,'pattern'),bank);
 else if(form==='posttest')assert.deepEqual(getPosttestForYearLabel(year,'pattern')?.questions,bank);
 else assert.deepEqual(new Set(getDiagnosticQuestions('algebra',year,'fixture',form,5,3,3,3,3,3,3,8,4,4,4,4,4,1,3,1,1,1).map(q=>q.question.id)),new Set(bank.map(q=>q.id)));
 for(const q of bank){assert(!ids.has(q.id));ids.add(q.id);const item=patternReleaseVisual(q)!.item;
 let correct:PPResponse={...ppEmpty(),values:item.answers.map(String),choice:item.correct,tests:[60],points:item.plotPoints,experiments:item.lab?.required};
 if(!ppScore(item,correct)){
  if(item.mode==='algorithm'){for(const a of PP_OPERATIONS)for(const b of PP_OPERATIONS){const r={...correct,operations:[a,b]};if(ppScore(item,r))correct=r;}}
  else{for(let a=1;a<=200;a++)for(let b=1;b<=200;b++){const r={...correct,values:[String(a),String(b)]};if(ppScore(item,r)){correct=r;break;}}}
 }
 assert(ppScore(item,correct),item.id);
 const encoded=encodeReleasedPattern(q.id,correct);assert(readyReleasedPattern(q,encoded));assert(isAssessmentAnswerCorrect(q,encoded),q.id);assert.deepEqual(readReleasedPattern(q.id,encoded),JSON.parse(JSON.stringify(correct)));
 for(const bad of [null,'idk','__unknown__','broken','structured',encodeReleasedPattern('wrong-question',correct),encodeReleasedPattern(q.id,{correct:true}),encodeReleasedPattern(q.id,ppEmpty())])assert(!isAssessmentAnswerCorrect(q,bad as string),q.id+' rejects invalid response');
 assert(readyReleasedPattern(q,'idk'));assert(!readyReleasedPattern(q,null));
 const snapshots=buildAssessmentQuestionSnapshots([q],()=>encoded,(qq,a)=>isAssessmentAnswerCorrect({...qq,correctAnswer:String(qq.correctAnswer)},String(a)),'2026-09-23T00:00:00Z');assert.deepEqual(snapshots[0].student_answer,JSON.parse(JSON.stringify(correct)));assert(snapshots[0].correct);assert.equal(snapshots[0].scorer_version,'pattern-release-2026-09-23-v1');
 }
}
assert.equal(ids.size,700);assert.equal(releasedPatternQuestions('Year 2','pretest').length,0);assert.equal(savedPatternReleaseVersion(['old-id']),0);assert.equal(savedPatternReleaseVersion(['y3-pattern-pretest-01-v1']),1);assert.equal(patternPostReleaseVersion('Year 3',[]),1);
assert(!getDiagnosticQuestions('algebra','Year 3','legacy').some(q=>patternReleaseVisual(q.question)));
const baseline={id:'old',realmId:'pattern',workingLevel:'Year 3',assessmentType:'pretest',completedAt:'2026-09-23T01:00:00Z',placementResult:{assessment_evidence:{comparison_group:'legacy'}}} as unknown as Parameters<typeof patternPostReleaseVersion>[1][number];
assert.equal(patternPostReleaseVersion('Year 3',[baseline]),0);
assert.equal(patternPostReleaseVersion('Year 3',[{...baseline,placementResult:{assessment_evidence:{comparison_group:'pattern-Year 3-2026-09-23-v1'}}}]),1);
assert.equal(patternPostReleaseVersion('Year 3',[baseline],['y3-pattern-posttest-01-v1']),1);
console.log('PASS: 700 released items, 30 forms, live selectors, diagnostics, scoring, structured replay, invalid response rejection and legacy selection.');
