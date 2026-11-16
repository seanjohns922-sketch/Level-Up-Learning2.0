"use client";

import { WorldSignHtml } from "@/components/world3d/WorldSignHtml";
import { RoundedBox } from "@react-three/drei";
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

function StatisticaGround({ theme }: { theme: StatisticaLevelTheme }) {
  const source = useLoader(THREE.TextureLoader, "/images/statistica-terrace-tile.png");
  const { gl } = useThree();
  const cliffTerrace = theme.floorStyle === "cliffTerrace";
  const summitTerrace = theme.floorStyle === "summitTerrace";
  const texture = useMemo(() => {
    const next = source.clone();
    next.colorSpace = THREE.SRGBColorSpace;
    next.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());
    next.generateMipmaps = true;
    next.minFilter = THREE.LinearMipmapLinearFilter;
    next.magFilter = THREE.LinearFilter;
    next.wrapS = THREE.RepeatWrapping;
    next.wrapT = THREE.RepeatWrapping;
    next.repeat.set(cliffTerrace ? 2.4 : summitTerrace ? 2.2 : 3, cliffTerrace ? 1.7 : summitTerrace ? 2.2 : 2);
    next.needsUpdate = true;
    return next;
  }, [cliffTerrace, gl, source, summitTerrace]);
  useEffect(() => () => texture.dispose(), [texture]);

  if (summitTerrace) {
    return (
      <group>
        <mesh position={[0, -0.28, 6]} scale={[1, 0.2, 0.78]}>
          <cylinderGeometry args={[46, 46, 1, 96]} />
          <meshStandardMaterial color={theme.ledgeSide} roughness={0.82} />
        </mesh>
        <mesh position={[0, 0.12, 6]} rotation={[-Math.PI / 2, 0, 0]} scale={[1, 0.78, 1]}>
          <circleGeometry args={[46, 96]} />
          <meshBasicMaterial map={texture} color="#ffffff" toneMapped={false} />
        </mesh>
        <mesh position={[0, 0.145, 1.8]} rotation={[-Math.PI / 2, 0, 0]} scale={[1.18, 0.72, 1]}>
          <ringGeometry args={[12, 18.5, 96]} />
          <meshBasicMaterial color={theme.accent} transparent opacity={0.34} depthWrite={false} toneMapped={false} />
        </mesh>
        <mesh position={[0, 0.15, 1.8]} rotation={[-Math.PI / 2, 0, 0]} scale={[1.18, 0.72, 1]}>
          <ringGeometry args={[19.6, 21.1, 96]} />
          <meshBasicMaterial color={theme.secondaryAccent} transparent opacity={0.46} depthWrite={false} toneMapped={false} />
        </mesh>
        <mesh position={[0, 0.155, 1.8]} rotation={[-Math.PI / 2, 0, 0]} scale={[1.18, 0.72, 1]}>
          <circleGeometry args={[7.8, 72]} />
          <meshBasicMaterial color={theme.waterGlow ?? theme.accent} transparent opacity={0.2} depthWrite={false} toneMapped={false} />
        </mesh>
      </group>
    );
  }

  return (
    <group>
      <mesh position={[0, 0.12, cliffTerrace ? 4 : 8]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={cliffTerrace ? [104, 72] : [120, 80]} />
        <meshBasicMaterial map={texture} color="#ffffff" toneMapped={false} />
      </mesh>
      <mesh position={[0, -0.28, cliffTerrace ? 40.15 : 48.15]}>
        <boxGeometry args={cliffTerrace ? [104, 0.92, 1.35] : [120, 0.78, 1.1]} />
        <meshStandardMaterial color={theme.ledgeSide} roughness={0.82} />
      </mesh>
      {cliffTerrace ? (
        <>
          <mesh position={[-52.3, -0.55, 4]}>
            <boxGeometry args={[1.4, 1.6, 72]} />
            <meshStandardMaterial color={theme.cliffSide} roughness={0.9} />
          </mesh>
          <mesh position={[52.3, -0.55, 4]}>
            <boxGeometry args={[1.4, 1.6, 72]} />
            <meshStandardMaterial color={theme.cliffSide} roughness={0.9} />
          </mesh>
          <mesh position={[0, -0.86, 40.85]}>
            <boxGeometry args={[102, 0.9, 1.8]} />
            <meshStandardMaterial color={theme.cliffSide} roughness={0.94} />
          </mesh>
          <mesh position={[0, -0.3, 42]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[84, 5.5]} />
            <meshBasicMaterial color={theme.waterGlow} transparent opacity={0.34} depthWrite={false} toneMapped={false} />
          </mesh>
        </>
      ) : null}
    </group>
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
    <WorldSignHtml center distanceFactor={15} style={{ pointerEvents: "none" }}>
      <div style={{ minWidth, border: `2px solid ${accent}`, borderRadius: 6, background: "rgba(18,49,42,.96)", color: "#fffaf2", padding: "10px 13px", textAlign: "center", fontFamily: "system-ui,sans-serif", boxShadow: active ? `0 0 28px ${accent}88` : "0 10px 24px rgba(0,0,0,.42)" }}>{children}</div>
    </WorldSignHtml>
  );
}

// Statistica's bar-chart gate: each pillar is a stack of coloured bars like a
// column graph, joined by a white marble arch. Current glows, mastered has full
// bars with gold caps, and locked is grey with a padlock.
const BAR_COLOURS = ["#E25A4F", "#F2A23B", "#F6D04D", "#4FB0E2", "#7DD36B"];

function PortalFrame({ width, height, state, accent, active }: { width: number; height: number; state: RealmWorldGateState; accent: string; active: boolean }) {
  const visual = stateVisual(state, accent, active);
  const locked = state === "locked";
  const mastered = state === "completed";
  const span = width * 0.42;
  const pillarHeight = height * 0.66;
  // Left pillar three bars, right pillar two, like a little column graph.
  const stacks = [[0.34, 0.33, 0.33], [0.55, 0.45]];
  return (
    <group>
      <mesh position={[0, 0.11, 0]}><cylinderGeometry args={[width * 0.62, width * 0.72, 0.22, 36]} /><meshStandardMaterial color="#e9e4d6" roughness={0.6} /></mesh>
      <mesh position={[0, 0.24, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[width * 0.5, width * 0.56, 36]} /><meshBasicMaterial color={mastered ? "#f5c04a" : visual.energy} transparent opacity={locked ? 0.15 : 0.8} toneMapped={false} /></mesh>
      {stacks.map((parts, pillar) => {
        const side = pillar === 0 ? -1 : 1;
        let y = 0.22;
        return (
          <group key={pillar} position={[side * span, 0, 0]}>
            {parts.map((part, index) => {
              const h = pillarHeight * part;
              const colour = locked ? "#8d9a92" : BAR_COLOURS[(pillar * 3 + index) % BAR_COLOURS.length];
              const mesh = (
                <RoundedBox key={index} args={[0.95, h - 0.06, 0.95]} radius={0.08} smoothness={2} position={[0, y + h / 2, 0]}>
                  <meshStandardMaterial color={colour} emissive={colour} emissiveIntensity={locked ? 0 : active ? 0.4 : 0.18} roughness={0.45} />
                </RoundedBox>
              );
              y += h;
              return mesh;
            })}
            <mesh position={[0, pillarHeight + 0.3, 0]}><boxGeometry args={[1.15, 0.16, 1.15]} /><meshStandardMaterial color={mastered ? "#f5c04a" : "#f4f1e8"} metalness={mastered ? 0.6 : 0.05} roughness={0.35} /></mesh>
          </group>
        );
      })}
      <mesh position={[0, pillarHeight + 0.3, 0]}><torusGeometry args={[span, 0.26, 10, 32, Math.PI]} /><meshStandardMaterial color={locked ? "#b9c0ba" : "#f4f1e8"} roughness={0.35} /></mesh>
      <mesh position={[0, (pillarHeight + 0.3) / 2 + 0.1, 0.06]}><planeGeometry args={[span * 2 - 1, pillarHeight + 0.1]} /><meshBasicMaterial color={visual.energy} transparent opacity={locked ? 0.07 : active ? 0.55 : 0.3} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} /></mesh>
      <mesh position={[0, pillarHeight + 0.3, 0.06]}><circleGeometry args={[span - 0.26, 32, 0, Math.PI]} /><meshBasicMaterial color={visual.energy} transparent opacity={locked ? 0.07 : active ? 0.55 : 0.3} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} /></mesh>
      <mesh position={[0, pillarHeight + span + 0.85, 0]}><octahedronGeometry args={[0.5, 0]} /><meshStandardMaterial color={mastered ? "#f5c04a" : visual.energy} emissive={mastered ? "#f5c04a" : visual.energy} emissiveIntensity={locked ? 0.03 : visual.intensity} roughness={0.2} /></mesh>
      {locked ? (
        <group position={[0, pillarHeight * 0.55, 0.3]}>
          <mesh position={[0, 0.32, 0]}><torusGeometry args={[0.3, 0.08, 8, 20, Math.PI]} /><meshStandardMaterial color="#d6d8d0" metalness={0.6} roughness={0.35} /></mesh>
          <mesh><boxGeometry args={[0.8, 0.62, 0.22]} /><meshStandardMaterial color="#a7ada4" metalness={0.55} roughness={0.4} /></mesh>
        </group>
      ) : null}
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
      {active ? <WorldSignHtml center position={[0, 2, 0]} distanceFactor={10} style={{ pointerEvents: "none" }}><div style={{ border: `2px solid ${accent}`, borderRadius: 5, background: "rgba(18,49,42,.96)", color: "#fffaf2", padding: "8px 12px", fontSize: 11, fontWeight: 950, whiteSpace: "nowrap" }}>{label}</div></WorldSignHtml> : null}
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
      <Suspense fallback={null}><StatisticaGround theme={theme} /></Suspense>
      <mesh position={[0, -0.11, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[0.82, 1, 1]}><ringGeometry args={[53.8, 54.1, 72]} /><meshBasicMaterial color={theme.secondaryAccent} transparent opacity={0.24} toneMapped={false} depthWrite={false} /></mesh>
      {[-4.6, -2.9, -1.2, 1.2, 2.9, 4.6].map((x, index) => (
        <DataColumn key={x} x={x} z={districtInterior ? -11.8 : -16.5} height={[1.2, 2.4, 1.7, 3.2, 2, 2.8][index]!} color={[theme.accent, theme.secondaryAccent, "#79b85a", "#59add1", theme.accent, "#fff4df"][index]!} />
      ))}
      {quality === "high" ? <pointLight position={[0, 7, 2]} color={theme.accent} intensity={1.45} distance={28} /> : null}
    </>
  );
}
