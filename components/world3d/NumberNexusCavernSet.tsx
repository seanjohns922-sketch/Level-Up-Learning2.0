'use client';
// Number Nexus' own cavern: a counting cave. Base-ten blocks (hundreds flats, tens rods, ones cubes)
// stand along the walls showing three-digit numbers, and a number line of glowing posts runs beside
// the path, every tenth post taller. Code-drawn only; instance colours multiply the shared white materials.
import {useEffect,useMemo} from 'react';
import * as THREE from 'three';
import {Instances,type InstanceItem} from './VolcanicKit';

/** The three-digit numbers built in blocks, one per stretch of wall. */
const NUMBERS=[132,214,321,143,231,312,124,241];
const U=.2;

export default function NumberNexusCavernSet({colour,start,end}:{colour:string;start:number;end:number}){
 const box=useMemo(()=>new THREE.BoxGeometry(1,1,1),[]);
 const block=useMemo(()=>new THREE.MeshStandardMaterial({emissive:colour,emissiveIntensity:.25,roughness:.4,flatShading:true}),[colour]);
 const glow=useMemo(()=>new THREE.MeshBasicMaterial({toneMapped:false}),[]);
 const post=useMemo(()=>new THREE.MeshStandardMaterial({color:'#4b5262',roughness:.8}),[]);
 useEffect(()=>()=>{box.dispose();block.dispose();glow.dispose();post.dispose();},[box,block,glow,post]);

 // Base-ten blocks standing against the wall: flats are 10×10, rods 10 tall, ones single cubes.
 const cubes=useMemo(()=>{const out:InstanceItem[]=[];let i=0;
  for(let z=start-9;z>end+10;z-=15,i++){const side=i%2?1:-1,x=side*8,n=NUMBERS[i%NUMBERS.length],h=Math.floor(n/100),t=Math.floor(n/10)%10,o=n%10;let at=z+3.2;
   const cube=(y:number,zz:number,c:string)=>out.push({p:[x,.15+y*U,zz],s:[U*.9,U*.9,U*.9],c});
   for(let f=0;f<h;f++){for(let a=0;a<10;a++)for(let b=0;b<10;b++)cube(b,at-a*U,'#ffffff');at-=10*U+.3;}
   for(let r=0;r<t;r++){for(let b=0;b<10;b++)cube(b,at,'#ffe7a8');at-=U+.15;}
   at-=.15;for(let k=0;k<o;k++)cube(k,at,'#ffb4c8');}
  return out;},[start,end]);

 // A number line of posts along one edge of the path: every tenth post taller with a bright cap.
 const {posts,caps}=useMemo(()=>{const posts:InstanceItem[]=[],caps:InstanceItem[]=[];
  for(let z=start,n=0;z>end+2;z-=1,n++){const tall=n%10===0,h=tall?1.2:.45;posts.push({p:[2.55,h/2,z],s:[.08,h,.08],c:'#ffffff'});caps.push({p:[2.55,h+.05,z],s:tall?[.26,.12,.26]:[.12,.06,.12],c:'#ffffff'});}
  return {posts,caps};},[start,end]);

 return <>
  <Instances geometry={box} material={block} items={cubes}/>
  <Instances geometry={box} material={post} items={posts}/>
  <Instances geometry={box} material={glow} items={caps}/>
 </>;
}
