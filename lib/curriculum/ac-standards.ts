// Australian Curriculum v9 (AC9) mathematics standards helpers for school
// analytics. AC9 descriptor codes are self-describing — `AC9M{year}{STRAND}{nn}`
// (year F or 1-6; strand N/A/M/SP/ST/P) — so strand and year are parsed, not
// hand-mapped. This module also carries the realm->strand link, the
// achievement-band thresholds and the strand weighting used for the future
// whole-maths overall level. The weight is the number of AC9 content
// descriptors in that strand across Foundation-Year 6 (counted from the official
// ACARA F-6 curriculum), so the overall level is a curriculum-point weighted
// average: overall = Σ(strand level × weight) ÷ Σ(weight), Σ(weight) = 139.

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
