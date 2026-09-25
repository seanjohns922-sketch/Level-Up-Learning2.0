'use client';
import {useLayoutEffect,useMemo,useRef} from 'react';
import * as THREE from 'three';
import {EXPEDITION_TRAILS,TRAIL_SAMPLES,nearestTrail,crossroadsTerrain,trailThreat} from '@/lib/world3d/expedition-crossroads';
import {volcanoProjection} from '@/lib/world3d/volcano-expedition';

type Instance={matrix:THREE.Matrix4;colour:THREE.Color};
function Batch({items,kind}:{items:Instance[];kind:'trunk'|'canopy'|'marker'}){
 const ref=useRef<THREE.InstancedMesh>(null);
 useLayoutEffect(()=>{if(!ref.current)return;items.forEach((v,i)=>{ref.current!.setMatrixAt(i,v.matrix);ref.current!.setColorAt(i,v.colour);});ref.current.instanceMatrix.needsUpdate=true;if(ref.current.instanceColor)ref.current.instanceColor.needsUpdate=true;ref.current.computeBoundingSphere();},[items]);
 return <instancedMesh ref={ref} args={[undefined,undefined,items.length]}>{kind==='trunk'?<cylinderGeometry args={[.7,1,1,5]}/>:kind==='canopy'?<icosahedronGeometry args={[1,1]}/>:<boxGeometry/>}<meshLambertMaterial/></instancedMesh>;
}
export default function ExpeditionForest(){
 const forest=useMemo(()=>{
  const trunks:Instance[]=[],crowns:Instance[]=[],markers:Instance[]=[];const obj=new THREE.Object3D();
  function add(out:Instance[],x:number,y:number,z:number,sx:number,sy:number,sz:number,colour:THREE.Color){obj.position.set(x,y,z);obj.scale.set(sx,sy,sz);obj.rotation.set(0,x*.7,z*.002);obj.updateMatrix();out.push({matrix:obj.matrix.clone(),colour});}
  for(let i=0;i<300;i++){
   const x=Math.sin(i*12.989)*143,z=22+(Math.cos(i*7.317)+1)*52;
   if(Math.hypot(x,z-65)<17||nearestTrail(x,z).distance<8||volcanoProjection(x,z).distance<14||Math.abs(x)<6&&z>65||EXPEDITION_TRAILS.some(t=>Math.hypot(x-t.points[4][0],z-t.points[4][2])<12))continue;
   const y=crossroadsTerrain(x,z),height=5+i%5,threat=trailThreat(x,z),dead=threat>.6&&i%3===0;
   add(trunks,x,y+height*.4,z,.22,height*.8,.22,new THREE.Color('#665746').lerp(new THREE.Color('#3c3e40'),threat));
   for(let k=0;k<4;k++){
    const a=k*2.4;add(trunks,x+Math.sin(a)*.5,y+height*(.55+k*.06),z+Math.cos(a)*.5,.1,height*.25,.1,new THREE.Color('#554b3f'));
    if(!dead){const c=new THREE.Color('#65814e').lerp(new THREE.Color('#343e40'),threat*.8);c.multiplyScalar(.9+(i%4)*.05);add(crowns,x+Math.sin(a)*height*.16,y+height*(.62+k*.09),z+Math.cos(a)*height*.16,height*.25,height*.2,height*.25,c);}
   }
  }
  TRAIL_SAMPLES.forEach((path,k)=>{for(const i of [34,46,56]){
   const p=path[i],next=path[i+1],angle=Math.atan2(next[0]-p[0],next[2]-p[2]),side=(i+k)%2?1:-1;
   const x=p[0]+Math.cos(angle)*6.3*side,z=p[2]-Math.sin(angle)*6.3*side,y=crossroadsTerrain(x,z);
   add(markers,x,y+2,z,.23,4,.25,new THREE.Color('#403e3a'));
   add(markers,x+.5,y+3,z,1.2,1.5,.08,new THREE.Color(i>45?'#703a3c':'#896654'));
   add(markers,x+.5,y+3.1,z+.05,.2,.65,.06,new THREE.Color('#beaa79'));
  }});
  return {trunks,crowns,markers};
 },[]);
 const chunks=useMemo(()=>{
  const out=new Map<string,{trunks:Instance[];crowns:Instance[]}>();
  for(const kind of ['trunks','crowns'] as const)for(const item of forest[kind]){const key=`${Math.floor(item.matrix.elements[12]/48)}:${Math.floor(item.matrix.elements[14]/48)}`;if(!out.has(key))out.set(key,{trunks:[],crowns:[]});out.get(key)![kind].push(item);}return [...out.entries()];
 },[forest]);
 return <>{chunks.map(([key,c])=><group key={key}>{c.trunks.length>0&&<Batch kind="trunk" items={c.trunks}/ >}{c.crowns.length>0&&<Batch kind="canopy" items={c.crowns}/>}</group>)}<Batch kind="marker" items={forest.markers}/></>;
}
