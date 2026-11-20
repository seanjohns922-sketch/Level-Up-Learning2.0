import type { EconomyItem } from "@/lib/economy";
import { buildKitShopItems, defineBuildKit } from "./build-kits";

/** The Race Kit: paint tarmac anywhere to make your own track, add race pieces, then race it.
 * Kit Level 2 adds kerbs along every track edge; Level 4 turns the track neon. */
export const RACE_KIT = defineBuildKit({
  id: "race",
  name: "Race Kit",
  tab: "Race",
  description: "Paint your own race track anywhere, any shape, then race it! Upgrades add kerbs, tyre walls, jumps, boost pads, bridges and neon.",
  levels: ["Tarmac Starter", "Race Day Pack", "Stunt Pack", "Neon Night Pack"],
  prices: [500, 450, 900, 1800],
  accent: "#3fd0ff",
  icon: "flag",
  sortOrder: 3,
  artCaption: "a track painted and built with it",
});

/** Model units to world metres: one model unit is one 2 m build cell. */
export const RACE_SCALE = 2;

export type RacePiece = { assetKey: string; name: string; level: 1 | 2 | 3 | 4; gridSize: `${number}x${number}` };
export const RACE_PIECES: RacePiece[] = [
  { assetKey: "race_start", name: "Start and Finish Line", level: 1, gridSize: "4x1" },
  { assetKey: "race_tyres", name: "Tyre Wall", level: 2, gridSize: "2x1" },
  { assetKey: "race_grandstand", name: "Grandstand", level: 2, gridSize: "4x2" },
  { assetKey: "race_jump", name: "Jump Ramp", level: 3, gridSize: "1x1" },
  { assetKey: "race_boost", name: "Boost Pad", level: 3, gridSize: "1x1" },
  { assetKey: "race_bridge", name: "Track Bridge", level: 3, gridSize: "2x4" },
  { assetKey: "race_floodlight", name: "Floodlight", level: 4, gridSize: "1x1" },
  { assetKey: "race_podium", name: "Winners' Podium", level: 4, gridSize: "2x1" },
];
export const RACE_PIECE_KEYS = new Set(RACE_PIECES.map((piece) => piece.assetKey));

export const RACE_KIT_SHOP_ITEMS: EconomyItem[] = buildKitShopItems(RACE_KIT);
export const RACE_KIT_ITEM_KEYS = new Set(RACE_KIT_SHOP_ITEMS.map((item) => item.item_key));

/** Painted track cells are a ground tile type, like paths and water. */
export const TRACK_TILE = "track" as const;

/** A track cell that joins exactly one neighbour ahead and one to the side is a turn: it is drawn as a
 * rounded corner. Returns the grid direction of the corner it turns round (the sum of the two
 * neighbour directions), or null for a straight, an end, a junction or a lone cell. */
export function trackCorner(gridX: number, gridZ: number, track: ReadonlySet<string>): [number, number] | null {
  const joined = ([[1, 0], [-1, 0], [0, 1], [0, -1]] as const).filter(([dx, dz]) => track.has(`${gridX + dx}:${gridZ + dz}`));
  if (joined.length !== 2) return null;
  const [a, b] = joined;
  if (a[0] + b[0] === 0 && a[1] + b[1] === 0) return null;
  return [a[0] + b[0], a[1] + b[1]];
}
