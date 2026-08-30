"use client";

import { Edges, Html, RoundedBox, useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { Suspense, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import {
  CENTRAL_WORLD_CONFIG,
  type CentralWorldQuality,
} from "@/lib/world3d/central-world-config";
import type { EconomyItem } from "@/lib/economy";
import { WorldPanorama } from "@/components/world3d/WorldPanorama";
import {
  CENTRAL_WORLD_GRID,
  gridToWorld,
  parseGridSize,
  rotatedGridSize,
  type CentralWorldGroundTile,
  type CentralWorldGroundType,
  type CentralWorldPlacement,
} from "@/lib/world3d/central-world-layout";

const COLORS = {
  grass: "#527f37",
  grassDark: "#31552d",
  path: "#94745a",
  pathEdge: "#6f5744",
  stone: "#6d655b",
  towerStone: "#b98843",
  towerLight: "#dfb860",
  towerDark: "#59412f",
  bronze: "#76502d",
  door: "#211c1a",
};

function ValleyPath() {
  const geometries = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(CENTRAL_WORLD_CONFIG.pathPoints.map(([x, z]) => new THREE.Vector3(x, 0, z)));
    const ribbon = (width: number, y: number) => {
      const vertices: number[] = [];
      const indices: number[] = [];
      const segments = 48;
      for (let index = 0; index <= segments; index += 1) {
        const t = index / segments;
        const point = curve.getPoint(t);
        const tangent = curve.getTangent(t).normalize();
        const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).multiplyScalar(width / 2);
        vertices.push(point.x + normal.x, y, point.z + normal.z, point.x - normal.x, y, point.z - normal.z);
        if (index < segments) indices.push(index * 2, index * 2 + 1, index * 2 + 2, index * 2 + 1, index * 2 + 3, index * 2 + 2);
      }
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
      geometry.setIndex(indices);
      geometry.computeVertexNormals();
      return geometry;
    };
    return { edge: ribbon(4.1, 0.045), path: ribbon(3.35, 0.075) };
  }, []);
  return <group><mesh geometry={geometries.edge}><meshStandardMaterial color={COLORS.pathEdge} roughness={1} side={THREE.DoubleSide} /></mesh><mesh geometry={geometries.path}><meshStandardMaterial color={COLORS.path} roughness={0.96} side={THREE.DoubleSide} /></mesh></group>;
}

function MyHomePath() {
  const geometries = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(CENTRAL_WORLD_CONFIG.myHomePathPoints.map(([x, z]) => new THREE.Vector3(x, 0, z)));
    const ribbon = (width: number, y: number) => {
      const vertices: number[] = [];
      const indices: number[] = [];
      const segments = 28;
      for (let index = 0; index <= segments; index += 1) {
        const t = index / segments;
        const point = curve.getPoint(t);
        const tangent = curve.getTangent(t).normalize();
        const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).multiplyScalar(width / 2);
        vertices.push(point.x + normal.x, y, point.z + normal.z, point.x - normal.x, y, point.z - normal.z);
        if (index < segments) indices.push(index * 2, index * 2 + 1, index * 2 + 2, index * 2 + 1, index * 2 + 3, index * 2 + 2);
      }
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
      geometry.setIndex(indices);
      geometry.computeVertexNormals();
      return geometry;
    };
    return { edge: ribbon(2.9, 0.05), path: ribbon(2.3, 0.08) };
  }, []);
  return <group><mesh geometry={geometries.edge}><meshStandardMaterial color={COLORS.pathEdge} roughness={1} side={THREE.DoubleSide} /></mesh><mesh geometry={geometries.path}><meshStandardMaterial color={COLORS.path} roughness={0.96} side={THREE.DoubleSide} /></mesh></group>;
}

// ---------------------------------------------------------------------------
// Aussie marquee models. Authored around a ~4.6-unit base span so the shared
// footprint scale (worldObjectScale) sizes them true-to-scale in the world.
// ---------------------------------------------------------------------------

const GUM = { trunk: "#d8ceba", trunkDark: "#c2b79f", green0: "#5c7a4b", green1: "#799a5f", green2: "#6f8a60", green3: "#9cbc7e" } as const;

function GumTree({ height = 3.6, canopy = 1.0 }: { height?: number; canopy?: number }) {
  const top = height;
  return (
    <group>
      <mesh position={[0, height / 2, 0]} castShadow><cylinderGeometry args={[canopy * 0.13, canopy * 0.2, height, 10]} /><meshStandardMaterial color={GUM.trunk} roughness={0.85} /></mesh>
      {([[0, top, 0, 1.0, GUM.green0], [-0.6, top - 0.2, 0.22, 0.62, GUM.green1], [0.62, top - 0.15, 0.12, 0.62, GUM.green2], [-0.05, top + 0.32, -0.24, 0.72, GUM.green1], [0.2, top + 0.42, 0.1, 0.55, GUM.green3]] as const).map(([x, y, z, r, c], i) => (
        <mesh key={i} position={[x * canopy, y, z * canopy]} castShadow><sphereGeometry args={[r * canopy, 14, 10]} /><meshStandardMaterial color={c} roughness={0.95} /></mesh>
      ))}
    </group>
  );
}

function Koala() {
  return (
    <group>
      <mesh position={[0, 0, 0]} castShadow><sphereGeometry args={[0.42, 16, 12]} /><meshStandardMaterial color="#98a1ab" roughness={0.82} /></mesh>
      <mesh position={[0, 0.16, 0.12]} scale={[0.7, 0.6, 0.5]}><sphereGeometry args={[0.4, 14, 10]} /><meshStandardMaterial color="#b7bec7" roughness={0.82} /></mesh>
      <mesh position={[0, 0.5, 0.04]} castShadow><sphereGeometry args={[0.33, 16, 12]} /><meshStandardMaterial color="#a6afb9" roughness={0.82} /></mesh>
      {([-0.28, 0.28] as const).map((dx) => <mesh key={dx} position={[dx, 0.74, 0]} castShadow><sphereGeometry args={[0.18, 12, 10]} /><meshStandardMaterial color="#b0b8c2" roughness={0.85} /></mesh>)}
      <mesh position={[0, 0.5, 0.32]}><sphereGeometry args={[0.1, 12, 10]} /><meshStandardMaterial color="#2f343c" roughness={0.5} /></mesh>
      {([-0.13, 0.13] as const).map((dx) => <mesh key={dx} position={[dx, 0.62, 0.28]}><sphereGeometry args={[0.045, 8, 8]} /><meshStandardMaterial color="#23272e" /></mesh>)}
    </group>
  );
}

function KoalaGumTrees() {
  return (
    <group>
      <mesh position={[0, 0.16, 0]} receiveShadow><cylinderGeometry args={[2.35, 2.5, 0.32, 36]} /><meshStandardMaterial color="#8fae5c" roughness={0.95} /></mesh>
      <group position={[-1.1, 0.32, -0.7]} scale={0.9}><GumTree height={3.4} canopy={0.95} /></group>
      <group position={[0.9, 0.32, 0.7]} scale={1.08}><GumTree height={3.9} canopy={1.15} /></group>
      <group position={[0.9, 1.95, 1.02]}><Koala /></group>
    </group>
  );
}

function Roo({ s = 1 }: { s?: number }) {
  const hide = "#c0824a", hideDark = "#b07b41";
  return (
    <group scale={s}>
      <mesh position={[-0.62, 0.32, 0]} rotation={[0, 0, 0.6]} castShadow><cylinderGeometry args={[0.08, 0.17, 1.15, 8]} /><meshStandardMaterial color={hideDark} roughness={0.85} /></mesh>
      {([0.12, -0.12] as const).map((dz) => <mesh key={dz} position={[-0.08, 0.16, dz]} rotation={[0.5, 0, 0]}><boxGeometry args={[0.52, 0.15, 0.18]} /><meshStandardMaterial color={hideDark} roughness={0.85} /></mesh>)}
      <mesh position={[0.05, 0.72, 0]} scale={[0.8, 1.05, 0.7]} castShadow><sphereGeometry args={[0.5, 16, 12]} /><meshStandardMaterial color={hide} roughness={0.85} /></mesh>
      <mesh position={[0.3, 0.84, 0]} scale={[0.5, 0.82, 0.5]}><sphereGeometry args={[0.4, 14, 10]} /><meshStandardMaterial color="#d9a86e" roughness={0.85} /></mesh>
      <mesh position={[0.36, 1.36, 0]} scale={[1, 0.9, 0.8]} castShadow><sphereGeometry args={[0.26, 14, 12]} /><meshStandardMaterial color={hide} roughness={0.85} /></mesh>
      <mesh position={[0.58, 1.29, 0]}><sphereGeometry args={[0.13, 12, 10]} /><meshStandardMaterial color={hideDark} roughness={0.85} /></mesh>
      {([-0.1, 0.1] as const).map((dz) => <mesh key={dz} position={[0.28, 1.64, dz]} rotation={[0, 0, -0.2]}><coneGeometry args={[0.07, 0.36, 8]} /><meshStandardMaterial color={hideDark} roughness={0.85} /></mesh>)}
      {([-0.17, 0.17] as const).map((dz) => <mesh key={dz} position={[0.32, 0.76, dz]} rotation={[0, 0, -0.7]}><cylinderGeometry args={[0.05, 0.06, 0.42, 8]} /><meshStandardMaterial color={hideDark} roughness={0.85} /></mesh>)}
    </group>
  );
}

function KangarooSanctuary() {
  return (
    <group>
      <mesh position={[0, 0.18, 0]} receiveShadow><cylinderGeometry args={[2.4, 2.6, 0.3, 36]} /><meshStandardMaterial color="#d8c07f" roughness={0.96} /></mesh>
      {Array.from({ length: 16 }, (_, i) => { const a = (i / 16) * Math.PI * 2; return <mesh key={i} position={[Math.cos(a) * 2.3, 0.62, Math.sin(a) * 2.3]} castShadow><boxGeometry args={[0.1, 0.9, 0.1]} /><meshStandardMaterial color="#9c6a3c" roughness={0.9} /></mesh>; })}
      {([0.78, 0.48] as const).map((y) => <mesh key={y} position={[0, y, 0]} rotation={[-Math.PI / 2, 0, 0]}><torusGeometry args={[2.3, 0.045, 6, 44]} /><meshStandardMaterial color="#b07a44" roughness={0.9} /></mesh>)}
      {([[1.1, 0.6], [-0.9, 1.0], [0.2, -1.15]] as const).map(([x, z], i) => <mesh key={i} position={[x, 0.42, z]}><coneGeometry args={[0.18, 0.42, 6]} /><meshStandardMaterial color="#a7b56a" roughness={0.95} /></mesh>)}
      <group position={[0.6, 0.3, 0.55]} rotation={[0, -0.6, 0]}><Roo s={1.05} /></group>
      <group position={[-0.95, 0.3, -0.45]} rotation={[0, 0.9, 0]}><Roo s={0.72} /></group>
    </group>
  );
}

function AflOval() {
  return (
    <group>
      <mesh position={[0, 0.34, 0]} scale={[1.35, 1, 1.05]} receiveShadow castShadow><cylinderGeometry args={[2.5, 2.78, 0.68, 48]} /><meshStandardMaterial color="#64748b" roughness={0.82} /></mesh>
      <mesh position={[0, 0.56, 0]} scale={[1.32, 1, 1.02]}><cylinderGeometry args={[2.12, 2.32, 0.5, 48]} /><meshStandardMaterial color="#475569" roughness={0.78} /></mesh>
      <mesh position={[0, 0.63, 0]} scale={[1.32, 1, 1.02]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><circleGeometry args={[1.95, 48]} /><meshStandardMaterial color="#3f9a45" roughness={0.9} /></mesh>
      <mesh position={[0, 0.645, 0]} scale={[1.32, 1, 1.02]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[1.84, 1.95, 48]} /><meshBasicMaterial color="#eafff0" /></mesh>
      <mesh position={[0, 0.65, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[0.24, 0.32, 24]} /><meshBasicMaterial color="#eafff0" /></mesh>
      {([-1, 1] as const).map((sgn) => ([-0.5, -0.18, 0.18, 0.5] as const).map((dz, i) => (
        <mesh key={`${sgn}-${i}`} position={[sgn * 2.42, 0.63 + (Math.abs(dz) < 0.3 ? 0.9 : 0.52), dz]} castShadow><boxGeometry args={[0.06, Math.abs(dz) < 0.3 ? 1.8 : 1.04, 0.06]} /><meshStandardMaterial color="#f8fafc" roughness={0.6} /></mesh>
      )))}
      {Array.from({ length: 6 }, (_, i) => { const a = (i / 6) * Math.PI * 2 + Math.PI / 6; const fx = Math.cos(a) * 3.35; const fz = Math.sin(a) * 2.55; return (
        <group key={i} position={[fx, 0, fz]}>
          <mesh position={[0, 1.4, 0]} castShadow><cylinderGeometry args={[0.05, 0.08, 2.8, 8]} /><meshStandardMaterial color="#cbd5e1" metalness={0.3} roughness={0.5} /></mesh>
          <mesh position={[0, 2.85, 0]}><boxGeometry args={[0.52, 0.3, 0.14]} /><meshStandardMaterial color="#fef9c3" emissive="#fde047" emissiveIntensity={0.6} /></mesh>
        </group>
      ); })}
    </group>
  );
}

function SydneyTower() {
  return (
    <group>
      <mesh position={[0, 0.34, 0]} receiveShadow><cylinderGeometry args={[1.4, 1.6, 0.68, 24]} /><meshStandardMaterial color="#c7cdd6" roughness={0.82} /></mesh>
      <mesh position={[0, 3.3, 0]} castShadow><cylinderGeometry args={[0.32, 0.4, 5.6, 20]} /><meshStandardMaterial color="#b6c2d2" metalness={0.2} roughness={0.5} /></mesh>
      <mesh position={[0, 6.15, 0]} castShadow><cylinderGeometry args={[1.02, 0.82, 1.4, 24]} /><meshStandardMaterial color="#e6b64c" metalness={0.4} roughness={0.38} /></mesh>
      <mesh position={[0, 6.15, 0]} rotation={[-Math.PI / 2, 0, 0]}><torusGeometry args={[0.98, 0.09, 8, 24]} /><meshStandardMaterial color="#6b551f" roughness={0.5} /></mesh>
      <mesh position={[0, 7.0, 0]}><cylinderGeometry args={[0.66, 1.0, 0.44, 24]} /><meshStandardMaterial color="#f2cd6e" metalness={0.45} roughness={0.35} /></mesh>
      <mesh position={[0, 8.5, 0]} castShadow><cylinderGeometry args={[0.035, 0.06, 2.7, 8]} /><meshStandardMaterial color="#cbd5e1" metalness={0.3} /></mesh>
      <mesh position={[0, 9.95, 0]}><sphereGeometry args={[0.11, 10, 10]} /><meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.65} /></mesh>
    </group>
  );
}

function Queenslander() {
  return (
    <group>
      {([[-1.5, -1.4], [1.5, -1.4], [-1.5, 1.4], [1.5, 1.4]] as const).map(([x, z], i) => <mesh key={i} position={[x, 0.6, z]}><boxGeometry args={[0.28, 1.2, 0.28]} /><meshStandardMaterial color="#8a5a3c" roughness={0.9} /></mesh>)}
      <RoundedBox args={[3.7, 2.0, 3.4]} radius={0.12} smoothness={3} position={[0, 2.2, 0]} castShadow><meshStandardMaterial color="#dbeafe" roughness={0.8} /></RoundedBox>
      <RoundedBox args={[3.8, 0.5, 3.5]} radius={0.1} smoothness={3} position={[0, 1.35, 0]} castShadow><meshStandardMaterial color="#93c5fd" roughness={0.82} /></RoundedBox>
      <mesh position={[0, 3.7, 0]} rotation={[0, Math.PI / 4, 0]} castShadow><coneGeometry args={[3.0, 1.3, 4]} /><meshStandardMaterial color="#d24b46" roughness={0.7} metalness={0.1} /></mesh>
      {([-1.55, -0.52, 0.52, 1.55] as const).map((x) => <mesh key={x} position={[x, 2.0, 1.78]}><boxGeometry args={[0.12, 1.6, 0.12]} /><meshStandardMaterial color="#f8fafc" roughness={0.7} /></mesh>)}
      <mesh position={[0, 2.05, 1.79]}><planeGeometry args={[1.2, 1.3]} /><meshStandardMaterial color="#27382f" emissive="#dba84e" emissiveIntensity={0.2} roughness={0.8} /></mesh>
      <mesh position={[0, 1.05, 2.05]}><boxGeometry args={[1.1, 0.7, 0.7]} /><meshStandardMaterial color="#c98a52" roughness={0.85} /></mesh>
    </group>
  );
}

function SurfClub() {
  return (
    <group>
      <mesh position={[0, 0.16, 0]} receiveShadow><cylinderGeometry args={[2.5, 2.6, 0.3, 36]} /><meshStandardMaterial color="#f0dfa8" roughness={0.95} /></mesh>
      <RoundedBox args={[3.6, 2.2, 2.6]} radius={0.14} smoothness={3} position={[-0.3, 1.4, 0]} castShadow><meshStandardMaterial color="#2563eb" roughness={0.62} /></RoundedBox>
      <mesh position={[-0.3, 3.0, 0]} rotation={[0, Math.PI / 4, 0]} castShadow><coneGeometry args={[2.7, 1.0, 4]} /><meshStandardMaterial color="#e5484d" roughness={0.6} /></mesh>
      <mesh position={[-0.3, 1.5, 1.32]}><planeGeometry args={[2.6, 0.5]} /><meshStandardMaterial color="#eff6ff" emissive="#bfdbfe" emissiveIntensity={0.15} roughness={0.4} /></mesh>
      <RoundedBox args={[1.3, 3.4, 1.3]} radius={0.1} smoothness={3} position={[1.55, 1.9, 0.2]} castShadow><meshStandardMaterial color="#1d4ed8" roughness={0.6} /></RoundedBox>
      <RoundedBox args={[1.7, 1.2, 1.7]} radius={0.12} smoothness={3} position={[1.55, 3.9, 0.2]} castShadow><meshStandardMaterial color="#f8fafc" roughness={0.55} /></RoundedBox>
      {([-2.3, 2.3] as const).map((x) => (
        <group key={x} position={[x, 0.3, -1.8]}>
          <mesh position={[0, 1.5, 0]}><cylinderGeometry args={[0.05, 0.07, 3.0, 8]} /><meshStandardMaterial color="#cbd5e1" /></mesh>
          <mesh position={[0, 2.55, 0.3]}><planeGeometry args={[0.7, 0.5]} /><meshStandardMaterial color="#ef4444" side={THREE.DoubleSide} /></mesh>
          <mesh position={[0, 2.05, 0.3]}><planeGeometry args={[0.7, 0.5]} /><meshStandardMaterial color="#facc15" side={THREE.DoubleSide} /></mesh>
        </group>
      ))}
    </group>
  );
}

function OutbackHomestead() {
  return (
    <group>
      <mesh position={[0, 0.16, 0]} receiveShadow><cylinderGeometry args={[2.5, 2.6, 0.3, 36]} /><meshStandardMaterial color="#d98f5a" roughness={0.96} /></mesh>
      <RoundedBox args={[3.6, 2.0, 2.8]} radius={0.1} smoothness={3} position={[-0.4, 1.3, 0]} castShadow><meshStandardMaterial color="#e8dcc0" roughness={0.8} /></RoundedBox>
      <mesh position={[-0.4, 2.75, 0]} rotation={[0, Math.PI / 4, 0]} castShadow><coneGeometry args={[2.7, 0.9, 4]} /><meshStandardMaterial color="#b9c1cb" metalness={0.25} roughness={0.6} /></mesh>
      <mesh position={[-0.4, 1.4, 1.5]}><boxGeometry args={[2.4, 0.12, 0.9]} /><meshStandardMaterial color="#c9b48f" roughness={0.85} /></mesh>
      {([-1.4, 0.5] as const).map((x) => <mesh key={x} position={[x, 0.7, 1.9]}><cylinderGeometry args={[0.08, 0.08, 1.1, 8]} /><meshStandardMaterial color="#f8fafc" /></mesh>)}
      <group position={[2.0, 0, 0.6]}>
        <mesh position={[0, 1.6, 0]}><cylinderGeometry args={[0.12, 0.22, 3.2, 8]} /><meshStandardMaterial color="#9aa3ad" metalness={0.3} roughness={0.6} /></mesh>
        <mesh position={[0, 3.3, 0]}><sphereGeometry args={[0.14, 10, 10]} /><meshStandardMaterial color="#64748b" metalness={0.4} /></mesh>
        {Array.from({ length: 6 }, (_, i) => { const a = (i / 6) * Math.PI * 2; return <mesh key={i} position={[Math.cos(a) * 0.5, 3.3, Math.sin(a) * 0.5]} rotation={[0, -a, 0.15]}><boxGeometry args={[0.9, 0.02, 0.22]} /><meshStandardMaterial color="#cbd5e1" metalness={0.2} roughness={0.6} /></mesh>; })}
      </group>
    </group>
  );
}

function LagoonPool() {
  return (
    <group>
      <mesh position={[0, 0.16, 0]} receiveShadow><cylinderGeometry args={[2.6, 2.7, 0.3, 40]} /><meshStandardMaterial color="#e9d9a6" roughness={0.95} /></mesh>
      <mesh position={[0, 0.34, 0]} scale={[1.15, 1, 0.9]}><cylinderGeometry args={[2.0, 2.0, 0.12, 40]} /><meshStandardMaterial color="#f2e6bd" roughness={0.9} /></mesh>
      <mesh position={[0, 0.42, 0]} scale={[1.1, 1, 0.85]}><cylinderGeometry args={[1.85, 1.85, 0.1, 40]} /><meshStandardMaterial color="#2ba7e0" transparent opacity={0.92} roughness={0.25} metalness={0.15} /></mesh>
      <mesh position={[-0.6, 0.45, -0.35]} scale={[1, 1, 0.85]}><cylinderGeometry args={[0.9, 0.9, 0.11, 32]} /><meshStandardMaterial color="#8fdcf6" transparent opacity={0.7} roughness={0.2} /></mesh>
      {([[1.8, 1.3, 0.55], [2.15, 1.7, 0.4]] as const).map(([x, z, r], i) => <mesh key={i} position={[x, 0.35 + r * 0.5, z]} castShadow><dodecahedronGeometry args={[r, 0]} /><meshStandardMaterial color={i ? "#b3bcc6" : "#9aa3ad"} roughness={0.9} /></mesh>)}
      <group position={[1.7, 0.3, -1.4]}>
        <mesh position={[0, 1.5, 0]} rotation={[0, 0, 0.12]} castShadow><cylinderGeometry args={[0.1, 0.16, 3.0, 8]} /><meshStandardMaterial color="#a97c46" roughness={0.85} /></mesh>
        {Array.from({ length: 6 }, (_, i) => { const a = (i / 6) * Math.PI * 2; return <mesh key={i} position={[Math.cos(a) * 0.7, 3.0, Math.sin(a) * 0.7]} rotation={[0.5, -a, 0]} castShadow><coneGeometry args={[0.22, 1.4, 4]} /><meshStandardMaterial color={i % 2 ? "#3f9e56" : "#4cb264"} roughness={0.9} /></mesh>; })}
      </group>
    </group>
  );
}

function RewardBuilding({ assetKey, accent, tier }: { assetKey: string; accent: string; tier: number }) {
  if (assetKey === "clubhouse") return <Queenslander />;
  if (assetKey === "workshop") return <SurfClub />;
  if (assetKey === "observatory") return <SydneyTower />;
  if (assetKey === "treehouse") {
    return (
      <group>
        <mesh position={[0, 1.05, 0]} castShadow><cylinderGeometry args={[0.34, 0.42, 2.1, 10]} /><meshStandardMaterial color="#7c4a1f" roughness={0.8} /></mesh>
        <mesh position={[-0.7, 2.24, 0]} castShadow><sphereGeometry args={[0.9, 16, 10]} /><meshStandardMaterial color="#2f7d32" roughness={0.9} /></mesh>
        <mesh position={[0.55, 2.35, 0.15]} castShadow><sphereGeometry args={[1.05, 16, 10]} /><meshStandardMaterial color="#36a546" roughness={0.9} /></mesh>
        <RoundedBox args={[1.9, 1.12, 1.5]} radius={0.16} smoothness={3} position={[0, 1.85, 0]} castShadow><meshStandardMaterial color="#9a5b25" roughness={0.7} /></RoundedBox>
      </group>
    );
  }
  const wide = assetKey === "games_room";
  return (
    <group>
      <RoundedBox args={[wide ? 2.7 : 2.25, tier === 3 ? 1.72 : 1.42, wide ? 2.05 : 1.74]} radius={0.18} smoothness={3} position={[0, 0.92, 0]} castShadow>
        <meshStandardMaterial color={assetKey === "games_room" ? "#2e1065" : assetKey === "training_centre" ? "#475569" : assetKey === "workshop" ? "#9a3412" : accent} roughness={0.62} metalness={tier === 3 ? 0.18 : 0.05} />
      </RoundedBox>
      <mesh position={[0, tier === 3 ? 1.98 : 1.7, 0]} rotation={[0, Math.PI / 4, 0]} castShadow><coneGeometry args={[wide ? 2.1 : 1.75, 0.9, 4]} /><meshStandardMaterial color={assetKey === "games_room" ? "#7c3aed" : "#1d4ed8"} roughness={0.52} metalness={0.15} /></mesh>
      {([-0.64, 0.64] as const).map((x) => <mesh key={x} position={[x, 1.08, 0.91]}><planeGeometry args={[0.42, 0.46]} /><meshStandardMaterial color="#fde68a" emissive="#facc15" emissiveIntensity={0.55} /></mesh>)}
      {assetKey === "games_room" ? <mesh position={[0, 1.46, 0.94]}><planeGeometry args={[1.25, 0.34]} /><meshStandardMaterial color="#67e8f9" emissive="#06b6d4" emissiveIntensity={0.7} /></mesh> : null}
      {assetKey === "training_centre" ? <mesh position={[0, 2.38, 0]} rotation={[0, 0, Math.PI / 2]} castShadow><cylinderGeometry args={[0.16, 0.16, 2.0, 12]} /><meshStandardMaterial color="#94a3b8" metalness={0.35} roughness={0.35} /></mesh> : null}
    </group>
  );
}

function RewardAnimalYard({ assetKey, accent, tier }: { assetKey: string; accent: string; tier: number }) {
  if (assetKey === "wildlife_habitat") return <KoalaGumTrees />;
  if (assetKey === "farmyard") return <OutbackHomestead />;
  return (
    <group>
      <mesh position={[0, 0.42, 0]} receiveShadow><cylinderGeometry args={[2.35, 2.55, 0.32, 36]} /><meshStandardMaterial color={accent} roughness={0.9} /></mesh>
      {Array.from({ length: 10 }, (_, index) => {
        const angle = (index / 10) * Math.PI * 2;
        return <mesh key={index} position={[Math.cos(angle) * 2.25, 0.86, Math.sin(angle) * 2.25]} castShadow><boxGeometry args={[0.14, 0.9, 0.14]} /><meshStandardMaterial color="#f7d58a" roughness={0.82} /></mesh>;
      })}
      {assetKey === "farmyard" ? (
        <group>
          <RoundedBox args={[1.45, 1.15, 1.25]} radius={0.12} smoothness={3} position={[0, 1.23, 0]} castShadow><meshStandardMaterial color="#dc2626" roughness={0.58} /></RoundedBox>
          <mesh position={[0, 2.02, 0]} rotation={[0, Math.PI / 4, 0]} castShadow><coneGeometry args={[1.25, 0.75, 4]} /><meshStandardMaterial color="#facc15" /></mesh>
        </group>
      ) : assetKey === "wildlife_habitat" ? (
        <group>{[-0.72, 0.72, 0].map((x, index) => <mesh key={index} position={[x, 1.42 + index * 0.2, index ? 0.2 : -0.45]} castShadow><sphereGeometry args={[0.72, 14, 10]} /><meshStandardMaterial color={index === 1 ? "#15803d" : "#166534"} roughness={0.95} /></mesh>)}</group>
      ) : (
        <group>
          <mesh position={[0, 1.08, 0]} castShadow><sphereGeometry args={[tier === 1 ? 0.48 : 0.62, 18, 12]} /><meshStandardMaterial color={assetKey === "bunny_garden" ? "#f8fafc" : assetKey === "pony_paddock" ? "#92400e" : "#f59e0b"} roughness={0.68} /></mesh>
          <mesh position={[0.52, 1.34, 0.08]} castShadow><sphereGeometry args={[0.32, 14, 10]} /><meshStandardMaterial color={assetKey === "bunny_garden" ? "#f8fafc" : assetKey === "pony_paddock" ? "#92400e" : "#f59e0b"} roughness={0.68} /></mesh>
        </group>
      )}
    </group>
  );
}

function RewardPlayPlace({ assetKey, tier }: { assetKey: string; tier: number }) {
  if (assetKey === "water_park") return <LagoonPool />;
  if (assetKey === "adventure_playground") {
    return (
      <group>
        <mesh position={[0, 0.42, 0]} receiveShadow><cylinderGeometry args={[2.45, 2.65, 0.3, 36]} /><meshStandardMaterial color="#fef3c7" roughness={0.88} /></mesh>
        <mesh position={[-0.75, 1.34, 0]} castShadow><coneGeometry args={[0.82, 1.75, 4]} /><meshStandardMaterial color="#f97316" /></mesh>
        <mesh position={[0.75, 1.34, 0]} castShadow><coneGeometry args={[0.82, 1.75, 4]} /><meshStandardMaterial color="#2563eb" /></mesh>
        <mesh position={[0, 1.52, 0]} castShadow><boxGeometry args={[2.0, 0.22, 0.22]} /><meshStandardMaterial color="#fde68a" /></mesh>
      </group>
    );
  }
  if (assetKey === "trampoline_park") {
    return (
      <group>
        <mesh position={[0, 0.55, 0]} castShadow><cylinderGeometry args={[1.85, 2.05, 0.45, 36]} /><meshStandardMaterial color="#111827" roughness={0.55} /></mesh>
        <mesh position={[0, 0.82, 0]} castShadow><cylinderGeometry args={[1.52, 1.65, 0.12, 36]} /><meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.2} /></mesh>
        <mesh position={[0, 1.85, 0]} castShadow><sphereGeometry args={[0.28, 14, 10]} /><meshStandardMaterial color="#facc15" emissive="#fde047" emissiveIntensity={0.35} /></mesh>
      </group>
    );
  }
  return (
    <group>
      <mesh position={[0, 0.43, 0]} receiveShadow><cylinderGeometry args={[tier === 3 ? 2.35 : 1.95, tier === 3 ? 2.55 : 2.1, 0.36, 40]} /><meshStandardMaterial color="#075985" roughness={0.5} metalness={0.08} /></mesh>
      <mesh position={[0, 0.68, 0]}><cylinderGeometry args={[tier === 3 ? 2.02 : 1.62, tier === 3 ? 2.1 : 1.72, 0.16, 40]} /><meshStandardMaterial color="#38bdf8" emissive="#0ea5e9" emissiveIntensity={0.18} roughness={0.32} /></mesh>
      {assetKey === "water_park" || assetKey === "splash_pool" ? <mesh position={[0.44, 1.7, 0.1]} rotation={[0, 0, -0.52]} castShadow><torusGeometry args={[0.82, 0.12, 12, 28, Math.PI * 1.35]} /><meshStandardMaterial color="#f97316" /></mesh> : null}
    </group>
  );
}

function RewardSpecialPlace({ assetKey, accent, tier }: { assetKey: string; accent: string; tier: number }) {
  if (assetKey === "sports_stadium") return <AflOval />;
  if (assetKey === "pet_sanctuary") return <KangarooSanctuary />;
  if (assetKey === "cinema" || assetKey === "arcade") {
    return (
      <group>
        <RoundedBox args={[2.7, 1.72, 1.85]} radius={0.18} smoothness={3} position={[0, 1.1, 0]} castShadow><meshStandardMaterial color={assetKey === "cinema" ? "#7f1d1d" : "#581c87"} roughness={0.55} metalness={0.08} /></RoundedBox>
        <mesh position={[0, 2.16, 0]} rotation={[0, Math.PI / 4, 0]} castShadow><coneGeometry args={[2.0, 0.72, 4]} /><meshStandardMaterial color={assetKey === "cinema" ? "#facc15" : "#a855f7"} emissive={assetKey === "arcade" ? "#7c3aed" : "#000000"} emissiveIntensity={0.3} /></mesh>
        <mesh position={[0, 1.55, 0.96]}><planeGeometry args={[1.55, 0.42]} /><meshStandardMaterial color="#67e8f9" emissive="#06b6d4" emissiveIntensity={0.65} /></mesh>
      </group>
    );
  }
  // Aussie BBQ Backyard (party_house) falls back to the accent house shell.
  return <RewardBuilding assetKey="party_house" accent={accent} tier={tier} />;
}

function RewardPlotObject({ item, accent, tier }: { item: EconomyItem; accent: string; tier: number }) {
  const assetKey = typeof item.metadata.worldAssetKey === "string" ? item.metadata.worldAssetKey : "";
  const category = typeof item.metadata.marketplaceCategory === "string" ? item.metadata.marketplaceCategory : "";
  if (category === "world_basic") return <StarterScenery assetKey={assetKey} />;
  if (category === "animals") return <RewardAnimalYard assetKey={assetKey} accent={accent} tier={tier} />;
  if (category === "pools_play") return <RewardPlayPlace assetKey={assetKey} tier={tier} />;
  if (category === "special") return <RewardSpecialPlace assetKey={assetKey} accent={accent} tier={tier} />;
  return <RewardBuilding assetKey={assetKey} accent={accent} tier={tier} />;
}

function StarterScenery({ assetKey }: { assetKey: string }) {
  if (assetKey === "lamp_post") return <group><mesh position={[0, 1.25, 0]} castShadow><cylinderGeometry args={[0.09, 0.13, 2.5, 10]} /><meshStandardMaterial color="#344239" metalness={0.45} roughness={0.48} /></mesh><mesh position={[0, 2.55, 0]}><sphereGeometry args={[0.3, 16, 12]} /><meshStandardMaterial color="#fff1a8" emissive="#facc15" emissiveIntensity={0.85} /></mesh></group>;
  if (assetKey === "flower_bed") return <group><mesh position={[0, 0.15, 0]}><cylinderGeometry args={[0.72, 0.82, 0.24, 20]} /><meshStandardMaterial color="#5d3b24" roughness={1} /></mesh>{[[0.3, "#f472b6"], [-0.28, "#facc15"], [0, "#a78bfa"]].map(([x, color], index) => <mesh key={index} position={[Number(x), 0.48, index === 2 ? 0.25 : -0.08]}><sphereGeometry args={[0.2, 10, 8]} /><meshStandardMaterial color={String(color)} /></mesh>)}</group>;
  const pine = assetKey === "pine_tree";
  return <group><mesh position={[0, 1.05, 0]} castShadow><cylinderGeometry args={[0.18, 0.3, 2.1, 10]} /><meshStandardMaterial color="#74431f" roughness={0.9} /></mesh>{pine ? <><mesh position={[0, 2.15, 0]} castShadow><coneGeometry args={[1.05, 2.2, 10]} /><meshStandardMaterial color="#276749" roughness={0.95} /></mesh><mesh position={[0, 3.05, 0]} castShadow><coneGeometry args={[0.78, 1.65, 10]} /><meshStandardMaterial color="#2f855a" roughness={0.95} /></mesh></> : <><mesh position={[-0.42, 2.25, 0]} castShadow><sphereGeometry args={[0.78, 14, 10]} /><meshStandardMaterial color="#3f8f3a" roughness={0.95} /></mesh><mesh position={[0.45, 2.35, 0.08]} castShadow><sphereGeometry args={[0.88, 14, 10]} /><meshStandardMaterial color="#4cae4f" roughness={0.95} /></mesh></>}</group>;
}

// Size comes from the item's own footprint now, not a fixed per-category number,
// so a 16 m AFL oval towers over a 4 m gum-tree cubby. Models are authored to
// span ~4.6 world units at scale 1 and fill ~92% of the smaller footprint edge.
function worldObjectScale(item: EconomyItem) {
  if (item.metadata.marketplaceCategory === "world_basic") return 1.25;
  const [gridW, gridD] = parseGridSize(item);
  const footprintMetres = Math.min(gridW, gridD) * CENTRAL_WORLD_GRID.cellSize;
  const scale = (footprintMetres * 0.92) / 4.6;
  return Math.min(Math.max(scale, 0.62), 3.6);
}

function PlacedWorldObject({ item, placement, preview = false, valid = true }: { item: EconomyItem; placement: CentralWorldPlacement; preview?: boolean; valid?: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const tier = Number(item.metadata.tier ?? 1);
  const scale = worldObjectScale(item);
  const [width, depth] = rotatedGridSize(item, placement.rotation);
  const position = gridToWorld(placement.gridX, placement.gridZ);

  useLayoutEffect(() => {
    if (!preview || !groupRef.current) return;
    groupRef.current.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach((material) => {
        material.transparent = true;
        material.opacity = 0.58;
        material.depthWrite = false;
      });
    });
  }, [preview]);

  return (
    <group position={position} rotation={[0, (placement.rotation * Math.PI) / 180, 0]}>
      <mesh position={[0, 0.13, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[width * CENTRAL_WORLD_GRID.cellSize - 0.18, depth * CENTRAL_WORLD_GRID.cellSize - 0.18]} />
        <meshBasicMaterial color={preview ? valid ? "#22c55e" : "#ef4444" : "#315f36"} transparent opacity={preview ? 0.58 : 0.18} depthWrite={false} />
        {preview ? <Edges color={valid ? "#bbf7d0" : "#fecaca"} lineWidth={4} /> : null}
      </mesh>
      <group ref={groupRef} scale={scale}>
        <RewardPlotObject item={item} accent={item.accent || "#38bdf8"} tier={tier} />
      </group>
      {!preview && item.metadata.marketplaceCategory !== "world_basic" ? <Html center position={[0, 4.2 * scale, 0]} distanceFactor={18} zIndexRange={[4, 0]} style={{ pointerEvents: "none" }}><div style={{ padding: "6px 10px", border: "1px solid rgba(255,232,185,.62)", borderRadius: 4, background: "rgba(28,33,30,.84)", color: "#fff8df", fontFamily: "ui-monospace,monospace", fontSize: 10, fontWeight: 900, letterSpacing: ".1em", whiteSpace: "nowrap" }}>{item.name.toUpperCase()}</div></Html> : null}
    </group>
  );
}

function BuildModeGrid({ cursor }: { cursor: { gridX: number; gridZ: number } }) {
  const [x, , z] = gridToWorld(cursor.gridX, cursor.gridZ);
  const cells = 16;
  const size = cells * CENTRAL_WORLD_GRID.cellSize;
  return (
    <group position={[x, 0.115, z]}>
      <gridHelper args={[size, cells, "#eafff3", "#67d5b5"]} />
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[0.72, 0.94, 32]} /><meshBasicMaterial color="#ffffff" transparent opacity={0.95} depthWrite={false} /></mesh>
    </group>
  );
}

const GROUND_TILE_COLORS: Record<CentralWorldGroundType, string> = { path: "#a77a50", road: "#4b5563", stone: "#a8a29e" };

function GroundTile({ tile, preview = false, valid = true }: { tile: CentralWorldGroundTile; preview?: boolean; valid?: boolean }) {
  const [x, , z] = gridToWorld(tile.gridX, tile.gridZ);
  return <mesh position={[x, preview ? 0.18 : 0.105, z]} receiveShadow><boxGeometry args={[CENTRAL_WORLD_GRID.cellSize + 0.04, preview ? 0.12 : 0.08, CENTRAL_WORLD_GRID.cellSize + 0.04]} /><meshStandardMaterial color={preview ? valid ? GROUND_TILE_COLORS[tile.tileType] : "#ef4444" : GROUND_TILE_COLORS[tile.tileType]} transparent={preview} opacity={preview ? 0.72 : 1} roughness={0.95} /></mesh>;
}

function MeadowGround() {
  const sourceTexture = useTexture("/images/central-world-grass-tile.png");
  const texture = useMemo(() => {
    const result = sourceTexture.clone();
    result.wrapS = THREE.RepeatWrapping;
    result.wrapT = THREE.RepeatWrapping;
    result.repeat.set(20, 20);
    result.colorSpace = THREE.SRGBColorSpace;
    result.anisotropy = 4;
    result.needsUpdate = true;
    return result;
  }, [sourceTexture]);
  useEffect(() => () => texture.dispose(), [texture]);
  // Large enough that the ground always reaches the horizon panorama — no void
  // is ever visible around the Tower or the playable edge.
  return <mesh rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[135, 96]} /><meshStandardMaterial map={texture} color="#ffffff" roughness={1} /></mesh>;
}

function GrassTufts({ quality, groundTiles }: { quality: CentralWorldQuality; groundTiles: CentralWorldGroundTile[] }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const desiredCount = quality === "low" ? 85 : quality === "medium" ? 180 : 310;
  const transforms = useMemo(() => {
    const coveredCells = new Set(groundTiles.map((tile) => `${tile.gridX}:${tile.gridZ}`));
    return Array.from({ length: desiredCount }, (_, index) => {
    const x = ((index * 17.13) % 92) - 46;
    const z = ((index * 29.71) % 86) - 32;
    const nearPath = Math.abs(x - Math.sin(z * 0.16)) < 3.2;
    return { x: nearPath ? x + (x < 0 ? -3.8 : 3.8) : x, z, scale: 0.5 + ((index * 7) % 10) / 18 };
    }).filter((item) => !coveredCells.has(`${Math.round(item.x / CENTRAL_WORLD_GRID.cellSize)}:${Math.round(item.z / CENTRAL_WORLD_GRID.cellSize)}`));
  }, [desiredCount, groundTiles]);
  const count = transforms.length;
  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const transform = new THREE.Object3D();
    transforms.forEach((item, index) => {
      transform.position.set(item.x, 0.24 * item.scale, item.z);
      transform.rotation.set(0, index * 1.7, index % 2 ? 0.08 : -0.08);
      transform.scale.setScalar(item.scale);
      transform.updateMatrix();
      mesh.setMatrixAt(index, transform.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, [transforms]);
  return <group><instancedMesh ref={meshRef} args={[undefined, undefined, count]}><planeGeometry args={[0.12, 0.72]} /><meshStandardMaterial color="#7d9c46" roughness={1} side={THREE.DoubleSide} /></instancedMesh></group>;
}

// Warm sandstone / bronze tower palette (lighter + more sunlit as it rises).
const T = {
  sandLow: "#8f6a37",
  sandMid: "#bd914e",
  sandHi: "#d8b76a",
  sandTop: "#eccd84",
  bronze: "#7c5327",
  bronzeLit: "#caa250",
  recess: "#211710",
  glass: "#f6cf74",
  door: "#180f0a",
};

// A capped gothic pinnacle (shaft + spire) used along the buttresses and belfry.
function Pinnacle({ h = 5, r = 0.6 }: { h?: number; r?: number }) {
  return (
    <group>
      <RoundedBox args={[r * 2, h, r * 2]} radius={r * 0.35} smoothness={2} position={[0, h / 2, 0]}>
        <meshStandardMaterial color={T.sandHi} roughness={0.72} />
      </RoundedBox>
      <mesh position={[0, h + r * 1.5, 0]}><coneGeometry args={[r * 1.5, r * 3.2, 4]} /><meshStandardMaterial color={T.bronzeLit} metalness={0.35} roughness={0.5} /></mesh>
    </group>
  );
}

// A pointed-arch lancet: recessed surround, warm glowing glass and a diamond head.
function Lancet({ w = 0.95, h = 3.2, glow = false }: { w?: number; h?: number; glow?: boolean }) {
  const em = glow ? 0.95 : 0.5;
  return (
    <group>
      <mesh><boxGeometry args={[w + 0.32, h + 0.4, 0.36]} /><meshStandardMaterial color={T.recess} roughness={0.9} /></mesh>
      <mesh position={[0, h / 2 + 0.05, 0.02]} rotation={[0, 0, Math.PI / 4]}><boxGeometry args={[w * 0.78, w * 0.78, 0.34]} /><meshStandardMaterial color={T.recess} roughness={0.9} /></mesh>
      <mesh position={[0, 0, 0.16]}><planeGeometry args={[w, h]} /><meshStandardMaterial color={T.glass} emissive={T.glass} emissiveIntensity={em} roughness={0.4} /></mesh>
      <mesh position={[0, h / 2 + 0.05, 0.17]} rotation={[0, 0, Math.PI / 4]}><planeGeometry args={[w * 0.55, w * 0.55]} /><meshStandardMaterial color={T.glass} emissive={T.glass} emissiveIntensity={em} /></mesh>
    </group>
  );
}

// Large circular mechanical knowledge dial (bronze ring, gears, slow rotation).
function TowerDial() {
  const ringRef = useRef<THREE.Group>(null);
  const gearRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (ringRef.current) ringRef.current.rotation.z += delta * 0.05;
    if (gearRef.current) gearRef.current.rotation.z -= delta * 0.09;
  });
  return (
    <group position={[0, 27, 4.55]}>
      <mesh><torusGeometry args={[3.15, 0.4, 12, 48]} /><meshStandardMaterial color={T.bronze} metalness={0.75} roughness={0.32} /></mesh>
      <mesh position={[0, 0, -0.08]}><circleGeometry args={[2.95, 48]} /><meshStandardMaterial color="#2c2016" metalness={0.35} roughness={0.5} /></mesh>
      {/* hour ticks */}
      {Array.from({ length: 12 }, (_, i) => <mesh key={i} rotation={[0, 0, (i / 12) * Math.PI * 2]} position={[Math.sin((i / 12) * Math.PI * 2) * 2.55, Math.cos((i / 12) * Math.PI * 2) * 2.55, 0.05]}><boxGeometry args={[0.12, 0.5, 0.08]} /><meshStandardMaterial color={T.bronzeLit} metalness={0.6} roughness={0.4} /></mesh>)}
      {/* exposed gear */}
      <group ref={gearRef} position={[0.9, -0.7, 0.02]}>
        <mesh><torusGeometry args={[0.85, 0.16, 8, 24]} /><meshStandardMaterial color={T.bronzeLit} metalness={0.7} roughness={0.35} /></mesh>
        {Array.from({ length: 10 }, (_, i) => <mesh key={i} rotation={[0, 0, (i / 10) * Math.PI * 2]} position={[Math.sin((i / 10) * Math.PI * 2) * 0.95, Math.cos((i / 10) * Math.PI * 2) * 0.95, 0]}><boxGeometry args={[0.18, 0.22, 0.14]} /><meshStandardMaterial color={T.bronze} metalness={0.7} /></mesh>)}
      </group>
      {/* rotating spoke ring + hands */}
      <group ref={ringRef}>
        <mesh><torusGeometry args={[2.15, 0.12, 8, 40]} /><meshStandardMaterial color={T.bronzeLit} emissive="#8d5d24" emissiveIntensity={0.25} metalness={0.62} /></mesh>
        {[0, 1, 2, 3].map((i) => <mesh key={i} rotation={[0, 0, i * Math.PI / 2]} position={[0, 0, 0.1]}><boxGeometry args={[0.14, 4.2, 0.16]} /><meshStandardMaterial color={T.bronze} metalness={0.62} /></mesh>)}
      </group>
      <mesh position={[0, 0, 0.32]}><circleGeometry args={[0.55, 24]} /><meshStandardMaterial color={T.sandTop} emissive="#e5b85e" emissiveIntensity={0.5} /></mesh>
    </group>
  );
}

export function PlaceholderKnowledgeTower({ active, onEnter }: { active: boolean; onEnter?: () => void }) {
  const doorEmissive = active ? "#f0b862" : "#3a2410";
  const doorGlow = active ? 0.6 : 0.08;
  const corners: Array<[number, number]> = [[-1, -1], [1, -1], [-1, 1], [1, 1]];
  return (
    <group position={CENTRAL_WORLD_CONFIG.towerPosition} onClick={(event) => { if (!onEnter) return; event.stopPropagation(); onEnter(); }} onPointerOver={() => { if (onEnter) document.body.style.cursor = "pointer"; }} onPointerOut={() => { document.body.style.cursor = ""; }}>
      {/* stepped plinth */}
      <RoundedBox args={[18, 1.8, 16.5]} radius={0.35} smoothness={2} position={[0, 0.9, 0]}><meshStandardMaterial color={T.sandLow} roughness={0.86} /></RoundedBox>
      <RoundedBox args={[15, 1.8, 13.8]} radius={0.35} smoothness={2} position={[0, 2.6, 0]}><meshStandardMaterial color={T.sandMid} roughness={0.82} /></RoundedBox>

      {/* lower body */}
      <RoundedBox args={[11, 18, 10.5]} radius={0.5} smoothness={2} position={[0, 12.5, 0]}><meshStandardMaterial color={T.sandMid} roughness={0.8} /></RoundedBox>
      {/* corner buttresses with pinnacles */}
      {corners.map(([sx, sz], i) => (
        <group key={i} position={[sx * 5.6, 0, sz * 5.3]}>
          <RoundedBox args={[2.3, 25, 2.3]} radius={0.25} smoothness={2} position={[0, 12.5, 0]}><meshStandardMaterial color={T.sandMid} roughness={0.8} /></RoundedBox>
          <RoundedBox args={[1.7, 6, 1.7]} radius={0.2} smoothness={2} position={[0, 27, 0]}><meshStandardMaterial color={T.sandHi} roughness={0.74} /></RoundedBox>
          <group position={[0, 30, 0]}><Pinnacle h={5.5} r={0.85} /></group>
        </group>
      ))}
      {/* cornice band */}
      <RoundedBox args={[12.6, 1.4, 12] } radius={0.2} smoothness={2} position={[0, 21.5, 0]}><meshStandardMaterial color={T.sandHi} roughness={0.72} /></RoundedBox>

      {/* upper body (holds the dial) */}
      <RoundedBox args={[9, 13, 8.8]} radius={0.45} smoothness={2} position={[0, 28, 0]}><meshStandardMaterial color={T.sandHi} roughness={0.76} /></RoundedBox>
      <TowerDial />
      {/* lancet windows on the lower + upper body faces */}
      {[-2.6, 2.6].map((x) => <group key={`lw${x}`} position={[x, 10, 5.28]}><Lancet w={1.1} h={4.4} glow /></group>)}
      {[-1, 1].map((s) => <group key={`ls${s}`} position={[s * 5.28, 11, 0]} rotation={[0, s * Math.PI / 2, 0]}><Lancet w={1.1} h={4.6} /></group>)}
      {[-2.9, 2.9].map((x) => <group key={`uw${x}`} position={[x, 30, 4.42]}><Lancet w={0.85} h={3} /></group>)}

      {/* belfry cornice + open arched stage */}
      <RoundedBox args={[10.4, 1.4, 10.2]} radius={0.2} smoothness={2} position={[0, 35, 0]}><meshStandardMaterial color={T.sandHi} roughness={0.72} /></RoundedBox>
      <RoundedBox args={[8.4, 7, 8.2]} radius={0.4} smoothness={2} position={[0, 39.5, 0]}><meshStandardMaterial color={T.sandTop} roughness={0.72} /></RoundedBox>
      {[-1, 1].map((s) => <group key={`bell${s}`} position={[s * 2.5, 40, 4.15]}><Lancet w={1.4} h={5} glow /></group>)}
      {/* belfry corner pinnacles */}
      {corners.map(([sx, sz], i) => <group key={`bp${i}`} position={[sx * 4.4, 43, sz * 4.3]}><Pinnacle h={5} r={0.7} /></group>)}

      {/* crowning spire + finial */}
      <mesh position={[0, 47.5, 0]}><coneGeometry args={[4.6, 12, 8]} /><meshStandardMaterial color={T.sandTop} roughness={0.66} /></mesh>
      <mesh position={[0, 53.4, 0]}><coneGeometry args={[1.3, 3, 8]} /><meshStandardMaterial color={T.bronzeLit} metalness={0.4} roughness={0.45} /></mesh>
      <mesh position={[0, 55.4, 0]}><octahedronGeometry args={[0.7, 0]} /><meshStandardMaterial color="#ffe6a6" emissive="#f2c257" emissiveIntensity={0.7} metalness={0.4} roughness={0.4} /></mesh>

      {/* monumental pointed-arch entrance */}
      <group position={[0, 0, 5.25]}>
        <mesh position={[0, 0.25, 1.8]}><boxGeometry args={[9.5, 0.5, 3.4]} /><meshStandardMaterial color={T.sandLow} roughness={0.85} /></mesh>
        <mesh position={[0, 0.65, 1.1]}><boxGeometry args={[7.8, 0.5, 2]} /><meshStandardMaterial color={T.sandMid} roughness={0.83} /></mesh>
        <RoundedBox args={[7.8, 11, 1.3]} radius={0.3} smoothness={2} position={[0, 6, 0]}><meshStandardMaterial color={T.sandHi} roughness={0.74} /></RoundedBox>
        <mesh position={[0, 5, 0.55]}><boxGeometry args={[5.4, 8.6, 0.7]} /><meshStandardMaterial color={T.door} emissive={doorEmissive} emissiveIntensity={doorGlow} roughness={0.82} /></mesh>
        <mesh position={[0, 9.4, 0.55]} rotation={[0, 0, Math.PI / 4]}><boxGeometry args={[3.9, 3.9, 0.7]} /><meshStandardMaterial color={T.door} emissive={doorEmissive} emissiveIntensity={doorGlow} roughness={0.82} /></mesh>
        {/* keystone lantern */}
        <mesh position={[0, 11, 0.7]}><sphereGeometry args={[0.5, 16, 16]} /><meshStandardMaterial color={T.sandTop} emissive="#f2c257" emissiveIntensity={active ? 0.9 : 0.4} /></mesh>
      </group>

      {/* warm stone uplight so the sandstone reads golden */}
      <pointLight position={[0, 6, 12]} color="#ffcf85" intensity={active ? 2.4 : 1.6} distance={34} />

      <Html center position={[0, 15, 6.4]} distanceFactor={20} style={{ pointerEvents: "none" }}><div style={{ padding: "8px 13px", border: "1px solid rgba(255,226,163,.7)", background: "rgba(39,29,22,.9)", color: "#fff1c9", fontFamily: "ui-monospace, monospace", fontSize: 12, fontWeight: 900, letterSpacing: "0.15em", whiteSpace: "nowrap" }}>TOWER OF KNOWLEDGE</div></Html>
    </group>
  );
}

function PlaceholderMyHome({ active, onEnter }: { active: boolean; onEnter?: () => void }) {
  return (
    <group position={CENTRAL_WORLD_CONFIG.myHomePosition} rotation={[0, CENTRAL_WORLD_CONFIG.myHomeRotationY, 0]} onClick={(event) => { if (!onEnter) return; event.stopPropagation(); onEnter(); }} onPointerOver={() => { if (onEnter) document.body.style.cursor = "pointer"; }} onPointerOut={() => { document.body.style.cursor = ""; }}>
      <RoundedBox args={[9, 0.7, 8]} radius={0.3} smoothness={2} position={[0, 0.35, 0]}><meshStandardMaterial color="#806746" roughness={0.9} /></RoundedBox>
      <RoundedBox args={[7.4, 5.6, 6.2]} radius={0.35} smoothness={2} position={[0, 3.45, 0]}><meshStandardMaterial color="#e2c58d" roughness={0.82} /></RoundedBox>
      <mesh position={[0, 7.05, 0]} rotation={[0, Math.PI / 4, 0]}><coneGeometry args={[5.6, 3.6, 4]} /><meshStandardMaterial color="#76513d" roughness={0.84} /></mesh>
      <group position={[0, 0, 3.15]}>
        <RoundedBox args={[3.1, 4.3, 0.7]} radius={0.22} smoothness={2} position={[0, 2.55, 0]}><meshStandardMaterial color="#7a5b38" roughness={0.84} /></RoundedBox>
        <RoundedBox args={[2.15, 3.55, 0.5]} radius={0.18} smoothness={2} position={[0, 2.25, 0.42]}><meshStandardMaterial color="#27382f" emissive={active ? "#dba84e" : "#2d382f"} emissiveIntensity={active ? 0.55 : 0.08} roughness={0.78} /></RoundedBox>
        <mesh position={[0.72, 2.25, 0.7]}><sphereGeometry args={[0.11, 10, 10]} /><meshStandardMaterial color="#f0c56c" emissive="#dba84e" emissiveIntensity={0.55} /></mesh>
      </group>
      {[-2.15, 2.15].map((x) => <mesh key={x} position={[x, 3.65, 3.15]}><boxGeometry args={[1.25, 1.55, 0.18]} /><meshStandardMaterial color="#9ed2c5" emissive="#6da99c" emissiveIntensity={0.18} /></mesh>)}
      <mesh position={[0, 0.08, 5.2]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[2.35, 32]} /><meshStandardMaterial color={active ? "#e9bc64" : "#917448"} emissive={active ? "#dba84e" : "#000000"} emissiveIntensity={active ? 0.35 : 0} roughness={0.92} /></mesh>
      <pointLight position={[0, 4, 5]} color="#ffd995" intensity={active ? 1.4 : 0.65} distance={16} />
      <Html center position={[0, 6.6, 3.8]} distanceFactor={18} zIndexRange={[5, 0]} style={{ pointerEvents: "none" }}><div style={{ padding: "8px 13px", border: "1px solid rgba(255,232,185,.68)", borderRadius: 4, background: "rgba(43,37,30,.9)", color: "#fff3d6", fontFamily: "ui-monospace,monospace", fontSize: 12, fontWeight: 950, letterSpacing: ".14em", whiteSpace: "nowrap" }}>MY HOME</div></Html>
    </group>
  );
}

export function CentralWorldEnvironment({ quality, entranceActive, homeActive, placedCustomisations = [], groundTiles = [], itemsById = new Map(), buildPreview = null, groundPreview = null, editing = false, editCursor = { gridX: 0, gridZ: 0 }, onEnterTower, onEnterHome }: { quality: CentralWorldQuality; entranceActive: boolean; homeActive: boolean; placedCustomisations?: CentralWorldPlacement[]; groundTiles?: CentralWorldGroundTile[]; itemsById?: Map<string, EconomyItem>; buildPreview?: { placement: CentralWorldPlacement; item: EconomyItem; valid: boolean } | null; groundPreview?: { tile: CentralWorldGroundTile; valid: boolean } | null; editing?: boolean; editCursor?: { gridX: number; gridZ: number }; onEnterTower?: () => void; onEnterHome?: () => void }) {
  return (
    <group>
      <Suspense fallback={null}>
        <WorldPanorama asset="/images/central-world-valley-panorama.png" radius={74} height={76} y={31} rotationY={Math.PI} follow />
      </Suspense>
      <Suspense fallback={<mesh rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[135, 64]} /><meshStandardMaterial color="#718f42" roughness={1} /></mesh>}>
        <MeadowGround />
      </Suspense>
      <ValleyPath />
      <MyHomePath />
      {groundTiles.map((tile) => <GroundTile key={`${tile.gridX}:${tile.gridZ}`} tile={tile} />)}
      <GrassTufts quality={quality} groundTiles={groundTiles} />
      <PlaceholderKnowledgeTower active={entranceActive} onEnter={editing || buildPreview ? undefined : onEnterTower} />
      <PlaceholderMyHome active={homeActive} onEnter={editing || buildPreview ? undefined : onEnterHome} />
      {editing || buildPreview ? <BuildModeGrid cursor={editCursor} /> : null}
      {placedCustomisations.map((placement, index) => {
        const item = itemsById.get(placement.itemId);
        return item ? <PlacedWorldObject key={`${placement.itemId}-${index}`} item={item} placement={placement} /> : null;
      })}
      {buildPreview ? <PlacedWorldObject item={buildPreview.item} placement={buildPreview.placement} preview valid={buildPreview.valid} /> : null}
      {groundPreview ? <GroundTile tile={groundPreview.tile} preview valid={groundPreview.valid} /> : null}
    </group>
  );
}
