import fs from 'node:fs';
import ts from 'typescript';
const cache=new Map();
export function loadMeasurement7(name){
 if(!['curriculum','questions','polygonVisual','level7-quiz'].includes(name))throw Error('Unexpected module');
 if(cache.has(name))return cache.get(name);
 const module={exports:{}};
 const js=ts.transpileModule(fs.readFileSync(name==='level7-quiz'?'lib/level7-quiz.ts':`data/activities/year7Measurement/${name}.ts`,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 new Function('require','module','exports',js)(p=>loadMeasurement7(p==='@/lib/level7-quiz'?'level7-quiz':p.replace('./','')),module,module.exports);
 cache.set(name,module.exports);return module.exports;
}
