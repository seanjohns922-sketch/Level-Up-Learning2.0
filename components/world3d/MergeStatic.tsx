"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import * as THREE from "three";
import { bakeMeshes, disposeGeometries } from "@/components/world3d/three-build-utils";

/** Put this on a group's userData to keep its subtree live (animated or state-driven). */
export const KEEP_LIVE = { keepLive: true } as const;

function materialKey(material: THREE.Material, castShadow: boolean, receiveShadow: boolean) {
  const m = material as THREE.MeshStandardMaterial;
  return [
    m.type, m.color?.getHexString(), m.emissive?.getHexString(), m.emissiveIntensity, m.roughness, m.metalness,
    m.map?.uuid, m.transparent, m.opacity, m.side, m.flatShading, m.vertexColors, castShadow, receiveShadow,
  ].join("|");
}

function isLive(object: THREE.Object3D, root: THREE.Object3D) {
  for (let node: THREE.Object3D | null = object; node && node !== root; node = node.parent) if (node.userData.keepLive) return true;
  return false;
}

/**
 * Renders its children, then bakes every still mesh into one mesh per look
 * (colour, finish, shadows), so detailed code-built models draw in a handful of
 * calls. Subtrees marked with KEEP_LIVE, and instanced meshes, stay as they are.
 * The originals stay in the tree for clicks but are hidden from drawing.
 * Rebuilds when `version` changes (for example a quality setting).
 */
export function MergeStatic({ children, version }: { children: ReactNode; version?: string | number }) {
  const source = useRef<THREE.Group>(null);
  const output = useRef<THREE.Group>(null);

  useLayoutEffect(() => {
    const root = source.current, target = output.current;
    if (!root || !target) return;
    root.updateMatrixWorld(true);
    const still: THREE.Mesh[] = [];
    root.traverse((object) => {
      const mesh = object as THREE.Mesh;
      if (mesh.isMesh && !(mesh as unknown as THREE.InstancedMesh).isInstancedMesh && !Array.isArray(mesh.material) && !isLive(mesh, root)) still.push(mesh);
    });
    const baked = bakeMeshes(still, { toLocal: root.matrixWorld.clone().invert(), keyOf: (mesh) => materialKey(mesh.material as THREE.Material, mesh.castShadow, mesh.receiveShadow) });
    baked.children.forEach((mesh) => { (mesh as THREE.Mesh).raycast = () => {}; }); // clicks still land on the hidden originals
    still.forEach((mesh) => { mesh.visible = false; });
    target.add(baked);
    return () => {
      target.remove(baked);
      still.forEach((mesh) => { mesh.visible = true; });
      disposeGeometries(baked);
    };
  }, [version]);

  return (
    <>
      <group ref={source}>{children}</group>
      <group ref={output} />
    </>
  );
}
