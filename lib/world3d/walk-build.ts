// Walk-and-place building: the explorer carries an item and it goes down on the
// square in front of them, Minecraft-style. Big things start in the bird's-eye
// planner instead; kids can switch either way and the hub remembers their choice.
import type { EconomyItem } from "@/lib/economy";
import { CENTRAL_WORLD_HOME_KEY, type CentralWorldGroundType } from "./central-world-layout";
import { EVERYDAY_STYLES, premiumHomeStyle } from "./premium-homes";
import { isRealmBuilding } from "./realm-building-collections";
import { isTrainAsset } from "./train-catalogue";
import { isVillageBuilding } from "./village-buildings";

export type PlaceView = "walk" | "plan";
export type ItemSize = "small" | "big";

/** Anything wider than this many squares counts as big. */
export const SMALL_ITEM_MAX_SQUARES = 3;
const BIG_CATEGORIES = new Set(["buildings", "pools_play", "special", "defence", "trains", "home"]);

/** Homes, rides, courts, defences, buildings and trains, and anything over 3 × 3 squares. */
export function itemSize(item: EconomyItem, gridSize: [number, number]): ItemSize {
  const assetKey = item.metadata.worldAssetKey;
  if (item.item_key === CENTRAL_WORLD_HOME_KEY || BIG_CATEGORIES.has(String(item.metadata.marketplaceCategory))) return "big";
  // The Tower's defences are planned round it; the laser fence is laid like any fence.
  if (assetKey === "defence_laser_fence") return "small";
  if (item.metadata.worldSceneryGroup === "fortress") return "big";
  // Premium homes and rides are big; the upgradeable everyday pieces (lamp, bench, fence...) are not.
  const premium = premiumHomeStyle(assetKey);
  const everyday = (EVERYDAY_STYLES as readonly string[]).includes(String(premium));
  if (isVillageBuilding(assetKey) || isRealmBuilding(assetKey) || (premium && !everyday) || isTrainAsset(assetKey)) return "big";
  return Math.max(gridSize[0], gridSize[1]) > SMALL_ITEM_MAX_SQUARES ? "big" : "small";
}

export const DEFAULT_PLACE_VIEWS: Readonly<Record<ItemSize, PlaceView>> = { small: "walk", big: "plan" };
const VIEW_KEY = "lul:central-world:place-view:v1";

export function readPlaceViews(scope: string): Record<ItemSize, PlaceView> {
  try {
    const saved = JSON.parse(localStorage.getItem(`${VIEW_KEY}:${scope}`) ?? "{}") as Partial<Record<ItemSize, unknown>>;
    const view = (size: ItemSize): PlaceView => (saved[size] === "walk" || saved[size] === "plan" ? saved[size] : DEFAULT_PLACE_VIEWS[size]);
    return { small: view("small"), big: view("big") };
  } catch {
    return { ...DEFAULT_PLACE_VIEWS };
  }
}

export function writePlaceViews(scope: string, views: Record<ItemSize, PlaceView>) {
  try { localStorage.setItem(`${VIEW_KEY}:${scope}`, JSON.stringify(views)); } catch { /* the choice just isn't remembered */ }
}

/** The eight ways a held item can sit from the explorer: straight ahead, behind, either side, or diagonal. */
function snappedStep(aim: number): [number, number] {
  const eighth = Math.round(aim / (Math.PI / 4)) * (Math.PI / 4);
  return [Math.round(Math.sin(eighth)), Math.round(Math.cos(eighth))];
}

/** Squares from the explorer's square to an item's middle, so its near edge is on the very next square. */
const stepsOut = (gridSize: [number, number]) => 1 + Math.floor(Math.max(gridSize[0], gridSize[1]) / 2);

/**
 * The square an item of this size goes on: the next square in front of the one the explorer
 * stands on (bigger items reach further, so their near edge is still that next square).
 * `aim` is a heading where 0 looks along +z; it snaps to the nearest of eight directions.
 */
export function frontCell(x: number, z: number, aim: number, gridSize: [number, number], cellSize: number) {
  const foot = footCell(x, z, cellSize);
  const [stepX, stepZ] = snappedStep(aim);
  const steps = stepsOut(gridSize);
  return { gridX: foot.gridX + stepX * steps, gridZ: foot.gridZ + stepZ * steps };
}

export function footCell(x: number, z: number, cellSize: number) {
  return { gridX: Math.round(x / cellSize), gridZ: Math.round(z / cellSize) };
}

/** Where to stand (in metres), looking towards the Tower, so an item is back in front of the explorer. */
export function standBehind(gridX: number, gridZ: number, gridSize: [number, number], cellSize: number): [number, number] {
  return [gridX * cellSize, (gridZ + stepsOut(gridSize)) * cellSize];
}

// The hotbar: an item key, or a ground brush written "tool:path".
export type HotbarEntry = string;
/** Slots on the hotbar (two rows), which is also how many favourites a builder can keep. */
export const HOTBAR_SLOTS = 15;
const TOOL_PREFIX = "tool:";
export const hotbarTool = (tool: CentralWorldGroundType): HotbarEntry => `${TOOL_PREFIX}${tool}`;
export function hotbarToolOf(entry: HotbarEntry): CentralWorldGroundType | null {
  if (!entry.startsWith(TOOL_PREFIX)) return null;
  const tool = entry.slice(TOOL_PREFIX.length);
  return tool === "path" || tool === "road" || tool === "stone" || tool === "water" || tool === "track" ? tool : null;
}

export type Hotbar = { pins: HotbarEntry[]; recent: HotbarEntry[] };
const HOTBAR_KEY = "lul:central-world:hotbar:v1";

export function readHotbar(scope: string): Hotbar {
  try {
    const saved = JSON.parse(localStorage.getItem(`${HOTBAR_KEY}:${scope}`) ?? "null") as Partial<Hotbar> | null;
    const list = (value: unknown) => (Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === "string").slice(0, HOTBAR_SLOTS) : []);
    return { pins: list(saved?.pins), recent: list(saved?.recent) };
  } catch {
    return { pins: [], recent: [] };
  }
}

export function writeHotbar(scope: string, hotbar: Hotbar) {
  try { localStorage.setItem(`${HOTBAR_KEY}:${scope}`, JSON.stringify(hotbar)); } catch { /* the hotbar just isn't remembered */ }
}

/** The newest pick goes first; pinned entries keep their own slots. */
export function rememberHotbarEntry(hotbar: Hotbar, entry: HotbarEntry): Hotbar {
  return { pins: hotbar.pins, recent: [entry, ...hotbar.recent.filter((other) => other !== entry)].slice(0, HOTBAR_SLOTS) };
}

export const favouritesFull = (hotbar: Hotbar) => hotbar.pins.length >= HOTBAR_SLOTS;

/** Adds a favourite (unless all 15 are taken) or takes one away. */
export function togglePin(hotbar: Hotbar, entry: HotbarEntry): Hotbar {
  if (hotbar.pins.includes(entry)) return { pins: hotbar.pins.filter((other) => other !== entry), recent: hotbar.recent };
  return favouritesFull(hotbar) ? hotbar : { pins: [...hotbar.pins, entry], recent: hotbar.recent };
}

/**
 * What the slots show: pins first, then recent picks, then the starters, skipping
 * anything this learner can't place right now.
 */
/** What a new builder's hotbar starts with. */
export const HOTBAR_STARTERS: readonly HotbarEntry[] = [
  hotbarTool("path"), "central_world_starter_lamp", "central_world_starter_fence", "central_world_starter_bench",
  "central_world_starter_shrub", "central_world_starter_tree", "central_world_starter_flowers", "central_world_starter_mailbox",
  hotbarTool("water"), "central_world_starter_pine", "central_world_starter_boulder", "central_world_starter_campfire",
  "central_world_starter_picnic_table", "central_world_starter_flag", "central_world_starter_kangaroo",
];

export function hotbarSlots(hotbar: Hotbar, starters: readonly HotbarEntry[], available: (entry: HotbarEntry) => boolean): HotbarEntry[] {
  const slots: HotbarEntry[] = [];
  for (const entry of [...hotbar.pins, ...hotbar.recent, ...starters]) {
    if (slots.length === HOTBAR_SLOTS) break;
    if (!slots.includes(entry) && available(entry)) slots.push(entry);
  }
  return slots;
}
