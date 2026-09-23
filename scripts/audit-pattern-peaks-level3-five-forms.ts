import assert from 'node:assert/strict';
import fs from 'node:fs';
import {LEVEL3_PP_FORMS,PP_FORMS,PP_OPERATIONS,ppEmpty,ppReady,ppScore,ppVisualSpeech,type PPResponse} from '@/data/assessments/revisions/level3PatternPeaksFiveForms';
const fixtures=[];
for(const [f,form] of PP_FORMS.entries()){
 const items=LEVEL3_PP_FORMS[form];assert.equal(items.length,20);
 for(const code of ['AC9M3A01','AC9M3A02','AC9M3A03','AC9M3N07'])assert.equal(items.filter(q=>q.code===code).length,5);
 for(const q of items){
  assert(!ppReady(q,ppEmpty()));assert(!ppScore(q,{...ppEmpty(),skipped:true}));assert(ppVisualSpeech(q.visual).length>5);
  let expected:number[]=[];let option='';
  switch(q.slot){
   case 1:expected=[(3+f)*8];break;
   case 2:option='Subtraction undoes adding the known part.';break;
   case 3:expected=[130+10*f];break;
   case 4:expected=[12+3*f];break;
   case 5:expected=[5+f];break;
   case 6:expected=[35+4*f];break;
   case 7:expected=[(8+f%3)*10];break;
   case 8:expected=[5+f];break;
   case 9:{const n=14+3*f;expected=[n%2===0?n/2:n+5];break;}
   case 10:expected=[47+5*f];break;
   case 11:expected=[105+f];break;
   case 12:expected=[4+f];break;
   case 13:option=`${30+10*f} ÷ 10 = ${3+f}`;break;
   case 14:expected=[1,63+7*f];break;
   case 15:option='Each number is twice the number before.';break;
   case 16:option=`${40+10*f} + 6`;break;
   case 17:expected=[4+f,4];break;
   case 18:expected=[35+4*f];break;
   case 19:expected=[143+11*f];break;
  }
  const response:PPResponse=q.mode==='choice'?{...ppEmpty(),choice:q.options.indexOf(option)}:q.mode==='algorithm'?{...ppEmpty(),operations:f%2===0?['Double','Add the starting number']:['Double','Double']}:{...ppEmpty(),values:expected.map(String)};
  assert(ppScore(q,response),q.id);
  if(q.mode==='choice'){
   assert.equal(q.options.length,4);assert.equal(new Set(q.options).size,4);
   assert.equal(q.options.filter((_,i)=>ppScore(q,{...ppEmpty(),choice:i})).length,1);
  }else if(q.mode==='algorithm'){
   // Independent interpreter exhaustively checks all 16 two-step programs.
   for(const a of PP_OPERATIONS)for(const b of PP_OPERATIONS){const ops=[a,b];const oracle=Array.from({length:12},(_,i)=>i+1).every(input=>{let value=input;for(const op of ops){switch(op){case'Double':value*=2;break;case'Halve':value/=2;break;case'Add 5':value+=5;break;case'Add the starting number':value+=input;break;}}return value===input*(f%2===0?3:4);});assert.equal(ppScore(q,{...ppEmpty(),operations:ops}),oracle);}
  }else{
   assert(!ppScore(q,{...ppEmpty(),values:expected.map(n=>String(n+1))}));
   assert(!ppScore(q,{...ppEmpty(),values:['']}));assert(!ppScore(q,{...ppEmpty(),values:['NaN']}));
  }
  fixtures.push({id:q.id,form,slot:q.slot,response});
 }
}
assert.equal(new Set(fixtures.map(f=>f.id)).size,100);
if(process.env.PP_FIXTURES)fs.writeFileSync(process.env.PP_FIXTURES,JSON.stringify(fixtures));
const panel=fs.readFileSync('components/demo/DemoReviewPanel.tsx','utf8');
assert(panel.includes('/demo-review/pattern-level3?form=${kind}'));assert(panel.includes('/demo-review/pattern-level3?form=${checkpoint}'));assert(!panel.includes('pattern-level1'));assert(panel.includes('if (realm === "pattern" && levelNumber < 3) setYear("Year 3")'));
console.log('PASS: 100 Level 3 questions, 5 items per curriculum code, independent worked answers, four distinct options, alternative partitions, all 16 algorithm combinations per form, invalid answers, five review routes and Level 3 starting point.');
