import assert from 'node:assert/strict';
import fs from 'node:fs';
import {LEVEL4_PP_FORMS} from '@/data/assessments/revisions/level4PatternPeaksFiveForms';
import {PP_FORMS,ppEmpty,ppReady,ppScore,ppVisualSpeech,type PPResponse} from '@/data/assessments/revisions/level3PatternPeaksFiveForms';
const fixtures=[];
for(const [formIndex,form]of PP_FORMS.entries()){
 const items=LEVEL4_PP_FORMS[form];assert.equal(items.length,20);
 for(const code of ['AC9M4A01','AC9M4A02'])assert.equal(items.filter(q=>q.code===code).length,10);
 for(const q of items){
  const f=[0,3,1,4,2][(formIndex+q.slot-1)%5];
  assert(!ppReady(q,ppEmpty()));assert(!ppScore(q,{...ppEmpty(),skipped:true}));assert(ppVisualSpeech(q.visual).length>5);
  let expected:number[]=[];let option='';
  switch(q.slot){
   case 1:expected=[175+14*f];break;
   case 2:option=String(42+7*f);break;
   case 3:expected=[243+26*f];break;
   case 4:expected=[6+f];break;
   case 5:expected=[60+8*f];break;
   case 6:expected=[[48,42,56,54,54][f]];break;
   case 7:expected=[155+12*f];break;
   case 8:option=`${60+10*f} − ${6+f}`;break;
   case 9:option=String(163+15*f);break;
   case 10:expected=[30+6*f];break;
   case 11:expected=[46+7*f];break;
   case 12:expected=[28+7*f];break;
   case 13:expected=[92+12*f];break;
   case 14:expected=[420+70*f];break;
   case 15:expected=[185+16*f];break;
   case 16:expected=[6+f,8];break;
   case 17:option=`${245+21*f} − ${127+8*f} = ${118+13*f}`;break;
   case 18:expected=[216+27*f];break;
   case 19:expected=[37+3*f,5];break;
   case 20:{const p=(f%2?4:3)*(18+2*f);option=`${p} + ${p}`;break;}
  }
  const response:PPResponse=q.mode==='choice'?{...ppEmpty(),choice:q.options.indexOf(option)}:{...ppEmpty(),values:expected.map(String)};
  assert(ppScore(q,response),q.id);
  if(q.mode==='choice'){
   assert.equal(q.options.length,4);assert.equal(new Set(q.options).size,4,q.id);
   assert.equal(q.options.filter((_,i)=>ppScore(q,{...ppEmpty(),choice:i})).length,1);
   // The two strategy items must have exactly one expression evaluating to the target.
   if(q.slot===8||q.slot===20){const target=q.slot===8?9*(6+f):2*(f%2?4:3)*(18+2*f);const values=q.options.map(o=>{const match=o.match(/^(\d+) ([+−×÷]) (\d+)$/)!;const a=Number(match[1]),b=Number(match[3]);return match[2]==='+'?a+b:match[2]==='−'?a-b:match[2]==='×'?a*b:a/b;});assert.equal(values.filter(v=>v===target).length,1,q.id);}
  }else{
   assert(!ppScore(q,{...ppEmpty(),values:expected.map((n,i)=>String(n+(i===0?1:0)))}));assert(!ppScore(q,{...ppEmpty(),values:['NaN']}));
  }
  if(q.mode==='equivalent'){
   for(const second of [1,20,40,55]){const first=second+32+3*f;assert(ppScore(q,{...ppEmpty(),values:[String(first),String(second)]}));}
   assert(!ppScore(q,{...ppEmpty(),values:[String(132+3*f),'100']}));assert(!ppScore(q,{...ppEmpty(),values:[String(32+3*f),'0']}));
  }
  fixtures.push({id:q.id,form,slot:q.slot,response});
 }
}
assert.equal(new Set(fixtures.map(f=>f.id)).size,100);
if(process.env.PP_FIXTURES)fs.writeFileSync(process.env.PP_FIXTURES,JSON.stringify(fixtures));
const panel=fs.readFileSync('components/demo/DemoReviewPanel.tsx','utf8');assert(panel.includes('/demo-review/pattern-level4?form=${kind}'));assert(panel.includes('/demo-review/pattern-level4?form=${checkpoint}'));assert(panel.includes('if (realm === "pattern" && levelNumber < 3) setYear("Year 3")'));
console.log('PASS: 100 Level 4 questions, balanced curriculum coverage, independent worked answers, four distinct choices, mathematically unique strategy options, alternative equivalent equations, range/malformed-response rejection and five review routes.');
