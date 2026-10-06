import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import Module,{createRequire} from 'node:module';
import ts from 'typescript';
import React from 'react';
import sharp from 'sharp';
const require=createRequire(import.meta.url),cache=new Map();
function compile(file){
 file=path.resolve(file);if(file.endsWith('.json'))return {default:JSON.parse(fs.readFileSync(file,'utf8'))};if(cache.has(file))return cache.get(file).exports;
 const module=new Module(file);cache.set(file,module);
 module.require=(name)=>{
  if(name==='three')return THREE;
  if(name==='@react-three/fiber')return {useFrame:()=>{},useThree:()=>({}),createPortal:(children,container)=>({type:'review-portal',props:{children,container}})};
  if(name==='react')return {...React,useRef:()=>({current:null}),useMemo:fn=>fn(),useEffect:()=>{}};
  if(name.startsWith('.')||name.startsWith('@/')){const base=name.startsWith('@/')?path.resolve(name.slice(2)):path.resolve(path.dirname(file),name);const found=[base,base+'.tsx',base+'.ts'].find(p=>fs.existsSync(p)&&fs.statSync(p).isFile());if(found)return compile(found);}
  return require(name);
 };
 module._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2020}}).outputText,file);return module.exports;
}

const THREE=await import('three');
const {TrainUnit}=compile('components/world3d/TrainModels.tsx');
const {TRAIN_DESIGNS}=compile('lib/world3d/train-catalogue.ts');
function attach(element,parent){
 if(element==null||typeof element==='boolean')return;
 if(Array.isArray(element)){element.forEach(child=>attach(child,parent));return;}
 const {type,props}=element;if(type===React.Fragment||type===React.Suspense){attach(props.children,parent);return;}if(typeof type==='function'){attach(type(props),parent);return;}
 if(type==='review-portal'){attach(props.children,props.container);return;}
 if(type==='primitive'){parent.add(props.object);return;}
 if(type.endsWith('Geometry')){const C=THREE[type[0].toUpperCase()+type.slice(1)];parent.geometry=new C(...(props.args??[]));return;}
 if(type==='meshStandardMaterial'||type==='meshBasicMaterial'){parent.material=new THREE.MeshStandardMaterial(props);return;}
 assert.ok(type==='mesh'||type==='group','Known 3D element '+type);
 const object=type==='mesh'?new THREE.Mesh():new THREE.Group();for(const name of ['position','rotation','scale'])if(props[name]){if(typeof props[name]==='number')object[name].setScalar(props[name]);else object[name].set(...props[name]);}
 if(props.quaternion)object.quaternion.copy(props.quaternion);
 if(props.geometry)object.geometry=props.geometry;parent.add(object);attach(props.children,object);
}

for(const design of TRAIN_DESIGNS){const root=new THREE.Group();
 for(let car=0;car<=design.cars;car++){const group=new THREE.Group();group.position.z=-car*1.85;root.add(group);attach(TrainUnit({asset:design.key,car}),group);}
 root.updateMatrixWorld(true);const bounds=new THREE.Box3().setFromObject(root),size=bounds.getSize(new THREE.Vector3());
  const centre=bounds.getCenter(new THREE.Vector3()),extent=Math.max(...size.toArray());
  const camera=new THREE.OrthographicCamera(-extent,extent,extent*.8,-extent*.8,.01,1000);
  camera.position.copy(centre).add(new THREE.Vector3(1,.65,1).normalize().multiplyScalar(extent*4));camera.lookAt(centre);camera.updateMatrixWorld();
  const inverse=camera.quaternion.clone().invert();let half=0;
  for(const x of [-size.x/2,size.x/2])for(const y of [-size.y/2,size.y/2])for(const z of [-size.z/2,size.z/2]){const v=new THREE.Vector3(x,y,z).applyQuaternion(inverse);half=Math.max(half,Math.abs(v.y),Math.abs(v.x)/1.25);}
  half*=1.15;camera.left=-half*1.25;camera.right=half*1.25;camera.top=half;camera.bottom=-half;camera.updateProjectionMatrix();
  const faces=[],light=new THREE.Vector3(-.6,1,.8).normalize();
  root.traverse(o=>{
   if(!o.isMesh)return;let visible=true;for(let p=o;p;p=p.parent)if(!p.visible)visible=false;if(!visible)return;
   const g=o.geometry,position=g.getAttribute('position'),indices=g.index?.array;
   for(let i=0;i<(indices?.length??position.count);i+=3){
    const vertices=[0,1,2].map(j=>new THREE.Vector3().fromBufferAttribute(position,indices?indices[i+j]:i+j).applyMatrix4(o.matrixWorld));
    const normal=vertices[1].clone().sub(vertices[0]).cross(vertices[2].clone().sub(vertices[0])).normalize();
    const mid=vertices.reduce((sum,v)=>sum.add(v),new THREE.Vector3()).divideScalar(3);
    if(o.material.side!==THREE.DoubleSide&&normal.dot(camera.position.clone().sub(mid))<=0)continue;
    const shade=.64+.36*Math.max(0,normal.dot(light)),colour=o.material.color.clone().multiplyScalar(shade).getStyle();
    const points=vertices.map(v=>v.project(camera));
    const uv=g.getAttribute('uv');const texcoords=uv?[0,1,2].map(j=>new THREE.Vector2().fromBufferAttribute(uv,indices?indices[i+j]:i+j)):null;
    faces.push({opacity:o.material.transparent?o.material.opacity:1,texture:o.material.map?.image,texcoords,linear:o.material.color.clone().multiplyScalar(shade),points:points.map(v=>({x:(v.x+1)*250,y:(1-v.y)*200,z:v.z})),rgb:o.material.color.clone().multiplyScalar(shade).convertLinearToSRGB().toArray().map(v=>Math.round(v*255)),depth:points.reduce((n,v)=>n+v.z,0)/3,svg:`<polygon points="${points.map(v=>`${((v.x+1)*250).toFixed(2)},${((1-v.y)*200).toFixed(2)}`).join(' ')}" fill="${colour}" stroke="${colour}" stroke-width=".3"/>`});
   }
  });
  const pixels=Buffer.alloc(500*400*4),depths=new Float64Array(500*400).fill(Infinity);
  for(let i=0;i<500*400;i++){pixels[i*4]=233;pixels[i*4+1]=230;pixels[i*4+2]=220;pixels[i*4+3]=255;}
  const cross=(a,b,x,y)=>(b.x-a.x)*(y-a.y)-(b.y-a.y)*(x-a.x);
  faces.sort((a,b)=>(a.opacity<1)-(b.opacity<1)||(a.opacity<1?b.depth-a.depth:0));
  for(const face of faces){
   const [a,b,c]=face.points,area=cross(a,b,c.x,c.y);if(Math.abs(area)<1e-9)continue;
   const minX=Math.max(0,Math.floor(Math.min(a.x,b.x,c.x))),maxX=Math.min(499,Math.ceil(Math.max(a.x,b.x,c.x)));
   const minY=Math.max(0,Math.floor(Math.min(a.y,b.y,c.y))),maxY=Math.min(399,Math.ceil(Math.max(a.y,b.y,c.y)));
   for(let y=minY;y<=maxY;y++)for(let x=minX;x<=maxX;x++){
    const u=cross(b,c,x+.5,y+.5)/area,v=cross(c,a,x+.5,y+.5)/area,w=1-u-v;
    if(u<0||v<0||w<0)continue;
    const z=u*a.z+v*b.z+w*c.z,index=y*500+x;if(z>=depths[index])continue;if(face.opacity===1)depths[index]=z;
    let rgb=face.rgb;
    if(face.texture&&face.texcoords){const tx=Math.max(0,Math.min(face.texture.width-1,Math.round((u*face.texcoords[0].x+v*face.texcoords[1].x+w*face.texcoords[2].x)*face.texture.width)));const ty=Math.max(0,Math.min(face.texture.height-1,Math.round((1-(u*face.texcoords[0].y+v*face.texcoords[1].y+w*face.texcoords[2].y))*face.texture.height)));const k=(ty*face.texture.width+tx)*4;const data=face.texture.data;const light=(data[k]*.55+data[k+1]*1.85+data[k+2]*.2)/255;rgb=face.linear.clone().multiplyScalar(light).convertLinearToSRGB().toArray().map(n=>Math.min(255,Math.round(n*255)));}
    for(let j=0;j<3;j++)pixels[index*4+j]=Math.round(rgb[j]*face.opacity+pixels[index*4+j]*(1-face.opacity));
   }
  }

fs.mkdirSync('public/marketplace/world-renders',{recursive:true});await sharp(pixels,{raw:{width:500,height:400,channels:4}}).resize(800,640).webp({quality:94}).toFile(`public/marketplace/world-renders/${design.key}.webp`);root.traverse(o=>{if(o.isMesh){o.geometry.dispose();o.material.dispose();}});}
const tiles=await Promise.all(TRAIN_DESIGNS.map(async(d,i)=>({input:await sharp(`public/marketplace/world-renders/${d.key}.webp`).resize(320,256).extend({bottom:34,background:'#e9e6dc'}).composite([{input:Buffer.from(`<svg width="320" height="34"><text x="160" y="22" text-anchor="middle" font-family="sans-serif" font-size="12">${d.name} · ${d.price} XP</text></svg>`),top:256,left:0}]).png().toBuffer(),left:(i%2)*320,top:Math.floor(i/2)*290})));
fs.mkdirSync('output/world3d-audit',{recursive:true});await sharp({create:{width:640,height:1450,channels:4,background:'#e9e6dc'}}).composite(tiles).png().toFile('output/world3d-audit/train-collection.png');
console.log('Rendered all ten actual train models and their included carriages.');
