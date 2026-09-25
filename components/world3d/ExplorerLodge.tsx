"use client";

import { Html, RoundedBox } from "@react-three/drei";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { type CentralWorldQuality } from "@/lib/world3d/central-world-config";

import { getCentralWorldHomeAnchors, type CentralWorldPlacement } from "@/lib/world3d/central-world-layout";

const L = { stone: "#a39276", mortar: "#75664f", plaster: "#e4d7b8", timber: "#805532", dark: "#493321", roof: "#595d52", brass: "#cfa85b", glass: "#bfcbb3" };
type V3 = [number, number, number];

function Beam({ from, to, width = 0.18, color = L.timber }: { from: V3; to: V3; width?: number; color?: string }) {
  const { midpoint, rotation, length } = useMemo(() => {
    const start = new THREE.Vector3(...from), end = new THREE.Vector3(...to);
    const direction = end.clone().sub(start);
    return { midpoint: start.add(end).multiplyScalar(0.5), rotation: new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize()), length: direction.length() };
  }, [from, to]);
  return <mesh position={midpoint} quaternion={rotation} castShadow receiveShadow><boxGeometry args={[width, length, width]} /><meshStandardMaterial color={color} roughness={0.86} /></mesh>;
}

// A single batch for all shingles, or all foundation blocks, keeps the detail cheap.
function LodgeSurface({ roof }: { roof: boolean }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const tiles = useMemo(() => {
    const result: { position: V3; scale: V3; rotation: V3; tone: number }[] = [];
    if (roof) {
      const angle = Math.atan2(2.8, 5.1), slope = Math.hypot(5.1, 2.8);
      for (const side of [-1, 1]) for (let row = 0; row < 12; row++) for (let col = 0; col < 16; col++) {
        const distance = (row + 0.5) * slope / 12;
        result.push({ position: [side * (distance * Math.cos(angle) + 0.05), 11.7 - distance * Math.sin(angle) + 0.1, -4.4 + (col + 0.5) * 0.55], scale: [slope / 12 + 0.025, 0.085, 0.525], rotation: [0, 0, -side * angle], tone: 0.9 + ((row * 7 + col * 11) % 8) * 0.023 });
      }
    } else {
      for (let face = 0; face < 4; face++) for (let row = 0; row < 3; row++) {
        const horizontal = face % 2 === 0 ? 8.8 : 7.4;
        const depth = face % 2 === 0 ? 3.7 : 4.4;
        const count = face % 2 === 0 ? 9 : 8;
        const angle = face * Math.PI / 2;
        for (let col = 0; col <= count; col++) {
          const left = Math.max(-horizontal / 2, -horizontal / 2 + (col - (row % 2) * 0.5) * horizontal / count);
          const right = Math.min(horizontal / 2, -horizontal / 2 + (col + 1 - (row % 2) * 0.5) * horizontal / count);
          if (right <= left) continue;
          const x = (left + right) / 2;
          result.push({ position: [x * Math.cos(angle) + depth * Math.sin(angle), 0.95 + row * 0.43, -x * Math.sin(angle) + depth * Math.cos(angle)], scale: [right - left - 0.04, 0.39, 0.14], rotation: [0, angle, 0], tone: 0.88 + ((row * 3 + col * 7 + face) % 9) * 0.025 });
        }
      }
    }
    return result;
  }, [roof]);
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const transform = new THREE.Object3D(), color = new THREE.Color();
    tiles.forEach((tile, i) => {
      transform.position.set(...tile.position); transform.rotation.set(...tile.rotation); transform.scale.set(...tile.scale); transform.updateMatrix();
      mesh.setMatrixAt(i, transform.matrix);
      mesh.setColorAt(i, color.set(roof ? L.roof : L.stone).multiplyScalar(tile.tone));
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [roof, tiles]);
  return <instancedMesh ref={ref} args={[undefined, undefined, tiles.length]} castShadow receiveShadow><boxGeometry args={[1, 1, 1]} /><meshStandardMaterial roughness={0.92} /></instancedMesh>;
}

function LodgeWindow({ position, rotation = 0, active }: { position: V3; rotation?: number; active: boolean }) {
  return <group position={position} rotation={[0, rotation, 0]}>
    <mesh castShadow><boxGeometry args={[1.65, 2.05, 0.18]} /><meshStandardMaterial color={L.dark} roughness={0.85} /></mesh>
    <mesh position={[0, 0, 0.105]}><planeGeometry args={[1.32, 1.72]} /><meshStandardMaterial color={L.glass} emissive="#e8ae56" emissiveIntensity={active ? 0.28 : 0.12} roughness={0.27} metalness={0.15} /></mesh>
    <Beam from={[0, -0.88, 0.15]} to={[0, 0.88, 0.15]} width={0.075} />
    <Beam from={[-0.68, 0.12, 0.15]} to={[0.68, 0.12, 0.15]} width={0.075} />
    <mesh position={[0, -1.05, 0.13]} castShadow receiveShadow><boxGeometry args={[1.9, 0.15, 0.48]} /><meshStandardMaterial color={L.stone} roughness={0.9} /></mesh>
    {[-1, 1].map(side => <mesh key={side} position={[side * 0.95, 0, 0.04]} castShadow><boxGeometry args={[0.18, 2.1, 0.16]} /><meshStandardMaterial color={L.timber} roughness={0.85} /></mesh>)}
  </group>;
}

function LodgeLantern({ x, active }: { x: number; active: boolean }) {
  return <group position={[x, 3.65, 3.96]}>
    <Beam from={[0, 0.4, -0.2]} to={[0, 0.4, 0.3]} width={0.1} color={L.dark} />
    <mesh position={[0, 0, 0.3]}><boxGeometry args={[0.28, 0.52, 0.26]} /><meshStandardMaterial color="#ffe3a0" emissive="#ffc56e" emissiveIntensity={active ? 1 : 0.6} /></mesh>
    {[-0.33, 0.33].map(y => <mesh key={y} position={[0, y, 0.3]} castShadow><boxGeometry args={[0.43, 0.12, 0.4]} /><meshStandardMaterial color={L.dark} metalness={0.4} roughness={0.5} /></mesh>)}
    {[-1, 1].map(side => <Beam key={side} from={[side * 0.17, -0.3, 0.46]} to={[side * 0.17, 0.3, 0.46]} width={0.045} color={L.dark} />)}
  </group>;
}

export function ExplorerLodge({ active, onEnter, quality, placement, preview = false, valid = true }: { active: boolean; onEnter?: () => void; quality: CentralWorldQuality; placement: CentralWorldPlacement; preview?: boolean; valid?: boolean }) {
  const anchors = getCentralWorldHomeAnchors(placement);
  const detail = quality !== "low";
  const slope = Math.hypot(5.1, 2.8), roofAngle = Math.atan2(2.8, 5.1);
  const gable = useMemo(() => {
    const shape = new THREE.Shape(); shape.moveTo(-4.3, 0); shape.lineTo(4.3, 0); shape.lineTo(0, 2.36); shape.closePath(); return shape;
  }, []);
  return <group position={anchors.position} rotation={[0, anchors.rotationY, 0]} onClick={event => { if (onEnter) { event.stopPropagation(); onEnter(); } }} onPointerOver={() => { if (onEnter) document.body.style.cursor = "pointer"; }} onPointerOut={() => { document.body.style.cursor = ""; }}>
    {preview ? <group>
      <mesh position={[0, 0.24, 0]}><boxGeometry args={[14, 0.12, 14]} /><meshBasicMaterial color={valid ? "#4ade80" : "#fb7185"} wireframe /></mesh>
      <mesh position={[0, 0.22, 8]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[0.9, 24]} /><meshBasicMaterial color={valid ? "#4ade80" : "#fb7185"} transparent opacity={0.65} /></mesh>
    </group> : null}
    <RoundedBox args={[10.4, 0.7, 9.6]} radius={0.12} smoothness={1} position={[0, 0.35, 0]} castShadow receiveShadow><meshStandardMaterial color={L.mortar} roughness={0.95} /></RoundedBox>
    <mesh position={[0, 1.35, 0]} castShadow receiveShadow><boxGeometry args={[8.8, 1.4, 7.4]} /><meshStandardMaterial color={detail ? L.mortar : L.stone} roughness={0.95} /></mesh>
    {detail ? <LodgeSurface roof={false} /> : null}
    <RoundedBox args={[8.6, 6.8, 7.2]} radius={0.07} smoothness={1} position={[0, 5.5, 0]} castShadow receiveShadow><meshStandardMaterial color={L.plaster} roughness={0.93} /></RoundedBox>
    {[2.1, 5.65, 8.75].map(y => <mesh key={y} position={[0, y, 0]} castShadow receiveShadow><boxGeometry args={[8.9, 0.22, 7.45]} /><meshStandardMaterial color={L.timber} roughness={0.87} /></mesh>)}
    {[-1, 1].flatMap(x => [-1, 1].map(z => <Beam key={`${x}:${z}`} from={[x * 4.2, 0.8, z * 3.5]} to={[x * 4.2, 8.85, z * 3.5]} width={0.28} />))}
    {[-1, 1].map(side => <group key={side}>
      <LodgeWindow position={[side * 2.85, 3.65, 3.64]} active={active} />
      <LodgeWindow position={[side * 2.0, 7.15, 3.64]} active={active} />
      <LodgeWindow position={[side * 4.34, 3.65, 0]} rotation={side * Math.PI / 2} active={active} />
      <LodgeWindow position={[side * 4.34, 7.15, 0]} rotation={side * Math.PI / 2} active={active} />
      {detail ? <Beam from={[side * 4.36, 5.8, -3.3]} to={[side * 4.36, 8.55, -1.25]} width={0.16} /> : null}
    </group>)}
    <LodgeWindow position={[0, 7.15, -3.64]} rotation={Math.PI} active={active} />
    <mesh position={[0, 7.13, 3.7]} castShadow><boxGeometry args={[1.22, 2.8, 0.18]} /><meshStandardMaterial color={L.dark} roughness={0.85} /></mesh>
    <mesh position={[0, 7.35, 3.81]}><planeGeometry args={[0.91, 1.95]} /><meshStandardMaterial color={L.glass} emissive="#e8ae56" emissiveIntensity={active ? 0.22 : 0.1} roughness={0.3} /></mesh>
    <Beam from={[-0.47, 7.35, 3.83]} to={[0.47, 7.35, 3.83]} width={0.075} />
    <mesh position={[0.4, 6.75, 3.87]}><sphereGeometry args={[0.06, 8, 8]} /><meshStandardMaterial color={L.brass} metalness={0.6} roughness={0.3} /></mesh>
    {/* The balcony is also a sheltered porch; its posts land on the stone apron. */}
    <RoundedBox args={[7.8, 0.3, 2.0]} radius={0.06} smoothness={1} position={[0, 5.65, 4.2]} castShadow receiveShadow><meshStandardMaterial color={L.dark} roughness={0.87} /></RoundedBox>
    {[-3.5, 3.5].map(x => <group key={x}>
      <Beam from={[x, 0.7, 4.85]} to={[x, 6.9, 4.85]} width={0.24} />
      <Beam from={[x, 4.55, 4.85]} to={[x + (x < 0 ? 0.8 : -0.8), 5.5, 4.85]} width={0.16} />
      <mesh position={[x, 0.95, 4.85]} castShadow><boxGeometry args={[0.48, 0.5, 0.48]} /><meshStandardMaterial color={L.stone} roughness={0.9} /></mesh>
      <Beam from={[x, 6.85, 3.6]} to={[x, 6.85, 4.85]} width={0.16} />
    </group>)}
    <Beam from={[-3.6, 6.85, 4.85]} to={[3.6, 6.85, 4.85]} width={0.18} />
    <Beam from={[-3.5, 5.95, 4.85]} to={[3.5, 5.95, 4.85]} width={0.12} />
    {Array.from({ length: 15 }, (_, i) => <Beam key={i} from={[-3.25 + i * 6.5 / 14, 5.95, 4.85]} to={[-3.25 + i * 6.5 / 14, 6.8, 4.85]} width={0.075} />)}
    {/* Framed solid timber door with inset panels and paired brass handles. */}
    <RoundedBox args={[2.65, 4.05, 0.3]} radius={0.13} smoothness={2} position={[0, 2.72, 3.73]} castShadow receiveShadow><meshStandardMaterial color={L.stone} roughness={0.9} /></RoundedBox>
    <mesh position={[0, 2.65, 3.92]} castShadow><boxGeometry args={[2.2, 3.65, 0.15]} /><meshStandardMaterial color={L.dark} roughness={0.84} /></mesh>
    {[-1, 1].map(side => <group key={side}>
      {[1.65, 3.12].map(y => <RoundedBox key={y} args={[0.84, 1.2, 0.08]} radius={0.035} smoothness={1} position={[side * 0.55, y, 4.02]} castShadow><meshStandardMaterial color={L.timber} roughness={0.86} /></RoundedBox>)}
      <mesh position={[side * 0.16, 2.65, 4.12]}><torusGeometry args={[0.095, 0.025, 6, 14]} /><meshStandardMaterial color={L.brass} metalness={0.65} roughness={0.3} /></mesh>
      <LodgeLantern x={side * 1.65} active={active} />
    </group>)}
    {[0, 1, 2].map(i => <RoundedBox key={i} args={[4.8 + i * 0.6, 0.24, 0.75]} radius={0.06} smoothness={1} position={[0, 0.62 - i * 0.23, 4.6 + i * 0.65]} castShadow receiveShadow><meshStandardMaterial color={L.stone} roughness={0.92} /></RoundedBox>)}
    {/* Gabled slate roof: a real ridge and deep eaves instead of a pyramid. */}
    {[-1, 1].map(side => <group key={side}>
      <mesh position={[side * 2.55, 10.3, 0]} rotation={[0, 0, -side * roofAngle]} castShadow receiveShadow><boxGeometry args={[slope, 0.18, 8.8]} /><meshStandardMaterial color={L.roof} roughness={0.93} /></mesh>
      <mesh position={[0, 8.95, side * 3.61]} rotation={[0, side < 0 ? Math.PI : 0, 0]} castShadow receiveShadow><shapeGeometry args={[gable]} /><meshStandardMaterial color={L.plaster} roughness={0.93} /></mesh>
      <Beam from={[-5.1, 8.9, side * 4.4]} to={[0, 11.7, side * 4.4]} width={0.18} color={L.dark} />
      <Beam from={[0, 11.7, side * 4.4]} to={[5.1, 8.9, side * 4.4]} width={0.18} color={L.dark} />
      <Beam from={[side * 5.1, 8.9, -4.4]} to={[side * 5.1, 8.9, 4.4]} width={0.2} color={L.dark} />
      <Beam from={[0, 8.95, side * 3.65]} to={[0, 11.22, side * 3.65]} width={0.17} />
    </group>)}
    {detail ? <LodgeSurface roof /> : null}
    <Beam from={[0, 11.82, -4.5]} to={[0, 11.82, 4.5]} width={0.2} color={L.dark} />
    <mesh position={[-2.65, 10.15, -1.9]} castShadow receiveShadow><boxGeometry args={[1.1, 3.5, 1.05]} /><meshStandardMaterial color={L.stone} roughness={0.95} /></mesh>
    <mesh position={[-2.65, 11.95, -1.9]} castShadow><boxGeometry args={[1.35, 0.22, 1.3]} /><meshStandardMaterial color={L.mortar} roughness={0.95} /></mesh>
    <mesh position={[-2.65, 12.07, -1.9]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[0.7, 0.65]} /><meshStandardMaterial color="#302d25" /></mesh>
    <Beam from={[0, 11.8, 0]} to={[0, 13.2, 0]} width={0.065} color={L.brass} />
    <mesh position={[0.65, 12.85, 0]}><planeGeometry args={[1.2, 0.65]} /><meshStandardMaterial color="#b95632" side={THREE.DoubleSide} roughness={0.95} /></mesh>
    {/* Beds stay on the existing house apron, clear of the editable meadow. */}
    {detail ? [-1, 1].map(side => <group key={side} position={[side * 4.2, 0.7, 4.0]}>
      <RoundedBox args={[1.1, 0.45, 1.5]} radius={0.08} smoothness={1} castShadow receiveShadow><meshStandardMaterial color={L.stone} roughness={0.95} /></RoundedBox>
      {[0, 1, 2].map(i => <mesh key={i} position={[Math.sin(i * 4) * 0.22, 0.43, (i - 1) * 0.4]} scale={[0.9, 0.8, 1]} castShadow><icosahedronGeometry args={[0.42, 1]} /><meshStandardMaterial color={i % 2 ? "#788753" : "#516641"} roughness={1} /></mesh>)}
    </group>) : null}
    <mesh position={[0, 6.4, 4.93]} castShadow><boxGeometry args={[2.0, 0.58, 0.14]} /><meshStandardMaterial color={L.dark} roughness={0.83} /></mesh>
    <Html center position={[0, 6.4, 5.02]} distanceFactor={20} zIndexRange={[5, 0]} style={{ pointerEvents: "none" }}><div style={{ color: "#f3d99e", fontFamily: "ui-monospace,monospace", fontSize: 11, fontWeight: 900, letterSpacing: ".14em", whiteSpace: "nowrap" }}>MY HOME</div></Html>
    <pointLight position={[0, 3.8, 4.8]} color="#ffcf85" intensity={active ? 2.4 : 1.2} distance={10} decay={2} />
  </group>;
}
