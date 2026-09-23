import assert from 'node:assert/strict';import fs from 'node:fs';
import {LEVEL7_PP_FORMS} from '@/data/assessments/revisions/level7PatternPeaksFiveForms';
import {PP_FORMS,ppEmpty,ppReady,ppScore,ppVisualSpeech,type PPResponse} from '@/data/assessments/revisions/level3PatternPeaksFiveForms';
const fixtures=[];
for(const [fi,form]of PP_FORMS.entries()){
 const items=LEVEL7_PP_FORMS[form];assert.equal(items.length,30);
 for(let c=1;c<=6;c++)assert.equal(items.filter(q=>q.code===`AC9M7A0${c}`).length,5);
 for(const q of items){const f=[0,3,1,4,2][(fi+q.slot-1)%5],m=2+f%3;
 const expected:Record<number,number[]>={1:[19+4*f],3:[6+f],5:[m+2,3*m+2,5*m+2],7:[48+6*f],9:[7+f],12:[20+5*f],13:[90+15*f],21:[12+2*f],25:[63+12*f],27:[7+f],29:[8+f],30:[5+f%3]};
 const options:Record<number,string>={2:`3(n + ${4+f})`,4:['The Census count increases as the Census year increases.','Each later Census has a larger count.','The later Census counted more people.','Later Census years have higher counts.','The count rises from one Census to the next.'][f],6:'Volume doubles.',8:`4n + ${5+f}`,10:'The distance from home stays the same.',11:`T = ${m}n + 1`,14:'Add n and a, then double the total.',15:`5 × ${5+f} − 3 = ${22+5*f}`,16:'Minutes 2–4',18:'It becomes four times as large.',19:'The number of behinds',20:`2n + ${6+2*f}`,22:'The traveller gets closer to home.',23:`y = ${m}x + 1`,24:'Halve the width.',26:`n(p − ${2+f})`,28:'No. Only the three labelled Census years were observed here.'};
 const runs:Record<number,number[][]>={6:[[3+f,2,3],[3+f,2,6]],12:[[20+5*f,2],[20+5*f,3]],18:[[2+f,2,3],[4+2*f,4,3]],24:[[3+f,4,2],[6+2*f,2,2]],30:[[3+f,2,2],[3+f,2,5+f%3]]};
 const response:PPResponse={...ppEmpty(),...(q.mode==='plot'?{points:[[1,2+f%3],[3,6+f%3],[5,10+f%3]] as [number,number][]}:options[q.slot]?{choice:q.options.indexOf(options[q.slot])}:{values:expected[q.slot].map(String)}),...(q.lab?{experiments:runs[q.slot]}:{})};
 assert(!ppReady(q,ppEmpty()));assert(ppScore(q,response),q.id);assert(!ppScore(q,{...response,skipped:true}));assert(ppVisualSpeech(q.visual).length>10);
 if(q.options.length){assert.equal(q.options.length,4);assert.equal(new Set(q.options).size,4,q.id);assert.equal(q.options.filter((_,i)=>ppScore(q,{...response,choice:i})).length,1);}
 if(q.lab){assert(!ppReady(q,{...response,experiments:[]}));assert(!ppReady(q,{...response,experiments:runs[q.slot].slice(0,1)}));const [first,last]=runs[q.slot].map(row=>row.reduce((p,n)=>p*n,1));if(q.slot===6)assert.equal(last/first,2);if(q.slot===12)assert.equal(last-first,expected[12][0]);if(q.slot===18)assert.equal(last/first,4);if(q.slot===24)assert.equal(last,first);if(q.slot===30)assert.equal(last,(3+f)*2*expected[30][0]);}
 if(q.mode==='plot'){assert(ppScore(q,{...response,points:[...response.points!].reverse()}));assert(!ppScore(q,{...response,points:[[1,3],[1,3],[1,3]]}));assert(!ppScore(q,{...response,points:[[1,13],[3,6],[5,10]]}));}
 if(q.visual.kind==='graph'){const v=q.visual;assert(v.points.every(([x,y])=>x>=v.xTicks[0]&&x<=v.xTicks.at(-1)!&&y>=v.yTicks[0]&&y<=v.yTicks.at(-1)!));}
 if(q.slot===2){const a=4+f;const candidates=[(n:number)=>3*(n+a),(n:number)=>3*n+a,(n:number)=>n+3*a,(n:number)=>a*(n+3)];assert.equal(candidates.filter(fn=>[1,2,7].every(n=>fn(n)===3*(n+a))).length,1);}
 if(q.slot===15){const x=5+f;assert.equal([5*x-3,5*(x-3),5+x-3,5*x+3].filter(n=>n===5*x-3).length,1);}
 if(q.mode==='number'||q.mode==='labNumber')assert(!ppScore(q,{...response,values:response.values.map(n=>String(Number(n)+1))}));
 fixtures.push({id:q.id,form,slot:q.slot,mode:q.mode,response,lab:q.lab});
 }
}
assert.equal(new Set(fixtures.map(q=>q.id)).size,150);
if(process.env.PP_FIXTURES)fs.writeFileSync(process.env.PP_FIXTURES,JSON.stringify(fixtures));
const panel=fs.readFileSync('components/demo/DemoReviewPanel.tsx','utf8');assert(panel.includes('/demo-review/pattern-level7?form=${kind}'));assert(panel.includes('/demo-review/pattern-level7?form=${checkpoint}'));
console.log('PASS: 150 worked responses, six codes evenly covered, four unique choices, graph bounds, plotted points and formula experiments, five entry routes.');
