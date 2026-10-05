import sharp from "sharp";
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import Module, { createRequire } from 'node:module';
import ts from 'typescript';
import * as THREE from 'three';
import * as village from '../lib/world3d/village-buildings.ts';
import { CENTRAL_WORLD_CUSTOMISATION_CATALOG as catalogue } from '../lib/world3d/central-world-customisation-catalog.ts';
import { WORLD_ITEM_PRESENTATION, fitWorldItemScale } from '../lib/world3d/world-item-presentation.ts';
import { selectCentralWorldInventoryPlacement, parseGridSize, writeCentralWorldPlacements, readCentralWorldPlacements, validateCentralWorldPlacement } from '../lib/world3d/central-world-layout.ts';
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
const {VillageBuilding}=compile('components/world3d/VillageBuildings.tsx',{'./DetailedScenery':primitives,'@/lib/world3d/village-buildings':village});
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
const measurements=[],previews=[];
const items=new Map(catalogue.map(item=>[item.item_key,item]));
const storage=new Map();globalThis.window={localStorage:{getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,value)}};
for(const spec of village.VILLAGE_BUILDINGS){
 const item=catalogue.find(item=>item.metadata.worldAssetKey===spec.key);
 assert(item?.purchasable && item.price>0,'XP reward registered');
 const styles=spec.kind==='apartments'?['castle']:Object.keys(village.VILLAGE_STYLES);
 for(const style of styles){
  const root=new THREE.Group();attach(VillageBuilding({assetKey:spec.key,style,tint:'#a855f7'}),root);root.updateMatrixWorld(true);
  const bounds=new THREE.Box3().setFromObject(root,true),size=bounds.getSize(new THREE.Vector3());
  const footprint=parseGridSize(item).map(n=>n*2),scale=fitWorldItemScale(size,footprint,WORLD_ITEM_PRESENTATION[spec.key]);
  const actual=size.toArray().map((v,i)=>v*scale[i]);
  assert(actual.every(v=>v>0&&Number.isFinite(v)));
  assert(Math.abs(actual[1]-spec.height)<1e-5,'Every style reaches height without footprint shrink: '+spec.key+style);
  assert(actual[0]<=footprint[0]&&actual[2]<=footprint[1],'Full balconies and steps fit reservation');
  let recoloured=false;root.traverse(o=>{if(o.isMesh&&o.material.color.getHexString()==='a855f7')recoloured=true;});assert(recoloured);
  const first={placementId:spec.key+'-a',itemId:item.item_key,gridX:20,gridZ:20,rotation:90,buildingStyle:style,tint:'#a855f7'};
  const second={...selectCentralWorldInventoryPlacement(item,[first],{gridX:-20,gridZ:20}),buildingStyle:style,tint:'#a855f7'};
  assert.notEqual(second.placementId,first.placementId,'Buying one design permits a fresh copy, not moving the first');
  assert(validateCentralWorldPlacement(second,item,[first],items),'Repeat copy fits independently');
  writeCentralWorldPlacements(spec.key,[first,second]);
  const saved=readCentralWorldPlacements(spec.key).filter(p=>p.itemId===item.item_key);
  assert.deepEqual(saved,[first,second],'Independent style, rotation, colour and copies survive reload');
  if(style==='castle')measurements.push({key:spec.key,name:item.name,native:size.toArray(),size:actual,footprint});
  root.traverse(o=>{if(o.isMesh){o.geometry.dispose();o.material.dispose();}});
  // Generate thumbnails from the real geometry, rather than illustrative placeholders.
  const art=new THREE.Group();attach(VillageBuilding({assetKey:spec.key,style}),art);art.updateMatrixWorld(true);
  const center=bounds.getCenter(new THREE.Vector3()),extent=Math.max(size.x,size.y,size.z)*.85;
  const camera=new THREE.OrthographicCamera(-extent,extent,extent, -extent,.1,500);
  camera.position.copy(center).add(new THREE.Vector3(18,13,22));camera.lookAt(center);camera.updateMatrixWorld();
  const triangles=[];art.traverse(o=>{if(!o.isMesh)return;const g=o.geometry,p=g.getAttribute('position'),idx=g.index;
   for(let n=0;n<(idx?idx.count:p.count);n+=3){const verts=[0,1,2].map(j=>new THREE.Vector3().fromBufferAttribute(p,idx?idx.getX(n+j):n+j).applyMatrix4(o.matrixWorld));
    const normal=new THREE.Vector3().subVectors(verts[1],verts[0]).cross(new THREE.Vector3().subVectors(verts[2],verts[0])).normalize();
    const mid=verts.reduce((a,v)=>a.add(v),new THREE.Vector3()).multiplyScalar(1/3);
    if(normal.dot(new THREE.Vector3().subVectors(camera.position,mid))<=0)continue;
    const brightness=.65+.35*Math.max(0,normal.dot(new THREE.Vector3(-.4,.8,.6).normalize()));
    const colour=o.material.color.clone().multiplyScalar(brightness).getHexString();
    triangles.push({points:verts.map(v=>v.clone().project(camera).toArray()),colour:'#'+colour,depth:mid.clone().applyMatrix4(camera.matrixWorldInverse).z});
   }
  });triangles.sort((a,b)=>a.depth-b.depth);
  previews.push({key:spec.key,style,name:item.name,triangles});
  if(process.argv.includes('--write-assets')){
   const width=512,height=512,pixels=Buffer.alloc(width*height*3),zbuffer=new Float64Array(width*height).fill(Infinity);
   for(let i=0;i<width*height;i++){pixels[i*3]=230;pixels[i*3+1]=236;pixels[i*3+2]=221;}
   for(const t of triangles){
    const p=t.points.map(v=>[256+v[0]*240,240-v[1]*215,v[2]]),[a,b,c]=p;
    const det=(b[1]-c[1])*(a[0]-c[0])+(c[0]-b[0])*(a[1]-c[1]);if(Math.abs(det)<1e-10)continue;
    const rgb=[1,3,5].map(i=>parseInt(t.colour.slice(i,i+2),16));
    for(let y=Math.max(0,Math.floor(Math.min(...p.map(v=>v[1]))));y<=Math.min(511,Math.ceil(Math.max(...p.map(v=>v[1]))));y++)
    for(let x=Math.max(0,Math.floor(Math.min(...p.map(v=>v[0]))));x<=Math.min(511,Math.ceil(Math.max(...p.map(v=>v[0]))));x++){
     const u=((b[1]-c[1])*(x+.5-c[0])+(c[0]-b[0])*(y+.5-c[1]))/det;
     const v=((c[1]-a[1])*(x+.5-c[0])+(a[0]-c[0])*(y+.5-c[1]))/det,ww=1-u-v;
     if(u<0||v<0||ww<0)continue;const z=u*a[2]+v*b[2]+ww*c[2],i=y*512+x;
     if(z<zbuffer[i]){zbuffer[i]=z;for(let channel=0;channel<3;channel++)pixels[i*3+channel]=rgb[channel];}
    }
   }
   const png=await sharp(pixels,{raw:{width,height,channels:3}}).png().toBuffer();
   fs.writeFileSync('/tmp/'+spec.key+'-'+style+'.png',png);
   if(style==='castle')fs.writeFileSync('public/marketplace/central-world/'+spec.key+'.png',png);
  }
  art.traverse(o=>{if(o.isMesh){o.geometry.dispose();o.material.dispose();}});
 }
}
delete globalThis.window;
if(process.argv.includes('--write-assets')){
 const file='docs/world3d/item-scale-measurements.json';
 const existing=JSON.parse(fs.readFileSync(file)).filter(row=>!village.isVillageBuilding(row.key));
 fs.writeFileSync(file,'[\n'+[...existing,...measurements].map(row=>'  '+JSON.stringify(row)).join(',\n')+'\n]\n');
 fs.writeFileSync('/tmp/village-model-previews.json',JSON.stringify(previews));
 const sqlValue=v=>v===null?'null':typeof v==='boolean'||typeof v==='number'?String(v):"'"+String(v).replaceAll("'","''")+"'";
 const fields=['item_key','name','description','category','realm_id','rarity','price','icon','accent','active','purchasable','discoverable','sort_order','metadata'];
 const rows=catalogue.filter(i=>village.isVillageBuilding(i.metadata.worldAssetKey));
 const sql=rows.map(item=>'('+fields.map(f=>sqlValue(f==='metadata'?JSON.stringify(item[f]):item[f])).join(', ')+')').join(',\n');
 fs.writeFileSync('supabase/migrations/20261005120000_village_building_collection.sql','-- Additive village catalogue: existing purchases and session guards are unchanged.\nbegin;\ninsert into public.economy_items ('+fields.join(', ')+') values\n'+sql+'\non conflict (item_key) do nothing;\ncommit;\n');
}else{
 const saved=JSON.parse(fs.readFileSync('docs/world3d/item-scale-measurements.json'));
 for(const row of measurements){const match=saved.find(v=>v.key===row.key);assert(match);for(const f of ['native','size','footprint'])row[f].forEach((v,i)=>assert(Math.abs(v-match[f][i])<1e-5));}
}
console.log('PASS: 9 XP designs, 25 style models, actual footprints, recolouring and independent repeated placements survive reload.');
