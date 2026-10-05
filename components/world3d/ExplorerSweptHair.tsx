"use client";
import type { HatStyle } from '@/components/avatar/StudentAvatar';
import { Suspense } from 'react';
import { useTexture } from '@react-three/drei';
import { createExplorerHairGeometry, createBuzzHairGeometry, REFERENCE_HAIR_STYLES, type ReferenceHairStyle } from '@/lib/avatar/explorer-hair-geometry';

const fittedGeometries = new Map<string, ReturnType<typeof createExplorerHairGeometry>>();
function geometryFor(style:ReferenceHairStyle,hat:HatStyle='none'){
 const covered=hat!=='none'&&hat!=='crown';
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
function HairArtwork({colour,style,hat}:{colour:string;style:ReferenceHairStyle;hat:HatStyle}) {
  const geometry = geometryFor(style,hat);
  const texture = useTexture(`/avatars/hair/hair_${style}.png`);
  return <mesh geometry={geometry.scalp} castShadow receiveShadow>
    <meshStandardMaterial color={colour} map={texture} roughness={.78}
      onBeforeCompile={shader => {
        // Same tint weights as the SVG wardrobe. Preserve the original painted strands.
        shader.fragmentShader = shader.fragmentShader.replace('#include <map_fragment>', `
          #ifdef USE_MAP
            vec4 hairSample = texture2D(map, vMapUv);
            float hairLight = dot(hairSample.rgb, vec3(.55, 1.85, .2));
            diffuseColor.rgb *= hairLight;
            diffuseColor.a *= hairSample.a;
          #endif
        `);
      }} customProgramCacheKey={()=>'wardrobe-hair-tint-v1'}/>
  </mesh>;
}
export function ExplorerSweptHair({colour,style="swept",hat="none"}:{colour:string;style?:ReferenceHairStyle;hat?:HatStyle}) {
  const geometry = geometryFor(style,hat);
  return <group name="wardrobe-reference-hair" dispose={null}>
    {geometry.strands.map((strand,i)=><mesh key={i} geometry={strand} castShadow><meshStandardMaterial color={colour} roughness={.82}/></mesh>)}
    <mesh geometry={geometry.rearScalp} castShadow receiveShadow><meshStandardMaterial color={colour} roughness={.82}/></mesh>
    <mesh geometry={geometry.rear} castShadow receiveShadow><meshStandardMaterial color={colour} roughness={.82}/></mesh>
    <Suspense fallback={<mesh geometry={geometry.scalp}><meshStandardMaterial color={colour} roughness={.78}/></mesh>}>
      <HairArtwork colour={colour} style={style} hat={hat}/>
    </Suspense>
  </group>;
}

const buzzGeometry=createBuzzHairGeometry();
export function ExplorerBuzzHair({colour}:{colour:string}){return <mesh geometry={buzzGeometry} dispose={null} castShadow><meshStandardMaterial color={colour} roughness={.95}/></mesh>;}
