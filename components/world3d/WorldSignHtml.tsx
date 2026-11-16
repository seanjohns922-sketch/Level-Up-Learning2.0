"use client";

import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, type ComponentProps } from "react";
import * as THREE from "three";

type HtmlProps = ComponentProps<typeof Html>;

/**
 * A sign floating in a 3D world (gate names, district nameplates). It always
 * sits beneath the screen controls (the HUD is z-index 18) and fades out as it
 * nears the top or sides of the screen, so a sign never covers the Current
 * Mission card or the XP bar, or hangs half cut off in a corner.
 */
export function WorldSignHtml({ position, children, zIndexRange = [5, 0], ...rest }: HtmlProps) {
  const anchor = useRef<THREE.Group>(null);
  const fade = useRef<HTMLDivElement>(null);
  const projected = useMemo(() => new THREE.Vector3(), []);
  useFrame(({ camera }) => {
    if (!anchor.current || !fade.current) return;
    anchor.current.getWorldPosition(projected).project(camera);
    const nearEdge = Math.max(Math.abs(projected.x), projected.y);
    fade.current.style.opacity = String(1 - THREE.MathUtils.smoothstep(nearEdge, 0.7, 0.9));
  });
  return (
    <group ref={anchor} position={position}>
      <Html zIndexRange={zIndexRange} {...rest}>
        <div ref={fade} style={{ transition: "opacity 160ms linear" }}>{children}</div>
      </Html>
    </group>
  );
}
