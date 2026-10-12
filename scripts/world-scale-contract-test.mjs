import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from 'three';
import { measureLocalModel } from '../lib/world3d/world-model-bounds.ts';
import { WORLD_AVATAR_SCALE, WORLD_AVATAR_FOOT_Y, WORLD_AVATAR_SCALE_OFFSET, WORLD_AVATAR_REFERENCE_HEIGHT, STATION_DOOR_CLEARANCE, TRAIN_CARRIAGE_SPACING } from '../lib/world3d/world-scale.ts';
import { WORLD_ITEM_PRESENTATION, fitWorldItemScale } from '../lib/world3d/world-item-presentation.ts';
import { routePosition, railwayRoute, trainConsistCapacity, visibleTrainCarriages } from '../lib/world3d/railway.ts';
assert.equal(WORLD_AVATAR_SCALE,.9);
assert.equal(WORLD_AVATAR_FOOT_Y*WORLD_AVATAR_SCALE+WORLD_AVATAR_SCALE_OFFSET,WORLD_AVATAR_FOOT_Y,'Shrinking the avatar does not float its feet');
assert.ok(STATION_DOOR_CLEARANCE>=WORLD_AVATAR_REFERENCE_HEIGHT+.35);
// A rotated thin roof must be measured from its vertices, not the corners of its unrotated box.
const root=new THREE.Group(),roof=new THREE.Mesh(new THREE.CylinderGeometry(2,2,.1,32),new THREE.MeshBasicMaterial());
roof.rotation.y=Math.PI/4;root.add(roof);
const actual=measureLocalModel(root).getSize(new THREE.Vector3());
assert.ok(Math.abs(actual.x-4)<1e-5&&Math.abs(actual.z-4)<1e-5,'Rotation cannot inflate a circular roof');
const p={height:5,theme:'garden'};
assert.deepEqual(fitWorldItemScale({x:10,y:2,z:10},[2,2],p),[2.5,2.5,2.5],'Undersized land cannot miniaturise the model');
assert.deepEqual(fitWorldItemScale({x:10,y:5,z:6},[10,6],WORLD_ITEM_PRESENTATION.railway_station),[1,1,1],'Station connections retain their authored coordinates');
const rows=new Map(JSON.parse(fs.readFileSync('docs/world3d/item-scale-measurements.json','utf8')).map(row=>[row.key,row]));
for(const [key,min,max] of [['well',2.3,2.8],['wood_gate',1.4,1.6],['stone_wall',1.2,1.4],['stone_bench',.6,.75],['climbing_trellis',2.2,2.6],['sundial',1,1.2],['railway_station',4.9,5.3]]){
 assert.ok(rows.get(key).size[1]>=min&&rows.get(key).size[1]<=max,key+' retains its reviewed human-scale proportions');
}
const segment={placement:{itemId:'rail_straight',gridX:0,gridZ:0,rotation:0},asset:'rail_straight',reverse:false};
assert.ok(Math.abs(routePosition([segment],1.999).yaw-Math.PI/2)<1e-6,'Forward tangent at end of segment');
assert.ok(Math.abs(routePosition([{...segment,reverse:true}],0).yaw+Math.PI/2)<1e-6,'Reverse tangent at exact endpoint');
assert.equal(visibleTrainCarriages(TRAIN_CARRIAGE_SPACING*2-.01,3),0,'Short loop cannot overlap the engine with a carriage');
const items=new Map(['rail_corner','rail_straight','train_steam'].map(key=>[key,{metadata:{worldAssetKey:key}}]));
const tile=(x,z,r,itemId='rail_straight')=>({gridX:x,gridZ:z,rotation:r,itemId});
function loop(w,h){return [tile(0,0,180,'rail_corner'),tile(w,0,90,'rail_corner'),tile(w,h,0,'rail_corner'),tile(0,h,270,'rail_corner'),...Array.from({length:w-1},(_,i)=>[tile(i+1,0,0),tile(i+1,h,0)]).flat(),...Array.from({length:h-1},(_,i)=>[tile(0,i+1,90),tile(w,i+1,90)]).flat()];}
for(const [w,h,expected] of [[1,1,0],[12,8,3]]){
 const tiles=loop(w,h),start=tile(1,0,0,'train_steam'),route=railwayRoute(start,[...tiles,start],items);
 assert.ok(route.length>0,'Connected test loop');
 assert.equal(trainConsistCapacity(route,3),expected,'Carriages fit the complete loop, including bends and wraparound');
}
for(const s of [segment,{...segment,reverse:true}])for(const d of [0,.001,1,1.999])assert.ok(Number.isFinite(routePosition([s],d).yaw));
assert.equal(trainConsistCapacity([],3),0);
roof.geometry.dispose();roof.material.dispose();
console.log('PASS: avatar grounding, station clearance, prop proportions, precise rotated bounds, fixed connector sizes and railway endpoint safety.');
