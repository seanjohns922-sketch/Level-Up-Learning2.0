import { FREE_WORLD_ADDITIONS, WORLD_REWARD_ADDITIONS } from "../lib/world3d/world-expansion.ts";
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { buildOrganicPath, pathCentreLines } from '../lib/world3d/organic-path.ts';
import { centralWorldStarterPaths } from '../lib/world3d/central-world-layout.ts';
import { CENTRAL_WORLD_STARTER_SCENERY as catalogue } from '../lib/world3d/central-world-editor-catalog.ts';
const tile=(x,z,type='path')=>({gridX:x,gridZ:z,tileType:type});
const hit=(geometry,x,z)=>{const mesh=new THREE.Mesh(geometry,new THREE.MeshBasicMaterial());mesh.updateMatrixWorld();const ray=new THREE.Raycaster(new THREE.Vector3(x,10,z),new THREE.Vector3(0,-1,0));return ray.intersectObject(mesh).length>0;};
for(const tiles of [[],[tile(0,0)],[tile(0,0),tile(1,1),tile(2,2)],centralWorldStarterPaths()]) {
 const {surface,edge}=buildOrganicPath(tiles);
 for(const geometry of [surface,edge]) {const p=geometry.getAttribute('position');if(p)assert.ok(Array.from(p.array).every(Number.isFinite));geometry.dispose();}
}
const diagonal=buildOrganicPath([tile(0,0),tile(1,1),tile(2,2)]).surface;
assert.ok(hit(diagonal,1,1),'Diagonal legacy tiles join without holes');
assert.equal(pathCentreLines([tile(0,0),tile(1,0),tile(2,0)]).length,1);
const erased=buildOrganicPath([tile(0,0),tile(2,0)]).surface;
assert.equal(hit(erased,2,0),false,'Erasing the middle cell leaves a real gap');
const override=buildOrganicPath([tile(0,0),tile(1,0,'water')]).surface;
assert.equal(hit(override,1.15,0),false,'Path does not spill onto water');
const junction=buildOrganicPath([tile(0,0),tile(-1,0),tile(1,0),tile(0,1)]).surface;
assert.ok(hit(junction,0,0),'Junction remains connected');
assert.equal(hit(junction,3.8,0),false,'Rounded end does not extend indefinitely');
assert.equal(new Set(catalogue.map(i=>i.item_key)).size,catalogue.length,'Unique catalogue keys');
assert.equal(catalogue.length,89);
assert.ok(catalogue.every(i=>i.price===0&&!i.purchasable),'All additions remain free');
console.log('Organic paths: finite geometry, diagonal joins, erased gaps, water boundaries, junctions and 89 free catalogue entries passed.');

const { WORLD_ITEM_PRESENTATION, fitWorldItem } = await import('../lib/world3d/world-item-presentation.ts');
const { CENTRAL_WORLD_CUSTOMISATION_CATALOG: rewards } = await import('../lib/world3d/central-world-customisation-catalog.ts');
for(const item of [...catalogue,...rewards]){
 const presentation=WORLD_ITEM_PRESENTATION[item.metadata.worldAssetKey];
 assert.ok(presentation,'Every item has an explicit presentation: '+item.name);
 assert.ok(presentation.height>0);
 const [w,d]=item.metadata.gridSize.split('x').map(Number);
 for(const size of [{x:1,y:1,z:1},{x:7,y:12,z:3},{x:3,y:.12,z:8}]){
  const scale=fitWorldItem(size,[w*2,d*2],presentation);
  assert.ok(scale>0&&Number.isFinite(scale));
  assert.ok(size.x*scale<=w*2+1e-6&&size.z*scale<=d*2+1e-6,'Art stays within reserved footprint: '+item.name);
 }
}
assert.equal(Object.keys(WORLD_ITEM_PRESENTATION).length,122);
console.log('122 item size targets validated; three bounding-box shapes each remain inside their reserved footprints.');

const { measureLocalModel } = await import('../lib/world3d/world-model-bounds.ts');
const parent=new THREE.Group(),model=new THREE.Group();
parent.position.set(130,7,-40); parent.rotation.y=Math.PI/2; parent.scale.setScalar(2);
parent.add(model);
const fixture=new THREE.Mesh(new THREE.BoxGeometry(3,2,1));
fixture.position.set(1.5,2,.5);model.add(fixture);
let measured=measureLocalModel(model),actual=measured.getSize(new THREE.Vector3());
assert.ok(actual.distanceTo(new THREE.Vector3(3,2,1))<1e-8,'World transforms do not change local item size');
assert.ok(Math.abs(measured.min.y-1)<1e-8,'Grounding detects the actual bottom');
const instanced=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshStandardMaterial(),2);
instanced.setMatrixAt(0,new THREE.Matrix4().makeTranslation(-2,0,0));
instanced.setMatrixAt(1,new THREE.Matrix4().makeTranslation(2,0,0));
model.clear();model.add(instanced);
measured=measureLocalModel(model);actual=measured.getSize(new THREE.Vector3());
assert.ok(Math.abs(actual.x-5)<1e-8,'Foliage and masonry instances contribute to footprint measurements');
const initialScale=fitWorldItem(actual,[4,4],{height:4,theme:'garden'});
parent.rotation.y=.72;
assert.ok(Math.abs(fitWorldItem(measureLocalModel(model).getSize(new THREE.Vector3()),[4,4],{height:4,theme:'garden'})-initialScale)<1e-8,'Rotating a saved item preserves its size');
console.log('Model-space geometry bounds, grounding, instancing and rotated-placement scale checks passed.');

const fs=await import('node:fs');
const extractKeys=(file,name)=>{
 const source=fs.readFileSync(new URL('../components/world3d/'+file,import.meta.url),'utf8');
 const match=source.match(new RegExp('(?:const '+name+')\\s*=\\s*new Set\\(\\[([\\s\\S]*?)\\]\\)'));
 assert.ok(match,'Find renderer registry '+name);
 return [...match[1].matchAll(/"([^"]+)"/g)].map(m=>m[1]);
};
const freeRenderers=new Set([
 ...FREE_WORLD_ADDITIONS.map(i=>i.key),
 ...extractKeys('DetailedScenery.tsx','DETAILED_SCENERY_KEYS'),
 ...extractKeys('ReferenceProps.tsx','REFERENCE_PROP_KEYS'),
 ...extractKeys('WildlifeScenery.tsx','WILDLIFE_KEYS'),
 ...extractKeys('FortressScenery.tsx','FORTRESS_SCENERY_KEYS'),
 'drawbridge',
]);
const rewardRenderers=new Set([
 ...WORLD_REWARD_ADDITIONS.map(i=>i.key),
 ...extractKeys('DetailedScenery.tsx','DETAILED_REWARD_KEYS'),
 ...extractKeys('AustralianPlaces.tsx','AUSTRALIAN_PLACE_KEYS'),
 'wildlife_habitat','bunny_garden','puppy_yard','pet_sanctuary',
]);
for(const item of catalogue)assert.ok(freeRenderers.has(item.metadata.worldAssetKey),'Dedicated scenery renderer: '+item.name);
for(const item of rewards)assert.ok(rewardRenderers.has(item.metadata.worldAssetKey),'Dedicated reward renderer: '+item.name);
console.log('All 122 catalogue items route to an upgraded renderer; no generic tree/building fallbacks.');
const migration=fs.readFileSync(new URL('../supabase/migrations/20260925090000_world_collection_expansion.sql',import.meta.url),'utf8');
assert.equal(rewards.length,33);
for(const addition of WORLD_REWARD_ADDITIONS){
 const item=rewards.find(item=>item.metadata.worldAssetKey===addition.key);
 assert.ok(item&&migration.includes("'"+item.item_key+"'"),'New reward registered for live release');
 assert.ok(fs.existsSync(new URL('../public'+item.metadata.marketplace_visual.src,import.meta.url)),'Reward preview exists: '+addition.key);
}
assert.ok(!/update\s+public\.economy_items|delete\s+from|create\s+(or\s+replace\s+)?function/i.test(migration),'Expansion is additive and does not change RPCs');
console.log('33 rewards, new preview assets and additive release registration validated.');

const {buildWorldWater,waterBrushCells}=await import('../lib/world3d/world-water.ts');
assert.equal(waterBrushCells(0,0,1).length,1);
assert.equal(waterBrushCells(0,0,3).length,9);
assert.equal(waterBrushCells(0,0,5).length,21);
const lakeTiles=Array.from({length:7},(_,x)=>Array.from({length:7},(_,z)=>tile(x-3,z-3,'water'))).flat();
const lake=buildWorldWater(lakeTiles);
for(let x=-5;x<=5;x+=.5)for(let z=-5;z<=5;z+=.5)assert.ok(hit(lake.surface,x,z),'Lake interior has no seams or holes');
const moatTiles=lakeTiles.filter(t=>Math.abs(t.gridX)>=2||Math.abs(t.gridZ)>=2);
const moat=buildWorldWater(moatTiles);
assert.equal(hit(moat.surface,0,0),false,'Moat retains a dry island');
assert.ok(hit(moat.surface,5,0),'Moat sides remain connected');
const erasedWater=buildWorldWater([tile(0,0,'water'),tile(2,0,'water')]);
assert.equal(hit(erasedWater.surface,2,0),false,'Erasing water leaves a dry gap');
const waterCrossing=buildWorldWater([...lakeTiles.filter(t=>t.gridX!==0),...Array.from({length:7},(_,z)=>tile(0,z-3,'stone'))]);
assert.equal(hit(waterCrossing.surface,0,0),false,'Stone crossing cuts through water');
for(const model of [lake,moat,erasedWater,waterCrossing])for(const g of [model.surface,model.edge]){
 assert.ok(Array.from(g.getAttribute('position').array).every(Number.isFinite));
 g.dispose();
}
console.log('Water brushes, filled lakes, dry moat islands, erased gaps and stone crossings passed.');

const {boundaryDirections,gridStroke}=await import('../lib/world3d/world-connections.ts');
const fence=(x,z,rotation=0,itemId='fence')=>({itemId,placementId:x+':'+z,gridX:x,gridZ:z,rotation});
const dirs=(neighbours,rotation=0)=>boundaryDirections(fence(0,0,rotation),neighbours).map(d=>d.join(':')).sort();
assert.deepEqual(dirs([]),['-1:0','1:0']);
assert.deepEqual(dirs([],90),['0:-1','0:1']);
assert.deepEqual(dirs([fence(1,0),fence(0,1)]),['0:1','1:0'],'Automatic corner');
assert.equal(dirs([fence(-1,0),fence(1,0),fence(0,1)]).length,3,'T junction');
assert.equal(dirs([fence(-1,0),fence(1,0),fence(0,1),fence(0,-1)]).length,4,'Cross junction');
assert.deepEqual(dirs([fence(1,1),fence(0,1,0,'rope')]),['-1:0','1:0'],'Do not join diagonals or different styles');
assert.deepEqual(dirs([fence(0,1)]),['0:-1','0:1'],'After moving/removing a neighbour, remaining endpoint follows its connection');
for(const to of [{gridX:12,gridZ:5},{gridX:-8,gridZ:-13},{gridX:0,gridZ:0}]){
 const stroke=gridStroke({gridX:0,gridZ:0},to);let previous={gridX:0,gridZ:0};
 for(const point of stroke){assert.equal(Math.abs(point.gridX-previous.gridX)+Math.abs(point.gridZ-previous.gridZ),1);previous=point;}
 assert.deepEqual(previous,to,'Fast drag ends exactly at cursor');
 assert.equal(new Set(stroke.map(p=>p.gridX+':'+p.gridZ)).size,stroke.length);
}
console.log('Boundary corners, junctions, removal, rotation and continuous fast-drag routes passed.');

const transition=[tile(0,0),tile(1,0,'road')];
const footpath=buildOrganicPath(transition);
const road=buildOrganicPath(transition.map(t=>({...t,tileType:t.tileType==='road'?'path':'stone'})));
assert.ok(hit(footpath.surface,.95,0),'Path reaches the road boundary');
assert.ok(hit(road.surface,1.05,0),'Road reaches the path boundary');
assert.equal(hit(footpath.surface,1.2,0),false,'Materials do not spill into each other');
footpath.surface.dispose();footpath.edge.dispose();road.surface.dispose();road.edge.dispose();
console.log('Mixed path/road transitions meet without a grass gap.');
