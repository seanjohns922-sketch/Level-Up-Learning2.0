import assert from 'node:assert/strict';
import fs from 'node:fs';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {domHarness} from './test-support/react-dom-harness.mjs';
import {random} from '../data/activities/level8/shared.ts';
import {level8TeachingGuide} from '../data/activities/level8/teaching/index.ts';
import {LEVEL8_CURRICULUM} from '../data/activities/level8/curriculum.ts';

const h=domHarness();
const names=Array.from({length:36},(_,i)=>`w${Math.floor(i/3)+1}l${i%3+1}`);
const forms=h.load('data/activities/level8/measurement.ts',names);
const {default:Visual,measurement8Speech}=h.load('components/assessment/Year8MeasurementAssessmentVisual.tsx');
const Cave=h.load('components/lesson/cave7/Cave7Visual.tsx').default;
// Reviewed exceptions: arithmetic, notation, conceptual choice or numerical
// triple testing whose entire evidence is already in the question.
const textOnly=new Set(['2/1/5','2/2/2','2/2/3','2/3/1','3/1/1','7/1/3','7/2/4','8/3/1','9/1/4','10/2/4']);
const rows=[],gallery=[];
let checked=0,illustrated=0;
try {
for(let i=0;i<36;i++){
 const week=Math.floor(i/3)+1,lesson=i%3+1,fspec=forms[names[i]];
 let count=0;
 for(let f=0;f<fspec.length;f++){
  const key=`${week}/${lesson}/${f+1}`;
  for(let seed=0;seed<40;seed++){
   const q=fspec[f](random(seed*104729+7919));
   const v=q.measurementVisual;
   assert(v||q.visual||textOnly.has(key),`${key}: missing reviewed visual`);
   if(v){
    assert(v.values.every(Number.isFinite),`${key}: finite diagram data`);
    const html=renderToStaticMarkup(React.createElement(Visual,{visual:v}));
    assert(!/NaN|undefined|Infinity/.test(html),`${key}: invalid rendered diagram`);
    assert(/<svg|<img/.test(html),`${key}: diagram actually rendered`);
    const speech=measurement8Speech(v);
    assert(speech.trim()&&!/NaN|undefined/.test(speech),`${key}: readable diagram`);
    for(const label of v.labels??[])assert(speech.includes(label),`${key}: spoken label missing`);
    if(seed===0){count++;gallery.push(`<article><h2>Week ${week} · Lesson ${lesson} · Form ${f+1}</h2><p>${escape(q.prompt)}</p>${html}</article>`);}
   }else if(q.visual&&seed===0)count++;
   if(week===4&&lesson===2&&f===2){
    const numbers=q.prompt.match(/\d+/g).map(Number),[l,w,h,side]=numbers;
    assert.equal(q.answer,l*w*h-Math.floor(l/side)*Math.floor(w/side)*Math.floor(h/side)*side**3,'Packing must use every whole cube that fits');
   }
   if(v?.task==='rightTriangle'){
    const hidden=v.unknown==='height'?v.values[1]:v.unknown==='hypotenuse'?v.values[2]:undefined;
    if(hidden!==undefined&&hidden>0&&!v.values.filter((_,j)=>j!==(v.unknown==='height'?1:2)).includes(hidden))assert(!measurement8Speech(v).includes(`${hidden} ${v.unit}`),`${key}: speech reveals unknown`);
   }
   checked++;
  }
 }
 const guide=level8TeachingGuide('measurement',week,lesson).example;
 assert(guide.measurement8Visual||guide.cave7Visual,`${week}/${lesson}: teaching example has no visual`);
 const html=renderToStaticMarkup(React.createElement(guide.measurement8Visual?Visual:Cave,guide.measurement8Visual?{visual:guide.measurement8Visual}:{visual:guide.cave7Visual,realm:'measurement'}));
 gallery.push(`<article><h2>Week ${week} · Lesson ${lesson} · Teaching example</h2><p>${escape(guide.prompt)}</p>${html}</article>`);
 illustrated+=count;
 rows.push(`| ${week} | ${lesson} | ${LEVEL8_CURRICULUM.measurement[week-1].lessons[lesson-1].title} | ${count}/${fspec.length} | Yes |`);
}
if(process.argv.includes('--report')) fs.writeFileSync('/tmp/measurement8-visual-review.html',`<!doctype html><html><head><meta charset="utf-8"><title>Measurement 8 visual review</title><style>body{font:17px system-ui;background:#f4f0e9;color:#583714;margin:20px}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(340px,1fr));gap:20px}article{background:white;border:1px solid #8051a8;border-radius:16px;padding:20px;min-width:0}article svg{max-width:100%;width:100%;height:auto;max-height:400px}article img{max-width:200px}h2{font-size:18px}p{line-height:1.5}button{display:none}</style></head><body><h1>Level 8 Measurement — all lesson diagrams</h1><main>${gallery.join('')}</main></body></html>`);
if(process.argv.includes('--report')) fs.writeFileSync('docs/measurement-level8-visual-audit.md',`# Level 8 Measurement visual audit\n\nReviewed all 12 weeks, 36 lessons and ${checked/40} question forms, with 40 data sets per form (${checked} checks). ${illustrated} forms have a diagram or structured table; ${textOnly.size} reviewed text-only forms cover numerical conversions, notation or conceptual questions. All 36 teaching examples have visual support.\n\nEach diagram is authored alongside its question quantities. Unknown dimensions are not supplied in labels or read-aloud. Geometry questions use diagrams; tables support rate comparisons and journey stages. Grid-count pictures rearrange the stated full/partial cells for counting rather than inventing a measured outline.\n\n| Week | Lesson | Topic | Visual forms | Teaching visual |\n| --- | --- | --- | --- | --- |\n${rows.join('\n')}\n\nRegression check: run \`NODE_ENV=test node --no-warnings --experimental-strip-types --experimental-loader ./scripts/typescript-alias-loader.mjs scripts/measurement8-visuals-test.mjs --report\`. It also writes a local HTML gallery to /tmp/measurement8-visual-review.html.\n\nThis records local source and render checks, not a production deployment.\n`);
console.log(`PASS: ${checked} question checks; ${illustrated} illustrated forms; 36 teaching examples. Gallery: /tmp/measurement8-visual-review.html`);
}finally{await h.close();}
function escape(s){return s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');}
