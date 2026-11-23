"use client";
// Rex in the hub: a real T-rex model ("Randaling T-Rex, animated!" by quander, CC BY 4.0; see /credits)
// with run, roar, bite and idle. Chasing, he runs at the explorer and stops a few metres short to roar;
// he never catches anyone. While they answer he roars on the spot; tamed, he walks along beside them.
import { useAnimations, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { clone as cloneSkinned } from "three/examples/jsm/utils/SkeletonUtils.js";
import type { RexPhase } from "@/lib/rex-client";

export const REX_MODEL_URL = "/models/creatures/trex.glb";
/** Chasing, he stops this far short of the explorer to roar. Tamed, he keeps this far to their side. */
const ROAR_DISTANCE = 8, FOLLOW_SIDE = 9;
/** Metres a second: slower than a sprinting explorer, so running away works. Tamed he walks faster to keep up. */
const CHASE_SPEED = 5.4, FOLLOW_SPEED = 4.2;
/** He appears this far ahead of the explorer, in view of the camera. */
const SPAWN_DISTANCE = 30;

type Clip = "run" | "roar" | "idle" | "bite";

export function RexDinosaur({ phase, avatarPosRef, aimRef, groundAt }: { phase: Exclude<RexPhase, "away">; avatarPosRef: React.MutableRefObject<{ x: number; z: number }>; /** The way the camera looks (a heading), so he appears ahead in view. */ aimRef: React.MutableRefObject<number>; groundAt?: (x: number, z: number) => number }) {
  const group = useRef<THREE.Group>(null);
  const { scene: source, animations } = useGLTF(REX_MODEL_URL);
  const scene = useMemo(() => {
    const copy = cloneSkinned(source);
    copy.traverse((object) => { if ((object as THREE.Mesh).isMesh) { object.castShadow = true; object.receiveShadow = true; } });
    return copy;
  }, [source]);
  const { actions } = useAnimations(animations, group);
  // The mixer's actions, held in a ref so the frame loop can change their speed.
  const actionsRef = useRef<typeof actions>({});
  useEffect(() => { actionsRef.current = actions; return () => { Object.values(actions).forEach((action) => action?.stop()); }; }, [actions]);
  const playing = useRef<Clip | null>(null);
  const placed = useRef(false);

  const play = (clip: Clip, speed = 1) => {
    const next = actionsRef.current[clip];
    if (!next) return;
    next.timeScale = speed;
    if (playing.current === clip) return;
    const previous = playing.current ? actionsRef.current[playing.current] : null;
    next.reset().fadeIn(0.3).play();
    previous?.fadeOut(0.3);
    playing.current = clip;
  };

  useFrame((_, rawDelta) => {
    const rex = group.current;
    if (!rex) return;
    const delta = Math.min(rawDelta, 0.05), me = avatarPosRef.current;
    if (!placed.current) {
      // Ahead of the explorer, a little to one side, so he comes running into view.
      const heading = aimRef.current + 0.35;
      rex.position.set(me.x + Math.sin(heading) * SPAWN_DISTANCE, 0, me.z + Math.cos(heading) * SPAWN_DISTANCE);
      placed.current = true;
    }
    // Chasing he runs at the explorer; tamed he walks to a spot beside them, in view of the camera.
    const side = aimRef.current + Math.PI / 2;
    const goalX = phase === "tamed" ? me.x + Math.sin(side) * FOLLOW_SIDE + Math.sin(aimRef.current) * 3 : me.x;
    const goalZ = phase === "tamed" ? me.z + Math.cos(side) * FOLLOW_SIDE + Math.cos(aimRef.current) * 3 : me.z;
    const dx = goalX - rex.position.x, dz = goalZ - rex.position.z, distance = Math.hypot(dx, dz);
    const stopAt = phase === "tamed" ? 1.5 : ROAR_DISTANCE;
    const speed = phase === "chasing" ? CHASE_SPEED : phase === "tamed" ? FOLLOW_SPEED : 0;
    const moving = speed > 0 && distance > stopAt;
    // Face where he's going, or the explorer when he stops.
    const lookX = moving ? dx : me.x - rex.position.x, lookZ = moving ? dz : me.z - rex.position.z;
    if (Math.hypot(lookX, lookZ) > 0.01) {
      const target = Math.atan2(lookX, lookZ);
      const turn = Math.atan2(Math.sin(target - rex.rotation.y), Math.cos(target - rex.rotation.y));
      rex.rotation.y += turn * Math.min(1, delta * 4);
    }
    if (moving) {
      const step = Math.min(distance - stopAt, speed * delta);
      rex.position.x += (dx / distance) * step;
      rex.position.z += (dz / distance) * step;
      play("run", phase === "tamed" ? 0.55 : 1);
    } else {
      play(phase === "tamed" ? "idle" : "roar");
    }
    rex.position.y = groundAt ? Math.max(groundAt(rex.position.x, rex.position.z), -0.6) : 0;
  });

  return <group ref={group}><primitive object={scene} /></group>;
}
