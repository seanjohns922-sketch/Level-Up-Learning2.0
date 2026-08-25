"use client";

import { useFrame, useLoader, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

export function WorldPanorama({ asset, radius = 68, height = 48, y = 20, rotationY = 0, repeatX = 1, horizontalScale = 1, crisp = true, skyBlendColor, follow = false, backgroundLayer = false, flipX = false, thetaStart = 0, thetaLength = Math.PI * 2, edgeFade = 0 }: { asset: string; radius?: number; height?: number; y?: number; rotationY?: number; repeatX?: number; horizontalScale?: number; crisp?: boolean; skyBlendColor?: string; follow?: boolean; backgroundLayer?: boolean; flipX?: boolean; thetaStart?: number; thetaLength?: number; edgeFade?: number }) {
  const source = useLoader(THREE.TextureLoader, asset);
  const { gl } = useThree();
  const meshRef = useRef<THREE.Mesh>(null);
  // When `follow` is set the panorama tracks the camera on the ground plane, so
  // the distant horizon always stays the same distance away (no treadmill feel).
  useFrame(({ camera }) => {
    if (!follow || !meshRef.current) return;
    meshRef.current.position.x = camera.position.x;
    meshRef.current.position.z = camera.position.z;
  });
  const texture = useMemo(() => {
    const image = source.image as HTMLImageElement;
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth || image.width;
    canvas.height = image.naturalHeight || image.height;
    const context = canvas.getContext("2d");
    if (context) {
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      if (skyBlendColor) {
        const blend = context.createLinearGradient(0, 0, 0, canvas.height * 0.3);
        blend.addColorStop(0, skyBlendColor);
        blend.addColorStop(0.58, `${skyBlendColor}cc`);
        blend.addColorStop(1, `${skyBlendColor}00`);
        context.fillStyle = blend;
        context.fillRect(0, 0, canvas.width, canvas.height * 0.3);
      }
      if (edgeFade > 0) {
        const fade = Math.min(0.2, edgeFade);
        const edgeMask = context.createLinearGradient(0, 0, canvas.width, 0);
        edgeMask.addColorStop(0, "rgba(255,255,255,0)");
        edgeMask.addColorStop(fade, "rgba(255,255,255,1)");
        edgeMask.addColorStop(1 - fade, "rgba(255,255,255,1)");
        edgeMask.addColorStop(1, "rgba(255,255,255,0)");
        context.globalCompositeOperation = "destination-in";
        context.fillStyle = edgeMask;
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.globalCompositeOperation = "source-over";
      }
    }
    const next = new THREE.CanvasTexture(canvas);
    next.wrapS = THREE.RepeatWrapping;
    next.repeat.set(flipX ? -repeatX : repeatX, 1);
    next.offset.x = flipX ? 1 : 0;
    next.colorSpace = THREE.SRGBColorSpace;
    next.generateMipmaps = !crisp;
    next.minFilter = crisp ? THREE.LinearFilter : THREE.LinearMipmapLinearFilter;
    next.magFilter = THREE.LinearFilter;
    next.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());
    next.needsUpdate = true;
    return next;
  }, [crisp, edgeFade, flipX, gl, repeatX, skyBlendColor, source]);
  useEffect(() => () => texture.dispose(), [texture]);
  return <mesh ref={meshRef} renderOrder={backgroundLayer ? -1000 : 0} position={[0, y, 0]} rotation={[0, rotationY, 0]} scale={[horizontalScale, 1, 1]}><cylinderGeometry args={[radius, radius, height, 64, 1, true, thetaStart, thetaLength]} /><meshBasicMaterial map={texture} side={THREE.BackSide} toneMapped={false} fog={false} transparent={edgeFade > 0} depthTest depthWrite={edgeFade > 0 ? false : !backgroundLayer} /></mesh>;
}
