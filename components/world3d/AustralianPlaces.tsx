"use client";
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { Box, Ball, Pole, Ring, Roof, Window, Tree, Bench } from "./DetailedScenery";

const cream="#d5c9ac",timber="#8d704d",iron="#4c5b53",roof="#79867e";
export function PaintedSign({text,width=2,color="#d9ca9f",ink="#344b42"}:{text:string;width?:number;color?:string;ink?:string}){
 const texture=useMemo(()=>{const c=document.createElement("canvas");c.width=512;c.height=128;const context=c.getContext("2d")!;context.fillStyle=color;context.fillRect(0,0,512,128);context.strokeStyle=ink;context.lineWidth=5;context.strokeRect(9,9,494,110);context.fillStyle=ink;context.font="bold 42px Georgia";context.textAlign="center";context.textBaseline="middle";context.fillText(text,256,67,465);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;},[text,color,ink]);
 useEffect(()=>()=>texture.dispose(),[texture]);
 return <mesh><planeGeometry args={[width,width/4]}/><meshStandardMaterial map={texture} roughness={.9}/></mesh>;
}
function Railing({width=3,y=1.1,z=1.5}:{width?:number;y?:number;z?:number}){
 return <group><Box p={[0,y,z]} s={[width,.065,.07]} c={cream}/><Box p={[0,y-.6,z]} s={[width,.06,.06]} c={cream}/>{Array.from({length:Math.ceil(width/.18)},(_,i)=>{const count=Math.ceil(width/.18);return <Box key={i} p={[(i/(count-1)-.5)*width,y-.3,z]} s={[.027,.6,.027]} c={cream}/>;})}</group>;
}
function Weatherboards({width=2.8,height=1.6,z=1.01,y=1.2}:{width?:number;height?:number;z?:number;y?:number}){
 return <group>{Array.from({length:Math.ceil(height/.11)},(_,i)=><Box key={i} p={[0,y+i*.11,z]} s={[width,.08,.023]} c={i%2?"#c6bda5":cream}/>)}</group>;
}
export const AUSTRALIAN_PLACE_KEYS=new Set(["clubhouse","workshop","farmyard","observatory","games_room","arcade","water_park","sports_stadium"]);
export function AustralianPlace({assetKey}:{assetKey:string}){
 if(assetKey==="clubhouse")return <group>
  {[-1.65,0,1.65].flatMap(x=>[-1.3,0,1.3].map(z=><Box key={`${x}-${z}`} p={[x,.5,z]} s={[.13,1,.13]} c={timber}/>))}
  {Array.from({length:20},(_,i)=><Box key={i} p={[0,1,(i-9.5)*.17]} s={[3.8,.12,.155]} c={i%2?"#978064":"#aa9474"}/>)}
  <Box p={[0,1.9,-.35]} s={[2.7,1.8,2]} c={cream}/><Weatherboards width={2.7} height={1.75} y={1.05} z={.66}/>
  <Roof y={2.95} width={4.1} depth={3.7} c="#77847a"/>
  {[-1.7,1.7].flatMap(x=>[-1.4,0,1.4].map(z=><group key={`${x}-${z}`}><Pole a={[x,1,z]} b={[x,2.7,z]} radius={.04} c={cream}/><Pole a={[x,2.1,z]} b={[x*.78,2.55,z]} radius={.027} c={cream}/></group>))}
  {[-1,1].map(side=><group key={side} position={[side*1.16,1,0]}><Railing width={1.1} z={1.58}/></group>)}
  {[-1,1].map(side=><group key={side} position={[side*1.78,1,0]} rotation={[0,Math.PI/2,0]}><Railing width={3.1} z={0}/></group>)}
  {[-.86,.86].map(x=><Window key={x} x={x} y={2.02} z={.69}/>)}<Box p={[0,1.7,.68]} s={[.64,1.35,.055]} c="#617c70"/>
  <Box p={[0,2.04,.72]} s={[.48,.53,.015]} c="#748d87"/><Box p={[.2,1.7,.74]} s={[.025,.08,.025]} c="#bbaa75"/>
  {Array.from({length:6},(_,i)=><Box key={i} p={[0,.09+i*.16,2.35-i*.14]} s={[.93,.18,.3]} c={timber}/>)}
  {[-.5,.5].map(x=><Pole key={x} a={[x,.7,2.48]} b={[x,1.7,1.57]} radius={.027} c={cream}/>)}
 </group>;
 if(assetKey==="workshop")return <group><Box p={[0,.09,0]} s={[4.2,.18,3.2]} c="#bcb89f"/><Box p={[0,1.5,-.25]} s={[3.5,2.8,2.3]} c="#c8c9b6"/><Box p={[0,2.99,-.25]} s={[3.8,.16,2.6]} c={roof}/>
  {[-1,.95].map(x=><Box key={x} p={[x,.83,.92]} s={[1.1,1.3,.05]} c="#87958a"/>)}{Array.from({length:9},(_,i)=><Box key={i} p={[-1,.27+i*.14,.96]} s={[1.1,.016,.012]} c="#566b60"/>)}
  <Box p={[0,1.68,1.15]} s={[3.9,.16,1.1]} c={cream}/><Box p={[0,2.05,.92]} s={[2.9,.48,.035]} c="#66827f"/>
  {[-1.6,0,1.6].map(x=><Pole key={x} a={[x,1.75,1.65]} b={[x,2.37,1.65]} radius={.025} c={iron}/>)}<Pole a={[-1.7,2.37,1.65]} b={[1.7,2.37,1.65]} radius={.025} c={iron}/>
  <group position={[0,2.68,.93]}><PaintedSign text="SURF LIFE SAVING" width={2.5}/></group>
  {[-1,1].map(side=><group key={side}><Pole a={[side*1.75,2.95,0]} b={[side*1.75,3.8,0]} radius={.018} c={iron}/><Box p={[side*1.75+.2,3.58,0]} s={[.4,.22,.012]} c={side<0?"#b96549":"#c9aa55"}/></group>)}
  <Ball p={[1.75,.94,1.1]} s={[.16,.82,.055]} c="#d3b464"/><Box p={[1.75,.94,1.16]} s={[.08,1.15,.01]} c="#ba654e"/><Ring p={[-1.72,1.1,1.08]} radius={.22} tube={.055} c="#c5a575"/>
 </group>;
 if(assetKey==="farmyard")return <group><Box p={[-.45,.92,0]} s={[2.65,1.7,2.1]} c={cream}/><group position={[-.45,0,0]}><Weatherboards width={2.65} height={1.65} y={.1} z={1.06}/><Roof y={1.95} width={3} depth={2.55} c="#8c9790"/></group>
  {[-1.25,.35].map(x=><Window key={x} x={x} y={1.07} z={1.1}/>)}<Box p={[-.45,.72,1.08]} s={[.5,1.25,.035]} c={timber}/><Box p={[-.45,1.62,1.4]} s={[3,.065,.8]} r={[.13,0,0]} c={roof}/>{[-1.85,.95].map(x=><Pole key={x} a={[x,0,1.74]} b={[x,1.61,1.74]} radius={.045} c={cream}/>)}
  <group position={[1.45,0,-.4]}>{[-1,1].flatMap(x=>[-1,1].map(z=><Pole key={`${x}-${z}`} a={[x*.3,0,z*.3]} b={[x*.08,2.7,z*.08]} radius={.018} c={iron}/>))}{[.6,1.2,1.8].map(y=><Pole key={y} a={[-.25,y,-.2]} b={[.25,y+.4,-.1]} radius={.015} c={iron}/>)}<group position={[0,2.7,0]} rotation={[Math.PI/2,0,0]}><Ring p={[0,0,0]} radius={.6} tube={.02} c={roof}/>{Array.from({length:12},(_,i)=>{const a=i*Math.PI/6;return <Box key={i} p={[Math.cos(a)*.43,0,Math.sin(a)*.43]} s={[.3,.025,.13]} r={[0,-a,.2]} c={i%2?"#b9bbae":"#7a8981"}/>;})}</group></group>
  <mesh position={[1.5,.45,1.05]}><cylinderGeometry args={[.38,.38,.9,24]}/><meshStandardMaterial color="#8a9790" metalness={.25} roughness={.7}/></mesh>{[.1,.25,.4,.55,.7,.85].map(y=><Ring key={y} p={[1.5,y,1.05]} radius={.385} tube={.012} c="#6a7b71"/>)}</group>;
 if(assetKey==="observatory")return <group><mesh position={[0,.16,0]}><cylinderGeometry args={[1.35,1.45,.32,32]}/><meshStandardMaterial color="#b5b3a0"/></mesh><Pole a={[0,.25,0]} b={[0,6,0]} radius={.21} c="#a6afa4"/>{Array.from({length:12},(_,i)=>{const a=i*Math.PI/6;return <Pole key={i} a={[Math.sin(a)*1.15,.25,Math.cos(a)*1.15]} b={[Math.sin(a)*.66,5.7,Math.cos(a)*.66]} radius={.012} c="#87998e"/>;})}<mesh position={[0,6.15,0]}><cylinderGeometry args={[.95,.7,1.25,32]}/><meshStandardMaterial color="#bea164" metalness={.35} roughness={.55}/></mesh>{[5.65,5.9,6.2,6.5,6.8].map(y=><Ring key={y} p={[0,y,0]} radius={.8+(y-5.65)*.12} tube={.035} c="#c6ac73"/>)}{Array.from({length:28},(_,i)=>{const a=i*Math.PI/14;return <Box key={i} p={[Math.sin(a)*.92,6.4,Math.cos(a)*.92]} s={[.17,.22,.02]} r={[0,a,0]} c="#5a7470"/>;})}<Pole a={[0,6.8,0]} b={[0,8.6,0]} radius={.035} c={iron}/><Ball p={[0,8.65,0]} s={[.055,.065,.055]} c="#b56b4e"/></group>;
 if(assetKey==="games_room"||assetKey==="arcade")return <group><Box p={[0,1,0]} s={[3.3,2,2.3]} c={assetKey==="games_room"?cream:"#798c85"}/><Box p={[0,2.07,0]} s={[3.55,.14,2.5]} c={roof}/><Box p={[0,1.73,1.17]} s={[3.3,.48,.1]} c="#e2d4b0"/><group position={[0,1.74,1.23]}><PaintedSign text={assetKey==="games_room"?"MILK BAR":"SEASIDE ARCADE"} width={2.7}/></group>
  {[-1.03,1.03].map(x=><group key={x}><Box p={[x,.93,1.18]} s={[1,.92,.045]} c="#57716f"/><Box p={[x,.49,1.23]} s={[1.12,.07,.18]} c={timber}/><Box p={[x,1,1.22]} s={[.035,.94,.025]} c={cream}/></group>)}<Box p={[0,.75,1.18]} s={[.6,1.4,.05]} c={timber}/><Box p={[0,1,1.22]} s={[.45,.66,.02]} c="#738c82"/>
  {Array.from({length:12},(_,i)=><Box key={i} p={[(i-5.5)*.28,1.46,1.46]} s={[.28,.05,.62]} r={[.12,0,0]} c={i%2?cream:assetKey==="games_room"?"#ac7761":"#617f7b"}/>)}
  {assetKey==="games_room"?<group position={[-1.15,0,1.9]} scale={.7}><Bench/></group>:[-1,1].map(x=><group key={x}><Box p={[x,.5,1.7]} s={[.4,.9,.38]} c={iron}/><Box p={[x,.7,1.9]} s={[.28,.3,.015]} c="#b9ae73"/><Box p={[x,.47,1.94]} s={[.36,.065,.18]} c="#ad795c"/><Ball p={[x-.07,.55,1.98]} s={[.025,.04,.025]} c="#617f7b"/></group>)}
 </group>;
 if(assetKey==="water_park")return <group><mesh position={[0,.07,0]} scale={[1.3,1,.9]}><cylinderGeometry args={[1.9,2.05,.14,48]}/><meshStandardMaterial color="#bfb491"/></mesh><mesh position={[0,.15,0]} rotation={[-Math.PI/2,0,0]} scale={[1.3,.9,1]}><circleGeometry args={[1.65,48]}/><meshStandardMaterial color="#639e9b" roughness={.17} metalness={.25}/></mesh>{[-1,1].map(side=><group key={side} position={[side*1.8,0,-.8]} scale={.7}><Tree variant="gum_tree"/></group>)}{[-1,1].map(side=><group key={side} position={[side*1.5,0,1.1]} rotation={[0,side*.5,0]}><Box p={[0,.2,0]} s={[.45,.06,.85]} c={cream}/><Box p={[0,.4,-.4]} s={[.45,.55,.045]} r={[-.45,0,0]} c={cream}/></group>)}<Ring p={[.7,.19,.6]} radius={.22} tube={.055} c="#c6ab6f"/></group>;
 if(assetKey==="sports_stadium")return <group>
  {/* Venue dimensions are authored in world metres: widening the field must not
      turn goalposts, seating and the scoreboard into gigantic stretched props. */}
  <mesh position={[0,.04,0]} rotation={[-Math.PI/2,0,0]} scale={[1.666667,1,1]} receiveShadow><circleGeometry args={[18,96]}/><meshStandardMaterial color="#668452"/></mesh>
  <mesh position={[0,.055,0]} rotation={[-Math.PI/2,0,0]} scale={[1.666667,1,1]}><ringGeometry args={[16.9,17,96]}/><meshBasicMaterial color="#dedfc4"/></mesh>
  <Ring p={[0,.07,0]} radius={3} tube={.05} c="#e1ddc5"/>
  {[-1,1].map(side=><group key={side}>
   {[-6,-2,2,6].map(z=><Pole key={z} a={[side*28,.05,z]} b={[side*28,Math.abs(z)<3?8:5,z]} radius={.1} c="#ddd9be"/>)}
   {[0,1,2,3].map(row=><Box key={row} p={[0,.35+row*.45,side*(18+row*.65)]} s={[24,.22,.6]} c={row%2?"#849087":"#aaad95"}/>)}
   {[-1,1].map(end=><group key={end}><Pole a={[end*31.5,0,side*18]} b={[end*31.5,11.5,side*18]} radius={.15} c={iron}/><Box p={[end*31.5,11.5,side*18]} s={[1,.8,.35]} c="#d6cda9"/></group>)}
  </group>)}
  <Box p={[0,4,-20.5]} s={[7,3,.25]} c={iron}/>
  {[-2.5,2.5].map(x=><Pole key={x} a={[x,0,-20.5]} b={[x,4,-20.5]} radius={.12} c={iron}/>)}
  <group position={[0,4,-20.35]}><PaintedSign text="HOME  42 : 36" width={6}/></group>
 </group>;
 return null;
}
