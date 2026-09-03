// Australian Curriculum v9 (AC9) mathematics standards helpers for school
// analytics. AC9 descriptor codes are self-describing — `AC9M{year}{STRAND}{nn}`
// (year F or 1-6; strand N/A/M/SP/ST/P) — so strand and year are parsed, not
// hand-mapped. This module also carries the realm->strand link, the
// achievement-band thresholds and the strand weighting used for the future
// whole-maths overall level. The F-6 strand total is retained for curriculum
// share reporting; mixed student levels are scored from the year-by-year
// descriptor matrix below rather than one fixed strand coefficient.

export type AcStrand =
  | "number"
  | "algebra"
  | "measurement"
  | "space"
  | "statistics"
  | "probability";

export type AchievementBand = "working_towards" | "at" | "above";

export type AcStrandMeta = {
  id: AcStrand;
  label: string;
  // AC9 code strand suffix (the letters between the year and the number).
  code: string;
  // Weight for the planned overall maths level = the count of AC9 content
  // descriptors in the strand across Foundation-Year 6 (the strand's share of
  // the curriculum). Number carries the most; probability the least.
  weight: number;
  order: number;
};

export type AcPrimaryLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6;

// weight = number of AC9 content descriptors F-6 per strand (verified against
// the official ACARA F-6 curriculum). Sum = 139. Per-strand share: Number 38%,
// Measurement 20%, Space 12%, Statistics 12%, Algebra 12%, Probability 6%.
export const AC_STRANDS: Record<AcStrand, AcStrandMeta> = {
  number: { id: "number", label: "Number", code: "N", weight: 53, order: 0 },
  algebra: { id: "algebra", label: "Algebra", code: "A", weight: 16, order: 1 },
  measurement: { id: "measurement", label: "Measurement", code: "M", weight: 28, order: 2 },
  space: { id: "space", label: "Space", code: "SP", weight: 17, order: 3 },
  statistics: { id: "statistics", label: "Statistics", code: "ST", weight: 17, order: 4 },
  probability: { id: "probability", label: "Probability", code: "P", weight: 8, order: 5 },
};

// Exact AC9 Mathematics content-description counts by year and strand.
// Source: ACARA's official machine-readable curriculum, Mathematics release
// 2024/04 (files updated 7 June 2024). Level 0 is Foundation. These rows and
// columns both reconcile to the published 139 F-6 content descriptions.
//
// Overall diagnostic calculations use this level-by-level distribution. The
// F-6 totals in AC_STRANDS remain useful curriculum-share summaries, but must
// not be used as fixed coefficients for a student with mixed strand levels.
export const AC_DESCRIPTOR_COUNTS_BY_LEVEL: Record<
  AcPrimaryLevel,
  Readonly<Record<AcStrand, number>>
> = {
  0: { number: 6, algebra: 1, measurement: 2, space: 2, statistics: 1, probability: 0 },
  1: { number: 6, algebra: 2, measurement: 3, space: 2, statistics: 2, probability: 0 },
  2: { number: 6, algebra: 3, measurement: 5, space: 2, statistics: 2, probability: 0 },
  3: { number: 7, algebra: 3, measurement: 6, space: 2, statistics: 3, probability: 2 },
  4: { number: 9, algebra: 2, measurement: 4, space: 3, statistics: 3, probability: 2 },
  5: { number: 10, algebra: 2, measurement: 4, space: 3, statistics: 3, probability: 2 },
  6: { number: 9, algebra: 3, measurement: 4, space: 3, statistics: 3, probability: 2 },
};

export const AC_PRIMARY_LEVELS: readonly AcPrimaryLevel[] = [0, 1, 2, 3, 4, 5, 6];

export function descriptorCountAtLevel(level: AcPrimaryLevel, strand: AcStrand): number {
  return AC_DESCRIPTOR_COUNTS_BY_LEVEL[level][strand];
}

// Longest suffixes first so "SP"/"ST" match before "S" would.
const STRAND_BY_CODE: Array<[string, AcStrand]> = [
  ["SP", "space"],
  ["ST", "statistics"],
  ["N", "number"],
  ["A", "algebra"],
  ["M", "measurement"],
  ["P", "probability"],
];

// Realm id (as used across analytics + progress) -> primary AC strand.
const REALM_STRAND: Record<string, AcStrand> = {
  number: "number",
  measurement: "measurement",
  space: "space",
  statistics: "statistics",
  algebra: "algebra",
  probability: "probability",
};

export function strandForRealm(realmId: string | null | undefined): AcStrand | null {
  if (!realmId) return null;
  return REALM_STRAND[realmId.toLowerCase()] ?? null;
}

const AC_CODE = /^AC9M(F|\d)([A-Z]+?)(\d{1,2})?$/;

export type ParsedAcCode = {
  code: string;
  year: string; // "Foundation" | "Year 1".."Year 6"
  yearLevel: string;
  strand: AcStrand | null;
};

// Parse a descriptor code like "AC9M5ST01" into its strand + year.
export function parseAcCode(raw: string): ParsedAcCode | null {
  const match = AC_CODE.exec(raw.trim().toUpperCase());
  if (!match) return null;
  const [, yearToken, strandToken] = match;
  const yearLevel = yearToken === "F" ? "Prep" : `Year ${yearToken}`;
  const strand = STRAND_BY_CODE.find(([suffix]) => strandToken!.startsWith(suffix))?.[1] ?? null;
  return { code: raw.trim().toUpperCase(), year: yearLevel, yearLevel, strand };
}

// Achievement-band thresholds (percent accuracy). Tunable in one place. "Above"
// aligns with the dashboard's existing 85% mastery bar.
export const BAND_THRESHOLDS = { at: 55, above: 85 } as const;

export function bandFor(accuracy: number | null | undefined): AchievementBand | null {
  if (accuracy === null || accuracy === undefined) return null;
  if (accuracy >= BAND_THRESHOLDS.above) return "above";
  if (accuracy >= BAND_THRESHOLDS.at) return "at";
  return "working_towards";
}

export const BAND_LABEL: Record<AchievementBand, string> = {
  working_towards: "Working towards",
  at: "At standard",
  above: "Above standard",
};
