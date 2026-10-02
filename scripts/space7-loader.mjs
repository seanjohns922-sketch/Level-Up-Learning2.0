import fs from 'node:fs';
import ts from 'typescript';
const cache=new Map();
export function loadSpace7(name){
 const file=name==='nets'?'data/activities/starpath/level5/nets.ts':`data/activities/year7Space/${name}.ts`;
 if(!['curriculum','questions','nets'].includes(name))throw Error('Unexpected module '+name);
 if(cache.has(name))return cache.get(name);
 const module={exports:{}};
 const js=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 new Function('require','module','exports',js)(p=>loadSpace7(p.endsWith('/nets')?'nets':p.replace('./','')),module,module.exports);
 cache.set(name,module.exports);return module.exports;
}
