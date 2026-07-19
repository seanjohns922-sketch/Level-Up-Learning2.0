// ── Central maths realm registry ────────────────────────────────────────────
// ONE source of truth for the maths realms used by the Gem Vault, Realm Gems
// and future Realm Collections. Only "live" realms are selectable for learning;
// "coming_soon" realms are previewed as premium placeholders and must never
// route into unfinished content.
//
// NOTE: This is intentionally maths-only and independent of:
//   - data/programs/genres.ts (the Tower's all-subject genre list), and
//   - app/legends/page.tsx (Hall of Legends — deliberately left untouched).
// When a realm flips from "coming_soon" to "live", update it HERE only and the
// Gem system (registry-driven) picks it up without further code changes.

export type RealmStatus = "live" | "coming_soon" | "hidden";

export type MathsRealm = {
  /** Stable id — matches student_realm_progress.realm_id / economy realm_id for live realms. */
  realmId: string;
  name: string;
  shortName: string;
  strand: string;
  status: RealmStatus;
  isSelectable: boolean;
  /** Number of Legends in this realm's collection (Prep→Y6 = 7 for live realms). */
  legendCount: number;
  legendCollectionName: string;
  /** lucide-react icon name. */
  iconKey: string;
  themeKey: string;
  displayOrder: number;
};

export const MATHS_REALMS: MathsRealm[] = [
  {
    realmId: "number",
    name: "Number Nexus",
    shortName: "Number",
    strand: "Number",
    status: "live",
    isSelectable: true,
    legendCount: 7,
    legendCollectionName: "Numbot Collection",
    iconKey: "Zap",
    themeKey: "nexus",
    displayOrder: 1,
  },
  {
    realmId: "measurement",
    name: "Measurelands",
    shortName: "Measure",
    strand: "Measurement",
    status: "live",
    isSelectable: true,
    legendCount: 7,
    legendCollectionName: "Meazurex Collection",
    iconKey: "Ruler",
    themeKey: "measure",
    displayOrder: 2,
  },
  {
    realmId: "pattern-peaks",
    name: "Pattern Peaks",
    shortName: "Patterns",
    strand: "Algebra & Patterns",
    status: "coming_soon",
    isSelectable: false,
    legendCount: 7,
    legendCollectionName: "Pattern Weavers",
    iconKey: "Triangle",
    themeKey: "pattern",
    displayOrder: 3,
  },
  {
    realmId: "statistica",
    name: "Statistica",
    shortName: "Stats",
    strand: "Statistics",
    status: "coming_soon",
    isSelectable: false,
    legendCount: 7,
    legendCollectionName: "Data Guardians",
    iconKey: "BarChart3",
    themeKey: "statistica",
    displayOrder: 4,
  },
  {
    realmId: "chance-hollow",
    name: "Chance Hollow",
    shortName: "Chance",
    strand: "Probability",
    status: "coming_soon",
    isSelectable: false,
    legendCount: 7,
    legendCollectionName: "Fortune Seekers",
    iconKey: "Dices",
    themeKey: "chance",
    displayOrder: 5,
  },
  {
    realmId: "starpath",
    name: "Starpath",
    shortName: "Starpath",
    strand: "Space & Spatial Reasoning",
    status: "coming_soon",
    isSelectable: false,
    legendCount: 7,
    legendCollectionName: "Star Navigators",
    iconKey: "Compass",
    themeKey: "starpath",
    displayOrder: 6,
  },
  {
    realmId: "chronoscape",
    name: "Chronoscape",
    shortName: "Chrono",
    strand: "Time & Temporal Reasoning",
    status: "coming_soon",
    isSelectable: false,
    legendCount: 7,
    legendCollectionName: "Time Keepers",
    iconKey: "Clock",
    themeKey: "chrono",
    displayOrder: 7,
  },
];

/** Realms that are live and selectable for learning right now. */
export const LIVE_REALMS = MATHS_REALMS.filter((r) => r.status === "live");

/** Look up a realm by id. */
export function getMathsRealm(realmId: string): MathsRealm | undefined {
  return MATHS_REALMS.find((r) => r.realmId === realmId);
}

/** A realm may be entered for learning only when it is live. */
export function isRealmSelectable(realmId: string): boolean {
  return getMathsRealm(realmId)?.isSelectable ?? false;
}

/** Ids of live realms — the set that "across all live realms" milestones use. */
export function getLiveRealmIds(): string[] {
  return LIVE_REALMS.map((r) => r.realmId);
}
