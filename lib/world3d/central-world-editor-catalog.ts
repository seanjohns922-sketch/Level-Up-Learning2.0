import type { EconomyItem } from "@/lib/economy";

function starter(item_key: string, name: string, worldAssetKey: string, accent: string, gridSize = "1x1"): EconomyItem {
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
    metadata: { marketplaceCategory: "world_basic", worldAssetKey, gridSize, tier: 1 },
  };
}

export const CENTRAL_WORLD_STARTER_SCENERY: EconomyItem[] = [
  starter("central_world_starter_tree", "Tree", "tree", "#3f8f3a", "2x2"),
  starter("central_world_starter_pine", "Pine Tree", "pine_tree", "#256b43", "2x2"),
  starter("central_world_starter_flowers", "Flower Bed", "flower_bed", "#ec4899"),
  starter("central_world_starter_lamp", "Lamp Post", "lamp_post", "#f5c451"),
];
