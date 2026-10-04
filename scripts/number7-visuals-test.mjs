import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import {createRequire} from 'node:module';
import {loadCave7} from './cave7-loader.mjs';
const require=createRequire(import.meta.url);
const {number7ContextArt}=loadCave7('lib/number7-context-art.ts');
const {number7Question,number7Quiz}=loadCave7('data/activities/year7Number/questions.ts');
const {level7Answer,markLevel7Answer}=loadCave7('lib/level7-answer.ts');
const m={exports:{}};
new Function('require','module','exports',ts.transpileModule(fs.readFileSync('components/lesson/Number7FractionExample.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText)(name=>name==='@/components/FractionText'?{MathFormattedText:()=>null}:name==='@/components/ReadAloudBtn'?{default:()=>null}:name==='@/lib/useRealmTheme'?{getRealmTheme:()=>({})}:require(name),m,m.exports);
const walk=(e,p)=>!e?[]:Array.isArray(e)?e.flatMap(x=>walk(x,p)):typeof e!=='object'?[]:[...(p(e)?[e]:[]),...walk(e.props?.children,p)];
for(const [mode,example] of Object.entries(m.exports.FRACTION_EXAMPLES)){
 const [[n,d,shaded],[n2,d2,shaded2]]=example.fractions;
 assert.equal(n/d,shaded/12);assert.equal(n2/d2,shaded2/12);
 const [a,b]=example.answer.split('/').map(Number);
 assert.ok(Math.abs(a/b-(n/d+(mode==='addition'?1:-1)*n2/d2))<1e-10);
 let selected;const tree=m.exports.default({mode,onModeChange:value=>selected=value});
 const bars=walk(tree,e=>e.props?.className?.includes('grid-cols-12'));
 assert.equal(bars.length,2);assert.ok(bars.every(e=>e.props.children.length===12));
 const buttons=walk(tree,e=>e.type==='button');assert.equal(buttons.filter(e=>e.props['aria-pressed']).length,1);
 buttons.find(e=>!e.props['aria-pressed']).props.onClick();assert.notEqual(selected,mode);
 assert.ok(example.speech.includes(example.answer==='11/12'?'eleven twelfths':'seven twelfths'));
}
const kinds=new Set();let reviewed=0;
for(let week=1;week<=12;week++)for(let lesson=1;lesson<=3;lesson++)for(const role of ['fast_thinking','reasoning','apply_create'])for(let seed=1;seed<=20;seed++){
 const q=number7Question(week,lesson,seed*7919,role);reviewed++;
 const art=number7ContextArt(q.prompt);if(art)kinds.add(art);
 if(week===8&&lesson===1){
  const spec=level7Answer(q);assert.equal(spec.kind,'fraction');assert.ok(markLevel7Answer(spec,q.answer));
  assert.ok(!/decimal|then/.test(q.prompt));assert.equal(q.readabilityRevision,7);
  if(role==='apply_create'){
   assert.equal(art,'jug');assert.equal((q.prompt.match(/\d+\/\d+/g)||[]).length,2);
   const [n,d]=q.answer.split('/').map(Number);assert.ok(markLevel7Answer(spec,`${n*2}/${d*2}`));
  }
 }
}
assert.equal(number7ContextArt('Calculate 2/3 + 1/4.'),null);
assert.equal(number7ContextArt('What is 10²?'),null);
for(const kind of ['jug','bottle','tank','rope','bag','notebook','ticket','parcel','lights'])assert.ok(kinds.has(kind),kind);
for(const kind of kinds)assert.ok(fs.existsSync(`public/images/number-nexus/level7/objects/${kind}-v1.png`));
const quiz=number7Quiz(8);assert.equal(quiz.length,15);for(const tag of [1,2,3])assert.equal(quiz.filter(q=>q.lessonTag===tag).length,5);
console.log(`PASS ${reviewed} Number Level 7 samples across all 36 lessons; one-operation fraction questions, equivalent answers, guide toggles, exact twelfths bars, context art and balanced quiz.`);
