import assert from 'node:assert/strict';
import fs from 'node:fs';
import {LEVEL5_PP_FORMS} from '@/data/assessments/revisions/level5PatternPeaksFiveForms';
import {PP_FORMS,ppEmpty,ppReady,ppScore,ppVisualSpeech,type PPResponse} from '@/data/assessments/revisions/level3PatternPeaksFiveForms';
const fixtures=[];
for(const [f,form] of PP_FORMS.entries()){
 const items=LEVEL5_PP_FORMS[form];assert.equal(items.length,20);
 for(const [code,count] of [['AC9M5A01',6],['AC9M5A02',8],['AC9M5N10',6]] as const)assert.equal(items.filter(q=>q.code===code).length,count);
 const d=[4,6,5,8,9][f];
 const worked:Record<number,number[]>={1:[12+f],2:[13+f],3:f%2?[2*d,3*d,4*d]:[2*d,3*d],4:[16+2*f,14+f],5:[(14+f)*(23+2*f)],7:[[6,12,15,14,18][f]],8:[14+f],9:[8+f,70+10*f],10:[30+6*f],11:[[24,24,36,30,30][f]],13:[(6+f)*(3+f)],14:[12+4*f],17:[30+5*f,6+f],18:[[6,12],[8,12],[10,12],[12,12],[12,15]][f],20:[[3,4],[4,5],[3,5],[4,7],[5,6]][f]};
 const options:Record<number,string>={6:'Multiplication undoes division by the same number.',12:`${(12+f)*(15+f)} ÷ ${12+f} = ${15+f}`,15:`Multiply the input by ${7+f}.`,16:'The total and group size are both multiplied by 10.',19:`Every multiple of ${[6,10,12,14,15][f]} is also a multiple of ${[3,5,4,7,5][f]}.`};
 for(const q of items){
  assert(!ppReady(q,ppEmpty()));assert(!ppScore(q,{...ppEmpty(),skipped:true}));assert(ppVisualSpeech(q.visual).length>5);
  const response:PPResponse=options[q.slot]?{...ppEmpty(),choice:q.options.indexOf(options[q.slot]),...(q.mode==='testerChoice'?{tests:[60]}:{})}:{...ppEmpty(),values:worked[q.slot].map(String)};
  assert(ppScore(q,response),q.id);
  if(q.options.length){assert.equal(q.options.length,4);assert.equal(new Set(q.options).size,4);assert.equal(q.options.filter((_,i)=>ppScore(q,{...response,choice:i})).length,1);}
  if(q.mode==='testerChoice')assert(!ppReady(q,{...response,tests:[]}));
  if(q.mode==='select'){for(let mask=0;mask<16;mask++){const picked=q.candidates!.filter((_,i)=>mask&(1<<i));assert.equal(ppScore(q,{...ppEmpty(),values:picked.map(String)}),picked.length===worked[3].length&&picked.every(n=>n%d===0));}}
  if(q.mode==='product'){for(let a=1;a<=25;a++)for(let b=1;b<=25;b++)assert.equal(ppScore(q,{...ppEmpty(),values:[String(a),String(b)]}),a>=2&&a<=24&&b>=2&&b<=24&&a*b===[72,96,120,144,180][f]);}
  if(q.mode==='filterBuilder'){for(const a of q.candidates!)for(const b of q.candidates!){const matches=Array.from({length:420},(_,i)=>i+1).every(n=>(n%a===0&&n%b===0)===(n%(q.targetMultiple!)===0));assert.equal(ppScore(q,{...ppEmpty(),values:[String(a),String(b)]}),matches);}}
  if(q.mode==='number')assert(!ppScore(q,{...response,values:response.values.map(v=>String(Number(v)+1))}));
  assert(!ppScore(q,{...ppEmpty(),values:['NaN']}));fixtures.push({id:q.id,form,slot:q.slot,mode:q.mode,response});
 }
}
assert.equal(new Set(fixtures.map(q=>q.id)).size,100);
if(process.env.PP_FIXTURES)fs.writeFileSync(process.env.PP_FIXTURES,JSON.stringify(fixtures));
const panel=fs.readFileSync('components/demo/DemoReviewPanel.tsx','utf8');assert(panel.includes('/demo-review/pattern-level5?form=${kind}'));assert(panel.includes('/demo-review/pattern-level5?form=${checkpoint}'));
console.log('PASS: 100 Level 5 items; all curriculum allocations; independent answers; four-option uniqueness; exhaustive selection, factor-pair and algorithm-rule checks; tester readiness; review routes.');
