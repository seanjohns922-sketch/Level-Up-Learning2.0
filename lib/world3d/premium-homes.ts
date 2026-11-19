import type { EconomyItem } from "@/lib/economy";

/** Premium homes: four styles, each with four levels.
 * Unlocking a style and each upgrade are ordinary XP purchases, so the server
 * checks the balance and records ownership. A style's level is the highest
 * upgrade the learner owns; every copy they place shows that level. */
export const PREMIUM_HOME_STYLES = ["cottage", "modern", "treehouse", "apartment"] as const;
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
};

export const PREMIUM_HOME_SPECS: Record<PremiumHomeStyle, StyleSpec> = {
  cottage: {
    name: "Cottage",
    description: "A storybook home with shingle roofs, shutters, flower boxes and a smoking chimney.",
    levels: ["Cosy Hut", "Cottage", "Family House", "Grand Villa"],
    prices: [300, 300, 600, 1200],
    gridSize: "8x5",
    accent: "#ff5e57",
    icon: "house",
  },
  modern: {
    name: "Modern Home",
    description: "Flat roofs, big glass walls, timber battens, solar panels and, later, a pool.",
    levels: ["Tiny Cabin", "Modern Home", "Two-Storey with Pool", "Glass Mansion"],
    prices: [500, 400, 800, 1600],
    gridSize: "5x5",
    accent: "#3a3f4a",
    icon: "house",
  },
  treehouse: {
    name: "Treehouse Home",
    description: "Ladders, slides and rope bridges, growing into a glowing giant tree.",
    levels: ["Platform Hut", "Treehouse with Slide", "Two Levels and a Bridge", "Glowing Giant Tree"],
    prices: [600, 450, 900, 1800],
    gridSize: "7x6",
    accent: "#48c25a",
    icon: "trees",
  },
  apartment: {
    name: "Apartment Block",
    description: "Grows taller with every upgrade, from a brick walk-up to a sky tower with a rooftop pool.",
    levels: ["3-Storey Walk-up", "5 Storeys with Balconies", "8 Storeys with Rooftop Garden", "Sky Tower with Rooftop Pool"],
    prices: [800, 600, 1200, 2400],
    gridSize: "5x4",
    accent: "#7fa8c9",
    icon: "building-2",
  },
};

const ASSET_PREFIX = "home_";
export const premiumHomeAssetKey = (style: PremiumHomeStyle) => `${ASSET_PREFIX}${style}`;
export const premiumHomeItemKey = (style: PremiumHomeStyle) => `central_world_plot_1_${premiumHomeAssetKey(style)}`;
export const premiumHomeUpgradeKey = (style: PremiumHomeStyle, level: 2 | 3 | 4) => `central_world_home_upgrade_${style}_${level}`;

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
    rarity: index < 2 ? "rare" : "epic",
    price: spec.prices[0],
    icon: spec.icon,
    accent: spec.accent,
    sort_order: 5 + index,
    metadata: {
      slot: "world_plot_1", worldPlotId: "customisation-plot-1",
      worldAssetKey: assetKey, worldArea: "buildings", marketplaceCategory: "buildings",
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
