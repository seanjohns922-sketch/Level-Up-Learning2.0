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

const ENTRIES: CatalogueEntry[] = [
  { plot: 1, area: "buildings", name: "Clubhouse", description: "Your place to hang out and relax with friends.", assetKey: "clubhouse", rarity: "rare", tier: 2, price: 800, accent: "#2563eb", icon: "house", gridSize: "4x4" },
  { plot: 1, area: "buildings", name: "Games Room", description: "Arcade games, challenges and tons of fun.", assetKey: "games_room", rarity: "legendary", tier: 3, price: 2400, accent: "#7c3aed", icon: "gamepad-2", gridSize: "4x4" },
  { plot: 1, area: "buildings", name: "Treehouse", description: "A cosy hideout up in the trees.", assetKey: "treehouse", rarity: "common", tier: 1, price: 200, accent: "#16a34a", icon: "tree-pine", gridSize: "2x2" },

  { plot: 2, area: "buildings", name: "Training Centre", description: "Train, level up and get stronger every day.", assetKey: "training_centre", rarity: "common", tier: 1, price: 200, accent: "#22c55e", icon: "dumbbell", gridSize: "3x3" },
  { plot: 2, area: "buildings", name: "Workshop", description: "Build, create and invent awesome things.", assetKey: "workshop", rarity: "rare", tier: 2, price: 800, accent: "#0ea5e9", icon: "wrench", gridSize: "3x3" },
  { plot: 2, area: "buildings", name: "Observatory", description: "Explore the stars and unlock cosmic discoveries.", assetKey: "observatory", rarity: "legendary", tier: 3, price: 2400, accent: "#8b5cf6", icon: "telescope", gridSize: "4x4" },

  { plot: 3, area: "animals", name: "Puppy Yard", description: "A playful yard for happy puppies.", assetKey: "puppy_yard", rarity: "common", tier: 1, price: 200, accent: "#f59e0b", icon: "paw-print", gridSize: "3x3" },
  { plot: 3, area: "animals", name: "Bunny Garden", description: "A soft garden full of bunny burrows and carrots.", assetKey: "bunny_garden", rarity: "common", tier: 1, price: 200, accent: "#f472b6", icon: "carrot", gridSize: "3x3" },
  { plot: 3, area: "animals", name: "Pony Paddock", description: "A bright paddock for ponies to trot around.", assetKey: "pony_paddock", rarity: "rare", tier: 2, price: 800, accent: "#a16207", icon: "horseshoe", gridSize: "4x3" },

  { plot: 4, area: "animals", name: "Farmyard", description: "A cheerful farm space with animals and hay bales.", assetKey: "farmyard", rarity: "rare", tier: 2, price: 800, accent: "#84cc16", icon: "barn", gridSize: "4x4" },
  { plot: 4, area: "animals", name: "Wildlife Habitat", description: "A nature habitat for curious wildlife.", assetKey: "wildlife_habitat", rarity: "legendary", tier: 3, price: 2400, accent: "#059669", icon: "trees", gridSize: "4x4" },

  { plot: 5, area: "pools_play", name: "Backyard Pool", description: "A cool pool for sunny days in your world.", assetKey: "backyard_pool", rarity: "common", tier: 1, price: 200, accent: "#0ea5e9", icon: "waves", gridSize: "3x2" },
  { plot: 5, area: "pools_play", name: "Splash Pool", description: "A colourful splash zone with fountains.", assetKey: "splash_pool", rarity: "rare", tier: 2, price: 800, accent: "#06b6d4", icon: "waves", gridSize: "3x3" },
  { plot: 5, area: "pools_play", name: "Water Park", description: "Slides, water jets and a huge fun zone.", assetKey: "water_park", rarity: "legendary", tier: 3, price: 2400, accent: "#0284c7", icon: "waves", gridSize: "4x4" },

  { plot: 6, area: "pools_play", name: "Adventure Playground", description: "Climbing towers, slides and places to explore.", assetKey: "adventure_playground", rarity: "rare", tier: 2, price: 800, accent: "#f97316", icon: "mountain", gridSize: "4x3" },
  { plot: 6, area: "pools_play", name: "Trampoline Park", description: "Bounce high in a park made for energy.", assetKey: "trampoline_park", rarity: "common", tier: 1, price: 200, accent: "#22c55e", icon: "circle-dot", gridSize: "3x3" },

  { plot: 7, area: "special", name: "Sports Stadium", description: "Compete and celebrate your biggest wins.", assetKey: "sports_stadium", rarity: "rare", tier: 2, price: 800, accent: "#2563eb", icon: "trophy", gridSize: "4x4" },
  { plot: 7, area: "special", name: "Cinema", description: "Watch movies with friends in your own cinema.", assetKey: "cinema", rarity: "legendary", tier: 3, price: 2400, accent: "#dc2626", icon: "clapperboard", gridSize: "3x3" },
  { plot: 7, area: "special", name: "Arcade", description: "Retro games and high score challenges.", assetKey: "arcade", rarity: "rare", tier: 2, price: 800, accent: "#a855f7", icon: "joystick", gridSize: "3x3" },

  { plot: 8, area: "special", name: "Party House", description: "The perfect spot for parties and celebrations.", assetKey: "party_house", rarity: "common", tier: 1, price: 200, accent: "#ec4899", icon: "party-popper", gridSize: "3x3" },
  { plot: 8, area: "special", name: "Pet Sanctuary", description: "A peaceful place for pets to feel at home.", assetKey: "pet_sanctuary", rarity: "legendary", tier: 3, price: 2400, accent: "#14b8a6", icon: "heart", gridSize: "4x4" },
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
