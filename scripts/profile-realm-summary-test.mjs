import assert from 'node:assert/strict';
import { profileRealmSummary } from '../lib/profile-realm-summary.ts';
const row=(realm,year,extra={})=>({realm_id:realm,year,is_current:true,placement_complete:true,status:'ASSIGNED_PROGRAM',completed_lesson_ids:[],quiz_scores:{},...extra});
const old=row('number','Year 4',{is_current:false,quiz_scores:{1:{percent:100}}});
const current=row('number','Year 7',{completed_lesson_ids:['y7-w1-l1']});
assert.equal(profileRealmSummary('number',[old,current]).year,'Year 7');
assert.equal(profileRealmSummary('number',[old,current]).completedLessons,1);
assert.equal(profileRealmSummary('number',[old,current]).percent,0);
assert.equal(profileRealmSummary('number',[old,current]).route,'/world/expedition?realm=number');
for (const [realm,weeks] of Object.entries({number:12,measurement:12,space:10,pattern:12,statistics:10,chance:8})) {
 const summary=profileRealmSummary(realm,[row(realm,'Year 7',{completed_lesson_ids:[1,2,3].map(l=>`y7-w${weeks}-l${l}`)})]);
 assert.equal(summary.totalWeeks,weeks);assert.equal(summary.weeksCompleted,1);
}
assert.equal(profileRealmSummary('measurement',[current,row('measurement','Year 6',{quiz_scores:{1:{percent:60,attempts:[{percent:80}]}}})]).percent,13);
assert.equal(profileRealmSummary('number',[old]),null);
assert.equal(profileRealmSummary('number',[row('number','Prep')]).year,'Prep');
console.log('Profile summaries: current levels, independent realm progress, best quiz, final week and expedition routes passed.');
