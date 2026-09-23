import assert from 'node:assert/strict';
import {CH_FORMS,chEmpty,chReady,chScore,chSpeech,chOutcome} from '../data/assessments/revisions/level3ChanceHollowFiveForms';
import {LEVEL5_CHANCE_FORMS,DIFFERENCE_GRID} from '../data/assessments/revisions/level5ChanceHollowFiveForms';
assert.deepEqual([0,1,2,3,4,5].map(n=>DIFFERENCE_GRID.flat().filter(v=>v===n).length),[6,10,8,6,4,2]);
const ids=new Set<string>();
for(const form of CH_FORMS){const items=LEVEL5_CHANCE_FORMS[form];assert.equal(items.length,20);assert.deepEqual([...new Set(items.map(q=>q.code))].sort(),['AC9M5P01','AC9M5P02']);assert.deepEqual([...new Set(items.map(q=>q.week))].sort(),[1,2,3,4,5,6]);
 for(const q of items){assert(!ids.has(q.id));ids.add(q.id);assert(chSpeech(q));assert(!chReady(q,chEmpty()));assert(!chScore(q,{...chEmpty(),skipped:true}));
 if(q.mode==='choice'){assert.equal(q.options.length,4);assert.equal(new Set(q.options).size,4);q.options.forEach((_,choice)=>assert.equal(chScore(q,{...chEmpty(),choice}),choice===q.correct));}
 else{const trials=q.mode==='experiment'?Array.from({length:q.target!},(_,i)=>q.outcomes![i%q.outcomes!.length]):q.trials!;const values=q.outcomes!.map(o=>String(trials.filter(t=>t===o).length));const r={values,trials};assert(chReady(q,r));assert(chScore(q,r));assert(!chScore(q,{...r,values:values.map(n=>String(Number(n)+1))}));if(q.mode==='experiment'){assert(!chReady(q,{...r,trials:trials.slice(1)}));assert(!chScore(q,{...r,trials:Array(q.target).fill('invalid')}));}}
 if(q.rows)for(const row of q.rows){assert.equal(row.counts.length,q.outcomes!.length);assert(row.counts.every(n=>n>=0));}
 }
 const freq=items[9];assert.equal(freq.options[freq.correct],`${freq.rows![0].counts[0]}/${freq.rows![0].counts.reduce((a,b)=>a+b,0)}`);
 for(const slot of [14,19,20])for(const row of items[slot-1].rows!)assert.equal(row.counts.reduce((a,b)=>a+b,0),100);
 assert.equal(items[14].rows![0].counts.reduce((a,b)=>a+b,0),60);
 assert.equal(chOutcome(items[11],.499),items[11].outcomes![0]);
 assert.equal(chOutcome(items[11],.5),items[11].outcomes![1]);assert.equal(chOutcome(items[16],.7499),items[16].outcomes![0]);assert.equal(chOutcome(items[16],.75),items[16].outcomes![1]);
 const rows=items[12].rows!;assert.equal(rows[0].counts[0]*2,rows[1].counts[0]);assert.equal(items.filter(q=>q.mode==='experiment').length,2);
}
assert.equal(ids.size,100);console.log('PASS: Chance Level 5: 100 items, five forms, both codes, distinct choices, fraction answers, dice combinations, weighted trials and recording.');
