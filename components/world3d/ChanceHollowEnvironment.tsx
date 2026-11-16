"use client";

import { Html, RoundedBox } from "@react-three/drei";
import { useFrame, useLoader, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { WorldPanoramaRing } from "./WorldPanoramaRing";
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
  "scale-sanctum": [-12.5, 0, -5.5],
  "simulation-spire": [0, 0, -13.5],
  "master-citadel": [12.5, 0, -5.5],
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
  "Year 6": {
    front: "/images/chancehollow-home-y6.jpeg",
    rear: "/images/chancehollow-level6-panorama-rear.png",
    floor: "/images/chancehollow-level6-floor.png",
    sky: "#24264b",
    fog: "#18152d",
    accent: "#d946ef",
    secondary: "#22d3ee",
    floorTint: "#f4efff",
    floorRepeat: [3.4, 3.3] as const,
  },
} as const;

export function getChanceHollow3DVisuals(level: RealmLevelId) {
  if (level === "Year 6") return LEVEL_VISUALS["Year 6"];
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

// Chance Hollow's rune stone arch: carved stone pillars and arch with glowing
// runes, a spinner in the keystone and a die at its foot. Current runes glow and
// the spinner turns; mastered runes are gold; locked is shadowed with a padlock.
const prefersReducedMotion = () => typeof window !== "undefined" && Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
const SPINNER_COLOURS = ["#FB7185", "#F6D04D", "#4FB0E2", "#7DD36B", "#B48CFF", "#F2A23B", "#2DD4BF", "#F472B6"];

function PortalFrame({ width, height, state, accent, active }: { width: number; height: number; state: RealmWorldGateState; accent: string; active: boolean }) {
  const visual = stateVisual(state, accent, active);
  const locked = state === "locked";
  const mastered = state === "completed";
  const span = width * 0.42;
  const pillarHeight = height * 0.6;
  const archY = pillarHeight + 0.2;
  const stone = locked ? "#6a6276" : "#9a86b0";
  const rune = mastered ? "#f5c04a" : visual.energy;
  const spinner = useRef<THREE.Group>(null);
  const still = useMemo(() => prefersReducedMotion(), []);
  useFrame((_, delta) => {
    if (locked || still || !spinner.current) return;
    spinner.current.rotation.z -= delta * (active ? 2.2 : 0.9);
  });
  return (
    <group>
      <mesh position={[0, 0.1, 0]}><cylinderGeometry args={[width * 0.62, width * 0.74, 0.22, 24]} /><meshStandardMaterial color="#261b2c" roughness={0.82} /></mesh>
      {[-1, 1].map((side) => (
        <group key={side} position={[side * span, 0, 0]}>
          <RoundedBox args={[0.95, pillarHeight, 1.05]} radius={0.12} smoothness={2} position={[0, pillarHeight / 2 + 0.2, 0]}>
            <meshStandardMaterial color={stone} roughness={0.85} />
          </RoundedBox>
          {[0.25, 0.45, 0.65, 0.85].map((t) => (
            <mesh key={t} position={[0, 0.2 + pillarHeight * t, 0.54]}><boxGeometry args={[t === 0.45 ? 0.42 : 0.22, 0.08, 0.02]} /><meshBasicMaterial color={rune} transparent opacity={locked ? 0.12 : 0.9} toneMapped={false} /></mesh>
          ))}
        </group>
      ))}
      <mesh position={[0, archY, 0]}><torusGeometry args={[span, 0.42, 8, 28, Math.PI]} /><meshStandardMaterial color={stone} roughness={0.85} /></mesh>
      {Array.from({ length: 7 }, (_, index) => {
        const angle = ((index + 0.5) / 7) * Math.PI;
        return <mesh key={index} position={[Math.cos(angle) * span, archY + Math.sin(angle) * span, 0.44]} rotation={[0, 0, angle]}><boxGeometry args={[0.08, 0.26, 0.02]} /><meshBasicMaterial color={rune} transparent opacity={locked ? 0.12 : 0.9} toneMapped={false} /></mesh>;
      })}
      <mesh position={[0, archY / 2 + 0.1, 0.06]}><planeGeometry args={[span * 2 - 0.95, archY - 0.1]} /><meshBasicMaterial color={visual.energy} transparent opacity={locked ? 0.06 : active ? 0.55 : 0.3} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} /></mesh>
      <mesh position={[0, archY, 0.06]}><circleGeometry args={[span - 0.42, 32, 0, Math.PI]} /><meshBasicMaterial color={visual.energy} transparent opacity={locked ? 0.06 : active ? 0.55 : 0.3} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} /></mesh>
      <group position={[0, archY + span + 0.35, 0.3]} scale={1.35}>
        <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.85, 0.85, 0.2, 32]} /><meshStandardMaterial color={mastered ? "#f5c04a" : "#3b2e48"} metalness={0.5} roughness={0.35} /></mesh>
        <group ref={spinner} position={[0, 0, 0.12]}>
          {SPINNER_COLOURS.map((colour, index) => (
            <mesh key={index}><circleGeometry args={[0.72, 6, (index / 8) * Math.PI * 2, Math.PI / 4]} /><meshBasicMaterial color={locked ? "#5e5768" : colour} toneMapped={false} side={THREE.DoubleSide} /></mesh>
          ))}
        </group>
        <mesh position={[0, 0.78, 0.14]} rotation={[0, 0, Math.PI]}><coneGeometry args={[0.13, 0.3, 3]} /><meshBasicMaterial color="#fff1d6" toneMapped={false} /></mesh>
      </group>
      <group position={[span + 0.95, 0.42, 0.55]} rotation={[0.3, 0.6, 0.2]} scale={0.32}><RoundedBox args={[1.5, 1.5, 1.5]} radius={0.24} smoothness={3}><meshStandardMaterial color="#f4eeff" roughness={0.4} /></RoundedBox><mesh position={[0, 0.77, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[0.16, 16]} /><meshBasicMaterial color="#1d1430" /></mesh></group>
      {locked ? (
        <group position={[0, pillarHeight * 0.55, 0.3]}>
          <mesh position={[0, 0.32, 0]}><torusGeometry args={[0.3, 0.08, 8, 20, Math.PI]} /><meshStandardMaterial color="#cfc9d8" metalness={0.6} roughness={0.35} /></mesh>
          <mesh><boxGeometry args={[0.8, 0.62, 0.22]} /><meshStandardMaterial color="#9f98ab" metalness={0.55} roughness={0.4} /></mesh>
        </group>
      ) : null}
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
  return (
    <>
      <Suspense fallback={null}>
        <WorldPanoramaRing asset={visuals.front} rearAsset={visuals.rear} radius={56} height={61} y={20} horizontalScale={0.82} skyBlendColor={visuals.sky} flipX />
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
