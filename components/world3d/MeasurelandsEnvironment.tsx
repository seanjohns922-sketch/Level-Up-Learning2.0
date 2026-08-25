"use client";

import { Html, RoundedBox } from "@react-three/drei";
import { useLoader, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useMemo } from "react";
import * as THREE from "three";
import { WorldPanorama } from "@/components/world3d/WorldPanorama";
import type { MeasurelandsLevelTheme } from "@/lib/measurelands-visuals";
import type { RealmWorldGateState } from "@/lib/world3d/realm-world-state";

export type MeasurelandsQuality = "low" | "medium" | "high";

export const MEASURELANDS_DISTRICT_LAYOUT: Record<string, [number, number, number]> = {
  "ruler-district": [-15, 0, -3],
  "measure-lab": [-6.5, 0, -12],
  timeworks: [6.5, 0, -12],
  "explorer-district": [15, 0, -3],
};

function statusLabel(state: RealmWorldGateState) {
  if (state === "completed") return "MASTERED";
  if (state === "current") return "CURRENT";
  if (state === "available") return "OPEN";
  return "LOCKED";
}

function stateVisual(state: RealmWorldGateState, accent: string, active: boolean) {
  if (state === "locked") return { frame: "#51473e", energy: "#756b61", intensity: 0.02 };
  if (state === "completed") return { frame: "#7a6744", energy: "#86b68e", intensity: 0.3 };
  return { frame: "#755234", energy: accent, intensity: active ? 1.05 : state === "current" ? 0.7 : 0.4 };
}

function MeasurelandsGround({ radius, positionZ, asset }: { radius: number; positionZ: number; asset: string }) {
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
    <mesh position={[0, -0.16, positionZ]} rotation={[-Math.PI / 2, 0, 0]} scale={[0.78, 1, 1]}>
      <circleGeometry args={[radius, 64]} />
      <meshStandardMaterial map={texture} emissiveMap={texture} emissive="#ffffff" emissiveIntensity={0.2} roughness={0.98} />
    </mesh>
  );
}

function DistrictPortal({ label, weeks, motif, state, accent, active }: { label: string; weeks: string; motif: string; state: RealmWorldGateState; accent: string; active: boolean }) {
  const visual = stateVisual(state, accent, active);
  return (
    <group>
      <mesh position={[0, 0.12, 0]}><cylinderGeometry args={[4.3, 4.7, 0.24, 32]} /><meshStandardMaterial color="#3c332d" roughness={0.84} /></mesh>
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 2.65, 0, 0]}>
          <RoundedBox args={[1.25, 6.6, 1.35]} radius={0.16} smoothness={2} position={[0, 3.3, 0]}>
            <meshStandardMaterial color={visual.frame} roughness={0.76} metalness={0.18} />
          </RoundedBox>
          <mesh position={[-side * 0.48, 3.35, 0.72]}><boxGeometry args={[0.1, 4.8, 0.05]} /><meshStandardMaterial color={visual.energy} emissive={visual.energy} emissiveIntensity={visual.intensity} /></mesh>
        </group>
      ))}
      <RoundedBox args={[6.6, 1.35, 1.4]} radius={0.18} smoothness={2} position={[0, 6.4, 0]}>
        <meshStandardMaterial color={visual.frame} roughness={0.72} metalness={0.2} />
      </RoundedBox>
      <mesh position={[0, 3.15, 0.08]}><planeGeometry args={[3.7, 5.1]} /><meshBasicMaterial color={visual.energy} transparent opacity={state === "locked" ? 0.08 : active ? 0.48 : 0.25} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh>
      <Html center position={[0, 8.15, 0]} distanceFactor={16} style={{ pointerEvents: "none" }}>
        <div style={{ minWidth: 190, border: `2px solid ${visual.energy}`, borderRadius: 5, background: "rgba(31,23,18,.96)", color: "#fff5df", padding: "10px 14px", textAlign: "center", fontFamily: "system-ui,sans-serif", boxShadow: active ? `0 0 28px ${visual.energy}77` : "0 10px 24px rgba(0,0,0,.45)" }}>
          <strong style={{ display: "block", fontSize: 16 }}>{label}</strong>
          <span style={{ display: "block", marginTop: 5, color: "#ead7b5", fontSize: 11, fontWeight: 800 }}>{motif}</span>
          <span style={{ display: "block", marginTop: 6, color: visual.energy, fontSize: 11, fontWeight: 950 }}>{weeks.toUpperCase()} · {statusLabel(state)}</span>
        </div>
      </Html>
    </group>
  );
}

export function MeasurelandsDistrictGate(props: Parameters<typeof DistrictPortal>[0]) {
  return <DistrictPortal {...props} />;
}

export function MeasurelandsWeekGate({ week, state, accent, active }: { week: number; state: RealmWorldGateState; accent: string; active: boolean }) {
  const visual = stateVisual(state, accent, active);
  return (
    <group>
      <mesh position={[0, 0.1, 0]}><cylinderGeometry args={[2.25, 2.5, 0.2, 28]} /><meshStandardMaterial color="#3b312b" roughness={0.8} /></mesh>
      {[-1, 1].map((side) => <RoundedBox key={side} args={[0.8, 4.7, 1]} radius={0.12} smoothness={2} position={[side * 1.65, 2.35, 0]}><meshStandardMaterial color={visual.frame} roughness={0.74} /></RoundedBox>)}
      <RoundedBox args={[4.1, 0.9, 1.05]} radius={0.13} smoothness={2} position={[0, 4.45, 0]}><meshStandardMaterial color={visual.frame} roughness={0.72} /></RoundedBox>
      <mesh position={[0, 2.15, 0.08]}><planeGeometry args={[2.45, 3.55]} /><meshBasicMaterial color={visual.energy} transparent opacity={state === "locked" ? 0.09 : active ? 0.55 : 0.3} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh>
      <Html center position={[0, 5.8, 0]} distanceFactor={14} style={{ pointerEvents: "none" }}>
        <div style={{ minWidth: 118, border: `2px solid ${visual.energy}`, borderRadius: 5, padding: "9px 12px", background: "rgba(31,23,18,.96)", color: "#fff5df", textAlign: "center", fontFamily: "system-ui,sans-serif", fontWeight: 950, boxShadow: active ? `0 0 24px ${visual.energy}77` : "0 8px 20px rgba(0,0,0,.4)" }}>
          <div style={{ fontSize: 16 }}>Week {week}</div>
          <div style={{ marginTop: 4, color: visual.energy, fontSize: 10 }}>{statusLabel(state)}</div>
        </div>
      </Html>
    </group>
  );
}

export function MeasurelandsAdventurePortal({ accent, active }: { accent: string; active: boolean }) {
  return (
    <group>
      <mesh position={[0, 0.12, 0]}><cylinderGeometry args={[4.8, 5.2, 0.24, 32]} /><meshStandardMaterial color="#49372b" roughness={0.82} /></mesh>
      {[-1, 1].map((side) => (
        <RoundedBox key={side} args={[1.35, 7.3, 1.5]} radius={0.18} smoothness={2} position={[side * 2.9, 3.65, 0]}>
          <meshStandardMaterial color="#6f4b2d" roughness={0.7} metalness={0.14} />
        </RoundedBox>
      ))}
      <RoundedBox args={[7.2, 1.45, 1.55]} radius={0.2} smoothness={2} position={[0, 7.05, 0]}>
        <meshStandardMaterial color="#6f4b2d" roughness={0.7} metalness={0.14} />
      </RoundedBox>
      <mesh position={[0, 3.45, 0.08]}><planeGeometry args={[4.25, 5.8]} /><meshBasicMaterial color={accent} transparent opacity={active ? 0.62 : 0.42} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh>
      <Html center position={[0, 9.05, 0]} distanceFactor={15} style={{ pointerEvents: "none" }}>
        <div style={{ minWidth: 230, border: `2px solid ${accent}`, borderRadius: 6, background: "rgba(54,38,27,.96)", color: "#fff8e8", padding: "12px 17px", textAlign: "center", fontFamily: "system-ui,sans-serif", boxShadow: active ? `0 0 30px ${accent}88` : "0 10px 24px rgba(0,0,0,.4)" }}>
          <strong style={{ display: "block", fontSize: 18 }}>START YOUR ADVENTURE</strong>
          <span style={{ display: "block", marginTop: 6, color: accent, fontSize: 11, fontWeight: 950 }}>CURRENT MISSION</span>
        </div>
      </Html>
    </group>
  );
}

export function MeasurelandsReturnBeam({ accent, active, label = "RETURN TO MEASURELANDS" }: { accent: string; active: boolean; label?: string }) {
  return (
    <group>
      <mesh position={[0, 0.15, 0]}><cylinderGeometry args={[2.8, 3.2, 0.3, 32]} /><meshStandardMaterial color="#41362e" roughness={0.72} /></mesh>
      <mesh position={[0, 10, 0]}><cylinderGeometry args={[0.7, 1.4, 20, 16, 1, true]} /><meshBasicMaterial color={accent} transparent opacity={active ? 0.52 : 0.28} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} /></mesh>
      {active ? <Html center position={[0, 2.1, 0]} distanceFactor={10} style={{ pointerEvents: "none" }}><div style={{ border: `2px solid ${accent}`, borderRadius: 5, background: "rgba(31,23,18,.95)", color: "#fff5df", padding: "8px 11px", fontSize: 11, fontWeight: 950, whiteSpace: "nowrap" }}>{label}</div></Html> : null}
    </group>
  );
}

export function MeasurelandsEnvironment({ theme, quality }: { theme: MeasurelandsLevelTheme; quality: MeasurelandsQuality; districtInterior?: boolean }) {
  const panoramaOverlap = Math.PI * (theme.panoramaBlend ?? 0);

  return (
    <>
      <Suspense fallback={null}>
        {theme.backBackground ? (
          <>
            <WorldPanorama
              asset={theme.background}
              radius={56}
              height={theme.panoramaHeight ?? 66}
              y={theme.panoramaY ?? 10}
              horizontalScale={0.78}
              skyBlendColor={theme.sky}
              thetaStart={Math.PI / 2 - panoramaOverlap / 2}
              thetaLength={Math.PI + panoramaOverlap}
              edgeFade={theme.panoramaBlend}
              flipX
              crisp
            />
            <WorldPanorama
              asset={theme.backBackground}
              radius={56}
              height={theme.panoramaHeight ?? 66}
              y={theme.panoramaY ?? 10}
              horizontalScale={0.78}
              skyBlendColor={theme.sky}
              thetaStart={-Math.PI / 2 - panoramaOverlap / 2}
              thetaLength={Math.PI + panoramaOverlap}
              edgeFade={theme.panoramaBlend}
              flipX
              crisp
            />
          </>
        ) : (
          <WorldPanorama asset={theme.background} radius={56} height={theme.panoramaHeight ?? 66} y={theme.panoramaY ?? 10} horizontalScale={0.78} skyBlendColor={theme.sky} flipX crisp />
        )}
      </Suspense>
      <fog attach="fog" args={[theme.fog, 34, 78]} />
      <ambientLight color={theme.ambientLight} intensity={0.45} />
      <hemisphereLight args={[theme.sky, "#34291f", 0.55]} />
      <directionalLight position={[-14, 24, 12]} color={theme.sunLight} intensity={1.25} />
      <Suspense fallback={null}>
        <MeasurelandsGround
          radius={55}
          positionZ={0}
          asset={theme.groundAsset ?? "/images/measurelands-ground-road-grass-2k.jpg"}
        />
      </Suspense>
      <mesh position={[0, -0.12, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[0.78, 1, 1]}><ringGeometry args={[54.5, 54.7, 64]} /><meshBasicMaterial color={theme.accent} transparent opacity={0.24} toneMapped={false} depthWrite={false} /></mesh>
      {quality === "high" ? <pointLight position={[0, 7, 4]} color={theme.accent} intensity={1.5} distance={28} /> : null}
    </>
  );
}
