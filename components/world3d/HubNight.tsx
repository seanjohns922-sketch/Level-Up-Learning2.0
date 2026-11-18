"use client";

import { Sparkles } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { CentralWorldQuality } from "@/lib/world3d/central-world-config";
import { HUB_V2_BRIDGES, HUB_V2_PADS, HUB_V2_TREEHOUSE_ANCHORS, hubBridgeDeckY, hubGroundHeight } from "@/lib/world3d/central-world-v2";

/** The bigger hub's day / night switch, remembered on this device. */
export const HUB_NIGHT_STORAGE_KEY = "lul:hub:night:v1";

export function readHubNight() {
  try { return localStorage.getItem(HUB_NIGHT_STORAGE_KEY) === "1"; } catch { return false; }
}

export function writeHubNight(night: boolean) {
  try { localStorage.setItem(HUB_NIGHT_STORAGE_KEY, night ? "1" : "0"); } catch { /* A per-device preference; fine to lose. */ }
}

/** 0 at noon, 1 at midnight, easing between them over about two seconds. */
export function useNightAmount(night: boolean) {
  const amount = useRef(night ? 1 : 0);
  useFrame((_, delta) => {
    amount.current += ((night ? 1 : 0) - amount.current) * Math.min(1, delta * 1.6);
  });
  return amount;
}

const SKY = {
  background: [new THREE.Color("#69afe4"), new THREE.Color("#0b1430")],
  fog: [new THREE.Color("#a8af8d"), new THREE.Color("#0e1834")],
  hemiSky: [new THREE.Color("#d9efff"), new THREE.Color("#6f86c9")],
  hemiGround: [new THREE.Color("#38522f"), new THREE.Color("#142018")],
  sun: [new THREE.Color("#ffe1ad"), new THREE.Color("#b4c6ff")],
} as const;
const mix = (pair: readonly [THREE.Color, THREE.Color], a: number, out: THREE.Color) => out.lerpColors(pair[0], pair[1], a);
const lerp = (day: number, night: number, a: number) => day + (night - day) * a;

/** Sky colour, fog and lighting for the bigger hub: sun by day, moon by night. The sun follows the explorer so shadows work anywhere. */
export function HubSkyLights({ night, quality, avatarPosRef }: { night: boolean; quality: CentralWorldQuality; avatarPosRef: React.RefObject<{ x: number; z: number }> }) {
  const amount = useNightAmount(night);
  const background = useRef<THREE.Color>(null);
  const fog = useRef<THREE.Fog>(null);
  const hemi = useRef<THREE.HemisphereLight>(null);
  const ambient = useRef<THREE.AmbientLight>(null);
  const sun = useRef<THREE.DirectionalLight>(null);
  const fill = useRef<THREE.DirectionalLight>(null);

  useFrame(({ scene }) => {
    const a = amount.current;
    if (background.current) mix(SKY.background, a, background.current);
    if (fog.current) { mix(SKY.fog, a, fog.current.color); fog.current.near = lerp(170, 60, a); fog.current.far = lerp(520, 300, a); }
    scene.environmentIntensity = lerp(0.45, 0.06, a);
    if (hemi.current) { mix(SKY.hemiSky, a, hemi.current.color); mix(SKY.hemiGround, a, hemi.current.groundColor); hemi.current.intensity = lerp(0.7, 0.3, a); }
    if (ambient.current) ambient.current.intensity = lerp(0.18, 0.08, a);
    if (fill.current) fill.current.intensity = lerp(0.45, 0.12, a);
    const light = sun.current;
    if (!light) return;
    if (!light.target.parent) scene.add(light.target);
    mix(SKY.sun, a, light.color);
    light.intensity = lerp(1.85, 0.45, a);
    const { x, z } = avatarPosRef.current;
    light.position.set(x - 48, 70, z + 36);
    light.target.position.set(x, 0, z);
    light.target.updateMatrixWorld();
  });
  useEffect(() => {
    const light = sun.current;
    return () => { light?.target.removeFromParent(); };
  }, []);

  return (
    <>
      <color ref={background} attach="background" args={["#69afe4"]} />
      <fog ref={fog} attach="fog" args={["#a8af8d", 170, 520]} />
      <hemisphereLight ref={hemi} args={["#d9efff", "#38522f", 0.7]} />
      <ambientLight ref={ambient} intensity={0.18} color="#8fa6ff" />
      <directionalLight ref={sun} intensity={1.85} color="#ffe1ad" castShadow={quality !== "low"} shadow-mapSize={quality === "high" ? [2048, 2048] : [1024, 1024]} shadow-camera-near={1} shadow-camera-far={220} shadow-camera-left={-70} shadow-camera-right={70} shadow-camera-top={70} shadow-camera-bottom={-70} shadow-bias={-0.0004} shadow-normalBias={0.05} />
      <directionalLight ref={fill} position={[18, 16, -16]} intensity={0.45} color="#b9dcff" />
    </>
  );
}

const CAMP = HUB_V2_PADS.find((pad) => pad.key === "camp")!;
const [DOOR_X, , DOOR_Z] = HUB_V2_TREEHOUSE_ANCHORS.entrance;

/** Warm lights that only matter after dark: treehouse windows, bridge lanterns, the campfire and fireflies. */
export function HubNightGlow({ night, animate, avatarPosRef }: { night: boolean; animate: boolean; avatarPosRef: React.RefObject<{ x: number; z: number }> }) {
  const amount = useNightAmount(night);
  const lights = useRef<Array<THREE.PointLight | null>>([]);
  const flame = useRef<THREE.Group>(null);
  const fireflies = useRef<THREE.Group>(null);
  const glows = useMemo(() => [
    { position: [DOOR_X - 3, hubGroundHeight(DOOR_X, DOOR_Z) + 5, DOOR_Z] as [number, number, number], color: "#ffb347", intensity: 14, distance: 30 },
    ...HUB_V2_BRIDGES.map((bridge) => {
      const mid = (bridge.x0 + bridge.x1) / 2;
      return { position: [mid, hubBridgeDeckY(bridge, mid) + 2.4, bridge.z] as [number, number, number], color: "#ffc46b", intensity: 8, distance: 20 };
    }),
    { position: [CAMP.x, CAMP.y + 1.6, CAMP.z] as [number, number, number], color: "#ff8a2a", intensity: 18, distance: 26 },
  ], []);
  const campfire = glows.length - 1;

  useFrame(({ clock }) => {
    const a = amount.current;
    const t = clock.elapsedTime;
    lights.current.forEach((light, i) => {
      if (!light) return;
      const flicker = i === campfire && animate ? 0.85 + Math.sin(t * 11) * 0.08 + Math.sin(t * 17.3) * 0.07 : 1;
      light.intensity = glows[i].intensity * a * flicker;
      light.visible = a > 0.02;
    });
    if (flame.current) {
      flame.current.visible = a > 0.02;
      const flick = animate ? 1 + Math.sin(t * 13) * 0.12 : 1;
      flame.current.scale.set(a, a * flick, a);
    }
    if (fireflies.current) {
      fireflies.current.visible = a > 0.5;
      const { x, z } = avatarPosRef.current;
      fireflies.current.position.set(x, hubGroundHeight(x, z) + 1.6, z);
    }
  });

  return (
    <>
      {glows.map((glow, i) => (
        <pointLight key={i} ref={(light) => { lights.current[i] = light; }} position={glow.position} color={glow.color} intensity={0} distance={glow.distance} decay={1.4} visible={false} />
      ))}
      <group ref={flame} position={[CAMP.x, CAMP.y + 0.35, CAMP.z]} visible={false}>
        <mesh position={[0, 0.55, 0]}><coneGeometry args={[0.55, 1.4, 10]} /><meshBasicMaterial color="#ff8a2a" transparent opacity={0.9} toneMapped={false} /></mesh>
        <mesh position={[0, 0.5, 0]}><coneGeometry args={[0.32, 1, 10]} /><meshBasicMaterial color="#ffd36b" toneMapped={false} /></mesh>
      </group>
      {night ? (
        <group ref={fireflies} visible={false}>
          <Sparkles count={40} scale={[26, 4, 26]} size={5} speed={animate ? 0.35 : 0} color="#e9ff8a" opacity={0.9} noise={1.2} />
        </group>
      ) : null}
    </>
  );
}
