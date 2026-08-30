import type { EconomyItem, EconomyState } from "@/lib/economy";

export type CentralWorldCustomisationArea =
  | "buildings"
  | "animals"
  | "pools_play"
  | "special";

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
  gridSize: `${number}x${number}`;
};

// Aussie-themed re-skin. item_key stays derived from plot+assetKey, so names,
// footprints and 3D models change while anything already purchased/equipped
// keeps working. Footprints (gridSize, 1 cell = 2 m) are now true-to-scale:
// the AFL oval dwarfs a gum-tree cubby.
const ENTRIES: CatalogueEntry[] = [
  { plot: 1, area: "buildings", name: "Queenslander", description: "A classic raised timber home with a wraparound veranda.", assetKey: "clubhouse", rarity: "rare", tier: 2, price: 800, accent: "#3b82f6", icon: "house", gridSize: "4x4" },
  { plot: 1, area: "buildings", name: "Milk Bar Arcade", description: "A retro Aussie milk bar packed with games and treats.", assetKey: "games_room", rarity: "legendary", tier: 3, price: 2400, accent: "#7c3aed", icon: "gamepad-2", gridSize: "4x4" },
  { plot: 1, area: "buildings", name: "Gum Tree Cubby", description: "A cosy cubby house tucked up in a gum tree.", assetKey: "treehouse", rarity: "common", tier: 1, price: 200, accent: "#16a34a", icon: "tree-pine", gridSize: "2x2" },

  { plot: 2, area: "buildings", name: "Footy Training Shed", description: "Train, kick and handball like an AFL pro.", assetKey: "training_centre", rarity: "common", tier: 1, price: 200, accent: "#22c55e", icon: "dumbbell", gridSize: "3x3" },
  { plot: 2, area: "buildings", name: "Surf Life Saving Club", description: "The red-and-yellow beach club watching over the bay.", assetKey: "workshop", rarity: "rare", tier: 2, price: 800, accent: "#dc2626", icon: "flag", gridSize: "4x4" },
  { plot: 2, area: "buildings", name: "Sydney Tower Eye", description: "Australia's golden skyline lookout, high above the city.", assetKey: "observatory", rarity: "legendary", tier: 3, price: 2400, accent: "#e6b64c", icon: "telescope", gridSize: "3x3" },

  { plot: 3, area: "animals", name: "Blue Heeler Yard", description: "A playful yard for Australia's loyal cattle dogs.", assetKey: "puppy_yard", rarity: "common", tier: 1, price: 200, accent: "#3b82f6", icon: "paw-print", gridSize: "3x3" },
  { plot: 3, area: "animals", name: "Bilby Burrows", description: "A soft garden of burrows for the Easter Bilby.", assetKey: "bunny_garden", rarity: "common", tier: 1, price: 200, accent: "#a78bfa", icon: "carrot", gridSize: "3x3" },
  { plot: 3, area: "animals", name: "Brumby Paddock", description: "Wild brumbies trot around this bright paddock.", assetKey: "pony_paddock", rarity: "rare", tier: 2, price: 800, accent: "#a16207", icon: "horseshoe", gridSize: "4x3" },

  { plot: 4, area: "animals", name: "Outback Homestead", description: "A cream farmhouse with a silver roof and a windmill.", assetKey: "farmyard", rarity: "rare", tier: 2, price: 800, accent: "#c2410c", icon: "home", gridSize: "4x4" },
  { plot: 4, area: "animals", name: "Koala Gum Trees", description: "Towering gums with a koala snoozing in the branches.", assetKey: "wildlife_habitat", rarity: "legendary", tier: 3, price: 2400, accent: "#5c7a4b", icon: "trees", gridSize: "4x4" },

  { plot: 5, area: "pools_play", name: "Backyard Pool", description: "A cool dip for a hot Aussie summer day.", assetKey: "backyard_pool", rarity: "common", tier: 1, price: 200, accent: "#0ea5e9", icon: "waves", gridSize: "3x2" },
  { plot: 5, area: "pools_play", name: "Splash Pool", description: "A colourful splash zone with fountains.", assetKey: "splash_pool", rarity: "rare", tier: 2, price: 800, accent: "#06b6d4", icon: "waves", gridSize: "3x3" },
  { plot: 5, area: "pools_play", name: "Lagoon Pool", description: "A resort-style lagoon fringed with palms.", assetKey: "water_park", rarity: "legendary", tier: 3, price: 2400, accent: "#0284c7", icon: "waves", gridSize: "6x6" },

  { plot: 6, area: "pools_play", name: "Adventure Playground", description: "Climbing towers, slides and places to explore.", assetKey: "adventure_playground", rarity: "rare", tier: 2, price: 800, accent: "#f97316", icon: "mountain", gridSize: "4x3" },
  { plot: 6, area: "pools_play", name: "Trampoline Park", description: "Bounce high in a park made for energy.", assetKey: "trampoline_park", rarity: "common", tier: 1, price: 200, accent: "#22c55e", icon: "circle-dot", gridSize: "3x3" },

  { plot: 7, area: "special", name: "AFL Oval", description: "The big oval — floodlights, goal posts and a roaring crowd.", assetKey: "sports_stadium", rarity: "rare", tier: 2, price: 800, accent: "#2563eb", icon: "trophy", gridSize: "8x8" },
  { plot: 7, area: "special", name: "Drive-In Cinema", description: "Watch movies from the car under the stars.", assetKey: "cinema", rarity: "legendary", tier: 3, price: 2400, accent: "#dc2626", icon: "clapperboard", gridSize: "4x3" },
  { plot: 7, area: "special", name: "Arcade", description: "Retro games and high score challenges.", assetKey: "arcade", rarity: "rare", tier: 2, price: 800, accent: "#a855f7", icon: "joystick", gridSize: "3x3" },

  { plot: 8, area: "special", name: "Aussie BBQ Backyard", description: "Fire up the barbie for a backyard get-together.", assetKey: "party_house", rarity: "common", tier: 1, price: 200, accent: "#ec4899", icon: "party-popper", gridSize: "3x3" },
  { plot: 8, area: "special", name: "Kangaroo Sanctuary", description: "A protected paddock where kangaroos bound free.", assetKey: "pet_sanctuary", rarity: "legendary", tier: 3, price: 2400, accent: "#a16207", icon: "heart", gridSize: "5x4" },
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
    marketplaceCategory: entry.area,
    gridSize: entry.gridSize,
    tier: entry.tier,
    marketplace_visual: {
      type: "asset",
      src: `/marketplace/central-world/${entry.assetKey}.webp`,
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
