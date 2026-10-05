"use client";
import * as THREE from 'three';
export type Point3=[number,number,number];
export function AccessoryTube({points,radius=.012,colour,metalness=0}:{points:Point3[];radius?:number;colour:string;metalness?:number}){
 const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));
 return <mesh castShadow><tubeGeometry args={[curve,24,radius,8,false]}/><meshStandardMaterial color={colour} metalness={metalness} roughness={.5}/></mesh>;
}
export function AccessoryPlate({points,colour,depth=.035,metalness=.3}:{points:[number,number][];colour:string;depth?:number;metalness?:number}){
 const shape=new THREE.Shape();points.forEach(([x,y],i)=>i?shape.lineTo(x,y):shape.moveTo(x,y));shape.closePath();
 return <mesh castShadow><extrudeGeometry args={[shape,{depth,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.008,bevelThickness:.008}]}/><meshStandardMaterial color={colour} metalness={metalness} roughness={.4}/></mesh>;
}
export function AccessoryBox({width,height,depth,colour}:{width:number;height:number;depth:number;colour:string}){
 const x=-width/2,y=-height/2,r=Math.min(.045,width/5,height/5),s=new THREE.Shape();
 s.moveTo(x+r,y);s.lineTo(x+width-r,y);s.quadraticCurveTo(x+width,y,x+width,y+r);s.lineTo(x+width,y+height-r);s.quadraticCurveTo(x+width,y+height,x+width-r,y+height);s.lineTo(x+r,y+height);s.quadraticCurveTo(x,y+height,x,y+height-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);
 return <mesh position={[0,0,-depth/2]} castShadow><extrudeGeometry args={[s,{depth,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:.008,bevelThickness:.008}]}/><meshStandardMaterial color={colour} roughness={.7}/></mesh>;
}
export function AccessoryGem({colour,size=.045}:{colour:string;size?:number}){return <mesh castShadow><octahedronGeometry args={[size]}/><meshStandardMaterial color={colour} metalness={.25} roughness={.22} emissive={colour} emissiveIntensity={.12}/></mesh>;}
