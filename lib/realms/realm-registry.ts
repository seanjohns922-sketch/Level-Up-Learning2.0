export type CanonicalRealmId =
  | "number"
  | "measurement"
  | "space"
  | "pattern"
  | "statistics"
  | "chance"
  | "time";

export type RealmLifecycle = "live" | "coming_soon" | "hidden";

export type RealmRegistryEntry = {
  realmId: CanonicalRealmId;
  portalId: string;
  slug: string;
  name: string;
  shortName: string;
  strand: string;
  status: RealmLifecycle;
  isSelectable: boolean;
  totalWeeks: number | null;
  legendCount: number;
  legendCollectionName: string;
  iconKey: string;
  themeKey: string;
  displayOrder: number;
};

export const REALM_REGISTRY = {
  number: {
    realmId: "number",
    portalId: "number-nexus",
    slug: "number-nexus",
    name: "Number Nexus",
    shortName: "Number",
    strand: "Number",
    status: "live",
    isSelectable: true,
    totalWeeks: 12,
    legendCount: 7,
    legendCollectionName: "Numbot Collection",
    iconKey: "Zap",
    themeKey: "nexus",
    displayOrder: 1,
  },
  measurement: {
    realmId: "measurement",
    portalId: "measurelands",
    slug: "measurelands",
    name: "Measurelands",
    shortName: "Measure",
    strand: "Measurement",
    status: "live",
    isSelectable: true,
    totalWeeks: 8,
    legendCount: 7,
    legendCollectionName: "Meazurex Collection",
    iconKey: "Ruler",
    themeKey: "measure",
    displayOrder: 2,
  },
  pattern: {
    realmId: "pattern",
    portalId: "pattern-peaks",
    slug: "pattern-peaks",
    name: "Pattern Peaks",
    shortName: "Patterns",
    strand: "Algebra & Patterns",
    status: "coming_soon",
    isSelectable: false,
    totalWeeks: null,
    legendCount: 7,
    legendCollectionName: "Pattern Weavers",
    iconKey: "Triangle",
    themeKey: "pattern",
    displayOrder: 3,
  },
  statistics: {
    realmId: "statistics",
    portalId: "statistica",
    slug: "statistica",
    name: "Statistica",
    shortName: "Stats",
    strand: "Statistics",
    status: "coming_soon",
    isSelectable: false,
    totalWeeks: null,
    legendCount: 7,
    legendCollectionName: "Data Guardians",
    iconKey: "BarChart3",
    themeKey: "statistica",
    displayOrder: 4,
  },
  chance: {
    realmId: "chance",
    portalId: "chance-hollow",
    slug: "chance-hollow",
    name: "Chance Hollow",
    shortName: "Chance",
    strand: "Probability",
    status: "coming_soon",
    isSelectable: false,
    totalWeeks: null,
    legendCount: 7,
    legendCollectionName: "Fortune Seekers",
    iconKey: "Dices",
    themeKey: "chance",
    displayOrder: 5,
  },
  space: {
    realmId: "space",
    portalId: "starpath-realm",
    slug: "starpath",
    name: "Starpath",
    shortName: "Starpath",
    strand: "Space & Spatial Reasoning",
    status: "coming_soon",
    isSelectable: false,
    totalWeeks: 8,
    legendCount: 7,
    legendCollectionName: "Star Navigators",
    iconKey: "Compass",
    themeKey: "starpath",
    displayOrder: 6,
  },
  time: {
    realmId: "time",
    portalId: "chronorok",
    slug: "chronoscape",
    name: "Chronoscape",
    shortName: "Chrono",
    strand: "Time & Temporal Reasoning",
    status: "coming_soon",
    isSelectable: false,
    totalWeeks: null,
    legendCount: 7,
    legendCollectionName: "Time Keepers",
    iconKey: "Clock",
    themeKey: "chrono",
    displayOrder: 7,
  },
} as const satisfies Record<CanonicalRealmId, RealmRegistryEntry>;

export const CANONICAL_REALM_IDS = Object.keys(REALM_REGISTRY) as CanonicalRealmId[];

const REALM_ALIASES = new Map<string, CanonicalRealmId>(
  Object.values(REALM_REGISTRY).flatMap((realm) => [
    [realm.realmId, realm.realmId],
    [realm.portalId, realm.realmId],
    [realm.slug, realm.realmId],
  ]),
);

export function tryCanonicalRealmId(value: string | null | undefined): CanonicalRealmId | null {
  const normalized = value?.trim().toLowerCase();
  return normalized ? (REALM_ALIASES.get(normalized) ?? null) : null;
}

export function requireCanonicalRealmId(value: string): CanonicalRealmId {
  const realmId = tryCanonicalRealmId(value);
  if (!realmId) throw new Error(`Unknown realm id: ${value}`);
  return realmId;
}

export function getRealmDefinition(value: string): RealmRegistryEntry {
  return REALM_REGISTRY[requireCanonicalRealmId(value)];
}

