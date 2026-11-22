// Roads & Cars: four cars to collect and drive anywhere in the hub. Fast on roads, and each car has
// its own feel on grass (the 4WD barely slows, the sports car crawls). Pure, so it can be tested.
import type { EconomyItem } from "@/lib/economy";
import { CENTRAL_WORLD_GRID, placementGroundCells, type CentralWorldGroundTile, type CentralWorldPlacement } from "./central-world-layout";
import { TRACK_TILE } from "./race-kit";
import { RAIL_KEYS } from "./railway";
import type { Handling, RaceCourse } from "./race-driving";

export const CAR_STYLES = ["hatch", "ute", "four_wd", "sports"] as const;
export type CarStyle = (typeof CAR_STYLES)[number];

/** World metres per second: on roads (and race tarmac), and on grass. */
export const CAR_SPECS: Record<CarStyle, { name: string; description: string; price: number; accent: string; handling: Handling }> = {
  hatch: { name: "City Hatch", description: "A bright, zippy little hatchback. Your first car.", price: 300, accent: "#ff5e57", handling: { top: 15, offRoad: 7, reverse: 5 } },
  ute: { name: "Aussie Ute", description: "A ute with a roo bar up front and a surfboard in the tray. Handles a bit of grass.", price: 500, accent: "#f5f5f0", handling: { top: 15, offRoad: 9, reverse: 5 } },
  four_wd: { name: "Adventure 4WD", description: "Big chunky tyres and a kayak on the roof. Drives almost as fast on grass as on roads.", price: 700, accent: "#3f6b4a", handling: { top: 14, offRoad: 12.5, reverse: 5 } },
  sports: { name: "Volt GT", description: "A low electric sports car with neon underglow. The fastest on roads, but it hates grass.", price: 1000, accent: "#7a46e0", handling: { top: 20, offRoad: 4.5, reverse: 5 } },
};

/** Paint colours, free to change any time. */
export const CAR_COLOURS = ["#ff5e57", "#4c8dff", "#ffcc33", "#f5f5f0", "#2b2f36", "#3f6b4a", "#7a46e0", "#ff7ac8"] as const;

export const carItemKey = (style: CarStyle) => `central_world_car_${style}`;
const STYLE_BY_KEY = new Map(CAR_STYLES.map((style) => [carItemKey(style), style]));
export const carStyleOf = (itemKey: string) => STYLE_BY_KEY.get(itemKey) ?? null;
export function ownedCars(owned: ReadonlySet<string>): CarStyle[] {
  return CAR_STYLES.filter((style) => owned.has(carItemKey(style)));
}

const baseItem = { category: "decoration" as const, realm_id: null, active: true, purchasable: true, discoverable: true };
/** Shop rows: bought once in the Marketplace's Cars tab, driven from any carport. */
export const CAR_SHOP_ITEMS: EconomyItem[] = CAR_STYLES.map((style, index) => ({
  ...baseItem,
  item_key: carItemKey(style),
  name: CAR_SPECS[style].name,
  description: `${CAR_SPECS[style].description} Park it at a carport and drive it round your roads.`,
  rarity: CAR_SPECS[style].price >= 1000 ? "legendary" : CAR_SPECS[style].price >= 700 ? "epic" : "rare",
  price: CAR_SPECS[style].price,
  icon: "car",
  accent: CAR_SPECS[style].accent,
  sort_order: 40 + index,
  metadata: { marketplaceCategory: "cars", carStyle: style, marketplace_visual: { type: "asset", src: `/marketplace/world-renders/car_${style}.webp`, alt: `${CAR_SPECS[style].name}: the actual car`, previewMode: "world" } },
}));
export const CAR_ITEM_KEYS = new Set(CAR_SHOP_ITEMS.map((item) => item.item_key));

/** The carport: a free place to park, where you get in and out. */
export const CARPORT_ASSET_KEY = "carport";

/** The car the learner last chose and its paint, kept per device. */
export type CarChoice = { style: CarStyle | null; colour: string };
const CHOICE_KEY = "lul:central-world:car:v1";
export function readCarChoice(scope: string): CarChoice {
  try {
    const saved = JSON.parse(localStorage.getItem(`${CHOICE_KEY}:${scope}`) ?? "{}") as Partial<CarChoice>;
    const style = CAR_STYLES.find((s) => s === saved.style) ?? null;
    const colour = CAR_COLOURS.find((c) => c === saved.colour) ?? CAR_COLOURS[0];
    return { style, colour };
  } catch {
    return { style: null, colour: CAR_COLOURS[0] };
  }
}
export function writeCarChoice(scope: string, choice: CarChoice) {
  try { localStorage.setItem(`${CHOICE_KEY}:${scope}`, JSON.stringify(choice)); } catch { /* the choice just isn't remembered */ }
}
/** The car to drive: the chosen one if still owned, otherwise the first owned. */
export function carToDrive(choice: CarChoice, owned: ReadonlySet<string>): CarStyle | null {
  const cars = ownedCars(owned);
  return choice.style && cars.includes(choice.style) ? choice.style : cars[0] ?? null;
}
export const nextOf = <T,>(list: readonly T[], current: T) => list[(list.indexOf(current) + 1) % list.length];

/** Roads and race tarmac count as road; everything else is off-road. */
export function buildDriveCourse(tiles: readonly CentralWorldGroundTile[]): RaceCourse {
  return { track: new Set(tiles.filter((t) => t.tileType === "road" || t.tileType === TRACK_TILE).map((t) => `${t.gridX}:${t.gridZ}`)), boosts: [], jumps: [], bridges: [], solids: [] };
}

/** Flat things a car rolls over: rails, race pieces on the track, stepping stones and the like. */
const DRIVE_OVER = new Set([...RAIL_KEYS, "race_start", "race_boost", "race_jump", "race_bridge", "stepping_stones", "hopscotch", "pebble_border", "boardwalk", "village_plaza", "stone_steps", CARPORT_ASSET_KEY]);
/** Squares a car can't drive into: anything placed there, unless it's flat enough to drive over. */
export function carBlockedCells(placements: readonly CentralWorldPlacement[], itemsById: ReadonlyMap<string, EconomyItem>): Set<string> {
  const blocked = new Set<string>();
  for (const placement of placements) {
    const item = itemsById.get(placement.itemId);
    if (!item || DRIVE_OVER.has(String(item.metadata.worldAssetKey))) continue;
    for (const cell of placementGroundCells(placement, item)) blocked.add(`${cell.gridX}:${cell.gridZ}`);
  }
  return blocked;
}
export const cellAt = (x: number, z: number) => `${Math.round(x / CENTRAL_WORLD_GRID.cellSize)}:${Math.round(z / CENTRAL_WORLD_GRID.cellSize)}`;
