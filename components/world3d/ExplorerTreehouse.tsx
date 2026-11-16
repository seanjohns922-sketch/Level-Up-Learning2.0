"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { canvasTexture, disposeGeometries, ghostGumBarkTexture, mergeByMaterial } from "@/components/world3d/three-build-utils";

// The Explorer Treehouse: three round pods climbing a ghost gum, a spiral stair,
// a rope bridge to a flag lookout and the glowing Gem Cave door in the roots.
// Built once from simple shapes and merged by material, so it draws in a
// handful of calls. Local +x is the front: the stair foot and front door.

const GLOW_NAME = "treehouse-glow";

function createMaterials() {
  const bark = ghostGumBarkTexture([3, 2]);
  const planks = canvasTexture(256, 256, (g, w, h) => {
    g.fillStyle = "#a8693a"; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 6; i++) {
      const x = (i * w) / 6;
      g.globalAlpha = 0.35; g.fillStyle = i % 2 ? "#c4844c" : "#a8693a"; g.fillRect(x, 0, w / 6, h);
      g.globalAlpha = 1; g.fillStyle = "#5b3417"; g.fillRect(x, 0, 2, h);
    }
  }, { repeat: [6, 1] });
  return {
    textures: [bark, planks],
    bark: new THREE.MeshStandardMaterial({ map: bark, roughness: 0.75 }),
    walls: new THREE.MeshStandardMaterial({ map: planks, roughness: 0.7, side: THREE.DoubleSide }),
    deck: new THREE.MeshStandardMaterial({ color: "#6b3d1d", roughness: 0.8 }),
    rail: new THREE.MeshStandardMaterial({ color: "#8a5530", roughness: 0.8 }),
    step: new THREE.MeshStandardMaterial({ color: "#9b6a3a", roughness: 0.8 }),
    frame: new THREE.MeshStandardMaterial({ color: "#4a2a12", roughness: 0.8 }),
    glow: Object.assign(new THREE.MeshStandardMaterial({ color: "#fff0c0", emissive: "#ffb347", emissiveIntensity: 1.3 }), { name: GLOW_NAME }),
    cave: new THREE.MeshStandardMaterial({ color: "#6a5a86", roughness: 0.9, flatShading: true }),
    caveDoor: new THREE.MeshStandardMaterial({ color: "#c94df2", emissive: "#a63bd6", emissiveIntensity: 0.9 }),
    flag: new THREE.MeshStandardMaterial({ color: "#c94df2", roughness: 0.6, side: THREE.DoubleSide }),
    leaves: ["#7c9a52", "#8aa95e", "#6c8a47"].map((color) => new THREE.MeshStandardMaterial({ color, roughness: 0.75, flatShading: true })),
    roofs: ["#2f7fb8", "#c94df2", "#f5c04a"].map((color) => new THREE.MeshStandardMaterial({ color, roughness: 0.55 })),
  };
}
type TreehouseMaterials = ReturnType<typeof createMaterials>;

function mesh(geometry: THREE.BufferGeometry, material: THREE.Material, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(geometry, material);
  m.position.set(x, y, z);
  return m;
}

function buildPod(group: THREE.Group, m: TreehouseMaterials, y: number, r: number, h: number, roof: THREE.Material, doorAngle?: number) {
  group.add(mesh(new THREE.CylinderGeometry(r, r, h, 28, 1, true), m.walls, 0, y + h / 2, 0));
  group.add(mesh(new THREE.CylinderGeometry(r + 0.9, r + 0.9, 0.3, 32), m.deck, 0, y - 0.1, 0));
  group.add(mesh(new THREE.ConeGeometry(r + 0.7, h * 0.95, 28), roof, 0, y + h + h * 0.47, 0));
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 + 0.6;
    if (doorAngle !== undefined && Math.abs(Math.atan2(Math.sin(a - doorAngle), Math.cos(a - doorAngle))) < 0.5) continue;
    const window = mesh(new THREE.CircleGeometry(0.46, 16), m.glow, Math.cos(a) * (r + 0.02), y + h * 0.55, Math.sin(a) * (r + 0.02));
    window.lookAt(Math.cos(a) * (r + 5), y + h * 0.55, Math.sin(a) * (r + 5));
    group.add(window);
    const ring = mesh(new THREE.TorusGeometry(0.5, 0.06, 6, 20), m.frame, window.position.x, window.position.y, window.position.z);
    ring.quaternion.copy(window.quaternion);
    group.add(ring);
  }
  if (doorAngle !== undefined) {
    const door = mesh(new THREE.PlaneGeometry(1.3, 2.1), m.glow, Math.cos(doorAngle) * (r + 0.03), y + 1.05, Math.sin(doorAngle) * (r + 0.03));
    door.lookAt(Math.cos(doorAngle) * (r + 5), y + 1.05, Math.sin(doorAngle) * (r + 5));
    group.add(door);
  }
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2;
    group.add(mesh(new THREE.BoxGeometry(0.1, 0.7, 0.1), m.rail, Math.cos(a) * (r + 0.75), y + 0.4, Math.sin(a) * (r + 0.75)));
  }
  const rail = mesh(new THREE.TorusGeometry(r + 0.75, 0.05, 6, 40), m.rail, 0, y + 0.75, 0);
  rail.rotation.x = Math.PI / 2;
  group.add(rail);
}

function buildTreehouse(m: TreehouseMaterials) {
  const g = new THREE.Group();
  // Ghost gum trunk, branches and canopy.
  g.add(mesh(new THREE.CylinderGeometry(1.6, 2.6, 19.5, 20), m.bark, 0, 9.75, 0));
  ([[-2.6, 18, -0.2, 6, -0.75], [2.6, 17.6, 0.3, 6, 0.8], [0, 19.6, -1.4, 5, 0.2]] as const).forEach(([x, y, z, length, tilt]) => {
    const branch = mesh(new THREE.CylinderGeometry(0.5, 0.9, length, 12), m.bark, x, y, z);
    branch.rotation.z = tilt;
    g.add(branch);
  });
  ([[0, 23.5, 0, 6.2], [-6.4, 20.5, 0.8, 4.8], [6.4, 20.5, -0.8, 4.9], [-2.2, 25, -3.8, 4.4], [3, 24.4, 3, 4.4], [-4.5, 22.2, -3.8, 4], [5.2, 22.2, 3.8, 4]] as const)
    .forEach(([x, y, z, r], i) => g.add(mesh(new THREE.IcosahedronGeometry(r, 1), m.leaves[i % 3], x, y, z)));
  // Three pods; the lowest has the front door facing +x.
  buildPod(g, m, 4.5, 3.3, 2.7, m.roofs[0], 0);
  buildPod(g, m, 9.4, 2.55, 2.25, m.roofs[1]);
  buildPod(g, m, 13.5, 1.9, 1.8, m.roofs[2]);
  // Spiral stair from the ground at the front up to the first deck.
  for (let i = 0; i < 20; i++) {
    const a = i * 0.31, y = 0.2 + i * 0.21;
    const tread = mesh(new THREE.BoxGeometry(1.35, 0.16, 0.6), m.step, Math.cos(a) * 4.9, y, Math.sin(a) * 4.9);
    tread.rotation.y = -a;
    g.add(tread);
  }
  // Rope bridge to a flag lookout.
  const lookout = new THREE.Vector3(10, 0, -5);
  g.add(mesh(new THREE.CylinderGeometry(0.26, 0.34, 6.8, 8), m.bark, lookout.x, 3.4, lookout.z));
  g.add(mesh(new THREE.CylinderGeometry(1.5, 1.5, 0.26, 20), m.deck, lookout.x, 6.8, lookout.z));
  g.add(mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.4, 6), m.frame, lookout.x, 8, lookout.z));
  g.add(mesh(new THREE.PlaneGeometry(1.05, 0.7), m.flag, lookout.x + 0.53, 8.9, lookout.z));
  const from = new THREE.Vector3(3.8, 6.8, -2), to = new THREE.Vector3(lookout.x - 1.2, 6.8, lookout.z + 0.6);
  for (let i = 0; i < 12; i++) {
    const p = new THREE.Vector3().lerpVectors(from, to, i / 11);
    p.y -= Math.sin((i / 11) * Math.PI) * 0.7;
    const plank = mesh(new THREE.BoxGeometry(0.38, 0.08, 0.95), m.step, p.x, p.y, p.z);
    plank.lookAt(to.x, p.y, to.z);
    g.add(plank);
  }
  // Gem Cave door in the roots, and lanterns along the welcome path.
  const cave = mesh(new THREE.SphereGeometry(2.1, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), m.cave, -1.5, 0, 4.2);
  cave.scale.set(1, 0.85, 0.8);
  g.add(cave);
  const caveDoor = mesh(new THREE.CircleGeometry(0.8, 20), m.caveDoor, -1.5, 0.85, 5.88);
  g.add(caveDoor);
  for (let i = 0; i < 6; i++) {
    const x = 7 + i * 2.6, z = i % 2 ? 2 : -2;
    g.add(mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.8, 6), m.frame, x, 0.9, z));
    g.add(mesh(new THREE.SphereGeometry(0.28, 10, 8), m.glow, x, 1.95, z));
  }
  return g;
}

export function ExplorerTreehouse({ position, rotationY, active, animate, onEnter }: { position: readonly [number, number, number]; rotationY: number; active: boolean; animate: boolean; onEnter?: () => void }) {
  const built = useMemo(() => {
    const materials = createMaterials();
    return { root: mergeByMaterial(buildTreehouse(materials)), materials };
  }, []);
  useEffect(() => () => {
    disposeGeometries(built.root);
    const { textures, leaves, roofs, ...rest } = built.materials;
    [...Object.values(rest), ...leaves, ...roofs].forEach((material) => material.dispose());
    textures.forEach((texture) => texture.dispose());
  }, [built]);
  const root = useRef<THREE.Group>(null);
  const glow = useRef<THREE.MeshStandardMaterial | null>(null);
  // The windows brighten when the explorer is at the door.
  useFrame(({ clock }, delta) => {
    if (!glow.current) root.current?.traverse((object) => {
      const material = (object as THREE.Mesh).material as THREE.MeshStandardMaterial | undefined;
      if (material?.name === GLOW_NAME) glow.current = material;
    });
    if (!glow.current) return;
    const target = active ? 1.9 + (animate ? Math.sin(clock.elapsedTime * 3) * 0.25 : 0) : 1.3;
    glow.current.emissiveIntensity += (target - glow.current.emissiveIntensity) * Math.min(1, delta * 6);
  });
  return (
    <group position={position as [number, number, number]} rotation={[0, rotationY, 0]}
      onClick={(event) => { if (!onEnter) return; event.stopPropagation(); onEnter(); }}
      onPointerOver={() => { if (onEnter) document.body.style.cursor = "pointer"; }}
      onPointerOut={() => { document.body.style.cursor = ""; }}>
      <primitive ref={root} object={built.root} />
    </group>
  );
}
