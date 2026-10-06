import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildLevel7AssessmentPlan,canStartLevel7Assessment} from '../lib/level7-assessment-plan.ts';
for(const [realm,n] of Object.entries({number:12,measurement:12,space:10,pattern:12,statistics:10,chance:8})){
 const questions=Array.from({length:20},(_,i)=>({id:`q${i}`,correctAnswer:'1',skillId:`skill${i}`,linkedWeeks:[i% n+1]}));
 const prev={year:'Year 7',status:'ASSIGNED_PROGRAM',placementComplete:true,assignedWeek:n,requiredWeeks:Array.from({length:n},(_,i)=>i+1),optionalWeeks:[],unlockedLegends:[]};
 const run=(score,form='pretest')=>buildLevel7AssessmentPlan(realm,form,questions,Object.fromEntries(questions.map((q,i)=>[q.id,i<score?'1':'0'])),prev,'fixture');
 assert.deepEqual(run(9).required,prev.requiredWeeks);
 assert.equal(run(9).assigned,1);
 assert.equal(run(10).passed,false);
 assert.ok(run(10).required.every(w=>w>=1&&w<=n));
 assert.equal(run(16).passed,false);
 assert.equal(run(17).passed,true);
 assert.deepEqual(run(17).required,[]);
 assert.deepEqual(run(17).optional,prev.requiredWeeks);
 assert.deepEqual(run(16,'posttest').optional,prev.requiredWeeks);
 assert.deepEqual(run(17,'posttest').required,prev.requiredWeeks);
}
for(const name of ['Number','Measurement','Space','Pattern','Statistics','Chance']){
 const source=fs.readFileSync(`components/assessment/${name}ExtensionAssessment.tsx`,'utf8');
 assert.match(source,/if\(level===7\)await loadLevel7Assessment/);
 assert.match(source,/if\(level===7\)await saveLevel7Assessment/);
}
console.log('PASS all six Level 7 assessment plans: full/targeted/pass thresholds, failed post-test practice, canonical save integration.');

assert.match(fs.readFileSync('app/program/page.tsx','utf8'), /if \(!legacyProgramMode && !isExpeditionWeek\)/, 'Live cavern week links must render without the old legacy query parameter');

assert.match(fs.readFileSync('components/world3d/ShatteredRealmCavern.tsx','utf8'), /if\(p\?\.year!=='Year 7'\|\|!p.placementComplete\)/, 'Never use another level’s week state for Level 7 cavern doors');

assert.equal(canStartLevel7Assessment({year:'Year 6',status:'PASSED'},'pretest'),true);
assert.equal(canStartLevel7Assessment({year:'Year 6',status:'ASSIGNED_PROGRAM'},'pretest'),false);
assert.equal(canStartLevel7Assessment({year:'Year 6',status:'PASSED'},'posttest'),false);
assert.equal(canStartLevel7Assessment({year:'Year 7',status:'ASSIGNED_PROGRAM'},'pretest'),true);
assert.equal(canStartLevel7Assessment(null,'pretest'),false);
