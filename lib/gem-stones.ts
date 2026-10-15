/**
 * Real stone identities for achievement gems. Every gem's name already names a
 * stone ("Ruby of Persistence", "Star Sapphire"), so the artwork follows the
 * name: colour and finish come from the stone, while rarity is shown through
 * the cut, glow strength, sparkle and badge. Purely presentational; nothing
 * here is stored or sent to the server.
 */

export type StoneFinish = "faceted" | "cabochon";
export type StonePattern = "bands" | "chatoyant" | "veins" | "speckle" | "sheen" | "play" | "star";

export type GemStone = {
  key: string;
  label: string;
  /** Base hue, saturation and lightness offset for the facet/dome shading. */
  h: number;
  s: number;
  l: number;
  finish: StoneFinish;
  pattern?: StonePattern;
  /** Rainbow dispersion flecks (diamonds and fire stones). */
  fire?: boolean;
  /** Hue shifts across the facets (opal-like and crystal stones). */
  iridescent?: boolean;
};

const S = (key: string, label: string, h: number, s: number, l: number, finish: StoneFinish, extra: Partial<GemStone> = {}): GemStone => ({ key, label, h, s, l, finish, ...extra });

/** Ordered: the first keyword found in the gem's name wins, so specific stones come first. */
const STONES: Array<[keyword: string, stone: GemStone]> = [
  ["black diamond", S("black-diamond", "Black Diamond", 230, 10, -32, "faceted", { fire: true })],
  ["fire opal", S("fire-opal", "Fire Opal", 18, 92, 2, "cabochon", { pattern: "play" })],
  ["star sapphire", S("star-sapphire", "Star Sapphire", 222, 68, -6, "cabochon", { pattern: "star" })],
  ["rose quartz", S("rose-quartz", "Rose Quartz", 340, 55, 14, "faceted")],
  ["tiger eye", S("tiger-eye", "Tiger Eye", 34, 78, -8, "cabochon", { pattern: "chatoyant" })],
  ["ruby", S("ruby", "Ruby", 350, 80, -6, "faceted")],
  ["sapphire", S("sapphire", "Sapphire", 222, 78, -8, "faceted")],
  ["emerald", S("emerald", "Emerald", 150, 72, -6, "faceted")],
  ["amethyst", S("amethyst", "Amethyst", 278, 60, -2, "faceted")],
  ["diamond", S("diamond", "Diamond", 205, 14, 20, "faceted", { fire: true })],
  ["aquamarine", S("aquamarine", "Aquamarine", 188, 62, 10, "faceted")],
  ["alexandrite", S("alexandrite", "Alexandrite", 168, 50, -6, "faceted", { iridescent: true })],
  ["topaz", S("topaz", "Topaz", 30, 86, 2, "faceted")],
  ["citrine", S("citrine", "Citrine", 46, 90, 6, "faceted")],
  ["peridot", S("peridot", "Peridot", 84, 70, 4, "faceted")],
  ["sunstone", S("sunstone", "Sunstone", 22, 86, 2, "cabochon", { pattern: "speckle" })],
  ["moonstone", S("moonstone", "Moonstone", 215, 24, 22, "cabochon", { pattern: "sheen" })],
  ["opal", S("opal", "Opal", 200, 28, 20, "cabochon", { pattern: "play" })],
  ["pearl", S("pearl", "Pearl", 330, 16, 26, "cabochon", { pattern: "sheen" })],
  ["jade", S("jade", "Jade", 145, 46, -2, "cabochon", { pattern: "sheen" })],
  ["marble", S("marble", "Marble", 220, 6, 22, "cabochon", { pattern: "veins" })],
  ["granite", S("granite", "Granite", 25, 8, -2, "cabochon", { pattern: "speckle" })],
  ["sandstone", S("sandstone", "Sandstone", 32, 46, 6, "cabochon", { pattern: "bands" })],
  ["agate", S("agate", "Agate", 18, 50, 0, "cabochon", { pattern: "bands" })],
  ["amber", S("amber", "Amber", 36, 92, -2, "cabochon", { pattern: "sheen" })],
  ["quartz", S("quartz", "Quartz", 210, 8, 16, "faceted")],
  ["bronze", S("bronze", "Bronze Stone", 28, 55, -10, "faceted")],
  ["silver", S("silver", "Silver Gem", 215, 12, 12, "faceted")],
  ["flame", S("flame-crystal", "Flame Crystal", 14, 90, 0, "faceted", { fire: true })],
  ["aurora", S("aurora-diamond", "Aurora Diamond", 160, 40, 14, "faceted", { fire: true, iridescent: true })],
  ["prism", S("prism", "Prism", 190, 40, 14, "faceted", { iridescent: true })],
  ["time", S("time-crystal", "Time Crystal", 40, 80, 2, "faceted", { iridescent: true })],
  ["celestial", S("celestial-crystal", "Celestial Crystal", 250, 50, 10, "faceted", { fire: true, iridescent: true })],
  ["pathfinder", S("clear-crystal", "Clear Crystal", 200, 18, 18, "faceted", { iridescent: true })],
];

/** Realm gems without a stone word in their name take the realm's colour. */
const REALM_STONES: Record<string, GemStone> = {
  number: S("nexus-crystal", "Nexus Crystal", 172, 70, -2, "faceted"),
  measurement: S("measure-crystal", "Surveyor Crystal", 42, 80, 2, "faceted"),
  space: S("star-crystal", "Star Crystal", 262, 64, 0, "faceted"),
  starpath: S("star-crystal", "Star Crystal", 262, 64, 0, "faceted"),
  "pattern-peaks": S("rune-crystal", "Rune Crystal", 2, 70, -4, "faceted"),
  pattern: S("rune-crystal", "Rune Crystal", 2, 70, -4, "faceted"),
  statistica: S("data-crystal", "Data Crystal", 156, 64, -4, "faceted"),
  statistics: S("data-crystal", "Data Crystal", 156, 64, -4, "faceted"),
  "chance-hollow": S("fortune-crystal", "Fortune Crystal", 342, 70, 0, "faceted"),
  chance: S("fortune-crystal", "Fortune Crystal", 342, 70, 0, "faceted"),
  chronoscape: S("time-crystal", "Time Crystal", 40, 80, 2, "faceted", { iridescent: true }),
};

/** Remaining "Crystal" gems share an iridescent finish so they read as special. */
const CRYSTAL = S("crystal", "Crystal", 230, 46, 10, "faceted", { iridescent: true });

export function stoneForGem(gem: { name?: string | null; slug?: string | null; realm_id?: string | null }): GemStone | undefined {
  const name = `${gem.name ?? ""} ${gem.slug ?? ""}`.toLowerCase().replace(/-/g, " ");
  // Realm-specific crystals keep the realm's identity ahead of the generic word.
  const realmStone = gem.realm_id ? REALM_STONES[gem.realm_id] : undefined;
  for (const [keyword, stone] of STONES) {
    if (keyword === "time" || keyword === "celestial" || keyword === "pathfinder") continue;
    if (name.includes(keyword)) return stone;
  }
  if (realmStone) {
    return name.includes("crystal") ? { ...realmStone, iridescent: true } : realmStone;
  }
  for (const [keyword, stone] of STONES) {
    if (name.includes(keyword)) return stone;
  }
  if (name.includes("crystal")) return CRYSTAL;
  return undefined;
}

/** A solid CSS colour for the stone, for glows and accents around the gem. */
export function stoneColor(stone: GemStone, lightness = 58) {
  return `hsl(${stone.h} ${Math.max(stone.s, 30)}% ${Math.min(80, Math.max(30, lightness + stone.l * 0.5))}%)`;
}

/** The stone colour as an "r g b" triple, for CSS colours that need an alpha. */
export function stoneRgb(stone: GemStone, lightness = 58) {
  const s = Math.max(stone.s, 30) / 100;
  const l = Math.min(80, Math.max(30, lightness + stone.l * 0.5)) / 100;
  const a = s * Math.min(l, 1 - l);
  const channel = (n: number) => {
    const k = (n + stone.h / 30) % 12;
    return Math.round(255 * (l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))));
  };
  return `${channel(0)} ${channel(8)} ${channel(4)}`;
}
