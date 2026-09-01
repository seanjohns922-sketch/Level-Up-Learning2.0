"use client";

import { Html, RoundedBox } from "@react-three/drei";
import { useLoader, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useMemo } from "react";
import * as THREE from "three";
import { WorldPanorama } from "@/components/world3d/WorldPanorama";
import type { StatisticaLevelTheme } from "@/lib/statistica-visuals";
import type { RealmWorldGateState } from "@/lib/world3d/realm-world-state";

export type StatisticaQuality = "low" | "medium" | "high";

export const STATISTICA_DISTRICT_LAYOUT: Record<string, [number, number, number]> = {
  "data-groves": [-11.5, 0, -5.5],
  "chart-crystals": [0, 0, -11.5],
  "insight-observatory": [11.5, 0, -5.5],
};

function statusLabel(state: RealmWorldGateState) {
  if (state === "completed") return "MASTERED";
  if (state === "current") return "CURRENT";
  if (state === "available") return "OPEN";
  return "LOCKED";
}

function stateVisual(state: RealmWorldGateState, accent: string, active: boolean) {
  if (state === "locked") return { frame: "#3d5347", energy: "#71837a", intensity: 0.04 };
  if (state === "completed") return { frame: "#356a52", energy: "#b9f3bd", intensity: 0.38 };
  return { frame: "#2c6f64", energy: accent, intensity: active ? 1.05 : state === "current" ? 0.72 : 0.42 };
}

function StatisticaGround({ asset }: { asset: string }) {
  const source = useLoader(THREE.TextureLoader, asset);
  const { gl } = useThree();
  const texture = useMemo(() => {
    const next = source.clone();
    next.colorSpace = THREE.SRGBColorSpace;
    next.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());
    next.generateMipmaps = true;
    next.minFilter = THREE.LinearMipmapLinearFilter;
    next.magFilter = THREE.LinearFilter;
    next.needsUpdate = true;
    return next;
  }, [gl, source]);
  useEffect(() => () => texture.dispose(), [texture]);

  return (
    <mesh position={[0, -0.16, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[0.82, 1, 1]}>
      <circleGeometry args={[55, 72]} />
      <meshStandardMaterial map={texture} emissiveMap={texture} emissive="#fff4d8" emissiveIntensity={0.16} roughness={0.98} />
    </mesh>
  );
}

function DataColumn({ x, z, height, color }: { x: number; z: number; height: number; color: string }) {
  return (
    <RoundedBox args={[1.1, height, 1.1]} radius={0.08} smoothness={2} position={[x, height / 2, z]}>
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.16} roughness={0.55} />
    </RoundedBox>
  );
}

function PortalLabel({ children, accent, active, minWidth = 150 }: { children: React.ReactNode; accent: string; active: boolean; minWidth?: number }) {
  return (
    <Html center distanceFactor={15} style={{ pointerEvents: "none" }}>
      <div style={{ minWidth, border: `2px solid ${accent}`, borderRadius: 6, background: "rgba(18,49,42,.96)", color: "#fffaf2", padding: "10px 13px", textAlign: "center", fontFamily: "system-ui,sans-serif", boxShadow: active ? `0 0 28px ${accent}88` : "0 10px 24px rgba(0,0,0,.42)" }}>{children}</div>
    </Html>
  );
}

function PortalFrame({ width, height, state, accent, active }: { width: number; height: number; state: RealmWorldGateState; accent: string; active: boolean }) {
  const visual = stateVisual(state, accent, active);
  return (
    <group>
      <mesh position={[0, 0.11, 0]}><cylinderGeometry args={[width * 0.62, width * 0.72, 0.22, 36]} /><meshStandardMaterial color="#17352e" roughness={0.78} /></mesh>
      {[-1, 1].map((side) => (
        <RoundedBox key={side} args={[0.88, height, 1.05]} radius={0.14} smoothness={2} position={[side * width * 0.42, height * 0.5, 0]}>
          <meshStandardMaterial color={visual.frame} metalness={0.22} roughness={0.48} />
        </RoundedBox>
      ))}
      <RoundedBox args={[width, 0.92, 1.1]} radius={0.15} smoothness={2} position={[0, height, 0]}>
        <meshStandardMaterial color={visual.frame} metalness={0.22} roughness={0.48} />
      </RoundedBox>
      <mesh position={[0, height * 0.48, 0.08]}><planeGeometry args={[width * 0.68, height * 0.76]} /><meshBasicMaterial color={visual.energy} transparent opacity={state === "locked" ? 0.09 : active ? 0.58 : 0.32} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh>
      <mesh position={[0, height + 1.05, 0]}><octahedronGeometry args={[0.55, 0]} /><meshStandardMaterial color={visual.energy} emissive={visual.energy} emissiveIntensity={visual.intensity} roughness={0.2} /></mesh>
    </group>
  );
}

export function StatisticaDistrictGate({ label, weeks, motif, state, accent, active }: { label: string; weeks: string; motif: string; state: RealmWorldGateState; accent: string; active: boolean }) {
  return <group><PortalFrame width={5.8} height={5.9} state={state} accent={accent} active={active} /><group position={[0, 8.75, 0]}><PortalLabel accent={accent} active={active} minWidth={190}><strong style={{ display: "block", fontSize: 16 }}>{label}</strong><span style={{ display: "block", marginTop: 4, color: "#fff4df", fontSize: 11, fontWeight: 800 }}>{motif}</span><span style={{ display: "block", marginTop: 5, color: accent, fontSize: 11, fontWeight: 950 }}>{weeks.toUpperCase()} · {statusLabel(state)}</span></PortalLabel></group></group>;
}

export function StatisticaWeekGate({ week, state, accent, active }: { week: number; state: RealmWorldGateState; accent: string; active: boolean }) {
  return <group><PortalFrame width={4.2} height={4.6} state={state} accent={accent} active={active} /><group position={[0, 7.05, 0]}><PortalLabel accent={accent} active={active}><strong style={{ display: "block", fontSize: 16 }}>Week {week}</strong><span style={{ display: "block", marginTop: 4, color: accent, fontSize: 10, fontWeight: 950 }}>{statusLabel(state)}</span></PortalLabel></group></group>;
}

export function StatisticaAdventurePortal({ accent, active }: { accent: string; active: boolean }) {
  return <group><PortalFrame width={7.2} height={7.1} state="current" accent={accent} active={active} /><group position={[0, 10.35, 0]}><PortalLabel accent={accent} active={active} minWidth={230}><strong style={{ display: "block", fontSize: 18 }}>START YOUR ADVENTURE</strong><span style={{ display: "block", marginTop: 5, color: accent, fontSize: 11, fontWeight: 950 }}>CURRENT MISSION</span></PortalLabel></group></group>;
}

export function StatisticaReturnBeam({ accent, active, label = "RETURN TO STATISTICA" }: { accent: string; active: boolean; label?: string }) {
  return (
    <group>
      <mesh position={[0, 0.13, 0]}><cylinderGeometry args={[2.7, 3.15, 0.26, 36]} /><meshStandardMaterial color="#17352e" roughness={0.7} /></mesh>
      <mesh position={[0, 9.8, 0]}><cylinderGeometry args={[0.58, 1.32, 19.6, 18, 1, true]} /><meshBasicMaterial color={accent} transparent opacity={active ? 0.56 : 0.3} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} /></mesh>
      {active ? <Html center position={[0, 2, 0]} distanceFactor={10} style={{ pointerEvents: "none" }}><div style={{ border: `2px solid ${accent}`, borderRadius: 5, background: "rgba(18,49,42,.96)", color: "#fffaf2", padding: "8px 12px", fontSize: 11, fontWeight: 950, whiteSpace: "nowrap" }}>{label}</div></Html> : null}
    </group>
  );
}

export function StatisticaEnvironment({ theme, quality, districtInterior }: { theme: StatisticaLevelTheme; quality: StatisticaQuality; districtInterior?: boolean }) {
  return (
    <>
      <Suspense fallback={null}>
        <WorldPanorama asset={theme.background} radius={56} height={60} y={20} horizontalScale={0.82} skyBlendColor={theme.sky} flipX crisp />
      </Suspense>
      <fog attach="fog" args={[theme.fog, 34, 78]} />
      <ambientLight color={theme.ambientLight} intensity={0.48} />
      <hemisphereLight args={[theme.sky, "#224339", 0.56]} />
      <directionalLight position={[-13, 24, 10]} color={theme.sunLight} intensity={1.2} />
      <Suspense fallback={null}><StatisticaGround asset={theme.background} /></Suspense>
      <mesh position={[0, -0.11, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[0.82, 1, 1]}><ringGeometry args={[53.8, 54.1, 72]} /><meshBasicMaterial color={theme.secondaryAccent} transparent opacity={0.24} toneMapped={false} depthWrite={false} /></mesh>
      {[-4.6, -2.9, -1.2, 1.2, 2.9, 4.6].map((x, index) => (
        <DataColumn key={x} x={x} z={districtInterior ? -11.8 : -16.5} height={[1.2, 2.4, 1.7, 3.2, 2, 2.8][index]!} color={[theme.accent, theme.secondaryAccent, "#79b85a", "#59add1", theme.accent, "#fff4df"][index]!} />
      ))}
      {quality === "high" ? <pointLight position={[0, 7, 2]} color={theme.accent} intensity={1.45} distance={28} /> : null}
    </>
  );
}
