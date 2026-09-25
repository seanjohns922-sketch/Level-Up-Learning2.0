"use client";

import { useFrame, useLoader, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

export type WorldPanoramaRingProps = {
  asset: string;
  rearAsset?: string;
  sectionAssets?: readonly [string, string, string, string];
  radius?: number;
  height?: number;
  y?: number;
  rotationY?: number;
  horizontalScale?: number;
  repeatX?: number;
  flipX?: boolean;
  skyBlendColor?: string;
  follow?: boolean;
  /** Preserve native detail for artwork explicitly authored for crisp display. */
  sharpDetail?: boolean;
  /** Lift dark architecture while preserving black, white and the night palette. */
  shadowLift?: number;
};

const vertexShader = `
  varying vec2 panoramaUv;
  void main() {
    panoramaUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform sampler2D frontMap;
  uniform sampler2D rearMap;
  uniform sampler2D section2Map;
  uniform sampler2D section3Map;
  uniform float sectioned;
  uniform float paired;
  uniform float repeats;
  uniform float mirrored;
  uniform float blendSky;
  uniform float shadowLift;
  uniform vec3 sky;
  varying vec2 panoramaUv;

  vec4 samplePanel(float index, float local, float v) {
    // Reserve only the outer 2.5% for the join; keep landmark centres fixed.
    float u = sectioned > .5 ? clamp(local, 0.0, 1.0) : clamp(local * .95 + .025, 0.0, 1.0);
    u = mix(1.0 - u, u, mirrored);
    vec2 uv = vec2(u, v);
    if (sectioned > .5) {
      float section = mod(index + 4.0, 4.0);
      if (section < .5) return texture2D(frontMap, uv);
      if (section < 1.5) return texture2D(rearMap, uv);
      if (section < 2.5) return texture2D(section2Map, uv);
      return texture2D(section3Map, uv);
    }
    if (paired > .5 && mod(index + 2.0, 2.0) < .5) return texture2D(rearMap, uv);
    return texture2D(frontMap, uv);
  }

  void main() {
    // Rear is centred on +Z, front on -Z, matching the original hemispheres.
    float position = sectioned > .5
      ? fract(1.0 - panoramaUv.x) * 4.0
      : paired > .5
      ? fract(1.0 - panoramaUv.x + .25) * 2.0
      : fract((1.0 - panoramaUv.x) * repeats);
    float index = floor(position);
    float local = fract(position);
    vec4 colour = samplePanel(index, local, panoramaUv.y);
    // One opaque sample mix: weights sum to one, including the 360-degree join.
    // No overlapping transparent cylinders, depth fighting, or sky leaking through.
    if (local < .025) {
      float weight = .5 * (1.0 - smoothstep(0.0, .025, local));
      colour = mix(colour, samplePanel(index - 1.0, local + 1.0, panoramaUv.y), weight);
    } else if (local > .975) {
      float weight = .5 * smoothstep(.975, 1.0, local);
      colour = mix(colour, samplePanel(index + 1.0, local - 1.0, panoramaUv.y), weight);
    }
    // A bounded exposure curve opens shadows without clipping neon highlights.
    colour.rgb = colour.rgb * (1.0 + shadowLift) / (1.0 + colour.rgb * shadowLift);
    colour.rgb = mix(colour.rgb, sky, blendSky * smoothstep(.82, 1.0, panoramaUv.y));
    gl_FragColor = vec4(colour.rgb, 1.0);
    #include <colorspace_fragment>
  }
`;

/** A complete, opaque horizon. Source art stays separate and retains its resolution. */
export function WorldPanoramaRing({ asset, rearAsset, sectionAssets, radius = 68, height = 48, y = 20, rotationY = 0, horizontalScale = 1, repeatX = 1, flipX = false, skyBlendColor, follow = false, sharpDetail = false, shadowLift = 0 }: WorldPanoramaRingProps) {
  const sources = useLoader(THREE.TextureLoader, sectionAssets ? [...sectionAssets] : rearAsset ? [asset, rearAsset] : [asset]);
  const { gl } = useThree();
  const mesh = useRef<THREE.Mesh>(null);
  const textures = useMemo(() => sources.map(source => {
    const texture = source.clone();
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.generateMipmaps = !sharpDetail;
    texture.minFilter = sharpDetail ? THREE.LinearFilter : THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.anisotropy = Math.min(16, gl.capabilities.getMaxAnisotropy());
    texture.needsUpdate = true;
    return texture;
  }), [sources, gl, sharpDetail]);
  useEffect(() => () => textures.forEach(texture => texture.dispose()), [textures]);
  const uniforms = useMemo(() => ({
    frontMap: { value: textures[0] }, rearMap: { value: textures[1] ?? textures[0] },
    section2Map: { value: textures[2] ?? textures[0] }, section3Map: { value: textures[3] ?? textures[0] },
    sectioned: { value: sectionAssets ? 1 : 0 },
    paired: { value: rearAsset ? 1 : 0 }, repeats: { value: repeatX },
    mirrored: { value: flipX ? 1 : 0 }, blendSky: { value: skyBlendColor ? 1 : 0 },
    shadowLift: { value: Math.max(0, Math.min(1, shadowLift)) },
    sky: { value: new THREE.Color(skyBlendColor ?? "#ffffff") },
  }), [textures, rearAsset, sectionAssets, repeatX, flipX, skyBlendColor, shadowLift]);
  useFrame(({ camera }) => {
    if (follow && mesh.current) {
      mesh.current.position.x = camera.position.x;
      mesh.current.position.z = camera.position.z;
    }
  });
  return <mesh ref={mesh} renderOrder={-1000} position={[0, y, 0]} rotation={[0, rotationY, 0]} scale={[horizontalScale, 1, 1]}>
    <cylinderGeometry args={[radius, radius, height, 192, 1, true]} />
    <shaderMaterial uniforms={uniforms} vertexShader={vertexShader} fragmentShader={fragmentShader} side={THREE.BackSide} depthTest={false} depthWrite={false} toneMapped={false} />
  </mesh>;
}
