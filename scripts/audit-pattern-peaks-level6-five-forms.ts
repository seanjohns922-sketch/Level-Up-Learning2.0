import assert from 'node:assert/strict';
import fs from 'node:fs';
import {LEVEL6_PP_FORMS} from '@/data/assessments/revisions/level6PatternPeaksFiveForms';
import {PP_FORMS,PP_OPERATIONS,ppEmpty,ppReady,ppScore,ppVisualSpeech,type PPResponse} from '@/data/assessments/revisions/level3PatternPeaksFiveForms';
const fixtures=[];
for(const [fi,form] of PP_FORMS.entries()){
 const items=LEVEL6_PP_FORMS[form];assert.equal(items.length,20);
 for(const [code,n]of [['AC9M6A01',7],['AC9M6A02',7],['AC9M6A03',6]] as const)assert.equal(items.filter(q=>q.code===code).length,n);
 for(const q of items){
 const f=[0,3,1,4,2][(fi+q.slot-1)%5],r=2+f%3,g=14+3*f;
 const answers:Record<number,number[]>={1:[4*r+1],2:[30+3*f],3:[3.25+f/2],4:[16+3*f],5:[7+f],7:[g%2===0?g/2+3:(g+3)*2],9:[12*r+1],11:[30+3*f],12:[4.5+f/2],13:[4*(3+f),5*(3+f)],14:[48+16*f],16:[26+7*f],17:[9+f],19:[10+2*f,6]};
 const options:Record<number,string>={6:`${5+f}/4`,8:`(${5+f} + 3) × 4`,10:`Multiply by ${3+f}, then add 2.`,15:'Multiply by 2 each time.',18:`Multiply the stage number by ${r}, then add 1.`};
 const response:PPResponse=q.mode==='algorithm'?{...ppEmpty(),operations:f%2?['Add 5','Double']:['Double','Add 5']}:q.mode==='choice'?{...ppEmpty(),choice:q.options.indexOf(options[q.slot])}:{...ppEmpty(),values:answers[q.slot].map(String)};
 assert(!ppReady(q,ppEmpty()));assert(ppScore(q,response),q.id);assert(ppVisualSpeech(q.visual).length>5);
 if(q.slot===8){const a=5+f;assert.equal([(a+3)*4,a+12,a*3+4,a*7].filter(n=>n===(a+3)*4).length,1);}
 if(q.decimal)assert(ppScore(q,{...response,values:[Number(response.values[0]).toFixed(2)]}));
 if(q.mode==='choice'){assert.equal(q.options.length,4);assert.equal(new Set(q.options).size,4);assert.equal(q.options.filter((_,i)=>ppScore(q,{...ppEmpty(),choice:i})).length,1);}
 if(q.mode==='number'){assert(!ppScore(q,{...response,values:[String(Number(response.values[0])+1)]}));assert(!ppReady(q,{...ppEmpty(),values:['NaN']}));}
 if(q.mode==='linearPair')for(let a=0;a<=21;a++)for(let b=0;b<=21;b++)assert.equal(ppScore(q,{...ppEmpty(),values:[String(a),String(b)]}),a>=1&&a<=20&&b>=1&&b<=20&&3*a+b===36+6*f);
 if(q.mode==='algorithm'){for(const a of PP_OPERATIONS)for(const b of PP_OPERATIONS){const run=(x:number,op:string,original:number)=>op==='Double'?x*2:op==='Halve'?x/2:op==='Add 5'?x+5:x+original;const expected=[0,1,2,7,15].every(x=>run(run(x,a,x),b,x)===2*x+(f%2?10:5));assert.equal(ppScore(q,{...ppEmpty(),operations:[a,b]}),expected);}}
 fixtures.push({id:q.id,form,slot:q.slot,mode:q.mode,response});
 }
}
assert.equal(new Set(fixtures.map(q=>q.id)).size,100);
if(process.env.PP_FIXTURES)fs.writeFileSync(process.env.PP_FIXTURES,JSON.stringify(fixtures));
console.log('PASS: 100 Level 6 worked answers; three-code coverage; four options; decimals; alternate pairs; exhaustive two-step algorithms.');
