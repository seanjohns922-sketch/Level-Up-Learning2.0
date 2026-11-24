"use client";

import { Sparkles } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { createContext, useContext, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { lightPoolTexture } from "@/components/world3d/premium-items/ItemKit";
import { CENTRAL_WORLD_CONFIG, type CentralWorldQuality } from "@/lib/world3d/central-world-config";
import { HUB_V2_BRIDGES, HUB_V2_PADS, HUB_V2_TREEHOUSE_ANCHORS, hubBridgeDeckY, hubGroundHeight } from "@/lib/world3d/central-world-v2";

/** The bigger hub's day / night switch, remembered on this device. */
export const HUB_NIGHT_STORAGE_KEY = "lul:hub:night:v1";

export function readHubNight() {
  try { return localStorage.getItem(HUB_NIGHT_STORAGE_KEY) === "1"; } catch { return false; }
}

export function writeHubNight(night: boolean) {
  try { localStorage.setItem(HUB_NIGHT_STORAGE_KEY, night ? "1" : "0"); } catch { /* A per-device preference; fine to lose. */ }
}

/** Whether the hub is in night time, for models that light themselves up after dark. */
export const HubNightContext = createContext(false);
export const useHubNight = () => useContext(HubNightContext);

const WARM_WINDOW = new THREE.Color("#ffc76a");
const BLACK = 0x000000;
type DayLook = { emissive: number; intensity: number };
const scratch = { size: new THREE.Vector3(), scale: new THREE.Vector3(), quat: new THREE.Quaternion(), axis: new THREE.Vector3(), hsl: { h: 0, s: 0, l: 0 } };

/** A thin upright pane in blue-grey glass colours: a window. Flat panes facing up (water, rugs) are left alone. */
function isWindowPane(mesh: THREE.Mesh, material: THREE.MeshStandardMaterial) {
  material.color.getHSL(scratch.hsl);
  const { h, s, l } = scratch.hsl;
  if (h < 0.45 || h > 0.7 || s < 0.1 || l < 0.12 || l > 0.62) return false;
  const geometry = mesh.geometry;
  if (!geometry.boundingBox) geometry.computeBoundingBox();
  const box = geometry.boundingBox;
  if (!box) return false;
  const size = box.getSize(scratch.size).multiply(mesh.getWorldScale(scratch.scale));
  const dims = [size.x, size.y, size.z];
  const thin = dims.indexOf(Math.min(...dims));
  const [a, b] = dims.filter((_, i) => i !== thin);
  if (dims[thin] > 0.15 || dims[thin] > Math.min(a, b) * 0.25) return false;
  scratch.axis.set(thin === 0 ? 1 : 0, thin === 1 ? 1 : 0, thin === 2 ? 1 : 0).applyQuaternion(mesh.getWorldQuaternion(scratch.quat));
  return Math.abs(scratch.axis.y) < 0.6;
}

/** Most windows are lit, a few stay dark, the same ones every night. */
const lightsOn = (mesh: THREE.Mesh) => {
  const p = mesh.getWorldPosition(scratch.axis);
  return Math.abs(Math.sin(p.x * 12.9898 + p.y * 78.233 + p.z * 37.719) * 43758.5453) % 1 > 0.2;
};

/** Warm, small glowing parts (flames, bulbs, lantern glass) get a halo and a pool of light on the ground. */
const MAX_LAMPS = 4;
const isWarm = (colour: THREE.Color) => { colour.getHSL(scratch.hsl); return scratch.hsl.h < 0.17 || scratch.hsl.h > 0.95; };

function lampSpot(mesh: THREE.Mesh, root: THREE.Object3D, material: THREE.MeshStandardMaterial) {
  if (!isWarm(material.emissive)) return null;
  const geometry = mesh.geometry;
  if (!geometry.boundingSphere) geometry.computeBoundingSphere();
  const radius = (geometry.boundingSphere?.radius ?? 1) * mesh.getWorldScale(scratch.scale).x;
  if (radius > 0.6) return null;
  return root.worldToLocal(mesh.getWorldPosition(new THREE.Vector3()));
}

function halo(colour: THREE.Color, size: number, opacity: number) {
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: lightPoolTexture(), color: colour, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
  sprite.scale.setScalar(size);
  return sprite;
}

function pool(colour: THREE.Color, size: number) {
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(size, size), new THREE.MeshBasicMaterial({ map: lightPoolTexture(), color: colour, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
  mesh.rotation.x = -Math.PI / 2;
  return mesh;
}

function clearLamps(root: THREE.Object3D) {
  const lamps = root.userData.nightLamps as THREE.Object3D[] | undefined;
  lamps?.forEach((lamp) => {
    lamp.removeFromParent();
    const mesh = lamp as THREE.Mesh;
    mesh.geometry?.dispose();
    (mesh.material as THREE.Material | undefined)?.dispose();
  });
  root.userData.nightLamps = [];
}

function lightUp(root: THREE.Object3D, night: boolean) {
  // By day there is nothing to undo unless night time has been on.
  if (!night && !root.userData.litAtNight) return;
  root.userData.litAtNight = night;
  clearLamps(root);
  const spots: Array<{ at: THREE.Vector3; colour: THREE.Color }> = [];
  root.traverse((object) => {
    const mesh = object as THREE.Mesh;
    if (!mesh.isMesh || object.userData.nightLamp) return;
    for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) {
      if (!(material instanceof THREE.MeshStandardMaterial)) continue;
      const day = (material.userData.dayLook ??= { emissive: material.emissive.getHex(), intensity: material.emissiveIntensity }) as DayLook;
      if (!night) { material.emissive.setHex(day.emissive); material.emissiveIntensity = day.intensity; continue; }
      if (day.emissive !== BLACK) {
        material.emissiveIntensity = Math.min(3, Math.max(1.1, day.intensity * 2.5));
        const at = lampSpot(mesh, root, material);
        if (at && !spots.some((spot) => spot.at.distanceTo(at) < 0.8)) spots.push({ at, colour: material.emissive.clone() });
      } else if (isWindowPane(mesh, material) && lightsOn(mesh)) { material.emissive.copy(WARM_WINDOW); material.emissiveIntensity = 0.95; }
    }
  });
  if (!night || !spots.length) return;
  // Sizes are in metres, whatever the model's own scale.
  const unit = 1 / Math.max(0.001, root.getWorldScale(scratch.scale).x);
  const lamps = spots.slice(0, MAX_LAMPS).flatMap(({ at, colour }) => {
    const glow = halo(colour, 1.6 * unit, 0.55);
    glow.position.copy(at);
    const ground = pool(colour, Math.min(9, 3 + at.y * 1.6) * unit);
    ground.position.set(at.x, 0.04 * unit, at.z);
    return [glow, ground];
  });
  lamps.forEach((lamp) => { lamp.userData.nightLamp = true; lamp.raycast = () => undefined; root.add(lamp); });
  root.userData.nightLamps = lamps;
}

/**
 * Lights up older models after dark without touching each one: whatever already glows a little glows brightly,
 * and window panes turn warm. (Newer models take `night` themselves and must not be wrapped.)
 */
export function NightLit({ children, enabled = true }: { children: React.ReactNode; enabled?: boolean }) {
  const night = useHubNight() && enabled;
  const group = useRef<THREE.Group>(null);
  useEffect(() => {
    const root = group.current;
    if (!root) return;
    lightUp(root, night);
    // Models that load or bake a moment later.
    const again = [1_500, 5_000].map((ms) => window.setTimeout(() => lightUp(root, night), ms));
    return () => { again.forEach(window.clearTimeout); clearLamps(root); };
  }, [night]);
  return <group ref={group}>{children}</group>;
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

const [TOWER_X, , TOWER_Z] = CENTRAL_WORLD_CONFIG.towerPosition;
/** Floodlights in the plaza wash the Tower of Knowledge from both front corners. */
const TOWER_FLOODS = [-1, 1].map((side) => ({ from: [TOWER_X + side * 22, 1, TOWER_Z + 26] as [number, number, number], to: [TOWER_X + side * 2, 24, TOWER_Z] as [number, number, number] }));
const CAMP = HUB_V2_PADS.find((pad) => pad.key === "camp")!;
const [DOOR_X, , DOOR_Z] = HUB_V2_TREEHOUSE_ANCHORS.entrance;

/** Warm lights that only matter after dark: treehouse windows, bridge lanterns, the campfire and fireflies. */
export function HubNightGlow({ night, animate, avatarPosRef }: { night: boolean; animate: boolean; avatarPosRef: React.RefObject<{ x: number; z: number }> }) {
  const amount = useNightAmount(night);
  const lights = useRef<Array<THREE.PointLight | null>>([]);
  const floods = useRef<Array<THREE.SpotLight | null>>([]);
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
    floods.current.forEach((flood) => {
      if (!flood) return;
      flood.intensity = 900 * a;
      flood.visible = a > 0.02;
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
      {TOWER_FLOODS.map((flood, i) => (
        <spotLight key={`flood${i}`} ref={(light) => { floods.current[i] = light; if (light) { light.target.position.set(...flood.to); light.target.updateMatrixWorld(); } }} position={flood.from} color="#ffe2b0" intensity={0} distance={90} angle={0.42} penumbra={0.7} decay={1.2} visible={false} />
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
