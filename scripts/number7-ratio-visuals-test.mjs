import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import {createRequire} from 'node:module';
import {loadCave7} from './cave7-loader.mjs';
const require=createRequire(import.meta.url);
const {number7Question}=loadCave7('data/activities/year7Number/questions.ts');
const modelApi=loadCave7('lib/number7-ratio-visual.ts');
const {number7RatioVisual,number7RatioSpeech}=modelApi;
const m={exports:{}};
new Function('require','module','exports',ts.transpileModule(fs.readFileSync('components/activities/Number7RatioVisual.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText)(n=>n==='@/lib/number7-ratio-visual'?modelApi:n==='@/lib/useRealmTheme'?{getRealmTheme:()=>({})}:n==='@/components/ReadAloudBtn'||n==='next/image'?{default:()=>null}:require(n),m,m.exports);
const walk=(e,p)=>!e?[]:Array.isArray(e)?e.flatMap(x=>walk(x,p)):typeof e!=='object'?[]:[...(p(e)?[e]:[]),...walk(e.props?.children,p)];
const counts={crystals:0,mixture:0,sharing:0};
for(let w=1;w<=12;w++)for(let l=1;l<=3;l++)for(let seed=1;seed<=30;seed++)for(const role of ['fast_thinking','reasoning','apply_create']){
 const q=number7Question(w,l,seed*7919,role),model=number7RatioVisual(q);if(!model)continue;
 counts[model.kind]++;const given=q.prompt.match(/(\d+):(\d+)/);assert.deepEqual(model.parts,given.slice(1).map(Number));
 assert.deepEqual(number7RatioVisual({...q,answer:'do not use',explanation:'do not use'}),model);
 const tree=m.exports.default({model});
 model.parts.forEach((n,group)=>assert.equal(walk(tree,e=>e.props?.['data-ratio-part']===group).length,n));
 assert.ok(walk(tree,e=>e.props?.label==='Read diagram').length===1);
 assert.ok(number7RatioSpeech(model).includes(model.labels[0]));assert.ok(number7RatioSpeech(model).includes(model.labels[1]));
 if(model.total)assert.ok(q.prompt.includes(model.total.split(' ')[0].replace('$','')));
}
for(const [kind,count] of Object.entries(counts))assert.ok(count>0,kind);
assert.equal(number7RatioVisual({lessonId:'y6-w10-l1',prompt:'Blue:gold crystals = 2:3.'}),null);
assert.equal(number7RatioVisual({lessonId:'y7-chance-w1-l1',prompt:'Blue:gold crystals = 2:3.'}),null);
assert.equal(number7RatioVisual({lessonId:'y7-w10-l1',prompt:'Simplify the ratio 12 : 18.'}),null);
assert.equal(number7RatioVisual({lessonId:'y7-w10-l1',prompt:'Blue:gold crystals = 200:300.'}),null);
console.log('PASS ratio visuals: given quantities, rendered group counts, read-aloud, answer independence, saved-question compatibility and realm isolation.',counts);
