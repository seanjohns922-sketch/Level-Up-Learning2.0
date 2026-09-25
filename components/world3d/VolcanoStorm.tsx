'use client';
import {useEffect,useMemo,useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import * as THREE from 'three';

// One instanced cloud bank; lightning never flashes the camera or the whole world.
export default function VolcanoStorm(){
 const cloudMaterial=useRef<THREE.MeshLambertMaterial>(null);
 const cloud=useRef<THREE.InstancedMesh>(null),bank=useRef<THREE.Group>(null);
 const bolts=useRef<THREE.Group>(null);
 const core=useMemo(()=>new THREE.MeshBasicMaterial({color:'#e5eeff',transparent:true,opacity:0,side:THREE.DoubleSide,depthWrite:false,toneMapped:false,fog:false}),[]);
 const wasVisible=useRef(false);
 const reduced=useRef(false),nextStrike=useRef(6),strikeStart=useRef(-100),strikeIndex=useRef(0);
 const matrices=useMemo(()=>{
  const dummy=new THREE.Object3D(),result:THREE.Matrix4[]=[];
  // Uneven clusters avoid the repeated stacked-disc silhouette.
  for(let i=0;i<42;i++){
   const angle=i*2.39996,radius=48*Math.sqrt((i+.5)/42);
   dummy.position.set(Math.cos(angle)*radius,107+(1-radius/55)*22+Math.sin(i*3.7)*5,-130+Math.sin(angle)*radius*.7);
   dummy.rotation.set(i*.23,i*.71,i*.17);
   dummy.scale.set(15+Math.sin(i*1.8)*5,10+Math.cos(i*2.2)*3,15+Math.cos(i*2.3)*4);dummy.updateMatrix();result.push(dummy.matrix.clone());
  }return result;
 },[]);
 const lightning=useMemo(()=>{
  const geometries:THREE.BufferGeometry[]=[];
  const routes=[[[30,104,-82],[25,96,-78],[30,90,-75],[22,79,-72],[26,73,-69],[18,52,-66]],
   [[-34,105,-83],[-27,96,-80],[-32,89,-77],[-23,80,-73],[-27,71,-70],[-18,51,-67]],
   [[5,106,-78],[10,97,-76],[3,90,-73],[9,81,-70],[2,74,-67],[6,49,-64]]];
  for(const route of routes){const vertices:number[]=[];const add=(a:number[],b:number[],width:number)=>{const from=new THREE.Vector3(...a),to=new THREE.Vector3(...b),direction=to.clone().sub(from);const side=new THREE.Vector3(direction.y,-direction.x,0).normalize().multiplyScalar(width);const p=[from.clone().add(side),from.clone().sub(side),to.clone().add(side),to.clone().sub(side)];for(const j of [0,1,2,2,1,3])vertices.push(...p[j].toArray());};for(let i=1;i<route.length;i++)add(route[i-1],route[i],.4);const b=route[2];add(b,[b[0]+8,b[1]-3,b[2]],.1);add([b[0]+8,b[1]-3,b[2]],[b[0]+11,b[1]-8,b[2]+1],.07);const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometries.push(g);}
  return geometries;
 },[]);
 useEffect(()=>{const mesh=cloud.current;if(mesh){matrices.forEach((m,i)=>{mesh.setMatrixAt(i,m);mesh.setColorAt(i,new THREE.Color(i<12?'#657080':i<24?'#78828f':'#89929e'));});mesh.instanceMatrix.needsUpdate=true;if(mesh.instanceColor)mesh.instanceColor.needsUpdate=true;mesh.computeBoundingSphere();}},[matrices]);
 useEffect(()=>{const query=window.matchMedia('(prefers-reduced-motion: reduce)');const update=()=>{reduced.current=query.matches;};update();query.addEventListener('change',update);return()=>query.removeEventListener('change',update);},[]);
 useEffect(()=>()=>{lightning.forEach(g=>g.dispose());core.dispose();},[lightning,core]);
 useFrame(({clock})=>{
  const t=clock.elapsedTime;
  if(bank.current)bank.current.position.x=reduced.current?0:Math.sin(t*.035)*1.8;
  if(!reduced.current&&t>=nextStrike.current){strikeStart.current=t;nextStrike.current=t+8+(strikeIndex.current%3)*2;strikeIndex.current=(strikeIndex.current+1)%3;}
  const age=t-strikeStart.current,visible=!reduced.current&&age>=0&&age<1.1;
  if(bolts.current){bolts.current.visible=visible;bolts.current.children.forEach((child,i)=>{child.visible=i===strikeIndex.current;});}
  if(visible!==wasVisible.current){wasVisible.current=visible;if(process.env.NODE_ENV==='development')document.querySelector('[data-world3d-root]')?.setAttribute('data-volcano-lightning',String(visible));}
  const strength=visible?Math.sin(Math.PI*age/1.1):0;
  const mesh=bolts.current?.children[0]?.children[0] as THREE.Mesh<THREE.BufferGeometry,THREE.MeshBasicMaterial>|undefined;
  if(mesh)mesh.material.opacity=strength;
  if(cloudMaterial.current)cloudMaterial.current.emissiveIntensity=.55+strength*.45;

 });
 return <><group ref={bank}><instancedMesh ref={cloud} args={[undefined,undefined,matrices.length]}><sphereGeometry args={[1,16,12]}/><meshLambertMaterial ref={cloudMaterial} fog={false} emissive="#303745" emissiveIntensity={.55}/></instancedMesh><StormWisps/></group>
 <group ref={bolts} visible={false}>{lightning.map((g,i)=><group key={i}><mesh geometry={g} material={core}/></group>)}</group>
 </>;
}

function StormWisps(){
 const mesh=useRef<THREE.InstancedMesh>(null);
 const texture=useMemo(()=>{
  const size=128,data=new Uint8Array(size*size*4);
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
   const nx=x/size*2-1,ny=y/size*2-1;
   const billow=Math.sin(nx*11+Math.sin(ny*6))*Math.sin(ny*9+nx*3)*.1+Math.sin(nx*23+ny*14)*.035;
   const radius=Math.hypot(nx,ny)+billow,alpha=(1-THREE.MathUtils.smoothstep(radius,.25,1))*.65;
   const shade=54+Math.max(0,ny)*23+billow*70,k=(y*size+x)*4;
   data[k]=shade;data[k+1]=shade+7;data[k+2]=shade+18;data[k+3]=Math.round(alpha*255);
  }
  const t=new THREE.DataTexture(data,size,size);t.needsUpdate=true;t.minFilter=THREE.LinearFilter;t.magFilter=THREE.LinearFilter;return t;
 },[]);
 const uniforms=useMemo(()=>({smoke:{value:texture}}),[texture]);
 useEffect(()=>{const m=mesh.current;if(!m)return;const d=new THREE.Object3D();for(let i=0;i<22;i++){const angle=i*2.39996,r=40*Math.sqrt((i+.5)/22);d.position.set(Math.cos(angle)*r,108+Math.sin(i*2.3)*11,-98+Math.sin(angle)*r*.4);d.scale.set(29+Math.sin(i)*8,25+Math.cos(i*3)*8,1);d.updateMatrix();m.setMatrixAt(i,d.matrix);}m.instanceMatrix.needsUpdate=true;},[]);
 useEffect(()=>()=>texture.dispose(),[texture]);
 return <instancedMesh ref={mesh} args={[undefined,undefined,22]} frustumCulled={false} renderOrder={2}><planeGeometry args={[1,1]}/><shaderMaterial uniforms={uniforms} transparent depthWrite={false} vertexShader={`
 varying vec2 smokeUV;
 void main(){smokeUV=uv;vec4 centre=modelViewMatrix*instanceMatrix*vec4(0.,0.,0.,1.);centre.xy+=position.xy*vec2(length(instanceMatrix[0].xyz),length(instanceMatrix[1].xyz));gl_Position=projectionMatrix*centre;}
 `} fragmentShader={`
 uniform sampler2D smoke;varying vec2 smokeUV;
 void main(){gl_FragColor=texture2D(smoke,smokeUV);if(gl_FragColor.a<.01)discard;}
 `}/></instancedMesh>;
}
