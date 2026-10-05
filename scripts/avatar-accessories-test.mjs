import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import Module,{createRequire} from 'node:module';
import ts from 'typescript';
import React from 'react';
import * as THREE from 'three';
const require=createRequire(import.meta.url),cache=new Map(),frames=[];
function compile(file){file=path.resolve(file);if(file.endsWith('.json'))return {default:JSON.parse(fs.readFileSync(file,'utf8'))};if(cache.has(file))return cache.get(file).exports;const m=new Module(file);cache.set(file,m);m.require=name=>{
 if(name==='three')return THREE;
 if(name==='react')return {...React,useRef:()=>({current:null})};
 if(name==='@react-three/fiber')return {useFrame:fn=>frames.push(fn)};
 if(name==='@react-three/drei')return {useTexture:()=>null};
 if(name.startsWith('.')||name.startsWith('@/')){const base=name.startsWith('@/')?path.resolve(name.slice(2)):path.resolve(path.dirname(file),name),found=[base,base+'.tsx',base+'.ts'].find(p=>fs.existsSync(p)&&fs.statSync(p).isFile());if(found)return compile(found);}
 return require(name);
 };m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2020}}).outputText,file);return m.exports;
}
function attach(e,parent){if(!e||typeof e==='boolean')return;if(Array.isArray(e)){e.forEach(c=>attach(c,parent));return;}const {type,props}=e;if(type===React.Fragment||type===React.Suspense){attach(props.children,parent);return;}if(typeof type==='function'){attach(type(props),parent);return;}if(type.endsWith('Geometry')){parent.geometry=new THREE[type[0].toUpperCase()+type.slice(1)](...(props.args??[]));return;}if(type==='meshStandardMaterial'){parent.material=new THREE.MeshStandardMaterial(props);return;}assert.ok(type==='mesh'||type==='group',type);const o=type==='mesh'?new THREE.Mesh():new THREE.Group();for(const key of ['position','rotation','scale'])if(props[key])o[key].set(...props[key]);if(props.geometry)o.geometry=props.geometry;if(props.name)o.name=props.name;if(props.ref)props.ref.current=o;parent.add(o);attach(props.children,o);}
const render=e=>{const root=new THREE.Group();attach(e,root);root.updateMatrixWorld(true);return root;};
const {DEFAULT_OUTFIT}=compile('components/avatar/StudentAvatar.tsx');
const {WEAPONS}=compile('components/avatar/WeaponArt.tsx');
const {ExplorerHeadAccessories,ExplorerBodyAccessories}=compile('components/world3d/ExplorerWearables.tsx');
const {ExplorerCharacterGear}=compile('components/world3d/ExplorerAvatarDetails.tsx');
const {ExplorerSweptHair,ExplorerBuzzHair}=compile('components/world3d/ExplorerSweptHair.tsx');
const {REFERENCE_HAIR_STYLES}=compile('lib/avatar/explorer-hair-geometry.ts');
const bounds=r=>new THREE.Box3().setFromObject(r);
const o={...DEFAULT_OUTFIT,hatColor:'#ed3298',glassesColor:'#235fa7',backpackColor:'#43a165',capeColor:'#736ac4'};
for(const held of Object.keys(WEAPONS)){
 const r=render(React.createElement(ExplorerCharacterGear,{held})),b=bounds(r);assert.ok(!b.isEmpty(),`${held} has a 3D model`);assert.ok(b.min.y>-.6&&b.max.y<1.5,`${held} fits hand-relative equipment limits`);
 r.traverse(n=>{if(n.isMesh)assert.ok(Array.from(n.geometry.getAttribute('position').array).every(Number.isFinite),`${held} finite geometry`);});
}
assert.ok(bounds(render(React.createElement(ExplorerCharacterGear,{held:'none'}))).isEmpty());
for(const held of ['knights_sword','crystal_wand','guardian_shield','flame_blade']){const r=render(React.createElement(ExplorerCharacterGear,{held,colour:'#12ab34'}));let matched=false;r.traverse(n=>{if(n.isMesh&&n.material.color.getHexString()==='12ab34')matched=true;});assert.ok(matched,`${held} respects selected colour`);}
for(const hat of ['beanie','cap','explorer','crown','wizard']){const r=render(React.createElement(ExplorerHeadAccessories,{o:{...o,hat}})),b=bounds(r);assert.ok(b.min.y>1.2&&b.max.y<2.1,`${hat} fitted above eyes`);}
for(const glasses of ['round','shades','visor']){const r=render(React.createElement(ExplorerHeadAccessories,{o:{...o,glasses}})),b=bounds(r);assert.ok(b.min.z>.03&&b.max.z>.36,`${glasses} reaches ears and sits in front of eyes`);}
const visor=render(React.createElement(ExplorerHeadAccessories,{o:{...o,glasses:'visor'}}));
const lens=visor.getObjectByName('visor-lens');
assert.ok(lens.material.transparent&&lens.material.opacity<=.25,'Visor leaves eyes visible through a light tint');
assert.ok(bounds(visor).max.y<1.225,'Visor frame stays below the eyebrows');
for(const x of [-.115,.115]){const hits=new THREE.Raycaster(new THREE.Vector3(x,1.16,1),new THREE.Vector3(0,0,-1)).intersectObject(visor,true);assert.ok(hits.length&&hits[0].object===lens,'Eye line meets the transparent lens rather than an opaque band');}
for(const cape of ['none','hero','royal'])for(const backpack of ['none','explorer','rocket']){
 const movingRef={current:true};const r=render(React.createElement(ExplorerBodyAccessories,{o:{...o,cape,backpack},movingRef}));const b=bounds(r);if(cape!=='none'||backpack!=='none')assert.ok(b.min.y>-.65,'No accessories below feet');
 if(cape!=='none'&&backpack!=='none'){const capeBox=bounds(r.getObjectByName(`cape-${cape}`)),bagBox=bounds(r.getObjectByName(`backpack-${backpack}`));assert.ok(bagBox.min.z<capeBox.min.z,'Backpack is visible outside cape');}
 frames.forEach(fn=>fn({clock:{elapsedTime:1}},1/30));
 if(cape!=='none')assert.notEqual(r.getObjectByName(`cape-${cape}`).rotation.x,0,'Cape moves while walking');
}
for(const style of REFERENCE_HAIR_STYLES){
 const loose=render(React.createElement(ExplorerSweptHair,{style,colour:o.hair}));const before=bounds(loose).clone();
 const crownRay=new THREE.Raycaster(new THREE.Vector3(0,2,0),new THREE.Vector3(0,-1,0));
 const crownHit=crownRay.intersectObject(loose,true)[0];assert.ok(crownHit&&crownHit.point.y>=1.49,`${style}: uncovered crown is still hair, not scalp`);
 for(const hat of ['beanie','cap','explorer','wizard','crown']){
  const fitted=render(React.createElement(ExplorerSweptHair,{style,colour:o.hair,hat}));
  if(hat==='crown')assert.deepEqual(bounds(fitted).getSize(new THREE.Vector3()).toArray(),before.getSize(new THREE.Vector3()).toArray(),'Open crown never flattens hair');
  else {const ray=new THREE.Raycaster(new THREE.Vector3(0,2,0),new THREE.Vector3(0,-1,0));const hit=ray.intersectObject(fitted,true)[0];assert.ok(hit&&hit.point.y>=1.495,`${style}/${hat}: hair covers the skin dome`);}
 }
 assert.deepEqual(bounds(loose).getSize(new THREE.Vector3()).toArray(),before.getSize(new THREE.Vector3()).toArray(),'Hat fitting does not mutate loose hair');
}
const buzz=render(React.createElement(ExplorerBuzzHair,{colour:o.hair}));assert.ok(new THREE.Raycaster(new THREE.Vector3(0,2,0),new THREE.Vector3(0,-1,0)).intersectObject(buzz,true)[0].point.y>=1.49,'Buzz cut covers the crown');
console.log(`PASS: ${Object.keys(WEAPONS).length} held items, 5 hats, 3 glasses, all cape/backpack combinations, colours, walking motion and 95 hair/hat fits.`);
