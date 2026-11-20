import type { EconomyItem } from "@/lib/economy";

/** Premium upgradeable items: the four home styles, the Fair Ride, the trampoline and the
 * Protect the Tower set, each with four levels. ("Home" in the names is historical; the live shop rows use it.)
 * Unlocking a style and each upgrade are ordinary XP purchases, so the server
 * checks the balance and records ownership. A style's level is the highest
 * upgrade the learner owns; every copy they place shows that level. */
export const DEFENCE_STYLES = ["laser_fence", "laser_gate", "scanner", "trip_wire", "drone_pad", "guard_dog", "patrol_drone", "sentry_bot", "tower_shield"] as const;
/** The everyday keepers: free at Level 1 (they are the editor's long-standing free items), upgraded with XP. */
export const EVERYDAY_STYLES = ["lamp_post", "bench", "fence", "mailbox", "campfire"] as const;
export const PREMIUM_HOME_STYLES = ["cottage", "modern", "treehouse", "apartment", "fair", "trampoline", "basketball", ...DEFENCE_STYLES, ...EVERYDAY_STYLES] as const;
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
  marketplaceCategory: "buildings" | "pools_play" | "defence";
  upgradePrefix: string;
  /** Level 1 is free in the editor's Defence tab (it replaced a free castle piece); only upgrades cost XP. */
  free?: boolean;
  /** Not placed by the learner: it stands in a fixed spot (the Tower Shield goes round the Tower). */
  fixed?: boolean;
  /** World metres to the top of the model (name tags sit just above); homes use the default. */
  height?: number;
  /** Modelled in world metres already (the homes are modelled small and scaled up). */
  metres?: boolean;
};
const HOME = { marketplaceCategory: "buildings", upgradePrefix: "central_world_home_upgrade_" } as const;
const SET_PIECE = { marketplaceCategory: "pools_play", upgradePrefix: "central_world_set_upgrade_" } as const;
const DEFENCE = { marketplaceCategory: "defence", upgradePrefix: "central_world_defence_upgrade_", metres: true } as const;
const EVERYDAY = { marketplaceCategory: "buildings", upgradePrefix: "central_world_everyday_upgrade_", metres: true, free: true } as const;

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
  basketball: {
    name: "Basketball Court",
    description: "Shoot hoops! Walk on, tap Shoot and score. Grows from a driveway hoop to a neon arena with a scoreboard.",
    levels: ["Driveway Hoop", "Half Court", "Floodlit Full Court", "Neon Arena"],
    prices: [300, 300, 600, 1200],
    gridSize: "7x8",
    accent: "#ff7a1a",
    icon: "dribbble",
    assetKey: "play_basketball",
    ...SET_PIECE,
    height: 7.5,
    metres: true,
  },
  laser_fence: {
    name: "Laser Fence",
    description: "Lasers between posts that join up as you place them. Walk into it and you get zapped back!",
    levels: ["Red Lasers", "Triple Lasers", "Energy Wall", "Neon Laser Wall"],
    prices: [0, 300, 600, 1200],
    gridSize: "1x1",
    accent: "#ff3b4e",
    icon: "zap",
    assetKey: "defence_laser_fence",
    height: 2.2,
    ...DEFENCE,
    free: true,
  },
  laser_gate: {
    name: "Laser Gate",
    description: "A gate of lasers that drops when you walk up and closes behind you.",
    levels: ["Laser Bars", "Energy Curtain", "Pylon Gate", "Neon Arch"],
    prices: [0, 400, 800, 1600],
    gridSize: "3x1",
    accent: "#3fe6ff",
    icon: "door-open",
    assetKey: "defence_laser_gate",
    height: 4.5,
    ...DEFENCE,
    free: true,
  },
  scanner: {
    name: "Scanner Tower",
    description: "A tech tower that sweeps lasers round and locks on to anyone who comes close.",
    levels: ["Holo Scanner", "Radar Halo", "Sensor Arms", "Sky Beacon"],
    prices: [0, 400, 800, 1600],
    gridSize: "2x2",
    accent: "#3fe6ff",
    icon: "radar",
    assetKey: "defence_scanner",
    height: 7.5,
    ...DEFENCE,
    free: true,
  },
  trip_wire: {
    name: "Trip Wire Alarm",
    description: "Ankle-height laser wires. Step over one and the alarm goes off!",
    levels: ["One Wire", "Wires and Siren", "Laser Cross", "Laser Box"],
    prices: [250, 250, 500, 1000],
    gridSize: "2x2",
    accent: "#ff3b4e",
    icon: "siren",
    assetKey: "defence_trip_wire",
    height: 2.2,
    ...DEFENCE,
  },
  drone_pad: {
    name: "Security Drone Pad",
    description: "A landing pad with security drones that fly over and escort you.",
    levels: ["One Drone", "Drone Patrol", "Drone Squad", "Spotlight Squad"],
    prices: [500, 450, 900, 1800],
    gridSize: "2x2",
    accent: "#3fe6ff",
    icon: "plane",
    assetKey: "defence_drone_pad",
    height: 3.5,
    ...DEFENCE,
  },
  guard_dog: {
    name: "Robo Guard Dog",
    description: "Robot guard dogs that patrol round their kennel. Walk up and they bark, then wag!",
    levels: ["Robo Pup", "Guard Pair", "Scanner Dogs", "Hover Hounds"],
    prices: [400, 400, 800, 1600],
    gridSize: "3x3",
    accent: "#3fe6ff",
    icon: "dog",
    assetKey: "defence_guard_dog",
    height: 2.4,
    ...DEFENCE,
  },
  patrol_drone: {
    name: "Patrol Drone",
    description: "A drone that flies a big figure-eight patrol and swings its searchlight onto you.",
    levels: ["Patrol Drone", "Searchlight Drone", "Scanner Pair", "Jet Drones"],
    prices: [450, 400, 800, 1600],
    gridSize: "3x3",
    accent: "#3fe6ff",
    icon: "plane",
    assetKey: "defence_patrol_drone",
    height: 5,
    ...DEFENCE,
  },
  sentry_bot: {
    name: "Sentry Bot",
    description: "A friendly security robot that rolls up and down its patch and waves hello.",
    levels: ["Sentry Bot", "Siren Bot", "Hover Guard", "Shield Guard"],
    prices: [350, 350, 700, 1400],
    gridSize: "2x2",
    accent: "#3fe6ff",
    icon: "bot",
    assetKey: "defence_sentry_bot",
    height: 3.4,
    ...DEFENCE,
  },
  tower_shield: {
    name: "Tower Shield",
    description: "A giant energy shield over the whole Tower. Every upgrade makes it more amazing.",
    levels: ["Energy Shield", "Hex Shield", "Orbit Shield", "Legendary Shield"],
    prices: [800, 600, 1200, 2400],
    gridSize: "1x1",
    accent: "#ff4fd8",
    icon: "shield",
    assetKey: "defence_tower_shield",
    height: 62,
    ...DEFENCE,
    fixed: true,
  },
  // The everyday keepers keep their original world keys, so every one already placed upgrades in place.
  lamp_post: {
    name: "Lamp Post",
    description: "A street lamp that glows after dark, from a park lamp to a floating crystal.",
    levels: ["Park Lamp", "Double Lantern", "Smart Halo Lamp", "Crystal Lamp"],
    prices: [0, 100, 200, 400],
    gridSize: "1x1",
    accent: "#f5c451",
    icon: "lamp",
    assetKey: "lamp_post",
    height: 4.6,
    ...EVERYDAY,
  },
  bench: {
    name: "Bench",
    description: "A seat for your world, from a park bench to a glowing swing seat.",
    levels: ["Park Bench", "Garden Bench", "Pergola Bench", "Swing Seat"],
    prices: [0, 100, 200, 400],
    gridSize: "2x1",
    accent: "#b6763f",
    icon: "sofa",
    assetKey: "bench",
    height: 2.9,
    ...EVERYDAY,
  },
  fence: {
    name: "Fence",
    description: "A fence that joins up as you place it, from timber rails to glass and gold.",
    levels: ["Rail Fence", "Picket Fence", "Modern Slat Fence", "Crystal Fence"],
    prices: [0, 80, 160, 320],
    gridSize: "1x1",
    accent: "#c69a63",
    icon: "fence",
    assetKey: "fence",
    height: 1.8,
    ...EVERYDAY,
  },
  mailbox: {
    name: "Mailbox",
    description: "Your own letterbox, all the way up to a drone that brings the mail.",
    levels: ["Letterbox", "Mini House Mailbox", "Brick Pillar Mailbox", "Drone Mail Station"],
    prices: [0, 100, 200, 400],
    gridSize: "1x1",
    accent: "#d0463f",
    icon: "mailbox",
    assetKey: "mailbox",
    height: 2.6,
    ...EVERYDAY,
  },
  campfire: {
    name: "Campfire",
    description: "A crackling campfire to sit round, up to magic flames that change colour.",
    levels: ["Campfire", "Cosy Campfire", "Camp Circle", "Magic Campfire"],
    prices: [0, 150, 300, 600],
    gridSize: "2x2",
    accent: "#ff7a1a",
    icon: "flame",
    assetKey: "campfire",
    height: 2.6,
    ...EVERYDAY,
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

/** Shop rows that unlock each style (placed from the Owned tray like other buildings).
 * Free styles have none: their Level 1 is in the Defence tab. */
export const PREMIUM_HOME_SHOP_ITEMS: EconomyItem[] = PREMIUM_HOME_STYLES.filter((style) => !PREMIUM_HOME_SPECS[style].free).map((style, index) => {
  const spec = PREMIUM_HOME_SPECS[style];
  const assetKey = premiumHomeAssetKey(style);
  return {
    ...baseItem,
    item_key: premiumHomeItemKey(style),
    name: spec.name,
    description: spec.fixed ? `${spec.description} Unlock it once and upgrade it through four levels.` : `${spec.description} Unlock once, place as many as you like, and upgrade it through four levels.`,
    rarity: style === "fair" || style === "tower_shield" ? "legendary" : index < 2 || style === "trampoline" || spec.prices[0] < 500 ? "rare" : "epic",
    price: spec.prices[0],
    icon: spec.icon,
    accent: spec.accent,
    sort_order: 5 + index,
    metadata: {
      // A fixed style (the Tower Shield) is never placed, so it carries no plot details.
      ...(spec.fixed
        ? { premiumFixed: true }
        : { slot: "world_plot_1", worldPlotId: "customisation-plot-1", worldAssetKey: assetKey, worldArea: spec.marketplaceCategory, worldCollection: "country", gridSize: spec.gridSize, tier: 1 }),
      marketplaceCategory: spec.marketplaceCategory, premiumHome: style,
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
