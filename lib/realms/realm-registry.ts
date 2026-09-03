export type CanonicalRealmId =
  | "number"
  | "measurement"
  | "space"
  | "pattern"
  | "statistics"
  | "chance"
  | "time"
  | "reading"
  | "writing"
  | "advanced-literacy";

export type RealmLifecycle = "live" | "coming_soon" | "hidden";

export type RealmRegistryEntry = {
  realmId: CanonicalRealmId;
  portalId: string;
  slug: string;
  name: string;
  shortName: string;
  /** Compact teacher-dashboard identifier. Must be unique and 2–3 capitals. */
  activityCode: string;
  /** Canonical suffix used by student_realm_progress.program_key. */
  programSuffix: string;
  strand: string;
  status: RealmLifecycle;
  isSelectable: boolean;
  totalWeeks: number | null;
  lessonsPerWeek: number | null;
  hasWeeklyQuiz: boolean;
  levelLabels: readonly string[];
  legendCount: number;
  legendCollectionName: string;
  iconKey: string;
  themeKey: string;
  displayOrder: number;
};

const SCHOOL_LEVEL_LABELS = [
  "Prep",
  "Year 1",
  "Year 2",
  "Year 3",
  "Year 4",
  "Year 5",
  "Year 6",
] as const;

const YEAR_LEVEL_LABELS = [
  "Year 1",
  "Year 2",
  "Year 3",
  "Year 4",
  "Year 5",
  "Year 6",
] as const;

export const REALM_REGISTRY = {
  number: {
    realmId: "number",
    portalId: "number-nexus",
    slug: "number-nexus",
    name: "Number Nexus",
    shortName: "Number",
    activityCode: "NN",
    programSuffix: "number",
    strand: "Number",
    status: "live",
    isSelectable: true,
    totalWeeks: 12,
    lessonsPerWeek: 3,
    hasWeeklyQuiz: true,
    levelLabels: SCHOOL_LEVEL_LABELS,
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
    activityCode: "ML",
    programSuffix: "measurelands",
    strand: "Measurement",
    status: "live",
    isSelectable: true,
    totalWeeks: 8,
    lessonsPerWeek: 3,
    hasWeeklyQuiz: true,
    levelLabels: SCHOOL_LEVEL_LABELS,
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
    activityCode: "PP",
    programSuffix: "pattern-peaks",
    strand: "Algebra & Patterns",
    status: "coming_soon",
    isSelectable: false,
    totalWeeks: 8,
    lessonsPerWeek: 3,
    hasWeeklyQuiz: true,
    levelLabels: ["Year 3", "Year 4", "Year 5", "Year 6"],
    legendCount: 4,
    legendCollectionName: "Patternox Collection",
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
    activityCode: "ST",
    programSuffix: "statistica",
    strand: "Statistics",
    status: "live",
    isSelectable: true,
    totalWeeks: 6,
    lessonsPerWeek: 3,
    hasWeeklyQuiz: true,
    levelLabels: YEAR_LEVEL_LABELS,
    legendCount: 6,
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
    activityCode: "CH",
    programSuffix: "chance-hollow",
    strand: "Probability",
    status: "coming_soon",
    isSelectable: false,
    totalWeeks: null,
    lessonsPerWeek: null,
    hasWeeklyQuiz: false,
    levelLabels: SCHOOL_LEVEL_LABELS,
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
    activityCode: "SP",
    programSuffix: "starpath",
    strand: "Space & Spatial Reasoning",
    status: "live",
    isSelectable: true,
    totalWeeks: 8,
    lessonsPerWeek: 3,
    hasWeeklyQuiz: true,
    levelLabels: SCHOOL_LEVEL_LABELS,
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
    activityCode: "CS",
    programSuffix: "chronoscape",
    strand: "Time & Temporal Reasoning",
    status: "coming_soon",
    isSelectable: false,
    totalWeeks: null,
    lessonsPerWeek: null,
    hasWeeklyQuiz: false,
    levelLabels: SCHOOL_LEVEL_LABELS,
    legendCount: 7,
    legendCollectionName: "Time Keepers",
    iconKey: "Clock",
    themeKey: "chrono",
    displayOrder: 7,
  },
  reading: {
    realmId: "reading",
    portalId: "reading-ridge",
    slug: "reading-ridge",
    name: "Reading Ridge",
    shortName: "Reading",
    activityCode: "RR",
    programSuffix: "reading-ridge",
    strand: "Reading Comprehension & Fluency",
    status: "coming_soon",
    isSelectable: false,
    totalWeeks: null,
    lessonsPerWeek: null,
    hasWeeklyQuiz: false,
    levelLabels: SCHOOL_LEVEL_LABELS,
    legendCount: 7,
    legendCollectionName: "Ridge Readers",
    iconKey: "BookOpen",
    themeKey: "reading",
    displayOrder: 8,
  },
  writing: {
    realmId: "writing",
    portalId: "inkwell-wilds",
    slug: "inkwell-wilds",
    name: "Inkwell Wilds",
    shortName: "Writing",
    activityCode: "IW",
    programSuffix: "inkwell-wilds",
    strand: "Writing, Grammar & Spelling",
    status: "coming_soon",
    isSelectable: false,
    totalWeeks: null,
    lessonsPerWeek: null,
    hasWeeklyQuiz: false,
    levelLabels: SCHOOL_LEVEL_LABELS,
    legendCount: 7,
    legendCollectionName: "Inkwell Scribes",
    iconKey: "PenTool",
    themeKey: "inkwell",
    displayOrder: 9,
  },
  "advanced-literacy": {
    realmId: "advanced-literacy",
    portalId: "runehaven-peaks",
    slug: "runehaven-peaks",
    name: "Runehaven Peaks",
    shortName: "Runehaven",
    activityCode: "RP",
    programSuffix: "runehaven-peaks",
    strand: "Advanced Literacy & Lore",
    status: "coming_soon",
    isSelectable: false,
    totalWeeks: null,
    lessonsPerWeek: null,
    hasWeeklyQuiz: false,
    levelLabels: SCHOOL_LEVEL_LABELS,
    legendCount: 7,
    legendCollectionName: "Rune Keepers",
    iconKey: "Gem",
    themeKey: "runehaven",
    displayOrder: 10,
  },
} as const satisfies Record<CanonicalRealmId, RealmRegistryEntry>;

export const CANONICAL_REALM_IDS = Object.keys(REALM_REGISTRY) as CanonicalRealmId[];

export type LiveRealmId = {
  [RealmId in CanonicalRealmId]: (typeof REALM_REGISTRY)[RealmId]["status"] extends "live"
    ? RealmId
    : never;
}[CanonicalRealmId];

export type LiveRealmRegistryEntry = RealmRegistryEntry & {
  realmId: LiveRealmId;
  status: "live";
  isSelectable: true;
};

export const LIVE_REALM_IDS = CANONICAL_REALM_IDS.filter(
  (realmId): realmId is LiveRealmId =>
    REALM_REGISTRY[realmId].status === "live" && REALM_REGISTRY[realmId].isSelectable,
);

export function isLiveRealmId(value: string | null | undefined): value is LiveRealmId {
  const realmId = tryCanonicalRealmId(value);
  return realmId != null && LIVE_REALM_IDS.includes(realmId as LiveRealmId);
}

export function getLiveRealmDefinitions(): LiveRealmRegistryEntry[] {
  return LIVE_REALM_IDS.map((realmId) => REALM_REGISTRY[realmId] as LiveRealmRegistryEntry);
}

const REALM_ALIASES = new Map<string, CanonicalRealmId>(
  Object.values(REALM_REGISTRY).flatMap((realm) => [
    [realm.realmId, realm.realmId],
    [realm.portalId, realm.realmId],
    [realm.slug, realm.realmId],
    [realm.name.toLowerCase(), realm.realmId],
    [realm.shortName.toLowerCase(), realm.realmId],
    [realm.activityCode.toLowerCase(), realm.realmId],
    [realm.strand.toLowerCase(), realm.realmId],
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

export function getRealmActivityCode(value: string | null | undefined): string | null {
  const realmId = tryCanonicalRealmId(value);
  return realmId ? REALM_REGISTRY[realmId].activityCode : null;
}
