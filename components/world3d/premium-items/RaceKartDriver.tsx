"use client";
// Driving a kart round the learner's own Race Kit track: a short countdown, then throttle and steering
// from the keyboard or the move joystick, a chase camera, and lap times through the start line.
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { TrialStudentAvatar, type WorldMoveInput } from "@/components/world3d/SharedWorldPlayer";
import { WORLD_AVATAR_SCALE } from "@/lib/world3d/world-scale";
import {
  newKart, newLaps, raceGridPosition, stepKart, updateLaps,
  type KartWorld, type LapState, type RaceCourse, type RaceStart,
} from "@/lib/world3d/race-driving";
import type { KartParts, KartStyle } from "@/lib/world3d/kart-garage";
import { RealmKart } from "./RealmKart";

/** Kart model units to world metres: about three metres long. */
const KART_SCALE = 3.2;
/** Where the explorer sits, in world metres above the kart's base. */
const SEAT_HEIGHT = 1.22;
export const RACE_COUNTDOWN_SECONDS = 3;
const BASE_FOV = 60, BOOST_FOV = 74;

/** What the race HUD shows, written every frame by the driver and read by the HUD. */
export type RaceHud = { countdown: number; lap: number; lapTime: number; lastLap: number | null; bestLap: number | null; speed: number; boosting: boolean };
export const newRaceHud = (bestLap: number | null): RaceHud => ({ countdown: RACE_COUNTDOWN_SECONDS, lap: 1, lapTime: 0, lastLap: null, bestLap, speed: 0, boosting: false });

const DRIVE_KEYS = { up: ["w", "arrowup"], down: ["s", "arrowdown"], left: ["a", "arrowleft"], right: ["d", "arrowright"] } as const;

export function RaceKartDriver({ course, start, world, moveInput, hud, kart: { style, parts }, paused = false, night = false, onBestLap }: {
  course: RaceCourse;
  start: RaceStart;
  world: KartWorld;
  moveInput: WorldMoveInput;
  hud: React.MutableRefObject<RaceHud>;
  kart: { style: KartStyle; parts: KartParts };
  /** While the garage is open the kart and clock stand still. */
  paused?: boolean;
  night?: boolean;
  onBestLap: (seconds: number) => void;
}) {
  const kartRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const keys = useRef(new Set<string>());
  // The explorer sits still in the seat.
  const seated = useRef(false);
  const { camera } = useThree();
  const grid = raceGridPosition(start);
  const kart = useRef(newKart(grid.x, grid.z, grid.heading));
  const laps = useRef<LapState>(newLaps(0, hud.current.bestLap));
  const clock = useRef(-RACE_COUNTDOWN_SECONDS);

  useEffect(() => {
    const down = (event: KeyboardEvent) => keys.current.add(event.key.toLowerCase());
    const up = (event: KeyboardEvent) => keys.current.delete(event.key.toLowerCase());
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    const lens = camera as THREE.PerspectiveCamera;
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      if (lens.isPerspectiveCamera) { lens.fov = BASE_FOV; lens.updateProjectionMatrix(); }
    };
  }, [camera]);

  useFrame(({ camera: view }, rawDelta) => {
    if (paused) return;
    const delta = Math.min(rawDelta, 1 / 20);
    const held = (names: readonly string[]) => names.some((name) => keys.current.has(name));
    const throttle = THREE.MathUtils.clamp((held(DRIVE_KEYS.up) || moveInput.up ? 1 : 0) - (held(DRIVE_KEYS.down) || moveInput.down ? 1 : 0) + (moveInput.analogY ?? 0), -1, 1);
    const steer = THREE.MathUtils.clamp((held(DRIVE_KEYS.right) || moveInput.right ? 1 : 0) - (held(DRIVE_KEYS.left) || moveInput.left ? 1 : 0) + (moveInput.analogX ?? 0), -1, 1);

    clock.current += delta;
    const racing = clock.current >= 0;
    const before = kart.current;
    kart.current = stepKart(before, racing ? { throttle, steer } : { throttle: 0, steer: 0 }, course, world, delta);
    const now = kart.current;
    if (racing) {
      const next = updateLaps(laps.current, start, before, now, clock.current);
      if (next.bestLap !== null && next.bestLap !== laps.current.bestLap) onBestLap(next.bestLap);
      laps.current = next;
    }
    const lap = laps.current;
    Object.assign(hud.current, {
      countdown: Math.max(0, -clock.current),
      lap: lap.laps + 1,
      lapTime: racing ? clock.current - lap.lapStartedAt : 0,
      lastLap: lap.lastLap,
      bestLap: lap.bestLap,
      speed: Math.abs(now.speed),
      boosting: now.boost > 0,
    } satisfies RaceHud);

    const group = kartRef.current;
    if (group) {
      group.position.set(now.x, now.y, now.z);
      group.rotation.y = now.heading;
    }
    if (bodyRef.current) {
      // Nose up on take-off, down on landing; lean into turns.
      const pitch = now.airborne ? THREE.MathUtils.clamp(-now.vy * 0.04, -0.35, 0.35) : 0;
      const roll = steer * Math.min(1, Math.abs(now.speed) / 12) * 0.08;
      bodyRef.current.rotation.x += (pitch - bodyRef.current.rotation.x) * Math.min(1, delta * 10);
      bodyRef.current.rotation.z += (roll - bodyRef.current.rotation.z) * Math.min(1, delta * 8);
    }

    // Chase camera: behind and above, looking a little ahead.
    const fx = Math.sin(now.heading), fz = Math.cos(now.heading);
    const desired = new THREE.Vector3(now.x - fx * 9, now.y + 4.4, now.z - fz * 9);
    view.position.lerp(desired, 1 - Math.pow(0.002, delta));
    view.lookAt(now.x + fx * 4, now.y + 1.2, now.z + fz * 4);
    const lens = view as THREE.PerspectiveCamera;
    if (lens.isPerspectiveCamera) {
      const fov = now.boost > 0 ? BOOST_FOV : BASE_FOV;
      if (Math.abs(lens.fov - fov) > 0.05) { lens.fov += (fov - lens.fov) * Math.min(1, delta * 6); lens.updateProjectionMatrix(); }
    }
  });

  return (
    <group ref={kartRef} position={[grid.x, 0, grid.z]} rotation={[0, grid.heading, 0]}>
      <group ref={bodyRef}>
        <group scale={KART_SCALE}><RealmKart realm={style} parts={parts} night={night} driver={false} /></group>
        <group position={[0, SEAT_HEIGHT, -0.15]} scale={WORLD_AVATAR_SCALE * 0.92}><TrialStudentAvatar movingRef={seated} /></group>
      </group>
    </group>
  );
}
