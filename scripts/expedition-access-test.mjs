import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
const module={exports:{}};
new Function('module','exports',ts.transpileModule(fs.readFileSync('lib/world3d/expedition-access.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText)(module,module.exports);
const {expeditionAccessFromAssessments:access,EXPEDITION_REALMS}=module.exports;
const result=(overrides={})=>({student_id:'learner',realm_id:'number',working_level:'Year 6',assessment_type:'posttest',correct_count:null,total_questions:null,score_percent:90,passed:true,completed_at:'2026-09-25T00:00:00Z',...overrides});
assert.deepEqual(access('learner',[]),{level7:[],level8:[]});
for(const score of [0,84,84.99])assert.equal(access('learner',[result({score_percent:score})]).level7.length,0);
for(const score of [85,86,100])assert.deepEqual(access('learner',[result({score_percent:score})]).level7,['number']);
assert.deepEqual(access('learner',[result({correct_count:17,total_questions:20,score_percent:85})]).level7,['number']);
assert.equal(access('learner',[result({correct_count:84,total_questions:100,score_percent:85})]).level7.length,0,'Rounded percentage must not override exact counts');
assert.deepEqual(access('learner',[result({correct_count:26,total_questions:30,score_percent:86})]).level7,['number'],'Use exact counts, not rounded percentages');
for(const row of [result({working_level:'Year 5'}),result({assessment_type:'pretest'}),result({student_id:'another-child'}),result({completed_at:null}),result({score_percent:NaN}),result({score_percent:101})])assert.equal(access('learner',[row]).level7.length,0);
assert.deepEqual(access('learner',[result(),result({score_percent:40,passed:false})]).level7,['number'],'Later low attempt must not erase earned access');
assert.deepEqual(access('learner',[result(),result({working_level:'Year 7'}),result({realm_id:'space',working_level:'Year 7'})]),{level7:['number'],level8:['number']});
assert.equal(access('learner',EXPEDITION_REALMS.map(realm_id=>result({realm_id}))).level7.length,6);
console.log('PASS inclusive >=85 threshold, exact counts, historical unlock, identity and assessment filtering, six realms and separate Level 8 eligibility');
for(const realm of EXPEDITION_REALMS){
 const prior=result({realm_id:realm});
 for(const score of [0,84,84.99])assert.equal(access('learner',[prior,result({realm_id:realm,working_level:'Year 7',score_percent:score,passed:true})]).level8.length,0);
 for(const score of [85,86,100])assert.deepEqual(access('learner',[prior,result({realm_id:realm,working_level:'Year 7',score_percent:score,passed:false})]).level8,[realm]);
 assert.equal(access('learner',[prior,result({realm_id:realm,working_level:'Year 7',correct_count:84,total_questions:100,score_percent:85})]).level8.length,0);
}
console.log('PASS Level 8 exact >=85 threshold across all six realms, independent of legacy passed flag');
for(const realm of EXPEDITION_REALMS){
 const placed={student_id:'learner',realm_id:realm,assigned_start_level:'Year 7'};
 assert.deepEqual(access('learner',[],[placed]),{level7:[realm],level8:[]});
 assert.deepEqual(access('learner',[],[{student_id:'learner',realm_id:realm,working_level:'Year 7',is_current:true}]).level7,[realm]);
 assert.deepEqual(access('learner',[result({realm_id:realm,working_level:'Year 7',score_percent:85})],[placed]).level8,[realm]);
 for(const bad of [{...placed,student_id:'other'},{...placed,assigned_start_level:'Year 6'},{...placed,assigned_start_level:'Year 8'},{student_id:'learner',realm_id:realm,working_level:'Year 7',is_current:false}])assert.equal(access('learner',[],[bad]).level7.length,0);
}
console.log('PASS teacher placement and current Level 7 progress, realm isolation, no automatic Level 8 unlock.');
