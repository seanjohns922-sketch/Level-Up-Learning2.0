import assert from 'node:assert/strict';
import {CH_FORMS,chEmpty,chReady,chScore,chSpeech,chOutcome} from '../data/assessments/revisions/level3ChanceHollowFiveForms';
import {LEVEL7_CHANCE_FORMS} from '../data/assessments/revisions/level7ChanceHollowFiveForms';
const numeric=(s:string)=>/^\d+(\.\d+)?$/.test(s)?Number(s):/^\d+\/\d+$/.test(s)?Number(s.split('/')[0])/Number(s.split('/')[1]):s;
const ids=new Set<string>();
for(const form of CH_FORMS){const items=LEVEL7_CHANCE_FORMS[form];assert.equal(items.length,30);assert.deepEqual([...new Set(items.map(q=>q.code))].sort(),['AC9M7P01','AC9M7P02']);assert.deepEqual([...new Set(items.map(q=>q.week))].sort(),[1,2,3,4,5,6]);
 const answer=(slot:number)=>items[slot-1].options[items[slot-1].correct];
 for(const q of items){assert(!ids.has(q.id));ids.add(q.id);assert(chSpeech(q));assert(!chReady(q,chEmpty()));assert(!chScore(q,{...chEmpty(),skipped:true}));assert(q.apparatus||q.displays||q.rows||q.tiles||q.scene,`${q.id}: missing visual`);
 if(q.mode==='choice'){assert.equal(q.options.length,4);assert.equal(new Set(q.options.map(numeric)).size,4,`${q.id}: equivalent choices`);assert(q.options.every(o=>! /^[a-z]/.test(o)));q.options.forEach((_,choice)=>assert.equal(chScore(q,{...chEmpty(),choice}),choice===q.correct));}
 else{assert.equal(q.mode,'experiment');assert.equal(q.batchStages!.at(-1),q.target);assert(q.batchStages!.every((n,i,a)=>i===0||n>a[i-1]));const trials=Array.from({length:q.target!},(_,i)=>chOutcome(q,((i*73)%1000)/1000));const values=q.outcomes!.map(o=>String(trials.filter(t=>t===o).length));const r={values,trials};assert(chReady(q,r));assert(chScore(q,r));assert(!chScore(q,{...r,values:values.map(n=>String(Number(n)+1))}));assert(!chReady(q,{...r,trials:trials.slice(1)}));assert(!chScore(q,{...r,trials:Array(q.target).fill('invalid')}));const boundary=q.weights![0]/q.weights!.reduce((a,b)=>a+b,0);assert.equal(chOutcome(q,boundary-1e-8),q.outcomes![0]);assert.equal(chOutcome(q,boundary),q.outcomes![1]);assert.equal(chOutcome(q,0),q.outcomes![0]);assert.equal(chOutcome(q,1-1e-8),q.outcomes!.at(-1));}
 if(q.rows)for(const row of q.rows){assert.equal(row.counts.length,q.outcomes!.length);assert(row.counts.every(n=>Number.isInteger(n)&&n>=0));}
 if(q.tiles)for(const t of q.tiles)assert(chSpeech(q).includes(t));
 }
 assert.equal(numeric(answer(6)),.5);
 const wedges=items[6].apparatus!;assert.equal(wedges.type,'spinner');if(wedges.type==='spinner')assert.equal(numeric(answer(7)),wedges.wedges.filter(c=>c===wedges.wedges[0]).length/8);
 assert.equal(numeric(answer(8)),items[7].tiles!.filter(t=>t==='★').length/12);
 const bag=items[8].apparatus!;if(bag.type==='bag')assert.equal(numeric(answer(9)),bag.counters.filter(c=>c!==bag.counters[0]).length/10);
 const parts=items[9].tiles!.slice(0,2).map(t=>Number(t.split(': ')[1]));assert(Math.abs(Number(answer(10))+parts[0]+parts[1]-1)<1e-10);
 const cut=Number(items[11].prompt.match(/above (\d+)/)![1]);assert.equal(numeric(answer(12)),(12-cut)/12);
 const spins=Number(items[13].prompt.match(/in (\d+)/)![1]);assert.equal(Number(answer(14)),spins*3/8);
 const rolls=Number(items[14].prompt.match(/in (\d+)/)![1]);assert.equal(Number(answer(15)),rolls/6);
 assert.equal(Number(answer(16)),Number(items[15].tiles![1].split(' ')[0])/400);
 const rows=items[16].rows!;assert.equal(numeric(answer(17)),(rows[0].counts[0]+rows[1].counts[0])/300);
 assert.equal(Number(answer(18)),items[17].rows![0].counts[0]/400);
 const comparison=items[18].rows!;assert(comparison[0].counts[0]/20>comparison[1].counts[0]/200);
 const snapshots=items[20].rows!;const deviations=snapshots.map(row=>Math.abs(row.counts[0]/row.counts.reduce((a,b)=>a+b,0)-1/6));assert(deviations[2]<deviations[1]&&deviations[1]<deviations[0]);
 assert.equal(Number(answer(22)),items[21].rows![0].counts[0]-250);
 const target=Number(items[23].prompt.match(/(\d+)%/)![1]);for(let i=0;i<4;i++){const option=items[23].options[i],range=option.match(/Win on (\d+) to (\d+)/),only=option.match(/Win only on (\d+)/);const count=Array.from({length:100},(_,j)=>j+1).filter(n=>range?n>=Number(range[1])&&n<=Number(range[2]):n===Number(only![1])).length;assert.equal(count===target,i===items[23].correct);}
 assert(Math.abs(items[29].rows![0].counts[0]/1000-.25)<.02);
 assert.equal(items.filter(q=>q.mode==='experiment').length,2);
}
assert.equal(ids.size,150);console.log('PASS: Chance Level 7: all 150 items, both Year 7 codes, visual coverage, four inequivalent choices, independent numerical answers, unbiased models, simulation boundaries and actual-result scoring.');
