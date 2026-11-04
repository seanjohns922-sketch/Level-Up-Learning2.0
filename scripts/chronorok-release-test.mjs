import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import sharp from 'sharp';
import { CHRONOROK_CARDS, CHRONOROK_VIDEOS } from '../data/chronorok-artwork.ts';
import { chronorokForGrade, chronorokProgress } from '../lib/chronorok.ts';
const names=['Spark','Ember','Pulse','Current','Rift','Blaze','Eternal'];
assert.deepEqual(CHRONOROK_CARDS.map(c=>c.name),names.map(name=>`Chronorok ${name}`));
for(const [i,card] of CHRONOROK_CARDS.entries()) {
 assert.equal(chronorokForGrade(i===0?'Prep':`Year ${i}`).id,card.id);
 assert.match(card.images.avatar,new RegExp(`${names[i].toLowerCase()}-y${i}.png$`));
 assert.match(card.images.cardFront,new RegExp(`${names[i].toLowerCase()}-y${i}-front.webp$`));
 const a=await sharp(`public${card.images.avatar}`).metadata();assert.equal(a.hasAlpha,true);
 const stats=await sharp(`public${card.images.avatar}`).stats();assert.equal(stats.channels[3].min,0);assert.ok(stats.channels[3].max > 0, "avatar must contain visible pixels; exact source alpha is preserved by hash");
 for(const path of [card.images.cardFront,card.images.cardBack]) {const m=await sharp(`public${path}`).metadata();assert.equal(m.width,1008);assert.equal(m.height,1408);assert.equal(m.space,'srgb');}
 assert.equal(card.unlockVideoUrl,null);assert.equal(card.showcaseVideoUrl,null);
}
assert.equal(new Set(CHRONOROK_CARDS.map(c=>c.images.cardBack)).size,1);
assert.equal(chronorokForGrade('Year 7').name,'Chronorok Eternal');assert.equal(chronorokForGrade('Year 8').name,'Chronorok Eternal');
assert.deepEqual(CHRONOROK_VIDEOS,{arrival:null,portal:null});
const rows=Array.from({length:101},(_,i)=>({activity_date:new Date(Date.UTC(2026,0,i+1)).toISOString().slice(0,10),lessons_completed:1,quizzes_completed:0}));
const now=new Date(2026,10,4);
assert.equal(chronorokProgress(rows.slice(0,4),now).open,false);
assert.equal(chronorokProgress(rows.slice(0,5),now).open,true);
assert.equal(chronorokProgress(rows.slice(0,99),now).crystals,99);
assert.equal(chronorokProgress(rows,now).crystals,100);
assert.deepEqual(chronorokProgress(rows,new Date(2027,0,1)),{learningDays:101,open:true,crystals:0});
assert.equal(chronorokProgress([{activity_date:'2026-01-01',lessons_completed:0,quizzes_completed:0}],now).crystals,0);
for(const e of JSON.parse(fs.readFileSync('docs/artwork/chronorok-2026-11-04-sources.json')))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(`public/${e.output}`)).digest('hex'),e.outputSha256);
for(const file of ['components/chronorok/ChronorokGameEntry.tsx','components/chronorok/ChronoRunEntry.tsx'])assert.match(fs.readFileSync(file,'utf8'),/<ChronorokAccess>/);
console.log('PASS: seven exact Chronorok mappings, transparent silhouettes, trimmed sRGB fronts/back, source hashes, empty video slots, access wrappers and unchanged 5-day/100-crystal/year-rollover rules.');
// Exercise actual collection reconciliation, front/back controls and earned labels.
const { domHarness } = await import('./test-support/react-dom-harness.mjs');
const React = (await import('react')).default;
let state={preview:false,progress:{crystals:99,open:true},chronorok:CHRONOROK_CARDS[3],grade:'Year 3',loading:false,error:null,signedIn:true};
const h=domHarness({
 '@/lib/useChronorokProgress':{useChronorokProgress:()=>state},
 'next/image':{__esModule:true,default:({priority,sizes,...props})=>React.createElement('img',props)},
 'next/link':{__esModule:true,default:props=>React.createElement('a',props)},
});
try {
 const C=h.load('components/chronorok/ChronorokCollection.tsx').default;
 await h.render(C);assert.match(h.document.body.textContent,/1 more crystals to awaken/);
 assert.equal(h.document.querySelectorAll('article').length,7);
 const flip=h.document.querySelector('article button');await h.click(flip);
 assert.equal(flip.querySelector('img').getAttribute('src'),CHRONOROK_CARDS[0].images.cardBack);
 await h.click(flip);assert.equal(flip.querySelector('img').getAttribute('src'),CHRONOROK_CARDS[0].images.cardFront);
 state={...state,progress:{crystals:100,open:true}};await h.render(C);
 assert.equal([...h.document.querySelectorAll('article')].filter(a=>a.textContent.includes('Awakened this year')).length,1);
 assert.match(h.document.querySelectorAll('article')[3].textContent,/Awakened this year/);
 state={...state,preview:true};await h.render(C);assert.match(h.document.body.textContent,/Teacher preview/);
 assert.equal(h.document.querySelectorAll('video').length,0);
 console.log('PASS: rendered seven-card collection, front/back toggles, 99/100 earned boundary, correct grade and no empty video players.');
} finally {await h.close();}
