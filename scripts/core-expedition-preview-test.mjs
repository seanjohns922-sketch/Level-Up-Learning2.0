import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
// Load the code-native terrain without needing a WebGL context.
const modules=new Map();
function load(name){
 const filename=path.resolve('lib/world3d',`${name}.ts`);
 if(modules.has(filename))return modules.get(filename).exports;
 const module={exports:{}};modules.set(filename,module);
 const code=ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
 new Function('require','module','exports',code)(name=>load(name.replace('./','')),module,module.exports);
 return module.exports;
}
const {summitFloor}=load('number-summit');
const {TRAIL_SAMPLES,crossroadsTerrain,trailThreat}=load('expedition-crossroads');
const {VOLCANO_ROUTE,VOLCANO_DOORS,volcanoFloor}=load('volcano-expedition');
for(let k=0;k<6;k++)for(let i=0;i<58;i++){
 const [x,y,z]=TRAIL_SAMPLES[k][i],floor=summitFloor(x,z,1,false,y);
 assert(floor!==null&&Math.abs(floor-y)<.2,`Level 7 trail ${k}, step ${i} disconnected`);
 assert(crossroadsTerrain(x,z)<y+.15,`Trail ${k} buried by terrain`);
}
for(const trail of TRAIL_SAMPLES){assert(trailThreat(trail[8][0],trail[8][2])<.2);assert(trailThreat(trail[56][0],trail[56][2])>.85,'Every lesson entrance must have the darker atmosphere');}
assert.equal(volcanoFloor(4,32,false),null,'A sealed pass must block forward movement');
assert.notEqual(volcanoFloor(4,32,true),null,'An opened pass must admit the player');
for(let i=1;i<VOLCANO_ROUTE.length;i++){
 const a=VOLCANO_ROUTE[i-1],b=VOLCANO_ROUTE[i];
 if(a[0]===b[0]&&a[2]===b[2])continue;
 for(let j=0;j<=30;j++){
  const t=j/30,x=a[0]+(b[0]-a[0])*t,z=a[2]+(b[2]-a[2])*t,y=a[1]+(b[1]-a[1])*t;
  const floor=summitFloor(x,z,1,true,y);
  assert(floor!==null&&Math.abs(floor-y)<.25,`Volcano segment ${i} disconnected`);
  assert(crossroadsTerrain(x,z)<y+.15,`Volcano segment ${i} buried by terrain`);
 }
}
assert.equal(summitFloor(0,-130,4,true,70),null,'Central lava pit is not walkable');
assert.equal(VOLCANO_DOORS.length,6);
for(const [x,y,z] of VOLCANO_DOORS)assert.equal(summitFloor(x,z,1,true,y),70);
console.log('PASS six Level 7 approaches, sealed/open pass, complete volcano ascent, uniform realm routes, six strongholds, protected crater');

const {LEVEL8_WEEK_COUNTS,strongholdLayout,strongholdFloor,strongholdNearest,strongholdDemoHref,NUMBER_STRONGHOLD_DEMO}=load('number-stronghold');
for(const [realm,weeks] of Object.entries(LEVEL8_WEEK_COUNTS)){
 const layout=strongholdLayout(realm);
 assert.equal(layout.portals.length,weeks,`${realm}: one portal per Level 8 week`);
 for(const p of layout.portals){
  const [x,,z]=p.position;
  assert.equal(strongholdFloor(x,z+4,realm),0,`${realm}: portal approach must be walkable`);
  assert.equal(strongholdNearest(x,z+4,realm),p.week,`${realm}: week shortcut must land inside interaction range`);
 }
 for(let z=10;z>=layout.coreZ;z--)assert.equal(strongholdFloor(0,z,realm),0,`${realm}: Core chamber path must stay connected`);
 assert.equal(strongholdNearest(0,layout.coreZ+8,realm),layout.coreId,`${realm}: Core chamber shortcut is reachable`);
 assert.equal(strongholdFloor(16,-30,realm),null,`${realm}: walls block player movement`);
 assert.equal(strongholdFloor(0,layout.backZ,realm),null,`${realm}: back wall blocks player movement`);
 assert(strongholdDemoHref(realm).startsWith('/demo-review/volcano/'));
}
assert.equal(LEVEL8_WEEK_COUNTS.chance,10,'Level 8 Probability has 10 weeks');
assert(NUMBER_STRONGHOLD_DEMO.startsWith('/demo-review/'));
console.log('PASS six strongholds: one portal per Level 8 week, walkable approaches, connected Core chamber and wall boundaries');
