import type { EconomyItem } from "@/lib/economy";

/** Premium upgradeable items: the four home styles plus the Fair Ride and the trampoline,
 * each with four levels. ("Home" in the names is historical; the live shop rows use it.)
 * Unlocking a style and each upgrade are ordinary XP purchases, so the server
 * checks the balance and records ownership. A style's level is the highest
 * upgrade the learner owns; every copy they place shows that level. */
export const PREMIUM_HOME_STYLES = ["cottage", "modern", "treehouse", "apartment", "fair", "trampoline"] as const;
export type PremiumHomeStyle = (typeof PREMIUM_HOME_STYLES)[number];
export type PremiumHomeLevel = 1 | 2 | 3 | 4;
export const PREMIUM_HOME_MAX_LEVEL: PremiumHomeLevel = 4;

type StyleSpec = {
  name: string;
  description: string;
  levels: readonly [string, string, string, string];
  /** XP to unlock (level 1), then to reach levels 2, 3 and 4. */
  prices: readonly [number, number, number, number];
  gridSize: `${number}x${number}`;
  accent: string;
  icon: string;
  /** World model key; the shop row is central_world_plot_1_<assetKey>. */
  assetKey: string;
  marketplaceCategory: "buildings" | "pools_play";
  upgradePrefix: string;
};
const HOME = { marketplaceCategory: "buildings", upgradePrefix: "central_world_home_upgrade_" } as const;
const SET_PIECE = { marketplaceCategory: "pools_play", upgradePrefix: "central_world_set_upgrade_" } as const;

export const PREMIUM_HOME_SPECS: Record<PremiumHomeStyle, StyleSpec> = {
  cottage: {
    name: "Cottage",
    description: "A storybook home with shingle roofs, shutters, flower boxes and a smoking chimney.",
    levels: ["Cosy Hut", "Cottage", "Family House", "Grand Villa"],
    prices: [300, 300, 600, 1200],
    gridSize: "8x5",
    accent: "#ff5e57",
    icon: "house",
    assetKey: "home_cottage",
    ...HOME,
  },
  modern: {
    name: "Modern Home",
    description: "Flat roofs, big glass walls, timber battens, solar panels and, later, a pool.",
    levels: ["Tiny Cabin", "Modern Home", "Two-Storey with Pool", "Glass Mansion"],
    prices: [500, 400, 800, 1600],
    gridSize: "5x5",
    accent: "#3a3f4a",
    icon: "house",
    assetKey: "home_modern",
    ...HOME,
  },
  treehouse: {
    name: "Treehouse Home",
    description: "Ladders, slides and rope bridges, growing into a glowing giant tree.",
    levels: ["Platform Hut", "Treehouse with Slide", "Two Levels and a Bridge", "Glowing Giant Tree"],
    prices: [600, 450, 900, 1800],
    gridSize: "7x6",
    accent: "#48c25a",
    icon: "trees",
    assetKey: "home_treehouse",
    ...HOME,
  },
  apartment: {
    name: "Apartment Block",
    description: "Grows taller with every upgrade, from a brick walk-up to a sky tower with a rooftop pool.",
    levels: ["3-Storey Walk-up", "5 Storeys with Balconies", "8 Storeys with Rooftop Garden", "Sky Tower with Rooftop Pool"],
    prices: [800, 600, 1200, 2400],
    gridSize: "5x4",
    accent: "#7fa8c9",
    icon: "building-2",
    assetKey: "home_apartment",
    ...HOME,
  },
  fair: {
    name: "Fair Ride",
    description: "A whole fairground that grows with you: carousel, swing ride, then a towering Ferris wheel that glows at night.",
    levels: ["Grand Carousel", "Carousel and Swing Ride", "Ferris Wheel Fair", "Giant Neon Fair"],
    prices: [900, 700, 1400, 2800],
    gridSize: "20x13",
    accent: "#ff4fd8",
    icon: "ferris-wheel",
    assetKey: "ride_fair",
    ...SET_PIECE,
  },
  trampoline: {
    name: "Trampoline",
    description: "Jump on and bounce! Every upgrade bounces you higher, up to a glowing trampoline park.",
    levels: ["Mini Trampoline", "Big Trampoline", "Trampoline and Foam Pit", "Trampoline Park"],
    prices: [250, 250, 500, 1000],
    gridSize: "6x6",
    accent: "#3fd0ff",
    icon: "party-popper",
    assetKey: "play_trampoline",
    ...SET_PIECE,
  },
};

export const premiumHomeAssetKey = (style: PremiumHomeStyle) => PREMIUM_HOME_SPECS[style].assetKey;
export const premiumHomeItemKey = (style: PremiumHomeStyle) => `central_world_plot_1_${premiumHomeAssetKey(style)}`;
export const premiumHomeUpgradeKey = (style: PremiumHomeStyle, level: 2 | 3 | 4) => `${PREMIUM_HOME_SPECS[style].upgradePrefix}${style}_${level}`;

const STYLE_BY_ASSET = new Map(PREMIUM_HOME_STYLES.map((style) => [premiumHomeAssetKey(style), style]));
export function premiumHomeStyle(assetKey: unknown): PremiumHomeStyle | null {
  return typeof assetKey === "string" ? STYLE_BY_ASSET.get(assetKey) ?? null : null;
}
export function isPremiumHome(assetKey: unknown): boolean {
  return premiumHomeStyle(assetKey) !== null;
}

/** The level a learner has reached for one style; 1 once unlocked. */
export function premiumHomeLevel(style: PremiumHomeStyle, ownedItemKeys: ReadonlySet<string>): PremiumHomeLevel {
  for (const level of [4, 3, 2] as const) if (ownedItemKeys.has(premiumHomeUpgradeKey(style, level))) return level;
  return 1;
}
export function premiumHomeLevels(ownedItemKeys: ReadonlySet<string>): Record<PremiumHomeStyle, PremiumHomeLevel> {
  return Object.fromEntries(PREMIUM_HOME_STYLES.map((style) => [style, premiumHomeLevel(style, ownedItemKeys)])) as Record<PremiumHomeStyle, PremiumHomeLevel>;
}
/** The next upgrade to buy, or null at Legendary. */
export function nextPremiumHomeUpgrade(style: PremiumHomeStyle, ownedItemKeys: ReadonlySet<string>) {
  const current = premiumHomeLevel(style, ownedItemKeys);
  if (current >= PREMIUM_HOME_MAX_LEVEL) return null;
  const level = (current + 1) as 2 | 3 | 4;
  const spec = PREMIUM_HOME_SPECS[style];
  return { level, itemKey: premiumHomeUpgradeKey(style, level), name: spec.levels[level - 1], price: spec.prices[level - 1] };
}

const baseItem = {
  category: "decoration" as const,
  realm_id: null,
  active: true,
  purchasable: true,
  discoverable: true,
};

/** Shop rows that unlock each style (placed from the Owned tray like other buildings). */
export const PREMIUM_HOME_SHOP_ITEMS: EconomyItem[] = PREMIUM_HOME_STYLES.map((style, index) => {
  const spec = PREMIUM_HOME_SPECS[style];
  const assetKey = premiumHomeAssetKey(style);
  return {
    ...baseItem,
    item_key: premiumHomeItemKey(style),
    name: spec.name,
    description: `${spec.description} Unlock once, place as many as you like, and upgrade it through four levels.`,
    rarity: style === "fair" ? "legendary" : index < 2 || style === "trampoline" ? "rare" : "epic",
    price: spec.prices[0],
    icon: spec.icon,
    accent: spec.accent,
    sort_order: 5 + index,
    metadata: {
      slot: "world_plot_1", worldPlotId: "customisation-plot-1",
      worldAssetKey: assetKey, worldArea: spec.marketplaceCategory, marketplaceCategory: spec.marketplaceCategory,
      worldCollection: "country", gridSize: spec.gridSize, tier: 1, premiumHome: style,
      marketplace_visual: { type: "asset", src: `/marketplace/world-renders/${assetKey}.webp`, alt: `${spec.name}: the actual world model`, previewMode: "world" },
    },
  };
});

/** Shop rows for levels 2 to 4. Bought from the upgrade button in the world, never listed in the Marketplace. */
export const PREMIUM_HOME_UPGRADE_ITEMS: EconomyItem[] = PREMIUM_HOME_STYLES.flatMap((style) =>
  ([2, 3, 4] as const).map((level) => {
    const spec = PREMIUM_HOME_SPECS[style];
    return {
      ...baseItem,
      item_key: premiumHomeUpgradeKey(style, level),
      name: `${spec.name}: ${spec.levels[level - 1]}`,
      description: `Upgrades every ${spec.name} you place to level ${level}: ${spec.levels[level - 1]}.`,
      rarity: level === 4 ? "legendary" : level === 3 ? "epic" : "rare",
      price: spec.prices[level - 1],
      icon: spec.icon,
      accent: spec.accent,
      sort_order: 900 + level,
      metadata: { marketplaceCategory: "home_upgrades", marketplaceHidden: true, premiumHome: style, premiumHomeLevel: level },
    } satisfies EconomyItem;
  }),
);

export const PREMIUM_HOME_ITEM_KEYS = new Set([...PREMIUM_HOME_SHOP_ITEMS, ...PREMIUM_HOME_UPGRADE_ITEMS].map((item) => item.item_key));

/** Trampoline bounce by level: how far from the centre it catches the avatar (world metres) and how high it throws. */
export const TRAMPOLINE_BOUNCE: Record<PremiumHomeLevel, { radius: number; power: number }> = {
  1: { radius: 1.6, power: 1.6 },
  2: { radius: 2.4, power: 2.0 },
  3: { radius: 3.2, power: 2.4 },
  4: { radius: 4.2, power: 3.0 },
};
/** Bounce power at a spot, given the trampolines placed in the world and the learner's trampoline level. */
export function trampolineBounceAt(x: number, z: number, trampolines: readonly { x: number; z: number }[], level: PremiumHomeLevel) {
  const { radius, power } = TRAMPOLINE_BOUNCE[level];
  return trampolines.some((t) => (x - t.x) ** 2 + (z - t.z) ** 2 <= radius * radius) ? power : 0;
}
