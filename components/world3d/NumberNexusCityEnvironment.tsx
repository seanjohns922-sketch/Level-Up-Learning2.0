"use client";

import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";
import {
  CircuitInlay,
  EnergyPylon,
  InstancedCityBlocks,
  NUMBER_NEXUS_PALETTE,
  NumberNexusPanorama,
  StreetLamp,
  type CityBlockPlacement,
  type NumberNexusArtQuality,
} from "@/components/world3d/NumberNexusCityKit";
import type { WorldGateState } from "@/lib/world3d/number-nexus-level3-state";
import type { NumberNexusLevelTheme } from "@/lib/number-nexus-visuals";

const P = NUMBER_NEXUS_PALETTE;

export const NUMBER_NEXUS_CITY_LAYOUT = {
  "counting-district": { position: [-16, 0, -2] as [number, number, number], color: "#0f9f91" },
  "number-bridge": { position: [-8, 0, -9] as [number, number, number], color: "#38bdf8" },
  "calculation-core": { position: [0, 0, -12] as [number, number, number], color: "#8b5cf6" },
  "mastery-sector": { position: [8, 0, -9] as [number, number, number], color: "#d97745" },
  "legend-tower": { position: [16, 0, -2] as [number, number, number], color: "#f6c453" },
} as const;

function RoadSpoke({ to, width = 5.4 }: { to: [number, number]; width?: number }) {
  const [x, z] = to;
  const originZ = 4;
  const length = Math.hypot(x, z - originZ);
  const angle = Math.atan2(x, z - originZ);
  return (
    <group position={[x / 2, 0, (z + originZ) / 2]} rotation={[0, angle, 0]}>
      <mesh position={[0, 0.035, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[width, length]} />
        <meshStandardMaterial color={P.street} roughness={0.82} metalness={0.18} />
      </mesh>
      <CircuitInlay position={[-width * 0.34, 0.075, 0]} size={[0.08, 0.035, length * 0.82]} />
      <CircuitInlay position={[width * 0.34, 0.075, 0]} size={[0.08, 0.035, length * 0.82]} />
    </group>
  );
}

function CityEnergyBeacon({ quality }: { quality: NumberNexusArtQuality }) {
  const beam = useRef<THREE.MeshBasicMaterial>(null);
  useFrame(({ clock }) => {
    if (beam.current) beam.current.opacity = 0.5 + Math.sin(clock.elapsedTime * 1.45) * 0.08;
  });

  return (
    <group position={[0, 0, -29]}>
      <mesh position={[0, 0.4, 0]}><cylinderGeometry args={[5.2, 6.2, 0.8, 32]} /><meshStandardMaterial color={P.plazaStone} metalness={0.28} roughness={0.58} /></mesh>
      <mesh position={[0, 0.86, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[4.35, 0.16, 8, 48]} /><meshBasicMaterial color={P.cyan} toneMapped={false} /></mesh>
      {quality === "low" ? null : <mesh position={[0, 0.9, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[2.8, 0.1, 8, 40]} /><meshBasicMaterial color={P.paleEnergy} toneMapped={false} /></mesh>}
      <mesh position={[0, 1.15, 0]}><cylinderGeometry args={[1.9, 2.7, 0.58, 32]} /><meshStandardMaterial color={P.raisedMetal} metalness={0.42} roughness={0.42} /></mesh>
      <mesh position={[0, 46, 0]}><cylinderGeometry args={[0.78, 1.15, 90, 12, 1, true]} /><meshBasicMaterial ref={beam} color={P.paleEnergy} transparent opacity={0.52} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} fog={false} /></mesh>
      <mesh position={[0, 46, 0]}><cylinderGeometry args={[1.55, 2.2, 90, 12, 1, true]} /><meshBasicMaterial color={P.cyan} transparent opacity={0.12} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} fog={false} /></mesh>
      <pointLight position={[0, 8, 3]} color={P.cyan} intensity={quality === "low" ? 1.4 : 3} distance={34} />
    </group>
  );
}

function ElevatedTransit() {
  return (
    <group>
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 22, 8, -9]}>
          <mesh><boxGeometry args={[1.3, 0.75, 24]} /><meshStandardMaterial color={P.raisedMetal} metalness={0.35} roughness={0.5} /></mesh>
          <mesh position={[-side * 0.68, 0.2, 0]}><boxGeometry args={[0.07, 0.08, 23]} /><meshBasicMaterial color={P.cyan} toneMapped={false} /></mesh>
          {[-8, 0, 8].map((z) => <mesh key={z} position={[0, -4, z]}><boxGeometry args={[0.75, 8, 0.75]} /><meshStandardMaterial color={P.darkMetal} /></mesh>)}
        </group>
      ))}
    </group>
  );
}

function CivicCity({ quality, showBuildings }: { quality: NumberNexusArtQuality; showBuildings: boolean }) {
  const count = quality === "low" ? 12 : quality === "medium" ? 20 : 28;
  const placements = useMemo<CityBlockPlacement[]>(() => Array.from({ length: count }, (_, index) => {
    const side = index % 2 === 0 ? -1 : 1;
    const row = Math.floor(index / 2);
    const z = 18 - row * 5.2;
    return {
      x: side * (25 + (row % 3) * 2.1),
      z,
      width: 4.8 + (index % 3) * 0.75,
      depth: 4.1 + ((index + 1) % 3) * 0.7,
      height: 9 + ((index * 5) % 8) * 1.7,
      tint: (index % 3) as 0 | 1 | 2,
    };
  }), [count]);

  return (
    <group>
      <group position={[0, 0, 5]}>
        <mesh position={[0, -0.14, 0]} scale={[0.85, 1, 1]}>
          <cylinderGeometry args={[40, 40, 0.28, 64]} />
          <meshStandardMaterial color={P.street} roughness={0.9} metalness={0.12} />
        </mesh>
        <mesh position={[0, 0.02, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[0.85, 1, 1]}>
          <torusGeometry args={[39.35, 0.16, 8, 96]} />
          <meshBasicMaterial color={P.cyan} toneMapped={false} />
        </mesh>
      </group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.025, 7]}><planeGeometry args={[9, 66]} /><meshStandardMaterial color="#22383d" roughness={0.78} metalness={0.18} /></mesh>
      <CircuitInlay position={[-3.6, 0.07, 7]} size={[0.1, 0.04, 64]} />
      <CircuitInlay position={[3.6, 0.07, 7]} size={[0.1, 0.04, 64]} />
      {Object.values(NUMBER_NEXUS_CITY_LAYOUT).map((entry, index) => <RoadSpoke key={index} to={[entry.position[0], entry.position[2]]} />)}

      <mesh position={[0, 0.08, 4]}><cylinderGeometry args={[9.6, 10.3, 0.16, 40]} /><meshStandardMaterial color={P.plazaStone} roughness={0.7} metalness={0.22} /></mesh>
      <mesh position={[0, 0.18, 4]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[8.7, 0.13, 6, 48]} /><meshBasicMaterial color={P.cyan} toneMapped={false} /></mesh>
      <mesh position={[0, 0.19, 4]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[4.3, 0.08, 6, 36]} /><meshBasicMaterial color={P.teal} toneMapped={false} /></mesh>
      <EnergyPylon position={[-2.2, 0.18, 4]} />
      <EnergyPylon position={[2.2, 0.18, 4]} />
      <Html center position={[0, 1.05, 4]} distanceFactor={10}>
        <div style={{ color: P.paleEnergy, fontFamily: "ui-monospace, monospace", fontWeight: 900, fontSize: 11, letterSpacing: "0.2em", textShadow: "0 0 12px rgba(34,211,197,0.8)", whiteSpace: "nowrap" }}>NUMBER NEXUS CITY</div>
      </Html>

      {showBuildings ? <InstancedCityBlocks placements={placements} /> : null}
      {quality === "low" ? null : <ElevatedTransit />}
      {[-7, 7].flatMap((x) => [18, 12, 6, 0, -6, -12].map((z) => <StreetLamp key={`${x}-${z}`} position={[x, 0, z]} />))}
      <CityEnergyBeacon quality={quality} />
    </group>
  );
}

type EntranceProps = { label: string; weekRangeLabel?: string; state: WorldGateState; active: boolean; current: boolean };

function entranceVisual(state: WorldGateState, current: boolean) {
  if (state === "locked") return { accent: P.locked, tag: "LOCKED", intensity: 0.05, opacity: 0.11, barrier: true };
  if (state === "completed") return { accent: P.completed, tag: "EXPLORED", intensity: 0.72, opacity: 0.3, barrier: false };
  if (current || state === "current") return { accent: P.paleEnergy, tag: "CURRENT", intensity: 1.05, opacity: 0.5, barrier: false };
  return { accent: P.available, tag: "OPEN", intensity: 0.55, opacity: 0.35, barrier: false };
}

export function CityDistrictEntrance({ label, weekRangeLabel, state, active, current }: EntranceProps) {
  const visual = entranceVisual(state, current);
  return (
    <group>
      <mesh position={[0, 0.12, -1.25]}><boxGeometry args={[9, 0.24, 5]} /><meshStandardMaterial color={P.sidewalk} roughness={0.7} /></mesh>
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 3.3, 0, 0]}>
          <mesh position={[0, 3.4, 0]}><boxGeometry args={[1.55, 6.8, 1.8]} /><meshStandardMaterial color={P.buildingC} metalness={0.36} roughness={0.52} /></mesh>
          <mesh position={[-side * 0.5, 3.5, 0.94]}><boxGeometry args={[0.15, 5.1, 0.06]} /><meshStandardMaterial color={visual.accent} emissive={visual.accent} emissiveIntensity={visual.intensity + (active ? 0.24 : 0)} /></mesh>
          <mesh position={[0, 7.15, 0]} rotation={[0, 0, Math.PI / 4]}><boxGeometry args={[1.05, 1.05, 1.65]} /><meshStandardMaterial color={P.raisedMetal} /></mesh>
        </group>
      ))}
      <mesh position={[0, 7, 0]}><boxGeometry args={[8.1, 1.4, 1.85]} /><meshStandardMaterial color={P.panel} metalness={0.38} roughness={0.48} /></mesh>
      <mesh position={[0, 3.35, 0.05]}><planeGeometry args={[4.85, 5.8]} /><meshBasicMaterial color={visual.accent} transparent opacity={visual.opacity} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} /></mesh>
      <mesh position={[0, 7.05, 0.96]} rotation={[0, 0, Math.PI / 4]}><boxGeometry args={[0.85, 0.85, 0.08]} /><meshStandardMaterial color={visual.accent} emissive={visual.accent} emissiveIntensity={visual.intensity} /></mesh>
      {visual.barrier ? [1.3, 2.5, 3.7, 4.9].map((y) => <mesh key={y} position={[0, y, 0.18]}><boxGeometry args={[4.8, 0.22, 0.24]} /><meshStandardMaterial color={P.barrier} emissive={P.barrier} emissiveIntensity={0.25} /></mesh>) : null}
      <Html center position={[0, 8.55, 0]} distanceFactor={18}>
        <div style={{ minWidth: 188, border: `2px solid ${visual.accent}`, borderRadius: 4, background: "rgba(2,12,16,0.97)", color: P.white, padding: "11px 15px", textAlign: "center", fontFamily: "ui-rounded, system-ui, sans-serif", fontWeight: 900, boxShadow: active ? `0 0 28px ${visual.accent}66` : "0 9px 22px rgba(0,0,0,0.55)" }}>
          <div style={{ fontSize: 15, lineHeight: 1.15, whiteSpace: "nowrap" }}>{label}</div>
          {weekRangeLabel ? <div style={{ marginTop: 7, color: P.paleEnergy, fontSize: 12, lineHeight: 1.1 }}>{weekRangeLabel}</div> : null}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 7, color: visual.accent, fontSize: 11, lineHeight: 1.1 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: visual.accent, boxShadow: `0 0 8px ${visual.accent}` }} />
            <span>{visual.tag}</span>
          </div>
        </div>
      </Html>
    </group>
  );
}

export function CityTowerEntrance({ active }: { active: boolean }) {
  const cyanIntensity = active ? 1.25 : 0.78;
  const beam = useRef<THREE.MeshBasicMaterial>(null);
  useFrame(({ clock }) => {
    if (beam.current) beam.current.opacity = (active ? 0.7 : 0.52) + Math.sin(clock.elapsedTime * 1.35) * 0.08;
  });

  return (
    <group>
      <mesh position={[0, 0.18, 1.4]}>
        <boxGeometry args={[15, 0.36, 7.4]} />
        <meshStandardMaterial color={P.plazaStone} roughness={0.64} metalness={0.28} />
      </mesh>
      <mesh position={[0, 0.39, -0.4]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[5.8, 0.12, 6, 48, Math.PI]} /><meshBasicMaterial color={P.cyan} toneMapped={false} /></mesh>
      <mesh position={[0, 0.55, 1.15]}><cylinderGeometry args={[2.7, 3.5, 0.7, 32]} /><meshStandardMaterial color={P.raisedMetal} metalness={0.45} roughness={0.4} /></mesh>
      <mesh position={[0, 0.94, 1.15]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[2.25, 0.14, 8, 42]} /><meshBasicMaterial color={P.paleEnergy} toneMapped={false} /></mesh>

      {[-1, 1].map((side) => (
        <group key={side} position={[side * 4.55, 0, 1.4]}>
          <mesh position={[0, 6.8, 0]}><boxGeometry args={[3.2, 13.6, 4.8]} /><meshStandardMaterial color={P.buildingC} metalness={0.4} roughness={0.46} /></mesh>
          <mesh position={[-side * 0.35, 17.2, 0.25]}><boxGeometry args={[2.5, 7.2, 4.1]} /><meshStandardMaterial color={P.panel} metalness={0.42} roughness={0.44} /></mesh>
          <mesh position={[-side * 0.62, 24.1, 0.5]}><boxGeometry args={[1.5, 6.6, 3.2]} /><meshStandardMaterial color={P.raisedMetal} metalness={0.44} roughness={0.42} /></mesh>
          <mesh position={[-side * 1.63, 12.6, -2.44]}><boxGeometry args={[0.16, 20.5, 0.08]} /><meshStandardMaterial color={P.cyan} emissive={P.cyan} emissiveIntensity={cyanIntensity} /></mesh>
          {[4.2, 8.2, 12.2, 17.2, 22.2].map((y) => <mesh key={y} position={[0, y, -2.43]}><boxGeometry args={[2.1, 0.18, 0.06]} /><meshBasicMaterial color={P.paleEnergy} transparent opacity={0.72} toneMapped={false} /></mesh>)}
        </group>
      ))}

      {[-1, 1].map((side) => (
        <group key={side} position={[side * 2.45, 0, -0.45]}>
          <mesh position={[0, 5.2, 0]}><boxGeometry args={[1.25, 10.4, 2.4]} /><meshStandardMaterial color={P.raisedMetal} metalness={0.44} roughness={0.43} /></mesh>
          <mesh position={[-side * 0.42, 5.2, -1.24]}><boxGeometry args={[0.14, 8, 0.06]} /><meshStandardMaterial color={P.cyan} emissive={P.cyan} emissiveIntensity={cyanIntensity} /></mesh>
        </group>
      ))}
      <mesh position={[0, 9.9, -0.3]}><boxGeometry args={[6.2, 1.15, 2.5]} /><meshStandardMaterial color={P.panel} metalness={0.44} roughness={0.43} /></mesh>
      <mesh position={[0, 4.95, -1.72]}><planeGeometry args={[3.65, 8.7]} /><meshBasicMaterial color={P.cyan} transparent opacity={active ? 0.62 : 0.42} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} /></mesh>
      <mesh position={[0, 36, 1.15]}><cylinderGeometry args={[0.78, 1.08, 70, 12, 1, true]} /><meshBasicMaterial ref={beam} color={P.paleEnergy} transparent opacity={0.55} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} fog={false} /></mesh>
      <mesh position={[0, 36, 1.15]}><cylinderGeometry args={[1.5, 2, 70, 12, 1, true]} /><meshBasicMaterial color={P.cyan} transparent opacity={0.13} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} fog={false} /></mesh>
      {[-1, 1].map((side) => <mesh key={side} position={[side * 3.15, 13.3, -0.1]}><boxGeometry args={[2.6, 0.7, 2]} /><meshStandardMaterial color={P.raisedMetal} metalness={0.45} roughness={0.42} /></mesh>)}
      <pointLight position={[0, 7, -4]} color={P.cyan} intensity={active ? 4 : 2.4} distance={28} />

      <Html center position={[0, 11.45, -1.75]} distanceFactor={18}>
        <div style={{ minWidth: 190, border: `1px solid ${P.cyan}`, background: "rgba(4,15,19,0.95)", color: P.white, padding: "9px 15px", textAlign: "center", fontFamily: "ui-monospace, monospace", fontWeight: 900, fontSize: 12, letterSpacing: "0.14em", boxShadow: active ? `0 0 30px ${P.cyan}66` : "0 10px 24px rgba(0,0,0,0.5)" }}>
          <div>THE TOWER</div>
          <div style={{ marginTop: 4, color: P.paleEnergy, fontSize: 9, letterSpacing: "0.18em" }}>NUMBER NEXUS GATEWAY</div>
        </div>
      </Html>
      <Html center position={[0, 18.4, -1.25]} distanceFactor={24}>
        <div style={{ color: P.paleEnergy, fontFamily: "ui-monospace, monospace", fontWeight: 900, fontSize: 15, letterSpacing: "0.28em", textShadow: `0 0 16px ${P.cyan}` }}>1 · 2 · 3</div>
      </Html>
    </group>
  );
}

export function NumberNexusCityEnvironment({ quality, theme }: { quality: NumberNexusArtQuality; theme: NumberNexusLevelTheme; currentEntranceX?: number }) {
  return (
    <group>
      <Suspense fallback={null}>
        <NumberNexusPanorama
          asset={theme.background}
          radius={56}
          height={70}
          y={25}
          horizontalScale={0.76}
          skyColor={theme.sky}
          rotationY={theme.panoramaRotationY}
          crisp={theme.crispPanorama}
        />
      </Suspense>
      <CivicCity quality={quality} showBuildings={theme.level === "Year 3"} />
    </group>
  );
}
