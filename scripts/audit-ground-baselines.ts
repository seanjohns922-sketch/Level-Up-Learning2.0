import {GROUND_MEASURELANDS_INDEPENDENT_PRETEST_ITEMS} from "../data/assessments/groundMeasurelandsIndependentPosttest";
import {getMeasurelandsFormStandard,validateIndependentMeasurelandsForm} from "../data/assessments/measurelandsAssessmentArchitecture";
import assert from 'node:assert/strict';
import {getPretestForYearLabel,getPosttestForYearLabel} from '../data/assessments/api';
import {getPretestForYear} from '../data/assessments/pretests';
import {isAssessmentAnswerCorrect,analyzeAssessmentResult} from '../data/assessments/analysis';
import {isGroundBaseline,assessmentEvidenceMetadata,comparableAssessmentGrowth} from '../lib/assessment-growth';
import {resolveRealmEntryRoute} from '../lib/realm-entry';
import {resolveStudentDestination,buildDefaultStudentProgress} from '../lib/student-destination';
import type {IndependentAssessmentItem} from '../data/assessments/assessmentItemStandard';
import type {NormalizedAssessmentAttempt} from '../lib/realm-progress-compat';
let count=0;
for (const realm of ['number','measurement'] as const) {
 const pre=getPretestForYearLabel('Prep',realm),post=getPosttestForYearLabel('Prep',realm)!.questions;
 assert.equal(pre.length,20);assert.equal(post.length,20);
 assert.deepEqual(getPretestForYearLabel('Foundation',realm).map(q=>q.id),pre.map(q=>q.id));
 assert.equal(new Set([...pre,...post].map(q=>q.id)).size,40);
 for(let i=0;i<20;i++) {
  count++;
  const q=pre[i]!,p=post[i]!;
  const meta=q as unknown as IndependentAssessmentItem,other=p as unknown as IndependentAssessmentItem;
  assert.equal(meta.form,'pretest');assert.equal(meta.sourcePool,'pretest');
  for(const key of ['primaryDescriptorCode','cognitiveCategory','difficulty','responseMode'] as const)assert.deepEqual(meta[key],other[key],q.id+' matched intended demand');
  assert.notEqual(meta.contextKey,other.contextKey);
  assert.ok(q.prompt?.trim());
  assert.ok(isAssessmentAnswerCorrect(q,q.correctAnswer!),q.id+' answer grades correctly');
  assert.ok(!isAssessmentAnswerCorrect(q,'__incorrect__'),q.id+' incorrect response rejected');
  if(q.type==='mcq')assert.equal(q.options!.filter(o=>o===q.correctAnswer).length,1,q.id+' one correct option');
 }
 const profile=analyzeAssessmentResult({questions:pre,answers:Object.fromEntries(pre.map(q=>[q.id,q.correctAnswer!])),yearLevel:0,testType:'pre',passThreshold:85});
 assert.equal(profile.percentage,100);
 assert.ok(isGroundBaseline(realm,'Prep'));assert.ok(!isGroundBaseline(realm,'Year 1'));
 assert.equal(resolveRealmEntryRoute({realmId:realm,progress:null,fallbackYear:'Prep',introSeen:true}),`/pretest?year=Prep&realm_id=${realm}`);
 assert.equal(resolveRealmEntryRoute({realmId:realm,progress:{...buildDefaultStudentProgress('Prep'),placementComplete:true,assignedWeek:5},fallbackYear:'Prep',introSeen:true}),realm==='number'?'/number-nexus':'/measurelands');
 const make=(id:string,type:'pretest'|'posttest',completedAt:string,scorePercent:number,version='current'):NormalizedAssessmentAttempt=>({id,realmId:realm,workingLevel:'Prep',assessmentType:type,completedAt,scorePercent,attemptNumber:1,correctCount:scorePercent/5,totalQuestions:20,passed:false,questionResults:[],placementResult:version==='current'?assessmentEvidenceMetadata(realm,'Prep',pre):{assessment_evidence:{comparison_group:version}}});
 const history=[make('first','pretest','2026-01-01',40),make('repeat','pretest','2026-02-01',70),make('post','posttest','2026-03-26',90)];
 assert.equal(comparableAssessmentGrowth(history,realm,'Prep').change,50);
 assert.equal(comparableAssessmentGrowth(history,realm,'Prep').days,84);
 assert.equal(comparableAssessmentGrowth([history[0]!,make('old','posttest','2025-12-01',90)],realm,'Prep').post,null);
 assert.equal(comparableAssessmentGrowth([history[0]!,make('changed','posttest','2026-03-26',90,'different-bank')],realm,'Prep').change,null);
 assert.equal(comparableAssessmentGrowth([history[2]!],realm,'Prep').baseline,null);
 assert.ok(assessmentEvidenceMetadata(realm,'Year 1',getPretestForYearLabel('Year 1',realm)).assessment_evidence?.comparison_group);
}
assert.equal(getPretestForYear('Prep').length,20,'Legacy Number resolver uses canonical baseline');
assert.equal(resolveStudentDestination({progress:buildDefaultStudentProgress('Prep'),introSeen:true}),'/realms');
assert.equal(buildDefaultStudentProgress('Prep').placementComplete,false);
// Derive Number answers independently from the visual models, rather than mirroring stored answers.
for (const q of getPretestForYearLabel('Prep','number')) {
 const v=q.visual as Record<string,unknown>;
 if(q.type==='numeric') {
  let expected:number|undefined;
  if(v.type==='number_ground_collection')expected=Number(v.count);
  if(v.type==='number_ground_part_whole')expected=v.whole===null?(v.parts as number[]).reduce((a,b)=>a+b,0):Number(v.whole)-(v.parts as (number|null)[]).reduce<number>((a,b)=>a+(b??0),0);
  if(v.type==='number_ground_change')expected=Number(v.start)+(v.action==='add'?1:-1)*Number(v.change);
  if(v.type==='number_ground_groups')expected=v.distribution?(v.distribution as number[]).length:Number(v.total)/Number(v.bins);
  if(v.type==='number_ground_path'){const vals=v.values as (number|null)[];const i=vals.indexOf(null);expected=Number(vals[i-1])+1;}
  assert.equal(Number(q.correctAnswer),expected,q.id+' independently computed mathematics');
 }
}
console.log(`Ground baselines passed: ${count} new items, 40 existing post items, scoring, matched demand, all resolvers, entry, history, versions and chronological growth.`);

assert.deepEqual(validateIndependentMeasurelandsForm(getMeasurelandsFormStandard(0,"pretest")!,GROUND_MEASURELANDS_INDEPENDENT_PRETEST_ITEMS),[]);
