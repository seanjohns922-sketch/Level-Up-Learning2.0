"use client";
// Friends in the same world, drawn in 3D: their own explorer in their own outfit, gliding to where they are
// (poses arrive a few times a second), walking when they walk, with their first name overhead.
import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { DEFAULT_OUTFIT } from "@/components/avatar/StudentAvatar";
import { ExplorerAvatarModel } from "@/components/world3d/SharedWorldPlayer";
import type { ExplorerPose, WorldMate } from "@/lib/world-together";
import { WORLD_AVATAR_SCALE, WORLD_AVATAR_SCALE_OFFSET } from "@/lib/world3d/world-scale";

const target = new THREE.Vector3();

function Mate({ mate, poses }: { mate: WorldMate; poses: React.RefObject<Map<string, ExplorerPose>> }) {
  const group = useRef<THREE.Group>(null);
  const moving = useRef(false);
  const placed = useRef(false);
  useFrame((_, delta) => {
    const pose = poses.current?.get(mate.id), node = group.current;
    if (!node) return;
    node.visible = Boolean(pose);
    if (!pose) return;
    if (!placed.current) { node.position.set(pose.x, pose.y, pose.z); node.rotation.y = pose.heading; placed.current = true; }
    const ease = 1 - Math.exp(-delta * 10);
    node.position.lerp(target.set(pose.x, pose.y, pose.z), ease);
    // Turn the short way round.
    const turn = Math.atan2(Math.sin(pose.heading - node.rotation.y), Math.cos(pose.heading - node.rotation.y));
    node.rotation.y += turn * ease;
    moving.current = pose.moving;
  });
  return (
    <group ref={group} visible={false}>
      <group scale={WORLD_AVATAR_SCALE} position={[0, WORLD_AVATAR_SCALE_OFFSET, 0]}>
        <ExplorerAvatarModel avatar={{ ...DEFAULT_OUTFIT, ...mate.outfit }} movingRef={moving} />
      </group>
      <Html position={[0, 2.9 * WORLD_AVATAR_SCALE + WORLD_AVATAR_SCALE_OFFSET, 0]} center zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
        <span style={{ fontFamily: "Montserrat, Inter, sans-serif", fontWeight: 900, fontSize: 13, color: "#fff", background: "rgba(20,14,40,.85)", padding: "3px 10px", borderRadius: 99, whiteSpace: "nowrap", letterSpacing: ".04em", border: "1.5px solid #C94DF2" }}>{mate.name}</span>
      </Html>
    </group>
  );
}

export function WorldMates({ mates, poses }: { mates: readonly WorldMate[]; poses: React.RefObject<Map<string, ExplorerPose>> }) {
  return <>{mates.map((mate) => <Mate key={mate.id} mate={mate} poses={poses} />)}</>;
}
