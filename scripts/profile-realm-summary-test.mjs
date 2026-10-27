import assert from 'node:assert/strict';
import { profileRealmSummary } from '../lib/profile-realm-summary.ts';
const row=(realm,year,extra={})=>({realm_id:realm,year,is_current:true,placement_complete:true,status:'ASSIGNED_PROGRAM',completed_lesson_ids:[],quiz_scores:{},...extra});
const old=row('number','Year 4',{is_current:false,quiz_scores:{1:{percent:100}}});
const current=row('number','Year 7',{completed_lesson_ids:['y7-w1-l1']});
assert.equal(profileRealmSummary('number',[old,current]).year,'Year 7');
assert.equal(profileRealmSummary('number',[old,current]).completedLessons,1);
assert.equal(profileRealmSummary('number',[old,current]).percent,0);
// Level 7 opens the expedition only when the Level 7 release switch is on (as on the live site).
const level7Live=process.env.NEXT_PUBLIC_LEVEL7_LIVE==='true';
assert.equal(profileRealmSummary('number',[old,current]).route,level7Live?'/world/expedition?realm=number':'/number-nexus');
for (const [realm,weeks] of Object.entries({number:12,measurement:12,space:10,pattern:12,statistics:10,chance:8})) {
 const summary=profileRealmSummary(realm,[row(realm,'Year 7',{completed_lesson_ids:[1,2,3].map(l=>`y7-w${weeks}-l${l}`)})]);
 assert.equal(summary.totalWeeks,weeks);assert.equal(summary.weeksCompleted,1);
}
assert.equal(profileRealmSummary('measurement',[current,row('measurement','Year 6',{quiz_scores:{1:{percent:60,attempts:[{percent:80}]}}})]).percent,13);
assert.equal(profileRealmSummary('number',[old]),null);
assert.equal(profileRealmSummary('number',[row('number','Prep')]).year,'Prep');
// Week-by-week detail for the realm panel: lessons done, best quiz, done flag, and the level's tests.
const detailed=profileRealmSummary('measurement',[row('measurement','Year 6',{
 completed_lesson_ids:['m6-w1-l1','m6-w1-l2','m6-w1-l3','m6-w2-l1'],
 quiz_scores:{1:{percent:70,attempts:[{percent:90}]}},
 assessment_attempts:[{workingLevel:'Year 6',assessmentType:'pretest',completedAt:'2026-10-14T01:00:00Z',passed:false},{workingLevel:'Year 5',assessmentType:'posttest',completedAt:'2026-09-01T01:00:00Z',passed:true}],
})]);
assert.deepEqual(detailed.weeks[0],{week:1,lessonsDone:3,quizBest:90,done:true});
assert.deepEqual(detailed.weeks[1],{week:2,lessonsDone:1,quizBest:null,done:false});
assert.equal(detailed.weeks.length,detailed.totalWeeks);
assert.deepEqual(detailed.pretest,{completedAt:'2026-10-14T01:00:00Z'});
assert.equal(detailed.posttest,null,'another level\'s post-test does not count');
assert.equal(detailed.levelPassed,false);
assert.equal(profileRealmSummary('number',[row('number','Year 5',{status:'PASSED'})]).levelPassed,true);
console.log('Profile summaries: current levels, independent realm progress, best quiz, final week and expedition routes and week detail passed.');
