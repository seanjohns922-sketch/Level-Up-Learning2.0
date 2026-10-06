import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import Module, { createRequire } from 'node:module';
import ts from 'typescript';
import * as THREE from 'three';
import * as railway from '../lib/world3d/railway.ts';
import { WORLD_REWARD_ADDITIONS } from '../lib/world3d/world-expansion.ts';
import { CENTRAL_WORLD_CUSTOMISATION_CATALOG as catalogue } from '../lib/world3d/central-world-customisation-catalog.ts';
import { CENTRAL_WORLD_STARTER_SCENERY } from '../lib/world3d/central-world-editor-catalog.ts';
import {parseGridSize,validateCentralWorldPlacement,writeCentralWorldPlacements,readCentralWorldPlacements} from '../lib/world3d/central-world-layout.ts';
const require = createRequire(import.meta.url);
function compile(relativePath, dependencies = {}) {
 const filename=path.resolve(relativePath);
 const output=ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2020}}).outputText;
 const loaded=new Module(filename);
 loaded.require=(name)=>dependencies[name]??require(name);
 loaded._compile(output,filename);
 return loaded.exports;
}
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
const primitives=compile('components/world3d/DetailedScenery.tsx');
const tracks=compile('components/world3d/RailTrack.tsx',{'@/lib/world3d/railway':railway});
const {CollectionReward}=compile('components/world3d/CollectionRewards.tsx',{'./DetailedScenery':primitives,'./RailTrack':tracks,'@/lib/world3d/railway':railway,'@/lib/world3d/world-expansion':{WORLD_REWARD_ADDITIONS},'./WildlifeScenery':{},'./CollectionScenery':{},'./AustralianPlaces':{PaintedSign:()=>null}});
const item=catalogue.find(i=>i.metadata.worldAssetKey==='railway_station');
const straight=CENTRAL_WORLD_STARTER_SCENERY.find(i=>i.metadata.worldAssetKey==='rail_straight');
assert.deepEqual(parseGridSize(item),[5,3],'Reserved land matches station connection grid');
const model=new THREE.Group();attach(CollectionReward({assetKey:'railway_station'}),model);model.updateMatrixWorld(true);
const bounds=new THREE.Box3().setFromObject(model,true);
assert.ok(bounds.min.x>=-5.03&&bounds.max.x<=5.03&&bounds.min.z>=-3&&bounds.max.z<=3,'Actual station fits reserved land');
// The five rendered groups use the exact same positions and RailTrack geometry as routing.
const element=CollectionReward({assetKey:'railway_station'});
const trackGroups=element.props.children.flat().filter(e=>e?.props?.children?.type===tracks.RailTrack);
assert.equal(trackGroups.length,5);
assert.deepEqual(trackGroups.map(e=>e.props.position),railway.STATION_TRACK_CENTRES.map(x=>[x,0,railway.STATION_TRACK_Z]));
const items=new Map([item,straight].map(i=>[i.item_key,i]));
for(const rotation of [0,90,180,270]){
 const station={itemId:item.item_key,placementId:'station',gridX:25,gridZ:25,rotation};
 for(const side of [-1,1]){
  const [dx,dz]=railway.rotateRail([side*6,2],rotation);
  const next={itemId:straight.item_key,gridX:25+dx/2,gridZ:25+dz/2,rotation};
  assert.ok(validateCentralWorldPlacement(next,straight,[station],items),'Editor allows joining at either station end');
 }
}
console.log('PASS: actual station rail geometry matches route cells and adjacent tracks can be placed at every rotation.');

const trainItem=CENTRAL_WORLD_STARTER_SCENERY.find(i=>i.metadata.worldAssetKey==='rail_train');
const cornerItem=CENTRAL_WORLD_STARTER_SCENERY.find(i=>i.metadata.worldAssetKey==='rail_corner');
items.set(trainItem.item_key,trainItem);items.set(cornerItem.item_key,cornerItem);
for(const rotation of [0,90,180,270]){
 for(const supportItem of [straight,cornerItem,item]){
  const support={itemId:supportItem.item_key,placementId:'support',gridX:25,gridZ:25,rotation};
  const [dx,dz]=supportItem===item?railway.rotateRail([0,2],rotation):[0,0];
  const train={itemId:trainItem.item_key,placementId:'train',gridX:25+dx/2,gridZ:25+dz/2,rotation:0};
  assert.ok(validateCentralWorldPlacement(train,trainItem,[support],items),'Train allowed on '+supportItem.name);
  assert.ok(!validateCentralWorldPlacement(train,trainItem,[support,train],items),'Second train in same cell rejected');
  if(supportItem===item)assert.ok(!validateCentralWorldPlacement({...train,gridX:25,gridZ:25},trainItem,[support],items),'Train cannot overlap station building');
  const storage=new Map();globalThis.window={localStorage:{getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v)}};
  writeCentralWorldPlacements('train-test',[support,train]);const restored=readCentralWorldPlacements('train-test');
  assert.ok(railway.trainTrackSupport(restored.find(p=>p.placementId==='train'),restored,items),'Track association survives reload');
  assert.ok(restored.some(p=>p.placementId==='support'),'Original track retained');
  delete globalThis.window;
 }
}
console.log('PASS: editor allows trains on existing rails, rejects occupied trains/buildings and retains tracks after reload.');
const trainCatalogue=await import('../lib/world3d/train-catalogue.ts');
const {TrainUnit}=compile('components/world3d/TrainModels.tsx',{'./DetailedScenery':primitives,'@/lib/world3d/train-catalogue':trainCatalogue});
const geometrySignatures=new Set();
for(const entry of trainCatalogue.TRAIN_CATALOGUE){
 items.set(entry.item_key,entry);assert.ok(entry.price>0&&entry.purchasable);
 const track={itemId:straight.item_key,placementId:'track',gridX:25,gridZ:25,rotation:90};
 const train={...track,itemId:entry.item_key,placementId:'paid-train',rotation:0};
 assert.ok(validateCentralWorldPlacement(train,entry,[track],items),entry.name+' can be placed on rails');
 assert.ok(!validateCentralWorldPlacement(train,entry,[],items),entry.name+' cannot be placed on bare ground');
 const design=trainCatalogue.trainDesign(entry.item_key);
 for(let car=0;car<=design.cars;car++){
  const root=new THREE.Group();attach(TrainUnit({asset:entry.item_key,car}),root);root.updateMatrixWorld(true);
  const box=new THREE.Box3().setFromObject(root),size=box.getSize(new THREE.Vector3());
  assert.ok(size.x<1.2&&size.z<1.85&&size.y<1.7,'Train units stay within safe rail dimensions');
  const geometry=[];root.traverse(o=>{if(o.isMesh)geometry.push([o.geometry.type,o.geometry.attributes.position.count,...o.matrixWorld.elements]);});
  if(car===0)geometrySignatures.add(JSON.stringify(geometry));
 }
 assert.ok(fs.existsSync('public'+entry.metadata.marketplace_visual.src),'Product artwork exists');
}
assert.equal(geometrySignatures.size,10,'All ten engines have distinct geometry, not just recolours');
assert.deepEqual(trainCatalogue.TRAIN_CATALOGUE.map(i=>i.price),[400,900,1400,2200,3000,3000,3000,3000,3000,3000]);
console.log('PASS: ten distinct engine models, bounded carriages, XP prices, artwork and track-only placement.');
