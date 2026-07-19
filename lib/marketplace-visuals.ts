import type { EconomyItem } from "@/lib/economy";

export type MarketplacePreviewMode = "avatar" | "pet" | "room" | "background" | "effect" | "title";

export type MarketplaceVisual =
  | { type: "avatar-layer"; alt: string; previewMode: "avatar" }
  | { type: "pet"; alt: string; previewMode: "pet" }
  | { type: "asset"; src: string; alt: string; previewMode: "background" | "room" | "effect" | "title" }
  | { type: "unavailable"; alt: string; reason: "missing-marketplace-artwork" };

const PET_SPECIES = new Set([
  "puppy", "bunny", "turtle", "cat", "penguin",
  "owl", "fox", "dino", "dragon", "unicorn",
]);

const LEGACY_PET_KEYS = new Set(["pet_circuit_owl", "pet_baby_turtle"]);

const AVATAR_EQUIP_SLOTS = new Set([
  "avatar_outfit", "avatar_hat", "avatar_glasses", "avatar_cape",
  "avatar_backpack", "top", "bottom", "footwear",
]);

function unavailable(item: EconomyItem): MarketplaceVisual {
  return {
    type: "unavailable",
    alt: `${item.name} artwork unavailable`,
    reason: "missing-marketplace-artwork",
  };
}

/** The economy item record is the only source used by cards, previews and actions. */
export function resolveMarketplaceVisual(item: EconomyItem): MarketplaceVisual {
  const metadata = item.metadata ?? {};
  if (metadata.marketplace_status === "artwork_unavailable") return unavailable(item);
  const explicitVisual = metadata.marketplace_visual && typeof metadata.marketplace_visual === "object"
    ? metadata.marketplace_visual as Record<string, unknown>
    : null;

  if (item.category === "avatar") {
    const slot = typeof metadata.slot === "string" ? metadata.slot : "";
    if (!AVATAR_EQUIP_SLOTS.has(slot)) return unavailable(item);
    return { type: "avatar-layer", alt: `${item.name} shown on student avatar`, previewMode: "avatar" };
  }

  if (item.category === "pet") {
    const species = typeof metadata.species === "string" ? metadata.species : "";
    if (!PET_SPECIES.has(species) && !LEGACY_PET_KEYS.has(item.item_key)) return unavailable(item);
    return { type: "pet", alt: `${item.name} pet`, previewMode: "pet" };
  }

  const image = typeof metadata.image === "string" ? metadata.image.trim() : "";
  if (image.startsWith("/")) {
    return {
      type: "asset",
      src: image,
      alt: item.name,
      previewMode: item.category === "background" ? "background" : "room",
    };
  }

  const explicitMode = explicitVisual?.previewMode;
  if (
    explicitVisual?.type === "asset" &&
    typeof explicitVisual.src === "string" &&
    explicitVisual.src.startsWith("/") &&
    typeof explicitVisual.alt === "string" &&
    (explicitMode === "background" || explicitMode === "room" || explicitMode === "effect" || explicitMode === "title")
  ) {
    return { type: "asset", src: explicitVisual.src, alt: explicitVisual.alt, previewMode: explicitMode };
  }

  return unavailable(item);
}

export function isMarketplaceItemAvailable(item: EconomyItem) {
  return item.purchasable && resolveMarketplaceVisual(item).type !== "unavailable";
}

export function isMarketplaceItemListed(item: EconomyItem) {
  return item.purchasable || item.metadata?.marketplace_status === "artwork_unavailable";
}
