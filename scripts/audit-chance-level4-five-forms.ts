import assert from 'node:assert/strict';
import {CH_FORMS,chEmpty,chReady,chScore,chSpeech,chOutcome} from '../data/assessments/revisions/level3ChanceHollowFiveForms';
import {LEVEL4_CHANCE_FORMS} from '../data/assessments/revisions/level4ChanceHollowFiveForms';
const ids=new Set<string>();
for(const form of CH_FORMS){const items=LEVEL4_CHANCE_FORMS[form];assert.equal(items.length,20);assert.deepEqual([...new Set(items.map(q=>q.code))].sort(),['AC9M4P01','AC9M4P02']);assert.deepEqual([...new Set(items.map(q=>q.week))].sort(),[1,2,3,4,5,6]);
 for(const q of items){assert(!ids.has(q.id));ids.add(q.id);assert(chSpeech(q));assert(!chReady(q,chEmpty()));assert(!chScore(q,{...chEmpty(),skipped:true}));
 if(q.mode==='choice'){assert.equal(q.options.length,4);assert.equal(new Set(q.options).size,4);q.options.forEach((_,choice)=>assert.equal(chScore(q,{...chEmpty(),choice}),choice===q.correct));}
 else{const trials=q.mode==='experiment'?Array.from({length:q.target!},(_,i)=>q.outcomes![i%q.outcomes!.length]):q.trials!;const values=q.outcomes!.map(o=>String(trials.filter(t=>t===o).length));const r={values,trials};assert(chReady(q,r));assert(chScore(q,r));assert(!chScore(q,{...r,values:values.map(n=>String(Number(n)+1))}));if(q.mode==='experiment'){assert(!chReady(q,{...r,trials:trials.slice(1)}));assert(!chScore(q,{...r,trials:Array(q.target).fill('invalid')}));}}
 if(q.rows)for(const row of q.rows){assert.equal(row.counts.length,q.outcomes!.length);assert(row.counts.every(n=>n>=0));}
 }
 assert.equal(items.filter(q=>q.mode==='experiment').length,2);
 assert(items[18].rows![0].counts[0]>items[18].rows![0].counts[1]);
 assert.notDeepEqual(items[14].rows![0].counts,items[14].rows![1].counts);
 assert.deepEqual([0,.24999,.25,.5,.74999,.75,.99999].map(u=>chOutcome(items[12],u)),['Two heads','Two heads','One of each','One of each','One of each','Two tails','Two tails']);
 for(const q of items.filter(q=>q.rows)){for(const row of q.rows!){assert.equal(row.counts.reduce((a,b)=>a+b,0),q.slot===15?24:q.slot===18?12:20);}}
}
assert.equal(ids.size,100);console.log('PASS: Chance Level 4: 100 items, five forms, both curriculum codes, four distinct choices, recording and actual-trial scoring.');
