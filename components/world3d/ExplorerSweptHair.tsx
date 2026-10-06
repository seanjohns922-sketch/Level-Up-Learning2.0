"use client";
import type { HatStyle } from '@/components/avatar/StudentAvatar';
import { Suspense } from 'react';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { createExplorerHairGeometry, createBuzzHairGeometry, CURLY_STYLES, REFERENCE_HAIR_STYLES, ROPE_STYLES, type ReferenceHairStyle } from '@/lib/avatar/explorer-hair-geometry';

const fittedGeometries = new Map<string, ReturnType<typeof createExplorerHairGeometry>>();
function geometryFor(style:ReferenceHairStyle,hat:HatStyle='none'){
 const covered=hat!=='none'&&hat!=='crown'&&hat!=='astronaut';
 const key=`${style}:${covered?'fitted':'loose'}`;
 let geometry=fittedGeometries.get(key);
 if(!geometry){
  geometry=createExplorerHairGeometry(style);
  if(covered)for(const mesh of [geometry.scalp,geometry.rear,geometry.rearScalp,...geometry.strands]){
   const p=mesh.getAttribute('position');
   for(let i=0;i<p.count;i++){const y=p.getY(i);if(y>1.24){const amount=Math.min(1,(y-1.24)/.16);p.setXYZ(i,p.getX(i)*(1-.23*amount),1.24+(y-1.24)*.27,p.getZ(i)*(1-.2*amount));}}
   p.needsUpdate=true;mesh.computeVertexNormals();mesh.computeBoundingBox();
  }
  // Keep a close scalp layer under covered hats. Compressing the artwork must
  // never expose the skin dome, and an open crown keeps the original hairstyle.
  if(covered){geometry.rearScalp.dispose();geometry.rearScalp=createBuzzHairGeometry();}
  fittedGeometries.set(key,geometry);
 }
 return geometry;
}
export function hasReferenceHair(style:string):style is ReferenceHairStyle{return REFERENCE_HAIR_STYLES.includes(style as ReferenceHairStyle);}

/**
 * The wardrobe artwork's light and dark strands become a grey shading map, so the 3D hair keeps the
 * painted strands and highlights while the student's chosen colour stays the only pigment.
 */
const shadingMaps=new Map<string,THREE.Texture>();
function shadingFromArtwork(style:string,image:HTMLImageElement|ImageBitmap){
 const cached=shadingMaps.get(style);if(cached)return cached;
 const size=512,canvas=document.createElement('canvas');canvas.width=canvas.height=size;
 const ctx=canvas.getContext('2d',{willReadFrequently:true})!;ctx.drawImage(image as CanvasImageSource,0,0,size,size);
 const data=ctx.getImageData(0,0,size,size),px=data.data,lum:number[]=[];
 for(let i=0;i<px.length;i+=4)if(px[i+3]>128)lum.push(.3*px[i]+.59*px[i+1]+.11*px[i+2]);
 lum.sort((a,b)=>a-b);
 const high=lum[Math.floor(lum.length*.95)]||255,median=lum[Math.floor(lum.length*.5)]||200;
 for(let i=0;i<px.length;i+=4){
  // Transparent margins take the median tone so the shell's edges never sample a dark fringe.
  const l=px[i+3]>128?.3*px[i]+.59*px[i+1]+.11*px[i+2]:median;
  const v=Math.round(255*Math.min(1,Math.pow(l/high,.85)));px[i]=px[i+1]=px[i+2]=v;px[i+3]=255;
 }
 ctx.putImageData(data,0,0);
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;
 shadingMaps.set(style,texture);return texture;
}

type StrandKind='straight'|'curly'|'rope';
const strandMaps=new Map<StrandKind,THREE.Texture>();
/** Tileable grey strand texture for the back of the head; v runs from crown to nape. */
function strandTexture(kind:StrandKind){
 const cached=strandMaps.get(kind);if(cached)return cached;
 const size=256,canvas=document.createElement('canvas');canvas.width=canvas.height=size;
 const ctx=canvas.getContext('2d')!;ctx.fillStyle='#b8b8b8';ctx.fillRect(0,0,size,size);
 let seed=kind.length*97;const rand=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
 if(kind==='straight'){
  // Long gently waving strands with a few bright highlights.
  for(let i=0;i<150;i++){const x=rand()*size,w=.6+rand()*1.6,shade=rand();ctx.strokeStyle=shade>.8?'rgba(255,255,255,.55)':shade<.4?'rgba(60,60,60,.45)':'rgba(140,140,140,.4)';ctx.lineWidth=w;ctx.beginPath();
   for(let y=-4;y<=size+4;y+=8){const xx=x+Math.sin(y*.04+i)*2.5;ctx.lineTo(((xx%size)+size)%size,y);}ctx.stroke();}
 }else if(kind==='curly'){
  // Overlapping coils: dark undersides, bright tops.
  for(let i=0;i<260;i++){const x=rand()*size,y=rand()*size,r=4+rand()*6;
   for(const [dx,dy] of [[0,0],[size,0],[-size,0],[0,size],[0,-size]]){
    ctx.lineWidth=2.4;ctx.strokeStyle='rgba(50,50,50,.55)';ctx.beginPath();ctx.arc(x+dx,y+dy+1,r,.1*Math.PI,1.1*Math.PI);ctx.stroke();
    ctx.lineWidth=1.6;ctx.strokeStyle='rgba(255,255,255,.6)';ctx.beginPath();ctx.arc(x+dx,y+dy-1,r,1.1*Math.PI,1.9*Math.PI);ctx.stroke();}}
 }else{
  // Rope sections for locs and braids: stacked twisted segments in columns.
  const columns=8,cw=size/columns;
  for(let c=0;c<columns;c++)for(let y=0;y<size;y+=10){const x=c*cw+cw/2+Math.sin(y*.05+c)*2;
   const g=ctx.createLinearGradient(x-cw*.42,0,x+cw*.42,0);g.addColorStop(0,'#5a5a5a');g.addColorStop(.45,'#e8e8e8');g.addColorStop(1,'#4a4a4a');
   ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(x,y+5,cw*.42,6.5,c%2?.35:-.35,0,Math.PI*2);ctx.fill();}
 }
 const texture=new THREE.CanvasTexture(canvas);texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.repeat.set(kind==='rope'?3:4,kind==='straight'?1:2.4);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;
 strandMaps.set(kind,texture);return texture;
}
const strandKind=(style:string):StrandKind=>ROPE_STYLES.has(style)?'rope':CURLY_STYLES.has(style)?'curly':'straight';

/** Lifts the student's colour slightly so the shading map's mid-tones land on the chosen shade. */
function pigment(colour:string){return new THREE.Color(colour).multiplyScalar(1.22);}

function HairArtwork({colour,style,hat}:{colour:string;style:ReferenceHairStyle;hat:HatStyle}) {
  const geometry = geometryFor(style,hat);
  const texture = useTexture(`/avatars/hair/hair_${style}.png`);
  // Cached per style, so this is computed once however many avatars share it.
  const shading = texture?.image?shadingFromArtwork(style,texture.image as HTMLImageElement):null;
  return <>
    <mesh geometry={geometry.scalp} castShadow receiveShadow>
      {/* The artwork supplies strand shading and relief, never a second pigment colour.
          All hair surfaces use the student's selected colour. */}
      <meshStandardMaterial color={pigment(colour)} map={shading} bumpMap={texture} bumpScale={.012} roughness={.62}/>
    </mesh>
    {/* Underside and rolled edges keep the same strands, a little darker as if in shadow. */}
    <mesh geometry={geometry.rear} castShadow receiveShadow><meshStandardMaterial color={pigment(colour).multiplyScalar(.82)} map={shading} roughness={.7}/></mesh>
  </>;
}
export function ExplorerSweptHair({colour,style="swept",hat="none"}:{colour:string;style?:ReferenceHairStyle;hat?:HatStyle}) {
  const geometry = geometryFor(style,hat);
  const strands = typeof document==='undefined'?null:strandTexture(strandKind(style));
  const back = <meshStandardMaterial color={pigment(colour)} map={strands} bumpMap={strands} bumpScale={.01} roughness={.66}/>;
  return <group name="wardrobe-reference-hair" dispose={null}>
    {geometry.strands.map((strand,i)=><mesh key={i} geometry={strand} castShadow><meshStandardMaterial color={pigment(colour)} map={strands} bumpMap={strands} bumpScale={.01} roughness={.66}/></mesh>)}
    <mesh geometry={geometry.rearScalp} castShadow receiveShadow>{back}</mesh>
    <Suspense fallback={<><mesh geometry={geometry.scalp}><meshStandardMaterial color={colour} roughness={.72}/></mesh><mesh geometry={geometry.rear}><meshStandardMaterial color={colour} roughness={.72}/></mesh></>}>
      <HairArtwork colour={colour} style={style} hat={hat}/>
    </Suspense>
  </group>;
}

const buzzGeometry=createBuzzHairGeometry();
export function ExplorerBuzzHair({colour}:{colour:string}){return <mesh geometry={buzzGeometry} dispose={null} castShadow><meshStandardMaterial color={colour} roughness={.95}/></mesh>;}
