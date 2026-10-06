import assert from 'node:assert/strict';
import fs from 'node:fs';import path from 'node:path';import Module,{createRequire} from 'node:module';import ts from 'typescript';
const require=createRequire(import.meta.url),cache=new Map(),calls=[];
function compile(file){file=path.resolve(file);if(cache.has(file))return cache.get(file).exports;const module=new Module(file);cache.set(file,module);module.require=name=>{
 if(name==='@/lib/supabase')return {supabase:{rpc:async(name,args)=>{calls.push({name,args});return {error:new Error('test session rejected'),data:null};}}};
 if(name==='@/lib/demo-mode')return {isDemoPreviewMode:()=>false};
 if(name.startsWith('.')||name.startsWith('@/')){const base=name.startsWith('@/')?path.resolve(name.slice(2)):path.resolve(path.dirname(file),name);return compile([base,base+'.ts',base+'.tsx'].find(p=>fs.existsSync(p)&&fs.statSync(p).isFile()));}return require(name);};module._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2020}}).outputText,file);return module.exports;}
const {ADVENTURE_OUTFIT_CATALOGUE:items}=compile('lib/avatar/adventure-outfits.ts');
const {mergeAvatarOutfit,EMPTY_ECONOMY,purchaseEconomyItem,equipEconomyItem,fetchDemoEconomy}=compile('lib/economy.ts');
const {default:Avatar}=compile('components/avatar/StudentAvatar.tsx');
const React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
const sql=fs.readFileSync('supabase/migrations/20261006200000_adventure_outfit_collection.sql','utf8');
assert.equal(items.length,5);assert.deepEqual(items.map(i=>i.price),[400,450,650,750,900]);
const base={hairStyle:'locs',skin:'#87634a',face:'freckles',body:'neutral'};
for(const item of items){
 assert.ok(sql.includes(JSON.stringify(item.metadata)));assert.equal(item.metadata.slot,'avatar_outfit');
 const state={...EMPTY_ECONOMY,avatarBase:base,items:[item],equipped:{avatar_outfit:item.item_key}};
 const outfit=mergeAvatarOutfit(state);for(const [key,value] of Object.entries(base))assert.equal(outfit[key],value,'Personal features remain unchanged');
 for(const key of ['hat','cape','backpack','held','top'])assert.equal(outfit[key],item.metadata[key],'Bundle includes '+key);
 const html=renderToStaticMarkup(React.createElement(Avatar,{outfit,alive:false,floatAnimation:'none'}));assert.ok(html.includes('data-adventure-outfit="'+item.metadata.top.replace('adventure_','')+'"'),'Custom clothing renders in shop');
 assert.ok(!html.includes('NaN')&&!html.includes('undefined'),'No invalid SVG values');
 state.items.push({item_key:'custom_hat',metadata:{slot:'avatar_hat',hat:'crown'}});state.equipped.avatar_hat='custom_hat';assert.equal(mergeAvatarOutfit(state).hat,'crown','Separately equipped items override included accessories');
 delete state.equipped.avatar_outfit;assert.equal(mergeAvatarOutfit(state).top,undefined,'Unequipping removes costume');assert.equal(mergeAvatarOutfit(state).hat,'crown','Independent headwear retained');
 assert.equal(mergeAvatarOutfit({...EMPTY_ECONOMY,avatarBase:{top:item.metadata.top}}).top,'hoodie','Free base cannot grant paid garment');
}
await assert.rejects(purchaseEconomyItem('student-test',items[0].item_key),/test session rejected/);
await assert.rejects(equipEconomyItem('student-test',items[0].item_key),/test session rejected/);
assert.equal(calls[0].name,'purchase_economy_item_secure');assert.equal(calls[1].name,'equip_economy_item_secure');assert.ok(!('price' in calls[0].args));
const demo=await fetchDemoEconomy();for(const item of items)assert.ok(demo.items.some(i=>i.item_key===item.item_key));
assert.ok(!/create\s+(or\s+replace\s+)?function|grant|revoke/i.test(sql.replace(/^--.*$/gm,'')));
console.log('PASS: five outfit bundles, included accessories, personal features, layer overrides, guarded RPC failures, demo fallback and migration parity. RPCs mocked; no live student data changed.');
