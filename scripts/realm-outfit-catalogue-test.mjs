import assert from 'node:assert/strict';
import fs from 'node:fs';import path from 'node:path';import Module,{createRequire} from 'node:module';import ts from 'typescript';
const require=createRequire(import.meta.url),cache=new Map(),calls=[];
function compile(file){file=path.resolve(file);if(cache.has(file))return cache.get(file).exports;const module=new Module(file);cache.set(file,module);module.require=name=>{
 if(name==='@/lib/supabase')return {supabase:{rpc:async(name,args)=>{calls.push({name,args});return {error:new Error('test session rejected'),data:null};}}};
 if(name==='@/lib/demo-mode')return {isDemoPreviewMode:()=>false};
 if(name.startsWith('.')||name.startsWith('@/')){const base=name.startsWith('@/')?path.resolve(name.slice(2)):path.resolve(path.dirname(file),name);return compile([base,base+'.ts',base+'.tsx'].find(p=>fs.existsSync(p)&&fs.statSync(p).isFile()));}return require(name);};module._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2020}}).outputText,file);return module.exports;}
const {REALM_OUTFIT_CATALOGUE:items}=compile('lib/avatar/realm-outfit-catalogue.ts');
const {mergeAvatarOutfit,EMPTY_ECONOMY,purchaseEconomyItem,equipEconomyItem,fetchDemoEconomy}=compile('lib/economy.ts');
const sql=fs.readFileSync('supabase/migrations/20261005180000_realm_outfit_collection.sql','utf8');
assert.equal(items.length,6);assert.equal(new Set(items.map(i=>i.metadata.realmCollection)).size,6);
for(const item of items){
 assert.ok(item.active&&item.purchasable&&item.price>0);assert.equal(item.metadata.slot,'avatar_outfit');assert.ok(!('held' in item.metadata),'Outfits do not grant or overwrite hand equipment');
 assert.ok(sql.includes(JSON.stringify(item.metadata)));assert.ok(sql.includes(`,${item.price},`));
 const state={...EMPTY_ECONOMY,avatarBase:{hairStyle:'locs',skin:'#87634a'},items:[item,{item_key:'owned_staff',metadata:{slot:'avatar_hand',held:'meazurex_timewielder_staff'}}],equipped:{avatar_outfit:item.item_key,avatar_hand:'owned_staff'}};
 const outfit=mergeAvatarOutfit(state);assert.equal(outfit.top,item.metadata.top);assert.equal(outfit.shoeStyle,'boots');assert.equal(outfit.skin,'#87634a');assert.equal(outfit.hairStyle,'locs');assert.equal(outfit.held,'meazurex_timewielder_staff');
 state.items.push({item_key:'other_top',metadata:{slot:'top',top:'polo'}});state.equipped.top='other_top';assert.equal(mergeAvatarOutfit(state).top,'polo','Individual clothing retains existing override priority');
}
assert.equal(mergeAvatarOutfit({...EMPTY_ECONOMY,avatarBase:{top:'realm_codemaster'}}).top,'hoodie','Free base cannot select a paid realm garment');
await assert.rejects(purchaseEconomyItem('student-test',items[0].item_key),/test session rejected/);
await assert.rejects(equipEconomyItem('student-test',items[0].item_key),/test session rejected/);
assert.equal(calls[0].name,'purchase_economy_item_secure');assert.equal(calls[1].name,'equip_economy_item_secure');assert.ok(!('price' in calls[0].args),'Client does not set purchase price');
const demo=await fetchDemoEconomy();for(const item of items)assert.ok(demo.items.some(i=>i.item_key===item.item_key));
assert.ok(!/create\s+(or\s+replace\s+)?function|grant|revoke/i.test(sql.replace(/^--.*$/gm,'')));
console.log('PASS: six priced outfits, migration parity, clothing layering, separate equipment, demo fallback and server-error propagation. Mocked RPC checks are not live database verification.');
