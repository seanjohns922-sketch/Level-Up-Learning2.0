import type { EconomyItem, EconomyState } from "@/lib/economy";

export type CentralWorldCustomisationArea =
  | "waterworks"
  | "training"
  | "gardens"
  | "crossing"
  | "boundary"
  | "community"
  | "workshop"
  | "lookout";

type CatalogueEntry = {
  plot: number;
  area: CentralWorldCustomisationArea;
  name: string;
  description: string;
  assetKey: string;
  rarity: EconomyItem["rarity"];
  tier: 1 | 2 | 3;
  price: number;
  accent: string;
  icon: string;
};

const ENTRIES: CatalogueEntry[] = [
  { plot: 1, area: "waterworks", name: "Reflection Pond", description: "A calm pond beside the Tower path.", assetKey: "reflection_pond", rarity: "common", tier: 1, price: 200, accent: "#38bdf8", icon: "waves" },
  { plot: 1, area: "waterworks", name: "Willow Lake", description: "A peaceful lake shaded by a willow tree.", assetKey: "willow_lake", rarity: "rare", tier: 2, price: 800, accent: "#0ea5e9", icon: "tree-pine" },
  { plot: 1, area: "waterworks", name: "Crystal Reservoir", description: "A brilliant reservoir powered by crystal light.", assetKey: "crystal_reservoir", rarity: "legendary", tier: 3, price: 2400, accent: "#8b5cf6", icon: "gem" },

  { plot: 2, area: "training", name: "Practice Court", description: "A simple court for daily training.", assetKey: "practice_court", rarity: "common", tier: 1, price: 200, accent: "#f59e0b", icon: "dumbbell" },
  { plot: 2, area: "training", name: "Explorer Gym", description: "A dedicated gym for growing explorers.", assetKey: "explorer_gym", rarity: "rare", tier: 2, price: 800, accent: "#f97316", icon: "dumbbell" },
  { plot: 2, area: "training", name: "Champion Arena", description: "A grand arena built for Tower champions.", assetKey: "champion_arena", rarity: "legendary", tier: 3, price: 2400, accent: "#eab308", icon: "trophy" },

  { plot: 3, area: "gardens", name: "Wildflower Garden", description: "A bright garden filled with wildflowers.", assetKey: "wildflower_garden", rarity: "common", tier: 1, price: 200, accent: "#22c55e", icon: "flower-2" },
  { plot: 3, area: "gardens", name: "Scholar Grove", description: "A shady grove for reading and reflection.", assetKey: "scholar_grove", rarity: "rare", tier: 2, price: 800, accent: "#16a34a", icon: "trees" },
  { plot: 3, area: "gardens", name: "Starlight Conservatory", description: "A glass garden glowing beneath the stars.", assetKey: "starlight_conservatory", rarity: "legendary", tier: 3, price: 2400, accent: "#a855f7", icon: "sparkles" },

  { plot: 4, area: "crossing", name: "Timber Footbridge", description: "A sturdy timber crossing for the grounds.", assetKey: "timber_footbridge", rarity: "common", tier: 1, price: 200, accent: "#a16207", icon: "route" },
  { plot: 4, area: "crossing", name: "Stone Arch Bridge", description: "A lasting stone bridge with a high arch.", assetKey: "stone_arch_bridge", rarity: "rare", tier: 2, price: 800, accent: "#64748b", icon: "landmark" },
  { plot: 4, area: "crossing", name: "Lumina Bridge", description: "A radiant bridge lit by magical energy.", assetKey: "lumina_bridge", rarity: "legendary", tier: 3, price: 2400, accent: "#06b6d4", icon: "sparkles" },

  { plot: 5, area: "boundary", name: "Garden Fence", description: "A neat fence marking the Tower grounds.", assetKey: "garden_fence", rarity: "common", tier: 1, price: 200, accent: "#84cc16", icon: "fence" },
  { plot: 5, area: "boundary", name: "Stone Boundary", description: "A strong stone boundary around the grounds.", assetKey: "stone_boundary", rarity: "rare", tier: 2, price: 800, accent: "#78716c", icon: "shield" },
  { plot: 5, area: "boundary", name: "Crystal Ward", description: "A crystal barrier that watches over the Tower.", assetKey: "crystal_ward", rarity: "legendary", tier: 3, price: 2400, accent: "#c084fc", icon: "shield-check" },

  { plot: 6, area: "community", name: "Picnic Circle", description: "A friendly place to gather and rest.", assetKey: "picnic_circle", rarity: "common", tier: 1, price: 200, accent: "#fb7185", icon: "users" },
  { plot: 6, area: "community", name: "Explorer Plaza", description: "A lively plaza for explorers to meet.", assetKey: "explorer_plaza", rarity: "rare", tier: 2, price: 800, accent: "#14b8a6", icon: "users-round" },
  { plot: 6, area: "community", name: "Festival Courtyard", description: "A colourful courtyard for Tower celebrations.", assetKey: "festival_courtyard", rarity: "legendary", tier: 3, price: 2400, accent: "#ec4899", icon: "party-popper" },

  { plot: 7, area: "workshop", name: "Tool Shed", description: "A compact shed for tools and supplies.", assetKey: "tool_shed", rarity: "common", tier: 1, price: 200, accent: "#a16207", icon: "hammer" },
  { plot: 7, area: "workshop", name: "Maker Workshop", description: "A busy workshop for building new ideas.", assetKey: "maker_workshop", rarity: "rare", tier: 2, price: 800, accent: "#ea580c", icon: "wrench" },
  { plot: 7, area: "workshop", name: "Inventor Hall", description: "A grand hall for ambitious inventions.", assetKey: "inventor_hall", rarity: "legendary", tier: 3, price: 2400, accent: "#facc15", icon: "lightbulb" },

  { plot: 8, area: "lookout", name: "Trail Lookout", description: "A raised lookout over the Tower grounds.", assetKey: "trail_lookout", rarity: "common", tier: 1, price: 200, accent: "#60a5fa", icon: "binoculars" },
  { plot: 8, area: "lookout", name: "Skywatch Deck", description: "A high deck made for watching the night sky.", assetKey: "skywatch_deck", rarity: "rare", tier: 2, price: 800, accent: "#6366f1", icon: "telescope" },
  { plot: 8, area: "lookout", name: "Celestial Observatory", description: "A magnificent observatory for exploring the cosmos.", assetKey: "celestial_observatory", rarity: "legendary", tier: 3, price: 2400, accent: "#7c3aed", icon: "orbit" },
];

export const CENTRAL_WORLD_CUSTOMISATION_CATALOG: EconomyItem[] = ENTRIES.map((entry) => ({
  item_key: `central_world_plot_${entry.plot}_${entry.assetKey}`,
  name: entry.name,
  description: entry.description,
  category: "decoration",
  realm_id: null,
  rarity: entry.rarity,
  price: entry.price,
  icon: entry.icon,
  accent: entry.accent,
  active: true,
  purchasable: true,
  discoverable: true,
  sort_order: entry.plot * 10 + entry.tier,
  metadata: {
    slot: `world_plot_${entry.plot}`,
    worldPlotId: `customisation-plot-${entry.plot}`,
    worldAssetKey: entry.assetKey,
    worldArea: entry.area,
    tier: entry.tier,
    marketplace_visual: {
      type: "asset",
      src: `/marketplace/central-world/${entry.assetKey}.svg`,
      alt: `${entry.name} central world customisation preview`,
      previewMode: "background",
    },
  },
}));

export function mergeCentralWorldCatalogue(state: EconomyState): EconomyState {
  const existing = new Map(state.items.map((item) => [item.item_key, item]));
  for (const item of CENTRAL_WORLD_CUSTOMISATION_CATALOG) {
    if (!existing.has(item.item_key)) existing.set(item.item_key, item);
  }
  return { ...state, items: Array.from(existing.values()) };
}

export function getCentralWorldItemsForPlot(plotId: string): EconomyItem[] {
  return CENTRAL_WORLD_CUSTOMISATION_CATALOG.filter(
    (item) => item.metadata.worldPlotId === plotId,
  ).sort((a, b) => Number(a.metadata.tier) - Number(b.metadata.tier));
}

export function getEquippedCentralWorldItems(state: EconomyState): Record<string, EconomyItem> {
  const equipped: Record<string, EconomyItem> = {};
  for (const [slot, itemKey] of Object.entries(state.equipped)) {
    if (!slot.startsWith("world_plot_") || !itemKey) continue;
    const item = state.items.find((candidate) => candidate.item_key === itemKey);
    const plotId = item?.metadata.worldPlotId;
    if (item && typeof plotId === "string") equipped[plotId] = item;
  }
  return equipped;
}
