import assert from 'node:assert/strict';
import {loadCave7 as load} from './cave7-loader.mjs';
const {level7Answer,markLevel7Answer:mark}=load('lib/level7-answer.ts');
const spec=(kind,expected,format)=>({kind,expected,format,prompt:''});
assert.ok(mark(spec('fraction','1/2'),'2/4'));assert.ok(mark(spec('fraction','1/2'),'0.5'));assert.ok(mark(spec('number','-1.5'),'−1.5'));
assert.ok(!mark(spec('fraction','1/2','simplest'),'2/4'));assert.ok(mark(spec('fraction','1/2','simplest'),'1/2'));assert.ok(!mark(spec('number','0.5','decimal'),'1/2'));
assert.ok(!mark(spec('fraction','1/2'),'1/0'));assert.ok(!mark(spec('number','0'),''));assert.ok(!mark(spec('number','1'),'Infinity'));
assert.ok(mark(spec('ratio','2:3'),'4:6'));assert.ok(!mark(spec('ratio','2:3','simplest'),'4:6'));
assert.ok(mark(spec('ratio','1:2:3'),'2:4:6'));assert.ok(!mark(spec('ratio','1:2:3','simplest'),'2:4:6'));assert.ok(mark(spec('ratio','1:2:3','simplest'),'1:2:3'));assert.ok(!mark(spec('ratio','1:2:3'),'1:2'));assert.ok(!mark(spec('ratio','1:2:3'),'1:3:2'));
assert.ok(mark(spec('coordinates','(-2, 3)'),'-2, 3'));assert.ok(!mark(spec('coordinates','(-2, 3)'),'3, -2'));
assert.ok(mark(spec('expression','2(n + 3)'),'2*n+6'));assert.ok(!mark(spec('expression','2(n + 3)'),'2*n+3'));
assert.ok(!mark(spec('expression','2n'),'process.exit()'));assert.ok(mark(spec('set','1, 2, 3'),'3, 1, 2'));assert.ok(!mark(spec('set','1, 2, 3'),'1, 1, 3'));
assert.ok(mark(spec('points','(1, 2); (3, 4); (-1, 0)'),'1, 2, 3, 4, -1, 0'));
const gs={number:load('data/activities/year7Number/questions.ts').number7Question,measurement:load('data/activities/year7Measurement/questions.ts').measurement7Question,space:load('data/activities/year7Space/questions.ts').space7Question,...load('data/activities/cave7/questions.ts').CAVE7_GENERATORS};
let checked=0;
for(const [realm,generate] of Object.entries(gs)){let typed=0,total=0;for(let w=1;w<=({space:10,statistics:10,chance:8}[realm]??12);w++)for(let l=1;l<=3;l++)for(let seed=1;seed<=20;seed++)for(const role of ['fast_thinking','reasoning','apply_create']){const q=generate(w,l,seed*7919,role),s=level7Answer(q);total++;if(!s)continue;typed++;assert.ok(mark(s,s.expected),JSON.stringify({realm,w,l,role,s}));assert.ok(!mark(s,'this is not an answer'));checked++;}console.log(`${realm}: ${typed}/${total} constructed-response variants; remaining questions retain choices.`);}
assert.equal(level7Answer({lessonId:'y6-w1-l1',prompt:'1+1?',answer:'2'}),null);
console.log(`PASS ${checked} generated answer contracts; equivalent fractions, signs, ratios, coordinate order, expressions, sets, invalid input and lower-level isolation.`);

// Comparison inputs must retain all givens, including previously saved questions.
for(let seed=1;seed<=500;seed++){
 const q=gs.number(5,1,seed,'fast_thinking'),s=level7Answer(q); // Integers are Number week 5.
 const values=s.prompt.match(/-?\d+/g).map(Number);
 assert.equal(values.length,4);assert.equal(Number(q.answer),Math.min(...values));
 for(const value of new Set(values))assert.equal(mark(s,String(value)),value===Math.min(...values));
}
const restored=level7Answer({lessonId:'y7-w9-l1',prompt:'Which integer is smallest?',answer:'-12',options:['0','5','-12','-3']});
assert.equal(restored.prompt,'Which integer is smallest: 0, 5, -12, -3?');
assert.ok(mark(restored,'-12'));assert.ok(!mark(restored,'-3'));
assert.equal(level7Answer({lessonId:'y7-w9-l1',prompt:'Which integer is smallest?',answer:'-12'}),null);
console.log('PASS integer comparison givens remain visible in generated and restored typed questions.');
// Mixed numbers: accepted wherever the value is right, including simplest-form answers.
{
 const spec=level7Answer({lessonId:'y7-w8-l1',prompt:'Calculate 2 2/3 + 1 3/4.',answer:'4 5/12'});
 assert.equal(spec.kind,'fraction');
 for(const r of ['4 5/12','53/12'])assert.ok(mark(spec,r),r);
 for(const r of ['4 5','4 6/12x','5 5/12'])assert.ok(!mark(spec,r),r);
 const simplest={...spec,format:'simplest',expected:'4 1/2'};
 assert.ok(mark(simplest,'4 1/2'));assert.ok(mark(simplest,'9/2'));
 assert.ok(!mark(simplest,'4 2/4'));assert.ok(!mark(simplest,'3 3/2'));
 console.log('PASS mixed-number answers: 4 5/12 and 53/12 both accepted; simplest form still enforced.');
}
// Build tasks: any model with the right views is accepted; fewest and exact also check the cube count.
{
 const spec=(build)=>level7Answer({lessonId:'y7-space-w2-l2',prompt:'Build a model.',answer:'0,0,0,0,0,0',build});
 const views=spec({mode:'views',front:[2,1,3],side:[3,2]});
 assert.equal(views.kind,'build');
 for(const r of ['2,1,3,0,0,2','0,0,3,2,1,0','2,1,3,1,1,2'])assert.ok(mark(views,r),r);
 for(const r of ['2,1,3,0,0,0','3,1,2,0,0,1','2,1,3,0,0,5'])assert.ok(!mark(views,r),r);
 const fewest=spec({mode:'fewest',front:[2,1,3],side:[3,2]});
 assert.ok(mark(fewest,'0,0,3,2,1,0'));assert.ok(!mark(fewest,'2,1,3,0,0,2'));
 const exact=spec({mode:'exact',front:[2,1,3],side:[3,2],cubes:8});
 assert.ok(mark(exact,'2,1,3,0,0,2'));assert.ok(!mark(exact,'0,0,3,2,1,0'));
 assert.ok(mark(spec({mode:'plan',plan:[1,0,2,3,1,0]}),'1,0,2,3,1,0'));assert.ok(!mark(spec({mode:'plan',plan:[1,0,2,3,1,0]}),'1,0,2,3,0,1'));
 console.log('PASS build tasks: alternative models accepted; fewest and exact cube counts enforced.');
}
