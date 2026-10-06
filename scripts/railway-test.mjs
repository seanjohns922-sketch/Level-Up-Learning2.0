import fs from 'node:fs';import ts from 'typescript';import assert from 'node:assert/strict';
const exports={};new Function('exports',ts.transpileModule(fs.readFileSync('lib/world3d/railway.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText)(exports);
const {railwayRoute,routePosition,segmentLength,stationStopDistances}=exports;
const items=new Map(['rail_corner','rail_straight','rail_train','railway_station'].map(asset=>[asset,{metadata:{worldAssetKey:asset,gridSize:asset==='railway_station'?'5x3':'1x1'}}]));
const p=(x,z,rotation,itemId)=>({gridX:x,gridZ:z,rotation,itemId,placementId:`${x}:${z}`});
const loop=[p(0,0,180,'rail_corner'),p(1,0,0,'rail_train'),p(2,0,90,'rail_corner'),p(2,1,0,'rail_corner'),p(1,1,0,'rail_straight'),p(0,1,270,'rail_corner')];
const route=railwayRoute(loop[1],loop,items);assert.equal(route.length,6);
assert.equal(railwayRoute(loop[1],loop.slice(0,-1),items).length,0,'Gap prevents running');
assert.equal(railwayRoute(loop[1],[...loop,p(1,0,0,'rail_straight')],items).length,0,'Overlapping track rejected');
const wrong=loop.map((v,i)=>i===3?{...v,rotation:90}:v);assert.equal(railwayRoute(wrong[1],wrong,items).length,0);
const length=route.reduce((s,r)=>s+segmentLength(r),0);let previous=routePosition(route,0);
for(let d=.01;d<=length+.01;d+=.01){const point=routePosition(route,d);assert.ok(Math.hypot(point.x-previous.x,point.z-previous.z)<.011,'Continuous path through every join');previous=point;}
assert.deepEqual(routePosition(route,0),routePosition(route,length));
const station=p(1,-2,0,'railway_station');assert.equal(stationStopDistances(route,[...loop,station],items).length,1);
assert.equal(stationStopDistances(route,[...loop,{...station,rotation:180}],items).length,0,'Station back does not dock');
assert.equal(stationStopDistances(route,[...loop,{...station,gridZ:-10}],items).length,0);
for(const angle of [90,180,270]){
 const rotated=[...loop,station].map(v=>{const [gridX,gridZ]=exports.rotateRail([v.gridX,v.gridZ],angle);return {...v,gridX,gridZ,rotation:(v.rotation+angle)%360};});
 const route=railwayRoute(rotated[1],rotated,items);assert.equal(route.length,6);assert.equal(stationStopDistances(route,rotated,items).length,1,'Rotated station docks on its front side');
}
console.log('PASS: connected loop, gaps, overlaps, rotated corners, continuous travel, station front docking and distance.');

// A station contributes five real track cells: extend either end to complete a loop.
const stationLoop=[p(0,0,0,'railway_station'),p(-3,1,180,'rail_corner'),p(3,1,90,'rail_corner'),p(-3,2,90,'rail_straight'),p(3,2,90,'rail_straight'),p(-3,3,270,'rail_corner'),p(3,3,0,'rail_corner'),...[-2,-1,0,1,2].map(x=>p(x,3,0,x===0?'rail_train':'rail_straight'))];
for(const angle of [0,90,180,270]){
 const placed=stationLoop.map(v=>{const [gridX,gridZ]=exports.rotateRail([v.gridX,v.gridZ],angle);return {...v,gridX,gridZ,rotation:(v.rotation+angle)%360};});
 const train=placed.find(v=>v.itemId==='rail_train');
 const route=railwayRoute(train,placed,items);assert.equal(route.length,16,'Station built-in track joins the loop at rotation '+angle);
 const stop=stationStopDistances(route,placed,items);assert.equal(stop.length,1);
 const centre=routePosition(route,stop[0]),expected=exports.rotateRail([0,2],angle);
 assert.ok(Math.hypot(centre.x-expected[0],centre.z-expected[1])<1e-6,'Train stops at the platform centre');
 const total=route.reduce((n,s)=>n+segmentLength(s),0);let last=routePosition(route,0);
 for(let d=.025;d<total;d+=.025){const pos=routePosition(route,d);assert.ok(Math.hypot(pos.x-last.x,pos.z-last.z)<.026,'No jump at station joins');last=pos;}
 assert.equal(railwayRoute(train,placed.filter(v=>v!==placed[1]),items).length,0,'Missing end connection keeps train stopped');
}
console.log('PASS: built-in station track connects, runs continuously and docks at all four rotations.');
