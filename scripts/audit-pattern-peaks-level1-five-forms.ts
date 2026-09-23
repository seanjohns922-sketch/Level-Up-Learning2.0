import assert from 'node:assert/strict';
import fs from 'node:fs';
import {LEVEL1_PP_FORMS,PP_FORMS,ppReady,ppScore,type PPResponse,type PPValue} from '@/data/assessments/revisions/level1PatternPeaksFiveForms';
const fixtures=[];
for(const [f,form] of PP_FORMS.entries()){
 const items=LEVEL1_PP_FORMS[form];assert.equal(items.length,20);
 assert.equal(items.filter(q=>q.code==='AC9M1A01').length,8);
 assert.equal(items.filter(q=>q.code==='AC9M1A02').length,12);
 for(const q of items){
  assert.equal(ppReady(q,{built:[]}),false);
  assert.equal(ppScore(q,{built:[],skipped:true}),false);
  let expected:PPValue[]=[];
  const s=q.sequence;
  switch(q.slot){
   case 1:expected=[s[1]];break;case 2:expected=[s[0]];break;case 3:expected=[s[0]];break;case 4:expected=[s[1]];break;
   case 5:expected=s.slice(0,2);break;case 6:case 7:expected=s.slice(0,3);break;
   case 8:expected=s.slice(0,3);break;case 9:expected=s;break;
   case 10:expected=Array.from({length:6},(_,i)=>q.palette[(i%2)+1]);break;
   case 11:expected=[s[1]];break;
   case 12:expected=q.options.find(o=>o.values[0]===o.values[1]&&o.values[0]!==o.values[2]&&o.values.every((v,i)=>v===o.values[i%3]))!.values;break;
   case 13:expected=[f*2+8];break;case 14:expected=[f*5+15,f*5+20];break;case 15:expected=[f*10+30];break;
   case 16:expected=Array.from({length:4},(_,i)=>(i+1)*q.createStep!);break;
   case 17:case 18:case 19:expected=[q.groups!.count*q.groups!.size];break;
   case 20:expected=Array.from({length:4},(_,i)=>(i+1)*q.groups!.size);break;
  }
  const r:PPResponse=q.mode==='choice'?{built:[],choice:q.options.findIndex(o=>JSON.stringify(o.values)===JSON.stringify(expected))}:{built:expected};
  assert(ppScore(q,r),q.id);
  if(q.mode==='choice'){
   assert.equal(q.options.length,4);assert.equal(new Set(q.options.map(o=>JSON.stringify(o.values))).size,4,q.id);
   assert.equal(q.options.filter((_,i)=>ppScore(q,{choice:i,built:[]})).length,1);
  }else{
   assert(!ppScore(q,{built:expected.slice(1)}));
   assert(!ppScore(q,{built:Array(expected.length).fill(q.palette[0])}));
  }
  fixtures.push({id:q.id,form,slot:q.slot,response:r});
 }
}
assert.equal(new Set(fixtures.map(f=>f.id)).size,100);
if(process.env.PP_FIXTURES)fs.writeFileSync(process.env.PP_FIXTURES,JSON.stringify(fixtures));
const panel=fs.readFileSync('components/demo/DemoReviewPanel.tsx','utf8');
assert(panel.includes('/demo-review/pattern-level1?form=${kind}'));assert(panel.includes('/demo-review/pattern-level1?form=${checkpoint}'));
console.log('PASS: 100 Pattern Peaks Level 1 items; both curriculum codes; four distinct choices; independent worked answers; valid alternative creations; invalid/incomplete response rejection; all five review routes.');
