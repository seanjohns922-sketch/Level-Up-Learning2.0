import assert from 'node:assert/strict';
import fs from 'node:fs';
import React from 'react';
import {guideInventory,exampleSignature} from './test-support/upper-guide-inventory.mjs';
import {domHarness} from './test-support/react-dom-harness.mjs';
import {level8Question} from '../data/activities/level8/questions.ts';
import {LEVEL7_WORKED_STEPS} from '../data/activities/teaching/level7-working.ts';
import {LEVEL8_TEACHING,level8TeachingGuide} from '../data/activities/level8/teaching/index.ts';
const reviewed=JSON.parse(fs.readFileSync('scripts/fixtures/upper-guide-examples.json','utf8'));
const rows=guideInventory();
assert.equal(rows.length,390);
assert.equal(rows.filter(r=>r.level===7).length,192);
assert.equal(rows.filter(r=>r.level===8).length,198);
assert.deepEqual(Object.keys(reviewed).sort(),rows.map(r=>r.key).sort(),'Every lesson needs an explicit reviewed example');
for(const r of rows){
 assert.equal(reviewed[r.key].title,r.title,`${r.key}: lesson focus changed; review the teaching example`);
 assert.equal(reviewed[r.key].signature,exampleSignature(r.example),`${r.key}: example facts changed; review working and diagrams before updating the fixture`);
 assert(r.idea.trim()&&r.check.trim()&&r.steps.every(s=>s.trim()),`${r.key}: incomplete teaching content`);
}
for(const key of Object.keys(LEVEL7_WORKED_STEPS))assert(rows.some(r=>r.key===`7/${key}`),`Orphaned Level 7 working: ${key}`);
for(const [realm,weeks] of Object.entries(LEVEL8_TEACHING)){
 assert(weeks.every(w=>w.length===3),`${realm}: three authored lessons per week`);
 for(let w=1;w<=weeks.length;w++)for(let l=1;l<=3;l++){
  const g=level8TeachingGuide(realm,w,l);
  if(g.example===weeks[w-1][l-1].example){
   for(const key of ['cave7Visual','measurement8Visual','number8Visual','algebra8Visual','chance8Visual','space8Visual','answerSpec'])assert(!(key in g.example),'Replacement example must not inherit unrelated visual or answer metadata');
  }
 }
}
assert.throws(()=>level8TeachingGuide('number',99,1),/Missing Level 8 teaching guide/);
// Concrete regressions: the reported conversion must actually explain the
// denominator conversion, place value, sign and inverse check.
const decimal=level8TeachingGuide('number',4,1);
assert(decimal.steps.join(' ').includes('40 × 25 = 1000'));
assert(decimal.steps.join(' ').includes('23 × 25 = 575'));
assert(decimal.steps.join(' ').includes('575 thousandths'));
assert(decimal.steps.join(' ').includes('remainder 0'));
assert.equal(-23/40,-0.575);
assert.equal(575/1000,23/40);
assert.equal((2**3)**3,2**9);
assert(level8TeachingGuide('number',3,1).check.includes('3 × 3 × 2 = 18'));
assert.equal(1000/50,20);
assert(level8TeachingGuide('statistics',3,2).example.prompt.includes('1000'));
assert.equal((118**2-82**2)/2,3600);
assert.equal((180-69-63),48);
assert.equal(7*80,560);
let systematicCases=0;
for(let seed=0;seed<1000;seed++){
 const q=level8Question('statistics',3,2,seed*7919+17);
 if(!q.prompt.startsWith('To take a systematic sample'))continue;
 const [size,population]=q.prompt.match(/\d+/g).map(Number);
 assert(Number.isInteger(Number(q.answer)),'Cannot select every fractional name');
 assert.equal(population/size,Number(q.answer));
 assert(q.explanation.includes('random start'));
 systematicCases++;
}
assert(systematicCases>100,'Exercise the repaired systematic-sampling variant');
// These generated examples changed during the Level 8 content audit. Check
// the authored working as well as the question signature: re-pinning a question
// must not silently retain the previous example's calculation or table labels.
const signed=level8TeachingGuide('number',5,1);
assert.equal(Number(signed.example.answer),11-15+5);
assert(signed.steps.join(' ').includes('11 − 15 = −4'));
assert(signed.steps.join(' ').includes('−4 + 5 = 1'));
const distance=level8TeachingGuide('space',8,3);
assert.equal(distance.example.answer,Math.hypot(4-3,3-2).toFixed(2));
assert(distance.steps.join(' ').includes('√2 ≈ 1.41 m'));
const sample=level8TeachingGuide('statistics',1,1);
assert.equal(Number(sample.example.answer),5500/275);
assert(sample.steps.join(' ').includes('275 ÷ 5500 = 1/20'));
assert(sample.steps.join(' ').includes('1 × 20 = 20'));
for(const lesson of [2,3]){
 const table=level8TeachingGuide('chance',4,lesson);
 assert.equal(table.example.cave7Visual.headers[2],'No sibling');
 assert(table.steps.join(' ').includes('No sibling'));
 assert(!table.steps.join(' ').includes('right-handed'));
}
assert.equal(Number(level8TeachingGuide('chance',4,3).example.answer),Number((13/33*100).toFixed(1)));
const venn=level8TeachingGuide('chance',6,1);
assert.equal(venn.example.answer,'Choir only and Band only');
assert(venn.steps.join(' ').includes('Choir only and Band only'));
assert(venn.steps.join(' ').includes('leave it out'));

// Render every guide with real React. Stub decorative/interactive artwork and
// speech playback, but inspect the actual text delivered to speech controls.
const speech=({text,label='Read'})=>React.createElement('button',{'data-speech':text},label);
const empty={__esModule:true,default:()=>null};
const mocks={
 '@/components/ReadAloudBtn':{__esModule:true,default:speech},
 './Investigation':empty,
 './SpaceVisual':empty,
 './NumberVisual':empty,
 './AlgebraVisual':empty,
 './ChanceVisual':empty,
 '@/components/assessment/Year8MeasurementAssessmentVisual':empty,
 '@/components/assessment/Year7MeasurementAssessmentVisual':empty,
 '@/components/lesson/cave7/Cave7Visual':empty,
 './Cave7Visual':empty,
 '@/components/starpath/Space7LessonVisual':empty,
 './Number7LessonLayout.module.css':{default:{}},
 './Measurement7LessonLayout.module.css':{default:{}},
 './Space7LessonLayout.module.css':{default:{}},
 './cave7/Space7LearningLab':empty,
 './Cave7LearningLab':empty,
};
const h=domHarness(mocks);
const components={8:h.load('components/lesson/level8/SkillGuide.tsx').default};
try{
 components.number=h.load('components/lesson/Number7SkillGuide.tsx').default;
 components.measurement=h.load('components/lesson/Measurement7SkillGuide.tsx').default;
 components.space=h.load('components/lesson/Space7SkillGuide.tsx').default;
 components.cave=h.load('components/lesson/cave7/Cave7SkillGuide.tsx').default;
 let continued=0;
 for(const r of rows){
  const Component=r.level===8?components[8]:components[r.realm]??components.cave;
  await h.render(Component,{key:r.key,realm:r.realm,week:r.week,lesson:r.lesson,onContinue:()=>continued++});
  const page=h.document.body.textContent;
  assert(page.includes(r.title),`${r.key}: title missing`);
  const spoken=[...h.document.querySelectorAll('[data-speech]')].map(b=>b.dataset.speech).join(' ');
  if(r.level===8||LEVEL7_WORKED_STEPS[`${r.realm}/${r.week}/${r.lesson}`])for(const step of r.steps)assert(spoken.includes(step),`${r.key}: worked step missing from read-aloud`);
  assert(spoken.includes(r.idea),`${r.key}: key idea missing from read-aloud`);
  assert(spoken.includes(r.check),`${r.key}: check/caution missing from read-aloud`);
  if(r.level===8){
   assert(page.includes('The key idea')&&page.includes('Check and use it again'));

  }
  if((r.level===8||['pattern','statistics','chance'].includes(r.realm))&&r.example.options?.length>1)for(const option of r.example.options)assert(spoken.includes(option),`${r.key}: choice missing from read-aloud`);
  const button=[...h.document.querySelectorAll('button')].find(b=>b.textContent.includes('Let’s practise'));
  await h.click(button);
 }
 assert.equal(continued,390,'All guides still enter practice only through the continuation control');
 console.log(`PASS: ${rows.length} guide examples pinned to reviewed facts; 198 authored Level 8 methods and ${Object.keys(LEVEL7_WORKED_STEPS).length} expanded Level 7 methods; rendered guidance, read-aloud text and continuation checked.`);
}finally{await h.close();}
