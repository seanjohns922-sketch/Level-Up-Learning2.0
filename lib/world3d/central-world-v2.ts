// The bigger central hub ("v2"). It grows outward around today's world: the
// build grid, the Tower and every saved placement keep their coordinates, and
// all new land (river, bridges, campsite, lookout, treehouse clearing) sits
// outside the old build area. The old build area stays perfectly flat at y=0.
import { CENTRAL_WORLD_CONFIG } from "./central-world-config";
import { isCentralWorldProtectedCell, type CentralWorldBuildRules, type CentralWorldGrid } from "./central-world-layout";

/** Off for students until launch: `?hub=v2` or NEXT_PUBLIC_CENTRAL_WORLD_V2=1 turns it on. */
export function isCentralWorldV2Enabled(search?: { get(name: string): string | null } | null) {
  if (process.env.NEXT_PUBLIC_CENTRAL_WORLD_V2 === "1") return true;
  return search?.get("hub") === "v2";
}

type Point = readonly [number, number];
const CENTRAL_TOWER_Z = CENTRAL_WORLD_CONFIG.towerPosition[2];
const EXISTING_PATHS: ReadonlyArray<ReadonlyArray<Point>> = [CENTRAL_WORLD_CONFIG.pathPoints, CENTRAL_WORLD_CONFIG.myHomePathPoints];

/** Today's build grid in metres, plus a small margin. Saved builds live here; no new feature touches it. */
export const HUB_V2_BUILD_AREA = { minX: -94, maxX: 90, minZ: -88, maxZ: 86 } as const;
/** The bigger build grid (2 m squares). Its corners stay inside the walkable world, and all of it is flat. */
export const HUB_V2_GRID: CentralWorldGrid = { cellSize: 2, minX: -66, maxX: 66, minZ: -66, maxZ: 66 };
export const HUB_V2_PLAY_RADIUS = 192;
export const HUB_V2_TERRAIN_SIZE = 640;
export const HUB_V2_WATER_Y = -0.9;
export const HUB_V2_RIVER_START_Z = -150;
const RIVER_BED_Y = -2.4;

export function hubRiverX(z: number) {
  return 122 + 9 * Math.sin(z * 0.021) + 4 * Math.sin(z * 0.053 + 1);
}

/** Each bridge spans the river where it crosses; its deck height is set from the banks below. */
const BRIDGE_SPANS = [38, -62].map((z) => ({ z, x0: hubRiverX(z) - 11, x1: hubRiverX(z) + 11 }));

/** Connecting paths live only in the new land, so they never cross a student's build. */
export const HUB_V2_PATHS: ReadonlyArray<ReadonlyArray<Point>> = [
  [[93, 38], [BRIDGE_SPANS[0].x0 - 1, 38]],
  [[BRIDGE_SPANS[0].x1 + 1, 38], [140, 40], [152, 42]],
  [[93, -62], [BRIDGE_SPANS[1].x0 - 1, -62]],
  [[BRIDGE_SPANS[1].x1 + 1, -62], [146, -76], [155, -92]],
  [[-97, 4], [-112, 3]],
];

export function smoothstep(a: number, b: number, x: number) {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

/** Distance from the old build rectangle (0 inside it). */
export function distanceFromBuildArea(x: number, z: number) {
  const a = HUB_V2_BUILD_AREA;
  const dx = Math.max(a.minX - x, 0, x - a.maxX);
  const dz = Math.max(a.minZ - z, 0, z - a.maxZ);
  return Math.hypot(dx, dz);
}

/** Distance from the bigger build grid's edge in metres (0 inside it). */
export function distanceFromBuildGrid(x: number, z: number) {
  const half = HUB_V2_GRID.cellSize / 2;
  const dx = Math.max(HUB_V2_GRID.minX * HUB_V2_GRID.cellSize - half - x, 0, x - HUB_V2_GRID.maxX * HUB_V2_GRID.cellSize - half);
  const dz = Math.max(HUB_V2_GRID.minZ * HUB_V2_GRID.cellSize - half - z, 0, z - HUB_V2_GRID.maxZ * HUB_V2_GRID.cellSize - half);
  return Math.hypot(dx, dz);
}

function segmentDistance(px: number, pz: number, a: Point, b: Point) {
  const vx = b[0] - a[0], vz = b[1] - a[1];
  const t = Math.max(0, Math.min(1, ((px - a[0]) * vx + (pz - a[1]) * vz) / (vx * vx + vz * vz)));
  return Math.hypot(px - a[0] - vx * t, pz - a[1] - vz * t);
}

export function hubPathDistance(x: number, z: number) {
  let d = Infinity;
  for (const path of HUB_V2_PATHS) for (let i = 0; i < path.length - 1; i++) d = Math.min(d, segmentDistance(x, z, path[i], path[i + 1]));
  return d;
}

export function hubRiverDistance(x: number, z: number) {
  return z < HUB_V2_RIVER_START_Z - 7 ? Infinity : Math.abs(x - hubRiverX(z));
}

function hill(x: number, z: number, cx: number, cz: number, r: number, h: number) {
  const d = Math.hypot(x - cx, z - cz);
  return d < r ? h * (0.5 + 0.5 * Math.cos((Math.PI * d) / r)) : 0;
}

function rawHeight(x: number, z: number) {
  const outside = smoothstep(4, 34, distanceFromBuildGrid(x, z));
  let h = outside * (0.8 + 0.55 * Math.sin(x * 0.031 + 0.5) * Math.cos(z * 0.027) + 0.3 * Math.sin(x * 0.07 + z * 0.05));
  // Hills fade out at the build grid's edge so all building land stays flat.
  h += outside * (hill(x, z, 160, -100, 30, 9) + hill(x, z, 122, -188, 48, 22) + hill(x, z, -150, -120, 42, 8) + hill(x, z, -140, 130, 46, 7));
  const r = Math.hypot(x, z), a = Math.atan2(z, x);
  h += smoothstep(198, 250, r) * (9 + 4 * Math.sin(a * 5) + 2 * Math.sin(a * 13));
  return h;
}

export type HubPad = { readonly key: "camp" | "lookout" | "treehouse"; readonly x: number; readonly z: number; readonly r: number; readonly y: number };
/** Flat clearings; each sits at the natural ground height of its centre. */
export const HUB_V2_PADS: readonly HubPad[] = ([
  { key: "camp", x: 160, z: 42, r: 12 },
  { key: "lookout", x: 157, z: -98, r: 7 },
  { key: "treehouse", x: -128, z: 2, r: 18 },
] as const).map((pad) => ({ ...pad, y: rawHeight(pad.x, pad.z) }));

export function hubTerrainHeight(x: number, z: number) {
  let h = rawHeight(x, z);
  for (const pad of HUB_V2_PADS) {
    const k = smoothstep(pad.r, pad.r + 14, Math.hypot(x - pad.x, z - pad.z));
    h = pad.y * (1 - k) + h * k;
  }
  const rd = hubRiverDistance(x, z);
  if (rd < Infinity) {
    const carve = (1 - smoothstep(6, 15, rd)) * smoothstep(HUB_V2_RIVER_START_Z - 7, HUB_V2_RIVER_START_Z + 1, z);
    h = RIVER_BED_Y * carve + h * (1 - carve);
  }
  return h;
}

export type HubBridge = { readonly z: number; readonly x0: number; readonly x1: number; readonly y: number; readonly arch: number; readonly width: number };
export const HUB_V2_BRIDGES: readonly HubBridge[] = BRIDGE_SPANS.map((span) => ({
  ...span,
  y: Math.max(hubTerrainHeight(span.x0, span.z), hubTerrainHeight(span.x1, span.z)) + 0.2,
  arch: 1.5,
  width: 4.2,
}));

export function hubBridgeDeckY(bridge: HubBridge, x: number) {
  const t = Math.max(0, Math.min(1, (x - bridge.x0) / (bridge.x1 - bridge.x0)));
  return bridge.y + bridge.arch * Math.sin(Math.PI * t);
}

function bridgeAt(x: number, z: number) {
  return HUB_V2_BRIDGES.find((b) => Math.abs(z - b.z) < b.width / 2 - 0.3 && x > b.x0 - 1.2 && x < b.x1 + 1.2);
}

/** Ground height for walking: bridge decks, then terrain. The old build area is always 0. */
export function hubGroundHeight(x: number, z: number) {
  const bridge = bridgeAt(x, z);
  if (bridge) return Math.max(hubBridgeDeckY(bridge, x), hubTerrainHeight(x, z));
  return hubTerrainHeight(x, z);
}

// ---------- fixed scenery: seeded so rendering and collisions always agree ----------
function seeded(seed: number) {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}

function clearOfFeatures(x: number, z: number, { path = 6, river = 17, pad = 6 } = {}) {
  if (hubPathDistance(x, z) < path) return false;
  if (hubRiverDistance(x, z) < river) return false;
  if (z < HUB_V2_RIVER_START_Z - 2 && Math.abs(x - hubRiverX(HUB_V2_RIVER_START_Z)) < 14) return false;
  return HUB_V2_PADS.every((p) => Math.hypot(x - p.x, z - p.z) > p.r + pad);
}

export type HubScenery = { x: number; z: number; y: number; s: number; ry: number };
export type HubCollider = { x: number; z: number; r: number };

/** Ghost gums only grow in the new land, never on a student's build. */
export const HUB_V2_GUMS: HubScenery[] = (() => {
  const rand = seeded(11), out: HubScenery[] = [];
  const tree = HUB_V2_PADS.find((p) => p.key === "treehouse")!;
  for (let i = 0; i < 600 && out.length < 24; i++) {
    const near = out.length < 7;
    const a = rand() * Math.PI * 2, rr = near ? 24 + rand() * 18 : 40 + rand() * 150;
    const x = near ? tree.x + Math.cos(a) * rr : Math.cos(a) * rr;
    const z = near ? tree.z + Math.sin(a) * rr : Math.sin(a) * rr;
    if (Math.hypot(x, z) > HUB_V2_PLAY_RADIUS - 6 || distanceFromBuildArea(x, z) < 10 || !clearOfFeatures(x, z, { path: 7, pad: near ? 4 : 8 })) continue;
    const spacing = near ? 11 : 30;
    if (out.some((t) => Math.hypot(t.x - x, t.z - z) < spacing)) continue;
    out.push({ x, z, y: hubTerrainHeight(x, z) - 0.2, s: 0.9 + rand() * 0.45, ry: rand() * Math.PI * 2 });
  }
  return out;
})();

export type HubRock = HubScenery & { model: string };
export const HUB_V2_ROCKS: HubRock[] = (() => {
  const rand = seeded(23), out: HubRock[] = [];
  const models = ["rock_largeA", "rock_largeC", "rock_largeE", "rock_tallA", "rock_tallC", "stone_largeB"];
  for (let i = 0; i < 900 && out.length < 46; i++) {
    const a = rand() * Math.PI * 2, r = 100 + rand() * 98;
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    if (distanceFromBuildGrid(x, z) < 4 || !clearOfFeatures(x, z, { path: 5, river: 13 })) continue;
    const big = r > 172;
    out.push({ x, z, y: hubTerrainHeight(x, z) - 0.3, s: big ? 4 + rand() * 5 : 1.2 + rand() * 1.6, ry: rand() * Math.PI * 2, model: models[Math.floor(rand() * models.length)] });
  }
  // A few stones along the riverbanks.
  for (let z = HUB_V2_RIVER_START_Z + 8; z < 190; z += 9) {
    if (rand() > 0.55) continue;
    const side = rand() < 0.5 ? -1 : 1, x = hubRiverX(z) + side * (9 + rand() * 3);
    if (Math.hypot(x, z) > HUB_V2_PLAY_RADIUS + 10 || HUB_V2_BRIDGES.some((b) => Math.abs(b.z - z) < 6)) continue;
    out.push({ x, z, y: hubTerrainHeight(x, z) - 0.25, s: 1 + rand() * 1.2, ry: rand() * Math.PI * 2, model: "stone_largeB" });
  }
  return out;
})();

const CAMP = HUB_V2_PADS.find((p) => p.key === "camp")!;
const TREEHOUSE = HUB_V2_PADS.find((p) => p.key === "treehouse")!;
export const HUB_V2_COLLIDERS: HubCollider[] = [
  { x: TREEHOUSE.x, z: TREEHOUSE.z, r: 2.8 }, { x: TREEHOUSE.x - 1.5, z: TREEHOUSE.z + 4.2, r: 2 }, { x: TREEHOUSE.x + 10, z: TREEHOUSE.z - 5, r: 0.5 },
  { x: CAMP.x, z: CAMP.z, r: 1 }, { x: CAMP.x - 5, z: CAMP.z - 4, r: 1.7 }, { x: CAMP.x + 4.5, z: CAMP.z - 4.5, r: 1.7 },
  ...HUB_V2_GUMS.map((g) => ({ x: g.x, z: g.z, r: 0.8 * g.s })),
  ...HUB_V2_ROCKS.filter((r) => r.s > 1.8).map((r) => ({ x: r.x, z: r.z, r: r.s * 0.32 })),
];

/** Where the player may stand: inside the world, out of the river (bridges are fine), not inside a gum or boulder. */
export function hubCanStand(x: number, z: number) {
  if (Math.hypot(x, z) > HUB_V2_PLAY_RADIUS) return false;
  if (!bridgeAt(x, z) && hubTerrainHeight(x, z) < HUB_V2_WATER_Y + 0.45) return false;
  if (distanceFromBuildArea(x, z) === 0) return true;
  for (const c of HUB_V2_COLLIDERS) {
    const dx = x - c.x, dz = z - c.z;
    if (dx * dx + dz * dz < (c.r + 0.35) ** 2) return false;
  }
  return true;
}

function nearExistingPath(x: number, z: number) {
  return EXISTING_PATHS.some((path) => path.some((point, i) => i > 0 && segmentDistance(x, z, path[i - 1], point) < 3));
}

export type HubDecor = HubScenery & { model: string };
const DECOR_PLAN: Array<{ model: string; count: number; size: [number, number]; edge?: boolean }> = [
  { model: "grass_large", count: 1500, size: [0.55, 0.9] },
  { model: "grass_leafsLarge", count: 1200, size: [0.55, 0.95] },
  { model: "flower_yellowA", count: 340, size: [0.45, 0.7] },
  { model: "flower_purpleA", count: 300, size: [0.45, 0.7] },
  { model: "flower_redA", count: 260, size: [0.45, 0.7] },
  { model: "mushroom_redGroup", count: 40, size: [0.5, 0.8] },
  { model: "mushroom_tanGroup", count: 30, size: [0.5, 0.8] },
  { model: "plant_bush", count: 120, size: [0.9, 1.4], edge: true },
  { model: "plant_bushLarge", count: 60, size: [1.3, 1.9], edge: true },
  { model: "plant_bushDetailed", count: 60, size: [1.1, 1.6], edge: true },
  { model: "log_large", count: 12, size: [2.2, 3.2], edge: true },
  { model: "stump_roundDetailed", count: 16, size: [0.8, 1.2], edge: true },
];

/** Grass and flowers everywhere (hidden under builds at render time); bushes and logs keep to the edges and riverbanks. */
export const HUB_V2_DECOR: HubDecor[] = (() => {
  const rand = seeded(37), out: HubDecor[] = [];
  for (const plan of DECOR_PLAN) {
    let placed = 0;
    for (let tries = 0; placed < plan.count && tries < plan.count * 14; tries++) {
      const a = rand() * Math.PI * 2, r = Math.sqrt(rand()) * (HUB_V2_PLAY_RADIUS + 4);
      const x = Math.cos(a) * r, z = Math.sin(a) * r;
      if (plan.edge && distanceFromBuildGrid(x, z) < 4 && hubRiverDistance(x, z) > 28) continue;
      if (!clearOfFeatures(x, z, { path: 3.5, river: plan.edge ? 15 : 12, pad: 2 })) continue;
      if (Math.hypot(x, z - CENTRAL_TOWER_Z) < 16 || nearExistingPath(x, z)) continue;
      const [lo, hi] = plan.size;
      out.push({ model: plan.model, x, z, y: hubTerrainHeight(x, z) - 0.04, s: lo + rand() * (hi - lo), ry: rand() * Math.PI * 2 });
      placed++;
    }
  }
  return out;
})();


export const HUB_V2_MODEL_KEYS = Array.from(new Set([...HUB_V2_DECOR.map((d) => d.model), ...HUB_V2_ROCKS.map((r) => r.model), "lily_large", "campfire_stones", "tent_detailedOpen"]));
export const hubModelUrl = (key: string) => `/models/nature/${key}.glb`;

/** Named arrival spots in the new land (map teleport and screenshots). Yaw faces the camera's view direction. */
const SPOTS: Record<string, { x: number; z: number; yaw: number }> = {
  "hub-river": { x: HUB_V2_BRIDGES[0].x0 - 14, z: 44, yaw: -Math.PI / 2 },
  "hub-camp": { x: 150, z: 50, yaw: Math.PI / 2.2 },
  "hub-lookout": { x: 150, z: -84, yaw: -0.42 },
  "hub-treehouse": { x: -104, z: 10, yaw: Math.PI / 2 },
  "hub-waterfall": { x: hubRiverX(-110) - 16, z: -104, yaw: -0.29 },
};
export function hubV2Spot(key: string | null): { position: [number, number, number]; yaw: number } | null {
  const spot = key ? SPOTS[key] : undefined;
  return spot ? { position: [spot.x, 0.75, spot.z], yaw: spot.yaw } : null;
}

/** The treehouse stands in its own clearing, front door facing the meadows (+x). Same shape as the movable home's anchors. */
export const HUB_V2_TREEHOUSE_ANCHORS = {
  position: [TREEHOUSE.x, TREEHOUSE.y, TREEHOUSE.z] as [number, number, number],
  rotationY: Math.PI / 2,
  entrance: [TREEHOUSE.x + 6.5, 0.75, TREEHOUSE.z] as [number, number, number],
  exit: [TREEHOUSE.x + 10, 0.75, TREEHOUSE.z] as [number, number, number],
};

// ---------- building in the bigger hub ----------
/** Ground counts as flat (items sit at y=0) within 2 cm. */
export const HUB_V2_FLAT_TOLERANCE = 0.02;
let reservedCells: Set<string> | null = null;

function computeReserved(gridX: number, gridZ: number) {
  if (isCentralWorldProtectedCell(gridX, gridZ)) return true;
  const x = gridX * HUB_V2_GRID.cellSize, z = gridZ * HUB_V2_GRID.cellSize;
  if (Math.hypot(x, z) > HUB_V2_PLAY_RADIUS - 3) return true;
  if (Math.abs(hubTerrainHeight(x, z)) > HUB_V2_FLAT_TOLERANCE) return true; // river and its banks
  if (hubPathDistance(x, z) < 3) return true;
  if (HUB_V2_BRIDGES.some((b) => Math.abs(z - b.z) < b.width / 2 + 2 && x > b.x0 - 3 && x < b.x1 + 3)) return true;
  if (HUB_V2_PADS.some((p) => Math.hypot(x - p.x, z - p.z) < p.r + 3)) return true;
  return HUB_V2_COLLIDERS.some((c) => Math.hypot(x - c.x, z - c.z) < c.r + 1.2);
}

/** Squares nobody can build on: the Tower, river, bridges, paths, clearings, gums and boulders. Computed once. */
export function hubIsReservedCell(gridX: number, gridZ: number) {
  if (!reservedCells) {
    reservedCells = new Set();
    for (let gx = HUB_V2_GRID.minX; gx <= HUB_V2_GRID.maxX; gx++) for (let gz = HUB_V2_GRID.minZ; gz <= HUB_V2_GRID.maxZ; gz++) if (computeReserved(gx, gz)) reservedCells.add(`${gx}:${gz}`);
  }
  return reservedCells.has(`${gridX}:${gridZ}`);
}

export const HUB_V2_BUILD_RULES: CentralWorldBuildRules = { grid: HUB_V2_GRID, isReservedCell: hubIsReservedCell, fixedHome: true };
