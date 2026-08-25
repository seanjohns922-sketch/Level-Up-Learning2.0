"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { WorldPanorama } from "@/components/world3d/WorldPanorama";

export type NumberNexusArtQuality = "low" | "medium" | "high";

export const NUMBER_NEXUS_PALETTE = {
  void: "#061116",
  fog: "#12363a",
  sky: "#17484b",
  skyTop: "#071a20",
  darkMetal: "#081b20",
  raisedMetal: "#102d31",
  panel: "#173b3d",
  stone: "#263f42",
  street: "#17282e",
  sidewalk: "#3a5355",
  plazaStone: "#30494b",
  roof: "#0b2025",
  cyan: "#22d3c5",
  teal: "#14b8a6",
  paleEnergy: "#99f6e4",
  amber: "#f6c453",
  warmWindow: "#f3c86b",
  completed: "#34d399",
  available: "#38bdf8",
  locked: "#52616b",
  barrier: "#d97745",
  white: "#ecfeff",
  buildingA: "#122b30",
  buildingB: "#19383b",
  buildingC: "#244649",
  towerGold: "#9a7438",
} as const;

const P = NUMBER_NEXUS_PALETTE;

export type CityBlockPlacement = {
  x: number;
  z: number;
  width: number;
  depth: number;
  height: number;
  rotation?: number;
  tint?: 0 | 1 | 2;
};

export function NumberNexusPanorama(props: Parameters<typeof WorldPanorama>[0] & { skyColor?: string }) {
  const { skyColor, ...panoramaProps } = props;
  return <WorldPanorama {...panoramaProps} repeatX={2} skyBlendColor={skyColor} />;
}

export function InstancedCityBlocks({ placements }: { placements: CityBlockPlacement[] }) {
  const bodyRef = useRef<THREE.InstancedMesh>(null);
  const windowsRef = useRef<THREE.InstancedMesh>(null);
  const crownsRef = useRef<THREE.InstancedMesh>(null);
  const tints = useMemo(() => [P.buildingA, P.buildingB, P.buildingC].map((value) => new THREE.Color(value)), []);

  useLayoutEffect(() => {
    const body = bodyRef.current;
    const windows = windowsRef.current;
    const crowns = crownsRef.current;
    if (!body || !windows || !crowns) return;
    const matrix = new THREE.Matrix4();
    const quaternion = new THREE.Quaternion();
    const frontOffset = new THREE.Vector3();
    placements.forEach((block, index) => {
      quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), block.rotation ?? 0);
      matrix.compose(
        new THREE.Vector3(block.x, block.height / 2, block.z),
        quaternion,
        new THREE.Vector3(block.width, block.height, block.depth),
      );
      body.setMatrixAt(index, matrix);
      body.setColorAt(index, tints[block.tint ?? (index % 3)]!);

      matrix.compose(
        new THREE.Vector3(block.x, block.height + 0.34, block.z),
        quaternion,
        new THREE.Vector3(block.width * 0.72, 0.68, block.depth * 0.72),
      );
      crowns.setMatrixAt(index, matrix);

      const front = new THREE.Vector3(0, 0, block.depth / 2 + 0.03).applyQuaternion(quaternion);
      for (let row = 0; row < 3; row += 1) {
        frontOffset.set(block.x + front.x, block.height * (0.3 + row * 0.21), block.z + front.z);
        matrix.compose(
          frontOffset,
          quaternion,
          new THREE.Vector3(block.width * 0.64, 0.34, 1),
        );
        windows.setMatrixAt(index * 3 + row, matrix);
      }
    });
    body.instanceMatrix.needsUpdate = true;
    crowns.instanceMatrix.needsUpdate = true;
    windows.instanceMatrix.needsUpdate = true;
    if (body.instanceColor) body.instanceColor.needsUpdate = true;
  }, [placements, tints]);

  return (
    <group>
      <instancedMesh ref={bodyRef} args={[undefined, undefined, placements.length]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial roughness={0.72} metalness={0.24} />
      </instancedMesh>
      <instancedMesh ref={crownsRef} args={[undefined, undefined, placements.length]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={P.roof} roughness={0.7} metalness={0.28} />
      </instancedMesh>
      <instancedMesh ref={windowsRef} args={[undefined, undefined, placements.length * 3]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial color={P.warmWindow} transparent opacity={0.76} toneMapped={false} />
      </instancedMesh>
    </group>
  );
}

export function StreetLamp({ position, accent = P.amber }: { position: [number, number, number]; accent?: string }) {
  return (
    <group position={position}>
      <mesh position={[0, 1.7, 0]}>
        <cylinderGeometry args={[0.08, 0.12, 3.4, 8]} />
        <meshStandardMaterial color={P.darkMetal} metalness={0.54} roughness={0.48} />
      </mesh>
      <mesh position={[0, 3.42, 0]}>
        <boxGeometry args={[0.58, 0.2, 0.38]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.72} />
      </mesh>
    </group>
  );
}

export function EnergyPylon({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.85, 0]}>
        <cylinderGeometry args={[0.25, 0.44, 1.7, 8]} />
        <meshStandardMaterial color={P.raisedMetal} metalness={0.46} roughness={0.52} />
      </mesh>
      <mesh position={[0, 1.85, 0]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color={P.cyan} emissive={P.cyan} emissiveIntensity={0.68} />
      </mesh>
    </group>
  );
}

export function CircuitInlay({
  position,
  size,
  color = P.teal,
}: {
  position: [number, number, number];
  size: [number, number, number];
  color?: string;
}) {
  return (
    <mesh position={position}>
      <boxGeometry args={size} />
      <meshBasicMaterial color={color} toneMapped={false} />
    </mesh>
  );
}
