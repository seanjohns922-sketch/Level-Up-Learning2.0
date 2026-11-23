"use client";
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { CentralWorldGroundTile } from "@/lib/world3d/central-world-layout";
import { SWIM_BED_Y, SWIM_SURFACE_Y, type WaterOval } from "@/lib/world3d/swimming";
import { buildWorldWater } from "@/lib/world3d/world-water";
import { paintWaterHoles } from "./waterHoles";

/** Where the organic mesher puts its wider edge shape, which dug-out water reuses for its bed and surface. */
const MESH_EDGE_Y = 0.065;
/** How wide the grassy-stone lip round dug-out water is. */
const LIP = 0.32;

/** The outline of a flat triangle soup: each edge only one triangle uses, with the way out of the shape. */
function boundaryEdges(shape: THREE.BufferGeometry) {
  const position = shape.attributes.position;
  if (!position) return [];
  const key = (i: number) => `${position.getX(i).toFixed(3)},${position.getZ(i).toFixed(3)}`;
  const edges = new Map<string, { a: number; b: number; c: number; count: number }>();
  for (let t = 0; t + 2 < position.count; t += 3) {
    for (const [a, b, c] of [[t, t + 1, t + 2], [t + 1, t + 2, t], [t + 2, t, t + 1]]) {
      const id = [key(a), key(b)].sort().join("|");
      const edge = edges.get(id);
      if (edge) edge.count++; else edges.set(id, { a, b, c, count: 1 });
    }
  }
  return [...edges.values()].filter((edge) => edge.count === 1).map(({ a, b, c }) => {
    const ax = position.getX(a), az = position.getZ(a), bx = position.getX(b), bz = position.getZ(b);
    let nx = bz - az, nz = -(bx - ax);
    const length = Math.hypot(nx, nz) || 1;
    nx /= length; nz /= length;
    // Point the normal away from the triangle's third corner.
    if ((position.getX(c) - ax) * nx + (position.getZ(c) - az) * nz > 0) { nx = -nx; nz = -nz; }
    return { ax, az, bx, bz, nx, nz };
  });
}

/** Dug-out water: the banks down to the bed, and a lip round the top that tidies the grass's edge. */
function buildPit(shape: THREE.BufferGeometry) {
  const walls: number[] = [], lip: number[] = [];
  for (const { ax, az, bx, bz, nx, nz } of boundaryEdges(shape)) {
    walls.push(ax, 0.02, az, bx, 0.02, bz, bx, SWIM_BED_Y, bz, ax, 0.02, az, bx, SWIM_BED_Y, bz, ax, SWIM_BED_Y, az);
    const ox = nx * LIP, oz = nz * LIP;
    lip.push(ax - ox * 0.3, 0.03, az - oz * 0.3, bx - ox * 0.3, 0.03, bz - oz * 0.3, bx + ox, 0.03, bz + oz, ax - ox * 0.3, 0.03, az - oz * 0.3, bx + ox, 0.03, bz + oz, ax + ox, 0.03, az + oz);
  }
  const make = (vertices: number[]) => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    geometry.computeVertexNormals();
    return geometry;
  };
  return { walls: make(walls), lip: make(lip) };
}

function useRipples() {
  const reducedMotion = useRef(false);
  const ripples = useMemo(() => {
    const size = 128, data = new Uint8Array(size * size * 4);
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
      const v = Math.round(155 + 32 * Math.sin((x + y) * Math.PI / 16) + 17 * Math.sin((x - y * 2) * Math.PI / 32));
      data.set([v, v, v, 255], (y * size + x) * 4);
    }
    const texture = new THREE.DataTexture(data, size, size);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.magFilter = texture.minFilter = THREE.LinearFilter;
    texture.repeat.set(.65, .65); texture.needsUpdate = true;
    return texture;
  }, []);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => { reducedMotion.current = query.matches; };
    update(); query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  useEffect(() => () => ripples.dispose(), [ripples]);
  useFrame((_, delta) => {
    if (!reducedMotion.current) ripples.offset.set((ripples.offset.x + Math.min(delta, .05) * .018) % 1, (ripples.offset.y + Math.min(delta, .05) * .01) % 1);
  });
  return ripples;
}

/**
 * Painted water. In the hub (`dug`) it's dug out below the grass so explorers swim in it: the terrain
 * leaves a hole (see waterHoles), banks run down to a sandy bed and the see-through surface sits just
 * under the grass. Elsewhere (the classic hub, art review) it stays a flat painted pond.
 * `lakes` are the placed Swimming Lakes, which draw their own water but need their hole in the grass too.
 */
export function WorldWater({ tiles, dug = false, lakes = [] }: { tiles: CentralWorldGroundTile[]; dug?: boolean; lakes?: readonly WaterOval[] }) {
  const geometry = useMemo(() => buildWorldWater(tiles), [tiles]);
  const pit = useMemo(() => dug ? buildPit(geometry.edge) : null, [dug, geometry]);
  const ripples = useRipples();
  useEffect(() => () => { geometry.surface.dispose(); geometry.edge.dispose(); }, [geometry]);
  useEffect(() => () => { pit?.walls.dispose(); pit?.lip.dispose(); }, [pit]);
  useEffect(() => {
    if (!dug) return;
    paintWaterHoles(geometry.edge, lakes);
    return () => paintWaterHoles(null, []);
  }, [dug, geometry, lakes]);
  if (!pit) return <group>
    <mesh geometry={geometry.edge} receiveShadow><meshStandardMaterial color="#9caa88" roughness={.95} /></mesh>
    <mesh geometry={geometry.surface} receiveShadow><meshStandardMaterial color="#4e9998" roughness={.28} metalness={.22} bumpMap={ripples} bumpScale={.085} /></mesh>
  </group>;
  return <group>
    <mesh geometry={pit.lip} receiveShadow><meshStandardMaterial color="#9caa88" roughness={.95} /></mesh>
    <mesh geometry={pit.walls}><meshStandardMaterial color="#6f8f6a" roughness={1} side={THREE.DoubleSide} /></mesh>
    <mesh geometry={geometry.edge} position={[0, SWIM_BED_Y - MESH_EDGE_Y, 0]} receiveShadow><meshStandardMaterial color="#c9b27a" roughness={1} /></mesh>
    <mesh geometry={geometry.edge} position={[0, SWIM_SURFACE_Y - MESH_EDGE_Y, 0]} renderOrder={2}>
      <meshStandardMaterial color="#3f9fb8" roughness={.12} metalness={.15} bumpMap={ripples} bumpScale={.06} transparent opacity={.72} depthWrite={false} />
    </mesh>
  </group>;
}
