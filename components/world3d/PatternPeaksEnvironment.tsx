"use client";

import { Html, RoundedBox } from "@react-three/drei";
import { useLoader, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useMemo } from "react";
import * as THREE from "three";
import { WorldPanorama } from "@/components/world3d/WorldPanorama";
import type { RealmWorldGateState } from "@/lib/world3d/realm-world-state";

export type PatternPeaksQuality = "low" | "medium" | "high";

export const PATTERN_PEAKS_DISTRICT_LAYOUT: Record<string, [number, number, number]> = {
  "sequence-pass": [-13.2, 0, -4.6],
  "ruleworks": [0, 0, -13.6],
  "equation-ridge": [13.2, 0, -4.6],
  "summit-lab": [0, 0, 8.6],
};

function statusLabel(state: RealmWorldGateState) {
  if (state === "completed") return "MASTERED";
  if (state === "current") return "CURRENT";
  if (state === "available") return "OPEN";
  return "LOCKED";
}

function stateVisual(state: RealmWorldGateState, accent: string, active: boolean) {
  if (state === "locked") return { frame: "#2a333b", energy: "#66737c", intensity: 0.03 };
  if (state === "completed") return { frame: "#324c45", energy: "#b8ffd7", intensity: 0.42 };
  return { frame: "#293947", energy: accent, intensity: active ? 1.1 : state === "current" ? 0.76 : 0.45 };
}

function PatternPeaksFloorTexture() {
  const source = useLoader(THREE.TextureLoader, "/images/patternpeaks-level3-floor.png");
  const { gl } = useThree();
  const texture = useMemo(() => {
    const next = source.clone();
    next.colorSpace = THREE.SRGBColorSpace;
    next.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());
    next.generateMipmaps = true;
    next.minFilter = THREE.LinearMipmapLinearFilter;
    next.magFilter = THREE.LinearFilter;
    next.wrapS = THREE.ClampToEdgeWrapping;
    next.wrapT = THREE.ClampToEdgeWrapping;
    next.needsUpdate = true;
    return next;
  }, [gl, source]);
  useEffect(() => () => texture.dispose(), [texture]);

  return (
    <mesh position={[0, 0.1, 4.2]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[86, 50]} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  );
}

function PatternPeaksGround() {
  return (
    <group>
      <mesh position={[0, -0.98, 4.2]}>
        <boxGeometry args={[86, 1.5, 50]} />
        <meshStandardMaterial color="#18212a" roughness={0.94} metalness={0.02} />
      </mesh>
      <mesh position={[0, 0.035, 4.2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[86, 50]} />
        <meshBasicMaterial color="#303a45" toneMapped={false} />
      </mesh>
      <Suspense fallback={null}>
        <PatternPeaksFloorTexture />
      </Suspense>
      <mesh position={[0, 0.12, 4.2]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[8.2, 8.55, 6]} />
        <meshBasicMaterial color="#39d9a0" transparent opacity={0.22} depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh position={[0, -0.95, 29.45]}>
        <boxGeometry args={[86, 1.75, 1.45]} />
        <meshStandardMaterial color="#151d25" roughness={0.96} />
      </mesh>
      <mesh position={[0, -0.95, -21.05]}>
        <boxGeometry args={[86, 1.75, 1.45]} />
        <meshStandardMaterial color="#151d25" roughness={0.96} />
      </mesh>
      <mesh position={[-43.55, -0.95, 4.2]}>
        <boxGeometry args={[1.45, 1.75, 50]} />
        <meshStandardMaterial color="#151d25" roughness={0.96} />
      </mesh>
      <mesh position={[43.55, -0.95, 4.2]}>
        <boxGeometry args={[1.45, 1.75, 50]} />
        <meshStandardMaterial color="#151d25" roughness={0.96} />
      </mesh>
    </group>
  );
}

function Crystal({ position, color, scale = 1 }: { position: [number, number, number]; color: string; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 1.05, 0]}>
        <octahedronGeometry args={[0.9, 0]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.42} roughness={0.24} transparent opacity={0.9} />
      </mesh>
      <mesh position={[0, 0.08, 0]}>
        <cylinderGeometry args={[0.42, 0.62, 0.16, 6]} />
        <meshStandardMaterial color="#1d2934" roughness={0.75} />
      </mesh>
    </group>
  );
}

function PatternBlock({ position, color, label }: { position: [number, number, number]; color: string; label: string }) {
  return (
    <group position={position}>
      <RoundedBox args={[1.65, 1.65, 1.65]} radius={0.08} smoothness={2}>
        <meshStandardMaterial color="#343044" emissive={color} emissiveIntensity={0.17} roughness={0.55} />
      </RoundedBox>
      <Html center distanceFactor={12} style={{ pointerEvents: "none" }}>
        <div style={{ color, fontSize: 15, fontWeight: 950, fontFamily: "system-ui,sans-serif", textShadow: "0 2px 8px rgba(0,0,0,.8)" }}>{label}</div>
      </Html>
    </group>
  );
}

function PortalLabel({ children, accent, active, minWidth = 150 }: { children: React.ReactNode; accent: string; active: boolean; minWidth?: number }) {
  return (
    <Html center distanceFactor={15} style={{ pointerEvents: "none" }}>
      <div style={{ minWidth, border: `2px solid ${accent}`, borderRadius: 6, background: "rgba(15,22,29,.96)", color: "#f7fff9", padding: "10px 13px", textAlign: "center", fontFamily: "system-ui,sans-serif", boxShadow: active ? `0 0 30px ${accent}88` : "0 10px 26px rgba(0,0,0,.46)" }}>{children}</div>
    </Html>
  );
}

function PortalFrame({ width, height, state, accent, active }: { width: number; height: number; state: RealmWorldGateState; accent: string; active: boolean }) {
  const visual = stateVisual(state, accent, active);
  return (
    <group>
      <mesh position={[0, 0.11, 0]}><cylinderGeometry args={[width * 0.6, width * 0.7, 0.22, 6]} /><meshStandardMaterial color="#1b2731" roughness={0.78} /></mesh>
      {[-1, 1].map((side) => (
        <RoundedBox key={side} args={[0.74, height, 0.95]} radius={0.11} smoothness={2} position={[side * width * 0.42, height * 0.5, 0]} rotation={[0, 0, side * 0.16]}>
          <meshStandardMaterial color={visual.frame} emissive={visual.energy} emissiveIntensity={0.08} metalness={0.18} roughness={0.5} />
        </RoundedBox>
      ))}
      <RoundedBox args={[width, 0.8, 1]} radius={0.12} smoothness={2} position={[0, height, 0]}>
        <meshStandardMaterial color={visual.frame} emissive={visual.energy} emissiveIntensity={0.1} metalness={0.18} roughness={0.5} />
      </RoundedBox>
      <mesh position={[0, height * 0.48, 0.08]}><planeGeometry args={[width * 0.64, height * 0.74]} /><meshBasicMaterial color={visual.energy} transparent opacity={state === "locked" ? 0.08 : active ? 0.54 : 0.28} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh>
      <mesh position={[0, height + 1.05, 0]} rotation={[0, 0, Math.PI / 4]}><octahedronGeometry args={[0.58, 0]} /><meshStandardMaterial color={visual.energy} emissive={visual.energy} emissiveIntensity={visual.intensity} roughness={0.22} /></mesh>
    </group>
  );
}

export function PatternPeaksDistrictGate({ label, weeks, motif, state, accent, active }: { label: string; weeks: string; motif: string; state: RealmWorldGateState; accent: string; active: boolean }) {
  return <group><PortalFrame width={5.7} height={5.8} state={state} accent={accent} active={active} /><group position={[0, 8.55, 0]}><PortalLabel accent={accent} active={active} minWidth={190}><strong style={{ display: "block", fontSize: 16 }}>{label}</strong><span style={{ display: "block", marginTop: 4, color: "#eaf7ff", fontSize: 11, fontWeight: 800 }}>{motif}</span><span style={{ display: "block", marginTop: 5, color: accent, fontSize: 11, fontWeight: 950 }}>{weeks.toUpperCase()} - {statusLabel(state)}</span></PortalLabel></group></group>;
}

export function PatternPeaksWeekGate({ week, state, accent, active }: { week: number; state: RealmWorldGateState; accent: string; active: boolean }) {
  return <group><PortalFrame width={4.15} height={4.55} state={state} accent={accent} active={active} /><group position={[0, 6.9, 0]}><PortalLabel accent={accent} active={active}><strong style={{ display: "block", fontSize: 16 }}>Week {week}</strong><span style={{ display: "block", marginTop: 4, color: accent, fontSize: 10, fontWeight: 950 }}>{statusLabel(state)}</span></PortalLabel></group></group>;
}

export function PatternPeaksAdventurePortal({ accent, active }: { accent: string; active: boolean }) {
  return <group><PortalFrame width={7.1} height={7} state="current" accent={accent} active={active} /><group position={[0, 10.2, 0]}><PortalLabel accent={accent} active={active} minWidth={230}><strong style={{ display: "block", fontSize: 18 }}>START THE CLIMB</strong><span style={{ display: "block", marginTop: 5, color: accent, fontSize: 11, fontWeight: 950 }}>CURRENT TRAIL</span></PortalLabel></group></group>;
}

export function PatternPeaksReturnBeam({ accent, active, label = "RETURN TO PATTERN PEAKS" }: { accent: string; active: boolean; label?: string }) {
  return (
    <group>
      <mesh position={[0, 0.13, 0]}><cylinderGeometry args={[2.65, 3.1, 0.26, 6]} /><meshStandardMaterial color="#1b2731" roughness={0.74} /></mesh>
      <mesh position={[0, 9.8, 0]}><cylinderGeometry args={[0.58, 1.3, 19.6, 6, 1, true]} /><meshBasicMaterial color={accent} transparent opacity={active ? 0.58 : 0.3} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} /></mesh>
      {active ? <Html center position={[0, 2, 0]} distanceFactor={10} style={{ pointerEvents: "none" }}><div style={{ border: `2px solid ${accent}`, borderRadius: 5, background: "rgba(15,22,29,.96)", color: "#f7fff9", padding: "8px 12px", fontSize: 11, fontWeight: 950, whiteSpace: "nowrap" }}>{label}</div></Html> : null}
    </group>
  );
}

export function PatternPeaksEnvironment({ quality, districtInterior }: { quality: PatternPeaksQuality; districtInterior?: boolean }) {
  return (
    <>
      <Suspense fallback={null}>
        <WorldPanorama asset="/images/patternpeaks-home-bg-y3.jpeg" radius={56} height={60} y={20} horizontalScale={0.82} skyBlendColor="#a9c9df" flipX crisp />
      </Suspense>
      <fog attach="fog" args={["#23303b", 32, 76]} />
      <ambientLight color="#b9d5e8" intensity={0.46} />
      <hemisphereLight args={["#b9d5e8", "#17242d", 0.62]} />
      <directionalLight position={[-15, 23, 12]} color="#def5ff" intensity={1.25} />
      <directionalLight position={[15, 8, -12]} color="#39d9a0" intensity={0.28} />
      <PatternPeaksGround />
      {[[-18, -17], [-12, 19], [16, -18], [21, 12]].map(([x, z], index) => (
        <Crystal key={`${x}-${z}`} position={[x, 0, z]} color={index % 2 === 0 ? "#39d9a0" : "#b899ff"} scale={index === 2 ? 1.25 : 1} />
      ))}
      {[-3, -1, 1, 3].map((offset, index) => (
        <PatternBlock key={offset} position={[offset * 1.55, 1.2, districtInterior ? -12.2 : -18.2]} color={index < 2 ? "#39d9a0" : "#b899ff"} label={index < 2 ? `${index + 2}` : "?"} />
      ))}
      {quality === "high" ? <pointLight position={[0, 6.8, 1.5]} color="#39d9a0" intensity={1.5} distance={28} /> : null}
    </>
  );
}
