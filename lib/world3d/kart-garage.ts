import type { EconomyItem } from "@/lib/economy";

/** The kart garage: everyone with the Race Kit drives the Starter Kart. Each realm has its own kart,
 * bought with XP once the learner has finished a level in that realm (the server checks both).
 * Parts are bought once and fit any kart. The kart and parts in use are equipped slots. */

export const KART_REALMS = ["number", "measurement", "space", "statistics", "pattern", "chance"] as const;
export type KartRealm = (typeof KART_REALMS)[number];
export type KartStyle = KartRealm | "starter";

export const KART_COLOURS: Record<KartStyle, { name: string; body: string; trim: string; accent: string }> = {
  starter: { name: "Starter Kart", body: "#e9ecf2", trim: "#3fd0ff", accent: "#ff4fd8" },
  number: { name: "Number Nexus Kart", body: "#14b8a6", trim: "#10b981", accent: "#5eead4" },
  measurement: { name: "Measurelands Kart", body: "#b8893a", trim: "#d6b86c", accent: "#fff1c4" },
  space: { name: "Starpath Kart", body: "#7c3aed", trim: "#06b6d4", accent: "#a5f3fc" },
  statistics: { name: "Statistica Kart", body: "#a83e4b", trim: "#f2bc45", accent: "#f2bc45" },
  pattern: { name: "Pattern Peaks Kart", body: "#059669", trim: "#7c3aed", accent: "#6ee7b7" },
  chance: { name: "Chance Hollow Kart", body: "#be3455", trim: "#fbbf24", accent: "#fb7185" },
};
/** The realm names learners see, for "Finish a level in … to unlock". */
export const KART_REALM_NAMES: Record<KartRealm, string> = {
  number: "Number Nexus", measurement: "Measurelands", space: "Starpath", statistics: "Statistica", pattern: "Pattern Peaks", chance: "Chance Hollow",
};

export type KartParts = { spoiler?: "wing" | "fin" | "jet"; wheels?: "chunky" | "neon"; trail?: boolean };

export const KART_SLOT = "kart";
export const KART_PART_SLOTS = { spoiler: "kart_spoiler", wheels: "kart_wheels", trail: "kart_trail" } as const;
export type KartPartGroup = keyof typeof KART_PART_SLOTS;

export const KART_PRICE = 400;
export type KartPart = { id: string; group: KartPartGroup; name: string; price: number; parts: KartParts };
export const KART_PARTS: KartPart[] = [
  { id: "wing", group: "spoiler", name: "Racing Wing", price: 150, parts: { spoiler: "wing" } },
  { id: "fin", group: "spoiler", name: "Shark Fin", price: 200, parts: { spoiler: "fin" } },
  { id: "jet", group: "spoiler", name: "Twin Jets", price: 500, parts: { spoiler: "jet" } },
  { id: "chunky", group: "wheels", name: "Chunky Tyres", price: 150, parts: { wheels: "chunky" } },
  { id: "neon", group: "wheels", name: "Neon Rims", price: 350, parts: { wheels: "neon" } },
  { id: "trail", group: "trail", name: "Sparkle Trail", price: 400, parts: { trail: true } },
];
export const KART_PART_GROUP_NAMES: Record<KartPartGroup, string> = { spoiler: "Spoiler", wheels: "Wheels", trail: "Trail" };

export const kartItemKey = (realm: KartRealm) => `central_world_kart_${realm}`;
export const kartPartItemKey = (part: KartPart) => `central_world_kart_part_${part.id}`;

const baseItem = { category: "decoration" as const, realm_id: null, active: true, purchasable: true, discoverable: false };

export const KART_SHOP_ITEMS: EconomyItem[] = KART_REALMS.map((realm, index) => ({
  ...baseItem,
  item_key: kartItemKey(realm),
  name: KART_COLOURS[realm].name,
  description: `Race in ${KART_REALM_NAMES[realm]} colours. Unlocks once you finish a level in ${KART_REALM_NAMES[realm]}.`,
  rarity: "epic",
  price: KART_PRICE,
  icon: "car",
  accent: KART_COLOURS[realm].body,
  sort_order: 960 + index,
  metadata: { slot: KART_SLOT, kart: realm, requiresFinishedLevelIn: realm, marketplaceCategory: "karts", marketplaceHidden: true },
}));
export const KART_PART_SHOP_ITEMS: EconomyItem[] = KART_PARTS.map((part, index) => ({
  ...baseItem,
  item_key: kartPartItemKey(part),
  name: part.name,
  description: `A ${KART_PART_GROUP_NAMES[part.group].toLowerCase()} for your kart. Buy it once and fit it to any kart.`,
  rarity: part.price >= 400 ? "epic" : part.price >= 300 ? "rare" : "uncommon",
  price: part.price,
  icon: "wrench",
  accent: "#3fd0ff",
  sort_order: 970 + index,
  metadata: { slot: KART_PART_SLOTS[part.group], kartPart: part.id, marketplaceCategory: "kart_parts", marketplaceHidden: true },
}));
export const KART_GARAGE_SHOP_ITEMS = [...KART_SHOP_ITEMS, ...KART_PART_SHOP_ITEMS];
export const KART_GARAGE_ITEM_KEYS = new Set(KART_GARAGE_SHOP_ITEMS.map((item) => item.item_key));

const PART_BY_KEY = new Map(KART_PARTS.map((part) => [kartPartItemKey(part), part]));
const REALM_BY_KEY = new Map(KART_REALMS.map((realm) => [kartItemKey(realm), realm]));

/** The kart and parts the learner drives, from their equipped slots. Anything not owned falls back. */
export function kartSetup(equipped: Readonly<Record<string, string>>, owned: ReadonlySet<string>): { style: KartStyle; parts: KartParts } {
  const kartKey = equipped[KART_SLOT];
  const style = kartKey && owned.has(kartKey) ? REALM_BY_KEY.get(kartKey) ?? "starter" : "starter";
  const parts: KartParts = {};
  for (const slot of Object.values(KART_PART_SLOTS)) {
    const key = equipped[slot];
    const part = key && owned.has(key) ? PART_BY_KEY.get(key) : undefined;
    if (part) Object.assign(parts, part.parts);
  }
  return { style, parts };
}

export type KartAvailability = "driving" | "owned" | "buy" | "locked";
/** Where a realm kart stands for this learner: in use, owned, ready to buy, or locked until they finish a level there. */
export function kartAvailability(realm: KartRealm, current: KartStyle, owned: ReadonlySet<string>, finishedRealms: ReadonlySet<string>): KartAvailability {
  if (current === realm) return "driving";
  if (owned.has(kartItemKey(realm))) return "owned";
  return finishedRealms.has(realm) ? "buy" : "locked";
}
