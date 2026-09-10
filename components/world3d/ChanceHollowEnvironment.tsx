"use client";

import { Html, RoundedBox } from "@react-three/drei";
import { useLoader, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useMemo } from "react";
import * as THREE from "three";
import { WorldPanorama } from "@/components/world3d/WorldPanorama";
import type { RealmLevelId } from "@/lib/realms/realm-dashboard-config";
import type { RealmWorldGateState } from "@/lib/world3d/realm-world-state";

export type ChanceHollowQuality = "low" | "medium" | "high";

export const CHANCE_HOLLOW_DISTRICT_LAYOUT: Record<string, [number, number, number]> = {
  "chance-gate": [-12.5, 0, -5.5],
  "outcome-caves": [0, 0, -13.5],
  "trial-falls": [12.5, 0, -5.5],
  "outcome-vault": [-12.5, 0, -5.5],
  "frequency-forge": [0, 0, -13.5],
  "roller-citadel": [12.5, 0, -5.5],
};

const LEVEL_VISUALS = {
  "Year 3": {
    front: "/images/chancehollow-home-y3.jpeg",
    rear: "/images/chancehollow-level3-panorama-rear.png",
    floor: "/images/chancehollow-level3-floor.png",
    sky: "#123b48",
    fog: "#211728",
    accent: "#fb7185",
    secondary: "#22d3ee",
    floorTint: "#e8e2f0",
    floorRepeat: [3.2, 3.1] as const,
  },
  "Year 4": {
    front: "/images/chancehollow-home-y4.jpeg",
    rear: "/images/chancehollow-level4-panorama-rear.png",
    floor: "/images/chancehollow-level4-floor.png",
    sky: "#123e49",
    fog: "#1b1a2b",
    accent: "#22d3ee",
    secondary: "#d946ef",
    floorTint: "#f1efff",
    floorRepeat: [3.45, 3.3] as const,
  },
  "Year 5": {
    front: "/images/chancehollow-home-y5.jpeg",
    rear: "/images/chancehollow-level5-panorama-rear.png",
    floor: "/images/chancehollow-level5-floor.png",
    sky: "#29233f",
    fog: "#171526",
    accent: "#22d3ee",
    secondary: "#d946ef",
    floorTint: "#f1efff",
    floorRepeat: [3.4, 3.3] as const,
  },
} as const;

export function getChanceHollow3DVisuals(level: RealmLevelId) {
  if (level === "Year 5") return LEVEL_VISUALS["Year 5"];
  return level === "Year 4" ? LEVEL_VISUALS["Year 4"] : LEVEL_VISUALS["Year 3"];
}

function statusLabel(state: RealmWorldGateState) {
  if (state === "completed") return "MASTERED";
  if (state === "current") return "CURRENT";
  if (state === "available") return "OPEN";
  return "LOCKED";
}

function stateVisual(state: RealmWorldGateState, accent: string, active: boolean) {
  if (state === "locked") return { stone: "#352d3c", energy: "#756b7d", intensity: 0.04 };
  if (state === "completed") return { stone: "#28574f", energy: "#9ff5d7", intensity: 0.42 };
  return { stone: "#442d50", energy: accent, intensity: active ? 1.15 : state === "current" ? 0.8 : 0.48 };
}

function ChanceHollowGround({ floor, tint, repeat, accent, secondary }: { floor: string; tint: string; repeat: readonly [number, number]; accent: string; secondary: string }) {
  const source = useLoader(THREE.TextureLoader, floor);
  const { gl } = useThree();
  const texture = useMemo(() => {
    const next = source.clone();
    next.colorSpace = THREE.SRGBColorSpace;
    next.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());
    next.generateMipmaps = true;
    next.minFilter = THREE.LinearMipmapLinearFilter;
    next.magFilter = THREE.LinearFilter;
    next.wrapS = THREE.RepeatWrapping;
    next.wrapT = THREE.RepeatWrapping;
    next.repeat.set(repeat[0], repeat[1]);
    next.needsUpdate = true;
    return next;
  }, [gl, repeat, source]);
  useEffect(() => () => texture.dispose(), [texture]);

  return (
    <group>
      <mesh position={[0, -0.58, 4]}>
        <boxGeometry args={[72, 1.2, 76]} />
        <meshStandardMaterial color="#251a2b" roughness={0.92} />
      </mesh>
      <mesh position={[0, 0.08, 4]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[72, 76]} />
        <meshBasicMaterial map={texture} color={tint} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.11, 1.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[8.1, 8.45, 48]} />
        <meshBasicMaterial color={accent} transparent opacity={0.24} depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.115, 1.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[11.4, 11.58, 48]} />
        <meshBasicMaterial color={secondary} transparent opacity={0.14} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  );
}

function PortalLabel({ children, accent, active, minWidth = 150 }: { children: React.ReactNode; accent: string; active: boolean; minWidth?: number }) {
  return (
    <Html center distanceFactor={15} style={{ pointerEvents: "none" }}>
      <div style={{ minWidth, border: `2px solid ${accent}`, borderRadius: 6, background: "rgba(31,18,32,.96)", color: "#fff7ed", padding: "10px 13px", textAlign: "center", fontFamily: "system-ui,sans-serif", boxShadow: active ? `0 0 30px ${accent}88` : "0 10px 26px rgba(0,0,0,.5)" }}>{children}</div>
    </Html>
  );
}

function PortalFrame({ width, height, state, accent, active }: { width: number; height: number; state: RealmWorldGateState; accent: string; active: boolean }) {
  const visual = stateVisual(state, accent, active);
  return (
    <group>
      <mesh position={[0, 0.1, 0]}><cylinderGeometry args={[width * 0.62, width * 0.74, 0.22, 24]} /><meshStandardMaterial color="#261b2c" roughness={0.82} /></mesh>
      {[-1, 1].map((side) => (
        <RoundedBox key={side} args={[0.9, height, 1.08]} radius={0.15} smoothness={3} position={[side * width * 0.42, height * 0.5, 0]}>
          <meshStandardMaterial color={visual.stone} emissive={visual.energy} emissiveIntensity={0.08} metalness={0.12} roughness={0.58} />
        </RoundedBox>
      ))}
      <mesh position={[0, height - 0.05, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[width * 0.42, 0.45, 10, 36, Math.PI]} />
        <meshStandardMaterial color={visual.stone} emissive={visual.energy} emissiveIntensity={0.1} roughness={0.52} />
      </mesh>
      <mesh position={[0, height * 0.48, 0.08]}><planeGeometry args={[width * 0.68, height * 0.77]} /><meshBasicMaterial color={visual.energy} transparent opacity={state === "locked" ? 0.08 : active ? 0.58 : 0.3} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh>
      <mesh position={[0, height + 0.92, 0]} rotation={[0, 0, Math.PI / 4]}><octahedronGeometry args={[0.58, 0]} /><meshStandardMaterial color={visual.energy} emissive={visual.energy} emissiveIntensity={visual.intensity} roughness={0.2} /></mesh>
    </group>
  );
}

function ChanceDie({ position, color, rotation = [0, 0, 0] }: { position: [number, number, number]; color: string; rotation?: [number, number, number] }) {
  return (
    <group position={position} rotation={rotation}>
      <RoundedBox args={[1.5, 1.5, 1.5]} radius={0.24} smoothness={4}>
        <meshStandardMaterial color="#34243f" emissive={color} emissiveIntensity={0.25} roughness={0.34} />
      </RoundedBox>
      {[[-0.34, 0.77, -0.34], [0.34, 0.77, 0.34]].map(([x, y, z], index) => (
        <mesh key={index} position={[x, y, z]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[0.12, 16]} /><meshBasicMaterial color="#ffe6bd" toneMapped={false} /></mesh>
      ))}
    </group>
  );
}

function ChanceCoin({ position, accent }: { position: [number, number, number]; accent: string }) {
  return (
    <group position={position} rotation={[Math.PI / 2, 0, 0]}>
      <mesh><cylinderGeometry args={[0.7, 0.7, 0.16, 32]} /><meshStandardMaterial color="#d8972f" emissive={accent} emissiveIntensity={0.22} metalness={0.5} roughness={0.28} /></mesh>
      <mesh position={[0, 0.09, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.42, 0.06, 8, 24]} /><meshBasicMaterial color="#fff1a8" toneMapped={false} /></mesh>
    </group>
  );
}

export function ChanceHollowDistrictGate({ label, weeks, motif, state, accent, active }: { label: string; weeks: string; motif: string; state: RealmWorldGateState; accent: string; active: boolean }) {
  return <group><PortalFrame width={5.8} height={5.8} state={state} accent={accent} active={active} /><group position={[0, 8.65, 0]}><PortalLabel accent={accent} active={active} minWidth={190}><strong style={{ display: "block", fontSize: 16 }}>{label}</strong><span style={{ display: "block", marginTop: 4, color: "#ffe8d5", fontSize: 11, fontWeight: 800 }}>{motif}</span><span style={{ display: "block", marginTop: 5, color: accent, fontSize: 11, fontWeight: 950 }}>{weeks.toUpperCase()} · {statusLabel(state)}</span></PortalLabel></group></group>;
}

export function ChanceHollowWeekGate({ week, state, accent, active }: { week: number; state: RealmWorldGateState; accent: string; active: boolean }) {
  return <group><PortalFrame width={4.2} height={4.6} state={state} accent={accent} active={active} /><group position={[0, 7.05, 0]}><PortalLabel accent={accent} active={active}><strong style={{ display: "block", fontSize: 16 }}>Week {week}</strong><span style={{ display: "block", marginTop: 4, color: accent, fontSize: 10, fontWeight: 950 }}>{statusLabel(state)}</span></PortalLabel></group></group>;
}

export function ChanceHollowAdventurePortal({ accent, active }: { accent: string; active: boolean }) {
  return <group><PortalFrame width={7.2} height={7.1} state="current" accent={accent} active={active} /><group position={[0, 10.35, 0]}><PortalLabel accent={accent} active={active} minWidth={230}><strong style={{ display: "block", fontSize: 18 }}>START YOUR ADVENTURE</strong><span style={{ display: "block", marginTop: 5, color: accent, fontSize: 11, fontWeight: 950 }}>CURRENT TRAIL</span></PortalLabel></group></group>;
}

export function ChanceHollowReturnBeam({ accent, active, label = "RETURN TO CHANCE HOLLOW" }: { accent: string; active: boolean; label?: string }) {
  return (
    <group>
      <mesh position={[0, 0.13, 0]}><cylinderGeometry args={[2.7, 3.15, 0.26, 32]} /><meshStandardMaterial color="#261b2c" roughness={0.72} /></mesh>
      <mesh position={[0, 9.8, 0]}><cylinderGeometry args={[0.58, 1.32, 19.6, 18, 1, true]} /><meshBasicMaterial color={accent} transparent opacity={active ? 0.56 : 0.3} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} /></mesh>
      {active ? <Html center position={[0, 2, 0]} distanceFactor={10} style={{ pointerEvents: "none" }}><div style={{ border: `2px solid ${accent}`, borderRadius: 5, background: "rgba(31,18,32,.96)", color: "#fff7ed", padding: "8px 12px", fontSize: 11, fontWeight: 950, whiteSpace: "nowrap" }}>{label}</div></Html> : null}
    </group>
  );
}

export function ChanceHollowEnvironment({ quality, districtInterior, level = "Year 3" }: { quality: ChanceHollowQuality; districtInterior?: boolean; level?: RealmLevelId }) {
  const visuals = getChanceHollow3DVisuals(level);
  const overlap = Math.PI * 0.045;
  return (
    <>
      <Suspense fallback={null}>
        <WorldPanorama asset={visuals.front} radius={56} height={61} y={20} horizontalScale={0.82} skyBlendColor={visuals.sky} thetaStart={Math.PI / 2 - overlap / 2} thetaLength={Math.PI + overlap} edgeFade={0.045} backgroundLayer flipX crisp />
        <WorldPanorama asset={visuals.rear} radius={56} height={61} y={20} horizontalScale={0.82} skyBlendColor={visuals.sky} thetaStart={-Math.PI / 2 - overlap / 2} thetaLength={Math.PI + overlap} edgeFade={0.045} backgroundLayer flipX crisp />
      </Suspense>
      <fog attach="fog" args={[visuals.fog, 34, 78]} />
      <ambientLight color="#bdeaf0" intensity={0.48} />
      <hemisphereLight args={["#72d6df", "#211225", 0.58]} />
      <directionalLight position={[-14, 23, 11]} color="#ffe0bd" intensity={1.15} />
      <directionalLight position={[14, 9, -12]} color="#d946ef" intensity={0.32} />
      <Suspense fallback={null}><ChanceHollowGround floor={visuals.floor} tint={visuals.floorTint} repeat={visuals.floorRepeat} accent={visuals.accent} secondary={visuals.secondary} /></Suspense>
      <ChanceDie position={[-17, 1.4, districtInterior ? -11 : -18]} color={visuals.accent} rotation={[0.16, 0.5, -0.08]} />
      <ChanceDie position={[17, 1.7, districtInterior ? -10 : -17]} color={visuals.secondary} rotation={[-0.1, -0.45, 0.18]} />
      <ChanceCoin position={[-20, 1.2, 13]} accent="#fbbf24" />
      <ChanceCoin position={[20, 1.25, 12]} accent="#fb7185" />
      {quality === "high" ? <pointLight position={[0, 7, 2]} color={visuals.accent} intensity={1.65} distance={30} /> : null}
    </>
  );
}
