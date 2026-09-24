import assert from 'node:assert/strict';
import {CH_FORMS,chEmpty,chReady,chScore,chSpeech,chOutcome} from '../data/assessments/revisions/level3ChanceHollowFiveForms';
import {LEVEL8_CHANCE_FORMS} from '../data/assessments/revisions/level8ChanceHollowFiveForms';
const numeric=(s:string):number|string=>/^\d+(\.\d+)?%$/.test(s)?parseFloat(s)/100:/^\d+(\.\d+)?$/.test(s)?Number(s):/^\d+\/\d+$/.test(s)?Number(s.split('/')[0])/Number(s.split('/')[1]):s;
const ids=new Set<string>();
for(const form of CH_FORMS){const items=LEVEL8_CHANCE_FORMS[form];assert.equal(items.length,30);assert.deepEqual([...new Set(items.map(q=>q.code))].sort(),['AC9M8P01','AC9M8P02','AC9M8P03']);
 const ans=(slot:number)=>items[slot-1].options[items[slot-1].correct];const num=(slot:number)=>Number(numeric(ans(slot)));const close=(actual:number,wanted:number)=>assert(Math.abs(actual-wanted)<1e-10,`${form}: ${actual} != ${wanted}`);
 for(const q of items){assert(!ids.has(q.id));ids.add(q.id);assert(chSpeech(q));assert(!chReady(q,chEmpty()));assert(!chScore(q,{...chEmpty(),skipped:true}));assert(q.apparatus||q.displays||q.rows||q.tiles||q.scene||q.tree||q.venn||q.matrix||q.pairTable,`${q.id}: missing visual`);
 if(q.mode==='choice'){assert.equal(q.options.length,4);assert.equal(new Set(q.options.map(numeric)).size,4,`${q.id}: equivalent choices`);assert(q.options.every(o=>! /^[a-z]/.test(o)));q.options.forEach((_,choice)=>assert.equal(chScore(q,{...chEmpty(),choice}),choice===q.correct));}
 else if(q.mode==='complete'){const values=q.completion!.map(field=>field.answer),r={...chEmpty(),values};assert(chReady(q,r));assert(chScore(q,r));assert(!chReady(q,{...r,values:values.slice(1)}));for(let i=0;i<values.length;i++){const wrong=[...values];wrong[i]=q.completion![i].choices.find(v=>v!==values[i])!;assert(!chScore(q,{...r,values:wrong}));}assert(!chReady(q,{...r,values:values.map(()=>'invalid')}));}
 else{assert.equal(q.batchStages!.at(-1),q.target);const grid=q.experiment==='coinPair'?2:6,counts=Object.fromEntries(q.outcomes!.map(o=>[o,0]));for(let a=0;a<grid;a++)for(let b=0;b<grid;b++){const outcome=chOutcome(q,(a+.5)/grid,(b+.5)/grid);assert.equal(outcome,q.experiment==='coinPair'?`${a===0?'H':'T'}${b===0?'H':'T'}`:String(Math.abs(a-b)));counts[outcome]++;}assert.deepEqual(q.outcomes!.map(o=>counts[o]),q.weights);const trials=Array.from({length:q.target!},(_,i)=>chOutcome(q,((i*73)%1000)/1000,((i*317+37)%1000)/1000)),values=q.outcomes!.map(o=>String(trials.filter(t=>t===o).length)),r={values,trials};assert(chReady(q,r));assert(chScore(q,r));assert(!chScore(q,{...r,values:values.map(n=>String(Number(n)+1))}));assert(!chReady(q,{...r,trials:trials.slice(1)}));assert(!chScore(q,{...r,trials:Array(q.target).fill('invalid')}));}
 if(q.rows)for(const row of q.rows){assert.equal(row.counts.length,q.outcomes!.length);assert(row.counts.every(n=>Number.isInteger(n)&&n>=0));}
 if(q.venn){if(!q.venn.regions)assert.equal(q.venn.counts.reduce((a,b)=>a+b,0),40);for(const label of q.venn.labels)assert(chSpeech(q).includes(label));}
 if(q.tree)for(const label of [...q.tree.first,...q.tree.second])assert(chSpeech(q).includes(label));
 }
 const treeItem=items[6],t=treeItem.tree!;Object.entries(t.blanks!).forEach(([key,marker])=>{const [kind,i,j]=key.split('-'),a=Number(i),b=Number(j);const expected=kind==='first'?t.first[a]:kind==='second'?t.second[b]:t.first[a]+t.second[b];assert.equal(treeItem.completion!.find(field=>field.label.startsWith(marker))!.answer,expected);});
 const table=items[7].pairTable!;table.cells.forEach((row,i)=>row.forEach((cell,j)=>{if(cell.startsWith('['))assert.equal(items[7].completion!.find(field=>field.label.startsWith(cell[1]))!.answer,table.first[i]+table.second[j]);}));
 const v=items[12];v.completion!.forEach(field=>{const left=field.label[0]===v.venn!.labels[0].slice(-1),right=field.label[1]===v.venn!.labels[1].slice(-1);assert.equal(field.answer[0],left?(right?'B':'A'):(right?'C':'D'));});
 close(num(1),1-items[0].forecastPercent!/100);
 const spinner=items[1].apparatus!;if(spinner.type==='spinner'){assert.equal(new Set(spinner.wedges).size,4);assert.equal(spinner.wedges.length,8);close(num(2),spinner.wedges.filter(c=>c!==spinner.wedges[0]).length/8);}
 close(num(3),1-Number(items[2].tiles![0].split(': ')[1]));close(num(4),4/6);close(num(5),1-Number(items[4].tiles![0].split(': ')[1]));
 items[5].options.forEach((s,i)=>{const sum=s.split(' and ').map(Number).reduce((a,b)=>a+b,0);assert.equal(Math.abs(sum-1)<1e-10,i===items[5].correct);});
 assert.equal(items.filter(q=>q.mode==='complete').length,3);close(num(9),.25);close(num(10),.5);close(num(11),.75);close(num(12),.75);
 const [onlyA,both,onlyB,neither]=items[13].venn!.counts;close(num(14),(onlyA+both+onlyB)/40);close(num(15),(onlyA+onlyB)/40);close(num(16),neither/40);
 const rows=items[16].rows!;assert.equal(rows.flatMap(r=>r.counts).reduce((a,b)=>a+b,0),60);close(num(17),rows[0].counts[0]/60);close(num(18),rows[1].counts.reduce((a,b)=>a+b,0)/60);
 const difference=Number(items[20].prompt.match(/difference is (\d+)/)![1]);let ways=0;for(let a=1;a<=6;a++)for(let b=1;b<=6;b++)if(Math.abs(a-b)===difference)ways++;close(num(21),ways/36);
 const pairs=items[23].rows![0].counts;assert.equal(pairs.reduce((a,b)=>a+b,0),4000);close(num(24),(pairs[1]+pairs[2])/4000);close(num(25),Number(items[24].prompt.match(/of (\d+) trials/)![1])*3/4);
 assert.equal(items[27].rows![0].counts.reduce((a,b)=>a+b,0),6000);assert(Math.abs(items[27].rows![0].counts[1]/6000-10/36)<.02);assert.equal(items[28].rows![0].counts.reduce((a,b)=>a+b,0),4000);close(num(29),1);
 assert.equal(items.filter(q=>q.mode==='experiment').length,2);
}
assert.equal(ids.size,150);console.log('PASS: Level 8, all 150 items, three codes, complementary probabilities, trees/Venn/two-way tables, distinct answers, independent compound sampling and actual-result scoring.');
