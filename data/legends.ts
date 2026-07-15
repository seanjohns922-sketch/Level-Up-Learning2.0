export type LegendRealmId = "number-nexus" | "measurelands";
export type LegendStrand = "Number" | "Measurement";

export type LegendStats = {
  calculation: number;
  speed: number;
  accuracy: number;
};

export type LegendImages = {
  avatar: string;
  cardFront: string;
  cardBack: string;
};

export type Legend = {
  id: string;
  realmId: LegendRealmId;
  yearLabel: string;
  strand: LegendStrand;
  name: string;
  description: string;
  stars: number;
  stats: LegendStats;
  images: LegendImages;
  unlockVideoUrl?: string;
  showcaseVideoUrl?: string;
};

const YEAR_LABELS = ["Prep", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6"] as const;

const DEFAULT_IMAGES: Record<LegendRealmId, LegendImages> = {
  "number-nexus": {
    avatar: "/cards/numbot-solver-y4-front.png",
    cardFront: "/cards/numbot-solver-y4-front.png",
    cardBack: "/cards/numbot-solver-y4-back.png",
  },
  measurelands: {
    avatar: "/cards/meazurex-balancer-y4-front.png",
    cardFront: "/cards/meazurex-balancer-y4-front.png",
    cardBack: "/cards/meazurex-balancer-y4-back.png",
  },
};

function legendVideoUrl(slug: string) {
  return `/videos/legends/${slug}.mp4`;
}

function numberLegend(
  id: string,
  yearLabel: string,
  name: string,
  description: string,
  stars: number,
  stats: LegendStats,
  front: string,
  back: string,
  videoSlug: string,
): Legend {
  return {
    id,
    realmId: "number-nexus",
    yearLabel,
    strand: "Number",
    name,
    description,
    stars,
    stats,
    images: {
      avatar: front,
      cardFront: front,
      cardBack: back,
    },
    unlockVideoUrl: legendVideoUrl(videoSlug),
    showcaseVideoUrl: legendVideoUrl(videoSlug),
  };
}

function measurelandsLegend(
  id: string,
  yearLabel: string,
  name: string,
  description: string,
  stars: number,
  stats: LegendStats,
  front: string,
  back: string,
  videoSlug: string,
): Legend {
  return {
    id,
    realmId: "measurelands",
    yearLabel,
    strand: "Measurement",
    name,
    description,
    stars,
    stats,
    images: {
      avatar: front,
      cardFront: front,
      cardBack: back,
    },
    unlockVideoUrl: legendVideoUrl(videoSlug),
    showcaseVideoUrl: legendVideoUrl(videoSlug),
  };
}

const LEGENDS: Legend[] = [
  numberLegend(
    "numbot-bouncer-prep",
    "Prep",
    "Numbot Bouncer",
    "Foundation number champion in training.",
    0.5,
    { calculation: 35, speed: 30, accuracy: 40 },
    "/cards/numbot-bouncer-y0-front.png",
    "/cards/numbot-bouncer-y0-back.png",
    "numbot-bouncer",
  ),
  numberLegend(
    "numbot-counter-y1",
    "Year 1",
    "Numbot Counter",
    "Counts, orders, and groups with confidence.",
    1,
    { calculation: 40, speed: 40, accuracy: 45 },
    "/cards/numbot-counter-y1-front.png",
    "/cards/numbot-counter-y1-back.png",
    "numbot-counter",
  ),
  numberLegend(
    "numbot-builder-y2",
    "Year 2",
    "Numbot Builder",
    "Builds strategies and partitions numbers efficiently.",
    2,
    { calculation: 50, speed: 50, accuracy: 50 },
    "/cards/numbot-builder-y2-front.png",
    "/cards/numbot-builder-y2-back.png",
    "numbot-builder",
  ),
  numberLegend(
    "numbot-processor-y3",
    "Year 3",
    "Numbot Processor",
    "Processes number tasks quickly with growing accuracy.",
    3,
    { calculation: 55, speed: 60, accuracy: 55 },
    "/cards/numbot-processor-y3-front.png",
    "/cards/numbot-processor-y3-back.png",
    "numbot-processor",
  ),
  numberLegend(
    "numbot-solver-y4",
    "Year 4",
    "Numbot Solver",
    "Solves multi-step number problems using efficient strategies and precision.",
    4,
    { calculation: 65, speed: 70, accuracy: 60 },
    "/cards/numbot-solver-y4-front.png",
    "/cards/numbot-solver-y4-back.png",
    "numbot-solver",
  ),
  numberLegend(
    "numbot-calculator-y5",
    "Year 5",
    "Numbot Calculator",
    "Calculates efficiently and explains strategies clearly.",
    5,
    { calculation: 75, speed: 70, accuracy: 75 },
    "/cards/numbot-calculator-y5-front.png",
    "/cards/numbot-calculator-y5-back.png",
    "numbot-calculator",
  ),
  numberLegend(
    "numbot-equationator-y6",
    "Year 6",
    "Numbot Equationator",
    "Masters complex number thinking and equations.",
    6,
    { calculation: 85, speed: 80, accuracy: 85 },
    "/cards/numbot-equationator-y6-front.png",
    "/cards/numbot-equationator-y6-back.png",
    "numbot-equationator",
  ),
  measurelandsLegend(
    "meazurex-pebble-y0",
    "Prep",
    "Meazurex Pebble",
    "Begins the measuring journey by noticing size, weight, and capacity in the world around them.",
    0.5,
    { calculation: 30, speed: 34, accuracy: 42 },
    "/cards/meazurex-pebble-y0-front.png",
    "/cards/meazurex-pebble-y0-back.png",
    "meazurex-pebble",
  ),
  measurelandsLegend(
    "meazurex-ticklet-y1",
    "Year 1",
    "Meazurex Ticklet",
    "Measures with informal units and compares lengths, mass, capacity, and time with growing confidence.",
    1,
    { calculation: 40, speed: 42, accuracy: 48 },
    "/cards/meazurex-ticklet-y1-front.png",
    "/cards/meazurex-ticklet-y1-back.png",
    "meazurex-ticklet",
  ),
  measurelandsLegend(
    "meazurex-measurer-y2",
    "Year 2",
    "Meazurex Measurer",
    "Uses stronger measuring strategies and clearer comparisons across the Measurelands realms.",
    2,
    { calculation: 50, speed: 48, accuracy: 55 },
    "/cards/meazurex-measurer-y2-front.png",
    "/cards/meazurex-measurer-y2-back.png",
    "meazurex-measurer",
  ),
  measurelandsLegend(
    "meazurex-tracker-y3",
    "Year 3",
    "Meazurex Tracker",
    "Tracks changing quantities and reads measurement clues with precision.",
    3,
    { calculation: 58, speed: 56, accuracy: 60 },
    "/cards/meazurex-tracker-y3-front.png",
    "/cards/meazurex-tracker-y3-back.png",
    "meazurex-tracker",
  ),
  measurelandsLegend(
    "meazurex-balancer-y4",
    "Year 4",
    "Meazurex Balancer",
    "Balances units, scale, and reasoned measurement decisions across complex tasks.",
    4,
    { calculation: 66, speed: 62, accuracy: 68 },
    "/cards/meazurex-balancer-y4-front.png",
    "/cards/meazurex-balancer-y4-back.png",
    "meazurex-balancer",
  ),
  measurelandsLegend(
    "meazurex-calibrator-y5",
    "Year 5",
    "Meazurex Calibrator",
    "Calibrates measurements carefully and chooses efficient tools with expert judgement.",
    5,
    { calculation: 76, speed: 70, accuracy: 78 },
    "/cards/meazurex-calibrator-y5-front.png",
    "/cards/meazurex-calibrator-y5-back.png",
    "meazurex-calibrator",
  ),
  measurelandsLegend(
    "meazurex-timewielder-y6",
    "Year 6",
    "Meazurex Timewielder",
    "Commands advanced measurement, scale, and time with legendary control.",
    6,
    { calculation: 84, speed: 78, accuracy: 86 },
    "/cards/meazurex-timewielder-y6-front.png",
    "/cards/meazurex-timewielder-y6-back.png",
    "meazurex-timewielder",
  ),
];

export function normalizeLegendRealmId(realmId?: string | null): LegendRealmId {
  return realmId === "measurelands" || realmId === "measurement"
    ? "measurelands"
    : "number-nexus";
}

export function getAllLegends(realmId?: LegendRealmId): Legend[] {
  return realmId ? LEGENDS.filter((legend) => legend.realmId === realmId) : LEGENDS;
}

export function getLegendForYear(
  yearLabel: string,
  realmId: LegendRealmId = "number-nexus",
): Legend {
  const found = LEGENDS.find(
    (legend) => legend.realmId === realmId && legend.yearLabel === yearLabel,
  );

  return (
    found ?? {
      id: `unknown-legend-${realmId}-${yearLabel.toLowerCase().replace(/\s+/g, "-")}`,
      realmId,
      yearLabel,
      strand: realmId === "measurelands" ? "Measurement" : "Number",
      name: "Unknown Legend",
      description: "Legend data missing for this year.",
      stars: 1,
      stats: { calculation: 0, speed: 0, accuracy: 0 },
      images: DEFAULT_IMAGES[realmId],
      unlockVideoUrl: undefined,
      showcaseVideoUrl: undefined,
    }
  );
}

export function getLegendIdsUpToYear(
  yearLabel: string,
  realmId: LegendRealmId = "number-nexus",
) {
  const yearIndex = YEAR_LABELS.indexOf(yearLabel as (typeof YEAR_LABELS)[number]);
  if (yearIndex === -1) return [getLegendForYear(yearLabel, realmId).id];
  return YEAR_LABELS.slice(0, yearIndex + 1).map((label) => getLegendForYear(label, realmId).id);
}

export function getLegendIdsBeforeYear(
  yearLabel: string,
  realmId: LegendRealmId = "number-nexus",
) {
  const yearIndex = YEAR_LABELS.indexOf(yearLabel as (typeof YEAR_LABELS)[number]);
  if (yearIndex <= 0) return [];
  return YEAR_LABELS.slice(0, yearIndex).map((label) => getLegendForYear(label, realmId).id);
}

export function getEffectiveUnlockedLegendIds(
  yearLabel: string | null | undefined,
  unlockedIds: string[] | null | undefined,
  realmId: LegendRealmId = "number-nexus",
) {
  return Array.from(
    new Set([
      ...(unlockedIds ?? []),
      ...(yearLabel ? getLegendIdsBeforeYear(yearLabel, realmId) : []),
    ]),
  );
}
