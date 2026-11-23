"use client";
// Riding a boat on any water in the hub: the kart's driving with this boat's speed, held to water deep
// enough to float in, bobbing and rolling into turns, a white wake behind, the explorer aboard and a
// chase camera.
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { TrialStudentAvatar, type WorldMoveInput } from "@/components/world3d/SharedWorldPlayer";
import { BOAT_SPECS, type BoatStyle } from "@/lib/world3d/boats";
import { newKart, stepKart, type KartWorld, type RaceCourse } from "@/lib/world3d/race-driving";
import { WORLD_AVATAR_SCALE, WORLD_AVATAR_SCALE_OFFSET } from "@/lib/world3d/world-scale";
import { BOAT_MODELS } from "./Boats";
import type { CarHud, CarPose } from "./CarDriver";
import { Puffs } from "./ItemKit";

const DRIVE_KEYS = { up: ["w", "arrowup"], down: ["s", "arrowdown"], left: ["a", "arrowleft"], right: ["d", "arrowright"] } as const;
/** No road on the water: every boat goes at its own speed everywhere it floats. */
const OPEN_WATER: RaceCourse = { track: new Set(), boosts: [], jumps: [], bridges: [], solids: [] };
/** Where the explorer sits in each boat (height and how far back), in the boat's own space. */
const SEAT: Record<BoatStyle, [number, number]> = { kayak: [-0.9, -0.1], tinny: [-0.45, -0.3], swan: [-0.15, -0.35], speedboat: [-0.4, -0.25] };
/** How far behind the stern the wake starts. */
const STERN: Record<BoatStyle, number> = { kayak: 1.6, tinny: 2.0, swan: 1.4, speedboat: 2.8 };

export function BoatRider({ start, style, waterAt, moveInput, hudRef, poseRef, night }: {
  start: CarPose;
  style: BoatStyle;
  /** The surface a boat floats on at a spot, or null where it can't go. */
  waterAt: (x: number, z: number) => number | null;
  moveInput: WorldMoveInput;
  hudRef: React.MutableRefObject<CarHud>;
  poseRef: React.MutableRefObject<CarPose>;
  night: boolean;
}) {
  const boatRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const wakeRef = useRef<THREE.Group>(null);
  const keys = useRef(new Set<string>());
  const boat = useRef(newKart(start.x, start.z, start.heading));
  const [startY] = useState(() => waterAt(start.x, start.z) ?? 0);
  const surface = useRef(startY);
  const still = useRef(false);
  const { camera } = useThree();
  const world = useRef<KartWorld>({ canDriveAt: () => true });
  useEffect(() => {
    world.current = { canDriveAt: (x, z) => waterAt(x, z) !== null, groundHeightAt: (x, z) => waterAt(x, z) ?? surface.current };
  }, [waterAt]);

  useEffect(() => {
    const down = (event: KeyboardEvent) => keys.current.add(event.key.toLowerCase());
    const up = (event: KeyboardEvent) => keys.current.delete(event.key.toLowerCase());
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    const fx = Math.sin(start.heading), fz = Math.cos(start.heading);
    camera.position.set(start.x - fx * 8, startY + 3.8, start.z - fz * 8);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, [camera, start, startY]);

  useFrame(({ camera: view, clock }, rawDelta) => {
    const delta = Math.min(rawDelta, 1 / 20);
    const held = (names: readonly string[]) => names.some((name) => keys.current.has(name));
    const throttle = THREE.MathUtils.clamp((held(DRIVE_KEYS.up) || moveInput.up ? 1 : 0) - (held(DRIVE_KEYS.down) || moveInput.down ? 1 : 0) + (moveInput.analogY ?? 0), -1, 1);
    const steer = THREE.MathUtils.clamp((held(DRIVE_KEYS.right) || moveInput.right ? 1 : 0) - (held(DRIVE_KEYS.left) || moveInput.left ? 1 : 0) + (moveInput.analogX ?? 0), -1, 1);
    boat.current = stepKart(boat.current, { throttle, steer }, OPEN_WATER, world.current, delta, BOAT_SPECS[style].handling);
    const now = boat.current;
    surface.current = now.y;
    hudRef.current.speed = Math.abs(now.speed);
    hudRef.current.offRoad = false;
    poseRef.current = { x: now.x, z: now.z, heading: now.heading };
    if (boatRef.current) {
      boatRef.current.position.set(now.x, now.y, now.z);
      boatRef.current.rotation.y = now.heading;
    }
    if (bodyRef.current) {
      // Bob on the water, roll into turns and lift the bow with speed.
      const pace = Math.min(1, Math.abs(now.speed) / BOAT_SPECS[style].handling.top);
      bodyRef.current.position.y = Math.sin(clock.elapsedTime * 1.8) * 0.05;
      bodyRef.current.rotation.z += (steer * pace * 0.08 - bodyRef.current.rotation.z) * Math.min(1, delta * 6);
      bodyRef.current.rotation.x = -pace * (style === "speedboat" ? 0.09 : 0.03) + Math.sin(clock.elapsedTime * 1.3) * 0.015;
    }
    if (wakeRef.current) wakeRef.current.visible = Math.abs(now.speed) > 1.5;
    const fx = Math.sin(now.heading), fz = Math.cos(now.heading);
    view.position.lerp(new THREE.Vector3(now.x - fx * 8, now.y + 3.8, now.z - fz * 8), 1 - Math.pow(0.002, delta));
    view.lookAt(now.x + fx * 4, now.y + 1, now.z + fz * 4);
  });

  const Model = BOAT_MODELS[style];
  const [seatY, seatZ] = SEAT[style];
  return (
    <group ref={boatRef} position={[start.x, startY, start.z]} rotation={[0, start.heading, 0]}>
      <group ref={bodyRef}>
        <Model night={night} />
        <group position={[0, seatY + 0.73, seatZ]}><group scale={WORLD_AVATAR_SCALE} position={[0, WORLD_AVATAR_SCALE_OFFSET, 0]}><TrialStudentAvatar movingRef={still} /></group></group>
      </group>
      <group ref={wakeRef} visible={false}>
        {[-0.5, 0.5].map((x) => <Puffs key={x} pos={[x, 0.05, -STERN[style]]} color="#ffffff" rise={0.35} size={0.38} rate={1.6} />)}
      </group>
    </group>
  );
}
