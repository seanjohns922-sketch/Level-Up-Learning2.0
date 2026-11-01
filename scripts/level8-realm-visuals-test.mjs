import assert from 'node:assert/strict';
import fs from 'node:fs';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {domHarness} from './test-support/react-dom-harness.mjs';
import {auditRealms,realmInventory} from './test-support/level8-realm-inventory.mjs';
import {random} from '../data/activities/level8/shared.ts';
import {level8TeachingGuide} from '../data/activities/level8/teaching/index.ts';
import {LEVEL8_CURRICULUM} from '../data/activities/level8/curriculum.ts';
const reviewed=JSON.parse(fs.readFileSync('scripts/fixtures/level8-realm-visual-review.json','utf8'));
const speech=({text,label})=>React.createElement('button',{'data-speech':text},label);
const css={__esModule:true,default:new Proxy({}, {get:(_,key)=>String(key)})};
const h=domHarness({'@/components/ReadAloudBtn':{__esModule:true,default:speech},'@/components/demo/GroundStarpathRedesign.module.css':css,'./Level8StarpathAssessmentCard.module.css':css});
const renderers={};
for(const [key,file]of Object.entries({numberVisual:'lesson/level8/NumberVisual',algebraVisual:'lesson/level8/AlgebraVisual',chanceVisual:'lesson/level8/ChanceVisual',spaceVisual:'lesson/level8/SpaceVisual',measurementVisual:'assessment/Year8MeasurementAssessmentVisual',visual:'lesson/cave7/Cave7Visual'}))renderers[key]=h.load(`components/${file}.tsx`).default;
const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const gallery=[],rows=[],ids=[];let checks=0,forms=0,visualForms=0,guides=0;
function visuals(q){return Object.entries(renderers).filter(([key])=>q[key]);}
function render(q,realm,id){return visuals(q).map(([key,Component])=>{
 const html=renderToStaticMarkup(React.createElement(Component,{visual:q[key],realm}));
 assert(!/NaN|Infinity|undefined/.test(html),`${id}: invalid rendered ${key}`);
 assert(/<svg|<table|<figure|<div/.test(html),`${id}: missing rendered ${key}`);
 assert(/data-speech="[^\"]+"/.test(html),`${id}: missing read-aloud for ${key}`);
 return html;
}).join('');}
function geometry(q,id){for(const p of q.spaceVisual?.polygons??[]){
 const pts=p.points;assert(pts.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)),`${id}: finite vertices`);
 p.angles?.forEach((label,j)=>{if(!/^\d+(\.\d+)?°$/.test(label))return;
  const a=pts[(j+pts.length-1)%pts.length],b=pts[j],c=pts[(j+1)%pts.length];
  const dot=((a.x-b.x)*(c.x-b.x)+(a.y-b.y)*(c.y-b.y))/(Math.hypot(a.x-b.x,a.y-b.y)*Math.hypot(c.x-b.x,c.y-b.y));
  const actual=Math.acos(Math.max(-1,Math.min(1,dot)))*180/Math.PI;
  assert(Math.abs(actual-parseFloat(label))<1.1,`${id}: angle ${label} drawn as ${actual}`);
 });
}}
try{
 for(const realm of auditRealms){const inventory=realmInventory(h,realm);assert.equal(inventory.lessons.length,LEVEL8_CURRICULUM[realm].length*3);
  for(const {id,run}of inventory.forms){ids.push(id);forms++;assert(reviewed[id],`${id}: unreviewed form`);
   let any=false;
   for(let seed=0;seed<40;seed++){
    const q=run(random(seed*104729+7919));const has=visuals(q).length>0;any||=has;
    if(reviewed[id].visualRequired)assert(has,`${id}: required diagram missing at seed ${seed}`);
    else assert(reviewed[id].reason,`${id}: text-only exception needs a reason`);
    geometry(q,id);const html=render(q,realm,id);checks++;
    if(seed===0&&has)gallery.push(`<article data-id="${id}"><h2>${id}</h2><p>${escape(q.prompt)}</p>${html}</article>`);
   }
   if(any)visualForms++;
  }
  for(let i=0;i<inventory.lessons.length;i++){
   const week=Math.floor(i/3)+1,lesson=i%3+1,example=level8TeachingGuide(realm,week,lesson).example;
   const q={prompt:example.prompt,visual:example.cave7Visual,numberVisual:example.number8Visual,algebraVisual:example.algebra8Visual,chanceVisual:example.chance8Visual,spaceVisual:example.space8Visual,measurementVisual:example.measurement8Visual};
   const html=render(q,realm,`${realm}/${week}/${lesson}/guide`);geometry(q,`${realm}/${week}/${lesson}/guide`);guides++;
   if(html)gallery.push(`<article data-id="${realm}/${week}/${lesson}/guide"><h2>${realm} W${week} L${lesson}: teaching example</h2><p>${escape(q.prompt)}</p>${html}</article>`);
   rows.push(`| ${realm} | ${week} | ${lesson} | ${LEVEL8_CURRICULUM[realm][week-1].lessons[lesson-1].title} | ${inventory.lessons[i].filter(f=>reviewed[f.id].visualRequired).length}/${inventory.lessons[i].length} | ${html?'Visual':'Text / symbolic'} |`);
  }
 }
 assert.deepEqual(ids.sort(),Object.keys(reviewed).sort(),'Coverage fixture must include every form');
 // Prevent the mismatched random-branch and answer-disclosure defects from returning.
 const space=realmInventory(h,'space').forms;
 for(let seed=0;seed<80;seed++){
  const get=id=>space.find(f=>f.id===`space/${id}`).run(random(seed*7919+11));
  for(const id of ['w1l2/4','w3l1/4'])assert.deepEqual(get(id).spaceVisual.polygons[1].angles,['?°','','']);
  const congruent=get('w4l2/2').spaceVisual.polygons;
  const q=get('w4l2/2');assert.equal(congruent[1].sideLabels[0],q.answer==='True'?'3':'6');
  const comparison=get('w1l3/2').spaceVisual.polygons;
  const lengths=comparison.map(p=>p.points.map((v,i)=>Math.hypot(v.x-p.points[(i+1)%4].x,v.y-p.points[(i+1)%4].y)));
  assert(lengths.flat().every(v=>Math.abs(v-lengths[0][0])<1e-8),'Square and rhombus have equal stated side lengths');
 }
 const simulation=realmInventory(h,'chance').forms.find(f=>f.id==='chance/designSimulation/4');
 const models=new Set();
 for(let seed=0;seed<80;seed++){const q=simulation.run(random(seed*7919+11));models.add(q.prompt);assert(q.visual,'Every simulation variant needs its own mapping');assert(!q.chanceVisual,'Do not attach an unrelated coin tree');if(q.prompt.startsWith('A die'))assert.equal(q.visual.rows.filter(row=>row[1]==='Heads').length,q.answer==='Yes'?3:4);}
 assert.equal(models.size,5,'Exercise all simulation descriptions');
 const perimeter=level8TeachingGuide('pattern',1,2);
 assert.equal(perimeter.example.answer,'11x + 4');assert(perimeter.steps.join(' ').includes('5 + 3 + 3'));assert(perimeter.check.includes('11x and 4'));
 if(process.argv.includes('--report')){
  fs.writeFileSync('/tmp/level8-realm-visual-review.html',`<!doctype html><meta charset="utf-8"><title>Level 8 realm visual review</title><link rel="stylesheet" href="/audit.css"><style>body{font:16px system-ui;background:#f3f0e9;color:#172033;margin:20px}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(340px,1fr));gap:20px}article{background:white;border:1px solid #bbb;border-radius:16px;padding:20px;min-width:0}article svg{max-width:100%;height:auto}h2{font-size:18px}p{line-height:1.5}button{font:12px system-ui}figure{margin:0}</style><h1>Level 8: question and teaching diagrams</h1><main>${gallery.join('')}</main>`);
  fs.writeFileSync('docs/level8-other-realms-visual-audit.md',`# Level 8: other realms visual audit\n\n${guides} lessons across Number, Space, Pattern, Statistics and Chance. ${forms} inventoried question forms (including Number/Space review references); ${visualForms} have visual support. Every form was exercised with 40 data sets: ${checks} generated/rendered checks. Text-only forms have an explicit rationale in scripts/fixtures/level8-realm-visual-review.json. Review lessons reuse the listed source forms.\n\nThe checks cover actual diagram rendering, read-aloud text presence, finite coordinates and measured polygon angles. Focused regressions cover hidden angle answers, congruence examples and equal-length square/rhombus comparisons. Teaching examples are separately pinned in the upper-guide fixture; the corrected algebra perimeter has matching authored working. These are source/render checks; audible speech and every production interaction are not covered by this script.\n\n| Realm | Week | Lesson | Topic | Visual forms / all forms | Teaching example |\n| --- | --- | --- | --- | --- | --- |\n${rows.join('\n')}\n\nRun npm run qa:level8-lessons for regressions. Add --report when invoking scripts/level8-realm-visuals-test.mjs with the TypeScript alias loader to regenerate this inventory and /tmp/level8-realm-visual-review.html.\n`);
 }
 console.log(`PASS: ${forms} forms, ${checks} data/render checks, ${guides} teaching examples; ${visualForms} visual forms.`);
}finally{await h.close();}
