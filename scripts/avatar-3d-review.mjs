import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import Module,{createRequire} from 'node:module';
import ts from 'typescript';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import sharp from 'sharp';
const require=createRequire(import.meta.url),cache=new Map();
function compile(file){
 file=path.resolve(file);if(file.endsWith('.json'))return {default:JSON.parse(fs.readFileSync(file,'utf8'))};if(cache.has(file))return cache.get(file).exports;
 const module=new Module(file);cache.set(file,module);
 module.require=(name)=>{
  if(name==='@/lib/avatar-appearance')return {useCanonicalAvatarAppearance:()=>reviewOutfit};
  if(name==='three')return THREE;
  if(name==='@react-three/drei')return {useGLTF:()=>gltf,useTexture:path=>hairTextures[path]};
  if(name==='@react-three/fiber')return {useFrame:()=>{},useThree:()=>({})};
  if(name==='react')return {...React,useRef:()=>({current:null}),useMemo:fn=>fn(),useEffect:()=>{}};
  if(name.startsWith('.')||name.startsWith('@/')){const base=name.startsWith('@/')?path.resolve(name.slice(2)):path.resolve(path.dirname(file),name);const found=[base,base+'.tsx',base+'.ts'].find(p=>fs.existsSync(p)&&fs.statSync(p).isFile());if(found)return compile(found);}
  return require(name);
 };
 module._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2020}}).outputText,file);return module.exports;
}

const THREE=await import('three');
const {GLTFLoader}=await import('three/examples/jsm/loaders/GLTFLoader.js');
const bytes=fs.readFileSync('public/avatars/models/codemaster-premium.glb');
const gltf=await new Promise((resolve,reject)=>new GLTFLoader().parse(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'',resolve,reject));
const hairTextures={};
for(const style of ['swept','sidepart','short','fade']){const image=await sharp(`public/avatars/hair/hair_${style}.png`).ensureAlpha().raw().toBuffer({resolveWithObject:true});hairTextures[`/avatars/hair/hair_${style}.png`]=new THREE.DataTexture(image.data,image.info.width,image.info.height);}
const {DEFAULT_OUTFIT}=compile('components/avatar/StudentAvatar.tsx');
const reviewOutfit={...DEFAULT_OUTFIT,top:'realm_codemaster',shirt:'#30263f',shirtTrim:'#b79860',pants:'#292536',shoes:'#494052',shoeStyle:'boots',hairStyle:'sidepart',held:'flame_blade'};
const {TrialStudentAvatar}=compile('components/world3d/SharedWorldPlayer.tsx');
function attach(element,parent){
 if(element==null||typeof element==='boolean')return;
 if(Array.isArray(element)){element.forEach(child=>attach(child,parent));return;}
 const {type,props}=element;if(type===React.Fragment||type===React.Suspense){attach(props.children,parent);return;}if(typeof type==='function'){attach(type(props),parent);return;}
 if(type==='primitive'){parent.add(props.object);return;}
 if(type.endsWith('Geometry')){const C=THREE[type[0].toUpperCase()+type.slice(1)];parent.geometry=new C(...(props.args??[]));return;}
 if(type==='meshStandardMaterial'||type==='meshBasicMaterial'){parent.material=new THREE.MeshStandardMaterial(props);return;}
 assert.ok(type==='mesh'||type==='group','Known 3D element '+type);
 const object=type==='mesh'?new THREE.Mesh():new THREE.Group();for(const name of ['position','rotation','scale'])if(props[name]){if(typeof props[name]==='number')object[name].setScalar(props[name]);else object[name].set(...props[name]);}
 if(props.geometry)object.geometry=props.geometry;parent.add(object);attach(props.children,object);
}

for(const view of ['front','angle']){const root=new THREE.Group();attach(TrialStudentAvatar({movingRef:{current:false}}),root);root.updateMatrixWorld(true);const bounds=new THREE.Box3().setFromObject(root),size=bounds.getSize(new THREE.Vector3());
  const centre=bounds.getCenter(new THREE.Vector3()),extent=Math.max(...size.toArray());
  const camera=new THREE.OrthographicCamera(-extent,extent,extent*.8,-extent*.8,.01,1000);
  camera.position.copy(centre).add(new THREE.Vector3(view==='front'?0:.65,.1,1).normalize().multiplyScalar(extent*4));camera.lookAt(centre);camera.updateMatrixWorld();
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
    const uv=g.getAttribute('uv');const texcoords=uv?[0,1,2].map(j=>new THREE.Vector2().fromBufferAttribute(uv,indices?indices[i+j]:i+j)):null;
    faces.push({texture:o.material.map?.image,texcoords,linear:o.material.color.clone().multiplyScalar(shade),points:points.map(v=>({x:(v.x+1)*250,y:(1-v.y)*200,z:v.z})),rgb:o.material.color.clone().multiplyScalar(shade).convertLinearToSRGB().toArray().map(v=>Math.round(v*255)),depth:points.reduce((n,v)=>n+v.z,0)/3,svg:`<polygon points="${points.map(v=>`${((v.x+1)*250).toFixed(2)},${((1-v.y)*200).toFixed(2)}`).join(' ')}" fill="${colour}" stroke="${colour}" stroke-width=".3"/>`});
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
    let rgb=face.rgb;
    if(face.texture&&face.texcoords){const tx=Math.max(0,Math.min(face.texture.width-1,Math.round((u*face.texcoords[0].x+v*face.texcoords[1].x+w*face.texcoords[2].x)*face.texture.width)));const ty=Math.max(0,Math.min(face.texture.height-1,Math.round((1-(u*face.texcoords[0].y+v*face.texcoords[1].y+w*face.texcoords[2].y))*face.texture.height)));const k=(ty*face.texture.width+tx)*4;const data=face.texture.data;const light=(data[k]*.55+data[k+1]*1.85+data[k+2]*.2)/255;rgb=face.linear.clone().multiplyScalar(light).convertLinearToSRGB().toArray().map(n=>Math.min(255,Math.round(n*255)));}
    for(let j=0;j<3;j++)pixels[index*4+j]=rgb[j];
   }
  }

fs.mkdirSync('output/world3d-audit',{recursive:true});await sharp(pixels,{raw:{width:500,height:400,channels:4}}).png().toFile(`output/world3d-audit/avatar-3d-${view}.png`);root.traverse(o=>{if(o.isMesh){o.geometry.dispose();o.material.dispose();}});}
console.log('Rendered production avatar geometry from two angles.');
