"use client";

import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { Suspense, useRef } from "react";
import * as THREE from "three";
import {
  CircuitInlay,
  NUMBER_NEXUS_PALETTE,
  NumberNexusPanorama,
  type NumberNexusArtQuality,
} from "@/components/world3d/NumberNexusCityKit";
import type { NumberNexusLevelTheme } from "@/lib/number-nexus-visuals";

const P = NUMBER_NEXUS_PALETTE;

export function StartAdventurePortal({ active, accent }: { active: boolean; accent: string }) {
  const field = useRef<THREE.MeshBasicMaterial>(null);
  useFrame(({ clock }) => {
    if (field.current) field.current.opacity = (active ? 0.72 : 0.52) + Math.sin(clock.elapsedTime * 1.7) * 0.08;
  });

  return (
    <group>
      <mesh position={[0, 0.18, 0]}><cylinderGeometry args={[5.2, 5.8, 0.36, 40]} /><meshStandardMaterial color={P.plazaStone} metalness={0.32} roughness={0.55} /></mesh>
      <mesh position={[0, 0.42, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[4.65, 0.18, 10, 64]} /><meshBasicMaterial color={accent} toneMapped={false} /></mesh>
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 3.25, 0, 0]}>
          <mesh position={[0, 4.4, 0]}><boxGeometry args={[1.35, 8.8, 2]} /><meshStandardMaterial color={P.buildingC} metalness={0.4} roughness={0.48} /></mesh>
          <mesh position={[-side * 0.43, 4.5, 1.03]}><boxGeometry args={[0.16, 6.8, 0.06]} /><meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={active ? 1.2 : 0.82} /></mesh>
          <mesh position={[0, 9.4, 0]} rotation={[0, 0, Math.PI / 4]}><boxGeometry args={[1.15, 1.15, 1.85]} /><meshStandardMaterial color={P.raisedMetal} metalness={0.42} roughness={0.46} /></mesh>
        </group>
      ))}
      <mesh position={[0, 9.15, 0]}><boxGeometry args={[7.7, 1.35, 2]} /><meshStandardMaterial color={P.panel} metalness={0.42} roughness={0.45} /></mesh>
      <mesh position={[0, 4.45, 0.04]}><planeGeometry args={[5.15, 7.9]} /><meshBasicMaterial ref={field} color={accent} transparent opacity={0.54} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} /></mesh>
      <mesh position={[0, 9.2, 1.03]} rotation={[0, 0, Math.PI / 4]}><boxGeometry args={[0.95, 0.95, 0.08]} /><meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={active ? 1.4 : 0.95} /></mesh>
      <pointLight position={[0, 5, 3]} color={accent} intensity={active ? 4.5 : 2.8} distance={28} />
      <Html center position={[0, 11.1, 0]} distanceFactor={16}>
        <div style={{ minWidth: 260, border: `2px solid ${accent}`, borderRadius: 5, background: "rgba(2,12,16,0.96)", color: P.white, padding: "13px 18px", textAlign: "center", fontFamily: "ui-rounded, system-ui, sans-serif", fontWeight: 950, boxShadow: active ? `0 0 34px ${accent}77` : "0 12px 28px rgba(0,0,0,0.58)" }}>
          <div style={{ fontSize: 19, lineHeight: 1.1 }}>Start Your Adventure</div>
          <div style={{ marginTop: 6, color: P.paleEnergy, fontSize: 11, letterSpacing: "0.1em" }}>ENTER YOUR NEXT MISSION</div>
        </div>
      </Html>
    </group>
  );
}

export function NumberNexusGuidedEnvironment({ quality, theme }: { quality: NumberNexusArtQuality; theme: NumberNexusLevelTheme }) {
  return (
    <group>
      <Suspense fallback={null}>
        <NumberNexusPanorama
          asset={theme.background}
          radius={50}
          height={68}
          y={25}
          horizontalScale={0.76}
          skyColor={theme.sky}
          rotationY={Math.PI / 2}
        />
      </Suspense>
      <mesh position={[0, -0.12, 4]} scale={[1, 1, 0.82]}>
        <cylinderGeometry args={[20, 20, 0.3, quality === "low" ? 32 : 64]} />
        <meshStandardMaterial color={P.street} roughness={0.88} metalness={0.16} />
      </mesh>
      <mesh position={[0, 0.06, 4]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 1, 0.82]}>
        <torusGeometry args={[19.35, 0.16, 8, quality === "low" ? 40 : 80]} />
        <meshBasicMaterial color={theme.energyAccent} toneMapped={false} />
      </mesh>
      <CircuitInlay position={[-3.8, 0.07, 5]} size={[0.1, 0.04, 28]} color={theme.energyAccent} />
      <CircuitInlay position={[3.8, 0.07, 5]} size={[0.1, 0.04, 28]} color={theme.energyAccent} />
      <Html center position={[0, 0.95, 13]} distanceFactor={11}>
        <div style={{ color: P.paleEnergy, fontFamily: "ui-monospace, monospace", fontWeight: 900, fontSize: 11, letterSpacing: "0.18em", textShadow: `0 0 12px ${theme.energyAccent}`, whiteSpace: "nowrap" }}>NUMBER NEXUS · ADVENTURE PLAZA</div>
      </Html>
    </group>
  );
}
