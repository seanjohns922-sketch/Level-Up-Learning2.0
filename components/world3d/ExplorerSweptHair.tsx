"use client";
import { Suspense } from 'react';
import { useTexture } from '@react-three/drei';
import { createExplorerHairGeometry, createBuzzHairGeometry, REFERENCE_HAIR_STYLES, type ReferenceHairStyle } from '@/lib/avatar/explorer-hair-geometry';

const geometries = new Map<ReferenceHairStyle, ReturnType<typeof createExplorerHairGeometry>>();
function geometryFor(style:ReferenceHairStyle){let geometry=geometries.get(style);if(!geometry){geometry=createExplorerHairGeometry(style);geometries.set(style,geometry);}return geometry;}
export function hasReferenceHair(style:string):style is ReferenceHairStyle{return REFERENCE_HAIR_STYLES.includes(style as ReferenceHairStyle);}
function HairArtwork({colour,style}:{colour:string;style:ReferenceHairStyle}) {
  const geometry = geometryFor(style);
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
export function ExplorerSweptHair({colour,style="swept"}:{colour:string;style?:ReferenceHairStyle}) {
  const geometry = geometryFor(style);
  return <group name="wardrobe-reference-hair" dispose={null}>
    {geometry.strands.map((strand,i)=><mesh key={i} geometry={strand} castShadow><meshStandardMaterial color={colour} roughness={.82}/></mesh>)}
    <mesh geometry={geometry.rearScalp} castShadow receiveShadow><meshStandardMaterial color={colour} roughness={.82}/></mesh>
    <mesh geometry={geometry.rear} castShadow receiveShadow><meshStandardMaterial color={colour} roughness={.82}/></mesh>
    <Suspense fallback={<mesh geometry={geometry.scalp}><meshStandardMaterial color={colour} roughness={.78}/></mesh>}>
      <HairArtwork colour={colour} style={style}/>
    </Suspense>
  </group>;
}

const buzzGeometry=createBuzzHairGeometry();
export function ExplorerBuzzHair({colour}:{colour:string}){return <mesh geometry={buzzGeometry} dispose={null} castShadow><meshStandardMaterial color={colour} roughness={.95}/></mesh>;}
