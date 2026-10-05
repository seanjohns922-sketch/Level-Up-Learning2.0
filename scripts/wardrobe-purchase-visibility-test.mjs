import assert from 'node:assert/strict';
import fs from 'node:fs';import path from 'node:path';import Module,{createRequire} from 'node:module';import ts from 'typescript';
import React from 'react';import {renderToStaticMarkup} from 'react-dom/server';
const require=createRequire(import.meta.url),cache=new Map(),calls=[];
let fixture,hookIndex=0,server,captureEffects=false,delayFetch=false;
const effects=[],updates=[],refs=[],pendingFetch=[];
function compile(file){file=path.resolve(file);if(cache.has(file))return cache.get(file).exports;const m=new Module(file);cache.set(file,m);m.require=name=>{
 if(name==='react')return {...React,useMemo:fn=>fn(),useRef:v=>{const ref={current:v};if(captureEffects)refs.push(ref);return ref;},useEffect:fn=>{if(captureEffects)effects.push(fn);},useState:initial=>{const index=hookIndex++;return [index===1?fixture:typeof initial==='function'?initial():initial,v=>{if(index===1)updates.push(v);}];}};
 if(name==='next/navigation')return {useRouter:()=>({push:()=>{}})};
 if(name==='@/lib/studentIdentity')return {getActiveStudentProfile:()=>({studentId:'test-student',displayName:'Test'})};
 if(name==='@/lib/avatar-appearance')return {persistCanonicalAvatarAppearance:()=>{}};
 if(name==='@/lib/demo-mode')return {isDemoPreviewMode:()=>false};
 if(name==='@/lib/supabase')return {supabase:{rpc:async(name,args)=>{calls.push({name,args});if(name==='get_student_economy_secure'&&delayFetch)return new Promise(resolve=>pendingFetch.push(resolve));if(name==='purchase_economy_item_secure'){server={...server,inventory:[...server.inventory,{item_key:args.p_item_key,acquired_at:'2026-10-06',acquisition_type:'purchase'}]};}return {data:server,error:null};}}};
 if(name==='@/components/avatar/StudentAvatar')return {default:({outfit})=>React.createElement('span',{'data-preview':JSON.stringify(outfit)})};
 if(name==='@/components/economy/EconomyHeader'||name==='@/components/economy/RealmItemFilter')return {default:()=>null};
 if(name.startsWith('.')||name.startsWith('@/')){const base=name.startsWith('@/')?path.resolve(name.slice(2)):path.resolve(path.dirname(file),name);return compile([base,base+'.tsx',base+'.ts'].find(p=>fs.existsSync(p)&&fs.statSync(p).isFile()));}
 return require(name);
 };m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2020}}).outputText,file);return m.exports;
}
const {AVATAR_LAYER_SLOTS,EMPTY_ECONOMY,purchaseEconomyItem,fetchStudentEconomy}=compile('lib/economy.ts');
const {REALM_OUTFIT_CATALOGUE}=compile('lib/avatar/realm-outfit-catalogue.ts');
const base=REALM_OUTFIT_CATALOGUE[0];
const items=AVATAR_LAYER_SLOTS.map((slot,i)=>({...base,item_key:`test_${slot}`,name:`Test ${slot}`,sort_order:i,metadata:{slot,...(slot==='avatar_outfit'?{top:'realm_codemaster'}:slot==='avatar_hand'?{held:'meazurex_timewielder_staff'}:{})}}));
server={...EMPTY_ECONOMY,items,inventory:[],equipped:{}};
const Page=compile('app/wardrobe/page.tsx').default;
function render(state){fixture=state;hookIndex=0;return renderToStaticMarkup(React.createElement(Page));}
let html=render(server);
for(const slot of AVATAR_LAYER_SLOTS){assert.ok(html.includes(`id="wardrobe-${slot}"`),`Every avatar slot is reachable: ${slot}`);assert.ok(html.includes(`title="Test ${slot}"`),`Catalogue item is rendered: ${slot}`);}
for(const slot of ['avatar_outfit','avatar_hand']){
 const next=await purchaseEconomyItem('test-student',`test_${slot}`);
 html=render(next);
 const tile=html.match(new RegExp(`<button[^>]*title="Test ${slot}"[\\s\\S]*?</button>`))[0];
 assert.ok(tile.includes('Owned'),`Purchased ${slot} immediately appears owned`);
 assert.ok(!tile.includes('lucide-lock'),`Purchased ${slot} is unlocked`);
}
const reloaded=await fetchStudentEconomy('test-student');assert.equal(reloaded.inventory.length,2,'Ownership remains after returning to the wardrobe');
const equipped={...reloaded,equipped:{avatar_outfit:'test_avatar_outfit',avatar_hand:'test_avatar_hand'}};
html=render(equipped);assert.ok(html.includes('Equipped'));assert.ok(html.includes('meazurex_timewielder_staff'),'Held preview uses the purchased item');
const requests=calls.filter(c=>c.name==='purchase_economy_item_secure');assert.equal(requests.length,2);assert.ok(requests.every(c=>c.args.p_student_id==='test-student'&&!('price' in c.args)));
console.log('PASS: actual wardrobe page renders every avatar slot; mocked purchase responses unlock outfits and held items and persist on reload. No live student data changed.');

const listeners=new Map();
globalThis.window={addEventListener:(type,fn)=>listeners.set(type,fn),removeEventListener:type=>listeners.delete(type),localStorage:{getItem:()=>null}};
globalThis.document={visibilityState:'visible',addEventListener:(type,fn)=>listeners.set(type,fn),removeEventListener:type=>listeners.delete(type)};
captureEffects=true;render(null);const cleanup=effects[0]();const tick=()=>new Promise(resolve=>setImmediate(resolve));await tick();
server={...server,inventory:[...server.inventory,{item_key:'test_avatar_hat',acquired_at:'2026-10-06',acquisition_type:'purchase'}]};
listeners.get('focus')();await tick();assert.ok(updates.at(-1).inventory.some(i=>i.item_key==='test_avatar_hat'),'Returning from shop refreshes existing wardrobe tab');
delayFetch=true;listeners.get('focus')();listeners.get('focus')();
const latest={...server,wallet:{...server.wallet,xp_balance:321}};
pendingFetch[1]({data:latest,error:null});await tick();pendingFetch[0]({data:server,error:null});await tick();assert.equal(updates.at(-1).wallet.xp_balance,321,'Out-of-order response cannot replace latest inventory');
const count=updates.length;listeners.get('focus')();refs[0].current={...refs[0].current,avatarBase:{hairStyle:'bun'}};pendingFetch[2]({data:server,error:null});await tick();assert.equal(updates.length,count,'Refresh cannot overwrite a newer local outfit edit');
cleanup();assert.equal(listeners.size,0,'Refresh listeners are removed on navigation');delete globalThis.window;delete globalThis.document;
console.log('PASS: focus refresh, stale-response protection and edit preservation.');
