import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildExpeditionAssessmentPlan,canStartExpeditionAssessment} from '../lib/expedition-assessment-plan.ts';
const LENGTHS={
 7:{number:12,measurement:12,space:10,pattern:12,statistics:10,chance:8},
 8:{number:12,measurement:12,space:10,pattern:12,statistics:10,chance:10},
};
for(const level of [7,8])for(const [realm,n] of Object.entries(LENGTHS[level])){
 const questions=Array.from({length:20},(_,i)=>({id:`q${i}`,correctAnswer:'1',skillId:`skill${i}`,linkedWeeks:[i% n+1]}));
 const prev={year:`Year ${level}`,status:'ASSIGNED_PROGRAM',placementComplete:true,assignedWeek:n,requiredWeeks:Array.from({length:n},(_,i)=>i+1),optionalWeeks:[],unlockedLegends:[]};
 const run=(score,form='pretest')=>buildExpeditionAssessmentPlan(level,realm,form,questions,Object.fromEntries(questions.map((q,i)=>[q.id,i<score?'1':'0'])),prev,'fixture');
 assert.deepEqual(run(9).required,prev.requiredWeeks,`${realm} Level ${level}: full pathway assigns all ${n} weeks`);
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
 assert.match(source,/await loadExpeditionAssessment\(level,id,'[a-z]+',form\)/);
 assert.match(source,/await saveExpeditionAssessment\(level,studentId,'[a-z]+',form,/);
 assert.doesNotMatch(source,/_extension_assessment'/,'Levels 7 and 8 save through the canonical programme, not the old evidence-only path');
}
const progress=fs.readFileSync('lib/expedition-assessment-progress.ts','utf8');
assert.match(progress,/next_working_level:form==='pretest'&&passed&&level===7\?'Year 8':null/,'Passing the Level 7 pre-test moves on to Level 8; Level 8 is the top level');
console.log('PASS all six realms at Levels 7 and 8: full/targeted/pass thresholds, failed post-test practice, canonical save integration.');

assert.match(fs.readFileSync('app/program/page.tsx','utf8'), /if \(!legacyProgramMode && !isExpeditionWeek\)/, 'Live cavern week links must render without the old legacy query parameter');

assert.match(fs.readFileSync('components/world3d/ShatteredRealmCavern.tsx','utf8'), /if\(p\?\.year!=='Year 7'\|\|!p.placementComplete\)/, 'Never use another level’s week state for Level 7 cavern doors');

for(const level of [7,8]){
 const below=`Year ${level-1}`,own=`Year ${level}`;
 assert.equal(canStartExpeditionAssessment(level,{year:below,status:'PASSED'},'pretest'),true);
 assert.equal(canStartExpeditionAssessment(level,{year:below,status:'ASSIGNED_PROGRAM'},'pretest'),false);
 assert.equal(canStartExpeditionAssessment(level,{year:below,status:'PASSED'},'posttest'),false);
 assert.equal(canStartExpeditionAssessment(level,{year:own,status:'ASSIGNED_PROGRAM'},'pretest'),true);
 assert.equal(canStartExpeditionAssessment(level,null,'pretest'),false);
}
assert.equal(canStartExpeditionAssessment(8,{year:'Year 6',status:'PASSED'},'pretest'),false,'Level 8 needs Level 7 first');
