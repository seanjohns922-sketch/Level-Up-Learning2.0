export const NUMBER_NEXUS_ALGEBRA_MAX_LEVEL = 2;
export const PATTERN_PEAKS_ALGEBRA_MIN_LEVEL = 3;

export const NUMBER_NEXUS_CROSS_STRAND_CODES = ["AC9M3M06"] as const;

export const PATTERN_PEAKS_RELOCATION_LESSON_IDS = {
  3: [
    "y3-w3-l1", "y3-w3-l2", "y3-w3-l3",
    "y3-w4-l1", "y3-w4-l2", "y3-w4-l3",
    "y3-w9-l1", "y3-w9-l2", "y3-w9-l3",
    "y3-w10-l1", "y3-w10-l2", "y3-w10-l3",
  ],
  4: [],
  5: [],
  6: [
    "y6-w9-l1", "y6-w9-l2", "y6-w9-l3",
    "y6-w10-l1", "y6-w10-l2", "y6-w10-l3",
    "y6-w11-l1", "y6-w11-l2",
    "y6-w12-l1", "y6-w12-l2", "y6-w12-l3",
  ],
} as const;

export function ownsAlgebraInNumberNexus(level: number): boolean {
  return level <= NUMBER_NEXUS_ALGEBRA_MAX_LEVEL;
}

export function curriculumRealmFor(code: string, level: number): "Number Nexus" | "Pattern Peaks" | "Other" {
  if (NUMBER_NEXUS_CROSS_STRAND_CODES.some((ownedCode) => ownedCode === code)) return "Number Nexus";
  if (/^AC9M(?:F|[1-6])N\d{2}$/.test(code)) return "Number Nexus";
  if (/^AC9M(?:F|[1-6])A\d{2}$/.test(code)) {
    return ownsAlgebraInNumberNexus(level) ? "Number Nexus" : "Pattern Peaks";
  }
  return "Other";
}
