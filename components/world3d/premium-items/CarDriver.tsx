"use client";
// Driving your own car anywhere in the hub: the kart's driving with this car's handling (fast on
// roads, its own speed on grass), a chase camera, dust off-road, and the 4WD bouncing over bumps.
import { useFrame, useThree } from "@react-three/fiber";
import { Car as CarIcon, Lightbulb, Megaphone, Palette, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import type { WorldMoveInput } from "@/components/world3d/SharedWorldPlayer";
import { CAR_SPECS, type CarStyle } from "@/lib/world3d/cars";
import { newKart, onTrack, stepKart, type KartWorld, type RaceCourse } from "@/lib/world3d/race-driving";
import { Puffs } from "./ItemKit";
import { Car } from "./RoadsAndCars";

/** What the car HUD shows, written every frame by the driver. */
export type CarHud = { speed: number; offRoad: boolean };
/** Where the car is, so stepping out puts the explorer beside it. */
export type CarPose = { x: number; z: number; heading: number };

const DRIVE_KEYS = { up: ["w", "arrowup"], down: ["s", "arrowdown"], left: ["a", "arrowleft"], right: ["d", "arrowright"] } as const;

export function CarDriver({ start, style, colour, course, world, moveInput, hudRef, poseRef, night, lights }: {
  start: CarPose;
  style: CarStyle;
  colour: string;
  course: RaceCourse;
  world: KartWorld;
  moveInput: WorldMoveInput;
  hudRef: React.MutableRefObject<CarHud>;
  poseRef: React.MutableRefObject<CarPose>;
  night: boolean;
  lights: boolean;
}) {
  const carRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const dustRef = useRef<THREE.Group>(null);
  const keys = useRef(new Set<string>());
  const car = useRef(newKart(start.x, start.z, start.heading));
  const { camera } = useThree();

  useEffect(() => {
    const down = (event: KeyboardEvent) => keys.current.add(event.key.toLowerCase());
    const up = (event: KeyboardEvent) => keys.current.delete(event.key.toLowerCase());
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    // Start the chase camera behind the car rather than sweeping in from wherever it was.
    const fx = Math.sin(start.heading), fz = Math.cos(start.heading);
    camera.position.set(start.x - fx * 9, 4.4, start.z - fz * 9);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, [camera, start]);

  useFrame(({ camera: view, clock }, rawDelta) => {
    const delta = Math.min(rawDelta, 1 / 20);
    const held = (names: readonly string[]) => names.some((name) => keys.current.has(name));
    const throttle = THREE.MathUtils.clamp((held(DRIVE_KEYS.up) || moveInput.up ? 1 : 0) - (held(DRIVE_KEYS.down) || moveInput.down ? 1 : 0) + (moveInput.analogY ?? 0), -1, 1);
    const steer = THREE.MathUtils.clamp((held(DRIVE_KEYS.right) || moveInput.right ? 1 : 0) - (held(DRIVE_KEYS.left) || moveInput.left ? 1 : 0) + (moveInput.analogX ?? 0), -1, 1);
    car.current = stepKart(car.current, { throttle, steer }, course, world, delta, CAR_SPECS[style].handling);
    const now = car.current;
    const offRoad = !onTrack(course, now.x, now.z);
    hudRef.current.speed = Math.abs(now.speed);
    hudRef.current.offRoad = offRoad;
    poseRef.current = { x: now.x, z: now.z, heading: now.heading };

    if (carRef.current) {
      carRef.current.position.set(now.x, now.y, now.z);
      carRef.current.rotation.y = now.heading;
    }
    if (bodyRef.current) {
      // Lean into turns; bounce over the bumps off-road (the 4WD's suspension soaks most of it up).
      const roll = steer * Math.min(1, Math.abs(now.speed) / 12) * 0.06;
      const bumps = offRoad ? Math.min(1, Math.abs(now.speed) / 6) * (style === "four_wd" ? 0.05 : 0.025) : 0;
      bodyRef.current.rotation.z += (roll - bodyRef.current.rotation.z) * Math.min(1, delta * 8);
      bodyRef.current.position.y = Math.abs(Math.sin(clock.elapsedTime * 14)) * bumps;
    }
    if (dustRef.current) dustRef.current.visible = offRoad && Math.abs(now.speed) > 3;

    // Chase camera: behind and above, looking a little ahead.
    const fx = Math.sin(now.heading), fz = Math.cos(now.heading);
    view.position.lerp(new THREE.Vector3(now.x - fx * 9, now.y + 4.4, now.z - fz * 9), 1 - Math.pow(0.002, delta));
    view.lookAt(now.x + fx * 4, now.y + 1.2, now.z + fz * 4);
  });

  return (
    <group ref={carRef} position={[start.x, 0, start.z]} rotation={[0, start.heading, 0]}>
      {/* The car models face +x; driving faces +z. */}
      <group ref={bodyRef}><group rotation={[0, -Math.PI / 2, 0]}><Car style={style} colour={colour} night={night || lights} /></group></group>
      <group ref={dustRef} visible={false}>
        {[-0.8, 0.8].map((x) => <Puffs key={x} pos={[x, 0.1, -2.1]} color="#c8b48a" rise={0.6} size={0.32} rate={1.4} />)}
      </group>
    </group>
  );
}

const panel: React.CSSProperties = { background: "rgba(18,22,30,.88)", border: "1px solid rgba(255,255,255,.18)", borderRadius: 14, color: "#fff", boxShadow: "0 10px 28px rgba(0,0,0,.32)" };
const button: React.CSSProperties = { ...panel, display: "inline-flex", alignItems: "center", gap: 7, minHeight: 48, padding: "0 15px", fontWeight: 850, fontSize: 14, cursor: "pointer", pointerEvents: "auto" };

/** Driving controls: speed, Horn, Lights, Colour, swap car, and EXIT CAR. */
export function CarHudPanel({ hud, name, lights, canSwap, onHorn, onLights, onColour, onSwap, onExit }: {
  hud: React.MutableRefObject<CarHud>;
  name: string;
  lights: boolean;
  canSwap: boolean;
  onHorn: () => void;
  onLights: () => void;
  onColour: () => void;
  onSwap: () => void;
  onExit: () => void;
}) {
  const [view, setView] = useState<CarHud>(() => ({ ...hud.current }));
  useEffect(() => {
    let frame = 0, last = 0;
    const tick = (time: number) => {
      frame = requestAnimationFrame(tick);
      if (time - last < 100) return;
      last = time;
      setView({ ...hud.current });
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [hud]);
  return (
    <section aria-label={`Driving the ${name}`} className="carHud" style={{ position: "absolute", inset: 0, zIndex: 40, pointerEvents: "none", fontFamily: "var(--font-display, system-ui)" }}>
      <div className="carHudTitle" style={{ ...panel, position: "absolute", top: "max(74px, calc(env(safe-area-inset-top) + 62px))", left: 0, right: 0, marginInline: "auto", width: "fit-content", padding: "9px 16px", fontWeight: 850, fontSize: 15, border: `2px solid ${view.offRoad ? "#d9b46a" : "#4ade80"}` }}>
        {name} · {view.offRoad ? "off-road" : "on the road"}
      </div>
      <div className="carHudSpeed" style={{ ...panel, position: "absolute", left: 0, right: 0, bottom: "max(28px, calc(env(safe-area-inset-bottom) + 22px))", marginInline: "auto", width: "fit-content", padding: "8px 18px", fontWeight: 950, fontSize: 28, fontVariantNumeric: "tabular-nums" }}>
        {Math.round(view.speed * 3.6)} <span style={{ fontSize: 13, opacity: 0.7 }}>km/h</span>
      </div>
      <div className="carHudButtons" style={{ position: "absolute", right: "max(24px, calc(env(safe-area-inset-right) + 18px))", bottom: "max(178px, calc(env(safe-area-inset-bottom) + 172px))", display: "grid", gap: 8, justifyItems: "end" }}>
        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" style={button} onClick={onHorn} aria-label="Beep the horn"><Megaphone size={18} aria-hidden="true" />Horn</button>
          <button type="button" style={{ ...button, background: lights ? "#ffcc33" : panel.background, color: lights ? "#3a2a00" : "#fff" }} onClick={onLights} aria-pressed={lights}><Lightbulb size={18} aria-hidden="true" />Lights</button>
          <button type="button" style={button} onClick={onColour} aria-label="Change the paint colour"><Palette size={18} aria-hidden="true" />Colour</button>
          {canSwap ? <button type="button" style={button} onClick={onSwap} aria-label="Swap to another car"><CarIcon size={18} aria-hidden="true" />Car</button> : null}
        </div>
        <button type="button" style={{ ...button, minHeight: 56, padding: "0 26px", fontSize: 18, background: "#e5484d", border: 0 }} onClick={onExit}><X size={20} aria-hidden="true" />EXIT CAR</button>
      </div>
      <style>{`@media (max-width:700px){.carHudButtons{left:16px;right:16px!important;justify-items:stretch!important;bottom:max(170px,calc(env(safe-area-inset-bottom) + 164px))!important}.carHudButtons>div{justify-content:space-between}.carHudButtons button{padding:0 10px!important;font-size:12px!important}}`}</style>
    </section>
  );
}
