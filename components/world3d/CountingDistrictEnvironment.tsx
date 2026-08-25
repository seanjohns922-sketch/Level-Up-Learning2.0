"use client";

import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";
import {
  CircuitInlay,
  InstancedCityBlocks,
  NUMBER_NEXUS_PALETTE,
  NumberNexusPanorama,
  StreetLamp,
  type CityBlockPlacement,
  type NumberNexusArtQuality,
} from "@/components/world3d/NumberNexusCityKit";
import type { WorldGateState } from "@/lib/world3d/number-nexus-level3-state";
import type { NumberNexusLevelTheme } from "@/lib/number-nexus-visuals";

export { NUMBER_NEXUS_PALETTE } from "@/components/world3d/NumberNexusCityKit";
export type { NumberNexusArtQuality } from "@/components/world3d/NumberNexusCityKit";

const P = NUMBER_NEXUS_PALETTE;

type ProductionGateProps = {
  label: string;
  state: WorldGateState;
  active: boolean;
  currentMission: boolean;
  quizReady: boolean;
  quality?: NumberNexusArtQuality;
};

function stateVisual(state: WorldGateState, currentMission: boolean, quizReady: boolean) {
  if (state === "locked") return { energy: P.locked, symbol: "LOCKED", intensity: 0.04, opacity: 0.16 };
  if (state === "completed") return { energy: P.completed, symbol: "COMPLETE", intensity: 0.78, opacity: 0.48 };
  if (currentMission || state === "current") {
    return { energy: quizReady ? P.amber : P.paleEnergy, symbol: quizReady ? "QUIZ READY" : "CURRENT", intensity: 1.12, opacity: 0.68 };
  }
  return { energy: P.available, symbol: "OPEN", intensity: 0.48, opacity: 0.4 };
}

function GateStateMark({ state, color }: { state: WorldGateState; color: string }) {
  if (state === "locked") {
    return (
      <group position={[0, 1.85, 0.48]}>
        <mesh rotation={[0, 0, Math.PI / 4]}><boxGeometry args={[0.72, 0.12, 0.1]} /><meshStandardMaterial color={color} /></mesh>
        <mesh rotation={[0, 0, -Math.PI / 4]}><boxGeometry args={[0.72, 0.12, 0.1]} /><meshStandardMaterial color={color} /></mesh>
      </group>
    );
  }
  if (state === "completed") {
    return (
      <group position={[0, 1.85, 0.48]}>
        <mesh rotation={[0, 0, -0.65]} position={[-0.14, -0.06, 0]}><boxGeometry args={[0.34, 0.11, 0.1]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} /></mesh>
        <mesh rotation={[0, 0, 0.72]} position={[0.17, 0.05, 0]}><boxGeometry args={[0.62, 0.11, 0.1]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} /></mesh>
      </group>
    );
  }
  return (
    <mesh position={[0, 1.85, 0.48]} rotation={[0, 0, Math.PI / 4]}>
      <boxGeometry args={[0.46, 0.46, 0.12]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.94} />
    </mesh>
  );
}

export function ProductionWeekGate({ label, state, active, currentMission, quizReady }: ProductionGateProps) {
  const visual = stateVisual(state, currentMission, quizReady);
  const fieldRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame(({ clock }) => {
    if (!fieldRef.current || !currentMission) return;
    fieldRef.current.emissiveIntensity = visual.intensity + Math.sin(clock.elapsedTime * 2.1) * 0.14;
  });

  return (
    <group>
      <mesh position={[0, 0.12, 0]}>
        <boxGeometry args={[3.1, 0.24, 1.8]} />
        <meshStandardMaterial color={P.sidewalk} roughness={0.7} metalness={0.22} />
      </mesh>
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 1.18, 1.65, 0]}>
          <mesh><boxGeometry args={[0.54, 3.3, 0.82]} /><meshStandardMaterial color={P.raisedMetal} roughness={0.46} metalness={0.48} /></mesh>
          <mesh position={[-side * 0.2, 0, 0.43]}><boxGeometry args={[0.12, 2.55, 0.05]} /><meshStandardMaterial color={visual.energy} emissive={visual.energy} emissiveIntensity={visual.intensity} /></mesh>
        </group>
      ))}
      <mesh position={[0, 3.42, 0]}>
        <boxGeometry args={[2.9, 0.55, 0.9]} />
        <meshStandardMaterial color={P.panel} roughness={0.45} metalness={0.46} />
      </mesh>
      <mesh position={[0, 1.72, 0.04]}>
        <planeGeometry args={[1.82, 2.85]} />
        <meshStandardMaterial
          ref={fieldRef}
          color={P.void}
          emissive={visual.energy}
          emissiveIntensity={active ? visual.intensity + 0.28 : visual.intensity}
          transparent
          opacity={visual.opacity}
          side={THREE.DoubleSide}
        />
      </mesh>
      <GateStateMark state={state} color={visual.energy} />
      <Html center position={[0, 4.12, 0]} distanceFactor={10}>
        <div style={{ minWidth: 132, border: `1px solid ${visual.energy}`, background: "rgba(4,15,19,0.94)", color: P.white, padding: "7px 11px", textAlign: "center", fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontWeight: 900, fontSize: 12, letterSpacing: "0.08em", boxShadow: currentMission ? `0 0 22px ${visual.energy}55` : "0 8px 18px rgba(0,0,0,0.4)" }}>
          <div>{label}</div>
          <div style={{ marginTop: 3, color: visual.energy, fontSize: 9, letterSpacing: "0.14em" }}>{visual.symbol}</div>
        </div>
      </Html>
    </group>
  );
}

function WeekBuilding({
  position,
  width,
  height,
  number,
  accent,
}: {
  position: [number, number, number];
  width: number;
  height: number;
  number: number;
  accent: string;
}) {
  return (
    <group position={position}>
      <mesh position={[0, height / 2, -1.1]}>
        <boxGeometry args={[width, height, 3.2]} />
        <meshStandardMaterial color={number === 2 ? P.buildingC : P.buildingB} roughness={0.68} metalness={0.28} />
      </mesh>
      <mesh position={[0, height + 0.42, -1.1]}>
        <boxGeometry args={[width * 0.78, 0.84, 2.5]} />
        <meshStandardMaterial color={P.roof} roughness={0.62} metalness={0.32} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * (width / 2 - 0.48), height * 0.58, 0.53]}>
          <boxGeometry args={[0.34, height * 0.62, 0.08]} />
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.38} />
        </mesh>
      ))}
      <mesh position={[0, height * 0.72, 0.54]}>
        <planeGeometry args={[width * 0.56, 0.48]} />
        <meshBasicMaterial color={P.warmWindow} transparent opacity={0.68} toneMapped={false} />
      </mesh>
      <mesh position={[0, height + 1.45, -1.1]}>
        <cylinderGeometry args={[0.08, 0.14, 2, 8]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.48} />
      </mesh>
    </group>
  );
}

export function NumberGate({ powered }: { powered: boolean }) {
  const accent = powered ? P.paleEnergy : P.cyan;
  return (
    <group position={[0, 0, -15.2]}>
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 5.1, 0, 0]}>
          <mesh position={[0, 4.5, 0]}><boxGeometry args={[1.8, 9, 2.2]} /><meshStandardMaterial color={P.buildingC} metalness={0.32} roughness={0.58} /></mesh>
          <mesh position={[-side * 0.55, 4.8, 1.14]}><boxGeometry args={[0.2, 6.4, 0.06]} /><meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.74} /></mesh>
          <mesh position={[0, 9.6, 0]} rotation={[0, 0, Math.PI / 4]}><boxGeometry args={[1.1, 1.1, 2.1]} /><meshStandardMaterial color={P.raisedMetal} /></mesh>
        </group>
      ))}
      <mesh position={[0, 9.1, 0]}><boxGeometry args={[11.8, 1.5, 2.2]} /><meshStandardMaterial color={P.panel} metalness={0.34} roughness={0.56} /></mesh>
      <mesh position={[0, 9.2, 1.13]} rotation={[0, 0, Math.PI / 4]}><boxGeometry args={[1.2, 1.2, 0.08]} /><meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={powered ? 1.1 : 0.68} /></mesh>
      <Html center position={[0, 10.7, 0]} distanceFactor={15}>
        <div style={{ border: `1px solid ${accent}`, background: "rgba(4,15,19,0.9)", color: P.white, padding: "8px 16px", fontFamily: "ui-monospace, monospace", fontWeight: 900, fontSize: 12, letterSpacing: "0.18em", whiteSpace: "nowrap" }}>THE NUMBER GATE</div>
      </Html>
    </group>
  );
}

export function CityReturnBeam({ active }: { active: boolean }) {
  const beamRef = useRef<THREE.MeshBasicMaterial>(null);
  useFrame(({ clock }) => {
    if (beamRef.current) beamRef.current.opacity = (active ? 0.62 : 0.44) + Math.sin(clock.elapsedTime * 1.8) * 0.08;
  });

  return (
    <group>
      <mesh position={[0, 0.2, 0]}><cylinderGeometry args={[3.5, 4.15, 0.4, 40]} /><meshStandardMaterial color={P.raisedMetal} metalness={0.42} roughness={0.46} /></mesh>
      <mesh position={[0, 0.46, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[3.18, 0.22, 10, 64]} /><meshBasicMaterial color={P.cyan} toneMapped={false} /></mesh>
      <mesh position={[0, 0.5, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[2.08, 0.12, 10, 56]} /><meshBasicMaterial color={P.paleEnergy} toneMapped={false} /></mesh>
      <mesh position={[0, 22, 0]}><cylinderGeometry args={[1.15, 2.05, 43, 20, 1, true]} /><meshBasicMaterial ref={beamRef} color={P.paleEnergy} transparent opacity={0.48} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} fog={false} /></mesh>
      <mesh position={[0, 22, 0]}><cylinderGeometry args={[2.2, 3.25, 43, 20, 1, true]} /><meshBasicMaterial color={P.cyan} transparent opacity={active ? 0.22 : 0.13} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} fog={false} /></mesh>
      <pointLight position={[0, 4.5, 0]} color={P.cyan} intensity={active ? 5 : 3.2} distance={28} />
      <Html center position={[0, 3.8, 0]} distanceFactor={13}>
        <div style={{ minWidth: 220, border: `2px solid ${P.cyan}`, borderRadius: 4, background: "rgba(2,12,16,0.97)", color: P.white, padding: "11px 16px", textAlign: "center", fontFamily: "ui-rounded, system-ui, sans-serif", fontWeight: 900, boxShadow: active ? `0 0 32px ${P.cyan}77` : "0 9px 22px rgba(0,0,0,0.55)" }}>
          <div style={{ fontSize: 15, lineHeight: 1.15 }}>Back to Number Nexus City</div>
          <div style={{ marginTop: 5, color: P.paleEnergy, fontSize: 11, lineHeight: 1.1 }}>Return Beam</div>
        </div>
      </Html>
    </group>
  );
}

function DistrictStreet({ quality }: { quality: NumberNexusArtQuality }) {
  const count = quality === "low" ? 8 : quality === "medium" ? 12 : 16;
  const laneCount = Math.ceil(count / 2);
  const placements = useMemo<CityBlockPlacement[]>(() => Array.from({ length: count }, (_, index) => {
    const side = index % 2 === 0 ? -1 : 1;
    const lane = Math.floor(index / 2);
    const z = 16 - lane * (44 / Math.max(1, laneCount - 1));
    return {
      x: side * (19.2 + (lane % 3) * 1.1),
      z,
      width: 4.2 + (index % 3) * 0.8,
      depth: 3.7 + ((index + 1) % 2) * 0.9,
      height: 6.5 + ((index * 5) % 7),
      tint: (index % 3) as 0 | 1 | 2,
    };
  }), [count, laneCount]);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -3]}>
        <planeGeometry args={[48, 70]} />
        <meshStandardMaterial color={P.street} roughness={0.88} metalness={0.14} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <planeGeometry args={[9.4, 39]} />
        <meshStandardMaterial color="#22363b" roughness={0.76} metalness={0.18} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.035, 0]}>
        <planeGeometry args={[27, 8.4]} />
        <meshStandardMaterial color="#263c40" roughness={0.76} metalness={0.18} />
      </mesh>
      {[-14.5, 14.5].map((x) => <CircuitInlay key={x} position={[x, 0.07, 0]} size={[0.1, 0.04, 54]} />)}
      {[-24, 24].map((x) => <CircuitInlay key={x} position={[x, 0.07, 0]} size={[0.1, 0.04, 70]} color={P.cyan} />)}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 17.2, 0.14, -3]}>
          <boxGeometry args={[4.1, 0.26, 42]} />
          <meshStandardMaterial color={P.sidewalk} roughness={0.82} />
        </mesh>
      ))}
      <InstancedCityBlocks placements={placements} />
      {[-16.2, 16.2].flatMap((x) => [12, 1, -10, -21].map((z) => <StreetLamp key={`${x}-${z}`} position={[x, 0, z]} />))}
    </group>
  );
}

export function CountingDistrictEnvironment({
  quality,
  theme,
}: {
  quality: NumberNexusArtQuality;
  theme: NumberNexusLevelTheme;
}) {
  return (
    <group>
      <Suspense fallback={null}>
        <NumberNexusPanorama
          asset={theme.background}
          radius={52}
          height={68}
          y={25}
          horizontalScale={0.76}
          skyColor={theme.sky}
          rotationY={theme.panoramaRotationY}
          crisp={theme.crispPanorama}
        />
      </Suspense>
      <DistrictStreet quality={quality} />
      <WeekBuilding position={[-14, 0, -28]} width={5.8} height={6.4} number={1} accent={P.paleEnergy} />
      <WeekBuilding position={[0, 0, -30]} width={6.4} height={7.8} number={2} accent={P.available} />
      <WeekBuilding position={[14, 0, -28]} width={5.8} height={6.9} number={3} accent={P.available} />

      <Html center position={[0, 1.1, 10.2]} distanceFactor={11}>
        <div style={{ color: P.paleEnergy, fontFamily: "ui-monospace, monospace", fontWeight: 900, fontSize: 11, letterSpacing: "0.18em", textShadow: "0 0 12px rgba(34,211,197,0.8)", whiteSpace: "nowrap" }}>COUNTING DISTRICT · WEEKS 1–3</div>
      </Html>
    </group>
  );
}
