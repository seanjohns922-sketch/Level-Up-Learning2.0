// The indexed trail and volcano-route lookups must give exactly what a full scan gives, everywhere on the map.
// The full scans below are the original implementations, kept here as the reference.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const modules=new Map();
function load(name){
 const filename=path.resolve('lib/world3d',`${name}.ts`);
 if(modules.has(filename))return modules.get(filename).exports;
 const module={exports:{}};modules.set(filename,module);
 const code=ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
 new Function('require','module','exports',code)(name=>load(path.resolve(path.dirname(filename),name)),module,module.exports);
 return module.exports;
}
const {TRAIL_SAMPLES,nearestTrail,crossroadsTerrain}=load('expedition-crossroads');
const {VOLCANO_ROUTE,volcanoProjection}=load('volcano-expedition');

function fullTrailScan(x,z){
 let best={distance:Infinity,height:0,trail:0,progress:0};
 TRAIL_SAMPLES.forEach((points,trail)=>{for(let i=0;i<points.length-1;i++){
  const a=points[i],b=points[i+1],dx=b[0]-a[0],dz=b[2]-a[2],t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[2])*dz)/(dx*dx+dz*dz)));
  const distance=Math.hypot(x-a[0]-t*dx,z-a[2]-t*dz);
  if(distance<best.distance)best={distance,height:a[1]+t*(b[1]-a[1]),trail,progress:(i+t)/(points.length-1)};
 }});return best;
}
function fullRouteScan(x,z){
 let best={distance:Infinity,height:0,segment:0};
 for(let i=0;i<VOLCANO_ROUTE.length-1;i++){
  const a=VOLCANO_ROUTE[i],b=VOLCANO_ROUTE[i+1],dx=b[0]-a[0],dz=b[2]-a[2],length=dx*dx+dz*dz;
  if(length===0)continue;
  const t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[2])*dz)/length));
  const distance=Math.hypot(x-a[0]-t*dx,z-a[2]-t*dz);
  if(distance<best.distance)best={distance,height:a[1]+(b[1]-a[1])*t,segment:i};
 }
 return best;
}
const close=(a,b,label)=>assert.ok(Math.abs(a-b)<=1e-9,`${label}: ${a} vs ${b}`);
function same(x,z){
 const a=nearestTrail(x,z),b=fullTrailScan(x,z),p=volcanoProjection(x,z),q=fullRouteScan(x,z),at=`(${x.toFixed(2)}, ${z.toFixed(2)})`;
 close(a.distance,b.distance,`trail distance ${at}`);close(a.height,b.height,`trail height ${at}`);close(p.distance,q.distance,`route distance ${at}`);close(p.height,q.height,`route height ${at}`);
 // Same nearest point. At the corner two neighbouring segments share, either may be named (rounding decides the tie),
 // so the route segment may differ by one there; trail progress is the same point either way.
 assert.equal(a.trail,b.trail,`trail ${at}`);close(a.progress,b.progress,`trail progress ${at}`);
 assert.ok(Math.abs(p.segment-q.segment)<=1,`route segment ${at}: ${p.segment} vs ${q.segment}`);
}

let checked=0;
// The whole terrain mesh grid, cell edges and corners included, plus a margin outside the index.
for(let x=-260;x<=260;x+=2.5)for(let z=-310;z<=230;z+=2.5){same(x,z);checked++;}
for(let i=0;i<40000;i++){const x=-250+Math.random()*500,z=-300+Math.random()*520;same(x,z);checked++;}
for(const t of TRAIL_SAMPLES)for(const p of t){same(p[0],p[2]);same(p[0]+.001,p[2]-.001);checked+=2;}
for(const p of VOLCANO_ROUTE){same(p[0],p[2]);checked++;}

// The terrain mesh the summit builds: 181 × 181 heights must now take well under a second.
const started=performance.now();for(let i=0;i<=180;i++)for(let j=0;j<=180;j++)crossroadsTerrain(-220+i*440/180,-265+j*450/180);
const ms=performance.now()-started;
assert.ok(ms<1500,`terrain heights took ${ms.toFixed(0)}ms`);
console.log(`PASS indexed trail and volcano lookups match the full scan at ${checked} points; terrain grid in ${ms.toFixed(0)}ms`);
