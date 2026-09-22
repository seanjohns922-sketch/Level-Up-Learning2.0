import assert from 'node:assert/strict';
import {releasedStarpathQuestions} from '../data/assessments/releases/starpath';
import {getPretestForYearLabel,getPosttestForYearLabel} from '../data/assessments/api';
import {getDiagnosticQuestions} from '../lib/whole-maths-diagnostic-questions';
import {starpathReleaseVisual,initialStarpathResponse,encodeReleasedStarpath,readReleasedStarpath,readyReleasedStarpath,scoreReleasedStarpath} from '../lib/starpath-release-response';
import {isAssessmentAnswerCorrect} from '../data/assessments/analysis';
import {releaseSamples as one} from './audit-starpath-level1-five-forms';
import {releaseSamples as two} from './audit-starpath-level2-five-forms';
import {releaseSamples as three} from './audit-starpath-level3-five-forms';
import {releaseSamples as four} from './audit-starpath-level4-five-forms';
import {sampleAnswer as five} from './audit-starpath-level5-five-forms';
import {sampleAnswer as six} from './audit-starpath-level6-five-forms';
import {sampleAnswer as seven} from './audit-starpath-level7-five-forms';
import {sampleAnswer as eight} from './audit-starpath-level8-five-forms';
import {emptyGroundResponse} from '../lib/starpath-ground-redesign';
const ids=new Set<string>();
for(let level=0;level<=8;level++){
 const year=level?`Year ${level}`:'Prep',total=level>=7?30:20;
 for(const form of ['pretest','posttest','start','mid','end'] as const){
  const questions=releasedStarpathQuestions(year,form);assert.equal(questions.length,total);
  const live=form==='pretest'?getPretestForYearLabel(year,'space'):form==='posttest'?getPosttestForYearLabel(year,'space')!.questions:getDiagnosticQuestions('space',year,'release-test',form,5,3,3,3,3,3,3,8,4,4,4,4,4,1,3,1).map(q=>q.question);
  assert.deepEqual(live.map(q=>q.id).sort(),questions.map(q=>q.id).sort());
  for(const q of questions){
   assert(!ids.has(q.id));ids.add(q.id);const v=starpathReleaseVisual(q)!;assert(v);let answer:unknown;
   if(v.level===0){const t=v.item.task,a=emptyGroundResponse(t);a.selected=t.correctIds??[];a.reason=t.correctReason??null;
    if(t.mode==='draw')a.points=t.drawShape==='triangle'?[{x:50,y:50},{x:250,y:150},{x:50,y:250}]:[{x:150,y:50},{x:250,y:150},{x:150,y:250},{x:50,y:150}];
    if(t.mode==='compose')a.pieces=[{x:160,y:120,turn:0},{x:160,y:120,turn:2}];
    if(t.mode==='place')a.cell=t.relation==='beside'?3:t.relation==='above'?0:6;answer=a;
   }else if(v.level<=4)answer=([one,two,three,four][v.level-1]).get(v.item.id);
   else switch(v.level){case 5:answer=five(v.item);break;case 6:answer=six(v.item);break;case 7:answer=seven(v.item);break;case 8:answer=eight(v.item);}
   assert(answer,q.id+' sample');const value=encodeReleasedStarpath(q.id,answer);assert.deepEqual(readReleasedStarpath(q.id,value),answer);assert(readyReleasedStarpath(q,value),q.id);assert(isAssessmentAnswerCorrect(q,value),q.id);assert(!scoreReleasedStarpath(q,encodeReleasedStarpath('different-question',answer)));
   assert(!scoreReleasedStarpath(q,encodeReleasedStarpath(q.id,initialStarpathResponse(v))));assert(!readyReleasedStarpath(q,null));
   for(const bad of ['idk','__invalid__',String(q.correctAnswer),encodeReleasedStarpath(q.id,{correct:true})])assert(!isAssessmentAnswerCorrect(q,bad),q.id+' rejects invalid response');
   assert(readyReleasedStarpath(q,'idk'));assert(!readyReleasedStarpath(q,'broken'));
  }
 }
 for(const realm of ['number','measurement'] as const){
  assert.equal(getPretestForYearLabel(year,realm).length,total);assert.equal(getPosttestForYearLabel(year,realm)!.questions.length,total);
  for(const checkpoint of ['start','mid','end'] as const)assert.equal(getDiagnosticQuestions(realm,year,'all-realms',checkpoint,5,3,3,3,3,3,3,8,4,4,4,4,4,1,3,1).length,total);
 }
}
assert.equal(ids.size,1000);
assert(!getDiagnosticQuestions('space','Year 1','legacy').some(q=>q.question.id.endsWith('-v9')));
assert.equal(getDiagnosticQuestions('space','Year 8','legacy').length,0);
console.log('PASS: 1000 released Space items across 45 forms; all correct/blank/malformed/skip responses, student APIs, checkpoint banks, legacy retention, and Number/Measurement P–8 form availability.');
