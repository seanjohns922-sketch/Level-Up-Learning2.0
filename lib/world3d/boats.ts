// Boats: four to collect and ride on any water in the hub (painted ponds, Swimming Lakes and the river).
// Walk into water and tap BOAT; they only go where it's deep enough, and EXIT BOAT puts you on the nearest
// bank. Bought once in the Marketplace's Swimming & boats tab. Pure, so it can be tested.
import type { EconomyItem } from "@/lib/economy";
import { SWIM_SURFACE_Y, waterReach, type WaterAreas } from "./swimming";
import type { Handling } from "./race-driving";

export const BOAT_STYLES = ["kayak", "tinny", "swan", "speedboat"] as const;
export type BoatStyle = (typeof BOAT_STYLES)[number];

/** Metres per second on the water (boats have no "off-road": `offRoad` matches `top`). */
export const BOAT_SPECS: Record<BoatStyle, { name: string; description: string; price: number; accent: string; handling: Handling }> = {
  kayak: { name: "Kayak", description: "Paddle anywhere there's water. Your first boat.", price: 300, accent: "#ffcf1a", handling: { top: 5, offRoad: 5, reverse: 2 } },
  tinny: { name: "Aussie Tinny", description: "A little aluminium boat with an outboard motor. Putt-putt round the lake.", price: 500, accent: "#b8c2cc", handling: { top: 8, offRoad: 8, reverse: 3 } },
  swan: { name: "Swan Pedal Boat", description: "Pedal a giant swan round the water. Slow, and very fancy.", price: 700, accent: "#f6f6f2", handling: { top: 4.5, offRoad: 4.5, reverse: 2 } },
  speedboat: { name: "Speedboat", description: "The fastest thing on the water, with a big white wake.", price: 1000, accent: "#e5302a", handling: { top: 14, offRoad: 14, reverse: 4 } },
};

export const boatItemKey = (style: BoatStyle) => `central_world_boat_${style}`;
export function ownedBoats(owned: ReadonlySet<string>): BoatStyle[] {
  return BOAT_STYLES.filter((style) => owned.has(boatItemKey(style)));
}

const baseItem = { category: "decoration" as const, realm_id: null, active: true, purchasable: true, discoverable: true };
/** Shop rows: bought once in the Swimming & boats tab, launched from any water. */
export const BOAT_SHOP_ITEMS: EconomyItem[] = BOAT_STYLES.map((style, index) => ({
  ...baseItem,
  item_key: boatItemKey(style),
  name: BOAT_SPECS[style].name,
  description: `${BOAT_SPECS[style].description} Wade into any water and tap BOAT to ride it.`,
  rarity: BOAT_SPECS[style].price >= 1000 ? "legendary" : BOAT_SPECS[style].price >= 700 ? "epic" : "rare",
  price: BOAT_SPECS[style].price,
  icon: "sailboat",
  accent: BOAT_SPECS[style].accent,
  sort_order: 50 + index,
  metadata: { marketplaceCategory: "water", boatStyle: style, marketplace_visual: { type: "asset", src: `/marketplace/world-renders/boat_${style}.webp`, alt: `${BOAT_SPECS[style].name}: the actual boat`, previewMode: "world" } },
}));
export const BOAT_ITEM_KEYS = new Set(BOAT_SHOP_ITEMS.map((item) => item.item_key));

/** The boat to ride: the last one chosen if still owned, otherwise the first owned. */
export function boatToRide(chosen: BoatStyle | null, owned: ReadonlySet<string>): BoatStyle | null {
  const boats = ownedBoats(owned);
  return chosen && boats.includes(chosen) ? chosen : boats[0] ?? null;
}

/** How far in from the bank a boat must stay: about half its width, so it never beaches. */
const BOAT_CLEARANCE = 1.2;
/** The river: its surface and how deep it is at a spot (0 on land). */
export type RiverWater = { surfaceY: number; depthAt: (x: number, z: number) => number };

/** The water surface a boat floats on at a spot, or null where it can't go (land, or too near the bank). */
export function boatWaterAt(areas: WaterAreas, river: RiverWater | null, x: number, z: number): number | null {
  if (waterReach(areas, x, z) >= BOAT_CLEARANCE) return SWIM_SURFACE_Y;
  if (river && river.depthAt(x, z) >= 0.6) return river.surfaceY;
  return null;
}

/** The nearest dry ground to a spot on the water, searching outward in 16 directions (for EXIT BOAT). */
export function nearestBank(isDry: (x: number, z: number) => boolean, x: number, z: number, maxDistance = 40): { x: number; z: number } | null {
  for (let r = 1; r <= maxDistance; r += 0.5) {
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2, px = x + Math.sin(a) * r, pz = z + Math.cos(a) * r;
      // A step further in, so the explorer lands on the grass, not on the edge.
      if (isDry(px, pz) && isDry(px + Math.sin(a), pz + Math.cos(a))) return { x: px + Math.sin(a), z: pz + Math.cos(a) };
    }
  }
  return null;
}

/** The heading with the longest run of water ahead (up to 20 m), so a launched boat points out into the
 * lake rather than at the bank; ties go to the way the camera already looks. */
export function openWaterHeading(isWater: (x: number, z: number) => boolean, x: number, z: number, preferred: number) {
  let best = preferred, bestRun = -1;
  for (let i = 0; i < 16; i++) {
    const heading = preferred + (i / 16) * Math.PI * 2;
    let run = 0;
    while (run < 20 && isWater(x + Math.sin(heading) * (run + 0.5), z + Math.cos(heading) * (run + 0.5))) run += 0.5;
    if (run > bestRun) { best = heading; bestRun = run; }
  }
  return best;
}
