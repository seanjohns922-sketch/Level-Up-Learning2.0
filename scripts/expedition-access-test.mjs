import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
const module={exports:{}};
const rules={exports:{}};
new Function('module','exports',ts.transpileModule(fs.readFileSync('lib/assessment-rules.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText)(rules,rules.exports);
new Function('require','module','exports',ts.transpileModule(fs.readFileSync('lib/world3d/expedition-access.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText)(n=>{if(n==='@/lib/assessment-rules')return rules.exports;throw Error(n);},module,module.exports);
const {expeditionAccessFromAssessments:access,EXPEDITION_REALMS}=module.exports;
const result=(overrides={})=>({student_id:'learner',realm_id:'number',working_level:'Year 6',assessment_type:'posttest',correct_count:null,total_questions:null,score_percent:90,passed:true,completed_at:'2026-09-25T00:00:00Z',...overrides});
assert.deepEqual(access('learner',[]),{level7:[],level8:[],recovered:[]});
for(const score of [0,84,84.99])assert.equal(access('learner',[result({score_percent:score})]).level7.length,0);
for(const score of [85,86,100])assert.deepEqual(access('learner',[result({score_percent:score})]).level7,['number']);
assert.deepEqual(access('learner',[result({correct_count:17,total_questions:20,score_percent:85})]).level7,['number']);
assert.equal(access('learner',[result({correct_count:84,total_questions:100,score_percent:85})]).level7.length,0,'Rounded percentage must not override exact counts');
assert.deepEqual(access('learner',[result({correct_count:26,total_questions:30,score_percent:86})]).level7,['number'],'Use exact counts, not rounded percentages');
for(const row of [result({working_level:'Year 5'}),result({assessment_type:'pretest'}),result({assessment_type:'diagnostic'}),result({student_id:'another-child'}),result({completed_at:null}),result({score_percent:NaN}),result({score_percent:101})])assert.equal(access('learner',[row]).level7.length,0);
assert.deepEqual(access('learner',[result(),result({score_percent:40,passed:false})]).level7,['number'],'Later low attempt must not erase earned access');
assert.deepEqual(access('learner',[result(),result({working_level:'Year 7'}),result({realm_id:'space',working_level:'Year 7'})]),{level7:['number'],level8:['number'],recovered:[]});
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
 assert.deepEqual(access('learner',[],[placed]),{level7:[realm],level8:[],recovered:[]});
 assert.deepEqual(access('learner',[],[{student_id:'learner',realm_id:realm,working_level:'Year 7',is_current:true}]).level7,[realm]);
 assert.deepEqual(access('learner',[result({realm_id:realm,working_level:'Year 7',score_percent:85})],[placed]).level8,[realm]);
 for(const bad of [{...placed,student_id:'other'},{...placed,assigned_start_level:'Year 6'},{student_id:'learner',realm_id:realm,working_level:'Year 7',is_current:false}])assert.equal(access('learner',[],[bad]).level7.length,0);
}
console.log('PASS teacher placement and current Level 7 progress, realm isolation, no automatic Level 8 unlock.');
for(const realm of EXPEDITION_REALMS){
 // A Level 8 placement (teacher, parent, diagnostic, or passing the Level 7 pre-test) opens the trail and the stronghold.
 for(const placed of [{student_id:'learner',realm_id:realm,assigned_start_level:'Year 8'},{student_id:'learner',realm_id:realm,working_level:'Year 8',is_current:true}])
  assert.deepEqual(access('learner',[],[placed]),{level7:[realm],level8:[realm],recovered:[]});
 assert.deepEqual(access('learner',[],[{student_id:'learner',realm_id:realm,working_level:'Year 8',is_current:false}]),{level7:[],level8:[],recovered:[]});
 assert.deepEqual(access('learner',[],[{student_id:'other',realm_id:realm,assigned_start_level:'Year 8'}]),{level7:[],level8:[],recovered:[]});
 // The Core is recovered by 85%+ on the Level 8 post-test (the final battle) or pre-test, and only inside an open stronghold.
 const placed={student_id:'learner',realm_id:realm,assigned_start_level:'Year 8'};
 for(const assessment_type of ['posttest','pretest']){
  for(const score of [0,84,84.99])assert.deepEqual(access('learner',[result({realm_id:realm,working_level:'Year 8',assessment_type,score_percent:score})],[placed]).recovered,[]);
  for(const score of [85,100])assert.deepEqual(access('learner',[result({realm_id:realm,working_level:'Year 8',assessment_type,score_percent:score})],[placed]).recovered,[realm]);
 }
 assert.deepEqual(access('learner',[result({realm_id:realm,working_level:'Year 8',score_percent:90})]).recovered,[],'no stronghold, no recovery');
 assert.deepEqual(access('learner',[result({realm_id:realm,working_level:'Year 7',assessment_type:'pretest',score_percent:95}),result({realm_id:realm})]).level8,[],'a Level 7 pre-test does not open the stronghold by itself');
}
console.log('PASS Level 8 placement opens trail and stronghold; Core recovery needs 85%+ at Level 8 inside an open stronghold.');
