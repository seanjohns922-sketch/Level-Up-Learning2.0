"use client";

import { Html, RoundedBox } from "@react-three/drei";
import { useLoader, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useMemo } from "react";
import * as THREE from "three";
import { WorldPanorama } from "@/components/world3d/WorldPanorama";
import type { StarpathLevelTheme } from "@/lib/starpath-visuals";
import type { RealmWorldGateState } from "@/lib/world3d/realm-world-state";

export type StarpathQuality = "low" | "medium" | "high";

export const STARPATH_SURFACE_Y = -1.5;

export const STARPATH_DISTRICT_LAYOUT: Record<string, [number, number, number]> = {
  "starpath-district-1": [-11, STARPATH_SURFACE_Y, -4],
  "starpath-district-2": [-3.7, STARPATH_SURFACE_Y, -10],
  "starpath-district-3": [3.7, STARPATH_SURFACE_Y, -10],
  "starpath-district-4": [11, STARPATH_SURFACE_Y, -4],
};

function statusLabel(state: RealmWorldGateState) {
  if (state === "completed") return "MASTERED";
  if (state === "current") return "CURRENT";
  if (state === "available") return "OPEN";
  return "LOCKED";
}

function stateVisual(state: RealmWorldGateState, accent: string, active: boolean) {
  if (state === "locked") return { frame: "#3c4359", energy: "#697089", intensity: 0.04 };
  if (state === "completed") return { frame: "#53617d", energy: "#9ae6c0", intensity: 0.42 };
  return { frame: "#536483", energy: accent, intensity: active ? 1.2 : state === "current" ? 0.85 : 0.5 };
}

function PortalFrame({ width, height, state, accent, active }: { width: number; height: number; state: RealmWorldGateState; accent: string; active: boolean }) {
  const visual = stateVisual(state, accent, active);
  return (
    <group>
      <mesh position={[0, 0.1, 0]}><cylinderGeometry args={[width * 0.72, width * 0.82, 0.2, 32]} /><meshStandardMaterial color="#151a31" metalness={0.5} roughness={0.35} /></mesh>
      {[-1, 1].map((side) => (
        <group key={side} position={[side * width * 0.42, height * 0.48, 0]}>
          <RoundedBox args={[0.78, height, 0.9]} radius={0.16} smoothness={2}><meshStandardMaterial color={visual.frame} metalness={0.62} roughness={0.28} /></RoundedBox>
          <mesh position={[-side * 0.34, 0, 0.47]}><boxGeometry args={[0.08, height * 0.76, 0.04]} /><meshBasicMaterial color={visual.energy} toneMapped={false} /></mesh>
        </group>
      ))}
      <RoundedBox args={[width, 0.86, 0.94]} radius={0.16} smoothness={2} position={[0, height * 0.96, 0]}><meshStandardMaterial color={visual.frame} metalness={0.62} roughness={0.28} /></RoundedBox>
      <mesh position={[0, height * 0.47, 0.08]}><planeGeometry args={[width * 0.68, height * 0.75]} /><meshBasicMaterial color={visual.energy} transparent opacity={state === "locked" ? 0.08 : active ? 0.62 : 0.34} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh>
      <mesh position={[0, height + 1.08, 0]} rotation={[0, 0, Math.PI / 4]}><octahedronGeometry args={[0.54, 0]} /><meshStandardMaterial color={visual.energy} emissive={visual.energy} emissiveIntensity={visual.intensity} metalness={0.25} roughness={0.18} /></mesh>
    </group>
  );
}

function PortalLabel({ children, accent, active }: { children: React.ReactNode; accent: string; active: boolean }) {
  return (
    <Html center distanceFactor={15} style={{ pointerEvents: "none" }}>
      <div style={{ minWidth: 190, border: `2px solid ${accent}`, borderRadius: 6, background: "rgba(8,12,31,.95)", color: "#f8fbff", padding: "10px 14px", textAlign: "center", fontFamily: "system-ui,sans-serif", boxShadow: active ? `0 0 30px ${accent}88` : "0 10px 25px rgba(0,0,0,.48)" }}>{children}</div>
    </Html>
  );
}

export function StarpathDistrictGate({ label, weeks, motif, state, accent, active }: { label: string; weeks: string; motif: string; state: RealmWorldGateState; accent: string; active: boolean }) {
  return <group><PortalFrame width={5.8} height={5.8} state={state} accent={accent} active={active} /><group position={[0, 8.6, 0]}><PortalLabel accent={accent} active={active}><strong style={{ display: "block", fontSize: 16 }}>{label}</strong><span style={{ display: "block", marginTop: 4, color: "#dbeafe", fontSize: 11, fontWeight: 800 }}>{motif}</span><span style={{ display: "block", marginTop: 5, color: accent, fontSize: 11, fontWeight: 950 }}>{weeks.toUpperCase()} · {statusLabel(state)}</span></PortalLabel></group></group>;
}

export function StarpathWeekGate({ week, state, accent, active }: { week: number; state: RealmWorldGateState; accent: string; active: boolean }) {
  return <group><PortalFrame width={4.3} height={4.6} state={state} accent={accent} active={active} /><group position={[0, 7.1, 0]}><PortalLabel accent={accent} active={active}><strong style={{ display: "block", fontSize: 16 }}>Week {week}</strong><span style={{ display: "block", marginTop: 4, color: accent, fontSize: 10, fontWeight: 950 }}>{statusLabel(state)}</span></PortalLabel></group></group>;
}

export function StarpathAdventurePortal({ accent, active }: { accent: string; active: boolean }) {
  return <group><PortalFrame width={7.4} height={7.2} state="current" accent={accent} active={active} /><group position={[0, 10.45, 0]}><PortalLabel accent={accent} active={active}><strong style={{ display: "block", fontSize: 18 }}>START YOUR VOYAGE</strong><span style={{ display: "block", marginTop: 5, color: accent, fontSize: 11, fontWeight: 950 }}>CURRENT MISSION</span></PortalLabel></group></group>;
}

export function StarpathReturnBeam({ accent, active, label = "RETURN TO STARPATH" }: { accent: string; active: boolean; label?: string }) {
  return (
    <group>
      <mesh position={[0, 0.12, 0]}><cylinderGeometry args={[3, 3.4, 0.24, 36]} /><meshStandardMaterial color="#151a31" metalness={0.55} roughness={0.3} /></mesh>
      <mesh position={[0, 0.3, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[1.75, 2.65, 48]} /><meshBasicMaterial color={accent} transparent opacity={0.9} toneMapped={false} side={THREE.DoubleSide} /></mesh>
      <mesh position={[0, 10, 0]}><cylinderGeometry args={[0.5, 1.5, 20, 20, 1, true]} /><meshBasicMaterial color={accent} transparent opacity={active ? 0.58 : 0.3} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} /></mesh>
      <mesh position={[0, 10, 0]}><cylinderGeometry args={[0.34, 0.72, 20, 16]} /><meshBasicMaterial color="#e9fbff" transparent opacity={active ? 0.88 : 0.68} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} /></mesh>
      {active ? <Html center position={[0, 2, 0]} distanceFactor={10} style={{ pointerEvents: "none" }}><div style={{ border: `2px solid ${accent}`, borderRadius: 5, background: "rgba(8,12,31,.95)", color: "#fff", padding: "8px 12px", fontSize: 11, fontWeight: 950, whiteSpace: "nowrap" }}>{label}</div></Html> : null}
    </group>
  );
}

function StarpathCloudDeck() {
  const source = useLoader(THREE.TextureLoader, "/images/starpath-cloud-deck-y3.jpg");
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
    <mesh position={[0, STARPATH_SURFACE_Y - 0.18, 1]} rotation={[-Math.PI / 2, 0, 0]} scale={[1, 1.08, 1]}>
      <circleGeometry args={[34, 64]} />
      <meshStandardMaterial map={texture} emissiveMap={texture} emissive="#dceaff" emissiveIntensity={0.2} roughness={1} />
    </mesh>
  );
}

function StarpathGroundGlassDeck({ asset }: { asset: string }) {
  const source = useLoader(THREE.TextureLoader, asset);
  const { gl } = useThree();
  const texture = useMemo(() => {
    const next = source.clone();
    next.colorSpace = THREE.SRGBColorSpace;
    next.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());
    next.wrapS = THREE.RepeatWrapping;
    next.wrapT = THREE.RepeatWrapping;
    next.repeat.set(1.35, 1.35);
    next.generateMipmaps = true;
    next.minFilter = THREE.LinearMipmapLinearFilter;
    next.magFilter = THREE.LinearFilter;
    next.needsUpdate = true;
    return next;
  }, [gl, source]);
  useEffect(() => () => texture.dispose(), [texture]);

  return (
    <mesh position={[0, STARPATH_SURFACE_Y - 0.045, 2]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[30, 72]} />
      <meshStandardMaterial map={texture} emissiveMap={texture} emissive="#dceaff" emissiveIntensity={0.12} metalness={0.18} roughness={0.2} />
    </mesh>
  );
}

function StarpathLevel1GlassWalkway() {
  const path = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 31),
      new THREE.Vector3(-1.7, 0, 23),
      new THREE.Vector3(1.45, 0, 14),
      new THREE.Vector3(-1.25, 0, 5),
      new THREE.Vector3(1.15, 0, -4),
      new THREE.Vector3(-0.8, 0, -13),
      new THREE.Vector3(0, 0, -28),
    ], false, "catmullrom", 0.36);
    const segments = 72;
    const halfWidth = 4.7;
    const positions: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];
    for (let index = 0; index <= segments; index += 1) {
      const t = index / segments;
      const point = curve.getPoint(t);
      const tangent = curve.getTangent(t).normalize();
      const side = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
      const left = point.clone().addScaledVector(side, halfWidth);
      const right = point.clone().addScaledVector(side, -halfWidth);
      positions.push(left.x, left.y, left.z, right.x, right.y, right.z);
      uvs.push(0, t, 1, t);
      if (index < segments) {
        const offset = index * 2;
        indices.push(offset, offset + 2, offset + 1, offset + 2, offset + 3, offset + 1);
      }
    }
    const surface = new THREE.BufferGeometry();
    surface.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    surface.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    surface.setIndex(indices);
    surface.computeVertexNormals();
    const railCurve = (direction: number) => new THREE.CatmullRomCurve3(
      Array.from({ length: 25 }, (_, index) => {
        const t = index / 24;
        const point = curve.getPoint(t);
        const tangent = curve.getTangent(t).normalize();
        const side = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
        return point.addScaledVector(side, halfWidth * direction).setY(0.07);
      }),
      false,
      "catmullrom",
      0.36,
    );
    const rails = [-1, 1].map((direction) => new THREE.TubeGeometry(railCurve(direction), 72, 0.09, 6, false));
    const slabs = Array.from({ length: 20 }, (_, index) => {
      const startT = index / 20;
      const endT = (index + 1) / 20;
      const t = (startT + endT) / 2;
      const point = curve.getPoint(t);
      const tangent = curve.getTangent(t).normalize();
      const length = curve.getPoint(startT).distanceTo(curve.getPoint(endT)) - 0.16;
      return { position: point, rotation: Math.atan2(tangent.x, tangent.z), length };
    });
    return { surface, rails, slabs };
  }, []);
  useEffect(() => () => {
    path.surface.dispose();
    path.rails.forEach((rail) => rail.dispose());
  }, [path]);

  return (
    <group position={[0, STARPATH_SURFACE_Y - 0.035, 0]}>
      <mesh geometry={path.surface}>
        <meshStandardMaterial
          color="#b9dce8"
          emissive="#c8f3ff"
          emissiveIntensity={0.18}
          transparent
          opacity={0.12}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      {path.slabs.map((slab, index) => (
        <RoundedBox
          key={index}
          args={[9.1, 0.12, slab.length]}
          radius={0.08}
          smoothness={2}
          position={[slab.position.x, 0.055, slab.position.z]}
          rotation={[0, slab.rotation, 0]}
        >
          <meshPhysicalMaterial
            color={index % 2 === 0 ? "#d7eff8" : "#c9e4f2"}
            emissive="#c8f3ff"
            emissiveIntensity={0.28}
            metalness={0.06}
            roughness={0.12}
            transmission={0.24}
            transparent
            opacity={0.58}
            depthWrite={false}
          />
        </RoundedBox>
      ))}
      {path.rails.map((geometry, index) => (
        <mesh key={index} geometry={geometry}>
          <meshStandardMaterial color="#efd1ca" emissive="#ffd9d2" emissiveIntensity={0.42} metalness={0.7} roughness={0.14} />
        </mesh>
      ))}
    </group>
  );
}

function StarpathGroundRockPath() {
  const stones = [
    { x: -1.1, z: -7.5, width: 2.5, depth: 1.38, rotation: -0.08 },
    { x: 1.35, z: -7.85, width: 2.25, depth: 1.26, rotation: 0.14 },
    { x: -1.75, z: -9.75, width: 2.65, depth: 1.4, rotation: 0.18 },
    { x: 0.85, z: -10.15, width: 2.8, depth: 1.34, rotation: -0.13 },
    { x: -2.45, z: -12.3, width: 2.5, depth: 1.3, rotation: -0.14 },
    { x: 0, z: -12.65, width: 2.85, depth: 1.48, rotation: 0.1 },
    { x: 2.65, z: -12.2, width: 2.4, depth: 1.28, rotation: 0.2 },
    { x: -1.45, z: -15.1, width: 3, depth: 1.5, rotation: 0.12 },
    { x: 1.75, z: -15.35, width: 2.75, depth: 1.44, rotation: -0.18 },
    { x: -2.8, z: -18.05, width: 2.85, depth: 1.4, rotation: -0.16 },
    { x: 0.15, z: -18.3, width: 3.25, depth: 1.58, rotation: 0.08 },
    { x: 3.05, z: -17.85, width: 2.65, depth: 1.34, rotation: 0.17 },
    { x: -1.75, z: -21.35, width: 3.2, depth: 1.55, rotation: 0.14 },
    { x: 1.85, z: -21.55, width: 3.05, depth: 1.48, rotation: -0.12 },
    { x: -3.2, z: -24.7, width: 3, depth: 1.42, rotation: -0.12 },
    { x: 0.1, z: -24.95, width: 3.45, depth: 1.62, rotation: 0.08 },
    { x: 3.35, z: -24.55, width: 2.85, depth: 1.4, rotation: 0.16 },
  ];

  return (
    <group>
      {stones.map((stone, index) => (
        <mesh
          key={stone.z}
          position={[stone.x, STARPATH_SURFACE_Y + 0.055, stone.z]}
          rotation={[0, stone.rotation, 0]}
          scale={[stone.width, 1, stone.depth]}
        >
          <cylinderGeometry args={[0.62, 0.68, 0.14, 8]} />
          <meshStandardMaterial
            color={index % 3 === 0 ? "#b6a895" : index % 3 === 1 ? "#918b87" : "#c7bbac"}
            emissive="#8093ac"
            emissiveIntensity={0.08}
            metalness={0.08}
            roughness={0.82}
          />
        </mesh>
      ))}
    </group>
  );
}

function ObservatoryFloor({ theme }: { theme: StarpathLevelTheme }) {
  if (theme.groundAsset) {
    return (
      <group>
        <Suspense fallback={null}><StarpathCloudDeck /></Suspense>
        <Suspense fallback={null}>
          {theme.level === "Year 1" || theme.level === "Year 2" ? <StarpathLevel1GlassWalkway /> : <StarpathGroundGlassDeck asset={theme.groundAsset} />}
        </Suspense>
        {theme.level === "Prep" ? <StarpathGroundRockPath /> : null}
      </group>
    );
  }
  const paths: Array<[[number, number], [number, number]]> = [
    [[0, 31], [0, 2]],
    [[0, 2], [-11, -4]],
    [[0, 2], [-3.7, -10]],
    [[0, 2], [3.7, -10]],
    [[0, 2], [11, -4]],
  ];
  return (
    <group>
      <Suspense fallback={null}><StarpathCloudDeck /></Suspense>
      {paths.map(([start, end], index) => {
        const dx = end[0] - start[0];
        const dz = end[1] - start[1];
        const length = Math.hypot(dx, dz);
        const width = index === 0 ? 4.6 : 3.3;
        const rotation = Math.atan2(dx, dz);
        const position: [number, number, number] = [(start[0] + end[0]) / 2, STARPATH_SURFACE_Y - 0.035, (start[1] + end[1]) / 2];
        const panelCount = Math.max(3, Math.round(length / 2.6));
        return (
          <group key={index} position={position} rotation={[0, rotation, 0]}>
            <RoundedBox args={[width, 0.09, length]} radius={0.08} smoothness={2}>
              <meshStandardMaterial color="#a9c9e8" emissive="#c8dcff" emissiveIntensity={0.18} metalness={0.22} roughness={0.12} transparent opacity={0.64} depthWrite={false} />
            </RoundedBox>
            {[-1, 1].map((side) => (
              <mesh key={side} position={[side * (width / 2 - 0.08), 0.07, 0]}>
                <boxGeometry args={[0.1, 0.08, length]} />
                <meshStandardMaterial color="#9db7d9" emissive="#d8eaff" emissiveIntensity={0.32} metalness={0.78} roughness={0.14} />
              </mesh>
            ))}
            {Array.from({ length: panelCount - 1 }, (_, panelIndex) => {
              const z = -length / 2 + ((panelIndex + 1) * length) / panelCount;
              return (
                <mesh key={panelIndex} position={[0, 0.072, z]}>
                  <boxGeometry args={[width - 0.18, 0.05, 0.085]} />
                  <meshStandardMaterial color="#7895c4" emissive="#d9eaff" emissiveIntensity={0.36} metalness={0.78} roughness={0.14} />
                </mesh>
              );
            })}
          </group>
        );
      })}
      {[[-27, -7], [-23, 16], [23, 16], [27, -7], [-18, -23], [18, -23]].map(([x, z], index) => (
        <group key={`${x}-${z}`} position={[x, STARPATH_SURFACE_Y, z]} rotation={[0, index * 0.7, 0]}>
          <mesh position={[0, 1.45, 0]} scale={[0.72, 1.8, 0.72]}><octahedronGeometry args={[1, 0]} /><meshStandardMaterial color={index % 2 ? theme.secondaryAccent : theme.accent} emissive={index % 2 ? theme.secondaryAccent : theme.accent} emissiveIntensity={0.18} metalness={0.18} roughness={0.2} /></mesh>
          <mesh position={[0, 0.08, 0]}><cylinderGeometry args={[1.3, 1.55, 0.16, 20]} /><meshStandardMaterial color="#171d37" metalness={0.5} roughness={0.32} /></mesh>
        </group>
      ))}
    </group>
  );
}

export function StarpathEnvironment({ theme, quality }: { theme: StarpathLevelTheme; quality: StarpathQuality; districtInterior?: boolean }) {
  const panoramaOverlap = theme.panoramaOverlap ?? 0.42;
  const panoramaEdgeFade = theme.panoramaEdgeFade ?? 0.12;
  const panoramaY = theme.panoramaY ?? 24.7;
  const panoramaHeight = theme.panoramaHeight ?? 62;
  return (
    <>
      <Suspense fallback={null}>
        {theme.backBackground ? (
          theme.panoramaEdgeFade !== undefined ? (
            <>
              <WorldPanorama asset={theme.backBackground} radius={52} height={panoramaHeight} y={panoramaY} rotationY={theme.panoramaRotation} horizontalScale={0.86} skyBlendColor={theme.sky} thetaStart={-Math.PI / 2 - panoramaOverlap / 2} thetaLength={Math.PI + panoramaOverlap} backgroundLayer flipX crisp />
              <WorldPanorama asset={theme.background} radius={52} height={panoramaHeight} y={panoramaY} rotationY={theme.panoramaRotation} horizontalScale={0.86} skyBlendColor={theme.sky} thetaStart={Math.PI / 2 - panoramaOverlap / 2} thetaLength={Math.PI + panoramaOverlap} edgeFade={panoramaEdgeFade} backgroundLayer flipX crisp />
            </>
          ) : (
            <>
              <WorldPanorama asset={theme.background} radius={52} height={panoramaHeight} y={panoramaY} rotationY={theme.panoramaRotation} horizontalScale={0.86} skyBlendColor={theme.sky} thetaStart={Math.PI / 2 - panoramaOverlap / 2} thetaLength={Math.PI + panoramaOverlap} edgeFade={panoramaEdgeFade} backgroundLayer flipX crisp />
              <WorldPanorama asset={theme.backBackground} radius={52} height={panoramaHeight} y={panoramaY} rotationY={theme.panoramaRotation} horizontalScale={0.86} skyBlendColor={theme.sky} thetaStart={-Math.PI / 2 - panoramaOverlap / 2} thetaLength={Math.PI + panoramaOverlap} edgeFade={panoramaEdgeFade} backgroundLayer flipX crisp />
            </>
          )
        ) : <WorldPanorama asset={theme.background} radius={52} height={panoramaHeight} y={panoramaY} rotationY={theme.panoramaRotation} horizontalScale={0.86} skyBlendColor={theme.sky} flipX crisp />}
      </Suspense>
      <fog attach="fog" args={[theme.fog, 38, 76]} />
      <ambientLight color={theme.ambientLight} intensity={0.5} />
      <hemisphereLight args={[theme.sky, "#0b0d21", 0.62]} />
      <directionalLight position={[-12, 24, 10]} color={theme.keyLight} intensity={1.1} />
      <ObservatoryFloor theme={theme} />
      {quality === "high" ? <pointLight position={[0, 7, 2]} color={theme.accent} intensity={1.8} distance={30} /> : null}
    </>
  );
}
