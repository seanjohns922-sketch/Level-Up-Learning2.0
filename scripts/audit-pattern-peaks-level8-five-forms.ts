import assert from 'node:assert/strict';import fs from 'node:fs';
import {LEVEL8_PP_FORMS} from '@/data/assessments/revisions/level8PatternPeaksFiveForms';
import {PP_FORMS,ppEmpty,ppScore,ppReady,ppVisualSpeech,type PPResponse} from '@/data/assessments/revisions/level3PatternPeaksFiveForms';
const fixtures=[];
for(const [fi,form]of PP_FORMS.entries()){
 const items=LEVEL8_PP_FORMS[form];assert.equal(items.length,30);
 for(const [i,n]of [8,10,6,6].entries())assert.equal(items.filter(q=>q.code===`AC9M8A0${i+1}`).length,n);
 for(const q of items){const f=[0,3,1,4,2][(fi+q.slot-1)%5],a=2+f%3;
 const numbers:Record<number,number[]>={3:[5+f],7:[-2*a-3,-3,3*a-3],9:[72+4*f],12:[4+f],13:[2],19:[6],24:[6],27:[3+f],30:[0,3]};
 const options:Record<number,string>={1:`${5+f}x + 4`,2:`${3+f}x + ${12+4*f}`,4:`F = 3d + ${4+f}`,5:'Every y-value increases by 2.',6:`${4+f}(x + 3)`,8:`x < ${6+f}`,10:'The line falls instead of rising; its y-intercept stays the same.',11:'4x − 5',14:'When V reaches 0 litres.',15:'The rise for each step right doubles.',16:`${5+f}p + 2q`,18:`3 × (${4+f} − 2) = ${6+3*f}`,20:'Each graph is horizontal at its b-value.',21:`${5+f}p − 4`,22:'x > 1',23:`${9+2*f}x − 6`,25:'They have the same gradient and never meet.',26:`${6+2*f}(x + 1)`,28:`x = ${4+f}`,29:'The shop introduces a discount on every item after the tenth.'};
 const runs:Record<number,number[][]>={5:[[a,1],[a,3]],10:[[a,2],[-a,2]],15:[[a,0],[2*a,0]],20:[[0,1],[0,3+f]],25:[[a,-2],[a,2]],30:[[a,3],[-a,3]]};
 const response:PPResponse={...ppEmpty(),...(q.mode==='plot'?{points:[[1,2+f%3],[3,6+f%3],[5,10+f%3]] as [number,number][]}:options[q.slot]?{choice:q.options.indexOf(options[q.slot])}:{values:numbers[q.slot].map(String)}),...(q.lab?{experiments:runs[q.slot]}:{})};
 assert(!ppReady(q,ppEmpty()));assert(ppScore(q,response),q.id);assert(!ppScore(q,{...response,skipped:true}));assert(ppVisualSpeech(q.visual).length>8);
 if(q.options.length){assert.equal(q.options.length,4);assert.equal(new Set(q.options).size,4);assert.equal(q.options.filter((_,choice)=>ppScore(q,{...response,choice})).length,1);}
 if(q.lab){assert(!ppReady(q,{...response,experiments:[]}));assert(!ppReady(q,{...response,experiments:runs[q.slot].slice(0,1)}));assert.deepEqual(q.lab.required,runs[q.slot]);}
 if(q.mode==='number'||q.mode==='labNumber')assert(!ppScore(q,{...response,values:response.values.map(n=>String(Number(n)+1))}));
 if(q.visual.kind==='graph'){const v=q.visual;assert(v.points.every(([x,y])=>x>=v.xTicks[0]&&x<=v.xTicks.at(-1)!&&y>=v.yTicks[0]&&y<=v.yTicks.at(-1)!));}
 // Independently verify the contextual bounds and equations.
 if(q.slot===24){const price=5+f,budget=price*7+3;assert(6*price+5<=budget);assert(7*price+5>budget);}
 if(q.slot===27){const x=numbers[27][0];assert.equal(4*(x+2),2*x+2*(3+f)+8);}
 fixtures.push({id:q.id,form,slot:q.slot,mode:q.mode,response,lab:q.lab});
 }
}
assert.equal(new Set(fixtures.map(q=>q.id)).size,150);
if(process.env.PP_FIXTURES)fs.writeFileSync(process.env.PP_FIXTURES,JSON.stringify(fixtures));
const panel=fs.readFileSync('components/demo/DemoReviewPanel.tsx','utf8');assert(panel.includes('/demo-review/pattern-level8?form=${kind}'));assert(panel.includes('/demo-review/pattern-level8?form=${checkpoint}'));
console.log('PASS: 150 worked responses; all four Year 8 codes; four choices; graph bounds; required digital investigations; routes.');
