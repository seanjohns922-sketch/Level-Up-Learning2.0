import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import Module,{createRequire} from 'node:module';
import ts from 'typescript';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import sharp from 'sharp';
const require=createRequire(import.meta.url),cache=new Map();
function compile(file){
 file=path.resolve(file);if(file.endsWith('.json'))return {default:JSON.parse(fs.readFileSync(file,'utf8'))};if(cache.has(file))return cache.get(file).exports;
 const module=new Module(file);cache.set(file,module);
 module.require=(name)=>{
  if(name==='@react-three/drei')return {useTexture:()=>null};
  if(name.startsWith('.')||name.startsWith('@/')){const base=name.startsWith('@/')?path.resolve(name.slice(2)):path.resolve(path.dirname(file),name);const found=[base,base+'.tsx',base+'.ts'].find(p=>fs.existsSync(p)&&fs.statSync(p).isFile());if(found)return compile(found);}
  return require(name);
 };
 module._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2020}}).outputText,file);return module.exports;
}
const {default:Avatar}=compile('components/avatar/StudentAvatar.tsx');
const {ADVANCED_HAIR}=compile('components/avatar/AdvancedHair.tsx');
const {CHARACTER_GEAR_KEYS}=compile('components/avatar/CharacterRelicGear.tsx');
const render=outfit=>renderToStaticMarkup(React.createElement(Avatar,{outfit,height:320,alive:false,floatAnimation:'none'}));
const {REALM_OUTFITS}=compile('lib/avatar/realm-outfits.ts');
const variations=[...ADVANCED_HAIR.map(hairStyle=>({name:hairStyle,outfit:{hairStyle}})),...CHARACTER_GEAR_KEYS.map((held,i)=>({name:['Meazurex’s staff','Equationator’s calculator','Starweaver’s orb','Codemaster’s gauntlet','Insightkeeper’s tablet','Chanzia’s die'][i],outfit:{held,hairStyle:ADVANCED_HAIR[i],shirt:['#51347e','#287f9b','#7344bb','#372546','#e2d3bd','#392148'][i],shirtTrim:'#e5c577'}})),...['wink','calm','confident'].map(face=>({name:face,outfit:{face,hairStyle:'fade'}}))];
for(const item of REALM_OUTFITS){const outfit={top:`realm_${item.key}`,shirt:item.colour,shirtTrim:item.trim,pants:item.pants,shoes:item.shoes,shoeStyle:'boots',held:item.held,hairStyle:'fade'};assert.ok(render(outfit).includes(`data-realm-outfit="${item.key}"`));variations.unshift({name:item.name,outfit});}
if(process.env.AVATAR_FIT_REVIEW){
 variations.splice(0,variations.length,...['hoodie','tshirt','polo','jumper','jacket','dress'].flatMap(top=>['sneakers','boots','sandals','hightops'].map((shoeStyle,i)=>({name:`${top} / ${shoeStyle}`,outfit:{top,shoeStyle,bottom:['joggers','jeans','shorts','skirt'][i],hairStyle:'fade'}}))),...REALM_OUTFITS.map(item=>({name:item.name,outfit:{top:`realm_${item.key}`,shirt:item.colour,shirtTrim:item.trim,pants:item.pants,shoes:item.shoes,shoeStyle:'boots',hairStyle:'fade'}})));
}
const markup=renderToStaticMarkup(React.createElement('div',null,variations.map(({outfit},i)=>React.createElement(Avatar,{key:i,outfit,alive:false}))));
const ids=[...markup.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length,'Avatar gradients remain unique when rendered together');
for(const held of CHARACTER_GEAR_KEYS)assert.ok(render({held}).includes(`data-character-gear="${held}"`),'Recognisable held art: '+held);
for(const hairStyle of ADVANCED_HAIR)assert.ok(render({hairStyle}).includes('data-layer="hair-image"'));
function svgOf(html){return html.match(/<svg[\s\S]*?<\/svg>/)[0].replace(/href="(\/avatars\/[^\"]+)"/g,(_,src)=>`href="data:image/png;base64,${fs.readFileSync('public'+src).toString('base64')}"`);}
// Transparent gaps at the neckline made heads appear detached from clothing.
for(const top of ['hoodie','tshirt','polo','jumper','jacket','dress',...REALM_OUTFITS.map(item=>`realm_${item.key}`)]){
 const {data,info}=await sharp(Buffer.from(svgOf(render({top})))).resize(120,220).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 assert.ok(data[(94*info.width+60)*4+3]>200,`Neck meets collar: ${top}`);
 if(top!=='dress')assert.ok(data[(104*info.width+30)*4+3]>200,`Shoulder seam is filled: ${top}`);
}
const hairSamples=await Promise.all(['#4a2e1c','#267bc4'].map(hair=>sharp(Buffer.from(svgOf(render({hairStyle:'swept',hair})))).png().toBuffer()));
assert.notDeepEqual(hairSamples[0],hairSamples[1],'Rendered PNG hair responds to the colour picker');
const destination=process.env.AVATAR_FIT_REVIEW ? `output/world3d-audit/clothing-fit-${process.env.AVATAR_FIT_REVIEW}.png` : 'output/world3d-audit/avatar-upgrade.png';fs.mkdirSync(path.dirname(destination),{recursive:true});
const layers=[];
for(let i=0;i<variations.length;i++){
 const item=variations[i],input=await sharp(Buffer.from(svgOf(render(item.outfit)))).resize({height:320}).png().toBuffer();
 layers.push({input,left:i%3*300+62,top:Math.floor(i/3)*370+10});
 const caption=Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="300" height="40"><text x="150" y="25" text-anchor="middle" fill="#24392f" font-family="Arial" font-weight="bold" font-size="15">${item.name}</text></svg>`);
 layers.push({input:caption,left:i%3*300,top:Math.floor(i/3)*370+325});
}
await sharp({create:{width:900,height:Math.ceil(variations.length/3)*370,channels:4,background:'#f3f0e7'}}).composite(layers).png().toFile(destination);
console.log('PASS: new hair and character gear render, coloured image hair changes pixels, and multi-avatar gradient IDs stay unique. Review sheet: '+destination);
const THREE=await import('three');
const {RealmOutfitDetails}=compile('components/world3d/RealmOutfitDetails.tsx');
const {ExplorerAvatarHead,ExplorerCharacterGear}=compile('components/world3d/ExplorerAvatarDetails.tsx');
const {DEFAULT_OUTFIT}=compile('components/avatar/StudentAvatar.tsx');
function attach(element,parent){
 if(element==null||typeof element==='boolean')return;
 if(Array.isArray(element)){element.forEach(child=>attach(child,parent));return;}
 const {type,props}=element;if(type===React.Fragment||type===React.Suspense){attach(props.children,parent);return;}if(typeof type==='function'){attach(type(props),parent);return;}
 if(type.endsWith('Geometry')){const C=THREE[type[0].toUpperCase()+type.slice(1)];parent.geometry=new C(...(props.args??[]));return;}
 if(type==='meshStandardMaterial'){parent.material=new THREE.MeshStandardMaterial(props);return;}
 assert.ok(type==='mesh'||type==='group','Known 3D element '+type);
 const object=type==='mesh'?new THREE.Mesh():new THREE.Group();for(const name of ['position','rotation','scale'])if(props[name])object[name].set(...props[name]);
 if(props.geometry)object.geometry=props.geometry;parent.add(object);attach(props.children,object);
}
for(const item of REALM_OUTFITS){const root=new THREE.Group();attach(RealmOutfitDetails({top:`realm_${item.key}`}),root);root.updateMatrixWorld(true);assert.ok(!new THREE.Box3().setFromObject(root).isEmpty());root.traverse(o=>{if(o.isMesh){o.geometry.dispose();o.material.dispose();}});}
for(const hairStyle of ['bald','short','long','ponytail','bun','afro',...ADVANCED_HAIR]){
 const root=new THREE.Group();attach(ExplorerAvatarHead({o:{...DEFAULT_OUTFIT,hairStyle}}),root);root.updateMatrixWorld(true);
 const size=new THREE.Box3().setFromObject(root).getSize(new THREE.Vector3());assert.ok(size.toArray().every(n=>Number.isFinite(n)&&n>0));assert.ok(size.x<1&&size.y<1.2,'Head remains within avatar proportions');
 root.traverse(o=>{if(o.isMesh){o.geometry.dispose();o.material.dispose();}});
}
for(const held of [...CHARACTER_GEAR_KEYS,"flame_blade"]){const root=new THREE.Group();attach(ExplorerCharacterGear({held}),root);root.updateMatrixWorld(true);assert.ok(!new THREE.Box3().setFromObject(root).isEmpty(),'3D character equipment exists: '+held);root.traverse(o=>{if(o.isMesh){o.geometry.dispose();o.material.dispose();}});}
const migration=['20261005150000_character_equipment_collection.sql','20261005163000_remaining_realm_character_equipment.sql'].map(file=>fs.readFileSync('supabase/migrations/'+file,'utf8')).join('\n');
for(const held of CHARACTER_GEAR_KEYS)assert.ok(migration.includes(`"held":"${held}"`));
assert.ok(!/create\s+(or\s+replace\s+)?function|grant|revoke/i.test(migration.replace(/^--.*$/gm,'')),'Catalogue release does not alter RPC permissions');
console.log('PASS: rounded 3D heads and all six held items render; migration is additive catalogue data only.');
