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
const palettes=await import('../lib/world3d/realm-building-palettes.ts');
const designs=await import('../lib/world3d/realm-building-collections.ts');
const {RealmBuildingModel}=compile('components/world3d/RealmBuildingModels.tsx',{'@/lib/world3d/realm-building-palettes':palettes,'@/lib/world3d/realm-building-collections':designs});
const {REALM_BUILDING_DESIGNS,REALM_BUILDING_REVIEW_ITEMS,REALM_DESIGN_PRESENTATIONS}=await import('../lib/world3d/realm-building-collections.ts');
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
const render=process.argv.includes('--render');
const renders=[];
assert.equal(REALM_BUILDING_DESIGNS.length,18);
assert.equal(new Set(REALM_BUILDING_DESIGNS.map(item=>item.key)).size,18);
for(const realm of ['number','measurement','pattern','statistics','chance','space']){
 const set=REALM_BUILDING_DESIGNS.filter(item=>item.realm===realm);
 assert.deepEqual(set.map(item=>item.kind).sort(),['building','decoration','landmark']);
 assert.equal(set.filter(item=>item.price>0).length,1);
}
for(const item of REALM_BUILDING_REVIEW_ITEMS){
 assert.ok(!item.active&&!item.purchasable&&!item.discoverable,'Designs stay outside the live economy');
 const key=item.metadata.worldAssetKey;
 const root=new THREE.Group();attach(RealmBuildingModel({assetKey:key}),root);root.updateMatrixWorld(true);
 const bounds=new THREE.Box3().setFromObject(root,true),size=bounds.getSize(new THREE.Vector3());
 assert.ok(!bounds.isEmpty()&&size.toArray().every(v=>Number.isFinite(v)&&v>0),'Actual geometry: '+key);
 const footprint=parseGridSize(item).map(n=>n*2),p=REALM_DESIGN_PRESENTATIONS[key];
 const scale=fitWorldItemScale(size,footprint,p),actual=size.toArray().map((v,i)=>v*scale[i]);
 assert.ok(Math.abs(actual[0]-p.width)<1e-5,'Model reaches width without exceeding its land: '+key);
 assert.ok(actual[0]<=footprint[0]&&actual[2]<=footprint[1],'Fits land: '+key);
 const coloured=new THREE.Group();attach(RealmBuildingModel({assetKey:key,tint:'#a855f7'}),coloured);coloured.updateMatrixWorld(true);
 assert.deepEqual(new THREE.Box3().setFromObject(coloured,true).getSize(new THREE.Vector3()).toArray(),size.toArray());
 let painted=false;coloured.traverse(o=>{if(o.isMesh&&o.material.color?.getHexString()==='a855f7')painted=true;});assert.ok(painted,'Visible colour control: '+key);
 if(render&&designs.SIGNATURE_REALM_BUILDING_KEYS.includes(key)){
  // CPU projection of the actual mesh triangles for an offline design contact sheet.
  // The in-app review also renders these same models with the production WebGL lighting.
  const centre=bounds.getCenter(new THREE.Vector3()),extent=Math.max(...size.toArray());
  const camera=new THREE.OrthographicCamera(-extent,extent,extent*.8,-extent*.8,.01,1000);
  camera.position.copy(centre).add(new THREE.Vector3(.9,.65,1).normalize().multiplyScalar(extent*4));camera.lookAt(centre);camera.updateMatrixWorld();
  const inverse=camera.quaternion.clone().invert();let half=0;
  for(const x of [-size.x/2,size.x/2])for(const y of [-size.y/2,size.y/2])for(const z of [-size.z/2,size.z/2]){const v=new THREE.Vector3(x,y,z).applyQuaternion(inverse);half=Math.max(half,Math.abs(v.y),Math.abs(v.x)/1.25);}
  half*=1.15;camera.left=-half*1.25;camera.right=half*1.25;camera.top=half;camera.bottom=-half;camera.updateProjectionMatrix();
  const faces=[],light=new THREE.Vector3(-.6,1,.8).normalize();
  root.traverse(o=>{
   if(!o.isMesh)return;
   const g=o.geometry,position=g.getAttribute('position'),indices=g.index?.array;
   for(let i=0;i<(indices?.length??position.count);i+=3){
    const vertices=[0,1,2].map(j=>new THREE.Vector3().fromBufferAttribute(position,indices?indices[i+j]:i+j).applyMatrix4(o.matrixWorld));
    const normal=vertices[1].clone().sub(vertices[0]).cross(vertices[2].clone().sub(vertices[0])).normalize();
    const mid=vertices.reduce((sum,v)=>sum.add(v),new THREE.Vector3()).divideScalar(3);
    if(o.material.side!==THREE.DoubleSide&&normal.dot(camera.position.clone().sub(mid))<=0)continue;
    const shade=.64+.36*Math.max(0,normal.dot(light)),colour=o.material.color.clone().multiplyScalar(shade).getStyle();
    const points=vertices.map(v=>v.project(camera));
    faces.push({points:points.map(v=>({x:(v.x+1)*250,y:(1-v.y)*200,z:v.z})),rgb:o.material.color.clone().multiplyScalar(shade).convertLinearToSRGB().toArray().map(v=>Math.round(v*255)),depth:points.reduce((n,v)=>n+v.z,0)/3,svg:`<polygon points="${points.map(v=>`${((v.x+1)*250).toFixed(2)},${((1-v.y)*200).toFixed(2)}`).join(' ')}" fill="${colour}" stroke="${colour}" stroke-width=".3"/>`});
   }
  });
  const pixels=Buffer.alloc(500*400*4),depths=new Float64Array(500*400).fill(Infinity);
  for(let i=0;i<500*400;i++){pixels[i*4]=233;pixels[i*4+1]=230;pixels[i*4+2]=220;pixels[i*4+3]=255;}
  const cross=(a,b,x,y)=>(b.x-a.x)*(y-a.y)-(b.y-a.y)*(x-a.x);
  for(const face of faces){
   const [a,b,c]=face.points,area=cross(a,b,c.x,c.y);if(Math.abs(area)<1e-9)continue;
   const minX=Math.max(0,Math.floor(Math.min(a.x,b.x,c.x))),maxX=Math.min(499,Math.ceil(Math.max(a.x,b.x,c.x)));
   const minY=Math.max(0,Math.floor(Math.min(a.y,b.y,c.y))),maxY=Math.min(399,Math.ceil(Math.max(a.y,b.y,c.y)));
   for(let y=minY;y<=maxY;y++)for(let x=minX;x<=maxX;x++){
    const u=cross(b,c,x+.5,y+.5)/area,v=cross(c,a,x+.5,y+.5)/area,w=1-u-v;
    if(u<0||v<0||w<0)continue;
    const z=u*a.z+v*b.z+w*c.z,index=y*500+x;if(z>=depths[index])continue;depths[index]=z;
    for(let j=0;j<3;j++)pixels[index*4+j]=face.rgb[j];
   }
  }
  renders.push({key,name:item.name,realm:item.metadata.realmName,kind:"Signature building · design preview",pixels});
 }
 for(const scene of [root,coloured])scene.traverse(o=>{if(o.isMesh){o.geometry.dispose();o.material.dispose();}});
}
if(render){
 const sharp=(await import('sharp')).default;
 const directory='output/world3d-audit/realm-designs';fs.mkdirSync(directory,{recursive:true});
 const layers=[];
 for(let i=0;i<renders.length;i++){
  const row=renders[i],png=await sharp(row.pixels,{raw:{width:500,height:400,channels:4}}).png().toBuffer();fs.writeFileSync(`${directory}/${row.key}.png`,png);
  const x=i%3*500,y=Math.floor(i/3)*460;
  layers.push({input:png,left:x,top:y});
  const safe=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;');
  const caption=Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="500" height="60"><rect width="500" height="60" fill="#f5f2e9"/><text x="18" y="24" font-family="Arial" font-size="18" font-weight="bold" fill="#263a32">${safe(row.name)}</text><text x="18" y="46" font-family="Arial" font-size="13" fill="#58675b">${safe(row.realm)} · ${safe(row.kind)}</text></svg>`);
  layers.push({input:caption,left:x,top:y+400});
 }
 await sharp({create:{width:1500,height:920,channels:3,background:'#f5f2e9'}}).composite(layers).png().toFile('output/world3d-audit/realm-collection-designs.png');
}
console.log('PASS: 18 distinct realm designs, six complete collections, true mesh geometry, intended footprints, recolouring and review-only catalogue isolation.');
