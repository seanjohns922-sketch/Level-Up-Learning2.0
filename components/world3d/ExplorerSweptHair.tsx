"use client";
import { Suspense } from 'react';
import { useTexture } from '@react-three/drei';
import { createExplorerHairGeometry, type ReferenceHairStyle } from '@/lib/avatar/explorer-hair-geometry';

const geometries = Object.fromEntries(['swept','sidepart','short','fade'].map(style => [style,createExplorerHairGeometry(style as ReferenceHairStyle)])) as Record<ReferenceHairStyle, ReturnType<typeof createExplorerHairGeometry>>;
function HairArtwork({colour,style}:{colour:string;style:ReferenceHairStyle}) {
  const geometry = geometries[style];
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
  const geometry = geometries[style];
  return <group name="wardrobe-reference-hair" dispose={null}>
    <mesh geometry={geometry.rear} castShadow receiveShadow><meshStandardMaterial color={colour} roughness={.82}/></mesh>
    <Suspense fallback={<mesh geometry={geometry.scalp}><meshStandardMaterial color={colour} roughness={.78}/></mesh>}>
      <HairArtwork colour={colour} style={style}/>
    </Suspense>
  </group>;
}
