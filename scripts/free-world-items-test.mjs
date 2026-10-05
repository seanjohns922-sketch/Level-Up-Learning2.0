import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import Module, { createRequire } from 'node:module';
import ts from 'typescript';
import * as THREE from 'three';
import { CENTRAL_WORLD_STARTER_SCENERY } from '../lib/world3d/central-world-editor-catalog.ts';
import { WORLD_ITEM_PRESENTATION, fitWorldItemScale } from '../lib/world3d/world-item-presentation.ts';
import { parseGridSize } from '../lib/world3d/central-world-layout.ts';

// Evaluate the actual stateless JSX models in a Three scene without a GPU.
// Unsupported elements fail rather than silently omitting geometry from bounds.
const require = createRequire(import.meta.url);
function compile(relativePath, dependencies = {}) {
 const filename=path.resolve(relativePath);
 const output=ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2020}}).outputText;
 const loaded=new Module(filename);
 loaded.require=(name)=>dependencies[name]??require(name);
 loaded._compile(output,filename);
 return loaded.exports;
}
const primitives=compile('components/world3d/DetailedScenery.tsx');
const {FreePlayScenery,FREE_PLAY_SCENERY_KEYS}=compile('components/world3d/FreePlayScenery.tsx',{'./DetailedScenery':primitives});
function attach(element,parent) {
 if(element==null||typeof element==='boolean')return;
 if(Array.isArray(element)){element.forEach(child=>attach(child,parent));return;}
 assert.equal(typeof element,'object','Scenery uses mesh geometry rather than unmeasured text');
 const {type,props}=element;
 if(typeof type==='function'){attach(type(props),parent);return;}
 if(typeof type==='symbol'){attach(props.children,parent);return;}
 if(type.endsWith('Geometry')){
  const Constructor=THREE[type[0].toUpperCase()+type.slice(1)];assert.ok(Constructor,'Known geometry: '+type);
  parent.geometry=new Constructor(...(props.args??[]));return;
 }
 if(type==='meshStandardMaterial'){parent.material=new THREE.MeshStandardMaterial(props);return;}
 assert.ok(type==='group'||type==='mesh','Supported scenery element: '+type);
 const object=type==='mesh'?new THREE.Mesh():new THREE.Group();
 for(const name of ['position','rotation','scale'])if(props[name]!==undefined){const value=props[name];if(typeof value==='number')object[name].setScalar(value);else if(Array.isArray(value))object[name].set(...value);else object[name].copy(value);}
 if(props.quaternion)object.quaternion.copy(props.quaternion);
 parent.add(object);attach(props.children,object);
}
const collectionSource=fs.readFileSync('components/world3d/CollectionScenery.tsx','utf8');
assert.match(collectionSource,/FREE_PLAY_SCENERY_KEYS.has\(assetKey\)/,'Collection renderer delegates the new keys');
assert.match(collectionSource,/<FreePlayScenery assetKey=\{assetKey\} tint=\{tint\}/,'Live renderer uses the measured models and colour input');
const measurements=[];
assert.equal(FREE_PLAY_SCENERY_KEYS.size,16);
for(const key of FREE_PLAY_SCENERY_KEYS){
 const item=CENTRAL_WORLD_STARTER_SCENERY.find(item=>item.metadata.worldAssetKey===key);
 assert.ok(item,key+' in free library');assert.equal(item.price,0);assert.equal(item.purchasable,false);assert.equal(item.metadata.marketplaceCategory,'world_basic');
 const scene=new THREE.Group();attach(FreePlayScenery({assetKey:key}),scene);scene.updateMatrixWorld(true);
 const bounds=new THREE.Box3().setFromObject(scene,true),size=bounds.getSize(new THREE.Vector3());
 assert.ok(!bounds.isEmpty()&&[size.x,size.y,size.z].every(value=>Number.isFinite(value)&&value>0),'Nonempty model: '+key);
 const footprint=parseGridSize(item).map(n=>n*2),presentation=WORLD_ITEM_PRESENTATION[key];
 const scale=fitWorldItemScale(size,footprint,presentation),actual=size.toArray().map((value,i)=>value*scale[i]);
 assert.ok(actual[0]<=footprint[0]+1e-5&&actual[2]<=footprint[1]+1e-5,'Fits land: '+key);
 assert.ok(Math.abs((presentation.width?actual[0]:actual[1])-(presentation.width??presentation.height))<1e-5,'Reaches intended scale: '+key);
 assert.ok(actual[1]<=(key==='fruit_tree'?5.5:key==='hedge_arch'?3.4:2.5)+1e-5,'Small props stay near avatar scale: '+key);
 const coloured=new THREE.Group();attach(FreePlayScenery({assetKey:key,tint:'#a855f7'}),coloured);coloured.updateMatrixWorld(true);
 assert.deepEqual(new THREE.Box3().setFromObject(coloured,true).getSize(new THREE.Vector3()).toArray(),size.toArray(),'Recolour preserves dimensions: '+key);
 let painted=false;coloured.traverse(object=>{if(object.isMesh&&object.material.color?.getHexString()==='a855f7')painted=true;});assert.ok(painted,'Paint control changes a visible surface: '+key);
 measurements.push({key,name:item.name,native:size.toArray(),size:actual,footprint});
 // Test models own their geometries/materials, so dispose both measured copies.
 for(const root of [scene,coloured])root.traverse(object=>{if(object.isMesh){object.geometry.dispose();object.material.dispose();}});
}
if(process.argv.includes('--write-measurements')){
 const destination='docs/world3d/item-scale-measurements.json';
 const existing=JSON.parse(fs.readFileSync(destination,'utf8')).filter(row=>!FREE_PLAY_SCENERY_KEYS.has(row.key));
 fs.writeFileSync(destination,'[\n'+[...existing,...measurements].map(row=>'  '+JSON.stringify(row)).join(',\n')+'\n]\n');
}else{
 const saved=JSON.parse(fs.readFileSync('docs/world3d/item-scale-measurements.json','utf8'));
 for(const row of measurements){const recorded=saved.find(value=>value.key===row.key);assert.ok(recorded,'Saved measurement: '+row.key);for(const field of ['native','size','footprint'])row[field].forEach((value,i)=>assert.ok(Math.abs(value-recorded[field][i])<1e-5,'Current geometry matches saved bounds: '+row.key));}
}
console.log('PASS: all 16 free models render actual geometry, fit their land at intended scale, recolour without resizing and retain free access.');
