import type { EconomyItem } from "@/lib/economy";
import type { CentralWorldPlacement } from "./central-world-layout";

/** The Skate Kit: kids place skate pieces anywhere and the avatar rides them.
 * Unlocking the kit and each kit upgrade are XP purchases (server-checked); the kit
 * level decides which pieces are in the Skate tab, and at Level 4 every piece goes neon.
 * Pieces themselves are free to place once their level is unlocked. */
export type KitLevel = 0 | 1 | 2 | 3 | 4;
export const SKATE_KIT = {
  name: "Skate Kit",
  description: "Build your own skate park anywhere: ramps, rails, a bowl and more. Then ride it! Upgrades unlock bigger pieces and neon.",
  levels: ["Street Starter", "Mini Ramp Pack", "Half-Pipe and Bowl Pack", "Neon Vert Pack"] as const,
  prices: [400, 400, 800, 1600] as const,
  unlockKey: "central_world_kit_skate",
  upgradeKey: (level: 2 | 3 | 4) => `central_world_kit_upgrade_skate_${level}`,
};

/** Model units to world metres, the same as the premium homes. */
export const SKATE_SCALE = 2.4;

type Shape =
  | { kind: "pad"; size: number }
  | { kind: "quarter"; w: number; h: number }
  | { kind: "kicker"; w: number; len: number; h: number }
  | { kind: "rail"; len: number; h: number }
  | { kind: "box"; w: number; d: number; h: number; ramp: number }
  | { kind: "stairs"; w: number; steps: number; rise: number; run: number }
  | { kind: "bowl"; r: number; depth: number }
  | { kind: "spine"; w: number; h: number };

export type SkatePiece = { assetKey: string; name: string; level: 1 | 2 | 3 | 4; gridSize: `${number}x${number}`; shape: Shape };

export const SKATE_PIECES: SkatePiece[] = [
  { assetKey: "skate_pad", name: "Concrete Pad", level: 1, gridSize: "2x2", shape: { kind: "pad", size: 4 / SKATE_SCALE } },
  { assetKey: "skate_quarter_small", name: "Small Quarter Pipe", level: 1, gridSize: "2x2", shape: { kind: "quarter", w: 1.6, h: 0.8 } },
  { assetKey: "skate_kicker", name: "Kicker", level: 1, gridSize: "1x2", shape: { kind: "kicker", w: 0.75, len: 0.8, h: 0.3 } },
  { assetKey: "skate_rail", name: "Flat Rail", level: 1, gridSize: "2x1", shape: { kind: "rail", len: 1.6, h: 0.3 } },
  { assetKey: "skate_funbox", name: "Funbox", level: 2, gridSize: "3x1", shape: { kind: "box", w: 1.1, d: 0.7, h: 0.3, ramp: 0.5 } },
  { assetKey: "skate_stairs", name: "Stairs and Handrail", level: 2, gridSize: "2x2", shape: { kind: "stairs", w: 1.2, steps: 3, rise: 0.12, run: 0.28 } },
  { assetKey: "skate_quarter", name: "Quarter Pipe", level: 2, gridSize: "3x2", shape: { kind: "quarter", w: 2.3, h: 1.0 } },
  { assetKey: "skate_quarter_big", name: "Big Quarter Pipe", level: 3, gridSize: "4x3", shape: { kind: "quarter", w: 3.0, h: 1.5 } },
  { assetKey: "skate_bowl", name: "Skate Bowl", level: 3, gridSize: "4x4", shape: { kind: "bowl", r: 1.4, depth: 0.9 } },
  { assetKey: "skate_spine", name: "Spine Ramp", level: 3, gridSize: "2x2", shape: { kind: "spine", w: 1.5, h: 0.65 } },
  { assetKey: "skate_vert", name: "Vert Ramp", level: 4, gridSize: "4x4", shape: { kind: "quarter", w: 3.0, h: 2.0 } },
];
const PIECE_BY_ASSET = new Map(SKATE_PIECES.map((piece) => [piece.assetKey, piece]));
export const SKATE_PIECE_KEYS = new Set(PIECE_BY_ASSET.keys());
export function skatePiece(assetKey: unknown): SkatePiece | null {
  return typeof assetKey === "string" ? PIECE_BY_ASSET.get(assetKey) ?? null : null;
}

/** Skate Kit level from what the learner owns: 0 until unlocked, then the highest upgrade. */
export function skateKitLevel(ownedItemKeys: ReadonlySet<string>): KitLevel {
  if (!ownedItemKeys.has(SKATE_KIT.unlockKey)) return 0;
  for (const level of [4, 3, 2] as const) if (ownedItemKeys.has(SKATE_KIT.upgradeKey(level))) return level;
  return 1;
}
export function nextSkateKitUpgrade(ownedItemKeys: ReadonlySet<string>) {
  const level = skateKitLevel(ownedItemKeys);
  if (level === 0 || level === 4) return null;
  const next = (level + 1) as 2 | 3 | 4;
  return { level: next, itemKey: SKATE_KIT.upgradeKey(next), name: SKATE_KIT.levels[next - 1], price: SKATE_KIT.prices[next - 1] };
}

/* ───────── Ride heights (model units in, model units out) ───────── */

/** Depth a quarter pipe takes up behind its bottom edge (curve plus a deck to stand on). */
export const quarterDepth = (h: number) => h + 0.5;
const curve = (h: number, s: number) => h - Math.sqrt(Math.max(0, h * h - s * s));

/** Height of a piece's riding surface at a local point (centred on the piece, front is +z). */
export function skateShapeHeight(shape: Shape, x: number, z: number): number | null {
  switch (shape.kind) {
    case "pad": return Math.abs(x) <= shape.size / 2 && Math.abs(z) <= shape.size / 2 ? 0.04 : null;
    case "quarter": {
      if (Math.abs(x) > shape.w / 2) return null;
      const depth = quarterDepth(shape.h), front = depth / 2, s = front - z;
      if (s < 0 || s > depth) return null;
      return s >= shape.h ? shape.h : curve(shape.h, s);
    }
    case "spine": {
      if (Math.abs(x) > shape.w / 2 || Math.abs(z) > shape.h) return null;
      return curve(shape.h, shape.h - Math.abs(z));
    }
    case "kicker": {
      if (Math.abs(x) > shape.w / 2 || Math.abs(z) > shape.len / 2) return null;
      return shape.h * (0.5 - z / shape.len);
    }
    case "box": {
      const half = shape.w / 2 + shape.ramp;
      if (Math.abs(x) > half || Math.abs(z) > shape.d / 2) return null;
      return Math.abs(x) <= shape.w / 2 ? shape.h : shape.h * (half - Math.abs(x)) / shape.ramp;
    }
    case "stairs": {
      const depth = shape.steps * shape.run;
      if (Math.abs(x) > shape.w / 2 || Math.abs(z) > depth / 2) return null;
      const step = Math.min(shape.steps - 1, Math.floor((depth / 2 - z) / shape.run));
      return shape.rise * (shape.steps - step);
    }
    case "bowl": {
      const rho = Math.hypot(x, z), inner = shape.r * 0.45;
      if (rho > shape.r + 0.16) return null;
      if (rho >= shape.r) return shape.depth;
      return rho <= inner ? 0.02 : shape.depth * (rho - inner) / (shape.r - inner);
    }
    case "rail": return null;
  }
}

export type PlacedSkatePiece = { x: number; z: number; rotation: CentralWorldPlacement["rotation"]; piece: SkatePiece };

/** World-space riding height at (x, z) over the placed pieces, or null when not on any piece. */
export function skateHeightAt(x: number, z: number, pieces: readonly PlacedSkatePiece[]): number | null {
  let best: number | null = null;
  for (const { x: px, z: pz, rotation, piece } of pieces) {
    const a = (rotation * Math.PI) / 180, dx = (x - px) / SKATE_SCALE, dz = (z - pz) / SKATE_SCALE;
    // Undo the piece's turn: the model is rotated by +a about y.
    const lx = dx * Math.cos(a) - dz * Math.sin(a), lz = dx * Math.sin(a) + dz * Math.cos(a);
    const h = skateShapeHeight(piece.shape, lx, lz);
    if (h !== null && (best === null || h * SKATE_SCALE > best)) best = h * SKATE_SCALE;
  }
  return best;
}

/* ───────── Shop and editor rows ───────── */
const KIT_VISUAL = { type: "asset", src: "/marketplace/world-renders/kit_skate.webp", alt: "Skate Kit: a park built from its pieces", previewMode: "world" };
export const SKATE_KIT_SHOP_ITEMS: EconomyItem[] = [
  {
    item_key: SKATE_KIT.unlockKey, name: SKATE_KIT.name, description: SKATE_KIT.description,
    category: "decoration", realm_id: null, rarity: "epic", price: SKATE_KIT.prices[0], icon: "skateboard", accent: "#ff4fd8",
    active: true, purchasable: true, discoverable: true, sort_order: 4,
    metadata: { marketplaceCategory: "kits", buildKit: "skate", marketplace_visual: KIT_VISUAL },
  },
  ...([2, 3, 4] as const).map((level): EconomyItem => ({
    item_key: SKATE_KIT.upgradeKey(level), name: `${SKATE_KIT.name}: ${SKATE_KIT.levels[level - 1]}`,
    description: `Skate Kit level ${level}: ${SKATE_KIT.levels[level - 1]}. New pieces appear in the Skate tab.`,
    category: "decoration", realm_id: null, rarity: level === 4 ? "legendary" : level === 3 ? "epic" : "rare",
    price: SKATE_KIT.prices[level - 1], icon: "skateboard", accent: "#ff4fd8", active: true, purchasable: true, discoverable: true, sort_order: 950 + level,
    metadata: { marketplaceCategory: "kit_upgrades", marketplaceHidden: true, buildKit: "skate", buildKitLevel: level },
  })),
];
export const SKATE_KIT_ITEM_KEYS = new Set(SKATE_KIT_SHOP_ITEMS.map((item) => item.item_key));
