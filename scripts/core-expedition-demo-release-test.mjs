import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
function load(file,deps){const m={exports:{}};new Function('require','module','exports',ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText)(n=>{if(n.endsWith('.css'))return {};if(n==='react/jsx-runtime')return {jsx:(type,props)=>({type,props})};if(n in deps)return deps[n];throw Error(n);},m,m.exports);return m.exports;}
const go=url=>{throw Error(`redirect:${url}`);};
for(const live of [false,true])for(const demo of [false,true]){
 const deps={'next/navigation':{redirect:go,notFound:()=>{throw Error('not-found');}},'@/lib/level7-release':{LEVEL7_LIVE:live},'@/lib/demo-session-server':{getServerStarpathAccess:async()=>({allowed:demo})},'@/components/world3d/CoreExpeditionEntry':{default:'server-verified-entry'}};
 const page=load('app/world/expedition/page.tsx',deps).default;
 if(live)assert.equal((await page()).type,'server-verified-entry');else await assert.rejects(page(),new RegExp(demo?'redirect:/demo-review/number-adventure/3d':'redirect:/world/tower'));
 const cavern=load('app/world/expedition/[realm]/page.tsx',{...deps,'@/lib/world3d/shattered-realms':{cavernRealm:r=>['number','space'].includes(r)?r:null,cavernWeek:v=>Number(v)||1}}).default;
 const request=realm=>({params:Promise.resolve({realm}),searchParams:Promise.resolve({week:'2'})});
 if(live){assert.deepEqual((await cavern(request('space'))).props,{realm:'space',week:2});await assert.rejects(cavern(request('unknown')),/not-found/);}else await assert.rejects(cavern(request('space')),/redirect:\/world\/tower/);
}
// The server endpoint, not browser progress, authorises each realm.
const studentId='00000000-0000-0000-0000-000000000001';let reads=0;
for(const live of [false,true]){
 const {POST}=load('app/api/world/expedition-access/route.ts',{'@/lib/level7-release':{LEVEL7_LIVE:live},'@/lib/world3d/shattered-realms':{cavernRealm:r=>['number','space'].includes(r)?r:null},'@/lib/world3d/expedition-access-server':{readStudentExpeditionAccess:async(id,token)=>{reads++;if(id!==studentId||token!=='valid-session')throw Error('denied');return {level7:['number'],level8:[]};}}});
 const req=(token,body={studentId})=>new Request('http://localhost/api/world/expedition-access',{method:'POST',headers:{'Content-Type':'application/json',...(token?{'x-student-session':token}:{})},body:JSON.stringify(body)});
 assert.equal((await POST(req(null))).status,live?401:404);
 assert.equal((await POST(req('bad-session'))).status,live?403:404);
 assert.equal((await POST(req('valid-session',{studentId:'00000000-0000-0000-0000-000000000002'}))).status,live?403:404);
 assert.equal((await POST(req('valid-session',{studentId,realm:'space'}))).status,live?403:404);
 const ok=await POST(req('valid-session',{studentId,realm:'number'}));assert.equal(ok.status,live?200:404);assert.equal(ok.headers.get('Cache-Control'),'no-store');
 if(!live)assert.equal(reads,0);
}
const tower=fs.readFileSync('components/world3d/TowerRealmChamber.tsx','utf8');assert.match(tower,/preview\|\|\(LEVEL7_LIVE&&earnedExpedition\)/);
const cavern=fs.readFileSync('components/world3d/ShatteredRealmCavern.tsx','utf8');assert.match(cavern,/getPlayableWeeks\(store,'Year 7'/);assert.match(cavern,/if\(live&&!playable.includes\(target\)\)return/);assert.match(cavern,/level7LiveHref\(realm,target,'week'\)/);
const preview=fs.readFileSync('app/demo-review/number-adventure/3d/page.tsx','utf8');assert.match(preview,/if \(!access.allowed\) redirect\('\/login'\)/);
console.log('PASS release on/off, demo boundary, student-session and cross-student rejection, realm-specific access, shared canonical week gates.');
