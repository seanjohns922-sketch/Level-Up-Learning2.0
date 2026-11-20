import type { EconomyItem } from "@/lib/economy";

/** Build kits (Skate Kit, Race Kit): unlock the kit, then place its pieces anywhere.
 * Unlocking and each kit upgrade are XP purchases checked by the server; the kit level
 * decides which pieces appear in the kit's tab in Edit World. Pieces are free to place. */
export type KitLevel = 0 | 1 | 2 | 3 | 4;

type KitSpec = {
  id: string;
  name: string;
  /** The Edit World tab its pieces live in. */
  tab: string;
  description: string;
  levels: readonly [string, string, string, string];
  /** XP to unlock (level 1), then to reach levels 2, 3 and 4. */
  prices: readonly [number, number, number, number];
  accent: string;
  icon: string;
  sortOrder: number;
  /** What the shop picture shows, for its alt text. */
  artCaption: string;
};
export type BuildKit = KitSpec & { unlockKey: string; upgradeKey: (level: 2 | 3 | 4) => string; art: string };

export function defineBuildKit(spec: KitSpec): BuildKit {
  return {
    ...spec,
    unlockKey: `central_world_kit_${spec.id}`,
    upgradeKey: (level) => `central_world_kit_upgrade_${spec.id}_${level}`,
    art: `/marketplace/world-renders/kit_${spec.id}.webp`,
  };
}

/** 0 until the kit is unlocked, then its highest upgrade. */
export function buildKitLevel(kit: BuildKit, ownedItemKeys: ReadonlySet<string>): KitLevel {
  if (!ownedItemKeys.has(kit.unlockKey)) return 0;
  for (const level of [4, 3, 2] as const) if (ownedItemKeys.has(kit.upgradeKey(level))) return level;
  return 1;
}
export function nextBuildKitUpgrade(kit: BuildKit, ownedItemKeys: ReadonlySet<string>) {
  const level = buildKitLevel(kit, ownedItemKeys);
  if (level === 0 || level === 4) return null;
  const next = (level + 1) as 2 | 3 | 4;
  return { level: next, itemKey: kit.upgradeKey(next), name: kit.levels[next - 1], price: kit.prices[next - 1] };
}

/** The listed kit unlock (Build kits in the Marketplace) and its three hidden upgrades. */
export function buildKitShopItems(kit: BuildKit): EconomyItem[] {
  const base = { category: "decoration" as const, realm_id: null, icon: kit.icon, accent: kit.accent, active: true, purchasable: true, discoverable: true };
  return [
    {
      ...base, item_key: kit.unlockKey, name: kit.name, description: kit.description, rarity: "epic", price: kit.prices[0], sort_order: kit.sortOrder,
      metadata: { marketplaceCategory: "kits", buildKit: kit.id, marketplace_visual: { type: "asset", src: kit.art, alt: `${kit.name}: ${kit.artCaption}`, previewMode: "world" } },
    },
    ...([2, 3, 4] as const).map((level): EconomyItem => ({
      ...base, item_key: kit.upgradeKey(level), name: `${kit.name}: ${kit.levels[level - 1]}`,
      description: `${kit.name} level ${level}: ${kit.levels[level - 1]}. New pieces appear in the ${kit.tab} tab.`,
      rarity: level === 4 ? "legendary" : level === 3 ? "epic" : "rare", price: kit.prices[level - 1], sort_order: 950 + level,
      metadata: { marketplaceCategory: "kit_upgrades", marketplaceHidden: true, buildKit: kit.id, buildKitLevel: level },
    })),
  ];
}
