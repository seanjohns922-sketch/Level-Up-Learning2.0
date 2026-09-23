import assert from 'node:assert/strict';
import {CH_FORMS,chEmpty,chReady,chScore,chSpeech,chOutcome} from '../data/assessments/revisions/level3ChanceHollowFiveForms';
import {LEVEL6_CHANCE_FORMS} from '../data/assessments/revisions/level6ChanceHollowFiveForms';
const ids=new Set<string>();
for(const form of CH_FORMS){const items=LEVEL6_CHANCE_FORMS[form];assert.equal(items.length,20);assert.deepEqual([...new Set(items.map(q=>q.code))].sort(),['AC9M6P01','AC9M6P02']);assert.deepEqual([...new Set(items.map(q=>q.week))].sort(),[1,2,3,4,5,6]);
 for(const q of items){assert(!ids.has(q.id));ids.add(q.id);assert(chSpeech(q));assert(!chReady(q,chEmpty()));assert(!chScore(q,{...chEmpty(),skipped:true}));
 if(q.mode==='choice'){assert.equal(q.options.length,4);assert.equal(new Set(q.options).size,4);q.options.forEach((_,choice)=>assert.equal(chScore(q,{...chEmpty(),choice}),choice===q.correct));}
 else{const trials=q.mode==='experiment'?Array.from({length:q.target!},(_,i)=>q.outcomes![i%q.outcomes!.length]):q.trials!;const values=q.outcomes!.map(o=>String(trials.filter(t=>t===o).length));const r={values,trials};assert(chReady(q,r));assert(chScore(q,r));assert(!chScore(q,{...r,values:values.map(n=>String(Number(n)+1))}));if(q.mode==='experiment'){assert(!chReady(q,{...r,trials:trials.slice(1)}));assert(!chScore(q,{...r,trials:Array(q.target).fill('invalid')}));}}
 if(q.rows)for(const row of q.rows){assert.equal(row.counts.length,q.outcomes!.length);assert(row.counts.every(n=>n>=0));}
 }
 for(const q of items.filter(q=>q.mode==='experiment')){assert.deepEqual(q.batchStages,[10,100,1000]);assert.equal(q.target,1000);const w=q.weights!,boundary=w[0]/(w[0]+w[1]);assert.equal(chOutcome(q,boundary-0.00001),q.outcomes![0]);assert.equal(chOutcome(q,boundary),q.outcomes![1]);}
 const numeric=(s:string)=>/^\d+(\.\d+)?$/.test(s)?Number(s):/^\d+\/\d+$/.test(s)?Number(s.split('/')[0])/Number(s.split('/')[1]):s;
 for(const q of items.filter(q=>[2,5,6,7,8,9].includes(q.slot)))assert.equal(new Set(q.options.map(numeric)).size,4);
 const hits=items[7].rows![0].counts[0];assert.equal(Number(items[7].options[items[7].correct]),hits/80);
 for(const slot of [16,20])assert.equal(items[slot-1].rows![0].counts.reduce((a,b)=>a+b,0),1000);
 assert.equal(items.filter(q=>q.mode==='experiment').length,2);
}
assert.equal(ids.size,100);console.log('PASS: Chance Level 6: 100 items, five forms, both codes, distinct choices, fraction/decimal answers, increasing simulation sizes, weighted trials and recording.');
