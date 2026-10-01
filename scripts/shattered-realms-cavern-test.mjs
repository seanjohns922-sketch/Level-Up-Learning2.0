import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
const module={exports:{}};
new Function('module','exports',ts.transpileModule(fs.readFileSync('lib/world3d/shattered-realms.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText)(module,module.exports);
const {CAVERN_REALMS,cavernRealm,cavernWeek,cavernDoor,cavernSpawn,cavernFloor,cavernNearest,cavernDarkness,cavernHref,cavernWeekHref}=module.exports;
assert.equal(Object.keys(CAVERN_REALMS).length,6);
for(const realm of Object.keys(CAVERN_REALMS)){
 assert.equal(cavernRealm(realm),realm);
 for(let week=1;week<=12;week++){
  const door=cavernDoor(week),spawn=cavernSpawn(week);
  assert.equal(cavernFloor(door[0],door[2]),0);
  assert.equal(cavernFloor(spawn[0],spawn[2]),0);
  assert.equal(cavernNearest(door[0],door[2]),week);
  const href=new URL(cavernWeekHref(realm,week),'https://example.test');
  assert.equal(href.pathname,`/demo-review/shattered-realms/${realm}/week`);assert.equal(href.searchParams.get('realm_id'),realm);
  assert.equal(href.searchParams.get('year'),'Year 7');assert.equal(href.searchParams.get('week'),String(week));
  assert.equal(href.searchParams.get('expedition'),'1');assert.equal(href.searchParams.get('teacher_preview'),'1');
  assert.match(cavernHref(realm,week),new RegExp(`/shattered-realms/${realm}\\?week=${week}$`));
 }
}
for(let z=16;z>=-204;z-=.25)assert.equal(cavernFloor(0,z),0,'The whole weekly path stays connected');
assert.equal(cavernFloor(8,0),null);assert.equal(cavernFloor(0,-205),null);
assert.equal(cavernDarkness(-8),0);assert.equal(cavernDarkness(-184),1);
for(let z=-8;z>-184;z--)assert(cavernDarkness(z)>=0&&cavernDarkness(z)<=cavernDarkness(z-1));
for(const bad of ['patterns','constructor','toString','unknown'])assert.equal(cavernRealm(bad),null);
for(const bad of [0,13,-1,NaN,'nope',1.5])assert.equal(cavernWeek(bad),1);
const route=fs.readFileSync('app/demo-review/shattered-realms/[realm]/page.tsx','utf8');
assert.match(route,/if\(!access.allowed\)redirect\('\/login'\)/);
const program=fs.readFileSync('app/program/page.tsx','utf8');
assert.match(program,/if\(\(isExpeditionWeek && !isNumber7\) \|\| item.comingSoon\) return/);
assert.match(program,/isStarpathRealm && !isExpeditionWeek \? getStarpathWeekProgram/);
assert.match(program,/if \(isExpeditionWeek \|\| isStarpathRealm \|\| !previewMode\) return/);
console.log('PASS all 72 week destinations, return links, continuous cavern floor, darkness, input validation, preview guards and unavailable lesson isolation');

const weekRoute=fs.readFileSync('app/demo-review/shattered-realms/[realm]/week/page.tsx','utf8');
assert.match(weekRoute,/if\(!access.allowed\)redirect\('\/login'\)/);
assert.match(weekRoute,/import ProgramPage from '@\/app\/program\/page'/);
assert.match(program,/!pathname.startsWith\("\/demo-review\/shattered-realms\/"\)/);
console.log('PASS server-authorised week preview reuses the real program page; public program flag cannot expose it');
// Execute the server route with session outcomes, rather than relying only on source markers.
function loadWeekRoute(allowed){
 const target={exports:{}};
 const code=ts.transpileModule(weekRoute,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;
 new Function('require','module','exports',code)((name)=>{
  if(name==='next/navigation')return {redirect:url=>{throw new Error(`redirect:${url}`);},notFound:()=>{throw new Error('not-found');}};
  if(name==='@/lib/demo-session-server')return {getServerStarpathAccess:async()=>({allowed})};
  if(name==='@/lib/world3d/shattered-realms')return module.exports;
  if(name==='@/app/program/page')return {default:'SharedProgramPage'};
  if(name==='react/jsx-runtime')return {jsx:(type,props)=>({type,props})};
  throw new Error(`Unexpected route dependency ${name}`);
 },target,target.exports);
 return target.exports.default;
}
const request=(realm,week=1,overrides={})=>({params:Promise.resolve({realm}),searchParams:Promise.resolve({realm_id:realm,year:'Year 7',week:String(week),legacy:'1',teacher_preview:'1',expedition:'1',...overrides})});
await assert.rejects(()=>loadWeekRoute(false)(request('number')),/redirect:\/login/);
await assert.rejects(()=>loadWeekRoute(true)(request('unknown')),/not-found/);
await assert.rejects(()=>loadWeekRoute(true)(request('space',1,{realm_id:'number',year:'Year 1'})),/redirect:\/demo-review\/shattered-realms\/space\/week/);
for(const realm of Object.keys(CAVERN_REALMS))for(const week of [1,12])assert.equal((await loadWeekRoute(true)(request(realm,week))).type,'SharedProgramPage');
console.log('PASS unauthorised sessions rejected, invalid realms rejected, query tampering canonicalised, all six realms render the shared week page');
