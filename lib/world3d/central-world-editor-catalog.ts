import type { EconomyItem } from "@/lib/economy";

export type WorldSceneryGroup = "trees_plants" | "rocks_water" | "furniture_fun" | "animals";

function starter(
  item_key: string,
  name: string,
  worldAssetKey: string,
  accent: string,
  group: WorldSceneryGroup,
  gridSize = "1x1",
  // Display scale, tuned per mesh so each item fills its footprint (long items
  // like the bridge need more than the old flat 1.25).
  worldScale = 1.25,
): EconomyItem {
  return {
    item_key,
    name,
    description: `Place a ${name.toLowerCase()} in your world.`,
    category: "decoration",
    realm_id: null,
    rarity: "common",
    price: 0,
    icon: worldAssetKey,
    accent,
    purchasable: false,
    discoverable: true,
    active: true,
    sort_order: 0,
    metadata: { marketplaceCategory: "world_basic", worldAssetKey, worldSceneryGroup: group, gridSize, worldScale, tier: 1 },
  };
}

// The free toolbox every kid has from the start — no gems, no Marketplace.
// Each entry pairs a catalogue row with a procedural mesh in
// CentralWorldEnvironment's StarterScenery(). Add an item by adding one row
// here and one case there; the editor palette is driven entirely off this list.
export const CENTRAL_WORLD_STARTER_SCENERY: EconomyItem[] = [
  // Trees & plants
  starter("central_world_starter_tree", "Tree", "tree", "#3f8f3a", "trees_plants", "2x2", 1.25),
  starter("central_world_starter_pine", "Pine Tree", "pine_tree", "#256b43", "trees_plants", "2x2", 1.25),
  starter("central_world_starter_palm", "Palm Tree", "palm_tree", "#2f9e6f", "trees_plants", "2x2", 1.3),
  starter("central_world_starter_gum", "Gum Tree", "gum_tree", "#8fae86", "trees_plants", "2x2", 1.3),
  starter("central_world_starter_shrub", "Shrub", "shrub", "#4d9b46", "trees_plants", "1x1", 1.05),
  starter("central_world_starter_hedge", "Hedge", "hedge", "#3c7a3a", "trees_plants", "2x1", 1.45),
  starter("central_world_starter_toadstool", "Toadstool", "toadstool", "#e05a52", "trees_plants", "1x1", 1.0),
  starter("central_world_starter_log", "Log", "log", "#8a5a34", "trees_plants", "2x1", 1.4),
  starter("central_world_starter_flowers", "Flower Bed", "flower_bed", "#ec4899", "trees_plants", "1x1", 1.25),

  // Rocks & water
  starter("central_world_starter_boulder", "Boulder", "boulder", "#8b95a1", "rocks_water", "2x2", 1.4),
  starter("central_world_starter_rocks", "Rock Pile", "rock_pile", "#9aa4af", "rocks_water", "1x1", 1.3),
  starter("central_world_starter_pond", "Pond", "pond", "#3aa0c8", "rocks_water", "3x2", 1.85),
  starter("central_world_starter_fountain", "Fountain", "fountain", "#38bdf8", "rocks_water", "2x2", 1.45),
  starter("central_world_starter_bridge", "Bridge", "bridge", "#a4713f", "rocks_water", "3x1", 2.2),

  // Furniture & fun
  starter("central_world_starter_lamp", "Lamp Post", "lamp_post", "#f5c451", "furniture_fun", "1x1", 1.25),
  starter("central_world_starter_bench", "Bench", "bench", "#b6763f", "furniture_fun", "2x1", 1.35),
  starter("central_world_starter_fence", "Fence", "fence", "#c69a63", "furniture_fun", "2x1", 1.5),
  starter("central_world_starter_mailbox", "Mailbox", "mailbox", "#d0463f", "furniture_fun", "1x1", 1.1),
  starter("central_world_starter_flag", "Flag", "flag", "#2563eb", "furniture_fun", "1x1", 1.15),
  starter("central_world_starter_umbrella", "Umbrella", "umbrella", "#f2704a", "furniture_fun", "2x2", 1.4),
  starter("central_world_starter_sign", "Sign", "signpost", "#a16207", "furniture_fun", "1x1", 1.1),
  starter("central_world_starter_balloons", "Balloons", "balloons", "#e0518a", "furniture_fun", "1x1", 1.15),

  // Aussie animals
  starter("central_world_starter_kangaroo", "Kangaroo", "kangaroo", "#b5793f", "animals", "1x1", 1.3),
  starter("central_world_starter_koala", "Koala Gum Tree", "koala", "#8a94a0", "animals", "2x2", 1.3),
  starter("central_world_starter_wombat", "Wombat", "wombat", "#7a5a3f", "animals", "1x1", 1.1),
  starter("central_world_starter_emu", "Emu", "emu", "#6b5f52", "animals", "1x1", 1.35),
  starter("central_world_starter_kookaburra", "Kookaburra Gum Tree", "kookaburra", "#9c8161", "animals", "2x2", 1.3),
  starter("central_world_starter_echidna", "Echidna", "echidna", "#5c4a35", "animals", "1x1", 1.0),
  starter("central_world_starter_cockatoo", "Cockatoo", "cockatoo", "#e6ebef", "animals", "1x1", 1.0),
];
