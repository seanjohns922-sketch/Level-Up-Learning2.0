"use client";

import { useGLTF, useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { Suspense, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import type { EconomyItem } from "@/lib/economy";
import type { CentralWorldQuality } from "@/lib/world3d/central-world-config";
import { CENTRAL_MEADOW_MAP_FRAGMENT, CENTRAL_MEADOW_SHADER_COMMON } from "@/lib/world3d/central-meadow-colour";
import { CENTRAL_WORLD_GRID, CENTRAL_WORLD_HOME_ITEM, CENTRAL_WORLD_HOME_KEY, parseGridSize, type CentralWorldGroundTile, type CentralWorldPlacement } from "@/lib/world3d/central-world-layout";
import {
  HUB_V2_BRIDGES, HUB_V2_DECOR, HUB_V2_GUMS, HUB_V2_PADS, HUB_V2_PLAY_RADIUS, HUB_V2_RIVER_START_Z, HUB_V2_ROCKS, HUB_V2_TERRAIN_SIZE, HUB_V2_WATER_Y,
  distanceFromBuildArea, hubBridgeDeckY, hubModelUrl, hubPathDistance, hubRiverDistance, hubRiverX, hubTerrainHeight, smoothstep,
  type HubBridge, type HubScenery,
} from "@/lib/world3d/central-world-v2";

function canvasTexture(width: number, height: number, draw: (g: CanvasRenderingContext2D, w: number, h: number) => void, repeat?: [number, number]) {
  const canvas = document.createElement("canvas");
  canvas.width = width; canvas.height = height;
  const context = canvas.getContext("2d");
  if (context) draw(context, width, height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  if (repeat) { texture.wrapS = texture.wrapT = THREE.RepeatWrapping; texture.repeat.set(...repeat); }
  return texture;
}

function noise(i: number) { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }

/** Merge static meshes that share a material so a whole structure draws in a few calls. */
function mergeByMaterial(group: THREE.Group) {
  group.updateMatrixWorld(true);
  const buckets = new Map<THREE.Material, THREE.BufferGeometry[]>();
  group.traverse((object) => {
    const mesh = object as THREE.Mesh;
    if (!mesh.isMesh) return;
    const material = mesh.material as THREE.Material;
    const geometry = (mesh.geometry.index ? mesh.geometry.toNonIndexed() : mesh.geometry.clone()).applyMatrix4(mesh.matrixWorld);
    for (const name of Object.keys(geometry.attributes)) if (!["position", "normal", "uv"].includes(name)) geometry.deleteAttribute(name);
    if (!geometry.attributes.uv) geometry.setAttribute("uv", new THREE.Float32BufferAttribute(new Float32Array(geometry.attributes.position.count * 2), 2));
    if (!buckets.has(material)) buckets.set(material, []);
    buckets.get(material)!.push(geometry);
  });
  const out = new THREE.Group();
  buckets.forEach((geometries, material) => {
    const merged = mergeGeometries(geometries, false);
    geometries.forEach((g) => g.dispose());
    if (!merged) return;
    const mesh = new THREE.Mesh(merged, material);
    mesh.castShadow = true; mesh.receiveShadow = true;
    out.add(mesh);
  });
  return out;
}

function disposeGroup(group: THREE.Object3D) {
  group.traverse((object) => {
    const mesh = object as THREE.Mesh;
    if (mesh.isMesh) mesh.geometry.dispose();
  });
}

// ---------- terrain ----------
// The meadow uses the same textured grass shader as today's hub; paths, sand,
// riverbed and the far hills blend in through a per-vertex "feature" colour.
function HubTerrain({ quality }: { quality: CentralWorldQuality }) {
  const source = useTexture("/images/central-world-grass-tile.png");
  const texture = useMemo(() => {
    const t = source.clone();
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(HUB_V2_TERRAIN_SIZE / 13.5, HUB_V2_TERRAIN_SIZE / 13.5);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    t.needsUpdate = true;
    return t;
  }, [source]);
  const geometry = useMemo(() => {
    const segments = quality === "low" ? 160 : 256;
    const g = new THREE.PlaneGeometry(HUB_V2_TERRAIN_SIZE, HUB_V2_TERRAIN_SIZE, segments, segments);
    g.rotateX(-Math.PI / 2);
    const position = g.attributes.position;
    const colours = new Float32Array(position.count * 3), feature = new Float32Array(position.count);
    const c = new THREE.Color();
    const path = new THREE.Color("#c4a06a"), sand = new THREE.Color("#d6c28c"), bed = new THREE.Color("#71806a"), hills = new THREE.Color("#5f8a3c");
    for (let i = 0; i < position.count; i++) {
      const x = position.getX(i), z = position.getZ(i);
      position.setY(i, hubTerrainHeight(x, z));
      let w = 0;
      const pathW = 1 - smoothstep(1.6, 2.8, hubPathDistance(x, z));
      const rd = hubRiverDistance(x, z);
      const sandW = rd < Infinity ? 1 - smoothstep(10, 15, rd) : 0, bedW = rd < Infinity ? 1 - smoothstep(5, 8, rd) : 0;
      const hillW = smoothstep(206, 250, Math.hypot(x, z)) * 0.7;
      c.copy(hills); w = hillW;
      if (sandW > 0) { c.lerp(sand, sandW / Math.max(w + sandW, 1e-3)); w = Math.max(w, sandW); }
      if (bedW > 0) { c.lerp(bed, bedW); w = Math.max(w, bedW); }
      if (pathW > 0) { c.lerp(path, pathW); w = Math.max(w, pathW); }
      colours[i * 3] = c.r; colours[i * 3 + 1] = c.g; colours[i * 3 + 2] = c.b; feature[i] = w;
    }
    g.setAttribute("color", new THREE.BufferAttribute(colours, 3));
    g.setAttribute("feature", new THREE.BufferAttribute(feature, 1));
    g.computeVertexNormals();
    return g;
  }, [quality]);
  useEffect(() => () => { geometry.dispose(); texture.dispose(); }, [geometry, texture]);
  return (
    <mesh geometry={geometry} receiveShadow>
      <meshStandardMaterial map={texture} vertexColors color="#edfacb" roughness={1} metalness={0} onBeforeCompile={(shader) => {
        shader.vertexShader = "attribute float feature;\nvarying float vFeature;\n" + shader.vertexShader.replace("#include <begin_vertex>", "#include <begin_vertex>\nvFeature = feature;");
        shader.fragmentShader = "varying float vFeature;\n" + shader.fragmentShader
          .replace("#include <common>", "#include <common>\n" + CENTRAL_MEADOW_SHADER_COMMON)
          .replace("#include <map_fragment>", CENTRAL_MEADOW_MAP_FRAGMENT)
          .replace("#include <color_fragment>", "#if defined( USE_COLOR )\n  diffuseColor.rgb = mix(diffuseColor.rgb, vColor.rgb * (0.85 + 0.15 * meadowLight), vFeature);\n#endif");
      }} />
    </mesh>
  );
}

// ---------- river, waterfall and lily pads ----------
function HubRiver({ animate }: { animate: boolean }) {
  const ripple = useMemo(() => canvasTexture(256, 256, (g, w, h) => {
    g.fillStyle = "#3aa9d6"; g.fillRect(0, 0, w, h);
    g.strokeStyle = "rgba(255,255,255,.32)"; g.lineWidth = 2;
    for (let i = 0; i < 40; i++) { const x = noise(i) * w, y = noise(i + 4) * h, l = 10 + noise(i + 8) * 24; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + l / 2, y - 3, x + l, y); g.stroke(); }
  }, [6, 60]), []);
  const fall = useMemo(() => canvasTexture(64, 256, (g, w, h) => {
    g.fillStyle = "#c4ecfb"; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 30; i++) { g.fillStyle = `rgba(255,255,255,${0.3 + noise(i) * 0.6})`; g.fillRect(noise(i + 1) * w, 0, 1 + noise(i + 2) * 3, h); }
  }, [2, 1]), []);
  useEffect(() => () => { ripple.dispose(); fall.dispose(); }, [ripple, fall]);
  const waterMaterial = useRef<THREE.MeshStandardMaterial>(null), fallMaterial = useRef<THREE.MeshStandardMaterial>(null);
  useFrame(({ clock }) => {
    if (!animate) return;
    const t = clock.elapsedTime;
    waterMaterial.current?.map?.offset.set(t * 0.002, -t * 0.02);
    if (fallMaterial.current?.map) fallMaterial.current.map.offset.y = t * 0.8;
  });
  const fallX = hubRiverX(HUB_V2_RIVER_START_Z);
  const fallTop = hubTerrainHeight(fallX, HUB_V2_RIVER_START_Z - 12);
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[122, HUB_V2_WATER_Y, 20]} receiveShadow>
        <planeGeometry args={[70, 372]} />
        <meshStandardMaterial ref={waterMaterial} map={ripple} transparent opacity={0.9} roughness={0.12} metalness={0.05} />
      </mesh>
      <HubFallsCliff />
      <mesh position={[fallX, (fallTop + 1 + HUB_V2_WATER_Y) / 2, HUB_V2_RIVER_START_Z - 3.2]} rotation={[-0.08, 0, 0]}>
        <planeGeometry args={[9, fallTop + 1 - HUB_V2_WATER_Y]} />
        <meshStandardMaterial ref={fallMaterial} map={fall} transparent opacity={0.94} emissive="#5fb8e0" emissiveIntensity={0.22} side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[fallX, HUB_V2_WATER_Y + 0.04, HUB_V2_RIVER_START_Z + 3]}>
        <circleGeometry args={[6, 24]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.5} depthWrite={false} />
      </mesh>
    </group>
  );
}

// A rocky cliff so the waterfall pours out of stone, not out of a grassy hill.
function HubFallsCliff() {
  const built = useMemo(() => {
    const fallX = hubRiverX(HUB_V2_RIVER_START_Z), z0 = HUB_V2_RIVER_START_Z;
    const top = hubTerrainHeight(fallX, z0 - 12);
    const light = new THREE.MeshStandardMaterial({ color: "#9a958a", roughness: 0.9, flatShading: true });
    const dark = new THREE.MeshStandardMaterial({ color: "#7d7a70", roughness: 0.92, flatShading: true });
    const g = new THREE.Group();
    let i = 0;
    const rock = (x: number, y: number, z: number, r: number) => {
      const m = new THREE.Mesh(new THREE.DodecahedronGeometry(r, 0), i++ % 3 ? light : dark);
      m.position.set(x, y, z); m.rotation.set(noise(i) * 3, noise(i + 1) * 3, noise(i + 2) * 3); m.scale.set(1, 0.85 + noise(i + 3) * 0.4, 0.9);
      g.add(m);
    };
    for (let y = HUB_V2_WATER_Y + 1; y < top + 1; y += 3.2) {
      for (const dx of [-9.5, -6.8, 6.8, 9.5]) rock(fallX + dx + (noise(i) - 0.5), y, z0 - 2 + (noise(i + 7) - 0.5) * 2, 2.6 + noise(i + 4) * 1.4);
      for (const dx of [-4, 0, 4]) rock(fallX + dx, y, z0 - 6.5, 3 + noise(i + 5));
    }
    for (const dx of [-8, -5, 5, 8]) rock(fallX + dx, top + 0.6, z0 - 3, 2.2 + noise(i + 6));
    for (const dx of [-7, -3.5, 3.5, 7]) rock(fallX + dx, HUB_V2_WATER_Y + 0.3, z0 + 5 + noise(i) * 2, 1.2 + noise(i + 8) * 0.8);
    const merged = mergeByMaterial(g);
    return { merged, materials: [light, dark], top };
  }, []);
  useEffect(() => () => { disposeGroup(built.merged); built.materials.forEach((m) => m.dispose()); }, [built]);
  return <primitive object={built.merged} />;
}

// ---------- arched timber bridges ----------
function buildBridge(bridge: HubBridge, materials: Record<"plankA" | "plankB" | "beam" | "stone" | "glow", THREE.Material>) {
  const group = new THREE.Group();
  const length = bridge.x1 - bridge.x0, half = bridge.width / 2;
  const curve = (dz: number, dy: number) => new THREE.CatmullRomCurve3(Array.from({ length: 13 }, (_, i) => {
    const x = bridge.x0 + (length * i) / 12;
    return new THREE.Vector3(x, hubBridgeDeckY(bridge, x) + dy, bridge.z + dz);
  }));
  const planks = Math.round(length / 0.55);
  for (let i = 0; i < planks; i++) {
    const x = bridge.x0 + ((i + 0.5) * length) / planks;
    const plank = new THREE.Mesh(new THREE.BoxGeometry(length / planks - 0.05, 0.18, bridge.width), i % 2 ? materials.plankA : materials.plankB);
    plank.position.set(x, hubBridgeDeckY(bridge, x) - 0.09, bridge.z);
    plank.rotation.z = Math.atan2(hubBridgeDeckY(bridge, x + 0.2) - hubBridgeDeckY(bridge, x - 0.2), 0.4);
    group.add(plank);
  }
  for (const side of [-1, 1]) {
    const dz = side * (half + 0.1);
    group.add(new THREE.Mesh(new THREE.TubeGeometry(curve(side * (half - 0.4), -0.32), 40, 0.18, 8, false), materials.beam));
    group.add(new THREE.Mesh(new THREE.TubeGeometry(curve(dz, 1.05), 40, 0.09, 8, false), materials.beam));
    group.add(new THREE.Mesh(new THREE.TubeGeometry(curve(dz, 0.55), 40, 0.05, 6, false), materials.beam));
    for (let i = 0; i <= 8; i++) {
      const x = bridge.x0 + (length * i) / 8, y = hubBridgeDeckY(bridge, x), end = i === 0 || i === 8;
      const post = new THREE.Mesh(new THREE.BoxGeometry(end ? 0.36 : 0.22, end ? 1.6 : 1.2, end ? 0.36 : 0.22), materials.beam);
      post.position.set(x, y + (end ? 0.7 : 0.5), bridge.z + dz);
      group.add(post);
      if (end) {
        const cap = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.12, 0.48), materials.beam); cap.position.set(x, y + 1.55, bridge.z + dz); group.add(cap);
        const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 10), materials.glow); lamp.position.set(x, y + 1.8, bridge.z + dz); group.add(lamp);
        const hood = new THREE.Mesh(new THREE.ConeGeometry(0.27, 0.22, 8), materials.beam); hood.position.set(x, y + 2.04, bridge.z + dz); group.add(hood);
      }
    }
  }
  for (const [x, side] of [[bridge.x0, -1], [bridge.x1, 1]] as const) {
    const footing = new THREE.Mesh(new THREE.BoxGeometry(2, 1.9, bridge.width + 1.2), materials.stone);
    footing.position.set(x + side * 0.6, bridge.y - 0.9, bridge.z);
    group.add(footing);
  }
  return mergeByMaterial(group);
}

function HubBridges() {
  const built = useMemo(() => {
    const materials = {
      plankA: new THREE.MeshStandardMaterial({ color: "#c08a55", roughness: 0.75 }),
      plankB: new THREE.MeshStandardMaterial({ color: "#a9733f", roughness: 0.75 }),
      beam: new THREE.MeshStandardMaterial({ color: "#6e4122", roughness: 0.8 }),
      stone: new THREE.MeshStandardMaterial({ color: "#b8b2a6", roughness: 0.9 }),
      glow: new THREE.MeshStandardMaterial({ color: "#fff0c0", emissive: "#ffb347", emissiveIntensity: 1.3 }),
    };
    const root = new THREE.Group();
    HUB_V2_BRIDGES.forEach((bridge) => root.add(buildBridge(bridge, materials)));
    return { root, materials };
  }, []);
  useEffect(() => () => { disposeGroup(built.root); Object.values(built.materials).forEach((m) => m.dispose()); }, [built]);
  return <primitive object={built.root} />;
}

// ---------- ghost gums (our own Aussie trees, instanced) ----------
const GUM_LEAVES = ["#7c9a52", "#8aa95e", "#6c8a47"];
function HubGhostGums({ gums }: { gums: HubScenery[] }) {
  const trunkRef = useRef<THREE.InstancedMesh>(null), branchRef = useRef<THREE.InstancedMesh>(null), canopyRef = useRef<THREE.InstancedMesh>(null);
  const assets = useMemo(() => {
    const bark = canvasTexture(128, 256, (g, w, h) => {
      g.fillStyle = "#ece5d6"; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 40; i++) { g.fillStyle = ["#d8cdb8", "#f8f4ea", "#cbbd9f", "#efe3c6"][i % 4]; g.globalAlpha = 0.55; g.beginPath(); g.ellipse(noise(i) * w, noise(i + 9) * h, 4 + noise(i + 3) * 12, 16 + noise(i + 5) * 50, 0, 0, Math.PI * 2); g.fill(); }
    }, [2, 1]);
    const trunk = new THREE.CylinderGeometry(0.3, 0.55, 8, 10); trunk.translate(0, 4, 0);
    const branch = new THREE.CylinderGeometry(0.13, 0.25, 3.4, 8); branch.translate(0, 1.7, 0);
    return { bark: new THREE.MeshStandardMaterial({ map: bark, roughness: 0.75 }), leaf: new THREE.MeshStandardMaterial({ color: "#ffffff", flatShading: true, roughness: 0.75 }), trunk, branch, blob: new THREE.IcosahedronGeometry(1, 1), barkTexture: bark };
  }, []);
  useEffect(() => () => { assets.trunk.dispose(); assets.branch.dispose(); assets.blob.dispose(); assets.bark.dispose(); assets.leaf.dispose(); assets.barkTexture.dispose(); }, [assets]);
  useLayoutEffect(() => {
    const trunk = trunkRef.current, branch = branchRef.current, canopy = canopyRef.current;
    if (!trunk || !branch || !canopy) return;
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), colour = new THREE.Color();
    gums.forEach((t, i) => {
      const s = t.s * 1.6;
      q.setFromEuler(e.set(0, t.ry, 0));
      trunk.setMatrixAt(i, m.compose(new THREE.Vector3(t.x, t.y, t.z), q, new THREE.Vector3(s, s, s)));
      [-1, 1].forEach((side, j) => {
        q.setFromEuler(e.set(0, t.ry, side * 0.75));
        branch.setMatrixAt(i * 2 + j, m.compose(new THREE.Vector3(t.x, t.y + 5.2 * s, t.z), q, new THREE.Vector3(s, s, s)));
      });
      const cos = Math.cos(t.ry), sin = Math.sin(t.ry);
      ([[0, 8.9, 0, 2.4], [-2.5, 7.6, 0.3, 1.8], [2.5, 7.6, -0.3, 1.9], [-0.8, 9.4, -1.5, 1.7], [1, 9.2, 1.4, 1.7]] as const).forEach(([dx, dy, dz, r], j) => {
        canopy.setMatrixAt(i * 5 + j, m.compose(new THREE.Vector3(t.x + (dx * cos + dz * sin) * s, t.y + dy * s, t.z + (-dx * sin + dz * cos) * s), q.identity(), new THREE.Vector3(r * s * 1.1, r * s * 0.8, r * s)));
        canopy.setColorAt(i * 5 + j, colour.set(GUM_LEAVES[(i + j) % 3]));
      });
    });
    [trunk, branch, canopy].forEach((mesh) => { mesh.instanceMatrix.needsUpdate = true; mesh.computeBoundingSphere(); });
    if (canopy.instanceColor) canopy.instanceColor.needsUpdate = true;
  }, [gums]);
  return (
    <group>
      <instancedMesh ref={trunkRef} args={[assets.trunk, assets.bark, gums.length]} castShadow receiveShadow />
      <instancedMesh ref={branchRef} args={[assets.branch, assets.bark, gums.length * 2]} castShadow receiveShadow />
      <instancedMesh ref={canopyRef} args={[assets.blob, assets.leaf, gums.length * 5]} castShadow receiveShadow />
    </group>
  );
}

// ---------- nature models (Kenney Nature Kit, CC0): loaded once, drawn as instances ----------
type ModelPart = { geometry: THREE.BufferGeometry; material: THREE.Material; matrix: THREE.Matrix4 };
function useModelParts(key: string) {
  const { scene } = useGLTF(hubModelUrl(key));
  return useMemo(() => {
    scene.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const parts: ModelPart[] = [];
    scene.traverse((object) => {
      const mesh = object as THREE.Mesh;
      if (!mesh.isMesh) return;
      let material = mesh.material as THREE.Material;
      // Kenney's grass is blue-teal; match it to the meadow.
      if (key.startsWith("grass") && (material as THREE.MeshStandardMaterial).color) {
        const tinted = (material as THREE.MeshStandardMaterial).clone();
        tinted.color.set("#6da13f");
        material = tinted;
      }
      parts.push({ geometry: mesh.geometry, material, matrix: mesh.matrixWorld.clone() });
    });
    const offset = new THREE.Matrix4().makeTranslation(-(box.min.x + box.max.x) / 2, -box.min.y, -(box.min.z + box.max.z) / 2);
    return { parts, norm: 1 / Math.max(size.x, size.y, size.z), offset };
  }, [scene, key]);
}

function ModelInstances({ model, items, cast = true, chunk = 0, drawDistance = Infinity }: { model: string; items: HubScenery[]; cast?: boolean; chunk?: number; drawDistance?: number }) {
  const { parts, norm, offset } = useModelParts(model);
  const group = useMemo(() => {
    const root = new THREE.Group();
    const meshes: THREE.InstancedMesh[] = [];
    const buckets = new Map<string, HubScenery[]>();
    for (const item of items) {
      const key = chunk ? `${Math.floor(item.x / chunk)}:${Math.floor(item.z / chunk)}` : "all";
      if (!buckets.has(key)) buckets.set(key, []);
      buckets.get(key)!.push(item);
    }
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), up = new THREE.Vector3(0, 1, 0), p = new THREE.Vector3(), s = new THREE.Vector3();
    buckets.forEach((list) => {
      let cx = 0, cz = 0;
      list.forEach((item) => { cx += item.x; cz += item.z; });
      parts.forEach((part) => {
        const mesh = new THREE.InstancedMesh(part.geometry, part.material, list.length);
        list.forEach((item, i) => {
          q.setFromAxisAngle(up, item.ry);
          mesh.setMatrixAt(i, m.compose(p.set(item.x, item.y, item.z), q, s.setScalar(item.s * norm)).multiply(offset).multiply(part.matrix));
        });
        mesh.castShadow = cast; mesh.receiveShadow = true;
        mesh.computeBoundingSphere();
        mesh.userData = { cx: cx / list.length, cz: cz / list.length };
        root.add(mesh);
        meshes.push(mesh);
      });
    });
    return { root, meshes };
  }, [items, parts, norm, offset, chunk, cast]);
  useEffect(() => () => group.meshes.forEach((mesh) => mesh.dispose()), [group]);
  const root = useRef<THREE.Group>(null);
  // Small plants draw only near the camera; each chunk stores its centre.
  useFrame(({ camera }) => {
    if (!Number.isFinite(drawDistance) || !root.current) return;
    for (const child of root.current.children) child.visible = Math.hypot(child.userData.cx - camera.position.x, child.userData.cz - camera.position.z) < drawDistance;
  });
  return <primitive ref={root} object={group.root} />;
}

// ---------- campsite and lookout ----------
function HubLookout() {
  const pad = HUB_V2_PADS.find((p) => p.key === "lookout")!;
  const built = useMemo(() => {
    const wood = new THREE.MeshStandardMaterial({ color: "#8a5530", roughness: 0.8 }), deck = new THREE.MeshStandardMaterial({ color: "#b98552", roughness: 0.8 }), flag = new THREE.MeshStandardMaterial({ color: "#f5c04a", side: THREE.DoubleSide });
    const g = new THREE.Group();
    const floor = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 4.2, 0.3, 24), deck); floor.position.y = 0.15; g.add(floor);
    for (let i = 0; i < 14; i++) { const a = (i / 14) * Math.PI * 2; const post = new THREE.Mesh(new THREE.BoxGeometry(0.14, 1, 0.14), wood); post.position.set(Math.cos(a) * 3.95, 0.8, Math.sin(a) * 3.95); g.add(post); }
    const rail = new THREE.Mesh(new THREE.TorusGeometry(3.95, 0.06, 6, 40), wood); rail.rotation.x = Math.PI / 2; rail.position.y = 1.3; g.add(rail);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 4.4, 6), wood); pole.position.y = 2.2; g.add(pole);
    const banner = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.8), flag); banner.position.set(0.7, 3.9, 0); g.add(banner);
    const merged = mergeByMaterial(g);
    merged.position.set(pad.x, pad.y, pad.z);
    return { merged, materials: [wood, deck, flag] };
  }, [pad]);
  useEffect(() => () => { disposeGroup(built.merged); built.materials.forEach((m) => m.dispose()); }, [built]);
  return <primitive object={built.merged} />;
}

// ---------- decoration that clears under student builds ----------
function occupiedCells(placements: CentralWorldPlacement[], groundTiles: CentralWorldGroundTile[], itemsById: Map<string, EconomyItem>) {
  const cells = new Set(groundTiles.map((tile) => `${tile.gridX}:${tile.gridZ}`));
  for (const placement of placements) {
    const item = placement.itemId === CENTRAL_WORLD_HOME_KEY ? CENTRAL_WORLD_HOME_ITEM : itemsById.get(placement.itemId);
    if (!item) continue;
    const [w0, d0] = parseGridSize(item);
    const [w, d] = placement.rotation === 90 || placement.rotation === 270 ? [d0, w0] : [w0, d0];
    const startX = placement.gridX - Math.floor(w / 2), startZ = placement.gridZ - Math.floor(d / 2);
    for (let x = startX - 1; x <= startX + w; x++) for (let z = startZ - 1; z <= startZ + d; z++) cells.add(`${x}:${z}`);
  }
  return cells;
}

export function CentralWorldV2Scenery({ quality, animate, placements, groundTiles, itemsById }: { quality: CentralWorldQuality; animate: boolean; placements: CentralWorldPlacement[]; groundTiles: CentralWorldGroundTile[]; itemsById: Map<string, EconomyItem> }) {
  const decorByModel = useMemo(() => {
    const occupied = occupiedCells(placements, groundTiles, itemsById);
    const keep = quality === "low" ? 0.45 : quality === "medium" ? 0.75 : 1;
    const map = new Map<string, HubScenery[]>();
    HUB_V2_DECOR.forEach((d, i) => {
      if (keep < 1 && noise(i + 0.5) > keep) return;
      if (distanceFromBuildArea(d.x, d.z) === 0 && occupied.has(`${Math.round(d.x / CENTRAL_WORLD_GRID.cellSize)}:${Math.round(d.z / CENTRAL_WORLD_GRID.cellSize)}`)) return;
      if (!map.has(d.model)) map.set(d.model, []);
      map.get(d.model)!.push(d);
    });
    return map;
  }, [placements, groundTiles, itemsById, quality]);
  const rocksByModel = useMemo(() => {
    const map = new Map<string, HubScenery[]>();
    HUB_V2_ROCKS.forEach((r) => { if (!map.has(r.model)) map.set(r.model, []); map.get(r.model)!.push(r); });
    return map;
  }, []);
  const lilies = useMemo(() => {
    const out: HubScenery[] = [];
    for (let z = HUB_V2_RIVER_START_Z + 10, i = 0; z < HUB_V2_PLAY_RADIUS; z += 7, i++) {
      if (noise(i * 3.1) > 0.5 || HUB_V2_BRIDGES.some((b) => Math.abs(b.z - z) < 5)) continue;
      out.push({ x: hubRiverX(z) + (noise(i * 5.7) - 0.5) * 6, z, y: HUB_V2_WATER_Y + 0.03, s: 0.9 + noise(i) * 0.5, ry: noise(i * 9.3) * 6.28 });
    }
    return out;
  }, []);
  const camp = HUB_V2_PADS.find((p) => p.key === "camp")!;
  const drawDistance = quality === "low" ? 70 : quality === "medium" ? 105 : 140;
  return (
    <group>
      <Suspense fallback={<mesh rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[HUB_V2_TERRAIN_SIZE, HUB_V2_TERRAIN_SIZE]} /><meshStandardMaterial color="#6f9a42" roughness={1} /></mesh>}>
        <HubTerrain quality={quality} />
      </Suspense>
      <HubRiver animate={animate} />
      <HubBridges />
      <HubGhostGums gums={HUB_V2_GUMS} />
      <HubLookout />
      <Suspense fallback={null}>
        {[...rocksByModel].map(([model, items]) => <ModelInstances key={model} model={model} items={items} />)}
        {[...decorByModel].map(([model, items]) => <ModelInstances key={model} model={model} items={items} chunk={60} drawDistance={drawDistance} cast={model.startsWith("plant") || model.startsWith("log")} />)}
        <ModelInstances model="lily_large" items={lilies} cast={false} />
        <ModelInstances model="campfire_stones" items={[{ x: camp.x, z: camp.z, y: camp.y, s: 1.4, ry: 0 }]} />
        <ModelInstances model="tent_detailedOpen" items={[{ x: camp.x - 5, z: camp.z - 4, y: camp.y, s: 3.6, ry: 0.6 }, { x: camp.x + 4.5, z: camp.z - 4.5, y: camp.y, s: 3.6, ry: -0.5 }]} />
        <ModelInstances model="log_large" items={[{ x: camp.x - 0.6, z: camp.z + 3, y: camp.y, s: 2.4, ry: 0 }, { x: camp.x + 3, z: camp.z + 1.2, y: camp.y, s: 2.4, ry: 1.4 }]} />
      </Suspense>
    </group>
  );
}
