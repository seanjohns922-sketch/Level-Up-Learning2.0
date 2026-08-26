"use client";

import { Html, RoundedBox, useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { Suspense, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import {
  CENTRAL_WORLD_CONFIG,
  CENTRAL_WORLD_CUSTOMISATION_PLOTS,
  type CentralWorldQuality,
} from "@/lib/world3d/central-world-config";
import type { EconomyItem } from "@/lib/economy";
import { WorldPanorama } from "@/components/world3d/WorldPanorama";

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

function CustomisationPath({ pathPoints }: { pathPoints: Array<[number, number]> }) {
  const geometries = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(pathPoints.map(([x, z]) => new THREE.Vector3(x, 0, z)));
    const ribbon = (width: number, y: number) => {
      const vertices: number[] = [];
      const indices: number[] = [];
      const segments = 24;
      for (let index = 0; index <= segments; index += 1) {
        const point = curve.getPoint(index / segments);
        const tangent = curve.getTangent(index / segments).normalize();
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
    return { edge: ribbon(2.1, 0.05), path: ribbon(1.55, 0.08) };
  }, [pathPoints]);

  useEffect(() => () => {
    geometries.edge.dispose();
    geometries.path.dispose();
  }, [geometries]);

  return (
    <group>
      <mesh geometry={geometries.edge}><meshStandardMaterial color={COLORS.pathEdge} roughness={1} side={THREE.DoubleSide} /></mesh>
      <mesh geometry={geometries.path}><meshStandardMaterial color={COLORS.path} roughness={0.96} side={THREE.DoubleSide} /></mesh>
    </group>
  );
}

function CustomisationPaths() {
  return (
    <group>
      {CENTRAL_WORLD_CUSTOMISATION_PLOTS.map((plot) => <CustomisationPath key={`${plot.id}-path`} pathPoints={plot.pathPoints} />)}
    </group>
  );
}

function LockedCustomisationPlot({ position, active }: { position: [number, number, number]; active: boolean }) {
  return (
    <group position={[position[0], 0, position[2]]}>
      <mesh position={[0, 0.1, 0]} receiveShadow><cylinderGeometry args={[3.05, 3.3, 0.2, 32]} /><meshStandardMaterial color={active ? "#bea862" : "#756d59"} roughness={0.95} /></mesh>
      <mesh position={[0, 0.22, 0]} receiveShadow><cylinderGeometry args={[2.72, 2.86, 0.12, 32]} /><meshStandardMaterial color={active ? "#5a684d" : "#454d42"} roughness={1} /></mesh>
      <group position={[0, 0.88, 0]}>
        <mesh position={[0, 0.32, 0]} castShadow><torusGeometry args={[0.34, 0.09, 10, 24]} /><meshStandardMaterial color={active ? "#ffe08a" : "#c9b776"} metalness={0.3} roughness={0.55} /></mesh>
        <RoundedBox args={[0.95, 0.78, 0.38]} radius={0.12} smoothness={4} castShadow><meshStandardMaterial color={active ? "#f1ca5f" : "#9a8548"} metalness={0.25} roughness={0.58} /></RoundedBox>
        <mesh position={[0, -0.04, 0.205]}><circleGeometry args={[0.09, 18]} /><meshStandardMaterial color="#302a20" roughness={0.8} /></mesh>
      </group>
      {([[-2.45, 0.34, 0], [2.45, 0.34, 0], [0, 0.34, -2.45], [0, 0.34, 2.45]] as Array<[number, number, number]>).map(([x, y, z], index) => (
        <mesh key={index} position={[x, y, z]} castShadow receiveShadow><cylinderGeometry args={[0.22, 0.3, 0.52, 8]} /><meshStandardMaterial color="#8d846c" roughness={0.95} /></mesh>
      ))}
    </group>
  );
}

function EquippedCustomisationPlot({ item, position, active }: { item: EconomyItem; position: [number, number, number]; active: boolean }) {
  const tier = Number(item.metadata.tier ?? 1);
  const accent = item.accent || "#38bdf8";
  const height = tier === 3 ? 3.2 : tier === 2 ? 2.35 : 1.55;
  const radius = tier === 3 ? 1.72 : tier === 2 ? 1.42 : 1.12;
  return (
    <group position={[position[0], 0, position[2]]}>
      <mesh position={[0, 0.1, 0]} receiveShadow><cylinderGeometry args={[3.25, 3.45, 0.2, 36]} /><meshStandardMaterial color={active ? "#f1c96a" : "#a8905f"} roughness={0.9} /></mesh>
      <mesh position={[0, 0.23, 0]} receiveShadow><cylinderGeometry args={[2.85, 3.02, 0.14, 36]} /><meshStandardMaterial color="#526d46" roughness={1} /></mesh>
      <RoundedBox args={[radius * 1.9, height, radius * 1.55]} radius={0.18} smoothness={3} position={[0, 0.34 + height / 2, 0]} castShadow>
        <meshStandardMaterial color={accent} roughness={0.58} metalness={tier === 3 ? 0.28 : 0.08} emissive={active ? accent : "#000000"} emissiveIntensity={active ? 0.12 : 0} />
      </RoundedBox>
      {tier >= 2 ? (
        <mesh position={[0, height + 0.88, 0]} castShadow><coneGeometry args={[radius * 1.25, 1.1, 5]} /><meshStandardMaterial color="#f5d071" roughness={0.52} metalness={0.18} /></mesh>
      ) : null}
      {tier >= 3 ? (
        <mesh position={[0, height + 1.62, 0]} castShadow><octahedronGeometry args={[0.58, 0]} /><meshStandardMaterial color="#fff3b0" emissive="#f4c95f" emissiveIntensity={0.55} metalness={0.35} roughness={0.38} /></mesh>
      ) : null}
      <Html center position={[0, height + 1.25, 0]} distanceFactor={16} zIndexRange={[4, 0]} style={{ pointerEvents: "none" }}>
        <div style={{ padding: "6px 10px", border: "1px solid rgba(255,232,185,.62)", borderRadius: 4, background: "rgba(28,33,30,.84)", color: "#fff8df", fontFamily: "ui-monospace,monospace", fontSize: 10, fontWeight: 900, letterSpacing: ".1em", whiteSpace: "nowrap" }}>{item.name.toUpperCase()}</div>
      </Html>
    </group>
  );
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

function GrassTufts({ quality }: { quality: CentralWorldQuality }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const count = quality === "low" ? 85 : quality === "medium" ? 180 : 310;
  const transforms = useMemo(() => Array.from({ length: count }, (_, index) => {
    const x = ((index * 17.13) % 92) - 46;
    const z = ((index * 29.71) % 86) - 32;
    const nearPath = Math.abs(x - Math.sin(z * 0.16)) < 3.2;
    return { x: nearPath ? x + (x < 0 ? -3.8 : 3.8) : x, z, scale: 0.5 + ((index * 7) % 10) / 18 };
  }), [count]);
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

export function PlaceholderKnowledgeTower({ active }: { active: boolean }) {
  const doorEmissive = active ? "#f0b862" : "#3a2410";
  const doorGlow = active ? 0.6 : 0.08;
  const corners: Array<[number, number]> = [[-1, -1], [1, -1], [-1, 1], [1, 1]];
  return (
    <group position={CENTRAL_WORLD_CONFIG.towerPosition}>
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

      <Html center position={[0, 15, 6.4]} distanceFactor={20}><div style={{ padding: "8px 13px", border: "1px solid rgba(255,226,163,.7)", background: "rgba(39,29,22,.9)", color: "#fff1c9", fontFamily: "ui-monospace, monospace", fontSize: 12, fontWeight: 900, letterSpacing: "0.15em", whiteSpace: "nowrap" }}>TOWER OF KNOWLEDGE</div></Html>
    </group>
  );
}

function PlaceholderMyHome({ active }: { active: boolean }) {
  return (
    <group position={CENTRAL_WORLD_CONFIG.myHomePosition} rotation={[0, CENTRAL_WORLD_CONFIG.myHomeRotationY, 0]}>
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

export function CentralWorldEnvironment({ quality, entranceActive, homeActive, activeCustomisationPlotId, equippedCustomisationPlots = {} }: { quality: CentralWorldQuality; entranceActive: boolean; homeActive: boolean; activeCustomisationPlotId?: string | null; equippedCustomisationPlots?: Record<string, EconomyItem> }) {
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
      <CustomisationPaths />
      <GrassTufts quality={quality} />
      <PlaceholderKnowledgeTower active={entranceActive} />
      <PlaceholderMyHome active={homeActive} />
      {CENTRAL_WORLD_CUSTOMISATION_PLOTS.map((plot) => {
        const equipped = equippedCustomisationPlots[plot.id];
        return equipped
          ? <EquippedCustomisationPlot key={plot.id} item={equipped} position={plot.position} active={activeCustomisationPlotId === plot.id} />
          : <LockedCustomisationPlot key={plot.id} position={plot.position} active={activeCustomisationPlotId === plot.id} />;
      })}
    </group>
  );
}
