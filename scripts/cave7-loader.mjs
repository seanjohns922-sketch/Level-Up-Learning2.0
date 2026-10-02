import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
const cache=new Map();
export function loadCave7(file){
 file=path.resolve(file);if(cache.has(file))return cache.get(file);
 if(file.endsWith('.json'))return JSON.parse(fs.readFileSync(file,'utf8'));
 const module={exports:{}};cache.set(file,module.exports);
 const js=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;
 new Function('require','module','exports',js)(name=>{let f=name.startsWith('@/')?path.resolve(name.slice(2)):path.resolve(path.dirname(file),name);if(!path.extname(f))f+='.ts';return loadCave7(f);},module,module.exports);cache.set(file,module.exports);return module.exports;
}
